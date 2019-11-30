"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../bhe");
const util_1 = require("../../util");
class ExperimentBHE extends bhe_1.BetterHTMLElement {
    constructor(options) {
        super(options);
    }
    setOpacTransDur() {
        this._opacTransDur = this.getOpacityTransitionDuration();
    }
    async display() {
        this.addClass('active');
        return await util_1.wait(this._opacTransDur, false);
    }
    async hide() {
        this.removeClass('active');
        return await util_1.wait(this._opacTransDur, false);
    }
}
exports.default = ExperimentBHE;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhwZXJpbWVudEJIRS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkV4cGVyaW1lbnRCSEUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBOEM7QUFDOUMscUNBQWtDO0FBRWxDLE1BQU0sYUFBYyxTQUFRLHVCQUFpQjtJQUd6QyxZQUFZLE9BQU87UUFDZixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUVELGVBQWU7UUFDWCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxDQUFBO0lBQzVELENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTztRQUNULElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEIsT0FBTyxNQUFNLFdBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSTtRQUNOLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0IsT0FBTyxNQUFNLFdBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2pELENBQUM7Q0FDSjtBQUVELGtCQUFlLGFBQWEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJldHRlckhUTUxFbGVtZW50IH0gZnJvbSBcIi4uLy4uL2JoZVwiO1xuaW1wb3J0IHsgd2FpdCB9IGZyb20gXCIuLi8uLi91dGlsXCI7XG5cbmNsYXNzIEV4cGVyaW1lbnRCSEUgZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJvdGVjdGVkIF9vcGFjVHJhbnNEdXI6IG51bWJlcjtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG9wdGlvbnMpO1xuICAgIH1cbiAgICBcbiAgICBzZXRPcGFjVHJhbnNEdXIoKSB7XG4gICAgICAgIHRoaXMuX29wYWNUcmFuc0R1ciA9IHRoaXMuZ2V0T3BhY2l0eVRyYW5zaXRpb25EdXJhdGlvbigpXG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGRpc3BsYXkoKSB7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICByZXR1cm4gYXdhaXQgd2FpdCh0aGlzLl9vcGFjVHJhbnNEdXIsIGZhbHNlKTtcbiAgICB9XG4gICAgXG4gICAgYXN5bmMgaGlkZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIHJldHVybiBhd2FpdCB3YWl0KHRoaXMuX29wYWNUcmFuc0R1ciwgZmFsc2UpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRXhwZXJpbWVudEJIRTtcbiJdfQ==