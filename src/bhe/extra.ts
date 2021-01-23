// import { BetterHTMLElement, Button, button, div, Div, elem, Input, input } from "./index";

import * as Suggestions from 'suggestions'
import { BetterHTMLElement, button, Button, Div, elem, TextInput, ChildrenObj, Element2Tag, QuerySelector, Tag } from ".";

interface InputAndSubmitFlexOptions {
    placeholder: string,
    suggestions: string[],
    illegalRegex?: RegExp
}

class InputAndSubmitFlex extends Div {
    submit: Button;
    input: TextInput;
    private readonly _suggestions: string[];

    constructor(options: InputAndSubmitFlexOptions) {
        super({ cls: 'input-and-submit-flex' });
        const { placeholder, suggestions, illegalRegex } = options;

        const illegal = illegalRegex ?? /[^(a-z0-9A-Z|_.)]/;
        this._suggestions = suggestions;
        const inputElem = new TextInput({ placeholder })
            .on({
                change: (ev: Event) => {
                    this.toggleSubmitButtonOnInput();
                }, input: (ev: InputEvent) => {
                    this.toggleSubmitButtonOnInput();
                },
                keydown: (ev: KeyboardEvent) => {
                    if (ev.ctrlKey || ev.altKey || ev.key.length > 1) {
                        return;
                    }

                    if ([' ', ',', '-',].includes(ev.key)) {
                        ev.preventDefault();
                        this.input.value(this.input.value() + '_');
                    } else if (ev.key.match(illegal)) {
                        ev.preventDefault();

                    }

                },

            });
        const submit = button({ cls: 'submit inactive' });

        this.cacheAppend({ input: inputElem, submit });
        new Suggestions(inputElem.e, suggestions, {
            limit: 2,
            minLength: 0,
        });
    }

    toggleSubmitButtonOnInput() {
        const inputOk = !!this.input.value;
        this.submit
            .toggleClass('active', inputOk)
            .toggleClass('inactive', !inputOk);
        if (inputOk) {
            this.input.removeClass('invalid')
        }
        /*if ( this._overwriteWarn && inputOk ) {
         this.submit.toggleClass('warn', this._suggestions.lowerAll().includes(this.inputElem.value.lower()));
         }*/

    }
}

interface InputSectionOptions {
    h3text: string,
    placeholder: string,
    suggestions: string[],
    illegalRegex?: RegExp
}

export class InputSection extends Div {
    flex: InputAndSubmitFlex;

    constructor(options: InputSectionOptions) {
        super({ cls: 'input-section' });
        const { h3text, placeholder, suggestions, illegalRegex } = options;
        const flex = new InputAndSubmitFlex({
            placeholder,
            suggestions,
            illegalRegex
        });
        const subtitle = elem({ tag: 'h3', html: h3text });
        this.cacheAppend({ subtitle, flex });
    }
}

/**Provides functionality for visual control, i.e "fade", "display", "hide"...*/
export class VisualBHE<Generic extends HTMLElement = HTMLElement> extends BetterHTMLElement<Generic> {
    protected _opacTransDur: number;
    protected _computedStyle: CSSStyleDeclaration = undefined;

    constructor({ tag, cls, setid, html }: { tag: Element2Tag<Generic>, cls?: string, setid?: string, html?: string });
    /**Wrap an existing element by `byid`. Optionally cache existing `children`*/
    constructor({ byid, children }: { byid: string, children?: ChildrenObj });
    /**Wrap an existing element by `query`. Optionally cache existing `children`*/
    constructor({ query, children }: { query: QuerySelector, children?: ChildrenObj });
    /**Wrap an existing HTMLElement. Optionally cache existing `children`*/
    constructor({ htmlElement, children }: { htmlElement: Generic; children?: ChildrenObj });
    constructor(options) {
        super(options);
        this.setOpacTransDur();
    }


    // **  Opacity Transition
    setOpacTransDur(): this {
        this._opacTransDur = this.getOpacityTransitionDuration();
        return this;
    }

    // **  Fade
    async fade(dur: number, to: 0 | 1): Promise<this> {
        const styles = window.getComputedStyle(this.e);
        const transProp = styles.transitionProperty.split(', ');
        const indexOfOpacity = transProp.indexOf('opacity');
        // css opacity:0 => transDur[indexOfOpacity]: 0s
        // css opacity:500ms => transDur[indexOfOpacity]: 0.5s
        // css NO opacity => transDur[indexOfOpacity]: undefined
        if (indexOfOpacity !== -1) {
            const transDur = styles.transitionDuration.split(', ');
            const opacityTransDur = transDur[indexOfOpacity];
            const trans = styles.transition.split(', ');
            // transition: opacity was defined in css.
            // set transition to dur, set opacity to 0, leave the animation to native transition, wait dur and return this
            console.warn(`fade(${dur}, ${to}), opacityTransDur !== undefined. nullifying transition. SHOULD NOT WORK`);
            console.log(`trans:\t${trans}\ntransProp:\t${transProp}\nindexOfOpacity:\t${indexOfOpacity}\nopacityTransDur:\t${opacityTransDur}`);
            // trans.splice(indexOfOpacity, 1, `opacity ${dur / 1000}s`);
            trans.splice(indexOfOpacity, 1, `opacity 0s`);
            console.log(`after, trans: ${trans}`);
            this.e.style.transition = trans.join(', ');
            this.css({ opacity: to });
            await util.wait(dur);
            return this;
        }
        // transition: opacity was NOT defined in css.
        if (dur == 0) {
            return this.css({ opacity: to });
        }
        const isFadeOut = to === 0;
        let opacity = parseFloat(this.e.style.opacity);

        if (opacity === undefined || isNaN(opacity)) {
            console.warn(`fade(${dur}, ${to}) htmlElement has NO opacity at all. recursing`, {
                opacity,
                this: this
            });
            return this.css({ opacity: Math.abs(1 - to) }).fade(dur, to)
        } else {

            if (isFadeOut ? opacity <= 0 : opacity > 1) {
                console.warn(`fade(${dur}, ${to}) opacity was beyond target opacity. returning this as is.`, {
                    opacity,
                    this: this
                });
                return this;
            }
        }

        let steps = 30;
        let opStep = 1 / steps;
        let everyms = dur / steps;
        if (everyms < 1) {
            everyms = 1;
            steps = dur;
            opStep = 1 / steps;
        }
        console.log(`fade(${dur}, ${to}) had opacity, no transition. (good) opacity: ${opacity}`, {
            steps,
            opStep,
            everyms
        });
        const reachedTo = isFadeOut ? (op) => op - opStep > 0 : (op) => op + opStep < 1;
        const interval = setInterval(() => {
            if (reachedTo(opacity)) {
                if (isFadeOut === true)
                    opacity -= opStep;
                else
                    opacity += opStep;
                this.css({ opacity });
            } else {
                opacity = to;
                this.css({ opacity });
                clearInterval(interval);
            }
        }, everyms);
        await util.wait(dur);
        return this;
    }

    async fadeOut(dur: number): Promise<this> {
        return await this.fade(dur, 0);
    }

    async fadeIn(dur: number): Promise<this> {
        return await this.fade(dur, 1);
    }

    // **  Visual Controls
    async display() {
        this.addClass('active');
        return await util.wait(this._opacTransDur, false);
    }

    async hide() {
        this.removeClass('active');
        return await util.wait(this._opacTransDur, false);
    }

    protected getOpacityTransitionDuration(): number {
        if (!this._computedStyle) {
            this._computedStyle = getComputedStyle(this.e);
        }

        const { transitionProperty, transitionDuration } = this._computedStyle;
        const transProp = transitionProperty.split(', ');
        const indexOfOpacity = transProp.indexOf('opacity');
        if (indexOfOpacity !== -1) {
            const transDur = transitionDuration.split(', ');
            const opacityTransDur = transDur[indexOfOpacity];
            if (opacityTransDur.includes('m')) {
                return parseInt(opacityTransDur)
            } else {
                return parseFloat(opacityTransDur) * 1000
            }
        }
        // console.warn(`getOpacityTransitionDuration() returning undefined`);
        return undefined;
    }


}

export function visualbhe<Generic extends HTMLElement = HTMLElement>({ tag, cls, setid, html }: { tag: Element2Tag<Generic>, cls?: string, setid?: string, html?: string }):
    VisualBHE<Generic>;
export function visualbhe<Generic extends HTMLElement = HTMLElement>({ byid, children }: { byid: string, children?: ChildrenObj }):
    VisualBHE<Generic>;
export function visualbhe<Generic extends HTMLElement = HTMLElement>({ query, children }: { query: QuerySelector, children?: ChildrenObj }):
    VisualBHE<Generic>;
export function visualbhe<Generic extends HTMLElement = HTMLElement>({ htmlElement, children }: { htmlElement: Generic; children?: ChildrenObj }):
    VisualBHE<Generic>;
export function visualbhe<Generic extends HTMLElement = HTMLElement>(options): VisualBHE<Generic> {
    return new VisualBHE<Generic>(options)
}