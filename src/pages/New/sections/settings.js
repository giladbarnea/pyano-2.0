"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../../bhe");
const extra_1 = require("../../../bhe/extra");
const Glob_1 = require("../../../Glob");
const fs = require("fs");
const MyAlert_1 = require("../../../MyAlert");
const util = require("../../../util");
const MyStore_1 = require("../../../MyStore");
const path = require("path");
class SettingsDiv extends bhe_1.Div {
    constructor({ id }) {
        super({ id });
        const subconfig = Glob_1.default.BigConfig.getSubconfig();
        const configs = fs.readdirSync(CONFIGS_PATH_ABS);
        const configSection = new extra_1.InputSection({
            placeholder: `Current: ${subconfig.name}`,
            h3text: `Config File`,
            suggestions: configs,
        });
        configSection.inputAndSubmitFlex.submitButton.click(() => this.onConfigSubmit(configs, subconfig));
        const subjects = Glob_1.default.BigConfig.subjects;
        const currentSubject = subconfig.subject;
        const subjectSection = new extra_1.InputSection({
            placeholder: `Current: ${currentSubject}`,
            h3text: 'Subject',
            suggestions: subjects
        });
        const { submitButton: subjectSubmit } = subjectSection.inputAndSubmitFlex;
        subjectSubmit.click(() => this.onSubjectSubmit(currentSubject, subconfig));
        const truthsWith3TxtFiles = MyStore_1.getTruthsWith3TxtFiles();
        const currentTruth = subconfig.truth;
        const truthSection = new extra_1.InputSection({
            placeholder: `Current: ${currentTruth.name}`,
            h3text: 'Truth',
            suggestions: truthsWith3TxtFiles,
            illegalRegex: /[^(a-z0-9A-Z|_)]/
        });
        truthSection.inputAndSubmitFlex.submitButton.click(() => this.onTruthSubmit(currentTruth, subconfig, truthsWith3TxtFiles));
        const subtitle = bhe_1.elem({ tag: 'h2', text: 'Settings' });
        this.cacheAppend({ subtitle, configSection, subjectSection, truthSection });
    }
    async onTruthSubmit(currentTruth, subconfig, truthsWith3TxtFiles) {
        const { submitButton: truthSubmit, inputElem: truthInput } = this.truthSection.inputAndSubmitFlex;
        let value = truthInput.value;
        let valueLower = value.lower();
        if (valueLower.endsWithAny('_on', '_off')) {
            console.warn(`onTruthSubmit value not a base txt: ${valueLower}. Cutting`);
            value = value.upTo('_', true);
            valueLower = value.lower();
        }
        console.log('onTruthSubmit', { value, currentTruth });
        if (currentTruth.name.lower() === valueLower) {
            MyAlert_1.default.small.info(`${currentTruth.name} was already the chosen truth`);
            truthSubmit.replaceClass('active', 'inactive');
            return truthInput.value = '';
        }
        for (let truthName of truthsWith3TxtFiles) {
            let truthNameLower = truthName.lower();
            if (truthNameLower === valueLower) {
                subconfig.truth_file = truthName;
                truthInput.value = '';
                truthInput.placeholder = `Current: ${truthName}`;
                truthSubmit.replaceClass('active', 'inactive');
                MyAlert_1.default.small.success(`Using truth: "${truthName}"`);
                await util.wait(3000);
                return util.reloadPage();
            }
        }
        return MyAlert_1.default.small.warning(`Either this truth doesn't exist completely, or doesn't have its 3 associated .txt files. Please choose an existing one.`);
    }
    onSubjectSubmit(currentSubject, subconfig) {
        const { submitButton: subjectSubmit, inputElem: subjectInput } = this.subjectSection.inputAndSubmitFlex;
        const value = subjectInput.value;
        if (currentSubject === value) {
            MyAlert_1.default.small.info(`${currentSubject} was already the chosen subject`);
        }
        else {
            subconfig.subject = value;
            MyAlert_1.default.small.success(`Subject set: ${value}.`);
            subjectInput.placeholder = `Current: ${value}`;
        }
        subjectSubmit.replaceClass('active', 'inactive');
        subjectInput.value = '';
    }
    async onConfigSubmit(configs, subconfig) {
        const { submitButton: configSubmit, inputElem: configInput } = this.configSection.inputAndSubmitFlex;
        let file = configInput.value;
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
            configSubmit.replaceClass('active', 'inactive');
            return configInput.value = '';
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
            configInput.placeholder = `Current: ${file}`;
            configSubmit.replaceClass('active', 'inactive');
            configInput.value = '';
            await util.wait(3000);
            util.reloadPage();
        }
        if (action === "create" || action === "third") {
            Glob_1.default.BigConfig.setSubconfig(file, subconfig);
            let verb = action === "third" ? 'overwritten' : 'created';
            MyAlert_1.default.small.success(`Config ${verb}: ${file}.`);
            configInput.placeholder = `Current: ${file}`;
            configSubmit.replaceClass('active', 'inactive');
            configInput.value = '';
            await util.wait(3000);
            util.reloadPage();
        }
    }
}
exports.SettingsDiv = SettingsDiv;
console.group('pages.New.sections.settings.ts');
const settingsDiv = new SettingsDiv({ id: 'settings_div' });
console.groupEnd();
exports.default = settingsDiv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLHNDQUFnRTtBQUVoRSw4Q0FBa0Q7QUFDbEQsd0NBQWlDO0FBQ2pDLHlCQUF5QjtBQUV6Qiw4Q0FBK0Q7QUFDL0Qsc0NBQXNDO0FBQ3RDLDhDQUFxRjtBQUVyRiw2QkFBNkI7QUFFN0IsTUFBYSxXQUFZLFNBQVEsU0FBRztJQUtoQyxZQUFZLEVBQUUsRUFBRSxFQUFFO1FBQ2QsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUtkLE1BQU0sU0FBUyxHQUFjLGNBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDM0QsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzNELE1BQU0sYUFBYSxHQUFHLElBQUksb0JBQVksQ0FBQztZQUNuQyxXQUFXLEVBQUcsWUFBWSxTQUFTLENBQUMsSUFBSSxFQUFFO1lBQzFDLE1BQU0sRUFBRyxhQUFhO1lBQ3RCLFdBQVcsRUFBRyxPQUFPO1NBRXhCLENBQUMsQ0FBQztRQUVILGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFHbkcsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7UUFFekMsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQztRQUN6QyxNQUFNLGNBQWMsR0FBRyxJQUFJLG9CQUFZLENBQUM7WUFDcEMsV0FBVyxFQUFHLFlBQVksY0FBYyxFQUFFO1lBQzFDLE1BQU0sRUFBRyxTQUFTO1lBQ2xCLFdBQVcsRUFBRyxRQUFRO1NBQ3pCLENBQUMsQ0FBQztRQUNILE1BQU0sRUFBRSxZQUFZLEVBQUcsYUFBYSxFQUFFLEdBQUcsY0FBYyxDQUFDLGtCQUFrQixDQUFDO1FBQzNFLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUczRSxNQUFNLG1CQUFtQixHQUFHLGdDQUFzQixFQUFFLENBQUM7UUFDckQsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztRQUNyQyxNQUFNLFlBQVksR0FBRyxJQUFJLG9CQUFZLENBQUM7WUFDbEMsV0FBVyxFQUFHLFlBQVksWUFBWSxDQUFDLElBQUksRUFBRTtZQUM3QyxNQUFNLEVBQUcsT0FBTztZQUNoQixXQUFXLEVBQUcsbUJBQW1CO1lBQ2pDLFlBQVksRUFBRyxrQkFBa0I7U0FDcEMsQ0FBQyxDQUFDO1FBRUgsWUFBWSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQztRQUUzSCxNQUFNLFFBQVEsR0FBRyxVQUFJLENBQUMsRUFBRSxHQUFHLEVBQUcsSUFBSSxFQUFFLElBQUksRUFBRyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFBO0lBRS9FLENBQUM7SUFFTyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQW1CLEVBQUUsU0FBb0IsRUFBRSxtQkFBNkI7UUFDaEcsTUFBTSxFQUFFLFlBQVksRUFBRyxXQUFXLEVBQUUsU0FBUyxFQUFHLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUM7UUFDcEcsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUM3QixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDL0IsSUFBSyxVQUFVLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsRUFBRztZQUN6QyxPQUFPLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxVQUFVLFdBQVcsQ0FBQyxDQUFDO1lBQzNFLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM5QixVQUFVLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQzlCO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUd0RCxJQUFLLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssVUFBVSxFQUFHO1lBQzVDLGlCQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLFlBQVksQ0FBQyxJQUFJLCtCQUErQixDQUFDLENBQUM7WUFDeEUsV0FBVyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDL0MsT0FBTyxVQUFVLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztTQUVoQztRQUdELEtBQU0sSUFBSSxTQUFTLElBQUksbUJBQW1CLEVBQUc7WUFDekMsSUFBSSxjQUFjLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3ZDLElBQUssY0FBYyxLQUFLLFVBQVUsRUFBRztnQkFDakMsU0FBUyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7Z0JBQ2pDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUN0QixVQUFVLENBQUMsV0FBVyxHQUFHLFlBQVksU0FBUyxFQUFFLENBQUM7Z0JBQ2pELFdBQVcsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUMvQyxpQkFBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUJBQWlCLFNBQVMsR0FBRyxDQUFDLENBQUM7Z0JBQ3JELE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEIsT0FBTyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7YUFDNUI7U0FDSjtRQUVELE9BQU8saUJBQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHlIQUF5SCxDQUFDLENBQUE7SUFHM0osQ0FBQztJQUVPLGVBQWUsQ0FBQyxjQUFzQixFQUFFLFNBQW9CO1FBQ2hFLE1BQU0sRUFBRSxZQUFZLEVBQUcsYUFBYSxFQUFFLFNBQVMsRUFBRyxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDO1FBQzFHLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7UUFFakMsSUFBSyxjQUFjLEtBQUssS0FBSyxFQUFHO1lBQzVCLGlCQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLGNBQWMsaUNBQWlDLENBQUMsQ0FBQTtTQUN6RTthQUFNO1lBQ0gsU0FBUyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDMUIsaUJBQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGdCQUFnQixLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2hELFlBQVksQ0FBQyxXQUFXLEdBQUcsWUFBWSxLQUFLLEVBQUUsQ0FBQztTQUVsRDtRQUNELGFBQWEsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2pELFlBQVksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBRzVCLENBQUM7SUFFTyxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQWlCLEVBQUUsU0FBb0I7UUFDaEUsTUFBTSxFQUFFLFlBQVksRUFBRyxZQUFZLEVBQUUsU0FBUyxFQUFHLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUM7UUFDdkcsSUFBSSxJQUFJLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUU3QixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXJDLElBQUk7WUFDQSxtQkFBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNoQztRQUFDLE9BQVEsQ0FBQyxFQUFHO1lBQ1YsSUFBSyxDQUFDLENBQUMsT0FBTyxLQUFLLGdCQUFnQixFQUFHO2dCQUNsQyxXQUFXLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNoQyxPQUFPLGlCQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO2FBQ2pGO1lBQ0QsSUFBSyxDQUFDLENBQUMsT0FBTyxLQUFLLGVBQWUsRUFBRztnQkFDakMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDaEMsT0FBTyxpQkFBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsMERBQTBELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2xIO1NBQ0o7UUFHRCxXQUFXLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRW5DLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMvQixJQUFLLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssU0FBUyxFQUFHO1lBQ3hDLGlCQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLDhCQUE4QixDQUFDLENBQUM7WUFDcEUsWUFBWSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDaEQsT0FBTyxXQUFXLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztTQUNqQztRQUdELElBQUksTUFBTSxHQUFtQyxRQUFRLENBQUM7UUFFdEQsS0FBTSxJQUFJLEdBQUcsSUFBSSxPQUFPLEVBQUc7WUFDdkIsSUFBSyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssU0FBUyxFQUFHO2dCQUM3QixNQUFNLEdBQUcsTUFBTSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7b0JBQ3BDLEtBQUssRUFBRyxHQUFHLEdBQUcsMENBQTBDO29CQUN4RCxpQkFBaUIsRUFBRyxRQUFRO29CQUM1QixlQUFlLEVBQUcsY0FBYztvQkFDaEMsZUFBZSxFQUFHLFNBQVM7aUJBQzlCLENBQUMsQ0FBQztnQkF3QkgsSUFBSyxNQUFNLEtBQUssUUFBUSxFQUFHO29CQUN2QixPQUFPO2lCQUNWO2dCQUVELElBQUksR0FBRyxHQUFHLENBQUM7Z0JBQ1gsTUFBTTthQUdUO1NBQ0o7UUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFtQixDQUFDO1FBQ3RELGNBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztRQUNoRCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDOUIsSUFBSyxNQUFNLEtBQUssU0FBUyxFQUFHO1lBQ3hCLGNBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xDLGlCQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsSUFBSSxHQUFHLENBQUMsQ0FBQztZQUNqRCxXQUFXLENBQUMsV0FBVyxHQUFHLFlBQVksSUFBSSxFQUFFLENBQUM7WUFDN0MsWUFBWSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDaEQsV0FBVyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDdkIsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUNyQjtRQUNELElBQUssTUFBTSxLQUFLLFFBQVEsSUFBSSxNQUFNLEtBQUssT0FBTyxFQUFHO1lBQzdDLGNBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM3QyxJQUFJLElBQUksR0FBRyxNQUFNLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUMxRCxpQkFBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLEtBQUssSUFBSSxHQUFHLENBQUMsQ0FBQztZQUNsRCxXQUFXLENBQUMsV0FBVyxHQUFHLFlBQVksSUFBSSxFQUFFLENBQUM7WUFDN0MsWUFBWSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDaEQsV0FBVyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDdkIsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUNyQjtJQUdMLENBQUM7Q0FFSjtBQWhORCxrQ0FnTkM7QUFFRCxPQUFPLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7QUFDaEQsTUFBTSxXQUFXLEdBQUcsSUFBSSxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUcsY0FBYyxFQUFFLENBQUMsQ0FBQztBQUM3RCxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDbkIsa0JBQWUsV0FBVyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gKiAgcGFnZXMvTmV3L3NlY3Rpb25zL3NldHRpbmdzXG5cbi8qKlxuICogaW1wb3J0IHNlY3Rpb25zIGZyb20gXCIuL3NlY3Rpb25zXCJcbiAqIHNlY3Rpb25zLnNldHRpbmdzKi9cbmltcG9ydCB7IGVsZW0sIERpdiwgYnV0dG9uLCBJbnB1dCwgQnV0dG9uIH0gZnJvbSBcIi4uLy4uLy4uL2JoZVwiO1xuXG5pbXBvcnQgeyBJbnB1dFNlY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vYmhlL2V4dHJhXCI7XG5pbXBvcnQgR2xvYiBmcm9tIFwiLi4vLi4vLi4vR2xvYlwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5cbmltcG9ydCBNeUFsZXJ0LCB7IENyZWF0ZUNvbmZpcm1DYW5jZWwgfSBmcm9tICcuLi8uLi8uLi9NeUFsZXJ0J1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tIFwiLi4vLi4vLi4vdXRpbFwiO1xuaW1wb3J0IHsgRXhwZXJpbWVudFR5cGUsIGdldFRydXRoc1dpdGgzVHh0RmlsZXMsIFN1YmNvbmZpZyB9IGZyb20gXCIuLi8uLi8uLi9NeVN0b3JlXCI7XG5pbXBvcnQgeyBUcnV0aCB9IGZyb20gXCIuLi8uLi8uLi9UcnV0aFwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG5leHBvcnQgY2xhc3MgU2V0dGluZ3NEaXYgZXh0ZW5kcyBEaXYge1xuICAgIHByaXZhdGUgY29uZmlnU2VjdGlvbjogSW5wdXRTZWN0aW9uO1xuICAgIHByaXZhdGUgc3ViamVjdFNlY3Rpb246IElucHV0U2VjdGlvbjtcbiAgICBwcml2YXRlIHRydXRoU2VjdGlvbjogSW5wdXRTZWN0aW9uO1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKHsgaWQgfSkge1xuICAgICAgICBzdXBlcih7IGlkIH0pO1xuICAgICAgICAvLyAqKiogIEZpbGVcbiAgICAgICAgLy8gY29uc3QgZXhwZXJpbWVudFR5cGUgPSBHbG9iLkJpZ0NvbmZpZy5leHBlcmltZW50X3R5cGU7XG4gICAgICAgIC8vIGNvbnN0IHN1YmNvbmZpZ0ZpbGU6IHN0cmluZyA9IEdsb2IuQmlnQ29uZmlnW2Ake2V4cGVyaW1lbnRUeXBlfV9maWxlYF07XG4gICAgICAgIC8vIGNvbnN0IHN1YmNvbmZpZzogU3ViY29uZmlnID0gR2xvYi5CaWdDb25maWdbZXhwZXJpbWVudFR5cGVdO1xuICAgICAgICBjb25zdCBzdWJjb25maWc6IFN1YmNvbmZpZyA9IEdsb2IuQmlnQ29uZmlnLmdldFN1YmNvbmZpZygpO1xuICAgICAgICBjb25zdCBjb25maWdzOiBzdHJpbmdbXSA9IGZzLnJlYWRkaXJTeW5jKENPTkZJR1NfUEFUSF9BQlMpO1xuICAgICAgICBjb25zdCBjb25maWdTZWN0aW9uID0gbmV3IElucHV0U2VjdGlvbih7XG4gICAgICAgICAgICBwbGFjZWhvbGRlciA6IGBDdXJyZW50OiAke3N1YmNvbmZpZy5uYW1lfWAsXG4gICAgICAgICAgICBoM3RleHQgOiBgQ29uZmlnIEZpbGVgLFxuICAgICAgICAgICAgc3VnZ2VzdGlvbnMgOiBjb25maWdzLFxuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgY29uZmlnU2VjdGlvbi5pbnB1dEFuZFN1Ym1pdEZsZXguc3VibWl0QnV0dG9uLmNsaWNrKCgpID0+IHRoaXMub25Db25maWdTdWJtaXQoY29uZmlncywgc3ViY29uZmlnKSk7XG4gICAgICAgIFxuICAgICAgICAvLyAqKiogIFN1YmplY3RcbiAgICAgICAgY29uc3Qgc3ViamVjdHMgPSBHbG9iLkJpZ0NvbmZpZy5zdWJqZWN0cztcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGN1cnJlbnRTdWJqZWN0ID0gc3ViY29uZmlnLnN1YmplY3Q7XG4gICAgICAgIGNvbnN0IHN1YmplY3RTZWN0aW9uID0gbmV3IElucHV0U2VjdGlvbih7XG4gICAgICAgICAgICBwbGFjZWhvbGRlciA6IGBDdXJyZW50OiAke2N1cnJlbnRTdWJqZWN0fWAsXG4gICAgICAgICAgICBoM3RleHQgOiAnU3ViamVjdCcsXG4gICAgICAgICAgICBzdWdnZXN0aW9ucyA6IHN1YmplY3RzXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB7IHN1Ym1pdEJ1dHRvbiA6IHN1YmplY3RTdWJtaXQgfSA9IHN1YmplY3RTZWN0aW9uLmlucHV0QW5kU3VibWl0RmxleDtcbiAgICAgICAgc3ViamVjdFN1Ym1pdC5jbGljaygoKSA9PiB0aGlzLm9uU3ViamVjdFN1Ym1pdChjdXJyZW50U3ViamVjdCwgc3ViY29uZmlnKSk7XG4gICAgICAgIFxuICAgICAgICAvLyAqKiogIFRydXRoXG4gICAgICAgIGNvbnN0IHRydXRoc1dpdGgzVHh0RmlsZXMgPSBnZXRUcnV0aHNXaXRoM1R4dEZpbGVzKCk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRUcnV0aCA9IHN1YmNvbmZpZy50cnV0aDtcbiAgICAgICAgY29uc3QgdHJ1dGhTZWN0aW9uID0gbmV3IElucHV0U2VjdGlvbih7XG4gICAgICAgICAgICBwbGFjZWhvbGRlciA6IGBDdXJyZW50OiAke2N1cnJlbnRUcnV0aC5uYW1lfWAsXG4gICAgICAgICAgICBoM3RleHQgOiAnVHJ1dGgnLFxuICAgICAgICAgICAgc3VnZ2VzdGlvbnMgOiB0cnV0aHNXaXRoM1R4dEZpbGVzLFxuICAgICAgICAgICAgaWxsZWdhbFJlZ2V4IDogL1teKGEtejAtOUEtWnxfKV0vXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdHJ1dGhTZWN0aW9uLmlucHV0QW5kU3VibWl0RmxleC5zdWJtaXRCdXR0b24uY2xpY2soKCkgPT4gdGhpcy5vblRydXRoU3VibWl0KGN1cnJlbnRUcnV0aCwgc3ViY29uZmlnLCB0cnV0aHNXaXRoM1R4dEZpbGVzKSk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBzdWJ0aXRsZSA9IGVsZW0oeyB0YWcgOiAnaDInLCB0ZXh0IDogJ1NldHRpbmdzJyB9KTtcbiAgICAgICAgdGhpcy5jYWNoZUFwcGVuZCh7IHN1YnRpdGxlLCBjb25maWdTZWN0aW9uLCBzdWJqZWN0U2VjdGlvbiwgdHJ1dGhTZWN0aW9uIH0pXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGFzeW5jIG9uVHJ1dGhTdWJtaXQoY3VycmVudFRydXRoOiBUcnV0aCwgc3ViY29uZmlnOiBTdWJjb25maWcsIHRydXRoc1dpdGgzVHh0RmlsZXM6IHN0cmluZ1tdKSB7XG4gICAgICAgIGNvbnN0IHsgc3VibWl0QnV0dG9uIDogdHJ1dGhTdWJtaXQsIGlucHV0RWxlbSA6IHRydXRoSW5wdXQgfSA9IHRoaXMudHJ1dGhTZWN0aW9uLmlucHV0QW5kU3VibWl0RmxleDtcbiAgICAgICAgbGV0IHZhbHVlID0gdHJ1dGhJbnB1dC52YWx1ZTtcbiAgICAgICAgbGV0IHZhbHVlTG93ZXIgPSB2YWx1ZS5sb3dlcigpO1xuICAgICAgICBpZiAoIHZhbHVlTG93ZXIuZW5kc1dpdGhBbnkoJ19vbicsICdfb2ZmJykgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYG9uVHJ1dGhTdWJtaXQgdmFsdWUgbm90IGEgYmFzZSB0eHQ6ICR7dmFsdWVMb3dlcn0uIEN1dHRpbmdgKTtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudXBUbygnXycsIHRydWUpO1xuICAgICAgICAgICAgdmFsdWVMb3dlciA9IHZhbHVlLmxvd2VyKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coJ29uVHJ1dGhTdWJtaXQnLCB7IHZhbHVlLCBjdXJyZW50VHJ1dGggfSk7XG4gICAgICAgIFxuICAgICAgICAvLyAvIENob3NlbiBpcyBhbHJlYWR5IGN1cnJlbnRseSBzZXRcbiAgICAgICAgaWYgKCBjdXJyZW50VHJ1dGgubmFtZS5sb3dlcigpID09PSB2YWx1ZUxvd2VyICkge1xuICAgICAgICAgICAgTXlBbGVydC5zbWFsbC5pbmZvKGAke2N1cnJlbnRUcnV0aC5uYW1lfSB3YXMgYWxyZWFkeSB0aGUgY2hvc2VuIHRydXRoYCk7XG4gICAgICAgICAgICB0cnV0aFN1Ym1pdC5yZXBsYWNlQ2xhc3MoJ2FjdGl2ZScsICdpbmFjdGl2ZScpO1xuICAgICAgICAgICAgcmV0dXJuIHRydXRoSW5wdXQudmFsdWUgPSAnJztcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyAvIERpZmZlcmVudCBmcm9tIGN1cnJlbnQsIGNoZWNrIGlmIGV4aXN0cyBpbiBcIndob2xlXCIgdHJ1dGhzXG4gICAgICAgIGZvciAoIGxldCB0cnV0aE5hbWUgb2YgdHJ1dGhzV2l0aDNUeHRGaWxlcyApIHtcbiAgICAgICAgICAgIGxldCB0cnV0aE5hbWVMb3dlciA9IHRydXRoTmFtZS5sb3dlcigpO1xuICAgICAgICAgICAgaWYgKCB0cnV0aE5hbWVMb3dlciA9PT0gdmFsdWVMb3dlciApIHtcbiAgICAgICAgICAgICAgICBzdWJjb25maWcudHJ1dGhfZmlsZSA9IHRydXRoTmFtZTtcbiAgICAgICAgICAgICAgICB0cnV0aElucHV0LnZhbHVlID0gJyc7XG4gICAgICAgICAgICAgICAgdHJ1dGhJbnB1dC5wbGFjZWhvbGRlciA9IGBDdXJyZW50OiAke3RydXRoTmFtZX1gO1xuICAgICAgICAgICAgICAgIHRydXRoU3VibWl0LnJlcGxhY2VDbGFzcygnYWN0aXZlJywgJ2luYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgTXlBbGVydC5zbWFsbC5zdWNjZXNzKGBVc2luZyB0cnV0aDogXCIke3RydXRoTmFtZX1cImApO1xuICAgICAgICAgICAgICAgIGF3YWl0IHV0aWwud2FpdCgzMDAwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdXRpbC5yZWxvYWRQYWdlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gLyBFaXRoZXIgZXhpc3RzIGluIFwicGFydGlhbFwiIHRydXRocyBvciBub3QgYXQgYWxsXG4gICAgICAgIHJldHVybiBNeUFsZXJ0LnNtYWxsLndhcm5pbmcoYEVpdGhlciB0aGlzIHRydXRoIGRvZXNuJ3QgZXhpc3QgY29tcGxldGVseSwgb3IgZG9lc24ndCBoYXZlIGl0cyAzIGFzc29jaWF0ZWQgLnR4dCBmaWxlcy4gUGxlYXNlIGNob29zZSBhbiBleGlzdGluZyBvbmUuYClcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIG9uU3ViamVjdFN1Ym1pdChjdXJyZW50U3ViamVjdDogc3RyaW5nLCBzdWJjb25maWc6IFN1YmNvbmZpZykge1xuICAgICAgICBjb25zdCB7IHN1Ym1pdEJ1dHRvbiA6IHN1YmplY3RTdWJtaXQsIGlucHV0RWxlbSA6IHN1YmplY3RJbnB1dCB9ID0gdGhpcy5zdWJqZWN0U2VjdGlvbi5pbnB1dEFuZFN1Ym1pdEZsZXg7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gc3ViamVjdElucHV0LnZhbHVlO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBjdXJyZW50U3ViamVjdCA9PT0gdmFsdWUgKSB7XG4gICAgICAgICAgICBNeUFsZXJ0LnNtYWxsLmluZm8oYCR7Y3VycmVudFN1YmplY3R9IHdhcyBhbHJlYWR5IHRoZSBjaG9zZW4gc3ViamVjdGApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdWJjb25maWcuc3ViamVjdCA9IHZhbHVlO1xuICAgICAgICAgICAgTXlBbGVydC5zbWFsbC5zdWNjZXNzKGBTdWJqZWN0IHNldDogJHt2YWx1ZX0uYCk7XG4gICAgICAgICAgICBzdWJqZWN0SW5wdXQucGxhY2Vob2xkZXIgPSBgQ3VycmVudDogJHt2YWx1ZX1gO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgc3ViamVjdFN1Ym1pdC5yZXBsYWNlQ2xhc3MoJ2FjdGl2ZScsICdpbmFjdGl2ZScpO1xuICAgICAgICBzdWJqZWN0SW5wdXQudmFsdWUgPSAnJztcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGFzeW5jIG9uQ29uZmlnU3VibWl0KGNvbmZpZ3M6IHN0cmluZ1tdLCBzdWJjb25maWc6IFN1YmNvbmZpZykge1xuICAgICAgICBjb25zdCB7IHN1Ym1pdEJ1dHRvbiA6IGNvbmZpZ1N1Ym1pdCwgaW5wdXRFbGVtIDogY29uZmlnSW5wdXQgfSA9IHRoaXMuY29uZmlnU2VjdGlvbi5pbnB1dEFuZFN1Ym1pdEZsZXg7XG4gICAgICAgIGxldCBmaWxlID0gY29uZmlnSW5wdXQudmFsdWU7XG4gICAgICAgIC8vIGNvbnN0IFsgZmlsZW5hbWUsIGV4dCBdID0gbXlmcy5zcGxpdF9leHQoZmlsZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdvbkNvbmZpZ1N1Ym1pdCwnLCBmaWxlKTtcbiAgICAgICAgLy8vLyBDaGVjayBmb3IgYmFkIGV4dGVuc2lvbiBvciBiYWQgZmlsZW5hbWVcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIFN1YmNvbmZpZy52YWxpZGF0ZU5hbWUoZmlsZSk7XG4gICAgICAgIH0gY2F0Y2ggKCBlICkge1xuICAgICAgICAgICAgaWYgKCBlLm1lc3NhZ2UgPT09ICdFeHRlbnNpb25FcnJvcicgKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnSW5wdXQuYWRkQ2xhc3MoJ2ludmFsaWQnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gTXlBbGVydC5zbWFsbC53YXJuaW5nKCdGaWxlIG5hbWUgbXVzdCBlbmQgd2l0aCBlaXRoZXIgLmV4YW0gb3IgLnRlc3QnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICggZS5tZXNzYWdlID09PSAnQmFzZW5hbWVFcnJvcicgKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnSW5wdXQuYWRkQ2xhc3MoJ2ludmFsaWQnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gTXlBbGVydC5zbWFsbC53YXJuaW5nKGBJbnNlcnQganVzdCBhIGZpbGUgbmFtZSwgbm90IGEgcGF0aCB3aXRoIHNsYXNoZXMuIGVnOiBcIiR7cGF0aC5iYXNlbmFtZShmaWxlKX1cImApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLy8vIEV4dGVuc2lvbiBhbmQgZmlsZSBuYW1lIG9rOyBjaGVjayBpZiB1c2VyIGNob3NlIHdoYXQncyBjdXJyZW50bHkgc2V0XG4gICAgICAgIGNvbmZpZ0lucHV0LnJlbW92ZUNsYXNzKCdpbnZhbGlkJyk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBmaWxlTG93ZXIgPSBmaWxlLmxvd2VyKCk7XG4gICAgICAgIGlmICggc3ViY29uZmlnLm5hbWUubG93ZXIoKSA9PT0gZmlsZUxvd2VyICkge1xuICAgICAgICAgICAgTXlBbGVydC5zbWFsbC5pbmZvKGAke3N1YmNvbmZpZy5uYW1lfSB3YXMgYWxyZWFkeSB0aGUgY2hvc2VuIGZpbGVgKTtcbiAgICAgICAgICAgIGNvbmZpZ1N1Ym1pdC5yZXBsYWNlQ2xhc3MoJ2FjdGl2ZScsICdpbmFjdGl2ZScpO1xuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZ0lucHV0LnZhbHVlID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vLy8gQ2hvc2VuIHNvbWV0aGluZyBlbHNlOyBjaGVjayBpZiBleGlzdHNcbiAgICAgICAgbGV0IGFjdGlvbjogQ3JlYXRlQ29uZmlybUNhbmNlbCB8IFwiY3JlYXRlXCIgPSBcImNyZWF0ZVwiOyAvLyBjcmVhdGUgKGRvZXNudCBleGlzdCksIGNvbmZpcm0gKHVzZSBleGlzdGluZyksIG92ZXJ3cml0ZSAob24gdG9wIG9mIGV4aXN0aW5nKSwgY2FuY2VsXG4gICAgICAgIFxuICAgICAgICBmb3IgKCBsZXQgY2ZnIG9mIGNvbmZpZ3MgKSB7XG4gICAgICAgICAgICBpZiAoIGNmZy5sb3dlcigpID09PSBmaWxlTG93ZXIgKSB7XG4gICAgICAgICAgICAgICAgYWN0aW9uID0gYXdhaXQgTXlBbGVydC5iaWcudGhyZWVCdXR0b25zKHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgOiBgJHtjZmd9IGFscmVhZHkgZXhpc3RzLCB3aGF0IGRvIHlvdSB3YW50IHRvIGRvP2AsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpcm1CdXR0b25UZXh0IDogJ1VzZSBpdCcsXG4gICAgICAgICAgICAgICAgICAgIHRoaXJkQnV0dG9uVGV4dCA6ICdPdmVyd3JpdGUgaXQnLFxuICAgICAgICAgICAgICAgICAgICB0aGlyZEJ1dHRvblR5cGUgOiBcIndhcm5pbmdcIlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgIGNvbnN0IHsgdmFsdWUgfSA9IGF3YWl0IE15QWxlcnQuYmlnLmJsb2NraW5nKHtcbiAgICAgICAgICAgICAgICAgdGl0bGUgOiBgJHtjZmd9IGFscmVhZHkgZXhpc3RzLCB3aGF0IGRvIHlvdSB3YW50IHRvIGRvP2AsXG4gICAgICAgICAgICAgICAgIGNvbmZpcm1CdXR0b25UZXh0IDogJ1VzZSBpdCcsXG4gICAgICAgICAgICAgICAgIG9uQmVmb3JlT3BlbiA6IChtb2RhbDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgbGV0IGVsID0gZWxlbSh7IGh0bWxFbGVtZW50IDogbW9kYWwsIGNoaWxkcmVuIDogeyBhY3Rpb25zIDogJy5zd2FsMi1hY3Rpb25zJyB9IH0pO1xuICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgIGVsLmFjdGlvbnMuYXBwZW5kKFxuICAgICAgICAgICAgICAgICBidXR0b24oeyBjbHMgOiBcInN3YWwyLWNvbmZpcm0gc3dhbDItc3R5bGVkIHdhcm5cIiwgaHRtbCA6ICdPdmVyd3JpdGUgaXQnIH0pXG4gICAgICAgICAgICAgICAgIC5hdHRyKHsgdHlwZSA6ICdidXR0b24nIH0pXG4gICAgICAgICAgICAgICAgIC5jc3MoeyBiYWNrZ3JvdW5kQ29sb3IgOiAnI0ZGQzY2RCcsIGNvbG9yIDogJ2JsYWNrJyB9KVxuICAgICAgICAgICAgICAgICAuY2xpY2soKGV2OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgIC8vIFwiT3ZlcndyaXRlIGl0XCJcbiAgICAgICAgICAgICAgICAgYWN0aW9uID0gXCJvdmVyd3JpdGVcIjtcbiAgICAgICAgICAgICAgICAgb3ZlcndyaXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgZmlsZSA9IGNmZzsgLy8gbWF0Y2ggY2FzZVxuICAgICAgICAgICAgICAgICBNeUFsZXJ0LmNsaWNrQ2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoIGFjdGlvbiA9PT0gXCJjYW5jZWxcIiApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLy8vIFwiT3ZlcndyaXRlXCIgb3IgXCJVc2UgaXRcIlxuICAgICAgICAgICAgICAgIGZpbGUgPSBjZmc7IC8vIG1hdGNoIGNhc2VcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLy8vIEVpdGhlciBleGlzdHMgdGhlbiBsb2FkIG9yIG92ZXJ3cml0ZSBpdCwgb3IgY29tcGxldGVseSBuZXdcbiAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGUpO1xuICAgICAgICBjb25zdCBleHBlcmltZW50VHlwZSA9IGV4dC5zbGljZSgxKSBhcyBFeHBlcmltZW50VHlwZTtcbiAgICAgICAgR2xvYi5CaWdDb25maWcuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgYWN0aW9uLCBmaWxlIH0pO1xuICAgICAgICBpZiAoIGFjdGlvbiA9PT0gXCJjb25maXJtXCIgKSB7IC8vIEV4aXN0cywgXCJVc2UgaXRcIlxuICAgICAgICAgICAgR2xvYi5CaWdDb25maWcuc2V0U3ViY29uZmlnKGZpbGUpO1xuICAgICAgICAgICAgTXlBbGVydC5zbWFsbC5zdWNjZXNzKGBDb25maWcgbG9hZGVkOiAke2ZpbGV9LmApO1xuICAgICAgICAgICAgY29uZmlnSW5wdXQucGxhY2Vob2xkZXIgPSBgQ3VycmVudDogJHtmaWxlfWA7XG4gICAgICAgICAgICBjb25maWdTdWJtaXQucmVwbGFjZUNsYXNzKCdhY3RpdmUnLCAnaW5hY3RpdmUnKTtcbiAgICAgICAgICAgIGNvbmZpZ0lucHV0LnZhbHVlID0gJyc7XG4gICAgICAgICAgICBhd2FpdCB1dGlsLndhaXQoMzAwMCk7XG4gICAgICAgICAgICB1dGlsLnJlbG9hZFBhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIGFjdGlvbiA9PT0gXCJjcmVhdGVcIiB8fCBhY3Rpb24gPT09IFwidGhpcmRcIiApIHtcbiAgICAgICAgICAgIEdsb2IuQmlnQ29uZmlnLnNldFN1YmNvbmZpZyhmaWxlLCBzdWJjb25maWcpO1xuICAgICAgICAgICAgbGV0IHZlcmIgPSBhY3Rpb24gPT09IFwidGhpcmRcIiA/ICdvdmVyd3JpdHRlbicgOiAnY3JlYXRlZCc7XG4gICAgICAgICAgICBNeUFsZXJ0LnNtYWxsLnN1Y2Nlc3MoYENvbmZpZyAke3ZlcmJ9OiAke2ZpbGV9LmApO1xuICAgICAgICAgICAgY29uZmlnSW5wdXQucGxhY2Vob2xkZXIgPSBgQ3VycmVudDogJHtmaWxlfWA7XG4gICAgICAgICAgICBjb25maWdTdWJtaXQucmVwbGFjZUNsYXNzKCdhY3RpdmUnLCAnaW5hY3RpdmUnKTtcbiAgICAgICAgICAgIGNvbmZpZ0lucHV0LnZhbHVlID0gJyc7XG4gICAgICAgICAgICBhd2FpdCB1dGlsLndhaXQoMzAwMCk7XG4gICAgICAgICAgICB1dGlsLnJlbG9hZFBhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxufVxuXG5jb25zb2xlLmdyb3VwKCdwYWdlcy5OZXcuc2VjdGlvbnMuc2V0dGluZ3MudHMnKTtcbmNvbnN0IHNldHRpbmdzRGl2ID0gbmV3IFNldHRpbmdzRGl2KHsgaWQgOiAnc2V0dGluZ3NfZGl2JyB9KTtcbmNvbnNvbGUuZ3JvdXBFbmQoKTtcbmV4cG9ydCBkZWZhdWx0IHNldHRpbmdzRGl2O1xuXG4iXX0=