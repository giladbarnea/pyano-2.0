import { Button, Div, Input } from "./index";
declare class InputAndSubmitFlex extends Div {
    submitButton: Button;
    inputElem: Input;
    constructor({ placeholder, suggestions }: {
        placeholder: any;
        suggestions: any;
    });
    toggleSubmitButtonOnInput(): void;
}
export declare class InputSection extends Div {
    inputAndSubmitFlex: InputAndSubmitFlex;
    constructor({ placeholder, h3text, suggestions }: {
        placeholder: any;
        h3text: any;
        suggestions: any;
    });
}
export {};
//# sourceMappingURL=extra.d.ts.map