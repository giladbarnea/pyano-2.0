"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("./bhe");
console.log('src/swalert.ts');
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
    console.warn(`myalert.ts activeType() couldnt find type. classes: ${classes}`);
}
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
    options = Object.assign({ animation: false, width: '90vw', position: options.toast ? "bottom" : "center", showConfirmButton: !options.toast, timer: 8000 }, options);
    if (sweetalert2_1.default.isVisible()) {
        const takePrecedence = (!options.toast && activeIsToast()) || (swalTypes[options.type] > swalTypes[activeType()]);
        if (takePrecedence) {
            return sweetalert2_1.default.fire(options);
        }
        const currentQueueStep = sweetalert2_1.default.getQueueStep();
        if (currentQueueStep === null) {
            const timedout = !(await util.waitUntil(() => !sweetalert2_1.default.isVisible(), 500, 60000));
            if (timedout) {
                console.warn(`Swal.generic() | time out waiting for existing swal to close`);
                return undefined;
            }
            const results = await sweetalert2_1.default.queue([options]);
            return results[0];
        }
        else {
            sweetalert2_1.default.insertQueueStep(options);
            return;
        }
    }
    const results = await sweetalert2_1.default.queue([options]);
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
};
const threeButtonsOptions = Object.assign(Object.assign({}, blockingOptions), { showConfirmButton: true, showCancelButton: true });
const blockingSwalMixin = sweetalert2_1.default.mixin(blockingOptions);
const small = {
    _question(options) {
        return smallMixin.fire(Object.assign(Object.assign({}, options), { type: 'question' }));
    },
    _info(options) {
        return smallMixin.fire(Object.assign(Object.assign({}, options), { type: 'info' }));
    },
    _success(options) {
        return smallMixin.fire(Object.assign(Object.assign({}, options), { type: 'success' }));
    },
    _error(options) {
        return smallMixin.fire(Object.assign(Object.assign({}, options), { type: 'error' }));
    },
    _warning(options) {
        return smallMixin.fire(Object.assign(Object.assign({}, options), { showConfirmButton: true, type: 'warning' }));
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
            infoOptions = Object.assign(Object.assign({}, infoOptions), withConfirm);
        }
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
        return smallMixin.fire(warningOptions);
    },
};
const big = {
    async error(options) {
        var _a;
        if (((_a = options) === null || _a === void 0 ? void 0 : _a.html) instanceof Error) {
            const error = options.html;
            const { what, where, cleanstack } = error.toObj();
            console.warn('Error!', error, { cleanstack });
            options.html = `${what}<p>${where}</p>`;
        }
        const dirname = new Date().human();
        const { default: Glob } = require('../Glob');
        if (LOG || !BigConfig.get('dev')) {
            options.onOpen = async () => {
                await util.takeScreenshot(dirname);
            };
            options.onAfterClose = async () => {
                await util.wait(500);
                await util.takeScreenshot(dirname);
            };
            options.html += `<p>Logs and screenshot saved to errors/${path.basename(SESSION_PATH_ABS)}/${dirname}</p>`;
        }
        return blockingSwalMixin.fire(Object.assign({ type: 'error', showConfirmButton: true }, options));
    },
    warning(options) {
        return this.oneButton(Object.assign({ type: 'warning' }, options));
    },
    async confirm(options) {
        const { value } = await this.oneButton(Object.assign({ type: 'question', cancelButtonText: "No", confirmButtonText: "Yes", showCancelButton: true, showConfirmButton: true }, options));
        return !!value;
    },
    blocking(options, moreOptions) {
        if (moreOptions && moreOptions.strings && moreOptions.clickFn) {
            let { strings, clickFn } = moreOptions;
            let paragraphs = strings
                .map(s => bhe_1.paragraph({ cls: 'clickable', text: s }))
                .map(pElem => pElem.click(() => clickFn(pElem)));
            options = Object.assign(Object.assign({}, options), { onBeforeOpen(modalElement) {
                    console.log('modalElement:', modalElement);
                    return bhe_1.elem({ byid: 'swal2-content' })
                        .append(...paragraphs);
                } });
        }
        else {
            options = Object.assign({ showConfirmButton: true, showCancelButton: true }, options);
        }
        if (options.showConfirmButton || options.showCancelButton || options.onOpen) {
            return sweetalert2_1.default.fire(Object.assign(Object.assign({}, blockingOptions), options));
        }
        else {
            return new Promise(resolve => sweetalert2_1.default.fire(Object.assign(Object.assign(Object.assign({}, blockingOptions), options), { onOpen: v => resolve(v) })));
        }
    },
    oneButton(options) {
        return generic(Object.assign(Object.assign(Object.assign({}, blockingOptions), { showConfirmButton: true }), options));
    },
    async twoButtons(options) {
        const { value } = await sweetalert2_1.default.fire(Object.assign({ showCancelButton: true }, options));
        return value ? "confirm" : "second";
    },
    async threeButtons(options) {
        let thirdButtonCss;
        if (options.thirdButtonType === "warning") {
            thirdButtonCss = { backgroundColor: '#FFC66D', color: 'black' };
        }
        console.log({ thirdButtonCss });
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
        options = Object.assign(Object.assign({}, options), { onBeforeOpen, showCancelButton: true });
        const { value } = await sweetalert2_1.default.fire(options);
        if (value) {
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
exports.default = Object.assign({ small, big }, sweetalert2_1.default);
//# sourceMappingURL=swalert.js.map