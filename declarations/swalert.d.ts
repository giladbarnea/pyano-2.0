/// <reference types="../node_modules/sweetalert2" />
import { BetterHTMLElement } from "./bhe";
import Swal, { SweetAlertIcon, SweetAlertOptions, SweetAlertResult } from 'sweetalert2';
declare module swalert {
    type OptionsWithIcon = SweetAlertOptions & {
        icon: SweetAlertIcon;
    };
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
    type TwoButtonsOptions = Omit<SweetAlertOptions, "cancelButtonText" | "confirmButtonText"> & {
        firstButtonText: string;
        secondButtonText: string;
    };
    type ThreeButtonsOptions = Omit<TwoButtonsOptions, "denyButtonText"> & {
        thirdButtonText: string;
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
        oneButton(options: OptionsWithIcon): Promise<SweetAlertResult>;
        /**The 'first' button is 'showConfirmButton: true', the 'second' is 'showCancelButton: true'. Uses 'blockingOptions'.
         @see blockingOptions*/
        twoButtons(options: TwoButtonsOptions): Promise<"first" | "second">;
        /**The 'first' button is 'showConfirmButton: true', the 'second' is 'showCancelButton: true'. the 'third' is 'showDenyButton: true'. Uses 'blockingOptions'.
         @see blockingOptions*/
        threeButtons(options: ThreeButtonsOptions): Promise<"first" | "second" | "third">;
    };
    export const close: typeof Swal.close;
    export const isVisible: typeof Swal.isVisible;
    export {};
}
export default swalert;
