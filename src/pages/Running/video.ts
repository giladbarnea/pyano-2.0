import { BetterHTMLElement, elem } from "../../bhe";
import * as fs from "fs";
import { wait } from "../../util";

class Video extends BetterHTMLElement {
    private firstOnset: number;
    private lastOnset: number;
    
    e: HTMLVideoElement;
    
    constructor() {
        super({ tag : 'video' })
    }
    
    async initVideo(mp4path: string, onsetsPath: string) {
        console.group(`Video.initVideo()`);
        const src = elem({ tag : 'source' }).attr({ src : mp4path, type : 'video/mp4' });
        this.append(src);
        // @ts-ignore
        let data = JSON.parse(fs.readFileSync(onsetsPath));
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
        
        console.groupEnd();
    }
    
    async intro() {
        console.group(`Video.intro()`);
        const video = this.e;
        
        video.play();
        console.log(`Playing, currentTime: ${video.currentTime}`);
        await wait((this.lastOnset - video.currentTime) * 1000 + 500, false);
        while ( video.volume > 0.05 ) {
            video.volume -= 0.05;
            await wait(10, false);
        }
        video.volume = 0;
        
        console.log('video ended!');
        console.groupEnd();
        
    }
}

export default Video;
