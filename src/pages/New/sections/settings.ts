// *  pages/New/sections/settings

/**
 * import sections from "./sections"
 * sections.settings*/
import { div, elem, button, Div, Button, Span, span } from "../../../bhe";
import { remote } from "electron";
import { bool } from "../../../util";

class Input extends Div {
    editable: Span;
    
    constructor() {
        super({ cls : 'input' });
        const editable = span({ cls : 'editable' });
        
        this
            .attr({ contenteditable : true })
            /*.on({
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
             
             })*/
            .cacheAppend({
                editable,
            });
    }
    
    
}

class SettingsDiv extends Div {
    
    
    constructor({ id }) {
        super({ id });
        const input = new Input();
        const subtitle = elem({ tag : 'h2', text : 'Settings' });
        this.cacheAppend({ subtitle, input })
        /*this.cacheAppend({
         addLevelBtn : button({ cls : 'active', html : 'Add Level', click : this.addLevel }),
         
         })*/
    }
    
    
}

const settingsDiv = new SettingsDiv({ id : 'settings_div' });
export default settingsDiv;

