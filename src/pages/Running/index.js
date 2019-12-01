"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Glob_1 = require("../../Glob");
const util = require("../../util");
const bhe_1 = require("../../bhe");
const experiment_1 = require("./experiment");
const MyPyShell_1 = require("../../MyPyShell");
async function load(reload) {
    console.group(`pages.Running.index.load(${reload})`);
    Glob_1.default.BigConfig.last_page = "running";
    if (reload) {
        console.groupEnd();
        return util.reloadPage();
    }
    Glob_1.default.skipFade = Glob_1.default.BigConfig.dev.skip_fade();
    Glob_1.default.Sidebar.remove();
    const subconfig = Glob_1.default.BigConfig.getSubconfig();
    Glob_1.default.Title
        .html(`${subconfig.truth.name}`)
        .cacheAppend({
        levelh3: bhe_1.elem({
            tag: 'h3'
        }),
        trialh3: bhe_1.elem({
            tag: 'h3'
        })
    });
    const PY_getOnOffPairs = new MyPyShell_1.MyPyShell('-m txt.get_on_off_pairs', {
        mode: "json",
        args: [subconfig.truth_file]
    });
    const on_off_pairs = await PY_getOnOffPairs.runAsync();
    console.log({ on_off_pairs });
    let readonlyTruth = subconfig.truth.toReadOnly();
    const experiment = new experiment_1.default(subconfig.demo_type);
    await experiment.init(readonlyTruth);
    if (Glob_1.default.BigConfig.experiment_type === "test") {
        await experiment.intro();
    }
    const levelCollection = subconfig.getLevelCollection();
    await experiment.levelIntro(levelCollection);
    console.groupEnd();
}
exports.load = load;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUE4QjtBQUM5QixtQ0FBbUM7QUFDbkMsbUNBQWlDO0FBT2pDLDZDQUFzQztBQUN0QywrQ0FBNEM7QUFPNUMsS0FBSyxVQUFVLElBQUksQ0FBQyxNQUFlO0lBRS9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFFckQsY0FBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQ3JDLElBQUssTUFBTSxFQUFHO1FBQ1YsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQzVCO0lBQ0QsY0FBSSxDQUFDLFFBQVEsR0FBRyxjQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUUvQyxjQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3RCLE1BQU0sU0FBUyxHQUFHLGNBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7SUFHaEQsY0FBSSxDQUFDLEtBQUs7U0FDTCxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1NBRS9CLFdBQVcsQ0FBQztRQUNULE9BQU8sRUFBRyxVQUFJLENBQUM7WUFDWCxHQUFHLEVBQUcsSUFBSTtTQUNiLENBQUM7UUFDRixPQUFPLEVBQUcsVUFBSSxDQUFDO1lBQ1gsR0FBRyxFQUFHLElBQUk7U0FDYixDQUFDO0tBQ0wsQ0FBQyxDQUFDO0lBQ1AsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLHFCQUFTLENBQUMseUJBQXlCLEVBQUU7UUFDOUQsSUFBSSxFQUFHLE1BQU07UUFDYixJQUFJLEVBQUcsQ0FBRSxTQUFTLENBQUMsVUFBVSxDQUFFO0tBQ2xDLENBQUMsQ0FBQztJQUNILE1BQU0sWUFBWSxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7SUFDOUIsSUFBSSxhQUFhLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNqRCxNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZELE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNyQyxJQUFLLGNBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxLQUFLLE1BQU0sRUFBRztRQUU3QyxNQUFNLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUM1QjtJQUNELE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQ3ZELE1BQU0sVUFBVSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUM3QyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7QUFFdkIsQ0FBQztBQUVRLG9CQUFJIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEdsb2IgZnJvbSBcIi4uLy4uL0dsb2JcIjtcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSBcIi4uLy4uL3V0aWxcIjtcbmltcG9ydCB7IGVsZW0gfSBmcm9tIFwiLi4vLi4vYmhlXCI7XG4vLyBpbXBvcnQga2V5Ym9hcmQgZnJvbSAnLi9rZXlib2FyZCdcbi8vIGltcG9ydCBEaWFsb2cgZnJvbSAnLi9kaWFsb2cnXG4vLyBpbXBvcnQgeyBQaWFubyB9IGZyb20gXCIuLi8uLi9QaWFub1wiXG4vLyBpbXBvcnQgeyBQaWFubywgUGlhbm9PcHRpb25zIH0gZnJvbSBcIi4uLy4uL1BpYW5vXCJcbi8vIGltcG9ydCB7IE1pZGkgfSBmcm9tIFwiQHRvbmVqcy9taWRpXCI7XG5pbXBvcnQgKiBhcyBUb25lIGZyb20gXCJ0b25lXCI7XG5pbXBvcnQgRXhwZXJpbWVudCBmcm9tIFwiLi9leHBlcmltZW50XCI7XG5pbXBvcnQgeyBNeVB5U2hlbGwgfSBmcm9tIFwiLi4vLi4vTXlQeVNoZWxsXCI7XG5cbi8vIGNvbnN0IHsgUGlhbm8gfSA9IHJlcXVpcmUoXCJAdG9uZWpzL3BpYW5vXCIpO1xuXG5cbi8qKnJlcXVpcmUoJy4vUnVubmluZycpLmxvYWQoKVxuICogRE9OVCBpbXBvcnQgKiBhcyBydW5uaW5nUGFnZSwgdGhpcyBjYWxscyBjb25zdHJ1Y3RvcnMgZXRjKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWQocmVsb2FkOiBib29sZWFuKSB7XG4gICAgLy8gKiogIFBlcmZvcm1hbmNlLCB2aXN1YWxzIHN5bmM6IGh0dHBzOi8vZ2l0aHViLmNvbS9Ub25lanMvVG9uZS5qcy93aWtpL1BlcmZvcm1hbmNlXG4gICAgY29uc29sZS5ncm91cChgcGFnZXMuUnVubmluZy5pbmRleC5sb2FkKCR7cmVsb2FkfSlgKTtcbiAgICBcbiAgICBHbG9iLkJpZ0NvbmZpZy5sYXN0X3BhZ2UgPSBcInJ1bm5pbmdcIjtcbiAgICBpZiAoIHJlbG9hZCApIHtcbiAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgICAgICByZXR1cm4gdXRpbC5yZWxvYWRQYWdlKCk7XG4gICAgfVxuICAgIEdsb2Iuc2tpcEZhZGUgPSBHbG9iLkJpZ0NvbmZpZy5kZXYuc2tpcF9mYWRlKCk7XG4gICAgXG4gICAgR2xvYi5TaWRlYmFyLnJlbW92ZSgpO1xuICAgIGNvbnN0IHN1YmNvbmZpZyA9IEdsb2IuQmlnQ29uZmlnLmdldFN1YmNvbmZpZygpO1xuICAgIFxuICAgIFxuICAgIEdsb2IuVGl0bGVcbiAgICAgICAgLmh0bWwoYCR7c3ViY29uZmlnLnRydXRoLm5hbWV9YClcbiAgICBcbiAgICAgICAgLmNhY2hlQXBwZW5kKHtcbiAgICAgICAgICAgIGxldmVsaDMgOiBlbGVtKHtcbiAgICAgICAgICAgICAgICB0YWcgOiAnaDMnXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHRyaWFsaDMgOiBlbGVtKHtcbiAgICAgICAgICAgICAgICB0YWcgOiAnaDMnXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICBjb25zdCBQWV9nZXRPbk9mZlBhaXJzID0gbmV3IE15UHlTaGVsbCgnLW0gdHh0LmdldF9vbl9vZmZfcGFpcnMnLCB7XG4gICAgICAgIG1vZGUgOiBcImpzb25cIixcbiAgICAgICAgYXJncyA6IFsgc3ViY29uZmlnLnRydXRoX2ZpbGUgXVxuICAgIH0pO1xuICAgIGNvbnN0IG9uX29mZl9wYWlycyA9IGF3YWl0IFBZX2dldE9uT2ZmUGFpcnMucnVuQXN5bmMoKTtcbiAgICBjb25zb2xlLmxvZyh7IG9uX29mZl9wYWlycyB9KTtcbiAgICBsZXQgcmVhZG9ubHlUcnV0aCA9IHN1YmNvbmZpZy50cnV0aC50b1JlYWRPbmx5KCk7XG4gICAgY29uc3QgZXhwZXJpbWVudCA9IG5ldyBFeHBlcmltZW50KHN1YmNvbmZpZy5kZW1vX3R5cGUpO1xuICAgIGF3YWl0IGV4cGVyaW1lbnQuaW5pdChyZWFkb25seVRydXRoKTtcbiAgICBpZiAoIEdsb2IuQmlnQ29uZmlnLmV4cGVyaW1lbnRfdHlwZSA9PT0gXCJ0ZXN0XCIgKSB7XG4gICAgICAgIC8vIFRPRE86IGxpbWl0IGJ5IG1heE5vdGVzXG4gICAgICAgIGF3YWl0IGV4cGVyaW1lbnQuaW50cm8oKTtcbiAgICB9XG4gICAgY29uc3QgbGV2ZWxDb2xsZWN0aW9uID0gc3ViY29uZmlnLmdldExldmVsQ29sbGVjdGlvbigpO1xuICAgIGF3YWl0IGV4cGVyaW1lbnQubGV2ZWxJbnRybyhsZXZlbENvbGxlY3Rpb24pO1xuICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICBcbn1cblxuZXhwb3J0IHsgbG9hZCB9XG4iXX0=