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
            try {
                this.test.doTruthFileCheck()
                    .then(swal => {
                    this.exam.doTruthFileCheck();
                });
            }
            catch (e) {
                console.error(`BigConfigCls ctor, error when _doTruthFileCheck:`, e);
                MyAlert_1.default.big.oneButton(`An error occured when running a truth files check. You should try to understand the problem before continuing`, { text: e.message });
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
        const subjects = [...new Set(subjectList)];
        this.set('subjects', subjects);
    }
    get dev() {
        const _dev = this.get('dev');
        return {
            skip_fade: () => {
                const skip_fade = _dev && this.get('devoptions').skip_fade;
                if (skip_fade)
                    console.warn(`devoptions.skip_fade`);
                return skip_fade;
            },
            max_animation_notes: () => {
                if (_dev) {
                    const max_animation_notes = this.get('devoptions').max_animation_notes;
                    if (max_animation_notes)
                        console.warn(`devoptions.max_animation_notes: ${max_animation_notes}`);
                    return max_animation_notes;
                }
                return null;
            },
            mute_animation: () => {
                const mute_animation = _dev && this.get('devoptions').mute_animation;
                if (mute_animation)
                    console.warn(`devoptions.mute_animation`);
                return mute_animation;
            },
            skip_midi_exists_check: () => {
                const skip_midi_exists_check = _dev && this.get('devoptions').skip_midi_exists_check;
                if (skip_midi_exists_check)
                    console.warn(`devoptions.skip_midi_exists_check`);
                return skip_midi_exists_check;
            },
            skip_whole_truth: () => {
                const skip_whole_truth = _dev && this.get('devoptions').skip_whole_truth;
                if (skip_whole_truth)
                    console.warn(`devoptions.skip_whole_truth`);
                return skip_whole_truth;
            },
            skip_level_intro: () => {
                const skip_level_intro = _dev && this.get('devoptions').skip_level_intro;
                if (skip_level_intro)
                    console.warn(`devoptions.skip_level_intro`);
                return skip_level_intro;
            },
            skip_passed_trial_feedback: () => {
                const skip_passed_trial_feedback = _dev && this.get('devoptions').skip_passed_trial_feedback;
                if (skip_passed_trial_feedback)
                    console.warn(`devoptions.skip_passed_trial_feedback`);
                return skip_passed_trial_feedback;
            },
            skip_failed_trial_feedback: () => {
                const skip_failed_trial_feedback = _dev && this.get('devoptions').skip_failed_trial_feedback;
                if (skip_failed_trial_feedback)
                    console.warn(`devoptions.skip_failed_trial_feedback`);
                return skip_failed_trial_feedback;
            },
            reload_page_on_submit: () => {
                const reload_page_on_submit = _dev && this.get('devoptions').reload_page_on_submit;
                if (reload_page_on_submit)
                    console.warn(`devoptions.reload_page_on_submit`);
                return reload_page_on_submit;
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
        if (subconfig) {
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
            return console.warn('set subject, DRYRUN');
        }
        this.set('subject', name);
        if (name) {
            const Glob = require('../Glob').default;
            Glob.BigConfig.subjects = [...new Set([...Glob.BigConfig.subjects, name])];
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFDM0Isa0NBQWdFO0FBQ2hFLG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsNkJBQTZCO0FBRTdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQWtEdEMsU0FBUyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUk7SUFDakMsSUFBSyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRztRQUNwQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzdCLE9BQU8sT0FBTyxDQUFDO0tBQ2xCO1NBQU07UUFDSCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDN0I7QUFDTCxDQUFDO0FBR0QsU0FBZ0Isa0JBQWtCLENBQUMsRUFBRSxTQUFTLEtBQTRDLEVBQUUsU0FBUyxFQUFHLFNBQVMsRUFBRTtJQUMvRyxJQUFLLFNBQVMsRUFBRztRQUNiLElBQUssU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRztZQUU3QixTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsQztRQUNELElBQUssQ0FBQyxDQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFHO1lBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLFNBQVMsNEVBQTRFLENBQUMsQ0FBQztZQUN2SCxTQUFTLEdBQUcsU0FBUyxDQUFDO1NBQ3pC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QUFDLFdBQVcsQ0FBQyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBR0Qsa0JBQWtCO1FBQ2QsSUFBSSxDQUFFLFdBQVcsRUFBRSxXQUFXLENBQUUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUM3RCxPQUFPLElBQUksdUJBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBS0QsMEJBQTBCO1FBQ3RCLE9BQU8sQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTdELE9BQU8sSUFBSSxhQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxTQUFTLFdBQVcsVUFBVSxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDekcsQ0FBQztJQUdELG1CQUFtQjtRQUNmLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0RCxDQUFDO0NBR0o7QUEvWEQsOEJBK1hDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgU3RvcmUgZnJvbSBcImVsZWN0cm9uLXN0b3JlXCI7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCBBbGVydCBmcm9tIFwiLi4vTXlBbGVydFwiO1xuaW1wb3J0IG15ZnMgZnJvbSBcIi4uL015RnNcIjtcbmltcG9ydCB7IGJvb2wsIHJlbG9hZFBhZ2UsIHN1bSwgZW51bWVyYXRlLCBhbGwgfSBmcm9tIFwiLi4vdXRpbFwiO1xuaW1wb3J0IHsgVHJ1dGggfSBmcm9tIFwiLi4vVHJ1dGhcIjtcbmltcG9ydCB7IElMZXZlbCwgTGV2ZWwsIExldmVsQ29sbGVjdGlvbiB9IGZyb20gXCIuLi9MZXZlbFwiO1xuaW1wb3J0IHsgU3dlZXRBbGVydFJlc3VsdCB9IGZyb20gXCJzd2VldGFsZXJ0MlwiO1xuaW1wb3J0ICogYXMgQ29uZiBmcm9tICdjb25mJztcblxuY29uc29sZS5sb2coJ3NyYy9CaWdDb25maWcvaW5kZXgudHMnKTtcblxuZXhwb3J0IHR5cGUgRXhwZXJpbWVudFR5cGUgPSAnZXhhbScgfCAndGVzdCc7XG5leHBvcnQgdHlwZSBEZW1vVHlwZSA9ICd2aWRlbycgfCAnYW5pbWF0aW9uJztcbmV4cG9ydCB0eXBlIFBhZ2VOYW1lID0gXCJuZXdcIiAvLyBBS0EgVExhc3RQYWdlXG4gICAgfCBcInJ1bm5pbmdcIlxuICAgIHwgXCJyZWNvcmRcIlxuICAgIHwgXCJmaWxlX3Rvb2xzXCJcbiAgICB8IFwic2V0dGluZ3NcIlxudHlwZSBEZXZpYXRpb25UeXBlID0gJ3JoeXRobScgfCAndGVtcG8nO1xuXG5cbmludGVyZmFjZSBJU3ViY29uZmlnIHtcbiAgICBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb246IHN0cmluZyxcbiAgICBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbjogc3RyaW5nLFxuICAgIGRlbW9fdHlwZTogRGVtb1R5cGUsXG4gICAgZXJyb3JzX3BsYXlyYXRlOiBudW1iZXIsXG4gICAgZmluaXNoZWRfdHJpYWxzX2NvdW50OiBudW1iZXIsXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHN1YmplY3Q6IHN0cmluZyxcbiAgICB0cnV0aF9maWxlOiBzdHJpbmcsXG4gICAgbGV2ZWxzOiBJTGV2ZWxbXSxcbn1cblxuXG5pbnRlcmZhY2UgRGV2T3B0aW9ucyB7XG4gICAgc2tpcF9mYWRlOiBib29sZWFuLFxuICAgIG1heF9hbmltYXRpb25fbm90ZXM6IG51bGwgfCBudW1iZXIsXG4gICAgbXV0ZV9hbmltYXRpb246IGJvb2xlYW4sXG4gICAgc2tpcF9taWRpX2V4aXN0c19jaGVjazogYm9vbGVhbixcbiAgICBza2lwX3dob2xlX3RydXRoOiBib29sZWFuLFxuICAgIHNraXBfbGV2ZWxfaW50cm86IGJvb2xlYW4sXG4gICAgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2s6IGJvb2xlYW4sXG4gICAgc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2s6IGJvb2xlYW4sXG4gICAgcmVsb2FkX3BhZ2Vfb25fc3VibWl0OiBib29sZWFuXG59XG5cbmludGVyZmFjZSBJQmlnQ29uZmlnIHtcbiAgICBkZXY6IGJvb2xlYW4sXG4gICAgZGV2b3B0aW9uczogRGV2T3B0aW9ucyxcbiAgICBleGFtX2ZpbGU6IHN0cmluZyxcbiAgICB0ZXN0X2ZpbGU6IHN0cmluZyxcbiAgICBleHBlcmltZW50X3R5cGU6IEV4cGVyaW1lbnRUeXBlLFxuICAgIGxhc3RfcGFnZTogUGFnZU5hbWUsXG4gICAgc3ViamVjdHM6IHN0cmluZ1tdLFxuICAgIHZlbG9jaXRpZXM6IG51bWJlcixcbn1cblxuZnVuY3Rpb24gdHJ5R2V0RnJvbUNhY2hlPFQgZXh0ZW5kcyBrZXlvZiBJQmlnQ29uZmlnPihjb25maWc6IEJpZ0NvbmZpZ0NscywgcHJvcDogVCk6IElCaWdDb25maWdbVF1cbmZ1bmN0aW9uIHRyeUdldEZyb21DYWNoZTxUIGV4dGVuZHMga2V5b2YgSVN1YmNvbmZpZz4oY29uZmlnOiBTdWJjb25maWcsIHByb3A6IFQpOiBJU3ViY29uZmlnW1RdXG5mdW5jdGlvbiB0cnlHZXRGcm9tQ2FjaGUoY29uZmlnLCBwcm9wKSB7XG4gICAgaWYgKCBjb25maWcuY2FjaGVbcHJvcF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgY29uc3QgcHJvcFZhbCA9IGNvbmZpZy5nZXQocHJvcCk7XG4gICAgICAgIGNvbmZpZy5jYWNoZVtwcm9wXSA9IHByb3BWYWw7XG4gICAgICAgIHJldHVybiBwcm9wVmFsO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjb25maWcuY2FjaGVbcHJvcF07XG4gICAgfVxufVxuXG4vKipMaXN0IG9mIHRydXRoIGZpbGUgbmFtZXMsIG5vIGV4dGVuc2lvbiovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJ1dGhGaWxlc1doZXJlKHsgZXh0ZW5zaW9uIH06IHsgZXh0ZW5zaW9uPzogJ3R4dCcgfCAnbWlkJyB8ICdtcDQnIH0gPSB7IGV4dGVuc2lvbiA6IHVuZGVmaW5lZCB9KTogc3RyaW5nW10ge1xuICAgIGlmICggZXh0ZW5zaW9uICkge1xuICAgICAgICBpZiAoIGV4dGVuc2lvbi5zdGFydHNXaXRoKCcuJykgKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBleHRlbnNpb24gPSBleHRlbnNpb24uc2xpY2UoMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCAhWyAndHh0JywgJ21pZCcsICdtcDQnIF0uaW5jbHVkZXMoZXh0ZW5zaW9uKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgdHJ1dGhGaWxlc0xpc3QoXCIke2V4dGVuc2lvbn1cIiksIG11c3QgYmUgZWl0aGVyIFsndHh0JywnbWlkJywnbXA0J10gb3Igbm90IGF0IGFsbC4gc2V0dGluZyB0byB1bmRlZmluZWRgKTtcbiAgICAgICAgICAgIGV4dGVuc2lvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBjb25zdCB0cnV0aHNEaXJQYXRoID0gdGhpcy50cnV0aHNEaXJQYXRoKCk7XG4gICAgXG4gICAgbGV0IHRydXRoRmlsZXMgPSBbIC4uLm5ldyBTZXQoZnMucmVhZGRpclN5bmMoVFJVVEhTX1BBVEhfQUJTKSkgXTtcbiAgICBsZXQgZm9ybWF0dGVkVHJ1dGhGaWxlcyA9IFtdO1xuICAgIGZvciAoIGxldCBmaWxlIG9mIHRydXRoRmlsZXMgKSB7XG4gICAgICAgIGxldCBbIG5hbWUsIGV4dCBdID0gbXlmcy5zcGxpdF9leHQoZmlsZSk7XG4gICAgICAgIGlmICggZXh0ZW5zaW9uICkge1xuICAgICAgICAgICAgaWYgKCBleHQubG93ZXIoKSA9PT0gYC4ke2V4dGVuc2lvbn1gICkge1xuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFRydXRoRmlsZXMucHVzaChuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZFRydXRoRmlsZXMucHVzaChuYW1lKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmb3JtYXR0ZWRUcnV0aEZpbGVzXG4gICAgXG59XG5cbi8qKkxpc3Qgb2YgbmFtZXMgb2YgdHh0IHRydXRoIGZpbGVzIHRoYXQgaGF2ZSB0aGVpciB3aG9sZSBcInRyaXBsZXRcIiBpbiB0YWN0LiBubyBleHRlbnNpb24qL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRydXRoc1dpdGgzVHh0RmlsZXMoKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IHR4dEZpbGVzTGlzdCA9IGdldFRydXRoRmlsZXNXaGVyZSh7IGV4dGVuc2lvbiA6ICd0eHQnIH0pO1xuICAgIGNvbnN0IHdob2xlVHh0RmlsZXMgPSBbXTtcbiAgICBmb3IgKCBsZXQgbmFtZSBvZiB0eHRGaWxlc0xpc3QgKSB7XG4gICAgICAgIGlmICggdHh0RmlsZXNMaXN0LmNvdW50KHR4dCA9PiB0eHQuc3RhcnRzV2l0aChuYW1lKSkgPj0gMyApIHtcbiAgICAgICAgICAgIHdob2xlVHh0RmlsZXMucHVzaChuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHh0RmlsZXNMaXN0LmZpbHRlcihhID0+IHR4dEZpbGVzTGlzdC5maWx0ZXIodHh0ID0+IHR4dC5zdGFydHNXaXRoKGEpKS5sZW5ndGggPj0gMyk7XG59XG5cbmV4cG9ydCBjbGFzcyBCaWdDb25maWdDbHMgZXh0ZW5kcyBTdG9yZTxJQmlnQ29uZmlnPiB7XG4gICAgdGVzdDogU3ViY29uZmlnO1xuICAgIGV4YW06IFN1YmNvbmZpZztcbiAgICByZWFkb25seSBjYWNoZTogUGFydGlhbDxJQmlnQ29uZmlnPjtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihfZG9UcnV0aEZpbGVDaGVjayA9IHRydWUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5jYWNoZSA9IHt9O1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0ID0gKC4uLmFyZ3MpID0+IGNvbnNvbGUud2FybihgRFJZUlVOLCBzZXQ6IGAsIGFyZ3MpXG4gICAgICAgIH1cbiAgICAgICAgbGV0IHRlc3ROYW1lV2l0aEV4dCA9IHRoaXMudGVzdF9maWxlO1xuICAgICAgICBsZXQgZXhhbU5hbWVXaXRoRXh0ID0gdGhpcy5leGFtX2ZpbGU7XG4gICAgICAgIGlmICggIWFsbCh0ZXN0TmFtZVdpdGhFeHQsIGV4YW1OYW1lV2l0aEV4dCkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEJpZ0NvbmZpZ0NscyBjdG9yLCBjb3VsZG50IGdldCB0ZXN0X2ZpbGUgYW5kL29yIGV4YW1fZmlsZSBmcm9tIGpzb246YCwge1xuICAgICAgICAgICAgICAgIHRlc3ROYW1lV2l0aEV4dCxcbiAgICAgICAgICAgICAgICBleGFtTmFtZVdpdGhFeHRcbiAgICAgICAgICAgIH0sICcsIGRlZmF1bHRpbmcgdG8gXCJmdXJfZWxpc2VfQi5bZXh0XVwiJyk7XG4gICAgICAgICAgICB0ZXN0TmFtZVdpdGhFeHQgPSAnZnVyX2VsaXNlX0IudGVzdCc7XG4gICAgICAgICAgICBleGFtTmFtZVdpdGhFeHQgPSAnZnVyX2VsaXNlX0IuZXhhbSc7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdWJjb25maWcodGVzdE5hbWVXaXRoRXh0KTtcbiAgICAgICAgdGhpcy5zZXRTdWJjb25maWcoZXhhbU5hbWVXaXRoRXh0KTtcbiAgICAgICAgLy8gdGhpcy50ZXN0ID0gbmV3IFN1YmNvbmZpZyh0ZXN0TmFtZVdpdGhFeHQpO1xuICAgICAgICAvLyB0aGlzLmV4YW0gPSBuZXcgU3ViY29uZmlnKGV4YW1OYW1lV2l0aEV4dCk7XG4gICAgICAgIHRoaXMuc3ViamVjdHMgPSB0aGlzLnN1YmplY3RzOyAvLyB0byBlbnN1cmUgaGF2aW5nIHN1YmNvbmZpZydzIHN1YmplY3RzXG4gICAgICAgIGlmICggX2RvVHJ1dGhGaWxlQ2hlY2sgKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMudGVzdC5kb1RydXRoRmlsZUNoZWNrKClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oc3dhbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5leGFtLmRvVHJ1dGhGaWxlQ2hlY2soKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQmlnQ29uZmlnQ2xzIGN0b3IsIGVycm9yIHdoZW4gX2RvVHJ1dGhGaWxlQ2hlY2s6YCwgZSk7XG4gICAgICAgICAgICAgICAgQWxlcnQuYmlnLm9uZUJ1dHRvbihgQW4gZXJyb3Igb2NjdXJlZCB3aGVuIHJ1bm5pbmcgYSB0cnV0aCBmaWxlcyBjaGVjay4gWW91IHNob3VsZCB0cnkgdG8gdW5kZXJzdGFuZCB0aGUgcHJvYmxlbSBiZWZvcmUgY29udGludWluZ2AsIHsgdGV4dCA6IGUubWVzc2FnZSB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBmcm9tU2F2ZWRDb25maWcoc2F2ZWRDb25maWc6IElTdWJjb25maWcsIGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdCaWdDb25maWdDbHMgdXNlZCBmcm9tU2F2ZWRDb25maWcuIEltcG9zc2libGUgdG8gbG9hZCBiaWcgZmlsZS4gUmV0dXJuaW5nJyk7XG4gICAgICAgIC8qaWYgKCBEUllSVU4gKSByZXR1cm4gY29uc29sZS5sb2coYGZyb21TYXZlZENvbmZpZywgRFJZUlVOYCk7XG4gICAgICAgICBjb25zdCB0cnV0aEZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShzYXZlZENvbmZpZy50cnV0aF9maWxlX3BhdGgsICcudHh0Jyk7XG4gICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICB0aGlzLnRydXRoX2ZpbGVfcGF0aCA9IG5ldyBUcnV0aChwYXRoLmpvaW4oVFJVVEhTX1BBVEhfQUJTLCB0cnV0aEZpbGVOYW1lKSk7XG4gICAgICAgICB0aGlzLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgdGhpcy5jb25maWcoZXhwZXJpbWVudFR5cGUpLmZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZyk7Ki9cbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGV4YW1wbGVcbiAgICAgdXBkYXRlKCdzdWJqZWN0cycsIFtuYW1lc10pXG4gICAgICovXG4gICAgdXBkYXRlKEs6IGtleW9mIElCaWdDb25maWcsIGt2UGFpcnM6IFBhcnRpYWw8SUJpZ0NvbmZpZz4pXG4gICAgdXBkYXRlKEs6IGtleW9mIElCaWdDb25maWcsIHZhbHVlczogYW55W10pXG4gICAgdXBkYXRlKEssIGt2KSB7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignQmlnQ29uZmlnLnVwZGF0ZSgpIERSWVJVTi4gcmV0dXJuaW5nJyk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IFYgPSB0aGlzLmdldChLKTtcbiAgICAgICAgaWYgKCBBcnJheS5pc0FycmF5KFYpICkge1xuICAgICAgICAgICAgbGV0IG5ld1ZhbHVlOiBhbnlbXSA9IFY7XG4gICAgICAgICAgICBpZiAoIEFycmF5LmlzQXJyYXkoa3YpICkge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlLnB1c2goLi4ua3YpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZS5wdXNoKGt2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0KEssIG5ld1ZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oViwga3YpO1xuICAgICAgICAgICAgdGhpcy5zZXQoSywgVik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KEspO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBnZXQgbGFzdF9wYWdlKCk6IFBhZ2VOYW1lIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdsYXN0X3BhZ2UnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGxhc3RfcGFnZShwYWdlOiBQYWdlTmFtZSkge1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdmFsaWRwYWdlcyA9IFsgXCJuZXdcIiwgXCJydW5uaW5nXCIsIFwicmVjb3JkXCIsIFwiZmlsZV90b29sc1wiLCBcInNldHRpbmdzXCIgXTtcbiAgICAgICAgaWYgKCAhdmFsaWRwYWdlcy5pbmNsdWRlcyhwYWdlKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IGxhc3RfcGFnZShcIiR7cGFnZX1cIiksIG11c3QgYmUgb25lIG9mICR7dmFsaWRwYWdlcy5qb2luKCcsICcpfS4gc2V0dGluZyB0byBuZXdgKTtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCAnbmV3Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnbGFzdF9wYWdlJywgcGFnZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIFNob3VsZCBiZSB1c2VkIGluc3RlYWQgb2YgU3ViY29uZmlnIGNvbnN0cnVjdG9yLlxuICAgICAqIFVwZGF0ZXMgYGV4YW1fZmlsZWAgb3IgYHRlc3RfZmlsZWAsIGluIGZpbGUgYW5kIGluIGNhY2hlLiBBbHNvIGluaXRpYWxpemVzIGFuZCBjYWNoZXMgYSBuZXcgU3ViY29uZmlnICh0aGlzLmV4YW0gPSBuZXcgU3ViY29uZmlnKC4uLikpLiAqL1xuICAgIHNldFN1YmNvbmZpZyhuYW1lV2l0aEV4dDogc3RyaW5nLCBzdWJjb25maWc/OiBTdWJjb25maWcpIHtcbiAgICAgICAgLy8gY29uc3QgWyBmaWxlbmFtZSwgZXh0IF0gPSBteWZzLnNwbGl0X2V4dChuYW1lV2l0aEV4dCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBTdWJjb25maWcudmFsaWRhdGVOYW1lKG5hbWVXaXRoRXh0KTtcbiAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgICAgICBpZiAoIGUubWVzc2FnZSA9PT0gJ0V4dGVuc2lvbkVycm9yJyApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKGBzZXQgc2V0U3ViY29uZmlnICgke25hbWVXaXRoRXh0fSkgaGFzIG5vIGV4dGVuc2lvbiwgb3IgZXh0IGlzIGJhZC4gbm90IHNldHRpbmdgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICggZS5tZXNzYWdlID09PSAnQmFzZW5hbWVFcnJvcicgKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKG5hbWVXaXRoRXh0KTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldFN1YmNvbmZpZygke25hbWVXaXRoRXh0fSksIHBhc3NlZCBhIHBhdGggKHdpdGggc2xhaGVzKS4gbmVlZCBvbmx5IGEgYmFzZW5hbWUuZXh0LiBjb250aW51aW5nIHdpdGggb25seSBiYXNlbmFtZTogJHtiYXNlbmFtZX1gKTtcbiAgICAgICAgICAgICAgICBuYW1lV2l0aEV4dCA9IGJhc2VuYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShuYW1lV2l0aEV4dCk7XG4gICAgICAgIC8vLy8gRXh0ZW5zaW9uIGFuZCBmaWxlIG5hbWUgb2tcbiAgICAgICAgY29uc3Qgc3ViY2ZnVHlwZSA9IGV4dC5zbGljZSgxKSBhcyBFeHBlcmltZW50VHlwZTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBjb25zdCBzdWJjb25maWdLZXkgPSBgJHtzdWJjZmdUeXBlfV9maWxlYCBhcyBcImV4YW1fZmlsZVwiIHwgXCJ0ZXN0X2ZpbGVcIjtcbiAgICAgICAgLy8vLyB0aGlzLnNldCgnZXhhbV9maWxlJywgJ2Z1cl9lbGlzZV9CLmV4YW0nKVxuICAgICAgICB0aGlzLnNldChzdWJjb25maWdLZXksIG5hbWVXaXRoRXh0KTtcbiAgICAgICAgdGhpcy5jYWNoZVtzdWJjb25maWdLZXldID0gbmFtZVdpdGhFeHQ7XG4gICAgICAgIGNvbnNvbGUubG9nKGBzZXRTdWJjb25maWdgLCB7XG4gICAgICAgICAgICBuYW1lV2l0aEV4dCxcbiAgICAgICAgICAgIHN1YmNvbmZpZyxcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvLy8vIHRoaXMuZXhhbSA9IG5ldyBTdWJjb25maWcoJ2Z1cl9lbGlzZV9CLmV4YW0nLCBzdWJjb25maWcpXG4gICAgICAgIHRoaXNbc3ViY2ZnVHlwZV0gPSBuZXcgU3ViY29uZmlnKG5hbWVXaXRoRXh0LCBzdWJjb25maWcpXG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldFN1YmNvbmZpZygpOiBTdWJjb25maWcge1xuICAgICAgICByZXR1cm4gdGhpc1t0aGlzLmV4cGVyaW1lbnRfdHlwZV1cbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIFJldHVybnMgdGhlIGV4YW0gZmlsZSBuYW1lIGluY2x1ZGluZyBleHRlbnNpb24qL1xuICAgIGdldCBleGFtX2ZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCAnZXhhbV9maWxlJyk7XG4gICAgICAgIC8vIHJldHVybiB0aGlzLmdldCgnZXhhbV9maWxlJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlVwZGF0ZXMgZXhhbV9maWxlIGFuZCBhbHNvIGluaXRpYWxpemVzIG5ldyBTdWJjb25maWcqL1xuICAgIHNldCBleGFtX2ZpbGUobmFtZVdpdGhFeHQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldFN1YmNvbmZpZyhuYW1lV2l0aEV4dClcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIFJldHVybnMgdGhlIHRlc3QgZmlsZSBuYW1lIGluY2x1ZGluZyBleHRlbnNpb24qL1xuICAgIGdldCB0ZXN0X2ZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCAndGVzdF9maWxlJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWRcbiAgICAgKiBVcGRhdGVzIHRlc3RfZmlsZSBhbmQgYWxzbyBpbml0aWFsaXplcyBuZXcgU3ViY29uZmlnKi9cbiAgICBzZXQgdGVzdF9maWxlKG5hbWVXaXRoRXh0OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXRTdWJjb25maWcobmFtZVdpdGhFeHQpXG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWRcbiAgICAgKiBDYW4gYmUgZ290dGVuIGFsc28gd2l0aCBgc3ViY29uZmlnLnR5cGVgKi9cbiAgICBnZXQgZXhwZXJpbWVudF90eXBlKCk6IEV4cGVyaW1lbnRUeXBlIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCBcImV4cGVyaW1lbnRfdHlwZVwiKVxuICAgICAgICAvKmlmICggdGhpcy5jYWNoZS5leHBlcmltZW50X3R5cGUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgIGNvbnN0IGV4cGVyaW1lbnRUeXBlID0gdGhpcy5nZXQoJ2V4cGVyaW1lbnRfdHlwZScpO1xuICAgICAgICAgdGhpcy5jYWNoZS5leHBlcmltZW50X3R5cGUgPSBleHBlcmltZW50VHlwZTtcbiAgICAgICAgIHJldHVybiBleHBlcmltZW50VHlwZTtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5leHBlcmltZW50X3R5cGU7XG4gICAgICAgICB9Ki9cbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IGV4cGVyaW1lbnRfdHlwZShleHBlcmltZW50VHlwZTogRXhwZXJpbWVudFR5cGUpIHtcbiAgICAgICAgaWYgKCAhWyAnZXhhbScsICd0ZXN0JyBdLmluY2x1ZGVzKGV4cGVyaW1lbnRUeXBlKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQmlnQ29uZmlnIGV4cGVyaW1lbnRfdHlwZSBzZXR0ZXIsIGdvdCBleHBlcmltZW50VHlwZTogJyR7ZXhwZXJpbWVudFR5cGV9Jy4gTXVzdCBiZSBlaXRoZXIgJ3Rlc3QnIG9yICdleGFtJy4gc2V0dGluZyB0byB0ZXN0YCk7XG4gICAgICAgICAgICBleHBlcmltZW50VHlwZSA9ICd0ZXN0JztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldCgnZXhwZXJpbWVudF90eXBlJywgZXhwZXJpbWVudFR5cGUpO1xuICAgICAgICB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGdldCBzdWJqZWN0cygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnc3ViamVjdHMnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqRW5zdXJlcyBoYXZpbmcgYHRoaXMudGVzdC5zdWJqZWN0YCBhbmQgYHRoaXMuZXhhbS5zdWJqZWN0YCBpbiB0aGUgbGlzdCByZWdhcmRsZXNzKi9cbiAgICBzZXQgc3ViamVjdHMoc3ViamVjdExpc3Q6IHN0cmluZ1tdKSB7XG4gICAgICAgIC8vIFRPRE86IGNoZWNrIGZvciBub24gZXhpc3RpbmcgZnJvbSBmaWxlc1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ3NldCBzdWJqZWN0cywgRFJZUlVOLiByZXR1cm5pbmcnKVxuICAgICAgICB9XG4gICAgICAgIHN1YmplY3RMaXN0LnB1c2godGhpcy50ZXN0LnN1YmplY3QpO1xuICAgICAgICBzdWJqZWN0TGlzdC5wdXNoKHRoaXMuZXhhbS5zdWJqZWN0KTtcbiAgICAgICAgY29uc3Qgc3ViamVjdHMgPSBbIC4uLm5ldyBTZXQoc3ViamVjdExpc3QpIF07XG4gICAgICAgIHRoaXMuc2V0KCdzdWJqZWN0cycsIHN1YmplY3RzKTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBkZXYoKTogeyBbSyBpbiBrZXlvZiBEZXZPcHRpb25zXTogKCkgPT4gRGV2T3B0aW9uc1tLXSB9IHtcbiAgICAgICAgY29uc3QgX2RldiA9IHRoaXMuZ2V0KCdkZXYnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNraXBfZmFkZSA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwX2ZhZGUgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9mYWRlO1xuICAgICAgICAgICAgICAgIGlmICggc2tpcF9mYWRlICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNraXBfZmFkZWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX2ZhZGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWF4X2FuaW1hdGlvbl9ub3RlcyA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIF9kZXYgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1heF9hbmltYXRpb25fbm90ZXMgPSB0aGlzLmdldCgnZGV2b3B0aW9ucycpLm1heF9hbmltYXRpb25fbm90ZXM7XG4gICAgICAgICAgICAgICAgICAgIGlmICggbWF4X2FuaW1hdGlvbl9ub3RlcyApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5tYXhfYW5pbWF0aW9uX25vdGVzOiAke21heF9hbmltYXRpb25fbm90ZXN9YCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXhfYW5pbWF0aW9uX25vdGVzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtdXRlX2FuaW1hdGlvbiA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtdXRlX2FuaW1hdGlvbiA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5tdXRlX2FuaW1hdGlvbjtcbiAgICAgICAgICAgICAgICBpZiAoIG11dGVfYW5pbWF0aW9uICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLm11dGVfYW5pbWF0aW9uYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG11dGVfYW5pbWF0aW9uO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNraXBfbWlkaV9leGlzdHNfY2hlY2sgOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpcF9taWRpX2V4aXN0c19jaGVjayA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX21pZGlfZXhpc3RzX2NoZWNrO1xuICAgICAgICAgICAgICAgIGlmICggc2tpcF9taWRpX2V4aXN0c19jaGVjayApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5za2lwX21pZGlfZXhpc3RzX2NoZWNrYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfbWlkaV9leGlzdHNfY2hlY2s7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2tpcF93aG9sZV90cnV0aCA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwX3dob2xlX3RydXRoID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfd2hvbGVfdHJ1dGg7XG4gICAgICAgICAgICAgICAgaWYgKCBza2lwX3dob2xlX3RydXRoICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNraXBfd2hvbGVfdHJ1dGhgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2tpcF93aG9sZV90cnV0aDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBza2lwX2xldmVsX2ludHJvIDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfbGV2ZWxfaW50cm8gPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9sZXZlbF9pbnRybztcbiAgICAgICAgICAgICAgICBpZiAoIHNraXBfbGV2ZWxfaW50cm8gKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF9sZXZlbF9pbnRyb2ApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX2xldmVsX2ludHJvO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrIDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrO1xuICAgICAgICAgICAgICAgIGlmICggc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2sgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2tgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2s7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2sgOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2sgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2s7XG4gICAgICAgICAgICAgICAgaWYgKCBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5za2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFja2ApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjaztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZWxvYWRfcGFnZV9vbl9zdWJtaXQgOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVsb2FkX3BhZ2Vfb25fc3VibWl0ID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnJlbG9hZF9wYWdlX29uX3N1Ym1pdDtcbiAgICAgICAgICAgICAgICBpZiAoIHJlbG9hZF9wYWdlX29uX3N1Ym1pdCApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5yZWxvYWRfcGFnZV9vbl9zdWJtaXRgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVsb2FkX3BhZ2Vfb25fc3VibWl0O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0IHZlbG9jaXRpZXMoKSB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJ2ZWxvY2l0aWVzXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIHNldCB2ZWxvY2l0aWVzKHZhbDogbnVtYmVyKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBmbG9vcmVkID0gTWF0aC5mbG9vcih2YWwpO1xuICAgICAgICAgICAgaWYgKCBpc05hTihmbG9vcmVkKSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCB2ZWxvY2l0aWVzLCBNYXRoLmZsb29yKHZhbCkgaXMgTmFOOmAsIHsgdmFsLCBmbG9vcmVkIH0sICcuIG5vdCBzZXR0aW5nJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICggZmxvb3JlZCA+PSAxICYmIGZsb29yZWQgPD0gMTYgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0KCd2ZWxvY2l0aWVzJywgZmxvb3JlZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FjaGUudmVsb2NpdGllcyA9IGZsb29yZWQ7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IHZlbG9jaXRpZXMsIGJhZCByYW5nZTogJHt2YWx9LiBub3Qgc2V0dGluZ2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCB2ZWxvY2l0aWVzLCBFeGNlcHRpb24gd2hlbiB0cnlpbmcgdG8gTWF0aC5mbG9vcih2YWwpOmAsIGUpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFN1YmNvbmZpZyBleHRlbmRzIENvbmY8SVN1YmNvbmZpZz4geyAvLyBBS0EgQ29uZmlnXG4gICAgcHJpdmF0ZSByZWFkb25seSB0eXBlOiBFeHBlcmltZW50VHlwZTtcbiAgICByZWFkb25seSBjYWNoZTogUGFydGlhbDxJU3ViY29uZmlnPjtcbiAgICB0cnV0aDogVHJ1dGg7XG4gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogQHBhcmFtIG5hbWVXaXRoRXh0IC0gc2V0cyB0aGUgYG5hbWVgIGZpZWxkIGluIGZpbGVcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihuYW1lV2l0aEV4dDogc3RyaW5nLCBzdWJjb25maWc/OiBTdWJjb25maWcpIHtcbiAgICAgICAgXG4gICAgICAgIGxldCBbIGZpbGVuYW1lLCBleHQgXSA9IG15ZnMuc3BsaXRfZXh0KG5hbWVXaXRoRXh0KTtcbiAgICAgICAgaWYgKCAhWyAnLmV4YW0nLCAnLnRlc3QnIF0uaW5jbHVkZXMoZXh0KSApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU3ViY29uZmlnIGN0b3IgKCR7bmFtZVdpdGhFeHR9KSBoYXMgYmFkIG9yIG5vIGV4dGVuc2lvbmApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHR5cGUgPSBleHQuc2xpY2UoMSkgYXMgRXhwZXJpbWVudFR5cGU7XG4gICAgICAgIGxldCBkZWZhdWx0cztcbiAgICAgICAgaWYgKCBib29sKHN1YmNvbmZpZykgKSB7XG4gICAgICAgICAgICBpZiAoIHN1YmNvbmZpZy5zdG9yZSApIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0cyA9IHsgLi4uc3ViY29uZmlnLnN0b3JlLCBuYW1lIDogbmFtZVdpdGhFeHQgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdHMgPSBzdWJjb25maWc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWZhdWx0cyA9IHsgbmFtZSA6IG5hbWVXaXRoRXh0IH07XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgZmlsZUV4dGVuc2lvbiA6IHR5cGUsXG4gICAgICAgICAgICBjd2QgOiBDT05GSUdTX1BBVEhfQUJTLFxuICAgICAgICAgICAgY29uZmlnTmFtZSA6IGZpbGVuYW1lLFxuICAgICAgICAgICAgZGVmYXVsdHNcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2FjaGUgPSB7IG5hbWUgOiBuYW1lV2l0aEV4dCB9O1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICBpZiAoIHN1YmNvbmZpZyApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KHsgLi4uc3ViY29uZmlnLnN0b3JlLCBuYW1lIDogbmFtZVdpdGhFeHQgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMudHJ1dGggPSBuZXcgVHJ1dGgobXlmcy5yZW1vdmVfZXh0KHRoaXMudHJ1dGhfZmlsZSkpO1xuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFN1YmNvbmZpZyBjb25zdHJ1Y3RvciwgaW5pdGlhbGl6aW5nIG5ldyBUcnV0aCBmcm9tIHRoaXMudHJ1dGhfZmlsZSB0aHJldyBhbiBlcnJvci4gUHJvYmFibHkgYmVjYXVzZSB0aGlzLnRydXRoX2ZpbGUgaXMgdW5kZWZpbmVkLiBTaG91bGQgbWF5YmUgbmVzdCB1bmRlciBpZihzdWJjb25maWcpIGNsYXVzZWAsIFwidGhpcy50cnV0aF9maWxlXCIsIHRoaXMudHJ1dGhfZmlsZSwgZSlcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBzdGF0aWMgdmFsaWRhdGVOYW1lKG5hbWVXaXRoRXh0OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IFsgZmlsZW5hbWUsIGV4dCBdID0gbXlmcy5zcGxpdF9leHQobmFtZVdpdGhFeHQpO1xuICAgICAgICBpZiAoICFbICcuZXhhbScsICcudGVzdCcgXS5pbmNsdWRlcyhleHQpICkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHRlbnNpb25FcnJvcmApO1xuICAgICAgICB9XG4gICAgICAgIGlmICggbmFtZVdpdGhFeHQgIT09IGAke2ZpbGVuYW1lfSR7ZXh0fWAgKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jhc2VuYW1lRXJyb3InKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBhc3luYyBkb1RydXRoRmlsZUNoZWNrKCk6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4ge1xuICAgICAgICBjb25zb2xlLmxvZyhg8J+SviBTdWJjb25maWcoJHt0aGlzLnR5cGV9KS5kb1RydXRoRmlsZUNoZWNrKClgKTtcbiAgICAgICAgXG4gICAgICAgIC8vIGNvbnN0IHRydXRoID0gdGhpcy5nZXRUcnV0aCgpO1xuICAgICAgICBpZiAoIHRoaXMudHJ1dGgudHh0LmFsbEV4aXN0KCkgKSB7XG4gICAgICAgICAgICByZXR1cm4gQWxlcnQuc21hbGwuc3VjY2VzcyhgJHt0aGlzLnRydXRoLm5hbWV9LnR4dCwgKl9vbi50eHQsIGFuZCAqX29mZi50eHQgZmlsZXMgZXhpc3QuYCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gWydmdXJfZWxpc2VfQicgeCAzLCAnZnVyX2VsaXNlX1IudHh0JyB4IDMsIC4uLl1cbiAgICAgICAgY29uc3QgdHJ1dGhzV2l0aDNUeHRGaWxlcyA9IGdldFRydXRoc1dpdGgzVHh0RmlsZXMoKTtcbiAgICAgICAgaWYgKCAhYm9vbCh0cnV0aHNXaXRoM1R4dEZpbGVzKSApXG4gICAgICAgICAgICByZXR1cm4gQWxlcnQuYmlnLndhcm5pbmcoe1xuICAgICAgICAgICAgICAgIHRpdGxlIDogJ05vIHZhbGlkIHRydXRoIGZpbGVzIGZvdW5kJyxcbiAgICAgICAgICAgICAgICBodG1sIDogJ1RoZXJlIG5lZWRzIHRvIGJlIGF0IGxlYXN0IG9uZSB0eHQgZmlsZSB3aXRoIG9uZSBcIm9uXCIgYW5kIG9uZSBcIm9mZlwiIGNvdW50ZXJwYXJ0cy4nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gQWxlcnQuYmlnLmJsb2NraW5nKHtcbiAgICAgICAgICAgIHRpdGxlIDogYERpZG4ndCBmaW5kIGFsbCB0aHJlZSAudHh0IGZpbGVzIGZvciAke3RoaXMudHJ1dGgubmFtZX1gLFxuICAgICAgICAgICAgaHRtbCA6ICdUaGUgZm9sbG93aW5nIHRydXRocyBhbGwgaGF2ZSAzIHR4dCBmaWxlcy4gUGxlYXNlIGNob29zZSBvbmUgb2YgdGhlbSwgb3IgZml4IHRoZSBmaWxlcyBhbmQgcmVsb2FkLicsXG4gICAgICAgICAgICBzaG93Q2xvc2VCdXR0b24gOiB0cnVlLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBzdHJpbmdzIDogdHJ1dGhzV2l0aDNUeHRGaWxlcyxcbiAgICAgICAgICAgIGNsaWNrRm4gOiBlbCA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc3QgY29uZmlnID0gdGhpcy5jb25maWcodGhpcy5leHBlcmltZW50X3R5cGUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGV2ZWxzID0gW107XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJ1dGhfZmlsZSA9IGVsLnRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy50cnV0aF9maWxlX3BhdGggPSBuZXcgVHJ1dGgoZWwudGV4dCgpKTtcbiAgICAgICAgICAgICAgICAgICAgcmVsb2FkUGFnZSgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgICAgIEFsZXJ0LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIEFsZXJ0LmJpZy5lcnJvcih7IHRpdGxlIDogZXJyLm1lc3NhZ2UsIGh0bWwgOiAnU29tZXRoaW5nIGhhcHBlbmVkLicgfSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgaW5jcmVhc2UoSzoga2V5b2YgSVN1YmNvbmZpZykge1xuICAgICAgICBjb25zb2xlLndhcm4oYHVzZWQgc3ViY29uZmlnLmluY3JlYXNlLCBVTlRFU1RFRGApO1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ2luY3JlYXNlLCBEUllSVU4uIHJldHVybmluZycpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBWID0gdGhpcy5nZXQoSyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIFYgPT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLnNldChLLCAxKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0eXBlb2ZWID0gdHlwZW9mIFY7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBpZiAoIHR5cGVvZlYgPT09ICdudW1iZXInIHx8ICh0eXBlb2ZWID09PSAnc3RyaW5nJyAmJiBWLmlzZGlnaXQoKSkgKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KEssIE1hdGguZmxvb3IoVikgKyAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiQmlnQ29uZmlnQ2xzIHRyaWVkIHRvIGluY3JlYXNlIGEgdmFsdWUgdGhhdCBpcyBub3QgYSBudW1iZXIgbm9yIGEgc3RyaW5nLmlzZGlnaXQoKVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIHRvT2JqKCk6IE9taXQ8SVN1YmNvbmZpZywgXCJuYW1lXCI+IHsgLy8gQUtBIHRvU2F2ZWRDb25maWdcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IG9iaiA9IHRoaXMuc3RvcmU7XG4gICAgICAgIGRlbGV0ZSBvYmoubmFtZTtcbiAgICAgICAgcmV0dXJuIG9ialxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZyb21TdWJjb25maWcoc3ViY29uZmlnOiBTdWJjb25maWcpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSByZXR1cm4gY29uc29sZS53YXJuKCdmcm9tT2JqLCBEUllSVU4uIHJldHVybmluZycpO1xuICAgICAgICAvLyB0aGlzLnNldChzdWJjb25maWcudG9PYmooKSk7XG4gICAgICAgIC8vIHRoaXMuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uID0gc3ViY29uZmlnLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbjtcbiAgICAgICAgLy8gdGhpcy5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbiA9IHN1YmNvbmZpZy5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbjtcbiAgICAgICAgLy8gdGhpcy5kZW1vX3R5cGUgPSBzdWJjb25maWcuZGVtb190eXBlO1xuICAgICAgICAvLyB0aGlzLmVycm9yc19wbGF5cmF0ZSA9IHN1YmNvbmZpZy5lcnJvcnNfcGxheXJhdGU7XG4gICAgICAgIC8vIHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50ID0gc3ViY29uZmlnLmZpbmlzaGVkX3RyaWFsc19jb3VudDtcbiAgICAgICAgLy8gdGhpcy5sZXZlbHMgPSBzdWJjb25maWcubGV2ZWxzO1xuICAgICAgICAvLyB0aGlzLnN1YmplY3QgPSBzdWJjb25maWcuc3ViamVjdDtcbiAgICAgICAgLy8gdGhpcy50cnV0aF9maWxlID0gc3ViY29uZmlnLnRydXRoX2ZpbGU7XG4gICAgICAgIC8vIHRoaXMuX3VwZGF0ZVNhdmVkRmlsZSgndHJ1dGhfZmlsZV9wYXRoJywgY2ZnRmlsZS50cnV0aF9maWxlX3BhdGgpO1xuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgcHJpdmF0ZSBfdXBkYXRlU2F2ZWRGaWxlKGtleToga2V5b2YgSVN1YmNvbmZpZywgdmFsdWUpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdfdXBkYXRlU2F2ZWRGaWxlLCBEUllSVU4uIHJldHVybmluZycpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignX3VwZGF0ZVNhdmVkRmlsZSgpIGRvZXMgbm90aGluZywgcmV0dXJuaW5nJyk7XG4gICAgICAgIHRoaXMuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICAvKmNvbnN0IGNvbmYgPSBuZXcgKHJlcXVpcmUoJ2NvbmYnKSkoe1xuICAgICAgICAgY3dkIDogQ09ORklHU19QQVRIX0FCUyxcbiAgICAgICAgIGNvbmZpZ05hbWUgOiB0aGlzLm5hbWUsXG4gICAgICAgICBmaWxlRXh0ZW5zaW9uIDogdGhpcy50eXBlLFxuICAgICAgICAgc2VyaWFsaXplIDogdmFsdWUgPT4gSlNPTi5zdHJpbmdpZnkodmFsdWUsIG51bGwsIDQpXG4gICAgICAgICB9KTtcbiAgICAgICAgIGNvbmYuc2V0KGtleSwgdmFsdWUpOyovXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHByaXZhdGUgc2V0RGV2aWF0aW9uKGRldmlhdGlvblR5cGU6IERldmlhdGlvblR5cGUsIGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHR5cGVvZkRldmlhdGlvbiA9IHR5cGVvZiBkZXZpYXRpb247XG4gICAgICAgIGlmICggdHlwZW9mRGV2aWF0aW9uID09PSAnbnVtYmVyJyApIHtcbiAgICAgICAgICAgIGRldmlhdGlvbiA9IGAke2RldmlhdGlvbn0lYDtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0RGV2aWF0aW9uIGdvdCBcImRldmlhdGlvblwiIHR5cGUgbnVtYmVyLiBhcHBlbmRlZCBcIiVcIi4gZGV2aWF0aW9uIG5vdzogJHtkZXZpYXRpb259YCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZkRldmlhdGlvbiA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICBpZiAoICFkZXZpYXRpb24uZW5kc1dpdGgoXCIlXCIpICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0RGV2aWF0aW9uIGdvdCBkZXZpYXRpb24gd2l0aG91dCAlLiBhcHBlbmRlZCAlLiBkZXZpYXRpb24gbm93OiBcIiR7ZGV2aWF0aW9ufVwiYCk7XG4gICAgICAgICAgICAgICAgZGV2aWF0aW9uID0gYCR7ZGV2aWF0aW9ufSVgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXREZXZpYXRpb24sIHJlY2VpdmVkIFwiZGV2aWF0aW9uXCIgbm90IHN0cmluZyBub3QgbnVtYmVyLiByZXR1cm5pbmcuIGRldmlhdGlvbjpgLCBkZXZpYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMuc2V0KGBhbGxvd2VkXyR7ZGV2aWF0aW9uVHlwZX1fZGV2aWF0aW9uYCwgZGV2aWF0aW9uKTtcbiAgICAgICAgdGhpcy5jYWNoZVtgYWxsb3dlZF8ke2RldmlhdGlvblR5cGV9X2RldmlhdGlvbmBdID0gZGV2aWF0aW9uO1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBnZXQgYWxsb3dlZF90ZW1wb19kZXZpYXRpb24oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCBcImFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uXCIpXG4gICAgICAgIC8qaWYgKCB0aGlzLmNhY2hlLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICBjb25zdCBhbGxvd2VkVGVtcG9EZXZpYXRpb24gPSB0aGlzLmdldCgnYWxsb3dlZF90ZW1wb19kZXZpYXRpb24nKTtcbiAgICAgICAgIHRoaXMuY2FjaGUuYWxsb3dlZF90ZW1wb19kZXZpYXRpb24gPSBhbGxvd2VkVGVtcG9EZXZpYXRpb247XG4gICAgICAgICByZXR1cm4gYWxsb3dlZFRlbXBvRGV2aWF0aW9uO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uO1xuICAgICAgICAgfSovXG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIHNldCBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbihkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldERldmlhdGlvbihcInRlbXBvXCIsIGRldmlhdGlvbik7XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCBcImFsbG93ZWRfcmh5dGhtX2RldmlhdGlvblwiKTtcbiAgICAgICAgLyppZiAoIHRoaXMuY2FjaGUuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICBjb25zdCBhbGxvd2VkUmh5dGhtRGV2aWF0aW9uID0gdGhpcy5nZXQoJ2FsbG93ZWRfcmh5dGhtX2RldmlhdGlvbicpO1xuICAgICAgICAgdGhpcy5jYWNoZS5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gPSBhbGxvd2VkUmh5dGhtRGV2aWF0aW9uO1xuICAgICAgICAgcmV0dXJuIGFsbG93ZWRSaHl0aG1EZXZpYXRpb247XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uO1xuICAgICAgICAgfSovXG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIHNldCBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24oZGV2aWF0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXREZXZpYXRpb24oXCJyaHl0aG1cIiwgZGV2aWF0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0IGRlbW9fdHlwZSgpOiBEZW1vVHlwZSB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJkZW1vX3R5cGVcIik7XG4gICAgICAgIC8vIHJldHVybiB0aGlzLmdldCgnZGVtb190eXBlJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIHNldCBkZW1vX3R5cGUodHlwZTogRGVtb1R5cGUpIHtcbiAgICAgICAgaWYgKCAhWyAndmlkZW8nLCAnYW5pbWF0aW9uJyBdLmluY2x1ZGVzKHR5cGUpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBDb25maWcgZGVtb190eXBlIHNldHRlciwgYmFkIHR5cGUgPSAke3R5cGV9LCBjYW4gYmUgZWl0aGVyIHZpZGVvIG9yIGFuaW1hdGlvbi4gTm90IHNldHRpbmdgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdkZW1vX3R5cGUnLCB0eXBlKTtcbiAgICAgICAgICAgIHRoaXMuY2FjaGUuZGVtb190eXBlID0gdHlwZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBnZXQgZXJyb3JzX3BsYXlyYXRlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnZXJyb3JzX3BsYXlyYXRlJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBlcnJvcnNfcGxheXJhdGUoc3BlZWQ6IG51bWJlcikge1xuICAgICAgICBpZiAoIGlzTmFOKHNwZWVkKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgY29uZmlnIHNldCBlcnJvcnNfcGxheXJhdGUsIHJlY2VpdmVkIGJhZCBcInNwZWVkXCIgTmFOOiAke3NwZWVkfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2Vycm9yc19wbGF5cmF0ZScsIHNwZWVkKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgZ2V0IGZpbmlzaGVkX3RyaWFsc19jb3VudCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2ZpbmlzaGVkX3RyaWFsc19jb3VudCcpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCBpc05hTihjb3VudCkgfHwgY291bnQgPCAwICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBjb25maWcgc2V0IGZpbmlzaGVkX3RyaWFsc19jb3VudCwgcmVjZWl2ZWQgYmFkIFwiY291bnRcIjogJHtjb3VudH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdmaW5pc2hlZF90cmlhbHNfY291bnQnLCBjb3VudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqTmFtZSBvZiBjb25maWcgZmlsZSwgaW5jbHVkaW5nIGV4dGVuc2lvbi4gQWx3YXlzIHJldHVybnMgYG5hbWVgIGZyb20gY2FjaGUuIFRoaXMgaXMgYmVjYXVzZSB0aGVyZSdzIG5vIHNldHRlcjsgYG5hbWVgIGlzIHN0b3JlZCBpbiBjYWNoZSBhdCBjb25zdHJ1Y3Rvci4qL1xuICAgIGdldCBuYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlLm5hbWU7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBzdWJqZWN0KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnc3ViamVjdCcpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgc3ViamVjdChuYW1lOiBzdHJpbmcgfCBudWxsKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2Fybignc2V0IHN1YmplY3QsIERSWVJVTicpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KCdzdWJqZWN0JywgbmFtZSk7XG4gICAgICAgIGlmICggbmFtZSApIHtcbiAgICAgICAgICAgIGNvbnN0IEdsb2IgPSByZXF1aXJlKCcuLi9HbG9iJykuZGVmYXVsdDtcbiAgICAgICAgICAgIEdsb2IuQmlnQ29uZmlnLnN1YmplY3RzID0gWyAuLi5uZXcgU2V0KFsgLi4uR2xvYi5CaWdDb25maWcuc3ViamVjdHMsIG5hbWUgXSkgXTtcbiAgICAgICAgICAgIC8vIHN1cGVyLnNldCgnc3ViamVjdHMnLCBbLi4ubmV3IFNldChbLi4uc3VwZXIuZ2V0KCdzdWJqZWN0cycpLCBuYW1lXSldKTtcbiAgICAgICAgICAgIC8vIHN1cGVyLnN1YmplY3RzID0gWyAuLi5zdXBlci5nZXQoJ3N1YmplY3RzJyksIG5hbWUgXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkXG4gICAgICogVHJ1dGggZmlsZSBuYW1lLCBubyBleHRlbnNpb24qL1xuICAgIGdldCB0cnV0aF9maWxlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgJ3RydXRoX2ZpbGUnKTtcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuZ2V0KCd0cnV0aF9maWxlJylcbiAgICB9XG4gICAgXG4gICAgLyoqQWxzbyBzZXRzIHRoaXMudHJ1dGggKG1lbW9yeSlcbiAgICAgKiBAY2FjaGVkXG4gICAgICogQHBhcmFtIHRydXRoX2ZpbGUgLSBUcnV0aCBmaWxlIG5hbWUsIG5vIGV4dGVuc2lvbiovXG4gICAgc2V0IHRydXRoX2ZpbGUodHJ1dGhfZmlsZTogc3RyaW5nKSB7XG4gICAgICAgIC8vIHRydXRoX2ZpbGUgPSBwYXRoLmJhc2VuYW1lKHRydXRoX2ZpbGUpO1xuICAgICAgICBsZXQgWyBuYW1lLCBleHQgXSA9IG15ZnMuc3BsaXRfZXh0KHRydXRoX2ZpbGUpO1xuICAgICAgICBpZiAoIGJvb2woZXh0KSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IHRydXRoX2ZpbGUsIHBhc3NlZCBuYW1lIGlzIG5vdCBleHRlbnNpb25sZXNzOiAke3RydXRoX2ZpbGV9LiBDb250aW51aW5nIHdpdGggXCIke25hbWV9XCJgKTtcbiAgICAgICAgICAgIC8vIG5hbWVOb0V4dCA9IG15ZnMucmVtb3ZlX2V4dChuYW1lTm9FeHQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHRydXRoID0gbmV3IFRydXRoKG5hbWUpO1xuICAgICAgICAgICAgaWYgKCAhdHJ1dGgudHh0LmFsbEV4aXN0KCkgKSB7XG4gICAgICAgICAgICAgICAgQWxlcnQuc21hbGwud2FybmluZyhgTm90IGFsbCB0eHQgZmlsZXMgZXhpc3Q6ICR7bmFtZX1gKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50cnV0aCA9IHRydXRoO1xuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIEFsZXJ0LnNtYWxsLndhcm5pbmcoZSk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oZSlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldChgdHJ1dGhfZmlsZWAsIG5hbWUpO1xuICAgICAgICB0aGlzLmNhY2hlLnRydXRoX2ZpbGUgPSBuYW1lO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBsZXZlbHMoKTogSUxldmVsW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2xldmVscycpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbGV2ZWxzKGxldmVsczogSUxldmVsW10pIHtcbiAgICAgICAgaWYgKCAhQXJyYXkuaXNBcnJheShsZXZlbHMpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGV2ZWxzLCByZWNlaXZlZCBcImxldmVsc1wiIG5vdCBpc0FycmF5LiBub3Qgc2V0dGluZyBhbnl0aGluZy4gbGV2ZWxzOiBgLCBsZXZlbHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVE9ETzogYmV0dGVyIGNoZWNrc1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xldmVscycsIGxldmVscyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgY3VycmVudFRyaWFsQ29vcmRzKCk6IG51bWJlcltdIHtcbiAgICAgICAgLy8gbGV0IHsgbGV2ZWxzLCBmaW5pc2hlZF90cmlhbHNfY291bnQgfSA9IHRoaXMuY29uZmlnKCk7XG4gICAgICAgIGxldCBmbGF0VHJpYWxzTGlzdCA9IHRoaXMubGV2ZWxzLm1hcChsZXZlbCA9PiBsZXZlbC50cmlhbHMpO1xuICAgICAgICBmb3IgKCBsZXQgWyBsZXZlbEluZGV4LCB0cmlhbHNOdW0gXSBvZiBlbnVtZXJhdGUoZmxhdFRyaWFsc0xpc3QpICkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgdHJpYWxTdW1Tb0ZhciA9IHN1bShmbGF0VHJpYWxzTGlzdC5zbGljZSgwLCBsZXZlbEluZGV4ICsgMSkpO1xuICAgICAgICAgICAgY29uc3QgZmluaXNoZWRUcmlhbHNDb3VudCA9IHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgICAgICAgICAgaWYgKCB0cmlhbFN1bVNvRmFyID4gZmluaXNoZWRUcmlhbHNDb3VudCApXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsgbGV2ZWxJbmRleCwgdHJpYWxzTnVtIC0gKHRyaWFsU3VtU29GYXIgLSBmaW5pc2hlZFRyaWFsc0NvdW50KSBdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUud2FybihcImN1cnJlbnRUcmlhbENvb3Jkczogb3V0IG9mIGluZGV4IGVycm9yXCIpO1xuICAgIH1cbiAgICBcbiAgICBpc0RlbW9WaWRlbygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVtb190eXBlID09PSAndmlkZW8nO1xuICAgIH1cbiAgICBcbiAgICBpc1dob2xlVGVzdE92ZXIoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBzdW0odGhpcy5sZXZlbHMubWFwKGxldmVsID0+IGxldmVsLnRyaWFscykpID09IHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgIH1cbiAgICBcbiAgICBnZXRTdWJqZWN0RGlyTmFtZXMoKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gZnMucmVhZGRpclN5bmMoU1VCSkVDVFNfUEFUSF9BQlMpO1xuICAgIH1cbiAgICBcbiAgICBnZXRDdXJyZW50TGV2ZWwoKTogTGV2ZWwge1xuICAgICAgICBcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICByZXR1cm4gbmV3IExldmVsKHRoaXMubGV2ZWxzW2xldmVsX2luZGV4XSwgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0TGV2ZWxDb2xsZWN0aW9uKCk6IExldmVsQ29sbGVjdGlvbiB7XG4gICAgICAgIGxldCBbIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCBdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBMZXZlbENvbGxlY3Rpb24odGhpcy5sZXZlbHMsIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkXG4gICAgICogR2V0cyB0aGUgY3VycmVudCB0cmlhbCdzIHBhdGggKGpvaW4gdGhpcy50ZXN0T3V0UGF0aCgpIGFuZCBsZXZlbF8ke2xldmVsX2luZGV4fS4uLiksIGFuZCByZXR1cm5zIGEgVHJ1dGggb2YgaXQqL1xuICAgIGNyZWF0ZVRydXRoRnJvbVRyaWFsUmVzdWx0KCk6IFRydXRoIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBUaGlzIHNob3VsZCBiZSBzb21ld2hlcmUgZWxzZWApO1xuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIC8vIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRoaXMudGVzdE91dFBhdGgoKSwgYGxldmVsXyR7bGV2ZWxfaW5kZXh9X3RyaWFsXyR7dHJpYWxfaW5kZXh9YCkpO1xuICAgICAgICByZXR1cm4gbmV3IFRydXRoKHBhdGguam9pbih0aGlzLmV4cGVyaW1lbnRPdXREaXJBYnMoKSwgYGxldmVsXyR7bGV2ZWxfaW5kZXh9X3RyaWFsXyR7dHJpYWxfaW5kZXh9YCkpO1xuICAgIH1cbiAgICBcbiAgICAvKipcImM6XFxTeW5jXFxDb2RlXFxQeXRob25cXFB5YW5vLXJlbGVhc2VcXHNyY1xcZXhwZXJpbWVudHNcXHN1YmplY3RzXFxnaWxhZFxcZnVyX2VsaXNlXCIqL1xuICAgIGV4cGVyaW1lbnRPdXREaXJBYnMoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY3VyclN1YmplY3REaXIgPSBwYXRoLmpvaW4oU1VCSkVDVFNfUEFUSF9BQlMsIHRoaXMuc3ViamVjdCk7IC8vIFwiLi4uL3N1YmplY3RzL2dpbGFkXCJcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbihjdXJyU3ViamVjdERpciwgdGhpcy50cnV0aC5uYW1lKTtcbiAgICB9XG4gICAgXG4gICAgXG59XG4iXX0=