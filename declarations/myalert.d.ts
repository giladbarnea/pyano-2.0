/// <reference types="./node_modules/sweetalert2" />
import Swal, { SweetAlertOptions, SweetAlertResult, SweetAlertType } from 'sweetalert2';
import { BetterHTMLElement } from "./bhe";
declare type Small = {
    _error(options: SweetAlertOptions): Promise<SweetAlertResult>;
    _info(options: SweetAlertOptions): Promise<SweetAlertResult>;
    _question(options: SweetAlertOptions): Promise<SweetAlertResult>;
    _success(options: SweetAlertOptions): Promise<SweetAlertResult>;
    _warning(options: SweetAlertOptions): Promise<SweetAlertResult>;
    error(title: string, text: string): Promise<SweetAlertResult>;
    info(title: string, text?: (string | null), showConfirmBtns?: boolean): Promise<SweetAlertResult>;
    success(title: string, text?: (string | null), timer?: number): Promise<SweetAlertResult>;
    warning(title: string, text?: (string | null), showConfirmBtns?: boolean): Promise<SweetAlertResult>;
};
export declare type CreateConfirmThird = "confirm" | "cancel" | "third";
declare type Big = {
    error(options: Omit<SweetAlertOptions, 'onOpen' | 'onAfterClose'> & {
        html: string | Error;
    }): Promise<SweetAlertResult>;
    warning(options: SweetAlertOptions): Promise<SweetAlertResult>;
    confirm(options: SweetAlertOptions): Promise<boolean>;
    blocking(options: SweetAlertOptions, moreOptions?: {
        strings: string[];
        clickFn: (bhe: BetterHTMLElement) => any;
    }): Promise<SweetAlertResult>;
    oneButton(options?: SweetAlertOptions): Promise<SweetAlertResult>;
    twoButtons(options: SweetAlertOptions): Promise<"confirm" | "second">;
    threeButtons(options: SweetAlertOptions & {
        thirdButtonText: string;
        thirdButtonType?: "confirm" | "warning";
    }): Promise<CreateConfirmThird>;
};
declare const _default: {
    fire(title: string, message?: string, type?: SweetAlertType): Promise<SweetAlertResult>;
    fire(settings: SweetAlertOptions): Promise<SweetAlertResult>;
    mixin(options?: SweetAlertOptions): typeof Swal;
    isVisible(): boolean;
    update(newSettings: SweetAlertOptions): void;
    close(onComplete?: (modalElement: HTMLElement) => void): void;
    getTitle(): HTMLElement;
    getContent(): HTMLElement;
    getImage(): HTMLElement;
    getCloseButton(): HTMLElement;
    getIcons(): HTMLElement[];
    getConfirmButton(): HTMLElement;
    getCancelButton(): HTMLElement;
    getActions(): HTMLElement;
    getFooter(): HTMLElement;
    getFocusableElements(): HTMLElement[];
    enableButtons(): void;
    disableButtons(): void;
    enableConfirmButton(): void;
    disableConfirmButton(): void;
    showLoading(): void;
    hideLoading(): void;
    isLoading(): boolean;
    clickConfirm(): void;
    clickCancel(): void;
    showValidationMessage(validationMessage: string): void;
    resetValidationMessage(): void;
    getInput(): HTMLElement;
    disableInput(): void;
    enableInput(): void;
    getValidationMessage(): HTMLElement;
    getTimerLeft(): number;
    stopTimer(): number;
    resumeTimer(): number;
    toggleTimer(): number;
    isTimerRunning(): boolean;
    increaseTimer(n: number): number;
    queue(steps: (string | SweetAlertOptions)[]): Promise<any>;
    getQueueStep(): string;
    insertQueueStep(step: SweetAlertOptions, index?: number): number;
    deleteQueueStep(index: number): void;
    getProgressSteps(): string[];
    setProgressSteps(steps: string[]): void;
    showProgressSteps(): void;
    hideProgressSteps(): void;
    isValidParameter(paramName: string): boolean;
    isUpdatableParameter(paramName: string): boolean;
    argsToParams(params: [string] | [string, string] | [string, string, string] | [SweetAlertOptions]): SweetAlertOptions;
    DismissReason: typeof Swal.DismissReason;
    small: Small;
    big: Big;
};
export default _default;
//# sourceMappingURL=myalert.d.ts.map