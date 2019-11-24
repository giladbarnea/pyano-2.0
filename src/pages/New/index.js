"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Glob_1 = require("../../Glob");
const util = require("../../util");
const sidebar_1 = require("../sidebar");
const sections_1 = require("./sections");
async function load(reload) {
    Glob_1.default.BigConfig.last_page = "new";
    if (reload) {
        util.reloadPage();
    }
    sidebar_1.default.select("new", { changeTitle: true });
    Glob_1.default.MainContent.append(sections_1.default.subject);
}
exports.default = { load };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLHFDQUE4QjtBQUM5QixtQ0FBa0M7QUFDbEMsd0NBQWlDO0FBQ2pDLHlDQUFpQztBQUVqQyxLQUFLLFVBQVUsSUFBSSxDQUFDLE1BQWU7SUFFL0IsY0FBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ2pDLElBQUssTUFBTSxFQUFHO1FBQ1YsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQ3JCO0lBQ0QsaUJBQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFHLElBQUksRUFBRSxDQUFDLENBQUM7SUFDOUMsY0FBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBR25CLGtCQUFRLENBQUMsT0FBTyxDQUVuQixDQUFDO0FBR04sQ0FBQztBQUVELGtCQUFlLEVBQUUsSUFBSSxFQUFFLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAqICBwYWdlcy9OZXcvaW5kZXgudHNcbi8qKmltcG9ydCBuZXdQYWdlIGZyb20gXCIuL05ld1wiOyovXG5pbXBvcnQgR2xvYiBmcm9tIFwiLi4vLi4vR2xvYlwiO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuLi8uLi91dGlsJ1xuaW1wb3J0IHNpZGViYXIgZnJvbSBcIi4uL3NpZGViYXJcIjtcbmltcG9ydCBzZWN0aW9ucyBmcm9tIFwiLi9zZWN0aW9uc1wiXG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWQocmVsb2FkOiBib29sZWFuKSB7XG4gICAgLy8gY29uc3QgeyBleGFtLCB0ZXN0IH0gPSBHbG9iLkJpZ0NvbmZpZztcbiAgICBHbG9iLkJpZ0NvbmZpZy5sYXN0X3BhZ2UgPSBcIm5ld1wiO1xuICAgIGlmICggcmVsb2FkICkge1xuICAgICAgICB1dGlsLnJlbG9hZFBhZ2UoKTtcbiAgICB9XG4gICAgc2lkZWJhci5zZWxlY3QoXCJuZXdcIiwgeyBjaGFuZ2VUaXRsZSA6IHRydWUgfSk7XG4gICAgR2xvYi5NYWluQ29udGVudC5hcHBlbmQoXG4gICAgICAgIC8vIHNlY3Rpb25zLmxldmVscyxcbiAgICAgICAgLy8gc2VjdGlvbnMuc2V0dGluZ3MsXG4gICAgICAgIHNlY3Rpb25zLnN1YmplY3QsXG4gICAgICAgIC8vIEd1aS4kcmVhZHlTYXZlTG9hZFNhdmVhcygpLFxuICAgICk7XG4gICAgXG4gICAgXG59XG5cbmV4cG9ydCBkZWZhdWx0IHsgbG9hZCB9XG4iXX0=