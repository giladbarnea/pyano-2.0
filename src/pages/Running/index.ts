import Glob from "../../Glob";
import * as util from "../../util";
import { elem } from "../../bhe";
import animation from './animation'
import Dialog from './dialog'

/**import * as runningPage from "../Running"
 * require('./Running')*/
async function load(reload: boolean) {
    // **  Performance, visuals sync: https://github.com/Tonejs/Tone.js/wiki/Performance
    console.group(`pages.Running.index.load(${reload})`);
    Glob.BigConfig.last_page = "running";
    if ( reload ) {
        console.groupEnd();
        return util.reloadPage();
    }
    Glob.Sidebar.remove();
    const subconfig = Glob.BigConfig.getSubconfig();
    console.log({ subconfig });
    Glob.Title.html(`${subconfig.truth.name}`);
    
    const subtitle = elem({ tag : 'h3', text : '1/1' });
    const dialog = new Dialog(subconfig.demo_type);
    
    Glob.MainContent.append(
        subtitle,
        dialog
    );
    console.groupEnd();
    
}

export { load }
