import { Level } from "level";
import { VisualBHE } from "bhe/extra";
import { store } from "store";
import { IInteractive } from "pages/interactivebhe";
declare class Dialog extends VisualBHE<HTMLDivElement> implements IInteractive {
    private readonly big;
    private readonly medium;
    private readonly small;
    private readonly demoType;
    constructor(demoType: store.DemoType);
    private static humanize;
    hide(): Promise<any>;
    /**Don't use this outside; Use public functions instead. ts-ignore hack. */
    display(): Promise<any>;
    intro(): Promise<void>;
    levelIntro(level: Level, demoType: store.DemoType, rate: number): Promise<void>;
    record(level: Level): Promise<void>;
}
export default Dialog;
