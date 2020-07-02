import { DemoType } from "../../MyStore";
import { Level } from "../../Level";
import { VisualBHE } from "../../bhe/extra.js";
declare class Dialog extends VisualBHE {
    private readonly big;
    private readonly medium;
    private readonly small;
    private readonly demoType;
    constructor(demoType: DemoType);
    private static humanize;
    intro(): Promise<void>;
    levelIntro(level: Level, demo: DemoType, rate: number): Promise<void>;
    record(level: Level): Promise<void>;
    private display;
    hide(): Promise<any>;
}
export default Dialog;
//# sourceMappingURL=dialog.d.ts.map