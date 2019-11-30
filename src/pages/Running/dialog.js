"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../bhe");
const ExperimentBHE_1 = require("./ExperimentBHE");
const util_1 = require("../../util");
class Dialog extends ExperimentBHE_1.default {
    constructor() {
        super({ tag: 'div' });
        this.id('dialog');
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
        this.display();
    }
    async display() {
        this.big.addClass('active');
        this.medium.addClass('active');
        this.small.addClass('active');
        return await util_1.wait(this._opacTransDur, false);
    }
    async hide() {
        this.big.removeClass('active');
        this.medium.removeClass('active');
        this.small.removeClass('active');
        return await util_1.wait(this._opacTransDur, false);
    }
}
exports.default = Dialog;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQXFDO0FBRXJDLG1EQUE0QztBQUM1QyxxQ0FBa0M7QUFFbEMsTUFBTSxNQUFPLFNBQVEsdUJBQWE7SUFLOUI7UUFDSSxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWxCLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDYixHQUFHLEVBQUcsU0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFHLEtBQUssRUFBRSxDQUFDO1lBQzFCLE1BQU0sRUFBRyxTQUFHLENBQUMsRUFBRSxHQUFHLEVBQUcsUUFBUSxFQUFFLENBQUM7WUFDaEMsS0FBSyxFQUFHLFNBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRyxPQUFPLEVBQUUsQ0FBQztTQUNqQyxDQUFDLENBQUE7SUFDTixDQUFDO0lBRUQsS0FBSyxDQUFDLFFBQWtCO1FBQ3BCLE1BQU0sSUFBSSxHQUFHLFFBQVEsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDO1FBQy9ELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxpREFBaUQsQ0FBQyxDQUFDO1FBQ2xGLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU87UUFDVCxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QixPQUFPLE1BQU0sV0FBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJO1FBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakMsT0FBTyxNQUFNLFdBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2pELENBQUM7Q0FDSjtBQUVELGtCQUFlLE1BQU0sQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpdiwgZGl2IH0gZnJvbSBcIi4uLy4uL2JoZVwiO1xuaW1wb3J0IHsgRGVtb1R5cGUgfSBmcm9tIFwiLi4vLi4vTXlTdG9yZVwiO1xuaW1wb3J0IEV4cGVyaW1lbnRCSEUgZnJvbSBcIi4vRXhwZXJpbWVudEJIRVwiO1xuaW1wb3J0IHsgd2FpdCB9IGZyb20gXCIuLi8uLi91dGlsXCI7XG5cbmNsYXNzIERpYWxvZyBleHRlbmRzIEV4cGVyaW1lbnRCSEUge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgYmlnOiBEaXY7XG4gICAgcHJpdmF0ZSByZWFkb25seSBtZWRpdW06IERpdjtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNtYWxsOiBEaXY7XG4gICAgXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ2RpdicgfSk7XG4gICAgICAgIHRoaXMuaWQoJ2RpYWxvZycpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5jYWNoZUFwcGVuZCh7XG4gICAgICAgICAgICBiaWcgOiBkaXYoeyBjbHMgOiAnYmlnJyB9KSxcbiAgICAgICAgICAgIG1lZGl1bSA6IGRpdih7IGNscyA6ICdtZWRpdW0nIH0pLFxuICAgICAgICAgICAgc21hbGwgOiBkaXYoeyBjbHMgOiAnc21hbGwnIH0pXG4gICAgICAgIH0pXG4gICAgfVxuICAgIFxuICAgIGludHJvKGRlbW9UeXBlOiBEZW1vVHlwZSkge1xuICAgICAgICBjb25zdCBub3VuID0gZGVtb1R5cGUgPT09IFwidmlkZW9cIiA/ICdhIHZpZGVvJyA6ICdhbiBhbmltYXRpb24nO1xuICAgICAgICB0aGlzLmJpZy50ZXh0KCdBIFR1dG9yaWFsJyk7XG4gICAgICAgIHRoaXMubWVkaXVtLnRleHQoYEhlcmUncyAke25vdW59IHRoYXQgc2hvd3MgZXZlcnl0aGluZyB5b3XigJlsbCBiZSBsZWFybmluZyB0b2RheWApO1xuICAgICAgICB0aGlzLmRpc3BsYXkoKTtcbiAgICB9XG4gICAgXG4gICAgYXN5bmMgZGlzcGxheSgpIHtcbiAgICAgICAgdGhpcy5iaWcuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB0aGlzLm1lZGl1bS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIHRoaXMuc21hbGwuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICByZXR1cm4gYXdhaXQgd2FpdCh0aGlzLl9vcGFjVHJhbnNEdXIsIGZhbHNlKTtcbiAgICB9XG4gICAgXG4gICAgYXN5bmMgaGlkZSgpIHtcbiAgICAgICAgdGhpcy5iaWcucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB0aGlzLm1lZGl1bS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIHRoaXMuc21hbGwucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICByZXR1cm4gYXdhaXQgd2FpdCh0aGlzLl9vcGFjVHJhbnNEdXIsIGZhbHNlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERpYWxvZ1xuIl19