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
    async levelIntro(notes) {
        console.group(`Video.levelIntro(${notes})`);
        console.groupEnd();
    }
}
exports.default = Video;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlkZW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ2aWRlby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUE0QztBQUM1Qyx5QkFBeUI7QUFDekIscUNBQWtDO0FBRWxDLE1BQU0sS0FBTSxTQUFRLGVBQVM7SUFNekI7UUFDSSxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUcsT0FBTyxFQUFFLEdBQUcsRUFBRyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQWUsRUFBRSxVQUFrQjtRQUMxQyxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDbkMsTUFBTSxHQUFHLEdBQUcsVUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFHLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFHLE9BQU8sRUFBRSxJQUFJLEVBQUcsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWpCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDaEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyQixLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDYixNQUFNLFVBQVUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLENBQUM7UUFDeEUsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sY0FBYyxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ2hGLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNkLFVBQVU7WUFDVixPQUFPO1lBQ1AsY0FBYztTQUNqQixDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7UUFDakUsS0FBSyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztRQUUxQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUdELEtBQUssQ0FBQyxLQUFLO1FBQ1AsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMvQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRXJCLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQzFELE1BQU0sV0FBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0RSxPQUFRLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxFQUFHO1lBQzFCLEtBQUssQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDO1lBQ3JCLE1BQU0sV0FBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN6QjtRQUNELEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDNUIsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRXZCLENBQUM7SUFFRCxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWE7UUFDMUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUM1QyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDdkIsQ0FBQztDQUNKO0FBRUQsa0JBQWUsS0FBSyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZWxlbSwgVmlzdWFsQkhFIH0gZnJvbSBcIi4uLy4uL2JoZVwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgeyB3YWl0IH0gZnJvbSBcIi4uLy4uL3V0aWxcIjtcblxuY2xhc3MgVmlkZW8gZXh0ZW5kcyBWaXN1YWxCSEUge1xuICAgIHByaXZhdGUgZmlyc3RPbnNldDogbnVtYmVyO1xuICAgIHByaXZhdGUgbGFzdE9uc2V0OiBudW1iZXI7XG4gICAgXG4gICAgZTogSFRNTFZpZGVvRWxlbWVudDtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoeyB0YWcgOiAndmlkZW8nLCBjbHMgOiAncGxheWVyJyB9KTtcbiAgICB9XG4gICAgXG4gICAgYXN5bmMgaW5pdChtcDRwYXRoOiBzdHJpbmcsIG9uc2V0c1BhdGg6IHN0cmluZykge1xuICAgICAgICBjb25zb2xlLmdyb3VwKGBWaWRlby5pbml0VmlkZW8oKWApO1xuICAgICAgICBjb25zdCBzcmMgPSBlbGVtKHsgdGFnIDogJ3NvdXJjZScgfSkuYXR0cih7IHNyYyA6IG1wNHBhdGgsIHR5cGUgOiAndmlkZW8vbXA0JyB9KTtcbiAgICAgICAgdGhpcy5hcHBlbmQoc3JjKTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKG9uc2V0c1BhdGgpKTtcbiAgICAgICAgdGhpcy5maXJzdE9uc2V0ID0gcGFyc2VGbG9hdChkYXRhLm9uc2V0c1tkYXRhLmZpcnN0X29uc2V0X2luZGV4XSk7XG4gICAgICAgIHRoaXMubGFzdE9uc2V0ID0gcGFyc2VGbG9hdChkYXRhLm9uc2V0cy5sYXN0KCkpO1xuICAgICAgICBjb25zdCB2aWRlbyA9IHRoaXMuZTtcbiAgICAgICAgdmlkZW8ubG9hZCgpO1xuICAgICAgICBjb25zdCBsb2FkZWRkYXRhID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB2aWRlby5vbmxvYWRlZGRhdGEgPSByZXNvbHZlKTtcbiAgICAgICAgY29uc3QgY2FucGxheSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gdmlkZW8ub25jYW5wbGF5ID0gcmVzb2x2ZSk7XG4gICAgICAgIGNvbnN0IGNhbnBsYXl0aHJvdWdoID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB2aWRlby5vbmNhbnBsYXl0aHJvdWdoID0gcmVzb2x2ZSk7XG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIGxvYWRlZGRhdGEsXG4gICAgICAgICAgICBjYW5wbGF5LFxuICAgICAgICAgICAgY2FucGxheXRocm91Z2hcbiAgICAgICAgXSk7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZygnRG9uZSBhd2FpdGluZyBsb2FkZWRkYXRhLCBjYW5wbGF5LCBjYW5wbGF5dGhyb3VnaCcpO1xuICAgICAgICB2aWRlby5jdXJyZW50VGltZSA9IHRoaXMuZmlyc3RPbnNldCAtIDAuMTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgYXN5bmMgaW50cm8oKSB7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYFZpZGVvLmludHJvKClgKTtcbiAgICAgICAgY29uc3QgdmlkZW8gPSB0aGlzLmU7XG4gICAgICAgIFxuICAgICAgICB2aWRlby5wbGF5KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBQbGF5aW5nLCBjdXJyZW50VGltZTogJHt2aWRlby5jdXJyZW50VGltZX1gKTtcbiAgICAgICAgYXdhaXQgd2FpdCgodGhpcy5sYXN0T25zZXQgLSB2aWRlby5jdXJyZW50VGltZSkgKiAxMDAwICsgMjAwMCwgZmFsc2UpO1xuICAgICAgICB3aGlsZSAoIHZpZGVvLnZvbHVtZSA+IDAuMDUgKSB7XG4gICAgICAgICAgICB2aWRlby52b2x1bWUgLT0gMC4wNTtcbiAgICAgICAgICAgIGF3YWl0IHdhaXQoMTAsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICB2aWRlby52b2x1bWUgPSAwO1xuICAgICAgICB0aGlzLmFsbE9mZigpO1xuICAgICAgICBjb25zb2xlLmxvZygndmlkZW8gZW5kZWQhJyk7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGxldmVsSW50cm8obm90ZXM6IG51bWJlcikge1xuICAgICAgICBjb25zb2xlLmdyb3VwKGBWaWRlby5sZXZlbEludHJvKCR7bm90ZXN9KWApO1xuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWaWRlbztcbiJdfQ==