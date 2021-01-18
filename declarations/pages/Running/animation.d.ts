import { VisualBHE } from "bhe/extra.js";
declare class Animation extends VisualBHE {
    private piano;
    private noteOns;
    private noteOffs;
    constructor();
    init(midiAbsPath: string): Promise<void>;
    intro(): Promise<void>;
    levelIntro(notes: number, rate: number): Promise<void>;
    private play;
    private paintKey;
}
export default Animation;
