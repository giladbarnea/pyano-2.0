/**import Alert from 'MyAlert' (or any other name)*/


import { BetterHTMLElement, button, elem, paragraph } from "./bhe";

console.log('src/swalert.ts');
// const Swal = require('sweetalert2');
import Swal, { SweetAlertOptions, SweetAlertResult, SweetAlertType } from 'sweetalert2';


export declare module swalert {
    // ** How this module works:
    /*

    - Because it shares the same name as this file, and 'swalert' is required in renderer.ts
      (which makes it globally adccessible), it automatically type-annotates 'swalert' object when used across the app.
      This works even if 'export' is omitted and it's only 'declare module swalert'.
    - The only reason it's exported is to make it possible to 'import { swalert } from "./swalert.js"' then use
      one of its exported items, like 'CreateConfirmThird'.

    * */
    type CreateConfirmThird = "confirm" | "cancel" | "third";
    namespace small {
        function _error(options: SweetAlertOptions): Promise<SweetAlertResult>;

        function _info(options: SweetAlertOptions): Promise<SweetAlertResult>;

        function _question(options: SweetAlertOptions): Promise<SweetAlertResult>;

        function _success(options: SweetAlertOptions): Promise<SweetAlertResult>;

        function _warning(options: SweetAlertOptions): Promise<SweetAlertResult>;

        function error(title: string, text: string): Promise<SweetAlertResult>;

        function info(title: string, text?: (string | null), showConfirmBtns?: boolean): Promise<SweetAlertResult>;

        function success(title: string, text?: (string | null), timer?: number): Promise<SweetAlertResult>;

        function warning(title: string, text?: (string | null), showConfirmBtns?: boolean): Promise<SweetAlertResult>;
    }
    namespace big {
        function error(options: Omit<SweetAlertOptions, 'onOpen' | 'onAfterClose'> & { html: string | Error }): Promise<SweetAlertResult>;

        function warning(options: SweetAlertOptions): Promise<SweetAlertResult>;

        function confirm(options: SweetAlertOptions): Promise<boolean>;

        function blocking(options: SweetAlertOptions, moreOptions?: { strings: string[], clickFn: (bhe: typeof BetterHTMLElement) => any }): Promise<SweetAlertResult>;

        function oneButton(options?: SweetAlertOptions): Promise<SweetAlertResult>;

        function twoButtons(options: SweetAlertOptions): Promise<"confirm" | "second">;

        function threeButtons(options: SweetAlertOptions & { thirdButtonText: string, thirdButtonType?: "confirm" | "warning" }): Promise<CreateConfirmThird>
    }
    export { small, big, CreateConfirmThird };
}


const swalTypes = {
    info: 0,
    success: 1,
    question: 2,
    warning: 3,
    error: 4
};

function activeIsToast(): boolean {
    if (!Swal.isVisible()) {
        return false;
    }
    // @ts-ignore
    return Swal.getPopup().classList.contains('swal2-toast')
}

function activeType(): SweetAlertType {
    if (!Swal.isVisible()) {
        return undefined
    }
    const classes = Swal.getIcons().find(div => div.style.display != 'none').classList.value;
    for (let type of ['success', 'error', 'warning', 'info', 'question']) {
        if (classes.includes(type)) {
            return type as SweetAlertType
        }
    }
    console.warn(`myalert.ts activeType() couldnt find type. classes: ${classes}`)
}

/**Converts newlines to html <br>, aesthetic defaults (timer:null), and manages Swal queue.*/
async function generic(options: SweetAlertOptions): Promise<SweetAlertResult> {
    let propname;
    let propval;

    function _format_value(_propval): string {
        if (typeof _propval === 'string') {
            if (_propval.includes('\n')) {
                _propval = _propval.replaceAll('\n', '<br>')
            }
        } else if (util.isObject(_propval)) {
            _propval = JSON.stringify(_propval)
        }
        return _propval
    }

    if (options.text || options.html) {
        if (options.text) {
            propname = 'text';
            propval = options.text;
        } else if (options.html) {
            propname = 'html';
            propval = options.html;
        }
        propval = _format_value(propval);
        options[propname] = propval;
    }
    if (options.title) {
        options['title'] = _format_value(options.title)
    }
    options = {
        animation: false,
        width: '90vw',
        position: options.toast ? "bottom" : "center",
        showConfirmButton: !options.toast,
        timer: 8000,
        // timer: null,
        ...options
    };
    if (Swal.isVisible()) {
        // not-toast trumps toast, warning trumps success
        const takePrecedence = (!options.toast && activeIsToast()) || (swalTypes[options.type] > swalTypes[activeType()]);
        if (takePrecedence) {
            return Swal.fire(options)
        }
        const currentQueueStep = Swal.getQueueStep();
        if (currentQueueStep === null) {
            // * Swal exists, but fired through `fire` and not `queue`
            const timedout = !(await util.waitUntil(() => !Swal.isVisible(), 500, 60000));
            if (timedout) {
                console.warn(`Swal.generic() | time out waiting for existing swal to close`);
                return undefined
            }
            const results = await Swal.queue([options]);
            return results[0]
        } else {
            // * Swal exists, and fired through `queue`
            Swal.insertQueueStep(options);
            return

        }
    }
    const results = await Swal.queue([options]);
    return results[0]
}

const smallMixin: typeof Swal = Swal.mixin({
    position: "bottom-start",
    showConfirmButton: false,
    timer: 8000,
    toast: true,

});
const withConfirm: SweetAlertOptions = {
    cancelButtonText: "No",
    confirmButtonText: "Yes",
    showCancelButton: true,
    showConfirmButton: true,
    timer: null,

};
const blockingOptions: SweetAlertOptions = {
    allowEnterKey: false,
    allowEscapeKey: false,
    allowOutsideClick: false,
    showCancelButton: false, // default false
    showCloseButton: false, // default false
    showConfirmButton: false,
    timer: null
    // width : "90vw",


};
const threeButtonsOptions: SweetAlertOptions = {
    ...blockingOptions,
    showConfirmButton: true,
    showCancelButton: true,
};
const blockingSwalMixin = Swal.mixin(blockingOptions);


const small = {
    _question(options) {
        return smallMixin.fire({ ...options, type: 'question' })
    },
    _info(options) {
        return smallMixin.fire({ ...options, type: 'info' })
    },
    _success(options) {
        return smallMixin.fire({ ...options, type: 'success' })
    },
    _error(options) {
        return smallMixin.fire({ ...options, type: 'error' })
    },
    _warning(options) {
        return smallMixin.fire({
            ...options,
            showConfirmButton: true, type: 'warning'
        })
    },
    error(title, text) {
        return smallMixin.fire({
            title,
            text,
            type: "error",

        });
    },
    info(title, text = null, showConfirmBtns = false) {
        let infoOptions = {
            title,
            text,
            type: "info",
        };
        if (showConfirmBtns) {
            infoOptions = { ...infoOptions, ...withConfirm };
        }
        // @ts-ignore
        return smallMixin.fire(infoOptions);
    },
    success(title, text = null) {

        return generic({
            title,
            text,
            type: "success",
            toast: true
        })
    },
    warning(title, text = null) {
        let warningOptions = {
            title,
            text,
            showConfirmButton: true,
            timer: null,
            type: "warning"
        };

        // @ts-ignore
        return smallMixin.fire(warningOptions);
    },

};


const big = {

    async error(options) {
        // TODO: either don't use at all (and make elog.error hook display an error swalert),
        //  or just make it fire a simple swal
        if (options?.html instanceof Error) {
            const error = options.html;
            const { what, where, cleanstack } = error.toObj();
            console.warn('Error!', error, { cleanstack });
            options.html = `${what}<p>${where}</p>`
        }
        const dirname = new Date().human();
        // const { default: Glob } = require('../Glob');
        if (!BigConfig.get('dev')) {
            // @ts-ignore
            options.onOpen = async () => {
                await util.saveScreenshots(dirname);

            };
            // @ts-ignore
            options.onAfterClose = async () => {
                await util.wait(500);
                await util.saveScreenshots(dirname);

            };
            options.html += `<p>Logs and screenshot saved to errors/${path.basename(SESSION_PATH_ABS)}/${dirname}</p>`
        }

        return blockingSwalMixin.fire({
            type: 'error',
            showConfirmButton: true,
            ...options
        });
    },
    warning(options) {
        return this.oneButton({ type: 'warning', ...options });
    },
    async confirm(options: SweetAlertOptions) {
        const res = await this.oneButton({
            type: 'question',
            cancelButtonText: "No",
            confirmButtonText: "Yes",
            showCancelButton: true,
            showConfirmButton: true,
            ...options
        });
        console.log(`big.confirm() | res:`, res);
        return !!(res?.value);
        // return !!value;
    },

    blocking(options, moreOptions) {

        if (moreOptions && moreOptions.strings && moreOptions.clickFn) {
            let { strings, clickFn } = moreOptions;

            let paragraphs = strings
                // .map(s => $(`<p class="clickable">${s}</p>`))
                .map(s => paragraph({ cls: 'clickable', text: s }))
                // @ts-ignore
                .map(pElem => pElem.click(() => clickFn(pElem)));

            options = {
                ...options,
                onBeforeOpen(modalElement: HTMLElement) {
                    console.log('modalElement:', modalElement);
                    return elem({ byid: 'swal2-content' })
                        // .show()
                        .append(...paragraphs);
                }
            };
        } else { // force confirm and cancel buttons
            options = {
                showConfirmButton: true,
                showCancelButton: true,
                ...options,
            };
        }
        if (options.showConfirmButton || options.showCancelButton || options.onOpen) {
            // / Happens when not or bad moreOptions
            return Swal.fire({ ...blockingOptions, ...options });
        } else { // TODO: onOpen : resolve?

            // @ts-ignore
            return new Promise(resolve => Swal.fire({ ...blockingOptions, ...options, onOpen: v => resolve(v) }));
        }
    },
    oneButton(options) {

        return generic({
            ...blockingOptions,
            showConfirmButton: true,
            ...options,

        });
    },
    async twoButtons(options) {

        const { value } = await Swal.fire({
            showCancelButton: true,
            ...options
        });

        return value ? "confirm" : "second";
    },

    async threeButtons(options) {

        // const thirdButtonText = options.thirdButtonText ?? 'Overwrite';
        let thirdButtonCss;
        if (options.thirdButtonType === "warning") {
            thirdButtonCss = { backgroundColor: '#FFC66D', color: 'black' }
        }

        console.log({ thirdButtonCss });
        let action: swalert.CreateConfirmThird;
        const onBeforeOpen = (modal: HTMLElement) => {
            let el = elem({
                htmlElement: modal,
                children: { actions: '.swal2-actions' }
            }) as BetterHTMLElement & { actions: BetterHTMLElement };

            el.actions.append(
                button({ cls: `swal2-confirm swal2-styled`, html: options.thirdButtonText })

                    .css(thirdButtonCss)
                    .click(async (ev: MouseEvent) => {
                        action = "third";
                        Swal.clickConfirm();
                    })
            )
        };
        options = { ...options, onBeforeOpen, showCancelButton: true };
        const { value } = await Swal.fire(options);
        if (value) {
            /// Either user clicked Confirm (action is undefined) or Swal.clickConfirm() (action is "third")
            if (action === undefined) {
                action = "confirm";
            }
        } else {
            action = "cancel";
        }

        return action;
    }
};
// export default { alertFn, small, big, close : Swal.close, isVisible : Swal.isVisible };
export { small, big };
