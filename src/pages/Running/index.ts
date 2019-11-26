import Glob from "../../Glob";
import * as util from "../../util";
import { elem } from "../../bhe";
import animation from './animation'
import Dialog from './dialog'
// import { Piano } from "../../Piano"
import { Midi } from "@tonejs/midi";

const { Piano } = require("@tonejs/piano");

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
    const piano = new Piano({
        samples : SALAMANDER_PATH_ABS,
        release : false,
        pedal : false,
        velocities : 1,
    }).toDestination();
    await piano.load();
    console.log('piano loaded');
    const midi = await Midi.fromUrl(subconfig.truth.midi.absPath);
    console.log('midi loaded');
    console.log({ subconfig, midi, piano });
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
