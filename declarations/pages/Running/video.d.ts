import { ReadonlyTruth } from "../../Truth";
import { VisualBHE } from "../../bhe/extra.js";
declare class Video extends VisualBHE {
    private firstOnset;
    private lastOnset;
    private onOffPairs;
    e: HTMLVideoElement;
    constructor();
    init(readonlyTruth: ReadonlyTruth): Promise<void>;
    private resetCurrentTime;
    private getDuration;
    private play;
    intro(): Promise<void>;
    levelIntro(notes: number, rate: number): Promise<void>;
    hide(): Promise<void>;
}
export default Video;
//# sourceMappingURL=video.d.ts.map