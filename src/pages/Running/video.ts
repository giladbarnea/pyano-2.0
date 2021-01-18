console.debug('pages/Running/video.ts')
import { elem } from "bhe";


import { IPairs, Python } from "python";
import { ReadonlyTruth } from "truth";
import { VisualBHE } from "bhe/extra";

class Video extends VisualBHE<HTMLVideoElement> {
    private firstOnset: number;
    private lastOnset: number;
    private onOffPairs: IPairs;

    constructor() {
        super({ tag: 'video', cls: 'player' });
    }
    async init(readonlyTruth: ReadonlyTruth):Promise<void> {
        console.title(`Video.init(${readonlyTruth.name})`);

        const src = elem({ tag: 'source' }).attr({ src: readonlyTruth.mp4.absPath, type: 'video/mp4' });
        this.append(src);
        // @ts-ignore
        // let data = JSON.parse(fs.readFileSync(readonlyTruth.onsets.absPath));
        let data = require(readonlyTruth.onsets.absPath);
        this.firstOnset = parseFloat(data.onsets[data.first_onset_index]);
        this.lastOnset = parseFloat(data.onsets.last());
        const video = this._htmlElement;
        video.load();
        const loadeddata = new Promise(resolve => video.onloadeddata = resolve);
        const canplay = new Promise(resolve => video.oncanplay = resolve);
        const canplaythrough = new Promise(resolve => video.oncanplaythrough = resolve);
        await Promise.all([
            loadeddata,
            canplay,
            canplaythrough
        ]);
        // console.debug = console.debug.bind(console, 'Video.init | ')
        debug('Video.init() | Done awaiting loadeddata, canplay, canplaythrough. Constructing a Python -m api.get_on_off_pairs...');
        this.resetCurrentTime();
        // video.currentTime = this.firstOnset - 0.1;
        console.time(`PY_getOnOffPairs`);
        const PY_getOnOffPairs = new Python('-m api.get_on_off_pairs', {
            mode: "json",
            args: [readonlyTruth.name]
        });
        const { pairs } = await PY_getOnOffPairs.runAsync<IPairs>();
        console.timeEnd(`PY_getOnOffPairs`);
        debug(`Video.init() | api.get_on_off_pairs returned ${pairs.length} pairs`);
        this.onOffPairs = pairs;
    }

    async intro() {
        console.title(`Video.intro()`);
        await this.play();
        /*const video = this._htmlElement;
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

    }

    async levelIntro(notes: number, rate: number) {
        console.title(`Video.levelIntro(notes:${notes}, rate:${rate})`);
        await this.play(notes, rate);
        /*const video = this._htmlElement;
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
    }

    async hide() {
        await super.hide();
        this.resetCurrentTime();
    }

    private resetCurrentTime() {
        this._htmlElement.currentTime = this.firstOnset - 0.1;
    }

    private getDuration(notes: number, rate: number): number {
        const [__, last_off] = this.onOffPairs[notes - 1];
        const [first_on, _] = this.onOffPairs[0];
        const duration = last_off.time - first_on.time;
        return duration / rate;
    }

    private async play(notes?: number, rate?: number): Promise<void> {
        const video = this._htmlElement;
        let duration;
        if (notes && rate) {
            duration = this.getDuration(notes, rate);
        } else {
            duration = this.lastOnset - video.currentTime + 3;
        }
        if (rate) {
            video.playbackRate = rate;
        }
        video.volume = 1;
        video.play();
        const { volume, playbackRate, currentTime, paused } = video;
        console.log(`Playing, `, { notes, rate, volume, playbackRate, currentTime, paused, duration });
        await util.wait(duration * 1000 - 200, false); /// Fadeout == 200ms
        while (video.volume > 0.05) {
            video.volume -= 0.05;
            await util.wait(10, false);
        }
        video.volume = 0;
        video.pause();
        this.allOff();
        console.log('video ended!');
    }
}

export default Video;
