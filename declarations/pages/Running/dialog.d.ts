import { VisualBHE } from "../../bhe";
import { DemoType } from "../../MyStore";
import { Level } from "../../Level";
declare class Dialog extends VisualBHE {
    private readonly big;
    private readonly medium;
    private readonly small;
    private readonly demoType;
    constructor(demoType: DemoType);
    private static humanize;
    intro(): Promise<void>;
    levelIntro(level: Level, demo: DemoType): Promise<void>;
    display(): Promise<any>;
    hide(): Promise<any>;
}
export default Dialog;
//# sourceMappingURL=dialog.d.ts.map