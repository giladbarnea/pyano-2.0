// *  pages/New/index.ts
/**import newPage from "./New";*/
import Glob from "../../Glob";
import * as util from '../../util'
import sidebar from "../sidebar";
import sections from "./sections"
import { button } from "../../bhe";
import MyAlert from '../../MyAlert'
import * as path from "path";
import { remote } from 'electron';

async function load(reload: boolean) {
    // const { exam, test } = Glob.BigConfig;
    Glob.BigConfig.last_page = "new";
    if ( reload ) {
        util.reloadPage();
    }
    sidebar.select("new", { changeTitle : true });
    const startButton = button({ cls : 'active', html : 'Start Experiment', id : 'start_experiment_button' })
        .click(async () => {
            
            const subconfig = Glob.BigConfig.getSubconfig();
            let action = await MyAlert.big.threeButtons({
                title : `Please make sure that the loaded config, "${subconfig.name}", is fine.`,
                confirmButtonText : `It's ok, start experiment`,
                thirdButtonText : 'Open configs directory in file browser'
            });
            console.log({ action });
            switch ( action ) {
                case "cancel":
                    return;
                case "confirm":
                    break
                case "third":
                    return remote.shell.showItemInFolder(path.join(CONFIGS_PATH_ABS, subconfig.name));
            }
            
            
        });
    Glob.MainContent.append(
        // sections.levels,
        sections.settings,
        startButton
        // Gui.$readySaveLoadSaveas(),
    );
    
    
}

export default { load }
