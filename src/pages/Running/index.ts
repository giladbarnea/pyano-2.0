import Glob from "../../Glob";
import * as util from "../../util";
import { elem } from "../../bhe";
import animation from './animation'
import dialog from './dialog'

/**import runningPage from "./Running";*/
async function load(reload: boolean) {
    console.group(`pages.Running.index.load(${reload})`);
    Glob.BigConfig.last_page = "running";
    if ( reload ) {
        console.groupEnd();
        return util.reloadPage();
    }
    Glob.Sidebar.remove();
    const subconfig = Glob.BigConfig.getSubconfig();
    
    Glob.Title.html(`${subconfig.truth.name}`);
    const subtitle = elem({ tag : 'h3', text : '1/1' });
    
    Glob.MainContent.append(
        subtitle,
        dialog
    );
    console.groupEnd();
    
}

export default { load }
