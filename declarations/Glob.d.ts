import { VisualBHE } from "./bhe/extra";
import { BetterHTMLElement } from "./bhe";
declare function hide(...args: ("Title" | "NavigationButtons" | "Sidebar")[]): Promise<unknown[]>;
declare function display(...args: ("Title" | "NavigationButtons" | "Sidebar")[]): Promise<unknown[]>;
declare const _default: {
    skipFade: boolean;
    MainContent: BetterHTMLElement<HTMLElement>;
    Sidebar: VisualBHE<HTMLElement>;
    Title: VisualBHE<HTMLElement> & {
        levelh3: BetterHTMLElement<HTMLElement>;
        trialh3: BetterHTMLElement<HTMLElement>;
    };
    BigConfig: any;
    Document: BetterHTMLElement<HTMLDivElement> | BetterHTMLElement<HTMLInputElement> | BetterHTMLElement<HTMLElement> | BetterHTMLElement<HTMLButtonElement> | BetterHTMLElement<HTMLHeadingElement> | BetterHTMLElement<HTMLLinkElement> | BetterHTMLElement<HTMLTitleElement> | BetterHTMLElement<HTMLTrackElement> | BetterHTMLElement<HTMLProgressElement> | BetterHTMLElement<HTMLAnchorElement> | BetterHTMLElement<HTMLAppletElement> | BetterHTMLElement<HTMLAreaElement> | BetterHTMLElement<HTMLAudioElement> | BetterHTMLElement<HTMLBaseElement> | BetterHTMLElement<HTMLBaseFontElement> | BetterHTMLElement<HTMLQuoteElement> | BetterHTMLElement<HTMLBodyElement> | BetterHTMLElement<HTMLBRElement> | BetterHTMLElement<HTMLCanvasElement> | BetterHTMLElement<HTMLTableCaptionElement> | BetterHTMLElement<HTMLTableColElement> | BetterHTMLElement<HTMLDataElement> | BetterHTMLElement<HTMLDataListElement> | BetterHTMLElement<HTMLModElement> | BetterHTMLElement<HTMLDetailsElement> | BetterHTMLElement<HTMLDialogElement> | BetterHTMLElement<HTMLDirectoryElement> | BetterHTMLElement<HTMLDListElement> | BetterHTMLElement<HTMLEmbedElement> | BetterHTMLElement<HTMLFieldSetElement> | BetterHTMLElement<HTMLFontElement> | BetterHTMLElement<HTMLFormElement> | BetterHTMLElement<HTMLFrameElement> | BetterHTMLElement<HTMLFrameSetElement> | BetterHTMLElement<HTMLHeadElement> | BetterHTMLElement<HTMLHRElement> | BetterHTMLElement<HTMLHtmlElement> | BetterHTMLElement<HTMLIFrameElement> | BetterHTMLElement<HTMLImageElement> | BetterHTMLElement<HTMLLabelElement> | BetterHTMLElement<HTMLLegendElement> | BetterHTMLElement<HTMLLIElement> | BetterHTMLElement<HTMLMapElement> | BetterHTMLElement<HTMLMarqueeElement> | BetterHTMLElement<HTMLMenuElement> | BetterHTMLElement<HTMLMetaElement> | BetterHTMLElement<HTMLMeterElement> | BetterHTMLElement<HTMLOListElement> | BetterHTMLElement<HTMLOptGroupElement> | BetterHTMLElement<HTMLOptionElement> | BetterHTMLElement<HTMLOutputElement> | BetterHTMLElement<HTMLParagraphElement> | BetterHTMLElement<HTMLParamElement> | BetterHTMLElement<HTMLPictureElement> | BetterHTMLElement<HTMLPreElement> | BetterHTMLElement<HTMLScriptElement> | BetterHTMLElement<HTMLSelectElement> | BetterHTMLElement<HTMLSlotElement> | BetterHTMLElement<HTMLSourceElement> | BetterHTMLElement<HTMLSpanElement> | BetterHTMLElement<HTMLStyleElement> | BetterHTMLElement<HTMLTableElement> | BetterHTMLElement<HTMLTableSectionElement> | BetterHTMLElement<HTMLTableDataCellElement> | BetterHTMLElement<HTMLTemplateElement> | BetterHTMLElement<HTMLTextAreaElement> | BetterHTMLElement<HTMLTableHeaderCellElement> | BetterHTMLElement<HTMLTimeElement> | BetterHTMLElement<HTMLTableRowElement> | BetterHTMLElement<HTMLUListElement> | BetterHTMLElement<HTMLVideoElement>;
    NavigationButtons: VisualBHE<HTMLElement> & {
        exit: BetterHTMLElement<HTMLElement>;
        minimize: BetterHTMLElement<HTMLElement>;
    };
    hide: typeof hide;
    display: typeof display;
};
export default _default;
