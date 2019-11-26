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
import { ExperimentType, getTruthFilesWhere, getTruthsWith3TxtFiles, Subconfig } from "../../../MyStore";
import { Truth } from "../../../Truth";

class SettingsDiv extends Div {
    private configSection: InputSection;
    private subjectSection: InputSection;
    private truthSection: InputSection;
    
    constructor({ id }) {
        super({ id });
        // ***  File
        // const experimentType = Glob.BigConfig.experiment_type;
        // const subconfigFile: string = Glob.BigConfig[`${experimentType}_file`];
        // const subconfig: Subconfig = Glob.BigConfig[experimentType];
        const subconfig: Subconfig = Glob.BigConfig.getSubconfig();
        const configs: string[] = fs.readdirSync(CONFIGS_PATH_ABS);
        const configSection = new InputSection({
            placeholder : `Current: ${subconfig.name}`,
            h3text : `Config File`,
            suggestions : configs,
            
        });
        
        configSection.inputAndSubmitFlex.submitButton.click(() => this.onConfigSubmit(configs, subconfig));
        
        // ***  Subject
        const subjects = Glob.BigConfig.subjects;
        
        const currentSubject = subconfig.subject;
        const subjectSection = new InputSection({
            placeholder : `Current: ${currentSubject}`,
            h3text : 'Subject',
            suggestions : subjects
        });
        const { submitButton : subjectSubmit } = subjectSection.inputAndSubmitFlex;
        subjectSubmit.click(() => this.onSubjectSubmit(currentSubject, subconfig));
        
        // ***  Truth
        const truthsWith3TxtFiles = getTruthsWith3TxtFiles();
        console.log({ truthsWith3TxtFiles });
        const currentTruth = subconfig.truth;
        const truthSection = new InputSection({
            placeholder : `Current: ${currentTruth.name}`,
            h3text : 'Truth',
            suggestions : truthsWith3TxtFiles,
            illegalRegex : /[^(a-z0-9A-Z|_)]/
        });
        
        truthSection.inputAndSubmitFlex.submitButton.click(() => this.onTruthSubmit(currentTruth, subconfig, truthsWith3TxtFiles));
        
        const subtitle = elem({ tag : 'h2', text : 'Settings' });
        this.cacheAppend({ subtitle, configSection, subjectSection, truthSection })
        
    }
    
    private async onTruthSubmit(currentTruth: Truth, subconfig: Subconfig, truthsWith3TxtFiles: string[]) {
        const { submitButton : truthSubmit, inputElem : truthInput } = this.truthSection.inputAndSubmitFlex;
        let value = truthInput.value;
        let valueLower = value.lower();
        if ( valueLower.endsWithAny('_on', '_off') ) {
            console.warn(`onTruthSubmit value not a base txt: ${valueLower}. Cutting`);
            value = value.upTo('_', true);
            valueLower = value.lower();
        }
        console.log('onTruthSubmit', { value, currentTruth });
        
        // / Chosen is already currently set
        if ( currentTruth.name.lower() === valueLower ) {
            MyAlert.small.info(`${currentTruth.name} was already the chosen truth`);
            truthSubmit.replaceClass('active', 'inactive');
            return truthInput.value = '';
            
        }
        
        // / Different from current, check if exists in "whole" truths
        for ( let truthName of truthsWith3TxtFiles ) {
            let truthNameLower = truthName.lower();
            if ( truthNameLower === valueLower ) {
                subconfig.truth_file = truthName;
                truthInput.value = '';
                truthInput.placeholder = `Current: ${truthName}`;
                truthSubmit.replaceClass('active', 'inactive');
                MyAlert.small.success(`Using truth: "${truthName}"`);
                await util.wait(3000);
                return util.reloadPage();
            }
        }
        // / Either exists in "partial" truths or not at all
        return MyAlert.small.warning(`Either this truth doesn't exist completely, or doesn't have its 3 associated .txt files. Please choose an existing one.`)
        /*const allTruthFiles = getTruthFilesWhere();
         let existing = allTruthFiles.filter(name => name.lower().startsWith(valueLower));
         if ( util.bool(existing) ) { // / Exists
         } else {
         return MyAlert.small.warning(`No such file exists. Please choose a different truth.`);
         }*/
        
        
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
    
    private async onConfigSubmit(configs: string[], subconfig: Subconfig) {
        const { submitButton : configSubmit, inputElem : configInput } = this.configSection.inputAndSubmitFlex;
        let file = configInput.value;
        console.log('onConfigSubmit,', file);
        const [ filename, ext ] = myfs.split_ext(file);
        if ( ![ '.exam', '.test' ].includes(ext) ) {
            configInput.addClass('invalid');
            MyAlert.small.warning('File name must end with either .exam or .test');
            return;
        } else {
            configInput.removeClass('invalid');
        }
        const fileLower = file.lower();
        if ( subconfig.name.lower() === fileLower ) {
            MyAlert.small.info(`${subconfig.name} was already the chosen file`)
        } else {
            let action: "use" | "overwrite" | "create" = "create";
            let overwrite = undefined; // true when clicks Overwrite;
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
                                        // "Overwrite it"
                                        action = "overwrite";
                                        overwrite = true;
                                        file = cfg; // match case
                                        MyAlert.clickCancel();
                                    })
                            )
                        }
                    });
                    if ( value ) { // "Use it"
                        file = cfg; // match case
                        action = "use";
                        overwrite = cfg;
                        console.log('Use it', { file, cfg, overwrite });
                        break;
                    } else if ( !overwrite ) { // "Cancel"
                        return;
                    }
                    
                }
            }
            const experimentType = ext.slice(1) as ExperimentType;
            Glob.BigConfig.experiment_type = experimentType;
            console.log({ overwrite, action, file });
            if ( typeof overwrite !== 'string' ) { // undefined: new file, true: clicked overwrite,
                Glob.BigConfig.setSubconfig(file, experimentType, subconfig);
                let verb = overwrite === undefined ? 'created' : 'overwritten';
                MyAlert.small.success(`Config ${verb}: ${file}.`);
            } else { // string: "Use it"
                Glob.BigConfig.setSubconfig(file, experimentType);
                MyAlert.small.success(`Config loaded: ${file}.`);
                
            }
            
            
            configInput.placeholder = `Current: ${file}`;
            configSubmit.replaceClass('active', 'inactive');
            configInput.value = '';
            await util.wait(3000);
            util.reloadPage();
            
        }
        configSubmit.replaceClass('active', 'inactive');
        configInput.value = '';
        
        
    }
    
}

console.group('pages.New.sections.settings.py');
const settingsDiv = new SettingsDiv({ id : 'settings_div' });
console.groupEnd();
export default settingsDiv;

