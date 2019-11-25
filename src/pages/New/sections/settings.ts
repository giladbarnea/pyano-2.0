// *  pages/New/sections/settings

/**
 * import sections from "./sections"
 * sections.settings*/
import { elem, Div } from "../../../bhe";

import { InputSection } from "../../../bhe/extra";
import Glob from "../../../Glob";
import * as fs from "fs";
import MyAlert from '../../../MyAlert'

// ***  FILE


class SettingsDiv extends Div {
    fileSection: InputSection;
    
    constructor({ id }) {
        super({ id });
        const experimentType = Glob.BigConfig.experiment_type;
        const subconfigFile = Glob.BigConfig[`${experimentType}_file`];
        
        const configs = fs.readdirSync(CONFIGS_PATH_ABS);
        const fileSection = new InputSection({
            placeholder : `Current: ${subconfigFile}`,
            h3text : 'Config File',
            suggestions : configs,
            overwriteWarn : true
        });
        
        
        const subjects = Glob.BigConfig.subjects;
        const subconfig = Glob.BigConfig[experimentType];
        const currentSubject = subconfig.subject;
        const subjectSection = new InputSection({
            placeholder : `Current: ${currentSubject}`,
            h3text : 'Subject',
            suggestions : subjects
        });
        const { submitButton : subjectSubmit, inputElem : subjectInput } = subjectSection.inputAndSubmitFlex;
        subjectSubmit.click((ev: MouseEvent) => {
            console.log('subject submit,', ev);
            const value = subjectInput.value;
            if ( currentSubject === value ) {
                console.log('NOTHING CHANGED');
                MyAlert.small.info(`${currentSubject} was already the chosen subject`)
            } else {
                subconfig.subject = value;
                MyAlert.small.success(`Subject set: ${value}.`);
                subjectInput.placeholder = `Current: ${value}`;
                
            }
            subjectSubmit.replaceClass('active', 'inactive');
            subjectInput.value = '';
            
            
        });
        const subtitle = elem({ tag : 'h2', text : 'Settings' });
        this.cacheAppend({ subtitle, fileSection, subjectSection })
        /*this.cacheAppend({
         addLevelBtn : button({ cls : 'active', html : 'Add Level', click : this.addLevel }),
         
         })*/
    }
    
    
}


const settingsDiv = new SettingsDiv({ id : 'settings_div' });
export default settingsDiv;

