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
}
exports.default = { load };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLHFDQUE4QjtBQUM5QixtQ0FBa0M7QUFDbEMsd0NBQWlDO0FBQ2pDLHlDQUFpQztBQUNqQyxtQ0FBbUM7QUFDbkMsMkNBQW1DO0FBQ25DLDZCQUE2QjtBQUM3Qix1Q0FBa0M7QUFHbEMsS0FBSyxVQUFVLElBQUksQ0FBQyxNQUFlO0lBRS9CLGNBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUNqQyxJQUFLLE1BQU0sRUFBRztRQUNWLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQzVCO0lBQ0QsaUJBQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFHLElBQUksRUFBRSxDQUFDLENBQUM7SUFDOUMsTUFBTSxXQUFXLEdBQUcsWUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFHLFFBQVEsRUFBRSxJQUFJLEVBQUcsa0JBQWtCLEVBQUUsRUFBRSxFQUFHLHlCQUF5QixFQUFFLENBQUM7U0FDcEcsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFO1FBRWQsTUFBTSxTQUFTLEdBQUcsY0FBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNoRCxJQUFJLE1BQU0sR0FBRyxNQUFNLGlCQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztZQUN4QyxLQUFLLEVBQUcsNkNBQTZDLFNBQVMsQ0FBQyxJQUFJLGFBQWE7WUFDaEYsaUJBQWlCLEVBQUcsMkJBQTJCO1lBQy9DLGVBQWUsRUFBRyx3Q0FBd0M7U0FDN0QsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDeEIsUUFBUyxNQUFNLEVBQUc7WUFDZCxLQUFLLFFBQVE7Z0JBQ1QsT0FBTztZQUNYLEtBQUssU0FBUztnQkFDVixPQUFPLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNuQyxLQUFLLE9BQU87Z0JBQ1IsT0FBTyxpQkFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ3pGO0lBR0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxjQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FFbkIsa0JBQVEsQ0FBQyxRQUFRLEVBQ2pCLFdBQVcsQ0FDZCxDQUFDO0FBR04sQ0FBQztBQUVELEtBQUssVUFBVSxZQUFZLENBQUMsU0FBb0I7SUFFNUMsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7SUFFckQsSUFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFHO1FBQzFCLE9BQU8saUJBQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLHVDQUF1QyxFQUFFLEVBQUUsSUFBSSxFQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0tBQzlJO0lBQ0QsSUFBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFHO1FBQ2xDLElBQUssY0FBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLEVBQUUsRUFBRztZQUMvQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLHdEQUF3RCxDQUFDLENBQUM7U0FDbEc7YUFBTTtZQUNILE9BQU8saUJBQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLDBCQUEwQixDQUFDLENBQUE7U0FDOUY7S0FDSjtJQUNELElBQUssU0FBUyxDQUFDLFNBQVMsS0FBSyxPQUFPLEVBQUc7UUFDbkMsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDL0MsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDckQsSUFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxFQUFHO1lBQ3RDLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztZQUN4QixJQUFLLENBQUMsU0FBUztnQkFDWCxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdCLElBQUssQ0FBQyxZQUFZO2dCQUNkLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFaEMsT0FBTyxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsZUFBZSxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksbUNBQW1DLEVBQUU7Z0JBQ2pHLElBQUksRUFBRyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUNqQyxDQUFDLENBQUE7U0FDTDtLQUNKO0FBQ0wsQ0FBQztBQUVELGtCQUFlLEVBQUUsSUFBSSxFQUFFLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAqICBwYWdlcy9OZXcvaW5kZXgudHNcbi8qKmltcG9ydCBuZXdQYWdlIGZyb20gXCIuL05ld1wiOyovXG5pbXBvcnQgR2xvYiBmcm9tIFwiLi4vLi4vR2xvYlwiO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuLi8uLi91dGlsJ1xuaW1wb3J0IHNpZGViYXIgZnJvbSBcIi4uL3NpZGViYXJcIjtcbmltcG9ydCBzZWN0aW9ucyBmcm9tIFwiLi9zZWN0aW9uc1wiXG5pbXBvcnQgeyBidXR0b24gfSBmcm9tIFwiLi4vLi4vYmhlXCI7XG5pbXBvcnQgTXlBbGVydCBmcm9tICcuLi8uLi9NeUFsZXJ0J1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgcmVtb3RlIH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHsgU3ViY29uZmlnIH0gZnJvbSBcIi4uLy4uL015U3RvcmVcIjtcblxuYXN5bmMgZnVuY3Rpb24gbG9hZChyZWxvYWQ6IGJvb2xlYW4pIHtcbiAgICAvLyBjb25zdCB7IGV4YW0sIHRlc3QgfSA9IEdsb2IuQmlnQ29uZmlnO1xuICAgIEdsb2IuQmlnQ29uZmlnLmxhc3RfcGFnZSA9IFwibmV3XCI7XG4gICAgaWYgKCByZWxvYWQgKSB7XG4gICAgICAgIHJldHVybiB1dGlsLnJlbG9hZFBhZ2UoKTtcbiAgICB9XG4gICAgc2lkZWJhci5zZWxlY3QoXCJuZXdcIiwgeyBjaGFuZ2VUaXRsZSA6IHRydWUgfSk7XG4gICAgY29uc3Qgc3RhcnRCdXR0b24gPSBidXR0b24oeyBjbHMgOiAnYWN0aXZlJywgaHRtbCA6ICdTdGFydCBFeHBlcmltZW50JywgaWQgOiAnc3RhcnRfZXhwZXJpbWVudF9idXR0b24nIH0pXG4gICAgICAgIC5jbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IHN1YmNvbmZpZyA9IEdsb2IuQmlnQ29uZmlnLmdldFN1YmNvbmZpZygpO1xuICAgICAgICAgICAgbGV0IGFjdGlvbiA9IGF3YWl0IE15QWxlcnQuYmlnLnRocmVlQnV0dG9ucyh7XG4gICAgICAgICAgICAgICAgdGl0bGUgOiBgUGxlYXNlIG1ha2Ugc3VyZSB0aGF0IHRoZSBsb2FkZWQgY29uZmlnLCBcIiR7c3ViY29uZmlnLm5hbWV9XCIsIGlzIGZpbmUuYCxcbiAgICAgICAgICAgICAgICBjb25maXJtQnV0dG9uVGV4dCA6IGBJdCdzIG9rLCBzdGFydCBleHBlcmltZW50YCxcbiAgICAgICAgICAgICAgICB0aGlyZEJ1dHRvblRleHQgOiAnT3BlbiBjb25maWdzIGRpcmVjdG9yeSBpbiBmaWxlIGJyb3dzZXInXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHsgYWN0aW9uIH0pO1xuICAgICAgICAgICAgc3dpdGNoICggYWN0aW9uICkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJjYW5jZWxcIjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJjb25maXJtXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGFydElmUmVhZHkoc3ViY29uZmlnKTtcbiAgICAgICAgICAgICAgICBjYXNlIFwidGhpcmRcIjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlbW90ZS5zaGVsbC5zaG93SXRlbUluRm9sZGVyKHBhdGguam9pbihDT05GSUdTX1BBVEhfQUJTLCBzdWJjb25maWcubmFtZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgR2xvYi5NYWluQ29udGVudC5hcHBlbmQoXG4gICAgICAgIC8vIHNlY3Rpb25zLmxldmVscyxcbiAgICAgICAgc2VjdGlvbnMuc2V0dGluZ3MsXG4gICAgICAgIHN0YXJ0QnV0dG9uXG4gICAgKTtcbiAgICBcbiAgICBcbn1cblxuYXN5bmMgZnVuY3Rpb24gc3RhcnRJZlJlYWR5KHN1YmNvbmZpZzogU3ViY29uZmlnKSB7XG4gICAgLy8gY29uc3QgZXhpc3RpbmdUeHRzID0gYXdhaXQgc3ViY29uZmlnLnRydXRoLnR4dC5nZXRFeGlzdGluZygpO1xuICAgIGNvbnN0IG1pc3NpbmdUeHRzID0gc3ViY29uZmlnLnRydXRoLnR4dC5nZXRNaXNzaW5nKCk7XG4gICAgXG4gICAgaWYgKCB1dGlsLmJvb2wobWlzc2luZ1R4dHMpICkge1xuICAgICAgICByZXR1cm4gTXlBbGVydC5iaWcub25lQnV0dG9uKGBUaGUgdHJ1dGg6IFwiJHtzdWJjb25maWcudHJ1dGgubmFtZX1cIiBpcyBtaXNzaW5nIHRoZSBmb2xsb3dpbmcgdHh0IGZpbGVzOmAsIHsgdGV4dCA6IG1pc3NpbmdUeHRzLmpvaW4oJywgJykgfSlcbiAgICB9XG4gICAgaWYgKCAhc3ViY29uZmlnLnRydXRoLm1pZGkuZXhpc3RzKCkgKSB7XG4gICAgICAgIGlmICggR2xvYi5CaWdDb25maWcuZGV2LnNraXBfbWlkaV9leGlzdHNfY2hlY2soKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgXCIke3N1YmNvbmZpZy50cnV0aC5uYW1lfVwiIGlzIG1pc3NpbmcgYSBtaWRpIGZpbGUgYnV0IGNvbnRpbnVpbmcgY3V6IGRldm9wdGlvbnNgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBNeUFsZXJ0LmJpZy5vbmVCdXR0b24oYFRoZSB0cnV0aDogXCIke3N1YmNvbmZpZy50cnV0aC5uYW1lfVwiIGlzIG1pc3NpbmcgYSBtaWRpIGZpbGVgKVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmICggc3ViY29uZmlnLmRlbW9fdHlwZSA9PT0gXCJ2aWRlb1wiICkge1xuICAgICAgICBjb25zdCBtcDRFeGlzdHMgPSBzdWJjb25maWcudHJ1dGgubXA0LmV4aXN0cygpO1xuICAgICAgICBjb25zdCBvbnNldHNFeGlzdHMgPSBzdWJjb25maWcudHJ1dGgub25zZXRzLmV4aXN0cygpO1xuICAgICAgICBpZiAoICF1dGlsLmFsbChtcDRFeGlzdHMsIG9uc2V0c0V4aXN0cykgKSB7XG4gICAgICAgICAgICBjb25zdCBtaXNzaW5nTmFtZXMgPSBbXTtcbiAgICAgICAgICAgIGlmICggIW1wNEV4aXN0cyApXG4gICAgICAgICAgICAgICAgbWlzc2luZ05hbWVzLnB1c2goXCJtcDRcIik7XG4gICAgICAgICAgICBpZiAoICFvbnNldHNFeGlzdHMgKVxuICAgICAgICAgICAgICAgIG1pc3NpbmdOYW1lcy5wdXNoKFwib25zZXRzXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gTXlBbGVydC5iaWcub25lQnV0dG9uKGBUaGUgdHJ1dGg6IFwiJHtzdWJjb25maWcudHJ1dGgubmFtZX1cIiBpcyBtaXNzaW5nIHRoZSBmb2xsb3dpbmcgZmlsZXM6YCwge1xuICAgICAgICAgICAgICAgIHRleHQgOiBtaXNzaW5nTmFtZXMuam9pbignLCAnKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgeyBsb2FkIH1cbiJdfQ==