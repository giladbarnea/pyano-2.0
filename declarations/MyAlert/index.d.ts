/// <reference types="./node_modules/sweetalert2" />
import Swal, { SweetAlertResult, SweetAlertOptions } from 'sweetalert2';
declare function alertFn(): void;
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
declare type Big = {
    warning(options: SweetAlertOptions): Promise<SweetAlertResult>;
    blocking(options: SweetAlertOptions, moreOptions?: {
        strings: string[];
        clickFn: Function;
    }): Promise<SweetAlertResult> | HTMLElement;
};
declare const _default: {
    alertFn: typeof alertFn;
    small: Small;
    big: Big;
    close: typeof Swal.close;
    isActive: typeof Swal.isVisible;
};
export default _default;
//# sourceMappingURL=index.d.ts.map