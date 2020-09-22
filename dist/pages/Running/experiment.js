Object.defineProperty(exports, "__esModule", { value: true });
const dialog_1 = require("./dialog");
// import { DemoType, ISubconfig, Subconfig } from "../../MyStore";
// const { DemoType, ISubconfig, Subconfig } = mystore;
const animation_1 = require("./animation");
const video_1 = require("./video");
const Glob_1 = require("../../Glob");
const index_1 = require("./index");
const bhe_1 = require("../../bhe");
const MidiKeyboard_1 = require("../../Piano/MidiKeyboard");
const MyPyShell_1 = require("../../MyPyShell");
class Experiment {
    constructor(subconfig) {
        this.video = undefined;
        const { demo_type, truth_file, allowed_tempo_deviation, allowed_rhythm_deviation } = subconfig;
        this.dialog = new dialog_1.default(demo_type);
        this.animation = new animation_1.default();
        this.dialog
            .insertBefore(this.animation)
            .setOpacTransDur();
        this.animation.setOpacTransDur();
        this.video = new video_1.default()
            .appendTo(Glob_1.default.MainContent);
        this.video.setOpacTransDur();
        this.keyboard = new MidiKeyboard_1.MidiKeyboard();
        this.greenButton = bhe_1.button({ setid: 'green_button', cls: 'inactive green player', html: 'Done' });
        Glob_1.default.MainContent.append(this.greenButton);
        this.demoType = demo_type;
        this.truthFile = truth_file;
        this.allowedTempoDeviation = allowed_tempo_deviation;
        this.allowedRhythmDeviation = allowed_rhythm_deviation;
    }
    // async init(readonlyTruth: ReadonlyTruth) {
    async init(subconfig) {
        const readonlyTruth = subconfig.truth.toJSON();
        await Promise.all([
            this.video.init(readonlyTruth),
            this.animation.init(readonlyTruth.midi.absPath)
        ]);
        const outPathAbs = subconfig.experimentOutDirAbs();
        const existed = myfs.createIfNotExists(outPathAbs);
        if (existed) {
            const stats = fs.statSync(outPathAbs);
            let datestr = stats.ctime.human();
            fs.renameSync(outPathAbs, `${outPathAbs}__${datestr}`);
            fs.mkdirSync(outPathAbs);
        }
    }
    async callOnClick(fn, demo) {
        const done = new Promise(resolve => Glob_1.default.Document.on({
            click: async (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                await Promise.all([
                    this.dialog.hide(),
                    Glob_1.default.hide("Title", "NavigationButtons")
                ]);
                Glob_1.default.Document.off("click");
                await index_1.tryCatch(() => fn(), `trying to run ${demo instanceof animation_1.default ? 'animation' : 'video'}`);
                await util.wait(1000);
                await demo.hide();
                resolve();
            }
        }));
        await demo.display();
        await done;
        await Glob_1.default.display("Title", "NavigationButtons");
        return;
    }
    async intro() {
        console.group(`Experiment.intro()`);
        await util.wait(0);
        await this.dialog.intro();
        /// video / animation
        let demo;
        if (BigConfig.dev.simulate_video_mode('Experiment.intro()')) {
            demo = this.video;
        }
        else if (BigConfig.dev.simulate_animation_mode('Experiment.intro()')) {
            demo = this.animation;
        }
        else {
            demo = this[this.demoType];
        }
        return await this.callOnClick(async () => {
            await demo.intro();
            console.groupEnd();
        }, demo);
    }
    async levelIntro(levelCollection) {
        console.group(`Experiment.levelIntro()`);
        let playVideo;
        if ((this.demoType === "animation"
            && !BigConfig.dev.simulate_video_mode('Experiment.levelIntro()'))
            || BigConfig.dev.simulate_animation_mode('Experiment.levelIntro()')) {
            playVideo = false;
        }
        else {
            if (levelCollection.previous) {
                playVideo = levelCollection.previous.notes !== levelCollection.current.notes;
            }
            else {
                playVideo = false;
            }
        }
        console.debug({ playVideo });
        let rate = undefined;
        let temp;
        temp = BigConfig.dev.force_playback_rate('Experiment.levelIntro()');
        if (temp) {
            rate = temp;
        }
        else {
            if (levelCollection.current.rhythm) {
                rate = levelCollection.current.tempo / 100;
            }
            else {
                for (let i = levelCollection.current.index + 1; i < levelCollection.length; i++) {
                    const level = levelCollection.get(i);
                    if (level.notes === levelCollection.current.notes && level.rhythm) {
                        rate = level.tempo / 100;
                        console.warn(`level #${levelCollection.current.index} no tempo, took rate (${rate}) from level #${i}`);
                        break;
                    }
                }
                if (rate === undefined) { // Haven't found in for
                    rate = 1;
                }
            }
        }
        console.debug({ rate });
        let notes;
        temp = BigConfig.dev.force_notes_number('Experiment.levelIntro()');
        if (temp) {
            notes = temp;
        }
        else {
            notes = levelCollection.current.notes;
        }
        console.debug({ notes });
        if (playVideo) {
            await this.dialog.levelIntro(levelCollection.current, "video", rate);
            await this.callOnClick(async () => {
                await this.video.levelIntro(notes, rate);
            }, this.video);
        }
        await this.dialog.levelIntro(levelCollection.current, "animation", rate);
        await this.callOnClick(async () => {
            await this.animation.levelIntro(notes, rate);
        }, this.animation);
        console.groupEnd();
    }
    async record(levelCollection) {
        Glob_1.default.Title.levelh3.text(`Level 1/${levelCollection.length}`);
        Glob_1.default.Title.trialh3.text(`Trial 1/${levelCollection.current.trials}`);
        this.greenButton
            .replaceClass('inactive', 'active')
            .click(() => this.checkDoneTrial(levelCollection.current.toJSON()));
        await this.dialog.record(levelCollection.current);
    }
    async checkDoneTrial(readonlyLevel) {
        if (!util.bool(this.keyboard.msgs)) {
            return swalert.small._info({ title: 'Please play something' });
        }
        console.log('this.keyboard.notes:', this.keyboard.msgs);
        console.time(`PY_checkDoneTrial`);
        const PY_checkDoneTrial = new MyPyShell_1.MyPyShell('-m api.analyze_txt', {
            mode: "json",
            args: [
                JSON.stringify({
                    subconfig: {
                        truth_file: this.truthFile,
                        allowed_rhythm_deviation: this.allowedRhythmDeviation,
                        allowed_tempo_deviation: this.allowedTempoDeviation,
                    },
                    level: readonlyLevel,
                    experiment_type: BigConfig.experiment_type,
                    subj_msgs: this.keyboard.msgs
                }),
            ]
        });
        const response = await PY_checkDoneTrial.runAsync();
        console.log({ response });
        console.timeEnd(`PY_checkDoneTrial`);
    }
}
exports.default = Experiment;