import Dialog from "./dialog";
import { DemoType } from "../../MyStore";
import Animation from './animation'
import { wait } from "../../util";
import Video from "./video";
import Glob from "../../Glob";


class Experiment {
    readonly dialog: Dialog;
    readonly keyboard: Animation;
    readonly video: Video = undefined;
    private readonly demoType: DemoType;
    
    constructor(demoType: DemoType) {
        this.dialog = new Dialog();
        this.keyboard = new Animation();
        this.dialog
            .insertBefore(this.keyboard)
            .setOpacTransDur();
        this.keyboard.setOpacTransDur();
        if ( demoType === "video" ) {
            this.video = new Video()
                .appendTo(Glob.MainContent);
            // Glob.MainContent.append(this.video);
            this.video.setOpacTransDur();
        }
    }
    
    async intro() {
        console.group(`Experiment.intro()`);
        await wait(0);
        // this.dialog.intro(this.video ? "video" : "animation");
        const subconfig = Glob.BigConfig.getSubconfig();
        
        const promises = [
            this.dialog.intro(this.video ? "video" : "animation"),
        
        ];
        if ( this.video ) {
            promises.push(this.video.initVideo(subconfig.truth.mp4.absPath, subconfig.truth.onsets.absPath))
        } else {
            promises.push(this.keyboard.initPiano(subconfig.truth.midi.absPath))
            
        }
        await Promise.all(promises);
        if ( this.video ) {
            this.video.on({
                playing : (ev: Event) => {
                    console.log('Video playing, allOff()');
                    Glob.Document.allOff();
                    this.video.allOff();
                }
            });
            await this.video.display();
            
            
        } else {
            
            await this.keyboard.display();
        }
        
        
        Glob.Document.on({
            click : async (ev: KeyboardEvent) => {
                ev.preventDefault();
                ev.stopPropagation();
                await Promise.all([
                    this.dialog.hide(),
                    Glob.hide("Title", "NavigationButtons")
                ]);
                if ( this.video ) {
                    await this.video.intro();
                    console.log('done playing video');
                    this.video.hide();
                } else {
                    await this.keyboard.intro();
                    console.log('done playing animation');
                    await wait(1000);
                    this.keyboard.hide();
                }
                
            }
        });
        console.groupEnd();
        
    }
    
}

export default Experiment;
