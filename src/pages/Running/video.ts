console.debug('pages/Running/video.ts')
import { InteractiveOut } from "pages/interactivebhe";
import { elem } from "bhe";
import { VisualBHE } from "bhe/extra";


import { OnOffPairs, Python } from "python";
import type { ReadonlyTruth } from "truth";

// import { VisualBHE } from "bhe/extra";

class Video extends VisualBHE<HTMLVideoElement> implements InteractiveOut {
// class Video extends InteractiveBHE<HTMLVideoElement> {
    private firstOnset: number;
    private lastOnset: number;
    private onOffPairs: OnOffPairs;

    constructor() {
        super({ tag: 'video', cls: 'player' });
    }

    async init(readonlyTruth: ReadonlyTruth): Promise<void> {
        console.title(`Video.init(${readonlyTruth.name})`);

        const src = elem({ tag: 'source' }).attr({ src: readonlyTruth.mp4.absPath, type: 'video/mp4' });
        this.append(src);
        // @ts-ignore
        // let onsetsData = JSON.parse(fs.readFileSync(readonlyTruth.onsets.absPath));
        let onsetsData = require(readonlyTruth.onsets.absPath);
        this.firstOnset = parseFloat(onsetsData.onsets[onsetsData.first_onset_index]);
        this.lastOnset = parseFloat(onsetsData.onsets.last());
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
        console.time('PY_getOnOffPairs');
        const PY_getOnOffPairs = new Python('-m api.get_on_off_pairs', {
            mode: "json",
            args: [readonlyTruth.name]
        });
        const { pairs } = await PY_getOnOffPairs.runAsync<OnOffPairs>();
        console.timeEnd('PY_getOnOffPairs');
        debug(`Video.init() | api.get_on_off_pairs returned ${pairs.length} pairs`);
        this.onOffPairs = pairs;
    }

    // **  Visual Controls
    async hide() {
        await super.hide();
        this.resetCurrentTime();
    }

    // ** Stages
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


    // ** Private methods used by Stages
    async play(notes?: number, rate?: number): Promise<void> {
        console.time('Video.play()')
        console.title(`Video.play(notes: ${notes}, rate: ${rate})`);
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
        plog(`Video.play() | Playing: `, { notes, rate, volume, playbackRate, currentTime, paused, duration });
        console.time('manual wait(duration * 1000 - 200) after video.play()')
        await util.wait(duration * 1000 - 200, false); /// Fadeout == 200ms
        console.timeEnd('manual wait(duration * 1000 - 200) after video.play()')
        console.time('200ms fade out after manual wait')
        while (video.volume > 0.05) {
            video.volume -= 0.05;
            await util.wait(10, false);
        }
        console.timeEnd('200ms fade out after manual wait')
        video.volume = 0;
        video.pause();
        this.allOff();
        debug('Video.play() | finished');
        console.timeEnd('Video.play()')
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
}

export default Video;
