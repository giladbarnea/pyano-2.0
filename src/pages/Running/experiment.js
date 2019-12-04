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
        this.video = new video_1.default()
            .appendTo(Glob_1.default.MainContent);
        this.video.setOpacTransDur();
        this.demoType = demoType;
    }
    async init(readonlyTruth) {
        return await Promise.all([
            this.video.init(readonlyTruth),
            this.animation.init(readonlyTruth.midi.absPath)
        ]);
    }
    async callOnClick(fn, demo) {
        const done = new Promise(resolve => Glob_1.default.Document.on({
            click: async (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                await Promise.all([
                    this.dialog.hide(),
                    Glob_1.default.hide("Title", "NavigationButtons")
                ]);
                Glob_1.default.Document.off("click");
                await fn();
                await util_1.wait(1000);
                await demo.hide();
                resolve();
            }
        }));
        await done;
        await Glob_1.default.display("Title", "NavigationButtons");
        return;
    }
    async intro() {
        console.group(`Experiment.intro()`);
        await util_1.wait(0);
        await this.dialog.intro();
        let demo;
        if (Glob_1.default.BigConfig.dev.simulate_video_mode('Experiment.intro()')) {
            demo = this.video;
        }
        else {
            demo = this[this.demoType];
        }
        await demo.display();
        return await this.callOnClick(async () => {
            await demo.intro();
            console.groupEnd();
        }, demo);
    }
    async levelIntro(levelCollection) {
        console.group(`Experiment.levelIntro()`);
        Glob_1.default.Title.levelh3.text(`Level 1/${levelCollection.length}`);
        Glob_1.default.Title.trialh3.text(`Trial 1/${levelCollection.current.trials}`);
        let playVideo;
        if (this.demoType === "animation"
            && !Glob_1.default.BigConfig.dev.simulate_video_mode('Experiment.levelIntro()')) {
            playVideo = false;
        }
        else {
            playVideo = levelCollection.previous && levelCollection.previous.notes !== levelCollection.current.notes;
        }
        console.log({ playVideo });
        await Promise.all([]);
        if (playVideo) {
            await this.dialog.levelIntro(levelCollection.current, "video");
            await this.video.display();
            await this.callOnClick(async () => {
                await this.video.levelIntro(levelCollection.current.notes);
            }, this.video);
        }
        await this.dialog.levelIntro(levelCollection.current, "animation");
        await this.animation.display();
        await this.callOnClick(async () => {
            await this.animation.levelIntro(levelCollection.current.notes);
        }, this.animation);
        console.groupEnd();
    }
}
exports.default = Experiment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwZXJpbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImV4cGVyaW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBOEI7QUFFOUIsMkNBQW1DO0FBQ25DLHFDQUFrQztBQUNsQyxtQ0FBNEI7QUFDNUIscUNBQThCO0FBTTlCLE1BQU0sVUFBVTtJQU1aLFlBQVksUUFBa0I7UUFIckIsVUFBSyxHQUFVLFNBQVMsQ0FBQztRQUk5QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksbUJBQVMsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNO2FBQ04sWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7YUFDNUIsZUFBZSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUVqQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksZUFBSyxFQUFFO2FBQ25CLFFBQVEsQ0FBQyxjQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUU3QixDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUE0QjtRQUNuQyxPQUFPLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7U0FDbEQsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBaUIsRUFBRSxJQUF1QjtRQUN4RCxNQUFNLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FB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T0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQy9ELE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMzQixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQzlCLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUUvRCxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBR2xCO1FBQ0QsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMvQixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDOUIsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRW5FLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFHbkIsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7Q0FFSjtBQUVELGtCQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBEaWFsb2cgZnJvbSBcIi4vZGlhbG9nXCI7XG5pbXBvcnQgeyBEZW1vVHlwZSB9IGZyb20gXCIuLi8uLi9NeVN0b3JlXCI7XG5pbXBvcnQgQW5pbWF0aW9uIGZyb20gJy4vYW5pbWF0aW9uJ1xuaW1wb3J0IHsgd2FpdCB9IGZyb20gXCIuLi8uLi91dGlsXCI7XG5pbXBvcnQgVmlkZW8gZnJvbSBcIi4vdmlkZW9cIjtcbmltcG9ydCBHbG9iIGZyb20gXCIuLi8uLi9HbG9iXCI7XG5pbXBvcnQgeyBSZWFkb25seVRydXRoIH0gZnJvbSBcIi4uLy4uL1RydXRoXCI7XG5pbXBvcnQgeyBMZXZlbENvbGxlY3Rpb24gfSBmcm9tIFwiLi4vLi4vTGV2ZWxcIjtcbmltcG9ydCB7IElQYWlycyB9IGZyb20gXCIuLi8uLi9NeVB5U2hlbGxcIjtcblxuXG5jbGFzcyBFeHBlcmltZW50IHtcbiAgICByZWFkb25seSBkaWFsb2c6IERpYWxvZztcbiAgICByZWFkb25seSBhbmltYXRpb246IEFuaW1hdGlvbjtcbiAgICByZWFkb25seSB2aWRlbzogVmlkZW8gPSB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSByZWFkb25seSBkZW1vVHlwZTogRGVtb1R5cGU7XG4gICAgXG4gICAgY29uc3RydWN0b3IoZGVtb1R5cGU6IERlbW9UeXBlKSB7XG4gICAgICAgIHRoaXMuZGlhbG9nID0gbmV3IERpYWxvZyhkZW1vVHlwZSk7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigpO1xuICAgICAgICB0aGlzLmRpYWxvZ1xuICAgICAgICAgICAgLmluc2VydEJlZm9yZSh0aGlzLmFuaW1hdGlvbilcbiAgICAgICAgICAgIC5zZXRPcGFjVHJhbnNEdXIoKTtcbiAgICAgICAgdGhpcy5hbmltYXRpb24uc2V0T3BhY1RyYW5zRHVyKCk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnZpZGVvID0gbmV3IFZpZGVvKClcbiAgICAgICAgICAgIC5hcHBlbmRUbyhHbG9iLk1haW5Db250ZW50KTtcbiAgICAgICAgdGhpcy52aWRlby5zZXRPcGFjVHJhbnNEdXIoKTtcbiAgICAgICAgdGhpcy5kZW1vVHlwZSA9IGRlbW9UeXBlO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgYXN5bmMgaW5pdChyZWFkb25seVRydXRoOiBSZWFkb25seVRydXRoKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICB0aGlzLnZpZGVvLmluaXQocmVhZG9ubHlUcnV0aCksXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbi5pbml0KHJlYWRvbmx5VHJ1dGgubWlkaS5hYnNQYXRoKVxuICAgICAgICBdKTtcbiAgICB9XG4gICAgXG4gICAgYXN5bmMgY2FsbE9uQ2xpY2soZm46IEFzeW5jRnVuY3Rpb24sIGRlbW86IEFuaW1hdGlvbiB8IFZpZGVvKSB7XG4gICAgICAgIGNvbnN0IGRvbmUgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+XG4gICAgICAgICAgICBHbG9iLkRvY3VtZW50Lm9uKHtcbiAgICAgICAgICAgICAgICBjbGljayA6IGFzeW5jIChldjogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaWFsb2cuaGlkZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgR2xvYi5oaWRlKFwiVGl0bGVcIiwgXCJOYXZpZ2F0aW9uQnV0dG9uc1wiKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBHbG9iLkRvY3VtZW50Lm9mZihcImNsaWNrXCIpO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBmbigpO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB3YWl0KDEwMDApO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBkZW1vLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIGF3YWl0IGRvbmU7XG4gICAgICAgIGF3YWl0IEdsb2IuZGlzcGxheShcIlRpdGxlXCIsIFwiTmF2aWdhdGlvbkJ1dHRvbnNcIik7XG4gICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgYXN5bmMgaW50cm8oKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYEV4cGVyaW1lbnQuaW50cm8oKWApO1xuICAgICAgICBhd2FpdCB3YWl0KDApO1xuICAgICAgICBcbiAgICAgICAgYXdhaXQgdGhpcy5kaWFsb2cuaW50cm8oKTtcbiAgICAgICAgXG4gICAgICAgIC8vLyB2aWRlbyAvIGFuaW1hdGlvblxuICAgICAgICBsZXQgZGVtbztcbiAgICAgICAgaWYgKCBHbG9iLkJpZ0NvbmZpZy5kZXYuc2ltdWxhdGVfdmlkZW9fbW9kZSgnRXhwZXJpbWVudC5pbnRybygpJykgKSB7XG4gICAgICAgICAgICBkZW1vID0gdGhpcy52aWRlbztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlbW8gPSB0aGlzW3RoaXMuZGVtb1R5cGVdO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhd2FpdCBkZW1vLmRpc3BsYXkoKTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuY2FsbE9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgYXdhaXQgZGVtby5pbnRybygpO1xuICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICB9LCBkZW1vKTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGFzeW5jIGxldmVsSW50cm8obGV2ZWxDb2xsZWN0aW9uOiBMZXZlbENvbGxlY3Rpb24pIHtcbiAgICAgICAgY29uc29sZS5ncm91cChgRXhwZXJpbWVudC5sZXZlbEludHJvKClgKTtcbiAgICAgICAgR2xvYi5UaXRsZS5sZXZlbGgzLnRleHQoYExldmVsIDEvJHtsZXZlbENvbGxlY3Rpb24ubGVuZ3RofWApO1xuICAgICAgICBHbG9iLlRpdGxlLnRyaWFsaDMudGV4dChgVHJpYWwgMS8ke2xldmVsQ29sbGVjdGlvbi5jdXJyZW50LnRyaWFsc31gKTtcbiAgICAgICAgbGV0IHBsYXlWaWRlbztcbiAgICAgICAgaWYgKCB0aGlzLmRlbW9UeXBlID09PSBcImFuaW1hdGlvblwiXG4gICAgICAgICAgICAmJiAhR2xvYi5CaWdDb25maWcuZGV2LnNpbXVsYXRlX3ZpZGVvX21vZGUoJ0V4cGVyaW1lbnQubGV2ZWxJbnRybygpJykgKSB7XG4gICAgICAgICAgICBwbGF5VmlkZW8gPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBsYXlWaWRlbyA9IGxldmVsQ29sbGVjdGlvbi5wcmV2aW91cyAmJiBsZXZlbENvbGxlY3Rpb24ucHJldmlvdXMubm90ZXMgIT09IGxldmVsQ29sbGVjdGlvbi5jdXJyZW50Lm5vdGVzO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coeyBwbGF5VmlkZW8gfSk7XG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIC8vIEdsb2IuZGlzcGxheShcIlRpdGxlXCIsIFwiTmF2aWdhdGlvbkJ1dHRvbnNcIiksXG4gICAgICAgIFxuICAgICAgICBdKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZiAoIHBsYXlWaWRlbyApIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYXdhaXQgdGhpcy5kaWFsb2cubGV2ZWxJbnRybyhsZXZlbENvbGxlY3Rpb24uY3VycmVudCwgXCJ2aWRlb1wiKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMudmlkZW8uZGlzcGxheSgpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jYWxsT25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy52aWRlby5sZXZlbEludHJvKGxldmVsQ29sbGVjdGlvbi5jdXJyZW50Lm5vdGVzKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sIHRoaXMudmlkZW8pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB0aGlzLmRpYWxvZy5sZXZlbEludHJvKGxldmVsQ29sbGVjdGlvbi5jdXJyZW50LCBcImFuaW1hdGlvblwiKTtcbiAgICAgICAgYXdhaXQgdGhpcy5hbmltYXRpb24uZGlzcGxheSgpO1xuICAgICAgICBhd2FpdCB0aGlzLmNhbGxPbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuYW5pbWF0aW9uLmxldmVsSW50cm8obGV2ZWxDb2xsZWN0aW9uLmN1cnJlbnQubm90ZXMpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sIHRoaXMuYW5pbWF0aW9uKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgfVxuICAgIFxufVxuXG5leHBvcnQgZGVmYXVsdCBFeHBlcmltZW50O1xuIl19