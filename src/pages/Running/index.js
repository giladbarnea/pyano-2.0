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
    const experiment = new experiment_1.default(subconfig.demo_type);
    await experiment.init(readonlyTruth);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUE4QjtBQUM5QixtQ0FBbUM7QUFDbkMsbUNBQWlDO0FBTWpDLDZDQUFzQztBQUN0QywyQ0FBb0M7QUFPcEMsS0FBSyxVQUFVLElBQUksQ0FBQyxNQUFlO0lBRS9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsc0JBQXNCLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFFL0MsY0FBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQ3JDLElBQUssTUFBTSxFQUFHO1FBQ1YsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQzVCO0lBQ0QsY0FBSSxDQUFDLFFBQVEsR0FBRyxjQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUUvQyxjQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3RCLE1BQU0sU0FBUyxHQUFHLGNBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7SUFHaEQsY0FBSSxDQUFDLEtBQUs7U0FDTCxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1NBRS9CLFdBQVcsQ0FBQztRQUNULE9BQU8sRUFBRyxVQUFJLENBQUM7WUFDWCxHQUFHLEVBQUcsSUFBSTtTQUNiLENBQUM7UUFDRixPQUFPLEVBQUcsVUFBSSxDQUFDO1lBQ1gsR0FBRyxFQUFHLElBQUk7U0FDYixDQUFDO0tBQ0wsQ0FBQyxDQUFDO0lBR1AsSUFBSSxhQUFhLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNqRCxNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZELE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNyQyxJQUFLLGNBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxLQUFLLE1BQU0sSUFBSSxjQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFHO1FBQzFHLElBQUssQ0FBQyxjQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFHO1lBRWpFLElBQUk7Z0JBQ0EsTUFBTSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7YUFFNUI7WUFBQyxPQUFRLENBQUMsRUFBRztnQkFDVixNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDbEMsTUFBTSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7b0JBQ3BCLEtBQUssRUFBRyw0REFBNEQ7b0JBQ3BFLElBQUksRUFBRyxHQUFHLElBQUksTUFBTSxLQUFLLE1BQU07aUJBQ2xDLENBQUMsQ0FBQztnQkFDSCxNQUFNLENBQUMsQ0FBQTthQUNWO1NBQ0o7S0FDSjtJQUNELE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBR3ZELElBQUk7UUFDQSxNQUFNLFVBQVUsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7S0FFaEQ7SUFBQyxPQUFRLENBQUMsRUFBRztRQUNWLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2xDLE1BQU0saUJBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO1lBQ3BCLEtBQUssRUFBRyx1REFBdUQ7WUFDL0QsSUFBSSxFQUFHLEdBQUcsSUFBSSxNQUFNLEtBQUssTUFBTTtTQUNsQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsQ0FBQTtLQUNWO0lBQ0QsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBRXZCLENBQUM7QUFFUSxvQkFBSSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBHbG9iIGZyb20gXCIuLi8uLi9HbG9iXCI7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gXCIuLi8uLi91dGlsXCI7XG5pbXBvcnQgeyBlbGVtIH0gZnJvbSBcIi4uLy4uL2JoZVwiO1xuLy8gaW1wb3J0IGtleWJvYXJkIGZyb20gJy4va2V5Ym9hcmQnXG4vLyBpbXBvcnQgRGlhbG9nIGZyb20gJy4vZGlhbG9nJ1xuLy8gaW1wb3J0IHsgUGlhbm8gfSBmcm9tIFwiLi4vLi4vUGlhbm9cIlxuLy8gaW1wb3J0IHsgUGlhbm8sIFBpYW5vT3B0aW9ucyB9IGZyb20gXCIuLi8uLi9QaWFub1wiXG4vLyBpbXBvcnQgeyBNaWRpIH0gZnJvbSBcIkB0b25lanMvbWlkaVwiO1xuaW1wb3J0IEV4cGVyaW1lbnQgZnJvbSBcIi4vZXhwZXJpbWVudFwiO1xuaW1wb3J0IE15QWxlcnQgZnJvbSBcIi4uLy4uL015QWxlcnRcIjtcblxuLy8gY29uc3QgeyBQaWFubyB9ID0gcmVxdWlyZShcIkB0b25lanMvcGlhbm9cIik7XG5cblxuLyoqcmVxdWlyZSgnLi9SdW5uaW5nJykubG9hZCgpXG4gKiBET05UIGltcG9ydCAqIGFzIHJ1bm5pbmdQYWdlLCB0aGlzIGNhbGxzIGNvbnN0cnVjdG9ycyBldGMqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZChyZWxvYWQ6IGJvb2xlYW4pIHtcbiAgICAvLyAqKiAgUGVyZm9ybWFuY2UsIHZpc3VhbHMgc3luYzogaHR0cHM6Ly9naXRodWIuY29tL1RvbmVqcy9Ub25lLmpzL3dpa2kvUGVyZm9ybWFuY2VcbiAgICBjb25zb2xlLmdyb3VwKGBSdW5uaW5nLmluZGV4LmxvYWQoJHtyZWxvYWR9KWApO1xuICAgIFxuICAgIEdsb2IuQmlnQ29uZmlnLmxhc3RfcGFnZSA9IFwicnVubmluZ1wiO1xuICAgIGlmICggcmVsb2FkICkge1xuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgIHJldHVybiB1dGlsLnJlbG9hZFBhZ2UoKTtcbiAgICB9XG4gICAgR2xvYi5za2lwRmFkZSA9IEdsb2IuQmlnQ29uZmlnLmRldi5za2lwX2ZhZGUoKTtcbiAgICBcbiAgICBHbG9iLlNpZGViYXIucmVtb3ZlKCk7XG4gICAgY29uc3Qgc3ViY29uZmlnID0gR2xvYi5CaWdDb25maWcuZ2V0U3ViY29uZmlnKCk7XG4gICAgXG4gICAgXG4gICAgR2xvYi5UaXRsZVxuICAgICAgICAuaHRtbChgJHtzdWJjb25maWcudHJ1dGgubmFtZX1gKVxuICAgIFxuICAgICAgICAuY2FjaGVBcHBlbmQoe1xuICAgICAgICAgICAgbGV2ZWxoMyA6IGVsZW0oe1xuICAgICAgICAgICAgICAgIHRhZyA6ICdoMydcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgdHJpYWxoMyA6IGVsZW0oe1xuICAgICAgICAgICAgICAgIHRhZyA6ICdoMydcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgIFxuICAgIFxuICAgIGxldCByZWFkb25seVRydXRoID0gc3ViY29uZmlnLnRydXRoLnRvUmVhZE9ubHkoKTtcbiAgICBjb25zdCBleHBlcmltZW50ID0gbmV3IEV4cGVyaW1lbnQoc3ViY29uZmlnLmRlbW9fdHlwZSk7XG4gICAgYXdhaXQgZXhwZXJpbWVudC5pbml0KHJlYWRvbmx5VHJ1dGgpO1xuICAgIGlmICggR2xvYi5CaWdDb25maWcuZXhwZXJpbWVudF90eXBlID09PSBcInRlc3RcIiB8fCBHbG9iLkJpZ0NvbmZpZy5kZXYuc2ltdWxhdGVfdGVzdF9tb2RlKCdSdW5uaW5nLmluZGV4LnRzJykgKSB7XG4gICAgICAgIGlmICggIUdsb2IuQmlnQ29uZmlnLmRldi5za2lwX2V4cGVyaW1lbnRfaW50cm8oJ1J1bm5pbmcuaW5kZXgudHMnKSApIHtcbiAgICAgICAgICAgIC8vIFRPRE86IGxpbWl0IGJ5IG1heE5vdGVzXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGV4cGVyaW1lbnQuaW50cm8oKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gY2F0Y2ggKCBlICkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgd2hlcmUsIHdoYXQgfSA9IGUudG9PYmooKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBNeUFsZXJ0LmJpZy5lcnJvcih7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlIDogJ0FuIGVycm9yIGhhcyBvY2N1cnJlZCB3aGVuIHRyeWluZyB0byBwbGF5IGV4cGVyaW1lbnQgaW50cm8nLFxuICAgICAgICAgICAgICAgICAgICBodG1sIDogYCR7d2hhdH08cD4ke3doZXJlfTwvcD5gXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGxldmVsQ29sbGVjdGlvbiA9IHN1YmNvbmZpZy5nZXRMZXZlbENvbGxlY3Rpb24oKTtcbiAgICBcbiAgICBcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBleHBlcmltZW50LmxldmVsSW50cm8obGV2ZWxDb2xsZWN0aW9uKTtcbiAgICAgICAgXG4gICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgIGNvbnN0IHsgd2hlcmUsIHdoYXQgfSA9IGUudG9PYmooKTtcbiAgICAgICAgYXdhaXQgTXlBbGVydC5iaWcuZXJyb3Ioe1xuICAgICAgICAgICAgdGl0bGUgOiAnQW4gZXJyb3IgaGFzIG9jY3VycmVkIHdoaWxlIHRyeWluZyB0byBwbGF5IGxldmVsSW50cm8nLFxuICAgICAgICAgICAgaHRtbCA6IGAke3doYXR9PHA+JHt3aGVyZX08L3A+YFxuICAgICAgICB9KTtcbiAgICAgICAgdGhyb3cgZVxuICAgIH1cbiAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgXG59XG5cbmV4cG9ydCB7IGxvYWQgfVxuIl19