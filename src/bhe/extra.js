"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Suggestions = require("suggestions");
const util_js_1 = require("../util.js");
const betterhtmlelement_1 = require("betterhtmlelement");
class InputAndSubmitFlex extends betterhtmlelement_1.Div {
    constructor(options) {
        super({ cls: 'input-and-submit-flex' });
        const { placeholder, suggestions, illegalRegex } = options;
        const illegal = (illegalRegex !== null && illegalRegex !== void 0 ? illegalRegex : /[^(a-z0-9A-Z|_.)]/);
        this._suggestions = suggestions;
        const inputElem = new betterhtmlelement_1.TextInput({ placeholder })
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
                    this.input.value(this.input.value() + '_');
                }
                else if (ev.key.match(illegal)) {
                    ev.preventDefault();
                }
            },
        });
        const submit = betterhtmlelement_1.button({ cls: 'submit inactive' });
        this.cacheAppend({ input: inputElem, submit });
        new Suggestions(inputElem.e, suggestions, {
            limit: 2,
            minLength: 0,
        });
    }
    toggleSubmitButtonOnInput() {
        const inputOk = !!this.input.value;
        this.submit
            .toggleClass('active', inputOk)
            .toggleClass('inactive', !inputOk);
        if (inputOk) {
            this.input.removeClass('invalid');
        }
    }
}
class InputSection extends betterhtmlelement_1.Div {
    constructor(options) {
        super({ cls: 'input-section' });
        const { h3text, placeholder, suggestions, illegalRegex } = options;
        const flex = new InputAndSubmitFlex({
            placeholder,
            suggestions,
            illegalRegex
        });
        const subtitle = betterhtmlelement_1.elem({ tag: 'h3', html: h3text });
        this.cacheAppend({ subtitle, flex });
    }
}
exports.InputSection = InputSection;
class VisualBHE extends betterhtmlelement_1.BetterHTMLElement {
    constructor(options) {
        super(options);
        this._computedStyle = undefined;
        this.setOpacTransDur();
    }
    setOpacTransDur() {
        this._opacTransDur = this.getOpacityTransitionDuration();
        return this;
    }
    async fade(dur, to) {
        const styles = window.getComputedStyle(this.e);
        const transProp = styles.transitionProperty.split(', ');
        const indexOfOpacity = transProp.indexOf('opacity');
        if (indexOfOpacity !== -1) {
            const transDur = styles.transitionDuration.split(', ');
            const opacityTransDur = transDur[indexOfOpacity];
            const trans = styles.transition.split(', ');
            console.warn(`fade(${dur}, ${to}), opacityTransDur !== undefined. nullifying transition. SHOULD NOT WORK`);
            console.log(`trans:\t${trans}\ntransProp:\t${transProp}\nindexOfOpacity:\t${indexOfOpacity}\nopacityTransDur:\t${opacityTransDur}`);
            trans.splice(indexOfOpacity, 1, `opacity 0s`);
            console.log(`after, trans: ${trans}`);
            this.e.style.transition = trans.join(', ');
            this.css({ opacity: to });
            await util_js_1.wait(dur);
            return this;
        }
        if (dur == 0) {
            return this.css({ opacity: to });
        }
        const isFadeOut = to === 0;
        let opacity = parseFloat(this.e.style.opacity);
        if (opacity === undefined || isNaN(opacity)) {
            console.warn(`fade(${dur}, ${to}) htmlElement has NO opacity at all. recursing`, {
                opacity,
                this: this
            });
            return this.css({ opacity: Math.abs(1 - to) }).fade(dur, to);
        }
        else {
            if (isFadeOut ? opacity <= 0 : opacity > 1) {
                console.warn(`fade(${dur}, ${to}) opacity was beyond target opacity. returning this as is.`, {
                    opacity,
                    this: this
                });
                return this;
            }
        }
        let steps = 30;
        let opStep = 1 / steps;
        let everyms = dur / steps;
        if (everyms < 1) {
            everyms = 1;
            steps = dur;
            opStep = 1 / steps;
        }
        console.log(`fade(${dur}, ${to}) had opacity, no transition. (good) opacity: ${opacity}`, {
            steps,
            opStep,
            everyms
        });
        const reachedTo = isFadeOut ? (op) => op - opStep > 0 : (op) => op + opStep < 1;
        const interval = setInterval(() => {
            if (reachedTo(opacity)) {
                if (isFadeOut === true)
                    opacity -= opStep;
                else
                    opacity += opStep;
                this.css({ opacity });
            }
            else {
                opacity = to;
                this.css({ opacity });
                clearInterval(interval);
            }
        }, everyms);
        await util_js_1.wait(dur);
        return this;
    }
    async fadeOut(dur) {
        return await this.fade(dur, 0);
    }
    async fadeIn(dur) {
        return await this.fade(dur, 1);
    }
    async display() {
        this.addClass('active');
        return await util_js_1.wait(this._opacTransDur, false);
    }
    async hide() {
        this.removeClass('active');
        return await util_js_1.wait(this._opacTransDur, false);
    }
    getOpacityTransitionDuration() {
        if (!this._computedStyle) {
            this._computedStyle = getComputedStyle(this.e);
        }
        const { transitionProperty, transitionDuration } = this._computedStyle;
        const transProp = transitionProperty.split(', ');
        const indexOfOpacity = transProp.indexOf('opacity');
        if (indexOfOpacity !== -1) {
            const transDur = transitionDuration.split(', ');
            const opacityTransDur = transDur[indexOfOpacity];
            if (opacityTransDur.includes('m')) {
                return parseInt(opacityTransDur);
            }
            else {
                return parseFloat(opacityTransDur) * 1000;
            }
        }
        console.warn(`getOpacityTransitionDuration() returning undefined`);
        return undefined;
    }
}
exports.VisualBHE = VisualBHE;
function visualbhe(options) {
    return new VisualBHE(options);
}
exports.visualbhe = visualbhe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0cmEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJleHRyYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDJDQUEwQztBQUMxQyx3Q0FBa0M7QUFDbEMseURBQTBJO0FBUTFJLE1BQU0sa0JBQW1CLFNBQVEsdUJBQUc7SUFLaEMsWUFBWSxPQUFrQztRQUMxQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUUzRCxNQUFNLE9BQU8sSUFBRyxZQUFZLGFBQVosWUFBWSxjQUFaLFlBQVksR0FBSSxtQkFBbUIsQ0FBQSxDQUFDO1FBQ3BELElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1FBQ2hDLE1BQU0sU0FBUyxHQUFHLElBQUksNkJBQVMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDO2FBQzNDLEVBQUUsQ0FBQztZQUNBLE1BQU0sRUFBRSxDQUFDLEVBQVMsRUFBRSxFQUFFO2dCQUNsQixJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUNyQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBYyxFQUFFLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1lBQ3JDLENBQUM7WUFDRCxPQUFPLEVBQUUsQ0FBQyxFQUFpQixFQUFFLEVBQUU7Z0JBQzNCLElBQUksRUFBRSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDOUMsT0FBTztpQkFDVjtnQkFFRCxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNuQyxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ3BC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QWMsRUFBRTtZQUN0QixJQUFJLENBQUMsY0FBYyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsRDtRQUVELE1BQU0sRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDdkUsTUFBTSxTQUFTLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pELE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEQsSUFBSSxjQUFjLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDdkIsTUFBTSxRQUFRLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNqRCxJQUFJLGVBQWUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQy9CLE9BQU8sUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFBO2FBQ25DO2lCQUFNO2dCQUNILE9BQU8sVUFBVSxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQTthQUM1QztTQUNKO1FBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO1FBQ25FLE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7Q0FDSjtBQTFJRCw4QkEwSUM7QUFVRCxTQUFnQixTQUFTLENBQUMsT0FBTztJQUM3QixPQUFPLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ2pDLENBQUM7QUFGRCw4QkFFQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGltcG9ydCB7IEJldHRlckhUTUxFbGVtZW50LCBCdXR0b24sIGJ1dHRvbiwgZGl2LCBEaXYsIGVsZW0sIElucHV0LCBpbnB1dCB9IGZyb20gXCIuL2luZGV4XCI7XG5cbmltcG9ydCAqIGFzIFN1Z2dlc3Rpb25zIGZyb20gJ3N1Z2dlc3Rpb25zJ1xuaW1wb3J0IHsgd2FpdCB9IGZyb20gXCIuLi91dGlsLmpzXCI7XG5pbXBvcnQgeyBCZXR0ZXJIVE1MRWxlbWVudCwgYnV0dG9uLCBCdXR0b24sIERpdiwgZWxlbSwgVGV4dElucHV0LCBDaGlsZHJlbk9iaiwgRWxlbWVudDJUYWcsIFF1ZXJ5U2VsZWN0b3IsIFRhZyB9IGZyb20gXCJiZXR0ZXJodG1sZWxlbWVudFwiO1xuXG5pbnRlcmZhY2UgSW5wdXRBbmRTdWJtaXRGbGV4T3B0aW9ucyB7XG4gICAgcGxhY2Vob2xkZXI6IHN0cmluZyxcbiAgICBzdWdnZXN0aW9uczogc3RyaW5nW10sXG4gICAgaWxsZWdhbFJlZ2V4PzogUmVnRXhwXG59XG5cbmNsYXNzIElucHV0QW5kU3VibWl0RmxleCBleHRlbmRzIERpdiB7XG4gICAgc3VibWl0OiBCdXR0b247XG4gICAgaW5wdXQ6IFRleHRJbnB1dDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9zdWdnZXN0aW9uczogc3RyaW5nW107XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBJbnB1dEFuZFN1Ym1pdEZsZXhPcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKHsgY2xzOiAnaW5wdXQtYW5kLXN1Ym1pdC1mbGV4JyB9KTtcbiAgICAgICAgY29uc3QgeyBwbGFjZWhvbGRlciwgc3VnZ2VzdGlvbnMsIGlsbGVnYWxSZWdleCB9ID0gb3B0aW9ucztcblxuICAgICAgICBjb25zdCBpbGxlZ2FsID0gaWxsZWdhbFJlZ2V4ID8/IC9bXihhLXowLTlBLVp8Xy4pXS87XG4gICAgICAgIHRoaXMuX3N1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnM7XG4gICAgICAgIGNvbnN0IGlucHV0RWxlbSA9IG5ldyBUZXh0SW5wdXQoeyBwbGFjZWhvbGRlciB9KVxuICAgICAgICAgICAgLm9uKHtcbiAgICAgICAgICAgICAgICBjaGFuZ2U6IChldjogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVTdWJtaXRCdXR0b25PbklucHV0KCk7XG4gICAgICAgICAgICAgICAgfSwgaW5wdXQ6IChldjogSW5wdXRFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZVN1Ym1pdEJ1dHRvbk9uSW5wdXQoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGtleWRvd246IChldjogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXYuY3RybEtleSB8fCBldi5hbHRLZXkgfHwgZXYua2V5Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChbJyAnLCAnLCcsICctJyxdLmluY2x1ZGVzKGV2LmtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnZhbHVlKHRoaXMuaW5wdXQudmFsdWUoKSArICdfJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXYua2V5Lm1hdGNoKGlsbGVnYWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICBjb25zdCBzdWJtaXQgPSBidXR0b24oeyBjbHM6ICdzdWJtaXQgaW5hY3RpdmUnIH0pO1xuXG4gICAgICAgIHRoaXMuY2FjaGVBcHBlbmQoeyBpbnB1dDogaW5wdXRFbGVtLCBzdWJtaXQgfSk7XG4gICAgICAgIG5ldyBTdWdnZXN0aW9ucyhpbnB1dEVsZW0uZSwgc3VnZ2VzdGlvbnMsIHtcbiAgICAgICAgICAgIGxpbWl0OiAyLFxuICAgICAgICAgICAgbWluTGVuZ3RoOiAwLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0b2dnbGVTdWJtaXRCdXR0b25PbklucHV0KCkge1xuICAgICAgICBjb25zdCBpbnB1dE9rID0gISF0aGlzLmlucHV0LnZhbHVlO1xuICAgICAgICB0aGlzLnN1Ym1pdFxuICAgICAgICAgICAgLnRvZ2dsZUNsYXNzKCdhY3RpdmUnLCBpbnB1dE9rKVxuICAgICAgICAgICAgLnRvZ2dsZUNsYXNzKCdpbmFjdGl2ZScsICFpbnB1dE9rKTtcbiAgICAgICAgaWYgKGlucHV0T2spIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQucmVtb3ZlQ2xhc3MoJ2ludmFsaWQnKVxuICAgICAgICB9XG4gICAgICAgIC8qaWYgKCB0aGlzLl9vdmVyd3JpdGVXYXJuICYmIGlucHV0T2sgKSB7XG4gICAgICAgICB0aGlzLnN1Ym1pdC50b2dnbGVDbGFzcygnd2FybicsIHRoaXMuX3N1Z2dlc3Rpb25zLmxvd2VyQWxsKCkuaW5jbHVkZXModGhpcy5pbnB1dEVsZW0udmFsdWUubG93ZXIoKSkpO1xuICAgICAgICAgfSovXG5cbiAgICB9XG59XG5cbmludGVyZmFjZSBJbnB1dFNlY3Rpb25PcHRpb25zIHtcbiAgICBoM3RleHQ6IHN0cmluZyxcbiAgICBwbGFjZWhvbGRlcjogc3RyaW5nLFxuICAgIHN1Z2dlc3Rpb25zOiBzdHJpbmdbXSxcbiAgICBpbGxlZ2FsUmVnZXg/OiBSZWdFeHBcbn1cblxuZXhwb3J0IGNsYXNzIElucHV0U2VjdGlvbiBleHRlbmRzIERpdiB7XG4gICAgZmxleDogSW5wdXRBbmRTdWJtaXRGbGV4O1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogSW5wdXRTZWN0aW9uT3B0aW9ucykge1xuICAgICAgICBzdXBlcih7IGNsczogJ2lucHV0LXNlY3Rpb24nIH0pO1xuICAgICAgICBjb25zdCB7IGgzdGV4dCwgcGxhY2Vob2xkZXIsIHN1Z2dlc3Rpb25zLCBpbGxlZ2FsUmVnZXggfSA9IG9wdGlvbnM7XG4gICAgICAgIGNvbnN0IGZsZXggPSBuZXcgSW5wdXRBbmRTdWJtaXRGbGV4KHtcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyLFxuICAgICAgICAgICAgc3VnZ2VzdGlvbnMsXG4gICAgICAgICAgICBpbGxlZ2FsUmVnZXhcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHN1YnRpdGxlID0gZWxlbSh7IHRhZzogJ2gzJywgaHRtbDogaDN0ZXh0IH0pO1xuICAgICAgICB0aGlzLmNhY2hlQXBwZW5kKHsgc3VidGl0bGUsIGZsZXggfSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVmlzdWFsQkhFPEdlbmVyaWMgZXh0ZW5kcyBIVE1MRWxlbWVudCA9IEhUTUxFbGVtZW50PiBleHRlbmRzIEJldHRlckhUTUxFbGVtZW50IHtcbiAgICBwcm90ZWN0ZWQgX29wYWNUcmFuc0R1cjogbnVtYmVyO1xuICAgIHByb3RlY3RlZCBfY29tcHV0ZWRTdHlsZTogQ1NTU3R5bGVEZWNsYXJhdGlvbiA9IHVuZGVmaW5lZDtcblxuICAgIGNvbnN0cnVjdG9yKHsgdGFnLCBjbHMsIHNldGlkLCBodG1sIH06IHsgdGFnOiBFbGVtZW50MlRhZzxHZW5lcmljPiwgY2xzPzogc3RyaW5nLCBzZXRpZD86IHN0cmluZywgaHRtbD86IHN0cmluZyB9KTtcbiAgICAvKipXcmFwIGFuIGV4aXN0aW5nIGVsZW1lbnQgYnkgYGJ5aWRgLiBPcHRpb25hbGx5IGNhY2hlIGV4aXN0aW5nIGBjaGlsZHJlbmAqL1xuICAgIGNvbnN0cnVjdG9yKHsgYnlpZCwgY2hpbGRyZW4gfTogeyBieWlkOiBzdHJpbmcsIGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSk7XG4gICAgLyoqV3JhcCBhbiBleGlzdGluZyBlbGVtZW50IGJ5IGBxdWVyeWAuIE9wdGlvbmFsbHkgY2FjaGUgZXhpc3RpbmcgYGNoaWxkcmVuYCovXG4gICAgY29uc3RydWN0b3IoeyBxdWVyeSwgY2hpbGRyZW4gfTogeyBxdWVyeTogUXVlcnlTZWxlY3RvciwgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTtcbiAgICAvKipXcmFwIGFuIGV4aXN0aW5nIEhUTUxFbGVtZW50LiBPcHRpb25hbGx5IGNhY2hlIGV4aXN0aW5nIGBjaGlsZHJlbmAqL1xuICAgIGNvbnN0cnVjdG9yKHsgaHRtbEVsZW1lbnQsIGNoaWxkcmVuIH06IHsgaHRtbEVsZW1lbnQ6IEdlbmVyaWM7IGNoaWxkcmVuPzogQ2hpbGRyZW5PYmogfSk7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICBzdXBlcihvcHRpb25zKTtcbiAgICAgICAgdGhpcy5zZXRPcGFjVHJhbnNEdXIoKTtcbiAgICB9XG5cbiAgICBzZXRPcGFjVHJhbnNEdXIoKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX29wYWNUcmFuc0R1ciA9IHRoaXMuZ2V0T3BhY2l0eVRyYW5zaXRpb25EdXJhdGlvbigpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyAqKiAgRmFkZVxuICAgIGFzeW5jIGZhZGUoZHVyOiBudW1iZXIsIHRvOiAwIHwgMSk6IFByb21pc2U8dGhpcz4ge1xuICAgICAgICBjb25zdCBzdHlsZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmUpO1xuICAgICAgICBjb25zdCB0cmFuc1Byb3AgPSBzdHlsZXMudHJhbnNpdGlvblByb3BlcnR5LnNwbGl0KCcsICcpO1xuICAgICAgICBjb25zdCBpbmRleE9mT3BhY2l0eSA9IHRyYW5zUHJvcC5pbmRleE9mKCdvcGFjaXR5Jyk7XG4gICAgICAgIC8vIGNzcyBvcGFjaXR5OjAgPT4gdHJhbnNEdXJbaW5kZXhPZk9wYWNpdHldOiAwc1xuICAgICAgICAvLyBjc3Mgb3BhY2l0eTo1MDBtcyA9PiB0cmFuc0R1cltpbmRleE9mT3BhY2l0eV06IDAuNXNcbiAgICAgICAgLy8gY3NzIE5PIG9wYWNpdHkgPT4gdHJhbnNEdXJbaW5kZXhPZk9wYWNpdHldOiB1bmRlZmluZWRcbiAgICAgICAgaWYgKGluZGV4T2ZPcGFjaXR5ICE9PSAtMSkge1xuICAgICAgICAgICAgY29uc3QgdHJhbnNEdXIgPSBzdHlsZXMudHJhbnNpdGlvbkR1cmF0aW9uLnNwbGl0KCcsICcpO1xuICAgICAgICAgICAgY29uc3Qgb3BhY2l0eVRyYW5zRHVyID0gdHJhbnNEdXJbaW5kZXhPZk9wYWNpdHldO1xuICAgICAgICAgICAgY29uc3QgdHJhbnMgPSBzdHlsZXMudHJhbnNpdGlvbi5zcGxpdCgnLCAnKTtcbiAgICAgICAgICAgIC8vIHRyYW5zaXRpb246IG9wYWNpdHkgd2FzIGRlZmluZWQgaW4gY3NzLlxuICAgICAgICAgICAgLy8gc2V0IHRyYW5zaXRpb24gdG8gZHVyLCBzZXQgb3BhY2l0eSB0byAwLCBsZWF2ZSB0aGUgYW5pbWF0aW9uIHRvIG5hdGl2ZSB0cmFuc2l0aW9uLCB3YWl0IGR1ciBhbmQgcmV0dXJuIHRoaXNcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgZmFkZSgke2R1cn0sICR7dG99KSwgb3BhY2l0eVRyYW5zRHVyICE9PSB1bmRlZmluZWQuIG51bGxpZnlpbmcgdHJhbnNpdGlvbi4gU0hPVUxEIE5PVCBXT1JLYCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgdHJhbnM6XFx0JHt0cmFuc31cXG50cmFuc1Byb3A6XFx0JHt0cmFuc1Byb3B9XFxuaW5kZXhPZk9wYWNpdHk6XFx0JHtpbmRleE9mT3BhY2l0eX1cXG5vcGFjaXR5VHJhbnNEdXI6XFx0JHtvcGFjaXR5VHJhbnNEdXJ9YCk7XG4gICAgICAgICAgICAvLyB0cmFucy5zcGxpY2UoaW5kZXhPZk9wYWNpdHksIDEsIGBvcGFjaXR5ICR7ZHVyIC8gMTAwMH1zYCk7XG4gICAgICAgICAgICB0cmFucy5zcGxpY2UoaW5kZXhPZk9wYWNpdHksIDEsIGBvcGFjaXR5IDBzYCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgYWZ0ZXIsIHRyYW5zOiAke3RyYW5zfWApO1xuICAgICAgICAgICAgdGhpcy5lLnN0eWxlLnRyYW5zaXRpb24gPSB0cmFucy5qb2luKCcsICcpO1xuICAgICAgICAgICAgdGhpcy5jc3MoeyBvcGFjaXR5OiB0byB9KTtcbiAgICAgICAgICAgIGF3YWl0IHdhaXQoZHVyKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIC8vIHRyYW5zaXRpb246IG9wYWNpdHkgd2FzIE5PVCBkZWZpbmVkIGluIGNzcy5cbiAgICAgICAgaWYgKGR1ciA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jc3MoeyBvcGFjaXR5OiB0byB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpc0ZhZGVPdXQgPSB0byA9PT0gMDtcbiAgICAgICAgbGV0IG9wYWNpdHkgPSBwYXJzZUZsb2F0KHRoaXMuZS5zdHlsZS5vcGFjaXR5KTtcblxuICAgICAgICBpZiAob3BhY2l0eSA9PT0gdW5kZWZpbmVkIHx8IGlzTmFOKG9wYWNpdHkpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGZhZGUoJHtkdXJ9LCAke3RvfSkgaHRtbEVsZW1lbnQgaGFzIE5PIG9wYWNpdHkgYXQgYWxsLiByZWN1cnNpbmdgLCB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eSxcbiAgICAgICAgICAgICAgICB0aGlzOiB0aGlzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNzcyh7IG9wYWNpdHk6IE1hdGguYWJzKDEgLSB0bykgfSkuZmFkZShkdXIsIHRvKVxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBpZiAoaXNGYWRlT3V0ID8gb3BhY2l0eSA8PSAwIDogb3BhY2l0eSA+IDEpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYGZhZGUoJHtkdXJ9LCAke3RvfSkgb3BhY2l0eSB3YXMgYmV5b25kIHRhcmdldCBvcGFjaXR5LiByZXR1cm5pbmcgdGhpcyBhcyBpcy5gLCB7XG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHksXG4gICAgICAgICAgICAgICAgICAgIHRoaXM6IHRoaXNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzdGVwcyA9IDMwO1xuICAgICAgICBsZXQgb3BTdGVwID0gMSAvIHN0ZXBzO1xuICAgICAgICBsZXQgZXZlcnltcyA9IGR1ciAvIHN0ZXBzO1xuICAgICAgICBpZiAoZXZlcnltcyA8IDEpIHtcbiAgICAgICAgICAgIGV2ZXJ5bXMgPSAxO1xuICAgICAgICAgICAgc3RlcHMgPSBkdXI7XG4gICAgICAgICAgICBvcFN0ZXAgPSAxIC8gc3RlcHM7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYGZhZGUoJHtkdXJ9LCAke3RvfSkgaGFkIG9wYWNpdHksIG5vIHRyYW5zaXRpb24uIChnb29kKSBvcGFjaXR5OiAke29wYWNpdHl9YCwge1xuICAgICAgICAgICAgc3RlcHMsXG4gICAgICAgICAgICBvcFN0ZXAsXG4gICAgICAgICAgICBldmVyeW1zXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZWFjaGVkVG8gPSBpc0ZhZGVPdXQgPyAob3ApID0+IG9wIC0gb3BTdGVwID4gMCA6IChvcCkgPT4gb3AgKyBvcFN0ZXAgPCAxO1xuICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChyZWFjaGVkVG8ob3BhY2l0eSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNGYWRlT3V0ID09PSB0cnVlKVxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5IC09IG9wU3RlcDtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHkgKz0gb3BTdGVwO1xuICAgICAgICAgICAgICAgIHRoaXMuY3NzKHsgb3BhY2l0eSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eSA9IHRvO1xuICAgICAgICAgICAgICAgIHRoaXMuY3NzKHsgb3BhY2l0eSB9KTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZXZlcnltcyk7XG4gICAgICAgIGF3YWl0IHdhaXQoZHVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXN5bmMgZmFkZU91dChkdXI6IG51bWJlcik6IFByb21pc2U8dGhpcz4ge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5mYWRlKGR1ciwgMCk7XG4gICAgfVxuXG4gICAgYXN5bmMgZmFkZUluKGR1cjogbnVtYmVyKTogUHJvbWlzZTx0aGlzPiB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmZhZGUoZHVyLCAxKTtcbiAgICB9XG5cbiAgICBhc3luYyBkaXNwbGF5KCkge1xuICAgICAgICB0aGlzLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHdhaXQodGhpcy5fb3BhY1RyYW5zRHVyLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgaGlkZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIHJldHVybiBhd2FpdCB3YWl0KHRoaXMuX29wYWNUcmFuc0R1ciwgZmFsc2UpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBnZXRPcGFjaXR5VHJhbnNpdGlvbkR1cmF0aW9uKCk6IG51bWJlciB7XG4gICAgICAgIGlmICghdGhpcy5fY29tcHV0ZWRTdHlsZSkge1xuICAgICAgICAgICAgdGhpcy5fY29tcHV0ZWRTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHsgdHJhbnNpdGlvblByb3BlcnR5LCB0cmFuc2l0aW9uRHVyYXRpb24gfSA9IHRoaXMuX2NvbXB1dGVkU3R5bGU7XG4gICAgICAgIGNvbnN0IHRyYW5zUHJvcCA9IHRyYW5zaXRpb25Qcm9wZXJ0eS5zcGxpdCgnLCAnKTtcbiAgICAgICAgY29uc3QgaW5kZXhPZk9wYWNpdHkgPSB0cmFuc1Byb3AuaW5kZXhPZignb3BhY2l0eScpO1xuICAgICAgICBpZiAoaW5kZXhPZk9wYWNpdHkgIT09IC0xKSB7XG4gICAgICAgICAgICBjb25zdCB0cmFuc0R1ciA9IHRyYW5zaXRpb25EdXJhdGlvbi5zcGxpdCgnLCAnKTtcbiAgICAgICAgICAgIGNvbnN0IG9wYWNpdHlUcmFuc0R1ciA9IHRyYW5zRHVyW2luZGV4T2ZPcGFjaXR5XTtcbiAgICAgICAgICAgIGlmIChvcGFjaXR5VHJhbnNEdXIuaW5jbHVkZXMoJ20nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludChvcGFjaXR5VHJhbnNEdXIpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KG9wYWNpdHlUcmFuc0R1cikgKiAxMDAwXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS53YXJuKGBnZXRPcGFjaXR5VHJhbnNpdGlvbkR1cmF0aW9uKCkgcmV0dXJuaW5nIHVuZGVmaW5lZGApO1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZpc3VhbGJoZTxUIGV4dGVuZHMgVGFnPih7IHRhZywgY2xzLCBzZXRpZCwgaHRtbCB9OiB7IHRhZzogVCwgY2xzPzogc3RyaW5nLCBzZXRpZD86IHN0cmluZywgaHRtbD86IHN0cmluZyB9KTpcbiAgICBUIGV4dGVuZHMgVGFnID8gVmlzdWFsQkhFPEhUTUxFbGVtZW50VGFnTmFtZU1hcFtUXT4gOiBuZXZlcjtcbmV4cG9ydCBmdW5jdGlvbiB2aXN1YWxiaGUoeyBieWlkLCBjaGlsZHJlbiB9OiB7IGJ5aWQ6IHN0cmluZywgY2hpbGRyZW4/OiBDaGlsZHJlbk9iaiB9KTpcbiAgICBWaXN1YWxCSEU7XG5leHBvcnQgZnVuY3Rpb24gdmlzdWFsYmhlPFEgZXh0ZW5kcyBRdWVyeVNlbGVjdG9yPih7IHF1ZXJ5LCBjaGlsZHJlbiB9OiB7IHF1ZXJ5OiBRLCBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOlxuICAgIFEgZXh0ZW5kcyBUYWcgPyBWaXN1YWxCSEU8SFRNTEVsZW1lbnRUYWdOYW1lTWFwW1FdPiA6IFZpc3VhbEJIRTtcbmV4cG9ydCBmdW5jdGlvbiB2aXN1YWxiaGU8RSBleHRlbmRzIEhUTUxFbGVtZW50Pih7IGh0bWxFbGVtZW50LCBjaGlsZHJlbiB9OiB7IGh0bWxFbGVtZW50OiBFOyBjaGlsZHJlbj86IENoaWxkcmVuT2JqIH0pOlxuICAgIFZpc3VhbEJIRTxFPjtcbmV4cG9ydCBmdW5jdGlvbiB2aXN1YWxiaGUob3B0aW9ucyk6IFZpc3VhbEJIRSB7XG4gICAgcmV0dXJuIG5ldyBWaXN1YWxCSEUob3B0aW9ucylcbn0iXX0=