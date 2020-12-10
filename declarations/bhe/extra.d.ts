import { BetterHTMLElement, Button, Div, TextInput, ChildrenObj, Element2Tag, QuerySelector, Tag } from ".";
interface InputAndSubmitFlexOptions {
    placeholder: string;
    suggestions: string[];
    illegalRegex?: RegExp;
}
declare class InputAndSubmitFlex extends Div {
    submit: Button;
    input: TextInput;
    private readonly _suggestions;
    constructor(options: InputAndSubmitFlexOptions);
    toggleSubmitButtonOnInput(): void;
}
interface InputSectionOptions {
    h3text: string;
    placeholder: string;
    suggestions: string[];
    illegalRegex?: RegExp;
}
export declare class InputSection extends Div {
    flex: InputAndSubmitFlex;
    constructor(options: InputSectionOptions);
}
export declare class VisualBHE<Generic extends HTMLElement = HTMLElement> extends BetterHTMLElement {
    protected _opacTransDur: number;
    protected _computedStyle: CSSStyleDeclaration;
    constructor({ tag, cls, setid, html }: {
        tag: Element2Tag<Generic>;
        cls?: string;
        setid?: string;
        html?: string;
    });
    /**Wrap an existing element by `byid`. Optionally cache existing `children`*/
    constructor({ byid, children }: {
        byid: string;
        children?: ChildrenObj;
    });
    /**Wrap an existing element by `query`. Optionally cache existing `children`*/
    constructor({ query, children }: {
        query: QuerySelector;
        children?: ChildrenObj;
    });
    /**Wrap an existing HTMLElement. Optionally cache existing `children`*/
    constructor({ htmlElement, children }: {
        htmlElement: Generic;
        children?: ChildrenObj;
    });
    setOpacTransDur(): this;
    fade(dur: number, to: 0 | 1): Promise<this>;
    fadeOut(dur: number): Promise<this>;
    fadeIn(dur: number): Promise<this>;
    display(): Promise<any>;
    hide(): Promise<any>;
    protected getOpacityTransitionDuration(): number;
}
export declare function visualbhe<T extends Tag>({ tag, cls, setid, html }: {
    tag: T;
    cls?: string;
    setid?: string;
    html?: string;
}): T extends Tag ? VisualBHE<HTMLElementTagNameMap[T]> : never;
export declare function visualbhe({ byid, children }: {
    byid: string;
    children?: ChildrenObj;
}): VisualBHE;
export declare function visualbhe<Q extends QuerySelector>({ query, children }: {
    query: Q;
    children?: ChildrenObj;
}): Q extends Tag ? VisualBHE<HTMLElementTagNameMap[Q]> : VisualBHE;
export declare function visualbhe<E extends HTMLElement>({ htmlElement, children }: {
    htmlElement: E;
    children?: ChildrenObj;
}): VisualBHE<E>;
export {};
