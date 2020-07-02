import { VisualBHE } from "../../bhe/extra.js";
declare class Animation extends VisualBHE {
    private piano;
    private noteOns;
    private noteOffs;
    constructor();
    init(midiAbsPath: string): Promise<void>;
    intro(): Promise<unknown>;
    levelIntro(notes: number, rate: number): Promise<void>;
    private paintKey;
    private play;
}
export default Animation;
//# sourceMappingURL=animation.d.ts.map