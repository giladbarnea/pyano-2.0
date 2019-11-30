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
        this.dialog.setOpacTransDur();
        this.keyboard.setOpacTransDur();
        this.video.setOpacTransDur();
    }
    
    async intro() {
        console.group(`Experiment.intro()`);
        await wait(0);
        this.dialog.intro(this.video ? "video" : "animation");
        const subconfig = Glob.BigConfig.getSubconfig();
        
        const promises = [ wait(2000), this.keyboard.initPiano(subconfig.truth.midi.absPath) ];
        if ( this.video ) {
            promises.push(this.video.initVideo(subconfig.truth.mp4.absPath, subconfig.truth.onsets.absPath))
        }
        await Promise.all(promises);
        if ( this.video ) {
            this.video.on({
                playing : (ev: Event) => {
                    console.log('Video playing, allOff()');
                    this.video.allOff();
                }
            });
            await this.video.display();
            const videoIntro = async (ev: KeyboardEvent) => {
                // console.log(ev);
                // Glob.Document.off("keypress");
                // Glob.hide("Title", "NavigationButtons");
                await Promise.all([
                    this.dialog.hide(),
                    Glob.hide("Title","NavigationButtons")
                    // Glob.Title.removeClass('active'),
                    // Glob.NavigationButtons.removeClass('active')
                ]);
                await this.video.intro();
                console.log('done playing video');
            };
            
            Glob.Document.on({
                keypress : videoIntro,
                click : videoIntro
            });
            
            
        }
        return;
        this.keyboard.class('active');
        const kbdTransDur = this.keyboard.getOpacityTransitionDuration();
        await wait(kbdTransDur, false);
        await this.keyboard.intro();
        console.log('done from Experiment!');
        console.groupEnd();
        
    }
    
}

export default Experiment;
