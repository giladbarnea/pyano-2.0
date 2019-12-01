"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Glob_1 = require("../../Glob");
const util = require("../../util");
const sidebar_1 = require("../sidebar");
const sections_1 = require("./sections");
const bhe_1 = require("../../bhe");
const MyAlert_1 = require("../../MyAlert");
const path = require("path");
const electron_1 = require("electron");
async function load(reload) {
    Glob_1.default.BigConfig.last_page = "new";
    if (reload) {
        return util.reloadPage();
    }
    sidebar_1.default.select("new", { changeTitle: true });
    const startButton = bhe_1.button({ cls: 'active', html: 'Start Experiment', id: 'start_experiment_button' })
        .click(async () => {
        const subconfig = Glob_1.default.BigConfig.getSubconfig();
        let action = await MyAlert_1.default.big.threeButtons({
            title: `Please make sure that the loaded config, "${subconfig.name}", is fine. Subject name, experiment type etc.`,
            confirmButtonText: `It's ok, start experiment`,
            thirdButtonText: 'Open configs directory in file browser'
        });
        switch (action) {
            case "cancel":
                return;
            case "confirm":
                return startIfReady(subconfig);
            case "third":
                return electron_1.remote.shell.showItemInFolder(path.join(CONFIGS_PATH_ABS, subconfig.name));
        }
    });
    Glob_1.default.MainContent.append(sections_1.default.settings, startButton);
}
exports.load = load;
async function startIfReady(subconfig) {
    const missingTxts = subconfig.truth.txt.getMissing();
    if (util.bool(missingTxts)) {
        return MyAlert_1.default.big.oneButton(`The truth: "${subconfig.truth.name}" is missing the following txt files:`, { text: missingTxts.join(', ') });
    }
    if (!subconfig.truth.midi.exists()) {
        if (!Glob_1.default.BigConfig.dev.skip_midi_exists_check()) {
            return MyAlert_1.default.big.oneButton(`The truth: "${subconfig.truth.name}" is missing a midi file`);
        }
    }
    if (subconfig.demo_type === "video") {
        const mp4Exists = subconfig.truth.mp4.exists();
        const onsetsExists = subconfig.truth.onsets.exists();
        if (!util.all(mp4Exists, onsetsExists)) {
            const missingNames = [];
            if (!mp4Exists)
                missingNames.push("mp4");
            if (!onsetsExists)
                missingNames.push("onsets");
            return MyAlert_1.default.big.oneButton(`The truth: "${subconfig.truth.name}" is missing the following files:`, {
                text: missingNames.join(', ')
            });
        }
    }
    return require('../Running').load(true);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHFDQUE4QjtBQUM5QixtQ0FBa0M7QUFDbEMsd0NBQWlDO0FBQ2pDLHlDQUFpQztBQUNqQyxtQ0FBbUM7QUFDbkMsMkNBQW1DO0FBQ25DLDZCQUE2QjtBQUM3Qix1Q0FBa0M7QUFLbEMsS0FBSyxVQUFVLElBQUksQ0FBQyxNQUFlO0lBRS9CLGNBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUNqQyxJQUFLLE1BQU0sRUFBRztRQUNWLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQzVCO0lBQ0QsaUJBQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFHLElBQUksRUFBRSxDQUFDLENBQUM7SUFDOUMsTUFBTSxXQUFXLEdBQUcsWUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFHLFFBQVEsRUFBRSxJQUFJLEVBQUcsa0JBQWtCLEVBQUUsRUFBRSxFQUFHLHlCQUF5QixFQUFFLENBQUM7U0FDcEcsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFO1FBRWQsTUFBTSxTQUFTLEdBQUcsY0FBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNoRCxJQUFJLE1BQU0sR0FBRyxNQUFNLGlCQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztZQUN4QyxLQUFLLEVBQUcsNkNBQTZDLFNBQVMsQ0FBQyxJQUFJLGdEQUFnRDtZQUNuSCxpQkFBaUIsRUFBRywyQkFBMkI7WUFDL0MsZUFBZSxFQUFHLHdDQUF3QztTQUM3RCxDQUFDLENBQUM7UUFDSCxRQUFTLE1BQU0sRUFBRztZQUNkLEtBQUssUUFBUTtnQkFDVCxPQUFPO1lBQ1gsS0FBSyxTQUFTO2dCQUNWLE9BQU8sWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ25DLEtBQUssT0FBTztnQkFDUixPQUFPLGlCQUFNLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDekY7SUFHTCxDQUFDLENBQUMsQ0FBQztJQUNQLGNBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUVuQixrQkFBUSxDQUFDLFFBQVEsRUFDakIsV0FBVyxDQUNkLENBQUM7QUFHTixDQUFDO0FBa0NRLG9CQUFJO0FBaENiLEtBQUssVUFBVSxZQUFZLENBQUMsU0FBb0I7SUFDNUMsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7SUFFckQsSUFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFHO1FBQzFCLE9BQU8saUJBQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLHVDQUF1QyxFQUFFLEVBQUUsSUFBSSxFQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0tBQzlJO0lBRUQsSUFBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFHO1FBQ2xDLElBQUssQ0FBQyxjQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxFQUFHO1lBQ2hELE9BQU8saUJBQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLDBCQUEwQixDQUFDLENBQUE7U0FDOUY7S0FDSjtJQUVELElBQUssU0FBUyxDQUFDLFNBQVMsS0FBSyxPQUFPLEVBQUc7UUFDbkMsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDL0MsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDckQsSUFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxFQUFHO1lBQ3RDLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztZQUN4QixJQUFLLENBQUMsU0FBUztnQkFDWCxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdCLElBQUssQ0FBQyxZQUFZO2dCQUNkLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFaEMsT0FBTyxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsZUFBZSxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksbUNBQW1DLEVBQUU7Z0JBQ2pHLElBQUksRUFBRyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUNqQyxDQUFDLENBQUE7U0FDTDtLQUNKO0lBRUQsT0FBTyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKippbXBvcnQgbmV3UGFnZSBmcm9tIFwiLi9OZXdcIjsqL1xuaW1wb3J0IEdsb2IgZnJvbSBcIi4uLy4uL0dsb2JcIjtcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi4vLi4vdXRpbCdcbmltcG9ydCBzaWRlYmFyIGZyb20gXCIuLi9zaWRlYmFyXCI7XG5pbXBvcnQgc2VjdGlvbnMgZnJvbSBcIi4vc2VjdGlvbnNcIlxuaW1wb3J0IHsgYnV0dG9uIH0gZnJvbSBcIi4uLy4uL2JoZVwiO1xuaW1wb3J0IE15QWxlcnQgZnJvbSAnLi4vLi4vTXlBbGVydCdcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IHJlbW90ZSB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7IFN1YmNvbmZpZyB9IGZyb20gXCIuLi8uLi9NeVN0b3JlXCI7XG5cbi8vIGltcG9ydCAqIGFzIHJ1bm5pbmdQYWdlIGZyb20gXCIuLi9SdW5uaW5nXCJcblxuYXN5bmMgZnVuY3Rpb24gbG9hZChyZWxvYWQ6IGJvb2xlYW4pIHtcbiAgICBcbiAgICBHbG9iLkJpZ0NvbmZpZy5sYXN0X3BhZ2UgPSBcIm5ld1wiO1xuICAgIGlmICggcmVsb2FkICkge1xuICAgICAgICByZXR1cm4gdXRpbC5yZWxvYWRQYWdlKCk7XG4gICAgfVxuICAgIHNpZGViYXIuc2VsZWN0KFwibmV3XCIsIHsgY2hhbmdlVGl0bGUgOiB0cnVlIH0pO1xuICAgIGNvbnN0IHN0YXJ0QnV0dG9uID0gYnV0dG9uKHsgY2xzIDogJ2FjdGl2ZScsIGh0bWwgOiAnU3RhcnQgRXhwZXJpbWVudCcsIGlkIDogJ3N0YXJ0X2V4cGVyaW1lbnRfYnV0dG9uJyB9KVxuICAgICAgICAuY2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCBzdWJjb25maWcgPSBHbG9iLkJpZ0NvbmZpZy5nZXRTdWJjb25maWcoKTtcbiAgICAgICAgICAgIGxldCBhY3Rpb24gPSBhd2FpdCBNeUFsZXJ0LmJpZy50aHJlZUJ1dHRvbnMoe1xuICAgICAgICAgICAgICAgIHRpdGxlIDogYFBsZWFzZSBtYWtlIHN1cmUgdGhhdCB0aGUgbG9hZGVkIGNvbmZpZywgXCIke3N1YmNvbmZpZy5uYW1lfVwiLCBpcyBmaW5lLiBTdWJqZWN0IG5hbWUsIGV4cGVyaW1lbnQgdHlwZSBldGMuYCxcbiAgICAgICAgICAgICAgICBjb25maXJtQnV0dG9uVGV4dCA6IGBJdCdzIG9rLCBzdGFydCBleHBlcmltZW50YCxcbiAgICAgICAgICAgICAgICB0aGlyZEJ1dHRvblRleHQgOiAnT3BlbiBjb25maWdzIGRpcmVjdG9yeSBpbiBmaWxlIGJyb3dzZXInXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN3aXRjaCAoIGFjdGlvbiApIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiY2FuY2VsXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlIFwiY29uZmlybVwiOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhcnRJZlJlYWR5KHN1YmNvbmZpZyk7XG4gICAgICAgICAgICAgICAgY2FzZSBcInRoaXJkXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZW1vdGUuc2hlbGwuc2hvd0l0ZW1JbkZvbGRlcihwYXRoLmpvaW4oQ09ORklHU19QQVRIX0FCUywgc3ViY29uZmlnLm5hbWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgIEdsb2IuTWFpbkNvbnRlbnQuYXBwZW5kKFxuICAgICAgICAvLyBzZWN0aW9ucy5sZXZlbHMsXG4gICAgICAgIHNlY3Rpb25zLnNldHRpbmdzLFxuICAgICAgICBzdGFydEJ1dHRvblxuICAgICk7XG4gICAgXG4gICAgXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN0YXJ0SWZSZWFkeShzdWJjb25maWc6IFN1YmNvbmZpZykge1xuICAgIGNvbnN0IG1pc3NpbmdUeHRzID0gc3ViY29uZmlnLnRydXRoLnR4dC5nZXRNaXNzaW5nKCk7XG4gICAgXG4gICAgaWYgKCB1dGlsLmJvb2wobWlzc2luZ1R4dHMpICkge1xuICAgICAgICByZXR1cm4gTXlBbGVydC5iaWcub25lQnV0dG9uKGBUaGUgdHJ1dGg6IFwiJHtzdWJjb25maWcudHJ1dGgubmFtZX1cIiBpcyBtaXNzaW5nIHRoZSBmb2xsb3dpbmcgdHh0IGZpbGVzOmAsIHsgdGV4dCA6IG1pc3NpbmdUeHRzLmpvaW4oJywgJykgfSlcbiAgICB9XG4gICAgLy8gLyBUeHRzIGV4aXN0XG4gICAgaWYgKCAhc3ViY29uZmlnLnRydXRoLm1pZGkuZXhpc3RzKCkgKSB7XG4gICAgICAgIGlmICggIUdsb2IuQmlnQ29uZmlnLmRldi5za2lwX21pZGlfZXhpc3RzX2NoZWNrKCkgKSB7XG4gICAgICAgICAgICByZXR1cm4gTXlBbGVydC5iaWcub25lQnV0dG9uKGBUaGUgdHJ1dGg6IFwiJHtzdWJjb25maWcudHJ1dGgubmFtZX1cIiBpcyBtaXNzaW5nIGEgbWlkaSBmaWxlYClcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyAvIG1pZGkgZXhpc3RcbiAgICBpZiAoIHN1YmNvbmZpZy5kZW1vX3R5cGUgPT09IFwidmlkZW9cIiApIHtcbiAgICAgICAgY29uc3QgbXA0RXhpc3RzID0gc3ViY29uZmlnLnRydXRoLm1wNC5leGlzdHMoKTtcbiAgICAgICAgY29uc3Qgb25zZXRzRXhpc3RzID0gc3ViY29uZmlnLnRydXRoLm9uc2V0cy5leGlzdHMoKTtcbiAgICAgICAgaWYgKCAhdXRpbC5hbGwobXA0RXhpc3RzLCBvbnNldHNFeGlzdHMpICkge1xuICAgICAgICAgICAgY29uc3QgbWlzc2luZ05hbWVzID0gW107XG4gICAgICAgICAgICBpZiAoICFtcDRFeGlzdHMgKVxuICAgICAgICAgICAgICAgIG1pc3NpbmdOYW1lcy5wdXNoKFwibXA0XCIpO1xuICAgICAgICAgICAgaWYgKCAhb25zZXRzRXhpc3RzIClcbiAgICAgICAgICAgICAgICBtaXNzaW5nTmFtZXMucHVzaChcIm9uc2V0c1wiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIE15QWxlcnQuYmlnLm9uZUJ1dHRvbihgVGhlIHRydXRoOiBcIiR7c3ViY29uZmlnLnRydXRoLm5hbWV9XCIgaXMgbWlzc2luZyB0aGUgZm9sbG93aW5nIGZpbGVzOmAsIHtcbiAgICAgICAgICAgICAgICB0ZXh0IDogbWlzc2luZ05hbWVzLmpvaW4oJywgJylcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gLyBtcDQgYW5kIG9uc2V0cyBleGlzdFxuICAgIHJldHVybiByZXF1aXJlKCcuLi9SdW5uaW5nJykubG9hZCh0cnVlKTtcbn1cblxuZXhwb3J0IHsgbG9hZCB9XG4iXX0=