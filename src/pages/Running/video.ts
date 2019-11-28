import { BetterHTMLElement, elem } from "../../bhe";
import * as fs from "fs";

class Video extends BetterHTMLElement {
    
    constructor() {
        super({ tag : 'video' })
    }
    
    async initVideo(mp4path: string, onsetsPath: string) {
        const src = elem({ tag : 'source' }).attr({ src : mp4path, type : 'video/mp4' });
        this.append(src);
        /*let data = fs.readFileSync(onsetsPath);
         data = JSON.parse(data);
         console.log('👓 Video.data from onsets.json', { data });*/
    }
    
    async intro() {
        console.group(`Video.intro()`);
        const video = this.e as HTMLVideoElement;
        video.load();
        const loadedData = new Promise(resolve => video.onloadeddata = resolve);
        const canplay = new Promise(resolve => video.oncanplay = resolve);
        const canplaythrough = new Promise(resolve => video.oncanplaythrough = resolve);
        
        await loadedData;
        console.log('VIDEO LOADEDDATA!');
        await canplay;
        console.log('VIDEO CANPLAY!');
        await canplaythrough;
        console.log('VIDEO CANPLAYTHRU!');
        video.play();
        const ended = new Promise(resolve => video.onended = resolve);
        await ended;
        console.log('video ended!');
        console.groupEnd();
        return
    }
}

export default Video;
