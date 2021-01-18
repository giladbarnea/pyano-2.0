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
    Document: BetterHTMLElement<HTMLElement> | BetterHTMLElement<HTMLSelectElement> | BetterHTMLElement<HTMLSpanElement> | BetterHTMLElement<HTMLButtonElement> | BetterHTMLElement<HTMLDivElement> | BetterHTMLElement<HTMLAnchorElement> | BetterHTMLElement<HTMLParagraphElement> | BetterHTMLElement<HTMLImageElement> | BetterHTMLElement<HTMLInputElement> | BetterHTMLElement<HTMLHeadingElement> | BetterHTMLElement<HTMLTitleElement> | BetterHTMLElement<HTMLDirectoryElement> | BetterHTMLElement<HTMLTableElement> | BetterHTMLElement<HTMLTimeElement> | BetterHTMLElement<HTMLTableHeaderCellElement> | BetterHTMLElement<HTMLProgressElement> | BetterHTMLElement<HTMLAppletElement> | BetterHTMLElement<HTMLAreaElement> | BetterHTMLElement<HTMLAudioElement> | BetterHTMLElement<HTMLBaseElement> | BetterHTMLElement<HTMLBaseFontElement> | BetterHTMLElement<HTMLQuoteElement> | BetterHTMLElement<HTMLBodyElement> | BetterHTMLElement<HTMLBRElement> | BetterHTMLElement<HTMLCanvasElement> | BetterHTMLElement<HTMLTableCaptionElement> | BetterHTMLElement<HTMLTableColElement> | BetterHTMLElement<HTMLDataElement> | BetterHTMLElement<HTMLDataListElement> | BetterHTMLElement<HTMLModElement> | BetterHTMLElement<HTMLDetailsElement> | BetterHTMLElement<HTMLDialogElement> | BetterHTMLElement<HTMLDListElement> | BetterHTMLElement<HTMLEmbedElement> | BetterHTMLElement<HTMLFieldSetElement> | BetterHTMLElement<HTMLFontElement> | BetterHTMLElement<HTMLFormElement> | BetterHTMLElement<HTMLFrameElement> | BetterHTMLElement<HTMLFrameSetElement> | BetterHTMLElement<HTMLHeadElement> | BetterHTMLElement<HTMLHRElement> | BetterHTMLElement<HTMLHtmlElement> | BetterHTMLElement<HTMLIFrameElement> | BetterHTMLElement<HTMLLabelElement> | BetterHTMLElement<HTMLLegendElement> | BetterHTMLElement<HTMLLIElement> | BetterHTMLElement<HTMLLinkElement> | BetterHTMLElement<HTMLMapElement> | BetterHTMLElement<HTMLMarqueeElement> | BetterHTMLElement<HTMLMenuElement> | BetterHTMLElement<HTMLMetaElement> | BetterHTMLElement<HTMLMeterElement> | BetterHTMLElement<HTMLOListElement> | BetterHTMLElement<HTMLOptGroupElement> | BetterHTMLElement<HTMLOptionElement> | BetterHTMLElement<HTMLOutputElement> | BetterHTMLElement<HTMLParamElement> | BetterHTMLElement<HTMLPictureElement> | BetterHTMLElement<HTMLPreElement> | BetterHTMLElement<HTMLScriptElement> | BetterHTMLElement<HTMLSlotElement> | BetterHTMLElement<HTMLSourceElement> | BetterHTMLElement<HTMLStyleElement> | BetterHTMLElement<HTMLTableSectionElement> | BetterHTMLElement<HTMLTableDataCellElement> | BetterHTMLElement<HTMLTemplateElement> | BetterHTMLElement<HTMLTextAreaElement> | BetterHTMLElement<HTMLTableRowElement> | BetterHTMLElement<HTMLTrackElement> | BetterHTMLElement<HTMLUListElement> | BetterHTMLElement<HTMLVideoElement>;
    NavigationButtons: VisualBHE<HTMLElement> & {
        exit: BetterHTMLElement<HTMLElement>;
        minimize: BetterHTMLElement<HTMLElement>;
    };
    hide: typeof hide;
    display: typeof display;
};
export default _default;
