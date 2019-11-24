import { Div, Button, Span } from "../../../bhe";
declare class Input extends Div {
    editable: Span;
    autocomplete: Span;
    constructor();
    private reset;
    private setText;
    private sendEnd;
    private doAutocomplete;
}
declare class SubjectDiv extends Div {
    input: Input;
    submitButton: Button;
    subtitle: Div;
    constructor({ id }: {
        id: any;
    });
}
declare const subjectDiv: SubjectDiv;
export default subjectDiv;
//# sourceMappingURL=subject.d.ts.map