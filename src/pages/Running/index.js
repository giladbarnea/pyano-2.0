"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Glob_1 = require("../../Glob");
const util = require("../../util");
const bhe_1 = require("../../bhe");
const experiment_1 = require("./experiment");
const MyAlert_1 = require("../../MyAlert");
async function tryCatch(fn, when) {
    try {
        await fn();
    }
    catch (e) {
        await MyAlert_1.default.big.error({
            title: `An error has occurred when ${when}`,
            html: e,
        });
    }
}
exports.tryCatch = tryCatch;
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
    await experiment.init(subconfig);
    console.timeEnd(`new Experiment() and init()`);
    if (Glob_1.default.BigConfig.experiment_type === "test" || Glob_1.default.BigConfig.dev.simulate_test_mode('Running.index.ts')) {
        if (!Glob_1.default.BigConfig.dev.skip_experiment_intro('Running.index.ts')) {
            await tryCatch(() => experiment.intro(), 'trying to play experiment intro');
        }
    }
    const levelCollection = subconfig.getLevelCollection();
    if (!Glob_1.default.BigConfig.dev.skip_level_intro('Running.index.ts')) {
        await tryCatch(() => experiment.levelIntro(levelCollection), 'trying to play levelIntro');
    }
    await tryCatch(() => experiment.record(levelCollection), 'trying to record');
    console.groupEnd();
}
exports.load = load;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUE4QjtBQUM5QixtQ0FBbUM7QUFDbkMsbUNBQWlDO0FBTWpDLDZDQUFzQztBQUN0QywyQ0FBb0M7QUFFcEMsS0FBSyxVQUFVLFFBQVEsQ0FBQyxFQUFpQixFQUFFLElBQVk7SUFDbkQsSUFBSTtRQUNBLE1BQU0sRUFBRSxFQUFFLENBQUM7S0FDZDtJQUFDLE9BQVEsQ0FBQyxFQUFHO1FBR1YsTUFBTSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFDcEIsS0FBSyxFQUFHLDhCQUE4QixJQUFJLEVBQUU7WUFDNUMsSUFBSSxFQUFHLENBQUM7U0FDWCxDQUFDLENBQUM7S0FDTjtBQUNMLENBQUM7QUF1RGMsNEJBQVE7QUFuRHZCLEtBQUssVUFBVSxJQUFJLENBQUMsTUFBZTtJQUUvQixPQUFPLENBQUMsS0FBSyxDQUFDLHNCQUFzQixNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBRS9DLGNBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUNyQyxJQUFLLE1BQU0sRUFBRztRQUNWLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQixPQUFPLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztLQUM1QjtJQUNELGNBQUksQ0FBQyxRQUFRLEdBQUcsY0FBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7SUFFL0MsY0FBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN0QixNQUFNLFNBQVMsR0FBRyxjQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBR2hELGNBQUksQ0FBQyxLQUFLO1NBQ0wsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUUvQixXQUFXLENBQUM7UUFDVCxPQUFPLEVBQUcsVUFBSSxDQUFDO1lBQ1gsR0FBRyxFQUFHLElBQUk7U0FDYixDQUFDO1FBQ0YsT0FBTyxFQUFHLFVBQUksQ0FBQztZQUNYLEdBQUcsRUFBRyxJQUFJO1NBQ2IsQ0FBQztLQUNMLENBQUMsQ0FBQztJQUdQLElBQUksYUFBYSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDakQsT0FBTyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBQzVDLE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFdkQsTUFBTSxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2pDLE9BQU8sQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQztJQUMvQyxJQUFLLGNBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxLQUFLLE1BQU0sSUFBSSxjQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFHO1FBQzFHLElBQUssQ0FBQyxjQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFHO1lBRWpFLE1BQU0sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO1NBRS9FO0tBQ0o7SUFDRCxNQUFNLGVBQWUsR0FBRyxTQUFTLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUN2RCxJQUFLLENBQUMsY0FBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsRUFBRztRQUM1RCxNQUFNLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxFQUFFLDJCQUEyQixDQUFDLENBQUM7S0FDN0Y7SUFDRCxNQUFNLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLENBQUM7SUFFN0UsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBRXZCLENBQUM7QUFFUSxvQkFBSSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBHbG9iIGZyb20gXCIuLi8uLi9HbG9iXCI7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gXCIuLi8uLi91dGlsXCI7XG5pbXBvcnQgeyBlbGVtIH0gZnJvbSBcIi4uLy4uL2JoZVwiO1xuLy8gaW1wb3J0IGtleWJvYXJkIGZyb20gJy4va2V5Ym9hcmQnXG4vLyBpbXBvcnQgRGlhbG9nIGZyb20gJy4vZGlhbG9nJ1xuLy8gaW1wb3J0IHsgUGlhbm8gfSBmcm9tIFwiLi4vLi4vUGlhbm9cIlxuLy8gaW1wb3J0IHsgUGlhbm8sIFBpYW5vT3B0aW9ucyB9IGZyb20gXCIuLi8uLi9QaWFub1wiXG4vLyBpbXBvcnQgeyBNaWRpIH0gZnJvbSBcIkB0b25lanMvbWlkaVwiO1xuaW1wb3J0IEV4cGVyaW1lbnQgZnJvbSBcIi4vZXhwZXJpbWVudFwiO1xuaW1wb3J0IE15QWxlcnQgZnJvbSBcIi4uLy4uL015QWxlcnRcIjtcblxuYXN5bmMgZnVuY3Rpb24gdHJ5Q2F0Y2goZm46IEFzeW5jRnVuY3Rpb24sIHdoZW46IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGZuKCk7XG4gICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgYXdhaXQgTXlBbGVydC5iaWcuZXJyb3Ioe1xuICAgICAgICAgICAgdGl0bGUgOiBgQW4gZXJyb3IgaGFzIG9jY3VycmVkIHdoZW4gJHt3aGVufWAsXG4gICAgICAgICAgICBodG1sIDogZSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vKipyZXF1aXJlKCcuL1J1bm5pbmcnKS5sb2FkKClcbiAqIERPTlQgaW1wb3J0ICogYXMgcnVubmluZ1BhZ2UsIHRoaXMgY2FsbHMgY29uc3RydWN0b3JzIGV0YyovXG5hc3luYyBmdW5jdGlvbiBsb2FkKHJlbG9hZDogYm9vbGVhbikge1xuICAgIC8vICoqICBQZXJmb3JtYW5jZSwgdmlzdWFscyBzeW5jOiBodHRwczovL2dpdGh1Yi5jb20vVG9uZWpzL1RvbmUuanMvd2lraS9QZXJmb3JtYW5jZVxuICAgIGNvbnNvbGUuZ3JvdXAoYFJ1bm5pbmcuaW5kZXgubG9hZCgke3JlbG9hZH0pYCk7XG4gICAgXG4gICAgR2xvYi5CaWdDb25maWcubGFzdF9wYWdlID0gXCJydW5uaW5nXCI7XG4gICAgaWYgKCByZWxvYWQgKSB7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICAgICAgcmV0dXJuIHV0aWwucmVsb2FkUGFnZSgpO1xuICAgIH1cbiAgICBHbG9iLnNraXBGYWRlID0gR2xvYi5CaWdDb25maWcuZGV2LnNraXBfZmFkZSgpO1xuICAgIFxuICAgIEdsb2IuU2lkZWJhci5yZW1vdmUoKTtcbiAgICBjb25zdCBzdWJjb25maWcgPSBHbG9iLkJpZ0NvbmZpZy5nZXRTdWJjb25maWcoKTtcbiAgICBcbiAgICBcbiAgICBHbG9iLlRpdGxlXG4gICAgICAgIC5odG1sKGAke3N1YmNvbmZpZy50cnV0aC5uYW1lfWApXG4gICAgXG4gICAgICAgIC5jYWNoZUFwcGVuZCh7XG4gICAgICAgICAgICBsZXZlbGgzIDogZWxlbSh7XG4gICAgICAgICAgICAgICAgdGFnIDogJ2gzJ1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB0cmlhbGgzIDogZWxlbSh7XG4gICAgICAgICAgICAgICAgdGFnIDogJ2gzJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgXG4gICAgXG4gICAgbGV0IHJlYWRvbmx5VHJ1dGggPSBzdWJjb25maWcudHJ1dGgudG9SZWFkT25seSgpO1xuICAgIGNvbnNvbGUudGltZShgbmV3IEV4cGVyaW1lbnQoKSBhbmQgaW5pdCgpYCk7XG4gICAgY29uc3QgZXhwZXJpbWVudCA9IG5ldyBFeHBlcmltZW50KHN1YmNvbmZpZy5kZW1vX3R5cGUpO1xuICAgIC8vIGF3YWl0IGV4cGVyaW1lbnQuaW5pdChyZWFkb25seVRydXRoKTtcbiAgICBhd2FpdCBleHBlcmltZW50LmluaXQoc3ViY29uZmlnKTtcbiAgICBjb25zb2xlLnRpbWVFbmQoYG5ldyBFeHBlcmltZW50KCkgYW5kIGluaXQoKWApO1xuICAgIGlmICggR2xvYi5CaWdDb25maWcuZXhwZXJpbWVudF90eXBlID09PSBcInRlc3RcIiB8fCBHbG9iLkJpZ0NvbmZpZy5kZXYuc2ltdWxhdGVfdGVzdF9tb2RlKCdSdW5uaW5nLmluZGV4LnRzJykgKSB7XG4gICAgICAgIGlmICggIUdsb2IuQmlnQ29uZmlnLmRldi5za2lwX2V4cGVyaW1lbnRfaW50cm8oJ1J1bm5pbmcuaW5kZXgudHMnKSApIHtcbiAgICAgICAgICAgIC8vIFRPRE86IGxpbWl0IGJ5IG1heE5vdGVzXG4gICAgICAgICAgICBhd2FpdCB0cnlDYXRjaCgoKSA9PiBleHBlcmltZW50LmludHJvKCksICd0cnlpbmcgdG8gcGxheSBleHBlcmltZW50IGludHJvJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBsZXZlbENvbGxlY3Rpb24gPSBzdWJjb25maWcuZ2V0TGV2ZWxDb2xsZWN0aW9uKCk7XG4gICAgaWYgKCAhR2xvYi5CaWdDb25maWcuZGV2LnNraXBfbGV2ZWxfaW50cm8oJ1J1bm5pbmcuaW5kZXgudHMnKSApIHtcbiAgICAgICAgYXdhaXQgdHJ5Q2F0Y2goKCkgPT4gZXhwZXJpbWVudC5sZXZlbEludHJvKGxldmVsQ29sbGVjdGlvbiksICd0cnlpbmcgdG8gcGxheSBsZXZlbEludHJvJyk7XG4gICAgfVxuICAgIGF3YWl0IHRyeUNhdGNoKCgpID0+IGV4cGVyaW1lbnQucmVjb3JkKGxldmVsQ29sbGVjdGlvbiksICd0cnlpbmcgdG8gcmVjb3JkJyk7XG4gICAgXG4gICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgIFxufVxuXG5leHBvcnQgeyBsb2FkLCB0cnlDYXRjaCB9XG4iXX0=