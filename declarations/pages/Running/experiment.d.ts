import Dialog from "./dialog";
import { DemoType } from "../../MyStore";
declare class Experiment {
    readonly dialog: Dialog;
    constructor();
    intro(demoType: DemoType): Promise<void>;
}
export default Experiment;
//# sourceMappingURL=experiment.d.ts.map