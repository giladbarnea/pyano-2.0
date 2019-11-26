// *  pages/New/index.ts
/**import newPage from "./New";*/
import Glob from "../../Glob";
import * as util from '../../util'
import sidebar from "../sidebar";
import sections from "./sections"
import { button } from "../../bhe";

async function load(reload: boolean) {
    // const { exam, test } = Glob.BigConfig;
    Glob.BigConfig.last_page = "new";
    if ( reload ) {
        util.reloadPage();
    }
    sidebar.select("new", { changeTitle : true });
    const startButton = button({ cls : 'active', html : 'Start Experiment' });
    Glob.MainContent.append(
        // sections.levels,
        sections.settings,
        startButton
        // Gui.$readySaveLoadSaveas(),
    );
    
    
}

export default { load }
