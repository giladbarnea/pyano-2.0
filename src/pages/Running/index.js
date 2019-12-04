"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Glob_1 = require("../../Glob");
const util = require("../../util");
const bhe_1 = require("../../bhe");
const experiment_1 = require("./experiment");
const MyAlert_1 = require("../../MyAlert");
async function load(reload) {
    console.group(`Running.index.load(${reload})`);
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
    let readonlyTruth = subconfig.truth.toReadOnly();
    console.time(`new Experiment() and init()`);
    const experiment = new experiment_1.default(subconfig.demo_type);
    await experiment.init(readonlyTruth);
    console.timeEnd(`new Experiment() and init()`);
    if (Glob_1.default.BigConfig.experiment_type === "test" || Glob_1.default.BigConfig.dev.simulate_test_mode('Running.index.ts')) {
        if (!Glob_1.default.BigConfig.dev.skip_experiment_intro('Running.index.ts')) {
            try {
                await experiment.intro();
            }
            catch (e) {
                const { where, what } = e.toObj();
                await MyAlert_1.default.big.error({
                    title: 'An error has occurred when trying to play experiment intro',
                    html: `${what}<p>${where}</p>`
                });
                throw e;
            }
        }
    }
    const levelCollection = subconfig.getLevelCollection();
    try {
        await experiment.levelIntro(levelCollection);
    }
    catch (e) {
        const { where, what } = e.toObj();
        await MyAlert_1.default.big.error({
            title: 'An error has occurred while trying to play levelIntro',
            html: `${what}<p>${where}</p>`
        });
        throw e;
    }
    console.groupEnd();
}
exports.load = load;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUE4QjtBQUM5QixtQ0FBbUM7QUFDbkMsbUNBQWlDO0FBTWpDLDZDQUFzQztBQUN0QywyQ0FBb0M7QUFPcEMsS0FBSyxVQUFVLElBQUksQ0FBQyxNQUFlO0lBRS9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsc0JBQXNCLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFFL0MsY0FBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQ3JDLElBQUssTUFBTSxFQUFHO1FBQ1YsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQzVCO0lBQ0QsY0FBSSxDQUFDLFFBQVEsR0FBRyxjQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUUvQyxjQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3RCLE1BQU0sU0FBUyxHQUFHLGNBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7SUFHaEQsY0FBSSxDQUFDLEtBQUs7U0FDTCxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1NBRS9CLFdBQVcsQ0FBQztRQUNULE9BQU8sRUFBRyxVQUFJLENBQUM7WUFDWCxHQUFHLEVBQUcsSUFBSTtTQUNiLENBQUM7UUFDRixPQUFPLEVBQUcsVUFBSSxDQUFDO1lBQ1gsR0FBRyxFQUFHLElBQUk7U0FDYixDQUFDO0tBQ0wsQ0FBQyxDQUFDO0lBR1AsSUFBSSxhQUFhLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNqRCxPQUFPLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFDNUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RCxNQUFNLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDckMsT0FBTyxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBQy9DLElBQUssY0FBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEtBQUssTUFBTSxJQUFJLGNBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLEVBQUc7UUFDMUcsSUFBSyxDQUFDLGNBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLGtCQUFrQixDQUFDLEVBQUc7WUFFakUsSUFBSTtnQkFDQSxNQUFNLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUU1QjtZQUFDLE9BQVEsQ0FBQyxFQUFHO2dCQUNWLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNsQyxNQUFNLGlCQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztvQkFDcEIsS0FBSyxFQUFHLDREQUE0RDtvQkFDcEUsSUFBSSxFQUFHLEdBQUcsSUFBSSxNQUFNLEtBQUssTUFBTTtpQkFDbEMsQ0FBQyxDQUFDO2dCQUNILE1BQU0sQ0FBQyxDQUFBO2FBQ1Y7U0FDSjtLQUNKO0lBQ0QsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFHdkQsSUFBSTtRQUNBLE1BQU0sVUFBVSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUVoRDtJQUFDLE9BQVEsQ0FBQyxFQUFHO1FBQ1YsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbEMsTUFBTSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFDcEIsS0FBSyxFQUFHLHVEQUF1RDtZQUMvRCxJQUFJLEVBQUcsR0FBRyxJQUFJLE1BQU0sS0FBSyxNQUFNO1NBQ2xDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxDQUFBO0tBQ1Y7SUFDRCxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7QUFFdkIsQ0FBQztBQUVRLG9CQUFJIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEdsb2IgZnJvbSBcIi4uLy4uL0dsb2JcIjtcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSBcIi4uLy4uL3V0aWxcIjtcbmltcG9ydCB7IGVsZW0gfSBmcm9tIFwiLi4vLi4vYmhlXCI7XG4vLyBpbXBvcnQga2V5Ym9hcmQgZnJvbSAnLi9rZXlib2FyZCdcbi8vIGltcG9ydCBEaWFsb2cgZnJvbSAnLi9kaWFsb2cnXG4vLyBpbXBvcnQgeyBQaWFubyB9IGZyb20gXCIuLi8uLi9QaWFub1wiXG4vLyBpbXBvcnQgeyBQaWFubywgUGlhbm9PcHRpb25zIH0gZnJvbSBcIi4uLy4uL1BpYW5vXCJcbi8vIGltcG9ydCB7IE1pZGkgfSBmcm9tIFwiQHRvbmVqcy9taWRpXCI7XG5pbXBvcnQgRXhwZXJpbWVudCBmcm9tIFwiLi9leHBlcmltZW50XCI7XG5pbXBvcnQgTXlBbGVydCBmcm9tIFwiLi4vLi4vTXlBbGVydFwiO1xuXG4vLyBjb25zdCB7IFBpYW5vIH0gPSByZXF1aXJlKFwiQHRvbmVqcy9waWFub1wiKTtcblxuXG4vKipyZXF1aXJlKCcuL1J1bm5pbmcnKS5sb2FkKClcbiAqIERPTlQgaW1wb3J0ICogYXMgcnVubmluZ1BhZ2UsIHRoaXMgY2FsbHMgY29uc3RydWN0b3JzIGV0YyovXG5hc3luYyBmdW5jdGlvbiBsb2FkKHJlbG9hZDogYm9vbGVhbikge1xuICAgIC8vICoqICBQZXJmb3JtYW5jZSwgdmlzdWFscyBzeW5jOiBodHRwczovL2dpdGh1Yi5jb20vVG9uZWpzL1RvbmUuanMvd2lraS9QZXJmb3JtYW5jZVxuICAgIGNvbnNvbGUuZ3JvdXAoYFJ1bm5pbmcuaW5kZXgubG9hZCgke3JlbG9hZH0pYCk7XG4gICAgXG4gICAgR2xvYi5CaWdDb25maWcubGFzdF9wYWdlID0gXCJydW5uaW5nXCI7XG4gICAgaWYgKCByZWxvYWQgKSB7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgcmV0dXJuIHV0aWwucmVsb2FkUGFnZSgpO1xuICAgIH1cbiAgICBHbG9iLnNraXBGYWRlID0gR2xvYi5CaWdDb25maWcuZGV2LnNraXBfZmFkZSgpO1xuICAgIFxuICAgIEdsb2IuU2lkZWJhci5yZW1vdmUoKTtcbiAgICBjb25zdCBzdWJjb25maWcgPSBHbG9iLkJpZ0NvbmZpZy5nZXRTdWJjb25maWcoKTtcbiAgICBcbiAgICBcbiAgICBHbG9iLlRpdGxlXG4gICAgICAgIC5odG1sKGAke3N1YmNvbmZpZy50cnV0aC5uYW1lfWApXG4gICAgXG4gICAgICAgIC5jYWNoZUFwcGVuZCh7XG4gICAgICAgICAgICBsZXZlbGgzIDogZWxlbSh7XG4gICAgICAgICAgICAgICAgdGFnIDogJ2gzJ1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB0cmlhbGgzIDogZWxlbSh7XG4gICAgICAgICAgICAgICAgdGFnIDogJ2gzJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgXG4gICAgXG4gICAgbGV0IHJlYWRvbmx5VHJ1dGggPSBzdWJjb25maWcudHJ1dGgudG9SZWFkT25seSgpO1xuICAgIGNvbnNvbGUudGltZShgbmV3IEV4cGVyaW1lbnQoKSBhbmQgaW5pdCgpYCk7XG4gICAgY29uc3QgZXhwZXJpbWVudCA9IG5ldyBFeHBlcmltZW50KHN1YmNvbmZpZy5kZW1vX3R5cGUpO1xuICAgIGF3YWl0IGV4cGVyaW1lbnQuaW5pdChyZWFkb25seVRydXRoKTtcbiAgICBjb25zb2xlLnRpbWVFbmQoYG5ldyBFeHBlcmltZW50KCkgYW5kIGluaXQoKWApO1xuICAgIGlmICggR2xvYi5CaWdDb25maWcuZXhwZXJpbWVudF90eXBlID09PSBcInRlc3RcIiB8fCBHbG9iLkJpZ0NvbmZpZy5kZXYuc2ltdWxhdGVfdGVzdF9tb2RlKCdSdW5uaW5nLmluZGV4LnRzJykgKSB7XG4gICAgICAgIGlmICggIUdsb2IuQmlnQ29uZmlnLmRldi5za2lwX2V4cGVyaW1lbnRfaW50cm8oJ1J1bm5pbmcuaW5kZXgudHMnKSApIHtcbiAgICAgICAgICAgIC8vIFRPRE86IGxpbWl0IGJ5IG1heE5vdGVzXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGV4cGVyaW1lbnQuaW50cm8oKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gY2F0Y2ggKCBlICkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgd2hlcmUsIHdoYXQgfSA9IGUudG9PYmooKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBNeUFsZXJ0LmJpZy5lcnJvcih7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlIDogJ0FuIGVycm9yIGhhcyBvY2N1cnJlZCB3aGVuIHRyeWluZyB0byBwbGF5IGV4cGVyaW1lbnQgaW50cm8nLFxuICAgICAgICAgICAgICAgICAgICBodG1sIDogYCR7d2hhdH08cD4ke3doZXJlfTwvcD5gXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGxldmVsQ29sbGVjdGlvbiA9IHN1YmNvbmZpZy5nZXRMZXZlbENvbGxlY3Rpb24oKTtcbiAgICBcbiAgICBcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBleHBlcmltZW50LmxldmVsSW50cm8obGV2ZWxDb2xsZWN0aW9uKTtcbiAgICAgICAgXG4gICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgIGNvbnN0IHsgd2hlcmUsIHdoYXQgfSA9IGUudG9PYmooKTtcbiAgICAgICAgYXdhaXQgTXlBbGVydC5iaWcuZXJyb3Ioe1xuICAgICAgICAgICAgdGl0bGUgOiAnQW4gZXJyb3IgaGFzIG9jY3VycmVkIHdoaWxlIHRyeWluZyB0byBwbGF5IGxldmVsSW50cm8nLFxuICAgICAgICAgICAgaHRtbCA6IGAke3doYXR9PHA+JHt3aGVyZX08L3A+YFxuICAgICAgICB9KTtcbiAgICAgICAgdGhyb3cgZVxuICAgIH1cbiAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgXG59XG5cbmV4cG9ydCB7IGxvYWQgfVxuIl19