console.log('src/MyAlert/index.ts');
import Swal, { SweetAlertResult, SweetAlertOptions } from 'sweetalert2';
import { paragraph, elem } from "../bhe";

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
type Big = {
    warning(options: SweetAlertOptions): Promise<SweetAlertResult>,
    
    blocking(options: SweetAlertOptions, moreOptions?: { strings: string[], clickFn: Function }): Promise<SweetAlertResult>,
    
}
const small: Small = {
    _question(options) {
        return smallMixin.fire({ ...options, type : 'question' })
    },
    _info(options) {
        return smallMixin.fire({ ...options, type : 'info' })
    },
    _success(options) {
        return smallMixin.fire({ ...options, type : 'success' })
    },
    _error(options) {
        return smallMixin.fire({ ...options, type : 'error' })
    },
    _warning(options) {
        return smallMixin.fire({
            ...options,
            showConfirmButton : true, type : 'warning'
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
        // @ts-ignore
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
        // @ts-ignore
        return smallMixin.fire(warningOptions);
    },
    
};
const big: Big = {
    warning(options) {
        if ( options.animation === false )
            options = { customClass : null, ...options };
        return blockingSwalMixin.fire({ ...withConfirm, type : 'warning', ...options });
    },
    
    // blocking(options: SweetAlertOptions, { strings, clickFn } = {}): Promise<SweetAlertResult> {
    blocking(options: SweetAlertOptions, moreOptions): Promise<SweetAlertResult> {
        
        if ( moreOptions && moreOptions.strings && moreOptions.clickFn ) {
            let { strings, clickFn } = moreOptions;
            
            let paragraphs = strings
                // .map(s => $(`<p class="clickable">${s}</p>`))
                .map(s => paragraph({ cls : 'clickable', text : s }))
                .map(pElem => pElem.click(() => clickFn(pElem)));
            
            options = {
                ...options,
                onBeforeOpen(modalElement: HTMLElement) {
                    console.log('modalElement:', modalElement);
                    return elem({ id : 'swal2-content' })
                        .show()
                        .append(paragraphs);
                }
            };
        } else { // force confirm and cancel buttons
            options = {
                showConfirmButton : true,
                showCancelButton : true,
                ...options,
            };
        }
        if ( options.showConfirmButton || options.showCancelButton || options.onOpen )
            return Swal.fire({ ...blockingOptions, ...options });
        else // TODO: onOpen : resolve?
            return new Promise(resolve => Swal.fire({ ...blockingOptions, ...options, onOpen : v => resolve(v) }));
    }
};
export default { alertFn, small, big, close : Swal.close, isActive : Swal.isVisible };
