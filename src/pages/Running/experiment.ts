console.debug('pages/Running/experiment.ts')
import { IInteractive } from "pages/interactivebhe";
import Dialog from "./dialog";
// import { DemoType, ISubconfig, Subconfig } from "../../MyStore";

// const { DemoType, ISubconfig, Subconfig } = mystore;
import Animation from './animation'
import Video from "./video";
import Glob from "Glob";
// import { ReadonlyTruth } from "../../Truth";
import { button, Button } from "bhe";
import { MidiKeyboard } from "Piano/MidiKeyboard";
import { Python } from "python";
import { ILevel, LevelArray } from "level";
import { store } from "store";
import swalert from "swalert";


/**Experiment is a conductor to an orchestra consisting of:
 * - Dialog
 * - Animation
 * - Video
 * - MidiKeyboard (keyboard)
 * */
class Experiment implements IInteractive {
    readonly dialog: Dialog;
    readonly animation: Animation;
    readonly video: Video = undefined;
    readonly keyboard: MidiKeyboard;
    private readonly greenButton: Button;
    private readonly demoType: store.DemoType;
    private readonly truthFile: string;
    private readonly allowedTempoDeviation: string;
    private readonly allowedRhythmDeviation: string;


    constructor(subconfig: store.ISubconfig) {
        const { demo_type, truth_file, allowed_tempo_deviation, allowed_rhythm_deviation } = subconfig;
        title(`Experiment.constructor( ${util.inspect.inspect({ demo_type, truth_file, allowed_tempo_deviation, allowed_rhythm_deviation }, { compact: true })} )`)
        this.dialog = new Dialog(demo_type);
        this.animation = new Animation();
        this.animation.before(this.dialog.setOpacTransDur());


        this.animation.setOpacTransDur();

        this.video = new Video()
            .appendTo(Glob.MainContent);
        this.video.setOpacTransDur();

        this.keyboard = new MidiKeyboard();
        this.greenButton = button({ setid: 'green_button', cls: 'inactive green player', html: 'Done' });
        Glob.MainContent.append(this.greenButton);

        this.demoType = demo_type;
        this.truthFile = truth_file;
        this.allowedTempoDeviation = allowed_tempo_deviation;
        this.allowedRhythmDeviation = allowed_rhythm_deviation;

    }

    toString(): string {
        return `Experiment(${this.truthFile})`
    }

    /**Calls animation.init() and video.init() which load resources to memory; creates subject dir if needed.
     * Doesn't play anything.*/
    async init(subconfig: store.Subconfig) {
        const readonlyTruth = subconfig.truth.toJSON();
        await Promise.all([
            this.dialog.init(),
            this.video.init(readonlyTruth),
            this.animation.init(readonlyTruth.midi.absPath),
            this.keyboard.init()
        ]);
        const outPathAbs = subconfig.experimentOutDirAbs();
        const existed = myfs.createIfNotExists(outPathAbs);
        if (existed) {
            const stats = fs.statSync(outPathAbs);
            let datestr = stats.ctime.human();
            fs.renameSync(outPathAbs, `${outPathAbs}__${datestr}`);
            fs.mkdirSync(outPathAbs)
        }

    }

    async intro(): Promise<void> {
        console.title(`${this}.intro()`);
        await util.wait(0);

        await this.dialog.intro();

        /// video / animation
        let demo;
        if (BigConfig.dev.simulate_video_mode(`${this}.intro()`)) {
            demo = this.video;
        } else if (BigConfig.dev.simulate_animation_mode(`${this}.intro()`)) {
            demo = this.animation;
        } else {
            demo = this[this.demoType];
        }

        return await this.callOnClick(async () => {
            await demo.intro();
        }, demo);

    }

    async levelIntro(levelArray: LevelArray) {
        const _sig = `${this}.levelIntro(levelArray: ${levelArray})`
        console.title(_sig);

        let playVideo;
        if ((this.demoType === "animation"
            && !BigConfig.dev.simulate_video_mode(_sig))
            || BigConfig.dev.simulate_animation_mode(_sig)) {
            playVideo = false;
        } else {
            if (levelArray.previous) {
                playVideo = levelArray.previous.notes !== levelArray.current.notes;
            } else {
                playVideo = false;
            }

        }
        debug(`${_sig} | playVideo: ${playVideo}`);

        // * rate
        // If current level's rhythm is true, rate is dictated by current level's tempo.
        // If rhythm is false, next levels are searched until a level with
        // rhythm=true and with the same amount of notes is found, and its rate is used.
        // Defaults to 1 if no matching level is found.
        let rate: number = undefined;
        let forcedPlaybackRate = BigConfig.dev.force_playback_rate(_sig);
        if (forcedPlaybackRate) {
            rate = forcedPlaybackRate;
        } else {
            if (levelArray.current.rhythm) {
                rate = levelArray.current.tempo / 100
            } else {
                const nextLevelWithRhythmAndSameNumberOfNotes = levelArray.find((level,i) => i> levelArray.current.index && level.rhythm && level.notes === levelArray.current.notes);
                if (nextLevelWithRhythmAndSameNumberOfNotes) {
                    warn(`${_sig} | level #${levelArray.current.index} rhythm=false; took rate (${rate}) from level ${nextLevelWithRhythmAndSameNumberOfNotes}`);
                    rate = nextLevelWithRhythmAndSameNumberOfNotes.tempo / 100;
                } else {
                    warn(`${_sig} | level #${levelArray.current.index} rhythm=false; no level further up with rhythm=true and same number of notes; defaulting to rate = 1`);
                    rate = 1;
                }

            }
        }
        debug(`${_sig} | rate: ${rate}`);
        let notes;
        let forcedNotesNumber = BigConfig.dev.force_notes_number(_sig);
        if (forcedNotesNumber) {
            notes = forcedNotesNumber;
        } else {
            notes = levelArray.current.notes;

        }
        debug(`${_sig} | notes: ${notes}`);
        if (playVideo) {

            await this.dialog.levelIntro(levelArray.current, "video", rate);
            await this.callOnClick(async () => {
                await this.video.levelIntro(notes, rate);

            }, this.video);

        }
        await this.dialog.levelIntro(levelArray.current, "animation", rate);
        await this.callOnClick(async () => {
            await this.animation.levelIntro(notes, rate);

        }, this.animation);


    }

    async record(levelArray: LevelArray) {
        console.title(`${this}.record()`)
        Glob.Title.levelh3.text(`Level 1/${levelArray.length}`);
        Glob.Title.trialh3.text(`Trial 1/${levelArray.current.trials}`);

        this.greenButton
            .replaceClass('inactive', 'active')
            .click(() => this.checkDoneTrial(levelArray.current.toJSON()));
        await this.dialog.record(levelArray.current);
        await this.keyboard.record(levelArray.current);
    }

    private async callOnClick(fn: () => Promise<void>, demo: Animation | Video) {
        const done = new Promise<void>(resolve =>
            Glob.Document.on({
                click: async (ev: KeyboardEvent) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    await Promise.all([
                        this.dialog.hide(),
                        Glob.hide("Title", "NavigationButtons")

                    ]);

                    Glob.Document.off("click");
                    // await util.tryCatch(() => fn(), `trying to run ${demo instanceof Animation ? 'animation' : 'video'}`);
                    await util.tryCatch(fn, `trying to run ${demo instanceof Animation ? 'animation' : 'video'}`);
                    await util.wait(1000);
                    await demo.hide();
                    resolve();

                }
            }));
        await demo.display();
        await done;
        await Glob.display("Title", "NavigationButtons");

    }

    private async checkDoneTrial(readonlyLevel: ILevel) {
        if (!util.bool(this.keyboard.msgs)) {
            return swalert.small.warning({ title: 'Please play something' })
        }

        console.log('this.keyboard.notes:', this.keyboard.msgs);
        console.time('PY_checkDoneTrial');
        const PY_checkDoneTrial = new Python('-m api.analyze_txt', {
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
        console.timeEnd('PY_checkDoneTrial');
    }
}

export default Experiment;
