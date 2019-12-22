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
        super();
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
    _updateSavedFile(key, value) {
        if (DRYRUN) {
            return console.warn('_updateSavedFile, DRYRUN. returning');
        }
        return console.warn('_updateSavedFile() does nothing, returning');
        this.set(key, value);
    }
    setDeviation(deviationType, deviation) {
        const typeofDeviation = typeof deviation;
        if (typeofDeviation === 'number') {
            deviation = `${deviation}%`;
            console.warn(`setDeviation got "deviation" type number. appended "%". deviation now: ${deviation}`);
        }
        else if (typeofDeviation === 'string') {
            if (!deviation.endsWith("%")) {
                console.warn(`setDeviation got deviation without %. appended %. deviation now: "${deviation}"`);
                deviation = `${deviation}%`;
            }
        }
        else {
            console.warn(`setDeviation, received "deviation" not string not number. returning. deviation:`, deviation);
            return;
        }
        this.set(`allowed_${deviationType}_deviation`, deviation);
        this.cache[`allowed_${deviationType}_deviation`] = deviation;
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
}
exports.Subconfig = Subconfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUFpQztBQUNqQyxrQ0FBMkI7QUFDM0Isa0NBQTZGO0FBQzdGLG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsNkJBQTZCO0FBRTdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQXNEdEMsU0FBUyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUk7SUFDakMsSUFBSyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRztRQUNwQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzdCLE9BQU8sT0FBTyxDQUFDO0tBQ2xCO1NBQU07UUFDSCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDN0I7QUFDTCxDQUFDO0FBR0QsU0FBZ0Isa0JBQWtCLENBQUMsRUFBRSxTQUFTLEtBQTRDLEVBQUUsU0FBUyxFQUFHLFNBQVMsRUFBRTtJQUMvRyxJQUFLLFNBQVMsRUFBRztRQUNiLElBQUssU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRztZQUU3QixTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsQztRQUNELElBQUssQ0FBQyxDQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFHO1lBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLFNBQVMsNEVBQTRFLENBQUMsQ0FBQztZQUN2SCxTQUFTLEdBQUcsU0FBUyxDQUFDO1NBQ3pC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QUFFLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELGVBQWU7UUFFWCxJQUFJLENBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzdELE9BQU8sSUFBSSxhQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUdELGtCQUFrQjtRQUNkLElBQUksQ0FBRSxXQUFXLEVBQUUsV0FBVyxDQUFFLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDN0QsT0FBTyxJQUFJLHVCQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUtELDBCQUEwQjtRQUN0QixPQUFPLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFFLFdBQVcsRUFBRSxXQUFXLENBQUUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUU3RCxPQUFPLElBQUksYUFBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsU0FBUyxXQUFXLFVBQVUsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3pHLENBQUM7SUFHRCxtQkFBbUI7UUFDZixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztDQUdKO0FBOWJELDhCQThiQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFN0b3JlIGZyb20gXCJlbGVjdHJvbi1zdG9yZVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgTXlBbGVydCBmcm9tIFwiLi4vTXlBbGVydFwiO1xuaW1wb3J0IG15ZnMgZnJvbSBcIi4uL015RnNcIjtcbmltcG9ydCB7IGJvb2wsIHJlbG9hZFBhZ2UsIHN1bSwgZW51bWVyYXRlLCBhbGwsIGdldEN1cnJlbnRXaW5kb3csIGlnbm9yZUVyciB9IGZyb20gXCIuLi91dGlsXCI7XG5pbXBvcnQgeyBUcnV0aCB9IGZyb20gXCIuLi9UcnV0aFwiO1xuaW1wb3J0IHsgSUxldmVsLCBMZXZlbCwgTGV2ZWxDb2xsZWN0aW9uIH0gZnJvbSBcIi4uL0xldmVsXCI7XG5pbXBvcnQgeyBTd2VldEFsZXJ0UmVzdWx0IH0gZnJvbSBcInN3ZWV0YWxlcnQyXCI7XG5pbXBvcnQgKiBhcyBDb25mIGZyb20gJ2NvbmYnO1xuXG5jb25zb2xlLmxvZygnc3JjL0JpZ0NvbmZpZy9pbmRleC50cycpO1xuXG5leHBvcnQgdHlwZSBFeHBlcmltZW50VHlwZSA9ICdleGFtJyB8ICd0ZXN0JztcbmV4cG9ydCB0eXBlIERlbW9UeXBlID0gJ3ZpZGVvJyB8ICdhbmltYXRpb24nO1xuZXhwb3J0IHR5cGUgUGFnZU5hbWUgPSBcIm5ld1wiIC8vIEFLQSBUTGFzdFBhZ2VcbiAgICB8IFwicnVubmluZ1wiXG4gICAgfCBcInJlY29yZFwiXG4gICAgfCBcImZpbGVfdG9vbHNcIlxuICAgIHwgXCJzZXR0aW5nc1wiXG50eXBlIERldmlhdGlvblR5cGUgPSAncmh5dGhtJyB8ICd0ZW1wbyc7XG5cblxuZXhwb3J0IGludGVyZmFjZSBJU3ViY29uZmlnIHtcbiAgICBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb246IHN0cmluZyxcbiAgICBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbjogc3RyaW5nLFxuICAgIGRlbW9fdHlwZTogRGVtb1R5cGUsXG4gICAgZXJyb3JzX3BsYXlyYXRlOiBudW1iZXIsXG4gICAgZmluaXNoZWRfdHJpYWxzX2NvdW50OiBudW1iZXIsXG4gICAgbGV2ZWxzOiBJTGV2ZWxbXSxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgc3ViamVjdDogc3RyaW5nLFxuICAgIHRydXRoX2ZpbGU6IHN0cmluZyxcbn1cblxuXG5pbnRlcmZhY2UgRGV2T3B0aW9ucyB7XG4gICAgZm9yY2Vfbm90ZXNfbnVtYmVyOiBudWxsIHwgbnVtYmVyLFxuICAgIGZvcmNlX3BsYXliYWNrX3JhdGU6IG51bGwgfCBudW1iZXIsXG4gICAgbXV0ZV9hbmltYXRpb246IGJvb2xlYW4sXG4gICAgbm9fcmVsb2FkX29uX3N1Ym1pdDogYm9vbGVhblxuICAgIHNpbXVsYXRlX3Rlc3RfbW9kZTogYm9vbGVhbixcbiAgICBzaW11bGF0ZV92aWRlb19tb2RlOiBib29sZWFuLFxuICAgIHNpbXVsYXRlX2FuaW1hdGlvbl9tb2RlOiBib29sZWFuLFxuICAgIHNraXBfZXhwZXJpbWVudF9pbnRybzogYm9vbGVhbixcbiAgICBza2lwX2ZhZGU6IGJvb2xlYW4sXG4gICAgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2s6IGJvb2xlYW4sXG4gICAgc2tpcF9sZXZlbF9pbnRybzogYm9vbGVhbixcbiAgICBza2lwX21pZGlfZXhpc3RzX2NoZWNrOiBib29sZWFuLFxuICAgIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrOiBib29sZWFuLFxufVxuXG5pbnRlcmZhY2UgSUJpZ0NvbmZpZyB7XG4gICAgZGV2OiBib29sZWFuLFxuICAgIGRldm9wdGlvbnM6IERldk9wdGlvbnMsXG4gICAgZXhhbV9maWxlOiBzdHJpbmcsXG4gICAgZXhwZXJpbWVudF90eXBlOiBFeHBlcmltZW50VHlwZSxcbiAgICBsYXN0X3BhZ2U6IFBhZ2VOYW1lLFxuICAgIHN1YmplY3RzOiBzdHJpbmdbXSxcbiAgICB0ZXN0X2ZpbGU6IHN0cmluZyxcbiAgICB2ZWxvY2l0aWVzOiBudW1iZXIsXG59XG5cbmZ1bmN0aW9uIHRyeUdldEZyb21DYWNoZTxUIGV4dGVuZHMga2V5b2YgSUJpZ0NvbmZpZz4oY29uZmlnOiBCaWdDb25maWdDbHMsIHByb3A6IFQpOiBJQmlnQ29uZmlnW1RdXG5mdW5jdGlvbiB0cnlHZXRGcm9tQ2FjaGU8VCBleHRlbmRzIGtleW9mIElTdWJjb25maWc+KGNvbmZpZzogU3ViY29uZmlnLCBwcm9wOiBUKTogSVN1YmNvbmZpZ1tUXVxuZnVuY3Rpb24gdHJ5R2V0RnJvbUNhY2hlKGNvbmZpZywgcHJvcCkge1xuICAgIGlmICggY29uZmlnLmNhY2hlW3Byb3BdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIGNvbnN0IHByb3BWYWwgPSBjb25maWcuZ2V0KHByb3ApO1xuICAgICAgICBjb25maWcuY2FjaGVbcHJvcF0gPSBwcm9wVmFsO1xuICAgICAgICByZXR1cm4gcHJvcFZhbDtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY29uZmlnLmNhY2hlW3Byb3BdO1xuICAgIH1cbn1cblxuLyoqTGlzdCBvZiB0cnV0aCBmaWxlIG5hbWVzLCBubyBleHRlbnNpb24qL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRydXRoRmlsZXNXaGVyZSh7IGV4dGVuc2lvbiB9OiB7IGV4dGVuc2lvbj86ICd0eHQnIHwgJ21pZCcgfCAnbXA0JyB9ID0geyBleHRlbnNpb24gOiB1bmRlZmluZWQgfSk6IHN0cmluZ1tdIHtcbiAgICBpZiAoIGV4dGVuc2lvbiApIHtcbiAgICAgICAgaWYgKCBleHRlbnNpb24uc3RhcnRzV2l0aCgnLicpICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgZXh0ZW5zaW9uID0gZXh0ZW5zaW9uLnNsaWNlKDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmICggIVsgJ3R4dCcsICdtaWQnLCAnbXA0JyBdLmluY2x1ZGVzKGV4dGVuc2lvbikgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHRydXRoRmlsZXNMaXN0KFwiJHtleHRlbnNpb259XCIpLCBtdXN0IGJlIGVpdGhlciBbJ3R4dCcsJ21pZCcsJ21wNCddIG9yIG5vdCBhdCBhbGwuIHNldHRpbmcgdG8gdW5kZWZpbmVkYCk7XG4gICAgICAgICAgICBleHRlbnNpb24gPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gY29uc3QgdHJ1dGhzRGlyUGF0aCA9IHRoaXMudHJ1dGhzRGlyUGF0aCgpO1xuICAgIFxuICAgIGxldCB0cnV0aEZpbGVzID0gWyAuLi5uZXcgU2V0KGZzLnJlYWRkaXJTeW5jKFRSVVRIU19QQVRIX0FCUykpIF07XG4gICAgbGV0IGZvcm1hdHRlZFRydXRoRmlsZXMgPSBbXTtcbiAgICBmb3IgKCBsZXQgZmlsZSBvZiB0cnV0aEZpbGVzICkge1xuICAgICAgICBsZXQgWyBuYW1lLCBleHQgXSA9IG15ZnMuc3BsaXRfZXh0KGZpbGUpO1xuICAgICAgICBpZiAoIGV4dGVuc2lvbiApIHtcbiAgICAgICAgICAgIGlmICggZXh0Lmxvd2VyKCkgPT09IGAuJHtleHRlbnNpb259YCApIHtcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRUcnV0aEZpbGVzLnB1c2gobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3JtYXR0ZWRUcnV0aEZpbGVzLnB1c2gobmFtZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZm9ybWF0dGVkVHJ1dGhGaWxlc1xuICAgIFxufVxuXG4vKipMaXN0IG9mIG5hbWVzIG9mIHR4dCB0cnV0aCBmaWxlcyB0aGF0IGhhdmUgdGhlaXIgd2hvbGUgXCJ0cmlwbGV0XCIgaW4gdGFjdC4gbm8gZXh0ZW5zaW9uKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcnV0aHNXaXRoM1R4dEZpbGVzKCk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCB0eHRGaWxlc0xpc3QgPSBnZXRUcnV0aEZpbGVzV2hlcmUoeyBleHRlbnNpb24gOiAndHh0JyB9KTtcbiAgICBjb25zdCB3aG9sZVR4dEZpbGVzID0gW107XG4gICAgZm9yICggbGV0IG5hbWUgb2YgdHh0RmlsZXNMaXN0ICkge1xuICAgICAgICBpZiAoIHR4dEZpbGVzTGlzdC5jb3VudCh0eHQgPT4gdHh0LnN0YXJ0c1dpdGgobmFtZSkpID49IDMgKSB7XG4gICAgICAgICAgICB3aG9sZVR4dEZpbGVzLnB1c2gobmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHR4dEZpbGVzTGlzdC5maWx0ZXIoYSA9PiB0eHRGaWxlc0xpc3QuZmlsdGVyKHR4dCA9PiB0eHQuc3RhcnRzV2l0aChhKSkubGVuZ3RoID49IDMpO1xufVxuXG5leHBvcnQgY2xhc3MgQmlnQ29uZmlnQ2xzIGV4dGVuZHMgU3RvcmU8SUJpZ0NvbmZpZz4ge1xuICAgIHRlc3Q6IFN1YmNvbmZpZztcbiAgICBleGFtOiBTdWJjb25maWc7XG4gICAgcmVhZG9ubHkgY2FjaGU6IFBhcnRpYWw8SUJpZ0NvbmZpZz47XG4gICAgXG4gICAgY29uc3RydWN0b3IoZG9Gc0NoZWNrdXAgPSB0cnVlKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuY2FjaGUgPSB7fTtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICB0aGlzLnNldCA9ICguLi5hcmdzKSA9PiBjb25zb2xlLndhcm4oYERSWVJVTiwgc2V0OiBgLCBhcmdzKVxuICAgICAgICB9XG4gICAgICAgIGxldCB0ZXN0TmFtZVdpdGhFeHQgPSB0aGlzLnRlc3RfZmlsZTtcbiAgICAgICAgbGV0IGV4YW1OYW1lV2l0aEV4dCA9IHRoaXMuZXhhbV9maWxlO1xuICAgICAgICBpZiAoICFhbGwodGVzdE5hbWVXaXRoRXh0LCBleGFtTmFtZVdpdGhFeHQpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBCaWdDb25maWdDbHMgY3RvciwgY291bGRudCBnZXQgdGVzdF9maWxlIGFuZC9vciBleGFtX2ZpbGUgZnJvbSBqc29uOmAsIHtcbiAgICAgICAgICAgICAgICB0ZXN0TmFtZVdpdGhFeHQsXG4gICAgICAgICAgICAgICAgZXhhbU5hbWVXaXRoRXh0XG4gICAgICAgICAgICB9LCAnLCBkZWZhdWx0aW5nIHRvIFwiZnVyX2VsaXNlX0IuW2V4dF1cIicpO1xuICAgICAgICAgICAgdGVzdE5hbWVXaXRoRXh0ID0gJ2Z1cl9lbGlzZV9CLnRlc3QnO1xuICAgICAgICAgICAgZXhhbU5hbWVXaXRoRXh0ID0gJ2Z1cl9lbGlzZV9CLmV4YW0nO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3ViY29uZmlnKHRlc3ROYW1lV2l0aEV4dCk7XG4gICAgICAgIHRoaXMuc2V0U3ViY29uZmlnKGV4YW1OYW1lV2l0aEV4dCk7XG4gICAgICAgIC8vIHRoaXMudGVzdCA9IG5ldyBTdWJjb25maWcodGVzdE5hbWVXaXRoRXh0KTtcbiAgICAgICAgLy8gdGhpcy5leGFtID0gbmV3IFN1YmNvbmZpZyhleGFtTmFtZVdpdGhFeHQpO1xuICAgICAgICB0aGlzLnN1YmplY3RzID0gdGhpcy5zdWJqZWN0czsgLy8gdG8gZW5zdXJlIGhhdmluZyBzdWJjb25maWcncyBzdWJqZWN0c1xuICAgICAgICBpZiAoIGRvRnNDaGVja3VwICkge1xuICAgICAgICAgICAgUHJvbWlzZS5hbGwoWyB0aGlzLnRlc3QuZG9UeHRGaWxlc0NoZWNrKCksIHRoaXMuZXhhbS5kb1R4dEZpbGVzQ2hlY2soKSBdKVxuICAgICAgICAgICAgICAgICAgIC5jYXRjaChhc3luYyByZWFzb24gPT4ge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50V2luZG93ID0gZ2V0Q3VycmVudFdpbmRvdygpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICBpZiAoICFjdXJyZW50V2luZG93LndlYkNvbnRlbnRzLmlzRGV2VG9vbHNPcGVuZWQoKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRXaW5kb3cud2ViQ29udGVudHMub3BlbkRldlRvb2xzKHsgbW9kZSA6IFwidW5kb2NrZWRcIiB9KVxuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEJpZ0NvbmZpZ0NscyBjdG9yLCBlcnJvciB3aGVuIGRvRnNDaGVja3VwOmAsIHJlYXNvbik7XG4gICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IE15QWxlcnQuYmlnLmVycm9yKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlIDogYEFuIGVycm9yIG9jY3VyZWQgd2hlbiBtYWtpbmcgc3VyZSBhbGwgdHJ1dGggdHh0IGZpbGVzIGV4aXN0LiBUcmllZCB0byBjaGVjazogJHt0aGlzLnRlc3QudHJ1dGgubmFtZX0gYW5kICR7dGhpcy5leGFtLnRydXRoLm5hbWV9LmAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sIDogcmVhc29uLFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRW1wdHlEaXJzKFwic3ViamVjdHNcIik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSByZW1vdmVFbXB0eURpcnMoLi4uZGlyczogKFwic3ViamVjdHNcIilbXSkge1xuICAgICAgICBpZiAoIGRpcnMuaW5jbHVkZXMoXCJzdWJqZWN0c1wiKSApIHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRTdWJqZWN0cyA9IHRoaXMuc3ViamVjdHM7XG4gICAgICAgICAgICBmb3IgKCBsZXQgc3ViamRpciBvZiBmcy5yZWFkZGlyU3luYyhTVUJKRUNUU19QQVRIX0FCUykgKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3ViamRpckFicyA9IHBhdGguam9pbihTVUJKRUNUU19QQVRIX0FCUywgc3ViamRpcik7XG4gICAgICAgICAgICAgICAgaWYgKCAhY3VycmVudFN1YmplY3RzLmluY2x1ZGVzKHN1YmpkaXIpICkge1xuICAgICAgICAgICAgICAgICAgICBpZ25vcmVFcnIoKCkgPT4gbXlmcy5yZW1vdmVFbXB0eURpcnMoc3ViamRpckFicykpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKCBsZXQgc3ViZGlyIG9mIGZzLnJlYWRkaXJTeW5jKHN1YmpkaXJBYnMpICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWdub3JlRXJyKCgpID0+IG15ZnMucmVtb3ZlRW1wdHlEaXJzKHBhdGguam9pbihzdWJqZGlyQWJzLCBzdWJkaXIpKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZzogSVN1YmNvbmZpZywgZXhwZXJpbWVudFR5cGU6IEV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ0JpZ0NvbmZpZ0NscyB1c2VkIGZyb21TYXZlZENvbmZpZy4gSW1wb3NzaWJsZSB0byBsb2FkIGJpZyBmaWxlLiBSZXR1cm5pbmcnKTtcbiAgICAgICAgLyppZiAoIERSWVJVTiApIHJldHVybiBjb25zb2xlLmxvZyhgZnJvbVNhdmVkQ29uZmlnLCBEUllSVU5gKTtcbiAgICAgICAgIGNvbnN0IHRydXRoRmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKHNhdmVkQ29uZmlnLnRydXRoX2ZpbGVfcGF0aCwgJy50eHQnKTtcbiAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKHBhdGguam9pbihUUlVUSFNfUEFUSF9BQlMsIHRydXRoRmlsZU5hbWUpKTtcbiAgICAgICAgIHRoaXMuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgICB0aGlzLmNvbmZpZyhleHBlcmltZW50VHlwZSkuZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnKTsqL1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipAZXhhbXBsZVxuICAgICB1cGRhdGUoJ3N1YmplY3RzJywgW25hbWVzXSlcbiAgICAgKi9cbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywga3ZQYWlyczogUGFydGlhbDxJQmlnQ29uZmlnPilcbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywgdmFsdWVzOiBhbnlbXSlcbiAgICB1cGRhdGUoSywga3YpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdCaWdDb25maWcudXBkYXRlKCkgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBpZiAoIEFycmF5LmlzQXJyYXkoVikgKSB7XG4gICAgICAgICAgICBsZXQgbmV3VmFsdWU6IGFueVtdID0gVjtcbiAgICAgICAgICAgIGlmICggQXJyYXkuaXNBcnJheShrdikgKSB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWUucHVzaCguLi5rdik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlLnB1c2goa3YpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgbmV3VmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihWLCBrdik7XG4gICAgICAgICAgICB0aGlzLnNldChLLCBWKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXQoSyk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBsYXN0X3BhZ2UoKTogUGFnZU5hbWUge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2xhc3RfcGFnZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbGFzdF9wYWdlKHBhZ2U6IFBhZ2VOYW1lKSB7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB2YWxpZHBhZ2VzID0gWyBcIm5ld1wiLCBcInJ1bm5pbmdcIiwgXCJyZWNvcmRcIiwgXCJmaWxlX3Rvb2xzXCIsIFwic2V0dGluZ3NcIiBdO1xuICAgICAgICBpZiAoICF2YWxpZHBhZ2VzLmluY2x1ZGVzKHBhZ2UpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGFzdF9wYWdlKFwiJHtwYWdlfVwiKSwgbXVzdCBiZSBvbmUgb2YgJHt2YWxpZHBhZ2VzLmpvaW4oJywgJyl9LiBzZXR0aW5nIHRvIG5ld2ApO1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xhc3RfcGFnZScsICduZXcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCBwYWdlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkXG4gICAgICogU2hvdWxkIGJlIHVzZWQgaW5zdGVhZCBvZiBTdWJjb25maWcgY29uc3RydWN0b3IuXG4gICAgICogVXBkYXRlcyBgZXhhbV9maWxlYCBvciBgdGVzdF9maWxlYCwgaW4gZmlsZSBhbmQgaW4gY2FjaGUuIEFsc28gaW5pdGlhbGl6ZXMgYW5kIGNhY2hlcyBhIG5ldyBTdWJjb25maWcgKHRoaXMuZXhhbSA9IG5ldyBTdWJjb25maWcoLi4uKSkuICovXG4gICAgc2V0U3ViY29uZmlnKG5hbWVXaXRoRXh0OiBzdHJpbmcsIHN1YmNvbmZpZz86IFN1YmNvbmZpZykge1xuICAgICAgICAvLyBjb25zdCBbIGZpbGVuYW1lLCBleHQgXSA9IG15ZnMuc3BsaXRfZXh0KG5hbWVXaXRoRXh0KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIFN1YmNvbmZpZy52YWxpZGF0ZU5hbWUobmFtZVdpdGhFeHQpO1xuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIGlmICggZS5tZXNzYWdlID09PSAnRXh0ZW5zaW9uRXJyb3InICkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oYHNldCBzZXRTdWJjb25maWcgKCR7bmFtZVdpdGhFeHR9KSBoYXMgbm8gZXh0ZW5zaW9uLCBvciBleHQgaXMgYmFkLiBub3Qgc2V0dGluZ2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCBlLm1lc3NhZ2UgPT09ICdCYXNlbmFtZUVycm9yJyApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUobmFtZVdpdGhFeHQpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0U3ViY29uZmlnKCR7bmFtZVdpdGhFeHR9KSwgcGFzc2VkIGEgcGF0aCAod2l0aCBzbGFoZXMpLiBuZWVkIG9ubHkgYSBiYXNlbmFtZS5leHQuIGNvbnRpbnVpbmcgd2l0aCBvbmx5IGJhc2VuYW1lOiAke2Jhc2VuYW1lfWApO1xuICAgICAgICAgICAgICAgIG5hbWVXaXRoRXh0ID0gYmFzZW5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKG5hbWVXaXRoRXh0KTtcbiAgICAgICAgLy8vLyBFeHRlbnNpb24gYW5kIGZpbGUgbmFtZSBva1xuICAgICAgICBjb25zdCBzdWJjZmdUeXBlID0gZXh0LnNsaWNlKDEpIGFzIEV4cGVyaW1lbnRUeXBlO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHN1YmNvbmZpZ0tleSA9IGAke3N1YmNmZ1R5cGV9X2ZpbGVgIGFzIFwiZXhhbV9maWxlXCIgfCBcInRlc3RfZmlsZVwiO1xuICAgICAgICAvLy8vIHRoaXMuc2V0KCdleGFtX2ZpbGUnLCAnZnVyX2VsaXNlX0IuZXhhbScpXG4gICAgICAgIHRoaXMuc2V0KHN1YmNvbmZpZ0tleSwgbmFtZVdpdGhFeHQpO1xuICAgICAgICB0aGlzLmNhY2hlW3N1YmNvbmZpZ0tleV0gPSBuYW1lV2l0aEV4dDtcbiAgICAgICAgY29uc29sZS5sb2coYHNldFN1YmNvbmZpZ2AsIHtcbiAgICAgICAgICAgIG5hbWVXaXRoRXh0LFxuICAgICAgICAgICAgc3ViY29uZmlnLFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vLy8gdGhpcy5leGFtID0gbmV3IFN1YmNvbmZpZygnZnVyX2VsaXNlX0IuZXhhbScsIHN1YmNvbmZpZylcbiAgICAgICAgdGhpc1tzdWJjZmdUeXBlXSA9IG5ldyBTdWJjb25maWcobmFtZVdpdGhFeHQsIHN1YmNvbmZpZylcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0U3ViY29uZmlnKCk6IFN1YmNvbmZpZyB7XG4gICAgICAgIHJldHVybiB0aGlzW3RoaXMuZXhwZXJpbWVudF90eXBlXVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkXG4gICAgICogUmV0dXJucyB0aGUgZXhhbSBmaWxlIG5hbWUgaW5jbHVkaW5nIGV4dGVuc2lvbiovXG4gICAgZ2V0IGV4YW1fZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsICdleGFtX2ZpbGUnKTtcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuZ2V0KCdleGFtX2ZpbGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqVXBkYXRlcyBleGFtX2ZpbGUgYW5kIGFsc28gaW5pdGlhbGl6ZXMgbmV3IFN1YmNvbmZpZyovXG4gICAgc2V0IGV4YW1fZmlsZShuYW1lV2l0aEV4dDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3ViY29uZmlnKG5hbWVXaXRoRXh0KVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkXG4gICAgICogUmV0dXJucyB0aGUgdGVzdCBmaWxlIG5hbWUgaW5jbHVkaW5nIGV4dGVuc2lvbiovXG4gICAgZ2V0IHRlc3RfZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsICd0ZXN0X2ZpbGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIFVwZGF0ZXMgdGVzdF9maWxlIGFuZCBhbHNvIGluaXRpYWxpemVzIG5ldyBTdWJjb25maWcqL1xuICAgIHNldCB0ZXN0X2ZpbGUobmFtZVdpdGhFeHQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldFN1YmNvbmZpZyhuYW1lV2l0aEV4dClcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIENhbiBiZSBnb3R0ZW4gYWxzbyB3aXRoIGBzdWJjb25maWcudHlwZWAqL1xuICAgIGdldCBleHBlcmltZW50X3R5cGUoKTogRXhwZXJpbWVudFR5cGUge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiZXhwZXJpbWVudF90eXBlXCIpXG4gICAgICAgIC8qaWYgKCB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgY29uc3QgZXhwZXJpbWVudFR5cGUgPSB0aGlzLmdldCgnZXhwZXJpbWVudF90eXBlJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgcmV0dXJuIGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZTtcbiAgICAgICAgIH0qL1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgZXhwZXJpbWVudF90eXBlKGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBpZiAoICFbICdleGFtJywgJ3Rlc3QnIF0uaW5jbHVkZXMoZXhwZXJpbWVudFR5cGUpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBCaWdDb25maWcgZXhwZXJpbWVudF90eXBlIHNldHRlciwgZ290IGV4cGVyaW1lbnRUeXBlOiAnJHtleHBlcmltZW50VHlwZX0nLiBNdXN0IGJlIGVpdGhlciAndGVzdCcgb3IgJ2V4YW0nLiBzZXR0aW5nIHRvIHRlc3RgKTtcbiAgICAgICAgICAgIGV4cGVyaW1lbnRUeXBlID0gJ3Rlc3QnO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KCdleHBlcmltZW50X3R5cGUnLCBleHBlcmltZW50VHlwZSk7XG4gICAgICAgIHRoaXMuY2FjaGUuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgZ2V0IHN1YmplY3RzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdzdWJqZWN0cycpO1xuICAgIH1cbiAgICBcbiAgICAvKipFbnN1cmVzIGhhdmluZyBgdGhpcy50ZXN0LnN1YmplY3RgIGFuZCBgdGhpcy5leGFtLnN1YmplY3RgIGluIHRoZSBsaXN0IHJlZ2FyZGxlc3MqL1xuICAgIHNldCBzdWJqZWN0cyhzdWJqZWN0TGlzdDogc3RyaW5nW10pIHtcbiAgICAgICAgLy8gVE9ETzogY2hlY2sgZm9yIG5vbiBleGlzdGluZyBmcm9tIGZpbGVzXG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2Fybignc2V0IHN1YmplY3RzLCBEUllSVU4uIHJldHVybmluZycpXG4gICAgICAgIH1cbiAgICAgICAgc3ViamVjdExpc3QucHVzaCh0aGlzLnRlc3Quc3ViamVjdCk7XG4gICAgICAgIHN1YmplY3RMaXN0LnB1c2godGhpcy5leGFtLnN1YmplY3QpO1xuICAgICAgICBjb25zdCBzdWJqZWN0cyA9IFsgLi4ubmV3IFNldChzdWJqZWN0TGlzdCkgXS5maWx0ZXIoYm9vbCk7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgc3ViamVjdHMgfSk7XG4gICAgICAgIGZvciAoIGxldCBzIG9mIHN1YmplY3RzICkge1xuICAgICAgICAgICAgbXlmcy5jcmVhdGVJZk5vdEV4aXN0cyhwYXRoLmpvaW4oU1VCSkVDVFNfUEFUSF9BQlMsIHMpKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3RzJywgc3ViamVjdHMpO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLy8gZ2V0IGRldigpOiB7IFtLIGluIGtleW9mIERldk9wdGlvbnNdOiBEZXZPcHRpb25zW0tdIGV4dGVuZHMgb2JqZWN0ID8geyBbU0sgaW4ga2V5b2YgRGV2T3B0aW9uc1tLXV06ICgpID0+IERldk9wdGlvbnNbS11bU0tdIH0gOiAoKSA9PiBEZXZPcHRpb25zW0tdIH0ge1xuICAgIGdldCBkZXYoKTogeyBbSyBpbiBrZXlvZiBEZXZPcHRpb25zXTogKHdoZXJlPzogc3RyaW5nKSA9PiBEZXZPcHRpb25zW0tdIH0ge1xuICAgICAgICBjb25zdCBfZGV2ID0gdGhpcy5nZXQoJ2RldicpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaGFuZGxlQm9vbGVhbiA9IDxLIGV4dGVuZHMga2V5b2YgRGV2T3B0aW9ucz4oa2V5OiBLLCB3aGVyZSk6IERldk9wdGlvbnNbS10gPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJylba2V5XTtcbiAgICAgICAgICAgIGlmICggdmFsdWUgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuJHtrZXl9ICR7d2hlcmV9YCk7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmb3JjZV9ub3Rlc19udW1iZXIgOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCBfZGV2ICkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmb3JjZV9ub3Rlc19udW1iZXIgPSB0aGlzLmdldCgnZGV2b3B0aW9ucycpLmZvcmNlX25vdGVzX251bWJlcjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBmb3JjZV9ub3Rlc19udW1iZXIgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuZm9yY2Vfbm90ZXNfbnVtYmVyOiAke2ZvcmNlX25vdGVzX251bWJlcn1gKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZvcmNlX25vdGVzX251bWJlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZm9yY2VfcGxheWJhY2tfcmF0ZSA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIF9kZXYgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZvcmNlX3BsYXliYWNrX3JhdGUgPSB0aGlzLmdldCgnZGV2b3B0aW9ucycpLmZvcmNlX3BsYXliYWNrX3JhdGU7XG4gICAgICAgICAgICAgICAgICAgIGlmICggZm9yY2VfcGxheWJhY2tfcmF0ZSApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5mb3JjZV9wbGF5YmFja19yYXRlOiAke2ZvcmNlX3BsYXliYWNrX3JhdGV9YCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmb3JjZV9wbGF5YmFja19yYXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNpbXVsYXRlX3Rlc3RfbW9kZSA6ICh3aGVyZT86IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVCb29sZWFuKFwic2ltdWxhdGVfdGVzdF9tb2RlXCIsIHdoZXJlKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zdCBzaW11bGF0ZV90ZXN0X21vZGUgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2ltdWxhdGVfdGVzdF9tb2RlO1xuICAgICAgICAgICAgICAgIC8vIGlmICggc2ltdWxhdGVfdGVzdF9tb2RlICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNpbXVsYXRlX3Rlc3RfbW9kZSAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIC8vIHJldHVybiBzaW11bGF0ZV90ZXN0X21vZGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaW11bGF0ZV9hbmltYXRpb25fbW9kZSA6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVCb29sZWFuKFwic2ltdWxhdGVfYW5pbWF0aW9uX21vZGVcIiwgd2hlcmUpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnN0IHNpbXVsYXRlX2FuaW1hdGlvbl9tb2RlID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNpbXVsYXRlX2FuaW1hdGlvbl9tb2RlO1xuICAgICAgICAgICAgICAgIC8vIGlmICggc2ltdWxhdGVfYW5pbWF0aW9uX21vZGUgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2ltdWxhdGVfYW5pbWF0aW9uX21vZGUgJHt3aGVyZX1gKTtcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gc2ltdWxhdGVfYW5pbWF0aW9uX21vZGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaW11bGF0ZV92aWRlb19tb2RlIDogKHdoZXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2ltdWxhdGVfdmlkZW9fbW9kZSA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5zaW11bGF0ZV92aWRlb19tb2RlO1xuICAgICAgICAgICAgICAgIGlmICggc2ltdWxhdGVfdmlkZW9fbW9kZSApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5zaW11bGF0ZV92aWRlb19tb2RlICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNpbXVsYXRlX3ZpZGVvX21vZGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBza2lwX2ZhZGUgOiAod2hlcmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwX2ZhZGUgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9mYWRlO1xuICAgICAgICAgICAgICAgIGlmICggc2tpcF9mYWRlICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNraXBfZmFkZSAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX2ZhZGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBtdXRlX2FuaW1hdGlvbiA6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG11dGVfYW5pbWF0aW9uID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLm11dGVfYW5pbWF0aW9uO1xuICAgICAgICAgICAgICAgIGlmICggbXV0ZV9hbmltYXRpb24gKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMubXV0ZV9hbmltYXRpb24gJHt3aGVyZX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbXV0ZV9hbmltYXRpb247XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2tpcF9taWRpX2V4aXN0c19jaGVjayA6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfbWlkaV9leGlzdHNfY2hlY2sgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9taWRpX2V4aXN0c19jaGVjaztcbiAgICAgICAgICAgICAgICBpZiAoIHNraXBfbWlkaV9leGlzdHNfY2hlY2sgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF9taWRpX2V4aXN0c19jaGVjayAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX21pZGlfZXhpc3RzX2NoZWNrO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNraXBfZXhwZXJpbWVudF9pbnRybyA6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfZXhwZXJpbWVudF9pbnRybyA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX2V4cGVyaW1lbnRfaW50cm87XG4gICAgICAgICAgICAgICAgaWYgKCBza2lwX2V4cGVyaW1lbnRfaW50cm8gKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF9leHBlcmltZW50X2ludHJvICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfZXhwZXJpbWVudF9pbnRybztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBza2lwX2xldmVsX2ludHJvIDogKHdoZXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpcF9sZXZlbF9pbnRybyA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX2xldmVsX2ludHJvO1xuICAgICAgICAgICAgICAgIGlmICggc2tpcF9sZXZlbF9pbnRybyApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5za2lwX2xldmVsX2ludHJvICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfbGV2ZWxfaW50cm87XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2sgOiAod2hlcmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjayA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjaztcbiAgICAgICAgICAgICAgICBpZiAoIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrIDogKHdoZXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2sgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2s7XG4gICAgICAgICAgICAgICAgaWYgKCBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5za2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjaztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBub19yZWxvYWRfb25fc3VibWl0IDogKHdoZXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9fcmVsb2FkX29uX3N1Ym1pdCA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5ub19yZWxvYWRfb25fc3VibWl0O1xuICAgICAgICAgICAgICAgIGlmICggbm9fcmVsb2FkX29uX3N1Ym1pdCApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5ub19yZWxvYWRfb25fc3VibWl0ICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vX3JlbG9hZF9vbl9zdWJtaXQ7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBnZXQgdmVsb2NpdGllcygpIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCBcInZlbG9jaXRpZXNcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IHZlbG9jaXRpZXModmFsOiBudW1iZXIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGZsb29yZWQgPSBNYXRoLmZsb29yKHZhbCk7XG4gICAgICAgICAgICBpZiAoIGlzTmFOKGZsb29yZWQpICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IHZlbG9jaXRpZXMsIE1hdGguZmxvb3IodmFsKSBpcyBOYU46YCwgeyB2YWwsIGZsb29yZWQgfSwgJy4gbm90IHNldHRpbmcnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCBmbG9vcmVkID49IDEgJiYgZmxvb3JlZCA8PSAxNiApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXQoJ3ZlbG9jaXRpZXMnLCBmbG9vcmVkKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWNoZS52ZWxvY2l0aWVzID0gZmxvb3JlZDtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgdmVsb2NpdGllcywgYmFkIHJhbmdlOiAke3ZhbH0uIG5vdCBzZXR0aW5nYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IHZlbG9jaXRpZXMsIEV4Y2VwdGlvbiB3aGVuIHRyeWluZyB0byBNYXRoLmZsb29yKHZhbCk6YCwgZSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgU3ViY29uZmlnIGV4dGVuZHMgQ29uZjxJU3ViY29uZmlnPiB7IC8vIEFLQSBDb25maWdcbiAgICBwcml2YXRlIHJlYWRvbmx5IHR5cGU6IEV4cGVyaW1lbnRUeXBlO1xuICAgIHJlYWRvbmx5IGNhY2hlOiBQYXJ0aWFsPElTdWJjb25maWc+O1xuICAgIHRydXRoOiBUcnV0aDtcbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBAcGFyYW0gbmFtZVdpdGhFeHQgLSBzZXRzIHRoZSBgbmFtZWAgZmllbGQgaW4gZmlsZVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG5hbWVXaXRoRXh0OiBzdHJpbmcsIHN1YmNvbmZpZz86IFN1YmNvbmZpZykge1xuICAgICAgICBcbiAgICAgICAgbGV0IFsgZmlsZW5hbWUsIGV4dCBdID0gbXlmcy5zcGxpdF9leHQobmFtZVdpdGhFeHQpO1xuICAgICAgICBpZiAoICFbICcuZXhhbScsICcudGVzdCcgXS5pbmNsdWRlcyhleHQpICkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTdWJjb25maWcgY3RvciAoJHtuYW1lV2l0aEV4dH0pIGhhcyBiYWQgb3Igbm8gZXh0ZW5zaW9uYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHlwZSA9IGV4dC5zbGljZSgxKSBhcyBFeHBlcmltZW50VHlwZTtcbiAgICAgICAgbGV0IGRlZmF1bHRzO1xuICAgICAgICBpZiAoIGJvb2woc3ViY29uZmlnKSApIHtcbiAgICAgICAgICAgIGlmICggc3ViY29uZmlnLnN0b3JlICkge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRzID0geyAuLi5zdWJjb25maWcuc3RvcmUsIG5hbWUgOiBuYW1lV2l0aEV4dCB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0cyA9IHN1YmNvbmZpZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlZmF1bHRzID0geyBuYW1lIDogbmFtZVdpdGhFeHQgfTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICBmaWxlRXh0ZW5zaW9uIDogdHlwZSxcbiAgICAgICAgICAgIGN3ZCA6IENPTkZJR1NfUEFUSF9BQlMsXG4gICAgICAgICAgICBjb25maWdOYW1lIDogZmlsZW5hbWUsXG4gICAgICAgICAgICBkZWZhdWx0c1xuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5jYWNoZSA9IHsgbmFtZSA6IG5hbWVXaXRoRXh0IH07XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIGlmICggYm9vbChzdWJjb25maWcpICkge1xuICAgICAgICAgICAgdGhpcy5zZXQoeyAuLi5zdWJjb25maWcuc3RvcmUsIG5hbWUgOiBuYW1lV2l0aEV4dCB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnRydXRoID0gbmV3IFRydXRoKG15ZnMucmVtb3ZlX2V4dCh0aGlzLnRydXRoX2ZpbGUpKTtcbiAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBTdWJjb25maWcgY29uc3RydWN0b3IsIGluaXRpYWxpemluZyBuZXcgVHJ1dGggZnJvbSB0aGlzLnRydXRoX2ZpbGUgdGhyZXcgYW4gZXJyb3IuIFByb2JhYmx5IGJlY2F1c2UgdGhpcy50cnV0aF9maWxlIGlzIHVuZGVmaW5lZC4gU2hvdWxkIG1heWJlIG5lc3QgdW5kZXIgaWYoc3ViY29uZmlnKSBjbGF1c2VgLCBcInRoaXMudHJ1dGhfZmlsZVwiLCB0aGlzLnRydXRoX2ZpbGUsIGUpXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgc3RhdGljIHZhbGlkYXRlTmFtZShuYW1lV2l0aEV4dDogc3RyaW5nKSB7XG4gICAgICAgIGxldCBbIGZpbGVuYW1lLCBleHQgXSA9IG15ZnMuc3BsaXRfZXh0KG5hbWVXaXRoRXh0KTtcbiAgICAgICAgaWYgKCAhWyAnLmV4YW0nLCAnLnRlc3QnIF0uaW5jbHVkZXMoZXh0KSApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXh0ZW5zaW9uRXJyb3JgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIG5hbWVXaXRoRXh0ICE9PSBgJHtmaWxlbmFtZX0ke2V4dH1gICkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCYXNlbmFtZUVycm9yJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgYXN5bmMgZG9UeHRGaWxlc0NoZWNrKCk6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4ge1xuICAgICAgICBjb25zb2xlLmxvZyhg8J+SviBTdWJjb25maWcoJHt0aGlzLnR5cGV9KS5kb1RydXRoRmlsZUNoZWNrKClgKTtcbiAgICAgICAgaWYgKCB0aGlzLnRydXRoLnR4dC5hbGxFeGlzdCgpICkge1xuICAgICAgICAgICAgcmV0dXJuIE15QWxlcnQuc21hbGwuc3VjY2VzcyhgJHt0aGlzLnRydXRoLm5hbWV9LnR4dCwgKl9vbi50eHQsIGFuZCAqX29mZi50eHQgZmlsZXMgZXhpc3QuYCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gWydmdXJfZWxpc2VfQicgeCAzLCAnZnVyX2VsaXNlX1IudHh0JyB4IDMsIC4uLl1cbiAgICAgICAgY29uc3QgdHJ1dGhzV2l0aDNUeHRGaWxlcyA9IGdldFRydXRoc1dpdGgzVHh0RmlsZXMoKTtcbiAgICAgICAgaWYgKCAhYm9vbCh0cnV0aHNXaXRoM1R4dEZpbGVzKSApXG4gICAgICAgICAgICByZXR1cm4gTXlBbGVydC5iaWcud2FybmluZyh7XG4gICAgICAgICAgICAgICAgdGl0bGUgOiAnTm8gdmFsaWQgdHJ1dGggZmlsZXMgZm91bmQnLFxuICAgICAgICAgICAgICAgIGh0bWwgOiAnVGhlcmUgbmVlZHMgdG8gYmUgYXQgbGVhc3Qgb25lIHR4dCBmaWxlIHdpdGggb25lIFwib25cIiBhbmQgb25lIFwib2ZmXCIgY291bnRlcnBhcnRzLidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBNeUFsZXJ0LmJpZy5ibG9ja2luZyh7XG4gICAgICAgICAgICB0aXRsZSA6IGBEaWRuJ3QgZmluZCBhbGwgdGhyZWUgLnR4dCBmaWxlcyBmb3IgJHt0aGlzLnRydXRoLm5hbWV9YCxcbiAgICAgICAgICAgIGh0bWwgOiAnVGhlIGZvbGxvd2luZyB0cnV0aHMgYWxsIGhhdmUgMyB0eHQgZmlsZXMuIFBsZWFzZSBjaG9vc2Ugb25lIG9mIHRoZW0sIG9yIGZpeCB0aGUgZmlsZXMgYW5kIHJlbG9hZC4nLFxuICAgICAgICAgICAgc2hvd0Nsb3NlQnV0dG9uIDogdHJ1ZSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgc3RyaW5ncyA6IHRydXRoc1dpdGgzVHh0RmlsZXMsXG4gICAgICAgICAgICBjbGlja0ZuIDogZWwgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IGNvbmZpZyA9IHRoaXMuY29uZmlnKHRoaXMuZXhwZXJpbWVudF90eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxldmVscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRydXRoX2ZpbGUgPSBlbC50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKGVsLnRleHQoKSk7XG4gICAgICAgICAgICAgICAgICAgIHJlbG9hZFBhZ2UoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoICggZXJyICkge1xuICAgICAgICAgICAgICAgICAgICBNeUFsZXJ0LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIE15QWxlcnQuYmlnLmVycm9yKHsgdGl0bGUgOiBlcnIubWVzc2FnZSwgaHRtbCA6ICdTb21ldGhpbmcgaGFwcGVuZWQuJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBpbmNyZWFzZShLOiBrZXlvZiBJU3ViY29uZmlnKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgdXNlZCBzdWJjb25maWcuaW5jcmVhc2UsIFVOVEVTVEVEYCk7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignaW5jcmVhc2UsIERSWVJVTi4gcmV0dXJuaW5nJyk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IFYgPSB0aGlzLmdldChLKTtcbiAgICAgICAgXG4gICAgICAgIGlmICggViA9PT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuc2V0KEssIDEpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVvZlYgPSB0eXBlb2YgVjtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGlmICggdHlwZW9mViA9PT0gJ251bWJlcicgfHwgKHR5cGVvZlYgPT09ICdzdHJpbmcnICYmIFYuaXNkaWdpdCgpKSApIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoSywgTWF0aC5mbG9vcihWKSArIDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJCaWdDb25maWdDbHMgdHJpZWQgdG8gaW5jcmVhc2UgYSB2YWx1ZSB0aGF0IGlzIG5vdCBhIG51bWJlciBub3IgYSBzdHJpbmcuaXNkaWdpdCgpXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICB0b0h0bWwoKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGxldmVscyA9IHRoaXMubGV2ZWxzO1xuICAgICAgICBsZXQgbGV2ZWxzSHRtbCA9IGBcbiAgICAgICAgPHRhYmxlIGNsYXNzPVwic3ViY29uZmlnLWh0bWxcIj5cbiAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICA8dGg+TGV2ZWwgIzwvdGg+XG4gICAgICAgICAgICAgICAgPHRoPk5vdGVzPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+VHJpYWxzPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+Umh5dGhtPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+VGVtcG88L3RoPlxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgYDtcbiAgICAgICAgZm9yICggbGV0IFsgaSwgbHZsIF0gb2YgZW51bWVyYXRlKGxldmVscykgKSB7XG4gICAgICAgICAgICBsZXZlbHNIdG1sICs9IGBcbiAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICA8dGQ+JHtpICsgMX08L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD4ke2x2bC5ub3Rlc308L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD4ke2x2bC50cmlhbHN9PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQ+JHtsdmwucmh5dGhtfTwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkPiR7bHZsLnRlbXBvfTwvdGQ+XG4gICAgICAgICAgICA8L3RyPmBcbiAgICAgICAgfVxuICAgICAgICBsZXZlbHNIdG1sICs9IGA8L3RhYmxlPmA7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJzdWJjb25maWctaHRtbFwiPlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRoPktleTwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5WYWx1ZTwvdGg+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD5BbGxvd2VkIHJoeXRobSBkZXZpYXRpb248L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHt0aGlzLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbn08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+QWxsb3dlZCB0ZW1wbyBkZXZpYXRpb248L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHt0aGlzLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9ufTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD5EZW1vIHR5cGU8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHt0aGlzLmRlbW9fdHlwZX08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+RXJyb3JzIHBsYXkgcmF0ZTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3RoaXMuZXJyb3JzX3BsYXlyYXRlfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD5GaW5pc2hlZCB0cmlhbHMgY291bnQ8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHt0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudH08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+TmFtZTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3RoaXMubmFtZX08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+U3ViamVjdDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3RoaXMuc3ViamVjdH08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+VHJ1dGggZmlsZTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3RoaXMudHJ1dGhfZmlsZX08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICA8L3RhYmxlPlxuXG4gICAgICAgICAgICAke2xldmVsc0h0bWx9XG4gICAgICAgICAgICBgO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgZnJvbVN1YmNvbmZpZyhzdWJjb25maWc6IFN1YmNvbmZpZykge1xuICAgICAgICBpZiAoIERSWVJVTiApIHJldHVybiBjb25zb2xlLndhcm4oJ2Zyb21PYmosIERSWVJVTi4gcmV0dXJuaW5nJyk7XG4gICAgICAgIC8vIHRoaXMuc2V0KHN1YmNvbmZpZy50b09iaigpKTtcbiAgICAgICAgLy8gdGhpcy5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gPSBzdWJjb25maWcuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uO1xuICAgICAgICAvLyB0aGlzLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uID0gc3ViY29uZmlnLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uO1xuICAgICAgICAvLyB0aGlzLmRlbW9fdHlwZSA9IHN1YmNvbmZpZy5kZW1vX3R5cGU7XG4gICAgICAgIC8vIHRoaXMuZXJyb3JzX3BsYXlyYXRlID0gc3ViY29uZmlnLmVycm9yc19wbGF5cmF0ZTtcbiAgICAgICAgLy8gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQgPSBzdWJjb25maWcuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgICAgICAvLyB0aGlzLmxldmVscyA9IHN1YmNvbmZpZy5sZXZlbHM7XG4gICAgICAgIC8vIHRoaXMuc3ViamVjdCA9IHN1YmNvbmZpZy5zdWJqZWN0O1xuICAgICAgICAvLyB0aGlzLnRydXRoX2ZpbGUgPSBzdWJjb25maWcudHJ1dGhfZmlsZTtcbiAgICAgICAgLy8gdGhpcy5fdXBkYXRlU2F2ZWRGaWxlKCd0cnV0aF9maWxlX3BhdGgnLCBjZmdGaWxlLnRydXRoX2ZpbGVfcGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBwcml2YXRlIF91cGRhdGVTYXZlZEZpbGUoa2V5OiBrZXlvZiBJU3ViY29uZmlnLCB2YWx1ZSkge1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ191cGRhdGVTYXZlZEZpbGUsIERSWVJVTi4gcmV0dXJuaW5nJylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdfdXBkYXRlU2F2ZWRGaWxlKCkgZG9lcyBub3RoaW5nLCByZXR1cm5pbmcnKTtcbiAgICAgICAgdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIC8qY29uc3QgY29uZiA9IG5ldyAocmVxdWlyZSgnY29uZicpKSh7XG4gICAgICAgICBjd2QgOiBDT05GSUdTX1BBVEhfQUJTLFxuICAgICAgICAgY29uZmlnTmFtZSA6IHRoaXMubmFtZSxcbiAgICAgICAgIGZpbGVFeHRlbnNpb24gOiB0aGlzLnR5cGUsXG4gICAgICAgICBzZXJpYWxpemUgOiB2YWx1ZSA9PiBKU09OLnN0cmluZ2lmeSh2YWx1ZSwgbnVsbCwgNClcbiAgICAgICAgIH0pO1xuICAgICAgICAgY29uZi5zZXQoa2V5LCB2YWx1ZSk7Ki9cbiAgICB9XG4gICAgXG4gICAgXG4gICAgcHJpdmF0ZSBzZXREZXZpYXRpb24oZGV2aWF0aW9uVHlwZTogRGV2aWF0aW9uVHlwZSwgZGV2aWF0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdHlwZW9mRGV2aWF0aW9uID0gdHlwZW9mIGRldmlhdGlvbjtcbiAgICAgICAgaWYgKCB0eXBlb2ZEZXZpYXRpb24gPT09ICdudW1iZXInICkge1xuICAgICAgICAgICAgZGV2aWF0aW9uID0gYCR7ZGV2aWF0aW9ufSVgO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXREZXZpYXRpb24gZ290IFwiZGV2aWF0aW9uXCIgdHlwZSBudW1iZXIuIGFwcGVuZGVkIFwiJVwiLiBkZXZpYXRpb24gbm93OiAke2RldmlhdGlvbn1gKTtcbiAgICAgICAgfSBlbHNlIGlmICggdHlwZW9mRGV2aWF0aW9uID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICAgIGlmICggIWRldmlhdGlvbi5lbmRzV2l0aChcIiVcIikgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXREZXZpYXRpb24gZ290IGRldmlhdGlvbiB3aXRob3V0ICUuIGFwcGVuZGVkICUuIGRldmlhdGlvbiBub3c6IFwiJHtkZXZpYXRpb259XCJgKTtcbiAgICAgICAgICAgICAgICBkZXZpYXRpb24gPSBgJHtkZXZpYXRpb259JWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldERldmlhdGlvbiwgcmVjZWl2ZWQgXCJkZXZpYXRpb25cIiBub3Qgc3RyaW5nIG5vdCBudW1iZXIuIHJldHVybmluZy4gZGV2aWF0aW9uOmAsIGRldmlhdGlvbik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpcy5zZXQoYGFsbG93ZWRfJHtkZXZpYXRpb25UeXBlfV9kZXZpYXRpb25gLCBkZXZpYXRpb24pO1xuICAgICAgICB0aGlzLmNhY2hlW2BhbGxvd2VkXyR7ZGV2aWF0aW9uVHlwZX1fZGV2aWF0aW9uYF0gPSBkZXZpYXRpb247XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiYWxsb3dlZF90ZW1wb19kZXZpYXRpb25cIilcbiAgICAgICAgLyppZiAoIHRoaXMuY2FjaGUuYWxsb3dlZF90ZW1wb19kZXZpYXRpb24gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgIGNvbnN0IGFsbG93ZWRUZW1wb0RldmlhdGlvbiA9IHRoaXMuZ2V0KCdhbGxvd2VkX3RlbXBvX2RldmlhdGlvbicpO1xuICAgICAgICAgdGhpcy5jYWNoZS5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbiA9IGFsbG93ZWRUZW1wb0RldmlhdGlvbjtcbiAgICAgICAgIHJldHVybiBhbGxvd2VkVGVtcG9EZXZpYXRpb247XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuYWxsb3dlZF90ZW1wb19kZXZpYXRpb247XG4gICAgICAgICB9Ki9cbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uKGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0RGV2aWF0aW9uKFwidGVtcG9cIiwgZGV2aWF0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0IGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uXCIpO1xuICAgICAgICAvKmlmICggdGhpcy5jYWNoZS5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgIGNvbnN0IGFsbG93ZWRSaHl0aG1EZXZpYXRpb24gPSB0aGlzLmdldCgnYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbiA9IGFsbG93ZWRSaHl0aG1EZXZpYXRpb247XG4gICAgICAgICByZXR1cm4gYWxsb3dlZFJoeXRobURldmlhdGlvbjtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb247XG4gICAgICAgICB9Ki9cbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbihkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldERldmlhdGlvbihcInJoeXRobVwiLCBkZXZpYXRpb24pO1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBnZXQgZGVtb190eXBlKCk6IERlbW9UeXBlIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCBcImRlbW9fdHlwZVwiKTtcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuZ2V0KCdkZW1vX3R5cGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IGRlbW9fdHlwZSh0eXBlOiBEZW1vVHlwZSkge1xuICAgICAgICBpZiAoICFbICd2aWRlbycsICdhbmltYXRpb24nIF0uaW5jbHVkZXModHlwZSkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYENvbmZpZyBkZW1vX3R5cGUgc2V0dGVyLCBiYWQgdHlwZSA9ICR7dHlwZX0sIGNhbiBiZSBlaXRoZXIgdmlkZW8gb3IgYW5pbWF0aW9uLiBOb3Qgc2V0dGluZ2ApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2RlbW9fdHlwZScsIHR5cGUpO1xuICAgICAgICAgICAgdGhpcy5jYWNoZS5kZW1vX3R5cGUgPSB0eXBlO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldCBlcnJvcnNfcGxheXJhdGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdlcnJvcnNfcGxheXJhdGUnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGVycm9yc19wbGF5cmF0ZShzcGVlZDogbnVtYmVyKSB7XG4gICAgICAgIGlmICggaXNOYU4oc3BlZWQpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBjb25maWcgc2V0IGVycm9yc19wbGF5cmF0ZSwgcmVjZWl2ZWQgYmFkIFwic3BlZWRcIiBOYU46ICR7c3BlZWR9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZXJyb3JzX3BsYXlyYXRlJywgc3BlZWQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBnZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnZmluaXNoZWRfdHJpYWxzX2NvdW50Jyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBmaW5pc2hlZF90cmlhbHNfY291bnQoY291bnQ6IG51bWJlcikge1xuICAgICAgICBpZiAoIGlzTmFOKGNvdW50KSB8fCBjb3VudCA8IDAgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGNvbmZpZyBzZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50LCByZWNlaXZlZCBiYWQgXCJjb3VudFwiOiAke2NvdW50fWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2ZpbmlzaGVkX3RyaWFsc19jb3VudCcsIGNvdW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipOYW1lIG9mIGNvbmZpZyBmaWxlLCBpbmNsdWRpbmcgZXh0ZW5zaW9uLiBBbHdheXMgcmV0dXJucyBgbmFtZWAgZnJvbSBjYWNoZS4gVGhpcyBpcyBiZWNhdXNlIHRoZXJlJ3Mgbm8gc2V0dGVyOyBgbmFtZWAgaXMgc3RvcmVkIGluIGNhY2hlIGF0IGNvbnN0cnVjdG9yLiovXG4gICAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUubmFtZTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IHN1YmplY3QoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdzdWJqZWN0Jyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBzdWJqZWN0KG5hbWU6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdzZXQgc3ViamVjdCwgRFJZUlVOLiBSZXR1cm5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoICFib29sKG5hbWUpICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2Fybihgc2V0IHN1YmplY3QsICFib29sKG5hbWUpOiAke25hbWV9LiBSZXR1cm5pbmdgKVxuICAgICAgICB9XG4gICAgICAgIG5hbWUgPSBuYW1lLmxvd2VyKCk7XG4gICAgICAgIHRoaXMuc2V0KCdzdWJqZWN0JywgbmFtZSk7XG4gICAgICAgIGNvbnN0IEdsb2IgPSByZXF1aXJlKCcuLi9HbG9iJykuZGVmYXVsdDtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdTdWJqZWN0cyA9IEdsb2IuQmlnQ29uZmlnLnN1YmplY3RzLmZpbHRlcihib29sKTtcbiAgICAgICAgY29uc29sZS5sb2coeyBleGlzdGluZ1N1YmplY3RzIH0pO1xuICAgICAgICBcbiAgICAgICAgR2xvYi5CaWdDb25maWcuc3ViamVjdHMgPSBbIC4uLm5ldyBTZXQoWyAuLi5leGlzdGluZ1N1YmplY3RzLCBuYW1lIF0pIF07XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWRcbiAgICAgKiBUcnV0aCBmaWxlIG5hbWUsIG5vIGV4dGVuc2lvbiovXG4gICAgZ2V0IHRydXRoX2ZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCAndHJ1dGhfZmlsZScpO1xuICAgICAgICAvLyByZXR1cm4gdGhpcy5nZXQoJ3RydXRoX2ZpbGUnKVxuICAgIH1cbiAgICBcbiAgICAvKipBbHNvIHNldHMgdGhpcy50cnV0aCAobWVtb3J5KVxuICAgICAqIEBjYWNoZWRcbiAgICAgKiBAcGFyYW0gdHJ1dGhfZmlsZSAtIFRydXRoIGZpbGUgbmFtZSwgbm8gZXh0ZW5zaW9uKi9cbiAgICBzZXQgdHJ1dGhfZmlsZSh0cnV0aF9maWxlOiBzdHJpbmcpIHtcbiAgICAgICAgLy8gdHJ1dGhfZmlsZSA9IHBhdGguYmFzZW5hbWUodHJ1dGhfZmlsZSk7XG4gICAgICAgIGxldCBbIG5hbWUsIGV4dCBdID0gbXlmcy5zcGxpdF9leHQodHJ1dGhfZmlsZSk7XG4gICAgICAgIGlmICggYm9vbChleHQpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgdHJ1dGhfZmlsZSwgcGFzc2VkIG5hbWUgaXMgbm90IGV4dGVuc2lvbmxlc3M6ICR7dHJ1dGhfZmlsZX0uIENvbnRpbnVpbmcgd2l0aCBcIiR7bmFtZX1cImApO1xuICAgICAgICAgICAgLy8gbmFtZU5vRXh0ID0gbXlmcy5yZW1vdmVfZXh0KG5hbWVOb0V4dCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgdHJ1dGggPSBuZXcgVHJ1dGgobmFtZSk7XG4gICAgICAgICAgICBpZiAoICF0cnV0aC50eHQuYWxsRXhpc3QoKSApIHtcbiAgICAgICAgICAgICAgICBNeUFsZXJ0LnNtYWxsLndhcm5pbmcoYE5vdCBhbGwgdHh0IGZpbGVzIGV4aXN0OiAke25hbWV9YClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudHJ1dGggPSB0cnV0aDtcbiAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgICAgICBNeUFsZXJ0LnNtYWxsLndhcm5pbmcoZSk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oZSlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldChgdHJ1dGhfZmlsZWAsIG5hbWUpO1xuICAgICAgICB0aGlzLmNhY2hlLnRydXRoX2ZpbGUgPSBuYW1lO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBsZXZlbHMoKTogSUxldmVsW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2xldmVscycpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbGV2ZWxzKGxldmVsczogSUxldmVsW10pIHtcbiAgICAgICAgaWYgKCAhQXJyYXkuaXNBcnJheShsZXZlbHMpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGV2ZWxzLCByZWNlaXZlZCBcImxldmVsc1wiIG5vdCBpc0FycmF5LiBub3Qgc2V0dGluZyBhbnl0aGluZy4gbGV2ZWxzOiBgLCBsZXZlbHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVE9ETzogYmV0dGVyIGNoZWNrc1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xldmVscycsIGxldmVscyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgY3VycmVudFRyaWFsQ29vcmRzKCk6IFsgbnVtYmVyLCBudW1iZXIgXSB7XG4gICAgICAgIGxldCBmbGF0VHJpYWxzTGlzdCA9IHRoaXMubGV2ZWxzLm1hcChsZXZlbCA9PiBsZXZlbC50cmlhbHMpO1xuICAgICAgICBmb3IgKCBsZXQgWyBsZXZlbEluZGV4LCB0cmlhbHNOdW0gXSBvZiBlbnVtZXJhdGUoZmxhdFRyaWFsc0xpc3QpICkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgdHJpYWxTdW1Tb0ZhciA9IHN1bShmbGF0VHJpYWxzTGlzdC5zbGljZSgwLCBsZXZlbEluZGV4ICsgMSkpO1xuICAgICAgICAgICAgY29uc3QgZmluaXNoZWRUcmlhbHNDb3VudCA9IHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgICAgICAgICAgaWYgKCB0cmlhbFN1bVNvRmFyID4gZmluaXNoZWRUcmlhbHNDb3VudCApXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsgbGV2ZWxJbmRleCwgdHJpYWxzTnVtIC0gKHRyaWFsU3VtU29GYXIgLSBmaW5pc2hlZFRyaWFsc0NvdW50KSBdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUud2FybihcImN1cnJlbnRUcmlhbENvb3Jkczogb3V0IG9mIGluZGV4IGVycm9yXCIpO1xuICAgIH1cbiAgICBcbiAgICBpc0RlbW9WaWRlbygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVtb190eXBlID09PSAndmlkZW8nO1xuICAgIH1cbiAgICBcbiAgICBpc1dob2xlVGVzdE92ZXIoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBzdW0odGhpcy5sZXZlbHMubWFwKGxldmVsID0+IGxldmVsLnRyaWFscykpID09IHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgZ2V0U3ViamVjdERpck5hbWVzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIGZzLnJlYWRkaXJTeW5jKFNVQkpFQ1RTX1BBVEhfQUJTKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0Q3VycmVudExldmVsKCk6IExldmVsIHtcbiAgICAgICAgXG4gICAgICAgIGxldCBbIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCBdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBMZXZlbCh0aGlzLmxldmVsc1tsZXZlbF9pbmRleF0sIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldExldmVsQ29sbGVjdGlvbigpOiBMZXZlbENvbGxlY3Rpb24ge1xuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIHJldHVybiBuZXcgTGV2ZWxDb2xsZWN0aW9uKHRoaXMubGV2ZWxzLCBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXgpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZFxuICAgICAqIEdldHMgdGhlIGN1cnJlbnQgdHJpYWwncyBwYXRoIChqb2luIHRoaXMudGVzdE91dFBhdGgoKSBhbmQgbGV2ZWxfJHtsZXZlbF9pbmRleH0uLi4pLCBhbmQgcmV0dXJucyBhIFRydXRoIG9mIGl0Ki9cbiAgICBjcmVhdGVUcnV0aEZyb21UcmlhbFJlc3VsdCgpOiBUcnV0aCB7XG4gICAgICAgIGNvbnNvbGUud2FybihgVGhpcyBzaG91bGQgYmUgc29tZXdoZXJlIGVsc2VgKTtcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICAvLyByZXR1cm4gbmV3IFRydXRoKHBhdGguam9pbih0aGlzLnRlc3RPdXRQYXRoKCksIGBsZXZlbF8ke2xldmVsX2luZGV4fV90cmlhbF8ke3RyaWFsX2luZGV4fWApKTtcbiAgICAgICAgcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odGhpcy5leHBlcmltZW50T3V0RGlyQWJzKCksIGBsZXZlbF8ke2xldmVsX2luZGV4fV90cmlhbF8ke3RyaWFsX2luZGV4fWApKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXCJjOlxcU3luY1xcQ29kZVxcUHl0aG9uXFxQeWFuby1yZWxlYXNlXFxzcmNcXGV4cGVyaW1lbnRzXFxzdWJqZWN0c1xcZ2lsYWRcXGZ1cl9lbGlzZVwiKi9cbiAgICBleHBlcmltZW50T3V0RGlyQWJzKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGN1cnJTdWJqZWN0RGlyID0gcGF0aC5qb2luKFNVQkpFQ1RTX1BBVEhfQUJTLCB0aGlzLnN1YmplY3QpOyAvLyBcIi4uLi9zdWJqZWN0cy9naWxhZFwiXG4gICAgICAgIHJldHVybiBwYXRoLmpvaW4oY3VyclN1YmplY3REaXIsIHRoaXMudHJ1dGgubmFtZSk7IC8vIFwiLi4uL2dpbGFkL2Z1cl9lbGlzZV9CXCJcbiAgICB9XG4gICAgXG4gICAgXG59XG4iXX0=