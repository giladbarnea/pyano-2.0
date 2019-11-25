import { Button, Div, Input } from "./index";
declare class InputAndSubmitFlex extends Div {
    submitButton: Button;
    inputElem: Input;
    constructor({ placeholder }: {
        placeholder: any;
    });
}
export declare class InputSection extends Div {
    inputAndSubmitFlex: InputAndSubmitFlex;
    constructor({ placeholder, h3text }: {
        placeholder: any;
        h3text: any;
    });
}
export {};
//# sourceMappingURL=extra.d.ts.map