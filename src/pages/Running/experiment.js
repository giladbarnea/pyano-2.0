"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dialog_1 = require("./dialog");
const keyboard_1 = require("./keyboard");
const util_1 = require("../../util");
class Experiment {
    constructor() {
        this.dialog = new dialog_1.default();
        this.keyboard = new keyboard_1.default();
        this.dialog.insertBefore(this.keyboard);
    }
    async intro(demoType) {
        this.dialog.intro(demoType);
        await util_1.wait(2000);
        this.keyboard.class('active');
    }
}
exports.default = Experiment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwZXJpbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImV4cGVyaW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBOEI7QUFFOUIseUNBQWlDO0FBQ2pDLHFDQUFrQztBQUVsQyxNQUFNLFVBQVU7SUFJWjtRQUNJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxnQkFBTSxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGtCQUFRLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBa0I7UUFDMUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUIsTUFBTSxXQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFbEMsQ0FBQztDQUVKO0FBRUQsa0JBQWUsVUFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERpYWxvZyBmcm9tIFwiLi9kaWFsb2dcIjtcbmltcG9ydCB7IERlbW9UeXBlIH0gZnJvbSBcIi4uLy4uL015U3RvcmVcIjtcbmltcG9ydCBLZXlib2FyZCBmcm9tICcuL2tleWJvYXJkJ1xuaW1wb3J0IHsgd2FpdCB9IGZyb20gXCIuLi8uLi91dGlsXCI7XG5cbmNsYXNzIEV4cGVyaW1lbnQge1xuICAgIHJlYWRvbmx5IGRpYWxvZzogRGlhbG9nO1xuICAgIHJlYWRvbmx5IGtleWJvYXJkOiBLZXlib2FyZDtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5kaWFsb2cgPSBuZXcgRGlhbG9nKCk7XG4gICAgICAgIHRoaXMua2V5Ym9hcmQgPSBuZXcgS2V5Ym9hcmQoKTtcbiAgICAgICAgdGhpcy5kaWFsb2cuaW5zZXJ0QmVmb3JlKHRoaXMua2V5Ym9hcmQpO1xuICAgIH1cbiAgICBcbiAgICBhc3luYyBpbnRybyhkZW1vVHlwZTogRGVtb1R5cGUpIHtcbiAgICAgICAgdGhpcy5kaWFsb2cuaW50cm8oZGVtb1R5cGUpO1xuICAgICAgICBhd2FpdCB3YWl0KDIwMDApO1xuICAgICAgICB0aGlzLmtleWJvYXJkLmNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxufVxuXG5leHBvcnQgZGVmYXVsdCBFeHBlcmltZW50O1xuIl19