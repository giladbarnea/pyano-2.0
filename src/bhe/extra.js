"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const Suggestions = require("suggestions");
class InputAndSubmitFlex extends index_1.Div {
    constructor(options) {
        super({ cls: 'input-and-submit-flex' });
        const { placeholder, suggestions } = options;
        const illegal = /[^(a-z0-9A-Z|_.)]/;
        this._suggestions = suggestions;
        const inputElem = index_1.input({ placeholder })
            .on({
            change: (ev) => {
                this.toggleSubmitButtonOnInput();
            }, input: (ev) => {
                this.toggleSubmitButtonOnInput();
            },
            keydown: (ev) => {
                if (ev.ctrlKey || ev.altKey || ev.key.length > 1) {
                    return;
                }
                if ([' ', ',', '-',].includes(ev.key)) {
                    ev.preventDefault();
                    this.inputElem.value += '_';
                }
                else if (ev.key.match(illegal)) {
                    ev.preventDefault();
                }
            },
        });
        const submitButton = index_1.button({ cls: 'inactive' });
        this.cacheAppend({ inputElem, submitButton });
        new Suggestions(inputElem.e, suggestions, {
            limit: 2,
            minLength: 1,
        });
    }
    toggleSubmitButtonOnInput() {
        const inputOk = !!this.inputElem.value;
        this.submitButton
            .toggleClass('active', inputOk)
            .toggleClass('inactive', !inputOk);
        if (inputOk) {
            this.inputElem.removeClass('invalid');
        }
    }
}
class InputSection extends index_1.Div {
    constructor(options) {
        super({ cls: 'input-section' });
        const { h3text, placeholder, suggestions } = options;
        const inputAndSubmitFlex = new InputAndSubmitFlex({
            placeholder,
            suggestions
        });
        const subtitle = index_1.elem({ tag: 'h3', text: h3text });
        this.cacheAppend({ subtitle, inputAndSubmitFlex });
    }
}
exports.InputSection = InputSection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0cmEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJleHRyYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUF1RTtBQUV2RSwyQ0FBMEM7QUFPMUMsTUFBTSxrQkFBbUIsU0FBUSxXQUFHO0lBS2hDLFlBQVksT0FBa0M7UUFDMUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFHLHVCQUF1QixFQUFFLENBQUMsQ0FBQztRQUN6QyxNQUFNLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBQyxHQUFHLE9BQU8sQ0FBQztRQUM1QyxNQUFNLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQztRQUNwQyxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztRQUNoQyxNQUFNLFNBQVMsR0FBRyxhQUFLLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQzthQUNuQyxFQUFFLENBQUM7WUFDQSxNQUFNLEVBQUcsQ0FBQyxFQUFTLEVBQUUsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7WUFDckMsQ0FBQyxFQUFFLEtBQUssRUFBRyxDQUFDLEVBQWMsRUFBRSxFQUFFO2dCQUMxQixJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUNyQyxDQUFDO1lBQ0QsT0FBTyxFQUFHLENBQUMsRUFBaUIsRUFBRSxFQUFFO2dCQUM1QixJQUFLLEVBQUUsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUc7b0JBQ2hELE9BQU87aUJBQ1Y7Z0JBRUQsSUFBSyxDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRztvQkFDdkMsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUM7aUJBQy9CO3FCQUFNLElBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUc7b0JBQ2hDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztpQkFFdkI7WUFFTCxDQUFDO1NBRUosQ0FBQyxDQUFDO1FBQ1AsTUFBTSxZQUFZLEdBQUcsY0FBTSxDQUFDLEVBQUUsR0FBRyxFQUFHLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFFbEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLElBQUksV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxFQUFFO1lBQ3RDLEtBQUssRUFBRyxDQUFDO1lBQ1QsU0FBUyxFQUFHLENBQUM7U0FDaEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELHlCQUF5QjtRQUNyQixNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7UUFDdkMsSUFBSSxDQUFDLFlBQVk7YUFDWixXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQzthQUM5QixXQUFXLENBQUMsVUFBVSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkMsSUFBSyxPQUFPLEVBQUc7WUFDWCxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtTQUN4QztJQUtMLENBQUM7Q0FDSjtBQVFELE1BQWEsWUFBYSxTQUFRLFdBQUc7SUFHakMsWUFBWSxPQUE0QjtRQUNwQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUcsZUFBZSxFQUFFLENBQUMsQ0FBQztRQUNqQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDckQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLGtCQUFrQixDQUFDO1lBQzlDLFdBQVc7WUFDWCxXQUFXO1NBQ2QsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxRQUFRLEdBQUcsWUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFHLElBQUksRUFBRSxJQUFJLEVBQUcsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLENBQUMsQ0FBQztJQUN2RCxDQUFDO0NBQ0o7QUFiRCxvQ0FhQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJ1dHRvbiwgYnV0dG9uLCBkaXYsIERpdiwgZWxlbSwgSW5wdXQsIGlucHV0IH0gZnJvbSBcIi4vaW5kZXhcIjtcblxuaW1wb3J0ICogYXMgU3VnZ2VzdGlvbnMgZnJvbSAnc3VnZ2VzdGlvbnMnXG5cbmludGVyZmFjZSBJbnB1dEFuZFN1Ym1pdEZsZXhPcHRpb25zIHtcbiAgICBwbGFjZWhvbGRlcjogc3RyaW5nLFxuICAgIHN1Z2dlc3Rpb25zOiBzdHJpbmdbXSxcbn1cblxuY2xhc3MgSW5wdXRBbmRTdWJtaXRGbGV4IGV4dGVuZHMgRGl2IHtcbiAgICBzdWJtaXRCdXR0b246IEJ1dHRvbjtcbiAgICBpbnB1dEVsZW06IElucHV0O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX3N1Z2dlc3Rpb25zOiBzdHJpbmdbXTtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBJbnB1dEFuZFN1Ym1pdEZsZXhPcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKHsgY2xzIDogJ2lucHV0LWFuZC1zdWJtaXQtZmxleCcgfSk7XG4gICAgICAgIGNvbnN0IHsgcGxhY2Vob2xkZXIsIHN1Z2dlc3Rpb25zfSA9IG9wdGlvbnM7XG4gICAgICAgIGNvbnN0IGlsbGVnYWwgPSAvW14oYS16MC05QS1afF8uKV0vO1xuICAgICAgICB0aGlzLl9zdWdnZXN0aW9ucyA9IHN1Z2dlc3Rpb25zO1xuICAgICAgICBjb25zdCBpbnB1dEVsZW0gPSBpbnB1dCh7IHBsYWNlaG9sZGVyIH0pXG4gICAgICAgICAgICAub24oe1xuICAgICAgICAgICAgICAgIGNoYW5nZSA6IChldjogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVTdWJtaXRCdXR0b25PbklucHV0KCk7XG4gICAgICAgICAgICAgICAgfSwgaW5wdXQgOiAoZXY6IElucHV0RXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVTdWJtaXRCdXR0b25PbklucHV0KCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBrZXlkb3duIDogKGV2OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggZXYuY3RybEtleSB8fCBldi5hbHRLZXkgfHwgZXYua2V5Lmxlbmd0aCA+IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmICggWyAnICcsICcsJywgJy0nLCBdLmluY2x1ZGVzKGV2LmtleSkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dEVsZW0udmFsdWUgKz0gJ18nO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBldi5rZXkubWF0Y2goaWxsZWdhbCkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBjb25zdCBzdWJtaXRCdXR0b24gPSBidXR0b24oeyBjbHMgOiAnaW5hY3RpdmUnIH0pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5jYWNoZUFwcGVuZCh7IGlucHV0RWxlbSwgc3VibWl0QnV0dG9uIH0pO1xuICAgICAgICBuZXcgU3VnZ2VzdGlvbnMoaW5wdXRFbGVtLmUsIHN1Z2dlc3Rpb25zLCB7XG4gICAgICAgICAgICBsaW1pdCA6IDIsXG4gICAgICAgICAgICBtaW5MZW5ndGggOiAxLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgdG9nZ2xlU3VibWl0QnV0dG9uT25JbnB1dCgpIHtcbiAgICAgICAgY29uc3QgaW5wdXRPayA9ICEhdGhpcy5pbnB1dEVsZW0udmFsdWU7XG4gICAgICAgIHRoaXMuc3VibWl0QnV0dG9uXG4gICAgICAgICAgICAudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScsIGlucHV0T2spXG4gICAgICAgICAgICAudG9nZ2xlQ2xhc3MoJ2luYWN0aXZlJywgIWlucHV0T2spO1xuICAgICAgICBpZiAoIGlucHV0T2sgKSB7XG4gICAgICAgICAgICB0aGlzLmlucHV0RWxlbS5yZW1vdmVDbGFzcygnaW52YWxpZCcpXG4gICAgICAgIH1cbiAgICAgICAgLyppZiAoIHRoaXMuX292ZXJ3cml0ZVdhcm4gJiYgaW5wdXRPayApIHtcbiAgICAgICAgIHRoaXMuc3VibWl0QnV0dG9uLnRvZ2dsZUNsYXNzKCd3YXJuJywgdGhpcy5fc3VnZ2VzdGlvbnMubG93ZXJBbGwoKS5pbmNsdWRlcyh0aGlzLmlucHV0RWxlbS52YWx1ZS5sb3dlcigpKSk7XG4gICAgICAgICB9Ki9cbiAgICAgICAgXG4gICAgfVxufVxuXG5pbnRlcmZhY2UgSW5wdXRTZWN0aW9uT3B0aW9ucyB7XG4gICAgaDN0ZXh0OiBzdHJpbmcsXG4gICAgcGxhY2Vob2xkZXI6IHN0cmluZyxcbiAgICBzdWdnZXN0aW9uczogc3RyaW5nW11cbn1cblxuZXhwb3J0IGNsYXNzIElucHV0U2VjdGlvbiBleHRlbmRzIERpdiB7XG4gICAgaW5wdXRBbmRTdWJtaXRGbGV4OiBJbnB1dEFuZFN1Ym1pdEZsZXg7XG4gICAgXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogSW5wdXRTZWN0aW9uT3B0aW9ucykge1xuICAgICAgICBzdXBlcih7IGNscyA6ICdpbnB1dC1zZWN0aW9uJyB9KTtcbiAgICAgICAgY29uc3QgeyBoM3RleHQsIHBsYWNlaG9sZGVyLCBzdWdnZXN0aW9ucyB9ID0gb3B0aW9ucztcbiAgICAgICAgY29uc3QgaW5wdXRBbmRTdWJtaXRGbGV4ID0gbmV3IElucHV0QW5kU3VibWl0RmxleCh7XG4gICAgICAgICAgICBwbGFjZWhvbGRlcixcbiAgICAgICAgICAgIHN1Z2dlc3Rpb25zXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBzdWJ0aXRsZSA9IGVsZW0oeyB0YWcgOiAnaDMnLCB0ZXh0IDogaDN0ZXh0IH0pO1xuICAgICAgICB0aGlzLmNhY2hlQXBwZW5kKHsgc3VidGl0bGUsIGlucHV0QW5kU3VibWl0RmxleCB9KTtcbiAgICB9XG59XG4iXX0=