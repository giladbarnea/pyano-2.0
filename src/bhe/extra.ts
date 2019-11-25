import { Button, button, div, Div, elem, Input, input } from "./index";

class InputAndSubmitFlex extends Div {
    submitButton: Button;
    inputElem: Input;
    
    constructor({ placeholder }) {
        super({ cls : 'input-and-submit-flex' });
        const uppercase = /[A-Z]/;
        const illegal = /[^(a-z0-9|_)]/;
        const inputElem = input({ placeholder })
            .on({
                change : (ev: Event) => {
                    console.log('change', ev);
                    this.toggleSubmitButtonOnInput();
                }, input : (ev: InputEvent) => {
                    console.log('input', ev);
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
    }
    
    toggleSubmitButtonOnInput() {
    
    }
}

export class InputSection extends Div {
    inputAndSubmitFlex: InputAndSubmitFlex;
    
    constructor({ placeholder, h3text }) {
        super({ cls : 'input-section' });
        const inputAndSubmitFlex = new InputAndSubmitFlex({ placeholder });
        const subtitle = elem({ tag : 'h3', text : h3text });
        this.cacheAppend({ subtitle, inputAndSubmitFlex });
    }
}
