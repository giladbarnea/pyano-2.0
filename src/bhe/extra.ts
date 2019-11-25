import { Button, button, div, Div, elem, Input, input } from "./index";
import * as fs from "fs";
import * as Suggestions from 'suggestions'

class InputAndSubmitFlex extends Div {
    submitButton: Button;
    inputElem: Input;
    
    constructor({ placeholder, suggestions }) {
        super({ cls : 'input-and-submit-flex' });
        const uppercase = /[A-Z]/;
        const illegal = /[^(a-z0-9|_)]/;
        const inputElem = input({ placeholder })
            .on({
                change : (ev: Event) => {
                    this.toggleSubmitButtonOnInput();
                }, input : (ev: InputEvent) => {
                    this.toggleSubmitButtonOnInput();
                },
                keydown : (ev: KeyboardEvent) => {
                    console.log('keydown', ev);
                    if ( ev.ctrlKey || ev.altKey || ev.key.length > 1 ) {
                        return;
                    }
                    if ( ev.key.match(uppercase) ) {
                        ev.preventDefault();
                        this.inputElem.e.value += ev.key.toLowerCase();
                    } else if ( [ ' ', ',', '-', ].includes(ev.key) ) {
                        ev.preventDefault();
                        this.inputElem.e.value += '_';
                    } else if ( ev.key.match(illegal) ) {
                        ev.preventDefault();
                        
                    }
                    
                },
                
            });
        const submitButton = button({ cls : 'inactive', html : 'Submit' });
        
        this.cacheAppend({ inputElem, submitButton });
        const fileSuggestions = new Suggestions(inputElem.e, suggestions, {
            limit : 2,
            minLength : 1,
        });
    }
    
    toggleSubmitButtonOnInput() {
        if ( this.inputElem.e.value ) {
            this.submitButton.replaceClass('inactive', 'active')
        } else {
            this.submitButton.replaceClass('active', 'inactive')
            
        }
    }
}

export class InputSection extends Div {
    inputAndSubmitFlex: InputAndSubmitFlex;
    
    constructor({ placeholder, h3text, suggestions }) {
        super({ cls : 'input-section' });
        const inputAndSubmitFlex = new InputAndSubmitFlex({ placeholder, suggestions });
        const subtitle = elem({ tag : 'h3', text : h3text });
        this.cacheAppend({ subtitle, inputAndSubmitFlex });
    }
}
