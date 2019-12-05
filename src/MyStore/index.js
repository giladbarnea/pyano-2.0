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
    constructor(_doTruthFileCheck = true) {
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
        if (_doTruthFileCheck) {
            Promise.all([this.test.doTruthFileCheck(), this.exam.doTruthFileCheck()])
                .catch(async (reason) => {
                const currentWindow = util_1.getCurrentWindow();
                if (!currentWindow.webContents.isDevToolsOpened()) {
                    currentWindow.webContents.openDevTools({ mode: "undocked" });
                }
                console.error(`BigConfigCls ctor, error when _doTruthFileCheck:`, reason);
                await MyAlert_1.default.big.error({
                    title: `An error occured when making sure all truth txt files exist. Tried to check: ${this.test.truth.name} and ${this.exam.truth.name}.`,
                    html: reason,
                });
            });
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
    async doTruthFileCheck() {
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
    toObj() {
        const obj = this.store;
        delete obj.name;
        return obj;
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
        if (!fs.existsSync(path.join(SUBJECTS_PATH_ABS, name))) {
            fs.mkdirSync(path.join(SUBJECTS_PATH_ABS, name));
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUFpQztBQUNqQyxrQ0FBMkI7QUFDM0Isa0NBQWtGO0FBQ2xGLG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsNkJBQTZCO0FBRTdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQXNEdEMsU0FBUyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUk7SUFDakMsSUFBSyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRztRQUNwQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzdCLE9BQU8sT0FBTyxDQUFDO0tBQ2xCO1NBQU07UUFDSCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDN0I7QUFDTCxDQUFDO0FBR0QsU0FBZ0Isa0JBQWtCLENBQUMsRUFBRSxTQUFTLEtBQTRDLEVBQUUsU0FBUyxFQUFHLFNBQVMsRUFBRTtJQUMvRyxJQUFLLFNBQVMsRUFBRztRQUNiLElBQUssU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRztZQUU3QixTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsQztRQUNELElBQUssQ0FBQyxDQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFHO1lBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLFNBQVMsNEVBQTRFLENBQUMsQ0FBQztZQUN2SCxTQUFTLEdBQUcsU0FBUyxDQUFDO1NBQ3pCO0tBQ0o7SUFJRCxJQUFJLFVBQVUsR0FBRyxDQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFFLENBQUM7SUFDakUsSUFBSSxtQkFBbUIsR0FBRyxFQUFFLENBQUM7SUFDN0IsS0FBTSxJQUFJLElBQUksSUFBSSxVQUFVLEVBQUc7UUFDM0IsSUFBSSxDQUFFLElBQUksRUFBRSxHQUFHLENBQUUsR0FBRyxjQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pDLElBQUssU0FBUyxFQUFHO1lBQ2IsSUFBSyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssSUFBSSxTQUFTLEVBQUUsRUFBRztnQkFDbkMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2xDO1NBQ0o7YUFBTTtZQUNILG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUVsQztLQUNKO0lBQ0QsT0FBTyxtQkFBbUIsQ0FBQTtBQUU5QixDQUFDO0FBN0JELGdEQTZCQztBQUdELFNBQWdCLHNCQUFzQjtJQUNsQyxNQUFNLFlBQVksR0FBRyxrQkFBa0IsQ0FBQyxFQUFFLFNBQVMsRUFBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQy9ELE1BQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQztJQUN6QixLQUFNLElBQUksSUFBSSxJQUFJLFlBQVksRUFBRztRQUM3QixJQUFLLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFHO1lBQ3hELGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDNUI7S0FDSjtJQUNELE9BQU8sWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQy9GLENBQUM7QUFURCx3REFTQztBQUVELE1BQWEsWUFBYSxTQUFRLEtBQWlCO0lBSy9DLFlBQVksaUJBQWlCLEdBQUcsSUFBSTtRQUNoQyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUssTUFBTSxFQUFHO1lBQ1YsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQTtTQUM5RDtRQUNELElBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDckMsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUNyQyxJQUFLLENBQUMsVUFBRyxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsRUFBRztZQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLHNFQUFzRSxFQUFFO2dCQUNqRixlQUFlO2dCQUNmLGVBQWU7YUFDbEIsRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO1lBQzFDLGVBQWUsR0FBRyxrQkFBa0IsQ0FBQztZQUNyQyxlQUFlLEdBQUcsa0JBQWtCLENBQUM7U0FDeEM7UUFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7UUFHbkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzlCLElBQUssaUJBQWlCLEVBQUc7WUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUUsQ0FBQztpQkFDbkUsS0FBSyxDQUFDLEtBQUssRUFBQyxNQUFNLEVBQUMsRUFBRTtnQkFFbEIsTUFBTSxhQUFhLEdBQUcsdUJBQWdCLEVBQUUsQ0FBQztnQkFFekMsSUFBSyxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsRUFBRztvQkFDakQsYUFBYSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLEVBQUcsVUFBVSxFQUFFLENBQUMsQ0FBQTtpQkFDaEU7Z0JBRUQsT0FBTyxDQUFDLEtBQUssQ0FBQyxrREFBa0QsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDMUUsTUFBTSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7b0JBQ3BCLEtBQUssRUFBRyxnRkFBZ0YsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRztvQkFDM0ksSUFBSSxFQUFHLE1BQU07aUJBRWhCLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1NBR2I7SUFDTCxDQUFDO0lBSUQsZUFBZSxDQUFDLFdBQXVCLEVBQUUsY0FBOEI7UUFDbkUsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLDJFQUEyRSxDQUFDLENBQUM7SUFPckcsQ0FBQztJQVFELE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNSLElBQUssTUFBTSxFQUFHO1lBQ1YsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDLENBQUM7U0FDL0Q7UUFDRCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLElBQUssS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRztZQUNwQixJQUFJLFFBQVEsR0FBVSxDQUFDLENBQUM7WUFDeEIsSUFBSyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFHO2dCQUNyQixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7YUFDeEI7aUJBQU07Z0JBQ0gsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNyQjtZQUNELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3pCO2FBQU07WUFDSCxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNsQjtRQUNELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBR0QsSUFBSSxTQUFTO1FBQ1QsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxJQUFJLFNBQVMsQ0FBQyxJQUFjO1FBRXhCLE1BQU0sVUFBVSxHQUFHLENBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBRSxDQUFDO1FBQzVFLElBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFHO1lBQzlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLElBQUksc0JBQXNCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDbEcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDaEM7YUFBTTtZQUNILElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQy9CO0lBQ0wsQ0FBQztJQUtELFlBQVksQ0FBQyxXQUFtQixFQUFFLFNBQXFCO1FBRW5ELElBQUk7WUFDQSxTQUFTLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3ZDO1FBQUMsT0FBUSxDQUFDLEVBQUc7WUFDVixJQUFLLENBQUMsQ0FBQyxPQUFPLEtBQUssZ0JBQWdCLEVBQUc7Z0JBQ2xDLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsV0FBVyxnREFBZ0QsQ0FBQyxDQUFDO2FBQ3pHO1lBQ0QsSUFBSyxDQUFDLENBQUMsT0FBTyxLQUFLLGVBQWUsRUFBRztnQkFDakMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDNUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsV0FBVyw0RkFBNEYsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDaEosV0FBVyxHQUFHLFFBQVEsQ0FBQzthQUMxQjtTQUNKO1FBQ0QsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV0QyxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBbUIsQ0FBQztRQUdsRCxNQUFNLFlBQVksR0FBRyxHQUFHLFVBQVUsT0FBb0MsQ0FBQztRQUV2RSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFHLFdBQVcsQ0FBQztRQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRTtZQUN4QixXQUFXO1lBQ1gsU0FBUztTQUNaLENBQUMsQ0FBQztRQUdILElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUE7SUFDNUQsQ0FBQztJQUdELFlBQVk7UUFDUixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUE7SUFDckMsQ0FBQztJQUlELElBQUksU0FBUztRQUNULE9BQU8sZUFBZSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztJQUU5QyxDQUFDO0lBR0QsSUFBSSxTQUFTLENBQUMsV0FBbUI7UUFDN0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUNsQyxDQUFDO0lBSUQsSUFBSSxTQUFTO1FBQ1QsT0FBTyxlQUFlLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFJRCxJQUFJLFNBQVMsQ0FBQyxXQUFtQjtRQUM3QixJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQ2xDLENBQUM7SUFJRCxJQUFJLGVBQWU7UUFDZixPQUFPLGVBQWUsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsQ0FBQTtJQVFuRCxDQUFDO0lBR0QsSUFBSSxlQUFlLENBQUMsY0FBOEI7UUFDOUMsSUFBSyxDQUFDLENBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBRSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRztZQUNoRCxPQUFPLENBQUMsSUFBSSxDQUFDLDBEQUEwRCxjQUFjLHFEQUFxRCxDQUFDLENBQUM7WUFDNUksY0FBYyxHQUFHLE1BQU0sQ0FBQztTQUMzQjtRQUNELElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO0lBR2hELENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUdELElBQUksUUFBUSxDQUFDLFdBQXFCO1FBRTlCLElBQUssTUFBTSxFQUFHO1lBRVYsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUE7U0FDekQ7UUFDRCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sUUFBUSxHQUFHLENBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxXQUFJLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUVuQyxDQUFDO0lBSUQsSUFBSSxHQUFHO1FBQ0gsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUU3QixNQUFNLGFBQWEsR0FBRyxDQUE2QixHQUFNLEVBQUUsS0FBSyxFQUFpQixFQUFFO1lBQy9FLE1BQU0sS0FBSyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xELElBQUssS0FBSztnQkFBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDeEQsT0FBTyxLQUFLLENBQUE7UUFDaEIsQ0FBQyxDQUFDO1FBRUYsT0FBTztZQUNILGtCQUFrQixFQUFHLEdBQUcsRUFBRTtnQkFDdEIsSUFBSyxJQUFJLEVBQUc7b0JBQ1IsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLGtCQUFrQixDQUFDO29CQUNyRSxJQUFLLGtCQUFrQjt3QkFBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7b0JBQy9GLE9BQU8sa0JBQWtCLENBQUM7aUJBQzdCO2dCQUNELE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFDRCxtQkFBbUIsRUFBRyxHQUFHLEVBQUU7Z0JBQ3ZCLElBQUssSUFBSSxFQUFHO29CQUNSLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQztvQkFDdkUsSUFBSyxtQkFBbUI7d0JBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxtQ0FBbUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO29CQUNsRyxPQUFPLG1CQUFtQixDQUFDO2lCQUM5QjtnQkFDRCxPQUFPLElBQUksQ0FBQztZQUNoQixDQUFDO1lBRUQsa0JBQWtCLEVBQUcsQ0FBQyxLQUFjLEVBQUUsRUFBRTtnQkFDcEMsT0FBTyxhQUFhLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFJdEQsQ0FBQztZQUNELHVCQUF1QixFQUFHLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQ2hDLE9BQU8sYUFBYSxDQUFDLHlCQUF5QixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBSTNELENBQUM7WUFDRCxtQkFBbUIsRUFBRyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUM1QixNQUFNLG1CQUFtQixHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLG1CQUFtQixDQUFDO2dCQUMvRSxJQUFLLG1CQUFtQjtvQkFBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNuRixPQUFPLG1CQUFtQixDQUFBO1lBQzlCLENBQUM7WUFDRCxTQUFTLEVBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDbEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUMzRCxJQUFLLFNBQVM7b0JBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDL0QsT0FBTyxTQUFTLENBQUM7WUFDckIsQ0FBQztZQUVELGNBQWMsRUFBRyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUN2QixNQUFNLGNBQWMsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxjQUFjLENBQUM7Z0JBQ3JFLElBQUssY0FBYztvQkFBRyxPQUFPLENBQUMsSUFBSSxDQUFDLDZCQUE2QixLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUN6RSxPQUFPLGNBQWMsQ0FBQztZQUMxQixDQUFDO1lBQ0Qsc0JBQXNCLEVBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDL0IsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQztnQkFDckYsSUFBSyxzQkFBc0I7b0JBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDekYsT0FBTyxzQkFBc0IsQ0FBQztZQUNsQyxDQUFDO1lBQ0QscUJBQXFCLEVBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDOUIsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztnQkFDbkYsSUFBSyxxQkFBcUI7b0JBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDdkYsT0FBTyxxQkFBcUIsQ0FBQztZQUNqQyxDQUFDO1lBQ0QsZ0JBQWdCLEVBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDekIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDekUsSUFBSyxnQkFBZ0I7b0JBQUcsT0FBTyxDQUFDLElBQUksQ0FBQywrQkFBK0IsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDN0UsT0FBTyxnQkFBZ0IsQ0FBQztZQUM1QixDQUFDO1lBQ0QsMEJBQTBCLEVBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDbkMsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQywwQkFBMEIsQ0FBQztnQkFDN0YsSUFBSywwQkFBMEI7b0JBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDakcsT0FBTywwQkFBMEIsQ0FBQztZQUN0QyxDQUFDO1lBQ0QsMEJBQTBCLEVBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDbkMsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQywwQkFBMEIsQ0FBQztnQkFDN0YsSUFBSywwQkFBMEI7b0JBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDakcsT0FBTywwQkFBMEIsQ0FBQztZQUN0QyxDQUFDO1lBQ0QsbUJBQW1CLEVBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDNUIsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQztnQkFDL0UsSUFBSyxtQkFBbUI7b0JBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDbkYsT0FBTyxtQkFBbUIsQ0FBQztZQUMvQixDQUFDO1NBQ0osQ0FBQztJQUNOLENBQUM7SUFHRCxJQUFJLFVBQVU7UUFDVixPQUFPLGVBQWUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUE7SUFDOUMsQ0FBQztJQUdELElBQUksVUFBVSxDQUFDLEdBQVc7UUFDdEIsSUFBSTtZQUNBLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEMsSUFBSyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUc7Z0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMseUNBQXlDLEVBQUUsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEVBQUUsZUFBZSxDQUFDLENBQUM7YUFDOUY7aUJBQU07Z0JBQ0gsSUFBSyxPQUFPLElBQUksQ0FBQyxJQUFJLE9BQU8sSUFBSSxFQUFFLEVBQUc7b0JBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7aUJBRW5DO3FCQUFNO29CQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsOEJBQThCLEdBQUcsZUFBZSxDQUFDLENBQUM7aUJBQ2xFO2FBQ0o7U0FDSjtRQUFDLE9BQVEsQ0FBQyxFQUFHO1lBQ1YsT0FBTyxDQUFDLElBQUksQ0FBQywyREFBMkQsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNoRjtJQUdMLENBQUM7Q0FDSjtBQXJVRCxvQ0FxVUM7QUFHRCxNQUFhLFNBQVUsU0FBUSxJQUFnQjtJQVMzQyxZQUFZLFdBQW1CLEVBQUUsU0FBcUI7UUFFbEQsSUFBSSxDQUFFLFFBQVEsRUFBRSxHQUFHLENBQUUsR0FBRyxjQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3BELElBQUssQ0FBQyxDQUFFLE9BQU8sRUFBRSxPQUFPLENBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUc7WUFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsV0FBVywyQkFBMkIsQ0FBQyxDQUFDO1NBQzlFO1FBQ0QsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQW1CLENBQUM7UUFDNUMsSUFBSSxRQUFRLENBQUM7UUFDYixJQUFLLFdBQUksQ0FBQyxTQUFTLENBQUMsRUFBRztZQUNuQixJQUFLLFNBQVMsQ0FBQyxLQUFLLEVBQUc7Z0JBQ25CLFFBQVEsbUNBQVEsU0FBUyxDQUFDLEtBQUssS0FBRSxJQUFJLEVBQUcsV0FBVyxHQUFFLENBQUM7YUFDekQ7aUJBQU07Z0JBQ0gsUUFBUSxHQUFHLFNBQVMsQ0FBQzthQUN4QjtTQUNKO2FBQU07WUFDSCxRQUFRLEdBQUcsRUFBRSxJQUFJLEVBQUcsV0FBVyxFQUFFLENBQUM7U0FDckM7UUFDRCxLQUFLLENBQUM7WUFDRixhQUFhLEVBQUcsSUFBSTtZQUNwQixHQUFHLEVBQUcsZ0JBQWdCO1lBQ3RCLFVBQVUsRUFBRyxRQUFRO1lBQ3JCLFFBQVE7U0FFWCxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsSUFBSSxFQUFHLFdBQVcsRUFBRSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUssV0FBSSxDQUFDLFNBQVMsQ0FBQyxFQUFHO1lBQ25CLElBQUksQ0FBQyxHQUFHLGlDQUFNLFNBQVMsQ0FBQyxLQUFLLEtBQUUsSUFBSSxFQUFHLFdBQVcsSUFBRyxDQUFDO1NBRXhEO1FBQ0QsSUFBSTtZQUNBLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxhQUFLLENBQUMsY0FBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztTQUM1RDtRQUFDLE9BQVEsQ0FBQyxFQUFHO1lBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxnTEFBZ0wsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFBO1NBQ3pPO0lBQ0wsQ0FBQztJQUVELE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBbUI7UUFDbkMsSUFBSSxDQUFFLFFBQVEsRUFBRSxHQUFHLENBQUUsR0FBRyxjQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3BELElBQUssQ0FBQyxDQUFFLE9BQU8sRUFBRSxPQUFPLENBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUc7WUFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1NBQ3JDO1FBQ0QsSUFBSyxXQUFXLEtBQUssR0FBRyxRQUFRLEdBQUcsR0FBRyxFQUFFLEVBQUc7WUFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUNwQztJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsZ0JBQWdCO1FBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxJQUFJLHNCQUFzQixDQUFDLENBQUM7UUFDN0QsSUFBSyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRztZQUM3QixPQUFPLGlCQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSw0Q0FBNEMsQ0FBQyxDQUFDO1NBQ2hHO1FBRUQsTUFBTSxtQkFBbUIsR0FBRyxzQkFBc0IsRUFBRSxDQUFDO1FBQ3JELElBQUssQ0FBQyxXQUFJLENBQUMsbUJBQW1CLENBQUM7WUFDM0IsT0FBTyxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7Z0JBQ3ZCLEtBQUssRUFBRyw0QkFBNEI7Z0JBQ3BDLElBQUksRUFBRyxtRkFBbUY7YUFDN0YsQ0FBQyxDQUFDO1FBR1AsT0FBTyxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7WUFDeEIsS0FBSyxFQUFHLHdDQUF3QyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtZQUNqRSxJQUFJLEVBQUcsb0dBQW9HO1lBQzNHLGVBQWUsRUFBRyxJQUFJO1NBQ3pCLEVBQUU7WUFDQyxPQUFPLEVBQUcsbUJBQW1CO1lBQzdCLE9BQU8sRUFBRyxFQUFFLENBQUMsRUFBRTtnQkFDWCxJQUFJO29CQUVBLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxDQUFDLENBQUM7b0JBQy9CLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO29CQUNqQixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFFNUIsaUJBQVUsRUFBRSxDQUFDO2lCQUNoQjtnQkFBQyxPQUFRLEdBQUcsRUFBRztvQkFDWixpQkFBTyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNoQixpQkFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUcsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUcscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO2lCQUU1RTtZQUVMLENBQUM7U0FDSixDQUFDLENBQUM7SUFHUCxDQUFDO0lBRUQsUUFBUSxDQUFDLENBQW1CO1FBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUNBQW1DLENBQUMsQ0FBQztRQUNsRCxJQUFLLE1BQU0sRUFBRztZQUNWLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1NBQ3REO1FBQ0QsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVwQixJQUFLLENBQUMsS0FBSyxTQUFTO1lBQ2hCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ2Q7WUFDRCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FBQztZQUV6QixJQUFLLE9BQU8sS0FBSyxRQUFRLElBQUksQ0FBQyxPQUFPLEtBQUssUUFBUSxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFHO2dCQUVqRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ2xDO2lCQUFNO2dCQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsb0ZBQW9GLENBQUMsQ0FBQzthQUN0RztTQUNKO0lBRUwsQ0FBQztJQUVELE1BQU07UUFDRixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3pCLElBQUksVUFBVSxHQUFHOzs7Ozs7Ozs7U0FTaEIsQ0FBQztRQUNGLEtBQU0sSUFBSSxDQUFFLENBQUMsRUFBRSxHQUFHLENBQUUsSUFBSSxnQkFBUyxDQUFDLE1BQU0sQ0FBQyxFQUFHO1lBQ3hDLFVBQVUsSUFBSTs7c0JBRUosQ0FBQyxHQUFHLENBQUM7c0JBQ0wsR0FBRyxDQUFDLEtBQUs7c0JBQ1QsR0FBRyxDQUFDLE1BQU07c0JBQ1YsR0FBRyxDQUFDLE1BQU07c0JBQ1YsR0FBRyxDQUFDLEtBQUs7a0JBQ2IsQ0FBQTtTQUNUO1FBQ0QsVUFBVSxJQUFJLFVBQVUsQ0FBQztRQUN6QixPQUFPOzs7Ozs7OzswQkFRVyxJQUFJLENBQUMsd0JBQXdCOzs7OzBCQUk3QixJQUFJLENBQUMsdUJBQXVCOzs7OzBCQUk1QixJQUFJLENBQUMsU0FBUzs7OzswQkFJZCxJQUFJLENBQUMsZUFBZTs7OzswQkFJcEIsSUFBSSxDQUFDLHFCQUFxQjs7OzswQkFJMUIsSUFBSSxDQUFDLElBQUk7Ozs7MEJBSVQsSUFBSSxDQUFDLE9BQU87Ozs7MEJBSVosSUFBSSxDQUFDLFVBQVU7Ozs7O2NBSzNCLFVBQVU7YUFDWCxDQUFDO0lBQ1YsQ0FBQztJQUdELEtBQUs7UUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3ZCLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQztRQUNoQixPQUFPLEdBQUcsQ0FBQTtJQUVkLENBQUM7SUFHRCxhQUFhLENBQUMsU0FBb0I7UUFDOUIsSUFBSyxNQUFNO1lBQUcsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFXcEUsQ0FBQztJQUdPLGdCQUFnQixDQUFDLEdBQXFCLEVBQUUsS0FBSztRQUNqRCxJQUFLLE1BQU0sRUFBRztZQUNWLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFBO1NBQzdEO1FBQ0QsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLDRDQUE0QyxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFRekIsQ0FBQztJQUdPLFlBQVksQ0FBQyxhQUE0QixFQUFFLFNBQWlCO1FBQ2hFLE1BQU0sZUFBZSxHQUFHLE9BQU8sU0FBUyxDQUFDO1FBQ3pDLElBQUssZUFBZSxLQUFLLFFBQVEsRUFBRztZQUNoQyxTQUFTLEdBQUcsR0FBRyxTQUFTLEdBQUcsQ0FBQztZQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLDBFQUEwRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZHO2FBQU0sSUFBSyxlQUFlLEtBQUssUUFBUSxFQUFHO1lBQ3ZDLElBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFHO2dCQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLHFFQUFxRSxTQUFTLEdBQUcsQ0FBQyxDQUFDO2dCQUNoRyxTQUFTLEdBQUcsR0FBRyxTQUFTLEdBQUcsQ0FBQzthQUMvQjtTQUNKO2FBQU07WUFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLGlGQUFpRixFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzNHLE9BQU87U0FDVjtRQUdELElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxhQUFhLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsYUFBYSxZQUFZLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDakUsQ0FBQztJQUdELElBQUksdUJBQXVCO1FBQ3ZCLE9BQU8sZUFBZSxDQUFDLElBQUksRUFBRSx5QkFBeUIsQ0FBQyxDQUFBO0lBUTNELENBQUM7SUFHRCxJQUFJLHVCQUF1QixDQUFDLFNBQWlCO1FBQ3pDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFHRCxJQUFJLHdCQUF3QjtRQUN4QixPQUFPLGVBQWUsQ0FBQyxJQUFJLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztJQVE3RCxDQUFDO0lBR0QsSUFBSSx3QkFBd0IsQ0FBQyxTQUFpQjtRQUMxQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBR0QsSUFBSSxTQUFTO1FBQ1QsT0FBTyxlQUFlLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBRTlDLENBQUM7SUFHRCxJQUFJLFNBQVMsQ0FBQyxJQUFjO1FBQ3hCLElBQUssQ0FBQyxDQUFFLE9BQU8sRUFBRSxXQUFXLENBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUc7WUFDNUMsT0FBTyxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsSUFBSSxpREFBaUQsQ0FBQyxDQUFDO1NBQzlHO2FBQU07WUFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDL0I7SUFDTCxDQUFDO0lBRUQsSUFBSSxlQUFlO1FBQ2YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELElBQUksZUFBZSxDQUFDLEtBQWE7UUFDN0IsSUFBSyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUc7WUFDaEIsT0FBTyxDQUFDLElBQUksQ0FBQyx5REFBeUQsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUNsRjthQUFNO1lBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN0QztJQUVMLENBQUM7SUFFRCxJQUFJLHFCQUFxQjtRQUNyQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsSUFBSSxxQkFBcUIsQ0FBQyxLQUFhO1FBQ25DLElBQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUc7WUFDN0IsT0FBTyxDQUFDLElBQUksQ0FBQywyREFBMkQsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUNwRjthQUFNO1lBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUM1QztJQUNMLENBQUM7SUFHRCxJQUFJLElBQUk7UUFDSixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBQzNCLENBQUM7SUFHRCxJQUFJLE9BQU87UUFDUCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELElBQUksT0FBTyxDQUFDLElBQW1CO1FBQzNCLElBQUssTUFBTSxFQUFHO1lBRVYsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7U0FDekQ7UUFDRCxJQUFLLENBQUMsV0FBSSxDQUFDLElBQUksQ0FBQyxFQUFHO1lBRWYsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLDZCQUE2QixJQUFJLGFBQWEsQ0FBQyxDQUFBO1NBQ3RFO1FBQ0QsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ3hDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFdBQUksQ0FBQyxDQUFDO1FBQzlELE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7UUFDbEMsSUFBSyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFHO1lBQ3RELEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO1NBQ25EO1FBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsQ0FBRSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUUsR0FBRyxnQkFBZ0IsRUFBRSxJQUFJLENBQUUsQ0FBQyxDQUFFLENBQUM7SUFDNUUsQ0FBQztJQUlELElBQUksVUFBVTtRQUNWLE9BQU8sZUFBZSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztJQUUvQyxDQUFDO0lBS0QsSUFBSSxVQUFVLENBQUMsVUFBa0I7UUFFN0IsSUFBSSxDQUFFLElBQUksRUFBRSxHQUFHLENBQUUsR0FBRyxjQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9DLElBQUssV0FBSSxDQUFDLEdBQUcsQ0FBQyxFQUFHO1lBQ2IsT0FBTyxDQUFDLElBQUksQ0FBQyxxREFBcUQsVUFBVSxzQkFBc0IsSUFBSSxHQUFHLENBQUMsQ0FBQztTQUU5RztRQUVELElBQUk7WUFDQSxJQUFJLEtBQUssR0FBRyxJQUFJLGFBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QixJQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRztnQkFDekIsaUJBQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLDRCQUE0QixJQUFJLEVBQUUsQ0FBQyxDQUFBO2FBQzVEO1lBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7U0FDdEI7UUFBQyxPQUFRLENBQUMsRUFBRztZQUNWLGlCQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ2xCO1FBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0lBR2pDLENBQUM7SUFHRCxJQUFJLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVELElBQUksTUFBTSxDQUFDLE1BQWdCO1FBQ3ZCLElBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFHO1lBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsMkVBQTJFLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDckc7YUFBTTtZQUVILElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzlCO0lBQ0wsQ0FBQztJQUdELGtCQUFrQjtRQUNkLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzVELEtBQU0sSUFBSSxDQUFFLFVBQVUsRUFBRSxTQUFTLENBQUUsSUFBSSxnQkFBUyxDQUFDLGNBQWMsQ0FBQyxFQUFHO1lBRS9ELElBQUksYUFBYSxHQUFHLFVBQUcsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRSxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztZQUN2RCxJQUFLLGFBQWEsR0FBRyxtQkFBbUI7Z0JBQ3BDLE9BQU8sQ0FBRSxVQUFVLEVBQUUsU0FBUyxHQUFHLENBQUMsYUFBYSxHQUFHLG1CQUFtQixDQUFDLENBQUUsQ0FBQztTQUNoRjtRQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQsV0FBVztRQUNQLE9BQU8sSUFBSSxDQUFDLFNBQVMsS0FBSyxPQUFPLENBQUM7SUFDdEMsQ0FBQztJQUVELGVBQWU7UUFDWCxPQUFPLFVBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztJQUNyRixDQUFDO0lBRUQsa0JBQWtCO1FBQ2QsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELGVBQWU7UUFFWCxJQUFJLENBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzdELE9BQU8sSUFBSSxhQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUdELGtCQUFrQjtRQUNkLElBQUksQ0FBRSxXQUFXLEVBQUUsV0FBVyxDQUFFLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDN0QsT0FBTyxJQUFJLHVCQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUtELDBCQUEwQjtRQUN0QixPQUFPLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFFLFdBQVcsRUFBRSxXQUFXLENBQUUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUU3RCxPQUFPLElBQUksYUFBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsU0FBUyxXQUFXLFVBQVUsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3pHLENBQUM7SUFHRCxtQkFBbUI7UUFDZixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztDQUdKO0FBdmNELDhCQXVjQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFN0b3JlIGZyb20gXCJlbGVjdHJvbi1zdG9yZVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgTXlBbGVydCBmcm9tIFwiLi4vTXlBbGVydFwiO1xuaW1wb3J0IG15ZnMgZnJvbSBcIi4uL015RnNcIjtcbmltcG9ydCB7IGJvb2wsIHJlbG9hZFBhZ2UsIHN1bSwgZW51bWVyYXRlLCBhbGwsIGdldEN1cnJlbnRXaW5kb3cgfSBmcm9tIFwiLi4vdXRpbFwiO1xuaW1wb3J0IHsgVHJ1dGggfSBmcm9tIFwiLi4vVHJ1dGhcIjtcbmltcG9ydCB7IElMZXZlbCwgTGV2ZWwsIExldmVsQ29sbGVjdGlvbiB9IGZyb20gXCIuLi9MZXZlbFwiO1xuaW1wb3J0IHsgU3dlZXRBbGVydFJlc3VsdCB9IGZyb20gXCJzd2VldGFsZXJ0MlwiO1xuaW1wb3J0ICogYXMgQ29uZiBmcm9tICdjb25mJztcblxuY29uc29sZS5sb2coJ3NyYy9CaWdDb25maWcvaW5kZXgudHMnKTtcblxuZXhwb3J0IHR5cGUgRXhwZXJpbWVudFR5cGUgPSAnZXhhbScgfCAndGVzdCc7XG5leHBvcnQgdHlwZSBEZW1vVHlwZSA9ICd2aWRlbycgfCAnYW5pbWF0aW9uJztcbmV4cG9ydCB0eXBlIFBhZ2VOYW1lID0gXCJuZXdcIiAvLyBBS0EgVExhc3RQYWdlXG4gICAgfCBcInJ1bm5pbmdcIlxuICAgIHwgXCJyZWNvcmRcIlxuICAgIHwgXCJmaWxlX3Rvb2xzXCJcbiAgICB8IFwic2V0dGluZ3NcIlxudHlwZSBEZXZpYXRpb25UeXBlID0gJ3JoeXRobScgfCAndGVtcG8nO1xuXG5cbmludGVyZmFjZSBJU3ViY29uZmlnIHtcbiAgICBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb246IHN0cmluZyxcbiAgICBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbjogc3RyaW5nLFxuICAgIGRlbW9fdHlwZTogRGVtb1R5cGUsXG4gICAgZXJyb3JzX3BsYXlyYXRlOiBudW1iZXIsXG4gICAgZmluaXNoZWRfdHJpYWxzX2NvdW50OiBudW1iZXIsXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHN1YmplY3Q6IHN0cmluZyxcbiAgICB0cnV0aF9maWxlOiBzdHJpbmcsXG4gICAgbGV2ZWxzOiBJTGV2ZWxbXSxcbn1cblxuXG5pbnRlcmZhY2UgRGV2T3B0aW9ucyB7XG4gICAgZm9yY2Vfbm90ZXNfbnVtYmVyOiBudWxsIHwgbnVtYmVyLFxuICAgIGZvcmNlX3BsYXliYWNrX3JhdGU6IG51bGwgfCBudW1iZXIsXG4gICAgbXV0ZV9hbmltYXRpb246IGJvb2xlYW4sXG4gICAgbm9fcmVsb2FkX29uX3N1Ym1pdDogYm9vbGVhblxuICAgIHNpbXVsYXRlX3Rlc3RfbW9kZTogYm9vbGVhbixcbiAgICBzaW11bGF0ZV92aWRlb19tb2RlOiBib29sZWFuLFxuICAgIHNpbXVsYXRlX2FuaW1hdGlvbl9tb2RlOiBib29sZWFuLFxuICAgIHNraXBfZXhwZXJpbWVudF9pbnRybzogYm9vbGVhbixcbiAgICBza2lwX2ZhZGU6IGJvb2xlYW4sXG4gICAgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2s6IGJvb2xlYW4sXG4gICAgc2tpcF9sZXZlbF9pbnRybzogYm9vbGVhbixcbiAgICBza2lwX21pZGlfZXhpc3RzX2NoZWNrOiBib29sZWFuLFxuICAgIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrOiBib29sZWFuLFxufVxuXG5pbnRlcmZhY2UgSUJpZ0NvbmZpZyB7XG4gICAgZGV2OiBib29sZWFuLFxuICAgIGRldm9wdGlvbnM6IERldk9wdGlvbnMsXG4gICAgZXhhbV9maWxlOiBzdHJpbmcsXG4gICAgdGVzdF9maWxlOiBzdHJpbmcsXG4gICAgZXhwZXJpbWVudF90eXBlOiBFeHBlcmltZW50VHlwZSxcbiAgICBsYXN0X3BhZ2U6IFBhZ2VOYW1lLFxuICAgIHN1YmplY3RzOiBzdHJpbmdbXSxcbiAgICB2ZWxvY2l0aWVzOiBudW1iZXIsXG59XG5cbmZ1bmN0aW9uIHRyeUdldEZyb21DYWNoZTxUIGV4dGVuZHMga2V5b2YgSUJpZ0NvbmZpZz4oY29uZmlnOiBCaWdDb25maWdDbHMsIHByb3A6IFQpOiBJQmlnQ29uZmlnW1RdXG5mdW5jdGlvbiB0cnlHZXRGcm9tQ2FjaGU8VCBleHRlbmRzIGtleW9mIElTdWJjb25maWc+KGNvbmZpZzogU3ViY29uZmlnLCBwcm9wOiBUKTogSVN1YmNvbmZpZ1tUXVxuZnVuY3Rpb24gdHJ5R2V0RnJvbUNhY2hlKGNvbmZpZywgcHJvcCkge1xuICAgIGlmICggY29uZmlnLmNhY2hlW3Byb3BdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIGNvbnN0IHByb3BWYWwgPSBjb25maWcuZ2V0KHByb3ApO1xuICAgICAgICBjb25maWcuY2FjaGVbcHJvcF0gPSBwcm9wVmFsO1xuICAgICAgICByZXR1cm4gcHJvcFZhbDtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY29uZmlnLmNhY2hlW3Byb3BdO1xuICAgIH1cbn1cblxuLyoqTGlzdCBvZiB0cnV0aCBmaWxlIG5hbWVzLCBubyBleHRlbnNpb24qL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRydXRoRmlsZXNXaGVyZSh7IGV4dGVuc2lvbiB9OiB7IGV4dGVuc2lvbj86ICd0eHQnIHwgJ21pZCcgfCAnbXA0JyB9ID0geyBleHRlbnNpb24gOiB1bmRlZmluZWQgfSk6IHN0cmluZ1tdIHtcbiAgICBpZiAoIGV4dGVuc2lvbiApIHtcbiAgICAgICAgaWYgKCBleHRlbnNpb24uc3RhcnRzV2l0aCgnLicpICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgZXh0ZW5zaW9uID0gZXh0ZW5zaW9uLnNsaWNlKDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmICggIVsgJ3R4dCcsICdtaWQnLCAnbXA0JyBdLmluY2x1ZGVzKGV4dGVuc2lvbikgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHRydXRoRmlsZXNMaXN0KFwiJHtleHRlbnNpb259XCIpLCBtdXN0IGJlIGVpdGhlciBbJ3R4dCcsJ21pZCcsJ21wNCddIG9yIG5vdCBhdCBhbGwuIHNldHRpbmcgdG8gdW5kZWZpbmVkYCk7XG4gICAgICAgICAgICBleHRlbnNpb24gPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gY29uc3QgdHJ1dGhzRGlyUGF0aCA9IHRoaXMudHJ1dGhzRGlyUGF0aCgpO1xuICAgIFxuICAgIGxldCB0cnV0aEZpbGVzID0gWyAuLi5uZXcgU2V0KGZzLnJlYWRkaXJTeW5jKFRSVVRIU19QQVRIX0FCUykpIF07XG4gICAgbGV0IGZvcm1hdHRlZFRydXRoRmlsZXMgPSBbXTtcbiAgICBmb3IgKCBsZXQgZmlsZSBvZiB0cnV0aEZpbGVzICkge1xuICAgICAgICBsZXQgWyBuYW1lLCBleHQgXSA9IG15ZnMuc3BsaXRfZXh0KGZpbGUpO1xuICAgICAgICBpZiAoIGV4dGVuc2lvbiApIHtcbiAgICAgICAgICAgIGlmICggZXh0Lmxvd2VyKCkgPT09IGAuJHtleHRlbnNpb259YCApIHtcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRUcnV0aEZpbGVzLnB1c2gobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3JtYXR0ZWRUcnV0aEZpbGVzLnB1c2gobmFtZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZm9ybWF0dGVkVHJ1dGhGaWxlc1xuICAgIFxufVxuXG4vKipMaXN0IG9mIG5hbWVzIG9mIHR4dCB0cnV0aCBmaWxlcyB0aGF0IGhhdmUgdGhlaXIgd2hvbGUgXCJ0cmlwbGV0XCIgaW4gdGFjdC4gbm8gZXh0ZW5zaW9uKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcnV0aHNXaXRoM1R4dEZpbGVzKCk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCB0eHRGaWxlc0xpc3QgPSBnZXRUcnV0aEZpbGVzV2hlcmUoeyBleHRlbnNpb24gOiAndHh0JyB9KTtcbiAgICBjb25zdCB3aG9sZVR4dEZpbGVzID0gW107XG4gICAgZm9yICggbGV0IG5hbWUgb2YgdHh0RmlsZXNMaXN0ICkge1xuICAgICAgICBpZiAoIHR4dEZpbGVzTGlzdC5jb3VudCh0eHQgPT4gdHh0LnN0YXJ0c1dpdGgobmFtZSkpID49IDMgKSB7XG4gICAgICAgICAgICB3aG9sZVR4dEZpbGVzLnB1c2gobmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHR4dEZpbGVzTGlzdC5maWx0ZXIoYSA9PiB0eHRGaWxlc0xpc3QuZmlsdGVyKHR4dCA9PiB0eHQuc3RhcnRzV2l0aChhKSkubGVuZ3RoID49IDMpO1xufVxuXG5leHBvcnQgY2xhc3MgQmlnQ29uZmlnQ2xzIGV4dGVuZHMgU3RvcmU8SUJpZ0NvbmZpZz4ge1xuICAgIHRlc3Q6IFN1YmNvbmZpZztcbiAgICBleGFtOiBTdWJjb25maWc7XG4gICAgcmVhZG9ubHkgY2FjaGU6IFBhcnRpYWw8SUJpZ0NvbmZpZz47XG4gICAgXG4gICAgY29uc3RydWN0b3IoX2RvVHJ1dGhGaWxlQ2hlY2sgPSB0cnVlKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuY2FjaGUgPSB7fTtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICB0aGlzLnNldCA9ICguLi5hcmdzKSA9PiBjb25zb2xlLndhcm4oYERSWVJVTiwgc2V0OiBgLCBhcmdzKVxuICAgICAgICB9XG4gICAgICAgIGxldCB0ZXN0TmFtZVdpdGhFeHQgPSB0aGlzLnRlc3RfZmlsZTtcbiAgICAgICAgbGV0IGV4YW1OYW1lV2l0aEV4dCA9IHRoaXMuZXhhbV9maWxlO1xuICAgICAgICBpZiAoICFhbGwodGVzdE5hbWVXaXRoRXh0LCBleGFtTmFtZVdpdGhFeHQpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBCaWdDb25maWdDbHMgY3RvciwgY291bGRudCBnZXQgdGVzdF9maWxlIGFuZC9vciBleGFtX2ZpbGUgZnJvbSBqc29uOmAsIHtcbiAgICAgICAgICAgICAgICB0ZXN0TmFtZVdpdGhFeHQsXG4gICAgICAgICAgICAgICAgZXhhbU5hbWVXaXRoRXh0XG4gICAgICAgICAgICB9LCAnLCBkZWZhdWx0aW5nIHRvIFwiZnVyX2VsaXNlX0IuW2V4dF1cIicpO1xuICAgICAgICAgICAgdGVzdE5hbWVXaXRoRXh0ID0gJ2Z1cl9lbGlzZV9CLnRlc3QnO1xuICAgICAgICAgICAgZXhhbU5hbWVXaXRoRXh0ID0gJ2Z1cl9lbGlzZV9CLmV4YW0nO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3ViY29uZmlnKHRlc3ROYW1lV2l0aEV4dCk7XG4gICAgICAgIHRoaXMuc2V0U3ViY29uZmlnKGV4YW1OYW1lV2l0aEV4dCk7XG4gICAgICAgIC8vIHRoaXMudGVzdCA9IG5ldyBTdWJjb25maWcodGVzdE5hbWVXaXRoRXh0KTtcbiAgICAgICAgLy8gdGhpcy5leGFtID0gbmV3IFN1YmNvbmZpZyhleGFtTmFtZVdpdGhFeHQpO1xuICAgICAgICB0aGlzLnN1YmplY3RzID0gdGhpcy5zdWJqZWN0czsgLy8gdG8gZW5zdXJlIGhhdmluZyBzdWJjb25maWcncyBzdWJqZWN0c1xuICAgICAgICBpZiAoIF9kb1RydXRoRmlsZUNoZWNrICkge1xuICAgICAgICAgICAgUHJvbWlzZS5hbGwoWyB0aGlzLnRlc3QuZG9UcnV0aEZpbGVDaGVjaygpLCB0aGlzLmV4YW0uZG9UcnV0aEZpbGVDaGVjaygpIF0pXG4gICAgICAgICAgICAgICAgICAgLmNhdGNoKGFzeW5jIHJlYXNvbiA9PiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRXaW5kb3cgPSBnZXRDdXJyZW50V2luZG93KCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgIGlmICggIWN1cnJlbnRXaW5kb3cud2ViQ29udGVudHMuaXNEZXZUb29sc09wZW5lZCgpICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFdpbmRvdy53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoeyBtb2RlIDogXCJ1bmRvY2tlZFwiIH0pXG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQmlnQ29uZmlnQ2xzIGN0b3IsIGVycm9yIHdoZW4gX2RvVHJ1dGhGaWxlQ2hlY2s6YCwgcmVhc29uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgTXlBbGVydC5iaWcuZXJyb3Ioe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUgOiBgQW4gZXJyb3Igb2NjdXJlZCB3aGVuIG1ha2luZyBzdXJlIGFsbCB0cnV0aCB0eHQgZmlsZXMgZXhpc3QuIFRyaWVkIHRvIGNoZWNrOiAke3RoaXMudGVzdC50cnV0aC5uYW1lfSBhbmQgJHt0aGlzLmV4YW0udHJ1dGgubmFtZX0uYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgOiByZWFzb24sXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZzogSVN1YmNvbmZpZywgZXhwZXJpbWVudFR5cGU6IEV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ0JpZ0NvbmZpZ0NscyB1c2VkIGZyb21TYXZlZENvbmZpZy4gSW1wb3NzaWJsZSB0byBsb2FkIGJpZyBmaWxlLiBSZXR1cm5pbmcnKTtcbiAgICAgICAgLyppZiAoIERSWVJVTiApIHJldHVybiBjb25zb2xlLmxvZyhgZnJvbVNhdmVkQ29uZmlnLCBEUllSVU5gKTtcbiAgICAgICAgIGNvbnN0IHRydXRoRmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKHNhdmVkQ29uZmlnLnRydXRoX2ZpbGVfcGF0aCwgJy50eHQnKTtcbiAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKHBhdGguam9pbihUUlVUSFNfUEFUSF9BQlMsIHRydXRoRmlsZU5hbWUpKTtcbiAgICAgICAgIHRoaXMuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgICB0aGlzLmNvbmZpZyhleHBlcmltZW50VHlwZSkuZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnKTsqL1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipAZXhhbXBsZVxuICAgICB1cGRhdGUoJ3N1YmplY3RzJywgW25hbWVzXSlcbiAgICAgKi9cbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywga3ZQYWlyczogUGFydGlhbDxJQmlnQ29uZmlnPilcbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywgdmFsdWVzOiBhbnlbXSlcbiAgICB1cGRhdGUoSywga3YpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdCaWdDb25maWcudXBkYXRlKCkgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBpZiAoIEFycmF5LmlzQXJyYXkoVikgKSB7XG4gICAgICAgICAgICBsZXQgbmV3VmFsdWU6IGFueVtdID0gVjtcbiAgICAgICAgICAgIGlmICggQXJyYXkuaXNBcnJheShrdikgKSB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWUucHVzaCguLi5rdik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlLnB1c2goa3YpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgbmV3VmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihWLCBrdik7XG4gICAgICAgICAgICB0aGlzLnNldChLLCBWKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXQoSyk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBsYXN0X3BhZ2UoKTogUGFnZU5hbWUge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2xhc3RfcGFnZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbGFzdF9wYWdlKHBhZ2U6IFBhZ2VOYW1lKSB7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB2YWxpZHBhZ2VzID0gWyBcIm5ld1wiLCBcInJ1bm5pbmdcIiwgXCJyZWNvcmRcIiwgXCJmaWxlX3Rvb2xzXCIsIFwic2V0dGluZ3NcIiBdO1xuICAgICAgICBpZiAoICF2YWxpZHBhZ2VzLmluY2x1ZGVzKHBhZ2UpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGFzdF9wYWdlKFwiJHtwYWdlfVwiKSwgbXVzdCBiZSBvbmUgb2YgJHt2YWxpZHBhZ2VzLmpvaW4oJywgJyl9LiBzZXR0aW5nIHRvIG5ld2ApO1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xhc3RfcGFnZScsICduZXcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCBwYWdlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkXG4gICAgICogU2hvdWxkIGJlIHVzZWQgaW5zdGVhZCBvZiBTdWJjb25maWcgY29uc3RydWN0b3IuXG4gICAgICogVXBkYXRlcyBgZXhhbV9maWxlYCBvciBgdGVzdF9maWxlYCwgaW4gZmlsZSBhbmQgaW4gY2FjaGUuIEFsc28gaW5pdGlhbGl6ZXMgYW5kIGNhY2hlcyBhIG5ldyBTdWJjb25maWcgKHRoaXMuZXhhbSA9IG5ldyBTdWJjb25maWcoLi4uKSkuICovXG4gICAgc2V0U3ViY29uZmlnKG5hbWVXaXRoRXh0OiBzdHJpbmcsIHN1YmNvbmZpZz86IFN1YmNvbmZpZykge1xuICAgICAgICAvLyBjb25zdCBbIGZpbGVuYW1lLCBleHQgXSA9IG15ZnMuc3BsaXRfZXh0KG5hbWVXaXRoRXh0KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIFN1YmNvbmZpZy52YWxpZGF0ZU5hbWUobmFtZVdpdGhFeHQpO1xuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIGlmICggZS5tZXNzYWdlID09PSAnRXh0ZW5zaW9uRXJyb3InICkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oYHNldCBzZXRTdWJjb25maWcgKCR7bmFtZVdpdGhFeHR9KSBoYXMgbm8gZXh0ZW5zaW9uLCBvciBleHQgaXMgYmFkLiBub3Qgc2V0dGluZ2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCBlLm1lc3NhZ2UgPT09ICdCYXNlbmFtZUVycm9yJyApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUobmFtZVdpdGhFeHQpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0U3ViY29uZmlnKCR7bmFtZVdpdGhFeHR9KSwgcGFzc2VkIGEgcGF0aCAod2l0aCBzbGFoZXMpLiBuZWVkIG9ubHkgYSBiYXNlbmFtZS5leHQuIGNvbnRpbnVpbmcgd2l0aCBvbmx5IGJhc2VuYW1lOiAke2Jhc2VuYW1lfWApO1xuICAgICAgICAgICAgICAgIG5hbWVXaXRoRXh0ID0gYmFzZW5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKG5hbWVXaXRoRXh0KTtcbiAgICAgICAgLy8vLyBFeHRlbnNpb24gYW5kIGZpbGUgbmFtZSBva1xuICAgICAgICBjb25zdCBzdWJjZmdUeXBlID0gZXh0LnNsaWNlKDEpIGFzIEV4cGVyaW1lbnRUeXBlO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHN1YmNvbmZpZ0tleSA9IGAke3N1YmNmZ1R5cGV9X2ZpbGVgIGFzIFwiZXhhbV9maWxlXCIgfCBcInRlc3RfZmlsZVwiO1xuICAgICAgICAvLy8vIHRoaXMuc2V0KCdleGFtX2ZpbGUnLCAnZnVyX2VsaXNlX0IuZXhhbScpXG4gICAgICAgIHRoaXMuc2V0KHN1YmNvbmZpZ0tleSwgbmFtZVdpdGhFeHQpO1xuICAgICAgICB0aGlzLmNhY2hlW3N1YmNvbmZpZ0tleV0gPSBuYW1lV2l0aEV4dDtcbiAgICAgICAgY29uc29sZS5sb2coYHNldFN1YmNvbmZpZ2AsIHtcbiAgICAgICAgICAgIG5hbWVXaXRoRXh0LFxuICAgICAgICAgICAgc3ViY29uZmlnLFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vLy8gdGhpcy5leGFtID0gbmV3IFN1YmNvbmZpZygnZnVyX2VsaXNlX0IuZXhhbScsIHN1YmNvbmZpZylcbiAgICAgICAgdGhpc1tzdWJjZmdUeXBlXSA9IG5ldyBTdWJjb25maWcobmFtZVdpdGhFeHQsIHN1YmNvbmZpZylcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0U3ViY29uZmlnKCk6IFN1YmNvbmZpZyB7XG4gICAgICAgIHJldHVybiB0aGlzW3RoaXMuZXhwZXJpbWVudF90eXBlXVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkXG4gICAgICogUmV0dXJucyB0aGUgZXhhbSBmaWxlIG5hbWUgaW5jbHVkaW5nIGV4dGVuc2lvbiovXG4gICAgZ2V0IGV4YW1fZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsICdleGFtX2ZpbGUnKTtcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuZ2V0KCdleGFtX2ZpbGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqVXBkYXRlcyBleGFtX2ZpbGUgYW5kIGFsc28gaW5pdGlhbGl6ZXMgbmV3IFN1YmNvbmZpZyovXG4gICAgc2V0IGV4YW1fZmlsZShuYW1lV2l0aEV4dDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3ViY29uZmlnKG5hbWVXaXRoRXh0KVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkXG4gICAgICogUmV0dXJucyB0aGUgdGVzdCBmaWxlIG5hbWUgaW5jbHVkaW5nIGV4dGVuc2lvbiovXG4gICAgZ2V0IHRlc3RfZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsICd0ZXN0X2ZpbGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIFVwZGF0ZXMgdGVzdF9maWxlIGFuZCBhbHNvIGluaXRpYWxpemVzIG5ldyBTdWJjb25maWcqL1xuICAgIHNldCB0ZXN0X2ZpbGUobmFtZVdpdGhFeHQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldFN1YmNvbmZpZyhuYW1lV2l0aEV4dClcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIENhbiBiZSBnb3R0ZW4gYWxzbyB3aXRoIGBzdWJjb25maWcudHlwZWAqL1xuICAgIGdldCBleHBlcmltZW50X3R5cGUoKTogRXhwZXJpbWVudFR5cGUge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiZXhwZXJpbWVudF90eXBlXCIpXG4gICAgICAgIC8qaWYgKCB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgY29uc3QgZXhwZXJpbWVudFR5cGUgPSB0aGlzLmdldCgnZXhwZXJpbWVudF90eXBlJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgcmV0dXJuIGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZTtcbiAgICAgICAgIH0qL1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgZXhwZXJpbWVudF90eXBlKGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBpZiAoICFbICdleGFtJywgJ3Rlc3QnIF0uaW5jbHVkZXMoZXhwZXJpbWVudFR5cGUpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBCaWdDb25maWcgZXhwZXJpbWVudF90eXBlIHNldHRlciwgZ290IGV4cGVyaW1lbnRUeXBlOiAnJHtleHBlcmltZW50VHlwZX0nLiBNdXN0IGJlIGVpdGhlciAndGVzdCcgb3IgJ2V4YW0nLiBzZXR0aW5nIHRvIHRlc3RgKTtcbiAgICAgICAgICAgIGV4cGVyaW1lbnRUeXBlID0gJ3Rlc3QnO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KCdleHBlcmltZW50X3R5cGUnLCBleHBlcmltZW50VHlwZSk7XG4gICAgICAgIHRoaXMuY2FjaGUuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgZ2V0IHN1YmplY3RzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdzdWJqZWN0cycpO1xuICAgIH1cbiAgICBcbiAgICAvKipFbnN1cmVzIGhhdmluZyBgdGhpcy50ZXN0LnN1YmplY3RgIGFuZCBgdGhpcy5leGFtLnN1YmplY3RgIGluIHRoZSBsaXN0IHJlZ2FyZGxlc3MqL1xuICAgIHNldCBzdWJqZWN0cyhzdWJqZWN0TGlzdDogc3RyaW5nW10pIHtcbiAgICAgICAgLy8gVE9ETzogY2hlY2sgZm9yIG5vbiBleGlzdGluZyBmcm9tIGZpbGVzXG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2Fybignc2V0IHN1YmplY3RzLCBEUllSVU4uIHJldHVybmluZycpXG4gICAgICAgIH1cbiAgICAgICAgc3ViamVjdExpc3QucHVzaCh0aGlzLnRlc3Quc3ViamVjdCk7XG4gICAgICAgIHN1YmplY3RMaXN0LnB1c2godGhpcy5leGFtLnN1YmplY3QpO1xuICAgICAgICBjb25zdCBzdWJqZWN0cyA9IFsgLi4ubmV3IFNldChzdWJqZWN0TGlzdCkgXS5maWx0ZXIoYm9vbCk7XG4gICAgICAgIHRoaXMuc2V0KCdzdWJqZWN0cycsIHN1YmplY3RzKTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8vIGdldCBkZXYoKTogeyBbSyBpbiBrZXlvZiBEZXZPcHRpb25zXTogRGV2T3B0aW9uc1tLXSBleHRlbmRzIG9iamVjdCA/IHsgW1NLIGluIGtleW9mIERldk9wdGlvbnNbS11dOiAoKSA9PiBEZXZPcHRpb25zW0tdW1NLXSB9IDogKCkgPT4gRGV2T3B0aW9uc1tLXSB9IHtcbiAgICBnZXQgZGV2KCk6IHsgW0sgaW4ga2V5b2YgRGV2T3B0aW9uc106ICh3aGVyZT86IHN0cmluZykgPT4gRGV2T3B0aW9uc1tLXSB9IHtcbiAgICAgICAgY29uc3QgX2RldiA9IHRoaXMuZ2V0KCdkZXYnKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhhbmRsZUJvb2xlYW4gPSA8SyBleHRlbmRzIGtleW9mIERldk9wdGlvbnM+KGtleTogSywgd2hlcmUpOiBEZXZPcHRpb25zW0tdID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpW2tleV07XG4gICAgICAgICAgICBpZiAoIHZhbHVlICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLiR7a2V5fSAke3doZXJlfWApO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZm9yY2Vfbm90ZXNfbnVtYmVyIDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICggX2RldiApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZm9yY2Vfbm90ZXNfbnVtYmVyID0gdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5mb3JjZV9ub3Rlc19udW1iZXI7XG4gICAgICAgICAgICAgICAgICAgIGlmICggZm9yY2Vfbm90ZXNfbnVtYmVyICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLmZvcmNlX25vdGVzX251bWJlcjogJHtmb3JjZV9ub3Rlc19udW1iZXJ9YCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmb3JjZV9ub3Rlc19udW1iZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZvcmNlX3BsYXliYWNrX3JhdGUgOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCBfZGV2ICkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmb3JjZV9wbGF5YmFja19yYXRlID0gdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5mb3JjZV9wbGF5YmFja19yYXRlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIGZvcmNlX3BsYXliYWNrX3JhdGUgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuZm9yY2VfcGxheWJhY2tfcmF0ZTogJHtmb3JjZV9wbGF5YmFja19yYXRlfWApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm9yY2VfcGxheWJhY2tfcmF0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzaW11bGF0ZV90ZXN0X21vZGUgOiAod2hlcmU/OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlQm9vbGVhbihcInNpbXVsYXRlX3Rlc3RfbW9kZVwiLCB3aGVyZSk7XG4gICAgICAgICAgICAgICAgLy8gY29uc3Qgc2ltdWxhdGVfdGVzdF9tb2RlID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNpbXVsYXRlX3Rlc3RfbW9kZTtcbiAgICAgICAgICAgICAgICAvLyBpZiAoIHNpbXVsYXRlX3Rlc3RfbW9kZSApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5zaW11bGF0ZV90ZXN0X21vZGUgJHt3aGVyZX1gKTtcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gc2ltdWxhdGVfdGVzdF9tb2RlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2ltdWxhdGVfYW5pbWF0aW9uX21vZGUgOiAod2hlcmUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlQm9vbGVhbihcInNpbXVsYXRlX2FuaW1hdGlvbl9tb2RlXCIsIHdoZXJlKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zdCBzaW11bGF0ZV9hbmltYXRpb25fbW9kZSA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5zaW11bGF0ZV9hbmltYXRpb25fbW9kZTtcbiAgICAgICAgICAgICAgICAvLyBpZiAoIHNpbXVsYXRlX2FuaW1hdGlvbl9tb2RlICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNpbXVsYXRlX2FuaW1hdGlvbl9tb2RlICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHNpbXVsYXRlX2FuaW1hdGlvbl9tb2RlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2ltdWxhdGVfdmlkZW9fbW9kZSA6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNpbXVsYXRlX3ZpZGVvX21vZGUgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2ltdWxhdGVfdmlkZW9fbW9kZTtcbiAgICAgICAgICAgICAgICBpZiAoIHNpbXVsYXRlX3ZpZGVvX21vZGUgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2ltdWxhdGVfdmlkZW9fbW9kZSAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBzaW11bGF0ZV92aWRlb19tb2RlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2tpcF9mYWRlIDogKHdoZXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpcF9mYWRlID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfZmFkZTtcbiAgICAgICAgICAgICAgICBpZiAoIHNraXBfZmFkZSApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5za2lwX2ZhZGUgJHt3aGVyZX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2tpcF9mYWRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbXV0ZV9hbmltYXRpb24gOiAod2hlcmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtdXRlX2FuaW1hdGlvbiA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5tdXRlX2FuaW1hdGlvbjtcbiAgICAgICAgICAgICAgICBpZiAoIG11dGVfYW5pbWF0aW9uICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLm11dGVfYW5pbWF0aW9uICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG11dGVfYW5pbWF0aW9uO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNraXBfbWlkaV9leGlzdHNfY2hlY2sgOiAod2hlcmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwX21pZGlfZXhpc3RzX2NoZWNrID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfbWlkaV9leGlzdHNfY2hlY2s7XG4gICAgICAgICAgICAgICAgaWYgKCBza2lwX21pZGlfZXhpc3RzX2NoZWNrICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNraXBfbWlkaV9leGlzdHNfY2hlY2sgJHt3aGVyZX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2tpcF9taWRpX2V4aXN0c19jaGVjaztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBza2lwX2V4cGVyaW1lbnRfaW50cm8gOiAod2hlcmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwX2V4cGVyaW1lbnRfaW50cm8gPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9leHBlcmltZW50X2ludHJvO1xuICAgICAgICAgICAgICAgIGlmICggc2tpcF9leHBlcmltZW50X2ludHJvICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNraXBfZXhwZXJpbWVudF9pbnRybyAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX2V4cGVyaW1lbnRfaW50cm87XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2tpcF9sZXZlbF9pbnRybyA6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfbGV2ZWxfaW50cm8gPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9sZXZlbF9pbnRybztcbiAgICAgICAgICAgICAgICBpZiAoIHNraXBfbGV2ZWxfaW50cm8gKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF9sZXZlbF9pbnRybyAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX2xldmVsX2ludHJvO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrIDogKHdoZXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2sgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2s7XG4gICAgICAgICAgICAgICAgaWYgKCBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjayApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5za2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjayAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjaztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayA6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrO1xuICAgICAgICAgICAgICAgIGlmICggc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2sgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2sgJHt3aGVyZX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2s7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbm9fcmVsb2FkX29uX3N1Ym1pdCA6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vX3JlbG9hZF9vbl9zdWJtaXQgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykubm9fcmVsb2FkX29uX3N1Ym1pdDtcbiAgICAgICAgICAgICAgICBpZiAoIG5vX3JlbG9hZF9vbl9zdWJtaXQgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMubm9fcmVsb2FkX29uX3N1Ym1pdCAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBub19yZWxvYWRfb25fc3VibWl0O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0IHZlbG9jaXRpZXMoKSB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJ2ZWxvY2l0aWVzXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIHNldCB2ZWxvY2l0aWVzKHZhbDogbnVtYmVyKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBmbG9vcmVkID0gTWF0aC5mbG9vcih2YWwpO1xuICAgICAgICAgICAgaWYgKCBpc05hTihmbG9vcmVkKSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCB2ZWxvY2l0aWVzLCBNYXRoLmZsb29yKHZhbCkgaXMgTmFOOmAsIHsgdmFsLCBmbG9vcmVkIH0sICcuIG5vdCBzZXR0aW5nJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICggZmxvb3JlZCA+PSAxICYmIGZsb29yZWQgPD0gMTYgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0KCd2ZWxvY2l0aWVzJywgZmxvb3JlZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FjaGUudmVsb2NpdGllcyA9IGZsb29yZWQ7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IHZlbG9jaXRpZXMsIGJhZCByYW5nZTogJHt2YWx9LiBub3Qgc2V0dGluZ2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCB2ZWxvY2l0aWVzLCBFeGNlcHRpb24gd2hlbiB0cnlpbmcgdG8gTWF0aC5mbG9vcih2YWwpOmAsIGUpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFN1YmNvbmZpZyBleHRlbmRzIENvbmY8SVN1YmNvbmZpZz4geyAvLyBBS0EgQ29uZmlnXG4gICAgcHJpdmF0ZSByZWFkb25seSB0eXBlOiBFeHBlcmltZW50VHlwZTtcbiAgICByZWFkb25seSBjYWNoZTogUGFydGlhbDxJU3ViY29uZmlnPjtcbiAgICB0cnV0aDogVHJ1dGg7XG4gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogQHBhcmFtIG5hbWVXaXRoRXh0IC0gc2V0cyB0aGUgYG5hbWVgIGZpZWxkIGluIGZpbGVcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihuYW1lV2l0aEV4dDogc3RyaW5nLCBzdWJjb25maWc/OiBTdWJjb25maWcpIHtcbiAgICAgICAgXG4gICAgICAgIGxldCBbIGZpbGVuYW1lLCBleHQgXSA9IG15ZnMuc3BsaXRfZXh0KG5hbWVXaXRoRXh0KTtcbiAgICAgICAgaWYgKCAhWyAnLmV4YW0nLCAnLnRlc3QnIF0uaW5jbHVkZXMoZXh0KSApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU3ViY29uZmlnIGN0b3IgKCR7bmFtZVdpdGhFeHR9KSBoYXMgYmFkIG9yIG5vIGV4dGVuc2lvbmApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHR5cGUgPSBleHQuc2xpY2UoMSkgYXMgRXhwZXJpbWVudFR5cGU7XG4gICAgICAgIGxldCBkZWZhdWx0cztcbiAgICAgICAgaWYgKCBib29sKHN1YmNvbmZpZykgKSB7XG4gICAgICAgICAgICBpZiAoIHN1YmNvbmZpZy5zdG9yZSApIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0cyA9IHsgLi4uc3ViY29uZmlnLnN0b3JlLCBuYW1lIDogbmFtZVdpdGhFeHQgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdHMgPSBzdWJjb25maWc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWZhdWx0cyA9IHsgbmFtZSA6IG5hbWVXaXRoRXh0IH07XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgZmlsZUV4dGVuc2lvbiA6IHR5cGUsXG4gICAgICAgICAgICBjd2QgOiBDT05GSUdTX1BBVEhfQUJTLFxuICAgICAgICAgICAgY29uZmlnTmFtZSA6IGZpbGVuYW1lLFxuICAgICAgICAgICAgZGVmYXVsdHNcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2FjaGUgPSB7IG5hbWUgOiBuYW1lV2l0aEV4dCB9O1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICBpZiAoIGJvb2woc3ViY29uZmlnKSApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KHsgLi4uc3ViY29uZmlnLnN0b3JlLCBuYW1lIDogbmFtZVdpdGhFeHQgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy50cnV0aCA9IG5ldyBUcnV0aChteWZzLnJlbW92ZV9leHQodGhpcy50cnV0aF9maWxlKSk7XG4gICAgICAgIH0gY2F0Y2ggKCBlICkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgU3ViY29uZmlnIGNvbnN0cnVjdG9yLCBpbml0aWFsaXppbmcgbmV3IFRydXRoIGZyb20gdGhpcy50cnV0aF9maWxlIHRocmV3IGFuIGVycm9yLiBQcm9iYWJseSBiZWNhdXNlIHRoaXMudHJ1dGhfZmlsZSBpcyB1bmRlZmluZWQuIFNob3VsZCBtYXliZSBuZXN0IHVuZGVyIGlmKHN1YmNvbmZpZykgY2xhdXNlYCwgXCJ0aGlzLnRydXRoX2ZpbGVcIiwgdGhpcy50cnV0aF9maWxlLCBlKVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyB2YWxpZGF0ZU5hbWUobmFtZVdpdGhFeHQ6IHN0cmluZykge1xuICAgICAgICBsZXQgWyBmaWxlbmFtZSwgZXh0IF0gPSBteWZzLnNwbGl0X2V4dChuYW1lV2l0aEV4dCk7XG4gICAgICAgIGlmICggIVsgJy5leGFtJywgJy50ZXN0JyBdLmluY2x1ZGVzKGV4dCkgKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4dGVuc2lvbkVycm9yYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBuYW1lV2l0aEV4dCAhPT0gYCR7ZmlsZW5hbWV9JHtleHR9YCApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQmFzZW5hbWVFcnJvcicpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGRvVHJ1dGhGaWxlQ2hlY2soKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5K+IFN1YmNvbmZpZygke3RoaXMudHlwZX0pLmRvVHJ1dGhGaWxlQ2hlY2soKWApO1xuICAgICAgICBpZiAoIHRoaXMudHJ1dGgudHh0LmFsbEV4aXN0KCkgKSB7XG4gICAgICAgICAgICByZXR1cm4gTXlBbGVydC5zbWFsbC5zdWNjZXNzKGAke3RoaXMudHJ1dGgubmFtZX0udHh0LCAqX29uLnR4dCwgYW5kICpfb2ZmLnR4dCBmaWxlcyBleGlzdC5gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBbJ2Z1cl9lbGlzZV9CJyB4IDMsICdmdXJfZWxpc2VfUi50eHQnIHggMywgLi4uXVxuICAgICAgICBjb25zdCB0cnV0aHNXaXRoM1R4dEZpbGVzID0gZ2V0VHJ1dGhzV2l0aDNUeHRGaWxlcygpO1xuICAgICAgICBpZiAoICFib29sKHRydXRoc1dpdGgzVHh0RmlsZXMpIClcbiAgICAgICAgICAgIHJldHVybiBNeUFsZXJ0LmJpZy53YXJuaW5nKHtcbiAgICAgICAgICAgICAgICB0aXRsZSA6ICdObyB2YWxpZCB0cnV0aCBmaWxlcyBmb3VuZCcsXG4gICAgICAgICAgICAgICAgaHRtbCA6ICdUaGVyZSBuZWVkcyB0byBiZSBhdCBsZWFzdCBvbmUgdHh0IGZpbGUgd2l0aCBvbmUgXCJvblwiIGFuZCBvbmUgXCJvZmZcIiBjb3VudGVycGFydHMuJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIE15QWxlcnQuYmlnLmJsb2NraW5nKHtcbiAgICAgICAgICAgIHRpdGxlIDogYERpZG4ndCBmaW5kIGFsbCB0aHJlZSAudHh0IGZpbGVzIGZvciAke3RoaXMudHJ1dGgubmFtZX1gLFxuICAgICAgICAgICAgaHRtbCA6ICdUaGUgZm9sbG93aW5nIHRydXRocyBhbGwgaGF2ZSAzIHR4dCBmaWxlcy4gUGxlYXNlIGNob29zZSBvbmUgb2YgdGhlbSwgb3IgZml4IHRoZSBmaWxlcyBhbmQgcmVsb2FkLicsXG4gICAgICAgICAgICBzaG93Q2xvc2VCdXR0b24gOiB0cnVlLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBzdHJpbmdzIDogdHJ1dGhzV2l0aDNUeHRGaWxlcyxcbiAgICAgICAgICAgIGNsaWNrRm4gOiBlbCA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc3QgY29uZmlnID0gdGhpcy5jb25maWcodGhpcy5leHBlcmltZW50X3R5cGUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGV2ZWxzID0gW107XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJ1dGhfZmlsZSA9IGVsLnRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy50cnV0aF9maWxlX3BhdGggPSBuZXcgVHJ1dGgoZWwudGV4dCgpKTtcbiAgICAgICAgICAgICAgICAgICAgcmVsb2FkUGFnZSgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgICAgIE15QWxlcnQuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgTXlBbGVydC5iaWcuZXJyb3IoeyB0aXRsZSA6IGVyci5tZXNzYWdlLCBodG1sIDogJ1NvbWV0aGluZyBoYXBwZW5lZC4nIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGluY3JlYXNlKEs6IGtleW9mIElTdWJjb25maWcpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGB1c2VkIHN1YmNvbmZpZy5pbmNyZWFzZSwgVU5URVNURURgKTtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdpbmNyZWFzZSwgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBWID09PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgMSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdHlwZW9mViA9IHR5cGVvZiBWO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgaWYgKCB0eXBlb2ZWID09PSAnbnVtYmVyJyB8fCAodHlwZW9mViA9PT0gJ3N0cmluZycgJiYgVi5pc2RpZ2l0KCkpICkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICB0aGlzLnNldChLLCBNYXRoLmZsb29yKFYpICsgMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkJpZ0NvbmZpZ0NscyB0cmllZCB0byBpbmNyZWFzZSBhIHZhbHVlIHRoYXQgaXMgbm90IGEgbnVtYmVyIG5vciBhIHN0cmluZy5pc2RpZ2l0KClcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHRvSHRtbCgpOiBzdHJpbmcge1xuICAgICAgICBsZXQgbGV2ZWxzID0gdGhpcy5sZXZlbHM7XG4gICAgICAgIGxldCBsZXZlbHNIdG1sID0gYFxuICAgICAgICA8dGFibGUgY2xhc3M9XCJzdWJjb25maWctaHRtbFwiPlxuICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgIDx0aD5MZXZlbCAjPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+Tm90ZXM8L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5UcmlhbHM8L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5SaHl0aG08L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5UZW1wbzwvdGg+XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICBgO1xuICAgICAgICBmb3IgKCBsZXQgWyBpLCBsdmwgXSBvZiBlbnVtZXJhdGUobGV2ZWxzKSApIHtcbiAgICAgICAgICAgIGxldmVsc0h0bWwgKz0gYFxuICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgIDx0ZD4ke2kgKyAxfTwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkPiR7bHZsLm5vdGVzfTwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkPiR7bHZsLnRyaWFsc308L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD4ke2x2bC5yaHl0aG19PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQ+JHtsdmwudGVtcG99PC90ZD5cbiAgICAgICAgICAgIDwvdHI+YFxuICAgICAgICB9XG4gICAgICAgIGxldmVsc0h0bWwgKz0gYDwvdGFibGU+YDtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cInN1YmNvbmZpZy1odG1sXCI+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGg+S2V5PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPlZhbHVlPC90aD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRkPkFsbG93ZWQgcmh5dGhtIGRldmlhdGlvbjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3RoaXMuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9ufTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD5BbGxvd2VkIHRlbXBvIGRldmlhdGlvbjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3RoaXMuYWxsb3dlZF90ZW1wb19kZXZpYXRpb259PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRkPkRlbW8gdHlwZTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3RoaXMuZGVtb190eXBlfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD5FcnJvcnMgcGxheSByYXRlPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPiR7dGhpcy5lcnJvcnNfcGxheXJhdGV9PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRkPkZpbmlzaGVkIHRyaWFscyBjb3VudDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3RoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50fTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD5OYW1lPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPiR7dGhpcy5uYW1lfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD5TdWJqZWN0PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPiR7dGhpcy5zdWJqZWN0fTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD5UcnV0aCBmaWxlPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPiR7dGhpcy50cnV0aF9maWxlfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIDwvdGFibGU+XG5cbiAgICAgICAgICAgICR7bGV2ZWxzSHRtbH1cbiAgICAgICAgICAgIGA7XG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICB0b09iaigpOiBPbWl0PElTdWJjb25maWcsIFwibmFtZVwiPiB7IC8vIEFLQSB0b1NhdmVkQ29uZmlnXG4gICAgICAgIFxuICAgICAgICBjb25zdCBvYmogPSB0aGlzLnN0b3JlO1xuICAgICAgICBkZWxldGUgb2JqLm5hbWU7XG4gICAgICAgIHJldHVybiBvYmpcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBmcm9tU3ViY29uZmlnKHN1YmNvbmZpZzogU3ViY29uZmlnKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkgcmV0dXJuIGNvbnNvbGUud2FybignZnJvbU9iaiwgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgLy8gdGhpcy5zZXQoc3ViY29uZmlnLnRvT2JqKCkpO1xuICAgICAgICAvLyB0aGlzLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbiA9IHN1YmNvbmZpZy5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb247XG4gICAgICAgIC8vIHRoaXMuYWxsb3dlZF90ZW1wb19kZXZpYXRpb24gPSBzdWJjb25maWcuYWxsb3dlZF90ZW1wb19kZXZpYXRpb247XG4gICAgICAgIC8vIHRoaXMuZGVtb190eXBlID0gc3ViY29uZmlnLmRlbW9fdHlwZTtcbiAgICAgICAgLy8gdGhpcy5lcnJvcnNfcGxheXJhdGUgPSBzdWJjb25maWcuZXJyb3JzX3BsYXlyYXRlO1xuICAgICAgICAvLyB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudCA9IHN1YmNvbmZpZy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgICAgIC8vIHRoaXMubGV2ZWxzID0gc3ViY29uZmlnLmxldmVscztcbiAgICAgICAgLy8gdGhpcy5zdWJqZWN0ID0gc3ViY29uZmlnLnN1YmplY3Q7XG4gICAgICAgIC8vIHRoaXMudHJ1dGhfZmlsZSA9IHN1YmNvbmZpZy50cnV0aF9maWxlO1xuICAgICAgICAvLyB0aGlzLl91cGRhdGVTYXZlZEZpbGUoJ3RydXRoX2ZpbGVfcGF0aCcsIGNmZ0ZpbGUudHJ1dGhfZmlsZV9wYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIHByaXZhdGUgX3VwZGF0ZVNhdmVkRmlsZShrZXk6IGtleW9mIElTdWJjb25maWcsIHZhbHVlKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignX3VwZGF0ZVNhdmVkRmlsZSwgRFJZUlVOLiByZXR1cm5pbmcnKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ191cGRhdGVTYXZlZEZpbGUoKSBkb2VzIG5vdGhpbmcsIHJldHVybmluZycpO1xuICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgLypjb25zdCBjb25mID0gbmV3IChyZXF1aXJlKCdjb25mJykpKHtcbiAgICAgICAgIGN3ZCA6IENPTkZJR1NfUEFUSF9BQlMsXG4gICAgICAgICBjb25maWdOYW1lIDogdGhpcy5uYW1lLFxuICAgICAgICAgZmlsZUV4dGVuc2lvbiA6IHRoaXMudHlwZSxcbiAgICAgICAgIHNlcmlhbGl6ZSA6IHZhbHVlID0+IEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCA0KVxuICAgICAgICAgfSk7XG4gICAgICAgICBjb25mLnNldChrZXksIHZhbHVlKTsqL1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBwcml2YXRlIHNldERldmlhdGlvbihkZXZpYXRpb25UeXBlOiBEZXZpYXRpb25UeXBlLCBkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICBjb25zdCB0eXBlb2ZEZXZpYXRpb24gPSB0eXBlb2YgZGV2aWF0aW9uO1xuICAgICAgICBpZiAoIHR5cGVvZkRldmlhdGlvbiA9PT0gJ251bWJlcicgKSB7XG4gICAgICAgICAgICBkZXZpYXRpb24gPSBgJHtkZXZpYXRpb259JWA7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldERldmlhdGlvbiBnb3QgXCJkZXZpYXRpb25cIiB0eXBlIG51bWJlci4gYXBwZW5kZWQgXCIlXCIuIGRldmlhdGlvbiBub3c6ICR7ZGV2aWF0aW9ufWApO1xuICAgICAgICB9IGVsc2UgaWYgKCB0eXBlb2ZEZXZpYXRpb24gPT09ICdzdHJpbmcnICkge1xuICAgICAgICAgICAgaWYgKCAhZGV2aWF0aW9uLmVuZHNXaXRoKFwiJVwiKSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldERldmlhdGlvbiBnb3QgZGV2aWF0aW9uIHdpdGhvdXQgJS4gYXBwZW5kZWQgJS4gZGV2aWF0aW9uIG5vdzogXCIke2RldmlhdGlvbn1cImApO1xuICAgICAgICAgICAgICAgIGRldmlhdGlvbiA9IGAke2RldmlhdGlvbn0lYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0RGV2aWF0aW9uLCByZWNlaXZlZCBcImRldmlhdGlvblwiIG5vdCBzdHJpbmcgbm90IG51bWJlci4gcmV0dXJuaW5nLiBkZXZpYXRpb246YCwgZGV2aWF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB0aGlzLnNldChgYWxsb3dlZF8ke2RldmlhdGlvblR5cGV9X2RldmlhdGlvbmAsIGRldmlhdGlvbik7XG4gICAgICAgIHRoaXMuY2FjaGVbYGFsbG93ZWRfJHtkZXZpYXRpb25UeXBlfV9kZXZpYXRpb25gXSA9IGRldmlhdGlvbjtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0IGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJhbGxvd2VkX3RlbXBvX2RldmlhdGlvblwiKVxuICAgICAgICAvKmlmICggdGhpcy5jYWNoZS5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgY29uc3QgYWxsb3dlZFRlbXBvRGV2aWF0aW9uID0gdGhpcy5nZXQoJ2FsbG93ZWRfdGVtcG9fZGV2aWF0aW9uJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uID0gYWxsb3dlZFRlbXBvRGV2aWF0aW9uO1xuICAgICAgICAgcmV0dXJuIGFsbG93ZWRUZW1wb0RldmlhdGlvbjtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbjtcbiAgICAgICAgIH0qL1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgYWxsb3dlZF90ZW1wb19kZXZpYXRpb24oZGV2aWF0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXREZXZpYXRpb24oXCJ0ZW1wb1wiLCBkZXZpYXRpb24pO1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBnZXQgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJhbGxvd2VkX3JoeXRobV9kZXZpYXRpb25cIik7XG4gICAgICAgIC8qaWYgKCB0aGlzLmNhY2hlLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgY29uc3QgYWxsb3dlZFJoeXRobURldmlhdGlvbiA9IHRoaXMuZ2V0KCdhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24nKTtcbiAgICAgICAgIHRoaXMuY2FjaGUuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uID0gYWxsb3dlZFJoeXRobURldmlhdGlvbjtcbiAgICAgICAgIHJldHVybiBhbGxvd2VkUmh5dGhtRGV2aWF0aW9uO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbjtcbiAgICAgICAgIH0qL1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uKGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0RGV2aWF0aW9uKFwicmh5dGhtXCIsIGRldmlhdGlvbik7XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCBkZW1vX3R5cGUoKTogRGVtb1R5cGUge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiZGVtb190eXBlXCIpO1xuICAgICAgICAvLyByZXR1cm4gdGhpcy5nZXQoJ2RlbW9fdHlwZScpO1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgZGVtb190eXBlKHR5cGU6IERlbW9UeXBlKSB7XG4gICAgICAgIGlmICggIVsgJ3ZpZGVvJywgJ2FuaW1hdGlvbicgXS5pbmNsdWRlcyh0eXBlKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQ29uZmlnIGRlbW9fdHlwZSBzZXR0ZXIsIGJhZCB0eXBlID0gJHt0eXBlfSwgY2FuIGJlIGVpdGhlciB2aWRlbyBvciBhbmltYXRpb24uIE5vdCBzZXR0aW5nYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZGVtb190eXBlJywgdHlwZSk7XG4gICAgICAgICAgICB0aGlzLmNhY2hlLmRlbW9fdHlwZSA9IHR5cGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZ2V0IGVycm9yc19wbGF5cmF0ZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2Vycm9yc19wbGF5cmF0ZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZXJyb3JzX3BsYXlyYXRlKHNwZWVkOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCBpc05hTihzcGVlZCkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGNvbmZpZyBzZXQgZXJyb3JzX3BsYXlyYXRlLCByZWNlaXZlZCBiYWQgXCJzcGVlZFwiIE5hTjogJHtzcGVlZH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdlcnJvcnNfcGxheXJhdGUnLCBzcGVlZCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGdldCBmaW5pc2hlZF90cmlhbHNfY291bnQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdmaW5pc2hlZF90cmlhbHNfY291bnQnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGZpbmlzaGVkX3RyaWFsc19jb3VudChjb3VudDogbnVtYmVyKSB7XG4gICAgICAgIGlmICggaXNOYU4oY291bnQpIHx8IGNvdW50IDwgMCApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgY29uZmlnIHNldCBmaW5pc2hlZF90cmlhbHNfY291bnQsIHJlY2VpdmVkIGJhZCBcImNvdW50XCI6ICR7Y291bnR9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZmluaXNoZWRfdHJpYWxzX2NvdW50JywgY291bnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKk5hbWUgb2YgY29uZmlnIGZpbGUsIGluY2x1ZGluZyBleHRlbnNpb24uIEFsd2F5cyByZXR1cm5zIGBuYW1lYCBmcm9tIGNhY2hlLiBUaGlzIGlzIGJlY2F1c2UgdGhlcmUncyBubyBzZXR0ZXI7IGBuYW1lYCBpcyBzdG9yZWQgaW4gY2FjaGUgYXQgY29uc3RydWN0b3IuKi9cbiAgICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5uYW1lO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBnZXQgc3ViamVjdCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ3N1YmplY3QnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IHN1YmplY3QobmFtZTogc3RyaW5nIHwgbnVsbCkge1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ3NldCBzdWJqZWN0LCBEUllSVU4uIFJldHVybmluZycpO1xuICAgICAgICB9XG4gICAgICAgIGlmICggIWJvb2wobmFtZSkgKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKGBzZXQgc3ViamVjdCwgIWJvb2wobmFtZSk6ICR7bmFtZX0uIFJldHVybmluZ2ApXG4gICAgICAgIH1cbiAgICAgICAgbmFtZSA9IG5hbWUubG93ZXIoKTtcbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3QnLCBuYW1lKTtcbiAgICAgICAgY29uc3QgR2xvYiA9IHJlcXVpcmUoJy4uL0dsb2InKS5kZWZhdWx0O1xuICAgICAgICBjb25zdCBleGlzdGluZ1N1YmplY3RzID0gR2xvYi5CaWdDb25maWcuc3ViamVjdHMuZmlsdGVyKGJvb2wpO1xuICAgICAgICBjb25zb2xlLmxvZyh7IGV4aXN0aW5nU3ViamVjdHMgfSk7XG4gICAgICAgIGlmICggIWZzLmV4aXN0c1N5bmMocGF0aC5qb2luKFNVQkpFQ1RTX1BBVEhfQUJTLCBuYW1lKSkgKSB7XG4gICAgICAgICAgICBmcy5ta2RpclN5bmMocGF0aC5qb2luKFNVQkpFQ1RTX1BBVEhfQUJTLCBuYW1lKSlcbiAgICAgICAgfVxuICAgICAgICBHbG9iLkJpZ0NvbmZpZy5zdWJqZWN0cyA9IFsgLi4ubmV3IFNldChbIC4uLmV4aXN0aW5nU3ViamVjdHMsIG5hbWUgXSkgXTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIFRydXRoIGZpbGUgbmFtZSwgbm8gZXh0ZW5zaW9uKi9cbiAgICBnZXQgdHJ1dGhfZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsICd0cnV0aF9maWxlJyk7XG4gICAgICAgIC8vIHJldHVybiB0aGlzLmdldCgndHJ1dGhfZmlsZScpXG4gICAgfVxuICAgIFxuICAgIC8qKkFsc28gc2V0cyB0aGlzLnRydXRoIChtZW1vcnkpXG4gICAgICogQGNhY2hlZFxuICAgICAqIEBwYXJhbSB0cnV0aF9maWxlIC0gVHJ1dGggZmlsZSBuYW1lLCBubyBleHRlbnNpb24qL1xuICAgIHNldCB0cnV0aF9maWxlKHRydXRoX2ZpbGU6IHN0cmluZykge1xuICAgICAgICAvLyB0cnV0aF9maWxlID0gcGF0aC5iYXNlbmFtZSh0cnV0aF9maWxlKTtcbiAgICAgICAgbGV0IFsgbmFtZSwgZXh0IF0gPSBteWZzLnNwbGl0X2V4dCh0cnV0aF9maWxlKTtcbiAgICAgICAgaWYgKCBib29sKGV4dCkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCB0cnV0aF9maWxlLCBwYXNzZWQgbmFtZSBpcyBub3QgZXh0ZW5zaW9ubGVzczogJHt0cnV0aF9maWxlfS4gQ29udGludWluZyB3aXRoIFwiJHtuYW1lfVwiYCk7XG4gICAgICAgICAgICAvLyBuYW1lTm9FeHQgPSBteWZzLnJlbW92ZV9leHQobmFtZU5vRXh0KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCB0cnV0aCA9IG5ldyBUcnV0aChuYW1lKTtcbiAgICAgICAgICAgIGlmICggIXRydXRoLnR4dC5hbGxFeGlzdCgpICkge1xuICAgICAgICAgICAgICAgIE15QWxlcnQuc21hbGwud2FybmluZyhgTm90IGFsbCB0eHQgZmlsZXMgZXhpc3Q6ICR7bmFtZX1gKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50cnV0aCA9IHRydXRoO1xuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIE15QWxlcnQuc21hbGwud2FybmluZyhlKTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihlKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KGB0cnV0aF9maWxlYCwgbmFtZSk7XG4gICAgICAgIHRoaXMuY2FjaGUudHJ1dGhfZmlsZSA9IG5hbWU7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IGxldmVscygpOiBJTGV2ZWxbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnbGV2ZWxzJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBsZXZlbHMobGV2ZWxzOiBJTGV2ZWxbXSkge1xuICAgICAgICBpZiAoICFBcnJheS5pc0FycmF5KGxldmVscykgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCBsZXZlbHMsIHJlY2VpdmVkIFwibGV2ZWxzXCIgbm90IGlzQXJyYXkuIG5vdCBzZXR0aW5nIGFueXRoaW5nLiBsZXZlbHM6IGAsIGxldmVscyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBiZXR0ZXIgY2hlY2tzXG4gICAgICAgICAgICB0aGlzLnNldCgnbGV2ZWxzJywgbGV2ZWxzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBcbiAgICBjdXJyZW50VHJpYWxDb29yZHMoKTogWyBudW1iZXIsIG51bWJlciBdIHtcbiAgICAgICAgbGV0IGZsYXRUcmlhbHNMaXN0ID0gdGhpcy5sZXZlbHMubWFwKGxldmVsID0+IGxldmVsLnRyaWFscyk7XG4gICAgICAgIGZvciAoIGxldCBbIGxldmVsSW5kZXgsIHRyaWFsc051bSBdIG9mIGVudW1lcmF0ZShmbGF0VHJpYWxzTGlzdCkgKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCB0cmlhbFN1bVNvRmFyID0gc3VtKGZsYXRUcmlhbHNMaXN0LnNsaWNlKDAsIGxldmVsSW5kZXggKyAxKSk7XG4gICAgICAgICAgICBjb25zdCBmaW5pc2hlZFRyaWFsc0NvdW50ID0gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgICAgICAgICBpZiAoIHRyaWFsU3VtU29GYXIgPiBmaW5pc2hlZFRyaWFsc0NvdW50IClcbiAgICAgICAgICAgICAgICByZXR1cm4gWyBsZXZlbEluZGV4LCB0cmlhbHNOdW0gLSAodHJpYWxTdW1Tb0ZhciAtIGZpbmlzaGVkVHJpYWxzQ291bnQpIF07XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS53YXJuKFwiY3VycmVudFRyaWFsQ29vcmRzOiBvdXQgb2YgaW5kZXggZXJyb3JcIik7XG4gICAgfVxuICAgIFxuICAgIGlzRGVtb1ZpZGVvKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5kZW1vX3R5cGUgPT09ICd2aWRlbyc7XG4gICAgfVxuICAgIFxuICAgIGlzV2hvbGVUZXN0T3ZlcigpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHN1bSh0aGlzLmxldmVscy5tYXAobGV2ZWwgPT4gbGV2ZWwudHJpYWxzKSkgPT0gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgfVxuICAgIFxuICAgIGdldFN1YmplY3REaXJOYW1lcygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiBmcy5yZWFkZGlyU3luYyhTVUJKRUNUU19QQVRIX0FCUyk7XG4gICAgfVxuICAgIFxuICAgIGdldEN1cnJlbnRMZXZlbCgpOiBMZXZlbCB7XG4gICAgICAgIFxuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIHJldHVybiBuZXcgTGV2ZWwodGhpcy5sZXZlbHNbbGV2ZWxfaW5kZXhdLCBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXgpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBnZXRMZXZlbENvbGxlY3Rpb24oKTogTGV2ZWxDb2xsZWN0aW9uIHtcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICByZXR1cm4gbmV3IExldmVsQ29sbGVjdGlvbih0aGlzLmxldmVscywgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWRcbiAgICAgKiBHZXRzIHRoZSBjdXJyZW50IHRyaWFsJ3MgcGF0aCAoam9pbiB0aGlzLnRlc3RPdXRQYXRoKCkgYW5kIGxldmVsXyR7bGV2ZWxfaW5kZXh9Li4uKSwgYW5kIHJldHVybnMgYSBUcnV0aCBvZiBpdCovXG4gICAgY3JlYXRlVHJ1dGhGcm9tVHJpYWxSZXN1bHQoKTogVHJ1dGgge1xuICAgICAgICBjb25zb2xlLndhcm4oYFRoaXMgc2hvdWxkIGJlIHNvbWV3aGVyZSBlbHNlYCk7XG4gICAgICAgIGxldCBbIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCBdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgLy8gcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odGhpcy50ZXN0T3V0UGF0aCgpLCBgbGV2ZWxfJHtsZXZlbF9pbmRleH1fdHJpYWxfJHt0cmlhbF9pbmRleH1gKSk7XG4gICAgICAgIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRoaXMuZXhwZXJpbWVudE91dERpckFicygpLCBgbGV2ZWxfJHtsZXZlbF9pbmRleH1fdHJpYWxfJHt0cmlhbF9pbmRleH1gKSk7XG4gICAgfVxuICAgIFxuICAgIC8qKlwiYzpcXFN5bmNcXENvZGVcXFB5dGhvblxcUHlhbm8tcmVsZWFzZVxcc3JjXFxleHBlcmltZW50c1xcc3ViamVjdHNcXGdpbGFkXFxmdXJfZWxpc2VcIiovXG4gICAgZXhwZXJpbWVudE91dERpckFicygpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBjdXJyU3ViamVjdERpciA9IHBhdGguam9pbihTVUJKRUNUU19QQVRIX0FCUywgdGhpcy5zdWJqZWN0KTsgLy8gXCIuLi4vc3ViamVjdHMvZ2lsYWRcIlxuICAgICAgICByZXR1cm4gcGF0aC5qb2luKGN1cnJTdWJqZWN0RGlyLCB0aGlzLnRydXRoLm5hbWUpO1xuICAgIH1cbiAgICBcbiAgICBcbn1cbiJdfQ==