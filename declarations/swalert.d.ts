/// <reference types="../node_modules/sweetalert2" />
import { BetterHTMLElement } from "./bhe";
import Swal, { SweetAlertIcon, SweetAlertOptions, SweetAlertResult } from 'sweetalert2';
declare module swalert {
    type OptionsRequireIcon = SweetAlertOptions & {
        icon: SweetAlertIcon;
    };
    type CancelConfirmThird = "confirm" | "cancel" | "third";
    type OptionsSansIcon = Omit<SweetAlertOptions, "icon">;
    export function foo(): Promise<void>;
    export const small: {
        error(optionsOrTitle: SweetAlertOptions): Promise<SweetAlertResult>;
        error(optionsOrTitle: string, text?: string): Promise<SweetAlertResult>;
        warning(optionsOrTitle: SweetAlertOptions): Promise<SweetAlertResult>;
        warning(optionsOrTitle: string, text?: string): Promise<SweetAlertResult>;
        info(optionsOrTitle: SweetAlertOptions & {
            confirmOptions?: boolean;
        }): Promise<SweetAlertResult>;
        info(optionsOrTitle: string, text?: string, confirmOptions?: boolean): Promise<SweetAlertResult>;
        success(optionsOrTitle: OptionsSansIcon): Promise<SweetAlertResult>;
        success(optionsOrTitle: string, text?: string): Promise<SweetAlertResult>;
    };
    export const big: {
        /**calls `big.oneButton`.
         * @see Big.oneButton*/
        error(options: OptionsSansIcon): Promise<SweetAlertResult>;
        /**calls `big.oneButton`.
         * @see Big.oneButton*/
        warning(options: OptionsSansIcon): Promise<SweetAlertResult>;
        /**calls `big.oneButton`, usees `withConfirm`.
         @see Big.oneButton
         @see withConfirm*/
        confirm(options: OptionsSansIcon): Promise<boolean>;
        blocking(options: SweetAlertOptions, moreOptions?: {
            strings: string[];
            clickFn: (bhe: typeof BetterHTMLElement) => any;
        }): Promise<SweetAlertResult>;
        /**The 'one' button is 'showConfirmButton: true'. Uses 'blockingOptions'.
         @see blockingOptions*/
        oneButton(options: OptionsRequireIcon): Promise<SweetAlertResult>;
        /**The 'one' button is 'showConfirmButton: true', the 'second' is 'showCancelButton: true'. Uses 'blockingOptions'.
         @see blockingOptions*/
        twoButtons(options: Omit<SweetAlertOptions, "cancelButtonText" | "confirmButtonText"> & {
            firstButtonText: string;
            secondButtonText: string;
        }): Promise<"first" | "second">;
        threeButtons(options: SweetAlertOptions & {
            thirdText: string;
            thirdIcon?: "confirm" | "warning";
        }): Promise<CancelConfirmThird>;
    };
    export const close: typeof Swal.close;
    export const isVisible: typeof Swal.isVisible;
    export {};
}
export default swalert;
