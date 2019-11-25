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
class BigConfigCls extends Store {
    constructor(_doTruthFileCheck = true) {
        super();
        this._cache = {};
        if (DRYRUN) {
            this.set = (...args) => console.warn(`DRYRUN, set: `, args);
        }
        this.test = new Subconfig("test", this.test_file);
        this.exam = new Subconfig("exam", this.exam_file);
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
    _setSubconfigFileProp(file, subcfgType) {
        if (this[`${subcfgType}_file`] === file) {
            return console.warn(`_setSubconfigFileProp, file === existing one.`, {
                file,
                subcfgType,
                'this[`${subcfgType}_file`]': this[`${subcfgType}_file`]
            });
        }
        let basename = path.basename(file);
        if (file !== basename) {
            console.warn(`set ${subcfgType}_file(${file}), NOT a basename. continuing with only basename`);
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
        this.set(`${subcfgType}_file`, basename);
        this[subcfgType] = new Subconfig(subcfgType, MyFs_1.default.remove_ext(basename));
    }
    get exam_file() {
        return this.get('exam_file');
    }
    set exam_file(file) {
        this._setSubconfigFileProp(file, "exam");
    }
    get test_file() {
        return this.get('test_file');
    }
    set test_file(file) {
        this._setSubconfigFileProp(file, "test");
    }
    get experiment_type() {
        if (!this._cache.experiment_type) {
            const experimentType = this.get('experiment_type');
            this._cache.experiment_type = experimentType;
            return experimentType;
        }
        else {
            return this._cache.experiment_type;
        }
    }
    set experiment_type(experimentType) {
        if (experimentType !== 'test' && experimentType !== 'exam') {
            console.warn(`BigConfigCls experiment_type setter, got experimentType: '${experimentType}'. Must be either 'test' or 'exam'. setting to test`);
            experimentType = 'test';
        }
        this.set('experiment_type', experimentType);
        this._cache.experiment_type = experimentType;
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
    getSubconfig() {
        return this[this.experiment_type];
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
    constructor(type, name) {
        super({
            fileExtension: type,
            cwd: CONFIGS_PATH_ABS,
            configName: MyFs_1.default.remove_ext(name)
        });
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
        return console.warn('Subconfig, called toSavedConfig(). NOT IMPLEMENTED');
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
    }
    get allowed_tempo_deviation() {
        return this.get('allowed_tempo_deviation');
    }
    set allowed_tempo_deviation(deviation) {
        this.setDeviation("tempo", deviation);
    }
    get allowed_rhythm_deviation() {
        return this.get('allowed_rhythm_deviation');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFDM0Isa0NBQTJEO0FBQzNELG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsNkJBQTZCO0FBRTdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQTRDdEMsTUFBYSxZQUFhLFNBQVEsS0FBaUI7SUFLL0MsWUFBWSxpQkFBaUIsR0FBRyxJQUFJO1FBQ2hDLEtBQUssRUFBRSxDQUFDO1FBSEssV0FBTSxHQUF3QixFQUFFLENBQUM7UUFJOUMsSUFBSyxNQUFNLEVBQUc7WUFDVixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQzlEO1FBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDOUIsSUFBSyxpQkFBaUIsRUFBRztZQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFO2lCQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO1lBQ2hDLENBQUMsQ0FDSixDQUFDO1NBRVQ7SUFDTCxDQUFDO0lBSUQsZUFBZSxDQUFDLFdBQXVCLEVBQUUsY0FBOEI7UUFDbkUsT0FBTyxPQUFP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QUFpQixDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELGVBQWU7UUFFWCxJQUFJLENBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzdELE9BQU8sSUFBSSxhQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUdELGtCQUFrQjtRQUNkLElBQUksQ0FBRSxXQUFXLEVBQUUsV0FBVyxDQUFFLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDN0QsT0FBTyxJQUFJLHVCQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUlELFVBQVU7UUFDTixJQUFJLENBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTdELE9BQU8sSUFBSSxhQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsU0FBUyxXQUFXLFVBQVUsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFHRCxXQUFXO1FBQ1AsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RELENBQUM7Q0FHSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFN0b3JlIGZyb20gXCJlbGVjdHJvbi1zdG9yZVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgQWxlcnQgZnJvbSBcIi4uL015QWxlcnRcIjtcbmltcG9ydCBteWZzIGZyb20gXCIuLi9NeUZzXCI7XG5pbXBvcnQgeyBib29sLCByZWxvYWRQYWdlLCBzdW0sIGVudW1lcmF0ZSB9IGZyb20gXCIuLi91dGlsXCI7XG5pbXBvcnQgeyBUcnV0aCB9IGZyb20gXCIuLi9UcnV0aFwiO1xuaW1wb3J0IHsgSUxldmVsLCBMZXZlbCwgTGV2ZWxDb2xsZWN0aW9uIH0gZnJvbSBcIi4uL0xldmVsXCI7XG5pbXBvcnQgeyBTd2VldEFsZXJ0UmVzdWx0IH0gZnJvbSBcInN3ZWV0YWxlcnQyXCI7XG5pbXBvcnQgKiBhcyBDb25mIGZyb20gJ2NvbmYnO1xuXG5jb25zb2xlLmxvZygnc3JjL0JpZ0NvbmZpZy9pbmRleC50cycpO1xuXG5leHBvcnQgdHlwZSBFeHBlcmltZW50VHlwZSA9ICdleGFtJyB8ICd0ZXN0JztcbnR5cGUgRGVtb1R5cGUgPSAndmlkZW8nIHwgJ2FuaW1hdGlvbic7XG5leHBvcnQgdHlwZSBQYWdlTmFtZSA9IFwibmV3XCIgLy8gQUtBIFRMYXN0UGFnZVxuICAgIHwgXCJydW5uaW5nXCJcbiAgICB8IFwicmVjb3JkXCJcbiAgICB8IFwiZmlsZV90b29sc1wiXG4gICAgfCBcInNldHRpbmdzXCJcbnR5cGUgRGV2aWF0aW9uVHlwZSA9ICdyaHl0aG0nIHwgJ3RlbXBvJztcblxuXG5pbnRlcmZhY2UgSVN1YmNvbmZpZyB7XG4gICAgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uOiBzdHJpbmcsXG4gICAgYWxsb3dlZF90ZW1wb19kZXZpYXRpb246IHN0cmluZyxcbiAgICBkZW1vX3R5cGU6IERlbW9UeXBlLFxuICAgIGVycm9yc19wbGF5cmF0ZTogbnVtYmVyLFxuICAgIGZpbmlzaGVkX3RyaWFsc19jb3VudDogbnVtYmVyLFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzdWJqZWN0OiBzdHJpbmcsXG4gICAgdHJ1dGhfZmlsZTogc3RyaW5nLFxuICAgIGxldmVsczogSUxldmVsW10sXG59XG5cblxuaW50ZXJmYWNlIERldk9wdGlvbnMge1xuICAgIHNraXBfd2hvbGVfdHJ1dGg6IGJvb2xlYW4sXG4gICAgc2tpcF9sZXZlbF9pbnRybzogYm9vbGVhbixcbiAgICBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjazogYm9vbGVhbixcbiAgICBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjazogYm9vbGVhblxufVxuXG5pbnRlcmZhY2UgSUJpZ0NvbmZpZyB7XG4gICAgZGV2OiBib29sZWFuLFxuICAgIGRldm9wdGlvbnM6IERldk9wdGlvbnMsXG4gICAgZXhhbV9maWxlOiBzdHJpbmcsXG4gICAgdGVzdF9maWxlOiBzdHJpbmcsXG4gICAgZXhwZXJpbWVudF90eXBlOiBFeHBlcmltZW50VHlwZSxcbiAgICBsYXN0X3BhZ2U6IFBhZ2VOYW1lLFxuICAgIHN1YmplY3RzOiBzdHJpbmdbXSxcbiAgICB2ZWxvY2l0aWVzOiBudW1iZXJbXSxcbn1cblxuXG5leHBvcnQgY2xhc3MgQmlnQ29uZmlnQ2xzIGV4dGVuZHMgU3RvcmU8SUJpZ0NvbmZpZz4ge1xuICAgIHRlc3Q6IFN1YmNvbmZpZztcbiAgICBleGFtOiBTdWJjb25maWc7XG4gICAgcHJpdmF0ZSByZWFkb25seSBfY2FjaGU6IFBhcnRpYWw8SUJpZ0NvbmZpZz4gPSB7fTtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihfZG9UcnV0aEZpbGVDaGVjayA9IHRydWUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICB0aGlzLnNldCA9ICguLi5hcmdzKSA9PiBjb25zb2xlLndhcm4oYERSWVJVTiwgc2V0OiBgLCBhcmdzKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudGVzdCA9IG5ldyBTdWJjb25maWcoXCJ0ZXN0XCIsIHRoaXMudGVzdF9maWxlKTtcbiAgICAgICAgdGhpcy5leGFtID0gbmV3IFN1YmNvbmZpZyhcImV4YW1cIiwgdGhpcy5leGFtX2ZpbGUpO1xuICAgICAgICB0aGlzLnN1YmplY3RzID0gdGhpcy5zdWJqZWN0czsgLy8gdG8gZW5zdXJlIGhhdmluZyBzdWJjb25maWcncyBzdWJqZWN0c1xuICAgICAgICBpZiAoIF9kb1RydXRoRmlsZUNoZWNrICkge1xuICAgICAgICAgICAgdGhpcy50ZXN0LmRvVHJ1dGhGaWxlQ2hlY2soKVxuICAgICAgICAgICAgICAgIC50aGVuKHN3YWwgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5leGFtLmRvVHJ1dGhGaWxlQ2hlY2soKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBmcm9tU2F2ZWRDb25maWcoc2F2ZWRDb25maWc6IElTdWJjb25maWcsIGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdCaWdDb25maWdDbHMgdXNlZCBmcm9tU2F2ZWRDb25maWcuIEltcG9zc2libGUgdG8gbG9hZCBiaWcgZmlsZS4gUmV0dXJuaW5nJyk7XG4gICAgICAgIC8qaWYgKCBEUllSVU4gKSByZXR1cm4gY29uc29sZS5sb2coYGZyb21TYXZlZENvbmZpZywgRFJZUlVOYCk7XG4gICAgICAgICBjb25zdCB0cnV0aEZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShzYXZlZENvbmZpZy50cnV0aF9maWxlX3BhdGgsICcudHh0Jyk7XG4gICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICB0aGlzLnRydXRoX2ZpbGVfcGF0aCA9IG5ldyBUcnV0aChwYXRoLmpvaW4oVFJVVEhTX1BBVEhfQUJTLCB0cnV0aEZpbGVOYW1lKSk7XG4gICAgICAgICB0aGlzLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgdGhpcy5jb25maWcoZXhwZXJpbWVudFR5cGUpLmZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZyk7Ki9cbiAgICB9XG4gICAgXG4gICAgLypzdWJjb25maWdzKCk6IHsgZXhhbTogU3ViY29uZmlnLCB0ZXN0OiBTdWJjb25maWcgfSB7XG4gICAgIGNvbnN0IHN1YmNvbmZpZ3MgPSB7XG4gICAgIGV4YW0gOiB0aGlzLmV4YW0sXG4gICAgIHRlc3QgOiB0aGlzLnRlc3RcbiAgICAgfTtcbiAgICAgXG4gICAgIHJldHVybiBzdWJjb25maWdzO1xuICAgICB9Ki9cbiAgICBcbiAgICAvKmNvbmZpZyh0eXBlOiBFeHBlcmltZW50VHlwZSk6IFN1YmNvbmZpZyB7XG4gICAgIFxuICAgICByZXR1cm4gbmV3IFN1YmNvbmZpZyh0eXBlKTtcbiAgICAgfSovXG4gICAgXG4gICAgXG4gICAgLyoqQGV4YW1wbGVcbiAgICAgdXBkYXRlKCdzdWJqZWN0cycsIFtuYW1lc10pXG4gICAgICovXG4gICAgdXBkYXRlKEs6IGtleW9mIElCaWdDb25maWcsIGt2UGFpcnM6IFBhcnRpYWw8SUJpZ0NvbmZpZz4pXG4gICAgdXBkYXRlKEs6IGtleW9mIElCaWdDb25maWcsIHZhbHVlczogYW55W10pXG4gICAgdXBkYXRlKEssIGt2KSB7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignQmlnQ29uZmlnLnVwZGF0ZSgpIERSWVJVTi4gcmV0dXJuaW5nJyk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IFYgPSB0aGlzLmdldChLKTtcbiAgICAgICAgaWYgKCBBcnJheS5pc0FycmF5KFYpICkge1xuICAgICAgICAgICAgbGV0IG5ld1ZhbHVlOiBhbnlbXSA9IFY7XG4gICAgICAgICAgICBpZiAoIEFycmF5LmlzQXJyYXkoa3YpICkge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlLnB1c2goLi4ua3YpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZS5wdXNoKGt2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0KEssIG5ld1ZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oViwga3YpO1xuICAgICAgICAgICAgdGhpcy5zZXQoSywgVik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KEspO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvLyAvKipAcmV0dXJuIHtzdHJpbmd9Ki9cbiAgICAvLyBnZXQgc2F2ZV9wYXRoKCkge1xuICAgIC8vIFx0cmV0dXJuIHRoaXMuZ2V0KCdzYXZlX3BhdGgnKTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyAvKipAcGFyYW0ge3N0cmluZ30gc2F2ZVBhdGgqL1xuICAgIC8vIHNldCBzYXZlX3BhdGgoc2F2ZVBhdGgpIHtcbiAgICAvLyBcdHRoaXMuc2V0KCdzYXZlX3BhdGgnLCBzYXZlUGF0aCk7XG4gICAgLy8gfVxuICAgIFxuICAgIGdldCBsYXN0X3BhZ2UoKTogUGFnZU5hbWUge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2xhc3RfcGFnZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbGFzdF9wYWdlKHBhZ2U6IFBhZ2VOYW1lKSB7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB2YWxpZHBhZ2VzID0gWyBcIm5ld1wiLCBcInJ1bm5pbmdcIiwgXCJyZWNvcmRcIiwgXCJmaWxlX3Rvb2xzXCIsIFwic2V0dGluZ3NcIiBdO1xuICAgICAgICBpZiAoICF2YWxpZHBhZ2VzLmluY2x1ZGVzKHBhZ2UpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGFzdF9wYWdlKFwiJHtwYWdlfVwiKSwgbXVzdCBiZSBvbmUgb2YgJHt2YWxpZHBhZ2VzLmpvaW4oJywgJyl9LiBzZXR0aW5nIHRvIG5ld2ApO1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xhc3RfcGFnZScsICduZXcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCBwYWdlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipVcGRhdGVzIHtzdWJjZmdUeXBlfV9maWxlIGFuZCBhbHNvIGluaXRpYWxpemVzIG5ldyBTdWJjb25maWcqL1xuICAgIHByaXZhdGUgX3NldFN1YmNvbmZpZ0ZpbGVQcm9wKGZpbGU6IHN0cmluZywgc3ViY2ZnVHlwZTogRXhwZXJpbWVudFR5cGUpIHtcbiAgICAgICAgaWYgKCB0aGlzW2Ake3N1YmNmZ1R5cGV9X2ZpbGVgXSA9PT0gZmlsZSApIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oYF9zZXRTdWJjb25maWdGaWxlUHJvcCwgZmlsZSA9PT0gZXhpc3Rpbmcgb25lLmAsIHtcbiAgICAgICAgICAgICAgICBmaWxlLFxuICAgICAgICAgICAgICAgIHN1YmNmZ1R5cGUsXG4gICAgICAgICAgICAgICAgJ3RoaXNbYCR7c3ViY2ZnVHlwZX1fZmlsZWBdJyA6IHRoaXNbYCR7c3ViY2ZnVHlwZX1fZmlsZWBdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgYmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGUpO1xuICAgICAgICBpZiAoIGZpbGUgIT09IGJhc2VuYW1lICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgJHtzdWJjZmdUeXBlfV9maWxlKCR7ZmlsZX0pLCBOT1QgYSBiYXNlbmFtZS4gY29udGludWluZyB3aXRoIG9ubHkgYmFzZW5hbWVgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZSk7XG4gICAgICAgIGlmICggIWJvb2woZXh0KSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0ICR7c3ViY2ZnVHlwZX1fZmlsZSgke2ZpbGV9KSBoYXMgbm8gZXh0ZW5zaW9uLiBhZGRpbmcgLiR7c3ViY2ZnVHlwZX1gKTtcbiAgICAgICAgICAgIGJhc2VuYW1lICs9IGAuJHtzdWJjZmdUeXBlfWA7XG4gICAgICAgIH0gZWxzZSBpZiAoIGV4dCAhPT0gYC4ke3N1YmNmZ1R5cGV9YCApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0ICR7c3ViY2ZnVHlwZX1fZmlsZSgke2ZpbGV9KSBiYWQgZXh0ZW5zaW9uOiBcIiR7ZXh0fVwiLiByZXBsYWNpbmcgd2l0aCAuJHtzdWJjZmdUeXBlfWApO1xuICAgICAgICAgICAgbXlmcy5yZXBsYWNlX2V4dChiYXNlbmFtZSwgYC4ke3N1YmNmZ1R5cGV9YClcbiAgICAgICAgfVxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMuc2V0KGAke3N1YmNmZ1R5cGV9X2ZpbGVgLCBiYXNlbmFtZSk7XG4gICAgICAgIHRoaXNbc3ViY2ZnVHlwZV0gPSBuZXcgU3ViY29uZmlnKHN1YmNmZ1R5cGUsIG15ZnMucmVtb3ZlX2V4dChiYXNlbmFtZSkpXG4gICAgfVxuICAgIFxuICAgIGdldCBleGFtX2ZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdleGFtX2ZpbGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqVXBkYXRlcyBleGFtX2ZpbGUgYW5kIGFsc28gaW5pdGlhbGl6ZXMgbmV3IFN1YmNvbmZpZyovXG4gICAgc2V0IGV4YW1fZmlsZShmaWxlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fc2V0U3ViY29uZmlnRmlsZVByb3AoZmlsZSwgXCJleGFtXCIpXG4gICAgfVxuICAgIFxuICAgIGdldCB0ZXN0X2ZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCd0ZXN0X2ZpbGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqVXBkYXRlcyB0ZXN0X2ZpbGUgYW5kIGFsc28gaW5pdGlhbGl6ZXMgbmV3IFN1YmNvbmZpZyovXG4gICAgc2V0IHRlc3RfZmlsZShmaWxlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fc2V0U3ViY29uZmlnRmlsZVByb3AoZmlsZSwgXCJ0ZXN0XCIpXG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCBleHBlcmltZW50X3R5cGUoKTogRXhwZXJpbWVudFR5cGUge1xuICAgICAgICBpZiAoICF0aGlzLl9jYWNoZS5leHBlcmltZW50X3R5cGUgKSB7XG4gICAgICAgICAgICBjb25zdCBleHBlcmltZW50VHlwZSA9IHRoaXMuZ2V0KCdleHBlcmltZW50X3R5cGUnKTtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgICAgcmV0dXJuIGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlLmV4cGVyaW1lbnRfdHlwZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgZXhwZXJpbWVudF90eXBlKGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBpZiAoIGV4cGVyaW1lbnRUeXBlICE9PSAndGVzdCcgJiYgZXhwZXJpbWVudFR5cGUgIT09ICdleGFtJyApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQmlnQ29uZmlnQ2xzIGV4cGVyaW1lbnRfdHlwZSBzZXR0ZXIsIGdvdCBleHBlcmltZW50VHlwZTogJyR7ZXhwZXJpbWVudFR5cGV9Jy4gTXVzdCBiZSBlaXRoZXIgJ3Rlc3QnIG9yICdleGFtJy4gc2V0dGluZyB0byB0ZXN0YCk7XG4gICAgICAgICAgICBleHBlcmltZW50VHlwZSA9ICd0ZXN0JztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldCgnZXhwZXJpbWVudF90eXBlJywgZXhwZXJpbWVudFR5cGUpO1xuICAgICAgICB0aGlzLl9jYWNoZS5leHBlcmltZW50X3R5cGUgPSBleHBlcmltZW50VHlwZTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBnZXQgc3ViamVjdHMoKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ3N1YmplY3RzJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKkVuc3VyZXMgaGF2aW5nIGB0aGlzLnRlc3Quc3ViamVjdGAgYW5kIGB0aGlzLmV4YW0uc3ViamVjdGAgaW4gdGhlIGxpc3QgcmVnYXJkbGVzcyovXG4gICAgc2V0IHN1YmplY3RzKHN1YmplY3RMaXN0OiBzdHJpbmdbXSkge1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ3NldCBzdWJqZWN0cywgRFJZUlVOLiByZXR1cm5pbmcnKVxuICAgICAgICB9XG4gICAgICAgIHN1YmplY3RMaXN0LnB1c2godGhpcy50ZXN0LnN1YmplY3QpO1xuICAgICAgICBzdWJqZWN0TGlzdC5wdXNoKHRoaXMuZXhhbS5zdWJqZWN0KTtcbiAgICAgICAgY29uc3Qgc3ViamVjdHMgPSBbIC4uLm5ldyBTZXQoc3ViamVjdExpc3QpIF07XG4gICAgICAgIHRoaXMuc2V0KCdzdWJqZWN0cycsIHN1YmplY3RzKTtcbiAgICAgICAgY29uc29sZS53YXJuKCdUaGlzIHVzZWQgdG8gbWF5YmUgbnVsbGlmeSBjb25maWcuc3ViamVjdC4gRG9lc250IGRvIHRoYXQgYW55bW9yZScpO1xuICAgICAgICAvKmNvbnN0IGNvbmZpZyA9IHRoaXMuY29uZmlnKHRoaXMuZXhwZXJpbWVudF90eXBlKTtcbiAgICAgICAgIGNvbnN0IGN1cnJlbnRTdWJqZWN0ID0gY29uZmlnLnN1YmplY3Q7XG4gICAgICAgICBpZiAoIGN1cnJlbnRTdWJqZWN0ICYmICFzdWJqZWN0cy5pbmNsdWRlcyhjdXJyZW50U3ViamVjdCkgKVxuICAgICAgICAgY29uZmlnLnN1YmplY3QgPSBudWxsOyovXG4gICAgfVxuICAgIFxuICAgIGdldFN1YmNvbmZpZygpOiBTdWJjb25maWcge1xuICAgICAgICByZXR1cm4gdGhpc1t0aGlzLmV4cGVyaW1lbnRfdHlwZV1cbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGNvbmZpZ3NQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnNvbGUud2FybignY2FsbGVkIGNvbmZpZ3NQYXRoLCBzaG91bGQgdXNlIENPTkZJR1NfUEFUSF9BQlMnKTtcbiAgICAgICAgcmV0dXJuIENPTkZJR1NfUEFUSF9BQlM7XG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICB0cnV0aHNEaXJQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnNvbGUud2FybignY2FsbGVkIHRydXRoc0RpclBhdGgsIHNob3VsZCB1c2UgVFJVVEhTX1BBVEhfQUJTJyk7XG4gICAgICAgIHJldHVybiBUUlVUSFNfUEFUSF9BQlM7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBzdWJqZWN0c0RpclBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdjYWxsZWQgc3ViamVjdHNEaXJQYXRoLCBzaG91bGQgdXNlIFNVQkpFQ1RTX1BBVEhfQUJTJyk7XG4gICAgICAgIHJldHVybiBTVUJKRUNUU19QQVRIX0FCU1xuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgc2FsYW1hbmRlckRpclBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdjYWxsZWQgc2FsYW1hbmRlckRpclBhdGgsIHNob3VsZCB1c2UgU0FMQU1BTkRFUl9QQVRIX0FCUycpO1xuICAgICAgICByZXR1cm4gU0FMQU1BTkRFUl9QQVRIX0FCU1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBwcml2YXRlIGdldCBkZXYoKTogeyBbSyBpbiBrZXlvZiBEZXZPcHRpb25zXTogKCkgPT4gYm9vbGVhbiB9IHtcbiAgICAgICAgY29uc3QgX2RldiA9IHRoaXMuZ2V0KCdkZXYnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNraXBfd2hvbGVfdHJ1dGggOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF93aG9sZV90cnV0aCxcbiAgICAgICAgICAgIHNraXBfbGV2ZWxfaW50cm8gOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9sZXZlbF9pbnRybyxcbiAgICAgICAgICAgIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrIDogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrLFxuICAgICAgICAgICAgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2sgOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2ssXG4gICAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIFxufVxuXG5cbmNsYXNzIFN1YmNvbmZpZyBleHRlbmRzIENvbmY8SVN1YmNvbmZpZz4geyAvLyBBS0EgQ29uZmlnXG4gICAgcHJpdmF0ZSByZWFkb25seSB0eXBlOiBFeHBlcmltZW50VHlwZTtcbiAgICBwcm90ZWN0ZWQgdHJ1dGg6IFRydXRoO1xuICAgIC8vIFRPRE86IGNhY2hlIGFsbCAnZ2V0J3MgaW4gbWVtb3J5XG4gICAgLypwcml2YXRlIHN0YXRpYyByZWFkb25seSBfS0VZUzogKGtleW9mIElTdWJjb25maWcpW10gPSBbXG4gICAgICdhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24nLFxuICAgICAnYWxsb3dlZF90ZW1wb19kZXZpYXRpb24nLFxuICAgICAnZGVtb190eXBlJyxcbiAgICAgJ2Vycm9yc19wbGF5cmF0ZScsXG4gICAgICdmaW5pc2hlZF90cmlhbHNfY291bnQnLFxuICAgICAnbmFtZScsXG4gICAgICdsZXZlbHMnLFxuICAgICAnc3ViamVjdCcsXG4gICAgICd0cnV0aF9maWxlJyxcbiAgICAgXTsqL1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKHR5cGU6IEV4cGVyaW1lbnRUeXBlLCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgZmlsZUV4dGVuc2lvbiA6IHR5cGUsXG4gICAgICAgICAgICBjd2QgOiBDT05GSUdTX1BBVEhfQUJTLFxuICAgICAgICAgICAgY29uZmlnTmFtZSA6IG15ZnMucmVtb3ZlX2V4dChuYW1lKVxuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLnRydXRoID0gbmV3IFRydXRoKG15ZnMucmVtb3ZlX2V4dCh0aGlzLnRydXRoX2ZpbGUpKTtcbiAgICB9XG4gICAgXG4gICAgYXN5bmMgZG9UcnV0aEZpbGVDaGVjaygpOiBQcm9taXNlPFN3ZWV0QWxlcnRSZXN1bHQ+IHtcbiAgICAgICAgY29uc29sZS5sb2coYPCfkr4gU3ViY29uZmlnKCR7dGhpcy50eXBlfSkuZG9UcnV0aEZpbGVDaGVjaygpYCk7XG4gICAgICAgIFxuICAgICAgICAvLyBjb25zdCB0cnV0aCA9IHRoaXMuZ2V0VHJ1dGgoKTtcbiAgICAgICAgaWYgKCB0aGlzLnRydXRoLnR4dC5hbGxFeGlzdCgpICkge1xuICAgICAgICAgICAgcmV0dXJuIEFsZXJ0LnNtYWxsLnN1Y2Nlc3MoYCR7dGhpcy50cnV0aC5uYW1lfS50eHQsICpfb24udHh0LCBhbmQgKl9vZmYudHh0IGZpbGVzIGV4aXN0LmApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFsnZnVyX2VsaXNlX0InIHggMywgJ2Z1cl9lbGlzZV9SLnR4dCcgeCAzLCAuLi5dXG4gICAgICAgIGNvbnN0IHR4dEZpbGVzTGlzdCA9IHJlcXVpcmUoXCIuLi9HbG9iXCIpLmdldFRydXRoRmlsZXNXaGVyZSh7IGV4dGVuc2lvbiA6ICd0eHQnIH0pLm1hcChteWZzLnJlbW92ZV9leHQpO1xuICAgICAgICBjb25zdCB0cnV0aHNXaXRoM1R4dEZpbGVzID0gdHh0RmlsZXNMaXN0LmZpbHRlcihhID0+IHR4dEZpbGVzTGlzdC5maWx0ZXIodHh0ID0+IHR4dC5zdGFydHNXaXRoKGEpKS5sZW5ndGggPj0gMyk7XG4gICAgICAgIGlmICggIWJvb2wodHJ1dGhzV2l0aDNUeHRGaWxlcykgKVxuICAgICAgICAgICAgcmV0dXJuIEFsZXJ0LmJpZy53YXJuaW5nKHtcbiAgICAgICAgICAgICAgICB0aXRsZSA6ICdObyB2YWxpZCB0cnV0aCBmaWxlcyBmb3VuZCcsXG4gICAgICAgICAgICAgICAgaHRtbCA6ICdUaGVyZSBuZWVkcyB0byBiZSBhdCBsZWFzdCBvbmUgdHh0IGZpbGUgd2l0aCAyIFwib25cIiBhbmQgXCJvZmZcIiBjb3VudGVycGFydHMuJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gQWxlcnQuYmlnLmJsb2NraW5nKHtcbiAgICAgICAgICAgIHRpdGxlIDogYERpZG4ndCBmaW5kIGFsbCB0aHJlZSAudHh0IGZpbGVzIGZvciAke3RoaXMudHJ1dGgubmFtZX1gLFxuICAgICAgICAgICAgaHRtbCA6ICdUaGUgZm9sbG93aW5nIHRydXRocyBhbGwgaGF2ZSAzIHR4dCBmaWxlcy4gUGxlYXNlIGNob29zZSBvbmUgb2YgdGhlbSwgb3IgZml4IHRoZSBmaWxlcyBhbmQgcmVsb2FkLicsXG4gICAgICAgICAgICBzaG93Q2xvc2VCdXR0b24gOiB0cnVlLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBzdHJpbmdzIDogdHJ1dGhzV2l0aDNUeHRGaWxlcyxcbiAgICAgICAgICAgIGNsaWNrRm4gOiBlbCA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc3QgY29uZmlnID0gdGhpcy5jb25maWcodGhpcy5leHBlcmltZW50X3R5cGUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGV2ZWxzID0gW107XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJ1dGhfZmlsZSA9IGVsLnRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy50cnV0aF9maWxlX3BhdGggPSBuZXcgVHJ1dGgoZWwudGV4dCgpKTtcbiAgICAgICAgICAgICAgICAgICAgcmVsb2FkUGFnZSgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgICAgIEFsZXJ0LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIEFsZXJ0LmJpZy5lcnJvcih7IHRpdGxlIDogZXJyLm1lc3NhZ2UsIGh0bWwgOiAnU29tZXRoaW5nIGhhcHBlbmVkLicgfSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgaW5jcmVhc2UoSzoga2V5b2YgSVN1YmNvbmZpZykge1xuICAgICAgICBpZiAoIERSWVJVTiApIHJldHVybjtcbiAgICAgICAgbGV0IFYgPSB0aGlzLmdldChLKTtcbiAgICAgICAgXG4gICAgICAgIGlmICggViA9PT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuc2V0KEssIDEpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVvZlYgPSB0eXBlb2YgVjtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGlmICggdHlwZW9mViA9PT0gJ251bWJlcicgfHwgKHR5cGVvZlYgPT09ICdzdHJpbmcnICYmIFYuaXNkaWdpdCgpKSApIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoSywgTWF0aC5mbG9vcihWKSArIDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJCaWdDb25maWdDbHMgdHJpZWQgdG8gaW5jcmVhc2UgYSB2YWx1ZSB0aGF0IGlzIG5vdCBhIG51bWJlciBub3IgYSBzdHJpbmcuaXNkaWdpdCgpXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgdG9PYmooKTogSVN1YmNvbmZpZyB7IC8vIEFLQSB0b1NhdmVkQ29uZmlnXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignU3ViY29uZmlnLCBjYWxsZWQgdG9TYXZlZENvbmZpZygpLiBOT1QgSU1QTEVNRU5URUQnKTtcbiAgICAgICAgLypjb25zdCBzZWxmOiBDb25mPElTdWJjb25maWc+ID0gc3VwZXIuZ2V0KGBjdXJyZW50XyR7dGhpcy50eXBlfWApO1xuICAgICAgICAgc2VsZi5kZWxldGUoJ3NhdmVfcGF0aCcpO1xuICAgICAgICAgLy8gZGVsZXRlIHNlbGYuc2F2ZV9wYXRoO1xuICAgICAgICAgY29uc3Qgc2F2ZWRDb25maWcgPSB7XG4gICAgICAgICAuLi5zZWxmLFxuICAgICAgICAgdHJ1dGhfZmlsZV9wYXRoIDogc3VwZXIudHJ1dGhfZmlsZV9wYXRoXG4gICAgICAgICB9O1xuICAgICAgICAgY29uc29sZS53YXJuKCdzYXZlZENvbmZpZywgY2hlY2sgaWYgZGVsZXRlZCBzYXZlX3BhdGg6Jywgc2VsZik7XG4gICAgICAgICByZXR1cm4gc2F2ZWRDb25maWc7Ki9cbiAgICB9XG4gICAgXG4gICAgXG4gICAgZnJvbUZpbGUoY2ZnRmlsZTogSVN1YmNvbmZpZykge1xuICAgICAgICBpZiAoIERSWVJVTiApIHJldHVybiBjb25zb2xlLndhcm4oJ2Zyb21GaWxlLCBEUllSVU4uIHJldHVybmluZycpO1xuICAgICAgICB0aGlzLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbiA9IGNmZ0ZpbGUuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uO1xuICAgICAgICB0aGlzLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uID0gY2ZnRmlsZS5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbjtcbiAgICAgICAgdGhpcy5kZW1vX3R5cGUgPSBjZmdGaWxlLmRlbW9fdHlwZTtcbiAgICAgICAgdGhpcy5lcnJvcnNfcGxheXJhdGUgPSBjZmdGaWxlLmVycm9yc19wbGF5cmF0ZTtcbiAgICAgICAgdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQgPSBjZmdGaWxlLmZpbmlzaGVkX3RyaWFsc19jb3VudDtcbiAgICAgICAgdGhpcy5sZXZlbHMgPSBjZmdGaWxlLmxldmVscztcbiAgICAgICAgdGhpcy5zdWJqZWN0ID0gY2ZnRmlsZS5zdWJqZWN0O1xuICAgICAgICB0aGlzLnRydXRoX2ZpbGUgPSBjZmdGaWxlLnRydXRoX2ZpbGU7XG4gICAgICAgIC8vIHRoaXMuX3VwZGF0ZVNhdmVkRmlsZSgndHJ1dGhfZmlsZV9wYXRoJywgY2ZnRmlsZS50cnV0aF9maWxlX3BhdGgpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBwcml2YXRlIF91cGRhdGVTYXZlZEZpbGUoa2V5OiBrZXlvZiBJU3ViY29uZmlnLCB2YWx1ZSkge1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ191cGRhdGVTYXZlZEZpbGUsIERSWVJVTi4gcmV0dXJuaW5nJylcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgLypjb25zdCBjb25mID0gbmV3IChyZXF1aXJlKCdjb25mJykpKHtcbiAgICAgICAgIGN3ZCA6IENPTkZJR1NfUEFUSF9BQlMsXG4gICAgICAgICBjb25maWdOYW1lIDogdGhpcy5uYW1lLFxuICAgICAgICAgZmlsZUV4dGVuc2lvbiA6IHRoaXMudHlwZSxcbiAgICAgICAgIHNlcmlhbGl6ZSA6IHZhbHVlID0+IEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCA0KVxuICAgICAgICAgfSk7XG4gICAgICAgICBjb25mLnNldChrZXksIHZhbHVlKTsqL1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKnByaXZhdGUgZ2V0KGtleToga2V5b2YgSVN1YmNvbmZpZykge1xuICAgICAvLyBAdHMtaWdub3JlXG4gICAgIHJldHVybiBzdXBlci5nZXQoYGN1cnJlbnRfJHt0aGlzLnR5cGV9LiR7a2V5fWApO1xuICAgICB9Ki9cbiAgICBcbiAgICBcbiAgICAvKnByaXZhdGUgc2V0KGtleToga2V5b2YgSVN1YmNvbmZpZywgdmFsdWUpIHtcbiAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgIGNvbnNvbGUud2Fybihgc2V0KCR7a2V5fSwgJHt2YWx1ZX0pIGJ1dCBEUllSVU5gKTtcbiAgICAgcmV0dXJuO1xuICAgICB9XG4gICAgIGNvbnN0IHR5cGVvZktleSA9IHR5cGVvZiBrZXk7XG4gICAgIGlmICggdHlwZW9mS2V5ID09PSAnc3RyaW5nJyApIHtcbiAgICAgaWYgKCAhU3ViY29uZmlnLl9LRVlTLmluY2x1ZGVzKGtleSkgKSB7XG4gICAgIGNvbnNvbGUud2FybihgU3ViY29uZmlnKCR7dGhpcy50eXBlfSkuc2V0OiBcImtleVwiIChcIiR7a2V5fVwiKSBpcyBzdHJpbmcgYnV0IG5vdCBpbiB0aGlzLl9LRVlTYCk7XG4gICAgIHJldHVybjtcbiAgICAgfVxuICAgICBjb25zdCBzdXBlcmtleSA9IGBjdXJyZW50XyR7dGhpcy50eXBlfS4ke2tleX1gO1xuICAgICAvLyBAdHMtaWdub3JlXG4gICAgIHN1cGVyLnNldChzdXBlcmtleSwgdmFsdWUpO1xuICAgICBpZiAoIGtleSAhPT0gXCJzYXZlX3BhdGhcIiApXG4gICAgIHRoaXMuX3VwZGF0ZVNhdmVkRmlsZShrZXksIHZhbHVlKTtcbiAgICAgcmV0dXJuO1xuICAgICB9XG4gICAgIFxuICAgICBjb25zb2xlLndhcm4oYFN1YmNvbmZpZygke3RoaXMudHlwZX0pLnNldDogXCJrZXlcIiAoXCIke2tleX1cIikgaXMgbm90IHN0cmluZy4gdHlwZTogJHt0eXBlb2ZLZXl9YCk7XG4gICAgIH0qL1xuICAgIFxuICAgIHByaXZhdGUgc2V0RGV2aWF0aW9uKGRldmlhdGlvblR5cGU6IERldmlhdGlvblR5cGUsIGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHR5cGVvZkRldmlhdGlvbiA9IHR5cGVvZiBkZXZpYXRpb247XG4gICAgICAgIGlmICggdHlwZW9mRGV2aWF0aW9uID09PSAnbnVtYmVyJyApIHtcbiAgICAgICAgICAgIGRldmlhdGlvbiA9IGAke2RldmlhdGlvbn0lYDtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0RGV2aWF0aW9uIGdvdCBcImRldmlhdGlvblwiIHR5cGUgbnVtYmVyLiBhcHBlbmRlZCBcIiVcIi4gZGV2aWF0aW9uIG5vdzogJHtkZXZpYXRpb259YCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZkRldmlhdGlvbiA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICBpZiAoICFkZXZpYXRpb24uZW5kc1dpdGgoXCIlXCIpICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0RGV2aWF0aW9uIGdvdCBkZXZpYXRpb24gd2l0aG91dCAlLiBhcHBlbmRlZCAlLiBkZXZpYXRpb24gbm93OiBcIiR7ZGV2aWF0aW9ufVwiYCk7XG4gICAgICAgICAgICAgICAgZGV2aWF0aW9uID0gYCR7ZGV2aWF0aW9ufSVgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXREZXZpYXRpb24sIHJlY2VpdmVkIFwiZGV2aWF0aW9uXCIgbm90IHN0cmluZyBub3QgbnVtYmVyLiByZXR1cm5pbmcuIGRldmlhdGlvbjpgLCBkZXZpYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMuc2V0KGBhbGxvd2VkXyR7ZGV2aWF0aW9uVHlwZX1fZGV2aWF0aW9uYCwgZGV2aWF0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0IGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnYWxsb3dlZF90ZW1wb19kZXZpYXRpb24nKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uKGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0RGV2aWF0aW9uKFwidGVtcG9cIiwgZGV2aWF0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0IGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2FsbG93ZWRfcmh5dGhtX2RldmlhdGlvbicpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uKGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0RGV2aWF0aW9uKFwicmh5dGhtXCIsIGRldmlhdGlvbik7XG4gICAgfVxuICAgIFxuICAgIGdldCBkZW1vX3R5cGUoKTogRGVtb1R5cGUge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2RlbW9fdHlwZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZGVtb190eXBlKHR5cGU6IERlbW9UeXBlKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybignc2V0IGRlbW9fdHlwZSByZXR1cm5zIGEgdmFsdWUsIGlzIHRoaXMgbmVlZGVkPycpO1xuICAgICAgICBpZiAoICFbICd2aWRlbycsICdhbmltYXRpb24nIF0uaW5jbHVkZXModHlwZSkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYENvbmZpZyBkZW1vX3R5cGUgc2V0dGVyLCBiYWQgdHlwZSA9ICR7dHlwZX0sIGNhbiBiZSBlaXRoZXIgdmlkZW8gb3IgYW5pbWF0aW9uYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXQoJ2RlbW9fdHlwZScsIHR5cGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldCBlcnJvcnNfcGxheXJhdGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdlcnJvcnNfcGxheXJhdGUnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGVycm9yc19wbGF5cmF0ZShzcGVlZDogbnVtYmVyKSB7XG4gICAgICAgIGlmICggaXNOYU4oc3BlZWQpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBjb25maWcgc2V0IGVycm9yc19wbGF5cmF0ZSwgcmVjZWl2ZWQgYmFkIFwic3BlZWRcIiBOYU46ICR7c3BlZWR9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZXJyb3JzX3BsYXlyYXRlJywgc3BlZWQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBnZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnZmluaXNoZWRfdHJpYWxzX2NvdW50Jyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBmaW5pc2hlZF90cmlhbHNfY291bnQoY291bnQ6IG51bWJlcikge1xuICAgICAgICBpZiAoIGlzTmFOKGNvdW50KSB8fCBjb3VudCA8IDAgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGNvbmZpZyBzZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50LCByZWNlaXZlZCBiYWQgXCJjb3VudFwiOiAke2NvdW50fWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2ZpbmlzaGVkX3RyaWFsc19jb3VudCcsIGNvdW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ25hbWUnKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IHN1YmplY3QoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdzdWJqZWN0Jyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBzdWJqZWN0KG5hbWU6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfkr5zZXQgc3ViamVjdCgnLCBuYW1lLCAnKScpO1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ3NldCBzdWJqZWN0LCBEUllSVU4nKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldCgnc3ViamVjdCcsIG5hbWUpO1xuICAgICAgICBpZiAoIG5hbWUgKSB7XG4gICAgICAgICAgICBjb25zdCBHbG9iID0gcmVxdWlyZSgnLi4vR2xvYicpLmRlZmF1bHQ7XG4gICAgICAgICAgICBHbG9iLkJpZ0NvbmZpZy5zdWJqZWN0cyA9IFsgLi4ubmV3IFNldChbIC4uLkdsb2IuQmlnQ29uZmlnLnN1YmplY3RzLCBuYW1lIF0pIF07XG4gICAgICAgICAgICAvLyBzdXBlci5zZXQoJ3N1YmplY3RzJywgWy4uLm5ldyBTZXQoWy4uLnN1cGVyLmdldCgnc3ViamVjdHMnKSwgbmFtZV0pXSk7XG4gICAgICAgICAgICAvLyBzdXBlci5zdWJqZWN0cyA9IFsgLi4uc3VwZXIuZ2V0KCdzdWJqZWN0cycpLCBuYW1lIF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZ2V0IHRydXRoX2ZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCd0cnV0aF9maWxlJylcbiAgICB9XG4gICAgXG4gICAgLyoqQWxzbyBzZXRzIHRoaXMudHJ1dGggKG1lbW9yeSkqL1xuICAgIHNldCB0cnV0aF9maWxlKHRydXRoX2ZpbGU6IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHRydXRoID0gbmV3IFRydXRoKHRydXRoX2ZpbGUpO1xuICAgICAgICAgICAgaWYgKCAhdHJ1dGgudHh0LmFsbEV4aXN0KCkgKSB7XG4gICAgICAgICAgICAgICAgQWxlcnQuc21hbGwud2FybmluZyhgTm90IGFsbCB0eHQgZmlsZXMgZXhpc3Q6ICR7dHJ1dGhfZmlsZX1gKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50cnV0aCA9IHRydXRoO1xuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIEFsZXJ0LnNtYWxsLndhcm5pbmcoZSk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oZSlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldChgdHJ1dGhfZmlsZWAsIHRydXRoX2ZpbGUpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8qZ2V0VHJ1dGgoKTogVHJ1dGgge1xuICAgICByZXR1cm4gbmV3IFRydXRoKG15ZnMucmVtb3ZlX2V4dCh0aGlzLnRydXRoX2ZpbGUpKTtcbiAgICAgfSovXG4gICAgXG4gICAgXG4gICAgZ2V0IGxldmVscygpOiBJTGV2ZWxbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnbGV2ZWxzJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBsZXZlbHMobGV2ZWxzOiBJTGV2ZWxbXSkge1xuICAgICAgICBpZiAoICFBcnJheS5pc0FycmF5KGxldmVscykgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCBsZXZlbHMsIHJlY2VpdmVkIFwibGV2ZWxzXCIgbm90IGlzQXJyYXkuIG5vdCBzZXR0aW5nIGFueXRoaW5nLiBsZXZlbHM6IGAsIGxldmVscyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBiZXR0ZXIgY2hlY2tzXG4gICAgICAgICAgICB0aGlzLnNldCgnbGV2ZWxzJywgbGV2ZWxzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBcbiAgICBjdXJyZW50VHJpYWxDb29yZHMoKTogbnVtYmVyW10ge1xuICAgICAgICAvLyBsZXQgeyBsZXZlbHMsIGZpbmlzaGVkX3RyaWFsc19jb3VudCB9ID0gdGhpcy5jb25maWcoKTtcbiAgICAgICAgbGV0IGZsYXRUcmlhbHNMaXN0ID0gdGhpcy5sZXZlbHMubWFwKGxldmVsID0+IGxldmVsLnRyaWFscyk7XG4gICAgICAgIGZvciAoIGxldCBbIGxldmVsSW5kZXgsIHRyaWFsc051bSBdIG9mIGVudW1lcmF0ZShmbGF0VHJpYWxzTGlzdCkgKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCB0cmlhbFN1bVNvRmFyID0gc3VtKGZsYXRUcmlhbHNMaXN0LnNsaWNlKDAsIGxldmVsSW5kZXggKyAxKSk7XG4gICAgICAgICAgICBjb25zdCBmaW5pc2hlZFRyaWFsc0NvdW50ID0gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgICAgICAgICBpZiAoIHRyaWFsU3VtU29GYXIgPiBmaW5pc2hlZFRyaWFsc0NvdW50IClcbiAgICAgICAgICAgICAgICByZXR1cm4gWyBsZXZlbEluZGV4LCB0cmlhbHNOdW0gLSAodHJpYWxTdW1Tb0ZhciAtIGZpbmlzaGVkVHJpYWxzQ291bnQpIF07XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS53YXJuKFwiY3VycmVudFRyaWFsQ29vcmRzOiBvdXQgb2YgaW5kZXggZXJyb3JcIik7XG4gICAgfVxuICAgIFxuICAgIGlzRGVtb1ZpZGVvKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5kZW1vX3R5cGUgPT09ICd2aWRlbyc7XG4gICAgfVxuICAgIFxuICAgIGlzV2hvbGVUZXN0T3ZlcigpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHN1bSh0aGlzLmxldmVscy5tYXAobGV2ZWwgPT4gbGV2ZWwudHJpYWxzKSkgPT0gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgfVxuICAgIFxuICAgIGdldFN1YmplY3REaXJOYW1lcygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiBmcy5yZWFkZGlyU3luYyhTVUJKRUNUU19QQVRIX0FCUyk7XG4gICAgfVxuICAgIFxuICAgIGdldEN1cnJlbnRMZXZlbCgpOiBMZXZlbCB7XG4gICAgICAgIFxuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIHJldHVybiBuZXcgTGV2ZWwodGhpcy5sZXZlbHNbbGV2ZWxfaW5kZXhdLCBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXgpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBnZXRMZXZlbENvbGxlY3Rpb24oKTogTGV2ZWxDb2xsZWN0aW9uIHtcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICByZXR1cm4gbmV3IExldmVsQ29sbGVjdGlvbih0aGlzLmxldmVscywgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqR2V0cyB0aGUgY3VycmVudCB0cmlhbCdzIHBhdGggKGpvaW4gdGhpcy50ZXN0T3V0UGF0aCgpIGFuZCBsZXZlbF8ke2xldmVsX2luZGV4fS4uLiksIGFuZCByZXR1cm5zIGEgVHJ1dGggb2YgaXQqL1xuICAgIHRyaWFsVHJ1dGgoKTogVHJ1dGgge1xuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIC8vIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRoaXMudGVzdE91dFBhdGgoKSwgYGxldmVsXyR7bGV2ZWxfaW5kZXh9X3RyaWFsXyR7dHJpYWxfaW5kZXh9YCkpO1xuICAgICAgICByZXR1cm4gbmV3IFRydXRoKHBhdGguam9pbih0aGlzLnRlc3RPdXRQYXRoKCksIGBsZXZlbF8ke2xldmVsX2luZGV4fV90cmlhbF8ke3RyaWFsX2luZGV4fWApKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXCJjOlxcU3luY1xcQ29kZVxcUHl0aG9uXFxQeWFuby1yZWxlYXNlXFxzcmNcXGV4cGVyaW1lbnRzXFxzdWJqZWN0c1xcZ2lsYWRcXGZ1cl9lbGlzZVwiKi9cbiAgICB0ZXN0T3V0UGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBjdXJyU3ViamVjdERpciA9IHBhdGguam9pbihTVUJKRUNUU19QQVRIX0FCUywgdGhpcy5zdWJqZWN0KTsgLy8gXCIuLi4vc3ViamVjdHMvZ2lsYWRcIlxuICAgICAgICByZXR1cm4gcGF0aC5qb2luKGN1cnJTdWJqZWN0RGlyLCB0aGlzLnRydXRoLm5hbWUpO1xuICAgIH1cbiAgICBcbiAgICBcbn1cbiJdfQ==