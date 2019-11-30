"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../bhe");
const fs = require("fs");
const util_1 = require("../../util");
class Video extends bhe_1.BetterHTMLElement {
    constructor() {
        super({ tag: 'video' });
    }
    async initVideo(mp4path, onsetsPath) {
        console.group(`Video.initVideo()`);
        const src = bhe_1.elem({ tag: 'source' }).attr({ src: mp4path, type: 'video/mp4' });
        this.append(src);
        let data = JSON.parse(fs.readFileSync(onsetsPath));
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
        video.currentTime = this.firstOnset - 0.1;
        console.groupEnd();
    }
    async intro() {
        console.group(`Video.intro()`);
        const video = this.e;
        video.play();
        console.log(`Playing, currentTime: ${video.currentTime}`);
        await util_1.wait((this.lastOnset - video.currentTime) * 1000 + 500, false);
        while (video.volume > 0.05) {
            video.volume -= 0.05;
            await util_1.wait(10, false);
        }
        video.volume = 0;
        console.log('video ended!');
        console.groupEnd();
    }
}
exports.default = Video;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlkZW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ2aWRlby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFvRDtBQUNwRCx5QkFBeUI7QUFDekIscUNBQWtDO0FBRWxDLE1BQU0sS0FBTSxTQUFRLHVCQUFpQjtJQU1qQztRQUNJLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQzVCLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQWUsRUFBRSxVQUFrQjtRQUMvQyxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDbkMsTUFBTSxHQUFHLEdBQUcsVUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFHLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFHLE9BQU8sRUFBRSxJQUFJLEVBQUcsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWpCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDaEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyQixLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDYixNQUFNLFVBQVUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLENBQUM7UUFDeEUsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sY0FBYyxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ2hGLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNkLFVBQVU7WUFDVixPQUFPO1lBQ1AsY0FBYztTQUNqQixDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7UUFDakUsS0FBSyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztRQUUxQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLO1FBQ1AsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMvQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRXJCLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQzFELE1BQU0sV0FBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRSxPQUFRLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxFQUFHO1lBQzFCLEtBQUssQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDO1lBQ3JCLE1BQU0sV0FBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN6QjtRQUNELEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBRWpCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDNUIsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRXZCLENBQUM7Q0FDSjtBQUVELGtCQUFlLEtBQUssQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJldHRlckhUTUxFbGVtZW50LCBlbGVtIH0gZnJvbSBcIi4uLy4uL2JoZVwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgeyB3YWl0IH0gZnJvbSBcIi4uLy4uL3V0aWxcIjtcblxuY2xhc3MgVmlkZW8gZXh0ZW5kcyBCZXR0ZXJIVE1MRWxlbWVudCB7XG4gICAgcHJpdmF0ZSBmaXJzdE9uc2V0OiBudW1iZXI7XG4gICAgcHJpdmF0ZSBsYXN0T25zZXQ6IG51bWJlcjtcbiAgICBcbiAgICBlOiBIVE1MVmlkZW9FbGVtZW50O1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcih7IHRhZyA6ICd2aWRlbycgfSlcbiAgICB9XG4gICAgXG4gICAgYXN5bmMgaW5pdFZpZGVvKG1wNHBhdGg6IHN0cmluZywgb25zZXRzUGF0aDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYFZpZGVvLmluaXRWaWRlbygpYCk7XG4gICAgICAgIGNvbnN0IHNyYyA9IGVsZW0oeyB0YWcgOiAnc291cmNlJyB9KS5hdHRyKHsgc3JjIDogbXA0cGF0aCwgdHlwZSA6ICd2aWRlby9tcDQnIH0pO1xuICAgICAgICB0aGlzLmFwcGVuZChzcmMpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMob25zZXRzUGF0aCkpO1xuICAgICAgICB0aGlzLmZpcnN0T25zZXQgPSBwYXJzZUZsb2F0KGRhdGEub25zZXRzW2RhdGEuZmlyc3Rfb25zZXRfaW5kZXhdKTtcbiAgICAgICAgdGhpcy5sYXN0T25zZXQgPSBwYXJzZUZsb2F0KGRhdGEub25zZXRzLmxhc3QoKSk7XG4gICAgICAgIGNvbnN0IHZpZGVvID0gdGhpcy5lO1xuICAgICAgICB2aWRlby5sb2FkKCk7XG4gICAgICAgIGNvbnN0IGxvYWRlZGRhdGEgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHZpZGVvLm9ubG9hZGVkZGF0YSA9IHJlc29sdmUpO1xuICAgICAgICBjb25zdCBjYW5wbGF5ID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB2aWRlby5vbmNhbnBsYXkgPSByZXNvbHZlKTtcbiAgICAgICAgY29uc3QgY2FucGxheXRocm91Z2ggPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHZpZGVvLm9uY2FucGxheXRocm91Z2ggPSByZXNvbHZlKTtcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgbG9hZGVkZGF0YSxcbiAgICAgICAgICAgIGNhbnBsYXksXG4gICAgICAgICAgICBjYW5wbGF5dGhyb3VnaFxuICAgICAgICBdKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKCdEb25lIGF3YWl0aW5nIGxvYWRlZGRhdGEsIGNhbnBsYXksIGNhbnBsYXl0aHJvdWdoJyk7XG4gICAgICAgIHZpZGVvLmN1cnJlbnRUaW1lID0gdGhpcy5maXJzdE9uc2V0IC0gMC4xO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgIH1cbiAgICBcbiAgICBhc3luYyBpbnRybygpIHtcbiAgICAgICAgY29uc29sZS5ncm91cChgVmlkZW8uaW50cm8oKWApO1xuICAgICAgICBjb25zdCB2aWRlbyA9IHRoaXMuZTtcbiAgICAgICAgXG4gICAgICAgIHZpZGVvLnBsYXkoKTtcbiAgICAgICAgY29uc29sZS5sb2coYFBsYXlpbmcsIGN1cnJlbnRUaW1lOiAke3ZpZGVvLmN1cnJlbnRUaW1lfWApO1xuICAgICAgICBhd2FpdCB3YWl0KCh0aGlzLmxhc3RPbnNldCAtIHZpZGVvLmN1cnJlbnRUaW1lKSAqIDEwMDAgKyA1MDAsIGZhbHNlKTtcbiAgICAgICAgd2hpbGUgKCB2aWRlby52b2x1bWUgPiAwLjA1ICkge1xuICAgICAgICAgICAgdmlkZW8udm9sdW1lIC09IDAuMDU7XG4gICAgICAgICAgICBhd2FpdCB3YWl0KDEwLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmlkZW8udm9sdW1lID0gMDtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKCd2aWRlbyBlbmRlZCEnKTtcbiAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICBcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFZpZGVvO1xuIl19