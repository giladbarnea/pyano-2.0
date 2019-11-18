console.log('src/Alert/index.ts');
import Swal, { SweetAlertResult, SweetAlertOptions } from 'sweetalert2';

function alertFn() {
    console.log('alertFn');
}

const smallMixin = Swal.mixin({
    animation : false,
    customClass : 'animated fadeIn',
    position : "bottom-start",
    showConfirmButton : false,
    timer : 8000,
    toast : true,
    
});
const withConfirm = {
    cancelButtonText : "No",
    confirmButtonText : "Yes",
    showCancelButton : true,
    showConfirmButton : true,
    timer : null,
    
};
const blockingOptions = {
    allowEnterKey : false,
    allowEscapeKey : false,
    allowOutsideClick : false,
    animation : false,
    customClass : 'animated fadeIn',
    showCancelButton : false, // default false
    showCloseButton : false, // default false
    showConfirmButton : false,
    
};
const blockingSwalMixin = Swal.mixin(blockingOptions);
type Small = {
    _error(options: SweetAlertOptions): Promise<SweetAlertResult>,
    _info(options: SweetAlertOptions): Promise<SweetAlertResult>,
    _question(options: SweetAlertOptions): Promise<SweetAlertResult>,
    _success(options: SweetAlertOptions): Promise<SweetAlertResult>,
    _warning(options: SweetAlertOptions): Promise<SweetAlertResult>,
    error(title: string, text: string): Promise<SweetAlertResult>,
    info(title: string, text?: (string | null), showConfirmBtns?: boolean): Promise<SweetAlertResult>,
    success(title: string, text?: (string | null), timer?: number): Promise<SweetAlertResult>,
    warning(title: string, text?: (string | null), showConfirmBtns?: boolean): Promise<SweetAlertResult>,
}
const small: Small = {
    _question(options) {
        return smallMixin.fire({ ...options, ...{ type : 'question' } })
    },
    _info(options) {
        return smallMixin.fire({ ...options, ...{ type : 'info' } })
    },
    _success(options) {
        return smallMixin.fire({ ...options, ...{ type : 'success' } })
    },
    _error(options) {
        return smallMixin.fire({ ...options, ...{ type : 'error' } })
    },
    _warning(options) {
        return smallMixin.fire({
            ...options,
            ...{ showConfirmButton : true, type : 'warning' }
        })
    },
    error(title, text) {
        return smallMixin.fire({
            title,
            text,
            type : "error",
            
        });
    },
    info(title, text = null, showConfirmBtns = false) {
        let infoOptions = {
            title,
            text,
            type : "info",
        };
        if ( showConfirmBtns )
            infoOptions = { ...infoOptions, ...withConfirm };
        return smallMixin.fire(infoOptions);
    },
    success(title, text = null, timer = 4000) {
        
        return smallMixin.fire({
            title,
            text,
            type : "success",
            timer
        })
    },
    warning(title, text = null, showConfirmBtns = false) {
        let warningOptions = {
            title,
            text,
            type : "warning"
        };
        if ( showConfirmBtns )
            warningOptions = { ...warningOptions, ...withConfirm };
        return smallMixin.fire(warningOptions);
    },
    
};
export default { alertFn, small };
