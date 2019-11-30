import { BetterHTMLElement, elem } from "../../bhe";
import * as fs from "fs";

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
        console.log('👓onsets.json', data);
        this.firstOnset = parseFloat(data.onsets[data.first_onset_index]);
        this.lastOnset = parseFloat(data.onsets.last());
        const video = this.e;
        video.load();
        const loadeddata = new Promise(resolve => video.onloadeddata = resolve);
        const canplay = new Promise(resolve => video.oncanplay = resolve);
        const canplaythrough = new Promise(resolve => video.oncanplaythrough = resolve);
        
        await loadeddata;
        await canplay;
        await canplaythrough;
        console.log('Done awaiting loadeddata, canplay, canplaythrough');
        video.currentTime = this.firstOnset - 0.1;
        console.groupEnd();
    }
    
    async intro() {
        console.group(`Video.intro()`);
        const video = this.e;
        /*const loadeddata = new Promise(resolve => video.onloadeddata = resolve);
         const canplay = new Promise(resolve => video.oncanplay = resolve);
         const canplaythrough = new Promise(resolve => video.oncanplaythrough = resolve);
     
         await loadeddata;
         await canplay;
         await canplaythrough;
         console.log('Done awaiting loadeddata, canplay, canplaythrough');*/
        video.play();
        console.log(`Playing, currentTime: ${video.currentTime}`);
        const ended = new Promise(resolve => video.onended = resolve);
        await ended;
        console.log('video ended!');
        console.groupEnd();
        return
    }
}

export default Video;
