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
        console.warn(`prop ${prop} NOT cache`);
        const propVal = config.get(prop);
        config.cache[prop] = propVal;
        return propVal;
    }
    else {
        console.warn(`prop ${prop} IN cache`);
        return config.cache[prop];
    }
}
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
            console.warn(`BigConfigCls experiment_type setter, got experimentType: '${experimentType}'. Must be either 'test' or 'exam'. setting to test`);
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
        console.warn('This used to maybe nullify config.subject. Doesnt do that anymore');
    }
    configsPath() {
        console.warn('called configsPath, should use CONFIGS_PATH_ABS');
        return CONFIGS_PATH_ABS;
    }
    truthsDirPath() {
        console.warn('called truthsDirPath, should use TRUTHS_PATH_ABS');
        return TRUTHS_PATH_ABS;
    }
    subjectsDirPath() {
        console.warn('called subjectsDirPath, should use SUBJECTS_PATH_ABS');
        return SUBJECTS_PATH_ABS;
    }
    salamanderDirPath() {
        console.warn('called salamanderDirPath, should use SALAMANDER_PATH_ABS');
        return SALAMANDER_PATH_ABS;
    }
    get dev() {
        const _dev = this.get('dev');
        return {
            skip_whole_truth: () => _dev && this.get('devoptions').skip_whole_truth,
            skip_level_intro: () => _dev && this.get('devoptions').skip_level_intro,
            skip_passed_trial_feedback: () => _dev && this.get('devoptions').skip_passed_trial_feedback,
            skip_failed_trial_feedback: () => _dev && this.get('devoptions').skip_failed_trial_feedback,
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
            if (subconfig.toObj) {
                defaults = Object.assign(Object.assign({}, subconfig.toObj()), { name });
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
        console.log(`Subconfig constructor, defaults:`, defaults);
        this.cache = { name };
        this.type = type;
        this.truth = new Truth_1.Truth(MyFs_1.default.remove_ext(this.truth_file));
        if (subconfig)
            this.set(subconfig.store);
    }
    async doTruthFileCheck() {
        console.log(`💾 Subconfig(${this.type}).doTruthFileCheck()`);
        if (this.truth.txt.allExist()) {
            return MyAlert_1.default.small.success(`${this.truth.name}.txt, *_on.txt, and *_off.txt files exist.`);
        }
        const txtFilesList = require("../Glob").getTruthFilesWhere({ extension: 'txt' }).map(MyFs_1.default.remove_ext);
        const truthsWith3TxtFiles = txtFilesList.filter(a => txtFilesList.filter(txt => txt.startsWith(a)).length >= 3);
        if (!util_1.bool(truthsWith3TxtFiles))
            return MyAlert_1.default.big.warning({
                title: 'No valid truth files found',
                html: 'There needs to be at least one txt file with 2 "on" and "off" counterparts.'
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
        return {
            allowed_rhythm_deviation: this.allowed_rhythm_deviation,
            allowed_tempo_deviation: this.allowed_tempo_deviation,
            demo_type: this.demo_type,
            errors_playrate: this.errors_playrate,
            finished_trials_count: this.finished_trials_count,
            levels: this.levels,
            subject: this.subject,
            truth_file: this.truth_file,
        };
    }
    fromObj(subconfig) {
        if (DRYRUN)
            return console.warn('fromObj, DRYRUN. returning');
        this.set(subconfig.store);
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
        return this.get('demo_type');
    }
    set demo_type(type) {
        console.warn('set demo_type returns a value, is this needed?');
        if (!['video', 'animation'].includes(type)) {
            console.warn(`Config demo_type setter, bad type = ${type}, can be either video or animation`);
        }
        else {
            return this.set('demo_type', type);
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
        console.log('💾set subject(', name, ')');
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
        return this.get('truth_file');
    }
    set truth_file(truth_file) {
        try {
            let truth = new Truth_1.Truth(truth_file);
            if (!truth.txt.allExist()) {
                MyAlert_1.default.small.warning(`Not all txt files exist: ${truth_file}`);
            }
            this.truth = truth;
        }
        catch (e) {
            MyAlert_1.default.small.warning(e);
            console.warn(e);
        }
        this.set(`truth_file`, truth_file);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFDM0Isa0NBQTJEO0FBQzNELG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsNkJBQTZCO0FBRTdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQTZDdEMsU0FBUyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUk7SUFDakMsSUFBSyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRztRQUNwQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxZQUFZLENBQUMsQ0FBQztRQUN2QyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzdCLE9BQU8sT0FBTyxDQUFDO0tBQ2xCO1NBQU07UUFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxXQUFXLENBQUMsQ0FBQztRQUN0QyxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDN0I7QUFDTCxDQUFDO0FBRUQsTUFBYSxZQUFhLFNBQVEsS0FBaUI7SUFLL0MsWUFBWSxpQkFBaUIsR0FBRyxJQUFJO1FBQ2hDLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSyxNQUFNLEVBQUc7WUFDVixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQzlEO1FBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDOUIsSUFBSyxpQkFBaUIsRUFBRztZQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFO2lCQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO1lBQ2hDLENBQUMsQ0FDSixDQUFDO1NBRVQ7SUFDTCxDQUFDO0lBSUQsZUFBZSxDQUFDLFdBQXVCLEVBQUUsY0FBOEI7UUFDbkUsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLDJFQUEyRSxDQUFDLENBQUM7SUFPckcsQ0FBQztJQXNCRCxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDUixJQUFLLE1BQU0sRUFBRztZQUNWLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1NBQy9EO1FBQ0QsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixJQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUc7WUFDcEIsSUFBSSxRQUFRLEdBQVUsQ0FBQyxDQUFDO1lBQ3hCLElBQUssS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRztnQkFDckIsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2FBQ3hCO2lCQUFNO2dCQUNILFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDckI7WUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUN6QjthQUFNO1lBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDbEI7UUFDRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQWFELElBQUksU0FBUztRQUNULE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQsSUFBSSxTQUFTLENBQUMsSUFBYztRQUV4QixNQUFNLFVBQVUsR0FBRyxDQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUUsQ0FBQztRQUM1RSxJQUFLLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRztZQUM5QixPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixJQUFJLHNCQUFzQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2xHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ2hDO2FBQU07WUFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUMvQjtJQUNMLENBQUM7SUFJRCxZQUFZLENBQUMsSUFBWSxFQUFFLFVBQTBCLEVBQUUsU0FBcUI7O1FBQ3hFLE1BQU0sWUFBWSxHQUFHLEdBQUcsVUFBVSxPQUFvQyxDQUFDO1FBUXZFLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsSUFBSyxJQUFJLEtBQUssUUFBUSxFQUFHO1lBQ3JCLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxVQUFVLFNBQVMsSUFBSSxtRUFBbUUsQ0FBQyxDQUFDO1NBQ25IO1FBQ0QsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuQyxJQUFLLENBQUMsV0FBSSxDQUFDLEdBQUcsQ0FBQyxFQUFHO1lBQ2QsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLFVBQVUsU0FBUyxJQUFJLCtCQUErQixVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBQ3hGLFFBQVEsSUFBSSxJQUFJLFVBQVUsRUFBRSxDQUFDO1NBRWhDO2FBQU0sSUFBSyxHQUFHLEtBQUssSUFBSSxVQUFVLEVBQUUsRUFBRztZQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sVUFBVSxTQUFTLElBQUkscUJBQXFCLEdBQUcsc0JBQXNCLFVBQVUsRUFBRSxDQUFDLENBQUM7WUFDdkcsUUFBUSxHQUFHLGNBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLElBQUksVUFBVSxFQUFFLENBQUMsQ0FBQTtTQUMxRDtRQUNELElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixRQUFHLFNBQVMsMENBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUM5RyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQTtJQUNyRSxDQUFDO0lBRUQsWUFBWTtRQUNSLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUNyQyxDQUFDO0lBR0QsSUFBSSxTQUFTO1FBRVQsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFHRCxJQUFJLFNBQVMsQ0FBQyxJQUFZO1FBQ3RCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBQ25DLENBQUM7SUFHRCxJQUFJLFNBQVM7UUFFVCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUdELElBQUksU0FBUyxDQUFDLElBQVk7UUFDdEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFDbkMsQ0FBQztJQUdELElBQUksZUFBZTtRQUNmLE9BQU8sZUFBZSxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFBO0lBUW5ELENBQUM7SUFHRCxJQUFJLGVBQWUsQ0FBQyxjQUE4QjtRQUM5QyxJQUFLLGNBQWMsS0FBSyxNQUFNLElBQUksY0FBYyxLQUFLLE1BQU0sRUFBRztZQUMxRCxPQUFPLENBQUMsSUFBSSxDQUFDLDZEQUE2RCxjQUFjLHFEQUFxRCxDQUFDLENBQUM7WUFDL0ksY0FBYyxHQUFHLE1BQU0sQ0FBQztTQUMzQjtRQUNELElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO0lBR2hELENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUdELElBQUksUUFBUSxDQUFDLFdBQXFCO1FBQzlCLElBQUssTUFBTSxFQUFHO1lBRVYsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUE7U0FDekQ7UUFDRCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sUUFBUSxHQUFHLENBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBRSxDQUFDO1FBQzdDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUVBQW1FLENBQUMsQ0FBQztJQUt0RixDQUFDO0lBSUQsV0FBVztRQUNQLE9BQU8sQ0FBQyxJQUFJLENBQUMsaURBQWlELENBQUMsQ0FBQztRQUNoRSxPQUFPLGdCQUFnQixDQUFDO0lBQzVCLENBQUM7SUFHRCxhQUFhO1FBQ1QsT0FBTyxDQUFDLElBQUksQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO1FBQ2pFLE9BQU8sZUFBZSxDQUFDO0lBQzNCLENBQUM7SUFJRCxlQUFlO1FBQ1gsT0FBTyxDQUFDLElBQUksQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO1FBQ3JFLE9BQU8saUJBQWlCLENBQUE7SUFDNUIsQ0FBQztJQUdELGlCQUFpQjtRQUNiLE9BQU8sQ0FBQyxJQUFJLENBQUMsMERBQTBELENBQUMsQ0FBQztRQUN6RSxPQUFPLG1CQUFtQixDQUFBO0lBQzlCLENBQUM7SUFHRCxJQUFZLEdBQUc7UUFDWCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdCLE9BQU87WUFDSCxnQkFBZ0IsRUFBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxnQkFBZ0I7WUFDeEUsZ0JBQWdCLEVBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsZ0JBQWdCO1lBQ3hFLDBCQUEwQixFQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLDBCQUEwQjtZQUM1RiwwQkFBMEIsRUFBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQywwQkFBMEI7U0FDL0YsQ0FBQztJQUNOLENBQUM7Q0FHSjtBQWhQRCxvQ0FnUEM7QUFHRCxNQUFhLFNBQVUsU0FBUSxJQUFnQjtJQVMzQyxZQUFZLElBQVksRUFBRSxJQUFvQixFQUFFLFNBQXFCO1FBQ2pFLElBQUksQ0FBRSxRQUFRLEVBQUUsR0FBRyxDQUFFLEdBQUcsY0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QyxJQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRztZQUN2QixPQUFPLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxHQUFHLHVCQUF1QixJQUFJLHlCQUF5QixJQUFJLGdDQUFnQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQ2pKLElBQUksR0FBRyxjQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztTQUN2QztRQUNELElBQUksUUFBUSxDQUFDO1FBQ2IsSUFBSyxXQUFJLENBQUMsU0FBUyxDQUFDLEVBQUc7WUFDbkIsSUFBSyxTQUFTLENBQUMsS0FBSyxFQUFHO2dCQUNuQixRQUFRLG1DQUFRLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBRSxJQUFJLEdBQUUsQ0FBQzthQUM3QztpQkFBTTtnQkFDSCxRQUFRLEdBQUcsU0FBUyxDQUFDO2FBQ3hCO1NBQ0o7YUFBTTtZQUNILFFBQVEsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDO1NBQ3ZCO1FBQ0QsS0FBSyxDQUFDO1lBQ0YsYUFBYSxFQUFHLElBQUk7WUFDcEIsR0FBRyxFQUFHLGdCQUFnQjtZQUN0QixVQUFVLEVBQUcsUUFBUTtZQUNyQixRQUFRO1NBRVgsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLGFBQUssQ0FBQyxjQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3pELElBQUssU0FBUztZQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxLQUFLLENBQUMsZ0JBQWdCO1FBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxJQUFJLHNCQUFzQixDQUFDLENBQUM7UUFHN0QsSUFBSyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRztZQUM3QixPQUFPLGlCQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSw0Q0FBNEMsQ0FBQyxDQUFDO1NBQzlGO1FBRUQsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsU0FBUyxFQUFHLEtBQUssRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2RyxNQUFNLG1CQUFtQixHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNoSCxJQUFLLENBQUMsV0FBSSxDQUFDLG1CQUFtQixDQUFDO1lBQzNCLE9BQU8saUJBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO2dCQUNyQixLQUFLLEVBQUcsNEJBQTRCO2dCQUNwQyxJQUFJLEVBQUcsNkVBQTZFO2FBQ3ZGLENBQUMsQ0FBQztRQUlQLE9BQU8saUJBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO1lBQ3RCLEtBQUssRUFBRyx3Q0FBd0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7WUFDakUsSUFBSSxFQUFHLG9HQUFvRztZQUMzRyxlQUFlLEVBQUcsSUFBSTtTQUN6QixFQUFFO1lBQ0MsT0FBTyxFQUFHLG1CQUFtQjtZQUM3QixPQUFPLEVBQUcsRUFBRSxDQUFDLEVBQUU7Z0JBQ1gsSUFBSTtvQkFFQSxJQUFJLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxDQUFDO29CQUMvQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztvQkFDakIsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBRTVCLGlCQUFVLEVBQUUsQ0FBQztpQkFDaEI7Z0JBQUMsT0FBUSxHQUFHLEVBQUc7b0JBQ1osaUJBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDZCxpQkFBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUcsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUcscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO2lCQUUxRTtZQUVMLENBQUM7U0FDSixDQUFDLENBQUM7SUFHUCxDQUFDO0lBRUQsUUFBUSxDQUFDLENBQW1CO1FBQ3hCLElBQUssTUFBTSxFQUFHO1lBQ1YsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7U0FDdEQ7UUFDRCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXBCLElBQUssQ0FBQyxLQUFLLFNBQVM7WUFDaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDZDtZQUNELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1lBRXpCLElBQUssT0FBTyxLQUFLLFFBQVEsSUFBSSxDQUFDLE9BQU8sS0FBSyxRQUFRLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUc7Z0JBRWpFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDbEM7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxvRkFBb0YsQ0FBQyxDQUFDO2FBQ3RHO1NBQ0o7SUFFTCxDQUFDO0lBRUQsS0FBSztRQUVELE9BQU87WUFDSCx3QkFBd0IsRUFBRyxJQUFJLENBQUMsd0JBQXdCO1lBQ3hELHVCQUF1QixFQUFHLElBQUksQ0FBQyx1QkFBdUI7WUFDdEQsU0FBUyxFQUFHLElBQUksQ0FBQyxTQUFTO1lBQzFCLGVBQWUsRUFBRyxJQUFJLENBQUMsZUFBZTtZQUN0QyxxQkFBcUIsRUFBRyxJQUFJLENBQUMscUJBQXFCO1lBQ2xELE1BQU0sRUFBRyxJQUFJLENBQUMsTUFBTTtZQUNwQixPQUFPLEVBQUcsSUFBSSxDQUFDLE9BQU87WUFDdEIsVUFBVSxFQUFHLElBQUksQ0FBQyxVQUFVO1NBQy9CLENBQUE7SUFFTCxDQUFDO0lBR0QsT0FBTyxDQUFDLFNBQW9CO1FBQ3hCLElBQUssTUFBTTtZQUFHLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBVTlCLENBQUM7SUFHTyxnQkFBZ0IsQ0FBQyxHQUFxQixFQUFFLEtBQUs7UUFDakQsSUFBSyxNQUFNLEVBQUc7WUFDVixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMscUNBQXFDLENBQUMsQ0FBQTtTQUM3RDtRQUNELE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBUXpCLENBQUM7SUFHTyxZQUFZLENBQUMsYUFBNEIsRUFBRSxTQUFpQjtRQUNoRSxNQUFNLGVBQWUsR0FBRyxPQUFPLFNBQVMsQ0FBQztRQUN6QyxJQUFLLGVBQWUsS0FBSyxRQUFRLEVBQUc7WUFDaEMsU0FBUyxHQUFHLEdBQUcsU0FBUyxHQUFHLENBQUM7WUFDNUIsT0FBTyxDQUFDLElBQUksQ0FBQywwRUFBMEUsU0FBUyxFQUFFLENBQUMsQ0FBQztTQUN2RzthQUFNLElBQUssZUFBZSxLQUFLLFFBQVEsRUFBRztZQUN2QyxJQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRztnQkFDNUIsT0FBTyxDQUFDLElBQUksQ0FBQyxxRUFBcUUsU0FBUyxHQUFHLENBQUMsQ0FBQztnQkFDaEcsU0FBUyxHQUFHLEdBQUcsU0FBUyxHQUFHLENBQUM7YUFDL0I7U0FDSjthQUFNO1lBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxpRkFBaUYsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMzRyxPQUFPO1NBQ1Y7UUFHRCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsYUFBYSxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLGFBQWEsWUFBWSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBQ2pFLENBQUM7SUFHRCxJQUFJLHVCQUF1QjtRQUN2QixPQUFPLGVBQWUsQ0FBQyxJQUFJLEVBQUUseUJBQXlCLENBQUMsQ0FBQTtJQVEzRCxDQUFDO0lBR0QsSUFBSSx1QkFBdUIsQ0FBQyxTQUFpQjtRQUN6QyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBR0QsSUFBSSx3QkFBd0I7UUFDeEIsT0FBTyxlQUFlLENBQUMsSUFBSSxFQUFFLDBCQUEwQixDQUFDLENBQUM7SUFRN0QsQ0FBQztJQUdELElBQUksd0JBQXdCLENBQUMsU0FBaUI7UUFDMUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELElBQUksU0FBUztRQUNULE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQsSUFBSSxTQUFTLENBQUMsSUFBYztRQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLGdEQUFnRCxDQUFDLENBQUM7UUFDL0QsSUFBSyxDQUFDLENBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRztZQUM1QyxPQUFPLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxJQUFJLG9DQUFvQyxDQUFDLENBQUM7U0FDakc7YUFBTTtZQUVILE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDdEM7SUFDTCxDQUFDO0lBRUQsSUFBSSxlQUFlO1FBQ2YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELElBQUksZUFBZSxDQUFDLEtBQWE7UUFDN0IsSUFBSyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUc7WUFDaEIsT0FBTyxDQUFDLElBQUksQ0FBQyx5REFBeUQsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUNsRjthQUFNO1lBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN0QztJQUVMLENBQUM7SUFFRCxJQUFJLHFCQUFxQjtRQUNyQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsSUFBSSxxQkFBcUIsQ0FBQyxLQUFhO1FBQ25DLElBQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUc7WUFDN0IsT0FBTyxDQUFDLElBQUksQ0FBQywyREFBMkQsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUNwRjthQUFNO1lBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUM1QztJQUNMLENBQUM7SUFHRCxJQUFJLElBQUk7UUFDSixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBQzNCLENBQUM7SUFHRCxJQUFJLE9BQU87UUFDUCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELElBQUksT0FBTyxDQUFDLElBQW1CO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLElBQUssTUFBTSxFQUFHO1lBRVYsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7U0FDOUM7UUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQixJQUFLLElBQUksRUFBRztZQUNSLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFDeEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsQ0FBRSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUUsQ0FBQyxDQUFFLENBQUM7U0FHbEY7SUFDTCxDQUFDO0lBRUQsSUFBSSxVQUFVO1FBQ1YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFBO0lBQ2pDLENBQUM7SUFHRCxJQUFJLFVBQVUsQ0FBQyxVQUFrQjtRQUM3QixJQUFJO1lBQ0EsSUFBSSxLQUFLLEdBQUcsSUFBSSxhQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEMsSUFBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUc7Z0JBQ3pCLGlCQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsVUFBVSxFQUFFLENBQUMsQ0FBQTthQUNoRTtZQUNELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1NBQ3RCO1FBQUMsT0FBUSxDQUFDLEVBQUc7WUFDVixpQkFBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtTQUNsQjtRQUNELElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBR3ZDLENBQUM7SUFPRCxJQUFJLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVELElBQUksTUFBTSxDQUFDLE1BQWdCO1FBQ3ZCLElBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFHO1lBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsMkVBQTJFLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDckc7YUFBTTtZQUVILElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzlCO0lBQ0wsQ0FBQztJQUdELGtCQUFrQjtRQUVkLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzVELEtBQU0sSUFBSSxDQUFFLFVBQVUsRUFBRSxTQUFTLENBQUUsSUFBSSxnQkFBUyxDQUFDLGNBQWMsQ0FBQyxFQUFHO1lBRS9ELElBQUksYUFBYSxHQUFHLFVBQUcsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRSxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztZQUN2RCxJQUFLLGFBQWEsR0FBRyxtQkFBbUI7Z0JBQ3BDLE9BQU8sQ0FBRSxVQUFVLEVBQUUsU0FBUyxHQUFHLENBQUMsYUFBYSxHQUFHLG1CQUFtQixDQUFDLENBQUUsQ0FBQztTQUNoRjtRQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQsV0FBVztRQUNQLE9BQU8sSUFBSSxDQUFDLFNBQVMsS0FBSyxPQUFPLENBQUM7SUFDdEMsQ0FBQztJQUVELGVBQWU7UUFDWCxPQUFPLFVBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztJQUNyRixDQUFDO0lBRUQsa0JBQWtCO1FBQ2QsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELGVBQWU7UUFFWCxJQUFJLENBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzdELE9BQU8sSUFBSSxhQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUdELGtCQUFrQjtRQUNkLElBQUksQ0FBRSxXQUFXLEVBQUUsV0FBVyxDQUFFLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDN0QsT0FBTyxJQUFJLHVCQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUlELFVBQVU7UUFDTixJQUFJLENBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTdELE9BQU8sSUFBSSxhQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsU0FBUyxXQUFXLFVBQVUsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFHRCxXQUFXO1FBQ1AsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RELENBQUM7Q0FHSjtBQTNXRCw4QkEyV0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBTdG9yZSBmcm9tIFwiZWxlY3Ryb24tc3RvcmVcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IEFsZXJ0IGZyb20gXCIuLi9NeUFsZXJ0XCI7XG5pbXBvcnQgbXlmcyBmcm9tIFwiLi4vTXlGc1wiO1xuaW1wb3J0IHsgYm9vbCwgcmVsb2FkUGFnZSwgc3VtLCBlbnVtZXJhdGUgfSBmcm9tIFwiLi4vdXRpbFwiO1xuaW1wb3J0IHsgVHJ1dGggfSBmcm9tIFwiLi4vVHJ1dGhcIjtcbmltcG9ydCB7IElMZXZlbCwgTGV2ZWwsIExldmVsQ29sbGVjdGlvbiB9IGZyb20gXCIuLi9MZXZlbFwiO1xuaW1wb3J0IHsgU3dlZXRBbGVydFJlc3VsdCB9IGZyb20gXCJzd2VldGFsZXJ0MlwiO1xuaW1wb3J0ICogYXMgQ29uZiBmcm9tICdjb25mJztcblxuY29uc29sZS5sb2coJ3NyYy9CaWdDb25maWcvaW5kZXgudHMnKTtcblxuZXhwb3J0IHR5cGUgRXhwZXJpbWVudFR5cGUgPSAnZXhhbScgfCAndGVzdCc7XG50eXBlIERlbW9UeXBlID0gJ3ZpZGVvJyB8ICdhbmltYXRpb24nO1xuZXhwb3J0IHR5cGUgUGFnZU5hbWUgPSBcIm5ld1wiIC8vIEFLQSBUTGFzdFBhZ2VcbiAgICB8IFwicnVubmluZ1wiXG4gICAgfCBcInJlY29yZFwiXG4gICAgfCBcImZpbGVfdG9vbHNcIlxuICAgIHwgXCJzZXR0aW5nc1wiXG50eXBlIERldmlhdGlvblR5cGUgPSAncmh5dGhtJyB8ICd0ZW1wbyc7XG5cblxuaW50ZXJmYWNlIElTdWJjb25maWcge1xuICAgIGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbjogc3RyaW5nLFxuICAgIGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uOiBzdHJpbmcsXG4gICAgZGVtb190eXBlOiBEZW1vVHlwZSxcbiAgICBlcnJvcnNfcGxheXJhdGU6IG51bWJlcixcbiAgICBmaW5pc2hlZF90cmlhbHNfY291bnQ6IG51bWJlcixcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgc3ViamVjdDogc3RyaW5nLFxuICAgIHRydXRoX2ZpbGU6IHN0cmluZyxcbiAgICBsZXZlbHM6IElMZXZlbFtdLFxufVxuXG5cbmludGVyZmFjZSBEZXZPcHRpb25zIHtcbiAgICBza2lwX3dob2xlX3RydXRoOiBib29sZWFuLFxuICAgIHNraXBfbGV2ZWxfaW50cm86IGJvb2xlYW4sXG4gICAgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2s6IGJvb2xlYW4sXG4gICAgc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2s6IGJvb2xlYW5cbn1cblxuaW50ZXJmYWNlIElCaWdDb25maWcge1xuICAgIGRldjogYm9vbGVhbixcbiAgICBkZXZvcHRpb25zOiBEZXZPcHRpb25zLFxuICAgIGV4YW1fZmlsZTogc3RyaW5nLFxuICAgIHRlc3RfZmlsZTogc3RyaW5nLFxuICAgIGV4cGVyaW1lbnRfdHlwZTogRXhwZXJpbWVudFR5cGUsXG4gICAgbGFzdF9wYWdlOiBQYWdlTmFtZSxcbiAgICBzdWJqZWN0czogc3RyaW5nW10sXG4gICAgdmVsb2NpdGllczogbnVtYmVyW10sXG59XG5cbmZ1bmN0aW9uIHRyeUdldEZyb21DYWNoZTxUIGV4dGVuZHMga2V5b2YgSUJpZ0NvbmZpZz4oY29uZmlnOiBCaWdDb25maWdDbHMsIHByb3A6IFQpOiBJQmlnQ29uZmlnW1RdXG5mdW5jdGlvbiB0cnlHZXRGcm9tQ2FjaGU8VCBleHRlbmRzIGtleW9mIElTdWJjb25maWc+KGNvbmZpZzogU3ViY29uZmlnLCBwcm9wOiBUKTogSVN1YmNvbmZpZ1tUXVxuZnVuY3Rpb24gdHJ5R2V0RnJvbUNhY2hlKGNvbmZpZywgcHJvcCkge1xuICAgIGlmICggY29uZmlnLmNhY2hlW3Byb3BdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgcHJvcCAke3Byb3B9IE5PVCBjYWNoZWApO1xuICAgICAgICBjb25zdCBwcm9wVmFsID0gY29uZmlnLmdldChwcm9wKTtcbiAgICAgICAgY29uZmlnLmNhY2hlW3Byb3BdID0gcHJvcFZhbDtcbiAgICAgICAgcmV0dXJuIHByb3BWYWw7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBwcm9wICR7cHJvcH0gSU4gY2FjaGVgKTtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5jYWNoZVtwcm9wXTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCaWdDb25maWdDbHMgZXh0ZW5kcyBTdG9yZTxJQmlnQ29uZmlnPiB7XG4gICAgdGVzdDogU3ViY29uZmlnO1xuICAgIGV4YW06IFN1YmNvbmZpZztcbiAgICByZWFkb25seSBjYWNoZTogUGFydGlhbDxJQmlnQ29uZmlnPjtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihfZG9UcnV0aEZpbGVDaGVjayA9IHRydWUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5jYWNoZSA9IHt9O1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0ID0gKC4uLmFyZ3MpID0+IGNvbnNvbGUud2FybihgRFJZUlVOLCBzZXQ6IGAsIGFyZ3MpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50ZXN0ID0gbmV3IFN1YmNvbmZpZyh0aGlzLnRlc3RfZmlsZSwgXCJ0ZXN0XCIpO1xuICAgICAgICB0aGlzLmV4YW0gPSBuZXcgU3ViY29uZmlnKHRoaXMuZXhhbV9maWxlLCBcImV4YW1cIik7XG4gICAgICAgIHRoaXMuc3ViamVjdHMgPSB0aGlzLnN1YmplY3RzOyAvLyB0byBlbnN1cmUgaGF2aW5nIHN1YmNvbmZpZydzIHN1YmplY3RzXG4gICAgICAgIGlmICggX2RvVHJ1dGhGaWxlQ2hlY2sgKSB7XG4gICAgICAgICAgICB0aGlzLnRlc3QuZG9UcnV0aEZpbGVDaGVjaygpXG4gICAgICAgICAgICAgICAgLnRoZW4oc3dhbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4YW0uZG9UcnV0aEZpbGVDaGVjaygpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZzogSVN1YmNvbmZpZywgZXhwZXJpbWVudFR5cGU6IEV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ0JpZ0NvbmZpZ0NscyB1c2VkIGZyb21TYXZlZENvbmZpZy4gSW1wb3NzaWJsZSB0byBsb2FkIGJpZyBmaWxlLiBSZXR1cm5pbmcnKTtcbiAgICAgICAgLyppZiAoIERSWVJVTiApIHJldHVybiBjb25zb2xlLmxvZyhgZnJvbVNhdmVkQ29uZmlnLCBEUllSVU5gKTtcbiAgICAgICAgIGNvbnN0IHRydXRoRmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKHNhdmVkQ29uZmlnLnRydXRoX2ZpbGVfcGF0aCwgJy50eHQnKTtcbiAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKHBhdGguam9pbihUUlVUSFNfUEFUSF9BQlMsIHRydXRoRmlsZU5hbWUpKTtcbiAgICAgICAgIHRoaXMuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgICB0aGlzLmNvbmZpZyhleHBlcmltZW50VHlwZSkuZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnKTsqL1xuICAgIH1cbiAgICBcbiAgICAvKnN1YmNvbmZpZ3MoKTogeyBleGFtOiBTdWJjb25maWcsIHRlc3Q6IFN1YmNvbmZpZyB9IHtcbiAgICAgY29uc3Qgc3ViY29uZmlncyA9IHtcbiAgICAgZXhhbSA6IHRoaXMuZXhhbSxcbiAgICAgdGVzdCA6IHRoaXMudGVzdFxuICAgICB9O1xuICAgICBcbiAgICAgcmV0dXJuIHN1YmNvbmZpZ3M7XG4gICAgIH0qL1xuICAgIFxuICAgIC8qY29uZmlnKHR5cGU6IEV4cGVyaW1lbnRUeXBlKTogU3ViY29uZmlnIHtcbiAgICAgXG4gICAgIHJldHVybiBuZXcgU3ViY29uZmlnKHR5cGUpO1xuICAgICB9Ki9cbiAgICBcbiAgICBcbiAgICAvKipAZXhhbXBsZVxuICAgICB1cGRhdGUoJ3N1YmplY3RzJywgW25hbWVzXSlcbiAgICAgKi9cbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywga3ZQYWlyczogUGFydGlhbDxJQmlnQ29uZmlnPilcbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywgdmFsdWVzOiBhbnlbXSlcbiAgICB1cGRhdGUoSywga3YpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdCaWdDb25maWcudXBkYXRlKCkgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBpZiAoIEFycmF5LmlzQXJyYXkoVikgKSB7XG4gICAgICAgICAgICBsZXQgbmV3VmFsdWU6IGFueVtdID0gVjtcbiAgICAgICAgICAgIGlmICggQXJyYXkuaXNBcnJheShrdikgKSB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWUucHVzaCguLi5rdik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlLnB1c2goa3YpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgbmV3VmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihWLCBrdik7XG4gICAgICAgICAgICB0aGlzLnNldChLLCBWKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXQoSyk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8vIC8qKkByZXR1cm4ge3N0cmluZ30qL1xuICAgIC8vIGdldCBzYXZlX3BhdGgoKSB7XG4gICAgLy8gXHRyZXR1cm4gdGhpcy5nZXQoJ3NhdmVfcGF0aCcpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8qKkBwYXJhbSB7c3RyaW5nfSBzYXZlUGF0aCovXG4gICAgLy8gc2V0IHNhdmVfcGF0aChzYXZlUGF0aCkge1xuICAgIC8vIFx0dGhpcy5zZXQoJ3NhdmVfcGF0aCcsIHNhdmVQYXRoKTtcbiAgICAvLyB9XG4gICAgXG4gICAgZ2V0IGxhc3RfcGFnZSgpOiBQYWdlTmFtZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnbGFzdF9wYWdlJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBsYXN0X3BhZ2UocGFnZTogUGFnZU5hbWUpIHtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHZhbGlkcGFnZXMgPSBbIFwibmV3XCIsIFwicnVubmluZ1wiLCBcInJlY29yZFwiLCBcImZpbGVfdG9vbHNcIiwgXCJzZXR0aW5nc1wiIF07XG4gICAgICAgIGlmICggIXZhbGlkcGFnZXMuaW5jbHVkZXMocGFnZSkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCBsYXN0X3BhZ2UoXCIke3BhZ2V9XCIpLCBtdXN0IGJlIG9uZSBvZiAke3ZhbGlkcGFnZXMuam9pbignLCAnKX0uIHNldHRpbmcgdG8gbmV3YCk7XG4gICAgICAgICAgICB0aGlzLnNldCgnbGFzdF9wYWdlJywgJ25ldycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xhc3RfcGFnZScsIHBhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlVwZGF0ZXMgYGV4YW1fZmlsZWAgb3IgYHRlc3RfZmlsZWAuIEFsc28gaW5pdGlhbGl6ZXMgbmV3IFN1YmNvbmZpZy5cbiAgICAgKiBIYW5kbGVzIHdpdGggd2FybmluZ3M6ICovXG4gICAgc2V0U3ViY29uZmlnKGZpbGU6IHN0cmluZywgc3ViY2ZnVHlwZTogRXhwZXJpbWVudFR5cGUsIHN1YmNvbmZpZz86IFN1YmNvbmZpZykge1xuICAgICAgICBjb25zdCBzdWJjb25maWdLZXkgPSBgJHtzdWJjZmdUeXBlfV9maWxlYCBhcyBcImV4YW1fZmlsZVwiIHwgXCJ0ZXN0X2ZpbGVcIjtcbiAgICAgICAgLyppZiAoIHRoaXMuZ2V0KHN1YmNvbmZpZ0tleSkgPT09IGZpbGUgJiYgIXN1YmNvbmZpZyApIHtcbiAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oYHNldFN1YmNvbmZpZywgZmlsZSA9PT0gZXhpc3Rpbmcgb25lLmAsIHtcbiAgICAgICAgIGZpbGUsXG4gICAgICAgICBzdWJjZmdUeXBlLFxuICAgICAgICAgJ3RoaXNbYCR7c3ViY2ZnVHlwZX1fZmlsZWBdJyA6IHRoaXNbc3ViY29uZmlnS2V5XVxuICAgICAgICAgfSk7XG4gICAgICAgICB9Ki9cbiAgICAgICAgbGV0IGJhc2VuYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlKTtcbiAgICAgICAgaWYgKCBmaWxlICE9PSBiYXNlbmFtZSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0ICR7c3ViY2ZnVHlwZX1fZmlsZSgke2ZpbGV9KSwgcGFzc2VkIE5PVCBhIGJhc2VuYW1lIChubyBkaXJzKS4gY29udGludWluZyB3aXRoIG9ubHkgYmFzZW5hbWVgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoYmFzZW5hbWUpO1xuICAgICAgICBpZiAoICFib29sKGV4dCkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCAke3N1YmNmZ1R5cGV9X2ZpbGUoJHtmaWxlfSkgaGFzIG5vIGV4dGVuc2lvbi4gYWRkaW5nIC4ke3N1YmNmZ1R5cGV9YCk7XG4gICAgICAgICAgICBiYXNlbmFtZSArPSBgLiR7c3ViY2ZnVHlwZX1gO1xuICAgICAgICAgICAgLy8gVE9ETzogbWF5YmUgbm90IGFjY2VwdCBzdWJjZmdUeXBlLCBidXQgb25seSBmaWxlIHdpdGggZXh0ZW5zaW9uXG4gICAgICAgIH0gZWxzZSBpZiAoIGV4dCAhPT0gYC4ke3N1YmNmZ1R5cGV9YCApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0ICR7c3ViY2ZnVHlwZX1fZmlsZSgke2ZpbGV9KSBiYWQgZXh0ZW5zaW9uOiBcIiR7ZXh0fVwiLiByZXBsYWNpbmcgd2l0aCAuJHtzdWJjZmdUeXBlfWApO1xuICAgICAgICAgICAgYmFzZW5hbWUgPSBteWZzLnJlcGxhY2VfZXh0KGJhc2VuYW1lLCBgLiR7c3ViY2ZnVHlwZX1gKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KHN1YmNvbmZpZ0tleSwgYmFzZW5hbWUpO1xuICAgICAgICBjb25zb2xlLmxvZyhgc2V0U3ViY29uZmlnYCwgeyBmaWxlLCBiYXNlbmFtZSwgc3ViY2ZnVHlwZSwgc3ViY29uZmlnLCBcInN1YmNvbmZpZy5zdG9yZVwiIDogc3ViY29uZmlnPy5zdG9yZSwgfSk7XG4gICAgICAgIHRoaXNbc3ViY2ZnVHlwZV0gPSBuZXcgU3ViY29uZmlnKGJhc2VuYW1lLCBzdWJjZmdUeXBlLCBzdWJjb25maWcpXG4gICAgfVxuICAgIFxuICAgIGdldFN1YmNvbmZpZygpOiBTdWJjb25maWcge1xuICAgICAgICByZXR1cm4gdGhpc1t0aGlzLmV4cGVyaW1lbnRfdHlwZV1cbiAgICB9XG4gICAgXG4gICAgLyoqUmV0dXJucyB0aGUgZXhhbSBmaWxlIG5hbWUgaW5jbHVkaW5nIGV4dGVuc2lvbiovXG4gICAgZ2V0IGV4YW1fZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICAvLyBEb24ndCBjYWNoZTsgdGhpcy5leGFtIGlzIGEgU3ViY29uZmlnXG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnZXhhbV9maWxlJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlVwZGF0ZXMgZXhhbV9maWxlIGFuZCBhbHNvIGluaXRpYWxpemVzIG5ldyBTdWJjb25maWcqL1xuICAgIHNldCBleGFtX2ZpbGUoZmlsZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3ViY29uZmlnKGZpbGUsIFwiZXhhbVwiKVxuICAgIH1cbiAgICBcbiAgICAvKipSZXR1cm5zIHRoZSB0ZXN0IGZpbGUgbmFtZSBpbmNsdWRpbmcgZXh0ZW5zaW9uKi9cbiAgICBnZXQgdGVzdF9maWxlKCk6IHN0cmluZyB7XG4gICAgICAgIC8vIERvbid0IGNhY2hlOyB0aGlzLnRlc3QgaXMgYSBTdWJjb25maWdcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCd0ZXN0X2ZpbGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqVXBkYXRlcyB0ZXN0X2ZpbGUgYW5kIGFsc28gaW5pdGlhbGl6ZXMgbmV3IFN1YmNvbmZpZyovXG4gICAgc2V0IHRlc3RfZmlsZShmaWxlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXRTdWJjb25maWcoZmlsZSwgXCJ0ZXN0XCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCBleHBlcmltZW50X3R5cGUoKTogRXhwZXJpbWVudFR5cGUge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiZXhwZXJpbWVudF90eXBlXCIpXG4gICAgICAgIC8qaWYgKCB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgY29uc3QgZXhwZXJpbWVudFR5cGUgPSB0aGlzLmdldCgnZXhwZXJpbWVudF90eXBlJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgcmV0dXJuIGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZTtcbiAgICAgICAgIH0qL1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgZXhwZXJpbWVudF90eXBlKGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBpZiAoIGV4cGVyaW1lbnRUeXBlICE9PSAndGVzdCcgJiYgZXhwZXJpbWVudFR5cGUgIT09ICdleGFtJyApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQmlnQ29uZmlnQ2xzIGV4cGVyaW1lbnRfdHlwZSBzZXR0ZXIsIGdvdCBleHBlcmltZW50VHlwZTogJyR7ZXhwZXJpbWVudFR5cGV9Jy4gTXVzdCBiZSBlaXRoZXIgJ3Rlc3QnIG9yICdleGFtJy4gc2V0dGluZyB0byB0ZXN0YCk7XG4gICAgICAgICAgICBleHBlcmltZW50VHlwZSA9ICd0ZXN0JztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldCgnZXhwZXJpbWVudF90eXBlJywgZXhwZXJpbWVudFR5cGUpO1xuICAgICAgICB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGdldCBzdWJqZWN0cygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnc3ViamVjdHMnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqRW5zdXJlcyBoYXZpbmcgYHRoaXMudGVzdC5zdWJqZWN0YCBhbmQgYHRoaXMuZXhhbS5zdWJqZWN0YCBpbiB0aGUgbGlzdCByZWdhcmRsZXNzKi9cbiAgICBzZXQgc3ViamVjdHMoc3ViamVjdExpc3Q6IHN0cmluZ1tdKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2Fybignc2V0IHN1YmplY3RzLCBEUllSVU4uIHJldHVybmluZycpXG4gICAgICAgIH1cbiAgICAgICAgc3ViamVjdExpc3QucHVzaCh0aGlzLnRlc3Quc3ViamVjdCk7XG4gICAgICAgIHN1YmplY3RMaXN0LnB1c2godGhpcy5leGFtLnN1YmplY3QpO1xuICAgICAgICBjb25zdCBzdWJqZWN0cyA9IFsgLi4ubmV3IFNldChzdWJqZWN0TGlzdCkgXTtcbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3RzJywgc3ViamVjdHMpO1xuICAgICAgICBjb25zb2xlLndhcm4oJ1RoaXMgdXNlZCB0byBtYXliZSBudWxsaWZ5IGNvbmZpZy5zdWJqZWN0LiBEb2VzbnQgZG8gdGhhdCBhbnltb3JlJyk7XG4gICAgICAgIC8qY29uc3QgY29uZmlnID0gdGhpcy5jb25maWcodGhpcy5leHBlcmltZW50X3R5cGUpO1xuICAgICAgICAgY29uc3QgY3VycmVudFN1YmplY3QgPSBjb25maWcuc3ViamVjdDtcbiAgICAgICAgIGlmICggY3VycmVudFN1YmplY3QgJiYgIXN1YmplY3RzLmluY2x1ZGVzKGN1cnJlbnRTdWJqZWN0KSApXG4gICAgICAgICBjb25maWcuc3ViamVjdCA9IG51bGw7Ki9cbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGNvbmZpZ3NQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnNvbGUud2FybignY2FsbGVkIGNvbmZpZ3NQYXRoLCBzaG91bGQgdXNlIENPTkZJR1NfUEFUSF9BQlMnKTtcbiAgICAgICAgcmV0dXJuIENPTkZJR1NfUEFUSF9BQlM7XG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICB0cnV0aHNEaXJQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnNvbGUud2FybignY2FsbGVkIHRydXRoc0RpclBhdGgsIHNob3VsZCB1c2UgVFJVVEhTX1BBVEhfQUJTJyk7XG4gICAgICAgIHJldHVybiBUUlVUSFNfUEFUSF9BQlM7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBzdWJqZWN0c0RpclBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdjYWxsZWQgc3ViamVjdHNEaXJQYXRoLCBzaG91bGQgdXNlIFNVQkpFQ1RTX1BBVEhfQUJTJyk7XG4gICAgICAgIHJldHVybiBTVUJKRUNUU19QQVRIX0FCU1xuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgc2FsYW1hbmRlckRpclBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdjYWxsZWQgc2FsYW1hbmRlckRpclBhdGgsIHNob3VsZCB1c2UgU0FMQU1BTkRFUl9QQVRIX0FCUycpO1xuICAgICAgICByZXR1cm4gU0FMQU1BTkRFUl9QQVRIX0FCU1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBwcml2YXRlIGdldCBkZXYoKTogeyBbSyBpbiBrZXlvZiBEZXZPcHRpb25zXTogKCkgPT4gYm9vbGVhbiB9IHtcbiAgICAgICAgY29uc3QgX2RldiA9IHRoaXMuZ2V0KCdkZXYnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNraXBfd2hvbGVfdHJ1dGggOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF93aG9sZV90cnV0aCxcbiAgICAgICAgICAgIHNraXBfbGV2ZWxfaW50cm8gOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9sZXZlbF9pbnRybyxcbiAgICAgICAgICAgIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrIDogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrLFxuICAgICAgICAgICAgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2sgOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2ssXG4gICAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIFxufVxuXG5cbmV4cG9ydCBjbGFzcyBTdWJjb25maWcgZXh0ZW5kcyBDb25mPElTdWJjb25maWc+IHsgLy8gQUtBIENvbmZpZ1xuICAgIHByaXZhdGUgcmVhZG9ubHkgdHlwZTogRXhwZXJpbWVudFR5cGU7XG4gICAgcHJvdGVjdGVkIHRydXRoOiBUcnV0aDtcbiAgICByZWFkb25seSBjYWNoZTogUGFydGlhbDxJU3ViY29uZmlnPjtcbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBAcGFyYW0gbmFtZSAtIGluY2x1ZGluZyBleHRlbnNpb24uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCB0eXBlOiBFeHBlcmltZW50VHlwZSwgc3ViY29uZmlnPzogU3ViY29uZmlnKSB7XG4gICAgICAgIGxldCBbIGZpbGVuYW1lLCBleHQgXSA9IG15ZnMuc3BsaXRfZXh0KG5hbWUpO1xuICAgICAgICBpZiAoICFleHQuZW5kc1dpdGgodHlwZSkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFN1YmNvbmZpZyBjb25zdHJ1Y3RvciwgZXh0IChcIiR7ZXh0fVwiKSBvZiBwYXNzZWQgbmFtZSAoXCIke25hbWV9XCIpIGlzbnQgcGFzc2VkIHR5cGUgKFwiJHt0eXBlfVwiKS4gUmVwbGFjaW5nIG5hbWUncyBleHQgdG8gXCIke3R5cGV9XCJgKTtcbiAgICAgICAgICAgIG5hbWUgPSBteWZzLnJlcGxhY2VfZXh0KG5hbWUsIHR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkZWZhdWx0cztcbiAgICAgICAgaWYgKCBib29sKHN1YmNvbmZpZykgKSB7XG4gICAgICAgICAgICBpZiAoIHN1YmNvbmZpZy50b09iaiApIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0cyA9IHsgLi4uc3ViY29uZmlnLnRvT2JqKCksIG5hbWUgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdHMgPSBzdWJjb25maWc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWZhdWx0cyA9IHsgbmFtZSB9O1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIGZpbGVFeHRlbnNpb24gOiB0eXBlLFxuICAgICAgICAgICAgY3dkIDogQ09ORklHU19QQVRIX0FCUyxcbiAgICAgICAgICAgIGNvbmZpZ05hbWUgOiBmaWxlbmFtZSxcbiAgICAgICAgICAgIGRlZmF1bHRzXG4gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhgU3ViY29uZmlnIGNvbnN0cnVjdG9yLCBkZWZhdWx0czpgLCBkZWZhdWx0cyk7XG4gICAgICAgIHRoaXMuY2FjaGUgPSB7IG5hbWUgfTtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy50cnV0aCA9IG5ldyBUcnV0aChteWZzLnJlbW92ZV9leHQodGhpcy50cnV0aF9maWxlKSk7XG4gICAgICAgIGlmICggc3ViY29uZmlnIClcbiAgICAgICAgICAgIHRoaXMuc2V0KHN1YmNvbmZpZy5zdG9yZSk7XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGRvVHJ1dGhGaWxlQ2hlY2soKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5K+IFN1YmNvbmZpZygke3RoaXMudHlwZX0pLmRvVHJ1dGhGaWxlQ2hlY2soKWApO1xuICAgICAgICBcbiAgICAgICAgLy8gY29uc3QgdHJ1dGggPSB0aGlzLmdldFRydXRoKCk7XG4gICAgICAgIGlmICggdGhpcy50cnV0aC50eHQuYWxsRXhpc3QoKSApIHtcbiAgICAgICAgICAgIHJldHVybiBBbGVydC5zbWFsbC5zdWNjZXNzKGAke3RoaXMudHJ1dGgubmFtZX0udHh0LCAqX29uLnR4dCwgYW5kICpfb2ZmLnR4dCBmaWxlcyBleGlzdC5gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBbJ2Z1cl9lbGlzZV9CJyB4IDMsICdmdXJfZWxpc2VfUi50eHQnIHggMywgLi4uXVxuICAgICAgICBjb25zdCB0eHRGaWxlc0xpc3QgPSByZXF1aXJlKFwiLi4vR2xvYlwiKS5nZXRUcnV0aEZpbGVzV2hlcmUoeyBleHRlbnNpb24gOiAndHh0JyB9KS5tYXAobXlmcy5yZW1vdmVfZXh0KTtcbiAgICAgICAgY29uc3QgdHJ1dGhzV2l0aDNUeHRGaWxlcyA9IHR4dEZpbGVzTGlzdC5maWx0ZXIoYSA9PiB0eHRGaWxlc0xpc3QuZmlsdGVyKHR4dCA9PiB0eHQuc3RhcnRzV2l0aChhKSkubGVuZ3RoID49IDMpO1xuICAgICAgICBpZiAoICFib29sKHRydXRoc1dpdGgzVHh0RmlsZXMpIClcbiAgICAgICAgICAgIHJldHVybiBBbGVydC5iaWcud2FybmluZyh7XG4gICAgICAgICAgICAgICAgdGl0bGUgOiAnTm8gdmFsaWQgdHJ1dGggZmlsZXMgZm91bmQnLFxuICAgICAgICAgICAgICAgIGh0bWwgOiAnVGhlcmUgbmVlZHMgdG8gYmUgYXQgbGVhc3Qgb25lIHR4dCBmaWxlIHdpdGggMiBcIm9uXCIgYW5kIFwib2ZmXCIgY291bnRlcnBhcnRzLidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIEFsZXJ0LmJpZy5ibG9ja2luZyh7XG4gICAgICAgICAgICB0aXRsZSA6IGBEaWRuJ3QgZmluZCBhbGwgdGhyZWUgLnR4dCBmaWxlcyBmb3IgJHt0aGlzLnRydXRoLm5hbWV9YCxcbiAgICAgICAgICAgIGh0bWwgOiAnVGhlIGZvbGxvd2luZyB0cnV0aHMgYWxsIGhhdmUgMyB0eHQgZmlsZXMuIFBsZWFzZSBjaG9vc2Ugb25lIG9mIHRoZW0sIG9yIGZpeCB0aGUgZmlsZXMgYW5kIHJlbG9hZC4nLFxuICAgICAgICAgICAgc2hvd0Nsb3NlQnV0dG9uIDogdHJ1ZSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgc3RyaW5ncyA6IHRydXRoc1dpdGgzVHh0RmlsZXMsXG4gICAgICAgICAgICBjbGlja0ZuIDogZWwgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IGNvbmZpZyA9IHRoaXMuY29uZmlnKHRoaXMuZXhwZXJpbWVudF90eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxldmVscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRydXRoX2ZpbGUgPSBlbC50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKGVsLnRleHQoKSk7XG4gICAgICAgICAgICAgICAgICAgIHJlbG9hZFBhZ2UoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoICggZXJyICkge1xuICAgICAgICAgICAgICAgICAgICBBbGVydC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBBbGVydC5iaWcuZXJyb3IoeyB0aXRsZSA6IGVyci5tZXNzYWdlLCBodG1sIDogJ1NvbWV0aGluZyBoYXBwZW5lZC4nIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGluY3JlYXNlKEs6IGtleW9mIElTdWJjb25maWcpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdpbmNyZWFzZSwgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBWID09PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgMSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdHlwZW9mViA9IHR5cGVvZiBWO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgaWYgKCB0eXBlb2ZWID09PSAnbnVtYmVyJyB8fCAodHlwZW9mViA9PT0gJ3N0cmluZycgJiYgVi5pc2RpZ2l0KCkpICkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICB0aGlzLnNldChLLCBNYXRoLmZsb29yKFYpICsgMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkJpZ0NvbmZpZ0NscyB0cmllZCB0byBpbmNyZWFzZSBhIHZhbHVlIHRoYXQgaXMgbm90IGEgbnVtYmVyIG5vciBhIHN0cmluZy5pc2RpZ2l0KClcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHRvT2JqKCk6IE9taXQ8SVN1YmNvbmZpZywgXCJuYW1lXCI+IHsgLy8gQUtBIHRvU2F2ZWRDb25maWdcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gOiB0aGlzLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbixcbiAgICAgICAgICAgIGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uIDogdGhpcy5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbixcbiAgICAgICAgICAgIGRlbW9fdHlwZSA6IHRoaXMuZGVtb190eXBlLFxuICAgICAgICAgICAgZXJyb3JzX3BsYXlyYXRlIDogdGhpcy5lcnJvcnNfcGxheXJhdGUsXG4gICAgICAgICAgICBmaW5pc2hlZF90cmlhbHNfY291bnQgOiB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudCxcbiAgICAgICAgICAgIGxldmVscyA6IHRoaXMubGV2ZWxzLFxuICAgICAgICAgICAgc3ViamVjdCA6IHRoaXMuc3ViamVjdCxcbiAgICAgICAgICAgIHRydXRoX2ZpbGUgOiB0aGlzLnRydXRoX2ZpbGUsXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGZyb21PYmooc3ViY29uZmlnOiBTdWJjb25maWcpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSByZXR1cm4gY29uc29sZS53YXJuKCdmcm9tT2JqLCBEUllSVU4uIHJldHVybmluZycpO1xuICAgICAgICB0aGlzLnNldChzdWJjb25maWcuc3RvcmUpO1xuICAgICAgICAvLyB0aGlzLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbiA9IHN1YmNvbmZpZy5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb247XG4gICAgICAgIC8vIHRoaXMuYWxsb3dlZF90ZW1wb19kZXZpYXRpb24gPSBzdWJjb25maWcuYWxsb3dlZF90ZW1wb19kZXZpYXRpb247XG4gICAgICAgIC8vIHRoaXMuZGVtb190eXBlID0gc3ViY29uZmlnLmRlbW9fdHlwZTtcbiAgICAgICAgLy8gdGhpcy5lcnJvcnNfcGxheXJhdGUgPSBzdWJjb25maWcuZXJyb3JzX3BsYXlyYXRlO1xuICAgICAgICAvLyB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudCA9IHN1YmNvbmZpZy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgICAgIC8vIHRoaXMubGV2ZWxzID0gc3ViY29uZmlnLmxldmVscztcbiAgICAgICAgLy8gdGhpcy5zdWJqZWN0ID0gc3ViY29uZmlnLnN1YmplY3Q7XG4gICAgICAgIC8vIHRoaXMudHJ1dGhfZmlsZSA9IHN1YmNvbmZpZy50cnV0aF9maWxlO1xuICAgICAgICAvLyB0aGlzLl91cGRhdGVTYXZlZEZpbGUoJ3RydXRoX2ZpbGVfcGF0aCcsIGNmZ0ZpbGUudHJ1dGhfZmlsZV9wYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIHByaXZhdGUgX3VwZGF0ZVNhdmVkRmlsZShrZXk6IGtleW9mIElTdWJjb25maWcsIHZhbHVlKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignX3VwZGF0ZVNhdmVkRmlsZSwgRFJZUlVOLiByZXR1cm5pbmcnKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ191cGRhdGVTYXZlZEZpbGUoKSBkb2VzIG5vdGhpbmcsIHJldHVybmluZycpO1xuICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgLypjb25zdCBjb25mID0gbmV3IChyZXF1aXJlKCdjb25mJykpKHtcbiAgICAgICAgIGN3ZCA6IENPTkZJR1NfUEFUSF9BQlMsXG4gICAgICAgICBjb25maWdOYW1lIDogdGhpcy5uYW1lLFxuICAgICAgICAgZmlsZUV4dGVuc2lvbiA6IHRoaXMudHlwZSxcbiAgICAgICAgIHNlcmlhbGl6ZSA6IHZhbHVlID0+IEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCA0KVxuICAgICAgICAgfSk7XG4gICAgICAgICBjb25mLnNldChrZXksIHZhbHVlKTsqL1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBwcml2YXRlIHNldERldmlhdGlvbihkZXZpYXRpb25UeXBlOiBEZXZpYXRpb25UeXBlLCBkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICBjb25zdCB0eXBlb2ZEZXZpYXRpb24gPSB0eXBlb2YgZGV2aWF0aW9uO1xuICAgICAgICBpZiAoIHR5cGVvZkRldmlhdGlvbiA9PT0gJ251bWJlcicgKSB7XG4gICAgICAgICAgICBkZXZpYXRpb24gPSBgJHtkZXZpYXRpb259JWA7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldERldmlhdGlvbiBnb3QgXCJkZXZpYXRpb25cIiB0eXBlIG51bWJlci4gYXBwZW5kZWQgXCIlXCIuIGRldmlhdGlvbiBub3c6ICR7ZGV2aWF0aW9ufWApO1xuICAgICAgICB9IGVsc2UgaWYgKCB0eXBlb2ZEZXZpYXRpb24gPT09ICdzdHJpbmcnICkge1xuICAgICAgICAgICAgaWYgKCAhZGV2aWF0aW9uLmVuZHNXaXRoKFwiJVwiKSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldERldmlhdGlvbiBnb3QgZGV2aWF0aW9uIHdpdGhvdXQgJS4gYXBwZW5kZWQgJS4gZGV2aWF0aW9uIG5vdzogXCIke2RldmlhdGlvbn1cImApO1xuICAgICAgICAgICAgICAgIGRldmlhdGlvbiA9IGAke2RldmlhdGlvbn0lYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0RGV2aWF0aW9uLCByZWNlaXZlZCBcImRldmlhdGlvblwiIG5vdCBzdHJpbmcgbm90IG51bWJlci4gcmV0dXJuaW5nLiBkZXZpYXRpb246YCwgZGV2aWF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB0aGlzLnNldChgYWxsb3dlZF8ke2RldmlhdGlvblR5cGV9X2RldmlhdGlvbmAsIGRldmlhdGlvbik7XG4gICAgICAgIHRoaXMuY2FjaGVbYGFsbG93ZWRfJHtkZXZpYXRpb25UeXBlfV9kZXZpYXRpb25gXSA9IGRldmlhdGlvbjtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0IGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJhbGxvd2VkX3RlbXBvX2RldmlhdGlvblwiKVxuICAgICAgICAvKmlmICggdGhpcy5jYWNoZS5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgY29uc3QgYWxsb3dlZFRlbXBvRGV2aWF0aW9uID0gdGhpcy5nZXQoJ2FsbG93ZWRfdGVtcG9fZGV2aWF0aW9uJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uID0gYWxsb3dlZFRlbXBvRGV2aWF0aW9uO1xuICAgICAgICAgcmV0dXJuIGFsbG93ZWRUZW1wb0RldmlhdGlvbjtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbjtcbiAgICAgICAgIH0qL1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgYWxsb3dlZF90ZW1wb19kZXZpYXRpb24oZGV2aWF0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXREZXZpYXRpb24oXCJ0ZW1wb1wiLCBkZXZpYXRpb24pO1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBnZXQgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJhbGxvd2VkX3JoeXRobV9kZXZpYXRpb25cIik7XG4gICAgICAgIC8qaWYgKCB0aGlzLmNhY2hlLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgY29uc3QgYWxsb3dlZFJoeXRobURldmlhdGlvbiA9IHRoaXMuZ2V0KCdhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24nKTtcbiAgICAgICAgIHRoaXMuY2FjaGUuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uID0gYWxsb3dlZFJoeXRobURldmlhdGlvbjtcbiAgICAgICAgIHJldHVybiBhbGxvd2VkUmh5dGhtRGV2aWF0aW9uO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbjtcbiAgICAgICAgIH0qL1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uKGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0RGV2aWF0aW9uKFwicmh5dGhtXCIsIGRldmlhdGlvbik7XG4gICAgfVxuICAgIFxuICAgIGdldCBkZW1vX3R5cGUoKTogRGVtb1R5cGUge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2RlbW9fdHlwZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZGVtb190eXBlKHR5cGU6IERlbW9UeXBlKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybignc2V0IGRlbW9fdHlwZSByZXR1cm5zIGEgdmFsdWUsIGlzIHRoaXMgbmVlZGVkPycpO1xuICAgICAgICBpZiAoICFbICd2aWRlbycsICdhbmltYXRpb24nIF0uaW5jbHVkZXModHlwZSkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYENvbmZpZyBkZW1vX3R5cGUgc2V0dGVyLCBiYWQgdHlwZSA9ICR7dHlwZX0sIGNhbiBiZSBlaXRoZXIgdmlkZW8gb3IgYW5pbWF0aW9uYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXQoJ2RlbW9fdHlwZScsIHR5cGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldCBlcnJvcnNfcGxheXJhdGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdlcnJvcnNfcGxheXJhdGUnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGVycm9yc19wbGF5cmF0ZShzcGVlZDogbnVtYmVyKSB7XG4gICAgICAgIGlmICggaXNOYU4oc3BlZWQpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBjb25maWcgc2V0IGVycm9yc19wbGF5cmF0ZSwgcmVjZWl2ZWQgYmFkIFwic3BlZWRcIiBOYU46ICR7c3BlZWR9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZXJyb3JzX3BsYXlyYXRlJywgc3BlZWQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBnZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnZmluaXNoZWRfdHJpYWxzX2NvdW50Jyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBmaW5pc2hlZF90cmlhbHNfY291bnQoY291bnQ6IG51bWJlcikge1xuICAgICAgICBpZiAoIGlzTmFOKGNvdW50KSB8fCBjb3VudCA8IDAgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGNvbmZpZyBzZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50LCByZWNlaXZlZCBiYWQgXCJjb3VudFwiOiAke2NvdW50fWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2ZpbmlzaGVkX3RyaWFsc19jb3VudCcsIGNvdW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipBbHdheXMgcmV0dXJucyBgbmFtZWAgZnJvbSBjYWNoZS4gVGhpcyBpcyBiZWNhdXNlIHRoZXJlJ3Mgbm8gc2V0dGVyOyBgbmFtZWAgaXMgc3RvcmVkIGluIGNhY2hlIGluIGNvbnN0cnVjdG9yLiovXG4gICAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUubmFtZTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IHN1YmplY3QoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdzdWJqZWN0Jyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBzdWJqZWN0KG5hbWU6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfkr5zZXQgc3ViamVjdCgnLCBuYW1lLCAnKScpO1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ3NldCBzdWJqZWN0LCBEUllSVU4nKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldCgnc3ViamVjdCcsIG5hbWUpO1xuICAgICAgICBpZiAoIG5hbWUgKSB7XG4gICAgICAgICAgICBjb25zdCBHbG9iID0gcmVxdWlyZSgnLi4vR2xvYicpLmRlZmF1bHQ7XG4gICAgICAgICAgICBHbG9iLkJpZ0NvbmZpZy5zdWJqZWN0cyA9IFsgLi4ubmV3IFNldChbIC4uLkdsb2IuQmlnQ29uZmlnLnN1YmplY3RzLCBuYW1lIF0pIF07XG4gICAgICAgICAgICAvLyBzdXBlci5zZXQoJ3N1YmplY3RzJywgWy4uLm5ldyBTZXQoWy4uLnN1cGVyLmdldCgnc3ViamVjdHMnKSwgbmFtZV0pXSk7XG4gICAgICAgICAgICAvLyBzdXBlci5zdWJqZWN0cyA9IFsgLi4uc3VwZXIuZ2V0KCdzdWJqZWN0cycpLCBuYW1lIF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZ2V0IHRydXRoX2ZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCd0cnV0aF9maWxlJylcbiAgICB9XG4gICAgXG4gICAgLyoqQWxzbyBzZXRzIHRoaXMudHJ1dGggKG1lbW9yeSkqL1xuICAgIHNldCB0cnV0aF9maWxlKHRydXRoX2ZpbGU6IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHRydXRoID0gbmV3IFRydXRoKHRydXRoX2ZpbGUpO1xuICAgICAgICAgICAgaWYgKCAhdHJ1dGgudHh0LmFsbEV4aXN0KCkgKSB7XG4gICAgICAgICAgICAgICAgQWxlcnQuc21hbGwud2FybmluZyhgTm90IGFsbCB0eHQgZmlsZXMgZXhpc3Q6ICR7dHJ1dGhfZmlsZX1gKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50cnV0aCA9IHRydXRoO1xuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIEFsZXJ0LnNtYWxsLndhcm5pbmcoZSk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oZSlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldChgdHJ1dGhfZmlsZWAsIHRydXRoX2ZpbGUpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8qZ2V0VHJ1dGgoKTogVHJ1dGgge1xuICAgICByZXR1cm4gbmV3IFRydXRoKG15ZnMucmVtb3ZlX2V4dCh0aGlzLnRydXRoX2ZpbGUpKTtcbiAgICAgfSovXG4gICAgXG4gICAgXG4gICAgZ2V0IGxldmVscygpOiBJTGV2ZWxbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnbGV2ZWxzJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBsZXZlbHMobGV2ZWxzOiBJTGV2ZWxbXSkge1xuICAgICAgICBpZiAoICFBcnJheS5pc0FycmF5KGxldmVscykgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCBsZXZlbHMsIHJlY2VpdmVkIFwibGV2ZWxzXCIgbm90IGlzQXJyYXkuIG5vdCBzZXR0aW5nIGFueXRoaW5nLiBsZXZlbHM6IGAsIGxldmVscyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBiZXR0ZXIgY2hlY2tzXG4gICAgICAgICAgICB0aGlzLnNldCgnbGV2ZWxzJywgbGV2ZWxzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBcbiAgICBjdXJyZW50VHJpYWxDb29yZHMoKTogbnVtYmVyW10ge1xuICAgICAgICAvLyBsZXQgeyBsZXZlbHMsIGZpbmlzaGVkX3RyaWFsc19jb3VudCB9ID0gdGhpcy5jb25maWcoKTtcbiAgICAgICAgbGV0IGZsYXRUcmlhbHNMaXN0ID0gdGhpcy5sZXZlbHMubWFwKGxldmVsID0+IGxldmVsLnRyaWFscyk7XG4gICAgICAgIGZvciAoIGxldCBbIGxldmVsSW5kZXgsIHRyaWFsc051bSBdIG9mIGVudW1lcmF0ZShmbGF0VHJpYWxzTGlzdCkgKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCB0cmlhbFN1bVNvRmFyID0gc3VtKGZsYXRUcmlhbHNMaXN0LnNsaWNlKDAsIGxldmVsSW5kZXggKyAxKSk7XG4gICAgICAgICAgICBjb25zdCBmaW5pc2hlZFRyaWFsc0NvdW50ID0gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgICAgICAgICBpZiAoIHRyaWFsU3VtU29GYXIgPiBmaW5pc2hlZFRyaWFsc0NvdW50IClcbiAgICAgICAgICAgICAgICByZXR1cm4gWyBsZXZlbEluZGV4LCB0cmlhbHNOdW0gLSAodHJpYWxTdW1Tb0ZhciAtIGZpbmlzaGVkVHJpYWxzQ291bnQpIF07XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS53YXJuKFwiY3VycmVudFRyaWFsQ29vcmRzOiBvdXQgb2YgaW5kZXggZXJyb3JcIik7XG4gICAgfVxuICAgIFxuICAgIGlzRGVtb1ZpZGVvKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5kZW1vX3R5cGUgPT09ICd2aWRlbyc7XG4gICAgfVxuICAgIFxuICAgIGlzV2hvbGVUZXN0T3ZlcigpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHN1bSh0aGlzLmxldmVscy5tYXAobGV2ZWwgPT4gbGV2ZWwudHJpYWxzKSkgPT0gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgfVxuICAgIFxuICAgIGdldFN1YmplY3REaXJOYW1lcygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiBmcy5yZWFkZGlyU3luYyhTVUJKRUNUU19QQVRIX0FCUyk7XG4gICAgfVxuICAgIFxuICAgIGdldEN1cnJlbnRMZXZlbCgpOiBMZXZlbCB7XG4gICAgICAgIFxuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIHJldHVybiBuZXcgTGV2ZWwodGhpcy5sZXZlbHNbbGV2ZWxfaW5kZXhdLCBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXgpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBnZXRMZXZlbENvbGxlY3Rpb24oKTogTGV2ZWxDb2xsZWN0aW9uIHtcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICByZXR1cm4gbmV3IExldmVsQ29sbGVjdGlvbih0aGlzLmxldmVscywgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqR2V0cyB0aGUgY3VycmVudCB0cmlhbCdzIHBhdGggKGpvaW4gdGhpcy50ZXN0T3V0UGF0aCgpIGFuZCBsZXZlbF8ke2xldmVsX2luZGV4fS4uLiksIGFuZCByZXR1cm5zIGEgVHJ1dGggb2YgaXQqL1xuICAgIHRyaWFsVHJ1dGgoKTogVHJ1dGgge1xuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIC8vIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRoaXMudGVzdE91dFBhdGgoKSwgYGxldmVsXyR7bGV2ZWxfaW5kZXh9X3RyaWFsXyR7dHJpYWxfaW5kZXh9YCkpO1xuICAgICAgICByZXR1cm4gbmV3IFRydXRoKHBhdGguam9pbih0aGlzLnRlc3RPdXRQYXRoKCksIGBsZXZlbF8ke2xldmVsX2luZGV4fV90cmlhbF8ke3RyaWFsX2luZGV4fWApKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXCJjOlxcU3luY1xcQ29kZVxcUHl0aG9uXFxQeWFuby1yZWxlYXNlXFxzcmNcXGV4cGVyaW1lbnRzXFxzdWJqZWN0c1xcZ2lsYWRcXGZ1cl9lbGlzZVwiKi9cbiAgICB0ZXN0T3V0UGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBjdXJyU3ViamVjdERpciA9IHBhdGguam9pbihTVUJKRUNUU19QQVRIX0FCUywgdGhpcy5zdWJqZWN0KTsgLy8gXCIuLi4vc3ViamVjdHMvZ2lsYWRcIlxuICAgICAgICByZXR1cm4gcGF0aC5qb2luKGN1cnJTdWJqZWN0RGlyLCB0aGlzLnRydXRoLm5hbWUpO1xuICAgIH1cbiAgICBcbiAgICBcbn1cbiJdfQ==