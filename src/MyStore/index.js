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
            clickFn: $s => {
                try {
                    const config = this.config();
                    config.finished_trials_count = 0;
                    config.levels = [];
                    this.truth_file_path = new Truth_1.Truth(path.join(process.env.TRUTHS_PATH_ABS, $s.text()));
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
        const truthFileName = path.basename(savedConfig.truth_file_path, '.txt');
        this.truth_file_path = new Truth_1.Truth(path.join(process.env.TRUTHS_PATH_ABS, truthFileName));
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
        const truthsDirPath = process.env.TRUTHS_PATH_ABS;
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
        console.warn('called root_abs_path, should use process.env.ROOT_PATH_ABS');
        return process.env.ROOT_PATH_ABS;
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
        console.warn('called configsPath, should use process.env.CONFIGS_PATH_ABS');
        return process.env.CONFIGS_PATH_ABS;
    }
    truthsDirPath() {
        console.warn('called truthsDirPath, should use process.env.TRUTHS_PATH_ABS');
        return process.env.TRUTHS_PATH_ABS;
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
        console.warn('called subjectsDirPath, should use process.env.SUBJECTS_PATH_ABS');
        return process.env.SUBJECTS_PATH_ABS;
    }
    salamanderDirPath() {
        console.warn('called salamanderDirPath, should use process.env.SALAMANDER_PATH_ABS');
        return process.env.SALAMANDER_PATH_ABS;
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
            cwd: path.dirname(path.join(process.env.ROOT_PATH_ABS, this.save_path)),
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
        const currSubjectDir = path.join(process.env.SUBJECTS_PATH_ABS, this.current_subject);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFDM0Isa0NBQTJEO0FBQzNELG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBb0RwQyxNQUFhLE9BQVEsU0FBUSxLQUFlO0lBRXhDLFlBQVksaUJBQWlCLEdBQUcsSUFBSTtRQUNoQyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUssaUJBQWlCO1lBQ2xCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBR2pDLENBQUM7SUFHTyxLQUFLLENBQUMsaUJBQWlCO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUU5QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0IsSUFBSyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFHO1lBQ3hCLE9BQU8saUJBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsS0FBSyxDQUFDLElBQUksb0JBQW9CLENBQUMsQ0FBQztTQUN0RTtRQUNELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRSxNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDekcsSUFBSyxDQUFDLFdBQUksQ0FB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UixXQUFXO0NBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFN0b3JlIGZyb20gXCJlbGVjdHJvbi1zdG9yZVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgQWxlcnQgZnJvbSBcIi4uL015QWxlcnRcIjtcbmltcG9ydCBteWZzIGZyb20gXCIuLi9NeUZzXCI7XG5pbXBvcnQgeyBib29sLCByZWxvYWRQYWdlLCBzdW0sIGVudW1lcmF0ZSB9IGZyb20gXCIuLi91dGlsXCI7XG5pbXBvcnQgeyBUcnV0aCB9IGZyb20gXCIuLi9UcnV0aFwiO1xuaW1wb3J0IHsgSUxldmVsLCBMZXZlbCwgTGV2ZWxDb2xsZWN0aW9uIH0gZnJvbSBcIi4uL0xldmVsXCI7XG5cbmNvbnNvbGUubG9nKCdzcmMvTXlTdG9yZS9pbmRleC50cycpO1xuXG50eXBlIEV4cGVyaW1lbnRUeXBlID0gJ2V4YW0nIHwgJ3Rlc3QnO1xudHlwZSBEZW1vVHlwZSA9ICd2aWRlbycgfCAnYW5pbWF0aW9uJztcbmV4cG9ydCB0eXBlIFBhZ2VOYW1lID0gXCJuZXdcIiAvLyBBS0EgVExhc3RQYWdlXG4gICAgfCBcInJ1bm5pbmdcIlxuICAgIHwgXCJyZWNvcmRcIlxuICAgIHwgXCJmaWxlX3Rvb2xzXCJcbiAgICB8IFwic2V0dGluZ3NcIlxudHlwZSBEZXZpYXRpb25UeXBlID0gJ3JoeXRobScgfCAndGVtcG8nO1xuXG5cbmludGVyZmFjZSBJU3ViY29uZmlnQmFzZSB7XG4gICAgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uOiBzdHJpbmcsXG4gICAgYWxsb3dlZF90ZW1wb19kZXZpYXRpb246IHN0cmluZyxcbiAgICBjdXJyZW50X3N1YmplY3Q6IHN0cmluZ1xuICAgIGRlbW9fdHlwZTogRGVtb1R5cGUsXG4gICAgZXJyb3JzX3BsYXlpbmdzcGVlZDogbnVtYmVyLFxuICAgIGZpbmlzaGVkX3RyaWFsc19jb3VudDogbnVtYmVyLFxuICAgIGxldmVsczogSUxldmVsW10sXG59XG5cbmludGVyZmFjZSBJU3ViY29uZmlnIGV4dGVuZHMgSVN1YmNvbmZpZ0Jhc2UgeyAvLyBBS0EgVENvbmZpZ1xuICAgICdzYXZlX3BhdGgnOiBzdHJpbmdcbn1cblxuaW50ZXJmYWNlIElTYXZlZFN1YmNvbmZpZyBleHRlbmRzIElTdWJjb25maWdCYXNlIHsgLy8gQUtBIFRTYXZlZENvbmZpZ1xuICAgICd0cnV0aF9maWxlX3BhdGgnOiBzdHJpbmdcbn1cblxuaW50ZXJmYWNlIERldk9wdGlvbnMge1xuICAgIFwic2tpcF93aG9sZV90cnV0aFwiOiBib29sZWFuLFxuICAgIFwic2tpcF9sZXZlbF9pbnRyb1wiOiBib29sZWFuLFxuICAgIFwic2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2tcIjogYm9vbGVhbixcbiAgICBcInNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrXCI6IGJvb2xlYW5cbn1cblxuaW50ZXJmYWNlIElNeVN0b3JlIHtcbiAgICAnY3VycmVudF9leGFtJzogU3ViY29uZmlnLFxuICAgICdjdXJyZW50X3Rlc3QnOiBTdWJjb25maWcsXG4gICAgJ2Rldic6IGJvb2xlYW4sXG4gICAgJ2Rldm9wdGlvbnMnOiBEZXZPcHRpb25zLFxuICAgICdleHBlcmltZW50X3R5cGUnOiBFeHBlcmltZW50VHlwZSxcbiAgICAnbGFzdF9wYWdlJzogUGFnZU5hbWUsXG4gICAgJ3Jvb3RfYWJzX3BhdGgnOiBzdHJpbmcsXG4gICAgJ3N1YmplY3RzJzogc3RyaW5nW10sXG4gICAgJ3RydXRoX2ZpbGVfcGF0aCc6IHN0cmluZyxcbiAgICAndmVsb2NpdGllcyc6IG51bWJlcltdLFxuICAgICd2aWRfc2lsZW5jZV9sZW4nOiBudW1iZXIsXG59XG5cblxuZXhwb3J0IGNsYXNzIE15U3RvcmUgZXh0ZW5kcyBTdG9yZTxJTXlTdG9yZT4ge1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKF9kb1RydXRoRmlsZUNoZWNrID0gdHJ1ZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBpZiAoIF9kb1RydXRoRmlsZUNoZWNrIClcbiAgICAgICAgICAgIHRoaXMuX2RvVHJ1dGhGaWxlQ2hlY2soKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBwcml2YXRlIGFzeW5jIF9kb1RydXRoRmlsZUNoZWNrKCkge1xuICAgICAgICBjb25zb2xlLmxvZygn8J+SviBNeVN0b3JlLl9kb1RydXRoRmlsZUNoZWNrKCknKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHRydXRoID0gdGhpcy50cnV0aCgpO1xuICAgICAgICBpZiAoIHRydXRoLnR4dC5hbGxFeGlzdCgpICkge1xuICAgICAgICAgICAgcmV0dXJuIEFsZXJ0LnNtYWxsLnN1Y2Nlc3MoYEFsbCBcIiR7dHJ1dGgubmFtZX1cIiB0eHQgZmlsZXMgZXhpc3QuYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHh0RmlsZXNMaXN0ID0gdGhpcy50cnV0aEZpbGVzTGlzdCgndHh0JykubWFwKG15ZnMucmVtb3ZlX2V4dCk7XG4gICAgICAgIGNvbnN0IGZpbHRlcmVkVHh0cyA9IHR4dEZpbGVzTGlzdC5maWx0ZXIoYSA9PiB0eHRGaWxlc0xpc3QuZmlsdGVyKHR4dCA9PiB0eHQuc3RhcnRzV2l0aChhKSkubGVuZ3RoID49IDMpO1xuICAgICAgICBpZiAoICFib29sKGZpbHRlcmVkVHh0cykgKVxuICAgICAgICAgICAgcmV0dXJuIEFsZXJ0LmJpZy53YXJuaW5nKHtcbiAgICAgICAgICAgICAgICB0aXRsZSA6ICdObyB2YWxpZCB0cnV0aCBmaWxlcyBmb3VuZCcsXG4gICAgICAgICAgICAgICAgaHRtbCA6ICdUaGVyZSBuZWVkcyB0byBiZSBhdCBsZWFzdCBvbmUgdHh0IGZpbGUgd2l0aCAyIFwib25cIiBhbmQgXCJvZmZcIiBjb3VudGVycGFydHMuJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEFsZXJ0LmJpZy5ibG9ja2luZyh7XG4gICAgICAgICAgICB0aXRsZSA6IGBUcnV0aCBmaWxlIGludmFsaWQ6ICR7dHJ1dGgubmFtZX1gLFxuICAgICAgICAgICAgaHRtbCA6ICc8Yj5QbGVhc2UgY2hvb3NlIG9uZSBvZiB0aGUgZm9sbG93aW5nIHZhbGlkIHRydXRoczo8L2I+JyxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgc3RyaW5ncyA6IGZpbHRlcmVkVHh0cyxcbiAgICAgICAgICAgIGNsaWNrRm4gOiAkcyA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5jb25maWcoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLmZpbmlzaGVkX3RyaWFsc19jb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5sZXZlbHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRydXRoX2ZpbGVfcGF0aCA9IG5ldyBUcnV0aChwYXRoLmpvaW4ocHJvY2Vzcy5lbnYuVFJVVEhTX1BBVEhfQUJTLCAkcy50ZXh0KCkpKTtcbiAgICAgICAgICAgICAgICAgICAgcmVsb2FkUGFnZSgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzd2FsMi10aXRsZScpLmlubmVyVGV4dCA9IGVyci5tZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3dhbDItY29udGVudCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnN3YWwyLWljb24gc3dhbDItd2FybmluZycpLnN0eWxlLmRpc3BsYXkgPSAnaW5oZXJpdCc7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZzogSVNhdmVkU3ViY29uZmlnLCBleHBlcmltZW50VHlwZTogRXhwZXJpbWVudFR5cGUpIHtcbiAgICAgICAgY29uc3QgdHJ1dGhGaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoc2F2ZWRDb25maWcudHJ1dGhfZmlsZV9wYXRoLCAnLnR4dCcpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKHBhdGguam9pbihwcm9jZXNzLmVudi5UUlVUSFNfUEFUSF9BQlMsIHRydXRoRmlsZU5hbWUpKTtcbiAgICAgICAgdGhpcy5leHBlcmltZW50X3R5cGUgPSBleHBlcmltZW50VHlwZTtcbiAgICAgICAgdGhpcy5jb25maWcoKS5mcm9tU2F2ZWRDb25maWcoc2F2ZWRDb25maWcpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBjb25maWcodHlwZT86IEV4cGVyaW1lbnRUeXBlKTogU3ViY29uZmlnIHtcbiAgICAgICAgaWYgKCB0eXBlIClcbiAgICAgICAgICAgIHJldHVybiBuZXcgU3ViY29uZmlnKHR5cGUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gbmV3IFN1YmNvbmZpZyh0aGlzLmV4cGVyaW1lbnRfdHlwZSk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkBleGFtcGxlXG4gICAgIHVwZGF0ZSgnc3ViamVjdHMnLCBbbmFtZXNdKVxuICAgICAqL1xuICAgIHVwZGF0ZShLOiBrZXlvZiBJTXlTdG9yZSwga3ZQYWlyczogUGFydGlhbDxJTXlTdG9yZT4pXG4gICAgdXBkYXRlKEs6IGtleW9mIElNeVN0b3JlLCB2YWx1ZXM6IGFueVtdKVxuICAgIHVwZGF0ZShLLCBrdikge1xuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBpZiAoIEFycmF5LmlzQXJyYXkoVikgKSB7XG4gICAgICAgICAgICB0aGlzLnNldChLLCBbIC4uLlYsIGt2IF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihWLCBrdik7XG4gICAgICAgICAgICB0aGlzLnNldChLLCBWKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXQoSyk7XG4gICAgfVxuICAgIFxuICAgIGluY3JlYXNlKEs6IGtleW9mIElNeVN0b3JlKSB7XG4gICAgICAgIGxldCBWID0gdGhpcy5nZXQoSyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIFYgPT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICB0aGlzLnNldChLLCAxKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0eXBlb2ZWID0gdHlwZW9mIFY7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBpZiAoIHR5cGVvZlYgPT09ICdudW1iZXInIHx8ICh0eXBlb2ZWID09PSAnc3RyaW5nJyAmJiBWLmlzZGlnaXQoKSkgKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KEssIE1hdGguZmxvb3IoVikgKyAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiTXlTdG9yZSB0cmllZCB0byBpbmNyZWFzZSBhIHZhbHVlIHRoYXQgaXMgbm90IGEgbnVtYmVyIG5vciBhIHN0cmluZy5pc2RpZ2l0KClcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHRydXRoKCk6IFRydXRoIHtcbiAgICAgICAgY29uc3QgdHJ1dGhzRGlyUGF0aCA9IHByb2Nlc3MuZW52LlRSVVRIU19QQVRIX0FCUztcbiAgICAgICAgY29uc3QgdHJ1dGhGaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUodGhpcy50cnV0aF9maWxlX3BhdGgsICcudHh0Jyk7XG4gICAgICAgIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRydXRoc0RpclBhdGgsIHRydXRoRmlsZU5hbWUpKTtcbiAgICB9XG4gICAgXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHNldCB0cnV0aF9maWxlX3BhdGgodHJ1dGg6IFRydXRoKSB7XG4gICAgICAgIFxuICAgICAgICBpZiAoIHRydXRoLnR4dC5hbGxFeGlzdCgpICkge1xuICAgICAgICAgICAgdGhpcy5zZXQoYHRydXRoX2ZpbGVfcGF0aGAsIGBleHBlcmltZW50cy90cnV0aHMvJHt0cnV0aC50eHQuYmFzZS5uYW1lfWApO1xuICAgICAgICAgICAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vdCBhbGwgdHh0IGZpbGVzIG9mIHRydXRoIGV4aXN0OiAke3RydXRoLnR4dC5iYXNlLm5hbWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBnZXQgdHJ1dGhfZmlsZV9wYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgndHJ1dGhfZmlsZV9wYXRoJyk7XG4gICAgfVxuICAgIFxuICAgIC8vIC8qKkByZXR1cm4ge3N0cmluZ30qL1xuICAgIC8vIGdldCBzYXZlX3BhdGgoKSB7XG4gICAgLy8gXHRyZXR1cm4gdGhpcy5nZXQoJ3NhdmVfcGF0aCcpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIC8qKkBwYXJhbSB7c3RyaW5nfSBzYXZlUGF0aCovXG4gICAgLy8gc2V0IHNhdmVfcGF0aChzYXZlUGF0aCkge1xuICAgIC8vIFx0dGhpcy5zZXQoJ3NhdmVfcGF0aCcsIHNhdmVQYXRoKTtcbiAgICAvLyB9XG4gICAgXG4gICAgZ2V0IGxhc3RfcGFnZSgpOiBQYWdlTmFtZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnbGFzdF9wYWdlJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBsYXN0X3BhZ2UocGFnZTogUGFnZU5hbWUpIHtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHZhbGlkcGFnZXMgPSBbIFwibmV3XCIsIFwicnVubmluZ1wiLCBcInJlY29yZFwiLCBcImZpbGVfdG9vbHNcIiwgXCJzZXR0aW5nc1wiIF07XG4gICAgICAgIGlmICggIXZhbGlkcGFnZXMuaW5jbHVkZXMocGFnZSkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCBsYXN0X3BhZ2UoXCIke3BhZ2V9XCIpLCBtdXN0IGJlIG9uZSBvZiAke3ZhbGlkcGFnZXMuam9pbignLCAnKX0uIHNldHRpbmcgdG8gbmV3YCk7XG4gICAgICAgICAgICB0aGlzLnNldCgnbGFzdF9wYWdlJywgJ25ldycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xhc3RfcGFnZScsIHBhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBleHBlcmltZW50X3R5cGUoKTogRXhwZXJpbWVudFR5cGUge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2V4cGVyaW1lbnRfdHlwZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZXhwZXJpbWVudF90eXBlKGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBpZiAoIGV4cGVyaW1lbnRUeXBlICE9PSAndGVzdCcgJiYgZXhwZXJpbWVudFR5cGUgIT09ICdleGFtJyApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgTXlTdG9yZSBleHBlcmltZW50X3R5cGUgc2V0dGVyLCBnb3QgZXhwZXJpbWVudFR5cGU6ICcke2V4cGVyaW1lbnRUeXBlfScuIE11c3QgYmUgZWl0aGVyICd0ZXN0JyBvciAnZXhhbScuIHNldHRpbmcgdG8gdGVzdGApO1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2V4cGVyaW1lbnRfdHlwZScsICd0ZXN0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZXhwZXJpbWVudF90eXBlJywgZXhwZXJpbWVudFR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHRoaXMuX3VwZGF0ZVNhdmVkRmlsZSgnZXhwZXJpbWVudF90eXBlJywgZXhwZXJpbWVudFR5cGUpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBnZXQgcm9vdF9hYnNfcGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NhbGxlZCByb290X2Fic19wYXRoLCBzaG91bGQgdXNlIHByb2Nlc3MuZW52LlJPT1RfUEFUSF9BQlMnKTtcbiAgICAgICAgcmV0dXJuIHByb2Nlc3MuZW52LlJPT1RfUEFUSF9BQlM7XG4gICAgfVxuICAgIFxuICAgIHNldCBzdWJqZWN0cyhzdWJqZWN0TGlzdDogc3RyaW5nW10pIHtcbiAgICAgICAgY29uc3Qgc3ViamVjdHMgPSBbIC4uLm5ldyBTZXQoc3ViamVjdExpc3QpIF07XG4gICAgICAgIGNvbnNvbGUubG9nKCfwn5K+IHNldCBzdWJqZWN0czonLCBzdWJqZWN0cyk7XG4gICAgICAgIHRoaXMuc2V0KCdzdWJqZWN0cycsIHN1YmplY3RzKTtcbiAgICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5jb25maWcoKTtcbiAgICAgICAgY29uc3QgY3VycmVudFN1YmplY3QgPSBjb25maWcuY3VycmVudF9zdWJqZWN0O1xuICAgICAgICBpZiAoIGN1cnJlbnRTdWJqZWN0ICYmICFzdWJqZWN0cy5pbmNsdWRlcyhjdXJyZW50U3ViamVjdCkgKVxuICAgICAgICAgICAgY29uZmlnLmN1cnJlbnRfc3ViamVjdCA9IG51bGw7XG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBjb25maWdzUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NhbGxlZCBjb25maWdzUGF0aCwgc2hvdWxkIHVzZSBwcm9jZXNzLmVudi5DT05GSUdTX1BBVEhfQUJTJyk7XG4gICAgICAgIHJldHVybiBwcm9jZXNzLmVudi5DT05GSUdTX1BBVEhfQUJTO1xuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgdHJ1dGhzRGlyUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NhbGxlZCB0cnV0aHNEaXJQYXRoLCBzaG91bGQgdXNlIHByb2Nlc3MuZW52LlRSVVRIU19QQVRIX0FCUycpO1xuICAgICAgICByZXR1cm4gcHJvY2Vzcy5lbnYuVFJVVEhTX1BBVEhfQUJTO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICB0cnV0aEZpbGVzTGlzdChleHRGaWx0ZXI/OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgICAgIGlmICggZXh0RmlsdGVyICkge1xuICAgICAgICAgICAgaWYgKCBleHRGaWx0ZXIuc3RhcnRzV2l0aCgnLicpIClcbiAgICAgICAgICAgICAgICBleHRGaWx0ZXIgPSBleHRGaWx0ZXIuc2xpY2UoMSk7XG4gICAgICAgICAgICBpZiAoICFbICd0eHQnLCAnbWlkJywgJ21wNCcgXS5pbmNsdWRlcyhleHRGaWx0ZXIpICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgdHJ1dGhGaWxlc0xpc3QoXCIke2V4dEZpbHRlcn1cIiksIG11c3QgYmUgZWl0aGVyIFsndHh0JywnbWlkJywnbXA0J10gb3Igbm90IGF0IGFsbC4gc2V0dGluZyB0byB1bmRlZmluZWRgKTtcbiAgICAgICAgICAgICAgICBleHRGaWx0ZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHRydXRoc0RpclBhdGggPSB0aGlzLnRydXRoc0RpclBhdGgoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCB0cnV0aEZpbGVzID0gWyAuLi5uZXcgU2V0KGZzLnJlYWRkaXJTeW5jKHRydXRoc0RpclBhdGgpKSBdO1xuICAgICAgICBpZiAoIGJvb2woZXh0RmlsdGVyKSApXG4gICAgICAgICAgICByZXR1cm4gdHJ1dGhGaWxlcy5maWx0ZXIoZiA9PiBwYXRoLmV4dG5hbWUoZikgPT0gYC4ke2V4dEZpbHRlcn1gKTtcbiAgICAgICAgcmV0dXJuIHRydXRoRmlsZXM7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBzdWJqZWN0c0RpclBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdjYWxsZWQgc3ViamVjdHNEaXJQYXRoLCBzaG91bGQgdXNlIHByb2Nlc3MuZW52LlNVQkpFQ1RTX1BBVEhfQUJTJyk7XG4gICAgICAgIHJldHVybiBwcm9jZXNzLmVudi5TVUJKRUNUU19QQVRIX0FCU1xuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgc2FsYW1hbmRlckRpclBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdjYWxsZWQgc2FsYW1hbmRlckRpclBhdGgsIHNob3VsZCB1c2UgcHJvY2Vzcy5lbnYuU0FMQU1BTkRFUl9QQVRIX0FCUycpO1xuICAgICAgICByZXR1cm4gcHJvY2Vzcy5lbnYuU0FMQU1BTkRFUl9QQVRIX0FCU1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBwcml2YXRlIGdldCBkZXYoKTogeyBbSyBpbiBrZXlvZiBEZXZPcHRpb25zXTogKCkgPT4gYm9vbGVhbiB9IHtcbiAgICAgICAgY29uc3QgX2RldiA9IHRoaXMuZ2V0KCdkZXYnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNraXBfd2hvbGVfdHJ1dGggOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF93aG9sZV90cnV0aCxcbiAgICAgICAgICAgIHNraXBfbGV2ZWxfaW50cm8gOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9sZXZlbF9pbnRybyxcbiAgICAgICAgICAgIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrIDogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrLFxuICAgICAgICAgICAgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2sgOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2ssXG4gICAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIFxufVxuXG5cbmNsYXNzIFN1YmNvbmZpZyBleHRlbmRzIE15U3RvcmUgeyAvLyBBS0EgQ29uZmlnXG4gICAgcHJpdmF0ZSByZWFkb25seSB0eXBlOiBFeHBlcmltZW50VHlwZTtcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBfS0VZUzogKGtleW9mIElTdWJjb25maWcpW10gPSBbXG4gICAgICAgICdhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24nLFxuICAgICAgICAnYWxsb3dlZF90ZW1wb19kZXZpYXRpb24nLFxuICAgICAgICAnY3VycmVudF9zdWJqZWN0JyxcbiAgICAgICAgJ2RlbW9fdHlwZScsXG4gICAgICAgICdlcnJvcnNfcGxheWluZ3NwZWVkJyxcbiAgICAgICAgJ2ZpbmlzaGVkX3RyaWFsc19jb3VudCcsXG4gICAgICAgICdsZXZlbHMnLFxuICAgICAgICAnc2F2ZV9wYXRoJ1xuICAgIF07XG4gICAgXG4gICAgY29uc3RydWN0b3IodHlwZTogRXhwZXJpbWVudFR5cGUpIHtcbiAgICAgICAgc3VwZXIoZmFsc2UpO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICB0b1NhdmVkQ29uZmlnKCk6IElTYXZlZFN1YmNvbmZpZyB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgY29uc3Qgc2VsZjogQ29uZjxJU3ViY29uZmlnPiA9IHN1cGVyLmdldChgY3VycmVudF8ke3RoaXMudHlwZX1gKTtcbiAgICAgICAgc2VsZi5kZWxldGUoJ3NhdmVfcGF0aCcpO1xuICAgICAgICAvLyBkZWxldGUgc2VsZi5zYXZlX3BhdGg7XG4gICAgICAgIGNvbnN0IHNhdmVkQ29uZmlnID0ge1xuICAgICAgICAgICAgLi4uc2VsZixcbiAgICAgICAgICAgIHRydXRoX2ZpbGVfcGF0aCA6IHN1cGVyLnRydXRoX2ZpbGVfcGF0aFxuICAgICAgICB9O1xuICAgICAgICBjb25zb2xlLndhcm4oJ3NhdmVkQ29uZmlnLCBjaGVjayBpZiBkZWxldGVkIHNhdmVfcGF0aDonLCBzZWxmKTtcbiAgICAgICAgcmV0dXJuIHNhdmVkQ29uZmlnO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBmcm9tU2F2ZWRDb25maWcoc2F2ZWRDb25maWc6IElTYXZlZFN1YmNvbmZpZywgLi4uYXJncykge1xuICAgICAgICB0aGlzLmxldmVscyA9IHNhdmVkQ29uZmlnLmxldmVscztcbiAgICAgICAgdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQgPSBzYXZlZENvbmZpZy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgICAgIHRoaXMuZXJyb3JzX3BsYXlpbmdzcGVlZCA9IHNhdmVkQ29uZmlnLmVycm9yc19wbGF5aW5nc3BlZWQ7XG4gICAgICAgIHRoaXMuZGVtb190eXBlID0gc2F2ZWRDb25maWcuZGVtb190eXBlO1xuICAgICAgICB0aGlzLmN1cnJlbnRfc3ViamVjdCA9IHNhdmVkQ29uZmlnLmN1cnJlbnRfc3ViamVjdDtcbiAgICAgICAgdGhpcy5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbiA9IHNhdmVkQ29uZmlnLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uO1xuICAgICAgICB0aGlzLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbiA9IHNhdmVkQ29uZmlnLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbjtcbiAgICAgICAgdGhpcy5fdXBkYXRlU2F2ZWRGaWxlKCd0cnV0aF9maWxlX3BhdGgnLCBzYXZlZENvbmZpZy50cnV0aF9maWxlX3BhdGgpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBwcml2YXRlIF91cGRhdGVTYXZlZEZpbGUoa2V5OiBrZXlvZiBJU2F2ZWRTdWJjb25maWcsIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IGNvbmYgPSBuZXcgKHJlcXVpcmUoJ2NvbmYnKSkoe1xuICAgICAgICAgICAgY3dkIDogcGF0aC5kaXJuYW1lKHBhdGguam9pbihwcm9jZXNzLmVudi5ST09UX1BBVEhfQUJTLCB0aGlzLnNhdmVfcGF0aCkpLFxuICAgICAgICAgICAgY29uZmlnTmFtZSA6IG15ZnMucmVtb3ZlX2V4dChwYXRoLmJhc2VuYW1lKHRoaXMuc2F2ZV9wYXRoKSksXG4gICAgICAgICAgICBmaWxlRXh0ZW5zaW9uIDogdGhpcy50eXBlLFxuICAgICAgICAgICAgc2VyaWFsaXplIDogdmFsdWUgPT4gSlNPTi5zdHJpbmdpZnkodmFsdWUsIG51bGwsIDQpXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZygn8J+SviBfdXBkYXRlU2F2ZWRGaWxlKGtleSx2YWx1ZSknLCB7IGtleSwgdmFsdWUsIGNvbmYgfSk7XG4gICAgICAgIGNvbmYuc2V0KGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBwcml2YXRlIF9nZXQoa2V5OiBrZXlvZiBJU3ViY29uZmlnKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIHN1cGVyLmdldChgY3VycmVudF8ke3RoaXMudHlwZX0uJHtrZXl9YCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIHByaXZhdGUgX3NldChrZXk6IGtleW9mIElTdWJjb25maWcsIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHR5cGVvZktleSA9IHR5cGVvZiBrZXk7XG4gICAgICAgIGlmICggdHlwZW9mS2V5ID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICAgIGlmICggIVN1YmNvbmZpZy5fS0VZUy5pbmNsdWRlcyhrZXkpICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgU3ViY29uZmlnKCR7dGhpcy50eXBlfSkuX3NldDogXCJrZXlcIiAoXCIke2tleX1cIikgaXMgc3RyaW5nIGJ1dCBub3QgaW4gdGhpcy5fS0VZU2ApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHN1cGVya2V5ID0gYGN1cnJlbnRfJHt0aGlzLnR5cGV9LiR7a2V5fWA7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBzdXBlci5zZXQoc3VwZXJrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIGlmICgga2V5ICE9PSBcInNhdmVfcGF0aFwiIClcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTYXZlZEZpbGUoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUud2FybihgU3ViY29uZmlnKCR7dGhpcy50eXBlfSkuX3NldDogXCJrZXlcIiAoXCIke2tleX1cIikgaXMgbm90IHN0cmluZy4gdHlwZTogJHt0eXBlb2ZLZXl9YCk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgX3NldERldmlhdGlvbihkZXZpYXRpb25UeXBlOiBEZXZpYXRpb25UeXBlLCBkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICBjb25zdCB0eXBlb2ZEZXZpYXRpb24gPSB0eXBlb2YgZGV2aWF0aW9uO1xuICAgICAgICBpZiAoIHR5cGVvZkRldmlhdGlvbiA9PT0gJ251bWJlcicgKSB7XG4gICAgICAgICAgICBkZXZpYXRpb24gPSBgJHtkZXZpYXRpb259JWA7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYF9zZXREZXZpYXRpb24gZ290IFwiZGV2aWF0aW9uXCIgdHlwZSBudW1iZXIuIGFwcGVuZGVkIFwiJVwiLiBkZXZpYXRpb24gbm93OiAke2RldmlhdGlvbn1gKTtcbiAgICAgICAgfSBlbHNlIGlmICggdHlwZW9mRGV2aWF0aW9uID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICAgIGlmICggIWRldmlhdGlvbi5lbmRzV2l0aChcIiVcIikgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBfc2V0RGV2aWF0aW9uIGdvdCBkZXZpYXRpb24gd2l0aG91dCAlLiBhcHBlbmRlZCAlLiBkZXZpYXRpb24gbm93OiBcIiR7ZGV2aWF0aW9ufVwiYCk7XG4gICAgICAgICAgICAgICAgZGV2aWF0aW9uID0gYCR7ZGV2aWF0aW9ufSVgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBfc2V0RGV2aWF0aW9uLCByZWNlaXZlZCBcImRldmlhdGlvblwiIG5vdCBzdHJpbmcgbm90IG51bWJlci4gcmV0dXJuaW5nLiBkZXZpYXRpb246YCwgZGV2aWF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB0aGlzLl9zZXQoYGFsbG93ZWRfJHtkZXZpYXRpb25UeXBlfV9kZXZpYXRpb25gLCBkZXZpYXRpb24pO1xuICAgIH1cbiAgICBcbiAgICBnZXQgYWxsb3dlZF90ZW1wb19kZXZpYXRpb24oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnYWxsb3dlZF90ZW1wb19kZXZpYXRpb24nKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uKGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX3NldERldmlhdGlvbihcInRlbXBvXCIsIGRldmlhdGlvbik7XG4gICAgfVxuICAgIFxuICAgIGdldCBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24oZGV2aWF0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fc2V0RGV2aWF0aW9uKFwicmh5dGhtXCIsIGRldmlhdGlvbik7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBjdXJyZW50X3N1YmplY3QoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnY3VycmVudF9zdWJqZWN0Jyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBjdXJyZW50X3N1YmplY3QobmFtZTogc3RyaW5nIHwgbnVsbCkge1xuICAgICAgICBjb25zb2xlLmxvZygn8J+SviBzZXQgY3VycmVudF9zdWJqZWN0KCcsIG5hbWUsICcpJyk7XG4gICAgICAgIHRoaXMuX3NldCgnY3VycmVudF9zdWJqZWN0JywgbmFtZSk7XG4gICAgICAgIGlmICggbmFtZSApXG4gICAgICAgICAgICAvLyBzdXBlci5zZXQoJ3N1YmplY3RzJywgWy4uLm5ldyBTZXQoWy4uLnN1cGVyLmdldCgnc3ViamVjdHMnKSwgbmFtZV0pXSk7XG4gICAgICAgICAgICBzdXBlci5zdWJqZWN0cyA9IFsgLi4uc3VwZXIuZ2V0KCdzdWJqZWN0cycpLCBuYW1lIF07XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBlcnJvcnNfcGxheWluZ3NwZWVkKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ2Vycm9yc19wbGF5aW5nc3BlZWQnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGVycm9yc19wbGF5aW5nc3BlZWQoc3BlZWQ6IG51bWJlcikge1xuICAgICAgICBpZiAoIGlzTmFOKHNwZWVkKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgY29uZmlnIHNldCBlcnJvcnNfcGxheWluZ3NwZWVkLCByZWNlaXZlZCBiYWQgXCJzcGVlZFwiIE5hTjogJHtzcGVlZH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3NldCgnZXJyb3JzX3BsYXlpbmdzcGVlZCcsIHNwZWVkKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgZ2V0IHNhdmVfcGF0aCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0KCdzYXZlX3BhdGgnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IHNhdmVfcGF0aChzYXZlUGF0aDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybignc2V0IHNhdmVfcGF0aCByZXR1cm5zIGEgdmFsdWUsIGlzIHRoaXMgbmVlZGVkPycpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXQoJ3NhdmVfcGF0aCcsIHNhdmVQYXRoKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0IGRlbW9fdHlwZSgpOiBEZW1vVHlwZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ2RlbW9fdHlwZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZGVtb190eXBlKHR5cGU6IERlbW9UeXBlKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybignc2V0IGRlbW9fdHlwZSByZXR1cm5zIGEgdmFsdWUsIGlzIHRoaXMgbmVlZGVkPycpO1xuICAgICAgICBpZiAoICFbICd2aWRlbycsICdhbmltYXRpb24nIF0uaW5jbHVkZXModHlwZSkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYENvbmZpZyBkZW1vX3R5cGUgc2V0dGVyLCBiYWQgdHlwZSA9ICR7dHlwZX0sIGNhbiBiZSBlaXRoZXIgdmlkZW8gb3IgYW5pbWF0aW9uYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2V0KCdkZW1vX3R5cGUnLCB0eXBlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBnZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ2ZpbmlzaGVkX3RyaWFsc19jb3VudCcpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5fc2V0KCdmaW5pc2hlZF90cmlhbHNfY291bnQnLCBjb3VudCk7XG4gICAgfVxuICAgIFxuICAgIGdldCBsZXZlbHMoKTogSUxldmVsW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0KCdsZXZlbHMnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGxldmVscyhsZXZlbHM6IElMZXZlbFtdKSB7XG4gICAgICAgIGlmICggIUFycmF5LmlzQXJyYXkobGV2ZWxzKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IGxldmVscywgcmVjZWl2ZWQgXCJsZXZlbHNcIiBub3QgaXNBcnJheS4gbGV2ZWxzOiBgLCBsZXZlbHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fc2V0KCdsZXZlbHMnLCBsZXZlbHMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGN1cnJlbnRUcmlhbENvb3JkcygpOiBudW1iZXJbXSB7XG4gICAgICAgIC8vIGxldCB7IGxldmVscywgZmluaXNoZWRfdHJpYWxzX2NvdW50IH0gPSB0aGlzLmNvbmZpZygpO1xuICAgICAgICBsZXQgZmxhdFRyaWFsc0xpc3QgPSB0aGlzLmxldmVscy5tYXAobGV2ZWwgPT4gbGV2ZWwudHJpYWxzKTtcbiAgICAgICAgZm9yICggbGV0IFsgbGV2ZWxJbmRleCwgdHJpYWxzTnVtIF0gb2YgZW51bWVyYXRlKGZsYXRUcmlhbHNMaXN0KSApIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHRyaWFsU3VtU29GYXIgPSBzdW0oZmxhdFRyaWFsc0xpc3Quc2xpY2UoMCwgbGV2ZWxJbmRleCArIDEpKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbmlzaGVkVHJpYWxzQ291bnQgPSB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudDtcbiAgICAgICAgICAgIGlmICggdHJpYWxTdW1Tb0ZhciA+IGZpbmlzaGVkVHJpYWxzQ291bnQgKVxuICAgICAgICAgICAgICAgIHJldHVybiBbIGxldmVsSW5kZXgsIHRyaWFsc051bSAtICh0cmlhbFN1bVNvRmFyIC0gZmluaXNoZWRUcmlhbHNDb3VudCkgXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLndhcm4oXCJjdXJyZW50VHJpYWxDb29yZHM6IG91dCBvZiBpbmRleCBlcnJvclwiKTtcbiAgICB9XG4gICAgXG4gICAgaXNEZW1vVmlkZW8oKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbW9fdHlwZSA9PSAndmlkZW8nO1xuICAgIH1cbiAgICBcbiAgICBpc1dob2xlVGVzdE92ZXIoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBzdW0odGhpcy5sZXZlbHMubWFwKGxldmVsID0+IGxldmVsLnRyaWFscykpID09IHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgIH1cbiAgICBcbiAgICBnZXRTdWJqZWN0RGlyTmFtZXMoKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gZnMucmVhZGRpclN5bmMocGF0aC5qb2luKHN1cGVyLmdldCgncm9vdF9hYnNfcGF0aCcpLCAnZXhwZXJpbWVudHMnLCAnc3ViamVjdHMnKSk7XG4gICAgfVxuICAgIFxuICAgIGdldEN1cnJlbnRMZXZlbCgpOiBMZXZlbCB7XG4gICAgICAgIFxuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIHJldHVybiBuZXcgTGV2ZWwodGhpcy5sZXZlbHNbbGV2ZWxfaW5kZXhdLCBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXgpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBnZXRMZXZlbENvbGxlY3Rpb24oKTogTGV2ZWxDb2xsZWN0aW9uIHtcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICByZXR1cm4gbmV3IExldmVsQ29sbGVjdGlvbih0aGlzLmxldmVscywgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqR2V0cyB0aGUgY3VycmVudCB0cmlhbCdzIHBhdGggKGpvaW4gdGhpcy50ZXN0T3V0UGF0aCgpIGFuZCBsZXZlbF8ke2xldmVsX2luZGV4fS4uLiksIGFuZCByZXR1cm5zIGEgVHJ1dGggb2YgaXQqL1xuICAgIHRyaWFsVHJ1dGgoKTogVHJ1dGgge1xuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIC8vIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRoaXMudGVzdE91dFBhdGgoKSwgYGxldmVsXyR7bGV2ZWxfaW5kZXh9X3RyaWFsXyR7dHJpYWxfaW5kZXh9YCkpO1xuICAgICAgICByZXR1cm4gbmV3IFRydXRoKHBhdGguam9pbih0aGlzLnRlc3RPdXRQYXRoKCksIGBsZXZlbF8ke2xldmVsX2luZGV4fV90cmlhbF8ke3RyaWFsX2luZGV4fWApKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXCJjOlxcU3luY1xcQ29kZVxcUHl0aG9uXFxQeWFuby1yZWxlYXNlXFxzcmNcXGV4cGVyaW1lbnRzXFxzdWJqZWN0c1xcZ2lsYWRcXGZ1cl9lbGlzZVwiKi9cbiAgICB0ZXN0T3V0UGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBjdXJyU3ViamVjdERpciA9IHBhdGguam9pbihwcm9jZXNzLmVudi5TVUJKRUNUU19QQVRIX0FCUywgdGhpcy5jdXJyZW50X3N1YmplY3QpOyAvLyBcIi4uLi9zdWJqZWN0cy9naWxhZFwiXG4gICAgICAgIHJldHVybiBwYXRoLmpvaW4oY3VyclN1YmplY3REaXIsIHRoaXMudHJ1dGgoKS5uYW1lKTtcbiAgICB9XG4gICAgXG4gICAgXG59XG4iXX0=