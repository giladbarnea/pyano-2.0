"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dialog_1 = require("./dialog");
const animation_1 = require("./animation");
const util_1 = require("../../util");
const video_1 = require("./video");
const Glob_1 = require("../../Glob");
const index_1 = require("./index");
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
                await index_1.tryCatch(() => fn(), `trying to run ${demo instanceof animation_1.default ? 'animation' : 'video'}`);
                await util_1.wait(1000);
                await demo.hide();
                resolve();
            }
        }));
        await demo.display();
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
            if (levelCollection.previous) {
                playVideo = levelCollection.previous.notes !== levelCollection.current.notes;
            }
            else {
                playVideo = false;
            }
        }
        playVideo = true;
        console.log({ playVideo });
        let rate = undefined;
        let temp;
        temp = Glob_1.default.BigConfig.dev.force_playback_rate('Experiment.levelIntro()');
        if (temp) {
            rate = temp;
        }
        else {
            if (levelCollection.current.rhythm) {
                rate = levelCollection.current.tempo / 100;
            }
            else {
                for (let i = levelCollection.current.index + 1; i < levelCollection.length; i++) {
                    const level = levelCollection.get(i);
                    if (level.notes === levelCollection.current.notes && level.rhythm) {
                        rate = level.tempo / 100;
                        console.warn(`level #${levelCollection.current.index} no tempo, took rate (${rate}) from level #${i}`);
                        break;
                    }
                }
                if (rate === undefined) {
                    rate = 1;
                }
            }
        }
        console.log({ rate });
        let notes;
        temp = Glob_1.default.BigConfig.dev.force_notes_number('Experiment.levelIntro()');
        if (temp) {
            notes = temp;
        }
        else {
            notes = levelCollection.current.notes;
        }
        console.log({ notes });
        if (playVideo) {
            await this.dialog.levelIntro(levelCollection.current, "video", rate);
            await this.callOnClick(async () => {
                await this.video.levelIntro(notes, rate);
            }, this.video);
        }
        await this.dialog.levelIntro(levelCollection.current, "animation", rate);
        await this.callOnClick(async () => {
            await this.animation.levelIntro(notes, rate);
        }, this.animation);
        console.groupEnd();
    }
}
exports.default = Experiment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwZXJpbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImV4cGVyaW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBOEI7QUFFOUIsMkNBQW1DO0FBQ25DLHFDQUFrQztBQUNsQyxtQ0FBNEI7QUFDNUIscUNBQThCO0FBSTlCLG1DQUFtQztBQUluQyxNQUFNLFVBQVU7SUFNWixZQUFZLFFBQWtCO1FBSHJCLFVBQUssR0FBVSxTQUFTLENBQUM7UUFJOUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGdCQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLG1CQUFTLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsTUFBTTthQUNOLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO2FBQzVCLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFakMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLGVBQUssRUFBRTthQUNuQixRQUFRLENBQUMsY0FBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFFN0IsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBNEI7UUFDbkMsT0FBTyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1NBQ2xELENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQWlCLEVBQUUsSUFBdUI7UUFDeEQsTUFBTSxJQUFJLEdBQUcs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eyBEZW1vVHlwZSB9IGZyb20gXCIuLi8uLi9NeVN0b3JlXCI7XG5pbXBvcnQgQW5pbWF0aW9uIGZyb20gJy4vYW5pbWF0aW9uJ1xuaW1wb3J0IHsgd2FpdCB9IGZyb20gXCIuLi8uLi91dGlsXCI7XG5pbXBvcnQgVmlkZW8gZnJvbSBcIi4vdmlkZW9cIjtcbmltcG9ydCBHbG9iIGZyb20gXCIuLi8uLi9HbG9iXCI7XG5pbXBvcnQgeyBSZWFkb25seVRydXRoIH0gZnJvbSBcIi4uLy4uL1RydXRoXCI7XG5pbXBvcnQgeyBMZXZlbENvbGxlY3Rpb24gfSBmcm9tIFwiLi4vLi4vTGV2ZWxcIjtcbmltcG9ydCB7IElQYWlycyB9IGZyb20gXCIuLi8uLi9NeVB5U2hlbGxcIjtcbmltcG9ydCB7IHRyeUNhdGNoIH0gZnJvbSBcIi4vaW5kZXhcIjtcbmltcG9ydCBNeUFsZXJ0IGZyb20gXCIuLi8uLi9NeUFsZXJ0XCI7XG5cblxuY2xhc3MgRXhwZXJpbWVudCB7XG4gICAgcmVhZG9ubHkgZGlhbG9nOiBEaWFsb2c7XG4gICAgcmVhZG9ubHkgYW5pbWF0aW9uOiBBbmltYXRpb247XG4gICAgcmVhZG9ubHkgdmlkZW86IFZpZGVvID0gdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZGVtb1R5cGU6IERlbW9UeXBlO1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKGRlbW9UeXBlOiBEZW1vVHlwZSkge1xuICAgICAgICB0aGlzLmRpYWxvZyA9IG5ldyBEaWFsb2coZGVtb1R5cGUpO1xuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oKTtcbiAgICAgICAgdGhpcy5kaWFsb2dcbiAgICAgICAgICAgIC5pbnNlcnRCZWZvcmUodGhpcy5hbmltYXRpb24pXG4gICAgICAgICAgICAuc2V0T3BhY1RyYW5zRHVyKCk7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9uLnNldE9wYWNUcmFuc0R1cigpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy52aWRlbyA9IG5ldyBWaWRlbygpXG4gICAgICAgICAgICAuYXBwZW5kVG8oR2xvYi5NYWluQ29udGVudCk7XG4gICAgICAgIHRoaXMudmlkZW8uc2V0T3BhY1RyYW5zRHVyKCk7XG4gICAgICAgIHRoaXMuZGVtb1R5cGUgPSBkZW1vVHlwZTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGluaXQocmVhZG9ubHlUcnV0aDogUmVhZG9ubHlUcnV0aCkge1xuICAgICAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgdGhpcy52aWRlby5pbml0KHJlYWRvbmx5VHJ1dGgpLFxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24uaW5pdChyZWFkb25seVRydXRoLm1pZGkuYWJzUGF0aClcbiAgICAgICAgXSk7XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGNhbGxPbkNsaWNrKGZuOiBBc3luY0Z1bmN0aW9uLCBkZW1vOiBBbmltYXRpb24gfCBWaWRlbykge1xuICAgICAgICBjb25zdCBkb25lID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PlxuICAgICAgICAgICAgR2xvYi5Eb2N1bWVudC5vbih7XG4gICAgICAgICAgICAgICAgY2xpY2sgOiBhc3luYyAoZXY6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlhbG9nLmhpZGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIEdsb2IuaGlkZShcIlRpdGxlXCIsIFwiTmF2aWdhdGlvbkJ1dHRvbnNcIilcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgR2xvYi5Eb2N1bWVudC5vZmYoXCJjbGlja1wiKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGZuKCk7XG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKCBlICkge1xuICAgICAgICAgICAgICAgICAgICAgYXdhaXQgTXlBbGVydC5iaWcuZXJyb3Ioe1xuICAgICAgICAgICAgICAgICAgICAgdGl0bGUgOiBgQW4gZXJyb3IgaGFzIG9jY3VycmVkIGAsXG4gICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgIH0qL1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0cnlDYXRjaCgoKSA9PiBmbigpLCBgdHJ5aW5nIHRvIHJ1biAke2RlbW8gaW5zdGFuY2VvZiBBbmltYXRpb24gPyAnYW5pbWF0aW9uJyA6ICd2aWRlbyd9YCk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHdhaXQoMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGRlbW8uaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgYXdhaXQgZGVtby5kaXNwbGF5KCk7XG4gICAgICAgIGF3YWl0IGRvbmU7XG4gICAgICAgIGF3YWl0IEdsb2IuZGlzcGxheShcIlRpdGxlXCIsIFwiTmF2aWdhdGlvbkJ1dHRvbnNcIik7XG4gICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgYXN5bmMgaW50cm8oKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYEV4cGVyaW1lbnQuaW50cm8oKWApO1xuICAgICAgICBhd2FpdCB3YWl0KDApO1xuICAgICAgICBcbiAgICAgICAgYXdhaXQgdGhpcy5kaWFsb2cuaW50cm8oKTtcbiAgICAgICAgXG4gICAgICAgIC8vLyB2aWRlbyAvIGFuaW1hdGlvblxuICAgICAgICBsZXQgZGVtbztcbiAgICAgICAgaWYgKCBHbG9iLkJpZ0NvbmZpZy5kZXYuc2ltdWxhdGVfdmlkZW9fbW9kZSgnRXhwZXJpbWVudC5pbnRybygpJykgKSB7XG4gICAgICAgICAgICBkZW1vID0gdGhpcy52aWRlbztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlbW8gPSB0aGlzW3RoaXMuZGVtb1R5cGVdO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5jYWxsT25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCBkZW1vLmludHJvKCk7XG4gICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgIH0sIGRlbW8pO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgYXN5bmMgbGV2ZWxJbnRybyhsZXZlbENvbGxlY3Rpb246IExldmVsQ29sbGVjdGlvbikge1xuICAgICAgICBjb25zb2xlLmdyb3VwKGBFeHBlcmltZW50LmxldmVsSW50cm8oKWApO1xuICAgICAgICBHbG9iLlRpdGxlLmxldmVsaDMudGV4dChgTGV2ZWwgMS8ke2xldmVsQ29sbGVjdGlvbi5sZW5ndGh9YCk7XG4gICAgICAgIEdsb2IuVGl0bGUudHJpYWxoMy50ZXh0KGBUcmlhbCAxLyR7bGV2ZWxDb2xsZWN0aW9uLmN1cnJlbnQudHJpYWxzfWApO1xuICAgICAgICBsZXQgcGxheVZpZGVvO1xuICAgICAgICBpZiAoIHRoaXMuZGVtb1R5cGUgPT09IFwiYW5pbWF0aW9uXCJcbiAgICAgICAgICAgICYmICFHbG9iLkJpZ0NvbmZpZy5kZXYuc2ltdWxhdGVfdmlkZW9fbW9kZSgnRXhwZXJpbWVudC5sZXZlbEludHJvKCknKSApIHtcbiAgICAgICAgICAgIHBsYXlWaWRlbyA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCBsZXZlbENvbGxlY3Rpb24ucHJldmlvdXMgKSB7XG4gICAgICAgICAgICAgICAgcGxheVZpZGVvID0gbGV2ZWxDb2xsZWN0aW9uLnByZXZpb3VzLm5vdGVzICE9PSBsZXZlbENvbGxlY3Rpb24uY3VycmVudC5ub3RlcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGxheVZpZGVvID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBwbGF5VmlkZW8gPSB0cnVlO1xuICAgICAgICBjb25zb2xlLmxvZyh7IHBsYXlWaWRlbyB9KTtcbiAgICAgICAgbGV0IHJhdGU6IG51bWJlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHRlbXA7XG4gICAgICAgIHRlbXAgPSBHbG9iLkJpZ0NvbmZpZy5kZXYuZm9yY2VfcGxheWJhY2tfcmF0ZSgnRXhwZXJpbWVudC5sZXZlbEludHJvKCknKTtcbiAgICAgICAgaWYgKCB0ZW1wICkge1xuICAgICAgICAgICAgcmF0ZSA9IHRlbXA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIGxldmVsQ29sbGVjdGlvbi5jdXJyZW50LnJoeXRobSApIHtcbiAgICAgICAgICAgICAgICByYXRlID0gbGV2ZWxDb2xsZWN0aW9uLmN1cnJlbnQudGVtcG8gLyAxMDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAoIGxldCBpID0gbGV2ZWxDb2xsZWN0aW9uLmN1cnJlbnQuaW5kZXggKyAxOyBpIDwgbGV2ZWxDb2xsZWN0aW9uLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsZXZlbCA9IGxldmVsQ29sbGVjdGlvbi5nZXQoaSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICggbGV2ZWwubm90ZXMgPT09IGxldmVsQ29sbGVjdGlvbi5jdXJyZW50Lm5vdGVzICYmIGxldmVsLnJoeXRobSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdGUgPSBsZXZlbC50ZW1wbyAvIDEwMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgbGV2ZWwgIyR7bGV2ZWxDb2xsZWN0aW9uLmN1cnJlbnQuaW5kZXh9IG5vIHRlbXBvLCB0b29rIHJhdGUgKCR7cmF0ZX0pIGZyb20gbGV2ZWwgIyR7aX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCByYXRlID09PSB1bmRlZmluZWQgKSB7IC8vIEhhdmVuJ3QgZm91bmQgaW4gZm9yXG4gICAgICAgICAgICAgICAgICAgIHJhdGUgPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyh7IHJhdGUgfSk7XG4gICAgICAgIGxldCBub3RlcztcbiAgICAgICAgdGVtcCA9IEdsb2IuQmlnQ29uZmlnLmRldi5mb3JjZV9ub3Rlc19udW1iZXIoJ0V4cGVyaW1lbnQubGV2ZWxJbnRybygpJyk7XG4gICAgICAgIGlmICggdGVtcCApIHtcbiAgICAgICAgICAgIG5vdGVzID0gdGVtcDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vdGVzID0gbGV2ZWxDb2xsZWN0aW9uLmN1cnJlbnQubm90ZXM7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyh7IG5vdGVzIH0pO1xuICAgICAgICBpZiAoIHBsYXlWaWRlbyApIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYXdhaXQgdGhpcy5kaWFsb2cubGV2ZWxJbnRybyhsZXZlbENvbGxlY3Rpb24uY3VycmVudCwgXCJ2aWRlb1wiLCByYXRlKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY2FsbE9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMudmlkZW8ubGV2ZWxJbnRybyhub3RlcywgcmF0ZSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LCB0aGlzLnZpZGVvKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGhpcy5kaWFsb2cubGV2ZWxJbnRybyhsZXZlbENvbGxlY3Rpb24uY3VycmVudCwgXCJhbmltYXRpb25cIiwgcmF0ZSk7XG4gICAgICAgIGF3YWl0IHRoaXMuY2FsbE9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5hbmltYXRpb24ubGV2ZWxJbnRybyhub3RlcywgcmF0ZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSwgdGhpcy5hbmltYXRpb24pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICB9XG4gICAgXG59XG5cbmV4cG9ydCBkZWZhdWx0IEV4cGVyaW1lbnQ7XG4iXX0=