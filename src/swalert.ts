import { BetterHTMLElement, Button, div, Div, elem, paragraph, Paragraph } from "./bhe";
import Swal, { SweetAlertIcon, SweetAlertOptions, SweetAlertResult } from 'sweetalert2';
import * as util from "./util";

module swalert {


    console.debug('src/swalert.ts');


    type OptionsWithIcon = SweetAlertOptions & { icon: SweetAlertIcon; /* not optional, needed to manage queue */ };
    type CancelConfirmThird = "confirm" | "cancel" | "third";
    type OptionsSansIcon = Omit<SweetAlertOptions, "icon">;


    export async function foo() {
        const options: SweetAlertOptions = {
            toast: false,
            icon: "info",
            showCancelButton: true,
            showDenyButton: true,
            showClass: { popup: '', backdrop: '', icon: '' },
            hideClass: { popup: '', backdrop: '', icon: '' }
        };

        function info(title, timer = null) {
            return { ...options, title, timer };
        }

        // console.log(`Swal.getQueueStep(): `, Swal.getQueueStep());
        const swal = {
            ...info('first'),

            async didRender(popup) {
                // popup is {}
                // waiting here doesn't block anything
                console.log(`didRender | popup: ${pf(popup)}`);


                const _actions = Swal.getActions() as HTMLDivElement;

                const actions = div({
                    htmlElement: _actions,
                    children: {
                        confirm: '[class*=confirm]',
                        deny: '[class*=deny]',
                        cancel: '[class*=cancel]',
                    }
                }) as Div & { confirm?: Button, deny?: Button, cancel?: Button; };

                if (actions.cancel) {
                    actions.cancel.click(async _event => {

                        /*const swalReturned = await util.waitUntil(() => {
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
                        }*/

                        console.log(`cancel click`);


                    });
                }
                if (actions.confirm) {
                    actions.confirm.click(async _event => {
                        console.log(`confirm click`);
                    });
                }
                if (actions.deny) {
                    actions.deny.click(async _event => console.log(`deny click`));
                }


            },

            willOpen: async popup => {
                // popup is {}
                // waiting here doesn't block anything
                console.log(`willOpen | popup: ${pf(popup)}`);


            },
            didOpen: async popup => {
                // popup is {}
                // waiting here doesn't block anything
                console.log(`didOpen | popup: ${pf(popup)}`);


            },
            preDeny: async inputValue => {
                // happens after Deny click hook finishes
                // inputValue is false (when toast?)
                // waiting here blocks execution
                console.log(`preDeny | inputValue: ${pf(inputValue)}`);
                /*console.log(`preDeny waiting 1s, inputValue: ${pftm(inputValue)}`)
                await util.wait(1000);
                console.log(`preDeny done waiting 1s`)*/

            },
            preConfirm: async inputValue => {
                // happens after Confirm click hook finishes
                // inputValue is true (when toast?)
                // waiting here blocks execution
                console.log(`preConfirm | inputValue: ${pf(inputValue)}`);
                /*console.log(`preConfirm waiting 1s, inputValue: ${pftm(inputValue)}`)
                await util.wait(1000);
                console.log(`preConfirm done waiting 1s`)*/
            },

            willClose: async popup => {
                // popup is {}
                // waiting here doesn't block anything
                console.log(`willClose | popup: ${pf(popup)}`);


            },
            didClose: async () => {
                // happens after Swal.queue promised is resolved
                // waiting here doesn't block anything
                console.log(`didClose`);


            },
            didDestroy: async () => {
                // happens after didClose
                // waiting here doesn't block anything
                console.log(`didDestroy`);

            },
        };

        // const res = await Swal.queue([swal]);
        const res = await Swal.fire(swal);
        console.log('done awaiting, res:', pf(res)); // happens after willClose and before didClose
        // console.log(`Swal.getQueueStep(): `, Swal.getQueueStep());

    }


    /**Converts newlines to html <br>, sets unimportant defaults (timer:6000), and manages Swal queue.*/
    async function generic(options: SweetAlertOptions): Promise<SweetAlertResult> {
        //// Note:
        // Swal.queue immediately displays swal, overrunning .queue(), .fire() etc. So there's no reason to use Swal.fire().
        // Swal.insertQueueStep takes effect only if:
        // · swal is visible and fired through .queue(), and
        // · existing swal was closed through CONFIRM or NO (deny) and not dismissal (backdrop, cancel, close, esc, timer)

        //// res = await Swal.queue() behavior (confirm, cancel, deny, timer):
        // confirm → res is { value: [true] }
        // cancel → res is { dismiss: "cancel" }
        // deny → res is { value: [false] }
        // timer over → res is { dismiss: "timer" }
        // inserted queue step before timer over, then pressed confirm → res is { value: [true, true] }

        //// Hooks order: (same with Swal.queue() and Swal.fire())
        // · didRender(popup)
        //       - popup always {}?

        // · willOpen(popup)
        //       - popup always {}?

        // · didOpen(popup)
        //       - popup always {}?
        //       - Swal.isVisible() is true only after didOpen() finishes

        // · BUTTON CLICK HOOK
        //       - awaiting does not block

        // · preConfirm(inputValue) / preDeny(inputValue)
        //       - awaiting blocks rest of execution
        //       - executed only if matching button was clicked
        //       - inputValue is true when Confirm, false when Deny

        // · willClose(popup)
        //       - popup always {}?

        // · PROMISE RESOLVED

        // · didClose()

        // · didDestroy()


        const rnd = Math.round(Math.random() * 100);

        let title = `swalert.generic(title: "${options.title}", icon: "${options.icon}", timer: ${options.timer})(#${rnd}) |\n\t`;
        // console.log(title);
        let propname;
        let propval;

        function _format_value(_propval): string {
            if (typeof _propval === 'string') {
                if (_propval.includes('\n')) {
                    _propval = _propval.replaceAll('\n', '<br>');
                }
            } else if (util.isObject(_propval)) {
                _propval = pf(_propval);
            }
            return _propval;
        }

        // * newline → <br>
        if (options.text || options.html) {
            if (options.text && options.html) {
                console.warn(`${title} Got both options.text and options.html. Using only options.text:\n\t"${pf(options.text)}"`);
                propname = 'text';
                propval = options.text;
            } else if (options.text) {
                propname = 'text';
                propval = options.text;
            } else {
                propname = 'html';
                propval = options.html;
            }
            if (propval.match(/<[a-z]+>/)) {
                console.warn(`swalert.generic() | Looks like '${propname}' has HTML tags; not formatting`)
            } else {
                propval = _format_value(propval);
                options[propname] = propval;
            }
        }
        if (options.title) {
            options['title'] = _format_value(options.title);
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


        const results: SweetAlertResult = await Swal.queue([options]);
        /// This awaits until LAST (current) swal is timed out
        // debug(`Swal.queue → ${pf(results)}`);
        return results;
    }


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


    export const small = new class Small {

        error(optionsOrTitle: OptionsSansIcon & { log?: boolean }): Promise<SweetAlertResult>;
        error(optionsOrTitle: string, text?: string): Promise<SweetAlertResult>;
        error(optionsOrTitle): Promise<SweetAlertResult> {
            const errorOptions: OptionsWithIcon = {
                showConfirmButton: true,
                timer: null,
                icon: "error",
                toast: true,

            };
            if (util.isTMap(optionsOrTitle)) {
                if (optionsOrTitle.pop('log') === true) {
                    console.error(optionsOrTitle.title, optionsOrTitle.text ?? optionsOrTitle.html ?? undefined)
                }
                return generic({ ...errorOptions, ...optionsOrTitle });
            } else {
                const text = arguments[1];
                return generic({
                    title: optionsOrTitle,
                    text,
                    ...errorOptions
                });
            }

        }


        warning(options: OptionsSansIcon & { log?: boolean }): Promise<SweetAlertResult>;
        warning(title: string, text?: string): Promise<SweetAlertResult>;
        warning(optionsOrTitle): Promise<SweetAlertResult> {
            const warningOptions: OptionsWithIcon = {
                showConfirmButton: true,
                timer: null,
                icon: "warning",
                toast: true,

            };

            if (util.isTMap(optionsOrTitle)) {
                if (optionsOrTitle.pop('log') === true) {
                    warn(optionsOrTitle.title, optionsOrTitle.text ?? optionsOrTitle.html ?? undefined)
                }
                return generic({ ...warningOptions, ...optionsOrTitle });
            } else {
                const text = arguments[1];
                return generic({
                    title: optionsOrTitle,
                    text,
                    ...warningOptions
                });
            }

        }

        info(optionsOrTitle: OptionsSansIcon & { confirmOptions?: boolean; }): Promise<SweetAlertResult>;
        info(optionsOrTitle: string, text?: string, confirmOptions?: boolean): Promise<SweetAlertResult>;
        info(optionsOrTitle): Promise<SweetAlertResult> {

            let infoOptions: OptionsWithIcon = {
                showConfirmButton: true,
                icon: "info",
                toast: true,
            };
            if (util.isTMap(optionsOrTitle)) {

                if (optionsOrTitle.confirmOptions) {
                    delete optionsOrTitle.confirmOptions;
                    infoOptions = { ...infoOptions, ...withConfirm };
                }
                return generic({ ...infoOptions, ...optionsOrTitle });
            } else {
                const text = arguments[1];
                const confirmOptions = arguments[2];
                if (confirmOptions) {
                    infoOptions = { ...infoOptions, ...withConfirm };
                }
                return generic({
                    title: optionsOrTitle,
                    text,
                    ...infoOptions
                });
            }

        }


        success(optionsOrTitle: OptionsSansIcon): Promise<SweetAlertResult>;
        success(optionsOrTitle: string, text?: string): Promise<SweetAlertResult>;
        success(optionsOrTitle): Promise<SweetAlertResult> {
            const successOptions: OptionsWithIcon = {
                showConfirmButton: true,
                icon: "success",
                toast: true,

            };
            if (util.isTMap(optionsOrTitle)) {
                return generic({ ...successOptions, ...optionsOrTitle });
            } else {
                const text = arguments[1];
                return generic({
                    title: optionsOrTitle,
                    text,
                    ...successOptions
                });
            }

        }
    };

    type _cancelOrConfirm = "cancel" | "confirm"
    type _cancelOrConfirmOrDeny = _cancelOrConfirm | "deny"
    type _textOrColorOrClass = "Text" | "Color" | "Class"
    type _firstOrSecond = "first" | "second"
    type _firstOrSecondOrThird = "first" | "second" | "third"
    // type TwoButtonsOptions = Omit<SweetAlertOptions, `${_cancelOrConfirm}Button${_textOrColorOrClass}`> & {
    //     firstButtonText?: string, secondButtonText?: string, firstButtonColor?: string, secondButtonColor?: string
    // };
    type TwoButtonsOptions = Omit<SweetAlertOptions, `${_cancelOrConfirm}Button${_textOrColorOrClass}`> & { [K in `${_firstOrSecond}Button${_textOrColorOrClass}`]? }
    type ThreeButtonsOptions = Omit<TwoButtonsOptions, `${_cancelOrConfirmOrDeny}Button${_textOrColorOrClass}`> & { [K in `${_firstOrSecondOrThird}Button${_textOrColorOrClass}`]? }
    export const big = new class Big {

        /**calls `big.oneButton`.
         * @see Big.oneButton*/
        async error(options: OptionsSansIcon & { log?: boolean }): Promise<SweetAlertResult> {
            if (options.pop('log') === true) {
                console.error(options.title, options.text ?? options.html ?? undefined)
            }
            return this.oneButton({
                icon: "error",
                ...options,

            });
        }

        /**calls `big.oneButton`.
         * @see Big.oneButton*/
        warning(options: OptionsSansIcon & { log?: boolean }): Promise<SweetAlertResult> {
            if (options.pop('log') === true) {
                warn(options.title, options.text ?? options.html ?? undefined)
            }
            return this.oneButton({
                icon: 'warning',
                ...options
            });
        }

        /**calls `big.oneButton`, usees `withConfirm`.
         @see Big.oneButton
         @see withConfirm*/
        async confirm(options: OptionsSansIcon): Promise<boolean> {
            const res = await this.oneButton({
                icon: 'question',
                ...withConfirm,
                ...options
            });
            const ret = !!(res?.value);
            console.debug(`big.confirm(title: "${options.title}") | oneButton returned: ${pf(res)}, returning: ${ret}`);
            return ret;

        }

        blocking_(options: SweetAlertOptions, moreOptions?: { strings: string[], clickFn: (bhe: typeof BetterHTMLElement) => any; }): Promise<SweetAlertResult> {

            if (moreOptions && moreOptions.strings && moreOptions.clickFn) {
                let { strings, clickFn } = moreOptions;

                let paragraphs = strings
                    // .map(s => $(`<p class="clickable">${s}</p>`))
                    .map(s => paragraph({ cls: 'clickable', text: s }))
                    // @ts-ignore
                    .map(pElem => pElem.click(() => clickFn(pElem)));

                options = {
                    ...options,
                    willOpen(modalElement: HTMLElement) {
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
            if (options.showConfirmButton || options.showCancelButton || options.didOpen) {
                // / Happens when not or bad moreOptions
                return Swal.fire({ ...blockingOptions, ...options });
            } else { // TODO: onOpen : resolve?

                // @ts-ignore
                return new Promise(resolve => Swal.fire({ ...blockingOptions, ...options, didOpen: v => resolve(v) }));
            }
        }

        blocking(options: SweetAlertOptions & { strings?: string[], clickFn?: (bhe: Paragraph) => any; }): Promise<SweetAlertResult> {

            if (options.strings && options.clickFn) {
                let { strings, clickFn } = options;

                let paragraphs = strings
                    // .map(s => $(`<p class="clickable">${s}</p>`))
                    .map(s => paragraph({ cls: 'clickable', text: s }))
                    .map(pElem => pElem.click(() => clickFn(pElem)));

                options = {
                    ...options,
                    willOpen(modalElement: HTMLElement) {
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
            if (options.showConfirmButton || options.showCancelButton || options.didOpen) {
                // / Happens when not or bad moreOptions
                return generic({ ...blockingOptions, ...options })
                // return Swal.fire({ ...blockingOptions, ...options });
            } else { // TODO: onOpen : resolve?

                // @ts-ignore
                return new Promise(resolve => Swal.fire({ ...blockingOptions, ...options, didOpen: v => resolve(v) }));
            }
        }

        /**The 'one' button is 'showConfirmButton: true'. Uses 'blockingOptions'.
         @see blockingOptions*/
        oneButton(options: OptionsWithIcon): Promise<SweetAlertResult> {
            return generic({
                ...blockingOptions,
                showConfirmButton: true,
                ...options,

            });
        }

        /**The 'first' button is 'showConfirmButton: true', the 'second' is 'showCancelButton: true'. Uses 'blockingOptions'.
         * `firstButtonText` defaults to "Confirm", `secondButtonText` defaults to "Cancel".
         @see blockingOptions*/
        async twoButtons(options: TwoButtonsOptions): Promise<"first" | "second"> {
            const res = await generic({
                ...blockingOptions,
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: options.pop("firstButtonText", "Confirm"),
                cancelButtonText: options.pop("secondButtonText", "Cancel"),
                ...options,
            });


            return res?.value ? "first" : "second";
        }

        /**The 'first' button is 'showConfirmButton: true', the 'second' is 'showCancelButton: true'. the 'third' is 'showDenyButton: true'. Uses 'blockingOptions'.
         * `firstButtonText` defaults to "Confirm", `secondButtonText` defaults to "Cancel".
         @see blockingOptions*/
        async threeButtons(options: ThreeButtonsOptions): Promise<"first" | "second" | "third"> {
            let firstButtonClass = options.pop('firstButtonClass');
            let secondButtonClass = options.pop('secondButtonClass');
            let thirdButtonClass = options.pop('thirdButtonClass');
            const res = await generic({
                ...blockingOptions,
                showConfirmButton: true,
                showCancelButton: true,
                showDenyButton: true,
                confirmButtonText: options.pop("firstButtonText", "Confirm"),
                cancelButtonText: options.pop("secondButtonText", "Cancel"),
                cancelButtonColor: options.pop("secondButtonColor", secondButtonClass ? null : '#3375C1'),
                denyButtonText: options.pop("thirdButtonText", "thirdButtonText"),
                denyButtonColor: options.pop("thirdButtonColor", '#3375C1'),
                willOpen: function (popup: HTMLElement) {
                    if (firstButtonClass) {
                        elem({ htmlElement: Swal.getConfirmButton() }).addClass(firstButtonClass)
                    }
                    if (secondButtonClass) {
                        elem({ htmlElement: Swal.getCancelButton() }).addClass(secondButtonClass)
                    }
                    if (thirdButtonClass) {
                        elem({ htmlElement: Swal.getDenyButton() }).addClass(thirdButtonClass)
                    }
                },
                ...options,
            })

            // js is dumb so [true] === [true] → false; using util.equal
            if (util.equal(res?.value, [true])) { // confirm
                return 'first'
            } else if (res?.dismiss === Swal.DismissReason.cancel) { // cancel
                return 'second'
            } else if (util.equal(res?.value, [false])) { // deny
                return 'third'
            } else {
                if (DEVTOOLS) {
                    console.error(`swalert.big.threeButtons() | unknown res: ${pff(res)}\n\toptions: ${pff(options)}`)
                    debugger;

                } else {
                    console.warn(`swalert.big.threeButtons() | unknown res: ${pff(res)}\n\toptions: ${pff(options)}`)
                    return undefined
                }
            }


        }
    };

    export const close = Swal.close;
    export const isVisible = Swal.isVisible;
    // big.threeButtons = util.investigate(big.threeButtons, { group: true })

// export default { alertFn, small, big, close : Swal.close, isVisible : Swal.isVisible };
// const toexport = { small, big, foo }
//     export { small, big, foo, swalQueue, OptionsWithIcon };

}
export default swalert