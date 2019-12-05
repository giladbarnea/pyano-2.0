/**import Alert from 'MyAlert' (or any other name)*/

console.log('src/MyAlert/index.ts');
import Swal, { SweetAlertResult, SweetAlertOptions } from 'sweetalert2';
import { paragraph, elem, BetterHTMLElement, button } from "../bhe";


const smallMixin: typeof Swal = Swal.mixin({
    animation : false,
    customClass : 'animated fadeIn',
    position : "bottom-start",
    showConfirmButton : false,
    timer : 8000,
    toast : true,
    
});
const withConfirm: SweetAlertOptions = {
    cancelButtonText : "No",
    confirmButtonText : "Yes",
    showCancelButton : true,
    showConfirmButton : true,
    timer : null,
    
};
const blockingOptions: SweetAlertOptions = {
    allowEnterKey : false,
    allowEscapeKey : false,
    allowOutsideClick : false,
    animation : false,
    customClass : 'animated fadeIn',
    showCancelButton : false, // default false
    showCloseButton : false, // default false
    showConfirmButton : false,
    width : "75vw",
    
    
};
const threeButtonsOptions: SweetAlertOptions = {
    ...blockingOptions,
    showConfirmButton : true,
    showCancelButton : true,
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
    success(title, text = null, timer = 6000) {
        
        return smallMixin.fire({
            title,
            text,
            type : "success",
            timer
        })
    },
    warning(title, text = null) {
        let warningOptions = {
            title,
            text,
            showConfirmButton : true,
            timer : null,
            type : "warning"
        };
        
        // @ts-ignore
        return smallMixin.fire(warningOptions);
    },
    
};
export type CreateConfirmCancel = "confirm" | "cancel" | "third";
type Big = {
    
    error(options: SweetAlertOptions | { html: Error }): Promise<SweetAlertResult>,
    warning(options: SweetAlertOptions): Promise<SweetAlertResult>,
    blocking(options: SweetAlertOptions, moreOptions?: { strings: string[], clickFn: (bhe: BetterHTMLElement) => any }): Promise<SweetAlertResult>,
    oneButton(title: string, options?: SweetAlertOptions): Promise<SweetAlertResult>,
    twoButtons(title: string, options?: SweetAlertOptions): Promise<"confirm" | "cancel">
    threeButtons(options: SweetAlertOptions & { thirdButtonText: string, thirdButtonType?: "confirm" | "warning" }): Promise<CreateConfirmCancel>
}

const big: Big = {
    error(options) {
        if ( options?.html instanceof Error ) {
            const { what, where } = options.html.toObj();
            options.html = `${what}<p>${where}</p>`
        }
        return blockingSwalMixin.fire({
            type : 'error',
            showConfirmButton : true,
            confirmButtonText : 'Remember to take a screenshot before pressing this',
            ...options
        });
    },
    warning(options) {
        if ( options.animation === false )
            options = { customClass : null, ...options };
        return blockingSwalMixin.fire({ ...withConfirm, type : 'warning', ...options });
    },
    
    blocking(options, moreOptions) {
        
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
                        // .show()
                        .append(...paragraphs);
                }
            };
        } else { // force confirm and cancel buttons
            options = {
                showConfirmButton : true,
                showCancelButton : true,
                ...options,
            };
        }
        if ( options.showConfirmButton || options.showCancelButton || options.onOpen ) {
            // / Happens when not or bad moreOptions
            return Swal.fire({ ...blockingOptions, ...options });
        } else { // TODO: onOpen : resolve?
            
            // @ts-ignore
            return new Promise(resolve => Swal.fire({ ...blockingOptions, ...options, onOpen : v => resolve(v) }));
        }
    },
    
    oneButton(title, options) {
        /*console.log({ title, options });
         const typeoftitle = typeof title;
         if ( typeoftitle === "object" ) {
         if ( options ) {
         if ( options.html ) {
         options.html += '<br>';
         } else {
         options.html = '';
         }
         } else {
         options = { html : '' };
         }
         if ( title instanceof Error ) {
         title = 'An error has occurred';
         options.html += title.message;
         console.log({ title, options });
         } else {
         let html = `<style>
         span {
         font-family: monospace;
         margin-left: 40px;
         }
         </style>
         <div style="text-align: left">
         
         `;
         for ( let key of Object.keys(title) ) {
         html += `<p><b>${key}:</b> <span>${title[key]}</span></p>`
         }
         html += `</div>`;
         options.html += html;
         title = 'Something happened';
         
         }
         } else if ( Array.isArray(title) ) {
         title = 'This is weird';
         options.html += title.join('</br>')
         }*/
        return blockingSwalMixin.fire({
            title : title as string,
            showConfirmButton : true,
            customClass : 'animated fadeIn',
            
            ...options
        });
    },
    async twoButtons(title, options) {
        
        const { value } = await Swal.fire({
            title,
            showCancelButton : true,
            customClass : 'animated fadeIn',
            ...options
        });
        
        return value ? "confirm" : "cancel";
    },
    async threeButtons(options) {
        
        // const thirdButtonText = options.thirdButtonText ?? 'Overwrite';
        let thirdButtonCss;
        if ( options.thirdButtonType === "warning" ) {
            thirdButtonCss = { backgroundColor : '#FFC66D', color : 'black' }
        }
        
        console.log({ thirdButtonCss });
        let action: CreateConfirmCancel;
        const onBeforeOpen = (modal: HTMLElement) => {
            let el = elem({
                htmlElement : modal,
                children : { actions : '.swal2-actions' }
            }) as BetterHTMLElement & { actions: BetterHTMLElement };
            
            el.actions.append(
                button({ cls : `swal2-confirm swal2-styled`, html : options.thirdButtonText })
                    
                    .css(thirdButtonCss)
                    .click((ev: MouseEvent) => {
                        action = "third";
                        Swal.clickConfirm();
                    })
            )
        };
        options = { ...options, onBeforeOpen, showCancelButton : true };
        const { value } = await Swal.fire(options);
        if ( value ) {
            /// Either user clicked Confirm (action is undefined) or Swal.clickConfirm() (action is "third")
            if ( action === undefined ) {
                action = "confirm";
            }
        } else {
            action = "cancel";
        }
        
        return action;
    }
};
// export default { alertFn, small, big, close : Swal.close, isVisible : Swal.isVisible };
export default { small, big, ...Swal };
