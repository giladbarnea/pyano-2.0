import { BetterHTMLElement } from "./bhe";
import { BigConfigCls } from "./MyStore";
declare function hide(...args: ("Title" | "NavigationButtons")[]): Promise<void>;
declare const _default: {
    skipFade: boolean;
    MainContent: BetterHTMLElement;
    Sidebar: BetterHTMLElement;
    Title: BetterHTMLElement & {
        h3: BetterHTMLElement;
    };
    BigConfig: BigConfigCls;
    Document: any;
    NavigationButtons: BetterHTMLElement & {
        exit: BetterHTMLElement;
        minimize: BetterHTMLElement;
    };
    hide: typeof hide;
};
export default _default;
//# sourceMappingURL=Glob.d.ts.map