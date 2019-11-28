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
        this.e.play();
        const ended = new Promise(resolve => this.e.onended = resolve);
        await ended;
        console.log('video ended!');
        return
    }
}

export default Video;
