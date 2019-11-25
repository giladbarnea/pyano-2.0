// *  pages/New/sections/settings

/**
 * import sections from "./sections"
 * sections.settings*/
import { elem, Div } from "../../../bhe";
import * as Suggestions from 'suggestions'
import { InputSection } from "../../../bhe/extra";
import Glob from "../../../Glob";
import * as fs from "fs";

// ***  FILE


class SettingsDiv extends Div {
    fileSection: InputSection;
    
    constructor({ id }) {
        super({ id });
        const experimentType = Glob.BigConfig.experiment_type;
        const subconfigFile = Glob.BigConfig[`${experimentType}_file`];
        const fileSection = new InputSection({
            placeholder : `Current: ${subconfigFile}`,
            h3text : 'Config File',
            suggestions : fs.readdirSync(CONFIGS_PATH_ABS)
        });
        
        
        const subjectSection = new InputSection({
            placeholder : 'Subject id',
            h3text : 'Subject',
            suggestions : Glob.BigConfig.subjects
        });
        // new Suggestions(subjectSection.inputAndSubmitFlex.inputElem.e, Glob.BigConfig.subjects, { minLength : 1 });
        const subtitle = elem({ tag : 'h2', text : 'Settings' });
        this.cacheAppend({ subtitle, fileSection, subjectSection })
        /*this.cacheAppend({
         addLevelBtn : button({ cls : 'active', html : 'Add Level', click : this.addLevel }),
         
         })*/
    }
    
    
}


const settingsDiv = new SettingsDiv({ id : 'settings_div' });
export default settingsDiv;

