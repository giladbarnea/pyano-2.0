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
        this.test = new Subconfig(this.test_file, "test");
        this.exam = new Subconfig(this.exam_file, "exam");
        this.subjects = this.subjects;
        if (_doTruthFileCheck) {
            this.test.doTruthFileCheck()
                .then(swal => {
                this.exam.doTruthFileCheck();
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
    setSubconfig(file, subcfgType, subconfig) {
        var _a;
        const subconfigKey = `${subcfgType}_file`;
        let basename = path.basename(file);
        if (file !== basename) {
            console.warn(`set ${subcfgType}_file(${file}), passed NOT a basename (no dirs). continuing with only basename`);
        }
        const ext = path.extname(basename);
        if (!util_1.bool(ext)) {
            console.warn(`set ${subcfgType}_file(${file}) has no extension. adding .${subcfgType}`);
            basename += `.${subcfgType}`;
        }
        else if (ext !== `.${subcfgType}`) {
            console.warn(`set ${subcfgType}_file(${file}) bad extension: "${ext}". replacing with .${subcfgType}`);
            basename = MyFs_1.default.replace_ext(basename, `.${subcfgType}`);
        }
        this.set(subconfigKey, basename);
        console.log(`setSubconfig`, { file, basename, subcfgType, subconfig, "subconfig.store": (_a = subconfig) === null || _a === void 0 ? void 0 : _a.store, });
        this[subcfgType] = new Subconfig(basename, subcfgType, subconfig);
    }
    getSubconfig() {
        return this[this.experiment_type];
    }
    get exam_file() {
        return this.get('exam_file');
    }
    set exam_file(file) {
        this.setSubconfig(file, "exam");
    }
    get test_file() {
        return this.get('test_file');
    }
    set test_file(file) {
        this.setSubconfig(file, "test");
    }
    get experiment_type() {
        return tryGetFromCache(this, "experiment_type");
    }
    set experiment_type(experimentType) {
        if (experimentType !== 'test' && experimentType !== 'exam') {
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
            skip_midi_exists_check: () => _dev && this.get('devoptions').skip_midi_exists_check,
            skip_whole_truth: () => _dev && this.get('devoptions').skip_whole_truth,
            skip_level_intro: () => _dev && this.get('devoptions').skip_level_intro,
            skip_passed_trial_feedback: () => _dev && this.get('devoptions').skip_passed_trial_feedback,
            skip_failed_trial_feedback: () => _dev && this.get('devoptions').skip_failed_trial_feedback,
            reload_page_on_submit: () => _dev && this.get('devoptions').reload_page_on_submit,
        };
    }
}
exports.BigConfigCls = BigConfigCls;
class Subconfig extends Conf {
    constructor(name, type, subconfig) {
        let [filename, ext] = MyFs_1.default.split_ext(name);
        if (!ext.endsWith(type)) {
            console.warn(`Subconfig constructor, ext ("${ext}") of passed name ("${name}") isnt passed type ("${type}"). Replacing name's ext to "${type}"`);
            name = MyFs_1.default.replace_ext(name, type);
        }
        let defaults;
        if (util_1.bool(subconfig)) {
            if (subconfig.store) {
                defaults = Object.assign(Object.assign({}, subconfig.store), { name });
            }
            else {
                defaults = subconfig;
            }
        }
        else {
            defaults = { name };
        }
        super({
            fileExtension: type,
            cwd: CONFIGS_PATH_ABS,
            configName: filename,
            defaults
        });
        this.cache = { name };
        this.type = type;
        if (subconfig) {
            this.set(Object.assign(Object.assign({}, subconfig.store), { name }));
        }
        try {
            this.truth = new Truth_1.Truth(MyFs_1.default.remove_ext(this.truth_file));
        }
        catch (e) {
            console.error(`Subconfig constructor, initializing new Truth from this.truth_file threw an error. Probably because this.truth_file is undefined. Should maybe nest under if(subconfig) clause`, "this.truth_file", this.truth_file, e);
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
    trialTruth() {
        let [level_index, trial_index] = this.currentTrialCoords();
        return new Truth_1.Truth(path.join(this.testOutPath(), `level_${level_index}_trial_${trial_index}`));
    }
    testOutPath() {
        const currSubjectDir = path.join(SUBJECTS_PATH_ABS, this.subject);
        return path.join(currSubjectDir, this.truth.name);
    }
}
exports.Subconfig = Subconfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFDM0Isa0NBQTJEO0FBQzNELG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsNkJBQTZCO0FBRTdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQStDdEMsU0FBUyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUk7SUFDakMsSUFBSyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRztRQUNwQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzdCLE9BQU8sT0FBTyxDQUFDO0tBQ2xCO1NBQU07UUFDSCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDN0I7QUFDTCxDQUFDO0FBR0QsU0FBZ0Isa0JBQWtCLENBQUMsRUFBRSxTQUFTLEtBQTRDLEVBQUUsU0FBUyxFQUFHLFNBQVMsRUFBRTtJQUMvRyxJQUFLLFNBQVMsRUFBRztRQUNiLElBQUssU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRztZQUU3QixTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsQztRQUNELElBQUssQ0FBQyxDQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFHO1lBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLFNBQVMsNEVBQTRFLENBQUMsQ0FBQztZQUN2SCxTQUFTLEdBQUcsU0FBUyxDQUFDO1NBQ3pC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a0JBQWtCLEVBQUUsQ0FBQztRQUM3RCxPQUFPLElBQUksYUFBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFHRCxrQkFBa0I7UUFDZCxJQUFJLENBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzdELE9BQU8sSUFBSSx1QkFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFJRCxVQUFVO1FBQ04sSUFBSSxDQUFFLFdBQVcsRUFBRSxXQUFXLENBQUUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUU3RCxPQUFPLElBQUksYUFBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLFNBQVMsV0FBVyxVQUFVLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBR0QsV0FBVztRQUNQLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0RCxDQUFDO0NBR0o7QUFsWEQsOEJBa1hDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgU3RvcmUgZnJvbSBcImVsZWN0cm9uLXN0b3JlXCI7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCBBbGVydCBmcm9tIFwiLi4vTXlBbGVydFwiO1xuaW1wb3J0IG15ZnMgZnJvbSBcIi4uL015RnNcIjtcbmltcG9ydCB7IGJvb2wsIHJlbG9hZFBhZ2UsIHN1bSwgZW51bWVyYXRlIH0gZnJvbSBcIi4uL3V0aWxcIjtcbmltcG9ydCB7IFRydXRoIH0gZnJvbSBcIi4uL1RydXRoXCI7XG5pbXBvcnQgeyBJTGV2ZWwsIExldmVsLCBMZXZlbENvbGxlY3Rpb24gfSBmcm9tIFwiLi4vTGV2ZWxcIjtcbmltcG9ydCB7IFN3ZWV0QWxlcnRSZXN1bHQgfSBmcm9tIFwic3dlZXRhbGVydDJcIjtcbmltcG9ydCAqIGFzIENvbmYgZnJvbSAnY29uZic7XG5cbmNvbnNvbGUubG9nKCdzcmMvQmlnQ29uZmlnL2luZGV4LnRzJyk7XG5cbmV4cG9ydCB0eXBlIEV4cGVyaW1lbnRUeXBlID0gJ2V4YW0nIHwgJ3Rlc3QnO1xuZXhwb3J0IHR5cGUgRGVtb1R5cGUgPSAndmlkZW8nIHwgJ2FuaW1hdGlvbic7XG5leHBvcnQgdHlwZSBQYWdlTmFtZSA9IFwibmV3XCIgLy8gQUtBIFRMYXN0UGFnZVxuICAgIHwgXCJydW5uaW5nXCJcbiAgICB8IFwicmVjb3JkXCJcbiAgICB8IFwiZmlsZV90b29sc1wiXG4gICAgfCBcInNldHRpbmdzXCJcbnR5cGUgRGV2aWF0aW9uVHlwZSA9ICdyaHl0aG0nIHwgJ3RlbXBvJztcblxuXG5pbnRlcmZhY2UgSVN1YmNvbmZpZyB7XG4gICAgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uOiBzdHJpbmcsXG4gICAgYWxsb3dlZF90ZW1wb19kZXZpYXRpb246IHN0cmluZyxcbiAgICBkZW1vX3R5cGU6IERlbW9UeXBlLFxuICAgIGVycm9yc19wbGF5cmF0ZTogbnVtYmVyLFxuICAgIGZpbmlzaGVkX3RyaWFsc19jb3VudDogbnVtYmVyLFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzdWJqZWN0OiBzdHJpbmcsXG4gICAgdHJ1dGhfZmlsZTogc3RyaW5nLFxuICAgIGxldmVsczogSUxldmVsW10sXG59XG5cblxuaW50ZXJmYWNlIERldk9wdGlvbnMge1xuICAgIHNraXBfbWlkaV9leGlzdHNfY2hlY2s6IGJvb2xlYW4sXG4gICAgc2tpcF93aG9sZV90cnV0aDogYm9vbGVhbixcbiAgICBza2lwX2xldmVsX2ludHJvOiBib29sZWFuLFxuICAgIHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrOiBib29sZWFuLFxuICAgIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrOiBib29sZWFuLFxuICAgIHJlbG9hZF9wYWdlX29uX3N1Ym1pdDogYm9vbGVhblxufVxuXG5pbnRlcmZhY2UgSUJpZ0NvbmZpZyB7XG4gICAgZGV2OiBib29sZWFuLFxuICAgIGRldm9wdGlvbnM6IERldk9wdGlvbnMsXG4gICAgZXhhbV9maWxlOiBzdHJpbmcsXG4gICAgdGVzdF9maWxlOiBzdHJpbmcsXG4gICAgZXhwZXJpbWVudF90eXBlOiBFeHBlcmltZW50VHlwZSxcbiAgICBsYXN0X3BhZ2U6IFBhZ2VOYW1lLFxuICAgIHN1YmplY3RzOiBzdHJpbmdbXSxcbiAgICB2ZWxvY2l0aWVzOiBudW1iZXJbXSxcbn1cblxuZnVuY3Rpb24gdHJ5R2V0RnJvbUNhY2hlPFQgZXh0ZW5kcyBrZXlvZiBJQmlnQ29uZmlnPihjb25maWc6IEJpZ0NvbmZpZ0NscywgcHJvcDogVCk6IElCaWdDb25maWdbVF1cbmZ1bmN0aW9uIHRyeUdldEZyb21DYWNoZTxUIGV4dGVuZHMga2V5b2YgSVN1YmNvbmZpZz4oY29uZmlnOiBTdWJjb25maWcsIHByb3A6IFQpOiBJU3ViY29uZmlnW1RdXG5mdW5jdGlvbiB0cnlHZXRGcm9tQ2FjaGUoY29uZmlnLCBwcm9wKSB7XG4gICAgaWYgKCBjb25maWcuY2FjaGVbcHJvcF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgY29uc3QgcHJvcFZhbCA9IGNvbmZpZy5nZXQocHJvcCk7XG4gICAgICAgIGNvbmZpZy5jYWNoZVtwcm9wXSA9IHByb3BWYWw7XG4gICAgICAgIHJldHVybiBwcm9wVmFsO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjb25maWcuY2FjaGVbcHJvcF07XG4gICAgfVxufVxuXG4vKipMaXN0IG9mIHRydXRoIGZpbGUgbmFtZXMsIG5vIGV4dGVuc2lvbiovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJ1dGhGaWxlc1doZXJlKHsgZXh0ZW5zaW9uIH06IHsgZXh0ZW5zaW9uPzogJ3R4dCcgfCAnbWlkJyB8ICdtcDQnIH0gPSB7IGV4dGVuc2lvbiA6IHVuZGVmaW5lZCB9KTogc3RyaW5nW10ge1xuICAgIGlmICggZXh0ZW5zaW9uICkge1xuICAgICAgICBpZiAoIGV4dGVuc2lvbi5zdGFydHNXaXRoKCcuJykgKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBleHRlbnNpb24gPSBleHRlbnNpb24uc2xpY2UoMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCAhWyAndHh0JywgJ21pZCcsICdtcDQnIF0uaW5jbHVkZXMoZXh0ZW5zaW9uKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgdHJ1dGhGaWxlc0xpc3QoXCIke2V4dGVuc2lvbn1cIiksIG11c3QgYmUgZWl0aGVyIFsndHh0JywnbWlkJywnbXA0J10gb3Igbm90IGF0IGFsbC4gc2V0dGluZyB0byB1bmRlZmluZWRgKTtcbiAgICAgICAgICAgIGV4dGVuc2lvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBjb25zdCB0cnV0aHNEaXJQYXRoID0gdGhpcy50cnV0aHNEaXJQYXRoKCk7XG4gICAgXG4gICAgbGV0IHRydXRoRmlsZXMgPSBbIC4uLm5ldyBTZXQoZnMucmVhZGRpclN5bmMoVFJVVEhTX1BBVEhfQUJTKSkgXTtcbiAgICBsZXQgZm9ybWF0dGVkVHJ1dGhGaWxlcyA9IFtdO1xuICAgIGZvciAoIGxldCBmaWxlIG9mIHRydXRoRmlsZXMgKSB7XG4gICAgICAgIGxldCBbIG5hbWUsIGV4dCBdID0gbXlmcy5zcGxpdF9leHQoZmlsZSk7XG4gICAgICAgIGlmICggZXh0ZW5zaW9uICkge1xuICAgICAgICAgICAgaWYgKCBleHQubG93ZXIoKSA9PT0gYC4ke2V4dGVuc2lvbn1gICkge1xuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFRydXRoRmlsZXMucHVzaChuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZFRydXRoRmlsZXMucHVzaChuYW1lKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmb3JtYXR0ZWRUcnV0aEZpbGVzXG4gICAgXG59XG5cbi8qKkxpc3Qgb2YgbmFtZXMgb2YgdHh0IHRydXRoIGZpbGVzIHRoYXQgaGF2ZSB0aGVpciB3aG9sZSBcInRyaXBsZXRcIiBpbiB0YWN0LiBubyBleHRlbnNpb24qL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRydXRoc1dpdGgzVHh0RmlsZXMoKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IHR4dEZpbGVzTGlzdCA9IGdldFRydXRoRmlsZXNXaGVyZSh7IGV4dGVuc2lvbiA6ICd0eHQnIH0pO1xuICAgIGNvbnN0IHdob2xlVHh0RmlsZXMgPSBbXTtcbiAgICBmb3IgKCBsZXQgbmFtZSBvZiB0eHRGaWxlc0xpc3QgKSB7XG4gICAgICAgIGlmICggdHh0RmlsZXNMaXN0LmNvdW50KHR4dCA9PiB0eHQuc3RhcnRzV2l0aChuYW1lKSkgPj0gMyApIHtcbiAgICAgICAgICAgIHdob2xlVHh0RmlsZXMucHVzaChuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHh0RmlsZXNMaXN0LmZpbHRlcihhID0+IHR4dEZpbGVzTGlzdC5maWx0ZXIodHh0ID0+IHR4dC5zdGFydHNXaXRoKGEpKS5sZW5ndGggPj0gMyk7XG59XG5cbmV4cG9ydCBjbGFzcyBCaWdDb25maWdDbHMgZXh0ZW5kcyBTdG9yZTxJQmlnQ29uZmlnPiB7XG4gICAgdGVzdDogU3ViY29uZmlnO1xuICAgIGV4YW06IFN1YmNvbmZpZztcbiAgICByZWFkb25seSBjYWNoZTogUGFydGlhbDxJQmlnQ29uZmlnPjtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihfZG9UcnV0aEZpbGVDaGVjayA9IHRydWUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5jYWNoZSA9IHt9O1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0ID0gKC4uLmFyZ3MpID0+IGNvbnNvbGUud2FybihgRFJZUlVOLCBzZXQ6IGAsIGFyZ3MpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50ZXN0ID0gbmV3IFN1YmNvbmZpZyh0aGlzLnRlc3RfZmlsZSwgXCJ0ZXN0XCIpO1xuICAgICAgICB0aGlzLmV4YW0gPSBuZXcgU3ViY29uZmlnKHRoaXMuZXhhbV9maWxlLCBcImV4YW1cIik7XG4gICAgICAgIHRoaXMuc3ViamVjdHMgPSB0aGlzLnN1YmplY3RzOyAvLyB0byBlbnN1cmUgaGF2aW5nIHN1YmNvbmZpZydzIHN1YmplY3RzXG4gICAgICAgIGlmICggX2RvVHJ1dGhGaWxlQ2hlY2sgKSB7XG4gICAgICAgICAgICB0aGlzLnRlc3QuZG9UcnV0aEZpbGVDaGVjaygpXG4gICAgICAgICAgICAgICAgLnRoZW4oc3dhbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4YW0uZG9UcnV0aEZpbGVDaGVjaygpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZzogSVN1YmNvbmZpZywgZXhwZXJpbWVudFR5cGU6IEV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ0JpZ0NvbmZpZ0NscyB1c2VkIGZyb21TYXZlZENvbmZpZy4gSW1wb3NzaWJsZSB0byBsb2FkIGJpZyBmaWxlLiBSZXR1cm5pbmcnKTtcbiAgICAgICAgLyppZiAoIERSWVJVTiApIHJldHVybiBjb25zb2xlLmxvZyhgZnJvbVNhdmVkQ29uZmlnLCBEUllSVU5gKTtcbiAgICAgICAgIGNvbnN0IHRydXRoRmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKHNhdmVkQ29uZmlnLnRydXRoX2ZpbGVfcGF0aCwgJy50eHQnKTtcbiAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKHBhdGguam9pbihUUlVUSFNfUEFUSF9BQlMsIHRydXRoRmlsZU5hbWUpKTtcbiAgICAgICAgIHRoaXMuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgICB0aGlzLmNvbmZpZyhleHBlcmltZW50VHlwZSkuZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnKTsqL1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipAZXhhbXBsZVxuICAgICB1cGRhdGUoJ3N1YmplY3RzJywgW25hbWVzXSlcbiAgICAgKi9cbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywga3ZQYWlyczogUGFydGlhbDxJQmlnQ29uZmlnPilcbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywgdmFsdWVzOiBhbnlbXSlcbiAgICB1cGRhdGUoSywga3YpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdCaWdDb25maWcudXBkYXRlKCkgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBpZiAoIEFycmF5LmlzQXJyYXkoVikgKSB7XG4gICAgICAgICAgICBsZXQgbmV3VmFsdWU6IGFueVtdID0gVjtcbiAgICAgICAgICAgIGlmICggQXJyYXkuaXNBcnJheShrdikgKSB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWUucHVzaCguLi5rdik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlLnB1c2goa3YpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgbmV3VmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihWLCBrdik7XG4gICAgICAgICAgICB0aGlzLnNldChLLCBWKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXQoSyk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBsYXN0X3BhZ2UoKTogUGFnZU5hbWUge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2xhc3RfcGFnZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbGFzdF9wYWdlKHBhZ2U6IFBhZ2VOYW1lKSB7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB2YWxpZHBhZ2VzID0gWyBcIm5ld1wiLCBcInJ1bm5pbmdcIiwgXCJyZWNvcmRcIiwgXCJmaWxlX3Rvb2xzXCIsIFwic2V0dGluZ3NcIiBdO1xuICAgICAgICBpZiAoICF2YWxpZHBhZ2VzLmluY2x1ZGVzKHBhZ2UpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGFzdF9wYWdlKFwiJHtwYWdlfVwiKSwgbXVzdCBiZSBvbmUgb2YgJHt2YWxpZHBhZ2VzLmpvaW4oJywgJyl9LiBzZXR0aW5nIHRvIG5ld2ApO1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xhc3RfcGFnZScsICduZXcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCBwYWdlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipVcGRhdGVzIGBleGFtX2ZpbGVgIG9yIGB0ZXN0X2ZpbGVgLiBBbHNvIGluaXRpYWxpemVzIG5ldyBTdWJjb25maWcuXG4gICAgICogSGFuZGxlcyB3aXRoIHdhcm5pbmdzOiAqL1xuICAgIHNldFN1YmNvbmZpZyhmaWxlOiBzdHJpbmcsIHN1YmNmZ1R5cGU6IEV4cGVyaW1lbnRUeXBlLCBzdWJjb25maWc/OiBTdWJjb25maWcpIHtcbiAgICAgICAgY29uc3Qgc3ViY29uZmlnS2V5ID0gYCR7c3ViY2ZnVHlwZX1fZmlsZWAgYXMgXCJleGFtX2ZpbGVcIiB8IFwidGVzdF9maWxlXCI7XG4gICAgICAgIFxuICAgICAgICBsZXQgYmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGUpO1xuICAgICAgICBpZiAoIGZpbGUgIT09IGJhc2VuYW1lICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgJHtzdWJjZmdUeXBlfV9maWxlKCR7ZmlsZX0pLCBwYXNzZWQgTk9UIGEgYmFzZW5hbWUgKG5vIGRpcnMpLiBjb250aW51aW5nIHdpdGggb25seSBiYXNlbmFtZWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShiYXNlbmFtZSk7XG4gICAgICAgIGlmICggIWJvb2woZXh0KSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0ICR7c3ViY2ZnVHlwZX1fZmlsZSgke2ZpbGV9KSBoYXMgbm8gZXh0ZW5zaW9uLiBhZGRpbmcgLiR7c3ViY2ZnVHlwZX1gKTtcbiAgICAgICAgICAgIGJhc2VuYW1lICs9IGAuJHtzdWJjZmdUeXBlfWA7XG4gICAgICAgICAgICAvLyBUT0RPOiBtYXliZSBub3QgYWNjZXB0IHN1YmNmZ1R5cGUsIGJ1dCBvbmx5IGZpbGUgd2l0aCBleHRlbnNpb25cbiAgICAgICAgfSBlbHNlIGlmICggZXh0ICE9PSBgLiR7c3ViY2ZnVHlwZX1gICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgJHtzdWJjZmdUeXBlfV9maWxlKCR7ZmlsZX0pIGJhZCBleHRlbnNpb246IFwiJHtleHR9XCIuIHJlcGxhY2luZyB3aXRoIC4ke3N1YmNmZ1R5cGV9YCk7XG4gICAgICAgICAgICBiYXNlbmFtZSA9IG15ZnMucmVwbGFjZV9leHQoYmFzZW5hbWUsIGAuJHtzdWJjZmdUeXBlfWApXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoc3ViY29uZmlnS2V5LCBiYXNlbmFtZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBzZXRTdWJjb25maWdgLCB7IGZpbGUsIGJhc2VuYW1lLCBzdWJjZmdUeXBlLCBzdWJjb25maWcsIFwic3ViY29uZmlnLnN0b3JlXCIgOiBzdWJjb25maWc/LnN0b3JlLCB9KTtcbiAgICAgICAgdGhpc1tzdWJjZmdUeXBlXSA9IG5ldyBTdWJjb25maWcoYmFzZW5hbWUsIHN1YmNmZ1R5cGUsIHN1YmNvbmZpZylcbiAgICB9XG4gICAgXG4gICAgZ2V0U3ViY29uZmlnKCk6IFN1YmNvbmZpZyB7XG4gICAgICAgIHJldHVybiB0aGlzW3RoaXMuZXhwZXJpbWVudF90eXBlXVxuICAgIH1cbiAgICBcbiAgICAvKipSZXR1cm5zIHRoZSBleGFtIGZpbGUgbmFtZSBpbmNsdWRpbmcgZXh0ZW5zaW9uKi9cbiAgICBnZXQgZXhhbV9maWxlKCk6IHN0cmluZyB7XG4gICAgICAgIC8vIERvbid0IGNhY2hlOyB0aGlzLmV4YW0gaXMgYSBTdWJjb25maWdcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdleGFtX2ZpbGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqVXBkYXRlcyBleGFtX2ZpbGUgYW5kIGFsc28gaW5pdGlhbGl6ZXMgbmV3IFN1YmNvbmZpZyovXG4gICAgc2V0IGV4YW1fZmlsZShmaWxlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXRTdWJjb25maWcoZmlsZSwgXCJleGFtXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKlJldHVybnMgdGhlIHRlc3QgZmlsZSBuYW1lIGluY2x1ZGluZyBleHRlbnNpb24qL1xuICAgIGdldCB0ZXN0X2ZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgLy8gRG9uJ3QgY2FjaGU7IHRoaXMudGVzdCBpcyBhIFN1YmNvbmZpZ1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ3Rlc3RfZmlsZScpO1xuICAgIH1cbiAgICBcbiAgICAvKipVcGRhdGVzIHRlc3RfZmlsZSBhbmQgYWxzbyBpbml0aWFsaXplcyBuZXcgU3ViY29uZmlnKi9cbiAgICBzZXQgdGVzdF9maWxlKGZpbGU6IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldFN1YmNvbmZpZyhmaWxlLCBcInRlc3RcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIENhbiBiZSBnb3R0ZW4gYWxzbyB3aXRoIGBzdWJjb25maWcudHlwZWAqL1xuICAgIGdldCBleHBlcmltZW50X3R5cGUoKTogRXhwZXJpbWVudFR5cGUge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiZXhwZXJpbWVudF90eXBlXCIpXG4gICAgICAgIC8qaWYgKCB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgY29uc3QgZXhwZXJpbWVudFR5cGUgPSB0aGlzLmdldCgnZXhwZXJpbWVudF90eXBlJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgcmV0dXJuIGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZTtcbiAgICAgICAgIH0qL1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgZXhwZXJpbWVudF90eXBlKGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBpZiAoIGV4cGVyaW1lbnRUeXBlICE9PSAndGVzdCcgJiYgZXhwZXJpbWVudFR5cGUgIT09ICdleGFtJyApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQmlnQ29uZmlnIGV4cGVyaW1lbnRfdHlwZSBzZXR0ZXIsIGdvdCBleHBlcmltZW50VHlwZTogJyR7ZXhwZXJpbWVudFR5cGV9Jy4gTXVzdCBiZSBlaXRoZXIgJ3Rlc3QnIG9yICdleGFtJy4gc2V0dGluZyB0byB0ZXN0YCk7XG4gICAgICAgICAgICBleHBlcmltZW50VHlwZSA9ICd0ZXN0JztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldCgnZXhwZXJpbWVudF90eXBlJywgZXhwZXJpbWVudFR5cGUpO1xuICAgICAgICB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGdldCBzdWJqZWN0cygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnc3ViamVjdHMnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqRW5zdXJlcyBoYXZpbmcgYHRoaXMudGVzdC5zdWJqZWN0YCBhbmQgYHRoaXMuZXhhbS5zdWJqZWN0YCBpbiB0aGUgbGlzdCByZWdhcmRsZXNzKi9cbiAgICBzZXQgc3ViamVjdHMoc3ViamVjdExpc3Q6IHN0cmluZ1tdKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2Fybignc2V0IHN1YmplY3RzLCBEUllSVU4uIHJldHVybmluZycpXG4gICAgICAgIH1cbiAgICAgICAgc3ViamVjdExpc3QucHVzaCh0aGlzLnRlc3Quc3ViamVjdCk7XG4gICAgICAgIHN1YmplY3RMaXN0LnB1c2godGhpcy5leGFtLnN1YmplY3QpO1xuICAgICAgICBjb25zdCBzdWJqZWN0cyA9IFsgLi4ubmV3IFNldChzdWJqZWN0TGlzdCkgXTtcbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3RzJywgc3ViamVjdHMpO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IGRldigpOiB7IFtLIGluIGtleW9mIERldk9wdGlvbnNdOiAoKSA9PiBib29sZWFuIH0ge1xuICAgICAgICBjb25zdCBfZGV2ID0gdGhpcy5nZXQoJ2RldicpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2tpcF9taWRpX2V4aXN0c19jaGVjayA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX21pZGlfZXhpc3RzX2NoZWNrLFxuICAgICAgICAgICAgc2tpcF93aG9sZV90cnV0aCA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX3dob2xlX3RydXRoLFxuICAgICAgICAgICAgc2tpcF9sZXZlbF9pbnRybyA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX2xldmVsX2ludHJvLFxuICAgICAgICAgICAgc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2sgOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2ssXG4gICAgICAgICAgICBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayxcbiAgICAgICAgICAgIHJlbG9hZF9wYWdlX29uX3N1Ym1pdCA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5yZWxvYWRfcGFnZV9vbl9zdWJtaXQsXG4gICAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIFxufVxuXG5cbmV4cG9ydCBjbGFzcyBTdWJjb25maWcgZXh0ZW5kcyBDb25mPElTdWJjb25maWc+IHsgLy8gQUtBIENvbmZpZ1xuICAgIHByaXZhdGUgcmVhZG9ubHkgdHlwZTogRXhwZXJpbWVudFR5cGU7XG4gICAgcmVhZG9ubHkgY2FjaGU6IFBhcnRpYWw8SVN1YmNvbmZpZz47XG4gICAgdHJ1dGg6IFRydXRoO1xuICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBuYW1lIC0gaW5jbHVkaW5nIGV4dGVuc2lvbi5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIHR5cGU6IEV4cGVyaW1lbnRUeXBlLCBzdWJjb25maWc/OiBTdWJjb25maWcpIHtcbiAgICAgICAgbGV0IFsgZmlsZW5hbWUsIGV4dCBdID0gbXlmcy5zcGxpdF9leHQobmFtZSk7XG4gICAgICAgIGlmICggIWV4dC5lbmRzV2l0aCh0eXBlKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgU3ViY29uZmlnIGNvbnN0cnVjdG9yLCBleHQgKFwiJHtleHR9XCIpIG9mIHBhc3NlZCBuYW1lIChcIiR7bmFtZX1cIikgaXNudCBwYXNzZWQgdHlwZSAoXCIke3R5cGV9XCIpLiBSZXBsYWNpbmcgbmFtZSdzIGV4dCB0byBcIiR7dHlwZX1cImApO1xuICAgICAgICAgICAgbmFtZSA9IG15ZnMucmVwbGFjZV9leHQobmFtZSwgdHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGRlZmF1bHRzO1xuICAgICAgICBpZiAoIGJvb2woc3ViY29uZmlnKSApIHtcbiAgICAgICAgICAgIGlmICggc3ViY29uZmlnLnN0b3JlICkge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRzID0geyAuLi5zdWJjb25maWcuc3RvcmUsIG5hbWUgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdHMgPSBzdWJjb25maWc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWZhdWx0cyA9IHsgbmFtZSB9O1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIGZpbGVFeHRlbnNpb24gOiB0eXBlLFxuICAgICAgICAgICAgY3dkIDogQ09ORklHU19QQVRIX0FCUyxcbiAgICAgICAgICAgIGNvbmZpZ05hbWUgOiBmaWxlbmFtZSxcbiAgICAgICAgICAgIGRlZmF1bHRzXG4gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNhY2hlID0geyBuYW1lIH07XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIGlmICggc3ViY29uZmlnICkge1xuICAgICAgICAgICAgdGhpcy5zZXQoeyAuLi5zdWJjb25maWcuc3RvcmUsIG5hbWUgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMudHJ1dGggPSBuZXcgVHJ1dGgobXlmcy5yZW1vdmVfZXh0KHRoaXMudHJ1dGhfZmlsZSkpO1xuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFN1YmNvbmZpZyBjb25zdHJ1Y3RvciwgaW5pdGlhbGl6aW5nIG5ldyBUcnV0aCBmcm9tIHRoaXMudHJ1dGhfZmlsZSB0aHJldyBhbiBlcnJvci4gUHJvYmFibHkgYmVjYXVzZSB0aGlzLnRydXRoX2ZpbGUgaXMgdW5kZWZpbmVkLiBTaG91bGQgbWF5YmUgbmVzdCB1bmRlciBpZihzdWJjb25maWcpIGNsYXVzZWAsIFwidGhpcy50cnV0aF9maWxlXCIsIHRoaXMudHJ1dGhfZmlsZSwgZSlcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBhc3luYyBkb1RydXRoRmlsZUNoZWNrKCk6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4ge1xuICAgICAgICBjb25zb2xlLmxvZyhg8J+SviBTdWJjb25maWcoJHt0aGlzLnR5cGV9KS5kb1RydXRoRmlsZUNoZWNrKClgKTtcbiAgICAgICAgXG4gICAgICAgIC8vIGNvbnN0IHRydXRoID0gdGhpcy5nZXRUcnV0aCgpO1xuICAgICAgICBpZiAoIHRoaXMudHJ1dGgudHh0LmFsbEV4aXN0KCkgKSB7XG4gICAgICAgICAgICByZXR1cm4gQWxlcnQuc21hbGwuc3VjY2VzcyhgJHt0aGlzLnRydXRoLm5hbWV9LnR4dCwgKl9vbi50eHQsIGFuZCAqX29mZi50eHQgZmlsZXMgZXhpc3QuYCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gWydmdXJfZWxpc2VfQicgeCAzLCAnZnVyX2VsaXNlX1IudHh0JyB4IDMsIC4uLl1cbiAgICAgICAgY29uc3QgdHJ1dGhzV2l0aDNUeHRGaWxlcyA9IGdldFRydXRoc1dpdGgzVHh0RmlsZXMoKTtcbiAgICAgICAgaWYgKCAhYm9vbCh0cnV0aHNXaXRoM1R4dEZpbGVzKSApXG4gICAgICAgICAgICByZXR1cm4gQWxlcnQuYmlnLndhcm5pbmcoe1xuICAgICAgICAgICAgICAgIHRpdGxlIDogJ05vIHZhbGlkIHRydXRoIGZpbGVzIGZvdW5kJyxcbiAgICAgICAgICAgICAgICBodG1sIDogJ1RoZXJlIG5lZWRzIHRvIGJlIGF0IGxlYXN0IG9uZSB0eHQgZmlsZSB3aXRoIG9uZSBcIm9uXCIgYW5kIG9uZSBcIm9mZlwiIGNvdW50ZXJwYXJ0cy4nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gQWxlcnQuYmlnLmJsb2NraW5nKHtcbiAgICAgICAgICAgIHRpdGxlIDogYERpZG4ndCBmaW5kIGFsbCB0aHJlZSAudHh0IGZpbGVzIGZvciAke3RoaXMudHJ1dGgubmFtZX1gLFxuICAgICAgICAgICAgaHRtbCA6ICdUaGUgZm9sbG93aW5nIHRydXRocyBhbGwgaGF2ZSAzIHR4dCBmaWxlcy4gUGxlYXNlIGNob29zZSBvbmUgb2YgdGhlbSwgb3IgZml4IHRoZSBmaWxlcyBhbmQgcmVsb2FkLicsXG4gICAgICAgICAgICBzaG93Q2xvc2VCdXR0b24gOiB0cnVlLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBzdHJpbmdzIDogdHJ1dGhzV2l0aDNUeHRGaWxlcyxcbiAgICAgICAgICAgIGNsaWNrRm4gOiBlbCA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc3QgY29uZmlnID0gdGhpcy5jb25maWcodGhpcy5leHBlcmltZW50X3R5cGUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGV2ZWxzID0gW107XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJ1dGhfZmlsZSA9IGVsLnRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy50cnV0aF9maWxlX3BhdGggPSBuZXcgVHJ1dGgoZWwudGV4dCgpKTtcbiAgICAgICAgICAgICAgICAgICAgcmVsb2FkUGFnZSgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgICAgIEFsZXJ0LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIEFsZXJ0LmJpZy5lcnJvcih7IHRpdGxlIDogZXJyLm1lc3NhZ2UsIGh0bWwgOiAnU29tZXRoaW5nIGhhcHBlbmVkLicgfSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgaW5jcmVhc2UoSzoga2V5b2YgSVN1YmNvbmZpZykge1xuICAgICAgICBjb25zb2xlLndhcm4oYHVzZWQgc3ViY29uZmlnLmluY3JlYXNlLCBVTlRFU1RFRGApO1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ2luY3JlYXNlLCBEUllSVU4uIHJldHVybmluZycpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBWID0gdGhpcy5nZXQoSyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIFYgPT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLnNldChLLCAxKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0eXBlb2ZWID0gdHlwZW9mIFY7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBpZiAoIHR5cGVvZlYgPT09ICdudW1iZXInIHx8ICh0eXBlb2ZWID09PSAnc3RyaW5nJyAmJiBWLmlzZGlnaXQoKSkgKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KEssIE1hdGguZmxvb3IoVikgKyAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiQmlnQ29uZmlnQ2xzIHRyaWVkIHRvIGluY3JlYXNlIGEgdmFsdWUgdGhhdCBpcyBub3QgYSBudW1iZXIgbm9yIGEgc3RyaW5nLmlzZGlnaXQoKVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIHRvT2JqKCk6IE9taXQ8SVN1YmNvbmZpZywgXCJuYW1lXCI+IHsgLy8gQUtBIHRvU2F2ZWRDb25maWdcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IG9iaiA9IHRoaXMuc3RvcmU7XG4gICAgICAgIGRlbGV0ZSBvYmoubmFtZTtcbiAgICAgICAgcmV0dXJuIG9ialxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZyb21TdWJjb25maWcoc3ViY29uZmlnOiBTdWJjb25maWcpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSByZXR1cm4gY29uc29sZS53YXJuKCdmcm9tT2JqLCBEUllSVU4uIHJldHVybmluZycpO1xuICAgICAgICAvLyB0aGlzLnNldChzdWJjb25maWcudG9PYmooKSk7XG4gICAgICAgIC8vIHRoaXMuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uID0gc3ViY29uZmlnLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbjtcbiAgICAgICAgLy8gdGhpcy5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbiA9IHN1YmNvbmZpZy5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbjtcbiAgICAgICAgLy8gdGhpcy5kZW1vX3R5cGUgPSBzdWJjb25maWcuZGVtb190eXBlO1xuICAgICAgICAvLyB0aGlzLmVycm9yc19wbGF5cmF0ZSA9IHN1YmNvbmZpZy5lcnJvcnNfcGxheXJhdGU7XG4gICAgICAgIC8vIHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50ID0gc3ViY29uZmlnLmZpbmlzaGVkX3RyaWFsc19jb3VudDtcbiAgICAgICAgLy8gdGhpcy5sZXZlbHMgPSBzdWJjb25maWcubGV2ZWxzO1xuICAgICAgICAvLyB0aGlzLnN1YmplY3QgPSBzdWJjb25maWcuc3ViamVjdDtcbiAgICAgICAgLy8gdGhpcy50cnV0aF9maWxlID0gc3ViY29uZmlnLnRydXRoX2ZpbGU7XG4gICAgICAgIC8vIHRoaXMuX3VwZGF0ZVNhdmVkRmlsZSgndHJ1dGhfZmlsZV9wYXRoJywgY2ZnRmlsZS50cnV0aF9maWxlX3BhdGgpO1xuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgcHJpdmF0ZSBfdXBkYXRlU2F2ZWRGaWxlKGtleToga2V5b2YgSVN1YmNvbmZpZywgdmFsdWUpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdfdXBkYXRlU2F2ZWRGaWxlLCBEUllSVU4uIHJldHVybmluZycpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignX3VwZGF0ZVNhdmVkRmlsZSgpIGRvZXMgbm90aGluZywgcmV0dXJuaW5nJyk7XG4gICAgICAgIHRoaXMuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICAvKmNvbnN0IGNvbmYgPSBuZXcgKHJlcXVpcmUoJ2NvbmYnKSkoe1xuICAgICAgICAgY3dkIDogQ09ORklHU19QQVRIX0FCUyxcbiAgICAgICAgIGNvbmZpZ05hbWUgOiB0aGlzLm5hbWUsXG4gICAgICAgICBmaWxlRXh0ZW5zaW9uIDogdGhpcy50eXBlLFxuICAgICAgICAgc2VyaWFsaXplIDogdmFsdWUgPT4gSlNPTi5zdHJpbmdpZnkodmFsdWUsIG51bGwsIDQpXG4gICAgICAgICB9KTtcbiAgICAgICAgIGNvbmYuc2V0KGtleSwgdmFsdWUpOyovXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHByaXZhdGUgc2V0RGV2aWF0aW9uKGRldmlhdGlvblR5cGU6IERldmlhdGlvblR5cGUsIGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHR5cGVvZkRldmlhdGlvbiA9IHR5cGVvZiBkZXZpYXRpb247XG4gICAgICAgIGlmICggdHlwZW9mRGV2aWF0aW9uID09PSAnbnVtYmVyJyApIHtcbiAgICAgICAgICAgIGRldmlhdGlvbiA9IGAke2RldmlhdGlvbn0lYDtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0RGV2aWF0aW9uIGdvdCBcImRldmlhdGlvblwiIHR5cGUgbnVtYmVyLiBhcHBlbmRlZCBcIiVcIi4gZGV2aWF0aW9uIG5vdzogJHtkZXZpYXRpb259YCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZkRldmlhdGlvbiA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICBpZiAoICFkZXZpYXRpb24uZW5kc1dpdGgoXCIlXCIpICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0RGV2aWF0aW9uIGdvdCBkZXZpYXRpb24gd2l0aG91dCAlLiBhcHBlbmRlZCAlLiBkZXZpYXRpb24gbm93OiBcIiR7ZGV2aWF0aW9ufVwiYCk7XG4gICAgICAgICAgICAgICAgZGV2aWF0aW9uID0gYCR7ZGV2aWF0aW9ufSVgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXREZXZpYXRpb24sIHJlY2VpdmVkIFwiZGV2aWF0aW9uXCIgbm90IHN0cmluZyBub3QgbnVtYmVyLiByZXR1cm5pbmcuIGRldmlhdGlvbjpgLCBkZXZpYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMuc2V0KGBhbGxvd2VkXyR7ZGV2aWF0aW9uVHlwZX1fZGV2aWF0aW9uYCwgZGV2aWF0aW9uKTtcbiAgICAgICAgdGhpcy5jYWNoZVtgYWxsb3dlZF8ke2RldmlhdGlvblR5cGV9X2RldmlhdGlvbmBdID0gZGV2aWF0aW9uO1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBnZXQgYWxsb3dlZF90ZW1wb19kZXZpYXRpb24oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCBcImFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uXCIpXG4gICAgICAgIC8qaWYgKCB0aGlzLmNhY2hlLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICBjb25zdCBhbGxvd2VkVGVtcG9EZXZpYXRpb24gPSB0aGlzLmdldCgnYWxsb3dlZF90ZW1wb19kZXZpYXRpb24nKTtcbiAgICAgICAgIHRoaXMuY2FjaGUuYWxsb3dlZF90ZW1wb19kZXZpYXRpb24gPSBhbGxvd2VkVGVtcG9EZXZpYXRpb247XG4gICAgICAgICByZXR1cm4gYWxsb3dlZFRlbXBvRGV2aWF0aW9uO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uO1xuICAgICAgICAgfSovXG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIHNldCBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbihkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldERldmlhdGlvbihcInRlbXBvXCIsIGRldmlhdGlvbik7XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCBcImFsbG93ZWRfcmh5dGhtX2RldmlhdGlvblwiKTtcbiAgICAgICAgLyppZiAoIHRoaXMuY2FjaGUuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICBjb25zdCBhbGxvd2VkUmh5dGhtRGV2aWF0aW9uID0gdGhpcy5nZXQoJ2FsbG93ZWRfcmh5dGhtX2RldmlhdGlvbicpO1xuICAgICAgICAgdGhpcy5jYWNoZS5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gPSBhbGxvd2VkUmh5dGhtRGV2aWF0aW9uO1xuICAgICAgICAgcmV0dXJuIGFsbG93ZWRSaHl0aG1EZXZpYXRpb247XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uO1xuICAgICAgICAgfSovXG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIHNldCBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24oZGV2aWF0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXREZXZpYXRpb24oXCJyaHl0aG1cIiwgZGV2aWF0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0IGRlbW9fdHlwZSgpOiBEZW1vVHlwZSB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJkZW1vX3R5cGVcIik7XG4gICAgICAgIC8vIHJldHVybiB0aGlzLmdldCgnZGVtb190eXBlJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIHNldCBkZW1vX3R5cGUodHlwZTogRGVtb1R5cGUpIHtcbiAgICAgICAgaWYgKCAhWyAndmlkZW8nLCAnYW5pbWF0aW9uJyBdLmluY2x1ZGVzKHR5cGUpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBDb25maWcgZGVtb190eXBlIHNldHRlciwgYmFkIHR5cGUgPSAke3R5cGV9LCBjYW4gYmUgZWl0aGVyIHZpZGVvIG9yIGFuaW1hdGlvbi4gTm90IHNldHRpbmdgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdkZW1vX3R5cGUnLCB0eXBlKTtcbiAgICAgICAgICAgIHRoaXMuY2FjaGUuZGVtb190eXBlID0gdHlwZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBnZXQgZXJyb3JzX3BsYXlyYXRlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnZXJyb3JzX3BsYXlyYXRlJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBlcnJvcnNfcGxheXJhdGUoc3BlZWQ6IG51bWJlcikge1xuICAgICAgICBpZiAoIGlzTmFOKHNwZWVkKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgY29uZmlnIHNldCBlcnJvcnNfcGxheXJhdGUsIHJlY2VpdmVkIGJhZCBcInNwZWVkXCIgTmFOOiAke3NwZWVkfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2Vycm9yc19wbGF5cmF0ZScsIHNwZWVkKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgZ2V0IGZpbmlzaGVkX3RyaWFsc19jb3VudCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2ZpbmlzaGVkX3RyaWFsc19jb3VudCcpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCBpc05hTihjb3VudCkgfHwgY291bnQgPCAwICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBjb25maWcgc2V0IGZpbmlzaGVkX3RyaWFsc19jb3VudCwgcmVjZWl2ZWQgYmFkIFwiY291bnRcIjogJHtjb3VudH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdmaW5pc2hlZF90cmlhbHNfY291bnQnLCBjb3VudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqTmFtZSBvZiBjb25maWcgZmlsZSwgaW5jbHVkaW5nIGV4dGVuc2lvbi4gQWx3YXlzIHJldHVybnMgYG5hbWVgIGZyb20gY2FjaGUuIFRoaXMgaXMgYmVjYXVzZSB0aGVyZSdzIG5vIHNldHRlcjsgYG5hbWVgIGlzIHN0b3JlZCBpbiBjYWNoZSBhdCBjb25zdHJ1Y3Rvci4qL1xuICAgIGdldCBuYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlLm5hbWU7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBzdWJqZWN0KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnc3ViamVjdCcpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgc3ViamVjdChuYW1lOiBzdHJpbmcgfCBudWxsKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2Fybignc2V0IHN1YmplY3QsIERSWVJVTicpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KCdzdWJqZWN0JywgbmFtZSk7XG4gICAgICAgIGlmICggbmFtZSApIHtcbiAgICAgICAgICAgIGNvbnN0IEdsb2IgPSByZXF1aXJlKCcuLi9HbG9iJykuZGVmYXVsdDtcbiAgICAgICAgICAgIEdsb2IuQmlnQ29uZmlnLnN1YmplY3RzID0gWyAuLi5uZXcgU2V0KFsgLi4uR2xvYi5CaWdDb25maWcuc3ViamVjdHMsIG5hbWUgXSkgXTtcbiAgICAgICAgICAgIC8vIHN1cGVyLnNldCgnc3ViamVjdHMnLCBbLi4ubmV3IFNldChbLi4uc3VwZXIuZ2V0KCdzdWJqZWN0cycpLCBuYW1lXSldKTtcbiAgICAgICAgICAgIC8vIHN1cGVyLnN1YmplY3RzID0gWyAuLi5zdXBlci5nZXQoJ3N1YmplY3RzJyksIG5hbWUgXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkXG4gICAgICogVHJ1dGggZmlsZSBuYW1lLCBubyBleHRlbnNpb24qL1xuICAgIGdldCB0cnV0aF9maWxlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgJ3RydXRoX2ZpbGUnKTtcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuZ2V0KCd0cnV0aF9maWxlJylcbiAgICB9XG4gICAgXG4gICAgLyoqQWxzbyBzZXRzIHRoaXMudHJ1dGggKG1lbW9yeSlcbiAgICAgKiBAY2FjaGVkXG4gICAgICogQHBhcmFtIHRydXRoX2ZpbGUgLSBUcnV0aCBmaWxlIG5hbWUsIG5vIGV4dGVuc2lvbiovXG4gICAgc2V0IHRydXRoX2ZpbGUodHJ1dGhfZmlsZTogc3RyaW5nKSB7XG4gICAgICAgIC8vIHRydXRoX2ZpbGUgPSBwYXRoLmJhc2VuYW1lKHRydXRoX2ZpbGUpO1xuICAgICAgICBsZXQgWyBuYW1lLCBleHQgXSA9IG15ZnMuc3BsaXRfZXh0KHRydXRoX2ZpbGUpO1xuICAgICAgICBpZiAoIGJvb2woZXh0KSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IHRydXRoX2ZpbGUsIHBhc3NlZCBuYW1lIGlzIG5vdCBleHRlbnNpb25sZXNzOiAke3RydXRoX2ZpbGV9LiBDb250aW51aW5nIHdpdGggXCIke25hbWV9XCJgKTtcbiAgICAgICAgICAgIC8vIG5hbWVOb0V4dCA9IG15ZnMucmVtb3ZlX2V4dChuYW1lTm9FeHQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHRydXRoID0gbmV3IFRydXRoKG5hbWUpO1xuICAgICAgICAgICAgaWYgKCAhdHJ1dGgudHh0LmFsbEV4aXN0KCkgKSB7XG4gICAgICAgICAgICAgICAgQWxlcnQuc21hbGwud2FybmluZyhgTm90IGFsbCB0eHQgZmlsZXMgZXhpc3Q6ICR7bmFtZX1gKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50cnV0aCA9IHRydXRoO1xuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIEFsZXJ0LnNtYWxsLndhcm5pbmcoZSk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oZSlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldChgdHJ1dGhfZmlsZWAsIG5hbWUpO1xuICAgICAgICB0aGlzLmNhY2hlLnRydXRoX2ZpbGUgPSBuYW1lO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBsZXZlbHMoKTogSUxldmVsW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2xldmVscycpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbGV2ZWxzKGxldmVsczogSUxldmVsW10pIHtcbiAgICAgICAgaWYgKCAhQXJyYXkuaXNBcnJheShsZXZlbHMpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGV2ZWxzLCByZWNlaXZlZCBcImxldmVsc1wiIG5vdCBpc0FycmF5LiBub3Qgc2V0dGluZyBhbnl0aGluZy4gbGV2ZWxzOiBgLCBsZXZlbHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVE9ETzogYmV0dGVyIGNoZWNrc1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xldmVscycsIGxldmVscyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgY3VycmVudFRyaWFsQ29vcmRzKCk6IG51bWJlcltdIHtcbiAgICAgICAgLy8gbGV0IHsgbGV2ZWxzLCBmaW5pc2hlZF90cmlhbHNfY291bnQgfSA9IHRoaXMuY29uZmlnKCk7XG4gICAgICAgIGxldCBmbGF0VHJpYWxzTGlzdCA9IHRoaXMubGV2ZWxzLm1hcChsZXZlbCA9PiBsZXZlbC50cmlhbHMpO1xuICAgICAgICBmb3IgKCBsZXQgWyBsZXZlbEluZGV4LCB0cmlhbHNOdW0gXSBvZiBlbnVtZXJhdGUoZmxhdFRyaWFsc0xpc3QpICkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgdHJpYWxTdW1Tb0ZhciA9IHN1bShmbGF0VHJpYWxzTGlzdC5zbGljZSgwLCBsZXZlbEluZGV4ICsgMSkpO1xuICAgICAgICAgICAgY29uc3QgZmluaXNoZWRUcmlhbHNDb3VudCA9IHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgICAgICAgICAgaWYgKCB0cmlhbFN1bVNvRmFyID4gZmluaXNoZWRUcmlhbHNDb3VudCApXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsgbGV2ZWxJbmRleCwgdHJpYWxzTnVtIC0gKHRyaWFsU3VtU29GYXIgLSBmaW5pc2hlZFRyaWFsc0NvdW50KSBdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUud2FybihcImN1cnJlbnRUcmlhbENvb3Jkczogb3V0IG9mIGluZGV4IGVycm9yXCIpO1xuICAgIH1cbiAgICBcbiAgICBpc0RlbW9WaWRlbygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVtb190eXBlID09PSAndmlkZW8nO1xuICAgIH1cbiAgICBcbiAgICBpc1dob2xlVGVzdE92ZXIoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBzdW0odGhpcy5sZXZlbHMubWFwKGxldmVsID0+IGxldmVsLnRyaWFscykpID09IHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgIH1cbiAgICBcbiAgICBnZXRTdWJqZWN0RGlyTmFtZXMoKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gZnMucmVhZGRpclN5bmMoU1VCSkVDVFNfUEFUSF9BQlMpO1xuICAgIH1cbiAgICBcbiAgICBnZXRDdXJyZW50TGV2ZWwoKTogTGV2ZWwge1xuICAgICAgICBcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICByZXR1cm4gbmV3IExldmVsKHRoaXMubGV2ZWxzW2xldmVsX2luZGV4XSwgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0TGV2ZWxDb2xsZWN0aW9uKCk6IExldmVsQ29sbGVjdGlvbiB7XG4gICAgICAgIGxldCBbIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCBdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBMZXZlbENvbGxlY3Rpb24odGhpcy5sZXZlbHMsIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkdldHMgdGhlIGN1cnJlbnQgdHJpYWwncyBwYXRoIChqb2luIHRoaXMudGVzdE91dFBhdGgoKSBhbmQgbGV2ZWxfJHtsZXZlbF9pbmRleH0uLi4pLCBhbmQgcmV0dXJucyBhIFRydXRoIG9mIGl0Ki9cbiAgICB0cmlhbFRydXRoKCk6IFRydXRoIHtcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICAvLyByZXR1cm4gbmV3IFRydXRoKHBhdGguam9pbih0aGlzLnRlc3RPdXRQYXRoKCksIGBsZXZlbF8ke2xldmVsX2luZGV4fV90cmlhbF8ke3RyaWFsX2luZGV4fWApKTtcbiAgICAgICAgcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odGhpcy50ZXN0T3V0UGF0aCgpLCBgbGV2ZWxfJHtsZXZlbF9pbmRleH1fdHJpYWxfJHt0cmlhbF9pbmRleH1gKSk7XG4gICAgfVxuICAgIFxuICAgIC8qKlwiYzpcXFN5bmNcXENvZGVcXFB5dGhvblxcUHlhbm8tcmVsZWFzZVxcc3JjXFxleHBlcmltZW50c1xcc3ViamVjdHNcXGdpbGFkXFxmdXJfZWxpc2VcIiovXG4gICAgdGVzdE91dFBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY3VyclN1YmplY3REaXIgPSBwYXRoLmpvaW4oU1VCSkVDVFNfUEFUSF9BQlMsIHRoaXMuc3ViamVjdCk7IC8vIFwiLi4uL3N1YmplY3RzL2dpbGFkXCJcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbihjdXJyU3ViamVjdERpciwgdGhpcy50cnV0aC5uYW1lKTtcbiAgICB9XG4gICAgXG4gICAgXG59XG4iXX0=