/**import Alert from 'MyAlert' (or any other name)*/


import { BetterHTMLElement, button, Button, elem, div, Div, paragraph } from "./bhe";

button()
console.debug('src/swalert.ts');

import Swal, { SweetAlertIcon, SweetAlertOptions, SweetAlertResult } from 'sweetalert2';
// import Queue = require('queue-fifo');
//
// const swalQueue = new Queue<SweetAlertOptions>()
// const utilz= require("./util")
// console.log('util:',util)
import * as util from "./util";

type SwalGenericOptions = SweetAlertOptions & { icon: SweetAlertIcon /* not optional, needed to manage queue */ };
const swalQueue = new Map<number, SwalGenericOptions>()
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
//         function threeButtons(options: SweetAlertOptions & { thirdText: string, thirdIcon?: "confirm" | "warning" }): Promise<CancelConfirmThird>
//     }
//     export { small, big, CancelConfirmThird };
// }


const swalIcons = {
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
    // TODO: make sure this works with swal10
    return Swal.getPopup().classList.contains('swal2-toast') ?? false
}

function getActiveIcon(): SweetAlertIcon {
    if (!Swal.isVisible()) {
        return undefined
    }

    let icons = Swal.getIcons();
    const classes = icons
        .find(div => div.style.display != 'none')
        ?.classList
        .value;
    if (classes === undefined) {
        console.warn(`swalert.getActiveIcon() | Swal is visible, but couldnt find icon. returning undefined`)
        return undefined;
    }
    for (let icon of ['success', 'error', 'warning', 'info', 'question']) {
        if (classes.includes(icon)) {
            return icon as SweetAlertIcon
        }
    }
    console.warn(`swalert.getActiveIcon() | couldnt find icon. classes: ${classes}`)
    return undefined;
}


async function foo() {
    const options: SweetAlertOptions = {
        toast: true,
        icon: "info",
        showCancelButton: true,
        showDenyButton: true,
        showClass: { popup: '', backdrop: '', icon: '' },
        hideClass: { popup: '', backdrop: '', icon: '' }
    };

    function info(title, timer = null) {
        return { ...options, title, timer }
    }

    console.log(`Swal.getQueueStep(): `, Swal.getQueueStep());
    // promise is resolved after didDestroy is done
    const res = await Swal.queue([{
        ...info('first'),

        didRender(popup) {
            console.log(`didRender:`, pftm(popup));
            const _actions = Swal.getActions() as HTMLDivElement;

            const actions = div({
                htmlElement: _actions,
                children: {
                    confirm: '[class*=confirm]',
                    deny: '[class*=deny]',
                    cancel: '[class*=cancel]',
                }
            }) as Div & { confirm?: Button, deny?: Button, cancel?: Button }
            if (actions.cancel) {
                actions.cancel.click(async _event => {

                    const swalReturned = await util.waitUntil(() => {
                        try {
                            return util.bool(res)
                        } catch {
                            return false
                        }
                    }, 20, 1000);
                    if (swalReturned) {
                        console.debug(`didRender() | swalReturned: ${swalReturned}, res: `, pftm(res));
                    } else {
                        console.warn(`didRender() | swalReturned: ${swalReturned}`);
                        debugger;
                    }

                });
            }


        },

        willOpen: popup => {
            // console.log(`willOpen:`, pftm(popup))
            // debugger;

        },
        didOpen: popup => {
            // console.log(`didOpen:`, pftm(popup))
            // debugger;

        },
        preDeny: inputValue => {
            // console.log(`preConfirm:`, pftm(inputValue))
            // debugger;
            // await util.wait(1000);
        },
        preConfirm: async inputValue => {
            // console.log(`preConfirm:`, pftm(inputValue))
            // debugger;
            // await util.wait(1000);
        },

        willClose: popup => {
            // console.log(`willClose:`, pftm(popup))
            // debugger;

        },
        didClose: () => {
            // console.log(`didClose`);
            // debugger;


        },
        didDestroy: () => {
            // console.log(`didDestroy`);
            // debugger;

        },
    }
    ]);
    console.log('done awaiting, res:', pftm(res));
    console.log(`Swal.getQueueStep(): `, Swal.getQueueStep());

}

const hookDismissButtons = util.investigate(function hookDismissButtons(popup, onclick: (_event: MouseEvent) => Promise<any>) {
    const _actions = Swal.getActions() as HTMLDivElement;

    const actions = div({
        htmlElement: _actions,
        children: {
            confirm: '[class*=confirm]',
            deny: '[class*=deny]',
            cancel: '[class*=cancel]',
        }
    }) as Div & { confirm?: Button, deny?: Button, cancel?: Button }
    if (actions.cancel) {
        console.debug(`hookDismissButtons() | actions.cancel.click(onclick)`)
        actions.cancel.click(onclick);
    }
    if (actions.deny) {
        console.debug(`hookDismissButtons() | actions.deny.click(onclick)`)
        actions.deny.click(onclick);
    }


}, { group: true });
const removeFromQueueByStep = util.investigate(function removeFromQueueByStep(step: number, options: SwalGenericOptions) {

    const optsFromQueue = swalQueue.get(step);
    const optsFromQueueWithoutHooks = Object.fromEntries(
        Object.keys(optsFromQueue)
            .filter(k => /(will|did)[A-Z][a-z]{2,}/.test(k) === false)
            .map(k => [k, optsFromQueue[k]])
    );
    const optsWithoutHooks = Object.fromEntries(
        Object.keys(options)
            .filter(k => /(will|did)[A-Z][a-z]{2,}/.test(k) === false)
            .map(k => [k, options[k]])
    );
    const equal = util.equal(optsWithoutHooks, optsFromQueueWithoutHooks)
    if (equal) {
        swalQueue.delete(step);
        console.log(`removeFromQueueByStep(title: "${options.title}") | deleted key ${step} from swalQueue. swalQueue: `, pft(swalQueue));
    } else {
        if(DEVTOOLS) {
            debugger;
        }
    }
}, { group: true })


const insertQueueStep = util.investigate(function insertQueueStep(options: SwalGenericOptions) {

        const newoptions: SwalGenericOptions = {
            ...options,

            didRender(popup) {
                console.log(`insertQueueStep(title: "${options.title}") | didRender()`);
                removeFromQueueByStep(step, options);
                hookDismissButtons(popup, async _event => {
                    debugger;
                })

            },
            didDestroy() {
                console.log(`insertQueueStep(title: "${options.title}") | didDestroy()`);
            }

        }
        // insertQueueStep returns the number 2 if this is the first insert after a Swal.queue([...])
        let step = Swal.insertQueueStep(newoptions);
        step = util.int(step);
        swalQueue.set(step, newoptions);

        console.log(`insertQueueStep(title: "${options.title}") | set key ${step} in swalQueue: `, pft(swalQueue));
        return step

    }, { group: true }
);

const overrideQueue = util.investigate(async function overrideQueue(options: SwalGenericOptions):
    Promise<SweetAlertResult> {
    swalQueue.clear();
    const newoptions: SwalGenericOptions = {
        ...options,
        didRender(popup) {
            console.log(`overrideQueue(title: "${options.title}") | didRender()`);
            removeFromQueueByStep(step, options);
            hookDismissButtons(popup, async _event => {
                // TODO (24.09.2020):
                //  1. Understand how to display next in queue
                //  2. Hook Deny button as well (same fn?)
                //  3. Make sure "display next in queue" logic doesn't run when confirmed (it does so automatically)
                //  4. Figure out a way in insertQueueStep() to get passed option's res (is preConfirm enough?)
                const swalReturned = await util.waitUntil(() => {
                    try {
                        return util.bool(res)
                    } catch {
                        return false
                    }
                }, 50, 30000);
                if (swalReturned) {
                    console.debug(`overrideQueue(title: "${options.title}") hookDismissButtons() | swalReturned: ${swalReturned}, res:\n\t${pftm(res)}\nswalQueue:\n\t${pft(swalQueue)}`);
                } else {
                    console.warn(`overrideQueue(title: "${options.title}") hookDismissButtons() | timed out waiting for swal to return!`);
                    debugger;
                }

            })
        },
        didDestroy() {
            console.log(`overrideQueue(title: "${options.title}") | didDestroy()`);
        }
    }
    let step = 0;
    swalQueue.set(step, newoptions);
    console.log(`overrideQueue(title: "${options.title}") | set key ${step} in swalQueue: `, pft(swalQueue));
    const res = await Swal.queue([newoptions]) as SweetAlertResult;
    /// this happens after this very swal is done, even if others were queued
    if (res?.dismiss) {
        const nextStep = [...swalQueue.keys()].sort()[0];
        if (util.bool(nextStep)) {

            const nextOptions = swalQueue.get(nextStep);
            if (!util.bool(nextOptions)) {
                debugger;
            }
            const optionsWithoutHooks = Object.fromEntries(
                Object.keys(nextOptions)
                    .filter(k => /(will|did)[A-Z][a-z]{2,}/.test(k) === false)
                    .map(k => [k, nextOptions[k]])
            ) as SwalGenericOptions;
            overrideQueue(optionsWithoutHooks);
        }

    }
    console.log(`overrideQueue(title: "${options.title}") | returning Promise< ${pftm(res)} >, swalQueue: `, pft(swalQueue))
    return res

}, { group: true });

/**Converts newlines to html <br>, sets unimportant defaults (timer:6000), and manages Swal queue.*/
async function generic(options: SwalGenericOptions): Promise<SweetAlertResult> {
    //// Note:
    // Swal.queue immediately displays swal, overrunning .queue(), .fire() etc. So there's no reason to use Swal.fire().
    // Swal.insertQueueStep takes effect only if:
    // · swal is visible and fired through .queue(), and
    // · existing swal was closed through CONFIRM or NO (deny) and not dismissal (backdrop, cancel, close, esc, timer)

    /// res = await Swal.queue() behavior (confirm, cancel, deny, timer):
    // confirm → res is { value: [true] }
    // cancel → res is { dismiss: "cancel" }
    // deny → res is { value: [false] }
    // timer over → res is { dismiss: "timer" }
    // inserted queue step before timer over, then pressed confirm → res is { value: [true, true] }

    /// Hooks order:
    // · didRender(popup)
    // · willOpen(popup)
    // · didOpen(popup) (visible after returns)
    // · preConfirm(inputValue) (await wait() delays the rest only here)
    // · willClose(popup)
    // · didClose()
    // · didDestroy()
    // · PROMISE RESOLVED


    const rnd = Math.round(Math.random() * 100);

    let title = `swalert.generic(title: "${options.title}", icon: "${options.icon}", timer: ${options.timer})(${rnd}) |\n\t`;
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
        showClass: {
            popup: '',
            // backdrop: '',
        },
        hideClass: {
            popup: '',
            // backdrop: '',
        },
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
        } else if (options.icon !== undefined) {
            // warning takes precedence over success etc.
            // if currently visible icon is undefined, we take precedence if we're question and above.
            let currentIcon = getActiveIcon();
            if (currentIcon === undefined) {
                // 'question', 'warning' and 'error' take precedence over 'undefined'; 'info' and 'success' don't
                takePrecedence = swalIcons[options.icon] >= 2;
            } else {
                takePrecedence = swalIcons[options.icon] > swalIcons[currentIcon];
            }
        } else {
            // if icon isn't specified, we enter queue
            takePrecedence = false;
        }

        if (takePrecedence) {
            console.debug(`${title} takePrecedence=true. returning overrideQueue(options)`);
            // return Swal.queue([options])
            return overrideQueue(options);
        }
        const currentQueueStep = Swal.getQueueStep();
        if (currentQueueStep === null) {
            // * Swal exists, but fired through `fire` and not `queue`
            /*const timedout = !(await util.waitUntil(() => !Swal.isVisible(), 500, 60000));
            if (timedout) {
                console.warn(`${title} time out waiting for existing swal to close. returning undefined`);
                return undefined
            }
            console.debug(`${title} waited successfully until !Swal.isVisible(). awaiting Swal.queue([options])...`);
            const result = await Swal.queue([options]) as SweetAlertResult;
            console.debug(`${title} done awaiting Swal.queue that returned 'result'. returning results:`, pftm(result))
            return result*/
            console.warn('Swal exists, but fired through `fire` and not `queue`')
            return undefined
        }
        // * Swal exists, and fired through `queue`
        const msg = `${title} Swal is already visible, and fired through 'queue' (currentQueueStep: ${currentQueueStep}). calling 'insertQueueStep(options)'`;
        console.debug(msg)
        // const results = Swal.insertQueueStep(options);
        const step = insertQueueStep(options);
        console.debug(`${title} insertQueueStep(options) returned step: ${step}. returning undefined`)
        return undefined


    }
    console.debug(`${title} No Swal visible. returning overrideQueue(options)`);
    return overrideQueue(options)
    /*const results = await Swal.queue([options]);
    /// This awaits until ALL swals in queue are done!
    console.debug(`${title} done awaiting Swal.queue that returned 'results'. returning results[0]:`, pftm(results[0]))
    return results[0]*/
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
            icon: "error",
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
            icon: "warning",
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
            icon: "info",
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
            icon: "success",
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
            icon: "error",
            ...options,

        });
    }

    /**calls `big.oneButton`.
     * @see Big.oneButton*/
    warning(options: SwalGenericOptions): Promise<SweetAlertResult> {
        return this.oneButton({
            icon: 'warning',
            ...options
        });
    }

    /**calls `big.oneButton`, usees `withConfirm`.
     @see Big.oneButton
     @see withConfirm*/
    async confirm(options: SwalGenericOptions): Promise<boolean> {
        const res = await this.oneButton({
            icon: 'question',
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


    async threeButtons(options: SwalGenericOptions & { thirdText: string, thirdIcon?: "confirm" | "warning" }): Promise<CancelConfirmThird> {
        // TODO: use showDenyButton
        // const thirdText = options.thirdText ?? 'Overwrite';
        let thirdCss;
        if (options.thirdIcon === "warning") {
            thirdCss = { backgroundColor: '#FFC66D', color: 'black' }
        }

        console.debug('threeButtons()', pftm({ thirdCss }));
        let action: CancelConfirmThird;
        let thirdText = options.thirdText;
        delete options.thirdText;
        const willOpen = (modal: HTMLElement) => {
            let el = elem({
                htmlElement: modal,
                children: { actions: '.swal2-actions' }
            }) as BetterHTMLElement & { actions: BetterHTMLElement };


            el.actions.append(
                button({ cls: `swal2-confirm swal2-styled`, html: thirdText })

                    .css(thirdCss)
                    .click(async (ev: MouseEvent) => {
                        action = "third";
                        Swal.clickConfirm();
                    })
            )
        };
        options = { ...options, willOpen, showCancelButton: true };
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
big.threeButtons = util.investigate(big.threeButtons, { group: true })

// export default { alertFn, small, big, close : Swal.close, isVisible : Swal.isVisible };
// const toexport = { small, big, foo }
export { small, big, foo, swalQueue };
