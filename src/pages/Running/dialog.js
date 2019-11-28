"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../bhe");
class Dialog extends bhe_1.Div {
    constructor() {
        super({ id: 'dialog' });
        this.cacheAppend({
            big: bhe_1.div({ cls: 'big' }),
            medium: bhe_1.div({ cls: 'medium' }),
            small: bhe_1.div({ cls: 'small' })
        });
    }
    intro(demoType) {
        const noun = demoType === "video" ? 'a video' : 'an animation';
        this.big.text('A Tutorial');
        this.medium.text(`Here's ${noun} that shows everything you’ll be learning today`);
    }
}
exports.default = Dialog;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQXdEO0FBR3hELE1BQU0sTUFBTyxTQUFRLFNBQUc7SUFLcEI7UUFDSSxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUcsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUV6QixJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ2IsR0FBRyxFQUFHLFNBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRyxLQUFLLEVBQUUsQ0FBQztZQUMxQixNQUFNLEVBQUcsU0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFHLFFBQVEsRUFBRSxDQUFDO1lBQ2hDLEtBQUssRUFBRyxTQUFHLENBQUMsRUFBRSxHQUFHLEVBQUcsT0FBTyxFQUFFLENBQUM7U0FDakMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUVELEtBQUssQ0FBQyxRQUFrQjtRQUNwQixNQUFNLElBQUksR0FBRyxRQUFRLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztRQUMvRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksaURBQWlELENBQUMsQ0FBQztJQUN0RixDQUFDO0NBQ0o7QUFFRCxrQkFBZSxNQUFNLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCZXR0ZXJIVE1MRWxlbWVudCwgRGl2LCBkaXYgfSBmcm9tIFwiLi4vLi4vYmhlXCI7XG5pbXBvcnQgeyBEZW1vVHlwZSB9IGZyb20gXCIuLi8uLi9NeVN0b3JlXCI7XG5cbmNsYXNzIERpYWxvZyBleHRlbmRzIERpdiB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBiaWc6IERpdjtcbiAgICBwcml2YXRlIHJlYWRvbmx5IG1lZGl1bTogRGl2O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc21hbGw6IERpdjtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoeyBpZCA6ICdkaWFsb2cnIH0pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5jYWNoZUFwcGVuZCh7XG4gICAgICAgICAgICBiaWcgOiBkaXYoeyBjbHMgOiAnYmlnJyB9KSxcbiAgICAgICAgICAgIG1lZGl1bSA6IGRpdih7IGNscyA6ICdtZWRpdW0nIH0pLFxuICAgICAgICAgICAgc21hbGwgOiBkaXYoeyBjbHMgOiAnc21hbGwnIH0pXG4gICAgICAgIH0pXG4gICAgfVxuICAgIFxuICAgIGludHJvKGRlbW9UeXBlOiBEZW1vVHlwZSkge1xuICAgICAgICBjb25zdCBub3VuID0gZGVtb1R5cGUgPT09IFwidmlkZW9cIiA/ICdhIHZpZGVvJyA6ICdhbiBhbmltYXRpb24nO1xuICAgICAgICB0aGlzLmJpZy50ZXh0KCdBIFR1dG9yaWFsJyk7XG4gICAgICAgIHRoaXMubWVkaXVtLnRleHQoYEhlcmUncyAke25vdW59IHRoYXQgc2hvd3MgZXZlcnl0aGluZyB5b3XigJlsbCBiZSBsZWFybmluZyB0b2RheWApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRGlhbG9nXG4iXX0=