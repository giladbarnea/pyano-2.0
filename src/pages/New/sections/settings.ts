// *  pages/New/sections/settings

/**
 * import sections from "./sections"
 * sections.settings*/
import { elem, Div } from "../../../bhe";

import { InputSection } from "../../../bhe/extra";
import Glob from "../../../Glob";
import * as fs from "fs";

import MyAlert from '../../../MyAlert'
import myfs from "../../../MyFs";
import { ExperimentType } from "../../../MyStore";

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
        fileSubmit.click(async (ev: MouseEvent) => {
            const file = fileInput.value;
            console.log('file submit,', file);
            const [ basename, ext ] = myfs.split_ext(file);
            if ( ![ '.exam', '.test' ].includes(ext) ) {
                fileInput.addClass('invalid');
                MyAlert.small.warning('File name must end with either .exam or .test');
                return;
            } else {
                fileInput.removeClass('invalid');
            }
            const fileLower = file.lower();
            if ( subconfigFile.lower() === fileLower ) {
                MyAlert.small.info(`${subconfigFile} was already the chosen file`)
            } else {
                let overwrite;
                for ( let cfg of configs ) {
                    if ( cfg.lower() === fileLower ) {
                        const { value } = await MyAlert.big.blocking({ title : `Are you sure you want to overwrite ${cfg}?` });
                        if ( value ) {
                            overwrite = cfg;
                            break;
                        } else {
                            return MyAlert.small.info('Not overwriting');
                        }
                        
                    }
                }
                if ( overwrite === undefined ) {
                    Glob.BigConfig.experiment_type = ext.slice(1) as ExperimentType;
                }
                
                // subconfig.subject = value;
                // MyAlert.small.success(`Config set: ${file}.`);
                // fileInput.placeholder = `Current: ${file}`;
                
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

