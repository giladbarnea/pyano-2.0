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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFDM0Isa0NBQTJEO0FBQzNELG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBb0RwQyxNQUFhLE9BQVEsU0FBUSxLQUFlO0lBRXhDLFlBQVksaUJBQWlCLEdBQUcsSUFBSTtRQUNoQyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUssaUJBQWlCO1lBQ2xCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBR2pDLENBQUM7SUFHTyxLQUFLLENBQUMsaUJBQWlCO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUU5QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0IsSUFBSyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFHO1lBQ3hCLE9BQU8saUJBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsS0FBSyxDQUFDLElBQUksb0JBQW9CLENBQUMsQ0FBQztTQUN0RTtRQUNELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRSxNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDekcsSUFBSyxDQUFDLFdBQUksQ0FB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UixXQUFXO0NBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFN0b3JlIGZyb20gXCJlbGVjdHJvbi1zdG9yZVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgQWxlcnQgZnJvbSBcIi4uL015QWxlcnRcIjtcbmltcG9ydCBteWZzIGZyb20gXCIuLi9NeUZzXCI7XG5pbXBvcnQgeyBib29sLCByZWxvYWRQYWdlLCBzdW0sIGVudW1lcmF0ZSB9IGZyb20gXCIuLi91dGlsXCI7XG5pbXBvcnQgeyBUcnV0aCB9IGZyb20gXCIuLi9UcnV0aFwiO1xuaW1wb3J0IHsgSUxldmVsLCBMZXZlbCwgTGV2ZWxDb2xsZWN0aW9uIH0gZnJvbSBcIi4uL0xldmVsXCI7XG5cbmNvbnNvbGUubG9nKCdzcmMvTXlTdG9yZS9pbmRleC50cycpO1xuXG50eXBlIEV4cGVyaW1lbnRUeXBlID0gJ2V4YW0nIHwgJ3Rlc3QnO1xudHlwZSBEZW1vVHlwZSA9ICd2aWRlbycgfCAnYW5pbWF0aW9uJztcbnR5cGUgUGFnZU5hbWUgPSBcIm5ld1wiIC8vIEFLQSBUTGFzdFBhZ2VcbiAgICB8IFwicnVubmluZ1wiXG4gICAgfCBcInJlY29yZFwiXG4gICAgfCBcImZpbGVfdG9vbHNcIlxuICAgIHwgXCJzZXR0aW5nc1wiXG50eXBlIERldmlhdGlvblR5cGUgPSAncmh5dGhtJyB8ICd0ZW1wbyc7XG5cblxuaW50ZXJmYWNlIElTdWJjb25maWdCYXNlIHtcbiAgICBhbGxvd2VkX3JoeXRobV9kZXZpYXRpb246IHN0cmluZyxcbiAgICBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbjogc3RyaW5nLFxuICAgIGN1cnJlbnRfc3ViamVjdDogc3RyaW5nXG4gICAgZGVtb190eXBlOiBEZW1vVHlwZSxcbiAgICBlcnJvcnNfcGxheWluZ3NwZWVkOiBudW1iZXIsXG4gICAgZmluaXNoZWRfdHJpYWxzX2NvdW50OiBudW1iZXIsXG4gICAgbGV2ZWxzOiBJTGV2ZWxbXSxcbn1cblxuaW50ZXJmYWNlIElTdWJjb25maWcgZXh0ZW5kcyBJU3ViY29uZmlnQmFzZSB7IC8vIEFLQSBUQ29uZmlnXG4gICAgJ3NhdmVfcGF0aCc6IHN0cmluZ1xufVxuXG5pbnRlcmZhY2UgSVNhdmVkU3ViY29uZmlnIGV4dGVuZHMgSVN1YmNvbmZpZ0Jhc2UgeyAvLyBBS0EgVFNhdmVkQ29uZmlnXG4gICAgJ3RydXRoX2ZpbGVfcGF0aCc6IHN0cmluZ1xufVxuXG5pbnRlcmZhY2UgRGV2T3B0aW9ucyB7XG4gICAgXCJza2lwX3dob2xlX3RydXRoXCI6IGJvb2xlYW4sXG4gICAgXCJza2lwX2xldmVsX2ludHJvXCI6IGJvb2xlYW4sXG4gICAgXCJza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFja1wiOiBib29sZWFuLFxuICAgIFwic2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2tcIjogYm9vbGVhblxufVxuXG5pbnRlcmZhY2UgSU15U3RvcmUge1xuICAgICdjdXJyZW50X2V4YW0nOiBTdWJjb25maWcsXG4gICAgJ2N1cnJlbnRfdGVzdCc6IFN1YmNvbmZpZyxcbiAgICAnZGV2JzogYm9vbGVhbixcbiAgICAnZGV2b3B0aW9ucyc6IERldk9wdGlvbnMsXG4gICAgJ2V4cGVyaW1lbnRfdHlwZSc6IEV4cGVyaW1lbnRUeXBlLFxuICAgICdsYXN0X3BhZ2UnOiBQYWdlTmFtZSxcbiAgICAncm9vdF9hYnNfcGF0aCc6IHN0cmluZyxcbiAgICAnc3ViamVjdHMnOiBzdHJpbmdbXSxcbiAgICAndHJ1dGhfZmlsZV9wYXRoJzogc3RyaW5nLFxuICAgICd2ZWxvY2l0aWVzJzogbnVtYmVyW10sXG4gICAgJ3ZpZF9zaWxlbmNlX2xlbic6IG51bWJlcixcbn1cblxuXG5leHBvcnQgY2xhc3MgTXlTdG9yZSBleHRlbmRzIFN0b3JlPElNeVN0b3JlPiB7XG4gICAgXG4gICAgY29uc3RydWN0b3IoX2RvVHJ1dGhGaWxlQ2hlY2sgPSB0cnVlKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGlmICggX2RvVHJ1dGhGaWxlQ2hlY2sgKVxuICAgICAgICAgICAgdGhpcy5fZG9UcnV0aEZpbGVDaGVjaygpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHByaXZhdGUgYXN5bmMgX2RvVHJ1dGhGaWxlQ2hlY2soKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfwn5K+IE15U3RvcmUuX2RvVHJ1dGhGaWxlQ2hlY2soKScpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdHJ1dGggPSB0aGlzLnRydXRoKCk7XG4gICAgICAgIGlmICggdHJ1dGgudHh0LmFsbEV4aXN0KCkgKSB7XG4gICAgICAgICAgICByZXR1cm4gQWxlcnQuc21hbGwuc3VjY2VzcyhgQWxsIFwiJHt0cnV0aC5uYW1lfVwiIHR4dCBmaWxlcyBleGlzdC5gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0eHRGaWxlc0xpc3QgPSB0aGlzLnRydXRoRmlsZXNMaXN0KCd0eHQnKS5tYXAobXlmcy5yZW1vdmVfZXh0KTtcbiAgICAgICAgY29uc3QgZmlsdGVyZWRUeHRzID0gdHh0RmlsZXNMaXN0LmZpbHRlcihhID0+IHR4dEZpbGVzTGlzdC5maWx0ZXIodHh0ID0+IHR4dC5zdGFydHNXaXRoKGEpKS5sZW5ndGggPj0gMyk7XG4gICAgICAgIGlmICggIWJvb2woZmlsdGVyZWRUeHRzKSApXG4gICAgICAgICAgICByZXR1cm4gQWxlcnQuYmlnLndhcm5pbmcoe1xuICAgICAgICAgICAgICAgIHRpdGxlIDogJ05vIHZhbGlkIHRydXRoIGZpbGVzIGZvdW5kJyxcbiAgICAgICAgICAgICAgICBodG1sIDogJ1RoZXJlIG5lZWRzIHRvIGJlIGF0IGxlYXN0IG9uZSB0eHQgZmlsZSB3aXRoIDIgXCJvblwiIGFuZCBcIm9mZlwiIGNvdW50ZXJwYXJ0cy4nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gQWxlcnQuYmlnLmJsb2NraW5nKHtcbiAgICAgICAgICAgIHRpdGxlIDogYFRydXRoIGZpbGUgaW52YWxpZDogJHt0cnV0aC5uYW1lfWAsXG4gICAgICAgICAgICBodG1sIDogJzxiPlBsZWFzZSBjaG9vc2Ugb25lIG9mIHRoZSBmb2xsb3dpbmcgdmFsaWQgdHJ1dGhzOjwvYj4nLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBzdHJpbmdzIDogZmlsdGVyZWRUeHRzLFxuICAgICAgICAgICAgY2xpY2tGbiA6ICRzID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmNvbmZpZygpO1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuZmluaXNoZWRfdHJpYWxzX2NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLmxldmVscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKHBhdGguam9pbihwcm9jZXNzLmVudi5UUlVUSFNfUEFUSF9BQlMsICRzLnRleHQoKSkpO1xuICAgICAgICAgICAgICAgICAgICByZWxvYWRQYWdlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoIGVyciApIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N3YWwyLXRpdGxlJykuaW5uZXJUZXh0ID0gZXJyLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzd2FsMi1jb250ZW50Jykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc3dhbDItaWNvbiBzd2FsMi13YXJuaW5nJykuc3R5bGUuZGlzcGxheSA9ICdpbmhlcml0JztcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnOiBJU2F2ZWRTdWJjb25maWcsIGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBjb25zdCB0cnV0aEZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShzYXZlZENvbmZpZy50cnV0aF9maWxlX3BhdGgsICcudHh0Jyk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpcy50cnV0aF9maWxlX3BhdGggPSBuZXcgVHJ1dGgocGF0aC5qb2luKHByb2Nlc3MuZW52LlRSVVRIU19QQVRIX0FCUywgdHJ1dGhGaWxlTmFtZSkpO1xuICAgICAgICB0aGlzLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICB0aGlzLmNvbmZpZygpLmZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZyk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGNvbmZpZyh0eXBlPzogRXhwZXJpbWVudFR5cGUpOiBTdWJjb25maWcge1xuICAgICAgICBpZiAoIHR5cGUgKVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTdWJjb25maWcodHlwZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBuZXcgU3ViY29uZmlnKHRoaXMuZXhwZXJpbWVudF90eXBlKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGV4YW1wbGVcbiAgICAgdXBkYXRlKCdzdWJqZWN0cycsIFtuYW1lc10pXG4gICAgICovXG4gICAgdXBkYXRlKEs6IGtleW9mIElNeVN0b3JlLCBrdlBhaXJzOiBQYXJ0aWFsPElNeVN0b3JlPilcbiAgICB1cGRhdGUoSzoga2V5b2YgSU15U3RvcmUsIHZhbHVlczogYW55W10pXG4gICAgdXBkYXRlKEssIGt2KSB7XG4gICAgICAgIGxldCBWID0gdGhpcy5nZXQoSyk7XG4gICAgICAgIGlmICggQXJyYXkuaXNBcnJheShWKSApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KEssIFsgLi4uViwga3YgXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKFYsIGt2KTtcbiAgICAgICAgICAgIHRoaXMuc2V0KEssIFYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmdldChLKTtcbiAgICB9XG4gICAgXG4gICAgaW5jcmVhc2UoSzoga2V5b2YgSU15U3RvcmUpIHtcbiAgICAgICAgbGV0IFYgPSB0aGlzLmdldChLKTtcbiAgICAgICAgXG4gICAgICAgIGlmICggViA9PT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuc2V0KEssIDEpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVvZlYgPSB0eXBlb2YgVjtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGlmICggdHlwZW9mViA9PT0gJ251bWJlcicgfHwgKHR5cGVvZlYgPT09ICdzdHJpbmcnICYmIFYuaXNkaWdpdCgpKSApIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoSywgTWF0aC5mbG9vcihWKSArIDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJNeVN0b3JlIHRyaWVkIHRvIGluY3JlYXNlIGEgdmFsdWUgdGhhdCBpcyBub3QgYSBudW1iZXIgbm9yIGEgc3RyaW5nLmlzZGlnaXQoKVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgdHJ1dGgoKTogVHJ1dGgge1xuICAgICAgICBjb25zdCB0cnV0aHNEaXJQYXRoID0gcHJvY2Vzcy5lbnYuVFJVVEhTX1BBVEhfQUJTO1xuICAgICAgICBjb25zdCB0cnV0aEZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZSh0aGlzLnRydXRoX2ZpbGVfcGF0aCwgJy50eHQnKTtcbiAgICAgICAgcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odHJ1dGhzRGlyUGF0aCwgdHJ1dGhGaWxlTmFtZSkpO1xuICAgIH1cbiAgICBcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgc2V0IHRydXRoX2ZpbGVfcGF0aCh0cnV0aDogVHJ1dGgpIHtcbiAgICAgICAgXG4gICAgICAgIGlmICggdHJ1dGgudHh0LmFsbEV4aXN0KCkgKSB7XG4gICAgICAgICAgICB0aGlzLnNldChgdHJ1dGhfZmlsZV9wYXRoYCwgYGV4cGVyaW1lbnRzL3RydXRocy8ke3RydXRoLnR4dC5iYXNlLm5hbWV9YCk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IGFsbCB0eHQgZmlsZXMgb2YgdHJ1dGggZXhpc3Q6ICR7dHJ1dGgudHh0LmJhc2UubmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGdldCB0cnV0aF9maWxlX3BhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCd0cnV0aF9maWxlX3BhdGgnKTtcbiAgICB9XG4gICAgXG4gICAgLy8gLyoqQHJldHVybiB7c3RyaW5nfSovXG4gICAgLy8gZ2V0IHNhdmVfcGF0aCgpIHtcbiAgICAvLyBcdHJldHVybiB0aGlzLmdldCgnc2F2ZV9wYXRoJyk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gLyoqQHBhcmFtIHtzdHJpbmd9IHNhdmVQYXRoKi9cbiAgICAvLyBzZXQgc2F2ZV9wYXRoKHNhdmVQYXRoKSB7XG4gICAgLy8gXHR0aGlzLnNldCgnc2F2ZV9wYXRoJywgc2F2ZVBhdGgpO1xuICAgIC8vIH1cbiAgICBcbiAgICBnZXQgbGFzdF9wYWdlKCk6IFBhZ2VOYW1lIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdsYXN0X3BhZ2UnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGxhc3RfcGFnZShwYWdlOiBQYWdlTmFtZSkge1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdmFsaWRwYWdlcyA9IFsgXCJuZXdcIiwgXCJydW5uaW5nXCIsIFwicmVjb3JkXCIsIFwiZmlsZV90b29sc1wiLCBcInNldHRpbmdzXCIgXTtcbiAgICAgICAgaWYgKCAhdmFsaWRwYWdlcy5pbmNsdWRlcyhwYWdlKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IGxhc3RfcGFnZShcIiR7cGFnZX1cIiksIG11c3QgYmUgb25lIG9mICR7dmFsaWRwYWdlcy5qb2luKCcsICcpfS4gc2V0dGluZyB0byBuZXdgKTtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCAnbmV3Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnbGFzdF9wYWdlJywgcGFnZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IGV4cGVyaW1lbnRfdHlwZSgpOiBFeHBlcmltZW50VHlwZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnZXhwZXJpbWVudF90eXBlJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBleHBlcmltZW50X3R5cGUoZXhwZXJpbWVudFR5cGU6IEV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIGlmICggZXhwZXJpbWVudFR5cGUgIT09ICd0ZXN0JyAmJiBleHBlcmltZW50VHlwZSAhPT0gJ2V4YW0nICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBNeVN0b3JlIGV4cGVyaW1lbnRfdHlwZSBzZXR0ZXIsIGdvdCBleHBlcmltZW50VHlwZTogJyR7ZXhwZXJpbWVudFR5cGV9Jy4gTXVzdCBiZSBlaXRoZXIgJ3Rlc3QnIG9yICdleGFtJy4gc2V0dGluZyB0byB0ZXN0YCk7XG4gICAgICAgICAgICB0aGlzLnNldCgnZXhwZXJpbWVudF90eXBlJywgJ3Rlc3QnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdleHBlcmltZW50X3R5cGUnLCBleHBlcmltZW50VHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdGhpcy5fdXBkYXRlU2F2ZWRGaWxlKCdleHBlcmltZW50X3R5cGUnLCBleHBlcmltZW50VHlwZSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGdldCByb290X2Fic19wYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnNvbGUud2FybignY2FsbGVkIHJvb3RfYWJzX3BhdGgsIHNob3VsZCB1c2UgcHJvY2Vzcy5lbnYuUk9PVF9QQVRIX0FCUycpO1xuICAgICAgICByZXR1cm4gcHJvY2Vzcy5lbnYuUk9PVF9QQVRIX0FCUztcbiAgICB9XG4gICAgXG4gICAgc2V0IHN1YmplY3RzKHN1YmplY3RMaXN0OiBzdHJpbmdbXSkge1xuICAgICAgICBjb25zdCBzdWJqZWN0cyA9IFsgLi4ubmV3IFNldChzdWJqZWN0TGlzdCkgXTtcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfkr4gc2V0IHN1YmplY3RzOicsIHN1YmplY3RzKTtcbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3RzJywgc3ViamVjdHMpO1xuICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmNvbmZpZygpO1xuICAgICAgICBjb25zdCBjdXJyZW50U3ViamVjdCA9IGNvbmZpZy5jdXJyZW50X3N1YmplY3Q7XG4gICAgICAgIGlmICggY3VycmVudFN1YmplY3QgJiYgIXN1YmplY3RzLmluY2x1ZGVzKGN1cnJlbnRTdWJqZWN0KSApXG4gICAgICAgICAgICBjb25maWcuY3VycmVudF9zdWJqZWN0ID0gbnVsbDtcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGNvbmZpZ3NQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnNvbGUud2FybignY2FsbGVkIGNvbmZpZ3NQYXRoLCBzaG91bGQgdXNlIHByb2Nlc3MuZW52LkNPTkZJR1NfUEFUSF9BQlMnKTtcbiAgICAgICAgcmV0dXJuIHByb2Nlc3MuZW52LkNPTkZJR1NfUEFUSF9BQlM7XG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICB0cnV0aHNEaXJQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnNvbGUud2FybignY2FsbGVkIHRydXRoc0RpclBhdGgsIHNob3VsZCB1c2UgcHJvY2Vzcy5lbnYuVFJVVEhTX1BBVEhfQUJTJyk7XG4gICAgICAgIHJldHVybiBwcm9jZXNzLmVudi5UUlVUSFNfUEFUSF9BQlM7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIHRydXRoRmlsZXNMaXN0KGV4dEZpbHRlcj86IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICAgICAgaWYgKCBleHRGaWx0ZXIgKSB7XG4gICAgICAgICAgICBpZiAoIGV4dEZpbHRlci5zdGFydHNXaXRoKCcuJykgKVxuICAgICAgICAgICAgICAgIGV4dEZpbHRlciA9IGV4dEZpbHRlci5zbGljZSgxKTtcbiAgICAgICAgICAgIGlmICggIVsgJ3R4dCcsICdtaWQnLCAnbXA0JyBdLmluY2x1ZGVzKGV4dEZpbHRlcikgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGB0cnV0aEZpbGVzTGlzdChcIiR7ZXh0RmlsdGVyfVwiKSwgbXVzdCBiZSBlaXRoZXIgWyd0eHQnLCdtaWQnLCdtcDQnXSBvciBub3QgYXQgYWxsLiBzZXR0aW5nIHRvIHVuZGVmaW5lZGApO1xuICAgICAgICAgICAgICAgIGV4dEZpbHRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgdHJ1dGhzRGlyUGF0aCA9IHRoaXMudHJ1dGhzRGlyUGF0aCgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IHRydXRoRmlsZXMgPSBbIC4uLm5ldyBTZXQoZnMucmVhZGRpclN5bmModHJ1dGhzRGlyUGF0aCkpIF07XG4gICAgICAgIGlmICggYm9vbChleHRGaWx0ZXIpIClcbiAgICAgICAgICAgIHJldHVybiB0cnV0aEZpbGVzLmZpbHRlcihmID0+IHBhdGguZXh0bmFtZShmKSA9PSBgLiR7ZXh0RmlsdGVyfWApO1xuICAgICAgICByZXR1cm4gdHJ1dGhGaWxlcztcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIHN1YmplY3RzRGlyUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NhbGxlZCBzdWJqZWN0c0RpclBhdGgsIHNob3VsZCB1c2UgcHJvY2Vzcy5lbnYuU1VCSkVDVFNfUEFUSF9BQlMnKTtcbiAgICAgICAgcmV0dXJuIHByb2Nlc3MuZW52LlNVQkpFQ1RTX1BBVEhfQUJTXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBzYWxhbWFuZGVyRGlyUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2NhbGxlZCBzYWxhbWFuZGVyRGlyUGF0aCwgc2hvdWxkIHVzZSBwcm9jZXNzLmVudi5TQUxBTUFOREVSX1BBVEhfQUJTJyk7XG4gICAgICAgIHJldHVybiBwcm9jZXNzLmVudi5TQUxBTUFOREVSX1BBVEhfQUJTXG4gICAgfVxuICAgIFxuICAgIFxuICAgIHByaXZhdGUgZ2V0IGRldigpOiB7IFtLIGluIGtleW9mIERldk9wdGlvbnNdOiAoKSA9PiBib29sZWFuIH0ge1xuICAgICAgICBjb25zdCBfZGV2ID0gdGhpcy5nZXQoJ2RldicpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2tpcF93aG9sZV90cnV0aCA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX3dob2xlX3RydXRoLFxuICAgICAgICAgICAgc2tpcF9sZXZlbF9pbnRybyA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX2xldmVsX2ludHJvLFxuICAgICAgICAgICAgc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2sgOiAoKSA9PiBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2ssXG4gICAgICAgICAgICBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgXG59XG5cblxuY2xhc3MgU3ViY29uZmlnIGV4dGVuZHMgTXlTdG9yZSB7IC8vIEFLQSBDb25maWdcbiAgICBwcml2YXRlIHJlYWRvbmx5IHR5cGU6IEV4cGVyaW1lbnRUeXBlO1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IF9LRVlTOiAoa2V5b2YgSVN1YmNvbmZpZylbXSA9IFtcbiAgICAgICAgJ2FsbG93ZWRfcmh5dGhtX2RldmlhdGlvbicsXG4gICAgICAgICdhbGxvd2VkX3RlbXBvX2RldmlhdGlvbicsXG4gICAgICAgICdjdXJyZW50X3N1YmplY3QnLFxuICAgICAgICAnZGVtb190eXBlJyxcbiAgICAgICAgJ2Vycm9yc19wbGF5aW5nc3BlZWQnLFxuICAgICAgICAnZmluaXNoZWRfdHJpYWxzX2NvdW50JyxcbiAgICAgICAgJ2xldmVscycsXG4gICAgICAgICdzYXZlX3BhdGgnXG4gICAgXTtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih0eXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBzdXBlcihmYWxzZSk7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIHRvU2F2ZWRDb25maWcoKTogSVNhdmVkU3ViY29uZmlnIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBjb25zdCBzZWxmOiBDb25mPElTdWJjb25maWc+ID0gc3VwZXIuZ2V0KGBjdXJyZW50XyR7dGhpcy50eXBlfWApO1xuICAgICAgICBzZWxmLmRlbGV0ZSgnc2F2ZV9wYXRoJyk7XG4gICAgICAgIC8vIGRlbGV0ZSBzZWxmLnNhdmVfcGF0aDtcbiAgICAgICAgY29uc3Qgc2F2ZWRDb25maWcgPSB7XG4gICAgICAgICAgICAuLi5zZWxmLFxuICAgICAgICAgICAgdHJ1dGhfZmlsZV9wYXRoIDogc3VwZXIudHJ1dGhfZmlsZV9wYXRoXG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUud2Fybignc2F2ZWRDb25maWcsIGNoZWNrIGlmIGRlbGV0ZWQgc2F2ZV9wYXRoOicsIHNlbGYpO1xuICAgICAgICByZXR1cm4gc2F2ZWRDb25maWc7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZzogSVNhdmVkU3ViY29uZmlnLCAuLi5hcmdzKSB7XG4gICAgICAgIHRoaXMubGV2ZWxzID0gc2F2ZWRDb25maWcubGV2ZWxzO1xuICAgICAgICB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudCA9IHNhdmVkQ29uZmlnLmZpbmlzaGVkX3RyaWFsc19jb3VudDtcbiAgICAgICAgdGhpcy5lcnJvcnNfcGxheWluZ3NwZWVkID0gc2F2ZWRDb25maWcuZXJyb3JzX3BsYXlpbmdzcGVlZDtcbiAgICAgICAgdGhpcy5kZW1vX3R5cGUgPSBzYXZlZENvbmZpZy5kZW1vX3R5cGU7XG4gICAgICAgIHRoaXMuY3VycmVudF9zdWJqZWN0ID0gc2F2ZWRDb25maWcuY3VycmVudF9zdWJqZWN0O1xuICAgICAgICB0aGlzLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uID0gc2F2ZWRDb25maWcuYWxsb3dlZF90ZW1wb19kZXZpYXRpb247XG4gICAgICAgIHRoaXMuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uID0gc2F2ZWRDb25maWcuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uO1xuICAgICAgICB0aGlzLl91cGRhdGVTYXZlZEZpbGUoJ3RydXRoX2ZpbGVfcGF0aCcsIHNhdmVkQ29uZmlnLnRydXRoX2ZpbGVfcGF0aCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIHByaXZhdGUgX3VwZGF0ZVNhdmVkRmlsZShrZXk6IGtleW9mIElTYXZlZFN1YmNvbmZpZywgdmFsdWUpIHtcbiAgICAgICAgY29uc3QgY29uZiA9IG5ldyAocmVxdWlyZSgnY29uZicpKSh7XG4gICAgICAgICAgICBjd2QgOiBwYXRoLmRpcm5hbWUocGF0aC5qb2luKHByb2Nlc3MuZW52LlJPT1RfUEFUSF9BQlMsIHRoaXMuc2F2ZV9wYXRoKSksXG4gICAgICAgICAgICBjb25maWdOYW1lIDogbXlmcy5yZW1vdmVfZXh0KHBhdGguYmFzZW5hbWUodGhpcy5zYXZlX3BhdGgpKSxcbiAgICAgICAgICAgIGZpbGVFeHRlbnNpb24gOiB0aGlzLnR5cGUsXG4gICAgICAgICAgICBzZXJpYWxpemUgOiB2YWx1ZSA9PiBKU09OLnN0cmluZ2lmeSh2YWx1ZSwgbnVsbCwgNClcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCfwn5K+IF91cGRhdGVTYXZlZEZpbGUoa2V5LHZhbHVlKScsIHsga2V5LCB2YWx1ZSwgY29uZiB9KTtcbiAgICAgICAgY29uZi5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIHByaXZhdGUgX2dldChrZXk6IGtleW9mIElTdWJjb25maWcpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gc3VwZXIuZ2V0KGBjdXJyZW50XyR7dGhpcy50eXBlfS4ke2tleX1gKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgcHJpdmF0ZSBfc2V0KGtleToga2V5b2YgSVN1YmNvbmZpZywgdmFsdWUpIHtcbiAgICAgICAgY29uc3QgdHlwZW9mS2V5ID0gdHlwZW9mIGtleTtcbiAgICAgICAgaWYgKCB0eXBlb2ZLZXkgPT09ICdzdHJpbmcnICkge1xuICAgICAgICAgICAgaWYgKCAhU3ViY29uZmlnLl9LRVlTLmluY2x1ZGVzKGtleSkgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBTdWJjb25maWcoJHt0aGlzLnR5cGV9KS5fc2V0OiBcImtleVwiIChcIiR7a2V5fVwiKSBpcyBzdHJpbmcgYnV0IG5vdCBpbiB0aGlzLl9LRVlTYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgc3VwZXJrZXkgPSBgY3VycmVudF8ke3RoaXMudHlwZX0uJHtrZXl9YDtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHN1cGVyLnNldChzdXBlcmtleSwgdmFsdWUpO1xuICAgICAgICAgICAgaWYgKCBrZXkgIT09IFwic2F2ZV9wYXRoXCIgKVxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNhdmVkRmlsZShrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS53YXJuKGBTdWJjb25maWcoJHt0aGlzLnR5cGV9KS5fc2V0OiBcImtleVwiIChcIiR7a2V5fVwiKSBpcyBub3Qgc3RyaW5nLiB0eXBlOiAke3R5cGVvZktleX1gKTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBfc2V0RGV2aWF0aW9uKGRldmlhdGlvblR5cGU6IERldmlhdGlvblR5cGUsIGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHR5cGVvZkRldmlhdGlvbiA9IHR5cGVvZiBkZXZpYXRpb247XG4gICAgICAgIGlmICggdHlwZW9mRGV2aWF0aW9uID09PSAnbnVtYmVyJyApIHtcbiAgICAgICAgICAgIGRldmlhdGlvbiA9IGAke2RldmlhdGlvbn0lYDtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgX3NldERldmlhdGlvbiBnb3QgXCJkZXZpYXRpb25cIiB0eXBlIG51bWJlci4gYXBwZW5kZWQgXCIlXCIuIGRldmlhdGlvbiBub3c6ICR7ZGV2aWF0aW9ufWApO1xuICAgICAgICB9IGVsc2UgaWYgKCB0eXBlb2ZEZXZpYXRpb24gPT09ICdzdHJpbmcnICkge1xuICAgICAgICAgICAgaWYgKCAhZGV2aWF0aW9uLmVuZHNXaXRoKFwiJVwiKSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYF9zZXREZXZpYXRpb24gZ290IGRldmlhdGlvbiB3aXRob3V0ICUuIGFwcGVuZGVkICUuIGRldmlhdGlvbiBub3c6IFwiJHtkZXZpYXRpb259XCJgKTtcbiAgICAgICAgICAgICAgICBkZXZpYXRpb24gPSBgJHtkZXZpYXRpb259JWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYF9zZXREZXZpYXRpb24sIHJlY2VpdmVkIFwiZGV2aWF0aW9uXCIgbm90IHN0cmluZyBub3QgbnVtYmVyLiByZXR1cm5pbmcuIGRldmlhdGlvbjpgLCBkZXZpYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMuX3NldChgYWxsb3dlZF8ke2RldmlhdGlvblR5cGV9X2RldmlhdGlvbmAsIGRldmlhdGlvbik7XG4gICAgfVxuICAgIFxuICAgIGdldCBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0KCdhbGxvd2VkX3RlbXBvX2RldmlhdGlvbicpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgYWxsb3dlZF90ZW1wb19kZXZpYXRpb24oZGV2aWF0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fc2V0RGV2aWF0aW9uKFwidGVtcG9cIiwgZGV2aWF0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0IGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0KCdhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24nKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbihkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICB0aGlzLl9zZXREZXZpYXRpb24oXCJyaHl0aG1cIiwgZGV2aWF0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IGN1cnJlbnRfc3ViamVjdCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0KCdjdXJyZW50X3N1YmplY3QnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGN1cnJlbnRfc3ViamVjdChuYW1lOiBzdHJpbmcgfCBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfwn5K+IHNldCBjdXJyZW50X3N1YmplY3QoJywgbmFtZSwgJyknKTtcbiAgICAgICAgdGhpcy5fc2V0KCdjdXJyZW50X3N1YmplY3QnLCBuYW1lKTtcbiAgICAgICAgaWYgKCBuYW1lIClcbiAgICAgICAgICAgIC8vIHN1cGVyLnNldCgnc3ViamVjdHMnLCBbLi4ubmV3IFNldChbLi4uc3VwZXIuZ2V0KCdzdWJqZWN0cycpLCBuYW1lXSldKTtcbiAgICAgICAgICAgIHN1cGVyLnN1YmplY3RzID0gWyAuLi5zdXBlci5nZXQoJ3N1YmplY3RzJyksIG5hbWUgXTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IGVycm9yc19wbGF5aW5nc3BlZWQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnZXJyb3JzX3BsYXlpbmdzcGVlZCcpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZXJyb3JzX3BsYXlpbmdzcGVlZChzcGVlZDogbnVtYmVyKSB7XG4gICAgICAgIGlmICggaXNOYU4oc3BlZWQpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBjb25maWcgc2V0IGVycm9yc19wbGF5aW5nc3BlZWQsIHJlY2VpdmVkIGJhZCBcInNwZWVkXCIgTmFOOiAke3NwZWVkfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fc2V0KCdlcnJvcnNfcGxheWluZ3NwZWVkJywgc3BlZWQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBnZXQgc2F2ZV9wYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ3NhdmVfcGF0aCcpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgc2F2ZV9wYXRoKHNhdmVQYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdzZXQgc2F2ZV9wYXRoIHJldHVybnMgYSB2YWx1ZSwgaXMgdGhpcyBuZWVkZWQ/Jyk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldCgnc2F2ZV9wYXRoJywgc2F2ZVBhdGgpO1xuICAgIH1cbiAgICBcbiAgICBnZXQgZGVtb190eXBlKCk6IERlbW9UeXBlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnZGVtb190eXBlJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBkZW1vX3R5cGUodHlwZTogRGVtb1R5cGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdzZXQgZGVtb190eXBlIHJldHVybnMgYSB2YWx1ZSwgaXMgdGhpcyBuZWVkZWQ/Jyk7XG4gICAgICAgIGlmICggIVsgJ3ZpZGVvJywgJ2FuaW1hdGlvbicgXS5pbmNsdWRlcyh0eXBlKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQ29uZmlnIGRlbW9fdHlwZSBzZXR0ZXIsIGJhZCB0eXBlID0gJHt0eXBlfSwgY2FuIGJlIGVpdGhlciB2aWRlbyBvciBhbmltYXRpb25gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZXQoJ2RlbW9fdHlwZScsIHR5cGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldCBmaW5pc2hlZF90cmlhbHNfY291bnQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldCgnZmluaXNoZWRfdHJpYWxzX2NvdW50Jyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBmaW5pc2hlZF90cmlhbHNfY291bnQoY291bnQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLl9zZXQoJ2ZpbmlzaGVkX3RyaWFsc19jb3VudCcsIGNvdW50KTtcbiAgICB9XG4gICAgXG4gICAgZ2V0IGxldmVscygpOiBJTGV2ZWxbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQoJ2xldmVscycpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbGV2ZWxzKGxldmVsczogSUxldmVsW10pIHtcbiAgICAgICAgaWYgKCAhQXJyYXkuaXNBcnJheShsZXZlbHMpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGV2ZWxzLCByZWNlaXZlZCBcImxldmVsc1wiIG5vdCBpc0FycmF5LiBsZXZlbHM6IGAsIGxldmVscyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9zZXQoJ2xldmVscycsIGxldmVscyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgY3VycmVudFRyaWFsQ29vcmRzKCk6IG51bWJlcltdIHtcbiAgICAgICAgLy8gbGV0IHsgbGV2ZWxzLCBmaW5pc2hlZF90cmlhbHNfY291bnQgfSA9IHRoaXMuY29uZmlnKCk7XG4gICAgICAgIGxldCBmbGF0VHJpYWxzTGlzdCA9IHRoaXMubGV2ZWxzLm1hcChsZXZlbCA9PiBsZXZlbC50cmlhbHMpO1xuICAgICAgICBmb3IgKCBsZXQgWyBsZXZlbEluZGV4LCB0cmlhbHNOdW0gXSBvZiBlbnVtZXJhdGUoZmxhdFRyaWFsc0xpc3QpICkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgdHJpYWxTdW1Tb0ZhciA9IHN1bShmbGF0VHJpYWxzTGlzdC5zbGljZSgwLCBsZXZlbEluZGV4ICsgMSkpO1xuICAgICAgICAgICAgY29uc3QgZmluaXNoZWRUcmlhbHNDb3VudCA9IHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgICAgICAgICAgaWYgKCB0cmlhbFN1bVNvRmFyID4gZmluaXNoZWRUcmlhbHNDb3VudCApXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsgbGV2ZWxJbmRleCwgdHJpYWxzTnVtIC0gKHRyaWFsU3VtU29GYXIgLSBmaW5pc2hlZFRyaWFsc0NvdW50KSBdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUud2FybihcImN1cnJlbnRUcmlhbENvb3Jkczogb3V0IG9mIGluZGV4IGVycm9yXCIpO1xuICAgIH1cbiAgICBcbiAgICBpc0RlbW9WaWRlbygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVtb190eXBlID09ICd2aWRlbyc7XG4gICAgfVxuICAgIFxuICAgIGlzV2hvbGVUZXN0T3ZlcigpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHN1bSh0aGlzLmxldmVscy5tYXAobGV2ZWwgPT4gbGV2ZWwudHJpYWxzKSkgPT0gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgfVxuICAgIFxuICAgIGdldFN1YmplY3REaXJOYW1lcygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiBmcy5yZWFkZGlyU3luYyhwYXRoLmpvaW4oc3VwZXIuZ2V0KCdyb290X2Fic19wYXRoJyksICdleHBlcmltZW50cycsICdzdWJqZWN0cycpKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0Q3VycmVudExldmVsKCk6IExldmVsIHtcbiAgICAgICAgXG4gICAgICAgIGxldCBbIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCBdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBMZXZlbCh0aGlzLmxldmVsc1tsZXZlbF9pbmRleF0sIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldExldmVsQ29sbGVjdGlvbigpOiBMZXZlbENvbGxlY3Rpb24ge1xuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIHJldHVybiBuZXcgTGV2ZWxDb2xsZWN0aW9uKHRoaXMubGV2ZWxzLCBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXgpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipHZXRzIHRoZSBjdXJyZW50IHRyaWFsJ3MgcGF0aCAoam9pbiB0aGlzLnRlc3RPdXRQYXRoKCkgYW5kIGxldmVsXyR7bGV2ZWxfaW5kZXh9Li4uKSwgYW5kIHJldHVybnMgYSBUcnV0aCBvZiBpdCovXG4gICAgdHJpYWxUcnV0aCgpOiBUcnV0aCB7XG4gICAgICAgIGxldCBbIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCBdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgLy8gcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odGhpcy50ZXN0T3V0UGF0aCgpLCBgbGV2ZWxfJHtsZXZlbF9pbmRleH1fdHJpYWxfJHt0cmlhbF9pbmRleH1gKSk7XG4gICAgICAgIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRoaXMudGVzdE91dFBhdGgoKSwgYGxldmVsXyR7bGV2ZWxfaW5kZXh9X3RyaWFsXyR7dHJpYWxfaW5kZXh9YCkpO1xuICAgIH1cbiAgICBcbiAgICAvKipcImM6XFxTeW5jXFxDb2RlXFxQeXRob25cXFB5YW5vLXJlbGVhc2VcXHNyY1xcZXhwZXJpbWVudHNcXHN1YmplY3RzXFxnaWxhZFxcZnVyX2VsaXNlXCIqL1xuICAgIHRlc3RPdXRQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGN1cnJTdWJqZWN0RGlyID0gcGF0aC5qb2luKHByb2Nlc3MuZW52LlNVQkpFQ1RTX1BBVEhfQUJTLCB0aGlzLmN1cnJlbnRfc3ViamVjdCk7IC8vIFwiLi4uL3N1YmplY3RzL2dpbGFkXCJcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbihjdXJyU3ViamVjdERpciwgdGhpcy50cnV0aCgpLm5hbWUpO1xuICAgIH1cbiAgICBcbiAgICBcbn1cbiJdfQ==