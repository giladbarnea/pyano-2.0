import Glob from "../../Glob";
import * as util from '../../util'
import sidebar from "../sidebar";
import sections from "./sections"

async function load(reload: boolean) {
    // const { exam, test } = Glob.BigConfig;
    Glob.BigConfig.last_page = "new";
    if ( reload ) {
        util.reloadPage();
    }
    sidebar.select("new", { changeTitle : true });
    Glob.MainContent.append(
        sections.levels.div,
        // SubjectPart.$Div,
        // SettingsPart.$Div,
        // LevelsPart.$Div,
        // Gui.$readySaveLoadSaveas(),
    );
    
    
    
}

export default { load }
