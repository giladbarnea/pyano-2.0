import { Button, button, div, Div, elem, Input, input } from "./index";

import * as Suggestions from 'suggestions'

interface InputAndSubmitFlexOptions {
    placeholder: string,
    suggestions: string[],
    illegalRegex?: RegExp
}

class InputAndSubmitFlex extends Div {
    submitButton: Button;
    inputElem: Input;
    private readonly _suggestions: string[];
    
    constructor(options: InputAndSubmitFlexOptions) {
        super({ cls : 'input-and-submit-flex' });
        const { placeholder, suggestions, illegalRegex } = options;
        
        const illegal = illegalRegex ?? /[^(a-z0-9A-Z|_.)]/;
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
                    
                    if ( [ ' ', ',', '-', ].includes(ev.key) ) {
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
            minLength : 0,
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
        /*if ( this._overwriteWarn && inputOk ) {
         this.submitButton.toggleClass('warn', this._suggestions.lowerAll().includes(this.inputElem.value.lower()));
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
    inputAndSubmitFlex: InputAndSubmitFlex;
    
    constructor(options: InputSectionOptions) {
        super({ cls : 'input-section' });
        const { h3text, placeholder, suggestions, illegalRegex } = options;
        const inputAndSubmitFlex = new InputAndSubmitFlex({
            placeholder,
            suggestions,
            illegalRegex
        });
        const subtitle = elem({ tag : 'h3', text : h3text });
        this.cacheAppend({ subtitle, inputAndSubmitFlex });
    }
}
