"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../../bhe");
const extra_1 = require("../../../bhe/extra");
const Glob_1 = require("../../../Glob");
const fs = require("fs");
const MyAlert_1 = require("../../../MyAlert");
const MyFs_1 = require("../../../MyFs");
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
                            return MyAlert_1.default.small.info('Not overwriting');
                        }
                    }
                }
                const experimentType = ext.slice(1);
                Glob_1.default.BigConfig.experiment_type = experimentType;
                if (overwrite !== false) {
                    Glob_1.default.BigConfig.setSubconfig(file, experimentType, subconfig);
                }
                else {
                    Glob_1.default.BigConfig.setSubconfig(file, experimentType);
                }
                MyAlert_1.default.small.success(`Config set: ${file}.`);
                fileInput.placeholder = `Current: ${file}`;
            }
            fileSubmit.replaceClass('active', 'inactive');
            fileInput.value = '';
        };
    }
}
const settingsDiv = new SettingsDiv({ id: 'settings_div' });
exports.default = settingsDiv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLHNDQUFnRTtBQUVoRSw4Q0FBa0Q7QUFDbEQsd0NBQWlDO0FBQ2pDLHlCQUF5QjtBQUV6Qiw4Q0FBc0M7QUFDdEMsd0NBQWlDO0FBR2pDLE1BQU0sV0FBWSxTQUFRLFNBQUc7SUFHekIsWUFBWSxFQUFFLEVBQUUsRUFBRTtRQUNkLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFZCxNQUFNLGNBQWMsR0FBRyxjQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQztRQUN0RCxNQUFNLGFBQWEsR0FBVyxjQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsY0FBYyxPQUFPLENBQUMsQ0FBQztRQUN2RSxNQUFNLFNBQVMsR0FBYyxjQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzVELE1BQU0sT0FBTyxHQUFhLEVBQUUsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMzRCxNQUFNLFdBQVcsR0FBRyxJQUFJLG9CQUFZLENBQUM7WUFDakMsV0FBVyxFQUFHLFlBQVksYUFBYSxFQUFFO1lBQ3pDLE1BQU0sRUFBRyxhQUFhO1lBQ3RCLFdBQVcsRUFBRyxPQUFPO1NBRXhCLENBQUMsQ0FBQztRQUVILE1BQU0sRUFBRSxZQUFZLEVBQUcsVUFBVSxFQUFFLFNBQVMsRUFBRyxTQUFTLEVBQUUsR0FBRyxXQUFXLENBQUMsa0JBQWtCLENBQUM7UUFDNUYsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBRTlGLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1FBRXpDLE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxPQUFP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Q0gsY0FBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFBO2lCQUVwRDtnQkFFRCxpQkFBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBZSxJQUFJLEdBQUcsQ0FBQyxDQUFDO2dCQUM5QyxTQUFTLENBQUMsV0FBVyxHQUFHLFlBQVksSUFBSSxFQUFFLENBQUM7YUFFOUM7WUFDRCxVQUFVLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM5QyxTQUFTLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUd6QixDQUFDLENBQUM7SUFDTixDQUFDO0NBQ0o7QUFHRCxNQUFNLFdBQVcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0FBQzdELGtCQUFlLFdBQVcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vICogIHBhZ2VzL05ldy9zZWN0aW9ucy9zZXR0aW5nc1xuXG4vKipcbiAqIGltcG9ydCBzZWN0aW9ucyBmcm9tIFwiLi9zZWN0aW9uc1wiXG4gKiBzZWN0aW9ucy5zZXR0aW5ncyovXG5pbXBvcnQgeyBlbGVtLCBEaXYsIGJ1dHRvbiwgSW5wdXQsIEJ1dHRvbiB9IGZyb20gXCIuLi8uLi8uLi9iaGVcIjtcblxuaW1wb3J0IHsgSW5wdXRTZWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2JoZS9leHRyYVwiO1xuaW1wb3J0IEdsb2IgZnJvbSBcIi4uLy4uLy4uL0dsb2JcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuXG5pbXBvcnQgTXlBbGVydCBmcm9tICcuLi8uLi8uLi9NeUFsZXJ0J1xuaW1wb3J0IG15ZnMgZnJvbSBcIi4uLy4uLy4uL015RnNcIjtcbmltcG9ydCB7IEV4cGVyaW1lbnRUeXBlLCBTdWJjb25maWcgfSBmcm9tIFwiLi4vLi4vLi4vTXlTdG9yZVwiO1xuXG5jbGFzcyBTZXR0aW5nc0RpdiBleHRlbmRzIERpdiB7XG4gICAgZmlsZVNlY3Rpb246IElucHV0U2VjdGlvbjtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih7IGlkIH0pIHtcbiAgICAgICAgc3VwZXIoeyBpZCB9KTtcbiAgICAgICAgLy8gKioqICBGaWxlXG4gICAgICAgIGNvbnN0IGV4cGVyaW1lbnRUeXBlID0gR2xvYi5CaWdDb25maWcuZXhwZXJpbWVudF90eXBlO1xuICAgICAgICBjb25zdCBzdWJjb25maWdGaWxlOiBzdHJpbmcgPSBHbG9iLkJpZ0NvbmZpZ1tgJHtleHBlcmltZW50VHlwZX1fZmlsZWBdO1xuICAgICAgICBjb25zdCBzdWJjb25maWc6IFN1YmNvbmZpZyA9IEdsb2IuQmlnQ29uZmlnW2V4cGVyaW1lbnRUeXBlXTtcbiAgICAgICAgY29uc3QgY29uZmlnczogc3RyaW5nW10gPSBmcy5yZWFkZGlyU3luYyhDT05GSUdTX1BBVEhfQUJTKTtcbiAgICAgICAgY29uc3QgZmlsZVNlY3Rpb24gPSBuZXcgSW5wdXRTZWN0aW9uKHtcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyIDogYEN1cnJlbnQ6ICR7c3ViY29uZmlnRmlsZX1gLFxuICAgICAgICAgICAgaDN0ZXh0IDogJ0NvbmZpZyBGaWxlJyxcbiAgICAgICAgICAgIHN1Z2dlc3Rpb25zIDogY29uZmlncyxcbiAgICAgICAgICAgIC8vIG92ZXJ3cml0ZVdhcm4gOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgeyBzdWJtaXRCdXR0b24gOiBmaWxlU3VibWl0LCBpbnB1dEVsZW0gOiBmaWxlSW5wdXQgfSA9IGZpbGVTZWN0aW9uLmlucHV0QW5kU3VibWl0RmxleDtcbiAgICAgICAgZmlsZVN1Ym1pdC5jbGljayh0aGlzLm9uRmlsZVN1Ym1pdChmaWxlSW5wdXQsIHN1YmNvbmZpZ0ZpbGUsIGNvbmZpZ3MsIHN1YmNvbmZpZywgZmlsZVN1Ym1pdCkpO1xuICAgICAgICAvLyAqKiogIFN1YmplY3RcbiAgICAgICAgY29uc3Qgc3ViamVjdHMgPSBHbG9iLkJpZ0NvbmZpZy5zdWJqZWN0cztcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGN1cnJlbnRTdWJqZWN0ID0gc3ViY29uZmlnLnN1YmplY3Q7XG4gICAgICAgIGNvbnN0IHN1YmplY3RTZWN0aW9uID0gbmV3IElucHV0U2VjdGlvbih7XG4gICAgICAgICAgICBwbGFjZWhvbGRlciA6IGBDdXJyZW50OiAke2N1cnJlbnRTdWJqZWN0fWAsXG4gICAgICAgICAgICBoM3RleHQgOiAnU3ViamVjdCcsXG4gICAgICAgICAgICBzdWdnZXN0aW9ucyA6IHN1YmplY3RzXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB7IHN1Ym1pdEJ1dHRvbiA6IHN1YmplY3RTdWJtaXQsIGlucHV0RWxlbSA6IHN1YmplY3RJbnB1dCB9ID0gc3ViamVjdFNlY3Rpb24uaW5wdXRBbmRTdWJtaXRGbGV4O1xuICAgICAgICBzdWJqZWN0U3VibWl0LmNsaWNrKChldjogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3N1YmplY3Qgc3VibWl0LCcsIGV2KTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3ViamVjdElucHV0LnZhbHVlO1xuICAgICAgICAgICAgaWYgKCBjdXJyZW50U3ViamVjdCA9PT0gdmFsdWUgKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgTXlBbGVydC5zbWFsbC5pbmZvKGAke2N1cnJlbnRTdWJqZWN0fSB3YXMgYWxyZWFkeSB0aGUgY2hvc2VuIHN1YmplY3RgKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdWJjb25maWcuc3ViamVjdCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIE15QWxlcnQuc21hbGwuc3VjY2VzcyhgU3ViamVjdCBzZXQ6ICR7dmFsdWV9LmApO1xuICAgICAgICAgICAgICAgIHN1YmplY3RJbnB1dC5wbGFjZWhvbGRlciA9IGBDdXJyZW50OiAke3ZhbHVlfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdWJqZWN0U3VibWl0LnJlcGxhY2VDbGFzcygnYWN0aXZlJywgJ2luYWN0aXZlJyk7XG4gICAgICAgICAgICBzdWJqZWN0SW5wdXQudmFsdWUgPSAnJztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBzdWJ0aXRsZSA9IGVsZW0oeyB0YWcgOiAnaDInLCB0ZXh0IDogJ1NldHRpbmdzJyB9KTtcbiAgICAgICAgdGhpcy5jYWNoZUFwcGVuZCh7IHN1YnRpdGxlLCBmaWxlU2VjdGlvbiwgc3ViamVjdFNlY3Rpb24gfSlcbiAgICAgICAgLyp0aGlzLmNhY2hlQXBwZW5kKHtcbiAgICAgICAgIGFkZExldmVsQnRuIDogYnV0dG9uKHsgY2xzIDogJ2FjdGl2ZScsIGh0bWwgOiAnQWRkIExldmVsJywgY2xpY2sgOiB0aGlzLmFkZExldmVsIH0pLFxuICAgICAgICAgXG4gICAgICAgICB9KSovXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHByaXZhdGUgb25GaWxlU3VibWl0KGZpbGVJbnB1dDogSW5wdXQsIHN1YmNvbmZpZ0ZpbGU6IHN0cmluZywgY29uZmlnczogc3RyaW5nW10sIHN1YmNvbmZpZzogU3ViY29uZmlnLCBmaWxlU3VibWl0OiBCdXR0b24pIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jIChldjogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmlsZSA9IGZpbGVJbnB1dC52YWx1ZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmaWxlIHN1Ym1pdCwnLCBmaWxlKTtcbiAgICAgICAgICAgIGNvbnN0IFsgZmlsZW5hbWUsIGV4dCBdID0gbXlmcy5zcGxpdF9leHQoZmlsZSk7XG4gICAgICAgICAgICBpZiAoICFbICcuZXhhbScsICcudGVzdCcgXS5pbmNsdWRlcyhleHQpICkge1xuICAgICAgICAgICAgICAgIGZpbGVJbnB1dC5hZGRDbGFzcygnaW52YWxpZCcpO1xuICAgICAgICAgICAgICAgIE15QWxlcnQuc21hbGwud2FybmluZygnRmlsZSBuYW1lIG11c3QgZW5kIHdpdGggZWl0aGVyIC5leGFtIG9yIC50ZXN0Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaWxlSW5wdXQucmVtb3ZlQ2xhc3MoJ2ludmFsaWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGZpbGVMb3dlciA9IGZpbGUubG93ZXIoKTtcbiAgICAgICAgICAgIGlmICggc3ViY29uZmlnRmlsZS5sb3dlcigpID09PSBmaWxlTG93ZXIgKSB7XG4gICAgICAgICAgICAgICAgTXlBbGVydC5zbWFsbC5pbmZvKGAke3N1YmNvbmZpZ0ZpbGV9IHdhcyBhbHJlYWR5IHRoZSBjaG9zZW4gZmlsZWApXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBvdmVyd3JpdGU7XG4gICAgICAgICAgICAgICAgZm9yICggbGV0IGNmZyBvZiBjb25maWdzICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIGNmZy5sb3dlcigpID09PSBmaWxlTG93ZXIgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBvdmVyd3JpdGUgb3IgbG9hZFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgeyB2YWx1ZSB9ID0gYXdhaXQgTXlBbGVydC5iaWcuYmxvY2tpbmcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlIDogYCR7Y2ZnfSBhbHJlYWR5IGV4aXN0cywgd2hhdCBkbyB5b3Ugd2FudCB0byBkbz9gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpcm1CdXR0b25UZXh0IDogJ1VzZSBpdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25CZWZvcmVPcGVuIDogKG1vZGFsOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZWwgPSBlbGVtKHsgaHRtbEVsZW1lbnQgOiBtb2RhbCwgY2hpbGRyZW4gOiB7IGFjdGlvbnMgOiAnLnN3YWwyLWFjdGlvbnMnIH0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwuYWN0aW9ucy5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidXR0b24oeyBjbHMgOiBcInN3YWwyLWNvbmZpcm0gc3dhbDItc3R5bGVkIHdhcm5cIiwgaHRtbCA6ICdPdmVyd3JpdGUgaXQnIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoeyB0eXBlIDogJ2J1dHRvbicgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY3NzKHsgYmFja2dyb3VuZENvbG9yIDogJyNGRkM2NkQnLCBjb2xvciA6ICdibGFjaycgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2xpY2soKGV2OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJ3cml0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE15QWxlcnQuY2xpY2tDYW5jZWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHZhbHVlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJ3cml0ZSA9IGNmZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoICFvdmVyd3JpdGUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE15QWxlcnQuc21hbGwuaW5mbygnTm90IG92ZXJ3cml0aW5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBleHBlcmltZW50VHlwZSA9IGV4dC5zbGljZSgxKSBhcyBFeHBlcmltZW50VHlwZTtcbiAgICAgICAgICAgICAgICBHbG9iLkJpZ0NvbmZpZy5leHBlcmltZW50X3R5cGUgPSBleHBlcmltZW50VHlwZTtcbiAgICAgICAgICAgICAgICBpZiAoIG92ZXJ3cml0ZSAhPT0gZmFsc2UgKSB7IC8vIHVuZGVmaW5lZDogbmV3IGZpbGUsIHRydWU6IGNsaWNrZWQgb3ZlcndyaXRlXG4gICAgICAgICAgICAgICAgICAgIEdsb2IuQmlnQ29uZmlnLnNldFN1YmNvbmZpZyhmaWxlLCBleHBlcmltZW50VHlwZSwgc3ViY29uZmlnKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIEdsb2IuQmlnQ29uZmlnLnNldFN1YmNvbmZpZyhmaWxlLCBleHBlcmltZW50VHlwZSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIE15QWxlcnQuc21hbGwuc3VjY2VzcyhgQ29uZmlnIHNldDogJHtmaWxlfS5gKTtcbiAgICAgICAgICAgICAgICBmaWxlSW5wdXQucGxhY2Vob2xkZXIgPSBgQ3VycmVudDogJHtmaWxlfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxlU3VibWl0LnJlcGxhY2VDbGFzcygnYWN0aXZlJywgJ2luYWN0aXZlJyk7XG4gICAgICAgICAgICBmaWxlSW5wdXQudmFsdWUgPSAnJztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgfVxufVxuXG5cbmNvbnN0IHNldHRpbmdzRGl2ID0gbmV3IFNldHRpbmdzRGl2KHsgaWQgOiAnc2V0dGluZ3NfZGl2JyB9KTtcbmV4cG9ydCBkZWZhdWx0IHNldHRpbmdzRGl2O1xuXG4iXX0=