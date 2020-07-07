"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../bhe");
const fs = require("fs");
const util_1 = require("../../util");
const MyPyShell_1 = require("../../MyPyShell");
const extra_js_1 = require("../../bhe/extra.js");
class Video extends extra_js_1.VisualBHE {
    constructor() {
        super({ tag: 'video', cls: 'player' });
    }
    async init(readonlyTruth) {
        console.group(`Video.init()`);
        const src = bhe_1.elem({ tag: 'source' }).attr({ src: readonlyTruth.mp4.absPath, type: 'video/mp4' });
        this.append(src);
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
        console.time(`PY_getOnOffPairs`);
        const PY_getOnOffPairs = new MyPyShell_1.MyPyShell('-m txt.get_on_off_pairs', {
            mode: "json",
            args: [readonlyTruth.name]
        });
        const { pairs } = await PY_getOnOffPairs.runAsync();
        console.timeEnd(`PY_getOnOffPairs`);
        console.log({ pairs });
        this.onOffPairs = pairs;
        console.groupEnd();
    }
    resetCurrentTime() {
        this.e.currentTime = this.firstOnset - 0.1;
    }
    getDuration(notes, rate) {
        const [__, last_off] = this.onOffPairs[notes - 1];
        const [first_on, _] = this.onOffPairs[0];
        const duration = last_off.time - first_on.time;
        return duration / rate;
    }
    async play(notes, rate) {
        const video = this.e;
        let duration;
        if (notes && rate) {
            duration = this.getDuration(notes, rate);
        }
        else {
            duration = this.lastOnset - video.currentTime + 3;
        }
        if (rate) {
            video.playbackRate = rate;
        }
        video.volume = 1;
        video.play();
        const { volume, playbackRate, currentTime, paused } = video;
        console.log(`Playing, `, { notes, rate, volume, playbackRate, currentTime, paused, duration });
        await util_1.wait(duration * 1000 - 200, false);
        while (video.volume > 0.05) {
            video.volume -= 0.05;
            await util_1.wait(10, false);
        }
        video.volume = 0;
        video.pause();
        this.allOff();
        console.log('video ended!');
    }
    async intro() {
        console.group(`Video.intro()`);
        await this.play();
        console.groupEnd();
    }
    async levelIntro(notes, rate) {
        console.group(`Video.levelIntro(notes:${notes}, rate:${rate})`);
        await this.play(notes, rate);
        console.groupEnd();
    }
    async hide() {
        await super.hide();
        this.resetCurrentTime();
    }
}
exports.default = Video;
//# sourceMappingURL=video.js.map