"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('src/MyAlert/index.ts');
const sweetalert2_1 = require("sweetalert2");
const bhe_1 = require("../bhe");
function alertFn() {
    console.log('alertFn');
}
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
};
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
        // @ts-ignore
        return smallMixin.fire(infoOptions);
    },
    success(title, text = null, timer = 4000) {
        return smallMixin.fire({
            title,
            text,
            type: "success",
            timer
        });
    },
    warning(title, text = null, showConfirmBtns = false) {
        let warningOptions = {
            title,
            text,
            type: "warning"
        };
        if (showConfirmBtns)
            warningOptions = Object.assign(Object.assign({}, warningOptions), withConfirm);
        // @ts-ignore
        return smallMixin.fire(warningOptions);
    },
};
const big = {
    warning(options) {
        if (options.animation === false)
            options = Object.assign({ customClass: null }, options);
        return blockingSwalMixin.fire(Object.assign(Object.assign(Object.assign({}, withConfirm), { type: 'warning' }), options));
    },
    // blocking(options: SweetAlertOptions, { strings, clickFn } = {}): Promise<SweetAlertResult> {
    blocking(options, moreOptions) {
        if (moreOptions && moreOptions.strings && moreOptions.clickFn) {
            let { strings, clickFn } = moreOptions;
            let paragraphs = strings
                // .map(s => $(`<p class="clickable">${s}</p>`))
                .map(s => bhe_1.paragraph({ cls: 'clickable', text: s }))
                .map(pElem => pElem.click(() => clickFn(pElem)));
            options = Object.assign(Object.assign({}, options), { onBeforeOpen(modalElement) {
                    console.log('modalElement:', modalElement);
                    return bhe_1.elem({ id: 'swal2-content' })
                        .show()
                        .append(paragraphs);
                } });
        }
        else { // force confirm and cancel buttons
            options = Object.assign({ showConfirmButton: true, showCancelButton: true }, options);
        }
        if (options.showConfirmButton || options.showCancelButton || options.onOpen)
            return sweetalert2_1.default.fire(Object.assign(Object.assign({}, blockingOptions), options));
        else // TODO: onOpen : resolve?
            return new Promise(resolve => sweetalert2_1.default.fire(Object.assign(Object.assign(Object.assign({}, blockingOptions), options), { onOpen: v => resolve(v) })));
    }
};
exports.default = { alertFn, small, big, close: sweetalert2_1.default.close, isActive: sweetalert2_1.default.isVisible };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUNwQyw2Q0FBd0U7QUFDeEUsZ0NBQXlDO0FBRXpDLFNBQVMsT0FBTztJQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDM0IsQ0FBQztBQUVELE1BQU0sVUFBVSxHQUFHLHFCQUFJLENBQUMsS0FBSyxDQUFDO0lBQzFCLFNBQVMsRUFBRyxLQUFLO0lBQ2pCLFdBQVcsRUFBRyxpQkFBaUI7SUFDL0IsUUFBUSxFQUFHLGNBQWM7SUFDekIsaUJBQWlCLEVBQUcsS0FBSztJQUN6QixLQUFLLEVBQUcsSUFBSTtJQUNaLEtBQUssRUFBRyxJQUFJO0NBRWYsQ0FBQyxDQUFDO0FBQ0gsTUFBTSxXQUFXLEdBQUc7SUFDaEIsZ0JBQWdCLEVBQUcsSUFBSTtJQUN2QixpQkFBaUIsRUFBRyxLQUFLO0lBQ3pCLGdCQUFnQixFQUFHLElBQUk7SUFDdkIsaUJBQWlCLEVBQUcsSUFBSTtJQUN4QixLQUFLLEVBQUcsSUFBSTtDQUVmLENBQUM7QUFDRixNQUFNLGVBQWUsR0FBRztJQUNwQixhQUFhLEVBQUcsS0FBSztJQUNyQixjQUFjLEVBQUcsS0FBSztJQUN0QixpQkFBaUIsRUFBRyxLQUFLO0lBQ3pCLFNBQVMsRUFBRyxLQUFLO0lBQ2pCLFdBQVcsRUFBRyxpQkFBaUI7SUFDL0IsZ0JBQWdCLEVBQUcsS0FBSztJQUN4QixlQUFlLEVBQUcsS0FBSztJQUN2QixpQkFBaUIsRUFBRyxLQUFLO0NBRTVCLENBQUM7QUFDRixNQUFNLGlCQUFpQixHQUFHLHFCQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBa0J0RCxNQUFNLEtBQUssR0FBVTtJQUNqQixTQUFTLENBQUMsT0FBTztRQUNiLE9BQU8sVUFBVSxDQUFDLElBQUksaUNBQU0sT0FB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aW1wb3J0IFN3YWwsIHsgU3dlZXRBbGVydFJlc3VsdCwgU3dlZXRBbGVydE9wdGlvbnMgfSBmcm9tICdzd2VldGFsZXJ0Mic7XG5pbXBvcnQgeyBwYXJhZ3JhcGgsIGVsZW0gfSBmcm9tIFwiLi4vYmhlXCI7XG5cbmZ1bmN0aW9uIGFsZXJ0Rm4oKSB7XG4gICAgY29uc29sZS5sb2coJ2FsZXJ0Rm4nKTtcbn1cblxuY29uc3Qgc21hbGxNaXhpbiA9IFN3YWwubWl4aW4oe1xuICAgIGFuaW1hdGlvbiA6IGZhbHNlLFxuICAgIGN1c3RvbUNsYXNzIDogJ2FuaW1hdGVkIGZhZGVJbicsXG4gICAgcG9zaXRpb24gOiBcImJvdHRvbS1zdGFydFwiLFxuICAgIHNob3dDb25maXJtQnV0dG9uIDogZmFsc2UsXG4gICAgdGltZXIgOiA4MDAwLFxuICAgIHRvYXN0IDogdHJ1ZSxcbiAgICBcbn0pO1xuY29uc3Qgd2l0aENvbmZpcm0gPSB7XG4gICAgY2FuY2VsQnV0dG9uVGV4dCA6IFwiTm9cIixcbiAgICBjb25maXJtQnV0dG9uVGV4dCA6IFwiWWVzXCIsXG4gICAgc2hvd0NhbmNlbEJ1dHRvbiA6IHRydWUsXG4gICAgc2hvd0NvbmZpcm1CdXR0b24gOiB0cnVlLFxuICAgIHRpbWVyIDogbnVsbCxcbiAgICBcbn07XG5jb25zdCBibG9ja2luZ09wdGlvbnMgPSB7XG4gICAgYWxsb3dFbnRlcktleSA6IGZhbHNlLFxuICAgIGFsbG93RXNjYXBlS2V5IDogZmFsc2UsXG4gICAgYWxsb3dPdXRzaWRlQ2xpY2sgOiBmYWxzZSxcbiAgICBhbmltYXRpb24gOiBmYWxzZSxcbiAgICBjdXN0b21DbGFzcyA6ICdhbmltYXRlZCBmYWRlSW4nLFxuICAgIHNob3dDYW5jZWxCdXR0b24gOiBmYWxzZSwgLy8gZGVmYXVsdCBmYWxzZVxuICAgIHNob3dDbG9zZUJ1dHRvbiA6IGZhbHNlLCAvLyBkZWZhdWx0IGZhbHNlXG4gICAgc2hvd0NvbmZpcm1CdXR0b24gOiBmYWxzZSxcbiAgICBcbn07XG5jb25zdCBibG9ja2luZ1N3YWxNaXhpbiA9IFN3YWwubWl4aW4oYmxvY2tpbmdPcHRpb25zKTtcbnR5cGUgU21hbGwgPSB7XG4gICAgX2Vycm9yKG9wdGlvbnM6IFN3ZWV0QWxlcnRPcHRpb25zKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PixcbiAgICBfaW5mbyhvcHRpb25zOiBTd2VldEFsZXJ0T3B0aW9ucyk6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4sXG4gICAgX3F1ZXN0aW9uKG9wdGlvbnM6IFN3ZWV0QWxlcnRPcHRpb25zKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PixcbiAgICBfc3VjY2VzcyhvcHRpb25zOiBTd2VldEFsZXJ0T3B0aW9ucyk6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4sXG4gICAgX3dhcm5pbmcob3B0aW9uczogU3dlZXRBbGVydE9wdGlvbnMpOiBQcm9taXNlPFN3ZWV0QWxlcnRSZXN1bHQ+LFxuICAgIGVycm9yKHRpdGxlOiBzdHJpbmcsIHRleHQ6IHN0cmluZyk6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4sXG4gICAgaW5mbyh0aXRsZTogc3RyaW5nLCB0ZXh0PzogKHN0cmluZyB8IG51bGwpLCBzaG93Q29uZmlybUJ0bnM/OiBib29sZWFuKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PixcbiAgICBzdWNjZXNzKHRpdGxlOiBzdHJpbmcsIHRleHQ/OiAoc3RyaW5nIHwgbnVsbCksIHRpbWVyPzogbnVtYmVyKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PixcbiAgICB3YXJuaW5nKHRpdGxlOiBzdHJpbmcsIHRleHQ/OiAoc3RyaW5nIHwgbnVsbCksIHNob3dDb25maXJtQnRucz86IGJvb2xlYW4pOiBQcm9taXNlPFN3ZWV0QWxlcnRSZXN1bHQ+LFxufVxudHlwZSBCaWcgPSB7XG4gICAgd2FybmluZyhvcHRpb25zOiBTd2VldEFsZXJ0T3B0aW9ucyk6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4sXG4gICAgXG4gICAgYmxvY2tpbmcob3B0aW9uczogU3dlZXRBbGVydE9wdGlvbnMsIG1vcmVPcHRpb25zPzogeyBzdHJpbmdzOiBzdHJpbmdbXSwgY2xpY2tGbjogRnVuY3Rpb24gfSk6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4sXG4gICAgXG59XG5jb25zdCBzbWFsbDogU21hbGwgPSB7XG4gICAgX3F1ZXN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHNtYWxsTWl4aW4uZmlyZSh7IC4uLm9wdGlvbnMsIHR5cGUgOiAncXVlc3Rpb24nIH0pXG4gICAgfSxcbiAgICBfaW5mbyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBzbWFsbE1peGluLmZpcmUoeyAuLi5vcHRpb25zLCB0eXBlIDogJ2luZm8nIH0pXG4gICAgfSxcbiAgICBfc3VjY2VzcyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBzbWFsbE1peGluLmZpcmUoeyAuLi5vcHRpb25zLCB0eXBlIDogJ3N1Y2Nlc3MnIH0pXG4gICAgfSxcbiAgICBfZXJyb3Iob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gc21hbGxNaXhpbi5maXJlKHsgLi4ub3B0aW9ucywgdHlwZSA6ICdlcnJvcicgfSlcbiAgICB9LFxuICAgIF93YXJuaW5nKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHNtYWxsTWl4aW4uZmlyZSh7XG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgc2hvd0NvbmZpcm1CdXR0b24gOiB0cnVlLCB0eXBlIDogJ3dhcm5pbmcnXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBlcnJvcih0aXRsZSwgdGV4dCkge1xuICAgICAgICByZXR1cm4gc21hbGxNaXhpbi5maXJlKHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgdGV4dCxcbiAgICAgICAgICAgIHR5cGUgOiBcImVycm9yXCIsXG4gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBpbmZvKHRpdGxlLCB0ZXh0ID0gbnVsbCwgc2hvd0NvbmZpcm1CdG5zID0gZmFsc2UpIHtcbiAgICAgICAgbGV0IGluZm9PcHRpb25zID0ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgdHlwZSA6IFwiaW5mb1wiLFxuICAgICAgICB9O1xuICAgICAgICBpZiAoIHNob3dDb25maXJtQnRucyApXG4gICAgICAgICAgICBpbmZvT3B0aW9ucyA9IHsgLi4uaW5mb09wdGlvbnMsIC4uLndpdGhDb25maXJtIH07XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIHNtYWxsTWl4aW4uZmlyZShpbmZvT3B0aW9ucyk7XG4gICAgfSxcbiAgICBzdWNjZXNzKHRpdGxlLCB0ZXh0ID0gbnVsbCwgdGltZXIgPSA0MDAwKSB7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gc21hbGxNaXhpbi5maXJlKHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgdGV4dCxcbiAgICAgICAgICAgIHR5cGUgOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgIHRpbWVyXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICB3YXJuaW5nKHRpdGxlLCB0ZXh0ID0gbnVsbCwgc2hvd0NvbmZpcm1CdG5zID0gZmFsc2UpIHtcbiAgICAgICAgbGV0IHdhcm5pbmdPcHRpb25zID0ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgdHlwZSA6IFwid2FybmluZ1wiXG4gICAgICAgIH07XG4gICAgICAgIGlmICggc2hvd0NvbmZpcm1CdG5zIClcbiAgICAgICAgICAgIHdhcm5pbmdPcHRpb25zID0geyAuLi53YXJuaW5nT3B0aW9ucywgLi4ud2l0aENvbmZpcm0gfTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gc21hbGxNaXhpbi5maXJlKHdhcm5pbmdPcHRpb25zKTtcbiAgICB9LFxuICAgIFxufTtcbmNvbnN0IGJpZzogQmlnID0ge1xuICAgIHdhcm5pbmcob3B0aW9ucykge1xuICAgICAgICBpZiAoIG9wdGlvbnMuYW5pbWF0aW9uID09PSBmYWxzZSApXG4gICAgICAgICAgICBvcHRpb25zID0geyBjdXN0b21DbGFzcyA6IG51bGwsIC4uLm9wdGlvbnMgfTtcbiAgICAgICAgcmV0dXJuIGJsb2NraW5nU3dhbE1peGluLmZpcmUoeyAuLi53aXRoQ29uZmlybSwgdHlwZSA6ICd3YXJuaW5nJywgLi4ub3B0aW9ucyB9KTtcbiAgICB9LFxuICAgIFxuICAgIC8vIGJsb2NraW5nKG9wdGlvbnM6IFN3ZWV0QWxlcnRPcHRpb25zLCB7IHN0cmluZ3MsIGNsaWNrRm4gfSA9IHt9KTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PiB7XG4gICAgYmxvY2tpbmcob3B0aW9uczogU3dlZXRBbGVydE9wdGlvbnMsIG1vcmVPcHRpb25zKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PiB7XG4gICAgICAgIFxuICAgICAgICBpZiAoIG1vcmVPcHRpb25zICYmIG1vcmVPcHRpb25zLnN0cmluZ3MgJiYgbW9yZU9wdGlvbnMuY2xpY2tGbiApIHtcbiAgICAgICAgICAgIGxldCB7IHN0cmluZ3MsIGNsaWNrRm4gfSA9IG1vcmVPcHRpb25zO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgcGFyYWdyYXBocyA9IHN0cmluZ3NcbiAgICAgICAgICAgICAgICAvLyAubWFwKHMgPT4gJChgPHAgY2xhc3M9XCJjbGlja2FibGVcIj4ke3N9PC9wPmApKVxuICAgICAgICAgICAgICAgIC5tYXAocyA9PiBwYXJhZ3JhcGgoeyBjbHMgOiAnY2xpY2thYmxlJywgdGV4dCA6IHMgfSkpXG4gICAgICAgICAgICAgICAgLm1hcChwRWxlbSA9PiBwRWxlbS5jbGljaygoKSA9PiBjbGlja0ZuKHBFbGVtKSkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgb25CZWZvcmVPcGVuKG1vZGFsRWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ21vZGFsRWxlbWVudDonLCBtb2RhbEVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbSh7IGlkIDogJ3N3YWwyLWNvbnRlbnQnIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKHBhcmFncmFwaHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7IC8vIGZvcmNlIGNvbmZpcm0gYW5kIGNhbmNlbCBidXR0b25zXG4gICAgICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIHNob3dDb25maXJtQnV0dG9uIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzaG93Q2FuY2VsQnV0dG9uIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIG9wdGlvbnMuc2hvd0NvbmZpcm1CdXR0b24gfHwgb3B0aW9ucy5zaG93Q2FuY2VsQnV0dG9uIHx8IG9wdGlvbnMub25PcGVuIClcbiAgICAgICAgICAgIHJldHVybiBTd2FsLmZpcmUoeyAuLi5ibG9ja2luZ09wdGlvbnMsIC4uLm9wdGlvbnMgfSk7XG4gICAgICAgIGVsc2UgLy8gVE9ETzogb25PcGVuIDogcmVzb2x2ZT9cbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IFN3YWwuZmlyZSh7IC4uLmJsb2NraW5nT3B0aW9ucywgLi4ub3B0aW9ucywgb25PcGVuIDogdiA9PiByZXNvbHZlKHYpIH0pKTtcbiAgICB9XG59O1xuZXhwb3J0IGRlZmF1bHQgeyBhbGVydEZuLCBzbWFsbCwgYmlnLCBjbG9zZSA6IFN3YWwuY2xvc2UsIGlzQWN0aXZlIDogU3dhbC5pc1Zpc2libGUgfTtcbiJdfQ==