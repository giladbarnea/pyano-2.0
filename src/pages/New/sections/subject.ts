// *  pages/New/sections/subject

/**
 * import sections from "./sections"
 * sections.subject*/
import { div, elem, button, Div, Button } from "../../../bhe";

class SubjectDiv extends Div {
    
    
    constructor({ id }) {
        super({ id });
        this.cacheAppend({
            input : div({ cls : 'input' }),
            
        })
    }
    
    
}

const subjectDiv = new SubjectDiv({ id : 'subject_div' });
export default subjectDiv;

