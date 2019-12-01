import Dialog from "./dialog";
import { DemoType } from "../../MyStore";
import Animation from './animation'
import { wait } from "../../util";
import Video from "./video";
import Glob from "../../Glob";
import { ReadonlyTruth } from "../../Truth";


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
    
    async intro(readonlyTruth: ReadonlyTruth) {
        console.group(`Experiment.intro()`);
        await wait(0);
        
        const promises = [
            this.dialog.intro(this.demoType),
        
        ];
        if ( this.video ) {
            promises.push(this.video.init(readonlyTruth.mp4.absPath, readonlyTruth.onsets.absPath))
        } else {
            promises.push(this.animation.init(readonlyTruth.midi.absPath))
            
        }
        await Promise.all(promises);
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
                
                Glob.Document.allOff();
                await demo.intro();
                console.log(`done playing ${this.demoType}`);
                await wait(1000);
                demo.hide();
                Glob.display("Title", "NavigationButtons")
                
            }
        });
        console.groupEnd();
        
    }
    
}

export default Experiment;
