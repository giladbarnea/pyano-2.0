"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Glob_1 = require("../../Glob");
const util = require("../../util");
const bhe_1 = require("../../bhe");
const Tone = require("tone");
const experiment_1 = require("./experiment");
async function load(reload) {
    console.group(`pages.Running.index.load(${reload})`);
    Glob_1.default.BigConfig.last_page = "running";
    if (reload) {
        console.groupEnd();
        return util.reloadPage();
    }
    Glob_1.default.skipFade = Glob_1.default.BigConfig.dev.skip_fade();
    Tone.context.latencyHint = "playback";
    Glob_1.default.Sidebar.remove();
    const subconfig = Glob_1.default.BigConfig.getSubconfig();
    const levelCollection = subconfig.getLevelCollection();
    Glob_1.default.Title
        .html(`${subconfig.truth.name}`)
        .cacheAppend({ h3: bhe_1.elem({ tag: 'h3', text: `Level1/1` }) });
    const experiment = new experiment_1.default(subconfig.demo_type);
    let readonlyTruth = subconfig.truth.toReadOnly();
    if (Glob_1.default.BigConfig.experiment_type === "test") {
        await experiment.intro(readonlyTruth);
    }
    console.groupEnd();
}
exports.load = load;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUE4QjtBQUM5QixtQ0FBbUM7QUFDbkMsbUNBQWlDO0FBTWpDLDZCQUE2QjtBQUM3Qiw2Q0FBc0M7QUFPdEMsS0FBSyxVQUFVLElBQUksQ0FBQyxNQUFlO0lBRS9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFFckQsY0FBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQ3JDLElBQUssTUFBTSxFQUFHO1FBQ1YsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQzVCO0lBQ0QsY0FBSSxDQUFDLFFBQVEsR0FBRyxjQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUMvQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7SUFDdEMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN0QixNQUFNLFNBQVMsR0FBRyxjQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ2hELE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQ3ZELGNBQUksQ0FBQyxLQUFLO1NBQ0wsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUMvQixXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUcsVUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFHLElBQUksRUFBRSxJQUFJLEVBQUcsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbkUsTUFBTSxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RCxJQUFJLGFBQWEsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ2pELElBQUssY0FBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEtBQUssTUFBTSxFQUFHO1FBQzdDLE1BQU0sVUFBVSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUN6QztJQUVELE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUV2QixDQUFDO0FBRVEsb0JBQUkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgR2xvYiBmcm9tIFwiLi4vLi4vR2xvYlwiO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tIFwiLi4vLi4vdXRpbFwiO1xuaW1wb3J0IHsgZWxlbSB9IGZyb20gXCIuLi8uLi9iaGVcIjtcbi8vIGltcG9ydCBrZXlib2FyZCBmcm9tICcuL2tleWJvYXJkJ1xuLy8gaW1wb3J0IERpYWxvZyBmcm9tICcuL2RpYWxvZydcbi8vIGltcG9ydCB7IFBpYW5vIH0gZnJvbSBcIi4uLy4uL1BpYW5vXCJcbi8vIGltcG9ydCB7IFBpYW5vLCBQaWFub09wdGlvbnMgfSBmcm9tIFwiLi4vLi4vUGlhbm9cIlxuLy8gaW1wb3J0IHsgTWlkaSB9IGZyb20gXCJAdG9uZWpzL21pZGlcIjtcbmltcG9ydCAqIGFzIFRvbmUgZnJvbSBcInRvbmVcIjtcbmltcG9ydCBFeHBlcmltZW50IGZyb20gXCIuL2V4cGVyaW1lbnRcIjtcblxuLy8gY29uc3QgeyBQaWFubyB9ID0gcmVxdWlyZShcIkB0b25lanMvcGlhbm9cIik7XG5cblxuLyoqcmVxdWlyZSgnLi9SdW5uaW5nJykubG9hZCgpXG4gKiBET05UIGltcG9ydCAqIGFzIHJ1bm5pbmdQYWdlLCB0aGlzIGNhbGxzIGNvbnN0cnVjdG9ycyBldGMqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZChyZWxvYWQ6IGJvb2xlYW4pIHtcbiAgICAvLyAqKiAgUGVyZm9ybWFuY2UsIHZpc3VhbHMgc3luYzogaHR0cHM6Ly9naXRodWIuY29tL1RvbmVqcy9Ub25lLmpzL3dpa2kvUGVyZm9ybWFuY2VcbiAgICBjb25zb2xlLmdyb3VwKGBwYWdlcy5SdW5uaW5nLmluZGV4LmxvYWQoJHtyZWxvYWR9KWApO1xuICAgIFxuICAgIEdsb2IuQmlnQ29uZmlnLmxhc3RfcGFnZSA9IFwicnVubmluZ1wiO1xuICAgIGlmICggcmVsb2FkICkge1xuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgIHJldHVybiB1dGlsLnJlbG9hZFBhZ2UoKTtcbiAgICB9XG4gICAgR2xvYi5za2lwRmFkZSA9IEdsb2IuQmlnQ29uZmlnLmRldi5za2lwX2ZhZGUoKTtcbiAgICBUb25lLmNvbnRleHQubGF0ZW5jeUhpbnQgPSBcInBsYXliYWNrXCI7IC8vIFRPRE86IHRoaXMgc2hvdWxkIGJlIHVuZGVyIGtleWJhcmQudHNcbiAgICBHbG9iLlNpZGViYXIucmVtb3ZlKCk7XG4gICAgY29uc3Qgc3ViY29uZmlnID0gR2xvYi5CaWdDb25maWcuZ2V0U3ViY29uZmlnKCk7XG4gICAgY29uc3QgbGV2ZWxDb2xsZWN0aW9uID0gc3ViY29uZmlnLmdldExldmVsQ29sbGVjdGlvbigpO1xuICAgIEdsb2IuVGl0bGVcbiAgICAgICAgLmh0bWwoYCR7c3ViY29uZmlnLnRydXRoLm5hbWV9YClcbiAgICAgICAgLmNhY2hlQXBwZW5kKHsgaDMgOiBlbGVtKHsgdGFnIDogJ2gzJywgdGV4dCA6IGBMZXZlbDEvMWAgfSkgfSk7XG4gICAgY29uc3QgZXhwZXJpbWVudCA9IG5ldyBFeHBlcmltZW50KHN1YmNvbmZpZy5kZW1vX3R5cGUpO1xuICAgIGxldCByZWFkb25seVRydXRoID0gc3ViY29uZmlnLnRydXRoLnRvUmVhZE9ubHkoKTtcbiAgICBpZiAoIEdsb2IuQmlnQ29uZmlnLmV4cGVyaW1lbnRfdHlwZSA9PT0gXCJ0ZXN0XCIgKSB7XG4gICAgICAgIGF3YWl0IGV4cGVyaW1lbnQuaW50cm8ocmVhZG9ubHlUcnV0aCk7XG4gICAgfVxuICAgIFxuICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICBcbn1cblxuZXhwb3J0IHsgbG9hZCB9XG4iXX0=