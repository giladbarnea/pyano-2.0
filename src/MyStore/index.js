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
console.log('src/MyStore/index.ts');
class MyStore extends Store {
    constructor(_doTruthFileCheck = true) {
        super();
        if (_doTruthFileCheck)
            this._doTruthFileCheck();
        if (DRYRUN) {
            this.set = (...args) => console.warn(`DRYRUN, set: `, args);
        }
    }
    async _doTruthFileCheck() {
        console.log('💾 MyStore._doTruthFileCheck()');
        const truth = this.truth();
        if (truth.txt.allExist()) {
            return MyAlert_1.default.small.success(`All "${truth.name}" txt files exist.`);
        }
        const txtFilesList = this.truthFilesList('txt').map(MyFs_1.default.remove_ext);
        const filteredTxts = txtFilesList.filter(a => txtFilesList.filter(txt => txt.startsWith(a)).length >= 3);
        if (!util_1.bool(filteredTxts))
            return MyAlert_1.default.big.warning({
                title: 'No valid truth files found',
                html: 'There needs to be at least one txt file with 2 "on" and "off" counterparts.'
            });
        return MyAlert_1.default.big.blocking({
            title: `Truth file invalid: ${truth.name}`,
            html: '<b>Please choose one of the following valid truths:</b>',
        }, {
            strings: filteredTxts,
            clickFn: el => {
                try {
                    const config = this.config();
                    config.finished_trials_count = 0;
                    config.levels = [];
                    this.truth_file_path = new Truth_1.Truth(path.join(TRUTHS_PATH_ABS, el.text()));
                    util_1.reloadPage();
                }
                catch (err) {
                    document.getElementById('swal2-title').innerText = err.message;
                    document.getElementById('swal2-content').style.display = 'none';
                    document.querySelector('.swal2-icon swal2-warning').style.display = 'inherit';
                    throw err;
                }
            }
        });
    }
    fromSavedConfig(savedConfig, experimentType) {
        if (DRYRUN)
            return;
        const truthFileName = path.basename(savedConfig.truth_file_path, '.txt');
        this.truth_file_path = new Truth_1.Truth(path.join(TRUTHS_PATH_ABS, truthFileName));
        this.experiment_type = experimentType;
        this.config().fromSavedConfig(savedConfig);
    }
    config(type) {
        if (type)
            return new Subconfig(type);
        else
            return new Subconfig(this.experiment_type);
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
                console.warn("MyStore tried to increase a value that is not a number nor a string.isdigit()");
            }
        }
    }
    truth() {
        const truthsDirPath = TRUTHS_PATH_ABS;
        const truthFileName = path.basename(this.truth_file_path, '.txt');
        return new Truth_1.Truth(path.join(truthsDirPath, truthFileName));
    }
    set truth_file_path(truth) {
        if (truth.txt.allExist()) {
            this.set(`truth_file_path`, `experiments/truths/${truth.txt.base.name}`);
        }
        else {
            throw new Error(`Not all txt files of truth exist: ${truth.txt.base.name}`);
        }
    }
    get truth_file_path() {
        return this.get('truth_file_path');
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
    get experiment_type() {
        return this.get('experiment_type');
    }
    set experiment_type(experimentType) {
        if (experimentType !== 'test' && experimentType !== 'exam') {
            console.warn(`MyStore experiment_type setter, got experimentType: '${experimentType}'. Must be either 'test' or 'exam'. setting to test`);
            this.set('experiment_type', 'test');
        }
        else {
            this.set('experiment_type', experimentType);
        }
    }
    set subjects(subjectList) {
        if (DRYRUN)
            return;
        const subjects = [...new Set(subjectList)];
        console.log('💾 set subjects:', subjects);
        this.set('subjects', subjects);
        const config = this.config();
        const currentSubject = config.current_subject;
        if (currentSubject && !subjects.includes(currentSubject))
            config.current_subject = null;
    }
    configsPath() {
        console.warn('called configsPath, should use CONFIGS_PATH_ABS');
        return CONFIGS_PATH_ABS;
    }
    truthsDirPath() {
        console.warn('called truthsDirPath, should use TRUTHS_PATH_ABS');
        return TRUTHS_PATH_ABS;
    }
    truthFilesList(extFilter) {
        if (extFilter) {
            if (extFilter.startsWith('.'))
                extFilter = extFilter.slice(1);
            if (!['txt', 'mid', 'mp4'].includes(extFilter)) {
                console.warn(`truthFilesList("${extFilter}"), must be either ['txt','mid','mp4'] or not at all. setting to undefined`);
                extFilter = undefined;
            }
        }
        let truthFiles = [...new Set(fs.readdirSync(TRUTHS_PATH_ABS))];
        if (util_1.bool(extFilter))
            return truthFiles.filter(f => path.extname(f) == `.${extFilter}`);
        return truthFiles;
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
exports.MyStore = MyStore;
class Subconfig extends MyStore {
    constructor(type) {
        super(false);
        this.type = type;
    }
    toSavedConfig() {
        const self = super.get(`current_${this.type}`);
        self.delete('save_path');
        const savedConfig = Object.assign(Object.assign({}, self), { truth_file_path: super.truth_file_path });
        console.warn('savedConfig, check if deleted save_path:', self);
        return savedConfig;
    }
    fromSavedConfig(savedConfig, ...args) {
        if (DRYRUN)
            return console.warn('fromSavedConfig, DRYRUN');
        this.levels = savedConfig.levels;
        this.finished_trials_count = savedConfig.finished_trials_count;
        this.errors_playingspeed = savedConfig.errors_playingspeed;
        this.demo_type = savedConfig.demo_type;
        this.current_subject = savedConfig.current_subject;
        this.allowed_tempo_deviation = savedConfig.allowed_tempo_deviation;
        this.allowed_rhythm_deviation = savedConfig.allowed_rhythm_deviation;
        this._updateSavedFile('truth_file_path', savedConfig.truth_file_path);
    }
    _updateSavedFile(key, value) {
        const conf = new (require('conf'))({
            cwd: path.dirname(path.join(ROOT_PATH_ABS, this.save_path)),
            configName: MyFs_1.default.remove_ext(path.basename(this.save_path)),
            fileExtension: this.type,
            serialize: value => JSON.stringify(value, null, 4)
        });
        console.log(`💾 _updateSavedFile(key,value), DRYRUN: ${DRYRUN}`, { key, value, conf });
        if (!DRYRUN)
            conf.set(key, value);
    }
    _get(key) {
        return super.get(`current_${this.type}.${key}`);
    }
    _set(key, value) {
        if (DRYRUN) {
            console.warn(`_set(${key}, ${value}) but DRYRUN`);
            return;
        }
        const typeofKey = typeof key;
        if (typeofKey === 'string') {
            if (!Subconfig._KEYS.includes(key)) {
                console.warn(`Subconfig(${this.type})._set: "key" ("${key}") is string but not in this._KEYS`);
                return;
            }
            const superkey = `current_${this.type}.${key}`;
            super.set(superkey, value);
            if (key !== "save_path")
                this._updateSavedFile(key, value);
            return;
        }
        console.warn(`Subconfig(${this.type})._set: "key" ("${key}") is not string. type: ${typeofKey}`);
    }
    _setDeviation(deviationType, deviation) {
        const typeofDeviation = typeof deviation;
        if (typeofDeviation === 'number') {
            deviation = `${deviation}%`;
            console.warn(`_setDeviation got "deviation" type number. appended "%". deviation now: ${deviation}`);
        }
        else if (typeofDeviation === 'string') {
            if (!deviation.endsWith("%")) {
                console.warn(`_setDeviation got deviation without %. appended %. deviation now: "${deviation}"`);
                deviation = `${deviation}%`;
            }
        }
        else {
            console.warn(`_setDeviation, received "deviation" not string not number. returning. deviation:`, deviation);
            return;
        }
        this._set(`allowed_${deviationType}_deviation`, deviation);
    }
    get allowed_tempo_deviation() {
        return this._get('allowed_tempo_deviation');
    }
    set allowed_tempo_deviation(deviation) {
        this._setDeviation("tempo", deviation);
    }
    get allowed_rhythm_deviation() {
        return this._get('allowed_rhythm_deviation');
    }
    set allowed_rhythm_deviation(deviation) {
        this._setDeviation("rhythm", deviation);
    }
    get current_subject() {
        return this._get('current_subject');
    }
    set current_subject(name) {
        console.log('💾_set current_subject(', name, ')');
        if (DRYRUN)
            return;
        this._set('current_subject', name);
        if (name)
            super.subjects = [...super.get('subjects'), name];
    }
    get errors_playingspeed() {
        return this._get('errors_playingspeed');
    }
    set errors_playingspeed(speed) {
        if (isNaN(speed)) {
            console.warn(`config set errors_playingspeed, received bad "speed" NaN: ${speed}`);
        }
        else {
            this._set('errors_playingspeed', speed);
        }
    }
    get save_path() {
        return this._get('save_path');
    }
    set save_path(savePath) {
        console.warn('set save_path returns a value, is this needed?');
        return this._set('save_path', savePath);
    }
    get demo_type() {
        return this._get('demo_type');
    }
    set demo_type(type) {
        console.warn('set demo_type returns a value, is this needed?');
        if (!['video', 'animation'].includes(type)) {
            console.warn(`Config demo_type setter, bad type = ${type}, can be either video or animation`);
        }
        else {
            return this._set('demo_type', type);
        }
    }
    get finished_trials_count() {
        return this._get('finished_trials_count');
    }
    set finished_trials_count(count) {
        this._set('finished_trials_count', count);
    }
    get levels() {
        return this._get('levels');
    }
    set levels(levels) {
        if (!Array.isArray(levels)) {
            console.warn(`set levels, received "levels" not isArray. not setting anything. levels: `, levels);
        }
        else {
            this._set('levels', levels);
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
        const currSubjectDir = path.join(SUBJECTS_PATH_ABS, this.current_subject);
        return path.join(currSubjectDir, this.truth().name);
    }
}
Subconfig._KEYS = [
    'allowed_rhythm_deviation',
    'allowed_tempo_deviation',
    'current_subject',
    'demo_type',
    'errors_playingspeed',
    'finished_trials_count',
    'levels',
    'save_path'
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFDM0Isa0NBQTJEO0FBQzNELG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBb0RwQyxNQUFhLE9BQVEsU0FBUSxLQUFlO0lBRXhDLFlBQVksaUJBQWlCLEdBQUcsSUFBSTtRQUNoQyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUssaUJBQWlCO1lBQ2xCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzdCLElBQUssTUFBTSxFQUFHO1lBQ1YsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQTtTQUM5RDtJQUNMLENBQUM7SUFHTyxLQUFLLENBQUMsaUJBQWlCO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUU5QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0IsSUFBSyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFHO1lBQ3hCLE9BQU8saUJBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsS0FBSyxDQUFDLElBQUksb0JBQW9CLENBQUMsQ0FBQztTQUN0RTtRQUNELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRSxNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFB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QVc7SUFDWCxxQkFBcUI7SUFDckIsdUJBQXVCO0lBQ3ZCLFFBQVE7SUFDUixXQUFXO0NBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFN0b3JlIGZyb20gXCJlbGVjdHJvbi1zdG9yZVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgQWxlcnQgZnJvbSBcIi4uL015QWxlcnRcIjtcbmltcG9ydCBteWZzIGZyb20gXCIuLi9NeUZzXCI7XG5pbXBvcnQgeyBib29sLCByZWxvYWRQYWdlLCBzdW0sIGVudW1lcmF0ZSB9IGZyb20gXCIuLi91dGlsXCI7XG5pbXBvcnQgeyBUcnV0aCB9IGZyb20gXCIuLi9UcnV0aFwiO1xuaW1wb3J0IHsgSUxldmVsLCBMZXZlbCwgTGV2ZWxDb2xsZWN0aW9uIH0gZnJvbSBcIi4uL0xldmVsXCI7XG5cbmNvbnNvbGUubG9nKCdzcmMvTXlTdG9yZS9pbmRleC50cycpO1xuXG50eXBlIEV4cGVyaW1lbnRUeXBlID0gJ2V4YW0nIHwgJ3Rlc3QnO1xudHlwZSBEZW1vVHlwZSA9ICd2aWRlbycgfCAnYW5pbWF0aW9uJztcbmV4cG9ydCB0eXBlIFBhZ2VOYW1lID0gXCJuZXdcIiAvLyBBS0EgVExhc3RQYWdlXG4gICAgfCBcInJ1bm5pbmdcIlxuICAgIHwgXCJyZWNvcmRcIlxuICAgIHwgXCJmaWxlX3Rvb2xzXCJcbiAgICB8IFwic2V0dGluZ3NcIlxudHlwZSBEZXZpYXRpb25UeXBlID0gJ3JoeXRobScgfCAndGVtcG8nO1xuXG5cbmludGVyZmFjZSBJU3ViY29uZmlnQmFzZSB7XG4gICAgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uOiBzdHJpbmcsXG4gICAgYWxsb3dlZF90ZW1wb19kZXZpYXRpb246IHN0cmluZyxcbiAgICBjdXJyZW50X3N1YmplY3Q6IHN0cmluZ1xuICAgIGRlbW9fdHlwZTogRGVtb1R5cGUsXG4gICAgZXJyb3JzX3BsYXlpbmdzcGVlZDogbnVtYmVyLFxuICAgIGZpbmlzaGVkX3RyaWFsc19jb3VudDogbnVtYmVyLFxuICAgIGxldmVsczogSUxldmVsW10sXG59XG5cbmludGVyZmFjZSBJU3ViY29uZmlnIGV4dGVuZHMgSVN1YmNvbmZpZ0Jhc2UgeyAvLyBBS0EgVENvbmZpZ1xuICAgICdzYXZlX3BhdGgnOiBzdHJpbmdcbn1cblxuaW50ZXJmYWNlIElTYXZlZFN1YmNvbmZpZyBleHRlbmRzIElTdWJjb25maWdCYXNlIHsgLy8gQUtBIFRTYXZlZENvbmZpZ1xuICAgICd0cnV0aF9maWxlX3BhdGgnOiBzdHJpbmdcbn1cblxuaW50ZXJmYWNlIERldk9wdGlvbnMge1xuICAgIFwic2tpcF93aG9sZV90cnV0aFwiOiBib29sZWFuLFxuICAgIFwic2tpcF9sZXZlbF9pbnRyb1wiOiBib29sZWFuLFxuICAgIFwic2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2tcIjogYm9vbGVhbixcbiAgICBcInNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrXCI6IGJvb2xlYW5cbn1cblxuaW50ZXJmYWNlIElNeVN0b3JlIHtcbiAgICAnY3VycmVudF9leGFtJzogU3ViY29uZmlnLFxuICAgICdjdXJyZW50X3Rlc3QnOiBTdWJjb25maWcsXG4gICAgJ2Rldic6IGJvb2xlYW4sXG4gICAgJ2Rldm9wdGlvbnMnOiBEZXZPcHRpb25zLFxuICAgICdleHBlcmltZW50X3R5cGUnOiBFeHBlcmltZW50VHlwZSxcbiAgICAnbGFzdF9wYWdlJzogUGFnZU5hbWUsXG4gICAgJ3Jvb3RfYWJzX3BhdGgnOiBzdHJpbmcsXG4gICAgJ3N1YmplY3RzJzogc3RyaW5nW10sXG4gICAgJ3RydXRoX2ZpbGVfcGF0aCc6IHN0cmluZyxcbiAgICAndmVsb2NpdGllcyc6IG51bWJlcltdLFxuICAgICd2aWRfc2lsZW5jZV9sZW4nOiBudW1iZXIsXG59XG5cblxuZXhwb3J0IGNsYXNzIE15U3RvcmUgZXh0ZW5kcyBTdG9yZTxJTXlTdG9yZT4ge1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKF9kb1RydXRoRmlsZUNoZWNrID0gdHJ1ZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBpZiAoIF9kb1RydXRoRmlsZUNoZWNrIClcbiAgICAgICAgICAgIHRoaXMuX2RvVHJ1dGhGaWxlQ2hlY2soKTtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICB0aGlzLnNldCA9ICguLi5hcmdzKSA9PiBjb25zb2xlLndhcm4oYERSWVJVTiwgc2V0OiBgLCBhcmdzKVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIFxuICAgIHByaXZhdGUgYXN5bmMgX2RvVHJ1dGhGaWxlQ2hlY2soKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfwn5K+IE15U3RvcmUuX2RvVHJ1dGhGaWxlQ2hlY2soKScpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdHJ1dGggPSB0aGlzLnRydXRoKCk7XG4gICAgICAgIGlmICggdHJ1dGgudHh0LmFsbEV4aXN0KCkgKSB7XG4gICAgICAgICAgICByZXR1cm4gQWxlcnQuc21hbGwuc3VjY2VzcyhgQWxsIFwiJHt0cnV0aC5uYW1lfVwiIHR4dCBmaWxlcyBleGlzdC5gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0eHRGaWxlc0xpc3QgPSB0aGlzLnRydXRoRmlsZXNMaXN0KCd0eHQnKS5tYXAobXlmcy5yZW1vdmVfZXh0KTtcbiAgICAgICAgY29uc3QgZmlsdGVyZWRUeHRzID0gdHh0RmlsZXNMaXN0LmZpbHRlcihhID0+IHR4dEZpbGVzTGlzdC5maWx0ZXIodHh0ID0+IHR4dC5zdGFydHNXaXRoKGEpKS5sZW5ndGggPj0gMyk7XG4gICAgICAgIGlmICggIWJvb2woZmlsdGVyZWRUeHRzKSApXG4gICAgICAgICAgICByZXR1cm4gQWxlcnQuYmlnLndhcm5pbmcoe1xuICAgICAgICAgICAgICAgIHRpdGxlIDogJ05vIHZhbGlkIHRydXRoIGZpbGVzIGZvdW5kJyxcbiAgICAgICAgICAgICAgICBodG1sIDogJ1RoZXJlIG5lZWRzIHRvIGJlIGF0IGxlYXN0IG9uZSB0eHQgZmlsZSB3aXRoIDIgXCJvblwiIGFuZCBcIm9mZlwiIGNvdW50ZXJwYXJ0cy4nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gQWxlcnQuYmlnLmJsb2NraW5nKHtcbiAgICAgICAgICAgIHRpdGxlIDogYFRydXRoIGZpbGUgaW52YWxpZDogJHt0cnV0aC5uYW1lfWAsXG4gICAgICAgICAgICBodG1sIDogJzxiPlBsZWFzZSBjaG9vc2Ugb25lIG9mIHRoZSBmb2xsb3dpbmcgdmFsaWQgdHJ1dGhzOjwvYj4nLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBzdHJpbmdzIDogZmlsdGVyZWRUeHRzLFxuICAgICAgICAgICAgY2xpY2tGbiA6IGVsID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmNvbmZpZygpO1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuZmluaXNoZWRfdHJpYWxzX2NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLmxldmVscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKHBhdGguam9pbihUUlVUSFNfUEFUSF9BQlMsIGVsLnRleHQoKSkpO1xuICAgICAgICAgICAgICAgICAgICByZWxvYWRQYWdlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoIGVyciApIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N3YWwyLXRpdGxlJykuaW5uZXJUZXh0ID0gZXJyLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzd2FsMi1jb250ZW50Jykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc3dhbDItaWNvbiBzd2FsMi13YXJuaW5nJykuc3R5bGUuZGlzcGxheSA9ICdpbmhlcml0JztcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnOiBJU2F2ZWRTdWJjb25maWcsIGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBpZiAoIERSWVJVTiApIHJldHVybjtcbiAgICAgICAgY29uc3QgdHJ1dGhGaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoc2F2ZWRDb25maWcudHJ1dGhfZmlsZV9wYXRoLCAnLnR4dCcpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKHBhdGguam9pbihUUlVUSFNfUEFUSF9BQlMsIHRydXRoRmlsZU5hbWUpKTtcbiAgICAgICAgdGhpcy5leHBlcmltZW50X3R5cGUgPSBleHBlcmltZW50VHlwZTtcbiAgICAgICAgdGhpcy5jb25maWcoKS5mcm9tU2F2ZWRDb25maWcoc2F2ZWRDb25maWcpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBjb25maWcodHlwZT86IEV4cGVyaW1lbnRUeXBlKTogU3ViY29uZmlnIHtcbiAgICAgICAgaWYgKCB0eXBlIClcbiAgICAgICAgICAgIHJldHVybiBuZXcgU3ViY29uZmlnKHR5cGUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gbmV3IFN1YmNvbmZpZyh0aGlzLmV4cGVyaW1lbnRfdHlwZSk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkBleGFtcGxlXG4gICAgIHVwZGF0ZSgnc3ViamVjdHMnLCBbbmFtZXNdKVxuICAgICAqL1xuICAgIHVwZGF0ZShLOiBrZXlvZiBJTXlTdG9yZSwga3ZQYWlyczogUGFydGlhbDxJTXlTdG9yZT4pXG4gICAgdXBkYXRlKEs6IGtleW9mIElNeVN0b3JlLCB2YWx1ZXM6IGFueVtdKVxuICAgIHVwZGF0ZShLLCBrdikge1xuICAgICAgICBpZiAoIERSWVJVTiApIHJldHVybjtcbiAgICAgICAgbGV0IFYgPSB0aGlzLmdldChLKTtcbiAgICAgICAgaWYgKCBBcnJheS5pc0FycmF5KFYpICkge1xuICAgICAgICAgICAgdGhpcy5zZXQoSywgWyAuLi5WLCBrdiBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oViwga3YpO1xuICAgICAgICAgICAgdGhpcy5zZXQoSywgVik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KEspO1xuICAgIH1cbiAgICBcbiAgICBpbmNyZWFzZShLOiBrZXlvZiBJTXlTdG9yZSkge1xuICAgICAgICBpZiAoIERSWVJVTiApIHJldHVybjtcbiAgICAgICAgbGV0IFYgPSB0aGlzLmdldChLKTtcbiAgICAgICAgXG4gICAgICAgIGlmICggViA9PT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuc2V0KEssIDEpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVvZlYgPSB0eXBlb2YgVjtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGlmICggdHlwZW9mViA9PT0gJ251bWJlcicgfHwgKHR5cGVvZlYgPT09ICdzdHJpbmcnICYmIFYuaXNkaWdpdCgpKSApIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoSywgTWF0aC5mbG9vcihWKSArIDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJNeVN0b3JlIHRyaWVkIHRvIGluY3JlYXNlIGEgdmFsdWUgdGhhdCBpcyBub3QgYSBudW1iZXIgbm9yIGEgc3RyaW5nLmlzZGlnaXQoKVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgdHJ1dGgoKTogVHJ1dGgge1xuICAgICAgICBjb25zdCB0cnV0aHNEaXJQYXRoID0gVFJVVEhTX1BBVEhfQUJTO1xuICAgICAgICBjb25zdCB0cnV0aEZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZSh0aGlzLnRydXRoX2ZpbGVfcGF0aCwgJy50eHQnKTtcbiAgICAgICAgcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odHJ1dGhzRGlyUGF0aCwgdHJ1dGhGaWxlTmFtZSkpO1xuICAgIH1cbiAgICBcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgc2V0IHRydXRoX2ZpbGVfcGF0aCh0cnV0aDogVHJ1dGgpIHtcbiAgICAgICAgXG4gICAgICAgIGlmICggdHJ1dGgudHh0LmFsbEV4aXN0KCkgKSB7XG4gICAgICAgICAgICB0aGlzLnNldChgdHJ1dGhfZmlsZV9wYXRoYCwgYGV4cGVyaW1lbnRzL3RydXRocy8ke3RydXRoLnR4dC5iYXNlLm5hbWV9YCk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IGFsbCB0eHQgZmlsZXMgb2YgdHJ1dGggZXhpc3Q6ICR7dHJ1dGgudHh0LmJhc2UubmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGdldCB0cnV0aF9maWxlX3BhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCd0cnV0aF9maWxlX3BhdGgnKTtcbiAgICB9XG4gICAgXG4gICAgLy8gLyoqQHJldHVybiB7c3RyaW5nfSovXG4gICAgLy8gZ2V0IHNhdmVfcGF0aCgpIHtcbiAgICAvLyBcdHJldHVybiB0aGlzLmdldCgnc2F2ZV9wYXRoJyk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gLyoqQHBhcmFtIHtzdHJpbmd9IHNhdmVQYXRoKi9cbiAgICAvLyBzZXQgc2F2ZV9wYXRoKHNhdmVQYXRoKSB7XG4gICAgLy8gXHR0aGlzLnNldCgnc2F2ZV9wYXRoJywgc2F2ZVBhdGgpO1xuICAgIC8vIH1cbiAgICBcbiAgICBnZXQgbGFzdF9wYWdlKCk6IFBhZ2VOYW1lIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdsYXN0X3BhZ2UnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGxhc3RfcGFnZShwYWdlOiBQYWdlTmFtZSkge1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdmFsaWRwYWdlcyA9IFsgXCJuZXdcIiwgXCJydW5uaW5nXCIsIFwicmVjb3JkXCIsIFwiZmlsZV90b29sc1wiLCBcInNldHRpbmdzXCIgXTtcbiAgICAgICAgaWYgKCAhdmFsaWRwYWdlcy5pbmNsdWRlcyhwYWdlKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IGxhc3RfcGFnZShcIiR7cGFnZX1cIiksIG11c3QgYmUgb25lIG9mICR7dmFsaWRwYWdlcy5qb2luKCcsICcpfS4gc2V0dGluZyB0byBuZXdgKTtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCAnbmV3Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnbGFzdF9wYWdlJywgcGFnZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IGV4cGVyaW1lbnRfdHlwZSgpOiBFeHBlcmltZW50VHlwZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnZXhwZXJpbWVudF90eXBlJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBleHBlcmltZW50X3R5cGUoZXhwZXJpbWVudFR5cGU6IEV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIGlmICggZXhwZXJpbWVudFR5cGUgIT09ICd0ZXN0JyAmJiBleHBlcmltZW50VHlwZSAhPT0gJ2V4YW0nICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBNeVN0b3JlIGV4cGVyaW1lbnRfdHlwZSBzZXR0ZXIsIGdvdCBleHBlcmltZW50VHlwZTogJyR7ZXhwZXJpbWVudFR5cGV9Jy4gTXVzdCBiZSBlaXRoZXIgJ3Rlc3QnIG9yICdleGFtJy4gc2V0dGluZyB0byB0ZXN0YCk7XG4gICAgICAgICAgICB0aGlzLnNldCgnZXhwZXJpbWVudF90eXBlJywgJ3Rlc3QnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdleHBlcmltZW50X3R5cGUnLCBleHBlcmltZW50VHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdGhpcy5fdXBkYXRlU2F2ZWRGaWxlKCdleHBlcmltZW50X3R5cGUnLCBleHBlcmltZW50VHlwZSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgc2V0IHN1YmplY3RzKHN1YmplY3RMaXN0OiBzdHJpbmdbXSkge1xuICAgICAgICBpZiAoIERSWVJVTiApIHJldHVybjtcbiAgICAgICAgY29uc3Qgc3ViamVjdHMgPSBbIC4uLm5ldyBTZXQoc3ViamVjdExpc3QpIF07XG4gICAgICAgIGNvbnNvbGUubG9nKCfwn5K+IHNldCBzdWJqZWN0czonLCBzdWJqZWN0cyk7XG4gICAgICAgIHRoaXMuc2V0KCdzdWJqZWN0cycsIHN1YmplY3RzKTtcbiAgICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5jb25maWcoKTtcbiAgICAgICAgY29uc3QgY3VycmVudFN1YmplY3QgPSBjb25maWcuY3VycmVudF9zdWJqZWN0O1xuICAgICAgICBpZiAoIGN1cnJlbnRTdWJqZWN0ICYmICFzdWJqZWN0cy5pbmNsdWRlcyhjdXJyZW50U3ViamVjdCkgKVxuICAgICAgICAgICAgY29uZmlnLmN1cnJlbnRfc3ViamVjdCA9IG51bGw7XG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBjb25maWdzUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NhbGxlZCBjb25maWdzUGF0aCwgc2hvdWxkIHVzZSBDT05GSUdTX1BBVEhfQUJTJyk7XG4gICAgICAgIHJldHVybiBDT05GSUdTX1BBVEhfQUJTO1xuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgdHJ1dGhzRGlyUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NhbGxlZCB0cnV0aHNEaXJQYXRoLCBzaG91bGQgdXNlIFRSVVRIU19QQVRIX0FCUycpO1xuICAgICAgICByZXR1cm4gVFJVVEhTX1BBVEhfQUJTO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICB0cnV0aEZpbGVzTGlzdChleHRGaWx0ZXI/OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgICAgIGlmICggZXh0RmlsdGVyICkge1xuICAgICAgICAgICAgaWYgKCBleHRGaWx0ZXIuc3RhcnRzV2l0aCgnLicpIClcbiAgICAgICAgICAgICAgICBleHRGaWx0ZXIgPSBleHRGaWx0ZXIuc2xpY2UoMSk7XG4gICAgICAgICAgICBpZiAoICFbICd0eHQnLCAnbWlkJywgJ21wNCcgXS5pbmNsdWRlcyhleHRGaWx0ZXIpICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgdHJ1dGhGaWxlc0xpc3QoXCIke2V4dEZpbHRlcn1cIiksIG11c3QgYmUgZWl0aGVyIFsndHh0JywnbWlkJywnbXA0J10gb3Igbm90IGF0IGFsbC4gc2V0dGluZyB0byB1bmRlZmluZWRgKTtcbiAgICAgICAgICAgICAgICBleHRGaWx0ZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIGNvbnN0IHRydXRoc0RpclBhdGggPSB0aGlzLnRydXRoc0RpclBhdGgoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCB0cnV0aEZpbGVzID0gWyAuLi5uZXcgU2V0KGZzLnJlYWRkaXJTeW5jKFRSVVRIU19QQVRIX0FCUykpIF07XG4gICAgICAgIGlmICggYm9vbChleHRGaWx0ZXIpIClcbiAgICAgICAgICAgIHJldHVybiB0cnV0aEZpbGVzLmZpbHRlcihmID0+IHBhdGguZXh0bmFtZShmKSA9PSBgLiR7ZXh0RmlsdGVyfWApO1xuICAgICAgICByZXR1cm4gdHJ1dGhGaWxlcztcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIHN1YmplY3RzRGlyUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NhbGxlZCBzdWJqZWN0c0RpclBhdGgsIHNob3VsZCB1c2UgU1VCSkVDVFNfUEFUSF9BQlMnKTtcbiAgICAgICAgcmV0dXJuIFNVQkpFQ1RTX1BBVEhfQUJTXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBzYWxhbWFuZGVyRGlyUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NhbGxlZCBzYWxhbWFuZGVyRGlyUGF0aCwgc2hvdWxkIHVzZSBTQUxBTUFOREVSX1BBVEhfQUJTJyk7XG4gICAgICAgIHJldHVybiBTQUxBTUFOREVSX1BBVEhfQUJTXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHByaXZhdGUgZ2V0IGRldigpOiB7IFtLIGluIGtleW9mIERldk9wdGlvbnNdOiAoKSA9PiBib29sZWFuIH0ge1xuICAgICAgICBjb25zdCBfZGV2ID0gdGhpcy5nZXQoJ2RldicpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2tpcF93aG9sZV90cnV0aCA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX3dob2xlX3RydXRoLFxuICAgICAgICAgICAgc2tpcF9sZXZlbF9pbnRybyA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX2xldmVsX2ludHJvLFxuICAgICAgICAgICAgc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2sgOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2ssXG4gICAgICAgICAgICBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgXG59XG5cblxuY2xhc3MgU3ViY29uZmlnIGV4dGVuZHMgTXlTdG9yZSB7IC8vIEFLQSBDb25maWdcbiAgICBwcml2YXRlIHJlYWRvbmx5IHR5cGU6IEV4cGVyaW1lbnRUeXBlO1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IF9LRVlTOiAoa2V5b2YgSVN1YmNvbmZpZylbXSA9IFtcbiAgICAgICAgJ2FsbG93ZWRfcmh5dGhtX2RldmlhdGlvbicsXG4gICAgICAgICdhbGxvd2VkX3RlbXBvX2RldmlhdGlvbicsXG4gICAgICAgICdjdXJyZW50X3N1YmplY3QnLFxuICAgICAgICAnZGVtb190eXBlJyxcbiAgICAgICAgJ2Vycm9yc19wbGF5aW5nc3BlZWQnLFxuICAgICAgICAnZmluaXNoZWRfdHJpYWxzX2NvdW50JyxcbiAgICAgICAgJ2xldmVscycsXG4gICAgICAgICdzYXZlX3BhdGgnXG4gICAgXTtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih0eXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBzdXBlcihmYWxzZSk7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIHRvU2F2ZWRDb25maWcoKTogSVNhdmVkU3ViY29uZmlnIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBjb25zdCBzZWxmOiBDb25mPElTdWJjb25maWc+ID0gc3VwZXIuZ2V0KGBjdXJyZW50XyR7dGhpcy50eXBlfWApO1xuICAgICAgICBzZWxmLmRlbGV0ZSgnc2F2ZV9wYXRoJyk7XG4gICAgICAgIC8vIGRlbGV0ZSBzZWxmLnNhdmVfcGF0aDtcbiAgICAgICAgY29uc3Qgc2F2ZWRDb25maWcgPSB7XG4gICAgICAgICAgICAuLi5zZWxmLFxuICAgICAgICAgICAgdHJ1dGhfZmlsZV9wYXRoIDogc3VwZXIudHJ1dGhfZmlsZV9wYXRoXG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUud2Fybignc2F2ZWRDb25maWcsIGNoZWNrIGlmIGRlbGV0ZWQgc2F2ZV9wYXRoOicsIHNlbGYpO1xuICAgICAgICByZXR1cm4gc2F2ZWRDb25maWc7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZzogSVNhdmVkU3ViY29uZmlnLCAuLi5hcmdzKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkgcmV0dXJuIGNvbnNvbGUud2FybignZnJvbVNhdmVkQ29uZmlnLCBEUllSVU4nKTtcbiAgICAgICAgdGhpcy5sZXZlbHMgPSBzYXZlZENvbmZpZy5sZXZlbHM7XG4gICAgICAgIHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50ID0gc2F2ZWRDb25maWcuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgICAgICB0aGlzLmVycm9yc19wbGF5aW5nc3BlZWQgPSBzYXZlZENvbmZpZy5lcnJvcnNfcGxheWluZ3NwZWVkO1xuICAgICAgICB0aGlzLmRlbW9fdHlwZSA9IHNhdmVkQ29uZmlnLmRlbW9fdHlwZTtcbiAgICAgICAgdGhpcy5jdXJyZW50X3N1YmplY3QgPSBzYXZlZENvbmZpZy5jdXJyZW50X3N1YmplY3Q7XG4gICAgICAgIHRoaXMuYWxsb3dlZF90ZW1wb19kZXZpYXRpb24gPSBzYXZlZENvbmZpZy5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbjtcbiAgICAgICAgdGhpcy5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gPSBzYXZlZENvbmZpZy5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb247XG4gICAgICAgIHRoaXMuX3VwZGF0ZVNhdmVkRmlsZSgndHJ1dGhfZmlsZV9wYXRoJywgc2F2ZWRDb25maWcudHJ1dGhfZmlsZV9wYXRoKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgcHJpdmF0ZSBfdXBkYXRlU2F2ZWRGaWxlKGtleToga2V5b2YgSVNhdmVkU3ViY29uZmlnLCB2YWx1ZSkge1xuICAgICAgICBjb25zdCBjb25mID0gbmV3IChyZXF1aXJlKCdjb25mJykpKHtcbiAgICAgICAgICAgIGN3ZCA6IHBhdGguZGlybmFtZShwYXRoLmpvaW4oUk9PVF9QQVRIX0FCUywgdGhpcy5zYXZlX3BhdGgpKSxcbiAgICAgICAgICAgIGNvbmZpZ05hbWUgOiBteWZzLnJlbW92ZV9leHQocGF0aC5iYXNlbmFtZSh0aGlzLnNhdmVfcGF0aCkpLFxuICAgICAgICAgICAgZmlsZUV4dGVuc2lvbiA6IHRoaXMudHlwZSxcbiAgICAgICAgICAgIHNlcmlhbGl6ZSA6IHZhbHVlID0+IEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCA0KVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2coYPCfkr4gX3VwZGF0ZVNhdmVkRmlsZShrZXksdmFsdWUpLCBEUllSVU46ICR7RFJZUlVOfWAsIHsga2V5LCB2YWx1ZSwgY29uZiB9KTtcbiAgICAgICAgaWYgKCAhRFJZUlVOIClcbiAgICAgICAgICAgIGNvbmYuc2V0KGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBwcml2YXRlIF9nZXQoa2V5OiBrZXlvZiBJU3ViY29uZmlnKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIHN1cGVyLmdldChgY3VycmVudF8ke3RoaXMudHlwZX0uJHtrZXl9YCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIHByaXZhdGUgX3NldChrZXk6IGtleW9mIElTdWJjb25maWcsIHZhbHVlKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBfc2V0KCR7a2V5fSwgJHt2YWx1ZX0pIGJ1dCBEUllSVU5gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0eXBlb2ZLZXkgPSB0eXBlb2Yga2V5O1xuICAgICAgICBpZiAoIHR5cGVvZktleSA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICBpZiAoICFTdWJjb25maWcuX0tFWVMuaW5jbHVkZXMoa2V5KSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFN1YmNvbmZpZygke3RoaXMudHlwZX0pLl9zZXQ6IFwia2V5XCIgKFwiJHtrZXl9XCIpIGlzIHN0cmluZyBidXQgbm90IGluIHRoaXMuX0tFWVNgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBzdXBlcmtleSA9IGBjdXJyZW50XyR7dGhpcy50eXBlfS4ke2tleX1gO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgc3VwZXIuc2V0KHN1cGVya2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICBpZiAoIGtleSAhPT0gXCJzYXZlX3BhdGhcIiApXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2F2ZWRGaWxlKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLndhcm4oYFN1YmNvbmZpZygke3RoaXMudHlwZX0pLl9zZXQ6IFwia2V5XCIgKFwiJHtrZXl9XCIpIGlzIG5vdCBzdHJpbmcuIHR5cGU6ICR7dHlwZW9mS2V5fWApO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIF9zZXREZXZpYXRpb24oZGV2aWF0aW9uVHlwZTogRGV2aWF0aW9uVHlwZSwgZGV2aWF0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdHlwZW9mRGV2aWF0aW9uID0gdHlwZW9mIGRldmlhdGlvbjtcbiAgICAgICAgaWYgKCB0eXBlb2ZEZXZpYXRpb24gPT09ICdudW1iZXInICkge1xuICAgICAgICAgICAgZGV2aWF0aW9uID0gYCR7ZGV2aWF0aW9ufSVgO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBfc2V0RGV2aWF0aW9uIGdvdCBcImRldmlhdGlvblwiIHR5cGUgbnVtYmVyLiBhcHBlbmRlZCBcIiVcIi4gZGV2aWF0aW9uIG5vdzogJHtkZXZpYXRpb259YCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZkRldmlhdGlvbiA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICBpZiAoICFkZXZpYXRpb24uZW5kc1dpdGgoXCIlXCIpICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgX3NldERldmlhdGlvbiBnb3QgZGV2aWF0aW9uIHdpdGhvdXQgJS4gYXBwZW5kZWQgJS4gZGV2aWF0aW9uIG5vdzogXCIke2RldmlhdGlvbn1cImApO1xuICAgICAgICAgICAgICAgIGRldmlhdGlvbiA9IGAke2RldmlhdGlvbn0lYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgX3NldERldmlhdGlvbiwgcmVjZWl2ZWQgXCJkZXZpYXRpb25cIiBub3Qgc3RyaW5nIG5vdCBudW1iZXIuIHJldHVybmluZy4gZGV2aWF0aW9uOmAsIGRldmlhdGlvbik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpcy5fc2V0KGBhbGxvd2VkXyR7ZGV2aWF0aW9uVHlwZX1fZGV2aWF0aW9uYCwgZGV2aWF0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0IGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ2FsbG93ZWRfdGVtcG9fZGV2aWF0aW9uJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbihkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICB0aGlzLl9zZXREZXZpYXRpb24oXCJ0ZW1wb1wiLCBkZXZpYXRpb24pO1xuICAgIH1cbiAgICBcbiAgICBnZXQgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ2FsbG93ZWRfcmh5dGhtX2RldmlhdGlvbicpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uKGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX3NldERldmlhdGlvbihcInJoeXRobVwiLCBkZXZpYXRpb24pO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBnZXQgY3VycmVudF9zdWJqZWN0KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ2N1cnJlbnRfc3ViamVjdCcpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgY3VycmVudF9zdWJqZWN0KG5hbWU6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfkr5fc2V0IGN1cnJlbnRfc3ViamVjdCgnLCBuYW1lLCAnKScpO1xuICAgICAgICBpZiAoIERSWVJVTiApIHJldHVybjtcbiAgICAgICAgdGhpcy5fc2V0KCdjdXJyZW50X3N1YmplY3QnLCBuYW1lKTtcbiAgICAgICAgaWYgKCBuYW1lIClcbiAgICAgICAgICAgIC8vIHN1cGVyLnNldCgnc3ViamVjdHMnLCBbLi4ubmV3IFNldChbLi4uc3VwZXIuZ2V0KCdzdWJqZWN0cycpLCBuYW1lXSldKTtcbiAgICAgICAgICAgIHN1cGVyLnN1YmplY3RzID0gWyAuLi5zdXBlci5nZXQoJ3N1YmplY3RzJyksIG5hbWUgXTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IGVycm9yc19wbGF5aW5nc3BlZWQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnZXJyb3JzX3BsYXlpbmdzcGVlZCcpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZXJyb3JzX3BsYXlpbmdzcGVlZChzcGVlZDogbnVtYmVyKSB7XG4gICAgICAgIGlmICggaXNOYU4oc3BlZWQpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBjb25maWcgc2V0IGVycm9yc19wbGF5aW5nc3BlZWQsIHJlY2VpdmVkIGJhZCBcInNwZWVkXCIgTmFOOiAke3NwZWVkfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fc2V0KCdlcnJvcnNfcGxheWluZ3NwZWVkJywgc3BlZWQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBnZXQgc2F2ZV9wYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ3NhdmVfcGF0aCcpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgc2F2ZV9wYXRoKHNhdmVQYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdzZXQgc2F2ZV9wYXRoIHJldHVybnMgYSB2YWx1ZSwgaXMgdGhpcyBuZWVkZWQ/Jyk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldCgnc2F2ZV9wYXRoJywgc2F2ZVBhdGgpO1xuICAgIH1cbiAgICBcbiAgICBnZXQgZGVtb190eXBlKCk6IERlbW9UeXBlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnZGVtb190eXBlJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBkZW1vX3R5cGUodHlwZTogRGVtb1R5cGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdzZXQgZGVtb190eXBlIHJldHVybnMgYSB2YWx1ZSwgaXMgdGhpcyBuZWVkZWQ/Jyk7XG4gICAgICAgIGlmICggIVsgJ3ZpZGVvJywgJ2FuaW1hdGlvbicgXS5pbmNsdWRlcyh0eXBlKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQ29uZmlnIGRlbW9fdHlwZSBzZXR0ZXIsIGJhZCB0eXBlID0gJHt0eXBlfSwgY2FuIGJlIGVpdGhlciB2aWRlbyBvciBhbmltYXRpb25gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZXQoJ2RlbW9fdHlwZScsIHR5cGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldCBmaW5pc2hlZF90cmlhbHNfY291bnQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnZmluaXNoZWRfdHJpYWxzX2NvdW50Jyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBmaW5pc2hlZF90cmlhbHNfY291bnQoY291bnQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLl9zZXQoJ2ZpbmlzaGVkX3RyaWFsc19jb3VudCcsIGNvdW50KTtcbiAgICB9XG4gICAgXG4gICAgZ2V0IGxldmVscygpOiBJTGV2ZWxbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ2xldmVscycpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbGV2ZWxzKGxldmVsczogSUxldmVsW10pIHtcbiAgICAgICAgaWYgKCAhQXJyYXkuaXNBcnJheShsZXZlbHMpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGV2ZWxzLCByZWNlaXZlZCBcImxldmVsc1wiIG5vdCBpc0FycmF5LiBub3Qgc2V0dGluZyBhbnl0aGluZy4gbGV2ZWxzOiBgLCBsZXZlbHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fc2V0KCdsZXZlbHMnLCBsZXZlbHMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGN1cnJlbnRUcmlhbENvb3JkcygpOiBudW1iZXJbXSB7XG4gICAgICAgIC8vIGxldCB7IGxldmVscywgZmluaXNoZWRfdHJpYWxzX2NvdW50IH0gPSB0aGlzLmNvbmZpZygpO1xuICAgICAgICBsZXQgZmxhdFRyaWFsc0xpc3QgPSB0aGlzLmxldmVscy5tYXAobGV2ZWwgPT4gbGV2ZWwudHJpYWxzKTtcbiAgICAgICAgZm9yICggbGV0IFsgbGV2ZWxJbmRleCwgdHJpYWxzTnVtIF0gb2YgZW51bWVyYXRlKGZsYXRUcmlhbHNMaXN0KSApIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHRyaWFsU3VtU29GYXIgPSBzdW0oZmxhdFRyaWFsc0xpc3Quc2xpY2UoMCwgbGV2ZWxJbmRleCArIDEpKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbmlzaGVkVHJpYWxzQ291bnQgPSB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudDtcbiAgICAgICAgICAgIGlmICggdHJpYWxTdW1Tb0ZhciA+IGZpbmlzaGVkVHJpYWxzQ291bnQgKVxuICAgICAgICAgICAgICAgIHJldHVybiBbIGxldmVsSW5kZXgsIHRyaWFsc051bSAtICh0cmlhbFN1bVNvRmFyIC0gZmluaXNoZWRUcmlhbHNDb3VudCkgXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLndhcm4oXCJjdXJyZW50VHJpYWxDb29yZHM6IG91dCBvZiBpbmRleCBlcnJvclwiKTtcbiAgICB9XG4gICAgXG4gICAgaXNEZW1vVmlkZW8oKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbW9fdHlwZSA9PT0gJ3ZpZGVvJztcbiAgICB9XG4gICAgXG4gICAgaXNXaG9sZVRlc3RPdmVyKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gc3VtKHRoaXMubGV2ZWxzLm1hcChsZXZlbCA9PiBsZXZlbC50cmlhbHMpKSA9PSB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudDtcbiAgICB9XG4gICAgXG4gICAgZ2V0U3ViamVjdERpck5hbWVzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIGZzLnJlYWRkaXJTeW5jKFNVQkpFQ1RTX1BBVEhfQUJTKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0Q3VycmVudExldmVsKCk6IExldmVsIHtcbiAgICAgICAgXG4gICAgICAgIGxldCBbIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCBdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBMZXZlbCh0aGlzLmxldmVsc1tsZXZlbF9pbmRleF0sIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldExldmVsQ29sbGVjdGlvbigpOiBMZXZlbENvbGxlY3Rpb24ge1xuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIHJldHVybiBuZXcgTGV2ZWxDb2xsZWN0aW9uKHRoaXMubGV2ZWxzLCBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXgpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipHZXRzIHRoZSBjdXJyZW50IHRyaWFsJ3MgcGF0aCAoam9pbiB0aGlzLnRlc3RPdXRQYXRoKCkgYW5kIGxldmVsXyR7bGV2ZWxfaW5kZXh9Li4uKSwgYW5kIHJldHVybnMgYSBUcnV0aCBvZiBpdCovXG4gICAgdHJpYWxUcnV0aCgpOiBUcnV0aCB7XG4gICAgICAgIGxldCBbIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCBdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgLy8gcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odGhpcy50ZXN0T3V0UGF0aCgpLCBgbGV2ZWxfJHtsZXZlbF9pbmRleH1fdHJpYWxfJHt0cmlhbF9pbmRleH1gKSk7XG4gICAgICAgIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRoaXMudGVzdE91dFBhdGgoKSwgYGxldmVsXyR7bGV2ZWxfaW5kZXh9X3RyaWFsXyR7dHJpYWxfaW5kZXh9YCkpO1xuICAgIH1cbiAgICBcbiAgICAvKipcImM6XFxTeW5jXFxDb2RlXFxQeXRob25cXFB5YW5vLXJlbGVhc2VcXHNyY1xcZXhwZXJpbWVudHNcXHN1YmplY3RzXFxnaWxhZFxcZnVyX2VsaXNlXCIqL1xuICAgIHRlc3RPdXRQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGN1cnJTdWJqZWN0RGlyID0gcGF0aC5qb2luKFNVQkpFQ1RTX1BBVEhfQUJTLCB0aGlzLmN1cnJlbnRfc3ViamVjdCk7IC8vIFwiLi4uL3N1YmplY3RzL2dpbGFkXCJcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbihjdXJyU3ViamVjdERpciwgdGhpcy50cnV0aCgpLm5hbWUpO1xuICAgIH1cbiAgICBcbiAgICBcbn1cbiJdfQ==