import { elem } from "betterhtmlelement";
import * as fs from "fs";
import { wait } from "../../util";
import { IPairs, MyPyShell } from "../../MyPyShell";
import { ReadonlyTruth } from "../../Truth";
import { VisualBHE } from "../../bhe/extra.js";

class Video extends VisualBHE {
    private firstOnset: number;
    private lastOnset: number;
    private onOffPairs: IPairs;
    e: HTMLVideoElement;
    
    constructor() {
        super({ tag : 'video', cls : 'player' });
    }
    
    async init(readonlyTruth: ReadonlyTruth) {
        console.group(`Video.init()`);
        const src = elem({ tag : 'source' }).attr({ src : readonlyTruth.mp4.absPath, type : 'video/mp4' });
        this.append(src);
        // @ts-ignore
        let data = JSON.parse(fs.readFileSync(readonlyTruth.onsets.absPath));
        this.firstOnset = parseFloat(data.onsets[data.first_onset_index]);
        this.lastOnset = parseFloat(data.onsets.last());
        const video = this.e;
        video.load();
        const loadeddata = new Promise(resolve => video.onloadeddata = resolve);
        const canplay = new Promise(resolve => video.oncanplay = resolve);
        const canplaythrough = new Promise(resolve => video.oncanplaythrough = resolve);
        await Promise.all([
            loadeddata,
            canplay,
            canplaythrough
        ]);
        
        console.log('Done awaiting loadeddata, canplay, canplaythrough');
        this.resetCurrentTime();
        // video.currentTime = this.firstOnset - 0.1;
        console.time(`PY_getOnOffPairs`);
        const PY_getOnOffPairs = new MyPyShell('-m txt.get_on_off_pairs', {
            mode : "json",
            args : [ readonlyTruth.name ]
        });
        const { pairs } = await PY_getOnOffPairs.runAsync<IPairs>();
        console.timeEnd(`PY_getOnOffPairs`);
        console.log({ pairs });
        this.onOffPairs = pairs;
        console.groupEnd();
    }
    
    private resetCurrentTime() {
        this.e.currentTime = this.firstOnset - 0.1;
    }
    
    private getDuration(notes: number, rate: number): number {
        const [ __, last_off ] = this.onOffPairs[notes - 1];
        const [ first_on, _ ] = this.onOffPairs[0];
        const duration = last_off.time - first_on.time;
        return duration / rate;
    }
    
    private async play(notes?: number, rate?: number): Promise<void> {
        const video = this.e;
        let duration;
        if ( notes && rate ) {
            duration = this.getDuration(notes, rate);
        } else {
            duration = this.lastOnset - video.currentTime + 3;
        }
        if ( rate ) {
            video.playbackRate = rate;
        }
        video.volume = 1;
        video.play();
        const { volume, playbackRate, currentTime, paused } = video;
        console.log(`Playing, `, { notes, rate, volume, playbackRate, currentTime, paused, duration });
        await wait(duration * 1000 - 200, false); /// Fadeout == 200ms
        while ( video.volume > 0.05 ) {
            video.volume -= 0.05;
            await wait(10, false);
        }
        video.volume = 0;
        video.pause();
        this.allOff();
        console.log('video ended!');
    }
    
    async intro() {
        console.group(`Video.intro()`);
        await this.play();
        /*const video = this.e;
         const duration = this.lastOnset - video.currentTime;
         video.play();
         console.log(`Playing, currentTime: ${video.currentTime}`);
         await wait(duration * 1000 + 2000, false);
         while ( video.volume > 0.05 ) {
         video.volume -= 0.05;
         await wait(10, false);
         }
         video.volume = 0;
         video.pause();
         this.allOff();
         console.log('video ended!');*/
        console.groupEnd();
        
    }
    
    
    async levelIntro(notes: number, rate: number) {
        console.group(`Video.levelIntro(notes:${notes}, rate:${rate})`);
        await this.play(notes, rate);
        /*const video = this.e;
         const duration = this.getDuration(notes, rate);
         video.playbackRate = rate;
         video.volume = 1;
         video.play();
         const { volume, playbackRate, currentTime, paused, readyState } = video;
         console.log(`Playing, `, { volume, playbackRate, currentTime, paused, readyState, duration });
         await wait(duration * 1000 - 200, false); /// Fadeout == 200ms
         while ( video.volume > 0.05 ) {
         video.volume -= 0.05;
         await wait(10, false);
         }
         video.volume = 0;
         video.pause();
         this.allOff();
         console.log('video ended!');*/
        console.groupEnd();
    }
    
    async hide() {
        await super.hide();
        this.resetCurrentTime();
    }
}

export default Video;
