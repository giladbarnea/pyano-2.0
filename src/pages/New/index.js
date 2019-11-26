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
const Running_1 = require("../Running");
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
    return Running_1.default.load(true);
}
exports.default = { load };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHFDQUE4QjtBQUM5QixtQ0FBa0M7QUFDbEMsd0NBQWlDO0FBQ2pDLHlDQUFpQztBQUNqQyxtQ0FBbUM7QUFDbkMsMkNBQW1DO0FBQ25DLDZCQUE2QjtBQUM3Qix1Q0FBa0M7QUFFbEMsd0NBQW9DO0FBRXBDLEtBQUssVUFBVSxJQUFJLENBQUMsTUFBZTtJQUUvQixjQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDakMsSUFBSyxNQUFNLEVBQUc7UUFDVixPQUFPLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztLQUM1QjtJQUNELGlCQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLFdBQVcsRUFBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLE1BQU0sV0FBVyxHQUFHLFlBQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRyxRQUFRLEVBQUUsSUFBSSxFQUFHLGtCQUFrQixFQUFFLEVBQUUsRUFBRyx5QkFBeUIsRUFBRSxDQUFDO1NBQ3BHLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtRQUVkLE1BQU0sU0FBUyxHQUFHLGNBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDaEQsSUFBSSxNQUFNLEdBQUcsTUFBTSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7WUFDeEMsS0FBSyxFQUFHLDZDQUE2QyxTQUFTLENBQUMsSUFBSSxhQUFhO1lBQ2hGLGlCQUFpQixFQUFHLDJCQUEyQjtZQUMvQyxlQUFlLEVBQUcsd0NBQXdDO1NBQzdELENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3hCLFFBQVMsTUFBTSxFQUFHO1lBQ2QsS0FBSyxRQUFRO2dCQUNULE9BQU87WUFDWCxLQUFLLFNBQVM7Z0JBQ1YsT0FBTyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbkMsS0FBSyxPQUFPO2dCQUNSLE9BQU8saUJBQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUN6RjtJQUdMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsY0FBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBRW5CLGtCQUFRLENBQUMsUUFBUSxFQUNqQixXQUFXLENBQ2QsQ0FBQztBQUdOLENBQUM7QUFFRCxLQUFLLFVBQVUsWUFBWSxDQUFDLFNBQW9CO0lBQzVDLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBRXJELElBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRztRQUMxQixPQUFPLGlCQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSx1Q0FBdUMsRUFBRSxFQUFFLElBQUksRUFBRyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtLQUM5STtJQUVELElBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRztRQUNsQyxJQUFLLGNBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLEVBQUc7WUFDL0MsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSx3REFBd0QsQ0FBQyxDQUFDO1NBQ2xHO2FBQU07WUFDSCxPQUFPLGlCQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSwwQkFBMEIsQ0FBQyxDQUFBO1NBQzlGO0tBQ0o7SUFFRCxJQUFLLFNBQVMsQ0FBQyxTQUFTLEtBQUssT0FBTyxFQUFHO1FBQ25DLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQy9DLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3JELElBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsRUFBRztZQUN0QyxNQUFNLFlBQVksR0FBRyxFQUFFLENBQUM7WUFDeEIsSUFBSyxDQUFDLFNBQVM7Z0JBQ1gsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QixJQUFLLENBQUMsWUFBWTtnQkFDZCxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRWhDLE9BQU8saUJBQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLG1DQUFtQyxFQUFFO2dCQUNqRyxJQUFJLEVBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDakMsQ0FBQyxDQUFBO1NBQ0w7S0FDSjtJQUVELE9BQU8saUJBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQUVELGtCQUFlLEVBQUUsSUFBSSxFQUFFLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKippbXBvcnQgbmV3UGFnZSBmcm9tIFwiLi9OZXdcIjsqL1xuaW1wb3J0IEdsb2IgZnJvbSBcIi4uLy4uL0dsb2JcIjtcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi4vLi4vdXRpbCdcbmltcG9ydCBzaWRlYmFyIGZyb20gXCIuLi9zaWRlYmFyXCI7XG5pbXBvcnQgc2VjdGlvbnMgZnJvbSBcIi4vc2VjdGlvbnNcIlxuaW1wb3J0IHsgYnV0dG9uIH0gZnJvbSBcIi4uLy4uL2JoZVwiO1xuaW1wb3J0IE15QWxlcnQgZnJvbSAnLi4vLi4vTXlBbGVydCdcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IHJlbW90ZSB9IGZyb20gJ2VsZWN0cm9uJztcbmltcG9ydCB7IFN1YmNvbmZpZyB9IGZyb20gXCIuLi8uLi9NeVN0b3JlXCI7XG5pbXBvcnQgcnVubmluZ1BhZ2UgZnJvbSBcIi4uL1J1bm5pbmdcIlxuXG5hc3luYyBmdW5jdGlvbiBsb2FkKHJlbG9hZDogYm9vbGVhbikge1xuICAgIFxuICAgIEdsb2IuQmlnQ29uZmlnLmxhc3RfcGFnZSA9IFwibmV3XCI7XG4gICAgaWYgKCByZWxvYWQgKSB7XG4gICAgICAgIHJldHVybiB1dGlsLnJlbG9hZFBhZ2UoKTtcbiAgICB9XG4gICAgc2lkZWJhci5zZWxlY3QoXCJuZXdcIiwgeyBjaGFuZ2VUaXRsZSA6IHRydWUgfSk7XG4gICAgY29uc3Qgc3RhcnRCdXR0b24gPSBidXR0b24oeyBjbHMgOiAnYWN0aXZlJywgaHRtbCA6ICdTdGFydCBFeHBlcmltZW50JywgaWQgOiAnc3RhcnRfZXhwZXJpbWVudF9idXR0b24nIH0pXG4gICAgICAgIC5jbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IHN1YmNvbmZpZyA9IEdsb2IuQmlnQ29uZmlnLmdldFN1YmNvbmZpZygpO1xuICAgICAgICAgICAgbGV0IGFjdGlvbiA9IGF3YWl0IE15QWxlcnQuYmlnLnRocmVlQnV0dG9ucyh7XG4gICAgICAgICAgICAgICAgdGl0bGUgOiBgUGxlYXNlIG1ha2Ugc3VyZSB0aGF0IHRoZSBsb2FkZWQgY29uZmlnLCBcIiR7c3ViY29uZmlnLm5hbWV9XCIsIGlzIGZpbmUuYCxcbiAgICAgICAgICAgICAgICBjb25maXJtQnV0dG9uVGV4dCA6IGBJdCdzIG9rLCBzdGFydCBleHBlcmltZW50YCxcbiAgICAgICAgICAgICAgICB0aGlyZEJ1dHRvblRleHQgOiAnT3BlbiBjb25maWdzIGRpcmVjdG9yeSBpbiBmaWxlIGJyb3dzZXInXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHsgYWN0aW9uIH0pO1xuICAgICAgICAgICAgc3dpdGNoICggYWN0aW9uICkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJjYW5jZWxcIjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJjb25maXJtXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGFydElmUmVhZHkoc3ViY29uZmlnKTtcbiAgICAgICAgICAgICAgICBjYXNlIFwidGhpcmRcIjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlbW90ZS5zaGVsbC5zaG93SXRlbUluRm9sZGVyKHBhdGguam9pbihDT05GSUdTX1BBVEhfQUJTLCBzdWJjb25maWcubmFtZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgR2xvYi5NYWluQ29udGVudC5hcHBlbmQoXG4gICAgICAgIC8vIHNlY3Rpb25zLmxldmVscyxcbiAgICAgICAgc2VjdGlvbnMuc2V0dGluZ3MsXG4gICAgICAgIHN0YXJ0QnV0dG9uXG4gICAgKTtcbiAgICBcbiAgICBcbn1cblxuYXN5bmMgZnVuY3Rpb24gc3RhcnRJZlJlYWR5KHN1YmNvbmZpZzogU3ViY29uZmlnKSB7XG4gICAgY29uc3QgbWlzc2luZ1R4dHMgPSBzdWJjb25maWcudHJ1dGgudHh0LmdldE1pc3NpbmcoKTtcbiAgICBcbiAgICBpZiAoIHV0aWwuYm9vbChtaXNzaW5nVHh0cykgKSB7XG4gICAgICAgIHJldHVybiBNeUFsZXJ0LmJpZy5vbmVCdXR0b24oYFRoZSB0cnV0aDogXCIke3N1YmNvbmZpZy50cnV0aC5uYW1lfVwiIGlzIG1pc3NpbmcgdGhlIGZvbGxvd2luZyB0eHQgZmlsZXM6YCwgeyB0ZXh0IDogbWlzc2luZ1R4dHMuam9pbignLCAnKSB9KVxuICAgIH1cbiAgICAvLyAvIFR4dHMgZXhpc3RcbiAgICBpZiAoICFzdWJjb25maWcudHJ1dGgubWlkaS5leGlzdHMoKSApIHtcbiAgICAgICAgaWYgKCBHbG9iLkJpZ0NvbmZpZy5kZXYuc2tpcF9taWRpX2V4aXN0c19jaGVjaygpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBcIiR7c3ViY29uZmlnLnRydXRoLm5hbWV9XCIgaXMgbWlzc2luZyBhIG1pZGkgZmlsZSBidXQgY29udGludWluZyBjdXogZGV2b3B0aW9uc2ApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIE15QWxlcnQuYmlnLm9uZUJ1dHRvbihgVGhlIHRydXRoOiBcIiR7c3ViY29uZmlnLnRydXRoLm5hbWV9XCIgaXMgbWlzc2luZyBhIG1pZGkgZmlsZWApXG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gLyBtaWRpIGV4aXN0XG4gICAgaWYgKCBzdWJjb25maWcuZGVtb190eXBlID09PSBcInZpZGVvXCIgKSB7XG4gICAgICAgIGNvbnN0IG1wNEV4aXN0cyA9IHN1YmNvbmZpZy50cnV0aC5tcDQuZXhpc3RzKCk7XG4gICAgICAgIGNvbnN0IG9uc2V0c0V4aXN0cyA9IHN1YmNvbmZpZy50cnV0aC5vbnNldHMuZXhpc3RzKCk7XG4gICAgICAgIGlmICggIXV0aWwuYWxsKG1wNEV4aXN0cywgb25zZXRzRXhpc3RzKSApIHtcbiAgICAgICAgICAgIGNvbnN0IG1pc3NpbmdOYW1lcyA9IFtdO1xuICAgICAgICAgICAgaWYgKCAhbXA0RXhpc3RzIClcbiAgICAgICAgICAgICAgICBtaXNzaW5nTmFtZXMucHVzaChcIm1wNFwiKTtcbiAgICAgICAgICAgIGlmICggIW9uc2V0c0V4aXN0cyApXG4gICAgICAgICAgICAgICAgbWlzc2luZ05hbWVzLnB1c2goXCJvbnNldHNcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBNeUFsZXJ0LmJpZy5vbmVCdXR0b24oYFRoZSB0cnV0aDogXCIke3N1YmNvbmZpZy50cnV0aC5uYW1lfVwiIGlzIG1pc3NpbmcgdGhlIGZvbGxvd2luZyBmaWxlczpgLCB7XG4gICAgICAgICAgICAgICAgdGV4dCA6IG1pc3NpbmdOYW1lcy5qb2luKCcsICcpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIC8gbXA0IGFuZCBvbnNldHMgZXhpc3RcbiAgICByZXR1cm4gcnVubmluZ1BhZ2UubG9hZCh0cnVlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgeyBsb2FkIH1cbiJdfQ==