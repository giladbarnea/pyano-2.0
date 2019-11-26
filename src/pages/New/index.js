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
        util.reloadPage();
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
                break;
            case "third":
                return electron_1.remote.shell.showItemInFolder(path.join(CONFIGS_PATH_ABS, subconfig.name));
        }
    });
    Glob_1.default.MainContent.append(sections_1.default.settings, startButton);
}
exports.default = { load };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLHFDQUE4QjtBQUM5QixtQ0FBa0M7QUFDbEMsd0NBQWlDO0FBQ2pDLHlDQUFpQztBQUNqQyxtQ0FBbUM7QUFDbkMsMkNBQW1DO0FBQ25DLDZCQUE2QjtBQUM3Qix1Q0FBa0M7QUFFbEMsS0FBSyxVQUFVLElBQUksQ0FBQyxNQUFlO0lBRS9CLGNBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUNqQyxJQUFLLE1BQU0sRUFBRztRQUNWLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztLQUNyQjtJQUNELGlCQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLFdBQVcsRUFBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLE1BQU0sV0FBVyxHQUFHLFlBQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRyxRQUFRLEVBQUUsSUFBSSxFQUFHLGtCQUFrQixFQUFFLEVBQUUsRUFBRyx5QkFBeUIsRUFBRSxDQUFDO1NBQ3BHLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtRQUVkLE1BQU0sU0FBUyxHQUFHLGNBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDaEQsSUFBSSxNQUFNLEdBQUcsTUFBTSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7WUFDeEMsS0FBSyxFQUFHLDZDQUE2QyxTQUFTLENBQUMsSUFBSSxhQUFhO1lBQ2hGLGlCQUFpQixFQUFHLDJCQUEyQjtZQUMvQyxlQUFlLEVBQUcsd0NBQXdDO1NBQzdELENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3hCLFFBQVMsTUFBTSxFQUFHO1lBQ2QsS0FBSyxRQUFRO2dCQUNULE9BQU87WUFDWCxLQUFLLFNBQVM7Z0JBQ1YsTUFBSztZQUNULEtBQUssT0FBTztnQkFDUixPQUFPLGlCQUFNLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDekY7SUFHTCxDQUFDLENBQUMsQ0FBQztJQUNQLGNBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUVuQixrQkFBUSxDQUFDLFFBQVEsRUFDakIsV0FBVyxDQUVkLENBQUM7QUFHTixDQUFDO0FBRUQsa0JBQWUsRUFBRSxJQUFJLEVBQUUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vICogIHBhZ2VzL05ldy9pbmRleC50c1xuLyoqaW1wb3J0IG5ld1BhZ2UgZnJvbSBcIi4vTmV3XCI7Ki9cbmltcG9ydCBHbG9iIGZyb20gXCIuLi8uLi9HbG9iXCI7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4uLy4uL3V0aWwnXG5pbXBvcnQgc2lkZWJhciBmcm9tIFwiLi4vc2lkZWJhclwiO1xuaW1wb3J0IHNlY3Rpb25zIGZyb20gXCIuL3NlY3Rpb25zXCJcbmltcG9ydCB7IGJ1dHRvbiB9IGZyb20gXCIuLi8uLi9iaGVcIjtcbmltcG9ydCBNeUFsZXJ0IGZyb20gJy4uLy4uL015QWxlcnQnXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyByZW1vdGUgfSBmcm9tICdlbGVjdHJvbic7XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWQocmVsb2FkOiBib29sZWFuKSB7XG4gICAgLy8gY29uc3QgeyBleGFtLCB0ZXN0IH0gPSBHbG9iLkJpZ0NvbmZpZztcbiAgICBHbG9iLkJpZ0NvbmZpZy5sYXN0X3BhZ2UgPSBcIm5ld1wiO1xuICAgIGlmICggcmVsb2FkICkge1xuICAgICAgICB1dGlsLnJlbG9hZFBhZ2UoKTtcbiAgICB9XG4gICAgc2lkZWJhci5zZWxlY3QoXCJuZXdcIiwgeyBjaGFuZ2VUaXRsZSA6IHRydWUgfSk7XG4gICAgY29uc3Qgc3RhcnRCdXR0b24gPSBidXR0b24oeyBjbHMgOiAnYWN0aXZlJywgaHRtbCA6ICdTdGFydCBFeHBlcmltZW50JywgaWQgOiAnc3RhcnRfZXhwZXJpbWVudF9idXR0b24nIH0pXG4gICAgICAgIC5jbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IHN1YmNvbmZpZyA9IEdsb2IuQmlnQ29uZmlnLmdldFN1YmNvbmZpZygpO1xuICAgICAgICAgICAgbGV0IGFjdGlvbiA9IGF3YWl0IE15QWxlcnQuYmlnLnRocmVlQnV0dG9ucyh7XG4gICAgICAgICAgICAgICAgdGl0bGUgOiBgUGxlYXNlIG1ha2Ugc3VyZSB0aGF0IHRoZSBsb2FkZWQgY29uZmlnLCBcIiR7c3ViY29uZmlnLm5hbWV9XCIsIGlzIGZpbmUuYCxcbiAgICAgICAgICAgICAgICBjb25maXJtQnV0dG9uVGV4dCA6IGBJdCdzIG9rLCBzdGFydCBleHBlcmltZW50YCxcbiAgICAgICAgICAgICAgICB0aGlyZEJ1dHRvblRleHQgOiAnT3BlbiBjb25maWdzIGRpcmVjdG9yeSBpbiBmaWxlIGJyb3dzZXInXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHsgYWN0aW9uIH0pO1xuICAgICAgICAgICAgc3dpdGNoICggYWN0aW9uICkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJjYW5jZWxcIjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJjb25maXJtXCI6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSBcInRoaXJkXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZW1vdGUuc2hlbGwuc2hvd0l0ZW1JbkZvbGRlcihwYXRoLmpvaW4oQ09ORklHU19QQVRIX0FCUywgc3ViY29uZmlnLm5hbWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgIEdsb2IuTWFpbkNvbnRlbnQuYXBwZW5kKFxuICAgICAgICAvLyBzZWN0aW9ucy5sZXZlbHMsXG4gICAgICAgIHNlY3Rpb25zLnNldHRpbmdzLFxuICAgICAgICBzdGFydEJ1dHRvblxuICAgICAgICAvLyBHdWkuJHJlYWR5U2F2ZUxvYWRTYXZlYXMoKSxcbiAgICApO1xuICAgIFxuICAgIFxufVxuXG5leHBvcnQgZGVmYXVsdCB7IGxvYWQgfVxuIl19