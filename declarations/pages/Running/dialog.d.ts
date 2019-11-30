import { DemoType } from "../../MyStore";
import ExperimentBHE from "./ExperimentBHE";
declare class Dialog extends ExperimentBHE {
    private readonly big;
    private readonly medium;
    private readonly small;
    constructor();
    intro(demoType: DemoType): void;
    display(): Promise<any>;
    hide(): Promise<any>;
}
export default Dialog;
//# sourceMappingURL=dialog.d.ts.map