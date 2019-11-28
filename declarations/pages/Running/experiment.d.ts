import Dialog from "./dialog";
import { DemoType } from "../../MyStore";
import Keyboard from './keyboard';
import Video from "./video";
declare class Experiment {
    readonly dialog: Dialog;
    readonly keyboard: Keyboard;
    readonly video: Video;
    constructor(demoType: DemoType);
    intro(): Promise<void>;
}
export default Experiment;
//# sourceMappingURL=experiment.d.ts.map