/**import newPage from "./New";*/
import Glob from "../../Glob";
import * as util from '../../util'
import sidebar from "../sidebar";
import sections from "./sections"
import { button } from "../../bhe";
import MyAlert from '../../MyAlert'
import * as path from "path";
import { remote } from 'electron';
import { Subconfig } from "../../MyStore";

// import * as runningPage from "../Running"

async function load(reload: boolean) {
    
    Glob.BigConfig.last_page = "new";
    if ( reload ) {
        return util.reloadPage();
    }
    sidebar.select("new", { changeTitle : true });
    const startButton = button({ cls : 'active', html : 'Start Experiment', id : 'start_experiment_button' })
        .click(async () => {
            
            const subconfig = Glob.BigConfig.getSubconfig();
            let action = await MyAlert.big.threeButtons({
                title : `Please make sure that the loaded config, "${subconfig.name}", is fine. Subject name, etc.`,
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

async function startIfReady(subconfig: Subconfig) {
    const missingTxts = subconfig.truth.txt.getMissing();
    
    if ( util.bool(missingTxts) ) {
        return MyAlert.big.oneButton(`The truth: "${subconfig.truth.name}" is missing the following txt files:`, { text : missingTxts.join(', ') })
    }
    // / Txts exist
    if ( !subconfig.truth.midi.exists() ) {
        if ( !Glob.BigConfig.dev.skip_midi_exists_check() ) {
            return MyAlert.big.oneButton(`The truth: "${subconfig.truth.name}" is missing a midi file`)
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
            
            return MyAlert.big.oneButton(`The truth: "${subconfig.truth.name}" is missing the following files:`, {
                text : missingNames.join(', ')
            })
        }
    }
    // / mp4 and onsets exist
    return require('../Running').load(true);
}

export { load }
