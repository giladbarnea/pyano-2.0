"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('src/MyAlert/index.ts');
const sweetalert2_1 = require("sweetalert2");
const bhe_1 = require("../bhe");
const smallMixin = sweetalert2_1.default.mixin({
    animation: false,
    customClass: 'animated fadeIn',
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
    animation: false,
    customClass: 'animated fadeIn',
    showCancelButton: false,
    showCloseButton: false,
    showConfirmButton: false,
    width: "75vw",
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
        if (showConfirmBtns)
            infoOptions = Object.assign(Object.assign({}, infoOptions), withConfirm);
        return smallMixin.fire(infoOptions);
    },
    success(title, text = null, timer = 6000) {
        return smallMixin.fire({
            title,
            text,
            type: "success",
            timer
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
    error(options) {
        return blockingSwalMixin.fire(Object.assign({ type: 'error', showConfirmButton: true, confirmButtonText: 'Remember to take a screenshot before pressing this' }, options));
    },
    warning(options) {
        if (options.animation === false)
            options = Object.assign({ customClass: null }, options);
        return blockingSwalMixin.fire(Object.assign(Object.assign(Object.assign({}, withConfirm), { type: 'warning' }), options));
    },
    blocking(options, moreOptions) {
        if (moreOptions && moreOptions.strings && moreOptions.clickFn) {
            let { strings, clickFn } = moreOptions;
            let paragraphs = strings
                .map(s => bhe_1.paragraph({ cls: 'clickable', text: s }))
                .map(pElem => pElem.click(() => clickFn(pElem)));
            options = Object.assign(Object.assign({}, options), { onBeforeOpen(modalElement) {
                    console.log('modalElement:', modalElement);
                    return bhe_1.elem({ id: 'swal2-content' })
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
    oneButton(title, options) {
        return blockingSwalMixin.fire(Object.assign({ title: title, showConfirmButton: true, customClass: 'animated fadeIn' }, options));
    },
    async twoButtons(title, options) {
        const { value } = await sweetalert2_1.default.fire(Object.assign({ title, showCancelButton: true, customClass: 'animated fadeIn' }, options));
        return value ? "confirm" : "cancel";
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
                .click((ev) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUNwQyw2Q0FBd0U7QUFDeEUsZ0NBQW9FO0FBR3BFLE1BQU0sVUFBVSxHQUFnQixxQkFBSSxDQUFDLEtBQUssQ0FBQztJQUN2QyxTQUFTLEVBQUcsS0FBSztJQUNqQixXQUFXLEVBQUcsaUJBQWlCO0lBQy9CLFFBQVEsRUFBRyxjQUFjO0lBQ3pCLGlCQUFpQixFQUFHLEtBQUs7SUFDekIsS0FBSyxFQUFHLElBQUk7SUFDWixLQUFLLEVBQUcsSUFBSTtDQUVmLENBQUMsQ0FBQztBQUNILE1BQU0sV0FBVyxHQUFzQjtJQUNuQyxnQkFBZ0IsRUFBRyxJQUFJO0lBQ3ZCLGlCQUFpQixFQUFHLEtBQUs7SUFDekIsZ0JBQWdCLEVBQUcsSUFBSTtJQUN2QixpQkFBaUIsRUFBRyxJQUFJO0lBQ3hCLEtBQUssRUFBRyxJQUFJO0NBRWYsQ0FBQztBQUNGLE1BQU0sZUFBZSxHQUFzQjtJQUN2QyxhQUFhLEVBQUcsS0FBSztJQUNyQixjQUFjLEVBQUcsS0FBSztJQUN0QixpQkFBaUIsRUFBRyxLQUFLO0lBQ3pCLFNBQVMsRUFBRyxLQUFLO0lBQ2pCLFdBQVcsRUFBRyxpQkFBaUI7SUFDL0IsZ0JBQWdCLEVBQUcsS0FBSztJQUN4QixlQUFlLEVBQUcsS0FBSztJQUN2QixpQkFBaUIsRUFBRyxLQUFLO0lBQ3pCLEtBQUssRUFBRyxNQUFNO0NBR2pCLENBQUM7QUFDRixNQUFNLG1CQUFtQixtQ0FDbEIsZUFBZSxLQUNsQixpQkFBaUIsRUFBRyxJQUFJLEVBQ3hCLGdCQUFnQixFQUFHLElBQUksR0FDMUIsQ0FBQztBQUNGLE1BQU0saUJBQWlCLEdBQUcscUJBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7QUFhdEQsTUFBTSxLQUFLLEdBQVU7SUFDakIsU0FBUyxDQUFDLE9BQU87UUFDYixPQUFPLFVBQVUsQ0FBQyxJQUFJLGlDQUFNLE9BQU8sS0FBRSxJQUFJLEVBQUcsVUFBVSxJQUFHLENBQUE7SUFDN0QsQ0FBQztJQUNELEtBQUssQ0FBQyxPQUFPO1FBQ1QsT0FBTyxVQUFVLENBQUMsSUFBSSxpQ0FBTSxPQUFPLEtBQUUsSUFBSSxFQUFHLE1BQU0sSUFBRyxDQUFBO0lBQ3pELENBQUM7SUFDRCxRQUFRLENBQUMsT0FBTztRQUNaLE9BQU8sVUFBVSxDQUFDLElBQUksaUNBQU0sT0FBTyxLQUFFLElBQUksRUFBRyxTQUFTLElBQUcsQ0FBQTtJQUM1RCxDQUFDO0lBQ0QsTUFBTSxDQUFDLE9BQU87UUFDVixPQUFPLFVBQVUsQ0FBQyxJQUFJLGlDQUFNLE9BQU8sS0FBRSxJQUFJLEVBQUcsT0FBTyxJQUFHLENBQUE7SUFDMUQsQ0FBQztJQUNELFFBQVEsQ0FBQyxPQUFPO1FBQ1osT0FBTyxVQUFVLENBQUMsSUFBSSxpQ0FDZixPQUFPLEtBQ1YsaUJBQWlCLEVBQUcsSUFBSSxFQUFFLElBQUksRUFBRyxTQUFTLElBQzVDLENBQUE7SUFDTixDQUFDO0lBQ0QsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJO1FBQ2IsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDO1lBQ25CLEtBQUs7WUFDTCxJQUFJO1lBQ0osSUFBSSxFQUFHLE9BQU87U0FFakIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNELElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxHQUFHLElBQUksRUFBRSxlQUFlLEdBQUcsS0FBSztRQUM1QyxJQUFJLFdBQVcsR0FBRztZQUNkLEtBQUs7WUFDTCxJQUFJO1lBQ0osSUFBSSxFQUFHLE1BQU07U0FDaEIsQ0FBQztRQUNGLElBQUssZUFBZTtZQUNoQixXQUFXLG1DQUFRLFdBQVcsR0FBSyxXQUFXLENBQUUsQ0FBQztRQUVyRCxPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUNELE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxHQUFHLElBQUksRUFBRSxLQUFLLEdBQUcsSUFBSTtRQUVwQyxPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUM7WUFDbkIsS0FBSztZQUNMLElBQUk7WUFDSixJQUFJLEVBQUcsU0FBUztZQUNoQixLQUFLO1NBQ1IsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUNELE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxHQUFHLElBQUk7UUFDdEIsSUFBSSxjQUFjLEdBQUc7WUFDakIsS0FBSztZQUNMLElBQUk7WUFDSixpQkFBaUIsRUFBRyxJQUFJO1lBQ3hCLEtBQUssRUFBRyxJQUFJO1lBQ1osSUFBSSxFQUFHLFNBQVM7U0FDbkIsQ0FBQztRQUdGLE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUMzQyxDQUFDO0NBRUosQ0FBQztBQVlGLE1BQU0sR0FBRyxHQUFRO0lBQ2IsS0FBSyxDQUFDLE9BQU87UUFDVCxPQUFPLGlCQUFpQixDQUFDLElBQUksaUJBQ3pCLElBQUksRUFBRyxPQUFPLEVBQ2QsaUJBQWlCLEVBQUcsSUFBSSxFQUN4QixpQkFBaUIsRUFBRyxvREFBb0QsSUFBSyxPQUFPLEVBQ3RGLENBQUM7SUFDUCxDQUFDO0lBQ0QsT0FBTyxDQUFDLE9BQU87UUFDWCxJQUFLLE9BQU8sQ0FBQyxTQUFTLEtBQUssS0FBSztZQUM1QixPQUFPLG1CQUFLLFdBQVcsRUFBRyxJQUFJLElBQUssT0FBTyxDQUFFLENBQUM7UUFDakQsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLCtDQUFNLFdBQVcsS0FBRSxJQUFJLEVBQUcsU0FBUyxLQUFLLE9BQU8sRUFBRyxDQUFDO0lBQ3BGLENBQUM7SUFFRCxRQUFRLENBQUMsT0FBTyxFQUFFLFdBQVc7UUFFekIsSUFBSyxXQUFXLElBQUksV0FBVyxDQUFDLE9BQU8sSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFHO1lBQzdELElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsV0FBVyxDQUFDO1lBRXZDLElBQUksVUFBVSxHQUFHLE9BQU87aUJBRW5CLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGVBQVMsQ0FBQyxFQUFFLEdBQUcsRUFBRyxXQUFXLEVBQUUsSUFBSSxFQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3BELEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVyRCxPQUFPLG1DQUNBLE9BQU8sS0FDVixZQUFZLENBQUMsWUFBeUI7b0JBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO29CQUMzQyxPQUFPLFVBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRyxlQUFlLEVBQUUsQ0FBQzt5QkFFaEMsTUFBTSxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUM7Z0JBQy9CLENBQUMsR0FDSixDQUFDO1NBQ0w7YUFBTTtZQUNILE9BQU8sbUJBQ0gsaUJBQWlCLEVBQUcsSUFBSSxFQUN4QixnQkFBZ0IsRUFBRyxJQUFJLElBQ3BCLE9BQU8sQ0FDYixDQUFDO1NBQ0w7UUFDRCxJQUFLLE9BQU8sQ0FBQyxpQkFBaUIsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRztZQUUzRSxPQUFPLHFCQUFJLENBQUMsSUFBSSxpQ0FBTSxlQUFlLEdBQUssT0FBTyxFQUFHLENBQUM7U0FDeEQ7YUFBTTtZQUdILE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxxQkFBSSxDQUFDLElBQUksK0NBQU0sZUFBZSxHQUFLLE9BQU8sS0FBRSxNQUFNLEVBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUcsQ0FBQyxDQUFDO1NBQzFHO0lBQ0wsQ0FBQztJQUVELFNBQVMsQ0FBQyxLQUFLLEVBQUUsT0FBTztRQXVDcEIsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLGlCQUN6QixLQUFLLEVBQUcsS0FBZSxFQUN2QixpQkFBaUIsRUFBRyxJQUFJLEVBQ3hCLFdBQVcsRUFBRyxpQkFBaUIsSUFFNUIsT0FBTyxFQUNaLENBQUM7SUFDUCxDQUFDO0lBQ0QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsT0FBTztRQUUzQixNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxxQkFBSSxDQUFDLElBQUksaUJBQzdCLEtBQUssRUFDTCxnQkFBZ0IsRUFBRyxJQUFJLEVBQ3ZCLFdBQVcsRUFBRyxpQkFBaUIsSUFDNUIsT0FBTyxFQUNaLENBQUM7UUFFSCxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7SUFDeEMsQ0FBQztJQUNELEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTztRQUd0QixJQUFJLGNBQWMsQ0FBQztRQUNuQixJQUFLLE9BQU8sQ0FBQyxlQUFlLEtBQUssU0FBUyxFQUFHO1lBQ3pDLGNBQWMsR0FBRyxFQUFFLGVBQWUsRUFBRyxTQUFTLEVBQUUsS0FBSyxFQUFHLE9BQU8sRUFBRSxDQUFBO1NBQ3BFO1FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFDaEMsSUFBSSxNQUEyQixDQUFDO1FBQ2hDLE1BQU0sWUFBWSxHQUFHLENBQUMsS0FBa0IsRUFBRSxFQUFFO1lBQ3hDLElBQUksRUFBRSxHQUFHLFVBQUksQ0FBQztnQkFDVixXQUFXLEVBQUcsS0FBSztnQkFDbkIsUUFBUSxFQUFHLEVBQUUsT0FBTyxFQUFHLGdCQUFnQixFQUFFO2FBQzVDLENBQXVELENBQUM7WUFFekQsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQ2IsWUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFHLDRCQUE0QixFQUFFLElBQUksRUFBRyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUM7aUJBRXpFLEdBQUcsQ0FBQyxjQUFjLENBQUM7aUJBQ25CLEtBQUssQ0FBQyxDQUFDLEVBQWMsRUFBRSxFQUFFO2dCQUN0QixNQUFNLEdBQUcsT0FBTyxDQUFDO2dCQUNqQixxQkFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxDQUNULENBQUE7UUFDTCxDQUFDLENBQUM7UUFDRixPQUFPLG1DQUFRLE9BQU8sS0FBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUcsSUFBSSxHQUFFLENBQUM7UUFDaEUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE1BQU0scUJBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0MsSUFBSyxLQUFLLEVBQUc7WUFFVCxJQUFLLE1BQU0sS0FBSyxTQUFTLEVBQUc7Z0JBQ3hCLE1BQU0sR0FBRyxTQUFTLENBQUM7YUFDdEI7U0FDSjthQUFNO1lBQ0gsTUFBTSxHQUFHLFFBQVEsQ0FBQztTQUNyQjtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7Q0FDSixDQUFDO0FBRUYsa0NBQWlCLEtBQUssRUFBRSxHQUFHLElBQUsscUJBQUksRUFBRyIsInNvdXJjZXNDb250ZW50IjpbIi8qKmltcG9ydCBBbGVydCBmcm9tICdNeUFsZXJ0JyAob3IgYW55IG90aGVyIG5hbWUpKi9cblxuY29uc29sZS5sb2coJ3NyYy9NeUFsZXJ0L2luZGV4LnRzJyk7XG5pbXBvcnQgU3dhbCwgeyBTd2VldEFsZXJ0UmVzdWx0LCBTd2VldEFsZXJ0T3B0aW9ucyB9IGZyb20gJ3N3ZWV0YWxlcnQyJztcbmltcG9ydCB7IHBhcmFncmFwaCwgZWxlbSwgQmV0dGVySFRNTEVsZW1lbnQsIGJ1dHRvbiB9IGZyb20gXCIuLi9iaGVcIjtcblxuXG5jb25zdCBzbWFsbE1peGluOiB0eXBlb2YgU3dhbCA9IFN3YWwubWl4aW4oe1xuICAgIGFuaW1hdGlvbiA6IGZhbHNlLFxuICAgIGN1c3RvbUNsYXNzIDogJ2FuaW1hdGVkIGZhZGVJbicsXG4gICAgcG9zaXRpb24gOiBcImJvdHRvbS1zdGFydFwiLFxuICAgIHNob3dDb25maXJtQnV0dG9uIDogZmFsc2UsXG4gICAgdGltZXIgOiA4MDAwLFxuICAgIHRvYXN0IDogdHJ1ZSxcbiAgICBcbn0pO1xuY29uc3Qgd2l0aENvbmZpcm06IFN3ZWV0QWxlcnRPcHRpb25zID0ge1xuICAgIGNhbmNlbEJ1dHRvblRleHQgOiBcIk5vXCIsXG4gICAgY29uZmlybUJ1dHRvblRleHQgOiBcIlllc1wiLFxuICAgIHNob3dDYW5jZWxCdXR0b24gOiB0cnVlLFxuICAgIHNob3dDb25maXJtQnV0dG9uIDogdHJ1ZSxcbiAgICB0aW1lciA6IG51bGwsXG4gICAgXG59O1xuY29uc3QgYmxvY2tpbmdPcHRpb25zOiBTd2VldEFsZXJ0T3B0aW9ucyA9IHtcbiAgICBhbGxvd0VudGVyS2V5IDogZmFsc2UsXG4gICAgYWxsb3dFc2NhcGVLZXkgOiBmYWxzZSxcbiAgICBhbGxvd091dHNpZGVDbGljayA6IGZhbHNlLFxuICAgIGFuaW1hdGlvbiA6IGZhbHNlLFxuICAgIGN1c3RvbUNsYXNzIDogJ2FuaW1hdGVkIGZhZGVJbicsXG4gICAgc2hvd0NhbmNlbEJ1dHRvbiA6IGZhbHNlLCAvLyBkZWZhdWx0IGZhbHNlXG4gICAgc2hvd0Nsb3NlQnV0dG9uIDogZmFsc2UsIC8vIGRlZmF1bHQgZmFsc2VcbiAgICBzaG93Q29uZmlybUJ1dHRvbiA6IGZhbHNlLFxuICAgIHdpZHRoIDogXCI3NXZ3XCIsXG4gICAgXG4gICAgXG59O1xuY29uc3QgdGhyZWVCdXR0b25zT3B0aW9uczogU3dlZXRBbGVydE9wdGlvbnMgPSB7XG4gICAgLi4uYmxvY2tpbmdPcHRpb25zLFxuICAgIHNob3dDb25maXJtQnV0dG9uIDogdHJ1ZSxcbiAgICBzaG93Q2FuY2VsQnV0dG9uIDogdHJ1ZSxcbn07XG5jb25zdCBibG9ja2luZ1N3YWxNaXhpbiA9IFN3YWwubWl4aW4oYmxvY2tpbmdPcHRpb25zKTtcbnR5cGUgU21hbGwgPSB7XG4gICAgX2Vycm9yKG9wdGlvbnM6IFN3ZWV0QWxlcnRPcHRpb25zKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PixcbiAgICBfaW5mbyhvcHRpb25zOiBTd2VldEFsZXJ0T3B0aW9ucyk6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4sXG4gICAgX3F1ZXN0aW9uKG9wdGlvbnM6IFN3ZWV0QWxlcnRPcHRpb25zKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PixcbiAgICBfc3VjY2VzcyhvcHRpb25zOiBTd2VldEFsZXJ0T3B0aW9ucyk6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4sXG4gICAgX3dhcm5pbmcob3B0aW9uczogU3dlZXRBbGVydE9wdGlvbnMpOiBQcm9taXNlPFN3ZWV0QWxlcnRSZXN1bHQ+LFxuICAgIGVycm9yKHRpdGxlOiBzdHJpbmcsIHRleHQ6IHN0cmluZyk6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4sXG4gICAgaW5mbyh0aXRsZTogc3RyaW5nLCB0ZXh0PzogKHN0cmluZyB8IG51bGwpLCBzaG93Q29uZmlybUJ0bnM/OiBib29sZWFuKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PixcbiAgICBzdWNjZXNzKHRpdGxlOiBzdHJpbmcsIHRleHQ/OiAoc3RyaW5nIHwgbnVsbCksIHRpbWVyPzogbnVtYmVyKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PixcbiAgICB3YXJuaW5nKHRpdGxlOiBzdHJpbmcsIHRleHQ/OiAoc3RyaW5nIHwgbnVsbCksIHNob3dDb25maXJtQnRucz86IGJvb2xlYW4pOiBQcm9taXNlPFN3ZWV0QWxlcnRSZXN1bHQ+LFxufVxuXG5jb25zdCBzbWFsbDogU21hbGwgPSB7XG4gICAgX3F1ZXN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHNtYWxsTWl4aW4uZmlyZSh7IC4uLm9wdGlvbnMsIHR5cGUgOiAncXVlc3Rpb24nIH0pXG4gICAgfSxcbiAgICBfaW5mbyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBzbWFsbE1peGluLmZpcmUoeyAuLi5vcHRpb25zLCB0eXBlIDogJ2luZm8nIH0pXG4gICAgfSxcbiAgICBfc3VjY2VzcyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBzbWFsbE1peGluLmZpcmUoeyAuLi5vcHRpb25zLCB0eXBlIDogJ3N1Y2Nlc3MnIH0pXG4gICAgfSxcbiAgICBfZXJyb3Iob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gc21hbGxNaXhpbi5maXJlKHsgLi4ub3B0aW9ucywgdHlwZSA6ICdlcnJvcicgfSlcbiAgICB9LFxuICAgIF93YXJuaW5nKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHNtYWxsTWl4aW4uZmlyZSh7XG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgc2hvd0NvbmZpcm1CdXR0b24gOiB0cnVlLCB0eXBlIDogJ3dhcm5pbmcnXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBlcnJvcih0aXRsZSwgdGV4dCkge1xuICAgICAgICByZXR1cm4gc21hbGxNaXhpbi5maXJlKHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgdGV4dCxcbiAgICAgICAgICAgIHR5cGUgOiBcImVycm9yXCIsXG4gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBpbmZvKHRpdGxlLCB0ZXh0ID0gbnVsbCwgc2hvd0NvbmZpcm1CdG5zID0gZmFsc2UpIHtcbiAgICAgICAgbGV0IGluZm9PcHRpb25zID0ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgdHlwZSA6IFwiaW5mb1wiLFxuICAgICAgICB9O1xuICAgICAgICBpZiAoIHNob3dDb25maXJtQnRucyApXG4gICAgICAgICAgICBpbmZvT3B0aW9ucyA9IHsgLi4uaW5mb09wdGlvbnMsIC4uLndpdGhDb25maXJtIH07XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIHNtYWxsTWl4aW4uZmlyZShpbmZvT3B0aW9ucyk7XG4gICAgfSxcbiAgICBzdWNjZXNzKHRpdGxlLCB0ZXh0ID0gbnVsbCwgdGltZXIgPSA2MDAwKSB7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gc21hbGxNaXhpbi5maXJlKHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgdGV4dCxcbiAgICAgICAgICAgIHR5cGUgOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgIHRpbWVyXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICB3YXJuaW5nKHRpdGxlLCB0ZXh0ID0gbnVsbCkge1xuICAgICAgICBsZXQgd2FybmluZ09wdGlvbnMgPSB7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICBzaG93Q29uZmlybUJ1dHRvbiA6IHRydWUsXG4gICAgICAgICAgICB0aW1lciA6IG51bGwsXG4gICAgICAgICAgICB0eXBlIDogXCJ3YXJuaW5nXCJcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIHNtYWxsTWl4aW4uZmlyZSh3YXJuaW5nT3B0aW9ucyk7XG4gICAgfSxcbiAgICBcbn07XG5leHBvcnQgdHlwZSBDcmVhdGVDb25maXJtQ2FuY2VsID0gXCJjb25maXJtXCIgfCBcImNhbmNlbFwiIHwgXCJ0aGlyZFwiO1xudHlwZSBCaWcgPSB7XG4gICAgXG4gICAgZXJyb3Iob3B0aW9uczogU3dlZXRBbGVydE9wdGlvbnMpOiBQcm9taXNlPFN3ZWV0QWxlcnRSZXN1bHQ+LFxuICAgIHdhcm5pbmcob3B0aW9uczogU3dlZXRBbGVydE9wdGlvbnMpOiBQcm9taXNlPFN3ZWV0QWxlcnRSZXN1bHQ+LFxuICAgIGJsb2NraW5nKG9wdGlvbnM6IFN3ZWV0QWxlcnRPcHRpb25zLCBtb3JlT3B0aW9ucz86IHsgc3RyaW5nczogc3RyaW5nW10sIGNsaWNrRm46IChiaGU6IEJldHRlckhUTUxFbGVtZW50KSA9PiBhbnkgfSk6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4sXG4gICAgb25lQnV0dG9uKHRpdGxlOiBzdHJpbmcsIG9wdGlvbnM/OiBTd2VldEFsZXJ0T3B0aW9ucyk6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4sXG4gICAgdHdvQnV0dG9ucyh0aXRsZTogc3RyaW5nLCBvcHRpb25zPzogU3dlZXRBbGVydE9wdGlvbnMpOiBQcm9taXNlPFwiY29uZmlybVwiIHwgXCJjYW5jZWxcIj5cbiAgICB0aHJlZUJ1dHRvbnMob3B0aW9uczogU3dlZXRBbGVydE9wdGlvbnMgJiB7IHRoaXJkQnV0dG9uVGV4dDogc3RyaW5nLCB0aGlyZEJ1dHRvblR5cGU/OiBcImNvbmZpcm1cIiB8IFwid2FybmluZ1wiIH0pOiBQcm9taXNlPENyZWF0ZUNvbmZpcm1DYW5jZWw+XG59XG5cbmNvbnN0IGJpZzogQmlnID0ge1xuICAgIGVycm9yKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGJsb2NraW5nU3dhbE1peGluLmZpcmUoe1xuICAgICAgICAgICAgdHlwZSA6ICdlcnJvcicsXG4gICAgICAgICAgICBzaG93Q29uZmlybUJ1dHRvbiA6IHRydWUsXG4gICAgICAgICAgICBjb25maXJtQnV0dG9uVGV4dCA6ICdSZW1lbWJlciB0byB0YWtlIGEgc2NyZWVuc2hvdCBiZWZvcmUgcHJlc3NpbmcgdGhpcycsIC4uLm9wdGlvbnNcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICB3YXJuaW5nKG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCBvcHRpb25zLmFuaW1hdGlvbiA9PT0gZmFsc2UgKVxuICAgICAgICAgICAgb3B0aW9ucyA9IHsgY3VzdG9tQ2xhc3MgOiBudWxsLCAuLi5vcHRpb25zIH07XG4gICAgICAgIHJldHVybiBibG9ja2luZ1N3YWxNaXhpbi5maXJlKHsgLi4ud2l0aENvbmZpcm0sIHR5cGUgOiAnd2FybmluZycsIC4uLm9wdGlvbnMgfSk7XG4gICAgfSxcbiAgICBcbiAgICBibG9ja2luZyhvcHRpb25zLCBtb3JlT3B0aW9ucykge1xuICAgICAgICBcbiAgICAgICAgaWYgKCBtb3JlT3B0aW9ucyAmJiBtb3JlT3B0aW9ucy5zdHJpbmdzICYmIG1vcmVPcHRpb25zLmNsaWNrRm4gKSB7XG4gICAgICAgICAgICBsZXQgeyBzdHJpbmdzLCBjbGlja0ZuIH0gPSBtb3JlT3B0aW9ucztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHBhcmFncmFwaHMgPSBzdHJpbmdzXG4gICAgICAgICAgICAgICAgLy8gLm1hcChzID0+ICQoYDxwIGNsYXNzPVwiY2xpY2thYmxlXCI+JHtzfTwvcD5gKSlcbiAgICAgICAgICAgICAgICAubWFwKHMgPT4gcGFyYWdyYXBoKHsgY2xzIDogJ2NsaWNrYWJsZScsIHRleHQgOiBzIH0pKVxuICAgICAgICAgICAgICAgIC5tYXAocEVsZW0gPT4gcEVsZW0uY2xpY2soKCkgPT4gY2xpY2tGbihwRWxlbSkpKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgICAgIG9uQmVmb3JlT3Blbihtb2RhbEVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdtb2RhbEVsZW1lbnQ6JywgbW9kYWxFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW0oeyBpZCA6ICdzd2FsMi1jb250ZW50JyB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCguLi5wYXJhZ3JhcGhzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgeyAvLyBmb3JjZSBjb25maXJtIGFuZCBjYW5jZWwgYnV0dG9uc1xuICAgICAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBzaG93Q29uZmlybUJ1dHRvbiA6IHRydWUsXG4gICAgICAgICAgICAgICAgc2hvd0NhbmNlbEJ1dHRvbiA6IHRydWUsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBvcHRpb25zLnNob3dDb25maXJtQnV0dG9uIHx8IG9wdGlvbnMuc2hvd0NhbmNlbEJ1dHRvbiB8fCBvcHRpb25zLm9uT3BlbiApIHtcbiAgICAgICAgICAgIC8vIC8gSGFwcGVucyB3aGVuIG5vdCBvciBiYWQgbW9yZU9wdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBTd2FsLmZpcmUoeyAuLi5ibG9ja2luZ09wdGlvbnMsIC4uLm9wdGlvbnMgfSk7XG4gICAgICAgIH0gZWxzZSB7IC8vIFRPRE86IG9uT3BlbiA6IHJlc29sdmU/XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IFN3YWwuZmlyZSh7IC4uLmJsb2NraW5nT3B0aW9ucywgLi4ub3B0aW9ucywgb25PcGVuIDogdiA9PiByZXNvbHZlKHYpIH0pKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgb25lQnV0dG9uKHRpdGxlLCBvcHRpb25zKSB7XG4gICAgICAgIC8qY29uc29sZS5sb2coeyB0aXRsZSwgb3B0aW9ucyB9KTtcbiAgICAgICAgIGNvbnN0IHR5cGVvZnRpdGxlID0gdHlwZW9mIHRpdGxlO1xuICAgICAgICAgaWYgKCB0eXBlb2Z0aXRsZSA9PT0gXCJvYmplY3RcIiApIHtcbiAgICAgICAgIGlmICggb3B0aW9ucyApIHtcbiAgICAgICAgIGlmICggb3B0aW9ucy5odG1sICkge1xuICAgICAgICAgb3B0aW9ucy5odG1sICs9ICc8YnI+JztcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICBvcHRpb25zLmh0bWwgPSAnJztcbiAgICAgICAgIH1cbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICBvcHRpb25zID0geyBodG1sIDogJycgfTtcbiAgICAgICAgIH1cbiAgICAgICAgIGlmICggdGl0bGUgaW5zdGFuY2VvZiBFcnJvciApIHtcbiAgICAgICAgIHRpdGxlID0gJ0FuIGVycm9yIGhhcyBvY2N1cnJlZCc7XG4gICAgICAgICBvcHRpb25zLmh0bWwgKz0gdGl0bGUubWVzc2FnZTtcbiAgICAgICAgIGNvbnNvbGUubG9nKHsgdGl0bGUsIG9wdGlvbnMgfSk7XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgbGV0IGh0bWwgPSBgPHN0eWxlPlxuICAgICAgICAgc3BhbiB7XG4gICAgICAgICBmb250LWZhbWlseTogbW9ub3NwYWNlO1xuICAgICAgICAgbWFyZ2luLWxlZnQ6IDQwcHg7XG4gICAgICAgICB9XG4gICAgICAgICA8L3N0eWxlPlxuICAgICAgICAgPGRpdiBzdHlsZT1cInRleHQtYWxpZ246IGxlZnRcIj5cbiAgICAgICAgIFxuICAgICAgICAgYDtcbiAgICAgICAgIGZvciAoIGxldCBrZXkgb2YgT2JqZWN0LmtleXModGl0bGUpICkge1xuICAgICAgICAgaHRtbCArPSBgPHA+PGI+JHtrZXl9OjwvYj4gPHNwYW4+JHt0aXRsZVtrZXldfTwvc3Bhbj48L3A+YFxuICAgICAgICAgfVxuICAgICAgICAgaHRtbCArPSBgPC9kaXY+YDtcbiAgICAgICAgIG9wdGlvbnMuaHRtbCArPSBodG1sO1xuICAgICAgICAgdGl0bGUgPSAnU29tZXRoaW5nIGhhcHBlbmVkJztcbiAgICAgICAgIFxuICAgICAgICAgfVxuICAgICAgICAgfSBlbHNlIGlmICggQXJyYXkuaXNBcnJheSh0aXRsZSkgKSB7XG4gICAgICAgICB0aXRsZSA9ICdUaGlzIGlzIHdlaXJkJztcbiAgICAgICAgIG9wdGlvbnMuaHRtbCArPSB0aXRsZS5qb2luKCc8L2JyPicpXG4gICAgICAgICB9Ki9cbiAgICAgICAgcmV0dXJuIGJsb2NraW5nU3dhbE1peGluLmZpcmUoe1xuICAgICAgICAgICAgdGl0bGUgOiB0aXRsZSBhcyBzdHJpbmcsXG4gICAgICAgICAgICBzaG93Q29uZmlybUJ1dHRvbiA6IHRydWUsXG4gICAgICAgICAgICBjdXN0b21DbGFzcyA6ICdhbmltYXRlZCBmYWRlSW4nLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAuLi5vcHRpb25zXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgYXN5bmMgdHdvQnV0dG9ucyh0aXRsZSwgb3B0aW9ucykge1xuICAgICAgICBcbiAgICAgICAgY29uc3QgeyB2YWx1ZSB9ID0gYXdhaXQgU3dhbC5maXJlKHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgc2hvd0NhbmNlbEJ1dHRvbiA6IHRydWUsXG4gICAgICAgICAgICBjdXN0b21DbGFzcyA6ICdhbmltYXRlZCBmYWRlSW4nLFxuICAgICAgICAgICAgLi4ub3B0aW9uc1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB2YWx1ZSA/IFwiY29uZmlybVwiIDogXCJjYW5jZWxcIjtcbiAgICB9LFxuICAgIGFzeW5jIHRocmVlQnV0dG9ucyhvcHRpb25zKSB7XG4gICAgICAgIFxuICAgICAgICAvLyBjb25zdCB0aGlyZEJ1dHRvblRleHQgPSBvcHRpb25zLnRoaXJkQnV0dG9uVGV4dCA/PyAnT3ZlcndyaXRlJztcbiAgICAgICAgbGV0IHRoaXJkQnV0dG9uQ3NzO1xuICAgICAgICBpZiAoIG9wdGlvbnMudGhpcmRCdXR0b25UeXBlID09PSBcIndhcm5pbmdcIiApIHtcbiAgICAgICAgICAgIHRoaXJkQnV0dG9uQ3NzID0geyBiYWNrZ3JvdW5kQ29sb3IgOiAnI0ZGQzY2RCcsIGNvbG9yIDogJ2JsYWNrJyB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKHsgdGhpcmRCdXR0b25Dc3MgfSk7XG4gICAgICAgIGxldCBhY3Rpb246IENyZWF0ZUNvbmZpcm1DYW5jZWw7XG4gICAgICAgIGNvbnN0IG9uQmVmb3JlT3BlbiA9IChtb2RhbDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBlbCA9IGVsZW0oe1xuICAgICAgICAgICAgICAgIGh0bWxFbGVtZW50IDogbW9kYWwsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW4gOiB7IGFjdGlvbnMgOiAnLnN3YWwyLWFjdGlvbnMnIH1cbiAgICAgICAgICAgIH0pIGFzIEJldHRlckhUTUxFbGVtZW50ICYgeyBhY3Rpb25zOiBCZXR0ZXJIVE1MRWxlbWVudCB9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBlbC5hY3Rpb25zLmFwcGVuZChcbiAgICAgICAgICAgICAgICBidXR0b24oeyBjbHMgOiBgc3dhbDItY29uZmlybSBzd2FsMi1zdHlsZWRgLCBodG1sIDogb3B0aW9ucy50aGlyZEJ1dHRvblRleHQgfSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC5jc3ModGhpcmRCdXR0b25Dc3MpXG4gICAgICAgICAgICAgICAgICAgIC5jbGljaygoZXY6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbiA9IFwidGhpcmRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIFN3YWwuY2xpY2tDb25maXJtKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApXG4gICAgICAgIH07XG4gICAgICAgIG9wdGlvbnMgPSB7IC4uLm9wdGlvbnMsIG9uQmVmb3JlT3Blbiwgc2hvd0NhbmNlbEJ1dHRvbiA6IHRydWUgfTtcbiAgICAgICAgY29uc3QgeyB2YWx1ZSB9ID0gYXdhaXQgU3dhbC5maXJlKG9wdGlvbnMpO1xuICAgICAgICBpZiAoIHZhbHVlICkge1xuICAgICAgICAgICAgLy8vIEVpdGhlciB1c2VyIGNsaWNrZWQgQ29uZmlybSAoYWN0aW9uIGlzIHVuZGVmaW5lZCkgb3IgU3dhbC5jbGlja0NvbmZpcm0oKSAoYWN0aW9uIGlzIFwidGhpcmRcIilcbiAgICAgICAgICAgIGlmICggYWN0aW9uID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgYWN0aW9uID0gXCJjb25maXJtXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhY3Rpb24gPSBcImNhbmNlbFwiO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYWN0aW9uO1xuICAgIH1cbn07XG4vLyBleHBvcnQgZGVmYXVsdCB7IGFsZXJ0Rm4sIHNtYWxsLCBiaWcsIGNsb3NlIDogU3dhbC5jbG9zZSwgaXNWaXNpYmxlIDogU3dhbC5pc1Zpc2libGUgfTtcbmV4cG9ydCBkZWZhdWx0IHsgc21hbGwsIGJpZywgLi4uU3dhbCB9O1xuIl19