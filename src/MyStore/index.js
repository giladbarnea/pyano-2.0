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
        return this.get('experiment_type');
    }
    set experiment_type(experimentType) {
        if (experimentType !== 'test' && experimentType !== 'exam') {
            console.warn(`BigConfigCls experiment_type setter, got experimentType: '${experimentType}'. Must be either 'test' or 'exam'. setting to test`);
            this.set('experiment_type', 'test');
        }
        else {
            this.set('experiment_type', experimentType);
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFDM0Isa0NBQTJEO0FBQzNELG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsNkJBQTZCO0FBRTdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQTRDdEMsTUFBYSxZQUFhLFNBQVEsS0FBaUI7SUFJL0MsWUFBWSxpQkFBaUIsR0FBRyxJQUFJO1FBQ2hDLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSyxNQUFNLEVBQUc7WUFDVixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQzlEO1FBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDOUIsSUFBSyxpQkFBaUIsRUFBRztZQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFO2lCQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBRUwsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO1lBRWhDLENBQUMsQ0FDSixDQUFDO1NBRVQ7SUFDTCxDQUFDO0lBSUQsZUFBZSxDQUFDLFdBQXVCLEVBQUUsY0FBOEI7UUFDbkUsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLDJFQUEyRSxDQUFD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QzdELE9BQU8sSUFBSSx1QkFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFJRCxVQUFVO1FBQ04sSUFBSSxDQUFFLFdBQVcsRUFBRSxXQUFXLENBQUUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUU3RCxPQUFPLElBQUksYUFBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLFNBQVMsV0FBVyxVQUFVLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBR0QsV0FBVztRQUNQLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0RCxDQUFDO0NBR0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBTdG9yZSBmcm9tIFwiZWxlY3Ryb24tc3RvcmVcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IEFsZXJ0IGZyb20gXCIuLi9NeUFsZXJ0XCI7XG5pbXBvcnQgbXlmcyBmcm9tIFwiLi4vTXlGc1wiO1xuaW1wb3J0IHsgYm9vbCwgcmVsb2FkUGFnZSwgc3VtLCBlbnVtZXJhdGUgfSBmcm9tIFwiLi4vdXRpbFwiO1xuaW1wb3J0IHsgVHJ1dGggfSBmcm9tIFwiLi4vVHJ1dGhcIjtcbmltcG9ydCB7IElMZXZlbCwgTGV2ZWwsIExldmVsQ29sbGVjdGlvbiB9IGZyb20gXCIuLi9MZXZlbFwiO1xuaW1wb3J0IHsgU3dlZXRBbGVydFJlc3VsdCB9IGZyb20gXCJzd2VldGFsZXJ0MlwiO1xuaW1wb3J0ICogYXMgQ29uZiBmcm9tICdjb25mJztcblxuY29uc29sZS5sb2coJ3NyYy9CaWdDb25maWcvaW5kZXgudHMnKTtcblxudHlwZSBFeHBlcmltZW50VHlwZSA9ICdleGFtJyB8ICd0ZXN0JztcbnR5cGUgRGVtb1R5cGUgPSAndmlkZW8nIHwgJ2FuaW1hdGlvbic7XG5leHBvcnQgdHlwZSBQYWdlTmFtZSA9IFwibmV3XCIgLy8gQUtBIFRMYXN0UGFnZVxuICAgIHwgXCJydW5uaW5nXCJcbiAgICB8IFwicmVjb3JkXCJcbiAgICB8IFwiZmlsZV90b29sc1wiXG4gICAgfCBcInNldHRpbmdzXCJcbnR5cGUgRGV2aWF0aW9uVHlwZSA9ICdyaHl0aG0nIHwgJ3RlbXBvJztcblxuXG5pbnRlcmZhY2UgSVN1YmNvbmZpZyB7XG4gICAgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uOiBzdHJpbmcsXG4gICAgYWxsb3dlZF90ZW1wb19kZXZpYXRpb246IHN0cmluZyxcbiAgICBkZW1vX3R5cGU6IERlbW9UeXBlLFxuICAgIGVycm9yc19wbGF5cmF0ZTogbnVtYmVyLFxuICAgIGZpbmlzaGVkX3RyaWFsc19jb3VudDogbnVtYmVyLFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzdWJqZWN0OiBzdHJpbmcsXG4gICAgdHJ1dGhfZmlsZTogc3RyaW5nLFxuICAgIGxldmVsczogSUxldmVsW10sXG59XG5cblxuaW50ZXJmYWNlIERldk9wdGlvbnMge1xuICAgIHNraXBfd2hvbGVfdHJ1dGg6IGJvb2xlYW4sXG4gICAgc2tpcF9sZXZlbF9pbnRybzogYm9vbGVhbixcbiAgICBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjazogYm9vbGVhbixcbiAgICBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjazogYm9vbGVhblxufVxuXG5pbnRlcmZhY2UgSUJpZ0NvbmZpZyB7XG4gICAgZGV2OiBib29sZWFuLFxuICAgIGRldm9wdGlvbnM6IERldk9wdGlvbnMsXG4gICAgZXhhbV9maWxlOiBzdHJpbmcsXG4gICAgdGVzdF9maWxlOiBzdHJpbmcsXG4gICAgZXhwZXJpbWVudF90eXBlOiBFeHBlcmltZW50VHlwZSxcbiAgICBsYXN0X3BhZ2U6IFBhZ2VOYW1lLFxuICAgIHN1YmplY3RzOiBzdHJpbmdbXSxcbiAgICB2ZWxvY2l0aWVzOiBudW1iZXJbXSxcbn1cblxuXG5leHBvcnQgY2xhc3MgQmlnQ29uZmlnQ2xzIGV4dGVuZHMgU3RvcmU8SUJpZ0NvbmZpZz4ge1xuICAgIHRlc3Q6IFN1YmNvbmZpZztcbiAgICBleGFtOiBTdWJjb25maWc7XG4gICAgXG4gICAgY29uc3RydWN0b3IoX2RvVHJ1dGhGaWxlQ2hlY2sgPSB0cnVlKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgdGhpcy5zZXQgPSAoLi4uYXJncykgPT4gY29uc29sZS53YXJuKGBEUllSVU4sIHNldDogYCwgYXJncylcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRlc3QgPSBuZXcgU3ViY29uZmlnKFwidGVzdFwiLCB0aGlzLnRlc3RfZmlsZSk7XG4gICAgICAgIHRoaXMuZXhhbSA9IG5ldyBTdWJjb25maWcoXCJleGFtXCIsIHRoaXMuZXhhbV9maWxlKTtcbiAgICAgICAgdGhpcy5zdWJqZWN0cyA9IHRoaXMuc3ViamVjdHM7IC8vIHRvIGVuc3VyZSBoYXZpbmcgc3ViY29uZmlnJ3Mgc3ViamVjdHNcbiAgICAgICAgaWYgKCBfZG9UcnV0aEZpbGVDaGVjayApIHtcbiAgICAgICAgICAgIHRoaXMudGVzdC5kb1RydXRoRmlsZUNoZWNrKClcbiAgICAgICAgICAgICAgICAudGhlbihzd2FsID0+IHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4YW0uZG9UcnV0aEZpbGVDaGVjaygpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBmcm9tU2F2ZWRDb25maWcoc2F2ZWRDb25maWc6IElTdWJjb25maWcsIGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdCaWdDb25maWdDbHMgdXNlZCBmcm9tU2F2ZWRDb25maWcuIEltcG9zc2libGUgdG8gbG9hZCBiaWcgZmlsZS4gUmV0dXJuaW5nJyk7XG4gICAgICAgIC8qaWYgKCBEUllSVU4gKSByZXR1cm4gY29uc29sZS5sb2coYGZyb21TYXZlZENvbmZpZywgRFJZUlVOYCk7XG4gICAgICAgICBjb25zdCB0cnV0aEZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShzYXZlZENvbmZpZy50cnV0aF9maWxlX3BhdGgsICcudHh0Jyk7XG4gICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICB0aGlzLnRydXRoX2ZpbGVfcGF0aCA9IG5ldyBUcnV0aChwYXRoLmpvaW4oVFJVVEhTX1BBVEhfQUJTLCB0cnV0aEZpbGVOYW1lKSk7XG4gICAgICAgICB0aGlzLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgdGhpcy5jb25maWcoZXhwZXJpbWVudFR5cGUpLmZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZyk7Ki9cbiAgICB9XG4gICAgXG4gICAgLypzdWJjb25maWdzKCk6IHsgZXhhbTogU3ViY29uZmlnLCB0ZXN0OiBTdWJjb25maWcgfSB7XG4gICAgIGNvbnN0IHN1YmNvbmZpZ3MgPSB7XG4gICAgIGV4YW0gOiB0aGlzLmV4YW0sXG4gICAgIHRlc3QgOiB0aGlzLnRlc3RcbiAgICAgfTtcbiAgICAgXG4gICAgIHJldHVybiBzdWJjb25maWdzO1xuICAgICB9Ki9cbiAgICBcbiAgICAvKmNvbmZpZyh0eXBlOiBFeHBlcmltZW50VHlwZSk6IFN1YmNvbmZpZyB7XG4gICAgIFxuICAgICByZXR1cm4gbmV3IFN1YmNvbmZpZyh0eXBlKTtcbiAgICAgfSovXG4gICAgXG4gICAgXG4gICAgLyoqQGV4YW1wbGVcbiAgICAgdXBkYXRlKCdzdWJqZWN0cycsIFtuYW1lc10pXG4gICAgICovXG4gICAgdXBkYXRlKEs6IGtleW9mIElCaWdDb25maWcsIGt2UGFpcnM6IFBhcnRpYWw8SUJpZ0NvbmZpZz4pXG4gICAgdXBkYXRlKEs6IGtleW9mIElCaWdDb25maWcsIHZhbHVlczogYW55W10pXG4gICAgdXBkYXRlKEssIGt2KSB7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignQmlnQ29uZmlnLnVwZGF0ZSgpIERSWVJVTi4gcmV0dXJuaW5nJyk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IFYgPSB0aGlzLmdldChLKTtcbiAgICAgICAgaWYgKCBBcnJheS5pc0FycmF5KFYpICkge1xuICAgICAgICAgICAgbGV0IG5ld1ZhbHVlOiBhbnlbXSA9IFY7XG4gICAgICAgICAgICBpZiAoIEFycmF5LmlzQXJyYXkoa3YpICkge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlLnB1c2goLi4ua3YpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZS5wdXNoKGt2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0KEssIG5ld1ZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oViwga3YpO1xuICAgICAgICAgICAgdGhpcy5zZXQoSywgVik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KEspO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvLyAvKipAcmV0dXJuIHtzdHJpbmd9Ki9cbiAgICAvLyBnZXQgc2F2ZV9wYXRoKCkge1xuICAgIC8vIFx0cmV0dXJuIHRoaXMuZ2V0KCdzYXZlX3BhdGgnKTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyAvKipAcGFyYW0ge3N0cmluZ30gc2F2ZVBhdGgqL1xuICAgIC8vIHNldCBzYXZlX3BhdGgoc2F2ZVBhdGgpIHtcbiAgICAvLyBcdHRoaXMuc2V0KCdzYXZlX3BhdGgnLCBzYXZlUGF0aCk7XG4gICAgLy8gfVxuICAgIFxuICAgIGdldCBsYXN0X3BhZ2UoKTogUGFnZU5hbWUge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2xhc3RfcGFnZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbGFzdF9wYWdlKHBhZ2U6IFBhZ2VOYW1lKSB7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB2YWxpZHBhZ2VzID0gWyBcIm5ld1wiLCBcInJ1bm5pbmdcIiwgXCJyZWNvcmRcIiwgXCJmaWxlX3Rvb2xzXCIsIFwic2V0dGluZ3NcIiBdO1xuICAgICAgICBpZiAoICF2YWxpZHBhZ2VzLmluY2x1ZGVzKHBhZ2UpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGFzdF9wYWdlKFwiJHtwYWdlfVwiKSwgbXVzdCBiZSBvbmUgb2YgJHt2YWxpZHBhZ2VzLmpvaW4oJywgJyl9LiBzZXR0aW5nIHRvIG5ld2ApO1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xhc3RfcGFnZScsICduZXcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCBwYWdlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipVcGRhdGVzIHtzdWJjZmdUeXBlfV9maWxlIGFuZCBhbHNvIGluaXRpYWxpemVzIG5ldyBTdWJjb25maWcqL1xuICAgIHByaXZhdGUgX3NldFN1YmNvbmZpZ0ZpbGVQcm9wKGZpbGU6IHN0cmluZywgc3ViY2ZnVHlwZTogRXhwZXJpbWVudFR5cGUpIHtcbiAgICAgICAgaWYgKCB0aGlzW2Ake3N1YmNmZ1R5cGV9X2ZpbGVgXSA9PT0gZmlsZSApIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oYF9zZXRTdWJjb25maWdGaWxlUHJvcCwgZmlsZSA9PT0gZXhpc3Rpbmcgb25lLmAsIHtcbiAgICAgICAgICAgICAgICBmaWxlLFxuICAgICAgICAgICAgICAgIHN1YmNmZ1R5cGUsXG4gICAgICAgICAgICAgICAgJ3RoaXNbYCR7c3ViY2ZnVHlwZX1fZmlsZWBdJyA6IHRoaXNbYCR7c3ViY2ZnVHlwZX1fZmlsZWBdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgYmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGUpO1xuICAgICAgICBpZiAoIGZpbGUgIT09IGJhc2VuYW1lICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgJHtzdWJjZmdUeXBlfV9maWxlKCR7ZmlsZX0pLCBOT1QgYSBiYXNlbmFtZS4gY29udGludWluZyB3aXRoIG9ubHkgYmFzZW5hbWVgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZSk7XG4gICAgICAgIGlmICggIWJvb2woZXh0KSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0ICR7c3ViY2ZnVHlwZX1fZmlsZSgke2ZpbGV9KSBoYXMgbm8gZXh0ZW5zaW9uLiBhZGRpbmcgLiR7c3ViY2ZnVHlwZX1gKTtcbiAgICAgICAgICAgIGJhc2VuYW1lICs9IGAuJHtzdWJjZmdUeXBlfWA7XG4gICAgICAgIH0gZWxzZSBpZiAoIGV4dCAhPT0gYC4ke3N1YmNmZ1R5cGV9YCApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0ICR7c3ViY2ZnVHlwZX1fZmlsZSgke2ZpbGV9KSBiYWQgZXh0ZW5zaW9uOiBcIiR7ZXh0fVwiLiByZXBsYWNpbmcgd2l0aCAuJHtzdWJjZmdUeXBlfWApO1xuICAgICAgICAgICAgbXlmcy5yZXBsYWNlX2V4dChiYXNlbmFtZSwgYC4ke3N1YmNmZ1R5cGV9YClcbiAgICAgICAgfVxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMuc2V0KGAke3N1YmNmZ1R5cGV9X2ZpbGVgLCBiYXNlbmFtZSk7XG4gICAgICAgIHRoaXNbc3ViY2ZnVHlwZV0gPSBuZXcgU3ViY29uZmlnKHN1YmNmZ1R5cGUsIG15ZnMucmVtb3ZlX2V4dChiYXNlbmFtZSkpXG4gICAgfVxuICAgIFxuICAgIGdldCBleGFtX2ZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdleGFtX2ZpbGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqVXBkYXRlcyBleGFtX2ZpbGUgYW5kIGFsc28gaW5pdGlhbGl6ZXMgbmV3IFN1YmNvbmZpZyovXG4gICAgc2V0IGV4YW1fZmlsZShmaWxlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fc2V0U3ViY29uZmlnRmlsZVByb3AoZmlsZSwgXCJleGFtXCIpXG4gICAgfVxuICAgIFxuICAgIGdldCB0ZXN0X2ZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCd0ZXN0X2ZpbGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqVXBkYXRlcyB0ZXN0X2ZpbGUgYW5kIGFsc28gaW5pdGlhbGl6ZXMgbmV3IFN1YmNvbmZpZyovXG4gICAgc2V0IHRlc3RfZmlsZShmaWxlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fc2V0U3ViY29uZmlnRmlsZVByb3AoZmlsZSwgXCJ0ZXN0XCIpXG4gICAgfVxuICAgIFxuICAgIGdldCBleHBlcmltZW50X3R5cGUoKTogRXhwZXJpbWVudFR5cGUge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2V4cGVyaW1lbnRfdHlwZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZXhwZXJpbWVudF90eXBlKGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBpZiAoIGV4cGVyaW1lbnRUeXBlICE9PSAndGVzdCcgJiYgZXhwZXJpbWVudFR5cGUgIT09ICdleGFtJyApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQmlnQ29uZmlnQ2xzIGV4cGVyaW1lbnRfdHlwZSBzZXR0ZXIsIGdvdCBleHBlcmltZW50VHlwZTogJyR7ZXhwZXJpbWVudFR5cGV9Jy4gTXVzdCBiZSBlaXRoZXIgJ3Rlc3QnIG9yICdleGFtJy4gc2V0dGluZyB0byB0ZXN0YCk7XG4gICAgICAgICAgICB0aGlzLnNldCgnZXhwZXJpbWVudF90eXBlJywgJ3Rlc3QnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdleHBlcmltZW50X3R5cGUnLCBleHBlcmltZW50VHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdGhpcy5fdXBkYXRlU2F2ZWRGaWxlKCdleHBlcmltZW50X3R5cGUnLCBleHBlcmltZW50VHlwZSk7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBnZXQgc3ViamVjdHMoKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ3N1YmplY3RzJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKkVuc3VyZXMgaGF2aW5nIGB0aGlzLnRlc3Quc3ViamVjdGAgYW5kIGB0aGlzLmV4YW0uc3ViamVjdGAgaW4gdGhlIGxpc3QgcmVnYXJkbGVzcyovXG4gICAgc2V0IHN1YmplY3RzKHN1YmplY3RMaXN0OiBzdHJpbmdbXSkge1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ3NldCBzdWJqZWN0cywgRFJZUlVOLiByZXR1cm5pbmcnKVxuICAgICAgICB9XG4gICAgICAgIHN1YmplY3RMaXN0LnB1c2godGhpcy50ZXN0LnN1YmplY3QpO1xuICAgICAgICBzdWJqZWN0TGlzdC5wdXNoKHRoaXMuZXhhbS5zdWJqZWN0KTtcbiAgICAgICAgY29uc3Qgc3ViamVjdHMgPSBbIC4uLm5ldyBTZXQoc3ViamVjdExpc3QpIF07XG4gICAgICAgIHRoaXMuc2V0KCdzdWJqZWN0cycsIHN1YmplY3RzKTtcbiAgICAgICAgY29uc29sZS53YXJuKCdUaGlzIHVzZWQgdG8gbWF5YmUgbnVsbGlmeSBjb25maWcuc3ViamVjdC4gRG9lc250IGRvIHRoYXQgYW55bW9yZScpO1xuICAgICAgICAvKmNvbnN0IGNvbmZpZyA9IHRoaXMuY29uZmlnKHRoaXMuZXhwZXJpbWVudF90eXBlKTtcbiAgICAgICAgIGNvbnN0IGN1cnJlbnRTdWJqZWN0ID0gY29uZmlnLnN1YmplY3Q7XG4gICAgICAgICBpZiAoIGN1cnJlbnRTdWJqZWN0ICYmICFzdWJqZWN0cy5pbmNsdWRlcyhjdXJyZW50U3ViamVjdCkgKVxuICAgICAgICAgY29uZmlnLnN1YmplY3QgPSBudWxsOyovXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBjb25maWdzUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NhbGxlZCBjb25maWdzUGF0aCwgc2hvdWxkIHVzZSBDT05GSUdTX1BBVEhfQUJTJyk7XG4gICAgICAgIHJldHVybiBDT05GSUdTX1BBVEhfQUJTO1xuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgdHJ1dGhzRGlyUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NhbGxlZCB0cnV0aHNEaXJQYXRoLCBzaG91bGQgdXNlIFRSVVRIU19QQVRIX0FCUycpO1xuICAgICAgICByZXR1cm4gVFJVVEhTX1BBVEhfQUJTO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgc3ViamVjdHNEaXJQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnNvbGUud2FybignY2FsbGVkIHN1YmplY3RzRGlyUGF0aCwgc2hvdWxkIHVzZSBTVUJKRUNUU19QQVRIX0FCUycpO1xuICAgICAgICByZXR1cm4gU1VCSkVDVFNfUEFUSF9BQlNcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIHNhbGFtYW5kZXJEaXJQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnNvbGUud2FybignY2FsbGVkIHNhbGFtYW5kZXJEaXJQYXRoLCBzaG91bGQgdXNlIFNBTEFNQU5ERVJfUEFUSF9BQlMnKTtcbiAgICAgICAgcmV0dXJuIFNBTEFNQU5ERVJfUEFUSF9BQlNcbiAgICB9XG4gICAgXG4gICAgXG4gICAgcHJpdmF0ZSBnZXQgZGV2KCk6IHsgW0sgaW4ga2V5b2YgRGV2T3B0aW9uc106ICgpID0+IGJvb2xlYW4gfSB7XG4gICAgICAgIGNvbnN0IF9kZXYgPSB0aGlzLmdldCgnZGV2Jyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBza2lwX3dob2xlX3RydXRoIDogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfd2hvbGVfdHJ1dGgsXG4gICAgICAgICAgICBza2lwX2xldmVsX2ludHJvIDogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfbGV2ZWxfaW50cm8sXG4gICAgICAgICAgICBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjayA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjayxcbiAgICAgICAgICAgIHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrIDogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBcbiAgICBcbn1cblxuXG5jbGFzcyBTdWJjb25maWcgZXh0ZW5kcyBDb25mPElTdWJjb25maWc+IHsgLy8gQUtBIENvbmZpZ1xuICAgIHByaXZhdGUgcmVhZG9ubHkgdHlwZTogRXhwZXJpbWVudFR5cGU7XG4gICAgcHJvdGVjdGVkIHRydXRoOiBUcnV0aDtcbiAgICAvLyBUT0RPOiBjYWNoZSBhbGwgJ2dldCdzIGluIG1lbW9yeVxuICAgIC8qcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgX0tFWVM6IChrZXlvZiBJU3ViY29uZmlnKVtdID0gW1xuICAgICAnYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uJyxcbiAgICAgJ2FsbG93ZWRfdGVtcG9fZGV2aWF0aW9uJyxcbiAgICAgJ2RlbW9fdHlwZScsXG4gICAgICdlcnJvcnNfcGxheXJhdGUnLFxuICAgICAnZmluaXNoZWRfdHJpYWxzX2NvdW50JyxcbiAgICAgJ25hbWUnLFxuICAgICAnbGV2ZWxzJyxcbiAgICAgJ3N1YmplY3QnLFxuICAgICAndHJ1dGhfZmlsZScsXG4gICAgIF07Ki9cbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih0eXBlOiBFeHBlcmltZW50VHlwZSwgbmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIGZpbGVFeHRlbnNpb24gOiB0eXBlLFxuICAgICAgICAgICAgY3dkIDogQ09ORklHU19QQVRIX0FCUyxcbiAgICAgICAgICAgIGNvbmZpZ05hbWUgOiBteWZzLnJlbW92ZV9leHQobmFtZSlcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy50cnV0aCA9IG5ldyBUcnV0aChteWZzLnJlbW92ZV9leHQodGhpcy50cnV0aF9maWxlKSk7XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGRvVHJ1dGhGaWxlQ2hlY2soKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5K+IFN1YmNvbmZpZygke3RoaXMudHlwZX0pLmRvVHJ1dGhGaWxlQ2hlY2soKWApO1xuICAgICAgICBcbiAgICAgICAgLy8gY29uc3QgdHJ1dGggPSB0aGlzLmdldFRydXRoKCk7XG4gICAgICAgIGlmICggdGhpcy50cnV0aC50eHQuYWxsRXhpc3QoKSApIHtcbiAgICAgICAgICAgIHJldHVybiBBbGVydC5zbWFsbC5zdWNjZXNzKGAke3RoaXMudHJ1dGgubmFtZX0udHh0LCAqX29uLnR4dCwgYW5kICpfb2ZmLnR4dCBmaWxlcyBleGlzdC5gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBbJ2Z1cl9lbGlzZV9CJyB4IDMsICdmdXJfZWxpc2VfUi50eHQnIHggMywgLi4uXVxuICAgICAgICBjb25zdCB0eHRGaWxlc0xpc3QgPSByZXF1aXJlKFwiLi4vR2xvYlwiKS5nZXRUcnV0aEZpbGVzV2hlcmUoeyBleHRlbnNpb24gOiAndHh0JyB9KS5tYXAobXlmcy5yZW1vdmVfZXh0KTtcbiAgICAgICAgY29uc3QgdHJ1dGhzV2l0aDNUeHRGaWxlcyA9IHR4dEZpbGVzTGlzdC5maWx0ZXIoYSA9PiB0eHRGaWxlc0xpc3QuZmlsdGVyKHR4dCA9PiB0eHQuc3RhcnRzV2l0aChhKSkubGVuZ3RoID49IDMpO1xuICAgICAgICBpZiAoICFib29sKHRydXRoc1dpdGgzVHh0RmlsZXMpIClcbiAgICAgICAgICAgIHJldHVybiBBbGVydC5iaWcud2FybmluZyh7XG4gICAgICAgICAgICAgICAgdGl0bGUgOiAnTm8gdmFsaWQgdHJ1dGggZmlsZXMgZm91bmQnLFxuICAgICAgICAgICAgICAgIGh0bWwgOiAnVGhlcmUgbmVlZHMgdG8gYmUgYXQgbGVhc3Qgb25lIHR4dCBmaWxlIHdpdGggMiBcIm9uXCIgYW5kIFwib2ZmXCIgY291bnRlcnBhcnRzLidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIEFsZXJ0LmJpZy5ibG9ja2luZyh7XG4gICAgICAgICAgICB0aXRsZSA6IGBEaWRuJ3QgZmluZCBhbGwgdGhyZWUgLnR4dCBmaWxlcyBmb3IgJHt0aGlzLnRydXRoLm5hbWV9YCxcbiAgICAgICAgICAgIGh0bWwgOiAnVGhlIGZvbGxvd2luZyB0cnV0aHMgYWxsIGhhdmUgMyB0eHQgZmlsZXMuIFBsZWFzZSBjaG9vc2Ugb25lIG9mIHRoZW0sIG9yIGZpeCB0aGUgZmlsZXMgYW5kIHJlbG9hZC4nLFxuICAgICAgICAgICAgc2hvd0Nsb3NlQnV0dG9uIDogdHJ1ZSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgc3RyaW5ncyA6IHRydXRoc1dpdGgzVHh0RmlsZXMsXG4gICAgICAgICAgICBjbGlja0ZuIDogZWwgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IGNvbmZpZyA9IHRoaXMuY29uZmlnKHRoaXMuZXhwZXJpbWVudF90eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxldmVscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRydXRoX2ZpbGUgPSBlbC50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKGVsLnRleHQoKSk7XG4gICAgICAgICAgICAgICAgICAgIHJlbG9hZFBhZ2UoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoICggZXJyICkge1xuICAgICAgICAgICAgICAgICAgICBBbGVydC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBBbGVydC5iaWcuZXJyb3IoeyB0aXRsZSA6IGVyci5tZXNzYWdlLCBodG1sIDogJ1NvbWV0aGluZyBoYXBwZW5lZC4nIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGluY3JlYXNlKEs6IGtleW9mIElTdWJjb25maWcpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSByZXR1cm47XG4gICAgICAgIGxldCBWID0gdGhpcy5nZXQoSyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIFYgPT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLnNldChLLCAxKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0eXBlb2ZWID0gdHlwZW9mIFY7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBpZiAoIHR5cGVvZlYgPT09ICdudW1iZXInIHx8ICh0eXBlb2ZWID09PSAnc3RyaW5nJyAmJiBWLmlzZGlnaXQoKSkgKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KEssIE1hdGguZmxvb3IoVikgKyAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiQmlnQ29uZmlnQ2xzIHRyaWVkIHRvIGluY3JlYXNlIGEgdmFsdWUgdGhhdCBpcyBub3QgYSBudW1iZXIgbm9yIGEgc3RyaW5nLmlzZGlnaXQoKVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIHRvT2JqKCk6IElTdWJjb25maWcgeyAvLyBBS0EgdG9TYXZlZENvbmZpZ1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ1N1YmNvbmZpZywgY2FsbGVkIHRvU2F2ZWRDb25maWcoKS4gTk9UIElNUExFTUVOVEVEJyk7XG4gICAgICAgIC8qY29uc3Qgc2VsZjogQ29uZjxJU3ViY29uZmlnPiA9IHN1cGVyLmdldChgY3VycmVudF8ke3RoaXMudHlwZX1gKTtcbiAgICAgICAgIHNlbGYuZGVsZXRlKCdzYXZlX3BhdGgnKTtcbiAgICAgICAgIC8vIGRlbGV0ZSBzZWxmLnNhdmVfcGF0aDtcbiAgICAgICAgIGNvbnN0IHNhdmVkQ29uZmlnID0ge1xuICAgICAgICAgLi4uc2VsZixcbiAgICAgICAgIHRydXRoX2ZpbGVfcGF0aCA6IHN1cGVyLnRydXRoX2ZpbGVfcGF0aFxuICAgICAgICAgfTtcbiAgICAgICAgIGNvbnNvbGUud2Fybignc2F2ZWRDb25maWcsIGNoZWNrIGlmIGRlbGV0ZWQgc2F2ZV9wYXRoOicsIHNlbGYpO1xuICAgICAgICAgcmV0dXJuIHNhdmVkQ29uZmlnOyovXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGZyb21GaWxlKGNmZ0ZpbGU6IElTdWJjb25maWcpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSByZXR1cm4gY29uc29sZS53YXJuKCdmcm9tRmlsZSwgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgdGhpcy5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gPSBjZmdGaWxlLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbjtcbiAgICAgICAgdGhpcy5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbiA9IGNmZ0ZpbGUuYWxsb3dlZF90ZW1wb19kZXZpYXRpb247XG4gICAgICAgIHRoaXMuZGVtb190eXBlID0gY2ZnRmlsZS5kZW1vX3R5cGU7XG4gICAgICAgIHRoaXMuZXJyb3JzX3BsYXlyYXRlID0gY2ZnRmlsZS5lcnJvcnNfcGxheXJhdGU7XG4gICAgICAgIHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50ID0gY2ZnRmlsZS5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgICAgIHRoaXMubGV2ZWxzID0gY2ZnRmlsZS5sZXZlbHM7XG4gICAgICAgIHRoaXMuc3ViamVjdCA9IGNmZ0ZpbGUuc3ViamVjdDtcbiAgICAgICAgdGhpcy50cnV0aF9maWxlID0gY2ZnRmlsZS50cnV0aF9maWxlO1xuICAgICAgICAvLyB0aGlzLl91cGRhdGVTYXZlZEZpbGUoJ3RydXRoX2ZpbGVfcGF0aCcsIGNmZ0ZpbGUudHJ1dGhfZmlsZV9wYXRoKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgcHJpdmF0ZSBfdXBkYXRlU2F2ZWRGaWxlKGtleToga2V5b2YgSVN1YmNvbmZpZywgdmFsdWUpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdfdXBkYXRlU2F2ZWRGaWxlLCBEUllSVU4uIHJldHVybmluZycpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIC8qY29uc3QgY29uZiA9IG5ldyAocmVxdWlyZSgnY29uZicpKSh7XG4gICAgICAgICBjd2QgOiBDT05GSUdTX1BBVEhfQUJTLFxuICAgICAgICAgY29uZmlnTmFtZSA6IHRoaXMubmFtZSxcbiAgICAgICAgIGZpbGVFeHRlbnNpb24gOiB0aGlzLnR5cGUsXG4gICAgICAgICBzZXJpYWxpemUgOiB2YWx1ZSA9PiBKU09OLnN0cmluZ2lmeSh2YWx1ZSwgbnVsbCwgNClcbiAgICAgICAgIH0pO1xuICAgICAgICAgY29uZi5zZXQoa2V5LCB2YWx1ZSk7Ki9cbiAgICB9XG4gICAgXG4gICAgXG4gICAgLypwcml2YXRlIGdldChrZXk6IGtleW9mIElTdWJjb25maWcpIHtcbiAgICAgLy8gQHRzLWlnbm9yZVxuICAgICByZXR1cm4gc3VwZXIuZ2V0KGBjdXJyZW50XyR7dGhpcy50eXBlfS4ke2tleX1gKTtcbiAgICAgfSovXG4gICAgXG4gICAgXG4gICAgLypwcml2YXRlIHNldChrZXk6IGtleW9mIElTdWJjb25maWcsIHZhbHVlKSB7XG4gICAgIGlmICggRFJZUlVOICkge1xuICAgICBjb25zb2xlLndhcm4oYHNldCgke2tleX0sICR7dmFsdWV9KSBidXQgRFJZUlVOYCk7XG4gICAgIHJldHVybjtcbiAgICAgfVxuICAgICBjb25zdCB0eXBlb2ZLZXkgPSB0eXBlb2Yga2V5O1xuICAgICBpZiAoIHR5cGVvZktleSA9PT0gJ3N0cmluZycgKSB7XG4gICAgIGlmICggIVN1YmNvbmZpZy5fS0VZUy5pbmNsdWRlcyhrZXkpICkge1xuICAgICBjb25zb2xlLndhcm4oYFN1YmNvbmZpZygke3RoaXMudHlwZX0pLnNldDogXCJrZXlcIiAoXCIke2tleX1cIikgaXMgc3RyaW5nIGJ1dCBub3QgaW4gdGhpcy5fS0VZU2ApO1xuICAgICByZXR1cm47XG4gICAgIH1cbiAgICAgY29uc3Qgc3VwZXJrZXkgPSBgY3VycmVudF8ke3RoaXMudHlwZX0uJHtrZXl9YDtcbiAgICAgLy8gQHRzLWlnbm9yZVxuICAgICBzdXBlci5zZXQoc3VwZXJrZXksIHZhbHVlKTtcbiAgICAgaWYgKCBrZXkgIT09IFwic2F2ZV9wYXRoXCIgKVxuICAgICB0aGlzLl91cGRhdGVTYXZlZEZpbGUoa2V5LCB2YWx1ZSk7XG4gICAgIHJldHVybjtcbiAgICAgfVxuICAgICBcbiAgICAgY29uc29sZS53YXJuKGBTdWJjb25maWcoJHt0aGlzLnR5cGV9KS5zZXQ6IFwia2V5XCIgKFwiJHtrZXl9XCIpIGlzIG5vdCBzdHJpbmcuIHR5cGU6ICR7dHlwZW9mS2V5fWApO1xuICAgICB9Ki9cbiAgICBcbiAgICBwcml2YXRlIHNldERldmlhdGlvbihkZXZpYXRpb25UeXBlOiBEZXZpYXRpb25UeXBlLCBkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICBjb25zdCB0eXBlb2ZEZXZpYXRpb24gPSB0eXBlb2YgZGV2aWF0aW9uO1xuICAgICAgICBpZiAoIHR5cGVvZkRldmlhdGlvbiA9PT0gJ251bWJlcicgKSB7XG4gICAgICAgICAgICBkZXZpYXRpb24gPSBgJHtkZXZpYXRpb259JWA7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldERldmlhdGlvbiBnb3QgXCJkZXZpYXRpb25cIiB0eXBlIG51bWJlci4gYXBwZW5kZWQgXCIlXCIuIGRldmlhdGlvbiBub3c6ICR7ZGV2aWF0aW9ufWApO1xuICAgICAgICB9IGVsc2UgaWYgKCB0eXBlb2ZEZXZpYXRpb24gPT09ICdzdHJpbmcnICkge1xuICAgICAgICAgICAgaWYgKCAhZGV2aWF0aW9uLmVuZHNXaXRoKFwiJVwiKSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldERldmlhdGlvbiBnb3QgZGV2aWF0aW9uIHdpdGhvdXQgJS4gYXBwZW5kZWQgJS4gZGV2aWF0aW9uIG5vdzogXCIke2RldmlhdGlvbn1cImApO1xuICAgICAgICAgICAgICAgIGRldmlhdGlvbiA9IGAke2RldmlhdGlvbn0lYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0RGV2aWF0aW9uLCByZWNlaXZlZCBcImRldmlhdGlvblwiIG5vdCBzdHJpbmcgbm90IG51bWJlci4gcmV0dXJuaW5nLiBkZXZpYXRpb246YCwgZGV2aWF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB0aGlzLnNldChgYWxsb3dlZF8ke2RldmlhdGlvblR5cGV9X2RldmlhdGlvbmAsIGRldmlhdGlvbik7XG4gICAgfVxuICAgIFxuICAgIGdldCBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2FsbG93ZWRfdGVtcG9fZGV2aWF0aW9uJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbihkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldERldmlhdGlvbihcInRlbXBvXCIsIGRldmlhdGlvbik7XG4gICAgfVxuICAgIFxuICAgIGdldCBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24nKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbihkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldERldmlhdGlvbihcInJoeXRobVwiLCBkZXZpYXRpb24pO1xuICAgIH1cbiAgICBcbiAgICBnZXQgZGVtb190eXBlKCk6IERlbW9UeXBlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdkZW1vX3R5cGUnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGRlbW9fdHlwZSh0eXBlOiBEZW1vVHlwZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3NldCBkZW1vX3R5cGUgcmV0dXJucyBhIHZhbHVlLCBpcyB0aGlzIG5lZWRlZD8nKTtcbiAgICAgICAgaWYgKCAhWyAndmlkZW8nLCAnYW5pbWF0aW9uJyBdLmluY2x1ZGVzKHR5cGUpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBDb25maWcgZGVtb190eXBlIHNldHRlciwgYmFkIHR5cGUgPSAke3R5cGV9LCBjYW4gYmUgZWl0aGVyIHZpZGVvIG9yIGFuaW1hdGlvbmApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0KCdkZW1vX3R5cGUnLCB0eXBlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBnZXQgZXJyb3JzX3BsYXlyYXRlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnZXJyb3JzX3BsYXlyYXRlJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBlcnJvcnNfcGxheXJhdGUoc3BlZWQ6IG51bWJlcikge1xuICAgICAgICBpZiAoIGlzTmFOKHNwZWVkKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgY29uZmlnIHNldCBlcnJvcnNfcGxheXJhdGUsIHJlY2VpdmVkIGJhZCBcInNwZWVkXCIgTmFOOiAke3NwZWVkfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2Vycm9yc19wbGF5cmF0ZScsIHNwZWVkKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgZ2V0IGZpbmlzaGVkX3RyaWFsc19jb3VudCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2ZpbmlzaGVkX3RyaWFsc19jb3VudCcpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCBpc05hTihjb3VudCkgfHwgY291bnQgPCAwICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBjb25maWcgc2V0IGZpbmlzaGVkX3RyaWFsc19jb3VudCwgcmVjZWl2ZWQgYmFkIFwiY291bnRcIjogJHtjb3VudH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdmaW5pc2hlZF90cmlhbHNfY291bnQnLCBjb3VudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCduYW1lJyk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBzdWJqZWN0KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnc3ViamVjdCcpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgc3ViamVjdChuYW1lOiBzdHJpbmcgfCBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfwn5K+c2V0IHN1YmplY3QoJywgbmFtZSwgJyknKTtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdzZXQgc3ViamVjdCwgRFJZUlVOJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3QnLCBuYW1lKTtcbiAgICAgICAgaWYgKCBuYW1lICkge1xuICAgICAgICAgICAgY29uc3QgR2xvYiA9IHJlcXVpcmUoJy4uL0dsb2InKS5kZWZhdWx0O1xuICAgICAgICAgICAgR2xvYi5CaWdDb25maWcuc3ViamVjdHMgPSBbIC4uLm5ldyBTZXQoWyAuLi5HbG9iLkJpZ0NvbmZpZy5zdWJqZWN0cywgbmFtZSBdKSBdO1xuICAgICAgICAgICAgLy8gc3VwZXIuc2V0KCdzdWJqZWN0cycsIFsuLi5uZXcgU2V0KFsuLi5zdXBlci5nZXQoJ3N1YmplY3RzJyksIG5hbWVdKV0pO1xuICAgICAgICAgICAgLy8gc3VwZXIuc3ViamVjdHMgPSBbIC4uLnN1cGVyLmdldCgnc3ViamVjdHMnKSwgbmFtZSBdO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldCB0cnV0aF9maWxlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgndHJ1dGhfZmlsZScpXG4gICAgfVxuICAgIFxuICAgIC8qKkFsc28gc2V0cyB0aGlzLnRydXRoIChtZW1vcnkpKi9cbiAgICBzZXQgdHJ1dGhfZmlsZSh0cnV0aF9maWxlOiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCB0cnV0aCA9IG5ldyBUcnV0aCh0cnV0aF9maWxlKTtcbiAgICAgICAgICAgIGlmICggIXRydXRoLnR4dC5hbGxFeGlzdCgpICkge1xuICAgICAgICAgICAgICAgIEFsZXJ0LnNtYWxsLndhcm5pbmcoYE5vdCBhbGwgdHh0IGZpbGVzIGV4aXN0OiAke3RydXRoX2ZpbGV9YClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudHJ1dGggPSB0cnV0aDtcbiAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgICAgICBBbGVydC5zbWFsbC53YXJuaW5nKGUpO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGUpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoYHRydXRoX2ZpbGVgLCB0cnV0aF9maWxlKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICAvKmdldFRydXRoKCk6IFRydXRoIHtcbiAgICAgcmV0dXJuIG5ldyBUcnV0aChteWZzLnJlbW92ZV9leHQodGhpcy50cnV0aF9maWxlKSk7XG4gICAgIH0qL1xuICAgIFxuICAgIFxuICAgIGdldCBsZXZlbHMoKTogSUxldmVsW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2xldmVscycpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbGV2ZWxzKGxldmVsczogSUxldmVsW10pIHtcbiAgICAgICAgaWYgKCAhQXJyYXkuaXNBcnJheShsZXZlbHMpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGV2ZWxzLCByZWNlaXZlZCBcImxldmVsc1wiIG5vdCBpc0FycmF5LiBub3Qgc2V0dGluZyBhbnl0aGluZy4gbGV2ZWxzOiBgLCBsZXZlbHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVE9ETzogYmV0dGVyIGNoZWNrc1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xldmVscycsIGxldmVscyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgY3VycmVudFRyaWFsQ29vcmRzKCk6IG51bWJlcltdIHtcbiAgICAgICAgLy8gbGV0IHsgbGV2ZWxzLCBmaW5pc2hlZF90cmlhbHNfY291bnQgfSA9IHRoaXMuY29uZmlnKCk7XG4gICAgICAgIGxldCBmbGF0VHJpYWxzTGlzdCA9IHRoaXMubGV2ZWxzLm1hcChsZXZlbCA9PiBsZXZlbC50cmlhbHMpO1xuICAgICAgICBmb3IgKCBsZXQgWyBsZXZlbEluZGV4LCB0cmlhbHNOdW0gXSBvZiBlbnVtZXJhdGUoZmxhdFRyaWFsc0xpc3QpICkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgdHJpYWxTdW1Tb0ZhciA9IHN1bShmbGF0VHJpYWxzTGlzdC5zbGljZSgwLCBsZXZlbEluZGV4ICsgMSkpO1xuICAgICAgICAgICAgY29uc3QgZmluaXNoZWRUcmlhbHNDb3VudCA9IHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgICAgICAgICAgaWYgKCB0cmlhbFN1bVNvRmFyID4gZmluaXNoZWRUcmlhbHNDb3VudCApXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsgbGV2ZWxJbmRleCwgdHJpYWxzTnVtIC0gKHRyaWFsU3VtU29GYXIgLSBmaW5pc2hlZFRyaWFsc0NvdW50KSBdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUud2FybihcImN1cnJlbnRUcmlhbENvb3Jkczogb3V0IG9mIGluZGV4IGVycm9yXCIpO1xuICAgIH1cbiAgICBcbiAgICBpc0RlbW9WaWRlbygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVtb190eXBlID09PSAndmlkZW8nO1xuICAgIH1cbiAgICBcbiAgICBpc1dob2xlVGVzdE92ZXIoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBzdW0odGhpcy5sZXZlbHMubWFwKGxldmVsID0+IGxldmVsLnRyaWFscykpID09IHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgIH1cbiAgICBcbiAgICBnZXRTdWJqZWN0RGlyTmFtZXMoKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gZnMucmVhZGRpclN5bmMoU1VCSkVDVFNfUEFUSF9BQlMpO1xuICAgIH1cbiAgICBcbiAgICBnZXRDdXJyZW50TGV2ZWwoKTogTGV2ZWwge1xuICAgICAgICBcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICByZXR1cm4gbmV3IExldmVsKHRoaXMubGV2ZWxzW2xldmVsX2luZGV4XSwgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0TGV2ZWxDb2xsZWN0aW9uKCk6IExldmVsQ29sbGVjdGlvbiB7XG4gICAgICAgIGxldCBbIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCBdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBMZXZlbENvbGxlY3Rpb24odGhpcy5sZXZlbHMsIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkdldHMgdGhlIGN1cnJlbnQgdHJpYWwncyBwYXRoIChqb2luIHRoaXMudGVzdE91dFBhdGgoKSBhbmQgbGV2ZWxfJHtsZXZlbF9pbmRleH0uLi4pLCBhbmQgcmV0dXJucyBhIFRydXRoIG9mIGl0Ki9cbiAgICB0cmlhbFRydXRoKCk6IFRydXRoIHtcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICAvLyByZXR1cm4gbmV3IFRydXRoKHBhdGguam9pbih0aGlzLnRlc3RPdXRQYXRoKCksIGBsZXZlbF8ke2xldmVsX2luZGV4fV90cmlhbF8ke3RyaWFsX2luZGV4fWApKTtcbiAgICAgICAgcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odGhpcy50ZXN0T3V0UGF0aCgpLCBgbGV2ZWxfJHtsZXZlbF9pbmRleH1fdHJpYWxfJHt0cmlhbF9pbmRleH1gKSk7XG4gICAgfVxuICAgIFxuICAgIC8qKlwiYzpcXFN5bmNcXENvZGVcXFB5dGhvblxcUHlhbm8tcmVsZWFzZVxcc3JjXFxleHBlcmltZW50c1xcc3ViamVjdHNcXGdpbGFkXFxmdXJfZWxpc2VcIiovXG4gICAgdGVzdE91dFBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY3VyclN1YmplY3REaXIgPSBwYXRoLmpvaW4oU1VCSkVDVFNfUEFUSF9BQlMsIHRoaXMuc3ViamVjdCk7IC8vIFwiLi4uL3N1YmplY3RzL2dpbGFkXCJcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbihjdXJyU3ViamVjdERpciwgdGhpcy50cnV0aC5uYW1lKTtcbiAgICB9XG4gICAgXG4gICAgXG59XG4iXX0=