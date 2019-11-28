import { BetterHTMLElement } from "../../bhe";
declare class Keyboard extends BetterHTMLElement {
    private notes;
    private piano;
    constructor();
    intro(): Promise<void>;
    private paintKey;
    private noteOffCallback;
    private noteOnCallback;
    initPiano(): Promise<void>;
}
export default Keyboard;
//# sourceMappingURL=keyboard.d.ts.map