/**import Alert from 'MyAlert' (or any other name)*/


import { BetterHTMLElement, button, elem, paragraph } from "./bhe";

console.debug('src/swalert.ts');

import Swal, { SweetAlertOptions, SweetAlertResult, SweetAlertType } from 'sweetalert2';

type CancelConfirmThird = "confirm" | "cancel" | "third";

// export declare module swalert {
//     // ** How this module works:
//     /*
//
//     - Because it shares the same name as this file, and 'swalert' is required in renderer.ts
//       (which makes it globally accessible), it automatically type-annotates 'swalert' object when used across the app.
//       This works even if 'export' is omitted and it's only 'declare module swalert'.
//     - The only reason it's exported is to make it possible to 'import { swalert } from "./swalert.js"' then use
//       one of its exported items, like 'CancelConfirmThird'.
//
//     * */
//     type CancelConfirmThird = "confirm" | "cancel" | "third";
//     namespace small {
//         function _error(options: SweetAlertOptions): Promise<SweetAlertResult>;
//
//         function _info(options: SweetAlertOptions): Promise<SweetAlertResult>;
//
//         function _question(options: SweetAlertOptions): Promise<SweetAlertResult>;
//
//         function _success(options: SweetAlertOptions): Promise<SweetAlertResult>;
//
//         function _warning(options: SweetAlertOptions): Promise<SweetAlertResult>;
//
//         function error(title: string, text: string): Promise<SweetAlertResult>;
//
//         function info(title: string, text?: (string | null), showConfirmBtns?: boolean): Promise<SweetAlertResult>;
//
//         function success(title: string, text?: (string | null), timer?: number): Promise<SweetAlertResult>;
//
//         function warning(title: string, text?: (string | null), showConfirmBtns?: boolean): Promise<SweetAlertResult>;
//     }
//     namespace big {
//         function error(options: Omit<SweetAlertOptions, 'onOpen' | 'onAfterClose'> & { html: string | Error }): Promise<SweetAlertResult>;
//
//         function warning(options: SweetAlertOptions): Promise<SweetAlertResult>;
//
//         function confirm(options: SweetAlertOptions): Promise<boolean>;
//
//         function blocking(options: SweetAlertOptions, moreOptions?: { strings: string[], clickFn: (bhe: typeof BetterHTMLElement) => any }): Promise<SweetAlertResult>;
//
//         function oneButton(options?: SweetAlertOptions): Promise<SweetAlertResult>;
//
//         function twoButtons(options: SweetAlertOptions): Promise<"confirm" | "second">;
//
//         function threeButtons(options: SweetAlertOptions & { thirdButtonText: string, thirdButtonType?: "confirm" | "warning" }): Promise<CancelConfirmThird>
//     }
//     export { small, big, CancelConfirmThird };
// }


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
    return Swal.getPopup()?.classList.contains('swal2-toast') ?? false
}

function activeType(): SweetAlertType {
    if (!Swal.isVisible()) {
        return undefined
    }

    let icons = Swal.getIcons();
    const classes = icons
        .find(div => div.style.display != 'none')
        ?.classList
        .value;
    if (classes === undefined) {
        console.warn(`swalert.activeType() | Swal is visible, but couldnt find type. returning undefined`)
        return undefined;
    }
    for (let type of ['success', 'error', 'warning', 'info', 'question']) {
        if (classes.includes(type)) {
            return type as SweetAlertType
        }
    }
    console.warn(`swalert.activeType() | couldnt find type. classes: ${classes}`)
    return undefined;
}


type SwalGenericOptions = SweetAlertOptions & { type: SweetAlertType /* not optional, needed to manage queue */ };

/**Converts newlines to html <br>, sets unimportant defaults (timer:6000), and manages Swal queue.*/
async function generic(options: SwalGenericOptions): Promise<SweetAlertResult> {
    //// Note:
    // Swal.queue immediately displays swal, overrunning .queue(), .fire() etc. So there's no reason to use Swal.fire().
    // Swal.insertQueueStep takes effect only if:
    // · swal is visible and fired through .queue(), and
    // · existing swal was closed through CONFIRM and not timer over, not cancel
    /// res = await Swal.queue() behavior (confirm and cancel buttons, and timer):
    // confirm → res is { value: [true] }
    // cancel → res is { dismiss: "cancel" }
    // timer over → res is { dismiss: "timer" }
    // inserted queue step before timer over, then pressed confirm → res is { value: [true, true] }


    const rnd = Math.round(Math.random() * 100);

    let title = `swalert.generic(title: "${options.title}", type: "${options.type}", timer: ${options.timer})(${rnd}) |\n\t`;
    console.log(title);
    let propname;
    let propval;

    function _format_value(_propval): string {
        if (typeof _propval === 'string') {
            if (_propval.includes('\n')) {
                _propval = _propval.replaceAll('\n', '<br>')
            }
        } else if (util.isObject(_propval)) {
            _propval = pftm(_propval)
        }
        return _propval
    }

    // * newline → <br>
    if (options.text || options.html) {
        if (options.text && options.html) {
            console.warn(`${title} Got both options.text and options.html. Using only options.text:\n\t"${pftm(options.text)}"`);
            propname = 'text';
            propval = options.text;
        } else if (options.text) {
            propname = 'text';
            propval = options.text;
        } else {
            propname = 'html';
            propval = options.html;
        }
        propval = _format_value(propval);
        options[propname] = propval;
    }
    if (options.title) {
        options['title'] = _format_value(options.title)
    }
    // * defaults: if toast → bottom and don't show confirm button
    options = {
        animation: false,
        width: '90vw',
        position: options.toast ? "bottom" : "center",
        showConfirmButton: !options.toast,
        timer: 6000,
        ...options
    };

    // * queue management
    if (Swal.isVisible()) {
        let takePrecedence;

        if (!options.toast && activeIsToast()) {
            // not-toast trumps toast
            takePrecedence = true;
        } else if (options.type !== undefined) {
            // warning takes precedence over success etc.
            // if currently visible type is undefined, we take precedence if we're question and above.
            let currentType = activeType();
            if (currentType === undefined) {
                // 'question', 'warning' and 'error' take precedence over 'undefined'; 'info' and 'success' don't
                takePrecedence = swalTypes[options.type] >= 2;
            } else {
                takePrecedence = swalTypes[options.type] > swalTypes[currentType];
            }
        } else {
            // if type isn't specified, we enter queue
            takePrecedence = false;
        }

        if (takePrecedence) {
            console.debug(`${title} takePrecedence=true. Returning Swal.fire(options)`);
            return Swal.queue([options])
        }
        const currentQueueStep = Swal.getQueueStep();
        if (currentQueueStep === null) {
            // * Swal exists, but fired through `fire` and not `queue`
            const timedout = !(await util.waitUntil(() => !Swal.isVisible(), 500, 60000));
            if (timedout) {
                console.warn(`${title} time out waiting for existing swal to close. returning undefined`);
                return undefined
            }
            console.debug(`${title} waited successfully until !Swal.isVisible(). awaiting Swal.queue([options])...`);
            const results = await Swal.queue([options]);
            console.debug(`${title} done awaiting Swal.queue that returned 'results'. returning results[0]:`, pftm(results[0]))
            return results[0]
        } else {
            // * Swal exists, and fired through `queue`
            const msg = `${title} Swal is already visible, and fired through 'queue' (currentQueueStep: ${currentQueueStep}). awaiting Swal.queue([options])...`;
            console.debug(msg)
            const results = await Swal.queue([options]);
            console.debug(`${title} done awaiting Swal.queue that returned 'results'. returning results[0]:`, pftm(results[0]))
            return results[0]
            /*// TODO: this doesnt work. repro: swalert.small.error('hello'); swalert.small.info('hello')
            const promisedStep = Swal.insertQueueStep(options);
            const msg = `${title} Swal is already visible, and fired through 'queue' (currentQueueStep: ${currentQueueStep}). 'Swal.insertQueueStep(options)' → ${promisedStep}. returning undefined`;
            console.debug(msg)
            return undefined*/

        }
    }
    console.debug(`${title} No Swal visible. awaiting Swal.queue([options])...`);
    const results = await Swal.queue([options]);
    /// This awaits until ALL swals in queue are done!
    console.debug(`${title} done awaiting Swal.queue that returned 'results'. returning results[0]:`, pftm(results[0]))
    return results[0]
}

/*const smallOptions: SweetAlertOptions = {
    position: "bottom-start",
    showConfirmButton: false,
    timer: 8000,
    toast: true,

};
const smallMixin: typeof Swal = Swal.mixin(smallOptions);*/

// "Yes", "No", show cancel and confirm, timer:null
const withConfirm: SweetAlertOptions = {
    cancelButtonText: "No",
    confirmButtonText: "Yes",
    showCancelButton: true,
    showConfirmButton: true,
    timer: null,

};

// Doesn't allow closing, no buttons, no timer
const blockingOptions: SweetAlertOptions = {
    allowEnterKey: false,
    allowEscapeKey: false,
    allowOutsideClick: false,
    showCancelButton: false, // default false
    showCloseButton: false, // default false
    showConfirmButton: false,
    timer: null


};
const threeButtonsOptions: SweetAlertOptions = {
    ...blockingOptions,
    showConfirmButton: true,
    showCancelButton: true,
};


const small = new class Small {

    error(optionsOrTitle: SwalGenericOptions): Promise<SweetAlertResult>
    error(optionsOrTitle: string, text?: string): Promise<SweetAlertResult>
    error(optionsOrTitle): Promise<SweetAlertResult> {
        const errorOptions: SwalGenericOptions = {
            showConfirmButton: true,
            timer: null,
            type: "error",
            toast: true,

        };
        if (util.isObject(optionsOrTitle)) {
            return generic({ ...errorOptions, ...optionsOrTitle })
        } else {
            const text = arguments[1];
            return generic({
                title: optionsOrTitle,
                text,
                ...errorOptions
            })
        }

    }


    warning(optionsOrTitle: SwalGenericOptions): Promise<SweetAlertResult>
    warning(optionsOrTitle: string, text?: string): Promise<SweetAlertResult>
    warning(optionsOrTitle): Promise<SweetAlertResult> {
        const warningOptions: SwalGenericOptions = {
            showConfirmButton: true,
            timer: null,
            type: "warning",
            toast: true,

        };
        if (util.isObject(optionsOrTitle)) {
            return generic({ ...warningOptions, ...optionsOrTitle })
        } else {
            const text = arguments[1];
            return generic({
                title: optionsOrTitle,
                text,
                ...warningOptions
            })
        }

    }

    info(optionsOrTitle: SwalGenericOptions & { confirmOptions?: boolean }): Promise<SweetAlertResult>
    info(optionsOrTitle: string, text?: string, confirmOptions?: boolean): Promise<SweetAlertResult>
    info(optionsOrTitle): Promise<SweetAlertResult> {

        let infoOptions: SwalGenericOptions = {
            showConfirmButton: true,
            type: "info",
            toast: true,
        };
        if (util.isObject(optionsOrTitle)) {

            if (optionsOrTitle.confirmOptions) {
                delete optionsOrTitle.confirmOptions;
                infoOptions = { ...infoOptions, ...withConfirm }
            }
            return generic({ ...infoOptions, ...optionsOrTitle })
        } else {
            const text = arguments[1];
            const confirmOptions = arguments[2];
            if (confirmOptions) {
                infoOptions = { ...infoOptions, ...withConfirm }
            }
            return generic({
                title: optionsOrTitle,
                text,
                ...infoOptions
            })
        }

    }


    success(optionsOrTitle: SwalGenericOptions): Promise<SweetAlertResult>
    success(optionsOrTitle: string, text?: string): Promise<SweetAlertResult>
    success(optionsOrTitle): Promise<SweetAlertResult> {
        const successOptions: SwalGenericOptions = {
            showConfirmButton: true,
            type: "success",
            toast: true,

        };
        if (util.isObject(optionsOrTitle)) {
            return generic({ ...successOptions, ...optionsOrTitle })
        } else {
            const text = arguments[1];
            return generic({
                title: optionsOrTitle,
                text,
                ...successOptions
            })
        }

    }
};


const big = new class Big {

    /**calls `big.oneButton`.
     * @see Big.oneButton*/
    async error(options: SwalGenericOptions): Promise<SweetAlertResult> {
        return this.oneButton({
            type: "error",
            ...options,

        });
    }

    /**calls `big.oneButton`.
     * @see Big.oneButton*/
    warning(options: SwalGenericOptions): Promise<SweetAlertResult> {
        return this.oneButton({
            type: 'warning',
            ...options
        });
    }

    /**calls `big.oneButton`, usees `withConfirm`.
     @see Big.oneButton
     @see withConfirm*/
    async confirm(options: SwalGenericOptions): Promise<boolean> {
        const res = await this.oneButton({
            type: 'question',
            ...withConfirm,
            ...options
        });
        const ret = !!(res?.value);
        console.debug(`big.confirm(title: "${options.title}") | oneButton returned: ${pftm(res)}, returning: ${ret}`);
        return ret;

    }

    blocking(options: SwalGenericOptions, moreOptions?: { strings: string[], clickFn: (bhe: typeof BetterHTMLElement) => any }): Promise<SweetAlertResult> {

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
                    console.debug('modalElement:', modalElement);
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
    }

    /**The 'one' button is 'showConfirmButton: true'. Uses 'blockingOptions'.
     @see blockingOptions*/
    oneButton(options: SwalGenericOptions): Promise<SweetAlertResult> {
        return generic({
            ...blockingOptions,
            showConfirmButton: true,
            ...options,

        });
    }

    /**The 'one' button is 'showConfirmButton: true', the 'second' is 'showCancelButton: true'. Uses 'blockingOptions'.
     @see blockingOptions*/
    async twoButtons(options: SwalGenericOptions): Promise<"confirm" | "second"> {
        const res = await generic({
            ...blockingOptions,
            showConfirmButton: true,
            showCancelButton: true,
            ...options,

        });

        if (!util.hasprops(res, 'value')) {
            console.warn(`big.twoButtons(title: "${options.title}") | generic returned res without .value. res: `, pftm(res));
        }
        return res?.value ? "confirm" : "second";
    }

    async threeButtons(options: SwalGenericOptions & { thirdButtonText: string, thirdButtonType?: "confirm" | "warning" }): Promise<CancelConfirmThird> {

        // const thirdButtonText = options.thirdButtonText ?? 'Overwrite';
        let thirdButtonCss;
        if (options.thirdButtonType === "warning") {
            thirdButtonCss = { backgroundColor: '#FFC66D', color: 'black' }
        }

        console.debug('threeButtons()', { thirdButtonCss });
        let action: CancelConfirmThird;
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
const toexport: {
    small: {
        _success(options): Promise<SweetAlertResult>;
        _info(options): Promise<SweetAlertResult>;
        _question(options): Promise<SweetAlertResult>;
        success(title, text?: any): Promise<SweetAlertResult>;
        _error(options): Promise<SweetAlertResult>;
        _warning(options): Promise<SweetAlertResult>;
        warning(title, text?: any): Promise<SweetAlertResult>;
        error(title, text): Promise<SweetAlertResult>;
        info(title, text?: any, showConfirmBtns?: boolean): Promise<SweetAlertResult>
    };
    big: {
        confirm(options: SweetAlertOptions): Promise<boolean>;
        oneButton(options: SweetAlertOptions): Promise<SweetAlertResult>;
        twoButtons(options: SweetAlertOptions): Promise<"confirm" | "second">;
        blocking(options: SweetAlertOptions, moreOptions?: {
            strings: string[];
            clickFn: (bhe: typeof BetterHTMLElement) => any
        }): Promise<SweetAlertResult>;
        warning(options: SweetAlertOptions): Promise<SweetAlertResult>;
        error(options: Omit<SweetAlertOptions, "onOpen" | "onAfterClose"> & { html: string | Error }): Promise<SweetAlertResult>;
        threeButtons(options: SweetAlertOptions & { thirdButtonText: string; thirdButtonType?: "confirm" | "warning" }): Promise<CancelConfirmThird>
    },


} = { small, big }
export = toexport;
