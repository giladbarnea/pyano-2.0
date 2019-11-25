import { Div } from "../../../bhe";
import { InputSection } from "../../../bhe/extra";
declare class SettingsDiv extends Div {
    fileSection: InputSection;
    private subjectSection;
    constructor({ id }: {
        id: any;
    });
    private onSubjectSubmit;
    private onFileSubmit;
}
declare const settingsDiv: SettingsDiv;
export default settingsDiv;
//# sourceMappingURL=settings.d.ts.map