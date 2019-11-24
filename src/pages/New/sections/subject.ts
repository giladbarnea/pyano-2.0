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
        const editable = span({ cls : 'editable' });
        // .attr({ contenteditable : true });
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
                autocomplete : span({ cls : 'autocomplete', text : 'Subject Id' }).on({
                    focus : () => {
                        console.log('autocomplete focus')
                    },
                    change : (ev: KeyboardEvent) => {
                        console.log('autocomplete change')
                    },
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
                    this.autocomplete
                        .text('Subject Id')
                        .removeAttr('hidden');
                    return ev.preventDefault();
                }
                // this.autocomplete.text('');
                this.autocomplete.attr({ hidden : true });
                const newText = oldText.slice(0, oldText.length - 1);
                if ( ev.ctrlKey || !bool(newText) ) {
                    console.warn('!bool(newText) || ctrlKey, editable(""), preventDefault, "Subject Id" and return');
                    this.editable.text('');
                    this.autocomplete
                        .text('Subject Id')
                        .removeAttr('hidden');
                    return ev.preventDefault();
                }
                this.editable.text(newText);
                // console.warn('Backspace, changed editable');
                this.sendEnd();
                // if ( this.autocomplete.text().length <= 1 ) {
                //     this.autocomplete.text('Subject Id');
                //     ev.preventDefault();
                //     return;
                // }
                
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
            this.editable.text(oldText + this.autocomplete.text());
            // this.autocomplete.text('');
            this.autocomplete.attr({ hidden : true });
            this.sendEnd();
            return;
        }
        const illegal = /[^(a-z0-9|_)]/;
        if ( ev.key.match(illegal) ) {
            console.log('Matched [^(a-z0-9|_)], returning', ev);
            return;
        }
        /*if ( ev.key === 'a' && ev.ctrlKey ) {
         remote.getCurrentWindow().webContents.sendInputEvent({
         type : "keyDown",
         keyCode : 'Home',
         modifiers : [ "shift" ]
         })
         }*/
        
        
        const oldText = this.editable.text().lower().removeAll(illegal);
        let txt;
        if ( bool(oldText) )
            txt = oldText.toLowerCase() + ev.key;
        else
            txt = ev.key;
        this.editable.text(txt);
        // console.log({ 'this.editable.text()' : this.editable.text(), txt });
        
        // if ( !bool(editableText) ) {
        //     return this.reset({ inputMissing : true });
        // }
        
        // autocomplete
        
        const subjectSuggestion = subjects.find(s => s.startsWith(txt));
        
        this.removeClass('input-missing');
        /*$submitSubjectBtn
         .removeClass('inactive-btn')
         .addClass('active-btn')
         .html(editableText);*/
        // this.editable.text(editableText);
        if ( subjectSuggestion ) {
            this.autocomplete
                .text(subjectSuggestion.substr(txt.length))
                .removeAttr('hidden');
            console.warn('changed autocomplete');
            this.sendEnd()
            
        } else {
            if ( this.autocomplete.text() ) {
                // this.autocomplete.html('');
                this.autocomplete.attr({ hidden : true });
                console.warn('hide autocomplete');
            }
            this.sendEnd()
            
        }
        console.log({ txt, subjectSuggestion, 'this.autocomplete.text()' : this.autocomplete.text() });
        // this.autocomplete
        //     .text(subjectSuggestion ? subjectSuggestion.substr(editableText.length) : '');
        // MyAlert.close();
        console.log('\n');
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

