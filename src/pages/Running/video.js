"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../bhe");
const fs = require("fs");
const util_1 = require("../../util");
const MyPyShell_1 = require("../../MyPyShell");
const extra_js_1 = require("../../bhe/extra.js");
class Video extends extra_js_1.VisualBHE {
    constructor() {
        super({ tag: 'video', cls: 'player' });
    }
    async init(readonlyTruth) {
        console.group(`Video.init()`);
        const src = bhe_1.elem({ tag: 'source' }).attr({ src: readonlyTruth.mp4.absPath, type: 'video/mp4' });
        this.append(src);
        let data = JSON.parse(fs.readFileSync(readonlyTruth.onsets.absPath));
        this.firstOnset = parseFloat(data.onsets[data.first_onset_index]);
        this.lastOnset = parseFloat(data.onsets.last());
        const video = this.e;
        video.load();
        const loadeddata = new Promise(resolve => video.onloadeddata = resolve);
        const canplay = new Promise(resolve => video.oncanplay = resolve);
        const canplaythrough = new Promise(resolve => video.oncanplaythrough = resolve);
        await Promise.all([
            loadeddata,
            canplay,
            canplaythrough
        ]);
        console.log('Done awaiting loadeddata, canplay, canplaythrough');
        this.resetCurrentTime();
        console.time(`PY_getOnOffPairs`);
        const PY_getOnOffPairs = new MyPyShell_1.MyPyShell('-m txt.get_on_off_pairs', {
            mode: "json",
            args: [readonlyTruth.name]
        });
        const { pairs } = await PY_getOnOffPairs.runAsync();
        console.timeEnd(`PY_getOnOffPairs`);
        console.log({ pairs });
        this.onOffPairs = pairs;
        console.groupEnd();
    }
    resetCurrentTime() {
        this.e.currentTime = this.firstOnset - 0.1;
    }
    getDuration(notes, rate) {
        const [__, last_off] = this.onOffPairs[notes - 1];
        const [first_on, _] = this.onOffPairs[0];
        const duration = last_off.time - first_on.time;
        return duration / rate;
    }
    async play(notes, rate) {
        const video = this.e;
        let duration;
        if (notes && rate) {
            duration = this.getDuration(notes, rate);
        }
        else {
            duration = this.lastOnset - video.currentTime + 3;
        }
        if (rate) {
            video.playbackRate = rate;
        }
        video.volume = 1;
        video.play();
        const { volume, playbackRate, currentTime, paused } = video;
        console.log(`Playing, `, { notes, rate, volume, playbackRate, currentTime, paused, duration });
        await util_1.wait(duration * 1000 - 200, false);
        while (video.volume > 0.05) {
            video.volume -= 0.05;
            await util_1.wait(10, false);
        }
        video.volume = 0;
        video.pause();
        this.allOff();
        console.log('video ended!');
    }
    async intro() {
        console.group(`Video.intro()`);
        await this.play();
        console.groupEnd();
    }
    async levelIntro(notes, rate) {
        console.group(`Video.levelIntro(notes:${notes}, rate:${rate})`);
        await this.play(notes, rate);
        console.groupEnd();
    }
    async hide() {
        await super.hide();
        this.resetCurrentTime();
    }
}
exports.default = Video;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlkZW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ2aWRlby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFpQztBQUNqQyx5QkFBeUI7QUFDekIscUNBQWtDO0FBQ2xDLCtDQUFvRDtBQUVwRCxpREFBK0M7QUFFL0MsTUFBTSxLQUFNLFNBQVEsb0JBQVM7SUFNekI7UUFDSSxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUcsT0FBTyxFQUFFLEdBQUcsRUFBRyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQTRCO1FBQ25DLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDOUIsTUFBTSxHQUFHLEdBQUcsVUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFHLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQ25HLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFakIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckIsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2IsTUFBTSxVQUFVLEdBQUcsSUFBSSxP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QUMsUUFBUSxHQUFHLElBQUksR0FBRyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekMsT0FBUSxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksRUFBRztZQUMxQixLQUFLLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQztZQUNyQixNQUFNLFdBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDekI7UUFDRCxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNqQixLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDZCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSztRQUNQLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDL0IsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFjbEIsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRXZCLENBQUM7SUFHRCxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWEsRUFBRSxJQUFZO1FBQ3hDLE9BQU8sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLEtBQUssVUFBVSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2hFLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFpQjdCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDTixNQUFNLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUM1QixDQUFDO0NBQ0o7QUFFRCxrQkFBZSxLQUFLLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBlbGVtIH0gZnJvbSBcIi4uLy4uL2JoZVwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgeyB3YWl0IH0gZnJvbSBcIi4uLy4uL3V0aWxcIjtcbmltcG9ydCB7IElQYWlycywgTXlQeVNoZWxsIH0gZnJvbSBcIi4uLy4uL015UHlTaGVsbFwiO1xuaW1wb3J0IHsgUmVhZG9ubHlUcnV0aCB9IGZyb20gXCIuLi8uLi9UcnV0aFwiO1xuaW1wb3J0IHsgVmlzdWFsQkhFIH0gZnJvbSBcIi4uLy4uL2JoZS9leHRyYS5qc1wiO1xuXG5jbGFzcyBWaWRlbyBleHRlbmRzIFZpc3VhbEJIRSB7XG4gICAgcHJpdmF0ZSBmaXJzdE9uc2V0OiBudW1iZXI7XG4gICAgcHJpdmF0ZSBsYXN0T25zZXQ6IG51bWJlcjtcbiAgICBwcml2YXRlIG9uT2ZmUGFpcnM6IElQYWlycztcbiAgICBlOiBIVE1MVmlkZW9FbGVtZW50O1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcih7IHRhZyA6ICd2aWRlbycsIGNscyA6ICdwbGF5ZXInIH0pO1xuICAgIH1cbiAgICBcbiAgICBhc3luYyBpbml0KHJlYWRvbmx5VHJ1dGg6IFJlYWRvbmx5VHJ1dGgpIHtcbiAgICAgICAgY29uc29sZS5ncm91cChgVmlkZW8uaW5pdCgpYCk7XG4gICAgICAgIGNvbnN0IHNyYyA9IGVsZW0oeyB0YWcgOiAnc291cmNlJyB9KS5hdHRyKHsgc3JjIDogcmVhZG9ubHlUcnV0aC5tcDQuYWJzUGF0aCwgdHlwZSA6ICd2aWRlby9tcDQnIH0pO1xuICAgICAgICB0aGlzLmFwcGVuZChzcmMpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocmVhZG9ubHlUcnV0aC5vbnNldHMuYWJzUGF0aCkpO1xuICAgICAgICB0aGlzLmZpcnN0T25zZXQgPSBwYXJzZUZsb2F0KGRhdGEub25zZXRzW2RhdGEuZmlyc3Rfb25zZXRfaW5kZXhdKTtcbiAgICAgICAgdGhpcy5sYXN0T25zZXQgPSBwYXJzZUZsb2F0KGRhdGEub25zZXRzLmxhc3QoKSk7XG4gICAgICAgIGNvbnN0IHZpZGVvID0gdGhpcy5lO1xuICAgICAgICB2aWRlby5sb2FkKCk7XG4gICAgICAgIGNvbnN0IGxvYWRlZGRhdGEgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHZpZGVvLm9ubG9hZGVkZGF0YSA9IHJlc29sdmUpO1xuICAgICAgICBjb25zdCBjYW5wbGF5ID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB2aWRlby5vbmNhbnBsYXkgPSByZXNvbHZlKTtcbiAgICAgICAgY29uc3QgY2FucGxheXRocm91Z2ggPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHZpZGVvLm9uY2FucGxheXRocm91Z2ggPSByZXNvbHZlKTtcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgbG9hZGVkZGF0YSxcbiAgICAgICAgICAgIGNhbnBsYXksXG4gICAgICAgICAgICBjYW5wbGF5dGhyb3VnaFxuICAgICAgICBdKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKCdEb25lIGF3YWl0aW5nIGxvYWRlZGRhdGEsIGNhbnBsYXksIGNhbnBsYXl0aHJvdWdoJyk7XG4gICAgICAgIHRoaXMucmVzZXRDdXJyZW50VGltZSgpO1xuICAgICAgICAvLyB2aWRlby5jdXJyZW50VGltZSA9IHRoaXMuZmlyc3RPbnNldCAtIDAuMTtcbiAgICAgICAgY29uc29sZS50aW1lKGBQWV9nZXRPbk9mZlBhaXJzYCk7XG4gICAgICAgIGNvbnN0IFBZX2dldE9uT2ZmUGFpcnMgPSBuZXcgTXlQeVNoZWxsKCctbSB0eHQuZ2V0X29uX29mZl9wYWlycycsIHtcbiAgICAgICAgICAgIG1vZGUgOiBcImpzb25cIixcbiAgICAgICAgICAgIGFyZ3MgOiBbIHJlYWRvbmx5VHJ1dGgubmFtZSBdXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB7IHBhaXJzIH0gPSBhd2FpdCBQWV9nZXRPbk9mZlBhaXJzLnJ1bkFzeW5jPElQYWlycz4oKTtcbiAgICAgICAgY29uc29sZS50aW1lRW5kKGBQWV9nZXRPbk9mZlBhaXJzYCk7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgcGFpcnMgfSk7XG4gICAgICAgIHRoaXMub25PZmZQYWlycyA9IHBhaXJzO1xuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgcmVzZXRDdXJyZW50VGltZSgpIHtcbiAgICAgICAgdGhpcy5lLmN1cnJlbnRUaW1lID0gdGhpcy5maXJzdE9uc2V0IC0gMC4xO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGdldER1cmF0aW9uKG5vdGVzOiBudW1iZXIsIHJhdGU6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IFsgX18sIGxhc3Rfb2ZmIF0gPSB0aGlzLm9uT2ZmUGFpcnNbbm90ZXMgLSAxXTtcbiAgICAgICAgY29uc3QgWyBmaXJzdF9vbiwgXyBdID0gdGhpcy5vbk9mZlBhaXJzWzBdO1xuICAgICAgICBjb25zdCBkdXJhdGlvbiA9IGxhc3Rfb2ZmLnRpbWUgLSBmaXJzdF9vbi50aW1lO1xuICAgICAgICByZXR1cm4gZHVyYXRpb24gLyByYXRlO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGFzeW5jIHBsYXkobm90ZXM/OiBudW1iZXIsIHJhdGU/OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgdmlkZW8gPSB0aGlzLmU7XG4gICAgICAgIGxldCBkdXJhdGlvbjtcbiAgICAgICAgaWYgKCBub3RlcyAmJiByYXRlICkge1xuICAgICAgICAgICAgZHVyYXRpb24gPSB0aGlzLmdldER1cmF0aW9uKG5vdGVzLCByYXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGR1cmF0aW9uID0gdGhpcy5sYXN0T25zZXQgLSB2aWRlby5jdXJyZW50VGltZSArIDM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCByYXRlICkge1xuICAgICAgICAgICAgdmlkZW8ucGxheWJhY2tSYXRlID0gcmF0ZTtcbiAgICAgICAgfVxuICAgICAgICB2aWRlby52b2x1bWUgPSAxO1xuICAgICAgICB2aWRlby5wbGF5KCk7XG4gICAgICAgIGNvbnN0IHsgdm9sdW1lLCBwbGF5YmFja1JhdGUsIGN1cnJlbnRUaW1lLCBwYXVzZWQgfSA9IHZpZGVvO1xuICAgICAgICBjb25zb2xlLmxvZyhgUGxheWluZywgYCwgeyBub3RlcywgcmF0ZSwgdm9sdW1lLCBwbGF5YmFja1JhdGUsIGN1cnJlbnRUaW1lLCBwYXVzZWQsIGR1cmF0aW9uIH0pO1xuICAgICAgICBhd2FpdCB3YWl0KGR1cmF0aW9uICogMTAwMCAtIDIwMCwgZmFsc2UpOyAvLy8gRmFkZW91dCA9PSAyMDBtc1xuICAgICAgICB3aGlsZSAoIHZpZGVvLnZvbHVtZSA+IDAuMDUgKSB7XG4gICAgICAgICAgICB2aWRlby52b2x1bWUgLT0gMC4wNTtcbiAgICAgICAgICAgIGF3YWl0IHdhaXQoMTAsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICB2aWRlby52b2x1bWUgPSAwO1xuICAgICAgICB2aWRlby5wYXVzZSgpO1xuICAgICAgICB0aGlzLmFsbE9mZigpO1xuICAgICAgICBjb25zb2xlLmxvZygndmlkZW8gZW5kZWQhJyk7XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGludHJvKCkge1xuICAgICAgICBjb25zb2xlLmdyb3VwKGBWaWRlby5pbnRybygpYCk7XG4gICAgICAgIGF3YWl0IHRoaXMucGxheSgpO1xuICAgICAgICAvKmNvbnN0IHZpZGVvID0gdGhpcy5lO1xuICAgICAgICAgY29uc3QgZHVyYXRpb24gPSB0aGlzLmxhc3RPbnNldCAtIHZpZGVvLmN1cnJlbnRUaW1lO1xuICAgICAgICAgdmlkZW8ucGxheSgpO1xuICAgICAgICAgY29uc29sZS5sb2coYFBsYXlpbmcsIGN1cnJlbnRUaW1lOiAke3ZpZGVvLmN1cnJlbnRUaW1lfWApO1xuICAgICAgICAgYXdhaXQgd2FpdChkdXJhdGlvbiAqIDEwMDAgKyAyMDAwLCBmYWxzZSk7XG4gICAgICAgICB3aGlsZSAoIHZpZGVvLnZvbHVtZSA+IDAuMDUgKSB7XG4gICAgICAgICB2aWRlby52b2x1bWUgLT0gMC4wNTtcbiAgICAgICAgIGF3YWl0IHdhaXQoMTAsIGZhbHNlKTtcbiAgICAgICAgIH1cbiAgICAgICAgIHZpZGVvLnZvbHVtZSA9IDA7XG4gICAgICAgICB2aWRlby5wYXVzZSgpO1xuICAgICAgICAgdGhpcy5hbGxPZmYoKTtcbiAgICAgICAgIGNvbnNvbGUubG9nKCd2aWRlbyBlbmRlZCEnKTsqL1xuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBhc3luYyBsZXZlbEludHJvKG5vdGVzOiBudW1iZXIsIHJhdGU6IG51bWJlcikge1xuICAgICAgICBjb25zb2xlLmdyb3VwKGBWaWRlby5sZXZlbEludHJvKG5vdGVzOiR7bm90ZXN9LCByYXRlOiR7cmF0ZX0pYCk7XG4gICAgICAgIGF3YWl0IHRoaXMucGxheShub3RlcywgcmF0ZSk7XG4gICAgICAgIC8qY29uc3QgdmlkZW8gPSB0aGlzLmU7XG4gICAgICAgICBjb25zdCBkdXJhdGlvbiA9IHRoaXMuZ2V0RHVyYXRpb24obm90ZXMsIHJhdGUpO1xuICAgICAgICAgdmlkZW8ucGxheWJhY2tSYXRlID0gcmF0ZTtcbiAgICAgICAgIHZpZGVvLnZvbHVtZSA9IDE7XG4gICAgICAgICB2aWRlby5wbGF5KCk7XG4gICAgICAgICBjb25zdCB7IHZvbHVtZSwgcGxheWJhY2tSYXRlLCBjdXJyZW50VGltZSwgcGF1c2VkLCByZWFkeVN0YXRlIH0gPSB2aWRlbztcbiAgICAgICAgIGNvbnNvbGUubG9nKGBQbGF5aW5nLCBgLCB7IHZvbHVtZSwgcGxheWJhY2tSYXRlLCBjdXJyZW50VGltZSwgcGF1c2VkLCByZWFkeVN0YXRlLCBkdXJhdGlvbiB9KTtcbiAgICAgICAgIGF3YWl0IHdhaXQoZHVyYXRpb24gKiAxMDAwIC0gMjAwLCBmYWxzZSk7IC8vLyBGYWRlb3V0ID09IDIwMG1zXG4gICAgICAgICB3aGlsZSAoIHZpZGVvLnZvbHVtZSA+IDAuMDUgKSB7XG4gICAgICAgICB2aWRlby52b2x1bWUgLT0gMC4wNTtcbiAgICAgICAgIGF3YWl0IHdhaXQoMTAsIGZhbHNlKTtcbiAgICAgICAgIH1cbiAgICAgICAgIHZpZGVvLnZvbHVtZSA9IDA7XG4gICAgICAgICB2aWRlby5wYXVzZSgpO1xuICAgICAgICAgdGhpcy5hbGxPZmYoKTtcbiAgICAgICAgIGNvbnNvbGUubG9nKCd2aWRlbyBlbmRlZCEnKTsqL1xuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGhpZGUoKSB7XG4gICAgICAgIGF3YWl0IHN1cGVyLmhpZGUoKTtcbiAgICAgICAgdGhpcy5yZXNldEN1cnJlbnRUaW1lKCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWaWRlbztcbiJdfQ==