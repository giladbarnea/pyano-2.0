import { elem, VisualBHE } from "../../bhe";
import * as fs from "fs";
import { wait } from "../../util";
import { IPairs, MyPyShell } from "../../MyPyShell";
import { ReadonlyTruth } from "../../Truth";

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
        video.currentTime = this.firstOnset - 0.1;
        const PY_getOnOffPairs = new MyPyShell('-m txt.get_on_off_pairs', {
            mode : "json",
            args : [ readonlyTruth.name ]
        });
        const { pairs } = await PY_getOnOffPairs.runAsync<IPairs>();
        console.log({ pairs });
        this.onOffPairs = pairs;
        console.groupEnd();
    }
    
    
    async intro() {
        console.group(`Video.intro()`);
        const video = this.e;
        
        video.play();
        console.log(`Playing, currentTime: ${video.currentTime}`);
        await wait((this.lastOnset - video.currentTime) * 1000 + 2000, false);
        while ( video.volume > 0.05 ) {
            video.volume -= 0.05;
            await wait(10, false);
        }
        video.volume = 0;
        video.pause();
        this.allOff();
        console.log('video ended!');
        console.groupEnd();
        
    }
    
    private getDuration(notes: number, rate: number): number {
        const [ __, last_off ] = this.onOffPairs[notes - 1];
        const [ first_on, _ ] = this.onOffPairs[0];
        const duration = last_off.time - first_on.time;
        return duration / rate;
    }
    
    async levelIntro(notes: number, rate: number) {
        console.group(`Video.levelIntro(notes : ${notes})`);
        const video = this.e;
        const duration = this.getDuration(notes, rate);
        video.playbackRate = rate;
        video.play();
        console.log(`Playing, currentTime: ${video.currentTime}`);
        await wait(duration * 1000 - 200, false); /// Fadeout == 200ms
        while ( video.volume > 0.05 ) {
            video.volume -= 0.05;
            await wait(10, false);
        }
        video.volume = 0;
        video.pause();
        this.allOff();
        console.log('video ended!');
        console.groupEnd();
    }
}

export default Video;
