/// <reference types="../node_modules/sweetalert2" />
import { BetterHTMLElement, Paragraph } from "./bhe";
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
        warning(options: SweetAlertOptions & {
            log?: boolean;
        }): Promise<SweetAlertResult>;
        warning(title: string, text?: string): Promise<SweetAlertResult>;
        info(optionsOrTitle: SweetAlertOptions & {
            confirmOptions?: boolean;
        }): Promise<SweetAlertResult>;
        info(optionsOrTitle: string, text?: string, confirmOptions?: boolean): Promise<SweetAlertResult>;
        success(optionsOrTitle: OptionsSansIcon): Promise<SweetAlertResult>;
        success(optionsOrTitle: string, text?: string): Promise<SweetAlertResult>;
    };
    type _cancelOrConfirm = "cancel" | "confirm";
    type _cancelOrConfirmOrDeny = _cancelOrConfirm | "deny";
    type _textOrColorOrClass = "Text" | "Color" | "Class";
    type _firstOrSecond = "first" | "second";
    type _firstOrSecondOrThird = "first" | "second" | "third";
    type TwoButtonsOptions = Omit<SweetAlertOptions, `${_cancelOrConfirm}Button${_textOrColorOrClass}`> & {
        [K in `${_firstOrSecond}Button${_textOrColorOrClass}`]?: ;
    };
    type ThreeButtonsOptions = Omit<TwoButtonsOptions, `${_cancelOrConfirmOrDeny}Button${_textOrColorOrClass}`> & {
        [K in `${_firstOrSecondOrThird}Button${_textOrColorOrClass}`]?: ;
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
        blocking_(options: SweetAlertOptions, moreOptions?: {
            strings: string[];
            clickFn: (bhe: typeof BetterHTMLElement) => any;
        }): Promise<SweetAlertResult>;
        blocking(options: SweetAlertOptions<any, any> & {
            strings?: string[];
            clickFn?: (bhe: Paragraph) => any;
        }): Promise<SweetAlertResult>;
        /**The 'one' button is 'showConfirmButton: true'. Uses 'blockingOptions'.
         @see blockingOptions*/
        oneButton(options: OptionsWithIcon): Promise<SweetAlertResult>;
        /**The 'first' button is 'showConfirmButton: true', the 'second' is 'showCancelButton: true'. Uses 'blockingOptions'.
         * `firstButtonText` defaults to "Confirm", `secondButtonText` defaults to "Cancel".
         @see blockingOptions*/
        twoButtons(options: TwoButtonsOptions): Promise<"first" | "second">;
        /**The 'first' button is 'showConfirmButton: true', the 'second' is 'showCancelButton: true'. the 'third' is 'showDenyButton: true'. Uses 'blockingOptions'.
         * `firstButtonText` defaults to "Confirm", `secondButtonText` defaults to "Cancel".
         @see blockingOptions*/
        threeButtons(options: ThreeButtonsOptions): Promise<"first" | "second" | "third">;
    };
    export const close: typeof Swal.close;
    export const isVisible: typeof Swal.isVisible;
    export {};
}
export default swalert;
