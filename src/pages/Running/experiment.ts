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
        if ( demoType === "video" || Glob.BigConfig.dev.force_play_video() ) {
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
    
    async intro(): Promise<unknown> {
        console.group(`Experiment.intro()`);
        await wait(0);
        
        await this.dialog.intro();
        
        /// video / animation
        let demo;
        if ( Glob.BigConfig.dev.force_play_video() ) {
            demo = this.video;
        } else {
            demo = this[this.demoType];
        }
        await demo.display();
        
        const promiseDone = new Promise(resolve => {
            
            
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
            });
        });
        console.groupEnd();
        return await promiseDone;
        
    }
    
    async levelIntro(levelCollection: LevelCollection, pairs: IPairs) {
        Glob.Title.levelh3.text(`Level 1/${levelCollection.length}`);
        Glob.Title.trialh3.text(`Trial 1/${levelCollection.current.trials}`);
        let playVideo;
        if ( Glob.BigConfig.dev.force_play_video() ) {
            playVideo = true;
            
        } else {
            if ( this.demoType === "animation" ) {
                playVideo = false;
            } else {
                // don't flip because undefined !== number
                playVideo = levelCollection.previous?.notes !== levelCollection.current.notes;
                if ( playVideo ) console.warn(`playVideo`, playVideo);
            }
        }
        
        await Promise.all([
            Glob.display("Title", "NavigationButtons"),
            this.dialog.levelIntro(levelCollection, playVideo)
        ]);
        
        
        if ( playVideo ) {
            await this.video.display();
            const videoDone = new Promise(resolve => {
                
                
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
                });
            });
            await videoDone;
            await Glob.display("Title", "NavigationButtons");
        }
        
    }
    
}

export default Experiment;
