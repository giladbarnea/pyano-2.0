import Dialog from "./dialog";
import Animation from './animation';
import Video from "./video";
import { MidiKeyboard } from "Piano/MidiKeyboard";
import { LevelCollection } from "level";
import { store } from "store";
declare class Experiment {
    readonly dialog: Dialog;
    readonly animation: Animation;
    readonly video: Video;
    readonly keyboard: MidiKeyboard;
    private readonly greenButton;
    private readonly demoType;
    private readonly truthFile;
    private readonly allowedTempoDeviation;
    private readonly allowedRhythmDeviation;
    constructor(subconfig: store.ISubconfig);
    init(subconfig: store.Subconfig): Promise<void>;
    callOnClick(fn: () => Promise<void>, demo: Animation | Video): Promise<void>;
    intro(): Promise<void>;
    levelIntro(levelCollection: LevelCollection): Promise<void>;
    record(levelCollection: LevelCollection): Promise<void>;
    private checkDoneTrial;
}
export default Experiment;
