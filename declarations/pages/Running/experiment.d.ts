import Dialog from "./dialog";
import { DemoType } from "../../MyStore";
import Animation from './animation';
import Video from "./video";
declare class Experiment {
    readonly dialog: Dialog;
    readonly animation: Animation;
    readonly video: Video;
    private readonly demoType;
    constructor(demoType: DemoType);
    intro(): Promise<void>;
}
export default Experiment;
//# sourceMappingURL=experiment.d.ts.map