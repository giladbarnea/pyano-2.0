"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Store = require("electron-store");
const path = require("path");
const fs = require("fs");
const MyFs_1 = require("../MyFs");
const util_1 = require("../util");
const Truth_1 = require("../Truth");
const Level_1 = require("../Level");
const Conf = require("conf");
console.log('src/BigConfig/index.ts');
function tryGetFromCache(config, prop) {
    if (config.cache[prop] === undefined) {
        const propVal = config.get(prop);
        config.cache[prop] = propVal;
        return propVal;
    }
    else {
        return config.cache[prop];
    }
}
function getTruthFilesWhere({ extension } = { extension: undefined }) {
    if (extension) {
        if (extension.startsWith('.')) {
            extension = extension.slice(1);
        }
        if (!['txt', 'mid', 'mp4'].includes(extension)) {
            console.warn(`truthFilesList("${extension}"), must be either ['txt','mid','mp4'] or not at all. setting to undefined`);
            extension = undefined;
        }
    }
    let truthFiles = [...new Set(fs.readdirSync(TRUTHS_PATH_ABS))];
    let formattedTruthFiles = [];
    for (let file of truthFiles) {
        let [name, ext] = MyFs_1.default.split_ext(file);
        if (extension) {
            if (ext.lower() === `.${extension}`) {
                formattedTruthFiles.push(name);
            }
        }
        else {
            formattedTruthFiles.push(name);
        }
    }
    return formattedTruthFiles;
}
exports.getTruthFilesWhere = getTruthFilesWhere;
function getTruthsWith3TxtFiles() {
    const txtFilesList = getTruthFilesWhere({ extension: 'txt' });
    const wholeTxtFiles = [];
    for (let name of txtFilesList) {
        if (txtFilesList.count(txt => txt.startsWith(name)) >= 3) {
            wholeTxtFiles.push(name);
        }
    }
    return txtFilesList.filter(a => txtFilesList.filter(txt => txt.startsWith(a)).length >= 3);
}
exports.getTruthsWith3TxtFiles = getTruthsWith3TxtFiles;
class BigConfigCls extends Store {
    constructor(doFsCheckup = true) {
        super({
            clearInvalidConfig: false,
            defaults: {
                "dev": false,
                "devoptions": {
                    force_notes_number: null,
                    force_playback_rate: null,
                    mute_animation: false,
                    no_reload_on_submit: false,
                    simulate_test_mode: false,
                    simulate_video_mode: false,
                    simulate_animation_mode: false,
                    skip_experiment_intro: false,
                    skip_fade: false,
                    skip_failed_trial_feedback: false,
                    skip_level_intro: false,
                    skip_midi_exists_check: false,
                    skip_passed_trial_feedback: false,
                },
                "exam_file": "fur_elise_B.exam",
                "experiment_type": "test",
                "last_page": "new",
                "test_file": "fur_elise_B.test",
                "subjects": [],
                "velocities": 2
            }
        });
        console.log(`this.path: ${this.path}`);
        this.cache = {};
        if (DRYRUN) {
            this.set = (...args) => console.warn(`DRYRUN, set: `, args);
        }
        let testNameWithExt = this.test_file;
        let examNameWithExt = this.exam_file;
        if (!util_1.all(testNameWithExt, examNameWithExt)) {
            console.warn(`BigConfigCls ctor, couldnt get test_file and/or exam_file from json:`, {
                testNameWithExt,
                examNameWithExt
            }, ', defaulting to "fur_elise_B.[ext]"');
            testNameWithExt = 'fur_elise_B.test';
            examNameWithExt = 'fur_elise_B.exam';
        }
        this.setSubconfig(testNameWithExt);
        this.setSubconfig(examNameWithExt);
        this.subjects = this.subjects;
        if (doFsCheckup) {
            Promise.all([this.test.doTxtFilesCheck(), this.exam.doTxtFilesCheck()])
                .catch(async (reason) => {
                const currentWindow = util_1.getCurrentWindow();
                if (!currentWindow.webContents.isDevToolsOpened()) {
                    currentWindow.webContents.openDevTools({ mode: "undocked" });
                }
                console.error(`BigConfigCls ctor, error when doFsCheckup:`, reason);
                const MyAlert = require('../MyAlert');
                await MyAlert.big.error({
                    title: `An error occured when making sure all truth txt files exist. Tried to check: ${this.test.truth.name} and ${this.exam.truth.name}.`,
                    html: reason,
                });
            });
            this.removeEmptyDirs("subjects");
        }
    }
    get last_page() {
        return this.get('last_page');
    }
    set last_page(page) {
        const validpages = ["new", "running", "record", "file_tools", "settings"];
        if (!validpages.includes(page)) {
            console.warn(`set last_page("${page}"), must be one of ${validpages.join(', ')}. setting to new`);
            this.set('last_page', 'new');
        }
        else {
            this.set('last_page', page);
        }
    }
    get exam_file() {
        return tryGetFromCache(this, 'exam_file');
    }
    set exam_file(nameWithExt) {
        this.setSubconfig(nameWithExt);
    }
    get test_file() {
        return tryGetFromCache(this, 'test_file');
    }
    set test_file(nameWithExt) {
        this.setSubconfig(nameWithExt);
    }
    get experiment_type() {
        return tryGetFromCache(this, "experiment_type");
    }
    set experiment_type(experimentType) {
        if (!['exam', 'test'].includes(experimentType)) {
            console.warn(`BigConfig experiment_type setter, got experimentType: '${experimentType}'. Must be either 'test' or 'exam'. setting to test`);
            experimentType = 'test';
        }
        this.set('experiment_type', experimentType);
        this.cache.experiment_type = experimentType;
    }
    get subjects() {
        return this.get('subjects');
    }
    set subjects(subjectList) {
        if (DRYRUN) {
            return console.warn('set subjects, DRYRUN. returning');
        }
        if (subjectList === undefined) {
            console.warn('BigConfigCls.subject() setter got undefined, continueing with []');
            subjectList = [];
        }
        subjectList.push(this.test.subject);
        subjectList.push(this.exam.subject);
        const subjects = [...new Set(subjectList)].filter(util_1.bool);
        console.log({ subjects });
        for (let s of subjects) {
            MyFs_1.default.createIfNotExists(path.join(SUBJECTS_PATH_ABS, s));
        }
        this.set('subjects', subjects);
    }
    get dev() {
        const _dev = this.get('dev');
        const handleBoolean = (key, where) => {
            const value = _dev && this.get('devoptions')[key];
            if (value)
                console.warn(`devoptions.${key} ${where}`);
            return value;
        };
        return {
            force_notes_number: () => {
                if (_dev) {
                    const force_notes_number = this.get('devoptions').force_notes_number;
                    if (force_notes_number)
                        console.warn(`devoptions.force_notes_number: ${force_notes_number}`);
                    return force_notes_number;
                }
                return null;
            },
            force_playback_rate: () => {
                if (_dev) {
                    const force_playback_rate = this.get('devoptions').force_playback_rate;
                    if (force_playback_rate)
                        console.warn(`devoptions.force_playback_rate: ${force_playback_rate}`);
                    return force_playback_rate;
                }
                return null;
            },
            simulate_test_mode: (where) => {
                return handleBoolean("simulate_test_mode", where);
            },
            simulate_animation_mode: (where) => {
                return handleBoolean("simulate_animation_mode", where);
            },
            simulate_video_mode: (where) => {
                const simulate_video_mode = _dev && this.get('devoptions').simulate_video_mode;
                if (simulate_video_mode)
                    console.warn(`devoptions.simulate_video_mode ${where}`);
                return simulate_video_mode;
            },
            skip_fade: (where) => {
                const skip_fade = _dev && this.get('devoptions').skip_fade;
                if (skip_fade)
                    console.warn(`devoptions.skip_fade ${where}`);
                return skip_fade;
            },
            mute_animation: (where) => {
                const mute_animation = _dev && this.get('devoptions').mute_animation;
                if (mute_animation)
                    console.warn(`devoptions.mute_animation ${where}`);
                return mute_animation;
            },
            skip_midi_exists_check: (where) => {
                const skip_midi_exists_check = _dev && this.get('devoptions').skip_midi_exists_check;
                if (skip_midi_exists_check)
                    console.warn(`devoptions.skip_midi_exists_check ${where}`);
                return skip_midi_exists_check;
            },
            skip_experiment_intro: (where) => {
                const skip_experiment_intro = _dev && this.get('devoptions').skip_experiment_intro;
                if (skip_experiment_intro)
                    console.warn(`devoptions.skip_experiment_intro ${where}`);
                return skip_experiment_intro;
            },
            skip_level_intro: (where) => {
                const skip_level_intro = _dev && this.get('devoptions').skip_level_intro;
                if (skip_level_intro)
                    console.warn(`devoptions.skip_level_intro ${where}`);
                return skip_level_intro;
            },
            skip_passed_trial_feedback: (where) => {
                const skip_passed_trial_feedback = _dev && this.get('devoptions').skip_passed_trial_feedback;
                if (skip_passed_trial_feedback)
                    console.warn(`devoptions.skip_passed_trial_feedback ${where}`);
                return skip_passed_trial_feedback;
            },
            skip_failed_trial_feedback: (where) => {
                const skip_failed_trial_feedback = _dev && this.get('devoptions').skip_failed_trial_feedback;
                if (skip_failed_trial_feedback)
                    console.warn(`devoptions.skip_failed_trial_feedback ${where}`);
                return skip_failed_trial_feedback;
            },
            no_reload_on_submit: (where) => {
                const no_reload_on_submit = _dev && this.get('devoptions').no_reload_on_submit;
                if (no_reload_on_submit)
                    console.warn(`devoptions.no_reload_on_submit ${where}`);
                return no_reload_on_submit;
            },
        };
    }
    get velocities() {
        return tryGetFromCache(this, "velocities");
    }
    set velocities(val) {
        try {
            const floored = Math.floor(val);
            if (isNaN(floored)) {
                console.warn(`set velocities, Math.floor(val) is NaN:`, { val, floored }, '. not setting');
            }
            else {
                if (floored >= 1 && floored <= 16) {
                    this.set('velocities', floored);
                    this.cache.velocities = floored;
                }
                else {
                    console.warn(`set velocities, bad range: ${val}. not setting`);
                }
            }
        }
        catch (e) {
            console.warn(`set velocities, Exception when trying to Math.floor(val):`, e);
        }
    }
    fromSavedConfig(savedConfig, experimentType) {
        return console.warn('BigConfigCls used fromSavedConfig. Impossible to load big file. Returning');
    }
    update(K, kv) {
        if (DRYRUN) {
            return console.warn('BigConfig.update() DRYRUN. returning');
        }
        let V = this.get(K);
        if (Array.isArray(V)) {
            let newValue = V;
            if (Array.isArray(kv)) {
                newValue.push(...kv);
            }
            else {
                newValue.push(kv);
            }
            this.set(K, newValue);
        }
        else {
            Object.assign(V, kv);
            this.set(K, V);
        }
        return this.get(K);
    }
    setSubconfig(nameWithExt, subconfig) {
        try {
            Subconfig.validateName(nameWithExt);
        }
        catch (e) {
            if (e.message === 'ExtensionError') {
                return console.warn(`set setSubconfig (${nameWithExt}) has no extension, or ext is bad. not setting`);
            }
            if (e.message === 'BasenameError') {
                const basename = path.basename(nameWithExt);
                console.warn(`setSubconfig(${nameWithExt}), passed a path (with slahes). need only a basename.ext. continuing with only basename: ${basename}`);
                nameWithExt = basename;
            }
        }
        const ext = path.extname(nameWithExt);
        const subcfgType = ext.slice(1);
        const subconfigKey = `${subcfgType}_file`;
        this.set(subconfigKey, nameWithExt);
        this.cache[subconfigKey] = nameWithExt;
        console.log(`setSubconfig`, {
            nameWithExt,
            subconfig,
        });
        this[subcfgType] = new Subconfig(nameWithExt, subconfig);
    }
    getSubconfig() {
        return this[this.experiment_type];
    }
    removeEmptyDirs(...dirs) {
        if (dirs.includes("subjects")) {
            const currentSubjects = this.subjects;
            for (let subjdir of fs.readdirSync(SUBJECTS_PATH_ABS)) {
                const subjdirAbs = path.join(SUBJECTS_PATH_ABS, subjdir);
                if (!currentSubjects.includes(subjdir)) {
                    util_1.ignoreErr(() => MyFs_1.default.removeEmptyDirs(subjdirAbs));
                }
                else {
                    for (let subdir of fs.readdirSync(subjdirAbs)) {
                        util_1.ignoreErr(() => MyFs_1.default.removeEmptyDirs(path.join(subjdirAbs, subdir)));
                    }
                }
            }
        }
    }
}
exports.BigConfigCls = BigConfigCls;
class Subconfig extends Conf {
    constructor(nameWithExt, subconfig) {
        let [filename, ext] = MyFs_1.default.split_ext(nameWithExt);
        if (!['.exam', '.test'].includes(ext)) {
            throw new Error(`Subconfig ctor (${nameWithExt}) has bad or no extension`);
        }
        const type = ext.slice(1);
        let defaults;
        if (util_1.bool(subconfig)) {
            if (subconfig.store) {
                defaults = Object.assign(Object.assign({}, subconfig.store), { name: nameWithExt });
            }
            else {
                defaults = subconfig;
            }
        }
        else {
            defaults = { name: nameWithExt };
        }
        super({
            fileExtension: type,
            cwd: CONFIGS_PATH_ABS,
            configName: filename,
            defaults
        });
        this.cache = { name: nameWithExt };
        this.type = type;
        if (util_1.bool(subconfig)) {
            this.set(Object.assign(Object.assign({}, subconfig.store), { name: nameWithExt }));
        }
        try {
            this.truth = new Truth_1.Truth(MyFs_1.default.remove_ext(this.truth_file));
        }
        catch (e) {
            console.error(`Subconfig constructor, initializing new Truth from this.truth_file threw an error. Probably because this.truth_file is undefined. Should maybe nest under if(subconfig) clause`, "this.truth_file", this.truth_file, e);
        }
    }
    get allowed_tempo_deviation() {
        return tryGetFromCache(this, "allowed_tempo_deviation");
    }
    set allowed_tempo_deviation(deviation) {
        this.setDeviation("tempo", deviation);
    }
    get allowed_rhythm_deviation() {
        return tryGetFromCache(this, "allowed_rhythm_deviation");
    }
    set allowed_rhythm_deviation(deviation) {
        this.setDeviation("rhythm", deviation);
    }
    get demo_type() {
        return tryGetFromCache(this, "demo_type");
    }
    set demo_type(type) {
        if (!['video', 'animation'].includes(type)) {
            console.warn(`Config demo_type setter, bad type = ${type}, can be either video or animation. Not setting`);
        }
        else {
            this.set('demo_type', type);
            this.cache.demo_type = type;
        }
    }
    get errors_playrate() {
        return this.get('errors_playrate');
    }
    set errors_playrate(speed) {
        if (isNaN(speed)) {
            console.warn(`config set errors_playrate, received bad "speed" NaN: ${speed}`);
        }
        else {
            this.set('errors_playrate', speed);
        }
    }
    get finished_trials_count() {
        return this.get('finished_trials_count');
    }
    set finished_trials_count(count) {
        if (isNaN(count) || count < 0) {
            console.warn(`config set finished_trials_count, received bad "count": ${count}`);
        }
        else {
            this.set('finished_trials_count', count);
        }
    }
    get name() {
        return this.cache.name;
    }
    get subject() {
        return this.get('subject');
    }
    set subject(name) {
        if (DRYRUN) {
            return console.warn('set subject, DRYRUN. Returning');
        }
        if (!util_1.bool(name)) {
            return console.warn(`set subject, !bool(name): ${name}. Returning`);
        }
        name = name.lower();
        this.set('subject', name);
        const Glob = require('../Glob').default;
        const existingSubjects = Glob.BigConfig.subjects.filter(util_1.bool);
        console.log({ existingSubjects });
        Glob.BigConfig.subjects = [...new Set([...existingSubjects, name])];
    }
    get truth_file() {
        return tryGetFromCache(this, 'truth_file');
    }
    set truth_file(truth_file) {
        let [name, ext] = MyFs_1.default.split_ext(truth_file);
        if (util_1.bool(ext)) {
            console.warn(`set truth_file, passed name is not extensionless: ${truth_file}. Continuing with "${name}"`);
        }
        const { default: MyAlert } = require('../MyAlert');
        try {
            let truth = new Truth_1.Truth(name);
            if (!truth.txt.allExist()) {
                MyAlert.small.warning(`Not all txt files exist: ${name}`);
            }
            this.truth = truth;
        }
        catch (e) {
            MyAlert.small.warning(e);
            console.warn(e);
        }
        this.set(`truth_file`, name);
        this.cache.truth_file = name;
    }
    get levels() {
        return this.get('levels');
    }
    set levels(levels) {
        if (!Array.isArray(levels)) {
            console.warn(`set levels, received "levels" not isArray. not setting anything. levels: `, levels);
        }
        else {
            this.set('levels', levels);
        }
    }
    static validateName(nameWithExt) {
        let [filename, ext] = MyFs_1.default.split_ext(nameWithExt);
        if (!['.exam', '.test'].includes(ext)) {
            throw new Error(`ExtensionError`);
        }
        if (nameWithExt !== `${filename}${ext}`) {
            throw new Error('BasenameError');
        }
    }
    async doTxtFilesCheck() {
        console.log(`💾 Subconfig(${this.type}).doTruthFileCheck()`);
        const { default: MyAlert } = require('../MyAlert');
        if (this.truth.txt.allExist()) {
            MyAlert.small.success(`${this.truth.name}.txt, *_on.txt, and *_off.txt files exist.`);
            return true;
        }
        const truthsWith3TxtFiles = getTruthsWith3TxtFiles();
        if (!util_1.bool(truthsWith3TxtFiles)) {
            MyAlert.big.warning({
                title: 'No valid truth files found',
                html: 'There needs to be at least one txt file with one "on" and one "off" counterparts.'
            });
            return false;
        }
        MyAlert.big.blocking({
            title: `Didn't find all three .txt files for ${this.truth.name}`,
            html: 'The following truths all have 3 txt files. Please choose one of them, or fix the files and reload.',
            showCloseButton: true,
        }, {
            strings: truthsWith3TxtFiles,
            clickFn: el => {
                try {
                    this.finished_trials_count = 0;
                    this.levels = [];
                    this.truth_file = el.text();
                    util_1.reloadPage();
                }
                catch (err) {
                    MyAlert.close();
                    MyAlert.big.error({ title: err.message, html: 'Something happened.' });
                }
            }
        });
        return false;
    }
    increase(K) {
        console.warn(`used subconfig.increase, UNTESTED`);
        if (DRYRUN) {
            return console.warn('increase, DRYRUN. returning');
        }
        let V = this.get(K);
        if (V === undefined)
            this.set(K, 1);
        else {
            const typeofV = typeof V;
            if (typeofV === 'number' || (typeofV === 'string' && V.isdigit())) {
                this.set(K, Math.floor(V) + 1);
            }
            else {
                console.warn("BigConfigCls tried to increase a value that is not a number nor a string.isdigit()");
            }
        }
    }
    toHtml() {
        let levels = this.levels;
        let levelsHtml = `
        <table class="subconfig-html">
            <tr>
                <th>Level #</th>
                <th>Notes</th>
                <th>Trials</th>
                <th>Rhythm</th>
                <th>Tempo</th>
            </tr>
        `;
        for (let [i, lvl] of util_1.enumerate(levels)) {
            levelsHtml += `
            <tr>
                <td>${i + 1}</td>
                <td>${lvl.notes}</td>
                <td>${lvl.trials}</td>
                <td>${lvl.rhythm}</td>
                <td>${lvl.tempo}</td>
            </tr>`;
        }
        levelsHtml += `</table>`;
        return `
            <table class="subconfig-html">
                <tr>
                    <th>Key</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Allowed rhythm deviation</td>
                    <td>${this.allowed_rhythm_deviation}</td>
                </tr>
                <tr>
                    <td>Allowed tempo deviation</td>
                    <td>${this.allowed_tempo_deviation}</td>
                </tr>
                <tr>
                    <td>Demo type</td>
                    <td>${this.demo_type}</td>
                </tr>
                <tr>
                    <td>Errors play rate</td>
                    <td>${this.errors_playrate}</td>
                </tr>
                <tr>
                    <td>Finished trials count</td>
                    <td>${this.finished_trials_count}</td>
                </tr>
                <tr>
                    <td>Name</td>
                    <td>${this.name}</td>
                </tr>
                <tr>
                    <td>Subject</td>
                    <td>${this.subject}</td>
                </tr>
                <tr>
                    <td>Truth file</td>
                    <td>${this.truth_file}</td>
                </tr>
                
            </table>

            ${levelsHtml}
            `;
    }
    fromSubconfig(subconfig) {
        if (DRYRUN)
            return console.warn('fromObj, DRYRUN. returning');
    }
    currentTrialCoords() {
        let flatTrialsList = this.levels.map(level => level.trials);
        for (let [levelIndex, trialsNum] of util_1.enumerate(flatTrialsList)) {
            let trialSumSoFar = util_1.sum(flatTrialsList.slice(0, levelIndex + 1));
            const finishedTrialsCount = this.finished_trials_count;
            if (trialSumSoFar > finishedTrialsCount)
                return [levelIndex, trialsNum - (trialSumSoFar - finishedTrialsCount)];
        }
        console.warn("currentTrialCoords: out of index error");
    }
    isDemoVideo() {
        return this.demo_type === 'video';
    }
    isWholeTestOver() {
        return util_1.sum(this.levels.map(level => level.trials)) == this.finished_trials_count;
    }
    getSubjectDirNames() {
        return fs.readdirSync(SUBJECTS_PATH_ABS);
    }
    getCurrentLevel() {
        let [level_index, trial_index] = this.currentTrialCoords();
        return new Level_1.Level(this.levels[level_index], level_index, trial_index);
    }
    getLevelCollection() {
        let [level_index, trial_index] = this.currentTrialCoords();
        return new Level_1.LevelCollection(this.levels, level_index, trial_index);
    }
    createTruthFromTrialResult() {
        console.warn(`This should be somewhere else`);
        let [level_index, trial_index] = this.currentTrialCoords();
        return new Truth_1.Truth(path.join(this.experimentOutDirAbs(), `level_${level_index}_trial_${trial_index}`));
    }
    experimentOutDirAbs() {
        const currSubjectDir = path.join(SUBJECTS_PATH_ABS, this.subject);
        return path.join(currSubjectDir, this.truth.name);
    }
    _updateSavedFile(key, value) {
        if (DRYRUN) {
            return console.warn('_updateSavedFile, DRYRUN. returning');
        }
        return console.warn('_updateSavedFile() does nothing, returning');
        this.set(key, value);
    }
    setDeviation(deviationType, deviation) {
        if (util_1.isString(deviation)) {
            if (isNaN(parseFloat(deviation))) {
                console.warn(`setDeviation got string deviation, couldnt parseFloat. deviation: "${deviation}". returning`);
                return;
            }
            deviation = parseFloat(deviation);
        }
        this.set(`allowed_${deviationType}_deviation`, deviation);
        this.cache[`allowed_${deviationType}_deviation`] = deviation;
    }
}
exports.Subconfig = Subconfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLGtDQUEyQjtBQUMzQixrQ0FBdUc7QUFDdkcsb0NBQWlDO0FBQ2pDLG9DQUEwRDtBQUUxRCw2QkFBNkI7QUFFN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBdUR0QyxTQUFTLGVBQWUsQ0FBQyxNQUFNLEVBQUUsSUFBSTtJQUNqQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUyxFQUFFO1FBQ2xDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUM7UUFDN0IsT0FBTyxPQUFPLENBQUM7S0FDbEI7U0FBTTtRQUNILE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUM3QjtBQUNMLENBQUM7QUFHRCxTQUFnQixrQkFBa0IsQ0FBQyxFQUFFLFNBQVMsS0FBNEMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFO0lBQzlHLElBQUksU0FBUyxFQUFFO1FBQ1gsSUFBSSxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBRTNCLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xDO1FBQ0QsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDNUMsT0FBTyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsU0FBUyw0RUFBNEUsQ0FBQyxDQUFDO1lBQ3ZILFNBQVMsR0FBRyxTQUFTLENBQUM7U0FDekI7S0FDSjtJQUlELElB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LElBQUksQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFHTyxnQkFBZ0IsQ0FBQyxHQUFxQixFQUFFLEtBQUs7UUFDakQsSUFBSSxNQUFNLEVBQUU7WUFDUixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMscUNBQXFDLENBQUMsQ0FBQTtTQUM3RDtRQUNELE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBUXpCLENBQUM7SUFFTyxZQUFZLENBQUMsYUFBNEIsRUFBRSxTQUFpQjtRQUloRSxJQUFJLGVBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNyQixJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRTtnQkFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxzRUFBc0UsU0FBUyxjQUFjLENBQUMsQ0FBQztnQkFDNUcsT0FBTTthQUNUO1lBQ0QsU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNyQztRQUdELElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxhQUFhLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsYUFBYSxZQUFZLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDakUsQ0FBQztDQUdKO0FBeGJELDhCQXdiQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFN0b3JlIGZyb20gXCJlbGVjdHJvbi1zdG9yZVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgbXlmcyBmcm9tIFwiLi4vTXlGc1wiO1xuaW1wb3J0IHsgYm9vbCwgcmVsb2FkUGFnZSwgc3VtLCBlbnVtZXJhdGUsIGFsbCwgZ2V0Q3VycmVudFdpbmRvdywgaWdub3JlRXJyLCBpc1N0cmluZyB9IGZyb20gXCIuLi91dGlsXCI7XG5pbXBvcnQgeyBUcnV0aCB9IGZyb20gXCIuLi9UcnV0aFwiO1xuaW1wb3J0IHsgSUxldmVsLCBMZXZlbCwgTGV2ZWxDb2xsZWN0aW9uIH0gZnJvbSBcIi4uL0xldmVsXCI7XG5pbXBvcnQgeyBTd2VldEFsZXJ0UmVzdWx0IH0gZnJvbSBcInN3ZWV0YWxlcnQyXCI7XG5pbXBvcnQgKiBhcyBDb25mIGZyb20gJ2NvbmYnO1xuXG5jb25zb2xlLmxvZygnc3JjL0JpZ0NvbmZpZy9pbmRleC50cycpO1xuXG5cbmV4cG9ydCB0eXBlIEV4cGVyaW1lbnRUeXBlID0gJ2V4YW0nIHwgJ3Rlc3QnO1xuZXhwb3J0IHR5cGUgRGVtb1R5cGUgPSAndmlkZW8nIHwgJ2FuaW1hdGlvbic7XG5leHBvcnQgdHlwZSBQYWdlTmFtZSA9IFwibmV3XCIgLy8gQUtBIFRMYXN0UGFnZVxuICAgIHwgXCJydW5uaW5nXCJcbiAgICB8IFwicmVjb3JkXCJcbiAgICB8IFwiZmlsZV90b29sc1wiXG4gICAgfCBcInNldHRpbmdzXCJcbnR5cGUgRGV2aWF0aW9uVHlwZSA9ICdyaHl0aG0nIHwgJ3RlbXBvJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIElTdWJjb25maWcge1xuICAgIGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbjogbnVtYmVyLFxuICAgIGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uOiBudW1iZXIsXG4gICAgZGVtb190eXBlOiBEZW1vVHlwZSxcbiAgICBlcnJvcnNfcGxheXJhdGU6IG51bWJlcixcbiAgICBmaW5pc2hlZF90cmlhbHNfY291bnQ6IG51bWJlcixcbiAgICBsZXZlbHM6IElMZXZlbFtdLFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzdWJqZWN0OiBzdHJpbmcsXG4gICAgdHJ1dGhfZmlsZTogc3RyaW5nLFxufVxuXG5cbmludGVyZmFjZSBEZXZPcHRpb25zIHtcbiAgICBmb3JjZV9ub3Rlc19udW1iZXI6IG51bGwgfCBudW1iZXIsXG4gICAgZm9yY2VfcGxheWJhY2tfcmF0ZTogbnVsbCB8IG51bWJlcixcbiAgICBtdXRlX2FuaW1hdGlvbjogYm9vbGVhbixcbiAgICBub19yZWxvYWRfb25fc3VibWl0OiBib29sZWFuLFxuICAgIHNpbXVsYXRlX3Rlc3RfbW9kZTogYm9vbGVhbixcbiAgICBzaW11bGF0ZV92aWRlb19tb2RlOiBib29sZWFuLFxuICAgIHNpbXVsYXRlX2FuaW1hdGlvbl9tb2RlOiBib29sZWFuLFxuICAgIHNraXBfZXhwZXJpbWVudF9pbnRybzogYm9vbGVhbixcbiAgICBza2lwX2ZhZGU6IGJvb2xlYW4sXG4gICAgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2s6IGJvb2xlYW4sXG4gICAgc2tpcF9sZXZlbF9pbnRybzogYm9vbGVhbixcbiAgICBza2lwX21pZGlfZXhpc3RzX2NoZWNrOiBib29sZWFuLFxuICAgIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrOiBib29sZWFuLFxufVxuXG5pbnRlcmZhY2UgSUJpZ0NvbmZpZyB7XG4gICAgZGV2OiBib29sZWFuLFxuICAgIGRldm9wdGlvbnM6IERldk9wdGlvbnMsXG4gICAgZXhhbV9maWxlOiBzdHJpbmcsXG4gICAgZXhwZXJpbWVudF90eXBlOiBFeHBlcmltZW50VHlwZSxcbiAgICBsYXN0X3BhZ2U6IFBhZ2VOYW1lLFxuICAgIHN1YmplY3RzOiBzdHJpbmdbXSxcbiAgICB0ZXN0X2ZpbGU6IHN0cmluZyxcbiAgICB2ZWxvY2l0aWVzOiBudW1iZXIsXG59XG5cbmZ1bmN0aW9uIHRyeUdldEZyb21DYWNoZTxUIGV4dGVuZHMga2V5b2YgSUJpZ0NvbmZpZz4oY29uZmlnOiBCaWdDb25maWdDbHMsIHByb3A6IFQpOiBJQmlnQ29uZmlnW1RdXG5mdW5jdGlvbiB0cnlHZXRGcm9tQ2FjaGU8VCBleHRlbmRzIGtleW9mIElTdWJjb25maWc+KGNvbmZpZzogU3ViY29uZmlnLCBwcm9wOiBUKTogSVN1YmNvbmZpZ1tUXVxuZnVuY3Rpb24gdHJ5R2V0RnJvbUNhY2hlKGNvbmZpZywgcHJvcCkge1xuICAgIGlmIChjb25maWcuY2FjaGVbcHJvcF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCBwcm9wVmFsID0gY29uZmlnLmdldChwcm9wKTtcbiAgICAgICAgY29uZmlnLmNhY2hlW3Byb3BdID0gcHJvcFZhbDtcbiAgICAgICAgcmV0dXJuIHByb3BWYWw7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5jYWNoZVtwcm9wXTtcbiAgICB9XG59XG5cbi8qKkxpc3Qgb2YgdHJ1dGggZmlsZSBuYW1lcywgbm8gZXh0ZW5zaW9uKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcnV0aEZpbGVzV2hlcmUoeyBleHRlbnNpb24gfTogeyBleHRlbnNpb24/OiAndHh0JyB8ICdtaWQnIHwgJ21wNCcgfSA9IHsgZXh0ZW5zaW9uOiB1bmRlZmluZWQgfSk6IHN0cmluZ1tdIHtcbiAgICBpZiAoZXh0ZW5zaW9uKSB7XG4gICAgICAgIGlmIChleHRlbnNpb24uc3RhcnRzV2l0aCgnLicpKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBleHRlbnNpb24gPSBleHRlbnNpb24uc2xpY2UoMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFbJ3R4dCcsICdtaWQnLCAnbXA0J10uaW5jbHVkZXMoZXh0ZW5zaW9uKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGB0cnV0aEZpbGVzTGlzdChcIiR7ZXh0ZW5zaW9ufVwiKSwgbXVzdCBiZSBlaXRoZXIgWyd0eHQnLCdtaWQnLCdtcDQnXSBvciBub3QgYXQgYWxsLiBzZXR0aW5nIHRvIHVuZGVmaW5lZGApO1xuICAgICAgICAgICAgZXh0ZW5zaW9uID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29uc3QgdHJ1dGhzRGlyUGF0aCA9IHRoaXMudHJ1dGhzRGlyUGF0aCgpO1xuXG4gICAgbGV0IHRydXRoRmlsZXMgPSBbLi4ubmV3IFNldChmcy5yZWFkZGlyU3luYyhUUlVUSFNfUEFUSF9BQlMpKV07XG4gICAgbGV0IGZvcm1hdHRlZFRydXRoRmlsZXMgPSBbXTtcbiAgICBmb3IgKGxldCBmaWxlIG9mIHRydXRoRmlsZXMpIHtcbiAgICAgICAgbGV0IFtuYW1lLCBleHRdID0gbXlmcy5zcGxpdF9leHQoZmlsZSk7XG4gICAgICAgIGlmIChleHRlbnNpb24pIHtcbiAgICAgICAgICAgIGlmIChleHQubG93ZXIoKSA9PT0gYC4ke2V4dGVuc2lvbn1gKSB7XG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkVHJ1dGhGaWxlcy5wdXNoKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9ybWF0dGVkVHJ1dGhGaWxlcy5wdXNoKG5hbWUpO1xuXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZvcm1hdHRlZFRydXRoRmlsZXNcblxufVxuXG4vKipMaXN0IG9mIG5hbWVzIG9mIHR4dCB0cnV0aCBmaWxlcyB0aGF0IGhhdmUgdGhlaXIgd2hvbGUgXCJ0cmlwbGV0XCIgaW4gdGFjdC4gbm8gZXh0ZW5zaW9uKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcnV0aHNXaXRoM1R4dEZpbGVzKCk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCB0eHRGaWxlc0xpc3QgPSBnZXRUcnV0aEZpbGVzV2hlcmUoeyBleHRlbnNpb246ICd0eHQnIH0pO1xuICAgIGNvbnN0IHdob2xlVHh0RmlsZXMgPSBbXTtcbiAgICBmb3IgKGxldCBuYW1lIG9mIHR4dEZpbGVzTGlzdCkge1xuICAgICAgICBpZiAodHh0RmlsZXNMaXN0LmNvdW50KHR4dCA9PiB0eHQuc3RhcnRzV2l0aChuYW1lKSkgPj0gMykge1xuICAgICAgICAgICAgd2hvbGVUeHRGaWxlcy5wdXNoKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0eHRGaWxlc0xpc3QuZmlsdGVyKGEgPT4gdHh0RmlsZXNMaXN0LmZpbHRlcih0eHQgPT4gdHh0LnN0YXJ0c1dpdGgoYSkpLmxlbmd0aCA+PSAzKTtcbn1cblxuZXhwb3J0IGNsYXNzIEJpZ0NvbmZpZ0NscyBleHRlbmRzIFN0b3JlPElCaWdDb25maWc+IHtcbiAgICB0ZXN0OiBTdWJjb25maWc7XG4gICAgZXhhbTogU3ViY29uZmlnO1xuICAgIHJlYWRvbmx5IGNhY2hlOiBQYXJ0aWFsPElCaWdDb25maWc+O1xuXG4gICAgY29uc3RydWN0b3IoZG9Gc0NoZWNrdXAgPSB0cnVlKSB7XG5cbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgY2xlYXJJbnZhbGlkQ29uZmlnOiBmYWxzZSxcbiAgICAgICAgICAgIGRlZmF1bHRzOiB7XG4gICAgICAgICAgICAgICAgXCJkZXZcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJkZXZvcHRpb25zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yY2Vfbm90ZXNfbnVtYmVyOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBmb3JjZV9wbGF5YmFja19yYXRlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBtdXRlX2FuaW1hdGlvbjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG5vX3JlbG9hZF9vbl9zdWJtaXQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBzaW11bGF0ZV90ZXN0X21vZGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBzaW11bGF0ZV92aWRlb19tb2RlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgc2ltdWxhdGVfYW5pbWF0aW9uX21vZGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBza2lwX2V4cGVyaW1lbnRfaW50cm86IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBza2lwX2ZhZGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjazogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHNraXBfbGV2ZWxfaW50cm86IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBza2lwX21pZGlfZXhpc3RzX2NoZWNrOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2s6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJleGFtX2ZpbGVcIjogXCJmdXJfZWxpc2VfQi5leGFtXCIsXG4gICAgICAgICAgICAgICAgXCJleHBlcmltZW50X3R5cGVcIjogXCJ0ZXN0XCIsXG4gICAgICAgICAgICAgICAgXCJsYXN0X3BhZ2VcIjogXCJuZXdcIixcbiAgICAgICAgICAgICAgICBcInRlc3RfZmlsZVwiOiBcImZ1cl9lbGlzZV9CLnRlc3RcIixcblxuICAgICAgICAgICAgICAgIFwic3ViamVjdHNcIjogW10sXG4gICAgICAgICAgICAgICAgXCJ2ZWxvY2l0aWVzXCI6IDJcblxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zb2xlLmxvZyhgdGhpcy5wYXRoOiAke3RoaXMucGF0aH1gKTtcbiAgICAgICAgdGhpcy5jYWNoZSA9IHt9O1xuICAgICAgICBpZiAoRFJZUlVOKSB7XG4gICAgICAgICAgICB0aGlzLnNldCA9ICguLi5hcmdzKSA9PiBjb25zb2xlLndhcm4oYERSWVJVTiwgc2V0OiBgLCBhcmdzKVxuICAgICAgICB9XG4gICAgICAgIGxldCB0ZXN0TmFtZVdpdGhFeHQgPSB0aGlzLnRlc3RfZmlsZTtcbiAgICAgICAgbGV0IGV4YW1OYW1lV2l0aEV4dCA9IHRoaXMuZXhhbV9maWxlO1xuICAgICAgICBpZiAoIWFsbCh0ZXN0TmFtZVdpdGhFeHQsIGV4YW1OYW1lV2l0aEV4dCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQmlnQ29uZmlnQ2xzIGN0b3IsIGNvdWxkbnQgZ2V0IHRlc3RfZmlsZSBhbmQvb3IgZXhhbV9maWxlIGZyb20ganNvbjpgLCB7XG4gICAgICAgICAgICAgICAgdGVzdE5hbWVXaXRoRXh0LFxuICAgICAgICAgICAgICAgIGV4YW1OYW1lV2l0aEV4dFxuICAgICAgICAgICAgfSwgJywgZGVmYXVsdGluZyB0byBcImZ1cl9lbGlzZV9CLltleHRdXCInKTtcbiAgICAgICAgICAgIHRlc3ROYW1lV2l0aEV4dCA9ICdmdXJfZWxpc2VfQi50ZXN0JztcbiAgICAgICAgICAgIGV4YW1OYW1lV2l0aEV4dCA9ICdmdXJfZWxpc2VfQi5leGFtJztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN1YmNvbmZpZyh0ZXN0TmFtZVdpdGhFeHQpO1xuICAgICAgICB0aGlzLnNldFN1YmNvbmZpZyhleGFtTmFtZVdpdGhFeHQpO1xuICAgICAgICAvLyB0aGlzLnRlc3QgPSBuZXcgU3ViY29uZmlnKHRlc3ROYW1lV2l0aEV4dCk7XG4gICAgICAgIC8vIHRoaXMuZXhhbSA9IG5ldyBTdWJjb25maWcoZXhhbU5hbWVXaXRoRXh0KTtcbiAgICAgICAgdGhpcy5zdWJqZWN0cyA9IHRoaXMuc3ViamVjdHM7IC8vIHRvIGVuc3VyZSBoYXZpbmcgc3ViY29uZmlnJ3Mgc3ViamVjdHNcbiAgICAgICAgaWYgKGRvRnNDaGVja3VwKSB7XG4gICAgICAgICAgICBQcm9taXNlLmFsbChbdGhpcy50ZXN0LmRvVHh0RmlsZXNDaGVjaygpLCB0aGlzLmV4YW0uZG9UeHRGaWxlc0NoZWNrKCldKVxuICAgICAgICAgICAgICAgIC5jYXRjaChhc3luYyByZWFzb24gPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50V2luZG93ID0gZ2V0Q3VycmVudFdpbmRvdygpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghY3VycmVudFdpbmRvdy53ZWJDb250ZW50cy5pc0RldlRvb2xzT3BlbmVkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRXaW5kb3cud2ViQ29udGVudHMub3BlbkRldlRvb2xzKHsgbW9kZTogXCJ1bmRvY2tlZFwiIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBCaWdDb25maWdDbHMgY3RvciwgZXJyb3Igd2hlbiBkb0ZzQ2hlY2t1cDpgLCByZWFzb24pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBNeUFsZXJ0ID0gcmVxdWlyZSgnLi4vTXlBbGVydCcpO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBNeUFsZXJ0LmJpZy5lcnJvcih7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogYEFuIGVycm9yIG9jY3VyZWQgd2hlbiBtYWtpbmcgc3VyZSBhbGwgdHJ1dGggdHh0IGZpbGVzIGV4aXN0LiBUcmllZCB0byBjaGVjazogJHt0aGlzLnRlc3QudHJ1dGgubmFtZX0gYW5kICR7dGhpcy5leGFtLnRydXRoLm5hbWV9LmAsXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sOiByZWFzb24sXG5cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRW1wdHlEaXJzKFwic3ViamVjdHNcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgbGFzdF9wYWdlKCk6IFBhZ2VOYW1lIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdsYXN0X3BhZ2UnKTtcbiAgICB9XG5cbiAgICBzZXQgbGFzdF9wYWdlKHBhZ2U6IFBhZ2VOYW1lKSB7XG5cbiAgICAgICAgY29uc3QgdmFsaWRwYWdlcyA9IFtcIm5ld1wiLCBcInJ1bm5pbmdcIiwgXCJyZWNvcmRcIiwgXCJmaWxlX3Rvb2xzXCIsIFwic2V0dGluZ3NcIl07XG4gICAgICAgIGlmICghdmFsaWRwYWdlcy5pbmNsdWRlcyhwYWdlKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGFzdF9wYWdlKFwiJHtwYWdlfVwiKSwgbXVzdCBiZSBvbmUgb2YgJHt2YWxpZHBhZ2VzLmpvaW4oJywgJyl9LiBzZXR0aW5nIHRvIG5ld2ApO1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xhc3RfcGFnZScsICduZXcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCBwYWdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKkBjYWNoZWRcbiAgICAgKiBSZXR1cm5zIHRoZSBleGFtIGZpbGUgbmFtZSBpbmNsdWRpbmcgZXh0ZW5zaW9uKi9cbiAgICBnZXQgZXhhbV9maWxlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgJ2V4YW1fZmlsZScpO1xuICAgICAgICAvLyByZXR1cm4gdGhpcy5nZXQoJ2V4YW1fZmlsZScpO1xuICAgIH1cblxuICAgIC8qKlVwZGF0ZXMgZXhhbV9maWxlIGFuZCBhbHNvIGluaXRpYWxpemVzIG5ldyBTdWJjb25maWcqL1xuICAgIHNldCBleGFtX2ZpbGUobmFtZVdpdGhFeHQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldFN1YmNvbmZpZyhuYW1lV2l0aEV4dClcbiAgICB9XG5cbiAgICAvKipAY2FjaGVkXG4gICAgICogUmV0dXJucyB0aGUgdGVzdCBmaWxlIG5hbWUgaW5jbHVkaW5nIGV4dGVuc2lvbiovXG4gICAgZ2V0IHRlc3RfZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsICd0ZXN0X2ZpbGUnKTtcbiAgICB9XG5cbiAgICAvKipAY2FjaGVkXG4gICAgICogVXBkYXRlcyB0ZXN0X2ZpbGUgYW5kIGFsc28gaW5pdGlhbGl6ZXMgbmV3IFN1YmNvbmZpZyovXG4gICAgc2V0IHRlc3RfZmlsZShuYW1lV2l0aEV4dDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3ViY29uZmlnKG5hbWVXaXRoRXh0KVxuICAgIH1cblxuICAgIC8qKkBjYWNoZWRcbiAgICAgKiBDYW4gYmUgZ290dGVuIGFsc28gd2l0aCBgc3ViY29uZmlnLnR5cGVgKi9cbiAgICBnZXQgZXhwZXJpbWVudF90eXBlKCk6IEV4cGVyaW1lbnRUeXBlIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCBcImV4cGVyaW1lbnRfdHlwZVwiKVxuICAgICAgICAvKmlmICggdGhpcy5jYWNoZS5leHBlcmltZW50X3R5cGUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgIGNvbnN0IGV4cGVyaW1lbnRUeXBlID0gdGhpcy5nZXQoJ2V4cGVyaW1lbnRfdHlwZScpO1xuICAgICAgICAgdGhpcy5jYWNoZS5leHBlcmltZW50X3R5cGUgPSBleHBlcmltZW50VHlwZTtcbiAgICAgICAgIHJldHVybiBleHBlcmltZW50VHlwZTtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5leHBlcmltZW50X3R5cGU7XG4gICAgICAgICB9Ki9cbiAgICB9XG5cbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgZXhwZXJpbWVudF90eXBlKGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBpZiAoIVsnZXhhbScsICd0ZXN0J10uaW5jbHVkZXMoZXhwZXJpbWVudFR5cGUpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEJpZ0NvbmZpZyBleHBlcmltZW50X3R5cGUgc2V0dGVyLCBnb3QgZXhwZXJpbWVudFR5cGU6ICcke2V4cGVyaW1lbnRUeXBlfScuIE11c3QgYmUgZWl0aGVyICd0ZXN0JyBvciAnZXhhbScuIHNldHRpbmcgdG8gdGVzdGApO1xuICAgICAgICAgICAgZXhwZXJpbWVudFR5cGUgPSAndGVzdCc7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoJ2V4cGVyaW1lbnRfdHlwZScsIGV4cGVyaW1lbnRUeXBlKTtcbiAgICAgICAgdGhpcy5jYWNoZS5leHBlcmltZW50X3R5cGUgPSBleHBlcmltZW50VHlwZTtcblxuXG4gICAgfVxuXG4gICAgZ2V0IHN1YmplY3RzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdzdWJqZWN0cycpO1xuICAgIH1cblxuICAgIC8qKkVuc3VyZXMgaGF2aW5nIGB0aGlzLnRlc3Quc3ViamVjdGAgYW5kIGB0aGlzLmV4YW0uc3ViamVjdGAgaW4gdGhlIGxpc3QgcmVnYXJkbGVzcyovXG4gICAgc2V0IHN1YmplY3RzKHN1YmplY3RMaXN0OiBzdHJpbmdbXSkge1xuICAgICAgICAvLyBUT0RPOiBjaGVjayBmb3Igbm9uIGV4aXN0aW5nIGZyb20gZmlsZXNcbiAgICAgICAgaWYgKERSWVJVTikge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2Fybignc2V0IHN1YmplY3RzLCBEUllSVU4uIHJldHVybmluZycpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN1YmplY3RMaXN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQmlnQ29uZmlnQ2xzLnN1YmplY3QoKSBzZXR0ZXIgZ290IHVuZGVmaW5lZCwgY29udGludWVpbmcgd2l0aCBbXScpO1xuICAgICAgICAgICAgc3ViamVjdExpc3QgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBzdWJqZWN0TGlzdC5wdXNoKHRoaXMudGVzdC5zdWJqZWN0KTtcbiAgICAgICAgc3ViamVjdExpc3QucHVzaCh0aGlzLmV4YW0uc3ViamVjdCk7XG4gICAgICAgIGNvbnN0IHN1YmplY3RzID0gWy4uLm5ldyBTZXQoc3ViamVjdExpc3QpXS5maWx0ZXIoYm9vbCk7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgc3ViamVjdHMgfSk7XG4gICAgICAgIGZvciAobGV0IHMgb2Ygc3ViamVjdHMpIHtcbiAgICAgICAgICAgIG15ZnMuY3JlYXRlSWZOb3RFeGlzdHMocGF0aC5qb2luKFNVQkpFQ1RTX1BBVEhfQUJTLCBzKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldCgnc3ViamVjdHMnLCBzdWJqZWN0cyk7XG5cbiAgICB9XG5cbiAgICAvLyBnZXQgZGV2KCk6IHsgW0sgaW4ga2V5b2YgRGV2T3B0aW9uc106IERldk9wdGlvbnNbS10gZXh0ZW5kcyBvYmplY3QgPyB7IFtTSyBpbiBrZXlvZiBEZXZPcHRpb25zW0tdXTogKCkgPT4gRGV2T3B0aW9uc1tLXVtTS10gfSA6ICgpID0+IERldk9wdGlvbnNbS10gfSB7XG4gICAgZ2V0IGRldigpOiB7IFtLIGluIGtleW9mIERldk9wdGlvbnNdOiAod2hlcmU/OiBzdHJpbmcpID0+IERldk9wdGlvbnNbS10gfSB7XG4gICAgICAgIGNvbnN0IF9kZXYgPSB0aGlzLmdldCgnZGV2Jyk7XG5cbiAgICAgICAgY29uc3QgaGFuZGxlQm9vbGVhbiA9IDxLIGV4dGVuZHMga2V5b2YgRGV2T3B0aW9ucz4oa2V5OiBLLCB3aGVyZSk6IERldk9wdGlvbnNbS10gPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJylba2V5XTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLiR7a2V5fSAke3doZXJlfWApO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZvcmNlX25vdGVzX251bWJlcjogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChfZGV2KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZvcmNlX25vdGVzX251bWJlciA9IHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuZm9yY2Vfbm90ZXNfbnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZm9yY2Vfbm90ZXNfbnVtYmVyKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuZm9yY2Vfbm90ZXNfbnVtYmVyOiAke2ZvcmNlX25vdGVzX251bWJlcn1gKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZvcmNlX25vdGVzX251bWJlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZm9yY2VfcGxheWJhY2tfcmF0ZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChfZGV2KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZvcmNlX3BsYXliYWNrX3JhdGUgPSB0aGlzLmdldCgnZGV2b3B0aW9ucycpLmZvcmNlX3BsYXliYWNrX3JhdGU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmb3JjZV9wbGF5YmFja19yYXRlKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuZm9yY2VfcGxheWJhY2tfcmF0ZTogJHtmb3JjZV9wbGF5YmFja19yYXRlfWApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm9yY2VfcGxheWJhY2tfcmF0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBzaW11bGF0ZV90ZXN0X21vZGU6ICh3aGVyZT86IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVCb29sZWFuKFwic2ltdWxhdGVfdGVzdF9tb2RlXCIsIHdoZXJlKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zdCBzaW11bGF0ZV90ZXN0X21vZGUgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2ltdWxhdGVfdGVzdF9tb2RlO1xuICAgICAgICAgICAgICAgIC8vIGlmICggc2ltdWxhdGVfdGVzdF9tb2RlICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNpbXVsYXRlX3Rlc3RfbW9kZSAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIC8vIHJldHVybiBzaW11bGF0ZV90ZXN0X21vZGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaW11bGF0ZV9hbmltYXRpb25fbW9kZTogKHdoZXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUJvb2xlYW4oXCJzaW11bGF0ZV9hbmltYXRpb25fbW9kZVwiLCB3aGVyZSk7XG4gICAgICAgICAgICAgICAgLy8gY29uc3Qgc2ltdWxhdGVfYW5pbWF0aW9uX21vZGUgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2ltdWxhdGVfYW5pbWF0aW9uX21vZGU7XG4gICAgICAgICAgICAgICAgLy8gaWYgKCBzaW11bGF0ZV9hbmltYXRpb25fbW9kZSApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5zaW11bGF0ZV9hbmltYXRpb25fbW9kZSAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIC8vIHJldHVybiBzaW11bGF0ZV9hbmltYXRpb25fbW9kZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNpbXVsYXRlX3ZpZGVvX21vZGU6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNpbXVsYXRlX3ZpZGVvX21vZGUgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2ltdWxhdGVfdmlkZW9fbW9kZTtcbiAgICAgICAgICAgICAgICBpZiAoc2ltdWxhdGVfdmlkZW9fbW9kZSkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNpbXVsYXRlX3ZpZGVvX21vZGUgJHt3aGVyZX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2ltdWxhdGVfdmlkZW9fbW9kZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNraXBfZmFkZTogKHdoZXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpcF9mYWRlID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfZmFkZTtcbiAgICAgICAgICAgICAgICBpZiAoc2tpcF9mYWRlKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF9mYWRlICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfZmFkZTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG11dGVfYW5pbWF0aW9uOiAod2hlcmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtdXRlX2FuaW1hdGlvbiA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5tdXRlX2FuaW1hdGlvbjtcbiAgICAgICAgICAgICAgICBpZiAobXV0ZV9hbmltYXRpb24pIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5tdXRlX2FuaW1hdGlvbiAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBtdXRlX2FuaW1hdGlvbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBza2lwX21pZGlfZXhpc3RzX2NoZWNrOiAod2hlcmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwX21pZGlfZXhpc3RzX2NoZWNrID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfbWlkaV9leGlzdHNfY2hlY2s7XG4gICAgICAgICAgICAgICAgaWYgKHNraXBfbWlkaV9leGlzdHNfY2hlY2spIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5za2lwX21pZGlfZXhpc3RzX2NoZWNrICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfbWlkaV9leGlzdHNfY2hlY2s7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2tpcF9leHBlcmltZW50X2ludHJvOiAod2hlcmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwX2V4cGVyaW1lbnRfaW50cm8gPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9leHBlcmltZW50X2ludHJvO1xuICAgICAgICAgICAgICAgIGlmIChza2lwX2V4cGVyaW1lbnRfaW50cm8pIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5za2lwX2V4cGVyaW1lbnRfaW50cm8gJHt3aGVyZX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2tpcF9leHBlcmltZW50X2ludHJvO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNraXBfbGV2ZWxfaW50cm86ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfbGV2ZWxfaW50cm8gPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9sZXZlbF9pbnRybztcbiAgICAgICAgICAgICAgICBpZiAoc2tpcF9sZXZlbF9pbnRybykgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNraXBfbGV2ZWxfaW50cm8gJHt3aGVyZX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2tpcF9sZXZlbF9pbnRybztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjazogKHdoZXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2sgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2s7XG4gICAgICAgICAgICAgICAgaWYgKHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2sgJHt3aGVyZX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2s7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2s6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrO1xuICAgICAgICAgICAgICAgIGlmIChza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjaykgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5vX3JlbG9hZF9vbl9zdWJtaXQ6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vX3JlbG9hZF9vbl9zdWJtaXQgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykubm9fcmVsb2FkX29uX3N1Ym1pdDtcbiAgICAgICAgICAgICAgICBpZiAobm9fcmVsb2FkX29uX3N1Ym1pdCkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLm5vX3JlbG9hZF9vbl9zdWJtaXQgJHt3aGVyZX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9fcmVsb2FkX29uX3N1Ym1pdDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0IHZlbG9jaXRpZXMoKSB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJ2ZWxvY2l0aWVzXCIpXG4gICAgfVxuXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IHZlbG9jaXRpZXModmFsOiBudW1iZXIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGZsb29yZWQgPSBNYXRoLmZsb29yKHZhbCk7XG4gICAgICAgICAgICBpZiAoaXNOYU4oZmxvb3JlZCkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCB2ZWxvY2l0aWVzLCBNYXRoLmZsb29yKHZhbCkgaXMgTmFOOmAsIHsgdmFsLCBmbG9vcmVkIH0sICcuIG5vdCBzZXR0aW5nJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChmbG9vcmVkID49IDEgJiYgZmxvb3JlZCA8PSAxNikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldCgndmVsb2NpdGllcycsIGZsb29yZWQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhY2hlLnZlbG9jaXRpZXMgPSBmbG9vcmVkO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgdmVsb2NpdGllcywgYmFkIHJhbmdlOiAke3ZhbH0uIG5vdCBzZXR0aW5nYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCB2ZWxvY2l0aWVzLCBFeGNlcHRpb24gd2hlbiB0cnlpbmcgdG8gTWF0aC5mbG9vcih2YWwpOmAsIGUpO1xuICAgICAgICB9XG5cblxuICAgIH1cblxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBmcm9tU2F2ZWRDb25maWcoc2F2ZWRDb25maWc6IElTdWJjb25maWcsIGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdCaWdDb25maWdDbHMgdXNlZCBmcm9tU2F2ZWRDb25maWcuIEltcG9zc2libGUgdG8gbG9hZCBiaWcgZmlsZS4gUmV0dXJuaW5nJyk7XG4gICAgICAgIC8qaWYgKCBEUllSVU4gKSByZXR1cm4gY29uc29sZS5sb2coYGZyb21TYXZlZENvbmZpZywgRFJZUlVOYCk7XG4gICAgICAgICBjb25zdCB0cnV0aEZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShzYXZlZENvbmZpZy50cnV0aF9maWxlX3BhdGgsICcudHh0Jyk7XG4gICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICB0aGlzLnRydXRoX2ZpbGVfcGF0aCA9IG5ldyBUcnV0aChwYXRoLmpvaW4oVFJVVEhTX1BBVEhfQUJTLCB0cnV0aEZpbGVOYW1lKSk7XG4gICAgICAgICB0aGlzLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgdGhpcy5jb25maWcoZXhwZXJpbWVudFR5cGUpLmZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZyk7Ki9cbiAgICB9XG5cbiAgICAvKipAZXhhbXBsZVxuICAgICB1cGRhdGUoJ3N1YmplY3RzJywgW25hbWVzXSlcbiAgICAgKi9cbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywga3ZQYWlyczogUGFydGlhbDxJQmlnQ29uZmlnPilcblxuICAgIHVwZGF0ZShLOiBrZXlvZiBJQmlnQ29uZmlnLCB2YWx1ZXM6IGFueVtdKVxuXG4gICAgdXBkYXRlKEssIGt2KSB7XG4gICAgICAgIGlmIChEUllSVU4pIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ0JpZ0NvbmZpZy51cGRhdGUoKSBEUllSVU4uIHJldHVybmluZycpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBWID0gdGhpcy5nZXQoSyk7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KFYpKSB7XG4gICAgICAgICAgICBsZXQgbmV3VmFsdWU6IGFueVtdID0gVjtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGt2KSkge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlLnB1c2goLi4ua3YpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZS5wdXNoKGt2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0KEssIG5ld1ZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oViwga3YpO1xuICAgICAgICAgICAgdGhpcy5zZXQoSywgVik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KEspO1xuICAgIH1cblxuICAgIC8qKkBjYWNoZWRcbiAgICAgKiBTaG91bGQgYmUgdXNlZCBpbnN0ZWFkIG9mIFN1YmNvbmZpZyBjb25zdHJ1Y3Rvci5cbiAgICAgKiBVcGRhdGVzIGBleGFtX2ZpbGVgIG9yIGB0ZXN0X2ZpbGVgLCBpbiBmaWxlIGFuZCBpbiBjYWNoZS4gQWxzbyBpbml0aWFsaXplcyBhbmQgY2FjaGVzIGEgbmV3IFN1YmNvbmZpZyAodGhpcy5leGFtID0gbmV3IFN1YmNvbmZpZyguLi4pKS4gKi9cbiAgICBzZXRTdWJjb25maWcobmFtZVdpdGhFeHQ6IHN0cmluZywgc3ViY29uZmlnPzogU3ViY29uZmlnKSB7XG4gICAgICAgIC8vIGNvbnN0IFsgZmlsZW5hbWUsIGV4dCBdID0gbXlmcy5zcGxpdF9leHQobmFtZVdpdGhFeHQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgU3ViY29uZmlnLnZhbGlkYXRlTmFtZShuYW1lV2l0aEV4dCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChlLm1lc3NhZ2UgPT09ICdFeHRlbnNpb25FcnJvcicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKGBzZXQgc2V0U3ViY29uZmlnICgke25hbWVXaXRoRXh0fSkgaGFzIG5vIGV4dGVuc2lvbiwgb3IgZXh0IGlzIGJhZC4gbm90IHNldHRpbmdgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlLm1lc3NhZ2UgPT09ICdCYXNlbmFtZUVycm9yJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VuYW1lID0gcGF0aC5iYXNlbmFtZShuYW1lV2l0aEV4dCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXRTdWJjb25maWcoJHtuYW1lV2l0aEV4dH0pLCBwYXNzZWQgYSBwYXRoICh3aXRoIHNsYWhlcykuIG5lZWQgb25seSBhIGJhc2VuYW1lLmV4dC4gY29udGludWluZyB3aXRoIG9ubHkgYmFzZW5hbWU6ICR7YmFzZW5hbWV9YCk7XG4gICAgICAgICAgICAgICAgbmFtZVdpdGhFeHQgPSBiYXNlbmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUobmFtZVdpdGhFeHQpO1xuICAgICAgICAvLy8vIEV4dGVuc2lvbiBhbmQgZmlsZSBuYW1lIG9rXG4gICAgICAgIGNvbnN0IHN1YmNmZ1R5cGUgPSBleHQuc2xpY2UoMSkgYXMgRXhwZXJpbWVudFR5cGU7XG5cblxuICAgICAgICBjb25zdCBzdWJjb25maWdLZXkgPSBgJHtzdWJjZmdUeXBlfV9maWxlYCBhcyBcImV4YW1fZmlsZVwiIHwgXCJ0ZXN0X2ZpbGVcIjtcbiAgICAgICAgLy8vLyB0aGlzLnNldCgnZXhhbV9maWxlJywgJ2Z1cl9lbGlzZV9CLmV4YW0nKVxuICAgICAgICB0aGlzLnNldChzdWJjb25maWdLZXksIG5hbWVXaXRoRXh0KTtcbiAgICAgICAgdGhpcy5jYWNoZVtzdWJjb25maWdLZXldID0gbmFtZVdpdGhFeHQ7XG4gICAgICAgIGNvbnNvbGUubG9nKGBzZXRTdWJjb25maWdgLCB7XG4gICAgICAgICAgICBuYW1lV2l0aEV4dCxcbiAgICAgICAgICAgIHN1YmNvbmZpZyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8vLyB0aGlzLmV4YW0gPSBuZXcgU3ViY29uZmlnKCdmdXJfZWxpc2VfQi5leGFtJywgc3ViY29uZmlnKVxuICAgICAgICB0aGlzW3N1YmNmZ1R5cGVdID0gbmV3IFN1YmNvbmZpZyhuYW1lV2l0aEV4dCwgc3ViY29uZmlnKVxuICAgIH1cblxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldFN1YmNvbmZpZygpOiBTdWJjb25maWcge1xuICAgICAgICByZXR1cm4gdGhpc1t0aGlzLmV4cGVyaW1lbnRfdHlwZV1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbW92ZUVtcHR5RGlycyguLi5kaXJzOiAoXCJzdWJqZWN0c1wiKVtdKSB7XG4gICAgICAgIGlmIChkaXJzLmluY2x1ZGVzKFwic3ViamVjdHNcIikpIHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRTdWJqZWN0cyA9IHRoaXMuc3ViamVjdHM7XG4gICAgICAgICAgICBmb3IgKGxldCBzdWJqZGlyIG9mIGZzLnJlYWRkaXJTeW5jKFNVQkpFQ1RTX1BBVEhfQUJTKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1YmpkaXJBYnMgPSBwYXRoLmpvaW4oU1VCSkVDVFNfUEFUSF9BQlMsIHN1YmpkaXIpO1xuICAgICAgICAgICAgICAgIGlmICghY3VycmVudFN1YmplY3RzLmluY2x1ZGVzKHN1YmpkaXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlnbm9yZUVycigoKSA9PiBteWZzLnJlbW92ZUVtcHR5RGlycyhzdWJqZGlyQWJzKSk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBzdWJkaXIgb2YgZnMucmVhZGRpclN5bmMoc3ViamRpckFicykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlnbm9yZUVycigoKSA9PiBteWZzLnJlbW92ZUVtcHR5RGlycyhwYXRoLmpvaW4oc3ViamRpckFicywgc3ViZGlyKSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBTdWJjb25maWcgZXh0ZW5kcyBDb25mPElTdWJjb25maWc+IHsgLy8gQUtBIENvbmZpZ1xuICAgIHJlYWRvbmx5IGNhY2hlOiBQYXJ0aWFsPElTdWJjb25maWc+O1xuICAgIHRydXRoOiBUcnV0aDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHR5cGU6IEV4cGVyaW1lbnRUeXBlO1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIG5hbWVXaXRoRXh0IC0gc2V0cyB0aGUgYG5hbWVgIGZpZWxkIGluIGZpbGVcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihuYW1lV2l0aEV4dDogc3RyaW5nLCBzdWJjb25maWc/OiBTdWJjb25maWcpIHtcbiAgICAgICAgbGV0IFtmaWxlbmFtZSwgZXh0XSA9IG15ZnMuc3BsaXRfZXh0KG5hbWVXaXRoRXh0KTtcbiAgICAgICAgaWYgKCFbJy5leGFtJywgJy50ZXN0J10uaW5jbHVkZXMoZXh0KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTdWJjb25maWcgY3RvciAoJHtuYW1lV2l0aEV4dH0pIGhhcyBiYWQgb3Igbm8gZXh0ZW5zaW9uYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHlwZSA9IGV4dC5zbGljZSgxKSBhcyBFeHBlcmltZW50VHlwZTtcbiAgICAgICAgbGV0IGRlZmF1bHRzO1xuICAgICAgICBpZiAoYm9vbChzdWJjb25maWcpKSB7XG4gICAgICAgICAgICBpZiAoc3ViY29uZmlnLnN0b3JlKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdHMgPSB7IC4uLnN1YmNvbmZpZy5zdG9yZSwgbmFtZTogbmFtZVdpdGhFeHQgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdHMgPSBzdWJjb25maWc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWZhdWx0cyA9IHsgbmFtZTogbmFtZVdpdGhFeHQgfTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICBmaWxlRXh0ZW5zaW9uOiB0eXBlLFxuICAgICAgICAgICAgY3dkOiBDT05GSUdTX1BBVEhfQUJTLFxuICAgICAgICAgICAgY29uZmlnTmFtZTogZmlsZW5hbWUsXG4gICAgICAgICAgICBkZWZhdWx0c1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY2FjaGUgPSB7IG5hbWU6IG5hbWVXaXRoRXh0IH07XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIGlmIChib29sKHN1YmNvbmZpZykpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KHsgLi4uc3ViY29uZmlnLnN0b3JlLCBuYW1lOiBuYW1lV2l0aEV4dCB9KTtcblxuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnRydXRoID0gbmV3IFRydXRoKG15ZnMucmVtb3ZlX2V4dCh0aGlzLnRydXRoX2ZpbGUpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgU3ViY29uZmlnIGNvbnN0cnVjdG9yLCBpbml0aWFsaXppbmcgbmV3IFRydXRoIGZyb20gdGhpcy50cnV0aF9maWxlIHRocmV3IGFuIGVycm9yLiBQcm9iYWJseSBiZWNhdXNlIHRoaXMudHJ1dGhfZmlsZSBpcyB1bmRlZmluZWQuIFNob3VsZCBtYXliZSBuZXN0IHVuZGVyIGlmKHN1YmNvbmZpZykgY2xhdXNlYCwgXCJ0aGlzLnRydXRoX2ZpbGVcIiwgdGhpcy50cnV0aF9maWxlLCBlKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0IGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJhbGxvd2VkX3RlbXBvX2RldmlhdGlvblwiKVxuICAgICAgICAvKmlmICggdGhpcy5jYWNoZS5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgY29uc3QgYWxsb3dlZFRlbXBvRGV2aWF0aW9uID0gdGhpcy5nZXQoJ2FsbG93ZWRfdGVtcG9fZGV2aWF0aW9uJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uID0gYWxsb3dlZFRlbXBvRGV2aWF0aW9uO1xuICAgICAgICAgcmV0dXJuIGFsbG93ZWRUZW1wb0RldmlhdGlvbjtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbjtcbiAgICAgICAgIH0qL1xuICAgIH1cblxuICAgIC8qKkBjYWNoZWQqL1xuICAgIHNldCBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbihkZXZpYXRpb246IG51bWJlcikge1xuICAgICAgICB0aGlzLnNldERldmlhdGlvbihcInRlbXBvXCIsIGRldmlhdGlvbik7XG4gICAgfVxuXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0IGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbigpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uXCIpO1xuICAgICAgICAvKmlmICggdGhpcy5jYWNoZS5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgIGNvbnN0IGFsbG93ZWRSaHl0aG1EZXZpYXRpb24gPSB0aGlzLmdldCgnYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbiA9IGFsbG93ZWRSaHl0aG1EZXZpYXRpb247XG4gICAgICAgICByZXR1cm4gYWxsb3dlZFJoeXRobURldmlhdGlvbjtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb247XG4gICAgICAgICB9Ki9cbiAgICB9XG5cbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uKGRldmlhdGlvbjogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuc2V0RGV2aWF0aW9uKFwicmh5dGhtXCIsIGRldmlhdGlvbik7XG4gICAgfVxuXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0IGRlbW9fdHlwZSgpOiBEZW1vVHlwZSB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJkZW1vX3R5cGVcIik7XG4gICAgICAgIC8vIHJldHVybiB0aGlzLmdldCgnZGVtb190eXBlJyk7XG4gICAgfVxuXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IGRlbW9fdHlwZSh0eXBlOiBEZW1vVHlwZSkge1xuICAgICAgICBpZiAoIVsndmlkZW8nLCAnYW5pbWF0aW9uJ10uaW5jbHVkZXModHlwZSkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQ29uZmlnIGRlbW9fdHlwZSBzZXR0ZXIsIGJhZCB0eXBlID0gJHt0eXBlfSwgY2FuIGJlIGVpdGhlciB2aWRlbyBvciBhbmltYXRpb24uIE5vdCBzZXR0aW5nYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZGVtb190eXBlJywgdHlwZSk7XG4gICAgICAgICAgICB0aGlzLmNhY2hlLmRlbW9fdHlwZSA9IHR5cGU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgZXJyb3JzX3BsYXlyYXRlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnZXJyb3JzX3BsYXlyYXRlJyk7XG4gICAgfVxuXG4gICAgc2V0IGVycm9yc19wbGF5cmF0ZShzcGVlZDogbnVtYmVyKSB7XG4gICAgICAgIGlmIChpc05hTihzcGVlZCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgY29uZmlnIHNldCBlcnJvcnNfcGxheXJhdGUsIHJlY2VpdmVkIGJhZCBcInNwZWVkXCIgTmFOOiAke3NwZWVkfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2Vycm9yc19wbGF5cmF0ZScsIHNwZWVkKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgZ2V0IGZpbmlzaGVkX3RyaWFsc19jb3VudCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2ZpbmlzaGVkX3RyaWFsc19jb3VudCcpO1xuICAgIH1cblxuICAgIHNldCBmaW5pc2hlZF90cmlhbHNfY291bnQoY291bnQ6IG51bWJlcikge1xuICAgICAgICBpZiAoaXNOYU4oY291bnQpIHx8IGNvdW50IDwgMCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBjb25maWcgc2V0IGZpbmlzaGVkX3RyaWFsc19jb3VudCwgcmVjZWl2ZWQgYmFkIFwiY291bnRcIjogJHtjb3VudH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdmaW5pc2hlZF90cmlhbHNfY291bnQnLCBjb3VudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipOYW1lIG9mIGNvbmZpZyBmaWxlLCBpbmNsdWRpbmcgZXh0ZW5zaW9uLiBBbHdheXMgcmV0dXJucyBgbmFtZWAgZnJvbSBjYWNoZS4gVGhpcyBpcyBiZWNhdXNlIHRoZXJlJ3Mgbm8gc2V0dGVyOyBgbmFtZWAgaXMgc3RvcmVkIGluIGNhY2hlIGF0IGNvbnN0cnVjdG9yLiovXG4gICAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUubmFtZTtcbiAgICB9XG5cbiAgICBnZXQgc3ViamVjdCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ3N1YmplY3QnKTtcbiAgICB9XG5cbiAgICBzZXQgc3ViamVjdChuYW1lOiBzdHJpbmcgfCBudWxsKSB7XG4gICAgICAgIGlmIChEUllSVU4pIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ3NldCBzdWJqZWN0LCBEUllSVU4uIFJldHVybmluZycpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYm9vbChuYW1lKSkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2Fybihgc2V0IHN1YmplY3QsICFib29sKG5hbWUpOiAke25hbWV9LiBSZXR1cm5pbmdgKVxuICAgICAgICB9XG4gICAgICAgIG5hbWUgPSBuYW1lLmxvd2VyKCk7XG4gICAgICAgIHRoaXMuc2V0KCdzdWJqZWN0JywgbmFtZSk7XG4gICAgICAgIGNvbnN0IEdsb2IgPSByZXF1aXJlKCcuLi9HbG9iJykuZGVmYXVsdDtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdTdWJqZWN0cyA9IEdsb2IuQmlnQ29uZmlnLnN1YmplY3RzLmZpbHRlcihib29sKTtcbiAgICAgICAgY29uc29sZS5sb2coeyBleGlzdGluZ1N1YmplY3RzIH0pO1xuXG4gICAgICAgIEdsb2IuQmlnQ29uZmlnLnN1YmplY3RzID0gWy4uLm5ldyBTZXQoWy4uLmV4aXN0aW5nU3ViamVjdHMsIG5hbWVdKV07XG4gICAgfVxuXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIFRydXRoIGZpbGUgbmFtZSwgbm8gZXh0ZW5zaW9uKi9cbiAgICBnZXQgdHJ1dGhfZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsICd0cnV0aF9maWxlJyk7XG4gICAgICAgIC8vIHJldHVybiB0aGlzLmdldCgndHJ1dGhfZmlsZScpXG4gICAgfVxuXG4gICAgLyoqQWxzbyBzZXRzIHRoaXMudHJ1dGggKG1lbW9yeSlcbiAgICAgKiBAY2FjaGVkXG4gICAgICogQHBhcmFtIHRydXRoX2ZpbGUgLSBUcnV0aCBmaWxlIG5hbWUsIG5vIGV4dGVuc2lvbiovXG4gICAgc2V0IHRydXRoX2ZpbGUodHJ1dGhfZmlsZTogc3RyaW5nKSB7XG4gICAgICAgIC8vIHRydXRoX2ZpbGUgPSBwYXRoLmJhc2VuYW1lKHRydXRoX2ZpbGUpO1xuICAgICAgICBsZXQgW25hbWUsIGV4dF0gPSBteWZzLnNwbGl0X2V4dCh0cnV0aF9maWxlKTtcbiAgICAgICAgaWYgKGJvb2woZXh0KSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgdHJ1dGhfZmlsZSwgcGFzc2VkIG5hbWUgaXMgbm90IGV4dGVuc2lvbmxlc3M6ICR7dHJ1dGhfZmlsZX0uIENvbnRpbnVpbmcgd2l0aCBcIiR7bmFtZX1cImApO1xuICAgICAgICAgICAgLy8gbmFtZU5vRXh0ID0gbXlmcy5yZW1vdmVfZXh0KG5hbWVOb0V4dCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7IGRlZmF1bHQ6IE15QWxlcnQgfSA9IHJlcXVpcmUoJy4uL015QWxlcnQnKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCB0cnV0aCA9IG5ldyBUcnV0aChuYW1lKTtcbiAgICAgICAgICAgIGlmICghdHJ1dGgudHh0LmFsbEV4aXN0KCkpIHtcbiAgICAgICAgICAgICAgICBNeUFsZXJ0LnNtYWxsLndhcm5pbmcoYE5vdCBhbGwgdHh0IGZpbGVzIGV4aXN0OiAke25hbWV9YClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudHJ1dGggPSB0cnV0aDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgTXlBbGVydC5zbWFsbC53YXJuaW5nKGUpO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGUpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoYHRydXRoX2ZpbGVgLCBuYW1lKTtcbiAgICAgICAgdGhpcy5jYWNoZS50cnV0aF9maWxlID0gbmFtZTtcblxuXG4gICAgfVxuXG4gICAgZ2V0IGxldmVscygpOiBJTGV2ZWxbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnbGV2ZWxzJyk7XG4gICAgfVxuXG4gICAgc2V0IGxldmVscyhsZXZlbHM6IElMZXZlbFtdKSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShsZXZlbHMpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCBsZXZlbHMsIHJlY2VpdmVkIFwibGV2ZWxzXCIgbm90IGlzQXJyYXkuIG5vdCBzZXR0aW5nIGFueXRoaW5nLiBsZXZlbHM6IGAsIGxldmVscyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBiZXR0ZXIgY2hlY2tzXG4gICAgICAgICAgICB0aGlzLnNldCgnbGV2ZWxzJywgbGV2ZWxzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyB2YWxpZGF0ZU5hbWUobmFtZVdpdGhFeHQ6IHN0cmluZykge1xuICAgICAgICBsZXQgW2ZpbGVuYW1lLCBleHRdID0gbXlmcy5zcGxpdF9leHQobmFtZVdpdGhFeHQpO1xuICAgICAgICBpZiAoIVsnLmV4YW0nLCAnLnRlc3QnXS5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4dGVuc2lvbkVycm9yYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hbWVXaXRoRXh0ICE9PSBgJHtmaWxlbmFtZX0ke2V4dH1gKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jhc2VuYW1lRXJyb3InKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGRvVHh0RmlsZXNDaGVjaygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgY29uc29sZS5sb2coYPCfkr4gU3ViY29uZmlnKCR7dGhpcy50eXBlfSkuZG9UcnV0aEZpbGVDaGVjaygpYCk7XG4gICAgICAgIGNvbnN0IHsgZGVmYXVsdDogTXlBbGVydCB9ID0gcmVxdWlyZSgnLi4vTXlBbGVydCcpO1xuICAgICAgICBpZiAodGhpcy50cnV0aC50eHQuYWxsRXhpc3QoKSkge1xuICAgICAgICAgICAgTXlBbGVydC5zbWFsbC5zdWNjZXNzKGAke3RoaXMudHJ1dGgubmFtZX0udHh0LCAqX29uLnR4dCwgYW5kICpfb2ZmLnR4dCBmaWxlcyBleGlzdC5gKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgLy8gWydmdXJfZWxpc2VfQicgeCAzLCAnZnVyX2VsaXNlX1IudHh0JyB4IDMsIC4uLl1cbiAgICAgICAgY29uc3QgdHJ1dGhzV2l0aDNUeHRGaWxlcyA9IGdldFRydXRoc1dpdGgzVHh0RmlsZXMoKTtcbiAgICAgICAgaWYgKCFib29sKHRydXRoc1dpdGgzVHh0RmlsZXMpKSB7XG4gICAgICAgICAgICBNeUFsZXJ0LmJpZy53YXJuaW5nKHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ05vIHZhbGlkIHRydXRoIGZpbGVzIGZvdW5kJyxcbiAgICAgICAgICAgICAgICBodG1sOiAnVGhlcmUgbmVlZHMgdG8gYmUgYXQgbGVhc3Qgb25lIHR4dCBmaWxlIHdpdGggb25lIFwib25cIiBhbmQgb25lIFwib2ZmXCIgY291bnRlcnBhcnRzLidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cblxuICAgICAgICBNeUFsZXJ0LmJpZy5ibG9ja2luZyh7XG4gICAgICAgICAgICB0aXRsZTogYERpZG4ndCBmaW5kIGFsbCB0aHJlZSAudHh0IGZpbGVzIGZvciAke3RoaXMudHJ1dGgubmFtZX1gLFxuICAgICAgICAgICAgaHRtbDogJ1RoZSBmb2xsb3dpbmcgdHJ1dGhzIGFsbCBoYXZlIDMgdHh0IGZpbGVzLiBQbGVhc2UgY2hvb3NlIG9uZSBvZiB0aGVtLCBvciBmaXggdGhlIGZpbGVzIGFuZCByZWxvYWQuJyxcbiAgICAgICAgICAgIHNob3dDbG9zZUJ1dHRvbjogdHJ1ZSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgc3RyaW5nczogdHJ1dGhzV2l0aDNUeHRGaWxlcyxcbiAgICAgICAgICAgIGNsaWNrRm46IGVsID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zdCBjb25maWcgPSB0aGlzLmNvbmZpZyh0aGlzLmV4cGVyaW1lbnRfdHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sZXZlbHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cnV0aF9maWxlID0gZWwudGV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLnRydXRoX2ZpbGVfcGF0aCA9IG5ldyBUcnV0aChlbC50ZXh0KCkpO1xuICAgICAgICAgICAgICAgICAgICByZWxvYWRQYWdlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIE15QWxlcnQuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgTXlBbGVydC5iaWcuZXJyb3IoeyB0aXRsZTogZXJyLm1lc3NhZ2UsIGh0bWw6ICdTb21ldGhpbmcgaGFwcGVuZWQuJyB9KTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG5cbiAgICB9XG5cbiAgICBpbmNyZWFzZShLOiBrZXlvZiBJU3ViY29uZmlnKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgdXNlZCBzdWJjb25maWcuaW5jcmVhc2UsIFVOVEVTVEVEYCk7XG4gICAgICAgIGlmIChEUllSVU4pIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ2luY3JlYXNlLCBEUllSVU4uIHJldHVybmluZycpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBWID0gdGhpcy5nZXQoSyk7XG5cbiAgICAgICAgaWYgKFYgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHRoaXMuc2V0KEssIDEpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVvZlYgPSB0eXBlb2YgVjtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGlmICh0eXBlb2ZWID09PSAnbnVtYmVyJyB8fCAodHlwZW9mViA9PT0gJ3N0cmluZycgJiYgVi5pc2RpZ2l0KCkpKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KEssIE1hdGguZmxvb3IoVikgKyAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiQmlnQ29uZmlnQ2xzIHRyaWVkIHRvIGluY3JlYXNlIGEgdmFsdWUgdGhhdCBpcyBub3QgYSBudW1iZXIgbm9yIGEgc3RyaW5nLmlzZGlnaXQoKVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgdG9IdG1sKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCBsZXZlbHMgPSB0aGlzLmxldmVscztcbiAgICAgICAgbGV0IGxldmVsc0h0bWwgPSBgXG4gICAgICAgIDx0YWJsZSBjbGFzcz1cInN1YmNvbmZpZy1odG1sXCI+XG4gICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgPHRoPkxldmVsICM8L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5Ob3RlczwvdGg+XG4gICAgICAgICAgICAgICAgPHRoPlRyaWFsczwvdGg+XG4gICAgICAgICAgICAgICAgPHRoPlJoeXRobTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoPlRlbXBvPC90aD5cbiAgICAgICAgICAgIDwvdHI+XG4gICAgICAgIGA7XG4gICAgICAgIGZvciAobGV0IFtpLCBsdmxdIG9mIGVudW1lcmF0ZShsZXZlbHMpKSB7XG4gICAgICAgICAgICBsZXZlbHNIdG1sICs9IGBcbiAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICA8dGQ+JHtpICsgMX08L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD4ke2x2bC5ub3Rlc308L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD4ke2x2bC50cmlhbHN9PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQ+JHtsdmwucmh5dGhtfTwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkPiR7bHZsLnRlbXBvfTwvdGQ+XG4gICAgICAgICAgICA8L3RyPmBcbiAgICAgICAgfVxuICAgICAgICBsZXZlbHNIdG1sICs9IGA8L3RhYmxlPmA7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJzdWJjb25maWctaHRtbFwiPlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRoPktleTwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5WYWx1ZTwvdGg+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD5BbGxvd2VkIHJoeXRobSBkZXZpYXRpb248L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHt0aGlzLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbn08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+QWxsb3dlZCB0ZW1wbyBkZXZpYXRpb248L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHt0aGlzLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9ufTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD5EZW1vIHR5cGU8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHt0aGlzLmRlbW9fdHlwZX08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+RXJyb3JzIHBsYXkgcmF0ZTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3RoaXMuZXJyb3JzX3BsYXlyYXRlfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD5GaW5pc2hlZCB0cmlhbHMgY291bnQ8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHt0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudH08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+TmFtZTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3RoaXMubmFtZX08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+U3ViamVjdDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3RoaXMuc3ViamVjdH08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+VHJ1dGggZmlsZTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3RoaXMudHJ1dGhfZmlsZX08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICA8L3RhYmxlPlxuXG4gICAgICAgICAgICAke2xldmVsc0h0bWx9XG4gICAgICAgICAgICBgO1xuICAgIH1cblxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBmcm9tU3ViY29uZmlnKHN1YmNvbmZpZzogU3ViY29uZmlnKSB7XG4gICAgICAgIGlmIChEUllSVU4pIHJldHVybiBjb25zb2xlLndhcm4oJ2Zyb21PYmosIERSWVJVTi4gcmV0dXJuaW5nJyk7XG4gICAgICAgIC8vIHRoaXMuc2V0KHN1YmNvbmZpZy50b09iaigpKTtcbiAgICAgICAgLy8gdGhpcy5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gPSBzdWJjb25maWcuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uO1xuICAgICAgICAvLyB0aGlzLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uID0gc3ViY29uZmlnLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uO1xuICAgICAgICAvLyB0aGlzLmRlbW9fdHlwZSA9IHN1YmNvbmZpZy5kZW1vX3R5cGU7XG4gICAgICAgIC8vIHRoaXMuZXJyb3JzX3BsYXlyYXRlID0gc3ViY29uZmlnLmVycm9yc19wbGF5cmF0ZTtcbiAgICAgICAgLy8gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQgPSBzdWJjb25maWcuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgICAgICAvLyB0aGlzLmxldmVscyA9IHN1YmNvbmZpZy5sZXZlbHM7XG4gICAgICAgIC8vIHRoaXMuc3ViamVjdCA9IHN1YmNvbmZpZy5zdWJqZWN0O1xuICAgICAgICAvLyB0aGlzLnRydXRoX2ZpbGUgPSBzdWJjb25maWcudHJ1dGhfZmlsZTtcbiAgICAgICAgLy8gdGhpcy5fdXBkYXRlU2F2ZWRGaWxlKCd0cnV0aF9maWxlX3BhdGgnLCBjZmdGaWxlLnRydXRoX2ZpbGVfcGF0aCk7XG4gICAgfVxuXG4gICAgY3VycmVudFRyaWFsQ29vcmRzKCk6IFtudW1iZXIsIG51bWJlcl0ge1xuICAgICAgICBsZXQgZmxhdFRyaWFsc0xpc3QgPSB0aGlzLmxldmVscy5tYXAobGV2ZWwgPT4gbGV2ZWwudHJpYWxzKTtcbiAgICAgICAgZm9yIChsZXQgW2xldmVsSW5kZXgsIHRyaWFsc051bV0gb2YgZW51bWVyYXRlKGZsYXRUcmlhbHNMaXN0KSkge1xuXG4gICAgICAgICAgICBsZXQgdHJpYWxTdW1Tb0ZhciA9IHN1bShmbGF0VHJpYWxzTGlzdC5zbGljZSgwLCBsZXZlbEluZGV4ICsgMSkpO1xuICAgICAgICAgICAgY29uc3QgZmluaXNoZWRUcmlhbHNDb3VudCA9IHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgICAgICAgICAgaWYgKHRyaWFsU3VtU29GYXIgPiBmaW5pc2hlZFRyaWFsc0NvdW50KVxuICAgICAgICAgICAgICAgIHJldHVybiBbbGV2ZWxJbmRleCwgdHJpYWxzTnVtIC0gKHRyaWFsU3VtU29GYXIgLSBmaW5pc2hlZFRyaWFsc0NvdW50KV07XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS53YXJuKFwiY3VycmVudFRyaWFsQ29vcmRzOiBvdXQgb2YgaW5kZXggZXJyb3JcIik7XG4gICAgfVxuXG4gICAgaXNEZW1vVmlkZW8oKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbW9fdHlwZSA9PT0gJ3ZpZGVvJztcbiAgICB9XG5cbiAgICBpc1dob2xlVGVzdE92ZXIoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBzdW0odGhpcy5sZXZlbHMubWFwKGxldmVsID0+IGxldmVsLnRyaWFscykpID09IHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgIH1cblxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBnZXRTdWJqZWN0RGlyTmFtZXMoKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gZnMucmVhZGRpclN5bmMoU1VCSkVDVFNfUEFUSF9BQlMpO1xuICAgIH1cblxuICAgIGdldEN1cnJlbnRMZXZlbCgpOiBMZXZlbCB7XG5cbiAgICAgICAgbGV0IFtsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXhdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBMZXZlbCh0aGlzLmxldmVsc1tsZXZlbF9pbmRleF0sIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCk7XG4gICAgfVxuXG4gICAgZ2V0TGV2ZWxDb2xsZWN0aW9uKCk6IExldmVsQ29sbGVjdGlvbiB7XG4gICAgICAgIGxldCBbbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4XSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIHJldHVybiBuZXcgTGV2ZWxDb2xsZWN0aW9uKHRoaXMubGV2ZWxzLCBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXgpO1xuICAgIH1cblxuICAgIC8qKkBkZXByZWNhdGVkXG4gICAgICogR2V0cyB0aGUgY3VycmVudCB0cmlhbCdzIHBhdGggKGpvaW4gdGhpcy50ZXN0T3V0UGF0aCgpIGFuZCBsZXZlbF8ke2xldmVsX2luZGV4fS4uLiksIGFuZCByZXR1cm5zIGEgVHJ1dGggb2YgaXQqL1xuICAgIGNyZWF0ZVRydXRoRnJvbVRyaWFsUmVzdWx0KCk6IFRydXRoIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBUaGlzIHNob3VsZCBiZSBzb21ld2hlcmUgZWxzZWApO1xuICAgICAgICBsZXQgW2xldmVsX2luZGV4LCB0cmlhbF9pbmRleF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICAvLyByZXR1cm4gbmV3IFRydXRoKHBhdGguam9pbih0aGlzLnRlc3RPdXRQYXRoKCksIGBsZXZlbF8ke2xldmVsX2luZGV4fV90cmlhbF8ke3RyaWFsX2luZGV4fWApKTtcbiAgICAgICAgcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odGhpcy5leHBlcmltZW50T3V0RGlyQWJzKCksIGBsZXZlbF8ke2xldmVsX2luZGV4fV90cmlhbF8ke3RyaWFsX2luZGV4fWApKTtcbiAgICB9XG5cbiAgICAvKipcImM6XFxTeW5jXFxDb2RlXFxQeXRob25cXFB5YW5vLXJlbGVhc2VcXHNyY1xcZXhwZXJpbWVudHNcXHN1YmplY3RzXFxnaWxhZFxcZnVyX2VsaXNlXCIqL1xuICAgIGV4cGVyaW1lbnRPdXREaXJBYnMoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY3VyclN1YmplY3REaXIgPSBwYXRoLmpvaW4oU1VCSkVDVFNfUEFUSF9BQlMsIHRoaXMuc3ViamVjdCk7IC8vIFwiLi4uL3N1YmplY3RzL2dpbGFkXCJcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbihjdXJyU3ViamVjdERpciwgdGhpcy50cnV0aC5uYW1lKTsgLy8gXCIuLi4vZ2lsYWQvZnVyX2VsaXNlX0JcIlxuICAgIH1cblxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBwcml2YXRlIF91cGRhdGVTYXZlZEZpbGUoa2V5OiBrZXlvZiBJU3ViY29uZmlnLCB2YWx1ZSkge1xuICAgICAgICBpZiAoRFJZUlVOKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdfdXBkYXRlU2F2ZWRGaWxlLCBEUllSVU4uIHJldHVybmluZycpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignX3VwZGF0ZVNhdmVkRmlsZSgpIGRvZXMgbm90aGluZywgcmV0dXJuaW5nJyk7XG4gICAgICAgIHRoaXMuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICAvKmNvbnN0IGNvbmYgPSBuZXcgKHJlcXVpcmUoJ2NvbmYnKSkoe1xuICAgICAgICAgY3dkIDogQ09ORklHU19QQVRIX0FCUyxcbiAgICAgICAgIGNvbmZpZ05hbWUgOiB0aGlzLm5hbWUsXG4gICAgICAgICBmaWxlRXh0ZW5zaW9uIDogdGhpcy50eXBlLFxuICAgICAgICAgc2VyaWFsaXplIDogdmFsdWUgPT4gSlNPTi5zdHJpbmdpZnkodmFsdWUsIG51bGwsIDQpXG4gICAgICAgICB9KTtcbiAgICAgICAgIGNvbmYuc2V0KGtleSwgdmFsdWUpOyovXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXREZXZpYXRpb24oZGV2aWF0aW9uVHlwZTogRGV2aWF0aW9uVHlwZSwgZGV2aWF0aW9uOiBudW1iZXIpIHtcblxuXG4gICAgICAgIC8vIGlmICggdHlwZW9mRGV2aWF0aW9uID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgaWYgKGlzU3RyaW5nKGRldmlhdGlvbikpIHtcbiAgICAgICAgICAgIGlmIChpc05hTihwYXJzZUZsb2F0KGRldmlhdGlvbikpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXREZXZpYXRpb24gZ290IHN0cmluZyBkZXZpYXRpb24sIGNvdWxkbnQgcGFyc2VGbG9hdC4gZGV2aWF0aW9uOiBcIiR7ZGV2aWF0aW9ufVwiLiByZXR1cm5pbmdgKTtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRldmlhdGlvbiA9IHBhcnNlRmxvYXQoZGV2aWF0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpcy5zZXQoYGFsbG93ZWRfJHtkZXZpYXRpb25UeXBlfV9kZXZpYXRpb25gLCBkZXZpYXRpb24pO1xuICAgICAgICB0aGlzLmNhY2hlW2BhbGxvd2VkXyR7ZGV2aWF0aW9uVHlwZX1fZGV2aWF0aW9uYF0gPSBkZXZpYXRpb247XG4gICAgfVxuXG5cbn1cbiJdfQ==