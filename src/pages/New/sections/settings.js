"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../../bhe");
const extra_1 = require("../../../bhe/extra");
const Glob_1 = require("../../../Glob");
const fs = require("fs");
class SettingsDiv extends bhe_1.Div {
    constructor({ id }) {
        super({ id });
        const experimentType = Glob_1.default.BigConfig.experiment_type;
        const subconfigFile = Glob_1.default.BigConfig[`${experimentType}_file`];
        const configs = fs.readdirSync(CONFIGS_PATH_ABS);
        const fileSection = new extra_1.InputSection({
            placeholder: `Current: ${subconfigFile}`,
            h3text: 'Config File',
            suggestions: configs,
            overwriteWarn: true
        });
        const subjectSection = new extra_1.InputSection({
            placeholder: 'Subject id',
            h3text: 'Subject',
            suggestions: Glob_1.default.BigConfig.subjects
        });
        const subtitle = bhe_1.elem({ tag: 'h2', text: 'Settings' });
        this.cacheAppend({ subtitle, fileSection, subjectSection });
    }
}
const settingsDiv = new SettingsDiv({ id: 'settings_div' });
exports.default = settingsDiv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLHNDQUF5QztBQUV6Qyw4Q0FBa0Q7QUFDbEQsd0NBQWlDO0FBQ2pDLHlCQUF5QjtBQUt6QixNQUFNLFdBQVksU0FBUSxTQUFHO0lBR3pCLFlBQVksRUFBRSxFQUFFLEVBQUU7UUFDZCxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2QsTUFBTSxjQUFjLEdBQUcsY0FBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUM7UUFDdEQsTUFBTSxhQUFhLEdBQUcsY0FBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLGNBQWMsT0FBTyxDQUFDLENBQUM7UUFDL0QsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sV0FBVyxHQUFHLElBQUksb0JBQVksQ0FBQztZQUNqQyxXQUFXLEVBQUcsWUFBWSxhQUFhLEVBQUU7WUFDekMsTUFBTSxFQUFHLGFBQWE7WUFDdEIsV0FBVyxFQUFHLE9BQU87WUFDckIsYUFBYSxFQUFFLElBQUk7U0FDdEIsQ0FBQyxDQUFDO1FBR0gsTUFBTSxjQUFjLEdBQUcsSUFBSSxvQkFBWSxDQUFDO1lBQ3BDLFdBQVcsRUFBRyxZQUFZO1lBQzFCLE1BQU0sRUFBRyxTQUFTO1lBQ2xCLFdBQVcsRUFBRyxjQUFJLENBQUMsU0FBUyxDQUFDLFFBQVE7U0FDeEMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxRQUFRLEdBQUcsVUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFHLElBQUksRUFBRSxJQUFJLEVBQUcsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFBO0lBSy9ELENBQUM7Q0FHSjtBQUdELE1BQU0sV0FBVyxHQUFHLElBQUksV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFHLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDN0Qsa0JBQWUsV0FBVyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gKiAgcGFnZXMvTmV3L3NlY3Rpb25zL3NldHRpbmdzXG5cbi8qKlxuICogaW1wb3J0IHNlY3Rpb25zIGZyb20gXCIuL3NlY3Rpb25zXCJcbiAqIHNlY3Rpb25zLnNldHRpbmdzKi9cbmltcG9ydCB7IGVsZW0sIERpdiB9IGZyb20gXCIuLi8uLi8uLi9iaGVcIjtcbmltcG9ydCAqIGFzIFN1Z2dlc3Rpb25zIGZyb20gJ3N1Z2dlc3Rpb25zJ1xuaW1wb3J0IHsgSW5wdXRTZWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2JoZS9leHRyYVwiO1xuaW1wb3J0IEdsb2IgZnJvbSBcIi4uLy4uLy4uL0dsb2JcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuXG4vLyAqKiogIEZJTEVcblxuXG5jbGFzcyBTZXR0aW5nc0RpdiBleHRlbmRzIERpdiB7XG4gICAgZmlsZVNlY3Rpb246IElucHV0U2VjdGlvbjtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih7IGlkIH0pIHtcbiAgICAgICAgc3VwZXIoeyBpZCB9KTtcbiAgICAgICAgY29uc3QgZXhwZXJpbWVudFR5cGUgPSBHbG9iLkJpZ0NvbmZpZy5leHBlcmltZW50X3R5cGU7XG4gICAgICAgIGNvbnN0IHN1YmNvbmZpZ0ZpbGUgPSBHbG9iLkJpZ0NvbmZpZ1tgJHtleHBlcmltZW50VHlwZX1fZmlsZWBdO1xuICAgICAgICBjb25zdCBjb25maWdzID0gZnMucmVhZGRpclN5bmMoQ09ORklHU19QQVRIX0FCUyk7XG4gICAgICAgIGNvbnN0IGZpbGVTZWN0aW9uID0gbmV3IElucHV0U2VjdGlvbih7XG4gICAgICAgICAgICBwbGFjZWhvbGRlciA6IGBDdXJyZW50OiAke3N1YmNvbmZpZ0ZpbGV9YCxcbiAgICAgICAgICAgIGgzdGV4dCA6ICdDb25maWcgRmlsZScsXG4gICAgICAgICAgICBzdWdnZXN0aW9ucyA6IGNvbmZpZ3MsXG4gICAgICAgICAgICBvdmVyd3JpdGVXYXJuOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHN1YmplY3RTZWN0aW9uID0gbmV3IElucHV0U2VjdGlvbih7XG4gICAgICAgICAgICBwbGFjZWhvbGRlciA6ICdTdWJqZWN0IGlkJyxcbiAgICAgICAgICAgIGgzdGV4dCA6ICdTdWJqZWN0JyxcbiAgICAgICAgICAgIHN1Z2dlc3Rpb25zIDogR2xvYi5CaWdDb25maWcuc3ViamVjdHNcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBzdWJ0aXRsZSA9IGVsZW0oeyB0YWcgOiAnaDInLCB0ZXh0IDogJ1NldHRpbmdzJyB9KTtcbiAgICAgICAgdGhpcy5jYWNoZUFwcGVuZCh7IHN1YnRpdGxlLCBmaWxlU2VjdGlvbiwgc3ViamVjdFNlY3Rpb24gfSlcbiAgICAgICAgLyp0aGlzLmNhY2hlQXBwZW5kKHtcbiAgICAgICAgIGFkZExldmVsQnRuIDogYnV0dG9uKHsgY2xzIDogJ2FjdGl2ZScsIGh0bWwgOiAnQWRkIExldmVsJywgY2xpY2sgOiB0aGlzLmFkZExldmVsIH0pLFxuICAgICAgICAgXG4gICAgICAgICB9KSovXG4gICAgfVxuICAgIFxuICAgIFxufVxuXG5cbmNvbnN0IHNldHRpbmdzRGl2ID0gbmV3IFNldHRpbmdzRGl2KHsgaWQgOiAnc2V0dGluZ3NfZGl2JyB9KTtcbmV4cG9ydCBkZWZhdWx0IHNldHRpbmdzRGl2O1xuXG4iXX0=