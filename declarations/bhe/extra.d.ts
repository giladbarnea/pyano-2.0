import { Button, Div, Input } from "./index";
interface InputAndSubmitFlexOptions {
    placeholder: string;
    suggestions: string[];
    illegalRegex?: RegExp;
}
declare class InputAndSubmitFlex extends Div {
    submit: Button;
    input: Input;
    private readonly _suggestions;
    constructor(options: InputAndSubmitFlexOptions);
    toggleSubmitButtonOnInput(): void;
}
interface InputSectionOptions {
    h3text: string;
    placeholder: string;
    suggestions: string[];
    illegalRegex?: RegExp;
}
export declare class InputSection extends Div {
    flex: InputAndSubmitFlex;
    constructor(options: InputSectionOptions);
}
export {};
//# sourceMappingURL=extra.d.ts.map