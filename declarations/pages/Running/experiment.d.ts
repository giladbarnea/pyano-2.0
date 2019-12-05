import Dialog from "./dialog";
import { DemoType, Subconfig } from "../../MyStore";
import Animation from './animation';
import Video from "./video";
import { LevelCollection } from "../../Level";
import { MidiKeyboard } from "../../Piano/MidiKeyboard";
declare class Experiment {
    readonly dialog: Dialog;
    readonly animation: Animation;
    readonly video: Video;
    readonly keyboard: MidiKeyboard;
    private readonly demoType;
    private readonly greenButton;
    private readonly truthName;
    constructor(truthName: string, demoType: DemoType);
    init(subconfig: Subconfig): Promise<void>;
    callOnClick(fn: AsyncFunction, demo: Animation | Video): Promise<void>;
    intro(): Promise<unknown>;
    levelIntro(levelCollection: LevelCollection): Promise<void>;
    record(levelCollection: LevelCollection): Promise<void>;
    private checkDoneTrial;
}
export default Experiment;
//# sourceMappingURL=experiment.d.ts.map