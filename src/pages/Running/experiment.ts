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
        if ( demoType === "video" || Glob.BigConfig.dev.simulate_video_mode('Experiment.constructor') ) {
            this.video = new Video()
                .appendTo(Glob.MainContent);
            this.video.setOpacTransDur();
        }
        this.demoType = demoType;
        
    }
    
    async init(readonlyTruth: ReadonlyTruth) {
        
        const promises = [];
        if ( this.video ) {
            promises.push(this.video.init(readonlyTruth.mp4.absPath, readonlyTruth.onsets.absPath))
        } else {
            promises.push(this.animation.init(readonlyTruth.midi.absPath))
        }
        return await Promise.all(promises);
    }
    
    async callOnClick(fn: AsyncFunction) {
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
            console.log(`done playing ${this.demoType}`);
            await wait(1000);
            await demo.hide();
            console.groupEnd();
        });
        /*const promiseDone = new Promise(resolve =>
         Glob.Document.on({
         click : async (ev: KeyboardEvent) => {
         ev.preventDefault();
         ev.stopPropagation();
         await Promise.all([
         this.dialog.hide(),
         Glob.hide("Title", "NavigationButtons")
         
         ]);
         
         Glob.Document.off("click");
         await demo.intro();
         console.log(`done playing ${this.demoType}`);
         await wait(1000);
         await demo.hide();
         resolve();
         
         }
         }));
         console.groupEnd();
         return await promiseDone;*/
        
    }
    
    
    async levelIntro(levelCollection: LevelCollection, pairs: IPairs) {
        console.group(`Experiment.levelIntro()`);
        Glob.Title.levelh3.text(`Level 1/${levelCollection.length}`);
        Glob.Title.trialh3.text(`Trial 1/${levelCollection.current.trials}`);
        let playVideo;
        if ( this.demoType === "animation" && !Glob.BigConfig.dev.simulate_video_mode('Experiment.levelIntro()') ) {
            playVideo = false;
        } else {
            if ( levelCollection.previous && levelCollection.previous.notes !== levelCollection.current.notes ) {
                playVideo = true;
            }
            if ( playVideo ) console.warn(`playVideo`, playVideo);
        }
        
        await Promise.all([
            Glob.display("Title", "NavigationButtons"),
            this.dialog.levelIntro(levelCollection, playVideo)
        ]);
        
        
        if ( playVideo ) {
            await this.video.display();
            const videoDone = new Promise(resolve =>
                Glob.Document.on({
                    click : async (ev: KeyboardEvent) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        await Promise.all([
                            this.dialog.hide(),
                            Glob.hide("Title", "NavigationButtons")
                        
                        ]);
                        
                        Glob.Document.off("click");
                        const [ __, last_off ] = pairs[levelCollection.current.notes - 1];
                        const [ first_on, _ ] = pairs[0];
                        const duration = last_off.time - first_on.time;
                        await this.video.levelIntro(duration);
                        await wait(1000);
                        await this.video.hide();
                        resolve();
                        
                    }
                }));
            await videoDone;
            await Glob.display("Title", "NavigationButtons");
        }
        
        console.groupEnd();
    }
    
}

export default Experiment;
