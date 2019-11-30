import Dialog from "./dialog";
import { DemoType } from "../../MyStore";
import Animation from './animation'
import { wait } from "../../util";
import Video from "./video";
import Glob from "../../Glob";


class Experiment {
    readonly dialog: Dialog;
    readonly animation: Animation;
    readonly video: Video = undefined;
    private readonly demoType: DemoType;
    
    constructor(demoType: DemoType) {
        this.dialog = new Dialog();
        this.animation = new Animation();
        this.dialog
            .insertBefore(this.animation)
            .setOpacTransDur();
        this.animation.setOpacTransDur();
        if ( demoType === "video" ) {
            this.video = new Video()
                .appendTo(Glob.MainContent);
            this.video.setOpacTransDur();
        }
        this.demoType = demoType;
    }
    
    async intro() {
        console.group(`Experiment.intro()`);
        await wait(0);
        const subconfig = Glob.BigConfig.getSubconfig();
        
        const promises = [
            this.dialog.intro(this.demoType),
        
        ];
        if ( this.video ) {
            promises.push(this.video.initVideo(subconfig.truth.mp4.absPath, subconfig.truth.onsets.absPath))
        } else {
            promises.push(this.animation.initPiano(subconfig.truth.midi.absPath))
            
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
            
            
        }
        /// video / animation
        const demo = this[this.demoType];
        await demo.display();
        
        Glob.Document.on({
            click : async (ev: KeyboardEvent) => {
                ev.preventDefault();
                ev.stopPropagation();
                await Promise.all([
                    this.dialog.hide(),
                    Glob.hide("Title", "NavigationButtons")
                
                ]);
                
                
                await demo.intro();
                console.log(`done playing ${this.demoType}`);
                await wait(1000);
                demo.hide();
                
            }
        });
        console.groupEnd();
        
    }
    
}

export default Experiment;
