"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../bhe");
class Dialog extends bhe_1.Div {
    constructor() {
        super({ id: 'dialog' });
        this.cacheAppend({
            big: bhe_1.div({ cls: 'big', text: 'A tutorial' }),
            medium: bhe_1.div({ cls: 'medium' }),
            small: bhe_1.div({ cls: 'small' })
        });
    }
}
exports.default = new Dialog();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQXdEO0FBRXhELE1BQU0sTUFBTyxTQUFRLFNBQUc7SUFLcEI7UUFDSSxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUcsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ2IsR0FBRyxFQUFHLFNBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRyxLQUFLLEVBQUUsSUFBSSxFQUFHLFlBQVksRUFBRSxDQUFDO1lBQy9DLE1BQU0sRUFBRyxTQUFHLENBQUMsRUFBRSxHQUFHLEVBQUcsUUFBUSxFQUFFLENBQUM7WUFDaEMsS0FBSyxFQUFHLFNBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRyxPQUFPLEVBQUUsQ0FBQztTQUNqQyxDQUFDLENBQUE7SUFDTixDQUFDO0NBQ0o7QUFFRCxrQkFBZSxJQUFJLE1BQU0sRUFBRSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmV0dGVySFRNTEVsZW1lbnQsIERpdiwgZGl2IH0gZnJvbSBcIi4uLy4uL2JoZVwiO1xuXG5jbGFzcyBEaWFsb2cgZXh0ZW5kcyBEaXYge1xuICAgIGJpZzogRGl2O1xuICAgIG1lZGl1bTogRGl2O1xuICAgIHNtYWxsOiBEaXY7XG4gICAgXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKHsgaWQgOiAnZGlhbG9nJyB9KTtcbiAgICAgICAgdGhpcy5jYWNoZUFwcGVuZCh7XG4gICAgICAgICAgICBiaWcgOiBkaXYoeyBjbHMgOiAnYmlnJywgdGV4dCA6ICdBIHR1dG9yaWFsJyB9KSxcbiAgICAgICAgICAgIG1lZGl1bSA6IGRpdih7IGNscyA6ICdtZWRpdW0nIH0pLFxuICAgICAgICAgICAgc21hbGwgOiBkaXYoeyBjbHMgOiAnc21hbGwnIH0pXG4gICAgICAgIH0pXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgRGlhbG9nKClcbiJdfQ==