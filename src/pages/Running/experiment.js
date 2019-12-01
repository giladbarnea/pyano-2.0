"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dialog_1 = require("./dialog");
const animation_1 = require("./animation");
const util_1 = require("../../util");
const video_1 = require("./video");
const Glob_1 = require("../../Glob");
class Experiment {
    constructor(demoType) {
        this.video = undefined;
        this.dialog = new dialog_1.default(demoType);
        this.animation = new animation_1.default();
        this.dialog
            .insertBefore(this.animation)
            .setOpacTransDur();
        this.animation.setOpacTransDur();
        if (demoType === "video") {
            this.video = new video_1.default()
                .appendTo(Glob_1.default.MainContent);
            this.video.setOpacTransDur();
        }
        this.demoType = demoType;
    }
    async init(readonlyTruth) {
        const promises = [];
        if (this.video) {
            promises.push(this.video.init(readonlyTruth.mp4.absPath, readonlyTruth.onsets.absPath));
        }
        else {
            promises.push(this.animation.init(readonlyTruth.midi.absPath));
        }
        return await Promise.all(promises);
    }
    async intro() {
        console.group(`Experiment.intro()`);
        await util_1.wait(0);
        await this.dialog.intro();
        const demo = this[this.demoType];
        await demo.display();
        const promiseDone = new Promise(resolve => {
            Glob_1.default.Document.on({
                click: async (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    await Promise.all([
                        this.dialog.hide(),
                        Glob_1.default.hide("Title", "NavigationButtons")
                    ]);
                    Glob_1.default.Document.allOff();
                    await demo.intro();
                    console.log(`done playing ${this.demoType}`);
                    await util_1.wait(1000);
                    await demo.hide();
                    resolve();
                }
            });
        });
        console.groupEnd();
        return await promiseDone;
    }
    async levelIntro(levelCollection) {
        Glob_1.default.Title.levelh3.text(`Level 1/${levelCollection.length}`);
        Glob_1.default.Title.trialh3.text(`Trial 1/${levelCollection.current.trials}`);
        const promises = [
            Glob_1.default.display("Title", "NavigationButtons"),
            this.dialog.levelIntro(levelCollection)
        ];
        await Promise.all(promises);
    }
}
exports.default = Experiment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwZXJpbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImV4cGVyaW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBOEI7QUFFOUIsMkNBQW1DO0FBQ25DLHFDQUFrQztBQUNsQyxtQ0FBNEI7QUFDNUIscUNBQThCO0FBSzlCLE1BQU0sVUFBVTtJQU1aLFlBQVksUUFBa0I7UUFIckIsVUFBSyxHQUFVLFNBQVMsQ0FBQztRQUk5QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksbUJBQVMsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNO2FBQ04sWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7YUFDNUIsZUFBZSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNqQyxJQUFLLFFBQVEsS0FBSyxPQUFPLEVBQUc7WUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLGVBQUssRUFBRTtpQkFDbkIsUUFBUSxDQUFDLGNBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1NBQ2hDO1FBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDN0IsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBNEI7UUFDbkMsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUssSUFBSSxDQUFDLEtBQUssRUFBRztZQUNkLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO1NBQzFGO2FBQU07WUFDSCxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtTQUNqRTtRQUNELE9BQU8sTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSztRQUNQLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNwQyxNQUFNLFdBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQVlkLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUcxQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3JCLE1BQU0sV0FBVyxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBR3RDLGNBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUNiLEtBQUssRUFBRyxLQUFLLEVBQUUsRUFBaUIsRUFBRSxFQUFFO29CQUNoQyxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ3BCLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDckIsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDO3dCQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO3dCQUNsQixjQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQztxQkFFMUMsQ0FBQyxDQUFDO29CQUVILGNBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ3ZCLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztvQkFDN0MsTUFBTSxXQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2pCLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNsQixPQUFPLEVBQUUsQ0FBQztnQkFFZCxDQUFDO2FBQ0osQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbkIsT0FBTyxNQUFNLFdBQVcsQ0FBQztJQUU3QixDQUFDO0lBRUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxlQUFnQztRQUM3QyxjQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUM3RCxjQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxlQUFlLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDckUsTUFBTSxRQUFRLEdBQUc7WUFDYixjQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQztZQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUM7U0FDMUMsQ0FBQztRQUNGLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBRUo7QUFFRCxrQkFBZSxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRGlhbG9nIGZyb20gXCIuL2RpYWxvZ1wiO1xuaW1wb3J0IHsgRGVtb1R5cGUgfSBmcm9tIFwiLi4vLi4vTXlTdG9yZVwiO1xuaW1wb3J0IEFuaW1hdGlvbiBmcm9tICcuL2FuaW1hdGlvbidcbmltcG9ydCB7IHdhaXQgfSBmcm9tIFwiLi4vLi4vdXRpbFwiO1xuaW1wb3J0IFZpZGVvIGZyb20gXCIuL3ZpZGVvXCI7XG5pbXBvcnQgR2xvYiBmcm9tIFwiLi4vLi4vR2xvYlwiO1xuaW1wb3J0IHsgUmVhZG9ubHlUcnV0aCB9IGZyb20gXCIuLi8uLi9UcnV0aFwiO1xuaW1wb3J0IHsgTGV2ZWxDb2xsZWN0aW9uIH0gZnJvbSBcIi4uLy4uL0xldmVsXCI7XG5cblxuY2xhc3MgRXhwZXJpbWVudCB7XG4gICAgcmVhZG9ubHkgZGlhbG9nOiBEaWFsb2c7XG4gICAgcmVhZG9ubHkgYW5pbWF0aW9uOiBBbmltYXRpb247XG4gICAgcmVhZG9ubHkgdmlkZW86IFZpZGVvID0gdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZGVtb1R5cGU6IERlbW9UeXBlO1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKGRlbW9UeXBlOiBEZW1vVHlwZSkge1xuICAgICAgICB0aGlzLmRpYWxvZyA9IG5ldyBEaWFsb2coZGVtb1R5cGUpO1xuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oKTtcbiAgICAgICAgdGhpcy5kaWFsb2dcbiAgICAgICAgICAgIC5pbnNlcnRCZWZvcmUodGhpcy5hbmltYXRpb24pXG4gICAgICAgICAgICAuc2V0T3BhY1RyYW5zRHVyKCk7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9uLnNldE9wYWNUcmFuc0R1cigpO1xuICAgICAgICBpZiAoIGRlbW9UeXBlID09PSBcInZpZGVvXCIgKSB7XG4gICAgICAgICAgICB0aGlzLnZpZGVvID0gbmV3IFZpZGVvKClcbiAgICAgICAgICAgICAgICAuYXBwZW5kVG8oR2xvYi5NYWluQ29udGVudCk7XG4gICAgICAgICAgICB0aGlzLnZpZGVvLnNldE9wYWNUcmFuc0R1cigpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGVtb1R5cGUgPSBkZW1vVHlwZTtcbiAgICB9XG4gICAgXG4gICAgYXN5bmMgaW5pdChyZWFkb25seVRydXRoOiBSZWFkb25seVRydXRoKSB7XG4gICAgICAgIGNvbnN0IHByb21pc2VzID0gW107XG4gICAgICAgIGlmICggdGhpcy52aWRlbyApIHtcbiAgICAgICAgICAgIHByb21pc2VzLnB1c2godGhpcy52aWRlby5pbml0KHJlYWRvbmx5VHJ1dGgubXA0LmFic1BhdGgsIHJlYWRvbmx5VHJ1dGgub25zZXRzLmFic1BhdGgpKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvbWlzZXMucHVzaCh0aGlzLmFuaW1hdGlvbi5pbml0KHJlYWRvbmx5VHJ1dGgubWlkaS5hYnNQYXRoKSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuICAgIH1cbiAgICBcbiAgICBhc3luYyBpbnRybygpOiBQcm9taXNlPHVua25vd24+IHtcbiAgICAgICAgY29uc29sZS5ncm91cChgRXhwZXJpbWVudC5pbnRybygpYCk7XG4gICAgICAgIGF3YWl0IHdhaXQoMCk7XG4gICAgICAgIFxuICAgICAgICAvKmNvbnN0IHByb21pc2VzID0gW1xuICAgICAgICAgdGhpcy5kaWFsb2cuaW50cm8oKSxcbiAgICAgICAgIFxuICAgICAgICAgXTtcbiAgICAgICAgIGlmICggdGhpcy52aWRlbyApIHtcbiAgICAgICAgIHByb21pc2VzLnB1c2godGhpcy52aWRlby5pbml0KHJlYWRvbmx5VHJ1dGgubXA0LmFic1BhdGgsIHJlYWRvbmx5VHJ1dGgub25zZXRzLmFic1BhdGgpKVxuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHByb21pc2VzLnB1c2godGhpcy5hbmltYXRpb24uaW5pdChyZWFkb25seVRydXRoLm1pZGkuYWJzUGF0aCkpXG4gICAgICAgICB9XG4gICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7Ki9cbiAgICAgICAgYXdhaXQgdGhpcy5kaWFsb2cuaW50cm8oKTtcbiAgICAgICAgXG4gICAgICAgIC8vLyB2aWRlbyAvIGFuaW1hdGlvblxuICAgICAgICBjb25zdCBkZW1vID0gdGhpc1t0aGlzLmRlbW9UeXBlXTtcbiAgICAgICAgYXdhaXQgZGVtby5kaXNwbGF5KCk7XG4gICAgICAgIGNvbnN0IHByb21pc2VEb25lID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgR2xvYi5Eb2N1bWVudC5vbih7XG4gICAgICAgICAgICAgICAgY2xpY2sgOiBhc3luYyAoZXY6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlhbG9nLmhpZGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIEdsb2IuaGlkZShcIlRpdGxlXCIsIFwiTmF2aWdhdGlvbkJ1dHRvbnNcIilcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgR2xvYi5Eb2N1bWVudC5hbGxPZmYoKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgZGVtby5pbnRybygpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgZG9uZSBwbGF5aW5nICR7dGhpcy5kZW1vVHlwZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgd2FpdCgxMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgZGVtby5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgIHJldHVybiBhd2FpdCBwcm9taXNlRG9uZTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGxldmVsSW50cm8obGV2ZWxDb2xsZWN0aW9uOiBMZXZlbENvbGxlY3Rpb24pIHtcbiAgICAgICAgR2xvYi5UaXRsZS5sZXZlbGgzLnRleHQoYExldmVsIDEvJHtsZXZlbENvbGxlY3Rpb24ubGVuZ3RofWApO1xuICAgICAgICBHbG9iLlRpdGxlLnRyaWFsaDMudGV4dChgVHJpYWwgMS8ke2xldmVsQ29sbGVjdGlvbi5jdXJyZW50LnRyaWFsc31gKTtcbiAgICAgICAgY29uc3QgcHJvbWlzZXMgPSBbXG4gICAgICAgICAgICBHbG9iLmRpc3BsYXkoXCJUaXRsZVwiLCBcIk5hdmlnYXRpb25CdXR0b25zXCIpLFxuICAgICAgICAgICAgdGhpcy5kaWFsb2cubGV2ZWxJbnRybyhsZXZlbENvbGxlY3Rpb24pXG4gICAgICAgIF07XG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgICB9XG4gICAgXG59XG5cbmV4cG9ydCBkZWZhdWx0IEV4cGVyaW1lbnQ7XG4iXX0=