"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extra_1 = require("../../../bhe/extra");
const Glob_1 = require("../../../Glob");
const fs = require("fs");
const MyAlert_1 = require("../../../MyAlert");
const util = require("../../../util");
const MyStore_1 = require("../../../MyStore");
const path = require("path");
const bhe_1 = require("../../../bhe");
class SettingsDiv extends bhe_1.Div {
    constructor({ setid }) {
        super({ setid });
        const subconfig = Glob_1.default.BigConfig.getSubconfig();
        const configs = fs.readdirSync(CONFIGS_PATH_ABS);
        const configSection = new extra_1.InputSection({
            placeholder: `Current: ${subconfig.name}`,
            h3text: `Config File`,
            suggestions: configs,
        });
        configSection.flex.submit.click(() => this.onConfigSubmit(configs, subconfig));
        configSection.flex.cacheAppend({ edit: bhe_1.button({ cls: 'edit' }) });
        configSection.flex.edit.click(async () => {
            const { spawnSync } = require('child_process');
            const { status } = spawnSync('code', [Glob_1.default.BigConfig.path]);
            if (status === null) {
                MyAlert_1.default.big.oneButton({
                    title: `Failed running command:\ncode ${Glob_1.default.BigConfig.path}`,
                    html: `Make sure Visual Studio Code is installed, and available through terminal by running:\n<code>code .</code>`
                });
            }
        });
        const subjects = Glob_1.default.BigConfig.subjects;
        const currentSubject = subconfig.subject;
        const subjectSection = new extra_1.InputSection({
            placeholder: `Current: ${currentSubject}`,
            h3text: 'Subject',
            suggestions: subjects
        });
        subjectSection.flex.click(() => this.onSubjectSubmit(currentSubject, subconfig));
        const truthsWith3TxtFiles = MyStore_1.getTruthsWith3TxtFiles();
        const currentTruth = subconfig.truth;
        const truthSection = new extra_1.InputSection({
            placeholder: `Current: ${currentTruth.name}`,
            h3text: 'Truth',
            suggestions: truthsWith3TxtFiles,
            illegalRegex: /[^(a-z0-9A-Z|_)]/
        });
        truthSection.flex.submit.click(() => this.onTruthSubmit(currentTruth, subconfig, truthsWith3TxtFiles));
        const subtitle = bhe_1.elem({ tag: 'h2', html: 'Settings' });
        this.cacheAppend({ subtitle, configSection, subjectSection, truthSection });
    }
    async onTruthSubmit(currentTruth, subconfig, truthsWith3TxtFiles) {
        const { submit: truthSubmit, input: truthInput } = this.truthSection.flex;
        let value = truthInput.value();
        let valueLower = value.lower();
        if (valueLower.endsWithAny('_on', '_off')) {
            console.warn(`onTruthSubmit value not a base txt: ${valueLower}. Cutting`);
            value = value.upTo('_', true);
            valueLower = value.lower();
        }
        console.log('onTruthSubmit', { value, currentTruth });
        if (currentTruth.name.lower() === valueLower) {
            MyAlert_1.default.small.info(`${currentTruth.name} was already the chosen truth`);
            truthSubmit.replaceClass('green', 'inactive');
            return truthInput.clear();
        }
        for (let truthName of truthsWith3TxtFiles) {
            let truthNameLower = truthName.lower();
            if (truthNameLower === valueLower) {
                subconfig.truth_file = truthName;
                truthInput.clear();
                truthInput.placeholder(`Current: ${truthName}`);
                truthSubmit.replaceClass('green', 'inactive');
                MyAlert_1.default.small.success(`Using truth: "${truthName}"`);
                await util.wait(3000);
                return util.reloadPage();
            }
        }
        return MyAlert_1.default.small.warning(`Either this truth doesn't exist completely, or doesn't have its 3 associated .txt files. Please choose an existing one.`);
    }
    onSubjectSubmit(currentSubject, subconfig) {
        const { submit: subjectSubmit, input: subjectInput } = this.subjectSection.flex;
        const value = subjectInput.value();
        if (currentSubject === value) {
            MyAlert_1.default.small.info(`${currentSubject} was already the chosen subject`);
        }
        else {
            subconfig.subject = value;
            MyAlert_1.default.small.success(`Subject set: ${value}.`);
            subjectInput.placeholder(`Current: ${value}`);
        }
        subjectSubmit.replaceClass('green', 'inactive');
        subjectInput.clear();
    }
    async onConfigSubmit(configs, subconfig) {
        const { submit: configSubmit, input: configInput } = this.configSection.flex;
        let file = configInput.value();
        console.log('onConfigSubmit,', file);
        try {
            MyStore_1.Subconfig.validateName(file);
        }
        catch (e) {
            if (e.message === 'ExtensionError') {
                configInput.addClass('invalid');
                return MyAlert_1.default.small.warning('File name must end with either .exam or .test');
            }
            if (e.message === 'BasenameError') {
                configInput.addClass('invalid');
                return MyAlert_1.default.small.warning(`Insert just a file name, not a path with slashes. eg: "${path.basename(file)}"`);
            }
        }
        configInput.removeClass('invalid');
        const fileLower = file.lower();
        if (subconfig.name.lower() === fileLower) {
            MyAlert_1.default.small.info(`${subconfig.name} was already the chosen file`);
            configSubmit.replaceClass('green', 'inactive');
            return configInput.clear();
        }
        let action = "create";
        for (let cfg of configs) {
            if (cfg.lower() === fileLower) {
                action = await MyAlert_1.default.big.threeButtons({
                    title: `${cfg} already exists, what do you want to do?`,
                    confirmButtonText: 'Use it',
                    thirdButtonText: 'Overwrite it',
                    thirdButtonType: "warning"
                });
                if (action === "cancel") {
                    return;
                }
                file = cfg;
                break;
            }
        }
        const ext = path.extname(file);
        const experimentType = ext.slice(1);
        Glob_1.default.BigConfig.experiment_type = experimentType;
        console.log({ action, file });
        if (action === "confirm") {
            Glob_1.default.BigConfig.setSubconfig(file);
            MyAlert_1.default.small.success(`Config loaded: ${file}.`);
            configInput.placeholder(`Current: ${file}`);
            configSubmit.replaceClass('green', 'inactive');
            configInput.clear();
            await util.wait(3000);
            util.reloadPage();
        }
        if (action === "create" || action === "third") {
            Glob_1.default.BigConfig.setSubconfig(file, subconfig);
            let verb = action === "third" ? 'overwritten' : 'created';
            MyAlert_1.default.small.success(`Config ${verb}: ${file}.`);
            configInput.placeholder(`Current: ${file}`);
            configSubmit.replaceClass('green', 'inactive');
            configInput.clear();
            await util.wait(3000);
            util.reloadPage();
        }
    }
}
exports.SettingsDiv = SettingsDiv;
console.group('pages.New.sections.settings.ts');
const settingsDiv = new SettingsDiv({ setid: 'settings_div' });
console.groupEnd();
exports.default = settingsDiv;
//# sourceMappingURL=settings.js.map