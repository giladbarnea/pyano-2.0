"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../bhe");
const fs = require("fs");
const util_1 = require("../../util");
class Video extends bhe_1.VisualBHE {
    constructor() {
        super({ tag: 'video', cls: 'player' });
    }
    async init(mp4path, onsetsPath) {
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
        await util_1.wait((this.lastOnset - video.currentTime) * 1000 + 2000, false);
        while (video.volume > 0.05) {
            video.volume -= 0.05;
            await util_1.wait(10, false);
        }
        video.volume = 0;
        this.allOff();
        console.log('video ended!');
        console.groupEnd();
    }
}
exports.default = Video;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlkZW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ2aWRlby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUE0QztBQUM1Qyx5QkFBeUI7QUFDekIscUNBQWtDO0FBRWxDLE1BQU0sS0FBTSxTQUFRLGVBQVM7SUFNekI7UUFDSSxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUcsT0FBTyxFQUFFLEdBQUcsRUFBRyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQWUsRUFBRSxVQUFrQjtRQUMxQyxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDbkMsTUFBTSxHQUFHLEdBQUcsVUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFHLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFHLE9BQU8sRUFBRSxJQUFJLEVBQUcsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWpCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDaEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyQixLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDYixNQUFNLFVBQVUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLENBQUM7UUFDeEUsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sY0FBYyxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ2hGLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNkLFVBQVU7WUFDVixPQUFPO1lBQ1AsY0FBYztTQUNqQixDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7UUFDakUsS0FBSyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztRQUUxQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUdELEtBQUssQ0FBQyxLQUFLO1FBQ1AsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMvQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRXJCLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQzFELE1BQU0sV0FBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0RSxPQUFRLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxFQUFHO1lBQzFCLEtBQUssQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDO1lBQ3JCLE1BQU0sV0FBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN6QjtRQUNELEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDNUIsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRXZCLENBQUM7Q0FDSjtBQUVELGtCQUFlLEtBQUssQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGVsZW0sIFZpc3VhbEJIRSB9IGZyb20gXCIuLi8uLi9iaGVcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgd2FpdCB9IGZyb20gXCIuLi8uLi91dGlsXCI7XG5cbmNsYXNzIFZpZGVvIGV4dGVuZHMgVmlzdWFsQkhFIHtcbiAgICBwcml2YXRlIGZpcnN0T25zZXQ6IG51bWJlcjtcbiAgICBwcml2YXRlIGxhc3RPbnNldDogbnVtYmVyO1xuICAgIFxuICAgIGU6IEhUTUxWaWRlb0VsZW1lbnQ7XG4gICAgXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKHsgdGFnIDogJ3ZpZGVvJywgY2xzIDogJ3BsYXllcicgfSk7XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGluaXQobXA0cGF0aDogc3RyaW5nLCBvbnNldHNQYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc29sZS5ncm91cChgVmlkZW8uaW5pdFZpZGVvKClgKTtcbiAgICAgICAgY29uc3Qgc3JjID0gZWxlbSh7IHRhZyA6ICdzb3VyY2UnIH0pLmF0dHIoeyBzcmMgOiBtcDRwYXRoLCB0eXBlIDogJ3ZpZGVvL21wNCcgfSk7XG4gICAgICAgIHRoaXMuYXBwZW5kKHNyYyk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhvbnNldHNQYXRoKSk7XG4gICAgICAgIHRoaXMuZmlyc3RPbnNldCA9IHBhcnNlRmxvYXQoZGF0YS5vbnNldHNbZGF0YS5maXJzdF9vbnNldF9pbmRleF0pO1xuICAgICAgICB0aGlzLmxhc3RPbnNldCA9IHBhcnNlRmxvYXQoZGF0YS5vbnNldHMubGFzdCgpKTtcbiAgICAgICAgY29uc3QgdmlkZW8gPSB0aGlzLmU7XG4gICAgICAgIHZpZGVvLmxvYWQoKTtcbiAgICAgICAgY29uc3QgbG9hZGVkZGF0YSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gdmlkZW8ub25sb2FkZWRkYXRhID0gcmVzb2x2ZSk7XG4gICAgICAgIGNvbnN0IGNhbnBsYXkgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHZpZGVvLm9uY2FucGxheSA9IHJlc29sdmUpO1xuICAgICAgICBjb25zdCBjYW5wbGF5dGhyb3VnaCA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gdmlkZW8ub25jYW5wbGF5dGhyb3VnaCA9IHJlc29sdmUpO1xuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICBsb2FkZWRkYXRhLFxuICAgICAgICAgICAgY2FucGxheSxcbiAgICAgICAgICAgIGNhbnBsYXl0aHJvdWdoXG4gICAgICAgIF0pO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coJ0RvbmUgYXdhaXRpbmcgbG9hZGVkZGF0YSwgY2FucGxheSwgY2FucGxheXRocm91Z2gnKTtcbiAgICAgICAgdmlkZW8uY3VycmVudFRpbWUgPSB0aGlzLmZpcnN0T25zZXQgLSAwLjE7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGFzeW5jIGludHJvKCkge1xuICAgICAgICBjb25zb2xlLmdyb3VwKGBWaWRlby5pbnRybygpYCk7XG4gICAgICAgIGNvbnN0IHZpZGVvID0gdGhpcy5lO1xuICAgICAgICBcbiAgICAgICAgdmlkZW8ucGxheSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhgUGxheWluZywgY3VycmVudFRpbWU6ICR7dmlkZW8uY3VycmVudFRpbWV9YCk7XG4gICAgICAgIGF3YWl0IHdhaXQoKHRoaXMubGFzdE9uc2V0IC0gdmlkZW8uY3VycmVudFRpbWUpICogMTAwMCArIDIwMDAsIGZhbHNlKTtcbiAgICAgICAgd2hpbGUgKCB2aWRlby52b2x1bWUgPiAwLjA1ICkge1xuICAgICAgICAgICAgdmlkZW8udm9sdW1lIC09IDAuMDU7XG4gICAgICAgICAgICBhd2FpdCB3YWl0KDEwLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmlkZW8udm9sdW1lID0gMDtcbiAgICAgICAgdGhpcy5hbGxPZmYoKTtcbiAgICAgICAgY29uc29sZS5sb2coJ3ZpZGVvIGVuZGVkIScpO1xuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgIFxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVmlkZW87XG4iXX0=