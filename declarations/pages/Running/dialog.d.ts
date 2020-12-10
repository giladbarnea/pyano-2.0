import { Level } from "../../level";
import { VisualBHE } from "../../bhe/extra.js";
import { store } from "../../store.js";
declare class Dialog extends VisualBHE {
    private readonly big;
    private readonly medium;
    private readonly small;
    private readonly demoType;
    constructor(demoType: store.DemoType);
    private static humanize;
    intro(): Promise<void>;
    levelIntro(level: Level, demo: store.DemoType, rate: number): Promise<void>;
    record(level: Level): Promise<void>;
    hide(): Promise<any>;
    /**Use public functions*/
    private display;
}
export default Dialog;
