import Dialog from "./dialog";
import { DemoType } from "../../MyStore";
import Animation from './animation';
import Video from "./video";
import { ReadonlyTruth } from "../../Truth";
import { LevelCollection } from "../../Level";
declare class Experiment {
    readonly dialog: Dialog;
    readonly animation: Animation;
    readonly video: Video;
    private readonly demoType;
    constructor(demoType: DemoType);
    init(readonlyTruth: ReadonlyTruth): Promise<any[]>;
    intro(): Promise<unknown>;
    levelIntro(levelCollection: LevelCollection): Promise<void>;
}
export default Experiment;
//# sourceMappingURL=experiment.d.ts.map