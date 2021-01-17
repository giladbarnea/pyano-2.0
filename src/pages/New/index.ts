import Glob from "Glob";
import sidebar from "pages/sidebar";
import sections from "pages/New/sections";
import { button } from "bhe";
import { remote } from 'electron';

import type { store } from "store";
import swalert from "swalert";


// import * as runningPage from "../Running"


async function load(reload: boolean) {
    console.log(`New.index.load(reload=${reload})`);
    BigConfig.last_page = "new";
    if (reload) {
        return util.app.reloadPage();
    }


    sidebar.select("new", { changeTitle: true });


    const startButton = button({ cls: 'green', html: 'Start Experiment', setid: 'start_experiment_button' })
        .click(async () => {

            const subconfig = BigConfig.getSubconfig();
            let html = subconfig.toHtml();
            // swalert.big.oneButton({})
            // swalert.big.twoButtons({})

            let pressed = await swalert.big.threeButtons({
                title: `Please make sure that the loaded config, "${subconfig.name}", is fine.`,
                html,
                firstButtonText: `It's ok, start experiment`,
                firstButtonClass: `green`,
                secondButtonClass: `warn`,
                thirdButtonText: 'Open configs directory in file browser'
            });
            switch (pressed) {
                case "first":
                    return startIfReady(subconfig);
                case "second":
                    return;
                case "third":
                    return remote.shell.showItemInFolder(path.join(CONFIGS_PATH_ABS, subconfig.name));
            }


        });
    Glob.MainContent.append(
        // sections.levels,
        sections.settings,
        startButton
    );


}

async function startIfReady(subconfig: store.Subconfig) {

    const missingTxts = subconfig.truth.txt.getMissing();

    if (util.bool(missingTxts)) {
        swalert.big.warning({
            title: `The truth: "${subconfig.truth.name}" is missing the following txt files:`,
            text: missingTxts.join(', '),
            log: true
        });
        return;
    }
    // / Txts exist
    if (!BigConfig.dev.skip_midi_exists_check()) {
        if (!subconfig.truth.midi.exists()) {
            swalert.big.warning({ title: `The truth: "${subconfig.truth.name}" is missing a midi file` , log: true});
            return
        }
    }
    // / midi exist
    if (subconfig.demo_type === "video") {
        const mp4Exists = subconfig.truth.mp4.exists();
        const onsetsExists = subconfig.truth.onsets.exists();
        if (!mp4Exists || !onsetsExists) {
            const missingNames = [];
            if (!mp4Exists) {
                missingNames.push("mp4");
            }
            if (!onsetsExists) {
                missingNames.push("onsets");
            }

            swalert.big.warning({
                title: `The truth: "${subconfig.truth.name}" is missing the following files:`,
                text: missingNames.join(', '),
                log: true
            });
            return
        }
    }
    const mustHaveValue = [
        "allowed_rhythm_deviation",
        "allowed_tempo_deviation",
        "errors_playrate",
        "subject",
        "truth_file",
        "levels",
    ];
    const missingValues = [];
    for (let key of mustHaveValue) {
        if (!util.bool(subconfig[key])) {
            missingValues.push(key);
        }
    }
    if (util.bool(missingValues)) {
        swalert.big.warning({
            title: `The following keys in ${subconfig.name} are missing values:`,
            text: missingValues.join(', '),
            log: true
        });
        return
    }
    const levelCollection = subconfig.getLevelCollection();
    const badLevels = levelCollection.badLevels();
    if (util.bool(badLevels)) {
        swalert.big.warning({
            title: `The following levels in ${subconfig.name} have invalid values: (0-index)`,
            text: badLevels.join(', '),
            log: true
        });
        return
    }
    // / mp4 and onsets exist
    return require('../Running').load(true);
}

export { load };
