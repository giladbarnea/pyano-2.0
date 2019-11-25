import { Button, button, div, Div, elem, Input, input } from "./index";

import * as Suggestions from 'suggestions'

interface InputAndSubmitFlexOptions {
    placeholder: string,
    suggestions: string[],
    overwriteWarn?: boolean
}

class InputAndSubmitFlex extends Div {
    submitButton: Button;
    inputElem: Input;
    private readonly _overwriteWarn: boolean;
    private readonly _suggestions: string[];
    
    constructor(options: InputAndSubmitFlexOptions) {
        super({ cls : 'input-and-submit-flex' });
        const { placeholder, suggestions, overwriteWarn } = options;
        const uppercase = /[A-Z]/;
        const illegal = /[^(a-z0-9|_.)]/;
        this._overwriteWarn = overwriteWarn;
        this._suggestions = suggestions;
        const inputElem = input({ placeholder })
            .on({
                change : (ev: Event) => {
                    this.toggleSubmitButtonOnInput();
                }, input : (ev: InputEvent) => {
                    this.toggleSubmitButtonOnInput();
                },
                keydown : (ev: KeyboardEvent) => {
                    if ( ev.ctrlKey || ev.altKey || ev.key.length > 1 ) {
                        return;
                    }
                    if ( ev.key.match(uppercase) ) {
                        ev.preventDefault();
                        this.inputElem.value += ev.key.toLowerCase();
                    } else if ( [ ' ', ',', '-', ].includes(ev.key) ) {
                        ev.preventDefault();
                        this.inputElem.value += '_';
                    } else if ( ev.key.match(illegal) ) {
                        ev.preventDefault();
                        
                    }
                    
                },
                
            });
        const submitButton = button({ cls : 'inactive' });
        
        this.cacheAppend({ inputElem, submitButton });
        new Suggestions(inputElem.e, suggestions, {
            limit : 2,
            minLength : 1,
        });
    }
    
    toggleSubmitButtonOnInput() {
        const inputOk = !!this.inputElem.value;
        this.submitButton
            .toggleClass('active', inputOk)
            .toggleClass('inactive', !inputOk);
        if ( inputOk ) {
            this.inputElem.removeClass('invalid')
        }
        if ( this._overwriteWarn && inputOk ) {
            this.submitButton.toggleClass('warn', this._suggestions.includes(this.inputElem.value));
        }
        
    }
}

interface InputSectionOptions {
    h3text: string,
    placeholder: string,
    suggestions: string[],
    overwriteWarn?: boolean
}

export class InputSection extends Div {
    inputAndSubmitFlex: InputAndSubmitFlex;
    
    constructor(options: InputSectionOptions) {
        super({ cls : 'input-section' });
        const { h3text, placeholder, suggestions, overwriteWarn } = options;
        const inputAndSubmitFlex = new InputAndSubmitFlex({
            placeholder,
            suggestions,
            overwriteWarn : overwriteWarn ?? false
        });
        const subtitle = elem({ tag : 'h3', text : h3text });
        this.cacheAppend({ subtitle, inputAndSubmitFlex });
    }
}
