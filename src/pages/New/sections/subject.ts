// *  pages/New/sections/subject

/**
 * import sections from "./sections"
 * sections.subject*/
import { div, elem, button, span, Div, Button, Span } from "../../../bhe";

class SubjectDiv extends Div {
    
    
    constructor({ id }) {
        super({ id });
        this.cacheAppend({
            input : div({ cls : 'input' }).cacheAppend({
                editable : span({ cls : 'editable' }).attr({ contenteditable : true }),
                autocomplete : span({ cls : 'autocomplete', text : 'Subject Id' })
            }),
            
        })
    }
    
    
}

const subjectDiv = new SubjectDiv({ id : 'subject_div' });
export default subjectDiv;

