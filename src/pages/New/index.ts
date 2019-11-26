// *  pages/New/index.ts
/**import newPage from "./New";*/
import Glob from "../../Glob";
import * as util from '../../util'
import sidebar from "../sidebar";
import sections from "./sections"
import { button } from "../../bhe";
import MyAlert from '../../MyAlert'

async function load(reload: boolean) {
    // const { exam, test } = Glob.BigConfig;
    Glob.BigConfig.last_page = "new";
    if ( reload ) {
        util.reloadPage();
    }
    sidebar.select("new", { changeTitle : true });
    const startButton = button({ cls : 'active', html : 'Start Experiment', id : 'start_experiment_button' })
        .click(async () => {
            
            let action = await MyAlert.big.twoButtons(`Please make sure that the loaded config, "${Glob.BigConfig.getSubconfig().name}", is fine.`, {
                confirmButtonText : `It's ok, start experiment`
            });
            console.log({ action });
        });
    Glob.MainContent.append(
        // sections.levels,
        sections.settings,
        startButton
        // Gui.$readySaveLoadSaveas(),
    );
    
    
}

export default { load }
