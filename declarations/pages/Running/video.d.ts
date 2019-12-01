import { VisualBHE } from "../../bhe";
declare class Video extends VisualBHE {
    private firstOnset;
    private lastOnset;
    e: HTMLVideoElement;
    constructor();
    init(mp4path: string, onsetsPath: string): Promise<void>;
    intro(): Promise<void>;
    levelIntro(notes: number): Promise<void>;
}
export default Video;
//# sourceMappingURL=video.d.ts.map