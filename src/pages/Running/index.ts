import Glob from "../../Glob";
import * as util from "../../util";
import sidebar from "../sidebar";


/**import runningPage from "./Running";*/
async function load(reload: boolean) {
    console.group(`pages.Running.index.load(${reload})`);
    Glob.BigConfig.last_page = "running";
    if ( reload ) {
        console.groupEnd();
        return util.reloadPage();
    }
    Glob.Sidebar.remove();
    // sidebar.select("running", { changeTitle : false });
    
    Glob.MainContent.append(
    );
    console.groupEnd();
    
}

export default { load }
