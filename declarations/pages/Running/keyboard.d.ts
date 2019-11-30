import { VisualBHE } from "../../bhe";
declare class Keyboard extends VisualBHE {
    private notes;
    private piano;
    constructor();
    intro(): Promise<unknown>;
    private paintKey;
    initPiano(midiAbsPath: string): Promise<void>;
}
export default Keyboard;
//# sourceMappingURL=keyboard.d.ts.map