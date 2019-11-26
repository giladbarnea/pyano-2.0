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
const runningPage = require("../Running");
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
            title: `Please make sure that the loaded config, "${subconfig.name}", is fine.`,
            confirmButtonText: `It's ok, start experiment`,
            thirdButtonText: 'Open configs directory in file browser'
        });
        console.log({ action });
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
        if (Glob_1.default.BigConfig.dev.skip_midi_exists_check()) {
            console.warn(`"${subconfig.truth.name}" is missing a midi file but continuing cuz devoptions`);
        }
        else {
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
    return runningPage.load(true);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHFDQUE4QjtBQUM5QixtQ0FBa0M7QUFDbEMsd0NBQWlDO0FBQ2pDLHlDQUFpQztBQUNqQyxtQ0FBbUM7QUFDbkMsMkNBQW1DO0FBQ25DLDZCQUE2QjtBQUM3Qix1Q0FBa0M7QUFFbEMsMENBQXlDO0FBRXpDLEtBQUssVUFBVSxJQUFJLENBQUMsTUFBZTtJQUUvQixjQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDakMsSUFBSyxNQUFNLEVBQUc7UUFDVixPQUFPLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztLQUM1QjtJQUNELGlCQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLFdBQVcsRUFBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLE1BQU0sV0FBVyxHQUFHLFlBQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRyxRQUFRLEVBQUUsSUFBSSxFQUFHLGtCQUFrQixFQUFFLEVBQUUsRUFBRyx5QkFBeUIsRUFBRSxDQUFDO1NBQ3BHLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtRQUVkLE1BQU0sU0FBUyxHQUFHLGNBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDaEQsSUFBSSxNQUFNLEdBQUcsTUFBTSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7WUFDeEMsS0FBSyxFQUFHLDZDQUE2QyxTQUFTLENBQUMsSUFBSSxhQUFhO1lBQ2hGLGlCQUFpQixFQUFHLDJCQUEyQjtZQUMvQyxlQUFlLEVBQUcsd0NBQXdDO1NBQzdELENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3hCLFFBQVMsTUFBTSxFQUFHO1lBQ2QsS0FBSyxRQUFRO2dCQUNULE9BQU87WUFDWCxLQUFLLFNBQVM7Z0JBQ1YsT0FBTyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbkMsS0FBSyxPQUFPO2dCQUNSLE9BQU8saUJBQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUN6RjtJQUdMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsY0FBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBRW5CLGtCQUFRLENBQUMsUUFBUSxFQUNqQixXQUFXLENBQ2QsQ0FBQztBQUdOLENBQUM7QUFvQ1Esb0JBQUk7QUFsQ2IsS0FBSyxVQUFVLFlBQVksQ0FBQyxTQUFvQjtJQUM1QyxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUVyRCxJQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUc7UUFDMUIsT0FBTyxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsZUFBZSxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksdUNBQXVDLEVBQUUsRUFBRSxJQUFJLEVBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7S0FDOUk7SUFFRCxJQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUc7UUFDbEMsSUFBSyxjQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxFQUFHO1lBQy9DLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksd0RBQXdELENBQUMsQ0FBQztTQUNsRzthQUFNO1lBQ0gsT0FBTyxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsZUFBZSxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksMEJBQTBCLENBQUMsQ0FBQTtTQUM5RjtLQUNKO0lBRUQsSUFBSyxTQUFTLENBQUMsU0FBUyxLQUFLLE9BQU8sRUFBRztRQUNuQyxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMvQyxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNyRCxJQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLEVBQUc7WUFDdEMsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDO1lBQ3hCLElBQUssQ0FBQyxTQUFTO2dCQUNYLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDN0IsSUFBSyxDQUFDLFlBQVk7Z0JBQ2QsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVoQyxPQUFPLGlCQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxtQ0FBbUMsRUFBRTtnQkFDakcsSUFBSSxFQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ2pDLENBQUMsQ0FBQTtTQUNMO0tBQ0o7SUFFRCxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKmltcG9ydCBuZXdQYWdlIGZyb20gXCIuL05ld1wiOyovXG5pbXBvcnQgR2xvYiBmcm9tIFwiLi4vLi4vR2xvYlwiO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuLi8uLi91dGlsJ1xuaW1wb3J0IHNpZGViYXIgZnJvbSBcIi4uL3NpZGViYXJcIjtcbmltcG9ydCBzZWN0aW9ucyBmcm9tIFwiLi9zZWN0aW9uc1wiXG5pbXBvcnQgeyBidXR0b24gfSBmcm9tIFwiLi4vLi4vYmhlXCI7XG5pbXBvcnQgTXlBbGVydCBmcm9tICcuLi8uLi9NeUFsZXJ0J1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgcmVtb3RlIH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHsgU3ViY29uZmlnIH0gZnJvbSBcIi4uLy4uL015U3RvcmVcIjtcbmltcG9ydCAqIGFzIHJ1bm5pbmdQYWdlIGZyb20gXCIuLi9SdW5uaW5nXCJcblxuYXN5bmMgZnVuY3Rpb24gbG9hZChyZWxvYWQ6IGJvb2xlYW4pIHtcbiAgICBcbiAgICBHbG9iLkJpZ0NvbmZpZy5sYXN0X3BhZ2UgPSBcIm5ld1wiO1xuICAgIGlmICggcmVsb2FkICkge1xuICAgICAgICByZXR1cm4gdXRpbC5yZWxvYWRQYWdlKCk7XG4gICAgfVxuICAgIHNpZGViYXIuc2VsZWN0KFwibmV3XCIsIHsgY2hhbmdlVGl0bGUgOiB0cnVlIH0pO1xuICAgIGNvbnN0IHN0YXJ0QnV0dG9uID0gYnV0dG9uKHsgY2xzIDogJ2FjdGl2ZScsIGh0bWwgOiAnU3RhcnQgRXhwZXJpbWVudCcsIGlkIDogJ3N0YXJ0X2V4cGVyaW1lbnRfYnV0dG9uJyB9KVxuICAgICAgICAuY2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCBzdWJjb25maWcgPSBHbG9iLkJpZ0NvbmZpZy5nZXRTdWJjb25maWcoKTtcbiAgICAgICAgICAgIGxldCBhY3Rpb24gPSBhd2FpdCBNeUFsZXJ0LmJpZy50aHJlZUJ1dHRvbnMoe1xuICAgICAgICAgICAgICAgIHRpdGxlIDogYFBsZWFzZSBtYWtlIHN1cmUgdGhhdCB0aGUgbG9hZGVkIGNvbmZpZywgXCIke3N1YmNvbmZpZy5uYW1lfVwiLCBpcyBmaW5lLmAsXG4gICAgICAgICAgICAgICAgY29uZmlybUJ1dHRvblRleHQgOiBgSXQncyBvaywgc3RhcnQgZXhwZXJpbWVudGAsXG4gICAgICAgICAgICAgICAgdGhpcmRCdXR0b25UZXh0IDogJ09wZW4gY29uZmlncyBkaXJlY3RvcnkgaW4gZmlsZSBicm93c2VyJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh7IGFjdGlvbiB9KTtcbiAgICAgICAgICAgIHN3aXRjaCAoIGFjdGlvbiApIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiY2FuY2VsXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlIFwiY29uZmlybVwiOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhcnRJZlJlYWR5KHN1YmNvbmZpZyk7XG4gICAgICAgICAgICAgICAgY2FzZSBcInRoaXJkXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZW1vdGUuc2hlbGwuc2hvd0l0ZW1JbkZvbGRlcihwYXRoLmpvaW4oQ09ORklHU19QQVRIX0FCUywgc3ViY29uZmlnLm5hbWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgIEdsb2IuTWFpbkNvbnRlbnQuYXBwZW5kKFxuICAgICAgICAvLyBzZWN0aW9ucy5sZXZlbHMsXG4gICAgICAgIHNlY3Rpb25zLnNldHRpbmdzLFxuICAgICAgICBzdGFydEJ1dHRvblxuICAgICk7XG4gICAgXG4gICAgXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN0YXJ0SWZSZWFkeShzdWJjb25maWc6IFN1YmNvbmZpZykge1xuICAgIGNvbnN0IG1pc3NpbmdUeHRzID0gc3ViY29uZmlnLnRydXRoLnR4dC5nZXRNaXNzaW5nKCk7XG4gICAgXG4gICAgaWYgKCB1dGlsLmJvb2wobWlzc2luZ1R4dHMpICkge1xuICAgICAgICByZXR1cm4gTXlBbGVydC5iaWcub25lQnV0dG9uKGBUaGUgdHJ1dGg6IFwiJHtzdWJjb25maWcudHJ1dGgubmFtZX1cIiBpcyBtaXNzaW5nIHRoZSBmb2xsb3dpbmcgdHh0IGZpbGVzOmAsIHsgdGV4dCA6IG1pc3NpbmdUeHRzLmpvaW4oJywgJykgfSlcbiAgICB9XG4gICAgLy8gLyBUeHRzIGV4aXN0XG4gICAgaWYgKCAhc3ViY29uZmlnLnRydXRoLm1pZGkuZXhpc3RzKCkgKSB7XG4gICAgICAgIGlmICggR2xvYi5CaWdDb25maWcuZGV2LnNraXBfbWlkaV9leGlzdHNfY2hlY2soKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgXCIke3N1YmNvbmZpZy50cnV0aC5uYW1lfVwiIGlzIG1pc3NpbmcgYSBtaWRpIGZpbGUgYnV0IGNvbnRpbnVpbmcgY3V6IGRldm9wdGlvbnNgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBNeUFsZXJ0LmJpZy5vbmVCdXR0b24oYFRoZSB0cnV0aDogXCIke3N1YmNvbmZpZy50cnV0aC5uYW1lfVwiIGlzIG1pc3NpbmcgYSBtaWRpIGZpbGVgKVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIC8gbWlkaSBleGlzdFxuICAgIGlmICggc3ViY29uZmlnLmRlbW9fdHlwZSA9PT0gXCJ2aWRlb1wiICkge1xuICAgICAgICBjb25zdCBtcDRFeGlzdHMgPSBzdWJjb25maWcudHJ1dGgubXA0LmV4aXN0cygpO1xuICAgICAgICBjb25zdCBvbnNldHNFeGlzdHMgPSBzdWJjb25maWcudHJ1dGgub25zZXRzLmV4aXN0cygpO1xuICAgICAgICBpZiAoICF1dGlsLmFsbChtcDRFeGlzdHMsIG9uc2V0c0V4aXN0cykgKSB7XG4gICAgICAgICAgICBjb25zdCBtaXNzaW5nTmFtZXMgPSBbXTtcbiAgICAgICAgICAgIGlmICggIW1wNEV4aXN0cyApXG4gICAgICAgICAgICAgICAgbWlzc2luZ05hbWVzLnB1c2goXCJtcDRcIik7XG4gICAgICAgICAgICBpZiAoICFvbnNldHNFeGlzdHMgKVxuICAgICAgICAgICAgICAgIG1pc3NpbmdOYW1lcy5wdXNoKFwib25zZXRzXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gTXlBbGVydC5iaWcub25lQnV0dG9uKGBUaGUgdHJ1dGg6IFwiJHtzdWJjb25maWcudHJ1dGgubmFtZX1cIiBpcyBtaXNzaW5nIHRoZSBmb2xsb3dpbmcgZmlsZXM6YCwge1xuICAgICAgICAgICAgICAgIHRleHQgOiBtaXNzaW5nTmFtZXMuam9pbignLCAnKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyAvIG1wNCBhbmQgb25zZXRzIGV4aXN0XG4gICAgcmV0dXJuIHJ1bm5pbmdQYWdlLmxvYWQodHJ1ZSk7XG59XG5cbmV4cG9ydCB7IGxvYWQgfVxuIl19