// *  pages/New/sections/settings

/**
 * import sections from "./sections"
 * sections.settings*/
import { elem, Div, button, Input, Button } from "../../../bhe";

import { InputSection } from "../../../bhe/extra";
import Glob from "../../../Glob";
import * as fs from "fs";

import MyAlert from '../../../MyAlert'
import myfs from "../../../MyFs";
import * as util from "../../../util";
import { ExperimentType, Subconfig } from "../../../MyStore";

class SettingsDiv extends Div {
    fileSection: InputSection;
    private subjectSection: InputSection;
    
    constructor({ id }) {
        super({ id });
        // ***  File
        const experimentType = Glob.BigConfig.experiment_type;
        const subconfigFile: string = Glob.BigConfig[`${experimentType}_file`];
        const subconfig: Subconfig = Glob.BigConfig[experimentType];
        const configs: string[] = fs.readdirSync(CONFIGS_PATH_ABS);
        const fileSection = new InputSection({
            placeholder : `Current: ${subconfigFile}`,
            h3text : `Config File`,
            suggestions : configs,
            // overwriteWarn : true
        });
        
        const { submitButton : fileSubmit, inputElem : fileInput } = fileSection.inputAndSubmitFlex;
        fileSubmit.click(() => this.onFileSubmit(subconfigFile, configs, subconfig));
        
        // ***  Subject
        const subjects = Glob.BigConfig.subjects;
        
        const currentSubject = subconfig.subject;
        const subjectSection = new InputSection({
            placeholder : `Current: ${currentSubject}`,
            h3text : 'Subject',
            suggestions : subjects
        });
        const { submitButton : subjectSubmit, inputElem : subjectInput } = subjectSection.inputAndSubmitFlex;
        subjectSubmit.click(() => this.onSubjectSubmit(currentSubject, subconfig));
        
        
        const subtitle = elem({ tag : 'h2', text : 'Settings' });
        this.cacheAppend({ subtitle, fileSection, subjectSection })
        /*this.cacheAppend({
         addLevelBtn : button({ cls : 'active', html : 'Add Level', click : this.addLevel }),
         
         })*/
    }
    
    private onSubjectSubmit(currentSubject: string, subconfig: Subconfig) {
        const { submitButton : subjectSubmit, inputElem : subjectInput } = this.subjectSection.inputAndSubmitFlex;
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
        
        
    }
    
    private async onFileSubmit(subconfigFile: string, configs: string[], subconfig: Subconfig) {
        const { submitButton : fileSubmit, inputElem : fileInput } = this.fileSection.inputAndSubmitFlex;
        const file = fileInput.value;
        console.log('file submit,', file);
        const [ filename, ext ] = myfs.split_ext(file);
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
                    
                    const { value } = await MyAlert.big.blocking({
                        title : `${cfg} already exists, what do you want to do?`,
                        confirmButtonText : 'Use it',
                        onBeforeOpen : (modal: HTMLElement) => {
                            let el = elem({ htmlElement : modal, children : { actions : '.swal2-actions' } });
                            // @ts-ignore
                            el.actions.append(
                                button({ cls : "swal2-confirm swal2-styled warn", html : 'Overwrite it' })
                                    .attr({ type : 'button' })
                                    .css({ backgroundColor : '#FFC66D', color : 'black' })
                                    .click((ev: MouseEvent) => {
                                        overwrite = true;
                                        MyAlert.clickCancel();
                                    })
                            )
                        }
                    });
                    if ( value ) {
                        overwrite = cfg;
                        break;
                    } else if ( !overwrite ) {
                        return;
                    }
                    
                }
            }
            const experimentType = ext.slice(1) as ExperimentType;
            Glob.BigConfig.experiment_type = experimentType;
            console.log({ overwrite });
            if ( typeof overwrite !== 'string' ) { // undefined: new file, true: clicked overwrite,
                Glob.BigConfig.setSubconfig(file, experimentType, subconfig);
                let verb = overwrite === undefined ? 'created' : 'overwritten';
                MyAlert.small.success(`Config ${verb}: ${file}.`);
            } else { // string: "Use it"
                Glob.BigConfig.setSubconfig(file, experimentType);
                MyAlert.small.success(`Config loaded: ${file}.`);
                
            }
            
            
            fileInput.placeholder = `Current: ${file}`;
            fileSubmit.replaceClass('active', 'inactive');
            fileInput.value = '';
            await util.wait(3000);
            util.reloadPage();
            
        }
        fileSubmit.replaceClass('active', 'inactive');
        fileInput.value = '';
        
        
    }
}


const settingsDiv = new SettingsDiv({ id : 'settings_div' });
export default settingsDiv;

