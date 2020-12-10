/**import Alert from 'MyAlert' (or any other name)*/
/// <reference types="../node_modules/sweetalert2" />
import { BetterHTMLElement } from "./bhe";
import { SweetAlertIcon, SweetAlertOptions, SweetAlertResult } from 'sweetalert2';
declare type SwalGenericOptions = SweetAlertOptions & {
    icon: SweetAlertIcon;
};
declare const swalQueue: Map<number, SwalGenericOptions>;
declare type CancelConfirmThird = "confirm" | "cancel" | "third";
declare function foo(): Promise<void>;
declare const small: {
    error(optionsOrTitle: SwalGenericOptions): Promise<SweetAlertResult>;
    error(optionsOrTitle: string, text?: string): Promise<SweetAlertResult>;
    warning(optionsOrTitle: SwalGenericOptions): Promise<SweetAlertResult>;
    warning(optionsOrTitle: string, text?: string): Promise<SweetAlertResult>;
    info(optionsOrTitle: SwalGenericOptions & {
        confirmOptions?: boolean;
    }): Promise<SweetAlertResult>;
    info(optionsOrTitle: string, text?: string, confirmOptions?: boolean): Promise<SweetAlertResult>;
    success(optionsOrTitle: SwalGenericOptions): Promise<SweetAlertResult>;
    success(optionsOrTitle: string, text?: string): Promise<SweetAlertResult>;
};
declare const big: {
    /**calls `big.oneButton`.
     * @see Big.oneButton*/
    error(options: SwalGenericOptions): Promise<SweetAlertResult>;
    /**calls `big.oneButton`.
     * @see Big.oneButton*/
    warning(options: SwalGenericOptions): Promise<SweetAlertResult>;
    /**calls `big.oneButton`, usees `withConfirm`.
     @see Big.oneButton
     @see withConfirm*/
    confirm(options: SwalGenericOptions): Promise<boolean>;
    blocking(options: SwalGenericOptions, moreOptions?: {
        strings: string[];
        clickFn: (bhe: typeof BetterHTMLElement) => any;
    }): Promise<SweetAlertResult>;
    /**The 'one' button is 'showConfirmButton: true'. Uses 'blockingOptions'.
     @see blockingOptions*/
    oneButton(options: SwalGenericOptions): Promise<SweetAlertResult>;
    /**The 'one' button is 'showConfirmButton: true', the 'second' is 'showCancelButton: true'. Uses 'blockingOptions'.
     @see blockingOptions*/
    twoButtons(options: SwalGenericOptions): Promise<"confirm" | "second">;
    threeButtons(options: SwalGenericOptions & {
        thirdText: string;
        thirdIcon?: "confirm" | "warning";
    }): Promise<CancelConfirmThird>;
};
export { small, big, foo, swalQueue };
