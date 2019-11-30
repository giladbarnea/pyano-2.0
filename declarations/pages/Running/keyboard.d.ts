import ExperimentBHE from "./ExperimentBHE";
declare class Keyboard extends ExperimentBHE {
    private notes;
    private piano;
    constructor();
    intro(): Promise<boolean>;
    private paintKey;
    initPiano(midiAbsPath: string): Promise<void>;
}
export default Keyboard;
//# sourceMappingURL=keyboard.d.ts.map