import ExperimentBHE from "./ExperimentBHE";
declare class Video extends ExperimentBHE {
    private firstOnset;
    private lastOnset;
    e: HTMLVideoElement;
    constructor();
    initVideo(mp4path: string, onsetsPath: string): Promise<void>;
    intro(): Promise<void>;
}
export default Video;
//# sourceMappingURL=video.d.ts.map