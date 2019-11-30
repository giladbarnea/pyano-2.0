import { BetterHTMLElement, elem } from "../../bhe";

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
        const loadeddata = new Promise(resolve => video.onloadeddata = resolve);
        const canplay = new Promise(resolve => video.oncanplay = resolve);
        const canplaythrough = new Promise(resolve => video.oncanplaythrough = resolve);
        
        await loadeddata;
        await canplay;
        await canplaythrough;
        console.log('Done awaiting loadeddata, canplay, canplaythrough');
        video.play();
        console.log('Playing');
        const ended = new Promise(resolve => video.onended = resolve);
        await ended;
        console.log('video ended!');
        console.groupEnd();
        return
    }
}

export default Video;
