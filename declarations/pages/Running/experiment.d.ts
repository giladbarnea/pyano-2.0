import Dialog from "./dialog";
import { DemoType } from "../../MyStore";
import Keyboard from './keyboard';
declare class Experiment {
    readonly dialog: Dialog;
    readonly keyboard: Keyboard;
    constructor();
    intro(demoType: DemoType): Promise<void>;
}
export default Experiment;
//# sourceMappingURL=experiment.d.ts.map