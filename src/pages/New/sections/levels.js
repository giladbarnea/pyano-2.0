"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../../bhe");
class LevelsDiv extends bhe_1.Div {
    constructor({ id }) {
        super({ id });
        this.cacheAppend({
            addLevelBtn: bhe_1.button({ cls: 'green', html: 'Add Level', click: this.addLevel }),
            removeLevelBtn: bhe_1.button({ cls: 'inactive', html: 'Remove Last Level', click: () => this.removeLevel() }),
            selectors: bhe_1.div(),
            subtitles: bhe_1.div({ cls: 'subtitle' }).cacheAppend({
                level: bhe_1.div({ text: 'LEVEL' }),
                notes: bhe_1.div({ text: 'NOTES' }),
                rhythm: bhe_1.div({ text: 'RHYTHM' }),
                tempo: bhe_1.div({ text: 'TEMPO' }),
                trials: bhe_1.div({ text: 'TEMPO' }),
            }),
        });
    }
    addLevel() {
    }
    removeLevel(index = -1) {
    }
}
exports.LevelsDiv = LevelsDiv;
const levelsDiv = new LevelsDiv({ id: 'levels_div' });
exports.default = levelsDiv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV2ZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGV2ZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsc0NBQThEO0FBRTlELE1BQWEsU0FBVSxTQUFRLFNBQUc7SUFNOUIsWUFBWSxFQUFFLEVBQUUsRUFBRTtRQUNkLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ2IsV0FBVyxFQUFHLFlBQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRyxPQUFPLEVBQUUsSUFBSSxFQUFHLFdBQVcsRUFBRSxLQUFLLEVBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2xGLGNBQWMsRUFBRyxZQUFNLENBQUMsRUFBRSxHQUFHLEVBQUcsVUFBVSxFQUFFLElBQUksRUFBRyxtQkFBbUIsRUFBRSxLQUFLLEVBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7WUFDM0csU0FBUyxFQUFHLFNBQUcsRUFBRTtZQUNqQixTQUFTLEVBQUcsU0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFHLFVBQVUsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDO2dCQUM5QyxLQUFLLEVBQUcsU0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFHLE9BQU8sRUFBRSxDQUFDO2dCQUMvQixLQUFLLEVBQUcsU0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFHLE9BQU8sRUFBRSxDQUFDO2dCQUMvQixNQUFNLEVBQUcsU0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFHLFFBQVEsRUFBRSxDQUFDO2dCQUNqQyxLQUFLLEVBQUcsU0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFHLE9BQU8sRUFBRSxDQUFDO2dCQUMvQixNQUFNLEVBQUcsU0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFHLE9BQU8sRUFBRSxDQUFDO2FBQ25DLENBQUM7U0FDTCxDQUFDLENBQUE7SUFDTixDQUFDO0lBRUQsUUFBUTtJQUVSLENBQUM7SUFFTyxXQUFXLENBQUMsUUFBZ0IsQ0FBQyxDQUFDO0lBRXRDLENBQUM7Q0FFSjtBQTlCRCw4QkE4QkM7QUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0FBR3ZELGtCQUFlLFNBQVMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vICogIHBhZ2VzL05ldy9zZWN0aW9ucy9sZXZlbHNcbi8qKlxuICogaW1wb3J0IHNlY3Rpb25zIGZyb20gXCIuL3NlY3Rpb25zXCJcbiAqIHNlY3Rpb25zLmxldmVscyovXG5pbXBvcnQgeyBkaXYsIGVsZW0sIGJ1dHRvbiwgRGl2LCBCdXR0b24gfSBmcm9tIFwiLi4vLi4vLi4vYmhlXCI7XG5cbmV4cG9ydCBjbGFzcyBMZXZlbHNEaXYgZXh0ZW5kcyBEaXYge1xuICAgIGFkZExldmVsQnRuOiBCdXR0b247XG4gICAgcmVtb3ZlTGV2ZWxCdG46IEJ1dHRvbjtcbiAgICBzZWxlY3RvcnM6IERpdjtcbiAgICBzdWJ0aXRsZXM6IERpdjtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih7IGlkIH0pIHtcbiAgICAgICAgc3VwZXIoeyBpZCB9KTtcbiAgICAgICAgdGhpcy5jYWNoZUFwcGVuZCh7XG4gICAgICAgICAgICBhZGRMZXZlbEJ0biA6IGJ1dHRvbih7IGNscyA6ICdncmVlbicsIGh0bWwgOiAnQWRkIExldmVsJywgY2xpY2sgOiB0aGlzLmFkZExldmVsIH0pLFxuICAgICAgICAgICAgcmVtb3ZlTGV2ZWxCdG4gOiBidXR0b24oeyBjbHMgOiAnaW5hY3RpdmUnLCBodG1sIDogJ1JlbW92ZSBMYXN0IExldmVsJywgY2xpY2sgOiAoKSA9PiB0aGlzLnJlbW92ZUxldmVsKCkgfSksXG4gICAgICAgICAgICBzZWxlY3RvcnMgOiBkaXYoKSxcbiAgICAgICAgICAgIHN1YnRpdGxlcyA6IGRpdih7IGNscyA6ICdzdWJ0aXRsZScgfSkuY2FjaGVBcHBlbmQoe1xuICAgICAgICAgICAgICAgIGxldmVsIDogZGl2KHsgdGV4dCA6ICdMRVZFTCcgfSksXG4gICAgICAgICAgICAgICAgbm90ZXMgOiBkaXYoeyB0ZXh0IDogJ05PVEVTJyB9KSxcbiAgICAgICAgICAgICAgICByaHl0aG0gOiBkaXYoeyB0ZXh0IDogJ1JIWVRITScgfSksXG4gICAgICAgICAgICAgICAgdGVtcG8gOiBkaXYoeyB0ZXh0IDogJ1RFTVBPJyB9KSxcbiAgICAgICAgICAgICAgICB0cmlhbHMgOiBkaXYoeyB0ZXh0IDogJ1RFTVBPJyB9KSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICB9KVxuICAgIH1cbiAgICBcbiAgICBhZGRMZXZlbCgpIHtcbiAgICBcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSByZW1vdmVMZXZlbChpbmRleDogbnVtYmVyID0gLTEpIHtcbiAgICBcbiAgICB9XG4gICAgXG59XG5cbmNvbnN0IGxldmVsc0RpdiA9IG5ldyBMZXZlbHNEaXYoeyBpZCA6ICdsZXZlbHNfZGl2JyB9KTtcblxuXG5leHBvcnQgZGVmYXVsdCBsZXZlbHNEaXY7XG5cblxuIl19