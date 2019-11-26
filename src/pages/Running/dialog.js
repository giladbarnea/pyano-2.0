"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../bhe");
class Dialog extends bhe_1.Div {
    constructor(demoType) {
        super({ id: 'dialog' });
        const noun = demoType === "video" ? 'a video' : 'an animation';
        this.cacheAppend({
            big: bhe_1.div({ cls: 'big', text: 'A tutorial' }),
            medium: bhe_1.div({ cls: 'medium', text: `Here's ${noun} that shows everything you’ll be learning today` }),
            small: bhe_1.div({ cls: 'small' })
        });
    }
}
exports.default = Dialog;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQXdEO0FBR3hELE1BQU0sTUFBTyxTQUFRLFNBQUc7SUFLcEIsWUFBWSxRQUFrQjtRQUMxQixLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUcsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN6QixNQUFNLElBQUksR0FBRyxRQUFRLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztRQUMvRCxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ2IsR0FBRyxFQUFHLFNBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRyxLQUFLLEVBQUUsSUFBSSxFQUFHLFlBQVksRUFBRSxDQUFDO1lBQy9DLE1BQU0sRUFBRyxTQUFHLENBQUMsRUFBRSxHQUFHLEVBQUcsUUFBUSxFQUFFLElBQUksRUFBRyxVQUFVLElBQUksaURBQWlELEVBQUUsQ0FBQztZQUN4RyxLQUFLLEVBQUcsU0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFHLE9BQU8sRUFBRSxDQUFDO1NBQ2pDLENBQUMsQ0FBQTtJQUNOLENBQUM7Q0FDSjtBQUVELGtCQUFlLE1BQU0sQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJldHRlckhUTUxFbGVtZW50LCBEaXYsIGRpdiB9IGZyb20gXCIuLi8uLi9iaGVcIjtcbmltcG9ydCB7IERlbW9UeXBlIH0gZnJvbSBcIi4uLy4uL015U3RvcmVcIjtcblxuY2xhc3MgRGlhbG9nIGV4dGVuZHMgRGl2IHtcbiAgICBiaWc6IERpdjtcbiAgICBtZWRpdW06IERpdjtcbiAgICBzbWFsbDogRGl2O1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKGRlbW9UeXBlOiBEZW1vVHlwZSkge1xuICAgICAgICBzdXBlcih7IGlkIDogJ2RpYWxvZycgfSk7XG4gICAgICAgIGNvbnN0IG5vdW4gPSBkZW1vVHlwZSA9PT0gXCJ2aWRlb1wiID8gJ2EgdmlkZW8nIDogJ2FuIGFuaW1hdGlvbic7XG4gICAgICAgIHRoaXMuY2FjaGVBcHBlbmQoe1xuICAgICAgICAgICAgYmlnIDogZGl2KHsgY2xzIDogJ2JpZycsIHRleHQgOiAnQSB0dXRvcmlhbCcgfSksXG4gICAgICAgICAgICBtZWRpdW0gOiBkaXYoeyBjbHMgOiAnbWVkaXVtJywgdGV4dCA6IGBIZXJlJ3MgJHtub3VufSB0aGF0IHNob3dzIGV2ZXJ5dGhpbmcgeW914oCZbGwgYmUgbGVhcm5pbmcgdG9kYXlgIH0pLFxuICAgICAgICAgICAgc21hbGwgOiBkaXYoeyBjbHMgOiAnc21hbGwnIH0pXG4gICAgICAgIH0pXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEaWFsb2dcbiJdfQ==