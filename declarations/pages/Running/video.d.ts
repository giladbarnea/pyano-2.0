import { InteractiveOut } from "pages/Running/iinteractive";
import { VisualBHE } from "bhe/extra";
import type { ReadonlyTruth } from "truth";
declare class Video extends VisualBHE<HTMLVideoElement> implements InteractiveOut {
    private firstOnset;
    private lastOnset;
    private onOffPairs;
    constructor();
    init(readonlyTruth: ReadonlyTruth): Promise<void>;
    hide(): Promise<void>;
    intro(): Promise<void>;
    levelIntro(notes: number, rate: number): Promise<void>;
    play(notes?: number, rate?: number): Promise<void>;
    private resetCurrentTime;
    private getDuration;
}
export default Video;
