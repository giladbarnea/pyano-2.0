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
    const startButton = bhe_1.button({ cls: 'green', html: 'Start Experiment', id: 'start_experiment_button' })
        .click(async () => {
        const subconfig = Glob_1.default.BigConfig.getSubconfig();
        let html = subconfig.toHtml();
        let action = await MyAlert_1.default.big.threeButtons({
            title: `Please make sure that the loaded config, "${subconfig.name}", is fine.`,
            html,
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
    const mustHaveValue = [
        "allowed_rhythm_deviation",
        "allowed_tempo_deviation",
        "errors_playrate",
        "subject",
        "truth_file",
        "levels",
    ];
    const missingValues = [];
    for (let key of mustHaveValue) {
        if (!util.bool(subconfig[key])) {
            missingValues.push(key);
        }
    }
    if (util.bool(missingValues)) {
        return MyAlert_1.default.big.oneButton(`The following keys in ${subconfig.name} are missing values:`, {
            text: missingValues.join(', ')
        });
    }
    const levelCollection = subconfig.getLevelCollection();
    const badLevels = levelCollection.badLevels();
    if (util.bool(badLevels)) {
        return MyAlert_1.default.big.oneButton(`The following levels in ${subconfig.name} have invalid values: (0-index)`, {
            text: badLevels.join(', ')
        });
    }
    return require('../Running').load(true);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHFDQUE4QjtBQUM5QixtQ0FBa0M7QUFDbEMsd0NBQWlDO0FBQ2pDLHlDQUFpQztBQUNqQyxtQ0FBbUM7QUFDbkMsMkNBQW1DO0FBQ25DLDZCQUE2QjtBQUM3Qix1Q0FBa0M7QUFNbEMsS0FBSyxVQUFVLElBQUksQ0FBQyxNQUFlO0lBRS9CLGNBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUNqQyxJQUFLLE1BQU0sRUFBRztRQUNWLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQzVCO0lBQ0QsaUJBQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFHLElBQUksRUFBRSxDQUFDLENBQUM7SUFDOUMsTUFBTSxXQUFXLEdBQUcsWUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFHLE9BQU8sRUFBRSxJQUFJLEVBQUcsa0JBQWtCLEVBQUUsRUFBRSxFQUFHLHlCQUF5QixFQUFFLENBQUM7U0FDbkcsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFO1FBS2QsTUFBTSxTQUFTLEdBQUcsY0FBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUdoRCxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDOUIsSUFBSSxNQUFNLEdBQUcsTUFBTSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7WUFDeEMsS0FBSyxFQUFHLDZDQUE2QyxTQUFTLENBQUMsSUFBSSxhQUFhO1lBQ2hGLElBQUk7WUFDSixpQkFBaUIsRUFBRywyQkFBMkI7WUFDL0MsZUFBZSxFQUFHLHdDQUF3QztTQUM3RCxDQUFDLENBQUM7UUFDSCxRQUFTLE1BQU0sRUFBRztZQUNkLEtBQUssUUFBUTtnQkFDVCxPQUFPO1lBQ1gsS0FBSyxTQUFTO2dCQUNWLE9BQU8sWUFBWSxDQUFD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QU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQ3ZELE1BQU0sU0FBUyxHQUFHLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUM5QyxJQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUc7UUFDeEIsT0FBTyxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsMkJBQTJCLFNBQVMsQ0FBQyxJQUFJLGlDQUFpQyxFQUFFO1lBQ3JHLElBQUksRUFBRyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztTQUM5QixDQUFDLENBQUE7S0FDTDtJQUVELE9BQU8sT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqaW1wb3J0IG5ld1BhZ2UgZnJvbSBcIi4vTmV3XCI7Ki9cbmltcG9ydCBHbG9iIGZyb20gXCIuLi8uLi9HbG9iXCI7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4uLy4uL3V0aWwnXG5pbXBvcnQgc2lkZWJhciBmcm9tIFwiLi4vc2lkZWJhclwiO1xuaW1wb3J0IHNlY3Rpb25zIGZyb20gXCIuL3NlY3Rpb25zXCJcbmltcG9ydCB7IGJ1dHRvbiB9IGZyb20gXCIuLi8uLi9iaGVcIjtcbmltcG9ydCBNeUFsZXJ0IGZyb20gJy4uLy4uL015QWxlcnQnXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyByZW1vdGUgfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgeyBTdWJjb25maWcgfSBmcm9tIFwiLi4vLi4vTXlTdG9yZVwiO1xuXG4vLyBpbXBvcnQgKiBhcyBydW5uaW5nUGFnZSBmcm9tIFwiLi4vUnVubmluZ1wiXG5cblxuYXN5bmMgZnVuY3Rpb24gbG9hZChyZWxvYWQ6IGJvb2xlYW4pIHtcbiAgICBcbiAgICBHbG9iLkJpZ0NvbmZpZy5sYXN0X3BhZ2UgPSBcIm5ld1wiO1xuICAgIGlmICggcmVsb2FkICkge1xuICAgICAgICByZXR1cm4gdXRpbC5yZWxvYWRQYWdlKCk7XG4gICAgfVxuICAgIHNpZGViYXIuc2VsZWN0KFwibmV3XCIsIHsgY2hhbmdlVGl0bGUgOiB0cnVlIH0pO1xuICAgIGNvbnN0IHN0YXJ0QnV0dG9uID0gYnV0dG9uKHsgY2xzIDogJ2dyZWVuJywgaHRtbCA6ICdTdGFydCBFeHBlcmltZW50JywgaWQgOiAnc3RhcnRfZXhwZXJpbWVudF9idXR0b24nIH0pXG4gICAgICAgIC5jbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAvKmxldCB0ZW1wbGF0ZSA9IHtcbiAgICAgICAgICAgICAnPD4nIDogJ2RpdicsXG4gICAgICAgICAgICAgJ2h0bWwnIDogWyAnQWxsb3dlZCBSaHl0aG0gRGV2aWF0aW9uOiAke2FsbG93ZWRfcmh5dGhtX2RldmlhdGlvbn0nXVxuICAgICAgICAgICAgIH07Ki9cbiAgICAgICAgICAgIGNvbnN0IHN1YmNvbmZpZyA9IEdsb2IuQmlnQ29uZmlnLmdldFN1YmNvbmZpZygpO1xuICAgICAgICAgICAgLy8gY29uc3QganNvbjJodG1sID0gcmVxdWlyZShcIm5vZGUtanNvbjJodG1sXCIpO1xuICAgICAgICAgICAgLy8gbGV0IGh0bWwgPSBqc29uMmh0bWwudHJhbnNmb3JtKHN1YmNvbmZpZy5zdG9yZSwgdGVtcGxhdGUpO1xuICAgICAgICAgICAgbGV0IGh0bWwgPSBzdWJjb25maWcudG9IdG1sKCk7XG4gICAgICAgICAgICBsZXQgYWN0aW9uID0gYXdhaXQgTXlBbGVydC5iaWcudGhyZWVCdXR0b25zKHtcbiAgICAgICAgICAgICAgICB0aXRsZSA6IGBQbGVhc2UgbWFrZSBzdXJlIHRoYXQgdGhlIGxvYWRlZCBjb25maWcsIFwiJHtzdWJjb25maWcubmFtZX1cIiwgaXMgZmluZS5gLFxuICAgICAgICAgICAgICAgIGh0bWwsXG4gICAgICAgICAgICAgICAgY29uZmlybUJ1dHRvblRleHQgOiBgSXQncyBvaywgc3RhcnQgZXhwZXJpbWVudGAsXG4gICAgICAgICAgICAgICAgdGhpcmRCdXR0b25UZXh0IDogJ09wZW4gY29uZmlncyBkaXJlY3RvcnkgaW4gZmlsZSBicm93c2VyJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzd2l0Y2ggKCBhY3Rpb24gKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcImNhbmNlbFwiOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSBcImNvbmZpcm1cIjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXJ0SWZSZWFkeShzdWJjb25maWcpO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJ0aGlyZFwiOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVtb3RlLnNoZWxsLnNob3dJdGVtSW5Gb2xkZXIocGF0aC5qb2luKENPTkZJR1NfUEFUSF9BQlMsIHN1YmNvbmZpZy5uYW1lKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICBHbG9iLk1haW5Db250ZW50LmFwcGVuZChcbiAgICAgICAgLy8gc2VjdGlvbnMubGV2ZWxzLFxuICAgICAgICBzZWN0aW9ucy5zZXR0aW5ncyxcbiAgICAgICAgc3RhcnRCdXR0b25cbiAgICApO1xuICAgIFxuICAgIFxufVxuXG5hc3luYyBmdW5jdGlvbiBzdGFydElmUmVhZHkoc3ViY29uZmlnOiBTdWJjb25maWcpIHtcbiAgICBjb25zdCBtaXNzaW5nVHh0cyA9IHN1YmNvbmZpZy50cnV0aC50eHQuZ2V0TWlzc2luZygpO1xuICAgIFxuICAgIGlmICggdXRpbC5ib29sKG1pc3NpbmdUeHRzKSApIHtcbiAgICAgICAgcmV0dXJuIE15QWxlcnQuYmlnLm9uZUJ1dHRvbihgVGhlIHRydXRoOiBcIiR7c3ViY29uZmlnLnRydXRoLm5hbWV9XCIgaXMgbWlzc2luZyB0aGUgZm9sbG93aW5nIHR4dCBmaWxlczpgLCB7IHRleHQgOiBtaXNzaW5nVHh0cy5qb2luKCcsICcpIH0pXG4gICAgfVxuICAgIC8vIC8gVHh0cyBleGlzdFxuICAgIGlmICggIXN1YmNvbmZpZy50cnV0aC5taWRpLmV4aXN0cygpICkge1xuICAgICAgICBpZiAoICFHbG9iLkJpZ0NvbmZpZy5kZXYuc2tpcF9taWRpX2V4aXN0c19jaGVjaygpICkge1xuICAgICAgICAgICAgcmV0dXJuIE15QWxlcnQuYmlnLm9uZUJ1dHRvbihgVGhlIHRydXRoOiBcIiR7c3ViY29uZmlnLnRydXRoLm5hbWV9XCIgaXMgbWlzc2luZyBhIG1pZGkgZmlsZWApXG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gLyBtaWRpIGV4aXN0XG4gICAgaWYgKCBzdWJjb25maWcuZGVtb190eXBlID09PSBcInZpZGVvXCIgKSB7XG4gICAgICAgIGNvbnN0IG1wNEV4aXN0cyA9IHN1YmNvbmZpZy50cnV0aC5tcDQuZXhpc3RzKCk7XG4gICAgICAgIGNvbnN0IG9uc2V0c0V4aXN0cyA9IHN1YmNvbmZpZy50cnV0aC5vbnNldHMuZXhpc3RzKCk7XG4gICAgICAgIGlmICggIXV0aWwuYWxsKG1wNEV4aXN0cywgb25zZXRzRXhpc3RzKSApIHtcbiAgICAgICAgICAgIGNvbnN0IG1pc3NpbmdOYW1lcyA9IFtdO1xuICAgICAgICAgICAgaWYgKCAhbXA0RXhpc3RzIClcbiAgICAgICAgICAgICAgICBtaXNzaW5nTmFtZXMucHVzaChcIm1wNFwiKTtcbiAgICAgICAgICAgIGlmICggIW9uc2V0c0V4aXN0cyApXG4gICAgICAgICAgICAgICAgbWlzc2luZ05hbWVzLnB1c2goXCJvbnNldHNcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBNeUFsZXJ0LmJpZy5vbmVCdXR0b24oYFRoZSB0cnV0aDogXCIke3N1YmNvbmZpZy50cnV0aC5uYW1lfVwiIGlzIG1pc3NpbmcgdGhlIGZvbGxvd2luZyBmaWxlczpgLCB7XG4gICAgICAgICAgICAgICAgdGV4dCA6IG1pc3NpbmdOYW1lcy5qb2luKCcsICcpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IG11c3RIYXZlVmFsdWUgPSBbXG4gICAgICAgIFwiYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uXCIsXG4gICAgICAgIFwiYWxsb3dlZF90ZW1wb19kZXZpYXRpb25cIixcbiAgICAgICAgXCJlcnJvcnNfcGxheXJhdGVcIixcbiAgICAgICAgXCJzdWJqZWN0XCIsXG4gICAgICAgIFwidHJ1dGhfZmlsZVwiLFxuICAgICAgICBcImxldmVsc1wiLFxuICAgIF07XG4gICAgY29uc3QgbWlzc2luZ1ZhbHVlcyA9IFtdO1xuICAgIGZvciAoIGxldCBrZXkgb2YgbXVzdEhhdmVWYWx1ZSApIHtcbiAgICAgICAgaWYgKCAhdXRpbC5ib29sKHN1YmNvbmZpZ1trZXldKSApIHtcbiAgICAgICAgICAgIG1pc3NpbmdWYWx1ZXMucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICggdXRpbC5ib29sKG1pc3NpbmdWYWx1ZXMpICkge1xuICAgICAgICByZXR1cm4gTXlBbGVydC5iaWcub25lQnV0dG9uKGBUaGUgZm9sbG93aW5nIGtleXMgaW4gJHtzdWJjb25maWcubmFtZX0gYXJlIG1pc3NpbmcgdmFsdWVzOmAsIHtcbiAgICAgICAgICAgIHRleHQgOiBtaXNzaW5nVmFsdWVzLmpvaW4oJywgJylcbiAgICAgICAgfSlcbiAgICB9XG4gICAgY29uc3QgbGV2ZWxDb2xsZWN0aW9uID0gc3ViY29uZmlnLmdldExldmVsQ29sbGVjdGlvbigpO1xuICAgIGNvbnN0IGJhZExldmVscyA9IGxldmVsQ29sbGVjdGlvbi5iYWRMZXZlbHMoKTtcbiAgICBpZiAoIHV0aWwuYm9vbChiYWRMZXZlbHMpICkge1xuICAgICAgICByZXR1cm4gTXlBbGVydC5iaWcub25lQnV0dG9uKGBUaGUgZm9sbG93aW5nIGxldmVscyBpbiAke3N1YmNvbmZpZy5uYW1lfSBoYXZlIGludmFsaWQgdmFsdWVzOiAoMC1pbmRleClgLCB7XG4gICAgICAgICAgICB0ZXh0IDogYmFkTGV2ZWxzLmpvaW4oJywgJylcbiAgICAgICAgfSlcbiAgICB9XG4gICAgLy8gLyBtcDQgYW5kIG9uc2V0cyBleGlzdFxuICAgIHJldHVybiByZXF1aXJlKCcuLi9SdW5uaW5nJykubG9hZCh0cnVlKTtcbn1cblxuZXhwb3J0IHsgbG9hZCB9XG4iXX0=