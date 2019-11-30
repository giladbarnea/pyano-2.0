import { VisualBHE } from "../../bhe";
import { DemoType } from "../../MyStore";
declare class Dialog extends VisualBHE {
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