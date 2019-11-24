// *  pages/New/sections/settings

/**
 * import sections from "./sections"
 * sections.settings*/
import { div, elem, button, Div, Button } from "../../../bhe";

class SettingsDiv extends Div {
    
    
    constructor({ id }) {
        super({ id });
        /*this.cacheAppend({
         addLevelBtn : button({ cls : 'active', html : 'Add Level', click : this.addLevel }),
         
         })*/
    }
    
    
}

const settingsDiv = new SettingsDiv({ id : 'settings_div' });
export default settingsDiv;

