import Dialog from "./dialog";
import { DemoType } from "../../MyStore";
import Animation from './animation'
import { wait } from "../../util";
import Video from "./video";
import Glob from "../../Glob";
import { ReadonlyTruth } from "../../Truth";
import { LevelCollection } from "../../Level";
import { IPairs } from "../../MyPyShell";


class Experiment {
    readonly dialog: Dialog;
    readonly animation: Animation;
    readonly video: Video = undefined;
    private readonly demoType: DemoType;
    
    constructor(demoType: DemoType) {
        this.dialog = new Dialog(demoType);
        this.animation = new Animation();
        this.dialog
            .insertBefore(this.animation)
            .setOpacTransDur();
        this.animation.setOpacTransDur();
        
        this.video = new Video()
            .appendTo(Glob.MainContent);
        this.video.setOpacTransDur();
        this.demoType = demoType;
        
    }
    
    async init(readonlyTruth: ReadonlyTruth) {
        return await Promise.all([
            this.video.init(readonlyTruth),
            this.animation.init(readonlyTruth.midi.absPath)
        ]);
    }
    
    async callOnClick(fn: AsyncFunction, demo: Animation | Video) {
        const done = new Promise(resolve =>
            Glob.Document.on({
                click : async (ev: KeyboardEvent) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    await Promise.all([
                        this.dialog.hide(),
                        Glob.hide("Title", "NavigationButtons")
                    
                    ]);
                    
                    Glob.Document.off("click");
                    await fn();
                    await wait(1000);
                    await demo.hide();
                    resolve();
                    
                }
            }));
        await done;
        await Glob.display("Title", "NavigationButtons");
        return
        
    }
    
    async intro(): Promise<unknown> {
        console.group(`Experiment.intro()`);
        await wait(0);
        
        await this.dialog.intro();
        
        /// video / animation
        let demo;
        if ( Glob.BigConfig.dev.simulate_video_mode('Experiment.intro()') ) {
            demo = this.video;
        } else {
            demo = this[this.demoType];
        }
        
        await demo.display();
        return await this.callOnClick(async () => {
            await demo.intro();
            console.groupEnd();
        }, demo);
        
    }
    
    
    async levelIntro(levelCollection: LevelCollection) {
        console.group(`Experiment.levelIntro()`);
        Glob.Title.levelh3.text(`Level 1/${levelCollection.length}`);
        Glob.Title.trialh3.text(`Trial 1/${levelCollection.current.trials}`);
        let playVideo;
        if ( this.demoType === "animation"
            && !Glob.BigConfig.dev.simulate_video_mode('Experiment.levelIntro()') ) {
            playVideo = false;
        } else {
            playVideo = levelCollection.previous && levelCollection.previous.notes !== levelCollection.current.notes;
            
        }
        console.log({ playVideo });
        await Promise.all([
            // Glob.display("Title", "NavigationButtons"),
        
        ]);
        
        
        if ( playVideo ) {
            
            await this.dialog.levelIntro(levelCollection.current, "video");
            await this.video.display();
            await this.callOnClick(async () => {
                await this.video.levelIntro(levelCollection.current.notes);
                
            }, this.video);
            
            
        }
        await this.dialog.levelIntro(levelCollection.current, "animation");
        await this.animation.display();
        await this.callOnClick(async () => {
            await this.animation.levelIntro(levelCollection.current.notes);
            
        }, this.animation);
        
        
        console.groupEnd();
    }
    
}

export default Experiment;
