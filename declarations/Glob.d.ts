import { BetterHTMLElement, VisualBHE } from "./bhe";
import { BigConfigCls } from "./MyStore";
declare function hide(...args: ("Title" | "NavigationButtons" | "Sidebar")[]): Promise<unknown[]>;
declare function display(...args: ("Title" | "NavigationButtons" | "Sidebar")[]): Promise<unknown[]>;
declare const _default: {
    skipFade: boolean;
    MainContent: BetterHTMLElement;
    Sidebar: VisualBHE;
    Title: VisualBHE & {
        levelh3: BetterHTMLElement;
        trialh3: BetterHTMLElement;
    };
    BigConfig: BigConfigCls;
    Document: any;
    NavigationButtons: VisualBHE & {
        exit: BetterHTMLElement;
        minimize: BetterHTMLElement;
    };
    hide: typeof hide;
    display: typeof display;
};
export default _default;
//# sourceMappingURL=Glob.d.ts.map