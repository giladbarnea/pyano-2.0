import { BetterHTMLElement } from "../../bhe";
declare class Keyboard extends BetterHTMLElement {
    private notes;
    private piano;
    constructor();
    intro(): Promise<void>;
    private paintKey;
    initPiano(): Promise<void>;
}
export default Keyboard;
//# sourceMappingURL=keyboard.d.ts.map