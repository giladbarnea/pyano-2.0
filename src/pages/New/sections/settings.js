"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../../bhe");
const extra_1 = require("../../../bhe/extra");
const Glob_1 = require("../../../Glob");
const fs = require("fs");
const MyAlert_1 = require("../../../MyAlert");
const MyFs_1 = require("../../../MyFs");
const util = require("../../../util");
const MyStore_1 = require("../../../MyStore");
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
        console.log({ truthsWith3TxtFiles });
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
    onTruthSubmit(currentTruth, subconfig, truthsWith3TxtFiles) {
        const { submitButton: truthSubmit, inputElem: truthInput } = this.truthSection.inputAndSubmitFlex;
        const value = truthInput.value;
        console.log('onTruthSubmit', { value, currentTruth });
        if (currentTruth.name === value) {
            MyAlert_1.default.small.info(`${currentTruth.name} was already the chosen truth`);
            truthSubmit.replaceClass('active', 'inactive');
            truthInput.value = '';
            return;
        }
        if (truthsWith3TxtFiles.includes(currentTruth.name)) {
            subconfig.truth_file = currentTruth.name;
        }
        else {
        }
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
        const [filename, ext] = MyFs_1.default.split_ext(file);
        if (!['.exam', '.test'].includes(ext)) {
            configInput.addClass('invalid');
            MyAlert_1.default.small.warning('File name must end with either .exam or .test');
            return;
        }
        else {
            configInput.removeClass('invalid');
        }
        const fileLower = file.lower();
        if (subconfig.name.lower() === fileLower) {
            MyAlert_1.default.small.info(`${subconfig.name} was already the chosen file`);
        }
        else {
            let action = "create";
            let overwrite = undefined;
            for (let cfg of configs) {
                if (cfg.lower() === fileLower) {
                    const { value } = await MyAlert_1.default.big.blocking({
                        title: `${cfg} already exists, what do you want to do?`,
                        confirmButtonText: 'Use it',
                        onBeforeOpen: (modal) => {
                            let el = bhe_1.elem({ htmlElement: modal, children: { actions: '.swal2-actions' } });
                            el.actions.append(bhe_1.button({ cls: "swal2-confirm swal2-styled warn", html: 'Overwrite it' })
                                .attr({ type: 'button' })
                                .css({ backgroundColor: '#FFC66D', color: 'black' })
                                .click((ev) => {
                                action = "overwrite";
                                overwrite = true;
                                file = cfg;
                                MyAlert_1.default.clickCancel();
                            }));
                        }
                    });
                    if (value) {
                        file = cfg;
                        action = "use";
                        overwrite = cfg;
                        console.log('Use it', { file, cfg, overwrite });
                        break;
                    }
                    else if (!overwrite) {
                        return;
                    }
                }
            }
            const experimentType = ext.slice(1);
            Glob_1.default.BigConfig.experiment_type = experimentType;
            console.log({ overwrite, action, file });
            if (typeof overwrite !== 'string') {
                Glob_1.default.BigConfig.setSubconfig(file, experimentType, subconfig);
                let verb = overwrite === undefined ? 'created' : 'overwritten';
                MyAlert_1.default.small.success(`Config ${verb}: ${file}.`);
            }
            else {
                Glob_1.default.BigConfig.setSubconfig(file, experimentType);
                MyAlert_1.default.small.success(`Config loaded: ${file}.`);
            }
            configInput.placeholder = `Current: ${file}`;
            configSubmit.replaceClass('active', 'inactive');
            configInput.value = '';
            if (Glob_1.default.BigConfig.dev.reload_page_on_submit()) {
                await util.wait(3000);
                util.reloadPage();
            }
        }
        configSubmit.replaceClass('active', 'inactive');
        configInput.value = '';
    }
}
const settingsDiv = new SettingsDiv({ id: 'settings_div' });
exports.default = settingsDiv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLHNDQUFnRTtBQUVoRSw4Q0FBa0Q7QUFDbEQsd0NBQWlDO0FBQ2pDLHlCQUF5QjtBQUV6Qiw4Q0FBc0M7QUFDdEMsd0NBQWlDO0FBQ2pDLHNDQUFzQztBQUN0Qyw4Q0FBcUY7QUFHckYsTUFBTSxXQUFZLFNBQVEsU0FBRztJQUt6QixZQUFZLEVBQUUsRUFBRSxFQUFFO1FBQ2QsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUtkLE1BQU0sU0FBUyxHQUFjLGNBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDM0QsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzNELE1BQU0sYUFBYSxHQUFHLElBQUksb0JBQVksQ0FBQztZQUNuQyxXQUFXLEVBQUcsWUFBWSxTQUFTLENBQUMsSUFBSSxFQUFFO1lBQzFDLE1BQU0sRUFBRyxhQUFhO1lBQ3RCLFdBQVcsRUFBRyxPQUFPO1NBRXhCLENBQUMsQ0FBQztRQUVILGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFHbkcsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7UUFFekMsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQztRQUN6QyxNQUFNLGNBQWMsR0FBRyxJQUFJLG9CQUFZLENBQUM7WUFDcEMsV0FBVyxFQUFHLFlBQVksY0FBYyxFQUFFO1lBQzFDLE1BQU0sRUFBRyxTQUFTO1lBQ2xCLFdBQVcsRUFBRyxRQUFRO1NBQ3pCLENBQUMsQ0FBQztRQUNILE1BQU0sRUFBRSxZQUFZLEVBQUcs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QUM7YUFDckI7U0FFSjtRQUNELFlBQVksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2hELFdBQVcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBRzNCLENBQUM7Q0FFSjtBQUdELE1BQU0sV0FBVyxHQUFHLElBQUksV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFHLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDN0Qsa0JBQWUsV0FBVyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gKiAgcGFnZXMvTmV3L3NlY3Rpb25zL3NldHRpbmdzXG5cbi8qKlxuICogaW1wb3J0IHNlY3Rpb25zIGZyb20gXCIuL3NlY3Rpb25zXCJcbiAqIHNlY3Rpb25zLnNldHRpbmdzKi9cbmltcG9ydCB7IGVsZW0sIERpdiwgYnV0dG9uLCBJbnB1dCwgQnV0dG9uIH0gZnJvbSBcIi4uLy4uLy4uL2JoZVwiO1xuXG5pbXBvcnQgeyBJbnB1dFNlY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vYmhlL2V4dHJhXCI7XG5pbXBvcnQgR2xvYiBmcm9tIFwiLi4vLi4vLi4vR2xvYlwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5cbmltcG9ydCBNeUFsZXJ0IGZyb20gJy4uLy4uLy4uL015QWxlcnQnXG5pbXBvcnQgbXlmcyBmcm9tIFwiLi4vLi4vLi4vTXlGc1wiO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tIFwiLi4vLi4vLi4vdXRpbFwiO1xuaW1wb3J0IHsgRXhwZXJpbWVudFR5cGUsIGdldFRydXRoc1dpdGgzVHh0RmlsZXMsIFN1YmNvbmZpZyB9IGZyb20gXCIuLi8uLi8uLi9NeVN0b3JlXCI7XG5pbXBvcnQgeyBUcnV0aCB9IGZyb20gXCIuLi8uLi8uLi9UcnV0aFwiO1xuXG5jbGFzcyBTZXR0aW5nc0RpdiBleHRlbmRzIERpdiB7XG4gICAgcHJpdmF0ZSBjb25maWdTZWN0aW9uOiBJbnB1dFNlY3Rpb247XG4gICAgcHJpdmF0ZSBzdWJqZWN0U2VjdGlvbjogSW5wdXRTZWN0aW9uO1xuICAgIHByaXZhdGUgdHJ1dGhTZWN0aW9uOiBJbnB1dFNlY3Rpb247XG4gICAgXG4gICAgY29uc3RydWN0b3IoeyBpZCB9KSB7XG4gICAgICAgIHN1cGVyKHsgaWQgfSk7XG4gICAgICAgIC8vICoqKiAgRmlsZVxuICAgICAgICAvLyBjb25zdCBleHBlcmltZW50VHlwZSA9IEdsb2IuQmlnQ29uZmlnLmV4cGVyaW1lbnRfdHlwZTtcbiAgICAgICAgLy8gY29uc3Qgc3ViY29uZmlnRmlsZTogc3RyaW5nID0gR2xvYi5CaWdDb25maWdbYCR7ZXhwZXJpbWVudFR5cGV9X2ZpbGVgXTtcbiAgICAgICAgLy8gY29uc3Qgc3ViY29uZmlnOiBTdWJjb25maWcgPSBHbG9iLkJpZ0NvbmZpZ1tleHBlcmltZW50VHlwZV07XG4gICAgICAgIGNvbnN0IHN1YmNvbmZpZzogU3ViY29uZmlnID0gR2xvYi5CaWdDb25maWcuZ2V0U3ViY29uZmlnKCk7XG4gICAgICAgIGNvbnN0IGNvbmZpZ3M6IHN0cmluZ1tdID0gZnMucmVhZGRpclN5bmMoQ09ORklHU19QQVRIX0FCUyk7XG4gICAgICAgIGNvbnN0IGNvbmZpZ1NlY3Rpb24gPSBuZXcgSW5wdXRTZWN0aW9uKHtcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyIDogYEN1cnJlbnQ6ICR7c3ViY29uZmlnLm5hbWV9YCxcbiAgICAgICAgICAgIGgzdGV4dCA6IGBDb25maWcgRmlsZWAsXG4gICAgICAgICAgICBzdWdnZXN0aW9ucyA6IGNvbmZpZ3MsXG4gICAgICAgICAgICAvLyBvdmVyd3JpdGVXYXJuIDogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGNvbmZpZ1NlY3Rpb24uaW5wdXRBbmRTdWJtaXRGbGV4LnN1Ym1pdEJ1dHRvbi5jbGljaygoKSA9PiB0aGlzLm9uQ29uZmlnU3VibWl0KGNvbmZpZ3MsIHN1YmNvbmZpZykpO1xuICAgICAgICBcbiAgICAgICAgLy8gKioqICBTdWJqZWN0XG4gICAgICAgIGNvbnN0IHN1YmplY3RzID0gR2xvYi5CaWdDb25maWcuc3ViamVjdHM7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBjdXJyZW50U3ViamVjdCA9IHN1YmNvbmZpZy5zdWJqZWN0O1xuICAgICAgICBjb25zdCBzdWJqZWN0U2VjdGlvbiA9IG5ldyBJbnB1dFNlY3Rpb24oe1xuICAgICAgICAgICAgcGxhY2Vob2xkZXIgOiBgQ3VycmVudDogJHtjdXJyZW50U3ViamVjdH1gLFxuICAgICAgICAgICAgaDN0ZXh0IDogJ1N1YmplY3QnLFxuICAgICAgICAgICAgc3VnZ2VzdGlvbnMgOiBzdWJqZWN0c1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgeyBzdWJtaXRCdXR0b24gOiBzdWJqZWN0U3VibWl0IH0gPSBzdWJqZWN0U2VjdGlvbi5pbnB1dEFuZFN1Ym1pdEZsZXg7XG4gICAgICAgIHN1YmplY3RTdWJtaXQuY2xpY2soKCkgPT4gdGhpcy5vblN1YmplY3RTdWJtaXQoY3VycmVudFN1YmplY3QsIHN1YmNvbmZpZykpO1xuICAgICAgICBcbiAgICAgICAgLy8gKioqICBUcnV0aFxuICAgICAgICBjb25zdCB0cnV0aHNXaXRoM1R4dEZpbGVzID0gZ2V0VHJ1dGhzV2l0aDNUeHRGaWxlcygpO1xuICAgICAgICBjb25zb2xlLmxvZyh7IHRydXRoc1dpdGgzVHh0RmlsZXMgfSk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRUcnV0aCA9IHN1YmNvbmZpZy50cnV0aDtcbiAgICAgICAgY29uc3QgdHJ1dGhTZWN0aW9uID0gbmV3IElucHV0U2VjdGlvbih7XG4gICAgICAgICAgICBwbGFjZWhvbGRlciA6IGBDdXJyZW50OiAke2N1cnJlbnRUcnV0aC5uYW1lfWAsXG4gICAgICAgICAgICBoM3RleHQgOiAnVHJ1dGgnLFxuICAgICAgICAgICAgc3VnZ2VzdGlvbnMgOiB0cnV0aHNXaXRoM1R4dEZpbGVzLFxuICAgICAgICAgICAgaWxsZWdhbFJlZ2V4IDogL1teKGEtejAtOUEtWnxfKV0vXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdHJ1dGhTZWN0aW9uLmlucHV0QW5kU3VibWl0RmxleC5zdWJtaXRCdXR0b24uY2xpY2soKCkgPT4gdGhpcy5vblRydXRoU3VibWl0KGN1cnJlbnRUcnV0aCwgc3ViY29uZmlnLCB0cnV0aHNXaXRoM1R4dEZpbGVzKSk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBzdWJ0aXRsZSA9IGVsZW0oeyB0YWcgOiAnaDInLCB0ZXh0IDogJ1NldHRpbmdzJyB9KTtcbiAgICAgICAgdGhpcy5jYWNoZUFwcGVuZCh7IHN1YnRpdGxlLCBjb25maWdTZWN0aW9uLCBzdWJqZWN0U2VjdGlvbiwgdHJ1dGhTZWN0aW9uIH0pXG4gICAgICAgIC8qdGhpcy5jYWNoZUFwcGVuZCh7XG4gICAgICAgICBhZGRMZXZlbEJ0biA6IGJ1dHRvbih7IGNscyA6ICdhY3RpdmUnLCBodG1sIDogJ0FkZCBMZXZlbCcsIGNsaWNrIDogdGhpcy5hZGRMZXZlbCB9KSxcbiAgICAgICAgIFxuICAgICAgICAgfSkqL1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIG9uVHJ1dGhTdWJtaXQoY3VycmVudFRydXRoOiBUcnV0aCwgc3ViY29uZmlnOiBTdWJjb25maWcsIHRydXRoc1dpdGgzVHh0RmlsZXM6IHN0cmluZ1tdKSB7XG4gICAgICAgIGNvbnN0IHsgc3VibWl0QnV0dG9uIDogdHJ1dGhTdWJtaXQsIGlucHV0RWxlbSA6IHRydXRoSW5wdXQgfSA9IHRoaXMudHJ1dGhTZWN0aW9uLmlucHV0QW5kU3VibWl0RmxleDtcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0cnV0aElucHV0LnZhbHVlO1xuICAgICAgICBjb25zb2xlLmxvZygnb25UcnV0aFN1Ym1pdCcsIHsgdmFsdWUsIGN1cnJlbnRUcnV0aCB9KTtcbiAgICAgICAgaWYgKCBjdXJyZW50VHJ1dGgubmFtZSA9PT0gdmFsdWUgKSB7XG4gICAgICAgICAgICBNeUFsZXJ0LnNtYWxsLmluZm8oYCR7Y3VycmVudFRydXRoLm5hbWV9IHdhcyBhbHJlYWR5IHRoZSBjaG9zZW4gdHJ1dGhgKTtcbiAgICAgICAgICAgIHRydXRoU3VibWl0LnJlcGxhY2VDbGFzcygnYWN0aXZlJywgJ2luYWN0aXZlJyk7XG4gICAgICAgICAgICB0cnV0aElucHV0LnZhbHVlID0gJyc7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gLyAgRGlmZmVyZW50IGZyb20gY3VycmVudFxuICAgICAgICBpZiAoIHRydXRoc1dpdGgzVHh0RmlsZXMuaW5jbHVkZXMoY3VycmVudFRydXRoLm5hbWUpICkge1xuICAgICAgICAgICAgc3ViY29uZmlnLnRydXRoX2ZpbGUgPSBjdXJyZW50VHJ1dGgubmFtZVxuICAgICAgICB9IGVsc2UgeyAvLyAvICBDcmVhdGUgbmV3XG4gICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBvblN1YmplY3RTdWJtaXQoY3VycmVudFN1YmplY3Q6IHN0cmluZywgc3ViY29uZmlnOiBTdWJjb25maWcpIHtcbiAgICAgICAgY29uc3QgeyBzdWJtaXRCdXR0b24gOiBzdWJqZWN0U3VibWl0LCBpbnB1dEVsZW0gOiBzdWJqZWN0SW5wdXQgfSA9IHRoaXMuc3ViamVjdFNlY3Rpb24uaW5wdXRBbmRTdWJtaXRGbGV4O1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHN1YmplY3RJbnB1dC52YWx1ZTtcbiAgICAgICAgXG4gICAgICAgIGlmICggY3VycmVudFN1YmplY3QgPT09IHZhbHVlICkge1xuICAgICAgICAgICAgTXlBbGVydC5zbWFsbC5pbmZvKGAke2N1cnJlbnRTdWJqZWN0fSB3YXMgYWxyZWFkeSB0aGUgY2hvc2VuIHN1YmplY3RgKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3ViY29uZmlnLnN1YmplY3QgPSB2YWx1ZTtcbiAgICAgICAgICAgIE15QWxlcnQuc21hbGwuc3VjY2VzcyhgU3ViamVjdCBzZXQ6ICR7dmFsdWV9LmApO1xuICAgICAgICAgICAgc3ViamVjdElucHV0LnBsYWNlaG9sZGVyID0gYEN1cnJlbnQ6ICR7dmFsdWV9YDtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIHN1YmplY3RTdWJtaXQucmVwbGFjZUNsYXNzKCdhY3RpdmUnLCAnaW5hY3RpdmUnKTtcbiAgICAgICAgc3ViamVjdElucHV0LnZhbHVlID0gJyc7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBhc3luYyBvbkNvbmZpZ1N1Ym1pdChjb25maWdzOiBzdHJpbmdbXSwgc3ViY29uZmlnOiBTdWJjb25maWcpIHtcbiAgICAgICAgY29uc3QgeyBzdWJtaXRCdXR0b24gOiBjb25maWdTdWJtaXQsIGlucHV0RWxlbSA6IGNvbmZpZ0lucHV0IH0gPSB0aGlzLmNvbmZpZ1NlY3Rpb24uaW5wdXRBbmRTdWJtaXRGbGV4O1xuICAgICAgICBsZXQgZmlsZSA9IGNvbmZpZ0lucHV0LnZhbHVlO1xuICAgICAgICBjb25zb2xlLmxvZygnb25Db25maWdTdWJtaXQsJywgZmlsZSk7XG4gICAgICAgIGNvbnN0IFsgZmlsZW5hbWUsIGV4dCBdID0gbXlmcy5zcGxpdF9leHQoZmlsZSk7XG4gICAgICAgIGlmICggIVsgJy5leGFtJywgJy50ZXN0JyBdLmluY2x1ZGVzKGV4dCkgKSB7XG4gICAgICAgICAgICBjb25maWdJbnB1dC5hZGRDbGFzcygnaW52YWxpZCcpO1xuICAgICAgICAgICAgTXlBbGVydC5zbWFsbC53YXJuaW5nKCdGaWxlIG5hbWUgbXVzdCBlbmQgd2l0aCBlaXRoZXIgLmV4YW0gb3IgLnRlc3QnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbmZpZ0lucHV0LnJlbW92ZUNsYXNzKCdpbnZhbGlkJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmlsZUxvd2VyID0gZmlsZS5sb3dlcigpO1xuICAgICAgICBpZiAoIHN1YmNvbmZpZy5uYW1lLmxvd2VyKCkgPT09IGZpbGVMb3dlciApIHtcbiAgICAgICAgICAgIE15QWxlcnQuc21hbGwuaW5mbyhgJHtzdWJjb25maWcubmFtZX0gd2FzIGFscmVhZHkgdGhlIGNob3NlbiBmaWxlYClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBhY3Rpb246IFwidXNlXCIgfCBcIm92ZXJ3cml0ZVwiIHwgXCJjcmVhdGVcIiA9IFwiY3JlYXRlXCI7XG4gICAgICAgICAgICBsZXQgb3ZlcndyaXRlID0gdW5kZWZpbmVkOyAvLyB0cnVlIHdoZW4gY2xpY2tzIE92ZXJ3cml0ZTtcbiAgICAgICAgICAgIGZvciAoIGxldCBjZmcgb2YgY29uZmlncyApIHtcbiAgICAgICAgICAgICAgICBpZiAoIGNmZy5sb3dlcigpID09PSBmaWxlTG93ZXIgKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IHZhbHVlIH0gPSBhd2FpdCBNeUFsZXJ0LmJpZy5ibG9ja2luZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZSA6IGAke2NmZ30gYWxyZWFkeSBleGlzdHMsIHdoYXQgZG8geW91IHdhbnQgdG8gZG8/YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpcm1CdXR0b25UZXh0IDogJ1VzZSBpdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkJlZm9yZU9wZW4gOiAobW9kYWw6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVsID0gZWxlbSh7IGh0bWxFbGVtZW50IDogbW9kYWwsIGNoaWxkcmVuIDogeyBhY3Rpb25zIDogJy5zd2FsMi1hY3Rpb25zJyB9IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5hY3Rpb25zLmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uKHsgY2xzIDogXCJzd2FsMi1jb25maXJtIHN3YWwyLXN0eWxlZCB3YXJuXCIsIGh0bWwgOiAnT3ZlcndyaXRlIGl0JyB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoeyB0eXBlIDogJ2J1dHRvbicgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jc3MoeyBiYWNrZ3JvdW5kQ29sb3IgOiAnI0ZGQzY2RCcsIGNvbG9yIDogJ2JsYWNrJyB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNsaWNrKChldjogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwiT3ZlcndyaXRlIGl0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24gPSBcIm92ZXJ3cml0ZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJ3cml0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZSA9IGNmZzsgLy8gbWF0Y2ggY2FzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE15QWxlcnQuY2xpY2tDYW5jZWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCB2YWx1ZSApIHsgLy8gXCJVc2UgaXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZSA9IGNmZzsgLy8gbWF0Y2ggY2FzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uID0gXCJ1c2VcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJ3cml0ZSA9IGNmZztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdVc2UgaXQnLCB7IGZpbGUsIGNmZywgb3ZlcndyaXRlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoICFvdmVyd3JpdGUgKSB7IC8vIFwiQ2FuY2VsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBleHBlcmltZW50VHlwZSA9IGV4dC5zbGljZSgxKSBhcyBFeHBlcmltZW50VHlwZTtcbiAgICAgICAgICAgIEdsb2IuQmlnQ29uZmlnLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgICAgY29uc29sZS5sb2coeyBvdmVyd3JpdGUsIGFjdGlvbiwgZmlsZSB9KTtcbiAgICAgICAgICAgIGlmICggdHlwZW9mIG92ZXJ3cml0ZSAhPT0gJ3N0cmluZycgKSB7IC8vIHVuZGVmaW5lZDogbmV3IGZpbGUsIHRydWU6IGNsaWNrZWQgb3ZlcndyaXRlLFxuICAgICAgICAgICAgICAgIEdsb2IuQmlnQ29uZmlnLnNldFN1YmNvbmZpZyhmaWxlLCBleHBlcmltZW50VHlwZSwgc3ViY29uZmlnKTtcbiAgICAgICAgICAgICAgICBsZXQgdmVyYiA9IG92ZXJ3cml0ZSA9PT0gdW5kZWZpbmVkID8gJ2NyZWF0ZWQnIDogJ292ZXJ3cml0dGVuJztcbiAgICAgICAgICAgICAgICBNeUFsZXJ0LnNtYWxsLnN1Y2Nlc3MoYENvbmZpZyAke3ZlcmJ9OiAke2ZpbGV9LmApO1xuICAgICAgICAgICAgfSBlbHNlIHsgLy8gc3RyaW5nOiBcIlVzZSBpdFwiXG4gICAgICAgICAgICAgICAgR2xvYi5CaWdDb25maWcuc2V0U3ViY29uZmlnKGZpbGUsIGV4cGVyaW1lbnRUeXBlKTtcbiAgICAgICAgICAgICAgICBNeUFsZXJ0LnNtYWxsLnN1Y2Nlc3MoYENvbmZpZyBsb2FkZWQ6ICR7ZmlsZX0uYCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uZmlnSW5wdXQucGxhY2Vob2xkZXIgPSBgQ3VycmVudDogJHtmaWxlfWA7XG4gICAgICAgICAgICBjb25maWdTdWJtaXQucmVwbGFjZUNsYXNzKCdhY3RpdmUnLCAnaW5hY3RpdmUnKTtcbiAgICAgICAgICAgIGNvbmZpZ0lucHV0LnZhbHVlID0gJyc7XG4gICAgICAgICAgICBpZiAoIEdsb2IuQmlnQ29uZmlnLmRldi5yZWxvYWRfcGFnZV9vbl9zdWJtaXQoKSApIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB1dGlsLndhaXQoMzAwMCk7XG4gICAgICAgICAgICAgICAgdXRpbC5yZWxvYWRQYWdlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBjb25maWdTdWJtaXQucmVwbGFjZUNsYXNzKCdhY3RpdmUnLCAnaW5hY3RpdmUnKTtcbiAgICAgICAgY29uZmlnSW5wdXQudmFsdWUgPSAnJztcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbn1cblxuXG5jb25zdCBzZXR0aW5nc0RpdiA9IG5ldyBTZXR0aW5nc0Rpdih7IGlkIDogJ3NldHRpbmdzX2RpdicgfSk7XG5leHBvcnQgZGVmYXVsdCBzZXR0aW5nc0RpdjtcblxuIl19