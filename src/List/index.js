"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const str_1 = require("../str");
class List extends Array {
    last() {
        return this[this.length - 1];
    }
    lowerAll() {
        return this.map(s => str_1.str(s).lower());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdDQUE2QjtBQUU3QixNQUFNLElBQVEsU0FBUSxLQUFRO0lBQzFCLElBQUk7UUFDQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxRQUFRO1FBQ0osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDekMsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc3RyIH0gZnJvbSBcIi4uL3N0clwiO1xuXG5jbGFzcyBMaXN0PFQ+IGV4dGVuZHMgQXJyYXk8VD4ge1xuICAgIGxhc3QoKTogVCB7XG4gICAgICAgIHJldHVybiB0aGlzW3RoaXMubGVuZ3RoIC0gMV07XG4gICAgfVxuICAgIFxuICAgIGxvd2VyQWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXAocyA9PiBzdHIocykubG93ZXIoKSk7XG4gICAgfVxufVxuIl19