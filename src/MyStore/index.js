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
        if (_doTruthFileCheck) {
            this.test.doTruthFileCheck()
                .then(this.exam.doTruthFileCheck);
        }
    }
    fromSavedConfig(savedConfig, experimentType) {
        return console.warn('BigConfigCls used fromSavedConfig. Impossible to load big file. Returning');
    }
    update(K, kv) {
        if (DRYRUN)
            return;
        let V = this.get(K);
        if (Array.isArray(V)) {
            this.set(K, [...V, kv]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFDM0Isa0NBQTJEO0FBQzNELG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsNkJBQTZCO0FBRTdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQTRDdEMsTUFBYSxZQUFhLFNBQVEsS0FBaUI7SUFJL0MsWUFBWSxpQkFBaUIsR0FBRyxJQUFJO1FBQ2hDLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSyxNQUFNLEVBQUc7WUFDVixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQzlEO1FBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsRCxJQUFLLGlCQUFpQixFQUFHO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7aUJBQ3ZCLElBQUksQ0FDRCxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUM3QixDQUFDO1NBRVQ7SUFDTCxDQUFDO0lBSUQsZUFBZSxDQUFDLFdBQXVCLEVBQUUsY0FBOEI7UUFDbkUsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLDJFQUEyRSxDQUFDLENBQUM7SUFPckcsQ0FBQztJQXNCRCxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDUixJQUFLLE1BQU07WUFBRyxPQUFPO1FBQ3JCLElBQUksQ0FB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QUNQLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0RCxDQUFDO0NBR0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBTdG9yZSBmcm9tIFwiZWxlY3Ryb24tc3RvcmVcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IEFsZXJ0IGZyb20gXCIuLi9NeUFsZXJ0XCI7XG5pbXBvcnQgbXlmcyBmcm9tIFwiLi4vTXlGc1wiO1xuaW1wb3J0IHsgYm9vbCwgcmVsb2FkUGFnZSwgc3VtLCBlbnVtZXJhdGUgfSBmcm9tIFwiLi4vdXRpbFwiO1xuaW1wb3J0IHsgVHJ1dGggfSBmcm9tIFwiLi4vVHJ1dGhcIjtcbmltcG9ydCB7IElMZXZlbCwgTGV2ZWwsIExldmVsQ29sbGVjdGlvbiB9IGZyb20gXCIuLi9MZXZlbFwiO1xuaW1wb3J0IHsgU3dlZXRBbGVydFJlc3VsdCB9IGZyb20gXCJzd2VldGFsZXJ0MlwiO1xuaW1wb3J0ICogYXMgQ29uZiBmcm9tICdjb25mJztcblxuY29uc29sZS5sb2coJ3NyYy9CaWdDb25maWcvaW5kZXgudHMnKTtcblxudHlwZSBFeHBlcmltZW50VHlwZSA9ICdleGFtJyB8ICd0ZXN0JztcbnR5cGUgRGVtb1R5cGUgPSAndmlkZW8nIHwgJ2FuaW1hdGlvbic7XG5leHBvcnQgdHlwZSBQYWdlTmFtZSA9IFwibmV3XCIgLy8gQUtBIFRMYXN0UGFnZVxuICAgIHwgXCJydW5uaW5nXCJcbiAgICB8IFwicmVjb3JkXCJcbiAgICB8IFwiZmlsZV90b29sc1wiXG4gICAgfCBcInNldHRpbmdzXCJcbnR5cGUgRGV2aWF0aW9uVHlwZSA9ICdyaHl0aG0nIHwgJ3RlbXBvJztcblxuXG5pbnRlcmZhY2UgSVN1YmNvbmZpZyB7XG4gICAgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uOiBzdHJpbmcsXG4gICAgYWxsb3dlZF90ZW1wb19kZXZpYXRpb246IHN0cmluZyxcbiAgICBkZW1vX3R5cGU6IERlbW9UeXBlLFxuICAgIGVycm9yc19wbGF5cmF0ZTogbnVtYmVyLFxuICAgIGZpbmlzaGVkX3RyaWFsc19jb3VudDogbnVtYmVyLFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzdWJqZWN0OiBzdHJpbmcsXG4gICAgdHJ1dGhfZmlsZTogc3RyaW5nLFxuICAgIGxldmVsczogSUxldmVsW10sXG59XG5cblxuaW50ZXJmYWNlIERldk9wdGlvbnMge1xuICAgIHNraXBfd2hvbGVfdHJ1dGg6IGJvb2xlYW4sXG4gICAgc2tpcF9sZXZlbF9pbnRybzogYm9vbGVhbixcbiAgICBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjazogYm9vbGVhbixcbiAgICBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjazogYm9vbGVhblxufVxuXG5pbnRlcmZhY2UgSUJpZ0NvbmZpZyB7XG4gICAgZGV2OiBib29sZWFuLFxuICAgIGRldm9wdGlvbnM6IERldk9wdGlvbnMsXG4gICAgZXhhbV9maWxlOiBzdHJpbmcsXG4gICAgdGVzdF9maWxlOiBzdHJpbmcsXG4gICAgZXhwZXJpbWVudF90eXBlOiBFeHBlcmltZW50VHlwZSxcbiAgICBsYXN0X3BhZ2U6IFBhZ2VOYW1lLFxuICAgIHN1YmplY3RzOiBzdHJpbmdbXSxcbiAgICB2ZWxvY2l0aWVzOiBudW1iZXJbXSxcbn1cblxuXG5leHBvcnQgY2xhc3MgQmlnQ29uZmlnQ2xzIGV4dGVuZHMgU3RvcmU8SUJpZ0NvbmZpZz4ge1xuICAgIHRlc3Q6IFN1YmNvbmZpZztcbiAgICBleGFtOiBTdWJjb25maWc7XG4gICAgXG4gICAgY29uc3RydWN0b3IoX2RvVHJ1dGhGaWxlQ2hlY2sgPSB0cnVlKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgdGhpcy5zZXQgPSAoLi4uYXJncykgPT4gY29uc29sZS53YXJuKGBEUllSVU4sIHNldDogYCwgYXJncylcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRlc3QgPSBuZXcgU3ViY29uZmlnKFwidGVzdFwiLCB0aGlzLnRlc3RfZmlsZSk7XG4gICAgICAgIHRoaXMuZXhhbSA9IG5ldyBTdWJjb25maWcoXCJleGFtXCIsIHRoaXMuZXhhbV9maWxlKTtcbiAgICAgICAgaWYgKCBfZG9UcnV0aEZpbGVDaGVjayApIHtcbiAgICAgICAgICAgIHRoaXMudGVzdC5kb1RydXRoRmlsZUNoZWNrKClcbiAgICAgICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leGFtLmRvVHJ1dGhGaWxlQ2hlY2tcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZzogSVN1YmNvbmZpZywgZXhwZXJpbWVudFR5cGU6IEV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ0JpZ0NvbmZpZ0NscyB1c2VkIGZyb21TYXZlZENvbmZpZy4gSW1wb3NzaWJsZSB0byBsb2FkIGJpZyBmaWxlLiBSZXR1cm5pbmcnKTtcbiAgICAgICAgLyppZiAoIERSWVJVTiApIHJldHVybiBjb25zb2xlLmxvZyhgZnJvbVNhdmVkQ29uZmlnLCBEUllSVU5gKTtcbiAgICAgICAgIGNvbnN0IHRydXRoRmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKHNhdmVkQ29uZmlnLnRydXRoX2ZpbGVfcGF0aCwgJy50eHQnKTtcbiAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKHBhdGguam9pbihUUlVUSFNfUEFUSF9BQlMsIHRydXRoRmlsZU5hbWUpKTtcbiAgICAgICAgIHRoaXMuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgICB0aGlzLmNvbmZpZyhleHBlcmltZW50VHlwZSkuZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnKTsqL1xuICAgIH1cbiAgICBcbiAgICAvKnN1YmNvbmZpZ3MoKTogeyBleGFtOiBTdWJjb25maWcsIHRlc3Q6IFN1YmNvbmZpZyB9IHtcbiAgICAgY29uc3Qgc3ViY29uZmlncyA9IHtcbiAgICAgZXhhbSA6IHRoaXMuZXhhbSxcbiAgICAgdGVzdCA6IHRoaXMudGVzdFxuICAgICB9O1xuICAgICBcbiAgICAgcmV0dXJuIHN1YmNvbmZpZ3M7XG4gICAgIH0qL1xuICAgIFxuICAgIC8qY29uZmlnKHR5cGU6IEV4cGVyaW1lbnRUeXBlKTogU3ViY29uZmlnIHtcbiAgICAgXG4gICAgIHJldHVybiBuZXcgU3ViY29uZmlnKHR5cGUpO1xuICAgICB9Ki9cbiAgICBcbiAgICBcbiAgICAvKipAZXhhbXBsZVxuICAgICB1cGRhdGUoJ3N1YmplY3RzJywgW25hbWVzXSlcbiAgICAgKi9cbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywga3ZQYWlyczogUGFydGlhbDxJQmlnQ29uZmlnPilcbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywgdmFsdWVzOiBhbnlbXSlcbiAgICB1cGRhdGUoSywga3YpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSByZXR1cm47XG4gICAgICAgIGxldCBWID0gdGhpcy5nZXQoSyk7XG4gICAgICAgIGlmICggQXJyYXkuaXNBcnJheShWKSApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KEssIFsgLi4uViwga3YgXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKFYsIGt2KTtcbiAgICAgICAgICAgIHRoaXMuc2V0KEssIFYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmdldChLKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLy8gLyoqQHJldHVybiB7c3RyaW5nfSovXG4gICAgLy8gZ2V0IHNhdmVfcGF0aCgpIHtcbiAgICAvLyBcdHJldHVybiB0aGlzLmdldCgnc2F2ZV9wYXRoJyk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gLyoqQHBhcmFtIHtzdHJpbmd9IHNhdmVQYXRoKi9cbiAgICAvLyBzZXQgc2F2ZV9wYXRoKHNhdmVQYXRoKSB7XG4gICAgLy8gXHR0aGlzLnNldCgnc2F2ZV9wYXRoJywgc2F2ZVBhdGgpO1xuICAgIC8vIH1cbiAgICBcbiAgICBnZXQgbGFzdF9wYWdlKCk6IFBhZ2VOYW1lIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdsYXN0X3BhZ2UnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGxhc3RfcGFnZShwYWdlOiBQYWdlTmFtZSkge1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdmFsaWRwYWdlcyA9IFsgXCJuZXdcIiwgXCJydW5uaW5nXCIsIFwicmVjb3JkXCIsIFwiZmlsZV90b29sc1wiLCBcInNldHRpbmdzXCIgXTtcbiAgICAgICAgaWYgKCAhdmFsaWRwYWdlcy5pbmNsdWRlcyhwYWdlKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IGxhc3RfcGFnZShcIiR7cGFnZX1cIiksIG11c3QgYmUgb25lIG9mICR7dmFsaWRwYWdlcy5qb2luKCcsICcpfS4gc2V0dGluZyB0byBuZXdgKTtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCAnbmV3Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnbGFzdF9wYWdlJywgcGFnZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqVXBkYXRlcyB7c3ViY2ZnVHlwZX1fZmlsZSBhbmQgYWxzbyBpbml0aWFsaXplcyBuZXcgU3ViY29uZmlnKi9cbiAgICBwcml2YXRlIF9zZXRTdWJjb25maWdGaWxlUHJvcChmaWxlOiBzdHJpbmcsIHN1YmNmZ1R5cGU6IEV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIGlmICggdGhpc1tgJHtzdWJjZmdUeXBlfV9maWxlYF0gPT09IGZpbGUgKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKGBfc2V0U3ViY29uZmlnRmlsZVByb3AsIGZpbGUgPT09IGV4aXN0aW5nIG9uZS5gLCB7XG4gICAgICAgICAgICAgICAgZmlsZSxcbiAgICAgICAgICAgICAgICBzdWJjZmdUeXBlLFxuICAgICAgICAgICAgICAgICd0aGlzW2Ake3N1YmNmZ1R5cGV9X2ZpbGVgXScgOiB0aGlzW2Ake3N1YmNmZ1R5cGV9X2ZpbGVgXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGJhc2VuYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlKTtcbiAgICAgICAgaWYgKCBmaWxlICE9PSBiYXNlbmFtZSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0ICR7c3ViY2ZnVHlwZX1fZmlsZSgke2ZpbGV9KSwgTk9UIGEgYmFzZW5hbWUuIGNvbnRpbnVpbmcgd2l0aCBvbmx5IGJhc2VuYW1lYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGUpO1xuICAgICAgICBpZiAoICFib29sKGV4dCkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCAke3N1YmNmZ1R5cGV9X2ZpbGUoJHtmaWxlfSkgaGFzIG5vIGV4dGVuc2lvbi4gYWRkaW5nIC4ke3N1YmNmZ1R5cGV9YCk7XG4gICAgICAgICAgICBiYXNlbmFtZSArPSBgLiR7c3ViY2ZnVHlwZX1gO1xuICAgICAgICB9IGVsc2UgaWYgKCBleHQgIT09IGAuJHtzdWJjZmdUeXBlfWAgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCAke3N1YmNmZ1R5cGV9X2ZpbGUoJHtmaWxlfSkgYmFkIGV4dGVuc2lvbjogXCIke2V4dH1cIi4gcmVwbGFjaW5nIHdpdGggLiR7c3ViY2ZnVHlwZX1gKTtcbiAgICAgICAgICAgIG15ZnMucmVwbGFjZV9leHQoYmFzZW5hbWUsIGAuJHtzdWJjZmdUeXBlfWApXG4gICAgICAgIH1cbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB0aGlzLnNldChgJHtzdWJjZmdUeXBlfV9maWxlYCwgYmFzZW5hbWUpO1xuICAgICAgICB0aGlzW3N1YmNmZ1R5cGVdID0gbmV3IFN1YmNvbmZpZyhzdWJjZmdUeXBlLCBteWZzLnJlbW92ZV9leHQoYmFzZW5hbWUpKVxuICAgIH1cbiAgICBcbiAgICBnZXQgZXhhbV9maWxlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnZXhhbV9maWxlJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlVwZGF0ZXMgZXhhbV9maWxlIGFuZCBhbHNvIGluaXRpYWxpemVzIG5ldyBTdWJjb25maWcqL1xuICAgIHNldCBleGFtX2ZpbGUoZmlsZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX3NldFN1YmNvbmZpZ0ZpbGVQcm9wKGZpbGUsIFwiZXhhbVwiKVxuICAgIH1cbiAgICBcbiAgICBnZXQgdGVzdF9maWxlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgndGVzdF9maWxlJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlVwZGF0ZXMgdGVzdF9maWxlIGFuZCBhbHNvIGluaXRpYWxpemVzIG5ldyBTdWJjb25maWcqL1xuICAgIHNldCB0ZXN0X2ZpbGUoZmlsZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX3NldFN1YmNvbmZpZ0ZpbGVQcm9wKGZpbGUsIFwidGVzdFwiKVxuICAgIH1cbiAgICBcbiAgICBnZXQgZXhwZXJpbWVudF90eXBlKCk6IEV4cGVyaW1lbnRUeXBlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdleHBlcmltZW50X3R5cGUnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGV4cGVyaW1lbnRfdHlwZShleHBlcmltZW50VHlwZTogRXhwZXJpbWVudFR5cGUpIHtcbiAgICAgICAgaWYgKCBleHBlcmltZW50VHlwZSAhPT0gJ3Rlc3QnICYmIGV4cGVyaW1lbnRUeXBlICE9PSAnZXhhbScgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEJpZ0NvbmZpZ0NscyBleHBlcmltZW50X3R5cGUgc2V0dGVyLCBnb3QgZXhwZXJpbWVudFR5cGU6ICcke2V4cGVyaW1lbnRUeXBlfScuIE11c3QgYmUgZWl0aGVyICd0ZXN0JyBvciAnZXhhbScuIHNldHRpbmcgdG8gdGVzdGApO1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2V4cGVyaW1lbnRfdHlwZScsICd0ZXN0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZXhwZXJpbWVudF90eXBlJywgZXhwZXJpbWVudFR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHRoaXMuX3VwZGF0ZVNhdmVkRmlsZSgnZXhwZXJpbWVudF90eXBlJywgZXhwZXJpbWVudFR5cGUpO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgZ2V0IHN1YmplY3RzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdzdWJqZWN0cycpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgc3ViamVjdHMoc3ViamVjdExpc3Q6IHN0cmluZ1tdKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2Fybignc2V0IHN1YmplY3RzLCBEUllSVU4uIHJldHVybmluZycpXG4gICAgICAgIH1cbiAgICAgICAgc3ViamVjdExpc3QucHVzaCh0aGlzLnRlc3Quc3ViamVjdCk7XG4gICAgICAgIHN1YmplY3RMaXN0LnB1c2godGhpcy5leGFtLnN1YmplY3QpO1xuICAgICAgICBjb25zdCBzdWJqZWN0cyA9IFsgLi4ubmV3IFNldChzdWJqZWN0TGlzdCkgXTtcbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3RzJywgc3ViamVjdHMpO1xuICAgICAgICBjb25zb2xlLndhcm4oJ1RoaXMgdXNlZCB0byBtYXliZSBudWxsaWZ5IGNvbmZpZy5zdWJqZWN0LiBEb2VzbnQgZG8gdGhhdCBhbnltb3JlJyk7XG4gICAgICAgIC8qY29uc3QgY29uZmlnID0gdGhpcy5jb25maWcodGhpcy5leHBlcmltZW50X3R5cGUpO1xuICAgICAgICAgY29uc3QgY3VycmVudFN1YmplY3QgPSBjb25maWcuc3ViamVjdDtcbiAgICAgICAgIGlmICggY3VycmVudFN1YmplY3QgJiYgIXN1YmplY3RzLmluY2x1ZGVzKGN1cnJlbnRTdWJqZWN0KSApXG4gICAgICAgICBjb25maWcuc3ViamVjdCA9IG51bGw7Ki9cbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGNvbmZpZ3NQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnNvbGUud2FybignY2FsbGVkIGNvbmZpZ3NQYXRoLCBzaG91bGQgdXNlIENPTkZJR1NfUEFUSF9BQlMnKTtcbiAgICAgICAgcmV0dXJuIENPTkZJR1NfUEFUSF9BQlM7XG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICB0cnV0aHNEaXJQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnNvbGUud2FybignY2FsbGVkIHRydXRoc0RpclBhdGgsIHNob3VsZCB1c2UgVFJVVEhTX1BBVEhfQUJTJyk7XG4gICAgICAgIHJldHVybiBUUlVUSFNfUEFUSF9BQlM7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBzdWJqZWN0c0RpclBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdjYWxsZWQgc3ViamVjdHNEaXJQYXRoLCBzaG91bGQgdXNlIFNVQkpFQ1RTX1BBVEhfQUJTJyk7XG4gICAgICAgIHJldHVybiBTVUJKRUNUU19QQVRIX0FCU1xuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgc2FsYW1hbmRlckRpclBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdjYWxsZWQgc2FsYW1hbmRlckRpclBhdGgsIHNob3VsZCB1c2UgU0FMQU1BTkRFUl9QQVRIX0FCUycpO1xuICAgICAgICByZXR1cm4gU0FMQU1BTkRFUl9QQVRIX0FCU1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBwcml2YXRlIGdldCBkZXYoKTogeyBbSyBpbiBrZXlvZiBEZXZPcHRpb25zXTogKCkgPT4gYm9vbGVhbiB9IHtcbiAgICAgICAgY29uc3QgX2RldiA9IHRoaXMuZ2V0KCdkZXYnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNraXBfd2hvbGVfdHJ1dGggOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF93aG9sZV90cnV0aCxcbiAgICAgICAgICAgIHNraXBfbGV2ZWxfaW50cm8gOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9sZXZlbF9pbnRybyxcbiAgICAgICAgICAgIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrIDogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrLFxuICAgICAgICAgICAgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2sgOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2ssXG4gICAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIFxufVxuXG5cbmNsYXNzIFN1YmNvbmZpZyBleHRlbmRzIENvbmY8SVN1YmNvbmZpZz4geyAvLyBBS0EgQ29uZmlnXG4gICAgcHJpdmF0ZSByZWFkb25seSB0eXBlOiBFeHBlcmltZW50VHlwZTtcbiAgICBwcm90ZWN0ZWQgdHJ1dGg6IFRydXRoO1xuICAgIC8vIFRPRE86IGNhY2hlIGFsbCAnZ2V0J3MgaW4gbWVtb3J5XG4gICAgLypwcml2YXRlIHN0YXRpYyByZWFkb25seSBfS0VZUzogKGtleW9mIElTdWJjb25maWcpW10gPSBbXG4gICAgICdhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24nLFxuICAgICAnYWxsb3dlZF90ZW1wb19kZXZpYXRpb24nLFxuICAgICAnZGVtb190eXBlJyxcbiAgICAgJ2Vycm9yc19wbGF5cmF0ZScsXG4gICAgICdmaW5pc2hlZF90cmlhbHNfY291bnQnLFxuICAgICAnbmFtZScsXG4gICAgICdsZXZlbHMnLFxuICAgICAnc3ViamVjdCcsXG4gICAgICd0cnV0aF9maWxlJyxcbiAgICAgXTsqL1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKHR5cGU6IEV4cGVyaW1lbnRUeXBlLCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgZmlsZUV4dGVuc2lvbiA6IHR5cGUsXG4gICAgICAgICAgICBjd2QgOiBDT05GSUdTX1BBVEhfQUJTLFxuICAgICAgICAgICAgY29uZmlnTmFtZSA6IG15ZnMucmVtb3ZlX2V4dChuYW1lKVxuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLnRydXRoID0gbmV3IFRydXRoKG15ZnMucmVtb3ZlX2V4dCh0aGlzLnRydXRoX2ZpbGUpKTtcbiAgICB9XG4gICAgXG4gICAgYXN5bmMgZG9UcnV0aEZpbGVDaGVjaygpOiBQcm9taXNlPFN3ZWV0QWxlcnRSZXN1bHQ+IHtcbiAgICAgICAgY29uc29sZS5sb2coYPCfkr4gU3ViY29uZmlnKCR7dGhpcy50eXBlfSkuZG9UcnV0aEZpbGVDaGVjaygpYCk7XG4gICAgICAgIFxuICAgICAgICAvLyBjb25zdCB0cnV0aCA9IHRoaXMuZ2V0VHJ1dGgoKTtcbiAgICAgICAgaWYgKCB0aGlzLnRydXRoLnR4dC5hbGxFeGlzdCgpICkge1xuICAgICAgICAgICAgcmV0dXJuIEFsZXJ0LnNtYWxsLnN1Y2Nlc3MoYCR7dGhpcy50cnV0aC5uYW1lfS50eHQsICpfb24udHh0LCBhbmQgKl9vZmYudHh0IGZpbGVzIGV4aXN0LmApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFsnZnVyX2VsaXNlX0InIHggMywgJ2Z1cl9lbGlzZV9SLnR4dCcgeCAzLCAuLi5dXG4gICAgICAgIGNvbnN0IHR4dEZpbGVzTGlzdCA9IHJlcXVpcmUoXCIuLi9HbG9iXCIpLmdldFRydXRoRmlsZXNXaGVyZSh7IGV4dGVuc2lvbiA6ICd0eHQnIH0pLm1hcChteWZzLnJlbW92ZV9leHQpO1xuICAgICAgICBjb25zdCB0cnV0aHNXaXRoM1R4dEZpbGVzID0gdHh0RmlsZXNMaXN0LmZpbHRlcihhID0+IHR4dEZpbGVzTGlzdC5maWx0ZXIodHh0ID0+IHR4dC5zdGFydHNXaXRoKGEpKS5sZW5ndGggPj0gMyk7XG4gICAgICAgIGlmICggIWJvb2wodHJ1dGhzV2l0aDNUeHRGaWxlcykgKVxuICAgICAgICAgICAgcmV0dXJuIEFsZXJ0LmJpZy53YXJuaW5nKHtcbiAgICAgICAgICAgICAgICB0aXRsZSA6ICdObyB2YWxpZCB0cnV0aCBmaWxlcyBmb3VuZCcsXG4gICAgICAgICAgICAgICAgaHRtbCA6ICdUaGVyZSBuZWVkcyB0byBiZSBhdCBsZWFzdCBvbmUgdHh0IGZpbGUgd2l0aCAyIFwib25cIiBhbmQgXCJvZmZcIiBjb3VudGVycGFydHMuJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gQWxlcnQuYmlnLmJsb2NraW5nKHtcbiAgICAgICAgICAgIHRpdGxlIDogYERpZG4ndCBmaW5kIGFsbCB0aHJlZSAudHh0IGZpbGVzIGZvciAke3RoaXMudHJ1dGgubmFtZX1gLFxuICAgICAgICAgICAgaHRtbCA6ICdUaGUgZm9sbG93aW5nIHRydXRocyBhbGwgaGF2ZSAzIHR4dCBmaWxlcy4gUGxlYXNlIGNob29zZSBvbmUgb2YgdGhlbSwgb3IgZml4IHRoZSBmaWxlcyBhbmQgcmVsb2FkLicsXG4gICAgICAgICAgICBzaG93Q2xvc2VCdXR0b24gOiB0cnVlLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBzdHJpbmdzIDogdHJ1dGhzV2l0aDNUeHRGaWxlcyxcbiAgICAgICAgICAgIGNsaWNrRm4gOiBlbCA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc3QgY29uZmlnID0gdGhpcy5jb25maWcodGhpcy5leHBlcmltZW50X3R5cGUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGV2ZWxzID0gW107XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJ1dGhfZmlsZSA9IGVsLnRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy50cnV0aF9maWxlX3BhdGggPSBuZXcgVHJ1dGgoZWwudGV4dCgpKTtcbiAgICAgICAgICAgICAgICAgICAgcmVsb2FkUGFnZSgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgICAgIEFsZXJ0LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIEFsZXJ0LmJpZy5lcnJvcih7IHRpdGxlIDogZXJyLm1lc3NhZ2UsIGh0bWwgOiAnU29tZXRoaW5nIGhhcHBlbmVkLicgfSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgaW5jcmVhc2UoSzoga2V5b2YgSVN1YmNvbmZpZykge1xuICAgICAgICBpZiAoIERSWVJVTiApIHJldHVybjtcbiAgICAgICAgbGV0IFYgPSB0aGlzLmdldChLKTtcbiAgICAgICAgXG4gICAgICAgIGlmICggViA9PT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuc2V0KEssIDEpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVvZlYgPSB0eXBlb2YgVjtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGlmICggdHlwZW9mViA9PT0gJ251bWJlcicgfHwgKHR5cGVvZlYgPT09ICdzdHJpbmcnICYmIFYuaXNkaWdpdCgpKSApIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoSywgTWF0aC5mbG9vcihWKSArIDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJCaWdDb25maWdDbHMgdHJpZWQgdG8gaW5jcmVhc2UgYSB2YWx1ZSB0aGF0IGlzIG5vdCBhIG51bWJlciBub3IgYSBzdHJpbmcuaXNkaWdpdCgpXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgdG9PYmooKTogSVN1YmNvbmZpZyB7IC8vIEFLQSB0b1NhdmVkQ29uZmlnXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignU3ViY29uZmlnLCBjYWxsZWQgdG9TYXZlZENvbmZpZygpLiBOT1QgSU1QTEVNRU5URUQnKTtcbiAgICAgICAgLypjb25zdCBzZWxmOiBDb25mPElTdWJjb25maWc+ID0gc3VwZXIuZ2V0KGBjdXJyZW50XyR7dGhpcy50eXBlfWApO1xuICAgICAgICAgc2VsZi5kZWxldGUoJ3NhdmVfcGF0aCcpO1xuICAgICAgICAgLy8gZGVsZXRlIHNlbGYuc2F2ZV9wYXRoO1xuICAgICAgICAgY29uc3Qgc2F2ZWRDb25maWcgPSB7XG4gICAgICAgICAuLi5zZWxmLFxuICAgICAgICAgdHJ1dGhfZmlsZV9wYXRoIDogc3VwZXIudHJ1dGhfZmlsZV9wYXRoXG4gICAgICAgICB9O1xuICAgICAgICAgY29uc29sZS53YXJuKCdzYXZlZENvbmZpZywgY2hlY2sgaWYgZGVsZXRlZCBzYXZlX3BhdGg6Jywgc2VsZik7XG4gICAgICAgICByZXR1cm4gc2F2ZWRDb25maWc7Ki9cbiAgICB9XG4gICAgXG4gICAgXG4gICAgZnJvbUZpbGUoY2ZnRmlsZTogSVN1YmNvbmZpZykge1xuICAgICAgICBpZiAoIERSWVJVTiApIHJldHVybiBjb25zb2xlLndhcm4oJ2Zyb21GaWxlLCBEUllSVU4uIHJldHVybmluZycpO1xuICAgICAgICB0aGlzLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbiA9IGNmZ0ZpbGUuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uO1xuICAgICAgICB0aGlzLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uID0gY2ZnRmlsZS5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbjtcbiAgICAgICAgdGhpcy5kZW1vX3R5cGUgPSBjZmdGaWxlLmRlbW9fdHlwZTtcbiAgICAgICAgdGhpcy5lcnJvcnNfcGxheXJhdGUgPSBjZmdGaWxlLmVycm9yc19wbGF5cmF0ZTtcbiAgICAgICAgdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQgPSBjZmdGaWxlLmZpbmlzaGVkX3RyaWFsc19jb3VudDtcbiAgICAgICAgdGhpcy5sZXZlbHMgPSBjZmdGaWxlLmxldmVscztcbiAgICAgICAgdGhpcy5zdWJqZWN0ID0gY2ZnRmlsZS5zdWJqZWN0O1xuICAgICAgICB0aGlzLnRydXRoX2ZpbGUgPSBjZmdGaWxlLnRydXRoX2ZpbGU7XG4gICAgICAgIC8vIHRoaXMuX3VwZGF0ZVNhdmVkRmlsZSgndHJ1dGhfZmlsZV9wYXRoJywgY2ZnRmlsZS50cnV0aF9maWxlX3BhdGgpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBwcml2YXRlIF91cGRhdGVTYXZlZEZpbGUoa2V5OiBrZXlvZiBJU3ViY29uZmlnLCB2YWx1ZSkge1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ191cGRhdGVTYXZlZEZpbGUsIERSWVJVTi4gcmV0dXJuaW5nJylcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgLypjb25zdCBjb25mID0gbmV3IChyZXF1aXJlKCdjb25mJykpKHtcbiAgICAgICAgIGN3ZCA6IENPTkZJR1NfUEFUSF9BQlMsXG4gICAgICAgICBjb25maWdOYW1lIDogdGhpcy5uYW1lLFxuICAgICAgICAgZmlsZUV4dGVuc2lvbiA6IHRoaXMudHlwZSxcbiAgICAgICAgIHNlcmlhbGl6ZSA6IHZhbHVlID0+IEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCA0KVxuICAgICAgICAgfSk7XG4gICAgICAgICBjb25mLnNldChrZXksIHZhbHVlKTsqL1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKnByaXZhdGUgZ2V0KGtleToga2V5b2YgSVN1YmNvbmZpZykge1xuICAgICAvLyBAdHMtaWdub3JlXG4gICAgIHJldHVybiBzdXBlci5nZXQoYGN1cnJlbnRfJHt0aGlzLnR5cGV9LiR7a2V5fWApO1xuICAgICB9Ki9cbiAgICBcbiAgICBcbiAgICAvKnByaXZhdGUgc2V0KGtleToga2V5b2YgSVN1YmNvbmZpZywgdmFsdWUpIHtcbiAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgIGNvbnNvbGUud2Fybihgc2V0KCR7a2V5fSwgJHt2YWx1ZX0pIGJ1dCBEUllSVU5gKTtcbiAgICAgcmV0dXJuO1xuICAgICB9XG4gICAgIGNvbnN0IHR5cGVvZktleSA9IHR5cGVvZiBrZXk7XG4gICAgIGlmICggdHlwZW9mS2V5ID09PSAnc3RyaW5nJyApIHtcbiAgICAgaWYgKCAhU3ViY29uZmlnLl9LRVlTLmluY2x1ZGVzKGtleSkgKSB7XG4gICAgIGNvbnNvbGUud2FybihgU3ViY29uZmlnKCR7dGhpcy50eXBlfSkuc2V0OiBcImtleVwiIChcIiR7a2V5fVwiKSBpcyBzdHJpbmcgYnV0IG5vdCBpbiB0aGlzLl9LRVlTYCk7XG4gICAgIHJldHVybjtcbiAgICAgfVxuICAgICBjb25zdCBzdXBlcmtleSA9IGBjdXJyZW50XyR7dGhpcy50eXBlfS4ke2tleX1gO1xuICAgICAvLyBAdHMtaWdub3JlXG4gICAgIHN1cGVyLnNldChzdXBlcmtleSwgdmFsdWUpO1xuICAgICBpZiAoIGtleSAhPT0gXCJzYXZlX3BhdGhcIiApXG4gICAgIHRoaXMuX3VwZGF0ZVNhdmVkRmlsZShrZXksIHZhbHVlKTtcbiAgICAgcmV0dXJuO1xuICAgICB9XG4gICAgIFxuICAgICBjb25zb2xlLndhcm4oYFN1YmNvbmZpZygke3RoaXMudHlwZX0pLnNldDogXCJrZXlcIiAoXCIke2tleX1cIikgaXMgbm90IHN0cmluZy4gdHlwZTogJHt0eXBlb2ZLZXl9YCk7XG4gICAgIH0qL1xuICAgIFxuICAgIHByaXZhdGUgc2V0RGV2aWF0aW9uKGRldmlhdGlvblR5cGU6IERldmlhdGlvblR5cGUsIGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHR5cGVvZkRldmlhdGlvbiA9IHR5cGVvZiBkZXZpYXRpb247XG4gICAgICAgIGlmICggdHlwZW9mRGV2aWF0aW9uID09PSAnbnVtYmVyJyApIHtcbiAgICAgICAgICAgIGRldmlhdGlvbiA9IGAke2RldmlhdGlvbn0lYDtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0RGV2aWF0aW9uIGdvdCBcImRldmlhdGlvblwiIHR5cGUgbnVtYmVyLiBhcHBlbmRlZCBcIiVcIi4gZGV2aWF0aW9uIG5vdzogJHtkZXZpYXRpb259YCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZkRldmlhdGlvbiA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICBpZiAoICFkZXZpYXRpb24uZW5kc1dpdGgoXCIlXCIpICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0RGV2aWF0aW9uIGdvdCBkZXZpYXRpb24gd2l0aG91dCAlLiBhcHBlbmRlZCAlLiBkZXZpYXRpb24gbm93OiBcIiR7ZGV2aWF0aW9ufVwiYCk7XG4gICAgICAgICAgICAgICAgZGV2aWF0aW9uID0gYCR7ZGV2aWF0aW9ufSVgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXREZXZpYXRpb24sIHJlY2VpdmVkIFwiZGV2aWF0aW9uXCIgbm90IHN0cmluZyBub3QgbnVtYmVyLiByZXR1cm5pbmcuIGRldmlhdGlvbjpgLCBkZXZpYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMuc2V0KGBhbGxvd2VkXyR7ZGV2aWF0aW9uVHlwZX1fZGV2aWF0aW9uYCwgZGV2aWF0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0IGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnYWxsb3dlZF90ZW1wb19kZXZpYXRpb24nKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uKGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0RGV2aWF0aW9uKFwidGVtcG9cIiwgZGV2aWF0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0IGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2FsbG93ZWRfcmh5dGhtX2RldmlhdGlvbicpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uKGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0RGV2aWF0aW9uKFwicmh5dGhtXCIsIGRldmlhdGlvbik7XG4gICAgfVxuICAgIFxuICAgIGdldCBkZW1vX3R5cGUoKTogRGVtb1R5cGUge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2RlbW9fdHlwZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZGVtb190eXBlKHR5cGU6IERlbW9UeXBlKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybignc2V0IGRlbW9fdHlwZSByZXR1cm5zIGEgdmFsdWUsIGlzIHRoaXMgbmVlZGVkPycpO1xuICAgICAgICBpZiAoICFbICd2aWRlbycsICdhbmltYXRpb24nIF0uaW5jbHVkZXModHlwZSkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYENvbmZpZyBkZW1vX3R5cGUgc2V0dGVyLCBiYWQgdHlwZSA9ICR7dHlwZX0sIGNhbiBiZSBlaXRoZXIgdmlkZW8gb3IgYW5pbWF0aW9uYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXQoJ2RlbW9fdHlwZScsIHR5cGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldCBlcnJvcnNfcGxheXJhdGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdlcnJvcnNfcGxheXJhdGUnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGVycm9yc19wbGF5cmF0ZShzcGVlZDogbnVtYmVyKSB7XG4gICAgICAgIGlmICggaXNOYU4oc3BlZWQpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBjb25maWcgc2V0IGVycm9yc19wbGF5cmF0ZSwgcmVjZWl2ZWQgYmFkIFwic3BlZWRcIiBOYU46ICR7c3BlZWR9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZXJyb3JzX3BsYXlyYXRlJywgc3BlZWQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBnZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnZmluaXNoZWRfdHJpYWxzX2NvdW50Jyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBmaW5pc2hlZF90cmlhbHNfY291bnQoY291bnQ6IG51bWJlcikge1xuICAgICAgICBpZiAoIGlzTmFOKGNvdW50KSB8fCBjb3VudCA8IDAgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGNvbmZpZyBzZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50LCByZWNlaXZlZCBiYWQgXCJjb3VudFwiOiAke2NvdW50fWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2ZpbmlzaGVkX3RyaWFsc19jb3VudCcsIGNvdW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ25hbWUnKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IHN1YmplY3QoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdzdWJqZWN0Jyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBzdWJqZWN0KG5hbWU6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfkr5zZXQgc3ViamVjdCgnLCBuYW1lLCAnKScpO1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ3NldCBzdWJqZWN0LCBEUllSVU4nKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldCgnc3ViamVjdCcsIG5hbWUpO1xuICAgICAgICBpZiAoIG5hbWUgKSB7XG4gICAgICAgICAgICBjb25zdCBHbG9iID0gcmVxdWlyZSgnLi4vR2xvYicpLmRlZmF1bHQ7XG4gICAgICAgICAgICBHbG9iLkJpZ0NvbmZpZy5zdWJqZWN0cyA9IFsgLi4ubmV3IFNldChbIC4uLkdsb2IuQmlnQ29uZmlnLnN1YmplY3RzLCBuYW1lIF0pIF07XG4gICAgICAgICAgICAvLyBzdXBlci5zZXQoJ3N1YmplY3RzJywgWy4uLm5ldyBTZXQoWy4uLnN1cGVyLmdldCgnc3ViamVjdHMnKSwgbmFtZV0pXSk7XG4gICAgICAgICAgICAvLyBzdXBlci5zdWJqZWN0cyA9IFsgLi4uc3VwZXIuZ2V0KCdzdWJqZWN0cycpLCBuYW1lIF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZ2V0IHRydXRoX2ZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCd0cnV0aF9maWxlJylcbiAgICB9XG4gICAgXG4gICAgLyoqQWxzbyBzZXRzIHRoaXMudHJ1dGggKG1lbW9yeSkqL1xuICAgIHNldCB0cnV0aF9maWxlKHRydXRoX2ZpbGU6IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHRydXRoID0gbmV3IFRydXRoKHRydXRoX2ZpbGUpO1xuICAgICAgICAgICAgaWYgKCAhdHJ1dGgudHh0LmFsbEV4aXN0KCkgKSB7XG4gICAgICAgICAgICAgICAgQWxlcnQuc21hbGwud2FybmluZyhgTm90IGFsbCB0eHQgZmlsZXMgZXhpc3Q6ICR7dHJ1dGhfZmlsZX1gKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50cnV0aCA9IHRydXRoO1xuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIEFsZXJ0LnNtYWxsLndhcm5pbmcoZSk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oZSlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldChgdHJ1dGhfZmlsZWAsIHRydXRoX2ZpbGUpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8qZ2V0VHJ1dGgoKTogVHJ1dGgge1xuICAgICByZXR1cm4gbmV3IFRydXRoKG15ZnMucmVtb3ZlX2V4dCh0aGlzLnRydXRoX2ZpbGUpKTtcbiAgICAgfSovXG4gICAgXG4gICAgXG4gICAgZ2V0IGxldmVscygpOiBJTGV2ZWxbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnbGV2ZWxzJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBsZXZlbHMobGV2ZWxzOiBJTGV2ZWxbXSkge1xuICAgICAgICBpZiAoICFBcnJheS5pc0FycmF5KGxldmVscykgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCBsZXZlbHMsIHJlY2VpdmVkIFwibGV2ZWxzXCIgbm90IGlzQXJyYXkuIG5vdCBzZXR0aW5nIGFueXRoaW5nLiBsZXZlbHM6IGAsIGxldmVscyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBiZXR0ZXIgY2hlY2tzXG4gICAgICAgICAgICB0aGlzLnNldCgnbGV2ZWxzJywgbGV2ZWxzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBcbiAgICBjdXJyZW50VHJpYWxDb29yZHMoKTogbnVtYmVyW10ge1xuICAgICAgICAvLyBsZXQgeyBsZXZlbHMsIGZpbmlzaGVkX3RyaWFsc19jb3VudCB9ID0gdGhpcy5jb25maWcoKTtcbiAgICAgICAgbGV0IGZsYXRUcmlhbHNMaXN0ID0gdGhpcy5sZXZlbHMubWFwKGxldmVsID0+IGxldmVsLnRyaWFscyk7XG4gICAgICAgIGZvciAoIGxldCBbIGxldmVsSW5kZXgsIHRyaWFsc051bSBdIG9mIGVudW1lcmF0ZShmbGF0VHJpYWxzTGlzdCkgKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCB0cmlhbFN1bVNvRmFyID0gc3VtKGZsYXRUcmlhbHNMaXN0LnNsaWNlKDAsIGxldmVsSW5kZXggKyAxKSk7XG4gICAgICAgICAgICBjb25zdCBmaW5pc2hlZFRyaWFsc0NvdW50ID0gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgICAgICAgICBpZiAoIHRyaWFsU3VtU29GYXIgPiBmaW5pc2hlZFRyaWFsc0NvdW50IClcbiAgICAgICAgICAgICAgICByZXR1cm4gWyBsZXZlbEluZGV4LCB0cmlhbHNOdW0gLSAodHJpYWxTdW1Tb0ZhciAtIGZpbmlzaGVkVHJpYWxzQ291bnQpIF07XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS53YXJuKFwiY3VycmVudFRyaWFsQ29vcmRzOiBvdXQgb2YgaW5kZXggZXJyb3JcIik7XG4gICAgfVxuICAgIFxuICAgIGlzRGVtb1ZpZGVvKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5kZW1vX3R5cGUgPT09ICd2aWRlbyc7XG4gICAgfVxuICAgIFxuICAgIGlzV2hvbGVUZXN0T3ZlcigpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHN1bSh0aGlzLmxldmVscy5tYXAobGV2ZWwgPT4gbGV2ZWwudHJpYWxzKSkgPT0gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgfVxuICAgIFxuICAgIGdldFN1YmplY3REaXJOYW1lcygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiBmcy5yZWFkZGlyU3luYyhTVUJKRUNUU19QQVRIX0FCUyk7XG4gICAgfVxuICAgIFxuICAgIGdldEN1cnJlbnRMZXZlbCgpOiBMZXZlbCB7XG4gICAgICAgIFxuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIHJldHVybiBuZXcgTGV2ZWwodGhpcy5sZXZlbHNbbGV2ZWxfaW5kZXhdLCBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXgpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBnZXRMZXZlbENvbGxlY3Rpb24oKTogTGV2ZWxDb2xsZWN0aW9uIHtcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICByZXR1cm4gbmV3IExldmVsQ29sbGVjdGlvbih0aGlzLmxldmVscywgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqR2V0cyB0aGUgY3VycmVudCB0cmlhbCdzIHBhdGggKGpvaW4gdGhpcy50ZXN0T3V0UGF0aCgpIGFuZCBsZXZlbF8ke2xldmVsX2luZGV4fS4uLiksIGFuZCByZXR1cm5zIGEgVHJ1dGggb2YgaXQqL1xuICAgIHRyaWFsVHJ1dGgoKTogVHJ1dGgge1xuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIC8vIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRoaXMudGVzdE91dFBhdGgoKSwgYGxldmVsXyR7bGV2ZWxfaW5kZXh9X3RyaWFsXyR7dHJpYWxfaW5kZXh9YCkpO1xuICAgICAgICByZXR1cm4gbmV3IFRydXRoKHBhdGguam9pbih0aGlzLnRlc3RPdXRQYXRoKCksIGBsZXZlbF8ke2xldmVsX2luZGV4fV90cmlhbF8ke3RyaWFsX2luZGV4fWApKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXCJjOlxcU3luY1xcQ29kZVxcUHl0aG9uXFxQeWFuby1yZWxlYXNlXFxzcmNcXGV4cGVyaW1lbnRzXFxzdWJqZWN0c1xcZ2lsYWRcXGZ1cl9lbGlzZVwiKi9cbiAgICB0ZXN0T3V0UGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBjdXJyU3ViamVjdERpciA9IHBhdGguam9pbihTVUJKRUNUU19QQVRIX0FCUywgdGhpcy5zdWJqZWN0KTsgLy8gXCIuLi4vc3ViamVjdHMvZ2lsYWRcIlxuICAgICAgICByZXR1cm4gcGF0aC5qb2luKGN1cnJTdWJqZWN0RGlyLCB0aGlzLnRydXRoLm5hbWUpO1xuICAgIH1cbiAgICBcbiAgICBcbn1cbiJdfQ==