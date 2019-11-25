import { Button, button, div, Div, elem, Input, input } from "./index";

class InputAndSubmitContainer extends Div {
    submitButton: Button;
    inputElem: Input;
    
    constructor({ placeholder }) {
        super({ cls : 'input-and-submit-container' });
        const inputElem = input({ placeholder });
        const submitButton = button({ cls : 'inactive', html : 'Submit' });
        this.cacheAppend({ inputElem, submitButton });
    }
}

export class InputSection extends Div {
    inputAndSubmitContainer: InputAndSubmitContainer;
    
    constructor({ placeholder, h3text }) {
        super({ cls : 'input-section' });
        const inputAndSubmitContainer = new InputAndSubmitContainer({ placeholder });
        const subtitle = elem({ tag : 'h3', text : h3text });
        this.cacheAppend({ subtitle, inputAndSubmitContainer });
    }
}
