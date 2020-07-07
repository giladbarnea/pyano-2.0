/**import newPage from "./New";*/
import Glob from "../../Glob";
import sidebar from "../sidebar";
import sections from "./sections"
import { button } from "../../bhe";
import { remote } from 'electron';

// import * as runningPage from "../Running"


async function load(reload: boolean) {
    console.log(`New.index.load(reload=${reload})`);
    Glob.BigConfig.last_page = "new";
    if ( reload ) {
        return util.reloadPage();
    }
    sidebar.select("new", { changeTitle : true });
    const startButton = button({ cls : 'green', html : 'Start Experiment', setid : 'start_experiment_button' })
        .click(async () => {
            /*let template = {
             '<>' : 'div',
             'html' : [ 'Allowed Rhythm Deviation: ${allowed_rhythm_deviation}']
             };*/
            const subconfig = Glob.BigConfig.getSubconfig();
            // const json2html = require("node-json2html");
            // let html = json2html.transform(subconfig.store, template);
            let html = subconfig.toHtml();
            let action = await swalert.big.threeButtons({
                title : `Please make sure that the loaded config, "${subconfig.name}", is fine.`,
                html,
                confirmButtonText : `It's ok, start experiment`,
                thirdButtonText : 'Open configs directory in file browser'
            });
            switch ( action ) {
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

async function startIfReady(subconfig: mystore.Subconfig) {
    const missingTxts = subconfig.truth.txt.getMissing();
    
    if ( util.bool(missingTxts) ) {
        return swalert.big.oneButton({ title: `The truth: "${subconfig.truth.name}" is missing the following txt files:`,
            text : missingTxts.join(', ') })
    }
    // / Txts exist
    if ( !subconfig.truth.midi.exists() ) {
        if ( !Glob.BigConfig.dev.skip_midi_exists_check() ) {
            return swalert.big.oneButton({title: `The truth: "${subconfig.truth.name}" is missing a midi file`})
        }
    }
    // / midi exist
    if ( subconfig.demo_type === "video" ) {
        const mp4Exists = subconfig.truth.mp4.exists();
        const onsetsExists = subconfig.truth.onsets.exists();
        if ( !util.all(mp4Exists, onsetsExists) ) {
            const missingNames = [];
            if ( !mp4Exists )
                missingNames.push("mp4");
            if ( !onsetsExists )
                missingNames.push("onsets");
            
            return swalert.big.oneButton({
                title: `The truth: "${subconfig.truth.name}" is missing the following files:`,
                text : missingNames.join(', ')
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
    for ( let key of mustHaveValue ) {
        if ( !util.bool(subconfig[key]) ) {
            missingValues.push(key);
        }
    }
    if ( util.bool(missingValues) ) {
        return swalert.big.oneButton({
            title: `The following keys in ${subconfig.name} are missing values:`,
            text : missingValues.join(', ')
        })
    }
    const levelCollection = subconfig.getLevelCollection();
    const badLevels = levelCollection.badLevels();
    if ( util.bool(badLevels) ) {
        return swalert.big.oneButton({
            title: `The following levels in ${subconfig.name} have invalid values: (0-index)`,
            text : badLevels.join(', ')
        })
    }
    // / mp4 and onsets exist
    return require('../Running').load(true);
}

export { load }
