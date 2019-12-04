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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwZXJpbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImV4cGVyaW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBOEI7QUFFOUIsMkNBQW1DO0FBQ25DLHFDQUFrQztBQUNsQyxtQ0FBNEI7QUFDNUIscUNBQThCO0FBTTlCLE1BQU0sVUFBVTtJQU1aLFlBQVksUUFBa0I7UUFIckIsVUFBSyxHQUFVLFNBQVMsQ0FBQztRQUk5QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksbUJBQVMsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNO2FBQ04sWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7YUFDNUIsZUFBZSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUVqQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksZUFBSyxFQUFFO2FBQ25CLFFBQVEsQ0FBQyxjQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUU3QixDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUE0QjtRQUNuQyxPQUFPLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7U0FDbEQsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBaUIsRUFBRSxJQUF1QjtRQUN4RCxNQUFNLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FB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SyxJQUFJLEVBQUc7WUFDUixLQUFLLEdBQUcsSUFBSSxDQUFDO1NBQ2hCO2FBQU07WUFDSCxLQUFLLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7U0FFekM7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN2QixJQUFLLFNBQVMsRUFBRztZQUViLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDckUsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUM5QixNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUU3QyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBR2xCO1FBQ0QsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6RSxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDOUIsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFakQsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUduQixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDdkIsQ0FBQztDQUVKO0FBRUQsa0JBQWUsVUFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERpYWxvZyBmcm9tIFwiLi9kaWFsb2dcIjtcbmltcG9ydCB7IERlbW9UeXBlIH0gZnJvbSBcIi4uLy4uL015U3RvcmVcIjtcbmltcG9ydCBBbmltYXRpb24gZnJvbSAnLi9hbmltYXRpb24nXG5pbXBvcnQgeyB3YWl0IH0gZnJvbSBcIi4uLy4uL3V0aWxcIjtcbmltcG9ydCBWaWRlbyBmcm9tIFwiLi92aWRlb1wiO1xuaW1wb3J0IEdsb2IgZnJvbSBcIi4uLy4uL0dsb2JcIjtcbmltcG9ydCB7IFJlYWRvbmx5VHJ1dGggfSBmcm9tIFwiLi4vLi4vVHJ1dGhcIjtcbmltcG9ydCB7IExldmVsQ29sbGVjdGlvbiB9IGZyb20gXCIuLi8uLi9MZXZlbFwiO1xuaW1wb3J0IHsgSVBhaXJzIH0gZnJvbSBcIi4uLy4uL015UHlTaGVsbFwiO1xuXG5cbmNsYXNzIEV4cGVyaW1lbnQge1xuICAgIHJlYWRvbmx5IGRpYWxvZzogRGlhbG9nO1xuICAgIHJlYWRvbmx5IGFuaW1hdGlvbjogQW5pbWF0aW9uO1xuICAgIHJlYWRvbmx5IHZpZGVvOiBWaWRlbyA9IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGRlbW9UeXBlOiBEZW1vVHlwZTtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihkZW1vVHlwZTogRGVtb1R5cGUpIHtcbiAgICAgICAgdGhpcy5kaWFsb2cgPSBuZXcgRGlhbG9nKGRlbW9UeXBlKTtcbiAgICAgICAgdGhpcy5hbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCk7XG4gICAgICAgIHRoaXMuZGlhbG9nXG4gICAgICAgICAgICAuaW5zZXJ0QmVmb3JlKHRoaXMuYW5pbWF0aW9uKVxuICAgICAgICAgICAgLnNldE9wYWNUcmFuc0R1cigpO1xuICAgICAgICB0aGlzLmFuaW1hdGlvbi5zZXRPcGFjVHJhbnNEdXIoKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMudmlkZW8gPSBuZXcgVmlkZW8oKVxuICAgICAgICAgICAgLmFwcGVuZFRvKEdsb2IuTWFpbkNvbnRlbnQpO1xuICAgICAgICB0aGlzLnZpZGVvLnNldE9wYWNUcmFuc0R1cigpO1xuICAgICAgICB0aGlzLmRlbW9UeXBlID0gZGVtb1R5cGU7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBhc3luYyBpbml0KHJlYWRvbmx5VHJ1dGg6IFJlYWRvbmx5VHJ1dGgpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIHRoaXMudmlkZW8uaW5pdChyZWFkb25seVRydXRoKSxcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uLmluaXQocmVhZG9ubHlUcnV0aC5taWRpLmFic1BhdGgpXG4gICAgICAgIF0pO1xuICAgIH1cbiAgICBcbiAgICBhc3luYyBjYWxsT25DbGljayhmbjogQXN5bmNGdW5jdGlvbiwgZGVtbzogQW5pbWF0aW9uIHwgVmlkZW8pIHtcbiAgICAgICAgY29uc3QgZG9uZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT5cbiAgICAgICAgICAgIEdsb2IuRG9jdW1lbnQub24oe1xuICAgICAgICAgICAgICAgIGNsaWNrIDogYXN5bmMgKGV2OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpYWxvZy5oaWRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBHbG9iLmhpZGUoXCJUaXRsZVwiLCBcIk5hdmlnYXRpb25CdXR0b25zXCIpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIEdsb2IuRG9jdW1lbnQub2ZmKFwiY2xpY2tcIik7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGZuKCk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHdhaXQoMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGRlbW8uaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgYXdhaXQgZGVtby5kaXNwbGF5KCk7XG4gICAgICAgIGF3YWl0IGRvbmU7XG4gICAgICAgIGF3YWl0IEdsb2IuZGlzcGxheShcIlRpdGxlXCIsIFwiTmF2aWdhdGlvbkJ1dHRvbnNcIik7XG4gICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgYXN5bmMgaW50cm8oKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYEV4cGVyaW1lbnQuaW50cm8oKWApO1xuICAgICAgICBhd2FpdCB3YWl0KDApO1xuICAgICAgICBcbiAgICAgICAgYXdhaXQgdGhpcy5kaWFsb2cuaW50cm8oKTtcbiAgICAgICAgXG4gICAgICAgIC8vLyB2aWRlbyAvIGFuaW1hdGlvblxuICAgICAgICBsZXQgZGVtbztcbiAgICAgICAgaWYgKCBHbG9iLkJpZ0NvbmZpZy5kZXYuc2ltdWxhdGVfdmlkZW9fbW9kZSgnRXhwZXJpbWVudC5pbnRybygpJykgKSB7XG4gICAgICAgICAgICBkZW1vID0gdGhpcy52aWRlbztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlbW8gPSB0aGlzW3RoaXMuZGVtb1R5cGVdO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5jYWxsT25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCBkZW1vLmludHJvKCk7XG4gICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgIH0sIGRlbW8pO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgYXN5bmMgbGV2ZWxJbnRybyhsZXZlbENvbGxlY3Rpb246IExldmVsQ29sbGVjdGlvbikge1xuICAgICAgICBjb25zb2xlLmdyb3VwKGBFeHBlcmltZW50LmxldmVsSW50cm8oKWApO1xuICAgICAgICBHbG9iLlRpdGxlLmxldmVsaDMudGV4dChgTGV2ZWwgMS8ke2xldmVsQ29sbGVjdGlvbi5sZW5ndGh9YCk7XG4gICAgICAgIEdsb2IuVGl0bGUudHJpYWxoMy50ZXh0KGBUcmlhbCAxLyR7bGV2ZWxDb2xsZWN0aW9uLmN1cnJlbnQudHJpYWxzfWApO1xuICAgICAgICBsZXQgcGxheVZpZGVvO1xuICAgICAgICBpZiAoIHRoaXMuZGVtb1R5cGUgPT09IFwiYW5pbWF0aW9uXCJcbiAgICAgICAgICAgICYmICFHbG9iLkJpZ0NvbmZpZy5kZXYuc2ltdWxhdGVfdmlkZW9fbW9kZSgnRXhwZXJpbWVudC5sZXZlbEludHJvKCknKSApIHtcbiAgICAgICAgICAgIHBsYXlWaWRlbyA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCBsZXZlbENvbGxlY3Rpb24ucHJldmlvdXMgKSB7XG4gICAgICAgICAgICAgICAgcGxheVZpZGVvID0gbGV2ZWxDb2xsZWN0aW9uLnByZXZpb3VzLm5vdGVzICE9PSBsZXZlbENvbGxlY3Rpb24uY3VycmVudC5ub3RlcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGxheVZpZGVvID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBwbGF5VmlkZW8gPSB0cnVlO1xuICAgICAgICBjb25zb2xlLmxvZyh7IHBsYXlWaWRlbyB9KTtcbiAgICAgICAgbGV0IHJhdGU6IG51bWJlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHRlbXA7XG4gICAgICAgIHRlbXAgPSBHbG9iLkJpZ0NvbmZpZy5kZXYuZm9yY2VfcGxheWJhY2tfcmF0ZSgnRXhwZXJpbWVudC5sZXZlbEludHJvKCknKTtcbiAgICAgICAgaWYgKCB0ZW1wICkge1xuICAgICAgICAgICAgcmF0ZSA9IHRlbXA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIGxldmVsQ29sbGVjdGlvbi5jdXJyZW50LnJoeXRobSApIHtcbiAgICAgICAgICAgICAgICByYXRlID0gbGV2ZWxDb2xsZWN0aW9uLmN1cnJlbnQudGVtcG8gLyAxMDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAoIGxldCBpID0gbGV2ZWxDb2xsZWN0aW9uLmN1cnJlbnQuaW5kZXggKyAxOyBpIDwgbGV2ZWxDb2xsZWN0aW9uLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsZXZlbCA9IGxldmVsQ29sbGVjdGlvbi5nZXQoaSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICggbGV2ZWwubm90ZXMgPT09IGxldmVsQ29sbGVjdGlvbi5jdXJyZW50Lm5vdGVzICYmIGxldmVsLnJoeXRobSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdGUgPSBsZXZlbC50ZW1wbyAvIDEwMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgbGV2ZWwgIyR7bGV2ZWxDb2xsZWN0aW9uLmN1cnJlbnQuaW5kZXh9IG5vIHRlbXBvLCB0b29rIHJhdGUgKCR7cmF0ZX0pIGZyb20gbGV2ZWwgIyR7aX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCByYXRlID09PSB1bmRlZmluZWQgKSB7IC8vIEhhdmVuJ3QgZm91bmQgaW4gZm9yXG4gICAgICAgICAgICAgICAgICAgIHJhdGUgPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyh7IHJhdGUgfSk7XG4gICAgICAgIGxldCBub3RlcztcbiAgICAgICAgdGVtcCA9IEdsb2IuQmlnQ29uZmlnLmRldi5mb3JjZV9ub3Rlc19udW1iZXIoJ0V4cGVyaW1lbnQubGV2ZWxJbnRybygpJyk7XG4gICAgICAgIGlmICggdGVtcCApIHtcbiAgICAgICAgICAgIG5vdGVzID0gdGVtcDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vdGVzID0gbGV2ZWxDb2xsZWN0aW9uLmN1cnJlbnQubm90ZXM7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyh7IG5vdGVzIH0pO1xuICAgICAgICBpZiAoIHBsYXlWaWRlbyApIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYXdhaXQgdGhpcy5kaWFsb2cubGV2ZWxJbnRybyhsZXZlbENvbGxlY3Rpb24uY3VycmVudCwgXCJ2aWRlb1wiLCByYXRlKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY2FsbE9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMudmlkZW8ubGV2ZWxJbnRybyhub3RlcywgcmF0ZSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LCB0aGlzLnZpZGVvKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGhpcy5kaWFsb2cubGV2ZWxJbnRybyhsZXZlbENvbGxlY3Rpb24uY3VycmVudCwgXCJhbmltYXRpb25cIiwgcmF0ZSk7XG4gICAgICAgIGF3YWl0IHRoaXMuY2FsbE9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5hbmltYXRpb24ubGV2ZWxJbnRybyhub3RlcywgcmF0ZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSwgdGhpcy5hbmltYXRpb24pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICB9XG4gICAgXG59XG5cbmV4cG9ydCBkZWZhdWx0IEV4cGVyaW1lbnQ7XG4iXX0=