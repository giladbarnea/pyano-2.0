console.debug('pages/Running/experiment.ts')
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
import { ILevel, LevelCollection } from "level";
import { store } from "store";
import swalert from "swalert";



/**Experiment is a conductor to an orchestra consisting of:
 * - Dialog
 * - Animation
 * - Video
 * - MidiKeyboard (keyboard)
 * */
class Experiment {
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
        title(`Experiment.constructor( ${util.inspect.inspect({ demo_type, truth_file, allowed_tempo_deviation, allowed_rhythm_deviation }, {compact:true})} )`)
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
    toString():string{
        return `Experiment(${this.truthFile})`
    }
    /**Calls animation.init() and video.init() which load resources to memory; creates subject dir if needed.
     * Doesn't play anything.*/
    async init(subconfig: store.Subconfig) {
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
            fs.mkdirSync(outPathAbs)
        }

    }

    async callOnClick(fn: () => Promise<void>, demo: Animation | Video) {
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
                    await util.tryCatch(() => fn(), `trying to run ${demo instanceof Animation ? 'animation' : 'video'}`);
                    await util.wait(1000);
                    await demo.hide();
                    resolve();

                }
            }));
        await demo.display();
        await done;
        await Glob.display("Title", "NavigationButtons");
        return

    }

    async intro(): Promise<void> {
        console.title(`${this}.intro()`);
        await util.wait(0);

        await this.dialog.intro();

        /// video / animation
        let demo;
        if (BigConfig.dev.simulate_video_mode('Experiment.intro()')) {
            demo = this.video;
        } else if (BigConfig.dev.simulate_animation_mode('Experiment.intro()')) {
            demo = this.animation;
        } else {
            demo = this[this.demoType];
        }

        return await this.callOnClick(async () => {
            await demo.intro();
        }, demo);

    }


    async levelIntro(levelCollection: LevelCollection) {
        console.title(`Experiment.levelIntro()`);

        let playVideo;
        if ((this.demoType === "animation"
            && !BigConfig.dev.simulate_video_mode('Experiment.levelIntro()'))
            || BigConfig.dev.simulate_animation_mode('Experiment.levelIntro()')) {
            playVideo = false;
        } else {
            if (levelCollection.previous) {
                playVideo = levelCollection.previous.notes !== levelCollection.current.notes;
            } else {
                playVideo = false;
            }

        }
        console.debug({ playVideo });
        let rate: number = undefined;
        let temp;
        temp = BigConfig.dev.force_playback_rate('Experiment.levelIntro()');
        if (temp) {
            rate = temp;
        } else {
            if (levelCollection.current.rhythm) {
                rate = levelCollection.current.tempo / 100;
            } else {
                for (let i = levelCollection.current.index + 1; i < levelCollection.length; i++) {
                    const level = levelCollection.get(i);
                    if (level.notes === levelCollection.current.notes && level.rhythm) {
                        rate = level.tempo / 100;
                        console.warn(`level #${levelCollection.current.index} no tempo, took rate (${rate}) from level #${i}`);
                        break
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
        } else {
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


    }

    async record(levelCollection: LevelCollection) {
        Glob.Title.levelh3.text(`Level 1/${levelCollection.length}`);
        Glob.Title.trialh3.text(`Trial 1/${levelCollection.current.trials}`);

        this.greenButton
            .replaceClass('inactive', 'active')
            .click(() => this.checkDoneTrial(levelCollection.current.toJSON()));
        await this.dialog.record(levelCollection.current);
    }

    private async checkDoneTrial(readonlyLevel: ILevel) {
        if (!util.bool(this.keyboard.msgs)) {
            return swalert.small.warning({ title: 'Please play something' })
        }

        console.log('this.keyboard.notes:', this.keyboard.msgs);
        console.time(`PY_checkDoneTrial`);
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
        console.timeEnd(`PY_checkDoneTrial`);
    }
}

export default Experiment;
