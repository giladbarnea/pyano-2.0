// *  pages/New/sections/settings

/**
 * import sections from "./sections"
 * sections.settings*/

import { InputSection } from "../../../bhe/extra";
import Glob from "../../../Glob";

// import { CreateConfirmThird } from '../../../swalert.js'
import { Truth } from "../../../truth";
import { button, Button, Div, elem } from "../../../bhe";
import { swalert } from "../../../swalert";
import { coolstore } from "../../../coolstore.js";

// TODO (CONTINUE):
//  betterhtmlelement imports dont work because i don't know how to bundle.
//  either clone bhe and compile or use webpack?
export class SettingsDiv extends Div {
    private configSection: InputSection & { flex: { edit: Button } };
    private subjectSection: InputSection;
    private truthSection: InputSection;

    constructor({ setid }) {
        super({ setid });
        // *** File
        // const experimentType = Glob.BigConfig.experiment_type;
        // const subconfigFile: string = Glob.BigConfig[`${experimentType}_file`];
        // const subconfig: Subconfig = Glob.BigConfig[experimentType];
        const subconfig: coolstore.Subconfig = BigConfig.getSubconfig();
        const configs: string[] = fs.readdirSync(CONFIGS_PATH_ABS);
        const configSection = new InputSection({
            placeholder: `Current: ${subconfig.name}`,
            h3text: `Config File`,
            suggestions: configs,
        });

        configSection.flex.submit.click(() => this.onConfigSubmit(configs, subconfig));
        configSection.flex.cacheAppend({ edit: button({ cls: 'edit' }) });
        // @ts-ignore
        configSection.flex.edit.click(async () => {
            const { spawnSync } = require('child_process');
            const { status } = spawnSync('code', [BigConfig.path]);
            if (status === null) {
                swalert.big.oneButton({
                    title: `Failed running command:\ncode ${BigConfig.path}`,
                    html: `Make sure Visual Studio Code is installed, and available through terminal by running:\n<code>code .</code>`
                })
            }

        });
        // *** Subject
        const subjects = BigConfig.subjects;

        const currentSubject = subconfig.subject;
        const subjectSection = new InputSection({
            placeholder: `Current: ${currentSubject}`,
            h3text: 'Subject',
            suggestions: subjects
        });
        subjectSection.flex.click(() => this.onSubjectSubmit(currentSubject, subconfig));

        // *** Truth
        const truthsWith3TxtFiles = coolstore.getTruthsWith3TxtFiles();
        const currentTruth = subconfig.truth;
        const truthSection = new InputSection({
            placeholder: `Current: ${currentTruth.name}`,
            h3text: 'Truth',
            suggestions: truthsWith3TxtFiles,
            illegalRegex: /[^(a-z0-9A-Z|_)]/
        });

        truthSection.flex.submit.click(() => this.onTruthSubmit(currentTruth, subconfig, truthsWith3TxtFiles));

        const subtitle = elem({ tag: 'h2', html: 'Settings' });
        this.cacheAppend({ subtitle, configSection, subjectSection, truthSection })

    }

    private async onTruthSubmit(currentTruth: Truth, subconfig: coolstore.Subconfig, truthsWith3TxtFiles: string[]) {
        const { submit: truthSubmit, input: truthInput } = this.truthSection.flex;
        let value = truthInput.value();
        let valueLower = value.lower();
        if (valueLower.endsWithAny('_on', '_off')) {
            console.warn(`onTruthSubmit value not a base txt: ${valueLower}. Cutting`);
            value = value.upTo('_', true);
            valueLower = value.lower();
        }
        console.log('onTruthSubmit', { value, currentTruth });

        // / Chosen is already currently set
        if (currentTruth.name.lower() === valueLower) {
            swalert.small.info(`${currentTruth.name} was already the chosen truth`);
            truthSubmit.replaceClass('green', 'inactive');
            return truthInput.clear();

        }

        // / Different from current, check if exists in "whole" truths
        for (let truthName of truthsWith3TxtFiles) {
            let truthNameLower = truthName.lower();
            if (truthNameLower === valueLower) {
                subconfig.truth_file = truthName;
                truthInput.clear();
                truthInput.placeholder(`Current: ${truthName}`);
                truthSubmit.replaceClass('green', 'inactive');
                swalert.small.success(`Using truth: "${truthName}"`);
                await util.wait(3000);
                return util.reloadPage();
            }
        }
        // / Either exists in "partial" truths or not at all
        return swalert.small.warning(`Either this truth doesn't exist completely, or doesn't have its 3 associated .txt files. Please choose an existing one.`)


    }

    private onSubjectSubmit(currentSubject: string, subconfig: coolstore.Subconfig) {
        const { submit: subjectSubmit, input: subjectInput } = this.subjectSection.flex;
        const value = subjectInput.value();

        if (currentSubject === value) {
            swalert.small.info(`${currentSubject} was already the chosen subject`)
        } else {
            subconfig.subject = value;
            swalert.small.success(`Subject set: ${value}.`);
            subjectInput.placeholder(`Current: ${value}`);

        }
        subjectSubmit.replaceClass('green', 'inactive');
        subjectInput.clear();


    }

    private async onConfigSubmit(configs: string[], subconfig: coolstore.Subconfig) {
        const { submit: configSubmit, input: configInput } = this.configSection.flex;
        let file = configInput.value();
        // const [ filename, ext ] = myfs.split_ext(file);
        console.log('onConfigSubmit,', file);
        //// Check for bad extension or bad filename
        try {
            coolstore.Subconfig.validateName(file);
        } catch (e) {
            if (e.message === 'ExtensionError') {
                configInput.addClass('invalid');
                return swalert.small.warning('File name must end with either .exam or .test');
            }
            if (e.message === 'BasenameError') {
                configInput.addClass('invalid');
                return swalert.small.warning(`Insert just a file name, not a path with slashes. eg: "${path.basename(file)}"`);
            }
        }

        //// Extension and file name ok; check if user chose what's currently set
        configInput.removeClass('invalid');

        const fileLower = file.lower();
        if (subconfig.name.lower() === fileLower) {
            swalert.small.info(`${subconfig.name} was already the chosen file`);
            configSubmit.replaceClass('green', 'inactive');
            return configInput.clear();
        }

        //// Chosen something else; check if exists
        let action: swalert.CreateConfirmThird | "create" = "create"; // create (doesnt exist), confirm (use existing), overwrite (on top of existing), cancel

        for (let cfg of configs) {
            if (cfg.lower() === fileLower) {
                action = await swalert.big.threeButtons({
                    title: `${cfg} already exists, what do you want to do?`,
                    confirmButtonText: 'Use it',
                    thirdButtonText: 'Overwrite it',
                    thirdButtonType: "warning"
                });
                /*
                 const { value } = await myalert.big.blocking({
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
                 myalert.clickCancel();
                 })
                 )
                 }
                 });
                 */

                if (action === "cancel") {
                    return;
                }
                //// "Overwrite" or "Use it"
                file = cfg; // match case
                break;


            }
        }
        //// Either exists then load or overwrite it, or completely new
        const ext = path.extname(file);
        const experimentType = ext.slice(1) as coolstore.ExperimentType;
        BigConfig.experiment_type = experimentType;
        console.debug({ action, file });
        if (action === "confirm") { // Exists, "Use it"
            BigConfig.setSubconfig(file);
            swalert.small.success(`Config loaded: ${file}.`);
            configInput.placeholder(`Current: ${file}`);
            configSubmit.replaceClass('green', 'inactive');
            configInput.clear();
            await util.wait(3000);
            util.reloadPage();
        }
        if (action === "create" || action === "third") {
            BigConfig.setSubconfig(file, subconfig);
            let verb = action === "third" ? 'overwritten' : 'created';
            swalert.small.success(`Config ${verb}: ${file}.`);
            configInput.placeholder(`Current: ${file}`);
            configSubmit.replaceClass('green', 'inactive');
            configInput.clear();
            await util.wait(3000);
            util.reloadPage();
        }


    }

}

// console.group('pages.New.sections.settings.ts');
const settingsDiv = new SettingsDiv({ setid: 'settings_div' });
// console.groupEnd();
export default settingsDiv;

