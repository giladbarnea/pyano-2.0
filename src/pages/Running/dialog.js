"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../bhe");
const util_1 = require("../../util");
class Dialog extends bhe_1.VisualBHE {
    constructor(demoType) {
        super({ tag: 'div' });
        this.id('dialog');
        this.cacheAppend({
            big: bhe_1.div({ cls: 'big' }),
            medium: bhe_1.div({ cls: 'medium' }),
            small: bhe_1.div({ cls: 'small' })
        });
        this.demoType = demoType;
    }
    static humanize(num) {
        return (num + 1).human(true);
    }
    async intro() {
        console.group(`Dialog.intro()`);
        const noun = this.demoType === "video" ? 'a video' : 'an animation';
        this.big.text('A Tutorial');
        this.medium.text(`Here’s ${noun} that shows everything you’ll be learning today`);
        this.small.text(`(Click anywhere to start playing)`);
        await this.display();
        console.groupEnd();
        return;
    }
    async levelIntro(level, demo, rate) {
        console.group(`Dialog.levelIntro(level, demo: "${demo}")`);
        const bigText = `${Dialog.humanize(level.index)} level, ${Dialog.humanize(level.internalTrialIndex)} trial`.title();
        this.big.text(bigText);
        this.medium.html(`After the demo, you’ll play <b>${level.notes}</b> notes.`);
        let noun = demo === "video" ? 'a video' : 'an animation';
        this.small.html(`Here’s ${noun} showing only these <b>${level.notes}</b> notes at ${rate * 100}% rate.`);
        await this.display();
        console.groupEnd();
        return;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQWdEO0FBRWhELHFDQUFrQztBQUlsQyxNQUFNLE1BQU8sU0FBUSxlQUFTO0lBTTFCLFlBQVksUUFBa0I7UUFDMUIsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFHLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVsQixJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ2IsR0FBRyxFQUFHLFNBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRyxLQUFLLEVBQUUsQ0FBQztZQUMxQixNQUFNLEVBQUcsU0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFHLFFBQVEsRUFBRSxDQUFDO1lBQ2hDLEtBQUssRUFBRyxTQUFHLENBQUMsRUFBRSxHQUFHLEVBQUcsT0FBTyxFQUFFLENBQUM7U0FDakMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDN0IsQ0FBQztJQUVPLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBVztRQUMvQixPQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNoQyxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUs7UUFDUCxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDaEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDO1FBQ3BFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxpREFBaUQsQ0FBQyxDQUFDO1FBQ2xGLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7UUFDckQsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDckIsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25CLE9BQU87SUFDWCxDQUFDO0lBRUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFZLEVBQUUsSUFBYyxFQUFFLElBQVk7UUFDdkQsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsSUFBSSxJQUFJLENBQUMsQ0FBQztRQUUzRCxNQUFNLE9BQU8sR0FBRyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwSCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsS0FBSyxDQUFDLEtBQUssYUFBYSxDQUFDLENBQUM7UUFDN0UsSUFBSSxJQUFJLEdBQUcsSUFBSSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUM7UUFDekQsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLDBCQUEwQixLQUFLLENBQUMsS0FBSyxpQkFBaUIsSUFBSSxHQUFHLEdBQUcsU0FBUyxDQUFDLENBQUM7UUFDekcsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDckIsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25CLE9BQU87SUFDWCxDQUFDO0lBR08sS0FBSyxDQUFDLE9BQU87UUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUIsT0FBTyxNQUFNLFdBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSTtRQUNOLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pDLE9BQU8sTUFBTSxXQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNqRCxDQUFDO0NBQ0o7QUFFRCxrQkFBZSxNQUFNLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXYsIGRpdiwgVmlzdWFsQkhFIH0gZnJvbSBcIi4uLy4uL2JoZVwiO1xuaW1wb3J0IHsgRGVtb1R5cGUgfSBmcm9tIFwiLi4vLi4vTXlTdG9yZVwiO1xuaW1wb3J0IHsgd2FpdCB9IGZyb20gXCIuLi8uLi91dGlsXCI7XG5pbXBvcnQgeyBMZXZlbCwgTGV2ZWxDb2xsZWN0aW9uIH0gZnJvbSBcIi4uLy4uL0xldmVsXCI7XG5cbi8vIEB0cy1pZ25vcmVcbmNsYXNzIERpYWxvZyBleHRlbmRzIFZpc3VhbEJIRSB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBiaWc6IERpdjtcbiAgICBwcml2YXRlIHJlYWRvbmx5IG1lZGl1bTogRGl2O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc21hbGw6IERpdjtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGRlbW9UeXBlOiBEZW1vVHlwZTtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihkZW1vVHlwZTogRGVtb1R5cGUpIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAnZGl2JyB9KTtcbiAgICAgICAgdGhpcy5pZCgnZGlhbG9nJyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNhY2hlQXBwZW5kKHtcbiAgICAgICAgICAgIGJpZyA6IGRpdih7IGNscyA6ICdiaWcnIH0pLFxuICAgICAgICAgICAgbWVkaXVtIDogZGl2KHsgY2xzIDogJ21lZGl1bScgfSksXG4gICAgICAgICAgICBzbWFsbCA6IGRpdih7IGNscyA6ICdzbWFsbCcgfSlcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZGVtb1R5cGUgPSBkZW1vVHlwZTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBzdGF0aWMgaHVtYW5pemUobnVtOiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gKG51bSArIDEpLmh1bWFuKHRydWUpXG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGludHJvKCkge1xuICAgICAgICBjb25zb2xlLmdyb3VwKGBEaWFsb2cuaW50cm8oKWApO1xuICAgICAgICBjb25zdCBub3VuID0gdGhpcy5kZW1vVHlwZSA9PT0gXCJ2aWRlb1wiID8gJ2EgdmlkZW8nIDogJ2FuIGFuaW1hdGlvbic7XG4gICAgICAgIHRoaXMuYmlnLnRleHQoJ0EgVHV0b3JpYWwnKTtcbiAgICAgICAgdGhpcy5tZWRpdW0udGV4dChgSGVyZeKAmXMgJHtub3VufSB0aGF0IHNob3dzIGV2ZXJ5dGhpbmcgeW914oCZbGwgYmUgbGVhcm5pbmcgdG9kYXlgKTtcbiAgICAgICAgdGhpcy5zbWFsbC50ZXh0KGAoQ2xpY2sgYW55d2hlcmUgdG8gc3RhcnQgcGxheWluZylgKTtcbiAgICAgICAgYXdhaXQgdGhpcy5kaXNwbGF5KCk7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICBhc3luYyBsZXZlbEludHJvKGxldmVsOiBMZXZlbCwgZGVtbzogRGVtb1R5cGUsIHJhdGU6IG51bWJlcikge1xuICAgICAgICBjb25zb2xlLmdyb3VwKGBEaWFsb2cubGV2ZWxJbnRybyhsZXZlbCwgZGVtbzogXCIke2RlbW99XCIpYCk7XG4gICAgICAgIC8vIGNvbnN0IGN1cnJlbnQgPSBsZXZlbENvbGxlY3Rpb24uY3VycmVudDtcbiAgICAgICAgY29uc3QgYmlnVGV4dCA9IGAke0RpYWxvZy5odW1hbml6ZShsZXZlbC5pbmRleCl9IGxldmVsLCAke0RpYWxvZy5odW1hbml6ZShsZXZlbC5pbnRlcm5hbFRyaWFsSW5kZXgpfSB0cmlhbGAudGl0bGUoKTtcbiAgICAgICAgdGhpcy5iaWcudGV4dChiaWdUZXh0KTtcbiAgICAgICAgdGhpcy5tZWRpdW0uaHRtbChgQWZ0ZXIgdGhlIGRlbW8sIHlvdeKAmWxsIHBsYXkgPGI+JHtsZXZlbC5ub3Rlc308L2I+IG5vdGVzLmApO1xuICAgICAgICBsZXQgbm91biA9IGRlbW8gPT09IFwidmlkZW9cIiA/ICdhIHZpZGVvJyA6ICdhbiBhbmltYXRpb24nO1xuICAgICAgICB0aGlzLnNtYWxsLmh0bWwoYEhlcmXigJlzICR7bm91bn0gc2hvd2luZyBvbmx5IHRoZXNlIDxiPiR7bGV2ZWwubm90ZXN9PC9iPiBub3RlcyBhdCAke3JhdGUgKiAxMDB9JSByYXRlLmApO1xuICAgICAgICBhd2FpdCB0aGlzLmRpc3BsYXkoKTtcbiAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIC8qKlVzZSBwdWJsaWMgZnVuY3Rpb25zKi9cbiAgICBwcml2YXRlIGFzeW5jIGRpc3BsYXkoKSB7XG4gICAgICAgIHRoaXMuYmlnLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgdGhpcy5tZWRpdW0uYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB0aGlzLnNtYWxsLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHdhaXQodGhpcy5fb3BhY1RyYW5zRHVyLCBmYWxzZSk7XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGhpZGUoKSB7XG4gICAgICAgIHRoaXMuYmlnLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgdGhpcy5tZWRpdW0ucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB0aGlzLnNtYWxsLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHdhaXQodGhpcy5fb3BhY1RyYW5zRHVyLCBmYWxzZSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEaWFsb2dcbiJdfQ==