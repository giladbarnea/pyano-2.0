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
            clickFn: async ($s) => {
                try {
                    const config = this.config();
                    config.finished_trials_count = 0;
                    config.levels = [];
                    this.truth_file_path = new Truth_1.Truth(path.join(this.truthsDirPath(), $s.text()));
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
        const truthsDirPath = this.truthsDirPath();
        const truthFileName = path.basename(savedConfig.truth_file_path, '.txt');
        this.truth_file_path = new Truth_1.Truth(path.join(truthsDirPath, truthFileName));
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
        const truthsDirPath = this.truthsDirPath();
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
    get root_abs_path() {
        console.warn('called root_abs_path, should use PATH or sysargv');
        return this.get('root_abs_path');
    }
    set subjects(subjectList) {
        const subjects = [...new Set(subjectList)];
        console.log('💾 set subjects:', subjects);
        this.set('subjects', subjects);
        const config = this.config();
        const currentSubject = config.current_subject;
        if (currentSubject && !subjects.includes(currentSubject))
            config.current_subject = null;
    }
    configsPath() {
        console.warn('called configsPath, should use PATH or sysargv');
        return path.join(this.root_abs_path, 'experiments', 'configs');
    }
    truthsDirPath() {
        console.warn('called truthsDirPath, should use PATH or sysargv');
        return path.join(this.root_abs_path, 'experiments', 'truths');
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
        const truthsDirPath = this.truthsDirPath();
        let truthFiles = [...new Set(fs.readdirSync(truthsDirPath))];
        if (util_1.bool(extFilter))
            return truthFiles.filter(f => path.extname(f) == `.${extFilter}`);
        return truthFiles;
    }
    subjectsDirPath() {
        console.warn('called subjectsDirPath, should use PATH or sysargv');
        return path.join(this.root_abs_path, 'experiments', 'subjects');
    }
    salamanderDirPath() {
        console.warn('called salamanderDirPath, should use PATH or sysargv');
        return path.join(this.root_abs_path, 'templates', 'Salamander/');
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
            cwd: path.dirname(path.join(super.root_abs_path, this.save_path)),
            configName: MyFs_1.default.remove_ext(path.basename(this.save_path)),
            fileExtension: this.type,
            serialize: value => JSON.stringify(value, null, 4)
        });
        console.log('💾 _updateSavedFile(key,value)', { key, value, conf });
        conf.set(key, value);
    }
    _get(key) {
        return super.get(`current_${this.type}.${key}`);
    }
    _set(key, value) {
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
        console.log('💾 set current_subject(', name, ')');
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
            console.warn(`set levels, received "levels" not isArray. levels: `, levels);
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
        return this.demo_type == 'video';
    }
    isWholeTestOver() {
        return util_1.sum(this.levels.map(level => level.trials)) == this.finished_trials_count;
    }
    getSubjectDirNames() {
        return fs.readdirSync(path.join(super.get('root_abs_path'), 'experiments', 'subjects'));
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
        const currSubjectDir = path.join(super.subjectsDirPath(), this.current_subject);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFDM0Isa0NBQTJEO0FBQzNELG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBb0RwQyxNQUFNLE9BQVEsU0FBUSxLQUFlO0lBRWpDLFlBQVksaUJBQWlCLEdBQUcsSUFBSTtRQUNoQyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUssaUJBQWlCO1lBQ2xCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBR2pDLENBQUM7SUFHTyxLQUFLLENBQUMsaUJBQWlCO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUU5QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0IsSUFBSyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFHO1lBQ3hCLE9BQU8saUJBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsS0FBSyxDQUFDLElBQUksb0JBQW9CLENBQUMsQ0FBQztTQUN0RTtRQUNELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRSxNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDekcsSUFBSyxDQUFDLFdBQUksQ0FB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QyxJQUFJLENBQUMsQ0FBQztJQUN4RCxDQUFDOztBQTNPdUIsZUFBSyxHQUF5QjtJQUNsRCwwQkFBMEI7SUFDMUIseUJBQXlCO0lBQ3pCLGlCQUFpQjtJQUNqQixXQUFXO0lBQ1gscUJBQXFCO0lBQ3JCLHVCQUF1QjtJQUN2QixRQUFRO0lBQ1IsV0FBVztDQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBTdG9yZSBmcm9tIFwiZWxlY3Ryb24tc3RvcmVcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IEFsZXJ0IGZyb20gXCIuLi9NeUFsZXJ0XCI7XG5pbXBvcnQgbXlmcyBmcm9tIFwiLi4vTXlGc1wiO1xuaW1wb3J0IHsgYm9vbCwgcmVsb2FkUGFnZSwgc3VtLCBlbnVtZXJhdGUgfSBmcm9tIFwiLi4vdXRpbFwiO1xuaW1wb3J0IHsgVHJ1dGggfSBmcm9tIFwiLi4vVHJ1dGhcIjtcbmltcG9ydCB7IElMZXZlbCwgTGV2ZWwsIExldmVsQ29sbGVjdGlvbiB9IGZyb20gXCIuLi9MZXZlbFwiO1xuXG5jb25zb2xlLmxvZygnc3JjL015U3RvcmUvaW5kZXgudHMnKTtcblxudHlwZSBFeHBlcmltZW50VHlwZSA9ICdleGFtJyB8ICd0ZXN0JztcbnR5cGUgRGVtb1R5cGUgPSAndmlkZW8nIHwgJ2FuaW1hdGlvbic7XG50eXBlIFBhZ2VOYW1lID0gXCJuZXdcIiAvLyBBS0EgVExhc3RQYWdlXG4gICAgfCBcInJ1bm5pbmdcIlxuICAgIHwgXCJyZWNvcmRcIlxuICAgIHwgXCJmaWxlX3Rvb2xzXCJcbiAgICB8IFwic2V0dGluZ3NcIlxudHlwZSBEZXZpYXRpb25UeXBlID0gJ3JoeXRobScgfCAndGVtcG8nO1xuXG5cbmludGVyZmFjZSBJU3ViY29uZmlnQmFzZSB7XG4gICAgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uOiBzdHJpbmcsXG4gICAgYWxsb3dlZF90ZW1wb19kZXZpYXRpb246IHN0cmluZyxcbiAgICBjdXJyZW50X3N1YmplY3Q6IHN0cmluZ1xuICAgIGRlbW9fdHlwZTogRGVtb1R5cGUsXG4gICAgZXJyb3JzX3BsYXlpbmdzcGVlZDogbnVtYmVyLFxuICAgIGZpbmlzaGVkX3RyaWFsc19jb3VudDogbnVtYmVyLFxuICAgIGxldmVsczogSUxldmVsW10sXG59XG5cbmludGVyZmFjZSBJU3ViY29uZmlnIGV4dGVuZHMgSVN1YmNvbmZpZ0Jhc2UgeyAvLyBBS0EgVENvbmZpZ1xuICAgICdzYXZlX3BhdGgnOiBzdHJpbmdcbn1cblxuaW50ZXJmYWNlIElTYXZlZFN1YmNvbmZpZyBleHRlbmRzIElTdWJjb25maWdCYXNlIHsgLy8gQUtBIFRTYXZlZENvbmZpZ1xuICAgICd0cnV0aF9maWxlX3BhdGgnOiBzdHJpbmdcbn1cblxuaW50ZXJmYWNlIERldk9wdGlvbnMge1xuICAgIFwic2tpcF93aG9sZV90cnV0aFwiOiBib29sZWFuLFxuICAgIFwic2tpcF9sZXZlbF9pbnRyb1wiOiBib29sZWFuLFxuICAgIFwic2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2tcIjogYm9vbGVhbixcbiAgICBcInNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrXCI6IGJvb2xlYW5cbn1cblxuaW50ZXJmYWNlIElNeVN0b3JlIHtcbiAgICAnY3VycmVudF9leGFtJzogU3ViY29uZmlnLFxuICAgICdjdXJyZW50X3Rlc3QnOiBTdWJjb25maWcsXG4gICAgJ2Rldic6IGJvb2xlYW4sXG4gICAgJ2Rldm9wdGlvbnMnOiBEZXZPcHRpb25zLFxuICAgICdleHBlcmltZW50X3R5cGUnOiBFeHBlcmltZW50VHlwZSxcbiAgICAnbGFzdF9wYWdlJzogUGFnZU5hbWUsXG4gICAgJ3Jvb3RfYWJzX3BhdGgnOiBzdHJpbmcsXG4gICAgJ3N1YmplY3RzJzogc3RyaW5nW10sXG4gICAgJ3RydXRoX2ZpbGVfcGF0aCc6IHN0cmluZyxcbiAgICAndmVsb2NpdGllcyc6IG51bWJlcltdLFxuICAgICd2aWRfc2lsZW5jZV9sZW4nOiBudW1iZXIsXG59XG5cblxuY2xhc3MgTXlTdG9yZSBleHRlbmRzIFN0b3JlPElNeVN0b3JlPiB7XG4gICAgXG4gICAgY29uc3RydWN0b3IoX2RvVHJ1dGhGaWxlQ2hlY2sgPSB0cnVlKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGlmICggX2RvVHJ1dGhGaWxlQ2hlY2sgKVxuICAgICAgICAgICAgdGhpcy5fZG9UcnV0aEZpbGVDaGVjaygpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHByaXZhdGUgYXN5bmMgX2RvVHJ1dGhGaWxlQ2hlY2soKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfwn5K+IE15U3RvcmUuX2RvVHJ1dGhGaWxlQ2hlY2soKScpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdHJ1dGggPSB0aGlzLnRydXRoKCk7XG4gICAgICAgIGlmICggdHJ1dGgudHh0LmFsbEV4aXN0KCkgKSB7XG4gICAgICAgICAgICByZXR1cm4gQWxlcnQuc21hbGwuc3VjY2VzcyhgQWxsIFwiJHt0cnV0aC5uYW1lfVwiIHR4dCBmaWxlcyBleGlzdC5gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0eHRGaWxlc0xpc3QgPSB0aGlzLnRydXRoRmlsZXNMaXN0KCd0eHQnKS5tYXAobXlmcy5yZW1vdmVfZXh0KTtcbiAgICAgICAgY29uc3QgZmlsdGVyZWRUeHRzID0gdHh0RmlsZXNMaXN0LmZpbHRlcihhID0+IHR4dEZpbGVzTGlzdC5maWx0ZXIodHh0ID0+IHR4dC5zdGFydHNXaXRoKGEpKS5sZW5ndGggPj0gMyk7XG4gICAgICAgIGlmICggIWJvb2woZmlsdGVyZWRUeHRzKSApXG4gICAgICAgICAgICByZXR1cm4gQWxlcnQuYmlnLndhcm5pbmcoe1xuICAgICAgICAgICAgICAgIHRpdGxlIDogJ05vIHZhbGlkIHRydXRoIGZpbGVzIGZvdW5kJyxcbiAgICAgICAgICAgICAgICBodG1sIDogJ1RoZXJlIG5lZWRzIHRvIGJlIGF0IGxlYXN0IG9uZSB0eHQgZmlsZSB3aXRoIDIgXCJvblwiIGFuZCBcIm9mZlwiIGNvdW50ZXJwYXJ0cy4nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gQWxlcnQuYmlnLmJsb2NraW5nKHtcbiAgICAgICAgICAgIHRpdGxlIDogYFRydXRoIGZpbGUgaW52YWxpZDogJHt0cnV0aC5uYW1lfWAsXG4gICAgICAgICAgICBodG1sIDogJzxiPlBsZWFzZSBjaG9vc2Ugb25lIG9mIHRoZSBmb2xsb3dpbmcgdmFsaWQgdHJ1dGhzOjwvYj4nLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBzdHJpbmdzIDogZmlsdGVyZWRUeHRzLFxuICAgICAgICAgICAgY2xpY2tGbiA6IGFzeW5jICRzID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmNvbmZpZygpO1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuZmluaXNoZWRfdHJpYWxzX2NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLmxldmVscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKHBhdGguam9pbih0aGlzLnRydXRoc0RpclBhdGgoKSwgJHMudGV4dCgpKSk7XG4gICAgICAgICAgICAgICAgICAgIHJlbG9hZFBhZ2UoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoICggZXJyICkge1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3dhbDItdGl0bGUnKS5pbm5lclRleHQgPSBlcnIubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N3YWwyLWNvbnRlbnQnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zd2FsMi1pY29uIHN3YWwyLXdhcm5pbmcnKS5zdHlsZS5kaXNwbGF5ID0gJ2luaGVyaXQnO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBmcm9tU2F2ZWRDb25maWcoc2F2ZWRDb25maWc6IElTYXZlZFN1YmNvbmZpZywgZXhwZXJpbWVudFR5cGU6IEV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIGNvbnN0IHRydXRoc0RpclBhdGggPSB0aGlzLnRydXRoc0RpclBhdGgoKTtcbiAgICAgICAgY29uc3QgdHJ1dGhGaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoc2F2ZWRDb25maWcudHJ1dGhfZmlsZV9wYXRoLCAnLnR4dCcpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKHBhdGguam9pbih0cnV0aHNEaXJQYXRoLCB0cnV0aEZpbGVOYW1lKSk7XG4gICAgICAgIHRoaXMuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgIHRoaXMuY29uZmlnKCkuZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgY29uZmlnKHR5cGU/OiBFeHBlcmltZW50VHlwZSk6IFN1YmNvbmZpZyB7XG4gICAgICAgIGlmICggdHlwZSApXG4gICAgICAgICAgICByZXR1cm4gbmV3IFN1YmNvbmZpZyh0eXBlKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTdWJjb25maWcodGhpcy5leHBlcmltZW50X3R5cGUpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipAZXhhbXBsZVxuICAgICB1cGRhdGUoJ3N1YmplY3RzJywgW25hbWVzXSlcbiAgICAgKi9cbiAgICB1cGRhdGUoSzoga2V5b2YgSU15U3RvcmUsIGt2UGFpcnM6IFBhcnRpYWw8SU15U3RvcmU+KVxuICAgIHVwZGF0ZShLOiBrZXlvZiBJTXlTdG9yZSwgdmFsdWVzOiBhbnlbXSlcbiAgICB1cGRhdGUoSywga3YpIHtcbiAgICAgICAgbGV0IFYgPSB0aGlzLmdldChLKTtcbiAgICAgICAgaWYgKCBBcnJheS5pc0FycmF5KFYpICkge1xuICAgICAgICAgICAgdGhpcy5zZXQoSywgWyAuLi5WLCBrdiBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oViwga3YpO1xuICAgICAgICAgICAgdGhpcy5zZXQoSywgVik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KEspO1xuICAgIH1cbiAgICBcbiAgICBpbmNyZWFzZShLOiBrZXlvZiBJTXlTdG9yZSkge1xuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBWID09PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgMSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdHlwZW9mViA9IHR5cGVvZiBWO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgaWYgKCB0eXBlb2ZWID09PSAnbnVtYmVyJyB8fCAodHlwZW9mViA9PT0gJ3N0cmluZycgJiYgVi5pc2RpZ2l0KCkpICkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICB0aGlzLnNldChLLCBNYXRoLmZsb29yKFYpICsgMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIk15U3RvcmUgdHJpZWQgdG8gaW5jcmVhc2UgYSB2YWx1ZSB0aGF0IGlzIG5vdCBhIG51bWJlciBub3IgYSBzdHJpbmcuaXNkaWdpdCgpXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICB0cnV0aCgpOiBUcnV0aCB7XG4gICAgICAgIGNvbnN0IHRydXRoc0RpclBhdGggPSB0aGlzLnRydXRoc0RpclBhdGgoKTtcbiAgICAgICAgY29uc3QgdHJ1dGhGaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUodGhpcy50cnV0aF9maWxlX3BhdGgsICcudHh0Jyk7XG4gICAgICAgIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRydXRoc0RpclBhdGgsIHRydXRoRmlsZU5hbWUpKTtcbiAgICB9XG4gICAgXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHNldCB0cnV0aF9maWxlX3BhdGgodHJ1dGg6IFRydXRoKSB7XG4gICAgICAgIFxuICAgICAgICBpZiAoIHRydXRoLnR4dC5hbGxFeGlzdCgpICkge1xuICAgICAgICAgICAgdGhpcy5zZXQoYHRydXRoX2ZpbGVfcGF0aGAsIGBleHBlcmltZW50cy90cnV0aHMvJHt0cnV0aC50eHQuYmFzZS5uYW1lfWApO1xuICAgICAgICAgICAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vdCBhbGwgdHh0IGZpbGVzIG9mIHRydXRoIGV4aXN0OiAke3RydXRoLnR4dC5iYXNlLm5hbWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBnZXQgdHJ1dGhfZmlsZV9wYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgndHJ1dGhfZmlsZV9wYXRoJyk7XG4gICAgfVxuICAgIFxuICAgIC8vIC8qKkByZXR1cm4ge3N0cmluZ30qL1xuICAgIC8vIGdldCBzYXZlX3BhdGgoKSB7XG4gICAgLy8gXHRyZXR1cm4gdGhpcy5nZXQoJ3NhdmVfcGF0aCcpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8qKkBwYXJhbSB7c3RyaW5nfSBzYXZlUGF0aCovXG4gICAgLy8gc2V0IHNhdmVfcGF0aChzYXZlUGF0aCkge1xuICAgIC8vIFx0dGhpcy5zZXQoJ3NhdmVfcGF0aCcsIHNhdmVQYXRoKTtcbiAgICAvLyB9XG4gICAgXG4gICAgZ2V0IGxhc3RfcGFnZSgpOiBQYWdlTmFtZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnbGFzdF9wYWdlJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBsYXN0X3BhZ2UocGFnZTogUGFnZU5hbWUpIHtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHZhbGlkcGFnZXMgPSBbIFwibmV3XCIsIFwicnVubmluZ1wiLCBcInJlY29yZFwiLCBcImZpbGVfdG9vbHNcIiwgXCJzZXR0aW5nc1wiIF07XG4gICAgICAgIGlmICggIXZhbGlkcGFnZXMuaW5jbHVkZXMocGFnZSkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCBsYXN0X3BhZ2UoXCIke3BhZ2V9XCIpLCBtdXN0IGJlIG9uZSBvZiAke3ZhbGlkcGFnZXMuam9pbignLCAnKX0uIHNldHRpbmcgdG8gbmV3YCk7XG4gICAgICAgICAgICB0aGlzLnNldCgnbGFzdF9wYWdlJywgJ25ldycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xhc3RfcGFnZScsIHBhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBleHBlcmltZW50X3R5cGUoKTogRXhwZXJpbWVudFR5cGUge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2V4cGVyaW1lbnRfdHlwZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZXhwZXJpbWVudF90eXBlKGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBpZiAoIGV4cGVyaW1lbnRUeXBlICE9PSAndGVzdCcgJiYgZXhwZXJpbWVudFR5cGUgIT09ICdleGFtJyApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgTXlTdG9yZSBleHBlcmltZW50X3R5cGUgc2V0dGVyLCBnb3QgZXhwZXJpbWVudFR5cGU6ICcke2V4cGVyaW1lbnRUeXBlfScuIE11c3QgYmUgZWl0aGVyICd0ZXN0JyBvciAnZXhhbScuIHNldHRpbmcgdG8gdGVzdGApO1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2V4cGVyaW1lbnRfdHlwZScsICd0ZXN0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZXhwZXJpbWVudF90eXBlJywgZXhwZXJpbWVudFR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHRoaXMuX3VwZGF0ZVNhdmVkRmlsZSgnZXhwZXJpbWVudF90eXBlJywgZXhwZXJpbWVudFR5cGUpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCByb290X2Fic19wYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnNvbGUud2FybignY2FsbGVkIHJvb3RfYWJzX3BhdGgsIHNob3VsZCB1c2UgUEFUSCBvciBzeXNhcmd2Jyk7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgncm9vdF9hYnNfcGF0aCcpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgc3ViamVjdHMoc3ViamVjdExpc3Q6IHN0cmluZ1tdKSB7XG4gICAgICAgIGNvbnN0IHN1YmplY3RzID0gWyAuLi5uZXcgU2V0KHN1YmplY3RMaXN0KSBdO1xuICAgICAgICBjb25zb2xlLmxvZygn8J+SviBzZXQgc3ViamVjdHM6Jywgc3ViamVjdHMpO1xuICAgICAgICB0aGlzLnNldCgnc3ViamVjdHMnLCBzdWJqZWN0cyk7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuY29uZmlnKCk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRTdWJqZWN0ID0gY29uZmlnLmN1cnJlbnRfc3ViamVjdDtcbiAgICAgICAgaWYgKCBjdXJyZW50U3ViamVjdCAmJiAhc3ViamVjdHMuaW5jbHVkZXMoY3VycmVudFN1YmplY3QpIClcbiAgICAgICAgICAgIGNvbmZpZy5jdXJyZW50X3N1YmplY3QgPSBudWxsO1xuICAgIH1cbiAgICBcbiAgICBjb25maWdzUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NhbGxlZCBjb25maWdzUGF0aCwgc2hvdWxkIHVzZSBQQVRIIG9yIHN5c2FyZ3YnKTtcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbih0aGlzLnJvb3RfYWJzX3BhdGgsICdleHBlcmltZW50cycsICdjb25maWdzJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKlwiQzpcXFN5bmNcXENvZGVcXFB5dGhvblxcUHlhbm9cXHB5YW5vXzAxXFxzcmNcXGV4cGVyaW1lbnRzXFx0cnV0aHNcIiovXG4gICAgdHJ1dGhzRGlyUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NhbGxlZCB0cnV0aHNEaXJQYXRoLCBzaG91bGQgdXNlIFBBVEggb3Igc3lzYXJndicpO1xuICAgICAgICByZXR1cm4gcGF0aC5qb2luKHRoaXMucm9vdF9hYnNfcGF0aCwgJ2V4cGVyaW1lbnRzJywgJ3RydXRocycpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICB0cnV0aEZpbGVzTGlzdChleHRGaWx0ZXI/OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgICAgIGlmICggZXh0RmlsdGVyICkge1xuICAgICAgICAgICAgaWYgKCBleHRGaWx0ZXIuc3RhcnRzV2l0aCgnLicpIClcbiAgICAgICAgICAgICAgICBleHRGaWx0ZXIgPSBleHRGaWx0ZXIuc2xpY2UoMSk7XG4gICAgICAgICAgICBpZiAoICFbICd0eHQnLCAnbWlkJywgJ21wNCcgXS5pbmNsdWRlcyhleHRGaWx0ZXIpICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgdHJ1dGhGaWxlc0xpc3QoXCIke2V4dEZpbHRlcn1cIiksIG11c3QgYmUgZWl0aGVyIFsndHh0JywnbWlkJywnbXA0J10gb3Igbm90IGF0IGFsbC4gc2V0dGluZyB0byB1bmRlZmluZWRgKTtcbiAgICAgICAgICAgICAgICBleHRGaWx0ZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHRydXRoc0RpclBhdGggPSB0aGlzLnRydXRoc0RpclBhdGgoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCB0cnV0aEZpbGVzID0gWyAuLi5uZXcgU2V0KGZzLnJlYWRkaXJTeW5jKHRydXRoc0RpclBhdGgpKSBdO1xuICAgICAgICBpZiAoIGJvb2woZXh0RmlsdGVyKSApXG4gICAgICAgICAgICByZXR1cm4gdHJ1dGhGaWxlcy5maWx0ZXIoZiA9PiBwYXRoLmV4dG5hbWUoZikgPT0gYC4ke2V4dEZpbHRlcn1gKTtcbiAgICAgICAgcmV0dXJuIHRydXRoRmlsZXM7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKiBcIkM6XFxTeW5jXFxDb2RlXFxQeXRob25cXFB5YW5vXFxweWFub18wMVxcc3JjXFxleHBlcmltZW50c1xcc3ViamVjdHNcIiovXG4gICAgc3ViamVjdHNEaXJQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnNvbGUud2FybignY2FsbGVkIHN1YmplY3RzRGlyUGF0aCwgc2hvdWxkIHVzZSBQQVRIIG9yIHN5c2FyZ3YnKTtcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbih0aGlzLnJvb3RfYWJzX3BhdGgsICdleHBlcmltZW50cycsICdzdWJqZWN0cycpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBzYWxhbWFuZGVyRGlyUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NhbGxlZCBzYWxhbWFuZGVyRGlyUGF0aCwgc2hvdWxkIHVzZSBQQVRIIG9yIHN5c2FyZ3YnKTtcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbih0aGlzLnJvb3RfYWJzX3BhdGgsICd0ZW1wbGF0ZXMnLCAnU2FsYW1hbmRlci8nKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgcHJpdmF0ZSBnZXQgZGV2KCk6IHsgW0sgaW4ga2V5b2YgRGV2T3B0aW9uc106ICgpID0+IGJvb2xlYW4gfSB7XG4gICAgICAgIGNvbnN0IF9kZXYgPSB0aGlzLmdldCgnZGV2Jyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBza2lwX3dob2xlX3RydXRoIDogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfd2hvbGVfdHJ1dGgsXG4gICAgICAgICAgICBza2lwX2xldmVsX2ludHJvIDogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfbGV2ZWxfaW50cm8sXG4gICAgICAgICAgICBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjayA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjayxcbiAgICAgICAgICAgIHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrIDogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBcbiAgICBcbn1cblxuXG5jbGFzcyBTdWJjb25maWcgZXh0ZW5kcyBNeVN0b3JlIHsgLy8gQUtBIENvbmZpZ1xuICAgIHByaXZhdGUgcmVhZG9ubHkgdHlwZTogRXhwZXJpbWVudFR5cGU7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgX0tFWVM6IChrZXlvZiBJU3ViY29uZmlnKVtdID0gW1xuICAgICAgICAnYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uJyxcbiAgICAgICAgJ2FsbG93ZWRfdGVtcG9fZGV2aWF0aW9uJyxcbiAgICAgICAgJ2N1cnJlbnRfc3ViamVjdCcsXG4gICAgICAgICdkZW1vX3R5cGUnLFxuICAgICAgICAnZXJyb3JzX3BsYXlpbmdzcGVlZCcsXG4gICAgICAgICdmaW5pc2hlZF90cmlhbHNfY291bnQnLFxuICAgICAgICAnbGV2ZWxzJyxcbiAgICAgICAgJ3NhdmVfcGF0aCdcbiAgICBdO1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKHR5cGU6IEV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIHN1cGVyKGZhbHNlKTtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgdG9TYXZlZENvbmZpZygpOiBJU2F2ZWRTdWJjb25maWcge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGNvbnN0IHNlbGY6IENvbmY8SVN1YmNvbmZpZz4gPSBzdXBlci5nZXQoYGN1cnJlbnRfJHt0aGlzLnR5cGV9YCk7XG4gICAgICAgIHNlbGYuZGVsZXRlKCdzYXZlX3BhdGgnKTtcbiAgICAgICAgLy8gZGVsZXRlIHNlbGYuc2F2ZV9wYXRoO1xuICAgICAgICBjb25zdCBzYXZlZENvbmZpZyA9IHtcbiAgICAgICAgICAgIC4uLnNlbGYsXG4gICAgICAgICAgICB0cnV0aF9maWxlX3BhdGggOiBzdXBlci50cnV0aF9maWxlX3BhdGhcbiAgICAgICAgfTtcbiAgICAgICAgY29uc29sZS53YXJuKCdzYXZlZENvbmZpZywgY2hlY2sgaWYgZGVsZXRlZCBzYXZlX3BhdGg6Jywgc2VsZik7XG4gICAgICAgIHJldHVybiBzYXZlZENvbmZpZztcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnOiBJU2F2ZWRTdWJjb25maWcsIC4uLmFyZ3MpIHtcbiAgICAgICAgdGhpcy5sZXZlbHMgPSBzYXZlZENvbmZpZy5sZXZlbHM7XG4gICAgICAgIHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50ID0gc2F2ZWRDb25maWcuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgICAgICB0aGlzLmVycm9yc19wbGF5aW5nc3BlZWQgPSBzYXZlZENvbmZpZy5lcnJvcnNfcGxheWluZ3NwZWVkO1xuICAgICAgICB0aGlzLmRlbW9fdHlwZSA9IHNhdmVkQ29uZmlnLmRlbW9fdHlwZTtcbiAgICAgICAgdGhpcy5jdXJyZW50X3N1YmplY3QgPSBzYXZlZENvbmZpZy5jdXJyZW50X3N1YmplY3Q7XG4gICAgICAgIHRoaXMuYWxsb3dlZF90ZW1wb19kZXZpYXRpb24gPSBzYXZlZENvbmZpZy5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbjtcbiAgICAgICAgdGhpcy5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gPSBzYXZlZENvbmZpZy5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb247XG4gICAgICAgIHRoaXMuX3VwZGF0ZVNhdmVkRmlsZSgndHJ1dGhfZmlsZV9wYXRoJywgc2F2ZWRDb25maWcudHJ1dGhfZmlsZV9wYXRoKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgcHJpdmF0ZSBfdXBkYXRlU2F2ZWRGaWxlKGtleToga2V5b2YgSVNhdmVkU3ViY29uZmlnLCB2YWx1ZSkge1xuICAgICAgICBjb25zdCBjb25mID0gbmV3IChyZXF1aXJlKCdjb25mJykpKHtcbiAgICAgICAgICAgIGN3ZCA6IHBhdGguZGlybmFtZShwYXRoLmpvaW4oc3VwZXIucm9vdF9hYnNfcGF0aCwgdGhpcy5zYXZlX3BhdGgpKSxcbiAgICAgICAgICAgIGNvbmZpZ05hbWUgOiBteWZzLnJlbW92ZV9leHQocGF0aC5iYXNlbmFtZSh0aGlzLnNhdmVfcGF0aCkpLFxuICAgICAgICAgICAgZmlsZUV4dGVuc2lvbiA6IHRoaXMudHlwZSxcbiAgICAgICAgICAgIHNlcmlhbGl6ZSA6IHZhbHVlID0+IEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCA0KVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfkr4gX3VwZGF0ZVNhdmVkRmlsZShrZXksdmFsdWUpJywgeyBrZXksIHZhbHVlLCBjb25mIH0pO1xuICAgICAgICBjb25mLnNldChrZXksIHZhbHVlKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgcHJpdmF0ZSBfZ2V0KGtleToga2V5b2YgSVN1YmNvbmZpZykge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBzdXBlci5nZXQoYGN1cnJlbnRfJHt0aGlzLnR5cGV9LiR7a2V5fWApO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBwcml2YXRlIF9zZXQoa2V5OiBrZXlvZiBJU3ViY29uZmlnLCB2YWx1ZSkge1xuICAgICAgICBjb25zdCB0eXBlb2ZLZXkgPSB0eXBlb2Yga2V5O1xuICAgICAgICBpZiAoIHR5cGVvZktleSA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICBpZiAoICFTdWJjb25maWcuX0tFWVMuaW5jbHVkZXMoa2V5KSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFN1YmNvbmZpZygke3RoaXMudHlwZX0pLl9zZXQ6IFwia2V5XCIgKFwiJHtrZXl9XCIpIGlzIHN0cmluZyBidXQgbm90IGluIHRoaXMuX0tFWVNgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBzdXBlcmtleSA9IGBjdXJyZW50XyR7dGhpcy50eXBlfS4ke2tleX1gO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgc3VwZXIuc2V0KHN1cGVya2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICBpZiAoIGtleSAhPT0gXCJzYXZlX3BhdGhcIiApXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2F2ZWRGaWxlKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLndhcm4oYFN1YmNvbmZpZygke3RoaXMudHlwZX0pLl9zZXQ6IFwia2V5XCIgKFwiJHtrZXl9XCIpIGlzIG5vdCBzdHJpbmcuIHR5cGU6ICR7dHlwZW9mS2V5fWApO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIF9zZXREZXZpYXRpb24oZGV2aWF0aW9uVHlwZTogRGV2aWF0aW9uVHlwZSwgZGV2aWF0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdHlwZW9mRGV2aWF0aW9uID0gdHlwZW9mIGRldmlhdGlvbjtcbiAgICAgICAgaWYgKCB0eXBlb2ZEZXZpYXRpb24gPT09ICdudW1iZXInICkge1xuICAgICAgICAgICAgZGV2aWF0aW9uID0gYCR7ZGV2aWF0aW9ufSVgO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBfc2V0RGV2aWF0aW9uIGdvdCBcImRldmlhdGlvblwiIHR5cGUgbnVtYmVyLiBhcHBlbmRlZCBcIiVcIi4gZGV2aWF0aW9uIG5vdzogJHtkZXZpYXRpb259YCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZkRldmlhdGlvbiA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICBpZiAoICFkZXZpYXRpb24uZW5kc1dpdGgoXCIlXCIpICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgX3NldERldmlhdGlvbiBnb3QgZGV2aWF0aW9uIHdpdGhvdXQgJS4gYXBwZW5kZWQgJS4gZGV2aWF0aW9uIG5vdzogXCIke2RldmlhdGlvbn1cImApO1xuICAgICAgICAgICAgICAgIGRldmlhdGlvbiA9IGAke2RldmlhdGlvbn0lYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgX3NldERldmlhdGlvbiwgcmVjZWl2ZWQgXCJkZXZpYXRpb25cIiBub3Qgc3RyaW5nIG5vdCBudW1iZXIuIHJldHVybmluZy4gZGV2aWF0aW9uOmAsIGRldmlhdGlvbik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpcy5fc2V0KGBhbGxvd2VkXyR7ZGV2aWF0aW9uVHlwZX1fZGV2aWF0aW9uYCwgZGV2aWF0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0IGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ2FsbG93ZWRfdGVtcG9fZGV2aWF0aW9uJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbihkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICB0aGlzLl9zZXREZXZpYXRpb24oXCJ0ZW1wb1wiLCBkZXZpYXRpb24pO1xuICAgIH1cbiAgICBcbiAgICBnZXQgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ2FsbG93ZWRfcmh5dGhtX2RldmlhdGlvbicpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uKGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX3NldERldmlhdGlvbihcInJoeXRobVwiLCBkZXZpYXRpb24pO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBnZXQgY3VycmVudF9zdWJqZWN0KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ2N1cnJlbnRfc3ViamVjdCcpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgY3VycmVudF9zdWJqZWN0KG5hbWU6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfkr4gc2V0IGN1cnJlbnRfc3ViamVjdCgnLCBuYW1lLCAnKScpO1xuICAgICAgICB0aGlzLl9zZXQoJ2N1cnJlbnRfc3ViamVjdCcsIG5hbWUpO1xuICAgICAgICBpZiAoIG5hbWUgKVxuICAgICAgICAgICAgLy8gc3VwZXIuc2V0KCdzdWJqZWN0cycsIFsuLi5uZXcgU2V0KFsuLi5zdXBlci5nZXQoJ3N1YmplY3RzJyksIG5hbWVdKV0pO1xuICAgICAgICAgICAgc3VwZXIuc3ViamVjdHMgPSBbIC4uLnN1cGVyLmdldCgnc3ViamVjdHMnKSwgbmFtZSBdO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBnZXQgZXJyb3JzX3BsYXlpbmdzcGVlZCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0KCdlcnJvcnNfcGxheWluZ3NwZWVkJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBlcnJvcnNfcGxheWluZ3NwZWVkKHNwZWVkOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCBpc05hTihzcGVlZCkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGNvbmZpZyBzZXQgZXJyb3JzX3BsYXlpbmdzcGVlZCwgcmVjZWl2ZWQgYmFkIFwic3BlZWRcIiBOYU46ICR7c3BlZWR9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9zZXQoJ2Vycm9yc19wbGF5aW5nc3BlZWQnLCBzcGVlZCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGdldCBzYXZlX3BhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnc2F2ZV9wYXRoJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBzYXZlX3BhdGgoc2F2ZVBhdGg6IHN0cmluZykge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3NldCBzYXZlX3BhdGggcmV0dXJucyBhIHZhbHVlLCBpcyB0aGlzIG5lZWRlZD8nKTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0KCdzYXZlX3BhdGgnLCBzYXZlUGF0aCk7XG4gICAgfVxuICAgIFxuICAgIGdldCBkZW1vX3R5cGUoKTogRGVtb1R5cGUge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0KCdkZW1vX3R5cGUnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGRlbW9fdHlwZSh0eXBlOiBEZW1vVHlwZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3NldCBkZW1vX3R5cGUgcmV0dXJucyBhIHZhbHVlLCBpcyB0aGlzIG5lZWRlZD8nKTtcbiAgICAgICAgaWYgKCAhWyAndmlkZW8nLCAnYW5pbWF0aW9uJyBdLmluY2x1ZGVzKHR5cGUpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBDb25maWcgZGVtb190eXBlIHNldHRlciwgYmFkIHR5cGUgPSAke3R5cGV9LCBjYW4gYmUgZWl0aGVyIHZpZGVvIG9yIGFuaW1hdGlvbmApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NldCgnZGVtb190eXBlJywgdHlwZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZ2V0IGZpbmlzaGVkX3RyaWFsc19jb3VudCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0KCdmaW5pc2hlZF90cmlhbHNfY291bnQnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGZpbmlzaGVkX3RyaWFsc19jb3VudChjb3VudDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuX3NldCgnZmluaXNoZWRfdHJpYWxzX2NvdW50JywgY291bnQpO1xuICAgIH1cbiAgICBcbiAgICBnZXQgbGV2ZWxzKCk6IElMZXZlbFtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnbGV2ZWxzJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBsZXZlbHMobGV2ZWxzOiBJTGV2ZWxbXSkge1xuICAgICAgICBpZiAoICFBcnJheS5pc0FycmF5KGxldmVscykgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCBsZXZlbHMsIHJlY2VpdmVkIFwibGV2ZWxzXCIgbm90IGlzQXJyYXkuIGxldmVsczogYCwgbGV2ZWxzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3NldCgnbGV2ZWxzJywgbGV2ZWxzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBcbiAgICBjdXJyZW50VHJpYWxDb29yZHMoKTogbnVtYmVyW10ge1xuICAgICAgICAvLyBsZXQgeyBsZXZlbHMsIGZpbmlzaGVkX3RyaWFsc19jb3VudCB9ID0gdGhpcy5jb25maWcoKTtcbiAgICAgICAgbGV0IGZsYXRUcmlhbHNMaXN0ID0gdGhpcy5sZXZlbHMubWFwKGxldmVsID0+IGxldmVsLnRyaWFscyk7XG4gICAgICAgIGZvciAoIGxldCBbIGxldmVsSW5kZXgsIHRyaWFsc051bSBdIG9mIGVudW1lcmF0ZShmbGF0VHJpYWxzTGlzdCkgKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCB0cmlhbFN1bVNvRmFyID0gc3VtKGZsYXRUcmlhbHNMaXN0LnNsaWNlKDAsIGxldmVsSW5kZXggKyAxKSk7XG4gICAgICAgICAgICBjb25zdCBmaW5pc2hlZFRyaWFsc0NvdW50ID0gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgICAgICAgICBpZiAoIHRyaWFsU3VtU29GYXIgPiBmaW5pc2hlZFRyaWFsc0NvdW50IClcbiAgICAgICAgICAgICAgICByZXR1cm4gWyBsZXZlbEluZGV4LCB0cmlhbHNOdW0gLSAodHJpYWxTdW1Tb0ZhciAtIGZpbmlzaGVkVHJpYWxzQ291bnQpIF07XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS53YXJuKFwiY3VycmVudFRyaWFsQ29vcmRzOiBvdXQgb2YgaW5kZXggZXJyb3JcIik7XG4gICAgfVxuICAgIFxuICAgIGlzRGVtb1ZpZGVvKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5kZW1vX3R5cGUgPT0gJ3ZpZGVvJztcbiAgICB9XG4gICAgXG4gICAgaXNXaG9sZVRlc3RPdmVyKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gc3VtKHRoaXMubGV2ZWxzLm1hcChsZXZlbCA9PiBsZXZlbC50cmlhbHMpKSA9PSB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudDtcbiAgICB9XG4gICAgXG4gICAgZ2V0U3ViamVjdERpck5hbWVzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIGZzLnJlYWRkaXJTeW5jKHBhdGguam9pbihzdXBlci5nZXQoJ3Jvb3RfYWJzX3BhdGgnKSwgJ2V4cGVyaW1lbnRzJywgJ3N1YmplY3RzJykpO1xuICAgIH1cbiAgICBcbiAgICBnZXRDdXJyZW50TGV2ZWwoKTogTGV2ZWwge1xuICAgICAgICBcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICByZXR1cm4gbmV3IExldmVsKHRoaXMubGV2ZWxzW2xldmVsX2luZGV4XSwgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0TGV2ZWxDb2xsZWN0aW9uKCk6IExldmVsQ29sbGVjdGlvbiB7XG4gICAgICAgIGxldCBbIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCBdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBMZXZlbENvbGxlY3Rpb24odGhpcy5sZXZlbHMsIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkdldHMgdGhlIGN1cnJlbnQgdHJpYWwncyBwYXRoIChqb2luIHRoaXMudGVzdE91dFBhdGgoKSBhbmQgbGV2ZWxfJHtsZXZlbF9pbmRleH0uLi4pLCBhbmQgcmV0dXJucyBhIFRydXRoIG9mIGl0Ki9cbiAgICB0cmlhbFRydXRoKCk6IFRydXRoIHtcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICAvLyByZXR1cm4gbmV3IFRydXRoKHBhdGguam9pbih0aGlzLnRlc3RPdXRQYXRoKCksIGBsZXZlbF8ke2xldmVsX2luZGV4fV90cmlhbF8ke3RyaWFsX2luZGV4fWApKTtcbiAgICAgICAgcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odGhpcy50ZXN0T3V0UGF0aCgpLCBgbGV2ZWxfJHtsZXZlbF9pbmRleH1fdHJpYWxfJHt0cmlhbF9pbmRleH1gKSk7XG4gICAgfVxuICAgIFxuICAgIC8qKlwiYzpcXFN5bmNcXENvZGVcXFB5dGhvblxcUHlhbm8tcmVsZWFzZVxcc3JjXFxleHBlcmltZW50c1xcc3ViamVjdHNcXGdpbGFkXFxmdXJfZWxpc2VcIiovXG4gICAgdGVzdE91dFBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY3VyclN1YmplY3REaXIgPSBwYXRoLmpvaW4oc3VwZXIuc3ViamVjdHNEaXJQYXRoKCksIHRoaXMuY3VycmVudF9zdWJqZWN0KTsgLy8gXCIuLi4vc3ViamVjdHMvZ2lsYWRcIlxuICAgICAgICByZXR1cm4gcGF0aC5qb2luKGN1cnJTdWJqZWN0RGlyLCB0aGlzLnRydXRoKCkubmFtZSk7XG4gICAgfVxuICAgIFxuICAgIFxufVxuIl19