import { Div, Span } from "../../../bhe";
declare class Input extends Div {
    editable: Span;
    constructor();
    private autoComplete;
    private onKeyDown;
}
declare class SubjectDiv extends Div {
    input: Input;
    constructor({ id }: {
        id: any;
    });
}
declare const subjectDiv: SubjectDiv;
export default subjectDiv;
//# sourceMappingURL=subject.d.ts.map