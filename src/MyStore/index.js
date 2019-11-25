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
    constructor(name, type, subconfig) {
        const configName = MyFs_1.default.remove_ext(name);
        let defaults;
        if (util_1.bool(subconfig)) {
            if (subconfig.toObj) {
                defaults = Object.assign(Object.assign({}, subconfig.toObj()), { name: configName });
            }
            else {
                defaults = subconfig;
            }
        }
        else {
            defaults = undefined;
        }
        super({
            fileExtension: type,
            cwd: CONFIGS_PATH_ABS,
            configName,
            defaults
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
    fromObj(cfgFile) {
        if (DRYRUN)
            return console.warn('fromObj, DRYRUN. returning');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFDM0Isa0NBQTJEO0FBQzNELG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsNkJBQTZCO0FBRTdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQTZDdEMsU0FBUyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUk7SUFDakMsSUFBSyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRztRQUNwQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxZQUFZLENBQUMsQ0FBQztRQUN2QyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzdCLE9BQU8sT0FBTyxDQUFDO0tBQ2xCO1NBQU07UUFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxXQUFXLENBQUMsQ0FBQztRQUN0QyxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDN0I7QUFDTCxDQUFDO0FBRUQsTUFBYSxZQUFhLFNBQVEsS0FBaUI7SUFLL0MsWUFBWSxpQkFBaUIsR0FBRyxJQUFJO1FBQ2hDLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSyxNQUFNLEVBQUc7WUFDVixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQzlEO1FBQ0QsSUFBSSxDQUFD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cUIsQ0FBQztJQUNyRixDQUFDO0lBRUQsa0JBQWtCO1FBQ2QsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELGVBQWU7UUFFWCxJQUFJLENBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzdELE9BQU8sSUFBSSxhQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUdELGtCQUFrQjtRQUNkLElBQUksQ0FBRSxXQUFXLEVBQUUsV0FBVyxDQUFFLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDN0QsT0FBTyxJQUFJLHVCQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUlELFVBQVU7UUFDTixJQUFJLENBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTdELE9BQU8sSUFBSSxhQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsU0FBUyxXQUFXLFVBQVUsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFHRCxXQUFXO1FBQ1AsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RELENBQUM7Q0FHSjtBQTFXRCw4QkEwV0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBTdG9yZSBmcm9tIFwiZWxlY3Ryb24tc3RvcmVcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IEFsZXJ0IGZyb20gXCIuLi9NeUFsZXJ0XCI7XG5pbXBvcnQgbXlmcyBmcm9tIFwiLi4vTXlGc1wiO1xuaW1wb3J0IHsgYm9vbCwgcmVsb2FkUGFnZSwgc3VtLCBlbnVtZXJhdGUgfSBmcm9tIFwiLi4vdXRpbFwiO1xuaW1wb3J0IHsgVHJ1dGggfSBmcm9tIFwiLi4vVHJ1dGhcIjtcbmltcG9ydCB7IElMZXZlbCwgTGV2ZWwsIExldmVsQ29sbGVjdGlvbiB9IGZyb20gXCIuLi9MZXZlbFwiO1xuaW1wb3J0IHsgU3dlZXRBbGVydFJlc3VsdCB9IGZyb20gXCJzd2VldGFsZXJ0MlwiO1xuaW1wb3J0ICogYXMgQ29uZiBmcm9tICdjb25mJztcblxuY29uc29sZS5sb2coJ3NyYy9CaWdDb25maWcvaW5kZXgudHMnKTtcblxuZXhwb3J0IHR5cGUgRXhwZXJpbWVudFR5cGUgPSAnZXhhbScgfCAndGVzdCc7XG50eXBlIERlbW9UeXBlID0gJ3ZpZGVvJyB8ICdhbmltYXRpb24nO1xuZXhwb3J0IHR5cGUgUGFnZU5hbWUgPSBcIm5ld1wiIC8vIEFLQSBUTGFzdFBhZ2VcbiAgICB8IFwicnVubmluZ1wiXG4gICAgfCBcInJlY29yZFwiXG4gICAgfCBcImZpbGVfdG9vbHNcIlxuICAgIHwgXCJzZXR0aW5nc1wiXG50eXBlIERldmlhdGlvblR5cGUgPSAncmh5dGhtJyB8ICd0ZW1wbyc7XG5cblxuaW50ZXJmYWNlIElTdWJjb25maWcge1xuICAgIGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbjogc3RyaW5nLFxuICAgIGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uOiBzdHJpbmcsXG4gICAgZGVtb190eXBlOiBEZW1vVHlwZSxcbiAgICBlcnJvcnNfcGxheXJhdGU6IG51bWJlcixcbiAgICBmaW5pc2hlZF90cmlhbHNfY291bnQ6IG51bWJlcixcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgc3ViamVjdDogc3RyaW5nLFxuICAgIHRydXRoX2ZpbGU6IHN0cmluZyxcbiAgICBsZXZlbHM6IElMZXZlbFtdLFxufVxuXG5cbmludGVyZmFjZSBEZXZPcHRpb25zIHtcbiAgICBza2lwX3dob2xlX3RydXRoOiBib29sZWFuLFxuICAgIHNraXBfbGV2ZWxfaW50cm86IGJvb2xlYW4sXG4gICAgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2s6IGJvb2xlYW4sXG4gICAgc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2s6IGJvb2xlYW5cbn1cblxuaW50ZXJmYWNlIElCaWdDb25maWcge1xuICAgIGRldjogYm9vbGVhbixcbiAgICBkZXZvcHRpb25zOiBEZXZPcHRpb25zLFxuICAgIGV4YW1fZmlsZTogc3RyaW5nLFxuICAgIHRlc3RfZmlsZTogc3RyaW5nLFxuICAgIGV4cGVyaW1lbnRfdHlwZTogRXhwZXJpbWVudFR5cGUsXG4gICAgbGFzdF9wYWdlOiBQYWdlTmFtZSxcbiAgICBzdWJqZWN0czogc3RyaW5nW10sXG4gICAgdmVsb2NpdGllczogbnVtYmVyW10sXG59XG5cbmZ1bmN0aW9uIHRyeUdldEZyb21DYWNoZTxUIGV4dGVuZHMga2V5b2YgSUJpZ0NvbmZpZz4oY29uZmlnOiBCaWdDb25maWdDbHMsIHByb3A6IFQpOiBJQmlnQ29uZmlnW1RdXG5mdW5jdGlvbiB0cnlHZXRGcm9tQ2FjaGU8VCBleHRlbmRzIGtleW9mIElTdWJjb25maWc+KGNvbmZpZzogU3ViY29uZmlnLCBwcm9wOiBUKTogSVN1YmNvbmZpZ1tUXVxuZnVuY3Rpb24gdHJ5R2V0RnJvbUNhY2hlKGNvbmZpZywgcHJvcCkge1xuICAgIGlmICggY29uZmlnLmNhY2hlW3Byb3BdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgcHJvcCAke3Byb3B9IE5PVCBjYWNoZWApO1xuICAgICAgICBjb25zdCBwcm9wVmFsID0gY29uZmlnLmdldChwcm9wKTtcbiAgICAgICAgY29uZmlnLmNhY2hlW3Byb3BdID0gcHJvcFZhbDtcbiAgICAgICAgcmV0dXJuIHByb3BWYWw7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBwcm9wICR7cHJvcH0gSU4gY2FjaGVgKTtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5jYWNoZVtwcm9wXTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCaWdDb25maWdDbHMgZXh0ZW5kcyBTdG9yZTxJQmlnQ29uZmlnPiB7XG4gICAgdGVzdDogU3ViY29uZmlnO1xuICAgIGV4YW06IFN1YmNvbmZpZztcbiAgICByZWFkb25seSBjYWNoZTogUGFydGlhbDxJQmlnQ29uZmlnPjtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihfZG9UcnV0aEZpbGVDaGVjayA9IHRydWUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5jYWNoZSA9IHt9O1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0ID0gKC4uLmFyZ3MpID0+IGNvbnNvbGUud2FybihgRFJZUlVOLCBzZXQ6IGAsIGFyZ3MpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50ZXN0ID0gbmV3IFN1YmNvbmZpZyh0aGlzLnRlc3RfZmlsZSwgXCJ0ZXN0XCIpO1xuICAgICAgICB0aGlzLmV4YW0gPSBuZXcgU3ViY29uZmlnKHRoaXMuZXhhbV9maWxlLCBcImV4YW1cIik7XG4gICAgICAgIHRoaXMuc3ViamVjdHMgPSB0aGlzLnN1YmplY3RzOyAvLyB0byBlbnN1cmUgaGF2aW5nIHN1YmNvbmZpZydzIHN1YmplY3RzXG4gICAgICAgIGlmICggX2RvVHJ1dGhGaWxlQ2hlY2sgKSB7XG4gICAgICAgICAgICB0aGlzLnRlc3QuZG9UcnV0aEZpbGVDaGVjaygpXG4gICAgICAgICAgICAgICAgLnRoZW4oc3dhbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4YW0uZG9UcnV0aEZpbGVDaGVjaygpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZzogSVN1YmNvbmZpZywgZXhwZXJpbWVudFR5cGU6IEV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ0JpZ0NvbmZpZ0NscyB1c2VkIGZyb21TYXZlZENvbmZpZy4gSW1wb3NzaWJsZSB0byBsb2FkIGJpZyBmaWxlLiBSZXR1cm5pbmcnKTtcbiAgICAgICAgLyppZiAoIERSWVJVTiApIHJldHVybiBjb25zb2xlLmxvZyhgZnJvbVNhdmVkQ29uZmlnLCBEUllSVU5gKTtcbiAgICAgICAgIGNvbnN0IHRydXRoRmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKHNhdmVkQ29uZmlnLnRydXRoX2ZpbGVfcGF0aCwgJy50eHQnKTtcbiAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKHBhdGguam9pbihUUlVUSFNfUEFUSF9BQlMsIHRydXRoRmlsZU5hbWUpKTtcbiAgICAgICAgIHRoaXMuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgICB0aGlzLmNvbmZpZyhleHBlcmltZW50VHlwZSkuZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnKTsqL1xuICAgIH1cbiAgICBcbiAgICAvKnN1YmNvbmZpZ3MoKTogeyBleGFtOiBTdWJjb25maWcsIHRlc3Q6IFN1YmNvbmZpZyB9IHtcbiAgICAgY29uc3Qgc3ViY29uZmlncyA9IHtcbiAgICAgZXhhbSA6IHRoaXMuZXhhbSxcbiAgICAgdGVzdCA6IHRoaXMudGVzdFxuICAgICB9O1xuICAgICBcbiAgICAgcmV0dXJuIHN1YmNvbmZpZ3M7XG4gICAgIH0qL1xuICAgIFxuICAgIC8qY29uZmlnKHR5cGU6IEV4cGVyaW1lbnRUeXBlKTogU3ViY29uZmlnIHtcbiAgICAgXG4gICAgIHJldHVybiBuZXcgU3ViY29uZmlnKHR5cGUpO1xuICAgICB9Ki9cbiAgICBcbiAgICBcbiAgICAvKipAZXhhbXBsZVxuICAgICB1cGRhdGUoJ3N1YmplY3RzJywgW25hbWVzXSlcbiAgICAgKi9cbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywga3ZQYWlyczogUGFydGlhbDxJQmlnQ29uZmlnPilcbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywgdmFsdWVzOiBhbnlbXSlcbiAgICB1cGRhdGUoSywga3YpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdCaWdDb25maWcudXBkYXRlKCkgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBpZiAoIEFycmF5LmlzQXJyYXkoVikgKSB7XG4gICAgICAgICAgICBsZXQgbmV3VmFsdWU6IGFueVtdID0gVjtcbiAgICAgICAgICAgIGlmICggQXJyYXkuaXNBcnJheShrdikgKSB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWUucHVzaCguLi5rdik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlLnB1c2goa3YpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgbmV3VmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihWLCBrdik7XG4gICAgICAgICAgICB0aGlzLnNldChLLCBWKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXQoSyk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8vIC8qKkByZXR1cm4ge3N0cmluZ30qL1xuICAgIC8vIGdldCBzYXZlX3BhdGgoKSB7XG4gICAgLy8gXHRyZXR1cm4gdGhpcy5nZXQoJ3NhdmVfcGF0aCcpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8qKkBwYXJhbSB7c3RyaW5nfSBzYXZlUGF0aCovXG4gICAgLy8gc2V0IHNhdmVfcGF0aChzYXZlUGF0aCkge1xuICAgIC8vIFx0dGhpcy5zZXQoJ3NhdmVfcGF0aCcsIHNhdmVQYXRoKTtcbiAgICAvLyB9XG4gICAgXG4gICAgZ2V0IGxhc3RfcGFnZSgpOiBQYWdlTmFtZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnbGFzdF9wYWdlJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBsYXN0X3BhZ2UocGFnZTogUGFnZU5hbWUpIHtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHZhbGlkcGFnZXMgPSBbIFwibmV3XCIsIFwicnVubmluZ1wiLCBcInJlY29yZFwiLCBcImZpbGVfdG9vbHNcIiwgXCJzZXR0aW5nc1wiIF07XG4gICAgICAgIGlmICggIXZhbGlkcGFnZXMuaW5jbHVkZXMocGFnZSkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCBsYXN0X3BhZ2UoXCIke3BhZ2V9XCIpLCBtdXN0IGJlIG9uZSBvZiAke3ZhbGlkcGFnZXMuam9pbignLCAnKX0uIHNldHRpbmcgdG8gbmV3YCk7XG4gICAgICAgICAgICB0aGlzLnNldCgnbGFzdF9wYWdlJywgJ25ldycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xhc3RfcGFnZScsIHBhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKlVwZGF0ZXMgYGV4YW1fZmlsZWAgb3IgYHRlc3RfZmlsZWAuIEFsc28gaW5pdGlhbGl6ZXMgbmV3IFN1YmNvbmZpZy5cbiAgICAgKiBIYW5kbGVzIHdpdGggd2FybmluZ3M6ICovXG4gICAgc2V0U3ViY29uZmlnKGZpbGU6IHN0cmluZywgc3ViY2ZnVHlwZTogRXhwZXJpbWVudFR5cGUsIGRhdGE/OiBTdWJjb25maWcpIHtcbiAgICAgICAgY29uc3Qgc3ViY29uZmlnS2V5ID0gYCR7c3ViY2ZnVHlwZX1fZmlsZWAgYXMgXCJleGFtX2ZpbGVcIiB8IFwidGVzdF9maWxlXCI7XG4gICAgICAgIGlmICggdGhpcy5nZXQoc3ViY29uZmlnS2V5KSA9PT0gZmlsZSApIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oYHNldFN1YmNvbmZpZywgZmlsZSA9PT0gZXhpc3Rpbmcgb25lLmAsIHtcbiAgICAgICAgICAgICAgICBmaWxlLFxuICAgICAgICAgICAgICAgIHN1YmNmZ1R5cGUsXG4gICAgICAgICAgICAgICAgJ3RoaXNbYCR7c3ViY2ZnVHlwZX1fZmlsZWBdJyA6IHRoaXNbc3ViY29uZmlnS2V5XVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGJhc2VuYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlKTtcbiAgICAgICAgaWYgKCBmaWxlICE9PSBiYXNlbmFtZSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0ICR7c3ViY2ZnVHlwZX1fZmlsZSgke2ZpbGV9KSwgcGFzc2VkIE5PVCBhIGJhc2VuYW1lIChubyBkaXJzKS4gY29udGludWluZyB3aXRoIG9ubHkgYmFzZW5hbWVgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZSk7XG4gICAgICAgIGlmICggIWJvb2woZXh0KSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0ICR7c3ViY2ZnVHlwZX1fZmlsZSgke2ZpbGV9KSBoYXMgbm8gZXh0ZW5zaW9uLiBhZGRpbmcgLiR7c3ViY2ZnVHlwZX1gKTtcbiAgICAgICAgICAgIGJhc2VuYW1lICs9IGAuJHtzdWJjZmdUeXBlfWA7XG4gICAgICAgIH0gZWxzZSBpZiAoIGV4dCAhPT0gYC4ke3N1YmNmZ1R5cGV9YCApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0ICR7c3ViY2ZnVHlwZX1fZmlsZSgke2ZpbGV9KSBiYWQgZXh0ZW5zaW9uOiBcIiR7ZXh0fVwiLiByZXBsYWNpbmcgd2l0aCAuJHtzdWJjZmdUeXBlfWApO1xuICAgICAgICAgICAgbXlmcy5yZXBsYWNlX2V4dChiYXNlbmFtZSwgYC4ke3N1YmNmZ1R5cGV9YClcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldChzdWJjb25maWdLZXksIGJhc2VuYW1lKTtcbiAgICAgICAgdGhpc1tzdWJjZmdUeXBlXSA9IG5ldyBTdWJjb25maWcobXlmcy5yZW1vdmVfZXh0KGJhc2VuYW1lKSwgc3ViY2ZnVHlwZSwgZGF0YSlcbiAgICB9XG4gICAgXG4gICAgZ2V0U3ViY29uZmlnKCk6IFN1YmNvbmZpZyB7XG4gICAgICAgIHJldHVybiB0aGlzW3RoaXMuZXhwZXJpbWVudF90eXBlXVxuICAgIH1cbiAgICBcbiAgICBnZXQgZXhhbV9maWxlKCk6IHN0cmluZyB7XG4gICAgICAgIC8vIERvbid0IGNhY2hlOyB0aGlzLmV4YW0gaXMgYSBTdWJjb25maWdcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdleGFtX2ZpbGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqVXBkYXRlcyBleGFtX2ZpbGUgYW5kIGFsc28gaW5pdGlhbGl6ZXMgbmV3IFN1YmNvbmZpZyovXG4gICAgc2V0IGV4YW1fZmlsZShmaWxlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXRTdWJjb25maWcoZmlsZSwgXCJleGFtXCIpXG4gICAgfVxuICAgIFxuICAgIGdldCB0ZXN0X2ZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgLy8gRG9uJ3QgY2FjaGU7IHRoaXMudGVzdCBpcyBhIFN1YmNvbmZpZ1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ3Rlc3RfZmlsZScpO1xuICAgIH1cbiAgICBcbiAgICAvKipVcGRhdGVzIHRlc3RfZmlsZSBhbmQgYWxzbyBpbml0aWFsaXplcyBuZXcgU3ViY29uZmlnKi9cbiAgICBzZXQgdGVzdF9maWxlKGZpbGU6IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldFN1YmNvbmZpZyhmaWxlLCBcInRlc3RcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0IGV4cGVyaW1lbnRfdHlwZSgpOiBFeHBlcmltZW50VHlwZSB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJleHBlcmltZW50X3R5cGVcIilcbiAgICAgICAgLyppZiAoIHRoaXMuY2FjaGUuZXhwZXJpbWVudF90eXBlID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICBjb25zdCBleHBlcmltZW50VHlwZSA9IHRoaXMuZ2V0KCdleHBlcmltZW50X3R5cGUnKTtcbiAgICAgICAgIHRoaXMuY2FjaGUuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgICByZXR1cm4gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuZXhwZXJpbWVudF90eXBlO1xuICAgICAgICAgfSovXG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIHNldCBleHBlcmltZW50X3R5cGUoZXhwZXJpbWVudFR5cGU6IEV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIGlmICggZXhwZXJpbWVudFR5cGUgIT09ICd0ZXN0JyAmJiBleHBlcmltZW50VHlwZSAhPT0gJ2V4YW0nICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBCaWdDb25maWdDbHMgZXhwZXJpbWVudF90eXBlIHNldHRlciwgZ290IGV4cGVyaW1lbnRUeXBlOiAnJHtleHBlcmltZW50VHlwZX0nLiBNdXN0IGJlIGVpdGhlciAndGVzdCcgb3IgJ2V4YW0nLiBzZXR0aW5nIHRvIHRlc3RgKTtcbiAgICAgICAgICAgIGV4cGVyaW1lbnRUeXBlID0gJ3Rlc3QnO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KCdleHBlcmltZW50X3R5cGUnLCBleHBlcmltZW50VHlwZSk7XG4gICAgICAgIHRoaXMuY2FjaGUuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgZ2V0IHN1YmplY3RzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdzdWJqZWN0cycpO1xuICAgIH1cbiAgICBcbiAgICAvKipFbnN1cmVzIGhhdmluZyBgdGhpcy50ZXN0LnN1YmplY3RgIGFuZCBgdGhpcy5leGFtLnN1YmplY3RgIGluIHRoZSBsaXN0IHJlZ2FyZGxlc3MqL1xuICAgIHNldCBzdWJqZWN0cyhzdWJqZWN0TGlzdDogc3RyaW5nW10pIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdzZXQgc3ViamVjdHMsIERSWVJVTi4gcmV0dXJuaW5nJylcbiAgICAgICAgfVxuICAgICAgICBzdWJqZWN0TGlzdC5wdXNoKHRoaXMudGVzdC5zdWJqZWN0KTtcbiAgICAgICAgc3ViamVjdExpc3QucHVzaCh0aGlzLmV4YW0uc3ViamVjdCk7XG4gICAgICAgIGNvbnN0IHN1YmplY3RzID0gWyAuLi5uZXcgU2V0KHN1YmplY3RMaXN0KSBdO1xuICAgICAgICB0aGlzLnNldCgnc3ViamVjdHMnLCBzdWJqZWN0cyk7XG4gICAgICAgIGNvbnNvbGUud2FybignVGhpcyB1c2VkIHRvIG1heWJlIG51bGxpZnkgY29uZmlnLnN1YmplY3QuIERvZXNudCBkbyB0aGF0IGFueW1vcmUnKTtcbiAgICAgICAgLypjb25zdCBjb25maWcgPSB0aGlzLmNvbmZpZyh0aGlzLmV4cGVyaW1lbnRfdHlwZSk7XG4gICAgICAgICBjb25zdCBjdXJyZW50U3ViamVjdCA9IGNvbmZpZy5zdWJqZWN0O1xuICAgICAgICAgaWYgKCBjdXJyZW50U3ViamVjdCAmJiAhc3ViamVjdHMuaW5jbHVkZXMoY3VycmVudFN1YmplY3QpIClcbiAgICAgICAgIGNvbmZpZy5zdWJqZWN0ID0gbnVsbDsqL1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgY29uZmlnc1BhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdjYWxsZWQgY29uZmlnc1BhdGgsIHNob3VsZCB1c2UgQ09ORklHU19QQVRIX0FCUycpO1xuICAgICAgICByZXR1cm4gQ09ORklHU19QQVRIX0FCUztcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIHRydXRoc0RpclBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdjYWxsZWQgdHJ1dGhzRGlyUGF0aCwgc2hvdWxkIHVzZSBUUlVUSFNfUEFUSF9BQlMnKTtcbiAgICAgICAgcmV0dXJuIFRSVVRIU19QQVRIX0FCUztcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIHN1YmplY3RzRGlyUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NhbGxlZCBzdWJqZWN0c0RpclBhdGgsIHNob3VsZCB1c2UgU1VCSkVDVFNfUEFUSF9BQlMnKTtcbiAgICAgICAgcmV0dXJuIFNVQkpFQ1RTX1BBVEhfQUJTXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBzYWxhbWFuZGVyRGlyUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NhbGxlZCBzYWxhbWFuZGVyRGlyUGF0aCwgc2hvdWxkIHVzZSBTQUxBTUFOREVSX1BBVEhfQUJTJyk7XG4gICAgICAgIHJldHVybiBTQUxBTUFOREVSX1BBVEhfQUJTXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHByaXZhdGUgZ2V0IGRldigpOiB7IFtLIGluIGtleW9mIERldk9wdGlvbnNdOiAoKSA9PiBib29sZWFuIH0ge1xuICAgICAgICBjb25zdCBfZGV2ID0gdGhpcy5nZXQoJ2RldicpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2tpcF93aG9sZV90cnV0aCA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX3dob2xlX3RydXRoLFxuICAgICAgICAgICAgc2tpcF9sZXZlbF9pbnRybyA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX2xldmVsX2ludHJvLFxuICAgICAgICAgICAgc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2sgOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2ssXG4gICAgICAgICAgICBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgXG59XG5cblxuZXhwb3J0IGNsYXNzIFN1YmNvbmZpZyBleHRlbmRzIENvbmY8SVN1YmNvbmZpZz4geyAvLyBBS0EgQ29uZmlnXG4gICAgcHJpdmF0ZSByZWFkb25seSB0eXBlOiBFeHBlcmltZW50VHlwZTtcbiAgICBwcm90ZWN0ZWQgdHJ1dGg6IFRydXRoO1xuICAgIHJlYWRvbmx5IGNhY2hlOiBQYXJ0aWFsPElTdWJjb25maWc+O1xuICAgIFxuICAgIC8qcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgX0tFWVM6IChrZXlvZiBJU3ViY29uZmlnKVtdID0gW1xuICAgICAnYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uJyxcbiAgICAgJ2FsbG93ZWRfdGVtcG9fZGV2aWF0aW9uJyxcbiAgICAgJ2RlbW9fdHlwZScsXG4gICAgICdlcnJvcnNfcGxheXJhdGUnLFxuICAgICAnZmluaXNoZWRfdHJpYWxzX2NvdW50JyxcbiAgICAgJ25hbWUnLFxuICAgICAnbGV2ZWxzJyxcbiAgICAgJ3N1YmplY3QnLFxuICAgICAndHJ1dGhfZmlsZScsXG4gICAgIF07Ki9cbiAgICBcbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIHR5cGU6IEV4cGVyaW1lbnRUeXBlLCBzdWJjb25maWc/OiBTdWJjb25maWcpIHtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGNvbmZpZ05hbWUgPSBteWZzLnJlbW92ZV9leHQobmFtZSk7XG4gICAgICAgIGxldCBkZWZhdWx0cztcbiAgICAgICAgaWYgKCBib29sKHN1YmNvbmZpZykgKSB7XG4gICAgICAgICAgICBpZiAoIHN1YmNvbmZpZy50b09iaiApIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0cyA9IHsgLi4uc3ViY29uZmlnLnRvT2JqKCksIG5hbWUgOiBjb25maWdOYW1lIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRzID0gc3ViY29uZmlnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVmYXVsdHMgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgZmlsZUV4dGVuc2lvbiA6IHR5cGUsXG4gICAgICAgICAgICBjd2QgOiBDT05GSUdTX1BBVEhfQUJTLFxuICAgICAgICAgICAgY29uZmlnTmFtZSxcbiAgICAgICAgICAgIGRlZmF1bHRzXG4gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2FjaGUgPSB7fTtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy50cnV0aCA9IG5ldyBUcnV0aChteWZzLnJlbW92ZV9leHQodGhpcy50cnV0aF9maWxlKSk7XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGRvVHJ1dGhGaWxlQ2hlY2soKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5K+IFN1YmNvbmZpZygke3RoaXMudHlwZX0pLmRvVHJ1dGhGaWxlQ2hlY2soKWApO1xuICAgICAgICBcbiAgICAgICAgLy8gY29uc3QgdHJ1dGggPSB0aGlzLmdldFRydXRoKCk7XG4gICAgICAgIGlmICggdGhpcy50cnV0aC50eHQuYWxsRXhpc3QoKSApIHtcbiAgICAgICAgICAgIHJldHVybiBBbGVydC5zbWFsbC5zdWNjZXNzKGAke3RoaXMudHJ1dGgubmFtZX0udHh0LCAqX29uLnR4dCwgYW5kICpfb2ZmLnR4dCBmaWxlcyBleGlzdC5gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBbJ2Z1cl9lbGlzZV9CJyB4IDMsICdmdXJfZWxpc2VfUi50eHQnIHggMywgLi4uXVxuICAgICAgICBjb25zdCB0eHRGaWxlc0xpc3QgPSByZXF1aXJlKFwiLi4vR2xvYlwiKS5nZXRUcnV0aEZpbGVzV2hlcmUoeyBleHRlbnNpb24gOiAndHh0JyB9KS5tYXAobXlmcy5yZW1vdmVfZXh0KTtcbiAgICAgICAgY29uc3QgdHJ1dGhzV2l0aDNUeHRGaWxlcyA9IHR4dEZpbGVzTGlzdC5maWx0ZXIoYSA9PiB0eHRGaWxlc0xpc3QuZmlsdGVyKHR4dCA9PiB0eHQuc3RhcnRzV2l0aChhKSkubGVuZ3RoID49IDMpO1xuICAgICAgICBpZiAoICFib29sKHRydXRoc1dpdGgzVHh0RmlsZXMpIClcbiAgICAgICAgICAgIHJldHVybiBBbGVydC5iaWcud2FybmluZyh7XG4gICAgICAgICAgICAgICAgdGl0bGUgOiAnTm8gdmFsaWQgdHJ1dGggZmlsZXMgZm91bmQnLFxuICAgICAgICAgICAgICAgIGh0bWwgOiAnVGhlcmUgbmVlZHMgdG8gYmUgYXQgbGVhc3Qgb25lIHR4dCBmaWxlIHdpdGggMiBcIm9uXCIgYW5kIFwib2ZmXCIgY291bnRlcnBhcnRzLidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIEFsZXJ0LmJpZy5ibG9ja2luZyh7XG4gICAgICAgICAgICB0aXRsZSA6IGBEaWRuJ3QgZmluZCBhbGwgdGhyZWUgLnR4dCBmaWxlcyBmb3IgJHt0aGlzLnRydXRoLm5hbWV9YCxcbiAgICAgICAgICAgIGh0bWwgOiAnVGhlIGZvbGxvd2luZyB0cnV0aHMgYWxsIGhhdmUgMyB0eHQgZmlsZXMuIFBsZWFzZSBjaG9vc2Ugb25lIG9mIHRoZW0sIG9yIGZpeCB0aGUgZmlsZXMgYW5kIHJlbG9hZC4nLFxuICAgICAgICAgICAgc2hvd0Nsb3NlQnV0dG9uIDogdHJ1ZSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgc3RyaW5ncyA6IHRydXRoc1dpdGgzVHh0RmlsZXMsXG4gICAgICAgICAgICBjbGlja0ZuIDogZWwgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IGNvbmZpZyA9IHRoaXMuY29uZmlnKHRoaXMuZXhwZXJpbWVudF90eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxldmVscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRydXRoX2ZpbGUgPSBlbC50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKGVsLnRleHQoKSk7XG4gICAgICAgICAgICAgICAgICAgIHJlbG9hZFBhZ2UoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoICggZXJyICkge1xuICAgICAgICAgICAgICAgICAgICBBbGVydC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBBbGVydC5iaWcuZXJyb3IoeyB0aXRsZSA6IGVyci5tZXNzYWdlLCBodG1sIDogJ1NvbWV0aGluZyBoYXBwZW5lZC4nIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGluY3JlYXNlKEs6IGtleW9mIElTdWJjb25maWcpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdpbmNyZWFzZSwgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBWID09PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgMSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdHlwZW9mViA9IHR5cGVvZiBWO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgaWYgKCB0eXBlb2ZWID09PSAnbnVtYmVyJyB8fCAodHlwZW9mViA9PT0gJ3N0cmluZycgJiYgVi5pc2RpZ2l0KCkpICkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICB0aGlzLnNldChLLCBNYXRoLmZsb29yKFYpICsgMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkJpZ0NvbmZpZ0NscyB0cmllZCB0byBpbmNyZWFzZSBhIHZhbHVlIHRoYXQgaXMgbm90IGEgbnVtYmVyIG5vciBhIHN0cmluZy5pc2RpZ2l0KClcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHRvT2JqKCk6IE9taXQ8SVN1YmNvbmZpZywgXCJuYW1lXCI+IHsgLy8gQUtBIHRvU2F2ZWRDb25maWdcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gOiB0aGlzLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbixcbiAgICAgICAgICAgIGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uIDogdGhpcy5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbixcbiAgICAgICAgICAgIGRlbW9fdHlwZSA6IHRoaXMuZGVtb190eXBlLFxuICAgICAgICAgICAgZXJyb3JzX3BsYXlyYXRlIDogdGhpcy5lcnJvcnNfcGxheXJhdGUsXG4gICAgICAgICAgICBmaW5pc2hlZF90cmlhbHNfY291bnQgOiB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudCxcbiAgICAgICAgICAgIGxldmVscyA6IHRoaXMubGV2ZWxzLFxuICAgICAgICAgICAgc3ViamVjdCA6IHRoaXMuc3ViamVjdCxcbiAgICAgICAgICAgIHRydXRoX2ZpbGUgOiB0aGlzLnRydXRoX2ZpbGUsXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGZyb21PYmooY2ZnRmlsZTogSVN1YmNvbmZpZykge1xuICAgICAgICBpZiAoIERSWVJVTiApIHJldHVybiBjb25zb2xlLndhcm4oJ2Zyb21PYmosIERSWVJVTi4gcmV0dXJuaW5nJyk7XG4gICAgICAgIHRoaXMuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uID0gY2ZnRmlsZS5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb247XG4gICAgICAgIHRoaXMuYWxsb3dlZF90ZW1wb19kZXZpYXRpb24gPSBjZmdGaWxlLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uO1xuICAgICAgICB0aGlzLmRlbW9fdHlwZSA9IGNmZ0ZpbGUuZGVtb190eXBlO1xuICAgICAgICB0aGlzLmVycm9yc19wbGF5cmF0ZSA9IGNmZ0ZpbGUuZXJyb3JzX3BsYXlyYXRlO1xuICAgICAgICB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudCA9IGNmZ0ZpbGUuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgICAgICB0aGlzLmxldmVscyA9IGNmZ0ZpbGUubGV2ZWxzO1xuICAgICAgICB0aGlzLnN1YmplY3QgPSBjZmdGaWxlLnN1YmplY3Q7XG4gICAgICAgIHRoaXMudHJ1dGhfZmlsZSA9IGNmZ0ZpbGUudHJ1dGhfZmlsZTtcbiAgICAgICAgLy8gdGhpcy5fdXBkYXRlU2F2ZWRGaWxlKCd0cnV0aF9maWxlX3BhdGgnLCBjZmdGaWxlLnRydXRoX2ZpbGVfcGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBwcml2YXRlIF91cGRhdGVTYXZlZEZpbGUoa2V5OiBrZXlvZiBJU3ViY29uZmlnLCB2YWx1ZSkge1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ191cGRhdGVTYXZlZEZpbGUsIERSWVJVTi4gcmV0dXJuaW5nJylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdfdXBkYXRlU2F2ZWRGaWxlKCkgZG9lcyBub3RoaW5nLCByZXR1cm5pbmcnKTtcbiAgICAgICAgdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIC8qY29uc3QgY29uZiA9IG5ldyAocmVxdWlyZSgnY29uZicpKSh7XG4gICAgICAgICBjd2QgOiBDT05GSUdTX1BBVEhfQUJTLFxuICAgICAgICAgY29uZmlnTmFtZSA6IHRoaXMubmFtZSxcbiAgICAgICAgIGZpbGVFeHRlbnNpb24gOiB0aGlzLnR5cGUsXG4gICAgICAgICBzZXJpYWxpemUgOiB2YWx1ZSA9PiBKU09OLnN0cmluZ2lmeSh2YWx1ZSwgbnVsbCwgNClcbiAgICAgICAgIH0pO1xuICAgICAgICAgY29uZi5zZXQoa2V5LCB2YWx1ZSk7Ki9cbiAgICB9XG4gICAgXG4gICAgXG4gICAgcHJpdmF0ZSBzZXREZXZpYXRpb24oZGV2aWF0aW9uVHlwZTogRGV2aWF0aW9uVHlwZSwgZGV2aWF0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdHlwZW9mRGV2aWF0aW9uID0gdHlwZW9mIGRldmlhdGlvbjtcbiAgICAgICAgaWYgKCB0eXBlb2ZEZXZpYXRpb24gPT09ICdudW1iZXInICkge1xuICAgICAgICAgICAgZGV2aWF0aW9uID0gYCR7ZGV2aWF0aW9ufSVgO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXREZXZpYXRpb24gZ290IFwiZGV2aWF0aW9uXCIgdHlwZSBudW1iZXIuIGFwcGVuZGVkIFwiJVwiLiBkZXZpYXRpb24gbm93OiAke2RldmlhdGlvbn1gKTtcbiAgICAgICAgfSBlbHNlIGlmICggdHlwZW9mRGV2aWF0aW9uID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICAgIGlmICggIWRldmlhdGlvbi5lbmRzV2l0aChcIiVcIikgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXREZXZpYXRpb24gZ290IGRldmlhdGlvbiB3aXRob3V0ICUuIGFwcGVuZGVkICUuIGRldmlhdGlvbiBub3c6IFwiJHtkZXZpYXRpb259XCJgKTtcbiAgICAgICAgICAgICAgICBkZXZpYXRpb24gPSBgJHtkZXZpYXRpb259JWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldERldmlhdGlvbiwgcmVjZWl2ZWQgXCJkZXZpYXRpb25cIiBub3Qgc3RyaW5nIG5vdCBudW1iZXIuIHJldHVybmluZy4gZGV2aWF0aW9uOmAsIGRldmlhdGlvbik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpcy5zZXQoYGFsbG93ZWRfJHtkZXZpYXRpb25UeXBlfV9kZXZpYXRpb25gLCBkZXZpYXRpb24pO1xuICAgICAgICB0aGlzLmNhY2hlW2BhbGxvd2VkXyR7ZGV2aWF0aW9uVHlwZX1fZGV2aWF0aW9uYF0gPSBkZXZpYXRpb247XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiYWxsb3dlZF90ZW1wb19kZXZpYXRpb25cIilcbiAgICAgICAgLyppZiAoIHRoaXMuY2FjaGUuYWxsb3dlZF90ZW1wb19kZXZpYXRpb24gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgIGNvbnN0IGFsbG93ZWRUZW1wb0RldmlhdGlvbiA9IHRoaXMuZ2V0KCdhbGxvd2VkX3RlbXBvX2RldmlhdGlvbicpO1xuICAgICAgICAgdGhpcy5jYWNoZS5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbiA9IGFsbG93ZWRUZW1wb0RldmlhdGlvbjtcbiAgICAgICAgIHJldHVybiBhbGxvd2VkVGVtcG9EZXZpYXRpb247XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuYWxsb3dlZF90ZW1wb19kZXZpYXRpb247XG4gICAgICAgICB9Ki9cbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uKGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0RGV2aWF0aW9uKFwidGVtcG9cIiwgZGV2aWF0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0IGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uXCIpO1xuICAgICAgICAvKmlmICggdGhpcy5jYWNoZS5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgIGNvbnN0IGFsbG93ZWRSaHl0aG1EZXZpYXRpb24gPSB0aGlzLmdldCgnYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbiA9IGFsbG93ZWRSaHl0aG1EZXZpYXRpb247XG4gICAgICAgICByZXR1cm4gYWxsb3dlZFJoeXRobURldmlhdGlvbjtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb247XG4gICAgICAgICB9Ki9cbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbihkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldERldmlhdGlvbihcInJoeXRobVwiLCBkZXZpYXRpb24pO1xuICAgIH1cbiAgICBcbiAgICBnZXQgZGVtb190eXBlKCk6IERlbW9UeXBlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdkZW1vX3R5cGUnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGRlbW9fdHlwZSh0eXBlOiBEZW1vVHlwZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3NldCBkZW1vX3R5cGUgcmV0dXJucyBhIHZhbHVlLCBpcyB0aGlzIG5lZWRlZD8nKTtcbiAgICAgICAgaWYgKCAhWyAndmlkZW8nLCAnYW5pbWF0aW9uJyBdLmluY2x1ZGVzKHR5cGUpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBDb25maWcgZGVtb190eXBlIHNldHRlciwgYmFkIHR5cGUgPSAke3R5cGV9LCBjYW4gYmUgZWl0aGVyIHZpZGVvIG9yIGFuaW1hdGlvbmApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0KCdkZW1vX3R5cGUnLCB0eXBlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBnZXQgZXJyb3JzX3BsYXlyYXRlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnZXJyb3JzX3BsYXlyYXRlJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBlcnJvcnNfcGxheXJhdGUoc3BlZWQ6IG51bWJlcikge1xuICAgICAgICBpZiAoIGlzTmFOKHNwZWVkKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgY29uZmlnIHNldCBlcnJvcnNfcGxheXJhdGUsIHJlY2VpdmVkIGJhZCBcInNwZWVkXCIgTmFOOiAke3NwZWVkfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2Vycm9yc19wbGF5cmF0ZScsIHNwZWVkKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgZ2V0IGZpbmlzaGVkX3RyaWFsc19jb3VudCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2ZpbmlzaGVkX3RyaWFsc19jb3VudCcpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCBpc05hTihjb3VudCkgfHwgY291bnQgPCAwICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBjb25maWcgc2V0IGZpbmlzaGVkX3RyaWFsc19jb3VudCwgcmVjZWl2ZWQgYmFkIFwiY291bnRcIjogJHtjb3VudH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdmaW5pc2hlZF90cmlhbHNfY291bnQnLCBjb3VudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCduYW1lJyk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBzdWJqZWN0KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnc3ViamVjdCcpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgc3ViamVjdChuYW1lOiBzdHJpbmcgfCBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfwn5K+c2V0IHN1YmplY3QoJywgbmFtZSwgJyknKTtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdzZXQgc3ViamVjdCwgRFJZUlVOJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3QnLCBuYW1lKTtcbiAgICAgICAgaWYgKCBuYW1lICkge1xuICAgICAgICAgICAgY29uc3QgR2xvYiA9IHJlcXVpcmUoJy4uL0dsb2InKS5kZWZhdWx0O1xuICAgICAgICAgICAgR2xvYi5CaWdDb25maWcuc3ViamVjdHMgPSBbIC4uLm5ldyBTZXQoWyAuLi5HbG9iLkJpZ0NvbmZpZy5zdWJqZWN0cywgbmFtZSBdKSBdO1xuICAgICAgICAgICAgLy8gc3VwZXIuc2V0KCdzdWJqZWN0cycsIFsuLi5uZXcgU2V0KFsuLi5zdXBlci5nZXQoJ3N1YmplY3RzJyksIG5hbWVdKV0pO1xuICAgICAgICAgICAgLy8gc3VwZXIuc3ViamVjdHMgPSBbIC4uLnN1cGVyLmdldCgnc3ViamVjdHMnKSwgbmFtZSBdO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldCB0cnV0aF9maWxlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgndHJ1dGhfZmlsZScpXG4gICAgfVxuICAgIFxuICAgIC8qKkFsc28gc2V0cyB0aGlzLnRydXRoIChtZW1vcnkpKi9cbiAgICBzZXQgdHJ1dGhfZmlsZSh0cnV0aF9maWxlOiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCB0cnV0aCA9IG5ldyBUcnV0aCh0cnV0aF9maWxlKTtcbiAgICAgICAgICAgIGlmICggIXRydXRoLnR4dC5hbGxFeGlzdCgpICkge1xuICAgICAgICAgICAgICAgIEFsZXJ0LnNtYWxsLndhcm5pbmcoYE5vdCBhbGwgdHh0IGZpbGVzIGV4aXN0OiAke3RydXRoX2ZpbGV9YClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudHJ1dGggPSB0cnV0aDtcbiAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgICAgICBBbGVydC5zbWFsbC53YXJuaW5nKGUpO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGUpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoYHRydXRoX2ZpbGVgLCB0cnV0aF9maWxlKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICAvKmdldFRydXRoKCk6IFRydXRoIHtcbiAgICAgcmV0dXJuIG5ldyBUcnV0aChteWZzLnJlbW92ZV9leHQodGhpcy50cnV0aF9maWxlKSk7XG4gICAgIH0qL1xuICAgIFxuICAgIFxuICAgIGdldCBsZXZlbHMoKTogSUxldmVsW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2xldmVscycpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbGV2ZWxzKGxldmVsczogSUxldmVsW10pIHtcbiAgICAgICAgaWYgKCAhQXJyYXkuaXNBcnJheShsZXZlbHMpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGV2ZWxzLCByZWNlaXZlZCBcImxldmVsc1wiIG5vdCBpc0FycmF5LiBub3Qgc2V0dGluZyBhbnl0aGluZy4gbGV2ZWxzOiBgLCBsZXZlbHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVE9ETzogYmV0dGVyIGNoZWNrc1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xldmVscycsIGxldmVscyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgY3VycmVudFRyaWFsQ29vcmRzKCk6IG51bWJlcltdIHtcbiAgICAgICAgLy8gbGV0IHsgbGV2ZWxzLCBmaW5pc2hlZF90cmlhbHNfY291bnQgfSA9IHRoaXMuY29uZmlnKCk7XG4gICAgICAgIGxldCBmbGF0VHJpYWxzTGlzdCA9IHRoaXMubGV2ZWxzLm1hcChsZXZlbCA9PiBsZXZlbC50cmlhbHMpO1xuICAgICAgICBmb3IgKCBsZXQgWyBsZXZlbEluZGV4LCB0cmlhbHNOdW0gXSBvZiBlbnVtZXJhdGUoZmxhdFRyaWFsc0xpc3QpICkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgdHJpYWxTdW1Tb0ZhciA9IHN1bShmbGF0VHJpYWxzTGlzdC5zbGljZSgwLCBsZXZlbEluZGV4ICsgMSkpO1xuICAgICAgICAgICAgY29uc3QgZmluaXNoZWRUcmlhbHNDb3VudCA9IHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgICAgICAgICAgaWYgKCB0cmlhbFN1bVNvRmFyID4gZmluaXNoZWRUcmlhbHNDb3VudCApXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsgbGV2ZWxJbmRleCwgdHJpYWxzTnVtIC0gKHRyaWFsU3VtU29GYXIgLSBmaW5pc2hlZFRyaWFsc0NvdW50KSBdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUud2FybihcImN1cnJlbnRUcmlhbENvb3Jkczogb3V0IG9mIGluZGV4IGVycm9yXCIpO1xuICAgIH1cbiAgICBcbiAgICBpc0RlbW9WaWRlbygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVtb190eXBlID09PSAndmlkZW8nO1xuICAgIH1cbiAgICBcbiAgICBpc1dob2xlVGVzdE92ZXIoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBzdW0odGhpcy5sZXZlbHMubWFwKGxldmVsID0+IGxldmVsLnRyaWFscykpID09IHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgIH1cbiAgICBcbiAgICBnZXRTdWJqZWN0RGlyTmFtZXMoKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gZnMucmVhZGRpclN5bmMoU1VCSkVDVFNfUEFUSF9BQlMpO1xuICAgIH1cbiAgICBcbiAgICBnZXRDdXJyZW50TGV2ZWwoKTogTGV2ZWwge1xuICAgICAgICBcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICByZXR1cm4gbmV3IExldmVsKHRoaXMubGV2ZWxzW2xldmVsX2luZGV4XSwgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0TGV2ZWxDb2xsZWN0aW9uKCk6IExldmVsQ29sbGVjdGlvbiB7XG4gICAgICAgIGxldCBbIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCBdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBMZXZlbENvbGxlY3Rpb24odGhpcy5sZXZlbHMsIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkdldHMgdGhlIGN1cnJlbnQgdHJpYWwncyBwYXRoIChqb2luIHRoaXMudGVzdE91dFBhdGgoKSBhbmQgbGV2ZWxfJHtsZXZlbF9pbmRleH0uLi4pLCBhbmQgcmV0dXJucyBhIFRydXRoIG9mIGl0Ki9cbiAgICB0cmlhbFRydXRoKCk6IFRydXRoIHtcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICAvLyByZXR1cm4gbmV3IFRydXRoKHBhdGguam9pbih0aGlzLnRlc3RPdXRQYXRoKCksIGBsZXZlbF8ke2xldmVsX2luZGV4fV90cmlhbF8ke3RyaWFsX2luZGV4fWApKTtcbiAgICAgICAgcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odGhpcy50ZXN0T3V0UGF0aCgpLCBgbGV2ZWxfJHtsZXZlbF9pbmRleH1fdHJpYWxfJHt0cmlhbF9pbmRleH1gKSk7XG4gICAgfVxuICAgIFxuICAgIC8qKlwiYzpcXFN5bmNcXENvZGVcXFB5dGhvblxcUHlhbm8tcmVsZWFzZVxcc3JjXFxleHBlcmltZW50c1xcc3ViamVjdHNcXGdpbGFkXFxmdXJfZWxpc2VcIiovXG4gICAgdGVzdE91dFBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY3VyclN1YmplY3REaXIgPSBwYXRoLmpvaW4oU1VCSkVDVFNfUEFUSF9BQlMsIHRoaXMuc3ViamVjdCk7IC8vIFwiLi4uL3N1YmplY3RzL2dpbGFkXCJcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbihjdXJyU3ViamVjdERpciwgdGhpcy50cnV0aC5uYW1lKTtcbiAgICB9XG4gICAgXG4gICAgXG59XG4iXX0=