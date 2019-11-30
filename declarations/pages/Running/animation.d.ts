import { VisualBHE } from "../../bhe";
declare class Animation extends VisualBHE {
    private notes;
    private piano;
    constructor();
    intro(): Promise<unknown>;
    private paintKey;
    initPiano(midiAbsPath: string): Promise<void>;
}
export default Animation;
//# sourceMappingURL=animation.d.ts.map