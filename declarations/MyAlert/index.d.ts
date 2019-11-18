/// <reference types="./node_modules/sweetalert2" />
import { SweetAlertResult, SweetAlertOptions } from 'sweetalert2';
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
declare const _default: {
    alertFn: typeof alertFn;
    small: Small;
};
export default _default;
//# sourceMappingURL=index.d.ts.map