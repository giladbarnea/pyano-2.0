import { VisualBHE } from "../../bhe";
declare class Animation extends VisualBHE {
    private notes;
    private piano;
    constructor();
    intro(): Promise<unknown>;
    private paintKey;
    init(midiAbsPath: string): Promise<void>;
}
export default Animation;
//# sourceMappingURL=animation.d.ts.map