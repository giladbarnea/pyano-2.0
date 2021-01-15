import { ReadonlyTruth } from "truth";
import { VisualBHE } from "bhe/extra";
declare class Video extends VisualBHE<HTMLVideoElement> {
    private firstOnset;
    private lastOnset;
    private onOffPairs;
    constructor();
    init(readonlyTruth: ReadonlyTruth): Promise<void>;
    intro(): Promise<void>;
    levelIntro(notes: number, rate: number): Promise<void>;
    hide(): Promise<void>;
    private resetCurrentTime;
    private getDuration;
    private play;
}
export default Video;
