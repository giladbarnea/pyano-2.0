// *  pages/New/sections/subject

/**
 * import sections from "./sections"
 * sections.subject*/
import { div, elem, button, span, Div, Button, Span } from "../../../bhe";

class Input extends Div {
    editable: Span;
    
    constructor() {
        super({ cls : 'input' });
        const editable = span({ cls : 'editable' })
            .attr({ contenteditable : true })
            .on({ input : (ev: InputEvent) => this.autoComplete(ev) });
        this
            .attr({ contenteditable : true })
            .click(() => this.editable.focus())
            .on({ keydown : (e: KeyboardEvent) => this.onKeyDown(e) })
            .cacheAppend({
                editable,
                autocomplete : span({ cls : 'autocomplete', text : 'Subject Id' })
            });
    }
    
    private autoComplete(ev: InputEvent) {
        console.log('autoComplete', ev);
    }
    
    private onKeyDown(e: KeyboardEvent) {
        console.log('onKeyDown', e);
    }
}


class SubjectDiv extends Div {
    input: Input;
    
    
    constructor({ id }) {
        super({ id });
        
        const input = new Input();
        this.cacheAppend({ input })
    }
    
    
}

const subjectDiv = new SubjectDiv({ id : 'subject_div' });
export default subjectDiv;

