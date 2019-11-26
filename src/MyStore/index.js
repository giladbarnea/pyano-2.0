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
        const propVal = config.get(prop);
        config.cache[prop] = propVal;
        return propVal;
    }
    else {
        return config.cache[prop];
    }
}
function getTruthFilesWhere({ extension } = { extension: undefined }) {
    if (extension) {
        if (extension.startsWith('.')) {
            extension = extension.slice(1);
        }
        if (!['txt', 'mid', 'mp4'].includes(extension)) {
            console.warn(`truthFilesList("${extension}"), must be either ['txt','mid','mp4'] or not at all. setting to undefined`);
            extension = undefined;
        }
    }
    let truthFiles = [...new Set(fs.readdirSync(TRUTHS_PATH_ABS))];
    let formattedTruthFiles = [];
    for (let file of truthFiles) {
        let [name, ext] = MyFs_1.default.split_ext(file);
        if (extension) {
            if (ext.lower() === `.${extension}`) {
                formattedTruthFiles.push(name);
            }
        }
        else {
            formattedTruthFiles.push(name);
        }
    }
    return formattedTruthFiles;
}
exports.getTruthFilesWhere = getTruthFilesWhere;
function getTruthsWith3TxtFiles() {
    const txtFilesList = getTruthFilesWhere({ extension: 'txt' });
    const wholeTxtFiles = [];
    for (let name of txtFilesList) {
        if (txtFilesList.count(txt => txt.startsWith(name)) >= 3) {
            wholeTxtFiles.push(name);
        }
    }
    return txtFilesList.filter(a => txtFilesList.filter(txt => txt.startsWith(a)).length >= 3);
}
exports.getTruthsWith3TxtFiles = getTruthsWith3TxtFiles;
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
            console.warn(`BigConfig experiment_type setter, got experimentType: '${experimentType}'. Must be either 'test' or 'exam'. setting to test`);
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
    }
    get dev() {
        const _dev = this.get('dev');
        return {
            max_animation_notes: () => {
                if (_dev) {
                    const max_animation_notes = this.get('devoptions').max_animation_notes;
                    if (max_animation_notes)
                        console.warn(`devoptions.max_animation_notes: ${max_animation_notes}`);
                    return max_animation_notes;
                }
                return null;
            },
            mute_animation: () => {
                const mute_animation = _dev && this.get('devoptions').mute_animation;
                if (mute_animation)
                    console.warn(`devoptions.mute_animation`);
                return mute_animation;
            },
            skip_midi_exists_check: () => {
                const skip_midi_exists_check = _dev && this.get('devoptions').skip_midi_exists_check;
                if (skip_midi_exists_check)
                    console.warn(`devoptions.skip_midi_exists_check`);
                return skip_midi_exists_check;
            },
            skip_whole_truth: () => {
                const skip_whole_truth = _dev && this.get('devoptions').skip_whole_truth;
                if (skip_whole_truth)
                    console.warn(`devoptions.skip_whole_truth`);
                return skip_whole_truth;
            },
            skip_level_intro: () => {
                const skip_level_intro = _dev && this.get('devoptions').skip_level_intro;
                if (skip_level_intro)
                    console.warn(`devoptions.skip_level_intro`);
                return skip_level_intro;
            },
            skip_passed_trial_feedback: () => {
                const skip_passed_trial_feedback = _dev && this.get('devoptions').skip_passed_trial_feedback;
                if (skip_passed_trial_feedback)
                    console.warn(`devoptions.skip_passed_trial_feedback`);
                return skip_passed_trial_feedback;
            },
            skip_failed_trial_feedback: () => {
                const skip_failed_trial_feedback = _dev && this.get('devoptions').skip_failed_trial_feedback;
                if (skip_failed_trial_feedback)
                    console.warn(`devoptions.skip_failed_trial_feedback`);
                return skip_failed_trial_feedback;
            },
            reload_page_on_submit: () => {
                const reload_page_on_submit = _dev && this.get('devoptions').reload_page_on_submit;
                if (reload_page_on_submit)
                    console.warn(`devoptions.reload_page_on_submit`);
                return reload_page_on_submit;
            },
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
            if (subconfig.store) {
                defaults = Object.assign(Object.assign({}, subconfig.store), { name });
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
        this.cache = { name };
        this.type = type;
        if (subconfig) {
            this.set(Object.assign(Object.assign({}, subconfig.store), { name }));
        }
        try {
            this.truth = new Truth_1.Truth(MyFs_1.default.remove_ext(this.truth_file));
        }
        catch (e) {
            console.error(`Subconfig constructor, initializing new Truth from this.truth_file threw an error. Probably because this.truth_file is undefined. Should maybe nest under if(subconfig) clause`, "this.truth_file", this.truth_file, e);
        }
    }
    async doTruthFileCheck() {
        console.log(`💾 Subconfig(${this.type}).doTruthFileCheck()`);
        if (this.truth.txt.allExist()) {
            return MyAlert_1.default.small.success(`${this.truth.name}.txt, *_on.txt, and *_off.txt files exist.`);
        }
        const truthsWith3TxtFiles = getTruthsWith3TxtFiles();
        if (!util_1.bool(truthsWith3TxtFiles))
            return MyAlert_1.default.big.warning({
                title: 'No valid truth files found',
                html: 'There needs to be at least one txt file with one "on" and one "off" counterparts.'
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
        console.warn(`used subconfig.increase, UNTESTED`);
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
        const obj = this.store;
        delete obj.name;
        return obj;
    }
    fromSubconfig(subconfig) {
        if (DRYRUN)
            return console.warn('fromObj, DRYRUN. returning');
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
        return tryGetFromCache(this, "demo_type");
    }
    set demo_type(type) {
        if (!['video', 'animation'].includes(type)) {
            console.warn(`Config demo_type setter, bad type = ${type}, can be either video or animation. Not setting`);
        }
        else {
            this.set('demo_type', type);
            this.cache.demo_type = type;
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
        return tryGetFromCache(this, 'truth_file');
    }
    set truth_file(truth_file) {
        let [name, ext] = MyFs_1.default.split_ext(truth_file);
        if (util_1.bool(ext)) {
            console.warn(`set truth_file, passed name is not extensionless: ${truth_file}. Continuing with "${name}"`);
        }
        try {
            let truth = new Truth_1.Truth(name);
            if (!truth.txt.allExist()) {
                MyAlert_1.default.small.warning(`Not all txt files exist: ${name}`);
            }
            this.truth = truth;
        }
        catch (e) {
            MyAlert_1.default.small.warning(e);
            console.warn(e);
        }
        this.set(`truth_file`, name);
        this.cache.truth_file = name;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFDM0Isa0NBQTJEO0FBQzNELG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsNkJBQTZCO0FBRTdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQWlEdEMsU0FBUyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUk7SUFDakMsSUFBSyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRztRQUNwQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzdCLE9BQU8sT0FBTyxDQUFDO0tBQ2xCO1NBQU07UUFDSCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDN0I7QUFDTCxDQUFDO0FBR0QsU0FBZ0Isa0JBQWtCLENBQUMsRUFBRSxTQUFTLEtBQTRDLEVBQUUsU0FBUyxFQUFHLFNBQVMsRUFBRTtJQUMvRyxJQUFLLFNBQVMsRUFBRztRQUNiLElBQUssU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRztZQUU3QixTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsQztRQUNELElBQUssQ0FBQyxDQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFHO1lBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLFNBQVMsNEVBQTRFLENBQUMsQ0FBQztZQUN2SCxTQUFTLEdBQUcsU0FBUyxDQUFDO1NBQ3pC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QUFDLENBQUM7SUFDdEQsQ0FBQztDQUdKO0FBbFhELDhCQWtYQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFN0b3JlIGZyb20gXCJlbGVjdHJvbi1zdG9yZVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgQWxlcnQgZnJvbSBcIi4uL015QWxlcnRcIjtcbmltcG9ydCBteWZzIGZyb20gXCIuLi9NeUZzXCI7XG5pbXBvcnQgeyBib29sLCByZWxvYWRQYWdlLCBzdW0sIGVudW1lcmF0ZSB9IGZyb20gXCIuLi91dGlsXCI7XG5pbXBvcnQgeyBUcnV0aCB9IGZyb20gXCIuLi9UcnV0aFwiO1xuaW1wb3J0IHsgSUxldmVsLCBMZXZlbCwgTGV2ZWxDb2xsZWN0aW9uIH0gZnJvbSBcIi4uL0xldmVsXCI7XG5pbXBvcnQgeyBTd2VldEFsZXJ0UmVzdWx0IH0gZnJvbSBcInN3ZWV0YWxlcnQyXCI7XG5pbXBvcnQgKiBhcyBDb25mIGZyb20gJ2NvbmYnO1xuXG5jb25zb2xlLmxvZygnc3JjL0JpZ0NvbmZpZy9pbmRleC50cycpO1xuXG5leHBvcnQgdHlwZSBFeHBlcmltZW50VHlwZSA9ICdleGFtJyB8ICd0ZXN0JztcbmV4cG9ydCB0eXBlIERlbW9UeXBlID0gJ3ZpZGVvJyB8ICdhbmltYXRpb24nO1xuZXhwb3J0IHR5cGUgUGFnZU5hbWUgPSBcIm5ld1wiIC8vIEFLQSBUTGFzdFBhZ2VcbiAgICB8IFwicnVubmluZ1wiXG4gICAgfCBcInJlY29yZFwiXG4gICAgfCBcImZpbGVfdG9vbHNcIlxuICAgIHwgXCJzZXR0aW5nc1wiXG50eXBlIERldmlhdGlvblR5cGUgPSAncmh5dGhtJyB8ICd0ZW1wbyc7XG5cblxuaW50ZXJmYWNlIElTdWJjb25maWcge1xuICAgIGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbjogc3RyaW5nLFxuICAgIGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uOiBzdHJpbmcsXG4gICAgZGVtb190eXBlOiBEZW1vVHlwZSxcbiAgICBlcnJvcnNfcGxheXJhdGU6IG51bWJlcixcbiAgICBmaW5pc2hlZF90cmlhbHNfY291bnQ6IG51bWJlcixcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgc3ViamVjdDogc3RyaW5nLFxuICAgIHRydXRoX2ZpbGU6IHN0cmluZyxcbiAgICBsZXZlbHM6IElMZXZlbFtdLFxufVxuXG5cbmludGVyZmFjZSBEZXZPcHRpb25zIHtcbiAgICBtYXhfYW5pbWF0aW9uX25vdGVzOiBudWxsIHwgbnVtYmVyLFxuICAgIG11dGVfYW5pbWF0aW9uOiBib29sZWFuLFxuICAgIHNraXBfbWlkaV9leGlzdHNfY2hlY2s6IGJvb2xlYW4sXG4gICAgc2tpcF93aG9sZV90cnV0aDogYm9vbGVhbixcbiAgICBza2lwX2xldmVsX2ludHJvOiBib29sZWFuLFxuICAgIHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrOiBib29sZWFuLFxuICAgIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrOiBib29sZWFuLFxuICAgIHJlbG9hZF9wYWdlX29uX3N1Ym1pdDogYm9vbGVhblxufVxuXG5pbnRlcmZhY2UgSUJpZ0NvbmZpZyB7XG4gICAgZGV2OiBib29sZWFuLFxuICAgIGRldm9wdGlvbnM6IERldk9wdGlvbnMsXG4gICAgZXhhbV9maWxlOiBzdHJpbmcsXG4gICAgdGVzdF9maWxlOiBzdHJpbmcsXG4gICAgZXhwZXJpbWVudF90eXBlOiBFeHBlcmltZW50VHlwZSxcbiAgICBsYXN0X3BhZ2U6IFBhZ2VOYW1lLFxuICAgIHN1YmplY3RzOiBzdHJpbmdbXSxcbiAgICB2ZWxvY2l0aWVzOiBudW1iZXJbXSxcbn1cblxuZnVuY3Rpb24gdHJ5R2V0RnJvbUNhY2hlPFQgZXh0ZW5kcyBrZXlvZiBJQmlnQ29uZmlnPihjb25maWc6IEJpZ0NvbmZpZ0NscywgcHJvcDogVCk6IElCaWdDb25maWdbVF1cbmZ1bmN0aW9uIHRyeUdldEZyb21DYWNoZTxUIGV4dGVuZHMga2V5b2YgSVN1YmNvbmZpZz4oY29uZmlnOiBTdWJjb25maWcsIHByb3A6IFQpOiBJU3ViY29uZmlnW1RdXG5mdW5jdGlvbiB0cnlHZXRGcm9tQ2FjaGUoY29uZmlnLCBwcm9wKSB7XG4gICAgaWYgKCBjb25maWcuY2FjaGVbcHJvcF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgY29uc3QgcHJvcFZhbCA9IGNvbmZpZy5nZXQocHJvcCk7XG4gICAgICAgIGNvbmZpZy5jYWNoZVtwcm9wXSA9IHByb3BWYWw7XG4gICAgICAgIHJldHVybiBwcm9wVmFsO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjb25maWcuY2FjaGVbcHJvcF07XG4gICAgfVxufVxuXG4vKipMaXN0IG9mIHRydXRoIGZpbGUgbmFtZXMsIG5vIGV4dGVuc2lvbiovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJ1dGhGaWxlc1doZXJlKHsgZXh0ZW5zaW9uIH06IHsgZXh0ZW5zaW9uPzogJ3R4dCcgfCAnbWlkJyB8ICdtcDQnIH0gPSB7IGV4dGVuc2lvbiA6IHVuZGVmaW5lZCB9KTogc3RyaW5nW10ge1xuICAgIGlmICggZXh0ZW5zaW9uICkge1xuICAgICAgICBpZiAoIGV4dGVuc2lvbi5zdGFydHNXaXRoKCcuJykgKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBleHRlbnNpb24gPSBleHRlbnNpb24uc2xpY2UoMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCAhWyAndHh0JywgJ21pZCcsICdtcDQnIF0uaW5jbHVkZXMoZXh0ZW5zaW9uKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgdHJ1dGhGaWxlc0xpc3QoXCIke2V4dGVuc2lvbn1cIiksIG11c3QgYmUgZWl0aGVyIFsndHh0JywnbWlkJywnbXA0J10gb3Igbm90IGF0IGFsbC4gc2V0dGluZyB0byB1bmRlZmluZWRgKTtcbiAgICAgICAgICAgIGV4dGVuc2lvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBjb25zdCB0cnV0aHNEaXJQYXRoID0gdGhpcy50cnV0aHNEaXJQYXRoKCk7XG4gICAgXG4gICAgbGV0IHRydXRoRmlsZXMgPSBbIC4uLm5ldyBTZXQoZnMucmVhZGRpclN5bmMoVFJVVEhTX1BBVEhfQUJTKSkgXTtcbiAgICBsZXQgZm9ybWF0dGVkVHJ1dGhGaWxlcyA9IFtdO1xuICAgIGZvciAoIGxldCBmaWxlIG9mIHRydXRoRmlsZXMgKSB7XG4gICAgICAgIGxldCBbIG5hbWUsIGV4dCBdID0gbXlmcy5zcGxpdF9leHQoZmlsZSk7XG4gICAgICAgIGlmICggZXh0ZW5zaW9uICkge1xuICAgICAgICAgICAgaWYgKCBleHQubG93ZXIoKSA9PT0gYC4ke2V4dGVuc2lvbn1gICkge1xuICAgICAgICAgICAgICAgIGZvcm1hdHRlZFRydXRoRmlsZXMucHVzaChuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZFRydXRoRmlsZXMucHVzaChuYW1lKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmb3JtYXR0ZWRUcnV0aEZpbGVzXG4gICAgXG59XG5cbi8qKkxpc3Qgb2YgbmFtZXMgb2YgdHh0IHRydXRoIGZpbGVzIHRoYXQgaGF2ZSB0aGVpciB3aG9sZSBcInRyaXBsZXRcIiBpbiB0YWN0LiBubyBleHRlbnNpb24qL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRydXRoc1dpdGgzVHh0RmlsZXMoKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IHR4dEZpbGVzTGlzdCA9IGdldFRydXRoRmlsZXNXaGVyZSh7IGV4dGVuc2lvbiA6ICd0eHQnIH0pO1xuICAgIGNvbnN0IHdob2xlVHh0RmlsZXMgPSBbXTtcbiAgICBmb3IgKCBsZXQgbmFtZSBvZiB0eHRGaWxlc0xpc3QgKSB7XG4gICAgICAgIGlmICggdHh0RmlsZXNMaXN0LmNvdW50KHR4dCA9PiB0eHQuc3RhcnRzV2l0aChuYW1lKSkgPj0gMyApIHtcbiAgICAgICAgICAgIHdob2xlVHh0RmlsZXMucHVzaChuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHh0RmlsZXNMaXN0LmZpbHRlcihhID0+IHR4dEZpbGVzTGlzdC5maWx0ZXIodHh0ID0+IHR4dC5zdGFydHNXaXRoKGEpKS5sZW5ndGggPj0gMyk7XG59XG5cbmV4cG9ydCBjbGFzcyBCaWdDb25maWdDbHMgZXh0ZW5kcyBTdG9yZTxJQmlnQ29uZmlnPiB7XG4gICAgdGVzdDogU3ViY29uZmlnO1xuICAgIGV4YW06IFN1YmNvbmZpZztcbiAgICByZWFkb25seSBjYWNoZTogUGFydGlhbDxJQmlnQ29uZmlnPjtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihfZG9UcnV0aEZpbGVDaGVjayA9IHRydWUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5jYWNoZSA9IHt9O1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0ID0gKC4uLmFyZ3MpID0+IGNvbnNvbGUud2FybihgRFJZUlVOLCBzZXQ6IGAsIGFyZ3MpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50ZXN0ID0gbmV3IFN1YmNvbmZpZyh0aGlzLnRlc3RfZmlsZSwgXCJ0ZXN0XCIpO1xuICAgICAgICB0aGlzLmV4YW0gPSBuZXcgU3ViY29uZmlnKHRoaXMuZXhhbV9maWxlLCBcImV4YW1cIik7XG4gICAgICAgIHRoaXMuc3ViamVjdHMgPSB0aGlzLnN1YmplY3RzOyAvLyB0byBlbnN1cmUgaGF2aW5nIHN1YmNvbmZpZydzIHN1YmplY3RzXG4gICAgICAgIGlmICggX2RvVHJ1dGhGaWxlQ2hlY2sgKSB7XG4gICAgICAgICAgICB0aGlzLnRlc3QuZG9UcnV0aEZpbGVDaGVjaygpXG4gICAgICAgICAgICAgICAgLnRoZW4oc3dhbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4YW0uZG9UcnV0aEZpbGVDaGVjaygpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZzogSVN1YmNvbmZpZywgZXhwZXJpbWVudFR5cGU6IEV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ0JpZ0NvbmZpZ0NscyB1c2VkIGZyb21TYXZlZENvbmZpZy4gSW1wb3NzaWJsZSB0byBsb2FkIGJpZyBmaWxlLiBSZXR1cm5pbmcnKTtcbiAgICAgICAgLyppZiAoIERSWVJVTiApIHJldHVybiBjb25zb2xlLmxvZyhgZnJvbVNhdmVkQ29uZmlnLCBEUllSVU5gKTtcbiAgICAgICAgIGNvbnN0IHRydXRoRmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKHNhdmVkQ29uZmlnLnRydXRoX2ZpbGVfcGF0aCwgJy50eHQnKTtcbiAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKHBhdGguam9pbihUUlVUSFNfUEFUSF9BQlMsIHRydXRoRmlsZU5hbWUpKTtcbiAgICAgICAgIHRoaXMuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgICB0aGlzLmNvbmZpZyhleHBlcmltZW50VHlwZSkuZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnKTsqL1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipAZXhhbXBsZVxuICAgICB1cGRhdGUoJ3N1YmplY3RzJywgW25hbWVzXSlcbiAgICAgKi9cbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywga3ZQYWlyczogUGFydGlhbDxJQmlnQ29uZmlnPilcbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywgdmFsdWVzOiBhbnlbXSlcbiAgICB1cGRhdGUoSywga3YpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdCaWdDb25maWcudXBkYXRlKCkgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBpZiAoIEFycmF5LmlzQXJyYXkoVikgKSB7XG4gICAgICAgICAgICBsZXQgbmV3VmFsdWU6IGFueVtdID0gVjtcbiAgICAgICAgICAgIGlmICggQXJyYXkuaXNBcnJheShrdikgKSB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWUucHVzaCguLi5rdik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlLnB1c2goa3YpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgbmV3VmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihWLCBrdik7XG4gICAgICAgICAgICB0aGlzLnNldChLLCBWKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXQoSyk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBsYXN0X3BhZ2UoKTogUGFnZU5hbWUge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2xhc3RfcGFnZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbGFzdF9wYWdlKHBhZ2U6IFBhZ2VOYW1lKSB7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB2YWxpZHBhZ2VzID0gWyBcIm5ld1wiLCBcInJ1bm5pbmdcIiwgXCJyZWNvcmRcIiwgXCJmaWxlX3Rvb2xzXCIsIFwic2V0dGluZ3NcIiBdO1xuICAgICAgICBpZiAoICF2YWxpZHBhZ2VzLmluY2x1ZGVzKHBhZ2UpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGFzdF9wYWdlKFwiJHtwYWdlfVwiKSwgbXVzdCBiZSBvbmUgb2YgJHt2YWxpZHBhZ2VzLmpvaW4oJywgJyl9LiBzZXR0aW5nIHRvIG5ld2ApO1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xhc3RfcGFnZScsICduZXcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCBwYWdlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipVcGRhdGVzIGBleGFtX2ZpbGVgIG9yIGB0ZXN0X2ZpbGVgLiBBbHNvIGluaXRpYWxpemVzIG5ldyBTdWJjb25maWcuXG4gICAgICogSGFuZGxlcyB3aXRoIHdhcm5pbmdzOiAqL1xuICAgIHNldFN1YmNvbmZpZyhmaWxlOiBzdHJpbmcsIHN1YmNmZ1R5cGU6IEV4cGVyaW1lbnRUeXBlLCBzdWJjb25maWc/OiBTdWJjb25maWcpIHtcbiAgICAgICAgY29uc3Qgc3ViY29uZmlnS2V5ID0gYCR7c3ViY2ZnVHlwZX1fZmlsZWAgYXMgXCJleGFtX2ZpbGVcIiB8IFwidGVzdF9maWxlXCI7XG4gICAgICAgIFxuICAgICAgICBsZXQgYmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGUpO1xuICAgICAgICBpZiAoIGZpbGUgIT09IGJhc2VuYW1lICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgJHtzdWJjZmdUeXBlfV9maWxlKCR7ZmlsZX0pLCBwYXNzZWQgTk9UIGEgYmFzZW5hbWUgKG5vIGRpcnMpLiBjb250aW51aW5nIHdpdGggb25seSBiYXNlbmFtZWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShiYXNlbmFtZSk7XG4gICAgICAgIGlmICggIWJvb2woZXh0KSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0ICR7c3ViY2ZnVHlwZX1fZmlsZSgke2ZpbGV9KSBoYXMgbm8gZXh0ZW5zaW9uLiBhZGRpbmcgLiR7c3ViY2ZnVHlwZX1gKTtcbiAgICAgICAgICAgIGJhc2VuYW1lICs9IGAuJHtzdWJjZmdUeXBlfWA7XG4gICAgICAgICAgICAvLyBUT0RPOiBtYXliZSBub3QgYWNjZXB0IHN1YmNmZ1R5cGUsIGJ1dCBvbmx5IGZpbGUgd2l0aCBleHRlbnNpb25cbiAgICAgICAgfSBlbHNlIGlmICggZXh0ICE9PSBgLiR7c3ViY2ZnVHlwZX1gICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgJHtzdWJjZmdUeXBlfV9maWxlKCR7ZmlsZX0pIGJhZCBleHRlbnNpb246IFwiJHtleHR9XCIuIHJlcGxhY2luZyB3aXRoIC4ke3N1YmNmZ1R5cGV9YCk7XG4gICAgICAgICAgICBiYXNlbmFtZSA9IG15ZnMucmVwbGFjZV9leHQoYmFzZW5hbWUsIGAuJHtzdWJjZmdUeXBlfWApXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoc3ViY29uZmlnS2V5LCBiYXNlbmFtZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBzZXRTdWJjb25maWdgLCB7IGZpbGUsIGJhc2VuYW1lLCBzdWJjZmdUeXBlLCBzdWJjb25maWcsIFwic3ViY29uZmlnLnN0b3JlXCIgOiBzdWJjb25maWc/LnN0b3JlLCB9KTtcbiAgICAgICAgdGhpc1tzdWJjZmdUeXBlXSA9IG5ldyBTdWJjb25maWcoYmFzZW5hbWUsIHN1YmNmZ1R5cGUsIHN1YmNvbmZpZylcbiAgICB9XG4gICAgXG4gICAgZ2V0U3ViY29uZmlnKCk6IFN1YmNvbmZpZyB7XG4gICAgICAgIHJldHVybiB0aGlzW3RoaXMuZXhwZXJpbWVudF90eXBlXVxuICAgIH1cbiAgICBcbiAgICAvKipSZXR1cm5zIHRoZSBleGFtIGZpbGUgbmFtZSBpbmNsdWRpbmcgZXh0ZW5zaW9uKi9cbiAgICBnZXQgZXhhbV9maWxlKCk6IHN0cmluZyB7XG4gICAgICAgIC8vIERvbid0IGNhY2hlOyB0aGlzLmV4YW0gaXMgYSBTdWJjb25maWdcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdleGFtX2ZpbGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqVXBkYXRlcyBleGFtX2ZpbGUgYW5kIGFsc28gaW5pdGlhbGl6ZXMgbmV3IFN1YmNvbmZpZyovXG4gICAgc2V0IGV4YW1fZmlsZShmaWxlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXRTdWJjb25maWcoZmlsZSwgXCJleGFtXCIpXG4gICAgfVxuICAgIFxuICAgIC8qKlJldHVybnMgdGhlIHRlc3QgZmlsZSBuYW1lIGluY2x1ZGluZyBleHRlbnNpb24qL1xuICAgIGdldCB0ZXN0X2ZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgLy8gRG9uJ3QgY2FjaGU7IHRoaXMudGVzdCBpcyBhIFN1YmNvbmZpZ1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ3Rlc3RfZmlsZScpO1xuICAgIH1cbiAgICBcbiAgICAvKipVcGRhdGVzIHRlc3RfZmlsZSBhbmQgYWxzbyBpbml0aWFsaXplcyBuZXcgU3ViY29uZmlnKi9cbiAgICBzZXQgdGVzdF9maWxlKGZpbGU6IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldFN1YmNvbmZpZyhmaWxlLCBcInRlc3RcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIENhbiBiZSBnb3R0ZW4gYWxzbyB3aXRoIGBzdWJjb25maWcudHlwZWAqL1xuICAgIGdldCBleHBlcmltZW50X3R5cGUoKTogRXhwZXJpbWVudFR5cGUge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiZXhwZXJpbWVudF90eXBlXCIpXG4gICAgICAgIC8qaWYgKCB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgY29uc3QgZXhwZXJpbWVudFR5cGUgPSB0aGlzLmdldCgnZXhwZXJpbWVudF90eXBlJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgcmV0dXJuIGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZTtcbiAgICAgICAgIH0qL1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgZXhwZXJpbWVudF90eXBlKGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBpZiAoIGV4cGVyaW1lbnRUeXBlICE9PSAndGVzdCcgJiYgZXhwZXJpbWVudFR5cGUgIT09ICdleGFtJyApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQmlnQ29uZmlnIGV4cGVyaW1lbnRfdHlwZSBzZXR0ZXIsIGdvdCBleHBlcmltZW50VHlwZTogJyR7ZXhwZXJpbWVudFR5cGV9Jy4gTXVzdCBiZSBlaXRoZXIgJ3Rlc3QnIG9yICdleGFtJy4gc2V0dGluZyB0byB0ZXN0YCk7XG4gICAgICAgICAgICBleHBlcmltZW50VHlwZSA9ICd0ZXN0JztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldCgnZXhwZXJpbWVudF90eXBlJywgZXhwZXJpbWVudFR5cGUpO1xuICAgICAgICB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGdldCBzdWJqZWN0cygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnc3ViamVjdHMnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqRW5zdXJlcyBoYXZpbmcgYHRoaXMudGVzdC5zdWJqZWN0YCBhbmQgYHRoaXMuZXhhbS5zdWJqZWN0YCBpbiB0aGUgbGlzdCByZWdhcmRsZXNzKi9cbiAgICBzZXQgc3ViamVjdHMoc3ViamVjdExpc3Q6IHN0cmluZ1tdKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2Fybignc2V0IHN1YmplY3RzLCBEUllSVU4uIHJldHVybmluZycpXG4gICAgICAgIH1cbiAgICAgICAgc3ViamVjdExpc3QucHVzaCh0aGlzLnRlc3Quc3ViamVjdCk7XG4gICAgICAgIHN1YmplY3RMaXN0LnB1c2godGhpcy5leGFtLnN1YmplY3QpO1xuICAgICAgICBjb25zdCBzdWJqZWN0cyA9IFsgLi4ubmV3IFNldChzdWJqZWN0TGlzdCkgXTtcbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3RzJywgc3ViamVjdHMpO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IGRldigpOiB7IFtLIGluIGtleW9mIERldk9wdGlvbnNdOiAoKSA9PiBEZXZPcHRpb25zW0tdIH0ge1xuICAgICAgICBjb25zdCBfZGV2ID0gdGhpcy5nZXQoJ2RldicpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWF4X2FuaW1hdGlvbl9ub3RlcyA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIF9kZXYgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1heF9hbmltYXRpb25fbm90ZXMgPSB0aGlzLmdldCgnZGV2b3B0aW9ucycpLm1heF9hbmltYXRpb25fbm90ZXM7XG4gICAgICAgICAgICAgICAgICAgIGlmICggbWF4X2FuaW1hdGlvbl9ub3RlcyApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5tYXhfYW5pbWF0aW9uX25vdGVzOiAke21heF9hbmltYXRpb25fbm90ZXN9YCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXhfYW5pbWF0aW9uX25vdGVzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtdXRlX2FuaW1hdGlvbiA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtdXRlX2FuaW1hdGlvbiA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5tdXRlX2FuaW1hdGlvbjtcbiAgICAgICAgICAgICAgICBpZiAoIG11dGVfYW5pbWF0aW9uICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLm11dGVfYW5pbWF0aW9uYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG11dGVfYW5pbWF0aW9uO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNraXBfbWlkaV9leGlzdHNfY2hlY2sgOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpcF9taWRpX2V4aXN0c19jaGVjayA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX21pZGlfZXhpc3RzX2NoZWNrO1xuICAgICAgICAgICAgICAgIGlmICggc2tpcF9taWRpX2V4aXN0c19jaGVjayApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5za2lwX21pZGlfZXhpc3RzX2NoZWNrYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfbWlkaV9leGlzdHNfY2hlY2s7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2tpcF93aG9sZV90cnV0aCA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwX3dob2xlX3RydXRoID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfd2hvbGVfdHJ1dGg7XG4gICAgICAgICAgICAgICAgaWYgKCBza2lwX3dob2xlX3RydXRoICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNraXBfd2hvbGVfdHJ1dGhgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2tpcF93aG9sZV90cnV0aDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBza2lwX2xldmVsX2ludHJvIDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfbGV2ZWxfaW50cm8gPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9sZXZlbF9pbnRybztcbiAgICAgICAgICAgICAgICBpZiAoIHNraXBfbGV2ZWxfaW50cm8gKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF9sZXZlbF9pbnRyb2ApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX2xldmVsX2ludHJvO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrIDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrO1xuICAgICAgICAgICAgICAgIGlmICggc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2sgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2tgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2s7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2sgOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2sgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2s7XG4gICAgICAgICAgICAgICAgaWYgKCBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5za2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFja2ApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjaztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZWxvYWRfcGFnZV9vbl9zdWJtaXQgOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVsb2FkX3BhZ2Vfb25fc3VibWl0ID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnJlbG9hZF9wYWdlX29uX3N1Ym1pdDtcbiAgICAgICAgICAgICAgICBpZiAoIHJlbG9hZF9wYWdlX29uX3N1Ym1pdCApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5yZWxvYWRfcGFnZV9vbl9zdWJtaXRgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVsb2FkX3BhZ2Vfb25fc3VibWl0O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgXG59XG5cblxuZXhwb3J0IGNsYXNzIFN1YmNvbmZpZyBleHRlbmRzIENvbmY8SVN1YmNvbmZpZz4geyAvLyBBS0EgQ29uZmlnXG4gICAgcHJpdmF0ZSByZWFkb25seSB0eXBlOiBFeHBlcmltZW50VHlwZTtcbiAgICByZWFkb25seSBjYWNoZTogUGFydGlhbDxJU3ViY29uZmlnPjtcbiAgICB0cnV0aDogVHJ1dGg7XG4gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogQHBhcmFtIG5hbWUgLSBpbmNsdWRpbmcgZXh0ZW5zaW9uLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgdHlwZTogRXhwZXJpbWVudFR5cGUsIHN1YmNvbmZpZz86IFN1YmNvbmZpZykge1xuICAgICAgICBsZXQgWyBmaWxlbmFtZSwgZXh0IF0gPSBteWZzLnNwbGl0X2V4dChuYW1lKTtcbiAgICAgICAgaWYgKCAhZXh0LmVuZHNXaXRoKHR5cGUpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBTdWJjb25maWcgY29uc3RydWN0b3IsIGV4dCAoXCIke2V4dH1cIikgb2YgcGFzc2VkIG5hbWUgKFwiJHtuYW1lfVwiKSBpc250IHBhc3NlZCB0eXBlIChcIiR7dHlwZX1cIikuIFJlcGxhY2luZyBuYW1lJ3MgZXh0IHRvIFwiJHt0eXBlfVwiYCk7XG4gICAgICAgICAgICBuYW1lID0gbXlmcy5yZXBsYWNlX2V4dChuYW1lLCB0eXBlKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGVmYXVsdHM7XG4gICAgICAgIGlmICggYm9vbChzdWJjb25maWcpICkge1xuICAgICAgICAgICAgaWYgKCBzdWJjb25maWcuc3RvcmUgKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdHMgPSB7IC4uLnN1YmNvbmZpZy5zdG9yZSwgbmFtZSB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0cyA9IHN1YmNvbmZpZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlZmF1bHRzID0geyBuYW1lIH07XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgZmlsZUV4dGVuc2lvbiA6IHR5cGUsXG4gICAgICAgICAgICBjd2QgOiBDT05GSUdTX1BBVEhfQUJTLFxuICAgICAgICAgICAgY29uZmlnTmFtZSA6IGZpbGVuYW1lLFxuICAgICAgICAgICAgZGVmYXVsdHNcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuY2FjaGUgPSB7IG5hbWUgfTtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgaWYgKCBzdWJjb25maWcgKSB7XG4gICAgICAgICAgICB0aGlzLnNldCh7IC4uLnN1YmNvbmZpZy5zdG9yZSwgbmFtZSB9KTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy50cnV0aCA9IG5ldyBUcnV0aChteWZzLnJlbW92ZV9leHQodGhpcy50cnV0aF9maWxlKSk7XG4gICAgICAgIH0gY2F0Y2ggKCBlICkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgU3ViY29uZmlnIGNvbnN0cnVjdG9yLCBpbml0aWFsaXppbmcgbmV3IFRydXRoIGZyb20gdGhpcy50cnV0aF9maWxlIHRocmV3IGFuIGVycm9yLiBQcm9iYWJseSBiZWNhdXNlIHRoaXMudHJ1dGhfZmlsZSBpcyB1bmRlZmluZWQuIFNob3VsZCBtYXliZSBuZXN0IHVuZGVyIGlmKHN1YmNvbmZpZykgY2xhdXNlYCwgXCJ0aGlzLnRydXRoX2ZpbGVcIiwgdGhpcy50cnV0aF9maWxlLCBlKVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGRvVHJ1dGhGaWxlQ2hlY2soKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5K+IFN1YmNvbmZpZygke3RoaXMudHlwZX0pLmRvVHJ1dGhGaWxlQ2hlY2soKWApO1xuICAgICAgICBcbiAgICAgICAgLy8gY29uc3QgdHJ1dGggPSB0aGlzLmdldFRydXRoKCk7XG4gICAgICAgIGlmICggdGhpcy50cnV0aC50eHQuYWxsRXhpc3QoKSApIHtcbiAgICAgICAgICAgIHJldHVybiBBbGVydC5zbWFsbC5zdWNjZXNzKGAke3RoaXMudHJ1dGgubmFtZX0udHh0LCAqX29uLnR4dCwgYW5kICpfb2ZmLnR4dCBmaWxlcyBleGlzdC5gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBbJ2Z1cl9lbGlzZV9CJyB4IDMsICdmdXJfZWxpc2VfUi50eHQnIHggMywgLi4uXVxuICAgICAgICBjb25zdCB0cnV0aHNXaXRoM1R4dEZpbGVzID0gZ2V0VHJ1dGhzV2l0aDNUeHRGaWxlcygpO1xuICAgICAgICBpZiAoICFib29sKHRydXRoc1dpdGgzVHh0RmlsZXMpIClcbiAgICAgICAgICAgIHJldHVybiBBbGVydC5iaWcud2FybmluZyh7XG4gICAgICAgICAgICAgICAgdGl0bGUgOiAnTm8gdmFsaWQgdHJ1dGggZmlsZXMgZm91bmQnLFxuICAgICAgICAgICAgICAgIGh0bWwgOiAnVGhlcmUgbmVlZHMgdG8gYmUgYXQgbGVhc3Qgb25lIHR4dCBmaWxlIHdpdGggb25lIFwib25cIiBhbmQgb25lIFwib2ZmXCIgY291bnRlcnBhcnRzLidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBBbGVydC5iaWcuYmxvY2tpbmcoe1xuICAgICAgICAgICAgdGl0bGUgOiBgRGlkbid0IGZpbmQgYWxsIHRocmVlIC50eHQgZmlsZXMgZm9yICR7dGhpcy50cnV0aC5uYW1lfWAsXG4gICAgICAgICAgICBodG1sIDogJ1RoZSBmb2xsb3dpbmcgdHJ1dGhzIGFsbCBoYXZlIDMgdHh0IGZpbGVzLiBQbGVhc2UgY2hvb3NlIG9uZSBvZiB0aGVtLCBvciBmaXggdGhlIGZpbGVzIGFuZCByZWxvYWQuJyxcbiAgICAgICAgICAgIHNob3dDbG9zZUJ1dHRvbiA6IHRydWUsXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHN0cmluZ3MgOiB0cnV0aHNXaXRoM1R4dEZpbGVzLFxuICAgICAgICAgICAgY2xpY2tGbiA6IGVsID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zdCBjb25maWcgPSB0aGlzLmNvbmZpZyh0aGlzLmV4cGVyaW1lbnRfdHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sZXZlbHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cnV0aF9maWxlID0gZWwudGV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLnRydXRoX2ZpbGVfcGF0aCA9IG5ldyBUcnV0aChlbC50ZXh0KCkpO1xuICAgICAgICAgICAgICAgICAgICByZWxvYWRQYWdlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoIGVyciApIHtcbiAgICAgICAgICAgICAgICAgICAgQWxlcnQuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgQWxlcnQuYmlnLmVycm9yKHsgdGl0bGUgOiBlcnIubWVzc2FnZSwgaHRtbCA6ICdTb21ldGhpbmcgaGFwcGVuZWQuJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBpbmNyZWFzZShLOiBrZXlvZiBJU3ViY29uZmlnKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgdXNlZCBzdWJjb25maWcuaW5jcmVhc2UsIFVOVEVTVEVEYCk7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignaW5jcmVhc2UsIERSWVJVTi4gcmV0dXJuaW5nJyk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IFYgPSB0aGlzLmdldChLKTtcbiAgICAgICAgXG4gICAgICAgIGlmICggViA9PT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuc2V0KEssIDEpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVvZlYgPSB0eXBlb2YgVjtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGlmICggdHlwZW9mViA9PT0gJ251bWJlcicgfHwgKHR5cGVvZlYgPT09ICdzdHJpbmcnICYmIFYuaXNkaWdpdCgpKSApIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoSywgTWF0aC5mbG9vcihWKSArIDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJCaWdDb25maWdDbHMgdHJpZWQgdG8gaW5jcmVhc2UgYSB2YWx1ZSB0aGF0IGlzIG5vdCBhIG51bWJlciBub3IgYSBzdHJpbmcuaXNkaWdpdCgpXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgdG9PYmooKTogT21pdDxJU3ViY29uZmlnLCBcIm5hbWVcIj4geyAvLyBBS0EgdG9TYXZlZENvbmZpZ1xuICAgICAgICBcbiAgICAgICAgY29uc3Qgb2JqID0gdGhpcy5zdG9yZTtcbiAgICAgICAgZGVsZXRlIG9iai5uYW1lO1xuICAgICAgICByZXR1cm4gb2JqXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgZnJvbVN1YmNvbmZpZyhzdWJjb25maWc6IFN1YmNvbmZpZykge1xuICAgICAgICBpZiAoIERSWVJVTiApIHJldHVybiBjb25zb2xlLndhcm4oJ2Zyb21PYmosIERSWVJVTi4gcmV0dXJuaW5nJyk7XG4gICAgICAgIC8vIHRoaXMuc2V0KHN1YmNvbmZpZy50b09iaigpKTtcbiAgICAgICAgLy8gdGhpcy5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gPSBzdWJjb25maWcuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uO1xuICAgICAgICAvLyB0aGlzLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uID0gc3ViY29uZmlnLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uO1xuICAgICAgICAvLyB0aGlzLmRlbW9fdHlwZSA9IHN1YmNvbmZpZy5kZW1vX3R5cGU7XG4gICAgICAgIC8vIHRoaXMuZXJyb3JzX3BsYXlyYXRlID0gc3ViY29uZmlnLmVycm9yc19wbGF5cmF0ZTtcbiAgICAgICAgLy8gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQgPSBzdWJjb25maWcuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgICAgICAvLyB0aGlzLmxldmVscyA9IHN1YmNvbmZpZy5sZXZlbHM7XG4gICAgICAgIC8vIHRoaXMuc3ViamVjdCA9IHN1YmNvbmZpZy5zdWJqZWN0O1xuICAgICAgICAvLyB0aGlzLnRydXRoX2ZpbGUgPSBzdWJjb25maWcudHJ1dGhfZmlsZTtcbiAgICAgICAgLy8gdGhpcy5fdXBkYXRlU2F2ZWRGaWxlKCd0cnV0aF9maWxlX3BhdGgnLCBjZmdGaWxlLnRydXRoX2ZpbGVfcGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBwcml2YXRlIF91cGRhdGVTYXZlZEZpbGUoa2V5OiBrZXlvZiBJU3ViY29uZmlnLCB2YWx1ZSkge1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ191cGRhdGVTYXZlZEZpbGUsIERSWVJVTi4gcmV0dXJuaW5nJylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdfdXBkYXRlU2F2ZWRGaWxlKCkgZG9lcyBub3RoaW5nLCByZXR1cm5pbmcnKTtcbiAgICAgICAgdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIC8qY29uc3QgY29uZiA9IG5ldyAocmVxdWlyZSgnY29uZicpKSh7XG4gICAgICAgICBjd2QgOiBDT05GSUdTX1BBVEhfQUJTLFxuICAgICAgICAgY29uZmlnTmFtZSA6IHRoaXMubmFtZSxcbiAgICAgICAgIGZpbGVFeHRlbnNpb24gOiB0aGlzLnR5cGUsXG4gICAgICAgICBzZXJpYWxpemUgOiB2YWx1ZSA9PiBKU09OLnN0cmluZ2lmeSh2YWx1ZSwgbnVsbCwgNClcbiAgICAgICAgIH0pO1xuICAgICAgICAgY29uZi5zZXQoa2V5LCB2YWx1ZSk7Ki9cbiAgICB9XG4gICAgXG4gICAgXG4gICAgcHJpdmF0ZSBzZXREZXZpYXRpb24oZGV2aWF0aW9uVHlwZTogRGV2aWF0aW9uVHlwZSwgZGV2aWF0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdHlwZW9mRGV2aWF0aW9uID0gdHlwZW9mIGRldmlhdGlvbjtcbiAgICAgICAgaWYgKCB0eXBlb2ZEZXZpYXRpb24gPT09ICdudW1iZXInICkge1xuICAgICAgICAgICAgZGV2aWF0aW9uID0gYCR7ZGV2aWF0aW9ufSVgO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXREZXZpYXRpb24gZ290IFwiZGV2aWF0aW9uXCIgdHlwZSBudW1iZXIuIGFwcGVuZGVkIFwiJVwiLiBkZXZpYXRpb24gbm93OiAke2RldmlhdGlvbn1gKTtcbiAgICAgICAgfSBlbHNlIGlmICggdHlwZW9mRGV2aWF0aW9uID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICAgIGlmICggIWRldmlhdGlvbi5lbmRzV2l0aChcIiVcIikgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXREZXZpYXRpb24gZ290IGRldmlhdGlvbiB3aXRob3V0ICUuIGFwcGVuZGVkICUuIGRldmlhdGlvbiBub3c6IFwiJHtkZXZpYXRpb259XCJgKTtcbiAgICAgICAgICAgICAgICBkZXZpYXRpb24gPSBgJHtkZXZpYXRpb259JWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldERldmlhdGlvbiwgcmVjZWl2ZWQgXCJkZXZpYXRpb25cIiBub3Qgc3RyaW5nIG5vdCBudW1iZXIuIHJldHVybmluZy4gZGV2aWF0aW9uOmAsIGRldmlhdGlvbik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpcy5zZXQoYGFsbG93ZWRfJHtkZXZpYXRpb25UeXBlfV9kZXZpYXRpb25gLCBkZXZpYXRpb24pO1xuICAgICAgICB0aGlzLmNhY2hlW2BhbGxvd2VkXyR7ZGV2aWF0aW9uVHlwZX1fZGV2aWF0aW9uYF0gPSBkZXZpYXRpb247XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiYWxsb3dlZF90ZW1wb19kZXZpYXRpb25cIilcbiAgICAgICAgLyppZiAoIHRoaXMuY2FjaGUuYWxsb3dlZF90ZW1wb19kZXZpYXRpb24gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgIGNvbnN0IGFsbG93ZWRUZW1wb0RldmlhdGlvbiA9IHRoaXMuZ2V0KCdhbGxvd2VkX3RlbXBvX2RldmlhdGlvbicpO1xuICAgICAgICAgdGhpcy5jYWNoZS5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbiA9IGFsbG93ZWRUZW1wb0RldmlhdGlvbjtcbiAgICAgICAgIHJldHVybiBhbGxvd2VkVGVtcG9EZXZpYXRpb247XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuYWxsb3dlZF90ZW1wb19kZXZpYXRpb247XG4gICAgICAgICB9Ki9cbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uKGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0RGV2aWF0aW9uKFwidGVtcG9cIiwgZGV2aWF0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0IGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uXCIpO1xuICAgICAgICAvKmlmICggdGhpcy5jYWNoZS5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgIGNvbnN0IGFsbG93ZWRSaHl0aG1EZXZpYXRpb24gPSB0aGlzLmdldCgnYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbiA9IGFsbG93ZWRSaHl0aG1EZXZpYXRpb247XG4gICAgICAgICByZXR1cm4gYWxsb3dlZFJoeXRobURldmlhdGlvbjtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb247XG4gICAgICAgICB9Ki9cbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbihkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldERldmlhdGlvbihcInJoeXRobVwiLCBkZXZpYXRpb24pO1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBnZXQgZGVtb190eXBlKCk6IERlbW9UeXBlIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCBcImRlbW9fdHlwZVwiKTtcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuZ2V0KCdkZW1vX3R5cGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IGRlbW9fdHlwZSh0eXBlOiBEZW1vVHlwZSkge1xuICAgICAgICBpZiAoICFbICd2aWRlbycsICdhbmltYXRpb24nIF0uaW5jbHVkZXModHlwZSkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYENvbmZpZyBkZW1vX3R5cGUgc2V0dGVyLCBiYWQgdHlwZSA9ICR7dHlwZX0sIGNhbiBiZSBlaXRoZXIgdmlkZW8gb3IgYW5pbWF0aW9uLiBOb3Qgc2V0dGluZ2ApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2RlbW9fdHlwZScsIHR5cGUpO1xuICAgICAgICAgICAgdGhpcy5jYWNoZS5kZW1vX3R5cGUgPSB0eXBlO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldCBlcnJvcnNfcGxheXJhdGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdlcnJvcnNfcGxheXJhdGUnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGVycm9yc19wbGF5cmF0ZShzcGVlZDogbnVtYmVyKSB7XG4gICAgICAgIGlmICggaXNOYU4oc3BlZWQpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBjb25maWcgc2V0IGVycm9yc19wbGF5cmF0ZSwgcmVjZWl2ZWQgYmFkIFwic3BlZWRcIiBOYU46ICR7c3BlZWR9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZXJyb3JzX3BsYXlyYXRlJywgc3BlZWQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBnZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnZmluaXNoZWRfdHJpYWxzX2NvdW50Jyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBmaW5pc2hlZF90cmlhbHNfY291bnQoY291bnQ6IG51bWJlcikge1xuICAgICAgICBpZiAoIGlzTmFOKGNvdW50KSB8fCBjb3VudCA8IDAgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGNvbmZpZyBzZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50LCByZWNlaXZlZCBiYWQgXCJjb3VudFwiOiAke2NvdW50fWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2ZpbmlzaGVkX3RyaWFsc19jb3VudCcsIGNvdW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipOYW1lIG9mIGNvbmZpZyBmaWxlLCBpbmNsdWRpbmcgZXh0ZW5zaW9uLiBBbHdheXMgcmV0dXJucyBgbmFtZWAgZnJvbSBjYWNoZS4gVGhpcyBpcyBiZWNhdXNlIHRoZXJlJ3Mgbm8gc2V0dGVyOyBgbmFtZWAgaXMgc3RvcmVkIGluIGNhY2hlIGF0IGNvbnN0cnVjdG9yLiovXG4gICAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUubmFtZTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IHN1YmplY3QoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdzdWJqZWN0Jyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBzdWJqZWN0KG5hbWU6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdzZXQgc3ViamVjdCwgRFJZUlVOJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3QnLCBuYW1lKTtcbiAgICAgICAgaWYgKCBuYW1lICkge1xuICAgICAgICAgICAgY29uc3QgR2xvYiA9IHJlcXVpcmUoJy4uL0dsb2InKS5kZWZhdWx0O1xuICAgICAgICAgICAgR2xvYi5CaWdDb25maWcuc3ViamVjdHMgPSBbIC4uLm5ldyBTZXQoWyAuLi5HbG9iLkJpZ0NvbmZpZy5zdWJqZWN0cywgbmFtZSBdKSBdO1xuICAgICAgICAgICAgLy8gc3VwZXIuc2V0KCdzdWJqZWN0cycsIFsuLi5uZXcgU2V0KFsuLi5zdXBlci5nZXQoJ3N1YmplY3RzJyksIG5hbWVdKV0pO1xuICAgICAgICAgICAgLy8gc3VwZXIuc3ViamVjdHMgPSBbIC4uLnN1cGVyLmdldCgnc3ViamVjdHMnKSwgbmFtZSBdO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWRcbiAgICAgKiBUcnV0aCBmaWxlIG5hbWUsIG5vIGV4dGVuc2lvbiovXG4gICAgZ2V0IHRydXRoX2ZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCAndHJ1dGhfZmlsZScpO1xuICAgICAgICAvLyByZXR1cm4gdGhpcy5nZXQoJ3RydXRoX2ZpbGUnKVxuICAgIH1cbiAgICBcbiAgICAvKipBbHNvIHNldHMgdGhpcy50cnV0aCAobWVtb3J5KVxuICAgICAqIEBjYWNoZWRcbiAgICAgKiBAcGFyYW0gdHJ1dGhfZmlsZSAtIFRydXRoIGZpbGUgbmFtZSwgbm8gZXh0ZW5zaW9uKi9cbiAgICBzZXQgdHJ1dGhfZmlsZSh0cnV0aF9maWxlOiBzdHJpbmcpIHtcbiAgICAgICAgLy8gdHJ1dGhfZmlsZSA9IHBhdGguYmFzZW5hbWUodHJ1dGhfZmlsZSk7XG4gICAgICAgIGxldCBbIG5hbWUsIGV4dCBdID0gbXlmcy5zcGxpdF9leHQodHJ1dGhfZmlsZSk7XG4gICAgICAgIGlmICggYm9vbChleHQpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgdHJ1dGhfZmlsZSwgcGFzc2VkIG5hbWUgaXMgbm90IGV4dGVuc2lvbmxlc3M6ICR7dHJ1dGhfZmlsZX0uIENvbnRpbnVpbmcgd2l0aCBcIiR7bmFtZX1cImApO1xuICAgICAgICAgICAgLy8gbmFtZU5vRXh0ID0gbXlmcy5yZW1vdmVfZXh0KG5hbWVOb0V4dCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgdHJ1dGggPSBuZXcgVHJ1dGgobmFtZSk7XG4gICAgICAgICAgICBpZiAoICF0cnV0aC50eHQuYWxsRXhpc3QoKSApIHtcbiAgICAgICAgICAgICAgICBBbGVydC5zbWFsbC53YXJuaW5nKGBOb3QgYWxsIHR4dCBmaWxlcyBleGlzdDogJHtuYW1lfWApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRydXRoID0gdHJ1dGg7XG4gICAgICAgIH0gY2F0Y2ggKCBlICkge1xuICAgICAgICAgICAgQWxlcnQuc21hbGwud2FybmluZyhlKTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihlKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KGB0cnV0aF9maWxlYCwgbmFtZSk7XG4gICAgICAgIHRoaXMuY2FjaGUudHJ1dGhfZmlsZSA9IG5hbWU7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IGxldmVscygpOiBJTGV2ZWxbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnbGV2ZWxzJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBsZXZlbHMobGV2ZWxzOiBJTGV2ZWxbXSkge1xuICAgICAgICBpZiAoICFBcnJheS5pc0FycmF5KGxldmVscykgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCBsZXZlbHMsIHJlY2VpdmVkIFwibGV2ZWxzXCIgbm90IGlzQXJyYXkuIG5vdCBzZXR0aW5nIGFueXRoaW5nLiBsZXZlbHM6IGAsIGxldmVscyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBiZXR0ZXIgY2hlY2tzXG4gICAgICAgICAgICB0aGlzLnNldCgnbGV2ZWxzJywgbGV2ZWxzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBcbiAgICBjdXJyZW50VHJpYWxDb29yZHMoKTogbnVtYmVyW10ge1xuICAgICAgICAvLyBsZXQgeyBsZXZlbHMsIGZpbmlzaGVkX3RyaWFsc19jb3VudCB9ID0gdGhpcy5jb25maWcoKTtcbiAgICAgICAgbGV0IGZsYXRUcmlhbHNMaXN0ID0gdGhpcy5sZXZlbHMubWFwKGxldmVsID0+IGxldmVsLnRyaWFscyk7XG4gICAgICAgIGZvciAoIGxldCBbIGxldmVsSW5kZXgsIHRyaWFsc051bSBdIG9mIGVudW1lcmF0ZShmbGF0VHJpYWxzTGlzdCkgKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCB0cmlhbFN1bVNvRmFyID0gc3VtKGZsYXRUcmlhbHNMaXN0LnNsaWNlKDAsIGxldmVsSW5kZXggKyAxKSk7XG4gICAgICAgICAgICBjb25zdCBmaW5pc2hlZFRyaWFsc0NvdW50ID0gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgICAgICAgICBpZiAoIHRyaWFsU3VtU29GYXIgPiBmaW5pc2hlZFRyaWFsc0NvdW50IClcbiAgICAgICAgICAgICAgICByZXR1cm4gWyBsZXZlbEluZGV4LCB0cmlhbHNOdW0gLSAodHJpYWxTdW1Tb0ZhciAtIGZpbmlzaGVkVHJpYWxzQ291bnQpIF07XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS53YXJuKFwiY3VycmVudFRyaWFsQ29vcmRzOiBvdXQgb2YgaW5kZXggZXJyb3JcIik7XG4gICAgfVxuICAgIFxuICAgIGlzRGVtb1ZpZGVvKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5kZW1vX3R5cGUgPT09ICd2aWRlbyc7XG4gICAgfVxuICAgIFxuICAgIGlzV2hvbGVUZXN0T3ZlcigpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHN1bSh0aGlzLmxldmVscy5tYXAobGV2ZWwgPT4gbGV2ZWwudHJpYWxzKSkgPT0gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgfVxuICAgIFxuICAgIGdldFN1YmplY3REaXJOYW1lcygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiBmcy5yZWFkZGlyU3luYyhTVUJKRUNUU19QQVRIX0FCUyk7XG4gICAgfVxuICAgIFxuICAgIGdldEN1cnJlbnRMZXZlbCgpOiBMZXZlbCB7XG4gICAgICAgIFxuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIHJldHVybiBuZXcgTGV2ZWwodGhpcy5sZXZlbHNbbGV2ZWxfaW5kZXhdLCBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXgpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBnZXRMZXZlbENvbGxlY3Rpb24oKTogTGV2ZWxDb2xsZWN0aW9uIHtcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICByZXR1cm4gbmV3IExldmVsQ29sbGVjdGlvbih0aGlzLmxldmVscywgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqR2V0cyB0aGUgY3VycmVudCB0cmlhbCdzIHBhdGggKGpvaW4gdGhpcy50ZXN0T3V0UGF0aCgpIGFuZCBsZXZlbF8ke2xldmVsX2luZGV4fS4uLiksIGFuZCByZXR1cm5zIGEgVHJ1dGggb2YgaXQqL1xuICAgIHRyaWFsVHJ1dGgoKTogVHJ1dGgge1xuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIC8vIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRoaXMudGVzdE91dFBhdGgoKSwgYGxldmVsXyR7bGV2ZWxfaW5kZXh9X3RyaWFsXyR7dHJpYWxfaW5kZXh9YCkpO1xuICAgICAgICByZXR1cm4gbmV3IFRydXRoKHBhdGguam9pbih0aGlzLnRlc3RPdXRQYXRoKCksIGBsZXZlbF8ke2xldmVsX2luZGV4fV90cmlhbF8ke3RyaWFsX2luZGV4fWApKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXCJjOlxcU3luY1xcQ29kZVxcUHl0aG9uXFxQeWFuby1yZWxlYXNlXFxzcmNcXGV4cGVyaW1lbnRzXFxzdWJqZWN0c1xcZ2lsYWRcXGZ1cl9lbGlzZVwiKi9cbiAgICB0ZXN0T3V0UGF0aCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBjdXJyU3ViamVjdERpciA9IHBhdGguam9pbihTVUJKRUNUU19QQVRIX0FCUywgdGhpcy5zdWJqZWN0KTsgLy8gXCIuLi4vc3ViamVjdHMvZ2lsYWRcIlxuICAgICAgICByZXR1cm4gcGF0aC5qb2luKGN1cnJTdWJqZWN0RGlyLCB0aGlzLnRydXRoLm5hbWUpO1xuICAgIH1cbiAgICBcbiAgICBcbn1cbiJdfQ==