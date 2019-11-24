// *  pages/New/sections/subject

/**
 * import sections from "./sections"
 * sections.subject*/
import { div, elem, button, span, Div, Button, Span } from "../../../bhe";
import { bool } from "../../../util";
import MyAlert from '../../../MyAlert'
import Glob from '../../../Glob'
import { remote } from "electron";

class Input extends Div {
    editable: Span;
    autocomplete: Span;
    
    constructor() {
        super({ cls : 'input' });
        const editable = span({ cls : 'editable' })
            .attr({ contenteditable : true });
        /*.on({
         // input : (ev: InputEvent) => this.doAutocomplete(ev),
         // focus : (ev: FocusEvent) => {
         //     console.log('editable focus');
         // },
         // keydown : (ev: KeyboardEvent) => this.onKeyDown(ev),
         });*/
        this
            .attr({ contenteditable : true })
            // .focus(() => editable.focus())
            .on({
                keydown : (ev: KeyboardEvent) => this.doAutocomplete(ev),
                focus : (ev: FocusEvent) => {
                    console.log('input focus');
                },
                
            })
            .cacheAppend({
                editable,
                autocomplete : span({ cls : 'autocomplete', text : 'Subject Id' }).on({
                    focus : () => {
                        console.log('autocomplete focus')
                    }
                })
            });
    }
    
    private reset({ inputMissing }: { inputMissing: boolean }) {
        if ( inputMissing ) {
            this.addClass('input-missing');
        }
        
        
        /*$submitSubjectBtn
         .addClass('inactive-btn')
         .removeClass('active-btn')
         .html('Submit');*/
        
        this.autocomplete.text('Subject Id');
        this.editable.text('');
    }
    
    private doAutocomplete(ev: KeyboardEvent) {
        if ( ev.ctrlKey || [ 'Backspace', 'Home', 'End' ].includes(ev.key) || ev.key.includes('Arrow') ) {
            console.log('Functional, returning', ev);
            return;
        }
        
        ev.preventDefault();
        if ( ev.key.match(/^[A-Z]/) ) {
            console.log('Matched ^[A-Z], returning', ev);
            return;
        }
        if ( ev.key === 'a' && ev.ctrlKey ) {
            remote.getCurrentWindow().webContents.sendInputEvent({
                type : "keyDown",
                keyCode : 'Home',
                modifiers : [ "shift" ]
            })
        }
        
        console.log('doAutocomplete', ev);
        // let editableText = this.editable.text().toLowerCase();
        const txt = this.editable.text().toLowerCase() + ev.key;
        this.editable.text(txt);
        console.log({ 'this.editable.text()' : this.editable.text(), txt });
        
        // if ( !bool(editableText) ) {
        //     return this.reset({ inputMissing : true });
        // }
        
        // autocomplete
        
        const subjectSuggestion = subjects.find(s => s.startsWith(txt));
        console.log({ subjectSuggestion });
        this.removeClass('input-missing');
        /*$submitSubjectBtn
         .removeClass('inactive-btn')
         .addClass('active-btn')
         .html(editableText);*/
        // this.editable.text(editableText);
        if ( subjectSuggestion ) {
            this.autocomplete.text(subjectSuggestion.substr(editableText.length))
        } else {
            this.autocomplete.text('')
            
        }
        // this.autocomplete
        //     .text(subjectSuggestion ? subjectSuggestion.substr(editableText.length) : '');
        // MyAlert.close();
    }
    
    private onKeyDown(ev: KeyboardEvent) {
        console.log('onKeyDown', ev);
        if ( ev.key === 'Tab' ) {
            
            const value = this.editable.text() + this.autocomplete.text();
            this.editable.text(value);
            this.autocomplete.text('');
            // $submitSubjectBtn.html(value);
        }
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
const subjects = Glob.BigConfig.subjects;
export default subjectDiv;

