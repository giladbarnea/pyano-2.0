import { BetterHTMLElement } from "../../bhe";
declare class Video extends BetterHTMLElement {
    constructor();
    initVideo(mp4path: string, onsetsPath: string): Promise<void>;
    intro(): Promise<void>;
}
export default Video;
//# sourceMappingURL=video.d.ts.map