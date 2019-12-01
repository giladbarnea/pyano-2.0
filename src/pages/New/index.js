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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHFDQUE4QjtBQUM5QixtQ0FBa0M7QUFDbEMsd0NBQWlDO0FBQ2pDLHlDQUFpQztBQUNqQyxtQ0FBbUM7QUFDbkMsMkNBQW1DO0FBQ25DLDZCQUE2QjtBQUM3Qix1Q0FBa0M7QUFNbEMsS0FBSyxVQUFVLElBQUksQ0FBQyxNQUFlO0lBRS9CLGNBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUNqQyxJQUFLLE1BQU0sRUFBRztRQUNWLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQzVCO0lBQ0QsaUJBQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFHLElBQUksRUFBRSxDQUFDLENBQUM7SUFDOUMsTUFBTSxXQUFXLEdBQUcsWUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFHLFFBQVEsRUFBRSxJQUFJLEVBQUcsa0JBQWtCLEVBQUUsRUFBRSxFQUFHLHlCQUF5QixFQUFFLENBQUM7U0FDcEcsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFO1FBS2QsTUFBTSxTQUFTLEdBQUcsY0FBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUdoRCxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDOUIsSUFBSSxNQUFNLEdBQUcsTUFBTSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7WUFDeEMsS0FBSyxFQUFHLDZDQUE2QyxTQUFTLENBQUMsSUFBSSxhQUFhO1lBQ2hGLElBQUk7WUFDSixpQkFBaUIsRUFBRywyQkFBMkI7WUFDL0MsZUFBZSxFQUFHLHdDQUF3QztTQUM3RCxDQUFDLENBQUM7UUFDSCxRQUFTLE1BQU0sRUFBRztZQUNkLEtBQUssUUFBUTtnQkFDVCxPQUFPO1lBQ1gsS0FBSyxTQUFTO2dCQUNWLE9BQU8sWUFBWSxDQUFD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QU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQ3ZELE1BQU0sU0FBUyxHQUFHLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUM5QyxJQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUc7UUFDeEIsT0FBTyxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsMkJBQTJCLFNBQVMsQ0FBQyxJQUFJLGlDQUFpQyxFQUFFO1lBQ3JHLElBQUksRUFBRyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztTQUM5QixDQUFDLENBQUE7S0FDTDtJQUVELE9BQU8sT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqaW1wb3J0IG5ld1BhZ2UgZnJvbSBcIi4vTmV3XCI7Ki9cbmltcG9ydCBHbG9iIGZyb20gXCIuLi8uLi9HbG9iXCI7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4uLy4uL3V0aWwnXG5pbXBvcnQgc2lkZWJhciBmcm9tIFwiLi4vc2lkZWJhclwiO1xuaW1wb3J0IHNlY3Rpb25zIGZyb20gXCIuL3NlY3Rpb25zXCJcbmltcG9ydCB7IGJ1dHRvbiB9IGZyb20gXCIuLi8uLi9iaGVcIjtcbmltcG9ydCBNeUFsZXJ0IGZyb20gJy4uLy4uL015QWxlcnQnXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyByZW1vdGUgfSBmcm9tICdlbGVjdHJvbic7XG5pbXBvcnQgeyBTdWJjb25maWcgfSBmcm9tIFwiLi4vLi4vTXlTdG9yZVwiO1xuXG4vLyBpbXBvcnQgKiBhcyBydW5uaW5nUGFnZSBmcm9tIFwiLi4vUnVubmluZ1wiXG5cblxuYXN5bmMgZnVuY3Rpb24gbG9hZChyZWxvYWQ6IGJvb2xlYW4pIHtcbiAgICBcbiAgICBHbG9iLkJpZ0NvbmZpZy5sYXN0X3BhZ2UgPSBcIm5ld1wiO1xuICAgIGlmICggcmVsb2FkICkge1xuICAgICAgICByZXR1cm4gdXRpbC5yZWxvYWRQYWdlKCk7XG4gICAgfVxuICAgIHNpZGViYXIuc2VsZWN0KFwibmV3XCIsIHsgY2hhbmdlVGl0bGUgOiB0cnVlIH0pO1xuICAgIGNvbnN0IHN0YXJ0QnV0dG9uID0gYnV0dG9uKHsgY2xzIDogJ2FjdGl2ZScsIGh0bWwgOiAnU3RhcnQgRXhwZXJpbWVudCcsIGlkIDogJ3N0YXJ0X2V4cGVyaW1lbnRfYnV0dG9uJyB9KVxuICAgICAgICAuY2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgLypsZXQgdGVtcGxhdGUgPSB7XG4gICAgICAgICAgICAgJzw+JyA6ICdkaXYnLFxuICAgICAgICAgICAgICdodG1sJyA6IFsgJ0FsbG93ZWQgUmh5dGhtIERldmlhdGlvbjogJHthbGxvd2VkX3JoeXRobV9kZXZpYXRpb259J11cbiAgICAgICAgICAgICB9OyovXG4gICAgICAgICAgICBjb25zdCBzdWJjb25maWcgPSBHbG9iLkJpZ0NvbmZpZy5nZXRTdWJjb25maWcoKTtcbiAgICAgICAgICAgIC8vIGNvbnN0IGpzb24yaHRtbCA9IHJlcXVpcmUoXCJub2RlLWpzb24yaHRtbFwiKTtcbiAgICAgICAgICAgIC8vIGxldCBodG1sID0ganNvbjJodG1sLnRyYW5zZm9ybShzdWJjb25maWcuc3RvcmUsIHRlbXBsYXRlKTtcbiAgICAgICAgICAgIGxldCBodG1sID0gc3ViY29uZmlnLnRvSHRtbCgpO1xuICAgICAgICAgICAgbGV0IGFjdGlvbiA9IGF3YWl0IE15QWxlcnQuYmlnLnRocmVlQnV0dG9ucyh7XG4gICAgICAgICAgICAgICAgdGl0bGUgOiBgUGxlYXNlIG1ha2Ugc3VyZSB0aGF0IHRoZSBsb2FkZWQgY29uZmlnLCBcIiR7c3ViY29uZmlnLm5hbWV9XCIsIGlzIGZpbmUuYCxcbiAgICAgICAgICAgICAgICBodG1sLFxuICAgICAgICAgICAgICAgIGNvbmZpcm1CdXR0b25UZXh0IDogYEl0J3Mgb2ssIHN0YXJ0IGV4cGVyaW1lbnRgLFxuICAgICAgICAgICAgICAgIHRoaXJkQnV0dG9uVGV4dCA6ICdPcGVuIGNvbmZpZ3MgZGlyZWN0b3J5IGluIGZpbGUgYnJvd3NlcidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3dpdGNoICggYWN0aW9uICkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJjYW5jZWxcIjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJjb25maXJtXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGFydElmUmVhZHkoc3ViY29uZmlnKTtcbiAgICAgICAgICAgICAgICBjYXNlIFwidGhpcmRcIjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlbW90ZS5zaGVsbC5zaG93SXRlbUluRm9sZGVyKHBhdGguam9pbihDT05GSUdTX1BBVEhfQUJTLCBzdWJjb25maWcubmFtZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgR2xvYi5NYWluQ29udGVudC5hcHBlbmQoXG4gICAgICAgIC8vIHNlY3Rpb25zLmxldmVscyxcbiAgICAgICAgc2VjdGlvbnMuc2V0dGluZ3MsXG4gICAgICAgIHN0YXJ0QnV0dG9uXG4gICAgKTtcbiAgICBcbiAgICBcbn1cblxuYXN5bmMgZnVuY3Rpb24gc3RhcnRJZlJlYWR5KHN1YmNvbmZpZzogU3ViY29uZmlnKSB7XG4gICAgY29uc3QgbWlzc2luZ1R4dHMgPSBzdWJjb25maWcudHJ1dGgudHh0LmdldE1pc3NpbmcoKTtcbiAgICBcbiAgICBpZiAoIHV0aWwuYm9vbChtaXNzaW5nVHh0cykgKSB7XG4gICAgICAgIHJldHVybiBNeUFsZXJ0LmJpZy5vbmVCdXR0b24oYFRoZSB0cnV0aDogXCIke3N1YmNvbmZpZy50cnV0aC5uYW1lfVwiIGlzIG1pc3NpbmcgdGhlIGZvbGxvd2luZyB0eHQgZmlsZXM6YCwgeyB0ZXh0IDogbWlzc2luZ1R4dHMuam9pbignLCAnKSB9KVxuICAgIH1cbiAgICAvLyAvIFR4dHMgZXhpc3RcbiAgICBpZiAoICFzdWJjb25maWcudHJ1dGgubWlkaS5leGlzdHMoKSApIHtcbiAgICAgICAgaWYgKCAhR2xvYi5CaWdDb25maWcuZGV2LnNraXBfbWlkaV9leGlzdHNfY2hlY2soKSApIHtcbiAgICAgICAgICAgIHJldHVybiBNeUFsZXJ0LmJpZy5vbmVCdXR0b24oYFRoZSB0cnV0aDogXCIke3N1YmNvbmZpZy50cnV0aC5uYW1lfVwiIGlzIG1pc3NpbmcgYSBtaWRpIGZpbGVgKVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIC8gbWlkaSBleGlzdFxuICAgIGlmICggc3ViY29uZmlnLmRlbW9fdHlwZSA9PT0gXCJ2aWRlb1wiICkge1xuICAgICAgICBjb25zdCBtcDRFeGlzdHMgPSBzdWJjb25maWcudHJ1dGgubXA0LmV4aXN0cygpO1xuICAgICAgICBjb25zdCBvbnNldHNFeGlzdHMgPSBzdWJjb25maWcudHJ1dGgub25zZXRzLmV4aXN0cygpO1xuICAgICAgICBpZiAoICF1dGlsLmFsbChtcDRFeGlzdHMsIG9uc2V0c0V4aXN0cykgKSB7XG4gICAgICAgICAgICBjb25zdCBtaXNzaW5nTmFtZXMgPSBbXTtcbiAgICAgICAgICAgIGlmICggIW1wNEV4aXN0cyApXG4gICAgICAgICAgICAgICAgbWlzc2luZ05hbWVzLnB1c2goXCJtcDRcIik7XG4gICAgICAgICAgICBpZiAoICFvbnNldHNFeGlzdHMgKVxuICAgICAgICAgICAgICAgIG1pc3NpbmdOYW1lcy5wdXNoKFwib25zZXRzXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gTXlBbGVydC5iaWcub25lQnV0dG9uKGBUaGUgdHJ1dGg6IFwiJHtzdWJjb25maWcudHJ1dGgubmFtZX1cIiBpcyBtaXNzaW5nIHRoZSBmb2xsb3dpbmcgZmlsZXM6YCwge1xuICAgICAgICAgICAgICAgIHRleHQgOiBtaXNzaW5nTmFtZXMuam9pbignLCAnKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBtdXN0SGF2ZVZhbHVlID0gW1xuICAgICAgICBcImFsbG93ZWRfcmh5dGhtX2RldmlhdGlvblwiLFxuICAgICAgICBcImFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uXCIsXG4gICAgICAgIFwiZXJyb3JzX3BsYXlyYXRlXCIsXG4gICAgICAgIFwic3ViamVjdFwiLFxuICAgICAgICBcInRydXRoX2ZpbGVcIixcbiAgICAgICAgXCJsZXZlbHNcIixcbiAgICBdO1xuICAgIGNvbnN0IG1pc3NpbmdWYWx1ZXMgPSBbXTtcbiAgICBmb3IgKCBsZXQga2V5IG9mIG11c3RIYXZlVmFsdWUgKSB7XG4gICAgICAgIGlmICggIXV0aWwuYm9vbChzdWJjb25maWdba2V5XSkgKSB7XG4gICAgICAgICAgICBtaXNzaW5nVmFsdWVzLnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIHV0aWwuYm9vbChtaXNzaW5nVmFsdWVzKSApIHtcbiAgICAgICAgcmV0dXJuIE15QWxlcnQuYmlnLm9uZUJ1dHRvbihgVGhlIGZvbGxvd2luZyBrZXlzIGluICR7c3ViY29uZmlnLm5hbWV9IGFyZSBtaXNzaW5nIHZhbHVlczpgLCB7XG4gICAgICAgICAgICB0ZXh0IDogbWlzc2luZ1ZhbHVlcy5qb2luKCcsICcpXG4gICAgICAgIH0pXG4gICAgfVxuICAgIGNvbnN0IGxldmVsQ29sbGVjdGlvbiA9IHN1YmNvbmZpZy5nZXRMZXZlbENvbGxlY3Rpb24oKTtcbiAgICBjb25zdCBiYWRMZXZlbHMgPSBsZXZlbENvbGxlY3Rpb24uYmFkTGV2ZWxzKCk7XG4gICAgaWYgKCB1dGlsLmJvb2woYmFkTGV2ZWxzKSApIHtcbiAgICAgICAgcmV0dXJuIE15QWxlcnQuYmlnLm9uZUJ1dHRvbihgVGhlIGZvbGxvd2luZyBsZXZlbHMgaW4gJHtzdWJjb25maWcubmFtZX0gaGF2ZSBpbnZhbGlkIHZhbHVlczogKDAtaW5kZXgpYCwge1xuICAgICAgICAgICAgdGV4dCA6IGJhZExldmVscy5qb2luKCcsICcpXG4gICAgICAgIH0pXG4gICAgfVxuICAgIC8vIC8gbXA0IGFuZCBvbnNldHMgZXhpc3RcbiAgICByZXR1cm4gcmVxdWlyZSgnLi4vUnVubmluZycpLmxvYWQodHJ1ZSk7XG59XG5cbmV4cG9ydCB7IGxvYWQgfVxuIl19