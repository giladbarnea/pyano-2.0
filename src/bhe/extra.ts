import { Button, button, div, Div, elem, Input, input } from "./index";

class InputAndSubmitFlex extends Div {
    submitButton: Button;
    inputElem: Input;
    
    constructor({ placeholder }) {
        super({ cls : 'input-and-submit-flex' });
        const inputElem = input({ placeholder });
        const submitButton = button({ cls : 'inactive', html : 'Submit' });
        this.cacheAppend({ inputElem, submitButton });
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
