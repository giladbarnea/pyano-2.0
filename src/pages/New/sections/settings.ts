// *  pages/New/sections/settings

/**
 * import sections from "./sections"
 * sections.settings*/
import { elem, Div } from "../../../bhe";

import { InputSection } from "../../../bhe/extra";
import Glob from "../../../Glob";
import * as fs from "fs";
import * as path from "path";
import MyAlert from '../../../MyAlert'
import myfs from "../../../MyFs";

class SettingsDiv extends Div {
    fileSection: InputSection;
    
    constructor({ id }) {
        super({ id });
        // ***  File
        const experimentType = Glob.BigConfig.experiment_type;
        const subconfigFile = Glob.BigConfig[`${experimentType}_file`];
        
        const configs = fs.readdirSync(CONFIGS_PATH_ABS);
        const fileSection = new InputSection({
            placeholder : `Current: ${subconfigFile}`,
            h3text : 'Config File',
            suggestions : configs,
            overwriteWarn : true
        });
        
        const { submitButton : fileSubmit, inputElem : fileInput } = fileSection.inputAndSubmitFlex;
        fileSubmit.click((ev: MouseEvent) => {
            const value = fileInput.value;
            console.log('file submit,', value);
            const [ basename, ext ] = myfs.split_ext(value);
            if ( ![ '.exam', '.test' ].includes(ext) ) {
                fileInput.addClass('invalid');
                MyAlert.small.warning('File name must end with either .exam or .test');
                return;
            } else {
                fileInput.removeClass('invalid');
            }
            if ( subconfigFile === value ) {
                MyAlert.small.info(`${subconfigFile} was already the chosen file`)
            } else {
                
                
                // subconfig.subject = value;
                MyAlert.small.success(`Config set: ${value}.`);
                fileInput.placeholder = `Current: ${value}`;
                
            }
            fileSubmit.replaceClass('active', 'inactive');
            fileInput.value = '';
            
            
        });
        // ***  Subject
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

