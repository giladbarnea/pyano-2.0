"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Glob_1 = require("../../Glob");
const sidebar_1 = require("../sidebar");
const sections_1 = require("./sections");
const bhe_1 = require("../../bhe");
const electron_1 = require("electron");
async function load(reload) {
    console.log(`New.index.load(reload=${reload})`);
    BigConfig.last_page = "new";
    if (reload) {
        return util.reloadPage();
    }
    sidebar_1.default.select("new", { changeTitle: true });
    const startButton = bhe_1.button({ cls: 'green', html: 'Start Experiment', setid: 'start_experiment_button' })
        .click(async () => {
        const subconfig = BigConfig.getSubconfig();
        let html = subconfig.toHtml();
        let action = await swalert.big.threeButtons({
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
        return swalert.big.oneButton({
            title: `The truth: "${subconfig.truth.name}" is missing the following txt files:`,
            text: missingTxts.join(', ')
        });
    }
    if (!subconfig.truth.midi.exists()) {
        if (!BigConfig.dev.skip_midi_exists_check()) {
            return swalert.big.oneButton({ title: `The truth: "${subconfig.truth.name}" is missing a midi file` });
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
            return swalert.big.oneButton({
                title: `The truth: "${subconfig.truth.name}" is missing the following files:`,
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
        return swalert.big.oneButton({
            title: `The following keys in ${subconfig.name} are missing values:`,
            text: missingValues.join(', ')
        });
    }
    const levelCollection = subconfig.getLevelCollection();
    const badLevels = levelCollection.badLevels();
    if (util.bool(badLevels)) {
        return swalert.big.oneButton({
            title: `The following levels in ${subconfig.name} have invalid values: (0-index)`,
            text: badLevels.join(', ')
        });
    }
    return require('../Running').load(true);
}
//# sourceMappingURL=index.js.map