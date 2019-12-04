import Dialog from "./dialog";
import { DemoType } from "../../MyStore";
import Animation from './animation'
import { wait } from "../../util";
import Video from "./video";
import Glob from "../../Glob";
import { ReadonlyTruth } from "../../Truth";
import { LevelCollection } from "../../Level";
import { IPairs } from "../../MyPyShell";
import { tryCatch } from "./index";
import MyAlert from "../../MyAlert";


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
                    await tryCatch(() => fn(), `trying to run ${demo instanceof Animation ? 'animation' : 'video'}`);
                    await wait(1000);
                    await demo.hide();
                    resolve();
                    
                }
            }));
        await demo.display();
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
            if ( levelCollection.previous ) {
                playVideo = levelCollection.previous.notes !== levelCollection.current.notes;
            } else {
                playVideo = false;
            }
            
        }
        console.log({ playVideo });
        let rate: number = undefined;
        let temp;
        temp = Glob.BigConfig.dev.force_playback_rate('Experiment.levelIntro()');
        if ( temp ) {
            rate = temp;
        } else {
            if ( levelCollection.current.rhythm ) {
                rate = levelCollection.current.tempo / 100;
            } else {
                for ( let i = levelCollection.current.index + 1; i < levelCollection.length; i++ ) {
                    const level = levelCollection.get(i);
                    if ( level.notes === levelCollection.current.notes && level.rhythm ) {
                        rate = level.tempo / 100;
                        console.warn(`level #${levelCollection.current.index} no tempo, took rate (${rate}) from level #${i}`);
                        break
                    }
                }
                if ( rate === undefined ) { // Haven't found in for
                    rate = 1;
                }
            }
        }
        console.log({ rate });
        let notes;
        temp = Glob.BigConfig.dev.force_notes_number('Experiment.levelIntro()');
        if ( temp ) {
            notes = temp;
        } else {
            notes = levelCollection.current.notes;
            
        }
        console.log({ notes });
        if ( playVideo ) {
            
            await this.dialog.levelIntro(levelCollection.current, "video", rate);
            await this.callOnClick(async () => {
                await this.video.levelIntro(notes, rate);
                
            }, this.video);
            
        }
        await this.dialog.levelIntro(levelCollection.current, "animation", rate);
        await this.callOnClick(async () => {
            await this.animation.levelIntro(notes, rate);
            
        }, this.animation);
        
        
        console.groupEnd();
    }
    
    async record(levelCollection: LevelCollection) {
        await this.dialog.record(levelCollection.current);
    }
    
}

export default Experiment;
