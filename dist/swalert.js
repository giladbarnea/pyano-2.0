/**import Alert from 'MyAlert' (or any other name)*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.big = exports.small = void 0;
const bhe_1 = require("./bhe");
console.debug('src/swalert.ts');
const sweetalert2_1 = require("sweetalert2");
const swalTypes = {
    info: 0,
    success: 1,
    question: 2,
    warning: 3,
    error: 4
};
function activeIsToast() {
    if (!sweetalert2_1.default.isVisible()) {
        return false;
    }
    // @ts-ignore
    return sweetalert2_1.default.getPopup().classList.contains('swal2-toast');
}
function activeType() {
    if (!sweetalert2_1.default.isVisible()) {
        return undefined;
    }
    const classes = sweetalert2_1.default.getIcons().find(div => div.style.display != 'none').classList.value;
    for (let type of ['success', 'error', 'warning', 'info', 'question']) {
        if (classes.includes(type)) {
            return type;
        }
    }
    console.warn(`myalert activeType() couldnt find type. classes: ${classes}`);
}
/**Converts newlines to html <br>, aesthetic defaults (timer:null), and manages Swal queue.*/
async function generic(options) {
    let propname;
    let propval;
    function _format_value(_propval) {
        if (typeof _propval === 'string') {
            if (_propval.includes('\n')) {
                _propval = _propval.replaceAll('\n', '<br>');
            }
        }
        else if (util.isObject(_propval)) {
            _propval = JSON.stringify(_propval);
        }
        return _propval;
    }
    if (options.text || options.html) {
        if (options.text) {
            propname = 'text';
            propval = options.text;
        }
        else if (options.html) {
            propname = 'html';
            propval = options.html;
        }
        propval = _format_value(propval);
        options[propname] = propval;
    }
    if (options.title) {
        options['title'] = _format_value(options.title);
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
    if (sweetalert2_1.default.isVisible()) {
        // not-toast trumps toast, warning trumps success
        const takePrecedence = (!options.toast && activeIsToast()) || (swalTypes[options.type] > swalTypes[activeType()]);
        if (takePrecedence) {
            console.debug(`swalert.generic() | takePrecedence=true. Returning Swal.fire(options). options:`, options);
            return sweetalert2_1.default.fire(options);
        }
        const currentQueueStep = sweetalert2_1.default.getQueueStep();
        if (currentQueueStep === null) {
            // * Swal exists, but fired through `fire` and not `queue`
            const timedout = !(await util.waitUntil(() => !sweetalert2_1.default.isVisible(), 500, 60000));
            if (timedout) {
                console.warn(`Swal.generic() | time out waiting for existing swal to close. returning undefined. options:`, options);
                return undefined;
            }
            console.debug(`swalert.generic() | waited successfully until !Swal.isVisible(). Awaiting Swal.queue([options])`, options);
            const results = await sweetalert2_1.default.queue([options]);
            console.debug(`swalert.generic() | returning results[0]:`, results[0]);
            return results[0];
        }
        else {
            // * Swal exists, and fired through `queue`
            console.debug(`swalert.generic() | Swal exists, and fired through 'queue'. Doing 'Swal.insertQueueStep(options)' and returning undefined. options:`, options);
            sweetalert2_1.default.insertQueueStep(options);
            return;
        }
    }
    console.debug(`swalert.generic() | Awaiting Swal.queue([options])`, options);
    const results = await sweetalert2_1.default.queue([options]);
    console.debug(`swalert.generic() | returning results[0]:`, results[0]);
    return results[0];
}
const smallMixin = sweetalert2_1.default.mixin({
    position: "bottom-start",
    showConfirmButton: false,
    timer: 8000,
    toast: true,
});
const withConfirm = {
    cancelButtonText: "No",
    confirmButtonText: "Yes",
    showCancelButton: true,
    showConfirmButton: true,
    timer: null,
};
const blockingOptions = {
    allowEnterKey: false,
    allowEscapeKey: false,
    allowOutsideClick: false,
    showCancelButton: false,
    showCloseButton: false,
    showConfirmButton: false,
    timer: null
    // width : "90vw",
};
const threeButtonsOptions = {
    ...blockingOptions,
    showConfirmButton: true,
    showCancelButton: true,
};
const blockingSwalMixin = sweetalert2_1.default.mixin(blockingOptions);
const small = {
    _question(options) {
        return smallMixin.fire({ ...options, type: 'question' });
    },
    _info(options) {
        return smallMixin.fire({ ...options, type: 'info' });
    },
    _success(options) {
        return smallMixin.fire({ ...options, type: 'success' });
    },
    _error(options) {
        return smallMixin.fire({ ...options, type: 'error' });
    },
    _warning(options) {
        return smallMixin.fire({
            ...options,
            showConfirmButton: true, type: 'warning'
        });
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
        });
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
exports.small = small;
const big = {
    async error(options) {
        // TODO: either don't use at all (and make console.error hook display an error swalert),
        //  or just make it fire a simple swal
        if (options?.html instanceof Error) {
            const error = options.html;
            const { what, where, cleanstack } = error.toObj();
            console.warn('Error!', error, { cleanstack });
            options.html = `${what}<p>${where}</p>`;
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
            options.html += `<p>Logs and screenshot saved to errors/${path.basename(SESSION_PATH_ABS)}/${dirname}</p>`;
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
    async confirm(options) {
        const res = await this.oneButton({
            type: 'question',
            cancelButtonText: "No",
            confirmButtonText: "Yes",
            showCancelButton: true,
            showConfirmButton: true,
            ...options
        });
        console.debug(`big.confirm() | res:`, res);
        return !!(res?.value);
        // return !!value;
    },
    blocking(options, moreOptions) {
        if (moreOptions && moreOptions.strings && moreOptions.clickFn) {
            let { strings, clickFn } = moreOptions;
            let paragraphs = strings
                // .map(s => $(`<p class="clickable">${s}</p>`))
                .map(s => bhe_1.paragraph({ cls: 'clickable', text: s }))
                // @ts-ignore
                .map(pElem => pElem.click(() => clickFn(pElem)));
            options = {
                ...options,
                onBeforeOpen(modalElement) {
                    console.debug('modalElement:', modalElement);
                    return bhe_1.elem({ byid: 'swal2-content' })
                        // .show()
                        .append(...paragraphs);
                }
            };
        }
        else { // force confirm and cancel buttons
            options = {
                showConfirmButton: true,
                showCancelButton: true,
                ...options,
            };
        }
        if (options.showConfirmButton || options.showCancelButton || options.onOpen) {
            // / Happens when not or bad moreOptions
            return sweetalert2_1.default.fire({ ...blockingOptions, ...options });
        }
        else { // TODO: onOpen : resolve?
            // @ts-ignore
            return new Promise(resolve => sweetalert2_1.default.fire({ ...blockingOptions, ...options, onOpen: v => resolve(v) }));
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
        const { value } = await sweetalert2_1.default.fire({
            showCancelButton: true,
            ...options
        });
        return value ? "confirm" : "second";
    },
    async threeButtons(options) {
        // const thirdButtonText = options.thirdButtonText ?? 'Overwrite';
        let thirdButtonCss;
        if (options.thirdButtonType === "warning") {
            thirdButtonCss = { backgroundColor: '#FFC66D', color: 'black' };
        }
        console.debug('threeButtons()', { thirdButtonCss });
        let action;
        const onBeforeOpen = (modal) => {
            let el = bhe_1.elem({
                htmlElement: modal,
                children: { actions: '.swal2-actions' }
            });
            el.actions.append(bhe_1.button({ cls: `swal2-confirm swal2-styled`, html: options.thirdButtonText })
                .css(thirdButtonCss)
                .click(async (ev) => {
                action = "third";
                sweetalert2_1.default.clickConfirm();
            }));
        };
        options = { ...options, onBeforeOpen, showCancelButton: true };
        const { value } = await sweetalert2_1.default.fire(options);
        if (value) {
            /// Either user clicked Confirm (action is undefined) or Swal.clickConfirm() (action is "third")
            if (action === undefined) {
                action = "confirm";
            }
        }
        else {
            action = "cancel";
        }
        return action;
    }
};
exports.big = big;