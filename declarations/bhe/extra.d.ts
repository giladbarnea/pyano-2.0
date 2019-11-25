import { Button, Div, Input } from "./index";
interface InputAndSubmitFlexOptions {
    placeholder: string;
    suggestions: string[];
}
declare class InputAndSubmitFlex extends Div {
    submitButton: Button;
    inputElem: Input;
    private readonly _suggestions;
    constructor(options: InputAndSubmitFlexOptions);
    toggleSubmitButtonOnInput(): void;
}
interface InputSectionOptions {
    h3text: string;
    placeholder: string;
    suggestions: string[];
}
export declare class InputSection extends Div {
    inputAndSubmitFlex: InputAndSubmitFlex;
    constructor(options: InputSectionOptions);
}
export {};
//# sourceMappingURL=extra.d.ts.map