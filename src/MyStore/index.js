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
    setSubconfig(file, subcfgType, data) {
        const subconfigKey = `${subcfgType}_file`;
        if (this.get(subconfigKey) === file) {
            return console.warn(`setSubconfig, file === existing one.`, {
                file,
                subcfgType,
                'this[`${subcfgType}_file`]': this[subconfigKey]
            });
        }
        let basename = path.basename(file);
        if (file !== basename) {
            console.warn(`set ${subcfgType}_file(${file}), passed NOT a basename (no dirs). continuing with only basename`);
        }
        const ext = path.extname(file);
        if (!util_1.bool(ext)) {
            console.warn(`set ${subcfgType}_file(${file}) has no extension. adding .${subcfgType}`);
            basename += `.${subcfgType}`;
        }
        else if (ext !== `.${subcfgType}`) {
            console.warn(`set ${subcfgType}_file(${file}) bad extension: "${ext}". replacing with .${subcfgType}`);
            MyFs_1.default.replace_ext(basename, `.${subcfgType}`);
        }
        this.set(subconfigKey, basename);
        this[subcfgType] = new Subconfig(MyFs_1.default.remove_ext(basename), subcfgType, data);
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
    constructor(name, type, data) {
        super({
            fileExtension: type,
            cwd: CONFIGS_PATH_ABS,
            configName: MyFs_1.default.remove_ext(name),
            defaults: util_1.bool(data) ? data.toObj ? data.toObj() : data : undefined
        });
        this.cache = {};
        this.type = type;
        this.truth = new Truth_1.Truth(MyFs_1.default.remove_ext(this.truth_file));
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
        if (DRYRUN)
            return;
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
            name: this.name,
            subject: this.subject,
            truth_file: this.truth_file,
            levels: this.levels,
        };
    }
    fromFile(cfgFile) {
        if (DRYRUN)
            return console.warn('fromFile, DRYRUN. returning');
        this.allowed_rhythm_deviation = cfgFile.allowed_rhythm_deviation;
        this.allowed_tempo_deviation = cfgFile.allowed_tempo_deviation;
        this.demo_type = cfgFile.demo_type;
        this.errors_playrate = cfgFile.errors_playrate;
        this.finished_trials_count = cfgFile.finished_trials_count;
        this.levels = cfgFile.levels;
        this.subject = cfgFile.subject;
        this.truth_file = cfgFile.truth_file;
    }
    _updateSavedFile(key, value) {
        if (DRYRUN) {
            return console.warn('_updateSavedFile, DRYRUN. returning');
        }
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
        return this.get('name');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFDM0Isa0NBQTJEO0FBQzNELG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsNkJBQTZCO0FBRTdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQTZDdEMsU0FBUyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUk7SUFDakMsSUFBSyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRztRQUNwQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxZQUFZLENBQUMsQ0FBQztRQUN2QyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzdCLE9BQU8sT0FBTyxDQUFDO0tBQ2xCO1NBQU07UUFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxXQUFXLENBQUMsQ0FBQztRQUN0QyxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDN0I7QUFDTCxDQUFDO0FBRUQsTUFBYSxZQUFhLFNBQVEsS0FBaUI7SUFLL0MsWUFBWSxpQkFBaUIsR0FBRyxJQUFJO1FBQ2hDLEtBQUssRUFBRSxDQUFDO1FBSEssVUFBSyxHQUF3QixFQUFFLENBQUM7UUFJN0MsSUFBSyxNQUFNLEVBQUc7WUFDVixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQzlEO1FBQ0QsSUFBSSxDQUFDLElBQUksR0FB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QUFDLFdBQVcsQ0FBQyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBR0Qsa0JBQWtCO1FBQ2QsSUFBSSxDQUFFLFdBQVcsRUFBRSxXQUFXLENBQUUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUM3RCxPQUFPLElBQUksdUJBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBSUQsVUFBVTtRQUNOLElBQUksQ0FBRSxXQUFXLEVBQUUsV0FBVyxDQUFFLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFN0QsT0FBTyxJQUFJLGFBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxTQUFTLFdBQVcsVUFBVSxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDakcsQ0FBQztJQUdELFdBQVc7UUFDUCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztDQUdKO0FBN1ZELDhCQTZWQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFN0b3JlIGZyb20gXCJlbGVjdHJvbi1zdG9yZVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgQWxlcnQgZnJvbSBcIi4uL015QWxlcnRcIjtcbmltcG9ydCBteWZzIGZyb20gXCIuLi9NeUZzXCI7XG5pbXBvcnQgeyBib29sLCByZWxvYWRQYWdlLCBzdW0sIGVudW1lcmF0ZSB9IGZyb20gXCIuLi91dGlsXCI7XG5pbXBvcnQgeyBUcnV0aCB9IGZyb20gXCIuLi9UcnV0aFwiO1xuaW1wb3J0IHsgSUxldmVsLCBMZXZlbCwgTGV2ZWxDb2xsZWN0aW9uIH0gZnJvbSBcIi4uL0xldmVsXCI7XG5pbXBvcnQgeyBTd2VldEFsZXJ0UmVzdWx0IH0gZnJvbSBcInN3ZWV0YWxlcnQyXCI7XG5pbXBvcnQgKiBhcyBDb25mIGZyb20gJ2NvbmYnO1xuXG5jb25zb2xlLmxvZygnc3JjL0JpZ0NvbmZpZy9pbmRleC50cycpO1xuXG5leHBvcnQgdHlwZSBFeHBlcmltZW50VHlwZSA9ICdleGFtJyB8ICd0ZXN0JztcbnR5cGUgRGVtb1R5cGUgPSAndmlkZW8nIHwgJ2FuaW1hdGlvbic7XG5leHBvcnQgdHlwZSBQYWdlTmFtZSA9IFwibmV3XCIgLy8gQUtBIFRMYXN0UGFnZVxuICAgIHwgXCJydW5uaW5nXCJcbiAgICB8IFwicmVjb3JkXCJcbiAgICB8IFwiZmlsZV90b29sc1wiXG4gICAgfCBcInNldHRpbmdzXCJcbnR5cGUgRGV2aWF0aW9uVHlwZSA9ICdyaHl0aG0nIHwgJ3RlbXBvJztcblxuXG5pbnRlcmZhY2UgSVN1YmNvbmZpZyB7XG4gICAgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uOiBzdHJpbmcsXG4gICAgYWxsb3dlZF90ZW1wb19kZXZpYXRpb246IHN0cmluZyxcbiAgICBkZW1vX3R5cGU6IERlbW9UeXBlLFxuICAgIGVycm9yc19wbGF5cmF0ZTogbnVtYmVyLFxuICAgIGZpbmlzaGVkX3RyaWFsc19jb3VudDogbnVtYmVyLFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzdWJqZWN0OiBzdHJpbmcsXG4gICAgdHJ1dGhfZmlsZTogc3RyaW5nLFxuICAgIGxldmVsczogSUxldmVsW10sXG59XG5cblxuaW50ZXJmYWNlIERldk9wdGlvbnMge1xuICAgIHNraXBfd2hvbGVfdHJ1dGg6IGJvb2xlYW4sXG4gICAgc2tpcF9sZXZlbF9pbnRybzogYm9vbGVhbixcbiAgICBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjazogYm9vbGVhbixcbiAgICBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjazogYm9vbGVhblxufVxuXG5pbnRlcmZhY2UgSUJpZ0NvbmZpZyB7XG4gICAgZGV2OiBib29sZWFuLFxuICAgIGRldm9wdGlvbnM6IERldk9wdGlvbnMsXG4gICAgZXhhbV9maWxlOiBzdHJpbmcsXG4gICAgdGVzdF9maWxlOiBzdHJpbmcsXG4gICAgZXhwZXJpbWVudF90eXBlOiBFeHBlcmltZW50VHlwZSxcbiAgICBsYXN0X3BhZ2U6IFBhZ2VOYW1lLFxuICAgIHN1YmplY3RzOiBzdHJpbmdbXSxcbiAgICB2ZWxvY2l0aWVzOiBudW1iZXJbXSxcbn1cblxuZnVuY3Rpb24gdHJ5R2V0RnJvbUNhY2hlPFQgZXh0ZW5kcyBrZXlvZiBJQmlnQ29uZmlnPihjb25maWc6IEJpZ0NvbmZpZ0NscywgcHJvcDogVCk6IElCaWdDb25maWdbVF1cbmZ1bmN0aW9uIHRyeUdldEZyb21DYWNoZTxUIGV4dGVuZHMga2V5b2YgSVN1YmNvbmZpZz4oY29uZmlnOiBTdWJjb25maWcsIHByb3A6IFQpOiBJU3ViY29uZmlnW1RdXG5mdW5jdGlvbiB0cnlHZXRGcm9tQ2FjaGUoY29uZmlnLCBwcm9wKSB7XG4gICAgaWYgKCBjb25maWcuY2FjaGVbcHJvcF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBwcm9wICR7cHJvcH0gTk9UIGNhY2hlYCk7XG4gICAgICAgIGNvbnN0IHByb3BWYWwgPSBjb25maWcuZ2V0KHByb3ApO1xuICAgICAgICBjb25maWcuY2FjaGVbcHJvcF0gPSBwcm9wVmFsO1xuICAgICAgICByZXR1cm4gcHJvcFZhbDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLndhcm4oYHByb3AgJHtwcm9wfSBJTiBjYWNoZWApO1xuICAgICAgICByZXR1cm4gY29uZmlnLmNhY2hlW3Byb3BdO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJpZ0NvbmZpZ0NscyBleHRlbmRzIFN0b3JlPElCaWdDb25maWc+IHtcbiAgICB0ZXN0OiBTdWJjb25maWc7XG4gICAgZXhhbTogU3ViY29uZmlnO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgY2FjaGU6IFBhcnRpYWw8SUJpZ0NvbmZpZz4gPSB7fTtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihfZG9UcnV0aEZpbGVDaGVjayA9IHRydWUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICB0aGlzLnNldCA9ICguLi5hcmdzKSA9PiBjb25zb2xlLndhcm4oYERSWVJVTiwgc2V0OiBgLCBhcmdzKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudGVzdCA9IG5ldyBTdWJjb25maWcodGhpcy50ZXN0X2ZpbGUsIFwidGVzdFwiKTtcbiAgICAgICAgdGhpcy5leGFtID0gbmV3IFN1YmNvbmZpZyh0aGlzLmV4YW1fZmlsZSwgXCJleGFtXCIpO1xuICAgICAgICB0aGlzLnN1YmplY3RzID0gdGhpcy5zdWJqZWN0czsgLy8gdG8gZW5zdXJlIGhhdmluZyBzdWJjb25maWcncyBzdWJqZWN0c1xuICAgICAgICBpZiAoIF9kb1RydXRoRmlsZUNoZWNrICkge1xuICAgICAgICAgICAgdGhpcy50ZXN0LmRvVHJ1dGhGaWxlQ2hlY2soKVxuICAgICAgICAgICAgICAgIC50aGVuKHN3YWwgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5leGFtLmRvVHJ1dGhGaWxlQ2hlY2soKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBmcm9tU2F2ZWRDb25maWcoc2F2ZWRDb25maWc6IElTdWJjb25maWcsIGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdCaWdDb25maWdDbHMgdXNlZCBmcm9tU2F2ZWRDb25maWcuIEltcG9zc2libGUgdG8gbG9hZCBiaWcgZmlsZS4gUmV0dXJuaW5nJyk7XG4gICAgICAgIC8qaWYgKCBEUllSVU4gKSByZXR1cm4gY29uc29sZS5sb2coYGZyb21TYXZlZENvbmZpZywgRFJZUlVOYCk7XG4gICAgICAgICBjb25zdCB0cnV0aEZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShzYXZlZENvbmZpZy50cnV0aF9maWxlX3BhdGgsICcudHh0Jyk7XG4gICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICB0aGlzLnRydXRoX2ZpbGVfcGF0aCA9IG5ldyBUcnV0aChwYXRoLmpvaW4oVFJVVEhTX1BBVEhfQUJTLCB0cnV0aEZpbGVOYW1lKSk7XG4gICAgICAgICB0aGlzLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgdGhpcy5jb25maWcoZXhwZXJpbWVudFR5cGUpLmZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZyk7Ki9cbiAgICB9XG4gICAgXG4gICAgLypzdWJjb25maWdzKCk6IHsgZXhhbTogU3ViY29uZmlnLCB0ZXN0OiBTdWJjb25maWcgfSB7XG4gICAgIGNvbnN0IHN1YmNvbmZpZ3MgPSB7XG4gICAgIGV4YW0gOiB0aGlzLmV4YW0sXG4gICAgIHRlc3QgOiB0aGlzLnRlc3RcbiAgICAgfTtcbiAgICAgXG4gICAgIHJldHVybiBzdWJjb25maWdzO1xuICAgICB9Ki9cbiAgICBcbiAgICAvKmNvbmZpZyh0eXBlOiBFeHBlcmltZW50VHlwZSk6IFN1YmNvbmZpZyB7XG4gICAgIFxuICAgICByZXR1cm4gbmV3IFN1YmNvbmZpZyh0eXBlKTtcbiAgICAgfSovXG4gICAgXG4gICAgXG4gICAgLyoqQGV4YW1wbGVcbiAgICAgdXBkYXRlKCdzdWJqZWN0cycsIFtuYW1lc10pXG4gICAgICovXG4gICAgdXBkYXRlKEs6IGtleW9mIElCaWdDb25maWcsIGt2UGFpcnM6IFBhcnRpYWw8SUJpZ0NvbmZpZz4pXG4gICAgdXBkYXRlKEs6IGtleW9mIElCaWdDb25maWcsIHZhbHVlczogYW55W10pXG4gICAgdXBkYXRlKEssIGt2KSB7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignQmlnQ29uZmlnLnVwZGF0ZSgpIERSWVJVTi4gcmV0dXJuaW5nJyk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IFYgPSB0aGlzLmdldChLKTtcbiAgICAgICAgaWYgKCBBcnJheS5pc0FycmF5KFYpICkge1xuICAgICAgICAgICAgbGV0IG5ld1ZhbHVlOiBhbnlbXSA9IFY7XG4gICAgICAgICAgICBpZiAoIEFycmF5LmlzQXJyYXkoa3YpICkge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlLnB1c2goLi4ua3YpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZS5wdXNoKGt2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0KEssIG5ld1ZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oViwga3YpO1xuICAgICAgICAgICAgdGhpcy5zZXQoSywgVik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KEspO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvLyAvKipAcmV0dXJuIHtzdHJpbmd9Ki9cbiAgICAvLyBnZXQgc2F2ZV9wYXRoKCkge1xuICAgIC8vIFx0cmV0dXJuIHRoaXMuZ2V0KCdzYXZlX3BhdGgnKTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyAvKipAcGFyYW0ge3N0cmluZ30gc2F2ZVBhdGgqL1xuICAgIC8vIHNldCBzYXZlX3BhdGgoc2F2ZVBhdGgpIHtcbiAgICAvLyBcdHRoaXMuc2V0KCdzYXZlX3BhdGgnLCBzYXZlUGF0aCk7XG4gICAgLy8gfVxuICAgIFxuICAgIGdldCBsYXN0X3BhZ2UoKTogUGFnZU5hbWUge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2xhc3RfcGFnZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbGFzdF9wYWdlKHBhZ2U6IFBhZ2VOYW1lKSB7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB2YWxpZHBhZ2VzID0gWyBcIm5ld1wiLCBcInJ1bm5pbmdcIiwgXCJyZWNvcmRcIiwgXCJmaWxlX3Rvb2xzXCIsIFwic2V0dGluZ3NcIiBdO1xuICAgICAgICBpZiAoICF2YWxpZHBhZ2VzLmluY2x1ZGVzKHBhZ2UpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGFzdF9wYWdlKFwiJHtwYWdlfVwiKSwgbXVzdCBiZSBvbmUgb2YgJHt2YWxpZHBhZ2VzLmpvaW4oJywgJyl9LiBzZXR0aW5nIHRvIG5ld2ApO1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xhc3RfcGFnZScsICduZXcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCBwYWdlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipVcGRhdGVzIGBleGFtX2ZpbGVgIG9yIGB0ZXN0X2ZpbGVgLiBBbHNvIGluaXRpYWxpemVzIG5ldyBTdWJjb25maWcuXG4gICAgICogSGFuZGxlcyB3aXRoIHdhcm5pbmdzOiAqL1xuICAgIHNldFN1YmNvbmZpZyhmaWxlOiBzdHJpbmcsIHN1YmNmZ1R5cGU6IEV4cGVyaW1lbnRUeXBlLCBkYXRhPzogU3ViY29uZmlnKSB7XG4gICAgICAgIGNvbnN0IHN1YmNvbmZpZ0tleSA9IGAke3N1YmNmZ1R5cGV9X2ZpbGVgIGFzIFwiZXhhbV9maWxlXCIgfCBcInRlc3RfZmlsZVwiO1xuICAgICAgICBpZiAoIHRoaXMuZ2V0KHN1YmNvbmZpZ0tleSkgPT09IGZpbGUgKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKGBzZXRTdWJjb25maWcsIGZpbGUgPT09IGV4aXN0aW5nIG9uZS5gLCB7XG4gICAgICAgICAgICAgICAgZmlsZSxcbiAgICAgICAgICAgICAgICBzdWJjZmdUeXBlLFxuICAgICAgICAgICAgICAgICd0aGlzW2Ake3N1YmNmZ1R5cGV9X2ZpbGVgXScgOiB0aGlzW3N1YmNvbmZpZ0tleV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGxldCBiYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZSk7XG4gICAgICAgIGlmICggZmlsZSAhPT0gYmFzZW5hbWUgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCAke3N1YmNmZ1R5cGV9X2ZpbGUoJHtmaWxlfSksIHBhc3NlZCBOT1QgYSBiYXNlbmFtZSAobm8gZGlycykuIGNvbnRpbnVpbmcgd2l0aCBvbmx5IGJhc2VuYW1lYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGUpO1xuICAgICAgICBpZiAoICFib29sKGV4dCkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCAke3N1YmNmZ1R5cGV9X2ZpbGUoJHtmaWxlfSkgaGFzIG5vIGV4dGVuc2lvbi4gYWRkaW5nIC4ke3N1YmNmZ1R5cGV9YCk7XG4gICAgICAgICAgICBiYXNlbmFtZSArPSBgLiR7c3ViY2ZnVHlwZX1gO1xuICAgICAgICB9IGVsc2UgaWYgKCBleHQgIT09IGAuJHtzdWJjZmdUeXBlfWAgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCAke3N1YmNmZ1R5cGV9X2ZpbGUoJHtmaWxlfSkgYmFkIGV4dGVuc2lvbjogXCIke2V4dH1cIi4gcmVwbGFjaW5nIHdpdGggLiR7c3ViY2ZnVHlwZX1gKTtcbiAgICAgICAgICAgIG15ZnMucmVwbGFjZV9leHQoYmFzZW5hbWUsIGAuJHtzdWJjZmdUeXBlfWApXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoc3ViY29uZmlnS2V5LCBiYXNlbmFtZSk7XG4gICAgICAgIHRoaXNbc3ViY2ZnVHlwZV0gPSBuZXcgU3ViY29uZmlnKG15ZnMucmVtb3ZlX2V4dChiYXNlbmFtZSksIHN1YmNmZ1R5cGUsIGRhdGEpXG4gICAgfVxuICAgIFxuICAgIGdldFN1YmNvbmZpZygpOiBTdWJjb25maWcge1xuICAgICAgICByZXR1cm4gdGhpc1t0aGlzLmV4cGVyaW1lbnRfdHlwZV1cbiAgICB9XG4gICAgXG4gICAgZ2V0IGV4YW1fZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICAvLyBEb24ndCBjYWNoZTsgdGhpcy5leGFtIGlzIGEgU3ViY29uZmlnXG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnZXhhbV9maWxlJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlVwZGF0ZXMgZXhhbV9maWxlIGFuZCBhbHNvIGluaXRpYWxpemVzIG5ldyBTdWJjb25maWcqL1xuICAgIHNldCBleGFtX2ZpbGUoZmlsZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3ViY29uZmlnKGZpbGUsIFwiZXhhbVwiKVxuICAgIH1cbiAgICBcbiAgICBnZXQgdGVzdF9maWxlKCk6IHN0cmluZyB7XG4gICAgICAgIC8vIERvbid0IGNhY2hlOyB0aGlzLnRlc3QgaXMgYSBTdWJjb25maWdcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCd0ZXN0X2ZpbGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqVXBkYXRlcyB0ZXN0X2ZpbGUgYW5kIGFsc28gaW5pdGlhbGl6ZXMgbmV3IFN1YmNvbmZpZyovXG4gICAgc2V0IHRlc3RfZmlsZShmaWxlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXRTdWJjb25maWcoZmlsZSwgXCJ0ZXN0XCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCBleHBlcmltZW50X3R5cGUoKTogRXhwZXJpbWVudFR5cGUge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiZXhwZXJpbWVudF90eXBlXCIpXG4gICAgICAgIC8qaWYgKCB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgY29uc3QgZXhwZXJpbWVudFR5cGUgPSB0aGlzLmdldCgnZXhwZXJpbWVudF90eXBlJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgcmV0dXJuIGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZTtcbiAgICAgICAgIH0qL1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgZXhwZXJpbWVudF90eXBlKGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBpZiAoIGV4cGVyaW1lbnRUeXBlICE9PSAndGVzdCcgJiYgZXhwZXJpbWVudFR5cGUgIT09ICdleGFtJyApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQmlnQ29uZmlnQ2xzIGV4cGVyaW1lbnRfdHlwZSBzZXR0ZXIsIGdvdCBleHBlcmltZW50VHlwZTogJyR7ZXhwZXJpbWVudFR5cGV9Jy4gTXVzdCBiZSBlaXRoZXIgJ3Rlc3QnIG9yICdleGFtJy4gc2V0dGluZyB0byB0ZXN0YCk7XG4gICAgICAgICAgICBleHBlcmltZW50VHlwZSA9ICd0ZXN0JztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldCgnZXhwZXJpbWVudF90eXBlJywgZXhwZXJpbWVudFR5cGUpO1xuICAgICAgICB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGdldCBzdWJqZWN0cygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnc3ViamVjdHMnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqRW5zdXJlcyBoYXZpbmcgYHRoaXMudGVzdC5zdWJqZWN0YCBhbmQgYHRoaXMuZXhhbS5zdWJqZWN0YCBpbiB0aGUgbGlzdCByZWdhcmRsZXNzKi9cbiAgICBzZXQgc3ViamVjdHMoc3ViamVjdExpc3Q6IHN0cmluZ1tdKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2Fybignc2V0IHN1YmplY3RzLCBEUllSVU4uIHJldHVybmluZycpXG4gICAgICAgIH1cbiAgICAgICAgc3ViamVjdExpc3QucHVzaCh0aGlzLnRlc3Quc3ViamVjdCk7XG4gICAgICAgIHN1YmplY3RMaXN0LnB1c2godGhpcy5leGFtLnN1YmplY3QpO1xuICAgICAgICBjb25zdCBzdWJqZWN0cyA9IFsgLi4ubmV3IFNldChzdWJqZWN0TGlzdCkgXTtcbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3RzJywgc3ViamVjdHMpO1xuICAgICAgICBjb25zb2xlLndhcm4oJ1RoaXMgdXNlZCB0byBtYXliZSBudWxsaWZ5IGNvbmZpZy5zdWJqZWN0LiBEb2VzbnQgZG8gdGhhdCBhbnltb3JlJyk7XG4gICAgICAgIC8qY29uc3QgY29uZmlnID0gdGhpcy5jb25maWcodGhpcy5leHBlcmltZW50X3R5cGUpO1xuICAgICAgICAgY29uc3QgY3VycmVudFN1YmplY3QgPSBjb25maWcuc3ViamVjdDtcbiAgICAgICAgIGlmICggY3VycmVudFN1YmplY3QgJiYgIXN1YmplY3RzLmluY2x1ZGVzKGN1cnJlbnRTdWJqZWN0KSApXG4gICAgICAgICBjb25maWcuc3ViamVjdCA9IG51bGw7Ki9cbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGNvbmZpZ3NQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnNvbGUud2FybignY2FsbGVkIGNvbmZpZ3NQYXRoLCBzaG91bGQgdXNlIENPTkZJR1NfUEFUSF9BQlMnKTtcbiAgICAgICAgcmV0dXJuIENPTkZJR1NfUEFUSF9BQlM7XG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICB0cnV0aHNEaXJQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnNvbGUud2FybignY2FsbGVkIHRydXRoc0RpclBhdGgsIHNob3VsZCB1c2UgVFJVVEhTX1BBVEhfQUJTJyk7XG4gICAgICAgIHJldHVybiBUUlVUSFNfUEFUSF9BQlM7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBzdWJqZWN0c0RpclBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdjYWxsZWQgc3ViamVjdHNEaXJQYXRoLCBzaG91bGQgdXNlIFNVQkpFQ1RTX1BBVEhfQUJTJyk7XG4gICAgICAgIHJldHVybiBTVUJKRUNUU19QQVRIX0FCU1xuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgc2FsYW1hbmRlckRpclBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdjYWxsZWQgc2FsYW1hbmRlckRpclBhdGgsIHNob3VsZCB1c2UgU0FMQU1BTkRFUl9QQVRIX0FCUycpO1xuICAgICAgICByZXR1cm4gU0FMQU1BTkRFUl9QQVRIX0FCU1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBwcml2YXRlIGdldCBkZXYoKTogeyBbSyBpbiBrZXlvZiBEZXZPcHRpb25zXTogKCkgPT4gYm9vbGVhbiB9IHtcbiAgICAgICAgY29uc3QgX2RldiA9IHRoaXMuZ2V0KCdkZXYnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNraXBfd2hvbGVfdHJ1dGggOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF93aG9sZV90cnV0aCxcbiAgICAgICAgICAgIHNraXBfbGV2ZWxfaW50cm8gOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9sZXZlbF9pbnRybyxcbiAgICAgICAgICAgIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrIDogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrLFxuICAgICAgICAgICAgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2sgOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2ssXG4gICAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIFxufVxuXG5cbmV4cG9ydCBjbGFzcyBTdWJjb25maWcgZXh0ZW5kcyBDb25mPElTdWJjb25maWc+IHsgLy8gQUtBIENvbmZpZ1xuICAgIHByaXZhdGUgcmVhZG9ubHkgdHlwZTogRXhwZXJpbWVudFR5cGU7XG4gICAgcHJvdGVjdGVkIHRydXRoOiBUcnV0aDtcbiAgICByZWFkb25seSBjYWNoZTogUGFydGlhbDxJU3ViY29uZmlnPiA9IHt9O1xuICAgIFxuICAgIC8qcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgX0tFWVM6IChrZXlvZiBJU3ViY29uZmlnKVtdID0gW1xuICAgICAnYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uJyxcbiAgICAgJ2FsbG93ZWRfdGVtcG9fZGV2aWF0aW9uJyxcbiAgICAgJ2RlbW9fdHlwZScsXG4gICAgICdlcnJvcnNfcGxheXJhdGUnLFxuICAgICAnZmluaXNoZWRfdHJpYWxzX2NvdW50JyxcbiAgICAgJ25hbWUnLFxuICAgICAnbGV2ZWxzJyxcbiAgICAgJ3N1YmplY3QnLFxuICAgICAndHJ1dGhfZmlsZScsXG4gICAgIF07Ki9cbiAgICBcbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIHR5cGU6IEV4cGVyaW1lbnRUeXBlLCBkYXRhPzogU3ViY29uZmlnKSB7XG4gICAgICAgIFxuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICBmaWxlRXh0ZW5zaW9uIDogdHlwZSxcbiAgICAgICAgICAgIGN3ZCA6IENPTkZJR1NfUEFUSF9BQlMsXG4gICAgICAgICAgICBjb25maWdOYW1lIDogbXlmcy5yZW1vdmVfZXh0KG5hbWUpLFxuICAgICAgICAgICAgZGVmYXVsdHMgOiBib29sKGRhdGEpID8gZGF0YS50b09iaiA/IGRhdGEudG9PYmooKSA6IGRhdGEgOiB1bmRlZmluZWRcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMudHJ1dGggPSBuZXcgVHJ1dGgobXlmcy5yZW1vdmVfZXh0KHRoaXMudHJ1dGhfZmlsZSkpO1xuICAgIH1cbiAgICBcbiAgICBhc3luYyBkb1RydXRoRmlsZUNoZWNrKCk6IFByb21pc2U8U3dlZXRBbGVydFJlc3VsdD4ge1xuICAgICAgICBjb25zb2xlLmxvZyhg8J+SviBTdWJjb25maWcoJHt0aGlzLnR5cGV9KS5kb1RydXRoRmlsZUNoZWNrKClgKTtcbiAgICAgICAgXG4gICAgICAgIC8vIGNvbnN0IHRydXRoID0gdGhpcy5nZXRUcnV0aCgpO1xuICAgICAgICBpZiAoIHRoaXMudHJ1dGgudHh0LmFsbEV4aXN0KCkgKSB7XG4gICAgICAgICAgICByZXR1cm4gQWxlcnQuc21hbGwuc3VjY2VzcyhgJHt0aGlzLnRydXRoLm5hbWV9LnR4dCwgKl9vbi50eHQsIGFuZCAqX29mZi50eHQgZmlsZXMgZXhpc3QuYCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gWydmdXJfZWxpc2VfQicgeCAzLCAnZnVyX2VsaXNlX1IudHh0JyB4IDMsIC4uLl1cbiAgICAgICAgY29uc3QgdHh0RmlsZXNMaXN0ID0gcmVxdWlyZShcIi4uL0dsb2JcIikuZ2V0VHJ1dGhGaWxlc1doZXJlKHsgZXh0ZW5zaW9uIDogJ3R4dCcgfSkubWFwKG15ZnMucmVtb3ZlX2V4dCk7XG4gICAgICAgIGNvbnN0IHRydXRoc1dpdGgzVHh0RmlsZXMgPSB0eHRGaWxlc0xpc3QuZmlsdGVyKGEgPT4gdHh0RmlsZXNMaXN0LmZpbHRlcih0eHQgPT4gdHh0LnN0YXJ0c1dpdGgoYSkpLmxlbmd0aCA+PSAzKTtcbiAgICAgICAgaWYgKCAhYm9vbCh0cnV0aHNXaXRoM1R4dEZpbGVzKSApXG4gICAgICAgICAgICByZXR1cm4gQWxlcnQuYmlnLndhcm5pbmcoe1xuICAgICAgICAgICAgICAgIHRpdGxlIDogJ05vIHZhbGlkIHRydXRoIGZpbGVzIGZvdW5kJyxcbiAgICAgICAgICAgICAgICBodG1sIDogJ1RoZXJlIG5lZWRzIHRvIGJlIGF0IGxlYXN0IG9uZSB0eHQgZmlsZSB3aXRoIDIgXCJvblwiIGFuZCBcIm9mZlwiIGNvdW50ZXJwYXJ0cy4nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBBbGVydC5iaWcuYmxvY2tpbmcoe1xuICAgICAgICAgICAgdGl0bGUgOiBgRGlkbid0IGZpbmQgYWxsIHRocmVlIC50eHQgZmlsZXMgZm9yICR7dGhpcy50cnV0aC5uYW1lfWAsXG4gICAgICAgICAgICBodG1sIDogJ1RoZSBmb2xsb3dpbmcgdHJ1dGhzIGFsbCBoYXZlIDMgdHh0IGZpbGVzLiBQbGVhc2UgY2hvb3NlIG9uZSBvZiB0aGVtLCBvciBmaXggdGhlIGZpbGVzIGFuZCByZWxvYWQuJyxcbiAgICAgICAgICAgIHNob3dDbG9zZUJ1dHRvbiA6IHRydWUsXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHN0cmluZ3MgOiB0cnV0aHNXaXRoM1R4dEZpbGVzLFxuICAgICAgICAgICAgY2xpY2tGbiA6IGVsID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zdCBjb25maWcgPSB0aGlzLmNvbmZpZyh0aGlzLmV4cGVyaW1lbnRfdHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sZXZlbHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cnV0aF9maWxlID0gZWwudGV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLnRydXRoX2ZpbGVfcGF0aCA9IG5ldyBUcnV0aChlbC50ZXh0KCkpO1xuICAgICAgICAgICAgICAgICAgICByZWxvYWRQYWdlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoIGVyciApIHtcbiAgICAgICAgICAgICAgICAgICAgQWxlcnQuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgQWxlcnQuYmlnLmVycm9yKHsgdGl0bGUgOiBlcnIubWVzc2FnZSwgaHRtbCA6ICdTb21ldGhpbmcgaGFwcGVuZWQuJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBpbmNyZWFzZShLOiBrZXlvZiBJU3ViY29uZmlnKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkgcmV0dXJuO1xuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBWID09PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgMSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdHlwZW9mViA9IHR5cGVvZiBWO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgaWYgKCB0eXBlb2ZWID09PSAnbnVtYmVyJyB8fCAodHlwZW9mViA9PT0gJ3N0cmluZycgJiYgVi5pc2RpZ2l0KCkpICkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICB0aGlzLnNldChLLCBNYXRoLmZsb29yKFYpICsgMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkJpZ0NvbmZpZ0NscyB0cmllZCB0byBpbmNyZWFzZSBhIHZhbHVlIHRoYXQgaXMgbm90IGEgbnVtYmVyIG5vciBhIHN0cmluZy5pc2RpZ2l0KClcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHRvT2JqKCk6IElTdWJjb25maWcgeyAvLyBBS0EgdG9TYXZlZENvbmZpZ1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gOiB0aGlzLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbixcbiAgICAgICAgICAgIGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uIDogdGhpcy5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbixcbiAgICAgICAgICAgIGRlbW9fdHlwZSA6IHRoaXMuZGVtb190eXBlLFxuICAgICAgICAgICAgZXJyb3JzX3BsYXlyYXRlIDogdGhpcy5lcnJvcnNfcGxheXJhdGUsXG4gICAgICAgICAgICBmaW5pc2hlZF90cmlhbHNfY291bnQgOiB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudCxcbiAgICAgICAgICAgIG5hbWUgOiB0aGlzLm5hbWUsXG4gICAgICAgICAgICBzdWJqZWN0IDogdGhpcy5zdWJqZWN0LFxuICAgICAgICAgICAgdHJ1dGhfZmlsZSA6IHRoaXMudHJ1dGhfZmlsZSxcbiAgICAgICAgICAgIGxldmVscyA6IHRoaXMubGV2ZWxzLFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBmcm9tRmlsZShjZmdGaWxlOiBJU3ViY29uZmlnKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkgcmV0dXJuIGNvbnNvbGUud2FybignZnJvbUZpbGUsIERSWVJVTi4gcmV0dXJuaW5nJyk7XG4gICAgICAgIHRoaXMuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uID0gY2ZnRmlsZS5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb247XG4gICAgICAgIHRoaXMuYWxsb3dlZF90ZW1wb19kZXZpYXRpb24gPSBjZmdGaWxlLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uO1xuICAgICAgICB0aGlzLmRlbW9fdHlwZSA9IGNmZ0ZpbGUuZGVtb190eXBlO1xuICAgICAgICB0aGlzLmVycm9yc19wbGF5cmF0ZSA9IGNmZ0ZpbGUuZXJyb3JzX3BsYXlyYXRlO1xuICAgICAgICB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudCA9IGNmZ0ZpbGUuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgICAgICB0aGlzLmxldmVscyA9IGNmZ0ZpbGUubGV2ZWxzO1xuICAgICAgICB0aGlzLnN1YmplY3QgPSBjZmdGaWxlLnN1YmplY3Q7XG4gICAgICAgIHRoaXMudHJ1dGhfZmlsZSA9IGNmZ0ZpbGUudHJ1dGhfZmlsZTtcbiAgICAgICAgLy8gdGhpcy5fdXBkYXRlU2F2ZWRGaWxlKCd0cnV0aF9maWxlX3BhdGgnLCBjZmdGaWxlLnRydXRoX2ZpbGVfcGF0aCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIHByaXZhdGUgX3VwZGF0ZVNhdmVkRmlsZShrZXk6IGtleW9mIElTdWJjb25maWcsIHZhbHVlKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignX3VwZGF0ZVNhdmVkRmlsZSwgRFJZUlVOLiByZXR1cm5pbmcnKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICAvKmNvbnN0IGNvbmYgPSBuZXcgKHJlcXVpcmUoJ2NvbmYnKSkoe1xuICAgICAgICAgY3dkIDogQ09ORklHU19QQVRIX0FCUyxcbiAgICAgICAgIGNvbmZpZ05hbWUgOiB0aGlzLm5hbWUsXG4gICAgICAgICBmaWxlRXh0ZW5zaW9uIDogdGhpcy50eXBlLFxuICAgICAgICAgc2VyaWFsaXplIDogdmFsdWUgPT4gSlNPTi5zdHJpbmdpZnkodmFsdWUsIG51bGwsIDQpXG4gICAgICAgICB9KTtcbiAgICAgICAgIGNvbmYuc2V0KGtleSwgdmFsdWUpOyovXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHByaXZhdGUgc2V0RGV2aWF0aW9uKGRldmlhdGlvblR5cGU6IERldmlhdGlvblR5cGUsIGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHR5cGVvZkRldmlhdGlvbiA9IHR5cGVvZiBkZXZpYXRpb247XG4gICAgICAgIGlmICggdHlwZW9mRGV2aWF0aW9uID09PSAnbnVtYmVyJyApIHtcbiAgICAgICAgICAgIGRldmlhdGlvbiA9IGAke2RldmlhdGlvbn0lYDtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0RGV2aWF0aW9uIGdvdCBcImRldmlhdGlvblwiIHR5cGUgbnVtYmVyLiBhcHBlbmRlZCBcIiVcIi4gZGV2aWF0aW9uIG5vdzogJHtkZXZpYXRpb259YCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZkRldmlhdGlvbiA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICBpZiAoICFkZXZpYXRpb24uZW5kc1dpdGgoXCIlXCIpICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0RGV2aWF0aW9uIGdvdCBkZXZpYXRpb24gd2l0aG91dCAlLiBhcHBlbmRlZCAlLiBkZXZpYXRpb24gbm93OiBcIiR7ZGV2aWF0aW9ufVwiYCk7XG4gICAgICAgICAgICAgICAgZGV2aWF0aW9uID0gYCR7ZGV2aWF0aW9ufSVgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXREZXZpYXRpb24sIHJlY2VpdmVkIFwiZGV2aWF0aW9uXCIgbm90IHN0cmluZyBub3QgbnVtYmVyLiByZXR1cm5pbmcuIGRldmlhdGlvbjpgLCBkZXZpYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMuc2V0KGBhbGxvd2VkXyR7ZGV2aWF0aW9uVHlwZX1fZGV2aWF0aW9uYCwgZGV2aWF0aW9uKTtcbiAgICAgICAgdGhpcy5jYWNoZVtgYWxsb3dlZF8ke2RldmlhdGlvblR5cGV9X2RldmlhdGlvbmBdID0gZGV2aWF0aW9uO1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBnZXQgYWxsb3dlZF90ZW1wb19kZXZpYXRpb24oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCBcImFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uXCIpXG4gICAgICAgIC8qaWYgKCB0aGlzLmNhY2hlLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICBjb25zdCBhbGxvd2VkVGVtcG9EZXZpYXRpb24gPSB0aGlzLmdldCgnYWxsb3dlZF90ZW1wb19kZXZpYXRpb24nKTtcbiAgICAgICAgIHRoaXMuY2FjaGUuYWxsb3dlZF90ZW1wb19kZXZpYXRpb24gPSBhbGxvd2VkVGVtcG9EZXZpYXRpb247XG4gICAgICAgICByZXR1cm4gYWxsb3dlZFRlbXBvRGV2aWF0aW9uO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uO1xuICAgICAgICAgfSovXG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIHNldCBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbihkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldERldmlhdGlvbihcInRlbXBvXCIsIGRldmlhdGlvbik7XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCBcImFsbG93ZWRfcmh5dGhtX2RldmlhdGlvblwiKTtcbiAgICAgICAgLyppZiAoIHRoaXMuY2FjaGUuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICBjb25zdCBhbGxvd2VkUmh5dGhtRGV2aWF0aW9uID0gdGhpcy5nZXQoJ2FsbG93ZWRfcmh5dGhtX2RldmlhdGlvbicpO1xuICAgICAgICAgdGhpcy5jYWNoZS5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gPSBhbGxvd2VkUmh5dGhtRGV2aWF0aW9uO1xuICAgICAgICAgcmV0dXJuIGFsbG93ZWRSaHl0aG1EZXZpYXRpb247XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uO1xuICAgICAgICAgfSovXG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIHNldCBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24oZGV2aWF0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXREZXZpYXRpb24oXCJyaHl0aG1cIiwgZGV2aWF0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0IGRlbW9fdHlwZSgpOiBEZW1vVHlwZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnZGVtb190eXBlJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBkZW1vX3R5cGUodHlwZTogRGVtb1R5cGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdzZXQgZGVtb190eXBlIHJldHVybnMgYSB2YWx1ZSwgaXMgdGhpcyBuZWVkZWQ/Jyk7XG4gICAgICAgIGlmICggIVsgJ3ZpZGVvJywgJ2FuaW1hdGlvbicgXS5pbmNsdWRlcyh0eXBlKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQ29uZmlnIGRlbW9fdHlwZSBzZXR0ZXIsIGJhZCB0eXBlID0gJHt0eXBlfSwgY2FuIGJlIGVpdGhlciB2aWRlbyBvciBhbmltYXRpb25gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldCgnZGVtb190eXBlJywgdHlwZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZ2V0IGVycm9yc19wbGF5cmF0ZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2Vycm9yc19wbGF5cmF0ZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZXJyb3JzX3BsYXlyYXRlKHNwZWVkOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCBpc05hTihzcGVlZCkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGNvbmZpZyBzZXQgZXJyb3JzX3BsYXlyYXRlLCByZWNlaXZlZCBiYWQgXCJzcGVlZFwiIE5hTjogJHtzcGVlZH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdlcnJvcnNfcGxheXJhdGUnLCBzcGVlZCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGdldCBmaW5pc2hlZF90cmlhbHNfY291bnQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdmaW5pc2hlZF90cmlhbHNfY291bnQnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGZpbmlzaGVkX3RyaWFsc19jb3VudChjb3VudDogbnVtYmVyKSB7XG4gICAgICAgIGlmICggaXNOYU4oY291bnQpIHx8IGNvdW50IDwgMCApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgY29uZmlnIHNldCBmaW5pc2hlZF90cmlhbHNfY291bnQsIHJlY2VpdmVkIGJhZCBcImNvdW50XCI6ICR7Y291bnR9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZmluaXNoZWRfdHJpYWxzX2NvdW50JywgY291bnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldCBuYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnbmFtZScpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBnZXQgc3ViamVjdCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ3N1YmplY3QnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IHN1YmplY3QobmFtZTogc3RyaW5nIHwgbnVsbCkge1xuICAgICAgICBjb25zb2xlLmxvZygn8J+SvnNldCBzdWJqZWN0KCcsIG5hbWUsICcpJyk7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2Fybignc2V0IHN1YmplY3QsIERSWVJVTicpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KCdzdWJqZWN0JywgbmFtZSk7XG4gICAgICAgIGlmICggbmFtZSApIHtcbiAgICAgICAgICAgIGNvbnN0IEdsb2IgPSByZXF1aXJlKCcuLi9HbG9iJykuZGVmYXVsdDtcbiAgICAgICAgICAgIEdsb2IuQmlnQ29uZmlnLnN1YmplY3RzID0gWyAuLi5uZXcgU2V0KFsgLi4uR2xvYi5CaWdDb25maWcuc3ViamVjdHMsIG5hbWUgXSkgXTtcbiAgICAgICAgICAgIC8vIHN1cGVyLnNldCgnc3ViamVjdHMnLCBbLi4ubmV3IFNldChbLi4uc3VwZXIuZ2V0KCdzdWJqZWN0cycpLCBuYW1lXSldKTtcbiAgICAgICAgICAgIC8vIHN1cGVyLnN1YmplY3RzID0gWyAuLi5zdXBlci5nZXQoJ3N1YmplY3RzJyksIG5hbWUgXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBnZXQgdHJ1dGhfZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ3RydXRoX2ZpbGUnKVxuICAgIH1cbiAgICBcbiAgICAvKipBbHNvIHNldHMgdGhpcy50cnV0aCAobWVtb3J5KSovXG4gICAgc2V0IHRydXRoX2ZpbGUodHJ1dGhfZmlsZTogc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgdHJ1dGggPSBuZXcgVHJ1dGgodHJ1dGhfZmlsZSk7XG4gICAgICAgICAgICBpZiAoICF0cnV0aC50eHQuYWxsRXhpc3QoKSApIHtcbiAgICAgICAgICAgICAgICBBbGVydC5zbWFsbC53YXJuaW5nKGBOb3QgYWxsIHR4dCBmaWxlcyBleGlzdDogJHt0cnV0aF9maWxlfWApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRydXRoID0gdHJ1dGg7XG4gICAgICAgIH0gY2F0Y2ggKCBlICkge1xuICAgICAgICAgICAgQWxlcnQuc21hbGwud2FybmluZyhlKTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihlKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KGB0cnV0aF9maWxlYCwgdHJ1dGhfZmlsZSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLypnZXRUcnV0aCgpOiBUcnV0aCB7XG4gICAgIHJldHVybiBuZXcgVHJ1dGgobXlmcy5yZW1vdmVfZXh0KHRoaXMudHJ1dGhfZmlsZSkpO1xuICAgICB9Ki9cbiAgICBcbiAgICBcbiAgICBnZXQgbGV2ZWxzKCk6IElMZXZlbFtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdsZXZlbHMnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGxldmVscyhsZXZlbHM6IElMZXZlbFtdKSB7XG4gICAgICAgIGlmICggIUFycmF5LmlzQXJyYXkobGV2ZWxzKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IGxldmVscywgcmVjZWl2ZWQgXCJsZXZlbHNcIiBub3QgaXNBcnJheS4gbm90IHNldHRpbmcgYW55dGhpbmcuIGxldmVsczogYCwgbGV2ZWxzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRPRE86IGJldHRlciBjaGVja3NcbiAgICAgICAgICAgIHRoaXMuc2V0KCdsZXZlbHMnLCBsZXZlbHMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGN1cnJlbnRUcmlhbENvb3JkcygpOiBudW1iZXJbXSB7XG4gICAgICAgIC8vIGxldCB7IGxldmVscywgZmluaXNoZWRfdHJpYWxzX2NvdW50IH0gPSB0aGlzLmNvbmZpZygpO1xuICAgICAgICBsZXQgZmxhdFRyaWFsc0xpc3QgPSB0aGlzLmxldmVscy5tYXAobGV2ZWwgPT4gbGV2ZWwudHJpYWxzKTtcbiAgICAgICAgZm9yICggbGV0IFsgbGV2ZWxJbmRleCwgdHJpYWxzTnVtIF0gb2YgZW51bWVyYXRlKGZsYXRUcmlhbHNMaXN0KSApIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHRyaWFsU3VtU29GYXIgPSBzdW0oZmxhdFRyaWFsc0xpc3Quc2xpY2UoMCwgbGV2ZWxJbmRleCArIDEpKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbmlzaGVkVHJpYWxzQ291bnQgPSB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudDtcbiAgICAgICAgICAgIGlmICggdHJpYWxTdW1Tb0ZhciA+IGZpbmlzaGVkVHJpYWxzQ291bnQgKVxuICAgICAgICAgICAgICAgIHJldHVybiBbIGxldmVsSW5kZXgsIHRyaWFsc051bSAtICh0cmlhbFN1bVNvRmFyIC0gZmluaXNoZWRUcmlhbHNDb3VudCkgXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLndhcm4oXCJjdXJyZW50VHJpYWxDb29yZHM6IG91dCBvZiBpbmRleCBlcnJvclwiKTtcbiAgICB9XG4gICAgXG4gICAgaXNEZW1vVmlkZW8oKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbW9fdHlwZSA9PT0gJ3ZpZGVvJztcbiAgICB9XG4gICAgXG4gICAgaXNXaG9sZVRlc3RPdmVyKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gc3VtKHRoaXMubGV2ZWxzLm1hcChsZXZlbCA9PiBsZXZlbC50cmlhbHMpKSA9PSB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudDtcbiAgICB9XG4gICAgXG4gICAgZ2V0U3ViamVjdERpck5hbWVzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIGZzLnJlYWRkaXJTeW5jKFNVQkpFQ1RTX1BBVEhfQUJTKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0Q3VycmVudExldmVsKCk6IExldmVsIHtcbiAgICAgICAgXG4gICAgICAgIGxldCBbIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCBdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBMZXZlbCh0aGlzLmxldmVsc1tsZXZlbF9pbmRleF0sIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldExldmVsQ29sbGVjdGlvbigpOiBMZXZlbENvbGxlY3Rpb24ge1xuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIHJldHVybiBuZXcgTGV2ZWxDb2xsZWN0aW9uKHRoaXMubGV2ZWxzLCBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXgpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipHZXRzIHRoZSBjdXJyZW50IHRyaWFsJ3MgcGF0aCAoam9pbiB0aGlzLnRlc3RPdXRQYXRoKCkgYW5kIGxldmVsXyR7bGV2ZWxfaW5kZXh9Li4uKSwgYW5kIHJldHVybnMgYSBUcnV0aCBvZiBpdCovXG4gICAgdHJpYWxUcnV0aCgpOiBUcnV0aCB7XG4gICAgICAgIGxldCBbIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCBdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgLy8gcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odGhpcy50ZXN0T3V0UGF0aCgpLCBgbGV2ZWxfJHtsZXZlbF9pbmRleH1fdHJpYWxfJHt0cmlhbF9pbmRleH1gKSk7XG4gICAgICAgIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRoaXMudGVzdE91dFBhdGgoKSwgYGxldmVsXyR7bGV2ZWxfaW5kZXh9X3RyaWFsXyR7dHJpYWxfaW5kZXh9YCkpO1xuICAgIH1cbiAgICBcbiAgICAvKipcImM6XFxTeW5jXFxDb2RlXFxQeXRob25cXFB5YW5vLXJlbGVhc2VcXHNyY1xcZXhwZXJpbWVudHNcXHN1YmplY3RzXFxnaWxhZFxcZnVyX2VsaXNlXCIqL1xuICAgIHRlc3RPdXRQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGN1cnJTdWJqZWN0RGlyID0gcGF0aC5qb2luKFNVQkpFQ1RTX1BBVEhfQUJTLCB0aGlzLnN1YmplY3QpOyAvLyBcIi4uLi9zdWJqZWN0cy9naWxhZFwiXG4gICAgICAgIHJldHVybiBwYXRoLmpvaW4oY3VyclN1YmplY3REaXIsIHRoaXMudHJ1dGgubmFtZSk7XG4gICAgfVxuICAgIFxuICAgIFxufVxuIl19