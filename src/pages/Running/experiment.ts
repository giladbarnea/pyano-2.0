import Dialog from "./dialog";
import { DemoType } from "../../MyStore";
import Keyboard from './keyboard'
import { wait } from "../../util";
import Video from "./video";
import Glob from "../../Glob";

class Experiment {
    readonly dialog: Dialog;
    readonly keyboard: Keyboard;
    readonly video: Video = undefined;
    
    constructor(demoType: DemoType) {
        this.dialog = new Dialog();
        this.keyboard = new Keyboard();
        this.dialog.insertBefore(this.keyboard);
        if ( demoType === "video" ) {
            this.video = new Video();
            Glob.MainContent.append(this.video);
        }
    }
    
    async intro() {
        await wait(0);
        this.dialog.intro(this.video ? "video" : "animation");
        const subconfig = Glob.BigConfig.getSubconfig();
        
        const promises = [ wait(2000), this.keyboard.initPiano(subconfig.truth.midi.absPath) ];
        if ( this.video ) {
            promises.push(this.video.initVideo(subconfig.truth.mp4.absPath, subconfig.truth.onsets.absPath))
        }
        await Promise.all(promises);
        if ( this.video ) {
            this.video.class('active');
            await wait(1000, false);
            await this.video.intro();
            console.log('done playing video');
        }
        this.keyboard.class('active');
        await wait(1000, false);
        await this.keyboard.intro();
        console.log('done from Experiment!');
        
        
    }
    
}

export default Experiment;
