"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../../bhe");
const extra_1 = require("../../../bhe/extra");
const Glob_1 = require("../../../Glob");
const fs = require("fs");
const MyAlert_1 = require("../../../MyAlert");
const MyFs_1 = require("../../../MyFs");
const util = require("../../../util");
class SettingsDiv extends bhe_1.Div {
    constructor({ id }) {
        super({ id });
        const experimentType = Glob_1.default.BigConfig.experiment_type;
        const subconfigFile = Glob_1.default.BigConfig[`${experimentType}_file`];
        const subconfig = Glob_1.default.BigConfig[experimentType];
        const configs = fs.readdirSync(CONFIGS_PATH_ABS);
        const fileSection = new extra_1.InputSection({
            placeholder: `Current: ${subconfigFile}`,
            h3text: 'Config File',
            suggestions: configs,
        });
        const { submitButton: fileSubmit, inputElem: fileInput } = fileSection.inputAndSubmitFlex;
        fileSubmit.click(this.onFileSubmit(fileInput, subconfigFile, configs, subconfig, fileSubmit));
        const subjects = Glob_1.default.BigConfig.subjects;
        const currentSubject = subconfig.subject;
        const subjectSection = new extra_1.InputSection({
            placeholder: `Current: ${currentSubject}`,
            h3text: 'Subject',
            suggestions: subjects
        });
        const { submitButton: subjectSubmit, inputElem: subjectInput } = subjectSection.inputAndSubmitFlex;
        subjectSubmit.click((ev) => {
            console.log('subject submit,', ev);
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
        });
        const subtitle = bhe_1.elem({ tag: 'h2', text: 'Settings' });
        this.cacheAppend({ subtitle, fileSection, subjectSection });
    }
    onFileSubmit(fileInput, subconfigFile, configs, subconfig, fileSubmit) {
        return async (ev) => {
            const file = fileInput.value;
            console.log('file submit,', file);
            const [filename, ext] = MyFs_1.default.split_ext(file);
            if (!['.exam', '.test'].includes(ext)) {
                fileInput.addClass('invalid');
                MyAlert_1.default.small.warning('File name must end with either .exam or .test');
                return;
            }
            else {
                fileInput.removeClass('invalid');
            }
            const fileLower = file.lower();
            if (subconfigFile.lower() === fileLower) {
                MyAlert_1.default.small.info(`${subconfigFile} was already the chosen file`);
            }
            else {
                let overwrite;
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
                                    overwrite = true;
                                    MyAlert_1.default.clickCancel();
                                }));
                            }
                        });
                        if (value) {
                            overwrite = cfg;
                            break;
                        }
                        else if (!overwrite) {
                            return;
                        }
                    }
                }
                const experimentType = ext.slice(1);
                Glob_1.default.BigConfig.experiment_type = experimentType;
                console.log({ overwrite });
                if (typeof overwrite !== 'string') {
                    Glob_1.default.BigConfig.setSubconfig(file, experimentType, subconfig);
                    let verb = overwrite === undefined ? 'created' : 'overwritten';
                    MyAlert_1.default.small.success(`Config ${verb}: ${file}.`);
                }
                else {
                    Glob_1.default.BigConfig.setSubconfig(file, experimentType);
                    MyAlert_1.default.small.success(`Config loaded: ${file}.`);
                }
                fileInput.placeholder = `Current: ${file}`;
                await util.wait(3000);
                util.reloadPage();
            }
            fileSubmit.replaceClass('active', 'inactive');
            fileInput.value = '';
        };
    }
}
const settingsDiv = new SettingsDiv({ id: 'settings_div' });
exports.default = settingsDiv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLHNDQUFnRTtBQUVoRSw4Q0FBa0Q7QUFDbEQsd0NBQWlDO0FBQ2pDLHlCQUF5QjtBQUV6Qiw4Q0FBc0M7QUFDdEMsd0NBQWlDO0FBQ2pDLHNDQUFzQztBQUd0QyxNQUFNLFdBQVksU0FBUSxTQUFHO0lBR3pCLFlBQVksRUFBRSxFQUFFLEVBQUU7UUFDZCxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWQsTUFBTSxjQUFjLEdBQUcsY0FBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUM7UUFDdEQsTUFBTSxhQUFhLEdBQVcsY0FBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLGNBQWMsT0FBTyxDQUFDLENBQUM7UUFDdkUsTUFBTSxTQUFTLEdBQWMsY0FBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM1RCxNQUFNLE9BQU8sR0FBYSxFQUFFLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDM0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxvQkFBWSxDQUFDO1lBQ2pDLFdBQVcsRUFBRyxZQUFZLGFBQWEsRUFBRTtZQUN6QyxNQUFNLEVBQUcsYUFBYTtZQUN0QixXQUFXLEVBQUcsT0FBTztTQUV4QixDQUFDLENBQUM7UUFFSCxNQUFNLEVBQUUsWUFBWSxFQUFHLFVBQVUsRUFBRSxTQUFTLEVBQUcsU0FBUyxFQUFFLEdBQUcsV0FBVyxDQUFDLGtCQUFrQixDQUFDO1FBQzVGLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUU5RixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUV6QyxNQUFNLGNBQWMsR0FBRyxT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Q0FBQztvQkFDN0QsSUFBSSxJQUFJLEdBQUcsU0FBUyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUM7b0JBQy9ELGlCQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksS0FBSyxJQUFJLEdBQUcsQ0FBQyxDQUFDO2lCQUNyRDtxQkFBTTtvQkFDSCxjQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBQ2xELGlCQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsSUFBSSxHQUFHLENBQUMsQ0FBQztpQkFFcEQ7Z0JBR0QsU0FBUyxDQUFDLFdBQVcsR0FBRyxZQUFZLElBQUksRUFBRSxDQUFDO2dCQUUzQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQzthQUVyQjtZQUNELFVBQVUsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzlDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBR3pCLENBQUMsQ0FBQztJQUNOLENBQUM7Q0FDSjtBQUdELE1BQU0sV0FBVyxHQUFHLElBQUksV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFHLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDN0Qsa0JBQWUsV0FBVyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gKiAgcGFnZXMvTmV3L3NlY3Rpb25zL3NldHRpbmdzXG5cbi8qKlxuICogaW1wb3J0IHNlY3Rpb25zIGZyb20gXCIuL3NlY3Rpb25zXCJcbiAqIHNlY3Rpb25zLnNldHRpbmdzKi9cbmltcG9ydCB7IGVsZW0sIERpdiwgYnV0dG9uLCBJbnB1dCwgQnV0dG9uIH0gZnJvbSBcIi4uLy4uLy4uL2JoZVwiO1xuXG5pbXBvcnQgeyBJbnB1dFNlY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vYmhlL2V4dHJhXCI7XG5pbXBvcnQgR2xvYiBmcm9tIFwiLi4vLi4vLi4vR2xvYlwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5cbmltcG9ydCBNeUFsZXJ0IGZyb20gJy4uLy4uLy4uL015QWxlcnQnXG5pbXBvcnQgbXlmcyBmcm9tIFwiLi4vLi4vLi4vTXlGc1wiO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tIFwiLi4vLi4vLi4vdXRpbFwiO1xuaW1wb3J0IHsgRXhwZXJpbWVudFR5cGUsIFN1YmNvbmZpZyB9IGZyb20gXCIuLi8uLi8uLi9NeVN0b3JlXCI7XG5cbmNsYXNzIFNldHRpbmdzRGl2IGV4dGVuZHMgRGl2IHtcbiAgICBmaWxlU2VjdGlvbjogSW5wdXRTZWN0aW9uO1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKHsgaWQgfSkge1xuICAgICAgICBzdXBlcih7IGlkIH0pO1xuICAgICAgICAvLyAqKiogIEZpbGVcbiAgICAgICAgY29uc3QgZXhwZXJpbWVudFR5cGUgPSBHbG9iLkJpZ0NvbmZpZy5leHBlcmltZW50X3R5cGU7XG4gICAgICAgIGNvbnN0IHN1YmNvbmZpZ0ZpbGU6IHN0cmluZyA9IEdsb2IuQmlnQ29uZmlnW2Ake2V4cGVyaW1lbnRUeXBlfV9maWxlYF07XG4gICAgICAgIGNvbnN0IHN1YmNvbmZpZzogU3ViY29uZmlnID0gR2xvYi5CaWdDb25maWdbZXhwZXJpbWVudFR5cGVdO1xuICAgICAgICBjb25zdCBjb25maWdzOiBzdHJpbmdbXSA9IGZzLnJlYWRkaXJTeW5jKENPTkZJR1NfUEFUSF9BQlMpO1xuICAgICAgICBjb25zdCBmaWxlU2VjdGlvbiA9IG5ldyBJbnB1dFNlY3Rpb24oe1xuICAgICAgICAgICAgcGxhY2Vob2xkZXIgOiBgQ3VycmVudDogJHtzdWJjb25maWdGaWxlfWAsXG4gICAgICAgICAgICBoM3RleHQgOiAnQ29uZmlnIEZpbGUnLFxuICAgICAgICAgICAgc3VnZ2VzdGlvbnMgOiBjb25maWdzLFxuICAgICAgICAgICAgLy8gb3ZlcndyaXRlV2FybiA6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB7IHN1Ym1pdEJ1dHRvbiA6IGZpbGVTdWJtaXQsIGlucHV0RWxlbSA6IGZpbGVJbnB1dCB9ID0gZmlsZVNlY3Rpb24uaW5wdXRBbmRTdWJtaXRGbGV4O1xuICAgICAgICBmaWxlU3VibWl0LmNsaWNrKHRoaXMub25GaWxlU3VibWl0KGZpbGVJbnB1dCwgc3ViY29uZmlnRmlsZSwgY29uZmlncywgc3ViY29uZmlnLCBmaWxlU3VibWl0KSk7XG4gICAgICAgIC8vICoqKiAgU3ViamVjdFxuICAgICAgICBjb25zdCBzdWJqZWN0cyA9IEdsb2IuQmlnQ29uZmlnLnN1YmplY3RzO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgY3VycmVudFN1YmplY3QgPSBzdWJjb25maWcuc3ViamVjdDtcbiAgICAgICAgY29uc3Qgc3ViamVjdFNlY3Rpb24gPSBuZXcgSW5wdXRTZWN0aW9uKHtcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyIDogYEN1cnJlbnQ6ICR7Y3VycmVudFN1YmplY3R9YCxcbiAgICAgICAgICAgIGgzdGV4dCA6ICdTdWJqZWN0JyxcbiAgICAgICAgICAgIHN1Z2dlc3Rpb25zIDogc3ViamVjdHNcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHsgc3VibWl0QnV0dG9uIDogc3ViamVjdFN1Ym1pdCwgaW5wdXRFbGVtIDogc3ViamVjdElucHV0IH0gPSBzdWJqZWN0U2VjdGlvbi5pbnB1dEFuZFN1Ym1pdEZsZXg7XG4gICAgICAgIHN1YmplY3RTdWJtaXQuY2xpY2soKGV2OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnc3ViamVjdCBzdWJtaXQsJywgZXYpO1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBzdWJqZWN0SW5wdXQudmFsdWU7XG4gICAgICAgICAgICBpZiAoIGN1cnJlbnRTdWJqZWN0ID09PSB2YWx1ZSApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBNeUFsZXJ0LnNtYWxsLmluZm8oYCR7Y3VycmVudFN1YmplY3R9IHdhcyBhbHJlYWR5IHRoZSBjaG9zZW4gc3ViamVjdGApXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN1YmNvbmZpZy5zdWJqZWN0ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgTXlBbGVydC5zbWFsbC5zdWNjZXNzKGBTdWJqZWN0IHNldDogJHt2YWx1ZX0uYCk7XG4gICAgICAgICAgICAgICAgc3ViamVjdElucHV0LnBsYWNlaG9sZGVyID0gYEN1cnJlbnQ6ICR7dmFsdWV9YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1YmplY3RTdWJtaXQucmVwbGFjZUNsYXNzKCdhY3RpdmUnLCAnaW5hY3RpdmUnKTtcbiAgICAgICAgICAgIHN1YmplY3RJbnB1dC52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHN1YnRpdGxlID0gZWxlbSh7IHRhZyA6ICdoMicsIHRleHQgOiAnU2V0dGluZ3MnIH0pO1xuICAgICAgICB0aGlzLmNhY2hlQXBwZW5kKHsgc3VidGl0bGUsIGZpbGVTZWN0aW9uLCBzdWJqZWN0U2VjdGlvbiB9KVxuICAgICAgICAvKnRoaXMuY2FjaGVBcHBlbmQoe1xuICAgICAgICAgYWRkTGV2ZWxCdG4gOiBidXR0b24oeyBjbHMgOiAnYWN0aXZlJywgaHRtbCA6ICdBZGQgTGV2ZWwnLCBjbGljayA6IHRoaXMuYWRkTGV2ZWwgfSksXG4gICAgICAgICBcbiAgICAgICAgIH0pKi9cbiAgICB9XG4gICAgXG4gICAgXG4gICAgcHJpdmF0ZSBvbkZpbGVTdWJtaXQoZmlsZUlucHV0OiBJbnB1dCwgc3ViY29uZmlnRmlsZTogc3RyaW5nLCBjb25maWdzOiBzdHJpbmdbXSwgc3ViY29uZmlnOiBTdWJjb25maWcsIGZpbGVTdWJtaXQ6IEJ1dHRvbikge1xuICAgICAgICByZXR1cm4gYXN5bmMgKGV2OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmaWxlID0gZmlsZUlucHV0LnZhbHVlO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZpbGUgc3VibWl0LCcsIGZpbGUpO1xuICAgICAgICAgICAgY29uc3QgWyBmaWxlbmFtZSwgZXh0IF0gPSBteWZzLnNwbGl0X2V4dChmaWxlKTtcbiAgICAgICAgICAgIGlmICggIVsgJy5leGFtJywgJy50ZXN0JyBdLmluY2x1ZGVzKGV4dCkgKSB7XG4gICAgICAgICAgICAgICAgZmlsZUlucHV0LmFkZENsYXNzKCdpbnZhbGlkJyk7XG4gICAgICAgICAgICAgICAgTXlBbGVydC5zbWFsbC53YXJuaW5nKCdGaWxlIG5hbWUgbXVzdCBlbmQgd2l0aCBlaXRoZXIgLmV4YW0gb3IgLnRlc3QnKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpbGVJbnB1dC5yZW1vdmVDbGFzcygnaW52YWxpZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZmlsZUxvd2VyID0gZmlsZS5sb3dlcigpO1xuICAgICAgICAgICAgaWYgKCBzdWJjb25maWdGaWxlLmxvd2VyKCkgPT09IGZpbGVMb3dlciApIHtcbiAgICAgICAgICAgICAgICBNeUFsZXJ0LnNtYWxsLmluZm8oYCR7c3ViY29uZmlnRmlsZX0gd2FzIGFscmVhZHkgdGhlIGNob3NlbiBmaWxlYClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IG92ZXJ3cml0ZTtcbiAgICAgICAgICAgICAgICBmb3IgKCBsZXQgY2ZnIG9mIGNvbmZpZ3MgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggY2ZnLmxvd2VyKCkgPT09IGZpbGVMb3dlciApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgeyB2YWx1ZSB9ID0gYXdhaXQgTXlBbGVydC5iaWcuYmxvY2tpbmcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlIDogYCR7Y2ZnfSBhbHJlYWR5IGV4aXN0cywgd2hhdCBkbyB5b3Ugd2FudCB0byBkbz9gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpcm1CdXR0b25UZXh0IDogJ1VzZSBpdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25CZWZvcmVPcGVuIDogKG1vZGFsOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZWwgPSBlbGVtKHsgaHRtbEVsZW1lbnQgOiBtb2RhbCwgY2hpbGRyZW4gOiB7IGFjdGlvbnMgOiAnLnN3YWwyLWFjdGlvbnMnIH0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwuYWN0aW9ucy5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidXR0b24oeyBjbHMgOiBcInN3YWwyLWNvbmZpcm0gc3dhbDItc3R5bGVkIHdhcm5cIiwgaHRtbCA6ICdPdmVyd3JpdGUgaXQnIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoeyB0eXBlIDogJ2J1dHRvbicgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY3NzKHsgYmFja2dyb3VuZENvbG9yIDogJyNGRkM2NkQnLCBjb2xvciA6ICdibGFjaycgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2xpY2soKGV2OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJ3cml0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE15QWxlcnQuY2xpY2tDYW5jZWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHZhbHVlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJ3cml0ZSA9IGNmZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoICFvdmVyd3JpdGUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgZXhwZXJpbWVudFR5cGUgPSBleHQuc2xpY2UoMSkgYXMgRXhwZXJpbWVudFR5cGU7XG4gICAgICAgICAgICAgICAgR2xvYi5CaWdDb25maWcuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coeyBvdmVyd3JpdGUgfSk7XG4gICAgICAgICAgICAgICAgaWYgKCB0eXBlb2Ygb3ZlcndyaXRlICE9PSAnc3RyaW5nJyApIHsgLy8gdW5kZWZpbmVkOiBuZXcgZmlsZSwgdHJ1ZTogY2xpY2tlZCBvdmVyd3JpdGUsXG4gICAgICAgICAgICAgICAgICAgIEdsb2IuQmlnQ29uZmlnLnNldFN1YmNvbmZpZyhmaWxlLCBleHBlcmltZW50VHlwZSwgc3ViY29uZmlnKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZlcmIgPSBvdmVyd3JpdGUgPT09IHVuZGVmaW5lZCA/ICdjcmVhdGVkJyA6ICdvdmVyd3JpdHRlbic7XG4gICAgICAgICAgICAgICAgICAgIE15QWxlcnQuc21hbGwuc3VjY2VzcyhgQ29uZmlnICR7dmVyYn06ICR7ZmlsZX0uYCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gc3RyaW5nOiBcIlVzZSBpdFwiXG4gICAgICAgICAgICAgICAgICAgIEdsb2IuQmlnQ29uZmlnLnNldFN1YmNvbmZpZyhmaWxlLCBleHBlcmltZW50VHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIE15QWxlcnQuc21hbGwuc3VjY2VzcyhgQ29uZmlnIGxvYWRlZDogJHtmaWxlfS5gKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZpbGVJbnB1dC5wbGFjZWhvbGRlciA9IGBDdXJyZW50OiAke2ZpbGV9YDtcbiAgICBcbiAgICAgICAgICAgICAgICBhd2FpdCB1dGlsLndhaXQoMzAwMCk7XG4gICAgICAgICAgICAgICAgdXRpbC5yZWxvYWRQYWdlKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxlU3VibWl0LnJlcGxhY2VDbGFzcygnYWN0aXZlJywgJ2luYWN0aXZlJyk7XG4gICAgICAgICAgICBmaWxlSW5wdXQudmFsdWUgPSAnJztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgfVxufVxuXG5cbmNvbnN0IHNldHRpbmdzRGl2ID0gbmV3IFNldHRpbmdzRGl2KHsgaWQgOiAnc2V0dGluZ3NfZGl2JyB9KTtcbmV4cG9ydCBkZWZhdWx0IHNldHRpbmdzRGl2O1xuXG4iXX0=