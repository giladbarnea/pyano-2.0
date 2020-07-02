import Dialog from "./dialog";
import { ISubconfig, Subconfig } from "../../MyStore";
import Animation from './animation';
import Video from "./video";
import { LevelCollection } from "../../Level";
import { MidiKeyboard } from "../../Piano/MidiKeyboard";
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
    constructor(subconfig: ISubconfig);
    init(subconfig: Subconfig): Promise<void>;
    callOnClick(fn: () => Promise<void>, demo: Animation | Video): Promise<void>;
    intro(): Promise<void>;
    levelIntro(levelCollection: LevelCollection): Promise<void>;
    record(levelCollection: LevelCollection): Promise<void>;
    private checkDoneTrial;
}
export default Experiment;
//# sourceMappingURL=experiment.d.ts.map