import { VisualBHE } from "bhe/extra";
import { IInteractive } from "pages/interactivebhe";
declare class Animation extends VisualBHE<HTMLUListElement> implements IInteractive {
    private piano;
    private noteOns;
    private noteOffs;
    constructor();
    init(midiAbsPath: string): Promise<void>;
    intro(): Promise<void>;
    levelIntro(notes: number, rate: number): Promise<void>;
    play(notes?: number, rate?: number): Promise<void>;
    private paintKey;
}
export default Animation;
