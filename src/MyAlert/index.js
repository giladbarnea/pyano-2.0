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
        return smallMixin.fire(warningOptions);
    },
};
const big = {
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
    }
};
exports.default = { alertFn, small, big, close: sweetalert2_1.default.close, isActive: sweetalert2_1.default.isVisible };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUNwQyw2Q0FBd0U7QUFDeEUsZ0NBQThDO0FBRTlDLFNBQVMsT0FBTztJQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDM0IsQ0FBQztBQUVELE1BQU0sVUFBVSxHQUFHLHFCQUFJLENBQUMsS0FBSyxDQUFDO0lBQzFCLFNBQVMsRUFBRyxLQUFLO0lBQ2pCLFdBQVcsRUFBRyxpQkFBaUI7SUFDL0IsUUFBUSxFQUFHLGNBQWM7SUFDekIsaUJBQWlCLEVBQUcsS0FBSztJQUN6QixLQUFLLEVBQUcsSUFBSTtJQUNaLEtBQUssRUFBRyxJQUFJO0NBRWYsQ0FBQyxDQUFDO0FBQ0gsTUFBTSxXQUFXLEdBQUc7SUFDaEIsZ0JBQWdCLEVBQUcsSUFBSTtJQUN2QixpQkFBaUIsRUFBRyxLQUFLO0lBQ3pCLGdCQUFnQixFQUFHLElBQUk7SUFDdkIsaUJBQWlCLEVBQUcsSUFBSTtJQUN4QixLQUFLLEVBQUcsSUFBSTtDQUVmLENBQUM7QUFDRixNQUFNLGVBQWUsR0FBRztJQUNwQixhQUFhLEVBQUcsS0FBSztJQUNyQixjQUFjLEVBQUcsS0FBSztJQUN0QixpQkFBaUIsRUFBRyxLQUFLO0lBQ3pCLFNBQVMsRUFBRyxLQUFLO0lBQ2pCLFdBQVcsRUFBRyxpQkFBaUI7SUFDL0IsZ0JBQWdCLEVBQUcsS0FBSztJQUN4QixlQUFlLEVBQUcsS0FBSztJQUN2QixpQkFBaUIsRUFBRyxLQUFLO0NBRTVCLENBQUM7QUFDRixNQUFNLGlCQUFpQixHQUFHLHFCQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBYXRELE1BQU0sS0FBSyxHQUFVO0lBQ2pCLFNBQVMsQ0FBQyxPQUFPO1FBQ2IsT0FBTyxVQUFVLENBQUMsSUFBSSxpQ0FBTSxPQUFP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QUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVyRCxPQUFPLG1DQUNBLE9BQU8sS0FDVixZQUFZLENBQUMsWUFBeUI7b0JBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO29CQUMzQyxPQUFPLFVBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRyxlQUFlLEVBQUUsQ0FBQzt5QkFFaEMsTUFBTSxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUM7Z0JBQy9CLENBQUMsR0FDSixDQUFDO1NBQ0w7YUFBTTtZQUNILE9BQU8sbUJBQ0gsaUJBQWlCLEVBQUcsSUFBSSxFQUN4QixnQkFBZ0IsRUFBRyxJQUFJLElBQ3BCLE9BQU8sQ0FDYixDQUFDO1NBQ0w7UUFDRCxJQUFLLE9BQU8sQ0FBQyxpQkFBaUIsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRztZQUMzRSxPQUFPLHFCQUFJLENBQUMsSUFBSSxpQ0FBTSxlQUFlLEdBQUssT0FBTyxFQUFHLENBQUM7U0FDeEQ7YUFBTTtZQUVILE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxxQkFBSSxDQUFDLElBQUksK0NBQU0sZUFBZSxHQUFLLE9BQU8sS0FBRSxNQUFNLEVBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUcsQ0FBQyxDQUFDO1NBQzFHO0lBQ0wsQ0FBQztDQUNKLENBQUM7QUFDRixrQkFBZSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRyxxQkFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUcscUJBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnNvbGUubG9nKCdzcmMvTXlBbGVydC9pbmRleC50cycpO1xuaW1wb3J0IFN3YWwsIHsgU3dlZXRBbGVydFJlc3VsdCwgU3dlZXRBbGVydE9wdGlvbnMgfSBmcm9tICdzd2VldGFsZXJ0Mic7XG5pbXBvcnQgeyBwYXJhZ3JhcGgsIGVsZW0sIEJIRSB9IGZyb20gXCIuLi9iaGVcIjtcblxuZnVuY3Rpb24gYWxlcnRGbigpIHtcbiAgICBjb25zb2xlLmxvZygnYWxlcnRGbicpO1xufVxuXG5jb25zdCBzbWFsbE1peGluID0gU3dhbC5taXhpbih7XG4gICAgYW5pbWF0aW9uIDogZmFsc2UsXG4gICAgY3VzdG9tQ2xhc3MgOiAnYW5pbWF0ZWQgZmFkZUluJyxcbiAgICBwb3NpdGlvbiA6IFwiYm90dG9tLXN0YXJ0XCIsXG4gICAgc2hvd0NvbmZpcm1CdXR0b24gOiBmYWxzZSxcbiAgICB0aW1lciA6IDgwMDAsXG4gICAgdG9hc3QgOiB0cnVlLFxuICAgIFxufSk7XG5jb25zdCB3aXRoQ29uZmlybSA9IHtcbiAgICBjYW5jZWxCdXR0b25UZXh0IDogXCJOb1wiLFxuICAgIGNvbmZpcm1CdXR0b25UZXh0IDogXCJZZXNcIixcbiAgICBzaG93Q2FuY2VsQnV0dG9uIDogdHJ1ZSxcbiAgICBzaG93Q29uZmlybUJ1dHRvbiA6IHRydWUsXG4gICAgdGltZXIgOiBudWxsLFxuICAgIFxufTtcbmNvbnN0IGJsb2NraW5nT3B0aW9ucyA9IHtcbiAgICBhbGxvd0VudGVyS2V5IDogZmFsc2UsXG4gICAgYWxsb3dFc2NhcGVLZXkgOiBmYWxzZSxcbiAgICBhbGxvd091dHNpZGVDbGljayA6IGZhbHNlLFxuICAgIGFuaW1hdGlvbiA6IGZhbHNlLFxuICAgIGN1c3RvbUNsYXNzIDogJ2FuaW1hdGVkIGZhZGVJbicsXG4gICAgc2hvd0NhbmNlbEJ1dHRvbiA6IGZhbHNlLCAvLyBkZWZhdWx0IGZhbHNlXG4gICAgc2hvd0Nsb3NlQnV0dG9uIDogZmFsc2UsIC8vIGRlZmF1bHQgZmFsc2VcbiAgICBzaG93Q29uZmlybUJ1dHRvbiA6IGZhbHNlLFxuICAgIFxufTtcbmNvbnN0IGJsb2NraW5nU3dhbE1peGluID0gU3dhbC5taXhpbihibG9ja2luZ09wdGlvbnMpO1xudHlwZSBTbWFsbCA9IHtcbiAgICBfZXJyb3Iob3B0aW9uczogU3dlZXRBbGVydE9wdGlvbnMpOiBQcm9taXNlPFN3ZWV0QWxlcnRSZXN1bHQ+LFxuICAgIF9pbmZvKG9wdGlvbnM6IFN3ZWV0QWxlcnRPcHRpb25zKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PixcbiAgICBfcXVlc3Rpb24ob3B0aW9uczogU3dlZXRBbGVydE9wdGlvbnMpOiBQcm9taXNlPFN3ZWV0QWxlcnRSZXN1bHQ+LFxuICAgIF9zdWNjZXNzKG9wdGlvbnM6IFN3ZWV0QWxlcnRPcHRpb25zKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PixcbiAgICBfd2FybmluZyhvcHRpb25zOiBTd2VldEFsZXJ0T3B0aW9ucyk6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4sXG4gICAgZXJyb3IodGl0bGU6IHN0cmluZywgdGV4dDogc3RyaW5nKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PixcbiAgICBpbmZvKHRpdGxlOiBzdHJpbmcsIHRleHQ/OiAoc3RyaW5nIHwgbnVsbCksIHNob3dDb25maXJtQnRucz86IGJvb2xlYW4pOiBQcm9taXNlPFN3ZWV0QWxlcnRSZXN1bHQ+LFxuICAgIHN1Y2Nlc3ModGl0bGU6IHN0cmluZywgdGV4dD86IChzdHJpbmcgfCBudWxsKSwgdGltZXI/OiBudW1iZXIpOiBQcm9taXNlPFN3ZWV0QWxlcnRSZXN1bHQ+LFxuICAgIHdhcm5pbmcodGl0bGU6IHN0cmluZywgdGV4dD86IChzdHJpbmcgfCBudWxsKSwgc2hvd0NvbmZpcm1CdG5zPzogYm9vbGVhbik6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4sXG59XG5cbmNvbnN0IHNtYWxsOiBTbWFsbCA9IHtcbiAgICBfcXVlc3Rpb24ob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gc21hbGxNaXhpbi5maXJlKHsgLi4ub3B0aW9ucywgdHlwZSA6ICdxdWVzdGlvbicgfSlcbiAgICB9LFxuICAgIF9pbmZvKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHNtYWxsTWl4aW4uZmlyZSh7IC4uLm9wdGlvbnMsIHR5cGUgOiAnaW5mbycgfSlcbiAgICB9LFxuICAgIF9zdWNjZXNzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHNtYWxsTWl4aW4uZmlyZSh7IC4uLm9wdGlvbnMsIHR5cGUgOiAnc3VjY2VzcycgfSlcbiAgICB9LFxuICAgIF9lcnJvcihvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBzbWFsbE1peGluLmZpcmUoeyAuLi5vcHRpb25zLCB0eXBlIDogJ2Vycm9yJyB9KVxuICAgIH0sXG4gICAgX3dhcm5pbmcob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gc21hbGxNaXhpbi5maXJlKHtcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBzaG93Q29uZmlybUJ1dHRvbiA6IHRydWUsIHR5cGUgOiAnd2FybmluZydcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIGVycm9yKHRpdGxlLCB0ZXh0KSB7XG4gICAgICAgIHJldHVybiBzbWFsbE1peGluLmZpcmUoe1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgdHlwZSA6IFwiZXJyb3JcIixcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGluZm8odGl0bGUsIHRleHQgPSBudWxsLCBzaG93Q29uZmlybUJ0bnMgPSBmYWxzZSkge1xuICAgICAgICBsZXQgaW5mb09wdGlvbnMgPSB7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICB0eXBlIDogXCJpbmZvXCIsXG4gICAgICAgIH07XG4gICAgICAgIGlmICggc2hvd0NvbmZpcm1CdG5zIClcbiAgICAgICAgICAgIGluZm9PcHRpb25zID0geyAuLi5pbmZvT3B0aW9ucywgLi4ud2l0aENvbmZpcm0gfTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gc21hbGxNaXhpbi5maXJlKGluZm9PcHRpb25zKTtcbiAgICB9LFxuICAgIHN1Y2Nlc3ModGl0bGUsIHRleHQgPSBudWxsLCB0aW1lciA9IDQwMDApIHtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBzbWFsbE1peGluLmZpcmUoe1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgdHlwZSA6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgICAgdGltZXJcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIHdhcm5pbmcodGl0bGUsIHRleHQgPSBudWxsLCBzaG93Q29uZmlybUJ0bnMgPSBmYWxzZSkge1xuICAgICAgICBsZXQgd2FybmluZ09wdGlvbnMgPSB7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICB0eXBlIDogXCJ3YXJuaW5nXCJcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCBzaG93Q29uZmlybUJ0bnMgKVxuICAgICAgICAgICAgd2FybmluZ09wdGlvbnMgPSB7IC4uLndhcm5pbmdPcHRpb25zLCAuLi53aXRoQ29uZmlybSB9O1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBzbWFsbE1peGluLmZpcmUod2FybmluZ09wdGlvbnMpO1xuICAgIH0sXG4gICAgXG59O1xudHlwZSBCaWcgPSB7XG4gICAgd2FybmluZyhvcHRpb25zOiBTd2VldEFsZXJ0T3B0aW9ucyk6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4sXG4gICAgXG4gICAgYmxvY2tpbmcob3B0aW9uczogU3dlZXRBbGVydE9wdGlvbnMsIG1vcmVPcHRpb25zPzogeyBzdHJpbmdzOiBzdHJpbmdbXSwgY2xpY2tGbjogKGJoZTogQkhFKSA9PiBhbnkgfSk6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4gfCBIVE1MRWxlbWVudCxcbiAgICBcbn1cbmNvbnN0IGJpZzogQmlnID0ge1xuICAgIHdhcm5pbmcob3B0aW9ucykge1xuICAgICAgICBpZiAoIG9wdGlvbnMuYW5pbWF0aW9uID09PSBmYWxzZSApXG4gICAgICAgICAgICBvcHRpb25zID0geyBjdXN0b21DbGFzcyA6IG51bGwsIC4uLm9wdGlvbnMgfTtcbiAgICAgICAgcmV0dXJuIGJsb2NraW5nU3dhbE1peGluLmZpcmUoeyAuLi53aXRoQ29uZmlybSwgdHlwZSA6ICd3YXJuaW5nJywgLi4ub3B0aW9ucyB9KTtcbiAgICB9LFxuICAgIFxuICAgIC8vIGJsb2NraW5nKG9wdGlvbnM6IFN3ZWV0QWxlcnRPcHRpb25zLCB7IHN0cmluZ3MsIGNsaWNrRm4gfSA9IHt9KTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PiB7XG4gICAgYmxvY2tpbmcob3B0aW9ucywgbW9yZU9wdGlvbnMpIHtcbiAgICAgICAgXG4gICAgICAgIGlmICggbW9yZU9wdGlvbnMgJiYgbW9yZU9wdGlvbnMuc3RyaW5ncyAmJiBtb3JlT3B0aW9ucy5jbGlja0ZuICkge1xuICAgICAgICAgICAgbGV0IHsgc3RyaW5ncywgY2xpY2tGbiB9ID0gbW9yZU9wdGlvbnM7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBwYXJhZ3JhcGhzID0gc3RyaW5nc1xuICAgICAgICAgICAgICAgIC8vIC5tYXAocyA9PiAkKGA8cCBjbGFzcz1cImNsaWNrYWJsZVwiPiR7c308L3A+YCkpXG4gICAgICAgICAgICAgICAgLm1hcChzID0+IHBhcmFncmFwaCh7IGNscyA6ICdjbGlja2FibGUnLCB0ZXh0IDogcyB9KSlcbiAgICAgICAgICAgICAgICAubWFwKHBFbGVtID0+IHBFbGVtLmNsaWNrKCgpID0+IGNsaWNrRm4ocEVsZW0pKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBvbkJlZm9yZU9wZW4obW9kYWxFbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbW9kYWxFbGVtZW50OicsIG1vZGFsRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtKHsgaWQgOiAnc3dhbDItY29udGVudCcgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIC5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoLi4ucGFyYWdyYXBocyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHsgLy8gZm9yY2UgY29uZmlybSBhbmQgY2FuY2VsIGJ1dHRvbnNcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgc2hvd0NvbmZpcm1CdXR0b24gOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNob3dDYW5jZWxCdXR0b24gOiB0cnVlLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICggb3B0aW9ucy5zaG93Q29uZmlybUJ1dHRvbiB8fCBvcHRpb25zLnNob3dDYW5jZWxCdXR0b24gfHwgb3B0aW9ucy5vbk9wZW4gKSB7XG4gICAgICAgICAgICByZXR1cm4gU3dhbC5maXJlKHsgLi4uYmxvY2tpbmdPcHRpb25zLCAuLi5vcHRpb25zIH0pO1xuICAgICAgICB9IGVsc2UgeyAvLyBUT0RPOiBvbk9wZW4gOiByZXNvbHZlP1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gU3dhbC5maXJlKHsgLi4uYmxvY2tpbmdPcHRpb25zLCAuLi5vcHRpb25zLCBvbk9wZW4gOiB2ID0+IHJlc29sdmUodikgfSkpO1xuICAgICAgICB9XG4gICAgfVxufTtcbmV4cG9ydCBkZWZhdWx0IHsgYWxlcnRGbiwgc21hbGwsIGJpZywgY2xvc2UgOiBTd2FsLmNsb3NlLCBpc0FjdGl2ZSA6IFN3YWwuaXNWaXNpYmxlIH07XG4iXX0=