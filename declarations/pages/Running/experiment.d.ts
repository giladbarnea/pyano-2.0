import { IInteractive } from "pages/Running/iinteractive";
import Dialog from "./dialog";
import Animation from './animation';
import Video from "./video";
import { MidiKeyboard } from "Piano/MidiKeyboard";
import { LevelArray } from "level";
import { store } from "store";
/**Experiment is a conductor to an orchestra consisting of:
 * - Dialog
 * - Animation
 * - Video
 * - MidiKeyboard (keyboard)
 * */
declare class Experiment implements IInteractive {
    readonly dialog: Dialog;
    readonly animation: Animation;
    readonly video: Video;
    readonly keyboard: MidiKeyboard;
    private readonly greenButton;
    private readonly demoType;
    private readonly truthFile;
    private readonly allowedTempoDeviation;
    private readonly allowedRhythmDeviation;
    constructor({ allowed_rhythm_deviation, allowed_tempo_deviation, demo_type, truth_file }: store.ISubconfig);
    toString(): string;
    /**Calls animation.init() and video.init() which load resources to memory; creates subject dir if needed.
     * Doesn't play anything.*/
    init(subconfig: store.Subconfig): Promise<void>;
    intro(): Promise<void>;
    levelIntro(levelArray: LevelArray): Promise<void>;
    record(levelArray: LevelArray): Promise<void>;
    stopRecord(): void;
    private callOnDocumentClick;
    private checkDoneTrial;
}
export default Experiment;
