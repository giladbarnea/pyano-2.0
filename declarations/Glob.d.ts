import { BetterHTMLElement, VisualBHE } from "./bhe";
import { BigConfigCls } from "./MyStore";
declare function hide(...args: ("Title" | "NavigationButtons" | "Sidebar")[]): Promise<unknown[]>;
declare const _default: {
    skipFade: boolean;
    MainContent: BetterHTMLElement;
    Sidebar: VisualBHE;
    Title: VisualBHE & {
        h3: BetterHTMLElement;
    };
    BigConfig: BigConfigCls;
    Document: any;
    NavigationButtons: VisualBHE & {
        exit: BetterHTMLElement;
        minimize: BetterHTMLElement;
    };
    hide: typeof hide;
};
export default _default;
//# sourceMappingURL=Glob.d.ts.map