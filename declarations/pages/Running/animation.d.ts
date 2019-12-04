import { VisualBHE } from "../../bhe";
declare class Animation extends VisualBHE {
    private piano;
    private noteOns;
    private noteOffs;
    constructor();
    init(midiAbsPath: string): Promise<void>;
    private paintKey;
    private play;
    intro(): Promise<unknown>;
    levelIntro(notes: number, rate: number): Promise<void>;
}
export default Animation;
//# sourceMappingURL=animation.d.ts.map