/**import newPage from "./New";*/
import Glob from "../../Glob";
import sidebar from "../sidebar";
import sections from "./sections"
import { button } from "../../bhe";
import { remote } from 'electron';

// importing the namespace
import { coolstore } from "../../coolstore.js";
import { ElectronLog } from "electron-log";
// import * as stacktracejs from 'stacktrace-js'


// import * as runningPage from "../Running"


async function load(reload: boolean) {
    console.log(`New.index.load(reload=${reload})`);
    BigConfig.last_page = "new";
    if (reload) {
        return util.reloadPage();
    }
    // const stackTrace = require('stack-trace');
    // const trace = stackTrace.get();
    // console.log('stack-trace:')
    // console.log(trace);

    sidebar.select("new", { changeTitle: true });


    let action = await swalert.big.throwsError();
    console.log(`load.load() | action: ${action}`);
    return;
    const startButton = button({ cls: 'green', html: 'Start Experiment', setid: 'start_experiment_button' })
        .click(async () => {

            const subconfig = BigConfig.getSubconfig();
            let html = subconfig.toHtml();
            // swalert.big.oneButton({})
            // swalert.big.twoButtons({})


            let action = await swalert.big.threeButtons({
                title: `Please make sure that the loaded config, "${subconfig.name}", is fine.`,
                html,
                confirmButtonText: `It's ok, start experiment`,
                thirdButtonText: 'Open configs directory in file browser'
            });
            switch (action) {
                case "cancel":
                    return;
                case "confirm":
                    return startIfReady(subconfig);
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

async function startIfReady(subconfig: coolstore.Subconfig) {
    const missingTxts = subconfig.truth.txt.getMissing();

    if (util.bool(missingTxts)) {
        return swalert.big.oneButton({
            title: `The truth: "${subconfig.truth.name}" is missing the following txt files:`,
            text: missingTxts.join(', ')
        })
    }
    // / Txts exist
    if (!subconfig.truth.midi.exists()) {
        if (!BigConfig.dev.skip_midi_exists_check()) {
            return swalert.big.oneButton({ title: `The truth: "${subconfig.truth.name}" is missing a midi file` })
        }
    }
    // / midi exist
    if (subconfig.demo_type === "video") {
        const mp4Exists = subconfig.truth.mp4.exists();
        const onsetsExists = subconfig.truth.onsets.exists();
        if (!util.all(mp4Exists, onsetsExists)) {
            const missingNames = [];
            if (!mp4Exists)
                missingNames.push("mp4");
            if (!onsetsExists)
                missingNames.push("onsets");

            return swalert.big.oneButton({
                title: `The truth: "${subconfig.truth.name}" is missing the following files:`,
                text: missingNames.join(', ')
            })
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
        return swalert.big.oneButton({
            title: `The following keys in ${subconfig.name} are missing values:`,
            text: missingValues.join(', ')
        })
    }
    const levelCollection = subconfig.getLevelCollection();
    const badLevels = levelCollection.badLevels();
    if (util.bool(badLevels)) {
        return swalert.big.oneButton({
            title: `The following levels in ${subconfig.name} have invalid values: (0-index)`,
            text: badLevels.join(', ')
        })
    }
    // / mp4 and onsets exist
    return require('../Running').load(true);
}

export { load }
