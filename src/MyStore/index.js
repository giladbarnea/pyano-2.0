"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Store = require("electron-store");
const path = require("path");
const fs = require("fs");
const MyAlert_1 = require("../MyAlert");
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
                await MyAlert_1.default.big.error({
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
        try {
            let truth = new Truth_1.Truth(name);
            if (!truth.txt.allExist()) {
                MyAlert_1.default.small.warning(`Not all txt files exist: ${name}`);
            }
            this.truth = truth;
        }
        catch (e) {
            MyAlert_1.default.small.warning(e);
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
        if (this.truth.txt.allExist()) {
            return MyAlert_1.default.small.success(`${this.truth.name}.txt, *_on.txt, and *_off.txt files exist.`);
        }
        const truthsWith3TxtFiles = getTruthsWith3TxtFiles();
        if (!util_1.bool(truthsWith3TxtFiles))
            return MyAlert_1.default.big.warning({
                title: 'No valid truth files found',
                html: 'There needs to be at least one txt file with one "on" and one "off" counterparts.'
            });
        return MyAlert_1.default.big.blocking({
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
                    MyAlert_1.default.close();
                    MyAlert_1.default.big.error({ title: err.message, html: 'Something happened.' });
                }
            }
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUFpQztBQUNqQyxrQ0FBMkI7QUFDM0Isa0NBQXVHO0FBQ3ZHLG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsNkJBQTZCO0FBRTdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQXVEdEMsU0FBUyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUk7SUFDakMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRTtRQUNsQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzdCLE9BQU8sT0FBTyxDQUFDO0tBQ2xCO1NBQU07UUFDSCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDN0I7QUFDTCxDQUFDO0FBR0QsU0FBZ0Isa0JBQWtCLENBQUMsRUFBRSxTQUFTLEtBQTRDLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRTtJQUM5RyxJQUFJLFNBQVMsRUFBRTtRQUNYLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUUzQixTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsQztRQUNELElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzVDLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLFNBQVMsNEVBQTRFLENBQUMsQ0FBQztZQUN2SCxTQUFTLEdBQUcsU0FBUyxDQUFDO1NBQ3pC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RSxLQUFLLENBQUMsQ0FBQztJQVF6QixDQUFDO0lBRU8sWUFBWSxDQUFDLGFBQTRCLEVBQUUsU0FBaUI7UUFJaEUsSUFBSSxlQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDckIsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0VBQXNFLFNBQVMsY0FBYyxDQUFDLENBQUM7Z0JBQzVHLE9BQU07YUFDVDtZQUNELFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDckM7UUFHRCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsYUFBYSxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLGFBQWEsWUFBWSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBQ2pFLENBQUM7Q0FHSjtBQWxiRCw4QkFrYkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBTdG9yZSBmcm9tIFwiZWxlY3Ryb24tc3RvcmVcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IE15QWxlcnQgZnJvbSBcIi4uL015QWxlcnRcIjtcbmltcG9ydCBteWZzIGZyb20gXCIuLi9NeUZzXCI7XG5pbXBvcnQgeyBib29sLCByZWxvYWRQYWdlLCBzdW0sIGVudW1lcmF0ZSwgYWxsLCBnZXRDdXJyZW50V2luZG93LCBpZ25vcmVFcnIsIGlzU3RyaW5nIH0gZnJvbSBcIi4uL3V0aWxcIjtcbmltcG9ydCB7IFRydXRoIH0gZnJvbSBcIi4uL1RydXRoXCI7XG5pbXBvcnQgeyBJTGV2ZWwsIExldmVsLCBMZXZlbENvbGxlY3Rpb24gfSBmcm9tIFwiLi4vTGV2ZWxcIjtcbmltcG9ydCB7IFN3ZWV0QWxlcnRSZXN1bHQgfSBmcm9tIFwic3dlZXRhbGVydDJcIjtcbmltcG9ydCAqIGFzIENvbmYgZnJvbSAnY29uZic7XG5cbmNvbnNvbGUubG9nKCdzcmMvQmlnQ29uZmlnL2luZGV4LnRzJyk7XG5cblxuZXhwb3J0IHR5cGUgRXhwZXJpbWVudFR5cGUgPSAnZXhhbScgfCAndGVzdCc7XG5leHBvcnQgdHlwZSBEZW1vVHlwZSA9ICd2aWRlbycgfCAnYW5pbWF0aW9uJztcbmV4cG9ydCB0eXBlIFBhZ2VOYW1lID0gXCJuZXdcIiAvLyBBS0EgVExhc3RQYWdlXG4gICAgfCBcInJ1bm5pbmdcIlxuICAgIHwgXCJyZWNvcmRcIlxuICAgIHwgXCJmaWxlX3Rvb2xzXCJcbiAgICB8IFwic2V0dGluZ3NcIlxudHlwZSBEZXZpYXRpb25UeXBlID0gJ3JoeXRobScgfCAndGVtcG8nO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSVN1YmNvbmZpZyB7XG4gICAgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uOiBudW1iZXIsXG4gICAgYWxsb3dlZF90ZW1wb19kZXZpYXRpb246IG51bWJlcixcbiAgICBkZW1vX3R5cGU6IERlbW9UeXBlLFxuICAgIGVycm9yc19wbGF5cmF0ZTogbnVtYmVyLFxuICAgIGZpbmlzaGVkX3RyaWFsc19jb3VudDogbnVtYmVyLFxuICAgIGxldmVsczogSUxldmVsW10sXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHN1YmplY3Q6IHN0cmluZyxcbiAgICB0cnV0aF9maWxlOiBzdHJpbmcsXG59XG5cblxuaW50ZXJmYWNlIERldk9wdGlvbnMge1xuICAgIGZvcmNlX25vdGVzX251bWJlcjogbnVsbCB8IG51bWJlcixcbiAgICBmb3JjZV9wbGF5YmFja19yYXRlOiBudWxsIHwgbnVtYmVyLFxuICAgIG11dGVfYW5pbWF0aW9uOiBib29sZWFuLFxuICAgIG5vX3JlbG9hZF9vbl9zdWJtaXQ6IGJvb2xlYW4sXG4gICAgc2ltdWxhdGVfdGVzdF9tb2RlOiBib29sZWFuLFxuICAgIHNpbXVsYXRlX3ZpZGVvX21vZGU6IGJvb2xlYW4sXG4gICAgc2ltdWxhdGVfYW5pbWF0aW9uX21vZGU6IGJvb2xlYW4sXG4gICAgc2tpcF9leHBlcmltZW50X2ludHJvOiBib29sZWFuLFxuICAgIHNraXBfZmFkZTogYm9vbGVhbixcbiAgICBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjazogYm9vbGVhbixcbiAgICBza2lwX2xldmVsX2ludHJvOiBib29sZWFuLFxuICAgIHNraXBfbWlkaV9leGlzdHNfY2hlY2s6IGJvb2xlYW4sXG4gICAgc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2s6IGJvb2xlYW4sXG59XG5cbmludGVyZmFjZSBJQmlnQ29uZmlnIHtcbiAgICBkZXY6IGJvb2xlYW4sXG4gICAgZGV2b3B0aW9uczogRGV2T3B0aW9ucyxcbiAgICBleGFtX2ZpbGU6IHN0cmluZyxcbiAgICBleHBlcmltZW50X3R5cGU6IEV4cGVyaW1lbnRUeXBlLFxuICAgIGxhc3RfcGFnZTogUGFnZU5hbWUsXG4gICAgc3ViamVjdHM6IHN0cmluZ1tdLFxuICAgIHRlc3RfZmlsZTogc3RyaW5nLFxuICAgIHZlbG9jaXRpZXM6IG51bWJlcixcbn1cblxuZnVuY3Rpb24gdHJ5R2V0RnJvbUNhY2hlPFQgZXh0ZW5kcyBrZXlvZiBJQmlnQ29uZmlnPihjb25maWc6IEJpZ0NvbmZpZ0NscywgcHJvcDogVCk6IElCaWdDb25maWdbVF1cbmZ1bmN0aW9uIHRyeUdldEZyb21DYWNoZTxUIGV4dGVuZHMga2V5b2YgSVN1YmNvbmZpZz4oY29uZmlnOiBTdWJjb25maWcsIHByb3A6IFQpOiBJU3ViY29uZmlnW1RdXG5mdW5jdGlvbiB0cnlHZXRGcm9tQ2FjaGUoY29uZmlnLCBwcm9wKSB7XG4gICAgaWYgKGNvbmZpZy5jYWNoZVtwcm9wXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IHByb3BWYWwgPSBjb25maWcuZ2V0KHByb3ApO1xuICAgICAgICBjb25maWcuY2FjaGVbcHJvcF0gPSBwcm9wVmFsO1xuICAgICAgICByZXR1cm4gcHJvcFZhbDtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY29uZmlnLmNhY2hlW3Byb3BdO1xuICAgIH1cbn1cblxuLyoqTGlzdCBvZiB0cnV0aCBmaWxlIG5hbWVzLCBubyBleHRlbnNpb24qL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRydXRoRmlsZXNXaGVyZSh7IGV4dGVuc2lvbiB9OiB7IGV4dGVuc2lvbj86ICd0eHQnIHwgJ21pZCcgfCAnbXA0JyB9ID0geyBleHRlbnNpb246IHVuZGVmaW5lZCB9KTogc3RyaW5nW10ge1xuICAgIGlmIChleHRlbnNpb24pIHtcbiAgICAgICAgaWYgKGV4dGVuc2lvbi5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGV4dGVuc2lvbiA9IGV4dGVuc2lvbi5zbGljZSgxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIVsndHh0JywgJ21pZCcsICdtcDQnXS5pbmNsdWRlcyhleHRlbnNpb24pKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHRydXRoRmlsZXNMaXN0KFwiJHtleHRlbnNpb259XCIpLCBtdXN0IGJlIGVpdGhlciBbJ3R4dCcsJ21pZCcsJ21wNCddIG9yIG5vdCBhdCBhbGwuIHNldHRpbmcgdG8gdW5kZWZpbmVkYCk7XG4gICAgICAgICAgICBleHRlbnNpb24gPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjb25zdCB0cnV0aHNEaXJQYXRoID0gdGhpcy50cnV0aHNEaXJQYXRoKCk7XG5cbiAgICBsZXQgdHJ1dGhGaWxlcyA9IFsuLi5uZXcgU2V0KGZzLnJlYWRkaXJTeW5jKFRSVVRIU19QQVRIX0FCUykpXTtcbiAgICBsZXQgZm9ybWF0dGVkVHJ1dGhGaWxlcyA9IFtdO1xuICAgIGZvciAobGV0IGZpbGUgb2YgdHJ1dGhGaWxlcykge1xuICAgICAgICBsZXQgW25hbWUsIGV4dF0gPSBteWZzLnNwbGl0X2V4dChmaWxlKTtcbiAgICAgICAgaWYgKGV4dGVuc2lvbikge1xuICAgICAgICAgICAgaWYgKGV4dC5sb3dlcigpID09PSBgLiR7ZXh0ZW5zaW9ufWApIHtcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRUcnV0aEZpbGVzLnB1c2gobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3JtYXR0ZWRUcnV0aEZpbGVzLnB1c2gobmFtZSk7XG5cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZm9ybWF0dGVkVHJ1dGhGaWxlc1xuXG59XG5cbi8qKkxpc3Qgb2YgbmFtZXMgb2YgdHh0IHRydXRoIGZpbGVzIHRoYXQgaGF2ZSB0aGVpciB3aG9sZSBcInRyaXBsZXRcIiBpbiB0YWN0LiBubyBleHRlbnNpb24qL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRydXRoc1dpdGgzVHh0RmlsZXMoKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IHR4dEZpbGVzTGlzdCA9IGdldFRydXRoRmlsZXNXaGVyZSh7IGV4dGVuc2lvbjogJ3R4dCcgfSk7XG4gICAgY29uc3Qgd2hvbGVUeHRGaWxlcyA9IFtdO1xuICAgIGZvciAobGV0IG5hbWUgb2YgdHh0RmlsZXNMaXN0KSB7XG4gICAgICAgIGlmICh0eHRGaWxlc0xpc3QuY291bnQodHh0ID0+IHR4dC5zdGFydHNXaXRoKG5hbWUpKSA+PSAzKSB7XG4gICAgICAgICAgICB3aG9sZVR4dEZpbGVzLnB1c2gobmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHR4dEZpbGVzTGlzdC5maWx0ZXIoYSA9PiB0eHRGaWxlc0xpc3QuZmlsdGVyKHR4dCA9PiB0eHQuc3RhcnRzV2l0aChhKSkubGVuZ3RoID49IDMpO1xufVxuXG5leHBvcnQgY2xhc3MgQmlnQ29uZmlnQ2xzIGV4dGVuZHMgU3RvcmU8SUJpZ0NvbmZpZz4ge1xuICAgIHRlc3Q6IFN1YmNvbmZpZztcbiAgICBleGFtOiBTdWJjb25maWc7XG4gICAgcmVhZG9ubHkgY2FjaGU6IFBhcnRpYWw8SUJpZ0NvbmZpZz47XG5cbiAgICBjb25zdHJ1Y3Rvcihkb0ZzQ2hlY2t1cCA9IHRydWUpIHtcblxuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICBjbGVhckludmFsaWRDb25maWc6IGZhbHNlLFxuICAgICAgICAgICAgZGVmYXVsdHM6IHtcbiAgICAgICAgICAgICAgICBcImRldlwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcImRldm9wdGlvbnNcIjoge1xuICAgICAgICAgICAgICAgICAgICBmb3JjZV9ub3Rlc19udW1iZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGZvcmNlX3BsYXliYWNrX3JhdGU6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG11dGVfYW5pbWF0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbm9fcmVsb2FkX29uX3N1Ym1pdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHNpbXVsYXRlX3Rlc3RfbW9kZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHNpbXVsYXRlX3ZpZGVvX21vZGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBzaW11bGF0ZV9hbmltYXRpb25fbW9kZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHNraXBfZXhwZXJpbWVudF9pbnRybzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHNraXBfZmFkZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgc2tpcF9sZXZlbF9pbnRybzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHNraXBfbWlkaV9leGlzdHNfY2hlY2s6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjazogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcImV4YW1fZmlsZVwiOiBcImZ1cl9lbGlzZV9CLmV4YW1cIixcbiAgICAgICAgICAgICAgICBcImV4cGVyaW1lbnRfdHlwZVwiOiBcInRlc3RcIixcbiAgICAgICAgICAgICAgICBcImxhc3RfcGFnZVwiOiBcIm5ld1wiLFxuICAgICAgICAgICAgICAgIFwidGVzdF9maWxlXCI6IFwiZnVyX2VsaXNlX0IudGVzdFwiLFxuXG4gICAgICAgICAgICAgICAgXCJzdWJqZWN0c1wiOiBbXSxcbiAgICAgICAgICAgICAgICBcInZlbG9jaXRpZXNcIjogMlxuXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKGB0aGlzLnBhdGg6ICR7dGhpcy5wYXRofWApO1xuICAgICAgICB0aGlzLmNhY2hlID0ge307XG4gICAgICAgIGlmIChEUllSVU4pIHtcbiAgICAgICAgICAgIHRoaXMuc2V0ID0gKC4uLmFyZ3MpID0+IGNvbnNvbGUud2FybihgRFJZUlVOLCBzZXQ6IGAsIGFyZ3MpXG4gICAgICAgIH1cbiAgICAgICAgbGV0IHRlc3ROYW1lV2l0aEV4dCA9IHRoaXMudGVzdF9maWxlO1xuICAgICAgICBsZXQgZXhhbU5hbWVXaXRoRXh0ID0gdGhpcy5leGFtX2ZpbGU7XG4gICAgICAgIGlmICghYWxsKHRlc3ROYW1lV2l0aEV4dCwgZXhhbU5hbWVXaXRoRXh0KSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBCaWdDb25maWdDbHMgY3RvciwgY291bGRudCBnZXQgdGVzdF9maWxlIGFuZC9vciBleGFtX2ZpbGUgZnJvbSBqc29uOmAsIHtcbiAgICAgICAgICAgICAgICB0ZXN0TmFtZVdpdGhFeHQsXG4gICAgICAgICAgICAgICAgZXhhbU5hbWVXaXRoRXh0XG4gICAgICAgICAgICB9LCAnLCBkZWZhdWx0aW5nIHRvIFwiZnVyX2VsaXNlX0IuW2V4dF1cIicpO1xuICAgICAgICAgICAgdGVzdE5hbWVXaXRoRXh0ID0gJ2Z1cl9lbGlzZV9CLnRlc3QnO1xuICAgICAgICAgICAgZXhhbU5hbWVXaXRoRXh0ID0gJ2Z1cl9lbGlzZV9CLmV4YW0nO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3ViY29uZmlnKHRlc3ROYW1lV2l0aEV4dCk7XG4gICAgICAgIHRoaXMuc2V0U3ViY29uZmlnKGV4YW1OYW1lV2l0aEV4dCk7XG4gICAgICAgIC8vIHRoaXMudGVzdCA9IG5ldyBTdWJjb25maWcodGVzdE5hbWVXaXRoRXh0KTtcbiAgICAgICAgLy8gdGhpcy5leGFtID0gbmV3IFN1YmNvbmZpZyhleGFtTmFtZVdpdGhFeHQpO1xuICAgICAgICB0aGlzLnN1YmplY3RzID0gdGhpcy5zdWJqZWN0czsgLy8gdG8gZW5zdXJlIGhhdmluZyBzdWJjb25maWcncyBzdWJqZWN0c1xuICAgICAgICBpZiAoZG9Gc0NoZWNrdXApIHtcbiAgICAgICAgICAgIFByb21pc2UuYWxsKFt0aGlzLnRlc3QuZG9UeHRGaWxlc0NoZWNrKCksIHRoaXMuZXhhbS5kb1R4dEZpbGVzQ2hlY2soKV0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGFzeW5jIHJlYXNvbiA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY3VycmVudFdpbmRvdyA9IGdldEN1cnJlbnRXaW5kb3coKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnRXaW5kb3cud2ViQ29udGVudHMuaXNEZXZUb29sc09wZW5lZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50V2luZG93LndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyh7IG1vZGU6IFwidW5kb2NrZWRcIiB9KVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQmlnQ29uZmlnQ2xzIGN0b3IsIGVycm9yIHdoZW4gZG9Gc0NoZWNrdXA6YCwgcmVhc29uKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgTXlBbGVydC5iaWcuZXJyb3Ioe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGBBbiBlcnJvciBvY2N1cmVkIHdoZW4gbWFraW5nIHN1cmUgYWxsIHRydXRoIHR4dCBmaWxlcyBleGlzdC4gVHJpZWQgdG8gY2hlY2s6ICR7dGhpcy50ZXN0LnRydXRoLm5hbWV9IGFuZCAke3RoaXMuZXhhbS50cnV0aC5uYW1lfS5gLFxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbDogcmVhc29uLFxuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUVtcHR5RGlycyhcInN1YmplY3RzXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGxhc3RfcGFnZSgpOiBQYWdlTmFtZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnbGFzdF9wYWdlJyk7XG4gICAgfVxuXG4gICAgc2V0IGxhc3RfcGFnZShwYWdlOiBQYWdlTmFtZSkge1xuXG4gICAgICAgIGNvbnN0IHZhbGlkcGFnZXMgPSBbXCJuZXdcIiwgXCJydW5uaW5nXCIsIFwicmVjb3JkXCIsIFwiZmlsZV90b29sc1wiLCBcInNldHRpbmdzXCJdO1xuICAgICAgICBpZiAoIXZhbGlkcGFnZXMuaW5jbHVkZXMocGFnZSkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IGxhc3RfcGFnZShcIiR7cGFnZX1cIiksIG11c3QgYmUgb25lIG9mICR7dmFsaWRwYWdlcy5qb2luKCcsICcpfS4gc2V0dGluZyB0byBuZXdgKTtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCAnbmV3Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnbGFzdF9wYWdlJywgcGFnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipAY2FjaGVkXG4gICAgICogUmV0dXJucyB0aGUgZXhhbSBmaWxlIG5hbWUgaW5jbHVkaW5nIGV4dGVuc2lvbiovXG4gICAgZ2V0IGV4YW1fZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsICdleGFtX2ZpbGUnKTtcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuZ2V0KCdleGFtX2ZpbGUnKTtcbiAgICB9XG5cbiAgICAvKipVcGRhdGVzIGV4YW1fZmlsZSBhbmQgYWxzbyBpbml0aWFsaXplcyBuZXcgU3ViY29uZmlnKi9cbiAgICBzZXQgZXhhbV9maWxlKG5hbWVXaXRoRXh0OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXRTdWJjb25maWcobmFtZVdpdGhFeHQpXG4gICAgfVxuXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIFJldHVybnMgdGhlIHRlc3QgZmlsZSBuYW1lIGluY2x1ZGluZyBleHRlbnNpb24qL1xuICAgIGdldCB0ZXN0X2ZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCAndGVzdF9maWxlJyk7XG4gICAgfVxuXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIFVwZGF0ZXMgdGVzdF9maWxlIGFuZCBhbHNvIGluaXRpYWxpemVzIG5ldyBTdWJjb25maWcqL1xuICAgIHNldCB0ZXN0X2ZpbGUobmFtZVdpdGhFeHQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldFN1YmNvbmZpZyhuYW1lV2l0aEV4dClcbiAgICB9XG5cbiAgICAvKipAY2FjaGVkXG4gICAgICogQ2FuIGJlIGdvdHRlbiBhbHNvIHdpdGggYHN1YmNvbmZpZy50eXBlYCovXG4gICAgZ2V0IGV4cGVyaW1lbnRfdHlwZSgpOiBFeHBlcmltZW50VHlwZSB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJleHBlcmltZW50X3R5cGVcIilcbiAgICAgICAgLyppZiAoIHRoaXMuY2FjaGUuZXhwZXJpbWVudF90eXBlID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICBjb25zdCBleHBlcmltZW50VHlwZSA9IHRoaXMuZ2V0KCdleHBlcmltZW50X3R5cGUnKTtcbiAgICAgICAgIHRoaXMuY2FjaGUuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgICByZXR1cm4gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuZXhwZXJpbWVudF90eXBlO1xuICAgICAgICAgfSovXG4gICAgfVxuXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IGV4cGVyaW1lbnRfdHlwZShleHBlcmltZW50VHlwZTogRXhwZXJpbWVudFR5cGUpIHtcbiAgICAgICAgaWYgKCFbJ2V4YW0nLCAndGVzdCddLmluY2x1ZGVzKGV4cGVyaW1lbnRUeXBlKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBCaWdDb25maWcgZXhwZXJpbWVudF90eXBlIHNldHRlciwgZ290IGV4cGVyaW1lbnRUeXBlOiAnJHtleHBlcmltZW50VHlwZX0nLiBNdXN0IGJlIGVpdGhlciAndGVzdCcgb3IgJ2V4YW0nLiBzZXR0aW5nIHRvIHRlc3RgKTtcbiAgICAgICAgICAgIGV4cGVyaW1lbnRUeXBlID0gJ3Rlc3QnO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KCdleHBlcmltZW50X3R5cGUnLCBleHBlcmltZW50VHlwZSk7XG4gICAgICAgIHRoaXMuY2FjaGUuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG5cblxuICAgIH1cblxuICAgIGdldCBzdWJqZWN0cygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnc3ViamVjdHMnKTtcbiAgICB9XG5cbiAgICAvKipFbnN1cmVzIGhhdmluZyBgdGhpcy50ZXN0LnN1YmplY3RgIGFuZCBgdGhpcy5leGFtLnN1YmplY3RgIGluIHRoZSBsaXN0IHJlZ2FyZGxlc3MqL1xuICAgIHNldCBzdWJqZWN0cyhzdWJqZWN0TGlzdDogc3RyaW5nW10pIHtcbiAgICAgICAgLy8gVE9ETzogY2hlY2sgZm9yIG5vbiBleGlzdGluZyBmcm9tIGZpbGVzXG4gICAgICAgIGlmIChEUllSVU4pIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ3NldCBzdWJqZWN0cywgRFJZUlVOLiByZXR1cm5pbmcnKVxuICAgICAgICB9XG4gICAgICAgIGlmIChzdWJqZWN0TGlzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0JpZ0NvbmZpZ0Nscy5zdWJqZWN0KCkgc2V0dGVyIGdvdCB1bmRlZmluZWQsIGNvbnRpbnVlaW5nIHdpdGggW10nKTtcbiAgICAgICAgICAgIHN1YmplY3RMaXN0ID0gW107XG4gICAgICAgIH1cbiAgICAgICAgc3ViamVjdExpc3QucHVzaCh0aGlzLnRlc3Quc3ViamVjdCk7XG4gICAgICAgIHN1YmplY3RMaXN0LnB1c2godGhpcy5leGFtLnN1YmplY3QpO1xuICAgICAgICBjb25zdCBzdWJqZWN0cyA9IFsuLi5uZXcgU2V0KHN1YmplY3RMaXN0KV0uZmlsdGVyKGJvb2wpO1xuICAgICAgICBjb25zb2xlLmxvZyh7IHN1YmplY3RzIH0pO1xuICAgICAgICBmb3IgKGxldCBzIG9mIHN1YmplY3RzKSB7XG4gICAgICAgICAgICBteWZzLmNyZWF0ZUlmTm90RXhpc3RzKHBhdGguam9pbihTVUJKRUNUU19QQVRIX0FCUywgcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3RzJywgc3ViamVjdHMpO1xuXG4gICAgfVxuXG4gICAgLy8gZ2V0IGRldigpOiB7IFtLIGluIGtleW9mIERldk9wdGlvbnNdOiBEZXZPcHRpb25zW0tdIGV4dGVuZHMgb2JqZWN0ID8geyBbU0sgaW4ga2V5b2YgRGV2T3B0aW9uc1tLXV06ICgpID0+IERldk9wdGlvbnNbS11bU0tdIH0gOiAoKSA9PiBEZXZPcHRpb25zW0tdIH0ge1xuICAgIGdldCBkZXYoKTogeyBbSyBpbiBrZXlvZiBEZXZPcHRpb25zXTogKHdoZXJlPzogc3RyaW5nKSA9PiBEZXZPcHRpb25zW0tdIH0ge1xuICAgICAgICBjb25zdCBfZGV2ID0gdGhpcy5nZXQoJ2RldicpO1xuXG4gICAgICAgIGNvbnN0IGhhbmRsZUJvb2xlYW4gPSA8SyBleHRlbmRzIGtleW9mIERldk9wdGlvbnM+KGtleTogSywgd2hlcmUpOiBEZXZPcHRpb25zW0tdID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpW2tleV07XG4gICAgICAgICAgICBpZiAodmFsdWUpIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy4ke2tleX0gJHt3aGVyZX1gKTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmb3JjZV9ub3Rlc19udW1iZXI6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoX2Rldikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmb3JjZV9ub3Rlc19udW1iZXIgPSB0aGlzLmdldCgnZGV2b3B0aW9ucycpLmZvcmNlX25vdGVzX251bWJlcjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZvcmNlX25vdGVzX251bWJlcikgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLmZvcmNlX25vdGVzX251bWJlcjogJHtmb3JjZV9ub3Rlc19udW1iZXJ9YCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmb3JjZV9ub3Rlc19udW1iZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZvcmNlX3BsYXliYWNrX3JhdGU6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoX2Rldikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmb3JjZV9wbGF5YmFja19yYXRlID0gdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5mb3JjZV9wbGF5YmFja19yYXRlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZm9yY2VfcGxheWJhY2tfcmF0ZSkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLmZvcmNlX3BsYXliYWNrX3JhdGU6ICR7Zm9yY2VfcGxheWJhY2tfcmF0ZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZvcmNlX3BsYXliYWNrX3JhdGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgc2ltdWxhdGVfdGVzdF9tb2RlOiAod2hlcmU/OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlQm9vbGVhbihcInNpbXVsYXRlX3Rlc3RfbW9kZVwiLCB3aGVyZSk7XG4gICAgICAgICAgICAgICAgLy8gY29uc3Qgc2ltdWxhdGVfdGVzdF9tb2RlID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNpbXVsYXRlX3Rlc3RfbW9kZTtcbiAgICAgICAgICAgICAgICAvLyBpZiAoIHNpbXVsYXRlX3Rlc3RfbW9kZSApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5zaW11bGF0ZV90ZXN0X21vZGUgJHt3aGVyZX1gKTtcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gc2ltdWxhdGVfdGVzdF9tb2RlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2ltdWxhdGVfYW5pbWF0aW9uX21vZGU6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVCb29sZWFuKFwic2ltdWxhdGVfYW5pbWF0aW9uX21vZGVcIiwgd2hlcmUpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnN0IHNpbXVsYXRlX2FuaW1hdGlvbl9tb2RlID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNpbXVsYXRlX2FuaW1hdGlvbl9tb2RlO1xuICAgICAgICAgICAgICAgIC8vIGlmICggc2ltdWxhdGVfYW5pbWF0aW9uX21vZGUgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2ltdWxhdGVfYW5pbWF0aW9uX21vZGUgJHt3aGVyZX1gKTtcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gc2ltdWxhdGVfYW5pbWF0aW9uX21vZGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaW11bGF0ZV92aWRlb19tb2RlOiAod2hlcmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzaW11bGF0ZV92aWRlb19tb2RlID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNpbXVsYXRlX3ZpZGVvX21vZGU7XG4gICAgICAgICAgICAgICAgaWYgKHNpbXVsYXRlX3ZpZGVvX21vZGUpIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5zaW11bGF0ZV92aWRlb19tb2RlICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNpbXVsYXRlX3ZpZGVvX21vZGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBza2lwX2ZhZGU6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfZmFkZSA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX2ZhZGU7XG4gICAgICAgICAgICAgICAgaWYgKHNraXBfZmFkZSkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNraXBfZmFkZSAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX2ZhZGU7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBtdXRlX2FuaW1hdGlvbjogKHdoZXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXV0ZV9hbmltYXRpb24gPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykubXV0ZV9hbmltYXRpb247XG4gICAgICAgICAgICAgICAgaWYgKG11dGVfYW5pbWF0aW9uKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMubXV0ZV9hbmltYXRpb24gJHt3aGVyZX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbXV0ZV9hbmltYXRpb247XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2tpcF9taWRpX2V4aXN0c19jaGVjazogKHdoZXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpcF9taWRpX2V4aXN0c19jaGVjayA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX21pZGlfZXhpc3RzX2NoZWNrO1xuICAgICAgICAgICAgICAgIGlmIChza2lwX21pZGlfZXhpc3RzX2NoZWNrKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF9taWRpX2V4aXN0c19jaGVjayAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX21pZGlfZXhpc3RzX2NoZWNrO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNraXBfZXhwZXJpbWVudF9pbnRybzogKHdoZXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpcF9leHBlcmltZW50X2ludHJvID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfZXhwZXJpbWVudF9pbnRybztcbiAgICAgICAgICAgICAgICBpZiAoc2tpcF9leHBlcmltZW50X2ludHJvKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF9leHBlcmltZW50X2ludHJvICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfZXhwZXJpbWVudF9pbnRybztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBza2lwX2xldmVsX2ludHJvOiAod2hlcmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwX2xldmVsX2ludHJvID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfbGV2ZWxfaW50cm87XG4gICAgICAgICAgICAgICAgaWYgKHNraXBfbGV2ZWxfaW50cm8pIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5za2lwX2xldmVsX2ludHJvICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfbGV2ZWxfaW50cm87XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2s6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrO1xuICAgICAgICAgICAgICAgIGlmIChza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjaykgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrOiAod2hlcmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjaztcbiAgICAgICAgICAgICAgICBpZiAoc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2spIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5za2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjaztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBub19yZWxvYWRfb25fc3VibWl0OiAod2hlcmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBub19yZWxvYWRfb25fc3VibWl0ID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLm5vX3JlbG9hZF9vbl9zdWJtaXQ7XG4gICAgICAgICAgICAgICAgaWYgKG5vX3JlbG9hZF9vbl9zdWJtaXQpIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5ub19yZWxvYWRfb25fc3VibWl0ICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vX3JlbG9hZF9vbl9zdWJtaXQ7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCB2ZWxvY2l0aWVzKCkge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwidmVsb2NpdGllc1wiKVxuICAgIH1cblxuICAgIC8qKkBjYWNoZWQqL1xuICAgIHNldCB2ZWxvY2l0aWVzKHZhbDogbnVtYmVyKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBmbG9vcmVkID0gTWF0aC5mbG9vcih2YWwpO1xuICAgICAgICAgICAgaWYgKGlzTmFOKGZsb29yZWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgdmVsb2NpdGllcywgTWF0aC5mbG9vcih2YWwpIGlzIE5hTjpgLCB7IHZhbCwgZmxvb3JlZCB9LCAnLiBub3Qgc2V0dGluZycpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoZmxvb3JlZCA+PSAxICYmIGZsb29yZWQgPD0gMTYpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXQoJ3ZlbG9jaXRpZXMnLCBmbG9vcmVkKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWNoZS52ZWxvY2l0aWVzID0gZmxvb3JlZDtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IHZlbG9jaXRpZXMsIGJhZCByYW5nZTogJHt2YWx9LiBub3Qgc2V0dGluZ2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgdmVsb2NpdGllcywgRXhjZXB0aW9uIHdoZW4gdHJ5aW5nIHRvIE1hdGguZmxvb3IodmFsKTpgLCBlKTtcbiAgICAgICAgfVxuXG5cbiAgICB9XG5cbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnOiBJU3ViY29uZmlnLCBleHBlcmltZW50VHlwZTogRXhwZXJpbWVudFR5cGUpIHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignQmlnQ29uZmlnQ2xzIHVzZWQgZnJvbVNhdmVkQ29uZmlnLiBJbXBvc3NpYmxlIHRvIGxvYWQgYmlnIGZpbGUuIFJldHVybmluZycpO1xuICAgICAgICAvKmlmICggRFJZUlVOICkgcmV0dXJuIGNvbnNvbGUubG9nKGBmcm9tU2F2ZWRDb25maWcsIERSWVJVTmApO1xuICAgICAgICAgY29uc3QgdHJ1dGhGaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoc2F2ZWRDb25maWcudHJ1dGhfZmlsZV9wYXRoLCAnLnR4dCcpO1xuICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgdGhpcy50cnV0aF9maWxlX3BhdGggPSBuZXcgVHJ1dGgocGF0aC5qb2luKFRSVVRIU19QQVRIX0FCUywgdHJ1dGhGaWxlTmFtZSkpO1xuICAgICAgICAgdGhpcy5leHBlcmltZW50X3R5cGUgPSBleHBlcmltZW50VHlwZTtcbiAgICAgICAgIHRoaXMuY29uZmlnKGV4cGVyaW1lbnRUeXBlKS5mcm9tU2F2ZWRDb25maWcoc2F2ZWRDb25maWcpOyovXG4gICAgfVxuXG4gICAgLyoqQGV4YW1wbGVcbiAgICAgdXBkYXRlKCdzdWJqZWN0cycsIFtuYW1lc10pXG4gICAgICovXG4gICAgdXBkYXRlKEs6IGtleW9mIElCaWdDb25maWcsIGt2UGFpcnM6IFBhcnRpYWw8SUJpZ0NvbmZpZz4pXG5cbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywgdmFsdWVzOiBhbnlbXSlcblxuICAgIHVwZGF0ZShLLCBrdikge1xuICAgICAgICBpZiAoRFJZUlVOKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdCaWdDb25maWcudXBkYXRlKCkgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShWKSkge1xuICAgICAgICAgICAgbGV0IG5ld1ZhbHVlOiBhbnlbXSA9IFY7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShrdikpIHtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZS5wdXNoKC4uLmt2KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWUucHVzaChrdik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldChLLCBuZXdWYWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKFYsIGt2KTtcbiAgICAgICAgICAgIHRoaXMuc2V0KEssIFYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmdldChLKTtcbiAgICB9XG5cbiAgICAvKipAY2FjaGVkXG4gICAgICogU2hvdWxkIGJlIHVzZWQgaW5zdGVhZCBvZiBTdWJjb25maWcgY29uc3RydWN0b3IuXG4gICAgICogVXBkYXRlcyBgZXhhbV9maWxlYCBvciBgdGVzdF9maWxlYCwgaW4gZmlsZSBhbmQgaW4gY2FjaGUuIEFsc28gaW5pdGlhbGl6ZXMgYW5kIGNhY2hlcyBhIG5ldyBTdWJjb25maWcgKHRoaXMuZXhhbSA9IG5ldyBTdWJjb25maWcoLi4uKSkuICovXG4gICAgc2V0U3ViY29uZmlnKG5hbWVXaXRoRXh0OiBzdHJpbmcsIHN1YmNvbmZpZz86IFN1YmNvbmZpZykge1xuICAgICAgICAvLyBjb25zdCBbIGZpbGVuYW1lLCBleHQgXSA9IG15ZnMuc3BsaXRfZXh0KG5hbWVXaXRoRXh0KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIFN1YmNvbmZpZy52YWxpZGF0ZU5hbWUobmFtZVdpdGhFeHQpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZS5tZXNzYWdlID09PSAnRXh0ZW5zaW9uRXJyb3InKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2Fybihgc2V0IHNldFN1YmNvbmZpZyAoJHtuYW1lV2l0aEV4dH0pIGhhcyBubyBleHRlbnNpb24sIG9yIGV4dCBpcyBiYWQuIG5vdCBzZXR0aW5nYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZS5tZXNzYWdlID09PSAnQmFzZW5hbWVFcnJvcicpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUobmFtZVdpdGhFeHQpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0U3ViY29uZmlnKCR7bmFtZVdpdGhFeHR9KSwgcGFzc2VkIGEgcGF0aCAod2l0aCBzbGFoZXMpLiBuZWVkIG9ubHkgYSBiYXNlbmFtZS5leHQuIGNvbnRpbnVpbmcgd2l0aCBvbmx5IGJhc2VuYW1lOiAke2Jhc2VuYW1lfWApO1xuICAgICAgICAgICAgICAgIG5hbWVXaXRoRXh0ID0gYmFzZW5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKG5hbWVXaXRoRXh0KTtcbiAgICAgICAgLy8vLyBFeHRlbnNpb24gYW5kIGZpbGUgbmFtZSBva1xuICAgICAgICBjb25zdCBzdWJjZmdUeXBlID0gZXh0LnNsaWNlKDEpIGFzIEV4cGVyaW1lbnRUeXBlO1xuXG5cbiAgICAgICAgY29uc3Qgc3ViY29uZmlnS2V5ID0gYCR7c3ViY2ZnVHlwZX1fZmlsZWAgYXMgXCJleGFtX2ZpbGVcIiB8IFwidGVzdF9maWxlXCI7XG4gICAgICAgIC8vLy8gdGhpcy5zZXQoJ2V4YW1fZmlsZScsICdmdXJfZWxpc2VfQi5leGFtJylcbiAgICAgICAgdGhpcy5zZXQoc3ViY29uZmlnS2V5LCBuYW1lV2l0aEV4dCk7XG4gICAgICAgIHRoaXMuY2FjaGVbc3ViY29uZmlnS2V5XSA9IG5hbWVXaXRoRXh0O1xuICAgICAgICBjb25zb2xlLmxvZyhgc2V0U3ViY29uZmlnYCwge1xuICAgICAgICAgICAgbmFtZVdpdGhFeHQsXG4gICAgICAgICAgICBzdWJjb25maWcsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vLy8gdGhpcy5leGFtID0gbmV3IFN1YmNvbmZpZygnZnVyX2VsaXNlX0IuZXhhbScsIHN1YmNvbmZpZylcbiAgICAgICAgdGhpc1tzdWJjZmdUeXBlXSA9IG5ldyBTdWJjb25maWcobmFtZVdpdGhFeHQsIHN1YmNvbmZpZylcbiAgICB9XG5cbiAgICAvKipAY2FjaGVkKi9cbiAgICBnZXRTdWJjb25maWcoKTogU3ViY29uZmlnIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbdGhpcy5leHBlcmltZW50X3R5cGVdXG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW1vdmVFbXB0eURpcnMoLi4uZGlyczogKFwic3ViamVjdHNcIilbXSkge1xuICAgICAgICBpZiAoZGlycy5pbmNsdWRlcyhcInN1YmplY3RzXCIpKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50U3ViamVjdHMgPSB0aGlzLnN1YmplY3RzO1xuICAgICAgICAgICAgZm9yIChsZXQgc3ViamRpciBvZiBmcy5yZWFkZGlyU3luYyhTVUJKRUNUU19QQVRIX0FCUykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJqZGlyQWJzID0gcGF0aC5qb2luKFNVQkpFQ1RTX1BBVEhfQUJTLCBzdWJqZGlyKTtcbiAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnRTdWJqZWN0cy5pbmNsdWRlcyhzdWJqZGlyKSkge1xuICAgICAgICAgICAgICAgICAgICBpZ25vcmVFcnIoKCkgPT4gbXlmcy5yZW1vdmVFbXB0eURpcnMoc3ViamRpckFicykpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgc3ViZGlyIG9mIGZzLnJlYWRkaXJTeW5jKHN1YmpkaXJBYnMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZ25vcmVFcnIoKCkgPT4gbXlmcy5yZW1vdmVFbXB0eURpcnMocGF0aC5qb2luKHN1YmpkaXJBYnMsIHN1YmRpcikpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgU3ViY29uZmlnIGV4dGVuZHMgQ29uZjxJU3ViY29uZmlnPiB7IC8vIEFLQSBDb25maWdcbiAgICByZWFkb25seSBjYWNoZTogUGFydGlhbDxJU3ViY29uZmlnPjtcbiAgICB0cnV0aDogVHJ1dGg7XG4gICAgcHJpdmF0ZSByZWFkb25seSB0eXBlOiBFeHBlcmltZW50VHlwZTtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBuYW1lV2l0aEV4dCAtIHNldHMgdGhlIGBuYW1lYCBmaWVsZCBpbiBmaWxlXG4gICAgICovXG4gICAgY29uc3RydWN0b3IobmFtZVdpdGhFeHQ6IHN0cmluZywgc3ViY29uZmlnPzogU3ViY29uZmlnKSB7XG4gICAgICAgIGxldCBbZmlsZW5hbWUsIGV4dF0gPSBteWZzLnNwbGl0X2V4dChuYW1lV2l0aEV4dCk7XG4gICAgICAgIGlmICghWycuZXhhbScsICcudGVzdCddLmluY2x1ZGVzKGV4dCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU3ViY29uZmlnIGN0b3IgKCR7bmFtZVdpdGhFeHR9KSBoYXMgYmFkIG9yIG5vIGV4dGVuc2lvbmApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHR5cGUgPSBleHQuc2xpY2UoMSkgYXMgRXhwZXJpbWVudFR5cGU7XG4gICAgICAgIGxldCBkZWZhdWx0cztcbiAgICAgICAgaWYgKGJvb2woc3ViY29uZmlnKSkge1xuICAgICAgICAgICAgaWYgKHN1YmNvbmZpZy5zdG9yZSkge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRzID0geyAuLi5zdWJjb25maWcuc3RvcmUsIG5hbWU6IG5hbWVXaXRoRXh0IH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRzID0gc3ViY29uZmlnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVmYXVsdHMgPSB7IG5hbWU6IG5hbWVXaXRoRXh0IH07XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgZmlsZUV4dGVuc2lvbjogdHlwZSxcbiAgICAgICAgICAgIGN3ZDogQ09ORklHU19QQVRIX0FCUyxcbiAgICAgICAgICAgIGNvbmZpZ05hbWU6IGZpbGVuYW1lLFxuICAgICAgICAgICAgZGVmYXVsdHNcblxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNhY2hlID0geyBuYW1lOiBuYW1lV2l0aEV4dCB9O1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICBpZiAoYm9vbChzdWJjb25maWcpKSB7XG4gICAgICAgICAgICB0aGlzLnNldCh7IC4uLnN1YmNvbmZpZy5zdG9yZSwgbmFtZTogbmFtZVdpdGhFeHQgfSk7XG5cbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy50cnV0aCA9IG5ldyBUcnV0aChteWZzLnJlbW92ZV9leHQodGhpcy50cnV0aF9maWxlKSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFN1YmNvbmZpZyBjb25zdHJ1Y3RvciwgaW5pdGlhbGl6aW5nIG5ldyBUcnV0aCBmcm9tIHRoaXMudHJ1dGhfZmlsZSB0aHJldyBhbiBlcnJvci4gUHJvYmFibHkgYmVjYXVzZSB0aGlzLnRydXRoX2ZpbGUgaXMgdW5kZWZpbmVkLiBTaG91bGQgbWF5YmUgbmVzdCB1bmRlciBpZihzdWJjb25maWcpIGNsYXVzZWAsIFwidGhpcy50cnV0aF9maWxlXCIsIHRoaXMudHJ1dGhfZmlsZSwgZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbigpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiYWxsb3dlZF90ZW1wb19kZXZpYXRpb25cIilcbiAgICAgICAgLyppZiAoIHRoaXMuY2FjaGUuYWxsb3dlZF90ZW1wb19kZXZpYXRpb24gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgIGNvbnN0IGFsbG93ZWRUZW1wb0RldmlhdGlvbiA9IHRoaXMuZ2V0KCdhbGxvd2VkX3RlbXBvX2RldmlhdGlvbicpO1xuICAgICAgICAgdGhpcy5jYWNoZS5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbiA9IGFsbG93ZWRUZW1wb0RldmlhdGlvbjtcbiAgICAgICAgIHJldHVybiBhbGxvd2VkVGVtcG9EZXZpYXRpb247XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuYWxsb3dlZF90ZW1wb19kZXZpYXRpb247XG4gICAgICAgICB9Ki9cbiAgICB9XG5cbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgYWxsb3dlZF90ZW1wb19kZXZpYXRpb24oZGV2aWF0aW9uOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5zZXREZXZpYXRpb24oXCJ0ZW1wb1wiLCBkZXZpYXRpb24pO1xuICAgIH1cblxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24oKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCBcImFsbG93ZWRfcmh5dGhtX2RldmlhdGlvblwiKTtcbiAgICAgICAgLyppZiAoIHRoaXMuY2FjaGUuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICBjb25zdCBhbGxvd2VkUmh5dGhtRGV2aWF0aW9uID0gdGhpcy5nZXQoJ2FsbG93ZWRfcmh5dGhtX2RldmlhdGlvbicpO1xuICAgICAgICAgdGhpcy5jYWNoZS5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gPSBhbGxvd2VkUmh5dGhtRGV2aWF0aW9uO1xuICAgICAgICAgcmV0dXJuIGFsbG93ZWRSaHl0aG1EZXZpYXRpb247XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uO1xuICAgICAgICAgfSovXG4gICAgfVxuXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbihkZXZpYXRpb246IG51bWJlcikge1xuICAgICAgICB0aGlzLnNldERldmlhdGlvbihcInJoeXRobVwiLCBkZXZpYXRpb24pO1xuICAgIH1cblxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCBkZW1vX3R5cGUoKTogRGVtb1R5cGUge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiZGVtb190eXBlXCIpO1xuICAgICAgICAvLyByZXR1cm4gdGhpcy5nZXQoJ2RlbW9fdHlwZScpO1xuICAgIH1cblxuICAgIC8qKkBjYWNoZWQqL1xuICAgIHNldCBkZW1vX3R5cGUodHlwZTogRGVtb1R5cGUpIHtcbiAgICAgICAgaWYgKCFbJ3ZpZGVvJywgJ2FuaW1hdGlvbiddLmluY2x1ZGVzKHR5cGUpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYENvbmZpZyBkZW1vX3R5cGUgc2V0dGVyLCBiYWQgdHlwZSA9ICR7dHlwZX0sIGNhbiBiZSBlaXRoZXIgdmlkZW8gb3IgYW5pbWF0aW9uLiBOb3Qgc2V0dGluZ2ApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2RlbW9fdHlwZScsIHR5cGUpO1xuICAgICAgICAgICAgdGhpcy5jYWNoZS5kZW1vX3R5cGUgPSB0eXBlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGVycm9yc19wbGF5cmF0ZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2Vycm9yc19wbGF5cmF0ZScpO1xuICAgIH1cblxuICAgIHNldCBlcnJvcnNfcGxheXJhdGUoc3BlZWQ6IG51bWJlcikge1xuICAgICAgICBpZiAoaXNOYU4oc3BlZWQpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGNvbmZpZyBzZXQgZXJyb3JzX3BsYXlyYXRlLCByZWNlaXZlZCBiYWQgXCJzcGVlZFwiIE5hTjogJHtzcGVlZH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdlcnJvcnNfcGxheXJhdGUnLCBzcGVlZCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIGdldCBmaW5pc2hlZF90cmlhbHNfY291bnQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdmaW5pc2hlZF90cmlhbHNfY291bnQnKTtcbiAgICB9XG5cbiAgICBzZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKGlzTmFOKGNvdW50KSB8fCBjb3VudCA8IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgY29uZmlnIHNldCBmaW5pc2hlZF90cmlhbHNfY291bnQsIHJlY2VpdmVkIGJhZCBcImNvdW50XCI6ICR7Y291bnR9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZmluaXNoZWRfdHJpYWxzX2NvdW50JywgY291bnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqTmFtZSBvZiBjb25maWcgZmlsZSwgaW5jbHVkaW5nIGV4dGVuc2lvbi4gQWx3YXlzIHJldHVybnMgYG5hbWVgIGZyb20gY2FjaGUuIFRoaXMgaXMgYmVjYXVzZSB0aGVyZSdzIG5vIHNldHRlcjsgYG5hbWVgIGlzIHN0b3JlZCBpbiBjYWNoZSBhdCBjb25zdHJ1Y3Rvci4qL1xuICAgIGdldCBuYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlLm5hbWU7XG4gICAgfVxuXG4gICAgZ2V0IHN1YmplY3QoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdzdWJqZWN0Jyk7XG4gICAgfVxuXG4gICAgc2V0IHN1YmplY3QobmFtZTogc3RyaW5nIHwgbnVsbCkge1xuICAgICAgICBpZiAoRFJZUlVOKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdzZXQgc3ViamVjdCwgRFJZUlVOLiBSZXR1cm5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWJvb2wobmFtZSkpIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oYHNldCBzdWJqZWN0LCAhYm9vbChuYW1lKTogJHtuYW1lfS4gUmV0dXJuaW5nYClcbiAgICAgICAgfVxuICAgICAgICBuYW1lID0gbmFtZS5sb3dlcigpO1xuICAgICAgICB0aGlzLnNldCgnc3ViamVjdCcsIG5hbWUpO1xuICAgICAgICBjb25zdCBHbG9iID0gcmVxdWlyZSgnLi4vR2xvYicpLmRlZmF1bHQ7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nU3ViamVjdHMgPSBHbG9iLkJpZ0NvbmZpZy5zdWJqZWN0cy5maWx0ZXIoYm9vbCk7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgZXhpc3RpbmdTdWJqZWN0cyB9KTtcblxuICAgICAgICBHbG9iLkJpZ0NvbmZpZy5zdWJqZWN0cyA9IFsuLi5uZXcgU2V0KFsuLi5leGlzdGluZ1N1YmplY3RzLCBuYW1lXSldO1xuICAgIH1cblxuICAgIC8qKkBjYWNoZWRcbiAgICAgKiBUcnV0aCBmaWxlIG5hbWUsIG5vIGV4dGVuc2lvbiovXG4gICAgZ2V0IHRydXRoX2ZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCAndHJ1dGhfZmlsZScpO1xuICAgICAgICAvLyByZXR1cm4gdGhpcy5nZXQoJ3RydXRoX2ZpbGUnKVxuICAgIH1cblxuICAgIC8qKkFsc28gc2V0cyB0aGlzLnRydXRoIChtZW1vcnkpXG4gICAgICogQGNhY2hlZFxuICAgICAqIEBwYXJhbSB0cnV0aF9maWxlIC0gVHJ1dGggZmlsZSBuYW1lLCBubyBleHRlbnNpb24qL1xuICAgIHNldCB0cnV0aF9maWxlKHRydXRoX2ZpbGU6IHN0cmluZykge1xuICAgICAgICAvLyB0cnV0aF9maWxlID0gcGF0aC5iYXNlbmFtZSh0cnV0aF9maWxlKTtcbiAgICAgICAgbGV0IFtuYW1lLCBleHRdID0gbXlmcy5zcGxpdF9leHQodHJ1dGhfZmlsZSk7XG4gICAgICAgIGlmIChib29sKGV4dCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IHRydXRoX2ZpbGUsIHBhc3NlZCBuYW1lIGlzIG5vdCBleHRlbnNpb25sZXNzOiAke3RydXRoX2ZpbGV9LiBDb250aW51aW5nIHdpdGggXCIke25hbWV9XCJgKTtcbiAgICAgICAgICAgIC8vIG5hbWVOb0V4dCA9IG15ZnMucmVtb3ZlX2V4dChuYW1lTm9FeHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCB0cnV0aCA9IG5ldyBUcnV0aChuYW1lKTtcbiAgICAgICAgICAgIGlmICghdHJ1dGgudHh0LmFsbEV4aXN0KCkpIHtcbiAgICAgICAgICAgICAgICBNeUFsZXJ0LnNtYWxsLndhcm5pbmcoYE5vdCBhbGwgdHh0IGZpbGVzIGV4aXN0OiAke25hbWV9YClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudHJ1dGggPSB0cnV0aDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgTXlBbGVydC5zbWFsbC53YXJuaW5nKGUpO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGUpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoYHRydXRoX2ZpbGVgLCBuYW1lKTtcbiAgICAgICAgdGhpcy5jYWNoZS50cnV0aF9maWxlID0gbmFtZTtcblxuXG4gICAgfVxuXG4gICAgZ2V0IGxldmVscygpOiBJTGV2ZWxbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnbGV2ZWxzJyk7XG4gICAgfVxuXG4gICAgc2V0IGxldmVscyhsZXZlbHM6IElMZXZlbFtdKSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShsZXZlbHMpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCBsZXZlbHMsIHJlY2VpdmVkIFwibGV2ZWxzXCIgbm90IGlzQXJyYXkuIG5vdCBzZXR0aW5nIGFueXRoaW5nLiBsZXZlbHM6IGAsIGxldmVscyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBiZXR0ZXIgY2hlY2tzXG4gICAgICAgICAgICB0aGlzLnNldCgnbGV2ZWxzJywgbGV2ZWxzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyB2YWxpZGF0ZU5hbWUobmFtZVdpdGhFeHQ6IHN0cmluZykge1xuICAgICAgICBsZXQgW2ZpbGVuYW1lLCBleHRdID0gbXlmcy5zcGxpdF9leHQobmFtZVdpdGhFeHQpO1xuICAgICAgICBpZiAoIVsnLmV4YW0nLCAnLnRlc3QnXS5pbmNsdWRlcyhleHQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4dGVuc2lvbkVycm9yYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hbWVXaXRoRXh0ICE9PSBgJHtmaWxlbmFtZX0ke2V4dH1gKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jhc2VuYW1lRXJyb3InKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGRvVHh0RmlsZXNDaGVjaygpOiBQcm9taXNlPFN3ZWV0QWxlcnRSZXN1bHQ+IHtcbiAgICAgICAgY29uc29sZS5sb2coYPCfkr4gU3ViY29uZmlnKCR7dGhpcy50eXBlfSkuZG9UcnV0aEZpbGVDaGVjaygpYCk7XG4gICAgICAgIGlmICh0aGlzLnRydXRoLnR4dC5hbGxFeGlzdCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gTXlBbGVydC5zbWFsbC5zdWNjZXNzKGAke3RoaXMudHJ1dGgubmFtZX0udHh0LCAqX29uLnR4dCwgYW5kICpfb2ZmLnR4dCBmaWxlcyBleGlzdC5gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBbJ2Z1cl9lbGlzZV9CJyB4IDMsICdmdXJfZWxpc2VfUi50eHQnIHggMywgLi4uXVxuICAgICAgICBjb25zdCB0cnV0aHNXaXRoM1R4dEZpbGVzID0gZ2V0VHJ1dGhzV2l0aDNUeHRGaWxlcygpO1xuICAgICAgICBpZiAoIWJvb2wodHJ1dGhzV2l0aDNUeHRGaWxlcykpXG4gICAgICAgICAgICByZXR1cm4gTXlBbGVydC5iaWcud2FybmluZyh7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdObyB2YWxpZCB0cnV0aCBmaWxlcyBmb3VuZCcsXG4gICAgICAgICAgICAgICAgaHRtbDogJ1RoZXJlIG5lZWRzIHRvIGJlIGF0IGxlYXN0IG9uZSB0eHQgZmlsZSB3aXRoIG9uZSBcIm9uXCIgYW5kIG9uZSBcIm9mZlwiIGNvdW50ZXJwYXJ0cy4nXG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgIHJldHVybiBNeUFsZXJ0LmJpZy5ibG9ja2luZyh7XG4gICAgICAgICAgICB0aXRsZTogYERpZG4ndCBmaW5kIGFsbCB0aHJlZSAudHh0IGZpbGVzIGZvciAke3RoaXMudHJ1dGgubmFtZX1gLFxuICAgICAgICAgICAgaHRtbDogJ1RoZSBmb2xsb3dpbmcgdHJ1dGhzIGFsbCBoYXZlIDMgdHh0IGZpbGVzLiBQbGVhc2UgY2hvb3NlIG9uZSBvZiB0aGVtLCBvciBmaXggdGhlIGZpbGVzIGFuZCByZWxvYWQuJyxcbiAgICAgICAgICAgIHNob3dDbG9zZUJ1dHRvbjogdHJ1ZSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgc3RyaW5nczogdHJ1dGhzV2l0aDNUeHRGaWxlcyxcbiAgICAgICAgICAgIGNsaWNrRm46IGVsID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zdCBjb25maWcgPSB0aGlzLmNvbmZpZyh0aGlzLmV4cGVyaW1lbnRfdHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sZXZlbHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cnV0aF9maWxlID0gZWwudGV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLnRydXRoX2ZpbGVfcGF0aCA9IG5ldyBUcnV0aChlbC50ZXh0KCkpO1xuICAgICAgICAgICAgICAgICAgICByZWxvYWRQYWdlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIE15QWxlcnQuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgTXlBbGVydC5iaWcuZXJyb3IoeyB0aXRsZTogZXJyLm1lc3NhZ2UsIGh0bWw6ICdTb21ldGhpbmcgaGFwcGVuZWQuJyB9KTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuXG4gICAgfVxuXG4gICAgaW5jcmVhc2UoSzoga2V5b2YgSVN1YmNvbmZpZykge1xuICAgICAgICBjb25zb2xlLndhcm4oYHVzZWQgc3ViY29uZmlnLmluY3JlYXNlLCBVTlRFU1RFRGApO1xuICAgICAgICBpZiAoRFJZUlVOKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdpbmNyZWFzZSwgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuXG4gICAgICAgIGlmIChWID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICB0aGlzLnNldChLLCAxKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0eXBlb2ZWID0gdHlwZW9mIFY7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBpZiAodHlwZW9mViA9PT0gJ251bWJlcicgfHwgKHR5cGVvZlYgPT09ICdzdHJpbmcnICYmIFYuaXNkaWdpdCgpKSkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICB0aGlzLnNldChLLCBNYXRoLmZsb29yKFYpICsgMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkJpZ0NvbmZpZ0NscyB0cmllZCB0byBpbmNyZWFzZSBhIHZhbHVlIHRoYXQgaXMgbm90IGEgbnVtYmVyIG5vciBhIHN0cmluZy5pc2RpZ2l0KClcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIHRvSHRtbCgpOiBzdHJpbmcge1xuICAgICAgICBsZXQgbGV2ZWxzID0gdGhpcy5sZXZlbHM7XG4gICAgICAgIGxldCBsZXZlbHNIdG1sID0gYFxuICAgICAgICA8dGFibGUgY2xhc3M9XCJzdWJjb25maWctaHRtbFwiPlxuICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgIDx0aD5MZXZlbCAjPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+Tm90ZXM8L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5UcmlhbHM8L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5SaHl0aG08L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5UZW1wbzwvdGg+XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICBgO1xuICAgICAgICBmb3IgKGxldCBbaSwgbHZsXSBvZiBlbnVtZXJhdGUobGV2ZWxzKSkge1xuICAgICAgICAgICAgbGV2ZWxzSHRtbCArPSBgXG4gICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgPHRkPiR7aSArIDF9PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQ+JHtsdmwubm90ZXN9PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQ+JHtsdmwudHJpYWxzfTwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkPiR7bHZsLnJoeXRobX08L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD4ke2x2bC50ZW1wb308L3RkPlxuICAgICAgICAgICAgPC90cj5gXG4gICAgICAgIH1cbiAgICAgICAgbGV2ZWxzSHRtbCArPSBgPC90YWJsZT5gO1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwic3ViY29uZmlnLWh0bWxcIj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5LZXk8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGg+VmFsdWU8L3RoPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+QWxsb3dlZCByaHl0aG0gZGV2aWF0aW9uPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPiR7dGhpcy5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb259PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRkPkFsbG93ZWQgdGVtcG8gZGV2aWF0aW9uPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPiR7dGhpcy5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbn08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+RGVtbyB0eXBlPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPiR7dGhpcy5kZW1vX3R5cGV9PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRkPkVycm9ycyBwbGF5IHJhdGU8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHt0aGlzLmVycm9yc19wbGF5cmF0ZX08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+RmluaXNoZWQgdHJpYWxzIGNvdW50PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPiR7dGhpcy5maW5pc2hlZF90cmlhbHNfY291bnR9PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRkPk5hbWU8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHt0aGlzLm5hbWV9PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRkPlN1YmplY3Q8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHt0aGlzLnN1YmplY3R9PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRkPlRydXRoIGZpbGU8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHt0aGlzLnRydXRoX2ZpbGV9PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgPC90YWJsZT5cblxuICAgICAgICAgICAgJHtsZXZlbHNIdG1sfVxuICAgICAgICAgICAgYDtcbiAgICB9XG5cbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgZnJvbVN1YmNvbmZpZyhzdWJjb25maWc6IFN1YmNvbmZpZykge1xuICAgICAgICBpZiAoRFJZUlVOKSByZXR1cm4gY29uc29sZS53YXJuKCdmcm9tT2JqLCBEUllSVU4uIHJldHVybmluZycpO1xuICAgICAgICAvLyB0aGlzLnNldChzdWJjb25maWcudG9PYmooKSk7XG4gICAgICAgIC8vIHRoaXMuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uID0gc3ViY29uZmlnLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbjtcbiAgICAgICAgLy8gdGhpcy5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbiA9IHN1YmNvbmZpZy5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbjtcbiAgICAgICAgLy8gdGhpcy5kZW1vX3R5cGUgPSBzdWJjb25maWcuZGVtb190eXBlO1xuICAgICAgICAvLyB0aGlzLmVycm9yc19wbGF5cmF0ZSA9IHN1YmNvbmZpZy5lcnJvcnNfcGxheXJhdGU7XG4gICAgICAgIC8vIHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50ID0gc3ViY29uZmlnLmZpbmlzaGVkX3RyaWFsc19jb3VudDtcbiAgICAgICAgLy8gdGhpcy5sZXZlbHMgPSBzdWJjb25maWcubGV2ZWxzO1xuICAgICAgICAvLyB0aGlzLnN1YmplY3QgPSBzdWJjb25maWcuc3ViamVjdDtcbiAgICAgICAgLy8gdGhpcy50cnV0aF9maWxlID0gc3ViY29uZmlnLnRydXRoX2ZpbGU7XG4gICAgICAgIC8vIHRoaXMuX3VwZGF0ZVNhdmVkRmlsZSgndHJ1dGhfZmlsZV9wYXRoJywgY2ZnRmlsZS50cnV0aF9maWxlX3BhdGgpO1xuICAgIH1cblxuICAgIGN1cnJlbnRUcmlhbENvb3JkcygpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgICAgICAgbGV0IGZsYXRUcmlhbHNMaXN0ID0gdGhpcy5sZXZlbHMubWFwKGxldmVsID0+IGxldmVsLnRyaWFscyk7XG4gICAgICAgIGZvciAobGV0IFtsZXZlbEluZGV4LCB0cmlhbHNOdW1dIG9mIGVudW1lcmF0ZShmbGF0VHJpYWxzTGlzdCkpIHtcblxuICAgICAgICAgICAgbGV0IHRyaWFsU3VtU29GYXIgPSBzdW0oZmxhdFRyaWFsc0xpc3Quc2xpY2UoMCwgbGV2ZWxJbmRleCArIDEpKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbmlzaGVkVHJpYWxzQ291bnQgPSB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudDtcbiAgICAgICAgICAgIGlmICh0cmlhbFN1bVNvRmFyID4gZmluaXNoZWRUcmlhbHNDb3VudClcbiAgICAgICAgICAgICAgICByZXR1cm4gW2xldmVsSW5kZXgsIHRyaWFsc051bSAtICh0cmlhbFN1bVNvRmFyIC0gZmluaXNoZWRUcmlhbHNDb3VudCldO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUud2FybihcImN1cnJlbnRUcmlhbENvb3Jkczogb3V0IG9mIGluZGV4IGVycm9yXCIpO1xuICAgIH1cblxuICAgIGlzRGVtb1ZpZGVvKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5kZW1vX3R5cGUgPT09ICd2aWRlbyc7XG4gICAgfVxuXG4gICAgaXNXaG9sZVRlc3RPdmVyKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gc3VtKHRoaXMubGV2ZWxzLm1hcChsZXZlbCA9PiBsZXZlbC50cmlhbHMpKSA9PSB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudDtcbiAgICB9XG5cbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgZ2V0U3ViamVjdERpck5hbWVzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIGZzLnJlYWRkaXJTeW5jKFNVQkpFQ1RTX1BBVEhfQUJTKTtcbiAgICB9XG5cbiAgICBnZXRDdXJyZW50TGV2ZWwoKTogTGV2ZWwge1xuXG4gICAgICAgIGxldCBbbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4XSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIHJldHVybiBuZXcgTGV2ZWwodGhpcy5sZXZlbHNbbGV2ZWxfaW5kZXhdLCBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXgpO1xuICAgIH1cblxuICAgIGdldExldmVsQ29sbGVjdGlvbigpOiBMZXZlbENvbGxlY3Rpb24ge1xuICAgICAgICBsZXQgW2xldmVsX2luZGV4LCB0cmlhbF9pbmRleF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICByZXR1cm4gbmV3IExldmVsQ29sbGVjdGlvbih0aGlzLmxldmVscywgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4KTtcbiAgICB9XG5cbiAgICAvKipAZGVwcmVjYXRlZFxuICAgICAqIEdldHMgdGhlIGN1cnJlbnQgdHJpYWwncyBwYXRoIChqb2luIHRoaXMudGVzdE91dFBhdGgoKSBhbmQgbGV2ZWxfJHtsZXZlbF9pbmRleH0uLi4pLCBhbmQgcmV0dXJucyBhIFRydXRoIG9mIGl0Ki9cbiAgICBjcmVhdGVUcnV0aEZyb21UcmlhbFJlc3VsdCgpOiBUcnV0aCB7XG4gICAgICAgIGNvbnNvbGUud2FybihgVGhpcyBzaG91bGQgYmUgc29tZXdoZXJlIGVsc2VgKTtcbiAgICAgICAgbGV0IFtsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXhdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgLy8gcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odGhpcy50ZXN0T3V0UGF0aCgpLCBgbGV2ZWxfJHtsZXZlbF9pbmRleH1fdHJpYWxfJHt0cmlhbF9pbmRleH1gKSk7XG4gICAgICAgIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRoaXMuZXhwZXJpbWVudE91dERpckFicygpLCBgbGV2ZWxfJHtsZXZlbF9pbmRleH1fdHJpYWxfJHt0cmlhbF9pbmRleH1gKSk7XG4gICAgfVxuXG4gICAgLyoqXCJjOlxcU3luY1xcQ29kZVxcUHl0aG9uXFxQeWFuby1yZWxlYXNlXFxzcmNcXGV4cGVyaW1lbnRzXFxzdWJqZWN0c1xcZ2lsYWRcXGZ1cl9lbGlzZVwiKi9cbiAgICBleHBlcmltZW50T3V0RGlyQWJzKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGN1cnJTdWJqZWN0RGlyID0gcGF0aC5qb2luKFNVQkpFQ1RTX1BBVEhfQUJTLCB0aGlzLnN1YmplY3QpOyAvLyBcIi4uLi9zdWJqZWN0cy9naWxhZFwiXG4gICAgICAgIHJldHVybiBwYXRoLmpvaW4oY3VyclN1YmplY3REaXIsIHRoaXMudHJ1dGgubmFtZSk7IC8vIFwiLi4uL2dpbGFkL2Z1cl9lbGlzZV9CXCJcbiAgICB9XG5cbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgcHJpdmF0ZSBfdXBkYXRlU2F2ZWRGaWxlKGtleToga2V5b2YgSVN1YmNvbmZpZywgdmFsdWUpIHtcbiAgICAgICAgaWYgKERSWVJVTikge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignX3VwZGF0ZVNhdmVkRmlsZSwgRFJZUlVOLiByZXR1cm5pbmcnKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ191cGRhdGVTYXZlZEZpbGUoKSBkb2VzIG5vdGhpbmcsIHJldHVybmluZycpO1xuICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgLypjb25zdCBjb25mID0gbmV3IChyZXF1aXJlKCdjb25mJykpKHtcbiAgICAgICAgIGN3ZCA6IENPTkZJR1NfUEFUSF9BQlMsXG4gICAgICAgICBjb25maWdOYW1lIDogdGhpcy5uYW1lLFxuICAgICAgICAgZmlsZUV4dGVuc2lvbiA6IHRoaXMudHlwZSxcbiAgICAgICAgIHNlcmlhbGl6ZSA6IHZhbHVlID0+IEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCA0KVxuICAgICAgICAgfSk7XG4gICAgICAgICBjb25mLnNldChrZXksIHZhbHVlKTsqL1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0RGV2aWF0aW9uKGRldmlhdGlvblR5cGU6IERldmlhdGlvblR5cGUsIGRldmlhdGlvbjogbnVtYmVyKSB7XG5cblxuICAgICAgICAvLyBpZiAoIHR5cGVvZkRldmlhdGlvbiA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgIGlmIChpc1N0cmluZyhkZXZpYXRpb24pKSB7XG4gICAgICAgICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChkZXZpYXRpb24pKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0RGV2aWF0aW9uIGdvdCBzdHJpbmcgZGV2aWF0aW9uLCBjb3VsZG50IHBhcnNlRmxvYXQuIGRldmlhdGlvbjogXCIke2RldmlhdGlvbn1cIi4gcmV0dXJuaW5nYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZXZpYXRpb24gPSBwYXJzZUZsb2F0KGRldmlhdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMuc2V0KGBhbGxvd2VkXyR7ZGV2aWF0aW9uVHlwZX1fZGV2aWF0aW9uYCwgZGV2aWF0aW9uKTtcbiAgICAgICAgdGhpcy5jYWNoZVtgYWxsb3dlZF8ke2RldmlhdGlvblR5cGV9X2RldmlhdGlvbmBdID0gZGV2aWF0aW9uO1xuICAgIH1cblxuXG59XG4iXX0=