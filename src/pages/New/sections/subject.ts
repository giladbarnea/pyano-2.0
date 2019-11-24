// *  pages/New/sections/subject

/**
 * import sections from "./sections"
 * sections.subject*/
import { elem, button, span, Div, Button, Span } from "../../../bhe";
import { bool } from "../../../util";
import Glob from '../../../Glob'
import { remote } from "electron";

class Input extends Div {
    editable: Span;
    autocomplete: Span;
    
    constructor() {
        super({ cls : 'input' });
        const editable = span({ cls : 'editable' });
        const autocomplete = span({ cls : 'autocomplete', text : 'Subject Id' });
        
        this
            .attr({ contenteditable : true })
            .on({
                keydown : (ev: KeyboardEvent) => this.doAutocomplete(ev),
                focus : (ev: FocusEvent) => {
                    console.log('input focus');
                    this.sendEnd();
                    remote.getCurrentWindow().webContents.sendInputEvent({
                        type : "keyDown",
                        keyCode : 'Home',
                        modifiers : [ 'shift' ]
                    })
                },
                
            })
            .cacheAppend({
                editable,
                autocomplete
            });
    }
    
    private reset() {
        this.editable.text('');
        this.autocomplete
            .text('Subject Id')
            .removeAttr('hidden');
        submitButton
            .removeClass('active')
            .addClass('inactive')
            .html('Submit')
    }
    
    private setText(newText: string) {
        this.autocomplete.attr({ hidden : true });
        this.editable.text(newText);
        submitButton
            .removeClass('inactive')
            .addClass('active')
            .html(newText)
    }
    
    private sendEnd() {
        remote.getCurrentWindow().webContents.sendInputEvent({
            type : "keyDown",
            keyCode : 'End',
            modifiers : []
        })
    }
    
    private doAutocomplete(ev: KeyboardEvent) {
        console.log('\ndoAutocomplete', ev);
        if ( ev.ctrlKey || [ 'Backspace', 'Home', 'End', 'Delete' ].includes(ev.key) || ev.key.includes('Arrow') ) {
            
            if ( ev.key === 'Backspace' ) {
                console.log(`Backspace, returning. editable text len: ${this.editable.text().length}, autocomplete text len: ${this.autocomplete.text().length}
                activeElement: ${document.activeElement.className}`, ev);
                
                const oldText = this.editable.text();
                if ( oldText.length === 0 ) {
                    console.warn('oldText.length === 0, preventDefault, "Subject Id" and return');
                    this.reset();
                    return ev.preventDefault();
                }
                const newText = oldText.slice(0, oldText.length - 1);
                if ( ev.ctrlKey || !bool(newText) ) {
                    console.warn('!bool(newText) || ctrlKey, editable(""), preventDefault, "Subject Id" and return');
                    this.reset();
                    return ev.preventDefault();
                }
                this.setText(newText);
                this.sendEnd();
                
                
            } else { // Arrow, bare Control etc
                console.log('Functional, returning', ev);
            }
            return;
        }
        
        ev.preventDefault();
        if ( ev.key === 'Tab' ) {
            let oldText = this.editable.text();
            if ( this.autocomplete.attr('hidden') || !bool(oldText) ) {
                return;
            }
            this.setText(oldText + this.autocomplete.text());
            this.sendEnd();
            return;
        }
        const illegal = /[^(a-z0-9|_)]/;
        if ( ev.key.match(illegal) ) {
            console.log('Matched [^(a-z0-9|_)], returning', ev);
            return;
        }
        
        
        const oldText = this.editable.text().lower().removeAll(illegal);
        let newText;
        if ( bool(oldText) )
            newText = oldText.toLowerCase() + ev.key;
        else
            newText = ev.key;
        this.setText(newText);
        // this.editable.text(newText);
        
        
        const subjectSuggestion = subjects.find(s => s.startsWith(newText));
        
        this.removeClass('input-missing');
        /*submitButton
         .removeClass('inactive')
         .addClass('active')
         .html(newText);*/
        
        if ( subjectSuggestion ) {
            this.autocomplete
                .text(subjectSuggestion.substr(newText.length))
                .removeAttr('hidden');
            console.warn('changed autocomplete');
            
        } else if ( this.autocomplete.text() ) {
            // this.autocomplete.html('');
            this.autocomplete.attr({ hidden : true });
            console.warn('hide autocomplete');
        }
        this.sendEnd();
        console.log({ newText, subjectSuggestion, 'this.autocomplete.text()' : this.autocomplete.text() });
        
        console.log('\n');
    }
    
}


class SubjectDiv extends Div {
    input: Input;
    submitButton: Button;
    subtitle: Div;
    
    constructor({ id }) {
        super({ id });
        
        const input = new Input();
        const subtitle = elem({ tag : 'h2', text : 'Subject' });
        this.cacheAppend({ subtitle, input })
    }
    
    
}

const subjectDiv = new SubjectDiv({ id : 'subject_div' });
const subjects = Glob.BigConfig.subjects;
const submitButton = button({ cls : 'inactive', html : 'Submit' });
subjectDiv.cacheAppend({ submitButton });
// .addClass('inactive-btn')
// .html('Submit')
// .click(onSubmitSubjectClick);
export default subjectDiv;

