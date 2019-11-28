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
        let testNameWithExt = this.test_file;
        let examNameWithExt = this.exam_file;
        if (!util_1.all(testNameWithExt, examNameWithExt)) {
            console.warn(`BigConfigCls ctor, couldnt get test_file and/or exam_file from json:`, {
                testNameWithExt,
                examNameWithExt
            }, ', defaulting to "fur_elise_B.[ext]"');
            testNameWithExt = 'fur_elise_B.test';
            examNameWithExt = 'fur_elise_B.exam';
        }
        this.setSubconfig(testNameWithExt);
        this.setSubconfig(examNameWithExt);
        this.subjects = this.subjects;
        if (_doTruthFileCheck) {
            try {
                Promise.all([this.test.doTruthFileCheck(), this.exam.doTruthFileCheck()]);
            }
            catch (e) {
                console.error(`BigConfigCls ctor, error when _doTruthFileCheck:`, e);
                MyAlert_1.default.big.oneButton(`An error occured when running a truth files check. You should try to understand the problem before continuing`, { text: e.message });
            }
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
    setSubconfig(nameWithExt, subconfig) {
        try {
            Subconfig.validateName(nameWithExt);
        }
        catch (e) {
            if (e.message === 'ExtensionError') {
                return console.warn(`set setSubconfig (${nameWithExt}) has no extension, or ext is bad. not setting`);
            }
            if (e.message === 'BasenameError') {
                const basename = path.basename(nameWithExt);
                console.warn(`setSubconfig(${nameWithExt}), passed a path (with slahes). need only a basename.ext. continuing with only basename: ${basename}`);
                nameWithExt = basename;
            }
        }
        const ext = path.extname(nameWithExt);
        const subcfgType = ext.slice(1);
        const subconfigKey = `${subcfgType}_file`;
        this.set(subconfigKey, nameWithExt);
        this.cache[subconfigKey] = nameWithExt;
        console.log(`setSubconfig`, {
            nameWithExt,
            subconfig,
        });
        this[subcfgType] = new Subconfig(nameWithExt, subconfig);
    }
    getSubconfig() {
        return this[this.experiment_type];
    }
    get exam_file() {
        return tryGetFromCache(this, 'exam_file');
    }
    set exam_file(nameWithExt) {
        this.setSubconfig(nameWithExt);
    }
    get test_file() {
        return tryGetFromCache(this, 'test_file');
    }
    set test_file(nameWithExt) {
        this.setSubconfig(nameWithExt);
    }
    get experiment_type() {
        return tryGetFromCache(this, "experiment_type");
    }
    set experiment_type(experimentType) {
        if (!['exam', 'test'].includes(experimentType)) {
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
            skip_fade: () => {
                const skip_fade = _dev && this.get('devoptions').skip_fade;
                if (skip_fade)
                    console.warn(`devoptions.skip_fade`);
                return skip_fade;
            },
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
    get velocities() {
        return tryGetFromCache(this, "velocities");
    }
    set velocities(val) {
        try {
            const floored = Math.floor(val);
            if (isNaN(floored)) {
                console.warn(`set velocities, Math.floor(val) is NaN:`, { val, floored }, '. not setting');
            }
            else {
                if (floored >= 1 && floored <= 16) {
                    this.set('velocities', floored);
                    this.cache.velocities = floored;
                }
                else {
                    console.warn(`set velocities, bad range: ${val}. not setting`);
                }
            }
        }
        catch (e) {
            console.warn(`set velocities, Exception when trying to Math.floor(val):`, e);
        }
    }
}
exports.BigConfigCls = BigConfigCls;
class Subconfig extends Conf {
    constructor(nameWithExt, subconfig) {
        let [filename, ext] = MyFs_1.default.split_ext(nameWithExt);
        if (!['.exam', '.test'].includes(ext)) {
            throw new Error(`Subconfig ctor (${nameWithExt}) has bad or no extension`);
        }
        const type = ext.slice(1);
        let defaults;
        if (util_1.bool(subconfig)) {
            if (subconfig.store) {
                defaults = Object.assign(Object.assign({}, subconfig.store), { name: nameWithExt });
            }
            else {
                defaults = subconfig;
            }
        }
        else {
            defaults = { name: nameWithExt };
        }
        super({
            fileExtension: type,
            cwd: CONFIGS_PATH_ABS,
            configName: filename,
            defaults
        });
        this.cache = { name: nameWithExt };
        this.type = type;
        if (subconfig) {
            this.set(Object.assign(Object.assign({}, subconfig.store), { name: nameWithExt }));
        }
        try {
            this.truth = new Truth_1.Truth(MyFs_1.default.remove_ext(this.truth_file));
        }
        catch (e) {
            console.error(`Subconfig constructor, initializing new Truth from this.truth_file threw an error. Probably because this.truth_file is undefined. Should maybe nest under if(subconfig) clause`, "this.truth_file", this.truth_file, e);
        }
    }
    static validateName(nameWithExt) {
        let [filename, ext] = MyFs_1.default.split_ext(nameWithExt);
        if (!['.exam', '.test'].includes(ext)) {
            throw new Error(`ExtensionError`);
        }
        if (nameWithExt !== `${filename}${ext}`) {
            throw new Error('BasenameError');
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
    createTruthFromTrialResult() {
        console.warn(`This should be somewhere else`);
        let [level_index, trial_index] = this.currentTrialCoords();
        return new Truth_1.Truth(path.join(this.experimentOutDirAbs(), `level_${level_index}_trial_${trial_index}`));
    }
    experimentOutDirAbs() {
        const currSubjectDir = path.join(SUBJECTS_PATH_ABS, this.subject);
        return path.join(currSubjectDir, this.truth.name);
    }
}
exports.Subconfig = Subconfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFDM0Isa0NBQWdFO0FBQ2hFLG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsNkJBQTZCO0FBRTdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQWtEdEMsU0FBUyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUk7SUFDakMsSUFBSyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRztRQUNwQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzdCLE9BQU8sT0FBTyxDQUFDO0tBQ2xCO1NBQU07UUFDSCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDN0I7QUFDTCxDQUFDO0FBR0QsU0FBZ0Isa0JBQWtCLENBQUMsRUFBRSxTQUFTLEtBQTRDLEVBQUUsU0FBUyxFQUFHLFNBQVMsRUFBRTtJQUMvRyxJQUFLLFNBQVMsRUFBRztRQUNiLElBQUssU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRztZQUU3QixTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsQztRQUNELElBQUssQ0FBQyxDQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFHO1lBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLFNBQVMsNEVBQTRFLENBQUMsQ0FBQztZQUN2SCxTQUFTLEdBQUcsU0FBUyxDQUFDO1NBQ3pC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V0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFHRCxrQkFBa0I7UUFDZCxJQUFJLENBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzdELE9BQU8sSUFBSSx1QkFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFLRCwwQkFBMEI7UUFDdEIsT0FBTyxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBRSxXQUFXLEVBQUUsV0FBVyxDQUFFLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFN0QsT0FBTyxJQUFJLGFBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLFNBQVMsV0FBVyxVQUFVLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6RyxDQUFDO0lBR0QsbUJBQW1CO1FBQ2YsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RELENBQUM7Q0FHSjtBQS9YRCw4QkErWEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBTdG9yZSBmcm9tIFwiZWxlY3Ryb24tc3RvcmVcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IEFsZXJ0IGZyb20gXCIuLi9NeUFsZXJ0XCI7XG5pbXBvcnQgbXlmcyBmcm9tIFwiLi4vTXlGc1wiO1xuaW1wb3J0IHsgYm9vbCwgcmVsb2FkUGFnZSwgc3VtLCBlbnVtZXJhdGUsIGFsbCB9IGZyb20gXCIuLi91dGlsXCI7XG5pbXBvcnQgeyBUcnV0aCB9IGZyb20gXCIuLi9UcnV0aFwiO1xuaW1wb3J0IHsgSUxldmVsLCBMZXZlbCwgTGV2ZWxDb2xsZWN0aW9uIH0gZnJvbSBcIi4uL0xldmVsXCI7XG5pbXBvcnQgeyBTd2VldEFsZXJ0UmVzdWx0IH0gZnJvbSBcInN3ZWV0YWxlcnQyXCI7XG5pbXBvcnQgKiBhcyBDb25mIGZyb20gJ2NvbmYnO1xuXG5jb25zb2xlLmxvZygnc3JjL0JpZ0NvbmZpZy9pbmRleC50cycpO1xuXG5leHBvcnQgdHlwZSBFeHBlcmltZW50VHlwZSA9ICdleGFtJyB8ICd0ZXN0JztcbmV4cG9ydCB0eXBlIERlbW9UeXBlID0gJ3ZpZGVvJyB8ICdhbmltYXRpb24nO1xuZXhwb3J0IHR5cGUgUGFnZU5hbWUgPSBcIm5ld1wiIC8vIEFLQSBUTGFzdFBhZ2VcbiAgICB8IFwicnVubmluZ1wiXG4gICAgfCBcInJlY29yZFwiXG4gICAgfCBcImZpbGVfdG9vbHNcIlxuICAgIHwgXCJzZXR0aW5nc1wiXG50eXBlIERldmlhdGlvblR5cGUgPSAncmh5dGhtJyB8ICd0ZW1wbyc7XG5cblxuaW50ZXJmYWNlIElTdWJjb25maWcge1xuICAgIGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbjogc3RyaW5nLFxuICAgIGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uOiBzdHJpbmcsXG4gICAgZGVtb190eXBlOiBEZW1vVHlwZSxcbiAgICBlcnJvcnNfcGxheXJhdGU6IG51bWJlcixcbiAgICBmaW5pc2hlZF90cmlhbHNfY291bnQ6IG51bWJlcixcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgc3ViamVjdDogc3RyaW5nLFxuICAgIHRydXRoX2ZpbGU6IHN0cmluZyxcbiAgICBsZXZlbHM6IElMZXZlbFtdLFxufVxuXG5cbmludGVyZmFjZSBEZXZPcHRpb25zIHtcbiAgICBza2lwX2ZhZGU6IGJvb2xlYW4sXG4gICAgbWF4X2FuaW1hdGlvbl9ub3RlczogbnVsbCB8IG51bWJlcixcbiAgICBtdXRlX2FuaW1hdGlvbjogYm9vbGVhbixcbiAgICBza2lwX21pZGlfZXhpc3RzX2NoZWNrOiBib29sZWFuLFxuICAgIHNraXBfd2hvbGVfdHJ1dGg6IGJvb2xlYW4sXG4gICAgc2tpcF9sZXZlbF9pbnRybzogYm9vbGVhbixcbiAgICBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjazogYm9vbGVhbixcbiAgICBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjazogYm9vbGVhbixcbiAgICByZWxvYWRfcGFnZV9vbl9zdWJtaXQ6IGJvb2xlYW5cbn1cblxuaW50ZXJmYWNlIElCaWdDb25maWcge1xuICAgIGRldjogYm9vbGVhbixcbiAgICBkZXZvcHRpb25zOiBEZXZPcHRpb25zLFxuICAgIGV4YW1fZmlsZTogc3RyaW5nLFxuICAgIHRlc3RfZmlsZTogc3RyaW5nLFxuICAgIGV4cGVyaW1lbnRfdHlwZTogRXhwZXJpbWVudFR5cGUsXG4gICAgbGFzdF9wYWdlOiBQYWdlTmFtZSxcbiAgICBzdWJqZWN0czogc3RyaW5nW10sXG4gICAgdmVsb2NpdGllczogbnVtYmVyLFxufVxuXG5mdW5jdGlvbiB0cnlHZXRGcm9tQ2FjaGU8VCBleHRlbmRzIGtleW9mIElCaWdDb25maWc+KGNvbmZpZzogQmlnQ29uZmlnQ2xzLCBwcm9wOiBUKTogSUJpZ0NvbmZpZ1tUXVxuZnVuY3Rpb24gdHJ5R2V0RnJvbUNhY2hlPFQgZXh0ZW5kcyBrZXlvZiBJU3ViY29uZmlnPihjb25maWc6IFN1YmNvbmZpZywgcHJvcDogVCk6IElTdWJjb25maWdbVF1cbmZ1bmN0aW9uIHRyeUdldEZyb21DYWNoZShjb25maWcsIHByb3ApIHtcbiAgICBpZiAoIGNvbmZpZy5jYWNoZVtwcm9wXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICBjb25zdCBwcm9wVmFsID0gY29uZmlnLmdldChwcm9wKTtcbiAgICAgICAgY29uZmlnLmNhY2hlW3Byb3BdID0gcHJvcFZhbDtcbiAgICAgICAgcmV0dXJuIHByb3BWYWw7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5jYWNoZVtwcm9wXTtcbiAgICB9XG59XG5cbi8qKkxpc3Qgb2YgdHJ1dGggZmlsZSBuYW1lcywgbm8gZXh0ZW5zaW9uKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcnV0aEZpbGVzV2hlcmUoeyBleHRlbnNpb24gfTogeyBleHRlbnNpb24/OiAndHh0JyB8ICdtaWQnIHwgJ21wNCcgfSA9IHsgZXh0ZW5zaW9uIDogdW5kZWZpbmVkIH0pOiBzdHJpbmdbXSB7XG4gICAgaWYgKCBleHRlbnNpb24gKSB7XG4gICAgICAgIGlmICggZXh0ZW5zaW9uLnN0YXJ0c1dpdGgoJy4nKSApIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGV4dGVuc2lvbiA9IGV4dGVuc2lvbi5zbGljZSgxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoICFbICd0eHQnLCAnbWlkJywgJ21wNCcgXS5pbmNsdWRlcyhleHRlbnNpb24pICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGB0cnV0aEZpbGVzTGlzdChcIiR7ZXh0ZW5zaW9ufVwiKSwgbXVzdCBiZSBlaXRoZXIgWyd0eHQnLCdtaWQnLCdtcDQnXSBvciBub3QgYXQgYWxsLiBzZXR0aW5nIHRvIHVuZGVmaW5lZGApO1xuICAgICAgICAgICAgZXh0ZW5zaW9uID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIGNvbnN0IHRydXRoc0RpclBhdGggPSB0aGlzLnRydXRoc0RpclBhdGgoKTtcbiAgICBcbiAgICBsZXQgdHJ1dGhGaWxlcyA9IFsgLi4ubmV3IFNldChmcy5yZWFkZGlyU3luYyhUUlVUSFNfUEFUSF9BQlMpKSBdO1xuICAgIGxldCBmb3JtYXR0ZWRUcnV0aEZpbGVzID0gW107XG4gICAgZm9yICggbGV0IGZpbGUgb2YgdHJ1dGhGaWxlcyApIHtcbiAgICAgICAgbGV0IFsgbmFtZSwgZXh0IF0gPSBteWZzLnNwbGl0X2V4dChmaWxlKTtcbiAgICAgICAgaWYgKCBleHRlbnNpb24gKSB7XG4gICAgICAgICAgICBpZiAoIGV4dC5sb3dlcigpID09PSBgLiR7ZXh0ZW5zaW9ufWAgKSB7XG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkVHJ1dGhGaWxlcy5wdXNoKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9ybWF0dGVkVHJ1dGhGaWxlcy5wdXNoKG5hbWUpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZvcm1hdHRlZFRydXRoRmlsZXNcbiAgICBcbn1cblxuLyoqTGlzdCBvZiBuYW1lcyBvZiB0eHQgdHJ1dGggZmlsZXMgdGhhdCBoYXZlIHRoZWlyIHdob2xlIFwidHJpcGxldFwiIGluIHRhY3QuIG5vIGV4dGVuc2lvbiovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJ1dGhzV2l0aDNUeHRGaWxlcygpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgdHh0RmlsZXNMaXN0ID0gZ2V0VHJ1dGhGaWxlc1doZXJlKHsgZXh0ZW5zaW9uIDogJ3R4dCcgfSk7XG4gICAgY29uc3Qgd2hvbGVUeHRGaWxlcyA9IFtdO1xuICAgIGZvciAoIGxldCBuYW1lIG9mIHR4dEZpbGVzTGlzdCApIHtcbiAgICAgICAgaWYgKCB0eHRGaWxlc0xpc3QuY291bnQodHh0ID0+IHR4dC5zdGFydHNXaXRoKG5hbWUpKSA+PSAzICkge1xuICAgICAgICAgICAgd2hvbGVUeHRGaWxlcy5wdXNoKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0eHRGaWxlc0xpc3QuZmlsdGVyKGEgPT4gdHh0RmlsZXNMaXN0LmZpbHRlcih0eHQgPT4gdHh0LnN0YXJ0c1dpdGgoYSkpLmxlbmd0aCA+PSAzKTtcbn1cblxuZXhwb3J0IGNsYXNzIEJpZ0NvbmZpZ0NscyBleHRlbmRzIFN0b3JlPElCaWdDb25maWc+IHtcbiAgICB0ZXN0OiBTdWJjb25maWc7XG4gICAgZXhhbTogU3ViY29uZmlnO1xuICAgIHJlYWRvbmx5IGNhY2hlOiBQYXJ0aWFsPElCaWdDb25maWc+O1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKF9kb1RydXRoRmlsZUNoZWNrID0gdHJ1ZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmNhY2hlID0ge307XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgdGhpcy5zZXQgPSAoLi4uYXJncykgPT4gY29uc29sZS53YXJuKGBEUllSVU4sIHNldDogYCwgYXJncylcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGVzdE5hbWVXaXRoRXh0ID0gdGhpcy50ZXN0X2ZpbGU7XG4gICAgICAgIGxldCBleGFtTmFtZVdpdGhFeHQgPSB0aGlzLmV4YW1fZmlsZTtcbiAgICAgICAgaWYgKCAhYWxsKHRlc3ROYW1lV2l0aEV4dCwgZXhhbU5hbWVXaXRoRXh0KSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQmlnQ29uZmlnQ2xzIGN0b3IsIGNvdWxkbnQgZ2V0IHRlc3RfZmlsZSBhbmQvb3IgZXhhbV9maWxlIGZyb20ganNvbjpgLCB7XG4gICAgICAgICAgICAgICAgdGVzdE5hbWVXaXRoRXh0LFxuICAgICAgICAgICAgICAgIGV4YW1OYW1lV2l0aEV4dFxuICAgICAgICAgICAgfSwgJywgZGVmYXVsdGluZyB0byBcImZ1cl9lbGlzZV9CLltleHRdXCInKTtcbiAgICAgICAgICAgIHRlc3ROYW1lV2l0aEV4dCA9ICdmdXJfZWxpc2VfQi50ZXN0JztcbiAgICAgICAgICAgIGV4YW1OYW1lV2l0aEV4dCA9ICdmdXJfZWxpc2VfQi5leGFtJztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN1YmNvbmZpZyh0ZXN0TmFtZVdpdGhFeHQpO1xuICAgICAgICB0aGlzLnNldFN1YmNvbmZpZyhleGFtTmFtZVdpdGhFeHQpO1xuICAgICAgICAvLyB0aGlzLnRlc3QgPSBuZXcgU3ViY29uZmlnKHRlc3ROYW1lV2l0aEV4dCk7XG4gICAgICAgIC8vIHRoaXMuZXhhbSA9IG5ldyBTdWJjb25maWcoZXhhbU5hbWVXaXRoRXh0KTtcbiAgICAgICAgdGhpcy5zdWJqZWN0cyA9IHRoaXMuc3ViamVjdHM7IC8vIHRvIGVuc3VyZSBoYXZpbmcgc3ViY29uZmlnJ3Mgc3ViamVjdHNcbiAgICAgICAgaWYgKCBfZG9UcnV0aEZpbGVDaGVjayApIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgUHJvbWlzZS5hbGwoW3RoaXMudGVzdC5kb1RydXRoRmlsZUNoZWNrKCksdGhpcy5leGFtLmRvVHJ1dGhGaWxlQ2hlY2soKV0pO1xuICAgICAgICAgICAgICAgIC8qICAgICAgICAgICAgICAgIHRoaXMudGVzdC5kb1RydXRoRmlsZUNoZWNrKClcbiAgICAgICAgICAgICAgICAgLnRoZW4oc3dhbCA9PiB7XG4gICAgICAgICAgICAgICAgIHRoaXMuZXhhbS5kb1RydXRoRmlsZUNoZWNrKClcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICApOyovXG4gICAgICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBCaWdDb25maWdDbHMgY3RvciwgZXJyb3Igd2hlbiBfZG9UcnV0aEZpbGVDaGVjazpgLCBlKTtcbiAgICAgICAgICAgICAgICBBbGVydC5iaWcub25lQnV0dG9uKGBBbiBlcnJvciBvY2N1cmVkIHdoZW4gcnVubmluZyBhIHRydXRoIGZpbGVzIGNoZWNrLiBZb3Ugc2hvdWxkIHRyeSB0byB1bmRlcnN0YW5kIHRoZSBwcm9ibGVtIGJlZm9yZSBjb250aW51aW5nYCwgeyB0ZXh0IDogZS5tZXNzYWdlIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZzogSVN1YmNvbmZpZywgZXhwZXJpbWVudFR5cGU6IEV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ0JpZ0NvbmZpZ0NscyB1c2VkIGZyb21TYXZlZENvbmZpZy4gSW1wb3NzaWJsZSB0byBsb2FkIGJpZyBmaWxlLiBSZXR1cm5pbmcnKTtcbiAgICAgICAgLyppZiAoIERSWVJVTiApIHJldHVybiBjb25zb2xlLmxvZyhgZnJvbVNhdmVkQ29uZmlnLCBEUllSVU5gKTtcbiAgICAgICAgIGNvbnN0IHRydXRoRmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKHNhdmVkQ29uZmlnLnRydXRoX2ZpbGVfcGF0aCwgJy50eHQnKTtcbiAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKHBhdGguam9pbihUUlVUSFNfUEFUSF9BQlMsIHRydXRoRmlsZU5hbWUpKTtcbiAgICAgICAgIHRoaXMuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgICB0aGlzLmNvbmZpZyhleHBlcmltZW50VHlwZSkuZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnKTsqL1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipAZXhhbXBsZVxuICAgICB1cGRhdGUoJ3N1YmplY3RzJywgW25hbWVzXSlcbiAgICAgKi9cbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywga3ZQYWlyczogUGFydGlhbDxJQmlnQ29uZmlnPilcbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywgdmFsdWVzOiBhbnlbXSlcbiAgICB1cGRhdGUoSywga3YpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdCaWdDb25maWcudXBkYXRlKCkgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBpZiAoIEFycmF5LmlzQXJyYXkoVikgKSB7XG4gICAgICAgICAgICBsZXQgbmV3VmFsdWU6IGFueVtdID0gVjtcbiAgICAgICAgICAgIGlmICggQXJyYXkuaXNBcnJheShrdikgKSB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWUucHVzaCguLi5rdik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlLnB1c2goa3YpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgbmV3VmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihWLCBrdik7XG4gICAgICAgICAgICB0aGlzLnNldChLLCBWKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXQoSyk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBsYXN0X3BhZ2UoKTogUGFnZU5hbWUge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2xhc3RfcGFnZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbGFzdF9wYWdlKHBhZ2U6IFBhZ2VOYW1lKSB7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB2YWxpZHBhZ2VzID0gWyBcIm5ld1wiLCBcInJ1bm5pbmdcIiwgXCJyZWNvcmRcIiwgXCJmaWxlX3Rvb2xzXCIsIFwic2V0dGluZ3NcIiBdO1xuICAgICAgICBpZiAoICF2YWxpZHBhZ2VzLmluY2x1ZGVzKHBhZ2UpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGFzdF9wYWdlKFwiJHtwYWdlfVwiKSwgbXVzdCBiZSBvbmUgb2YgJHt2YWxpZHBhZ2VzLmpvaW4oJywgJyl9LiBzZXR0aW5nIHRvIG5ld2ApO1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xhc3RfcGFnZScsICduZXcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCBwYWdlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkXG4gICAgICogU2hvdWxkIGJlIHVzZWQgaW5zdGVhZCBvZiBTdWJjb25maWcgY29uc3RydWN0b3IuXG4gICAgICogVXBkYXRlcyBgZXhhbV9maWxlYCBvciBgdGVzdF9maWxlYCwgaW4gZmlsZSBhbmQgaW4gY2FjaGUuIEFsc28gaW5pdGlhbGl6ZXMgYW5kIGNhY2hlcyBhIG5ldyBTdWJjb25maWcgKHRoaXMuZXhhbSA9IG5ldyBTdWJjb25maWcoLi4uKSkuICovXG4gICAgc2V0U3ViY29uZmlnKG5hbWVXaXRoRXh0OiBzdHJpbmcsIHN1YmNvbmZpZz86IFN1YmNvbmZpZykge1xuICAgICAgICAvLyBjb25zdCBbIGZpbGVuYW1lLCBleHQgXSA9IG15ZnMuc3BsaXRfZXh0KG5hbWVXaXRoRXh0KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIFN1YmNvbmZpZy52YWxpZGF0ZU5hbWUobmFtZVdpdGhFeHQpO1xuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIGlmICggZS5tZXNzYWdlID09PSAnRXh0ZW5zaW9uRXJyb3InICkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oYHNldCBzZXRTdWJjb25maWcgKCR7bmFtZVdpdGhFeHR9KSBoYXMgbm8gZXh0ZW5zaW9uLCBvciBleHQgaXMgYmFkLiBub3Qgc2V0dGluZ2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCBlLm1lc3NhZ2UgPT09ICdCYXNlbmFtZUVycm9yJyApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUobmFtZVdpdGhFeHQpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0U3ViY29uZmlnKCR7bmFtZVdpdGhFeHR9KSwgcGFzc2VkIGEgcGF0aCAod2l0aCBzbGFoZXMpLiBuZWVkIG9ubHkgYSBiYXNlbmFtZS5leHQuIGNvbnRpbnVpbmcgd2l0aCBvbmx5IGJhc2VuYW1lOiAke2Jhc2VuYW1lfWApO1xuICAgICAgICAgICAgICAgIG5hbWVXaXRoRXh0ID0gYmFzZW5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKG5hbWVXaXRoRXh0KTtcbiAgICAgICAgLy8vLyBFeHRlbnNpb24gYW5kIGZpbGUgbmFtZSBva1xuICAgICAgICBjb25zdCBzdWJjZmdUeXBlID0gZXh0LnNsaWNlKDEpIGFzIEV4cGVyaW1lbnRUeXBlO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHN1YmNvbmZpZ0tleSA9IGAke3N1YmNmZ1R5cGV9X2ZpbGVgIGFzIFwiZXhhbV9maWxlXCIgfCBcInRlc3RfZmlsZVwiO1xuICAgICAgICAvLy8vIHRoaXMuc2V0KCdleGFtX2ZpbGUnLCAnZnVyX2VsaXNlX0IuZXhhbScpXG4gICAgICAgIHRoaXMuc2V0KHN1YmNvbmZpZ0tleSwgbmFtZVdpdGhFeHQpO1xuICAgICAgICB0aGlzLmNhY2hlW3N1YmNvbmZpZ0tleV0gPSBuYW1lV2l0aEV4dDtcbiAgICAgICAgY29uc29sZS5sb2coYHNldFN1YmNvbmZpZ2AsIHtcbiAgICAgICAgICAgIG5hbWVXaXRoRXh0LFxuICAgICAgICAgICAgc3ViY29uZmlnLFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vLy8gdGhpcy5leGFtID0gbmV3IFN1YmNvbmZpZygnZnVyX2VsaXNlX0IuZXhhbScsIHN1YmNvbmZpZylcbiAgICAgICAgdGhpc1tzdWJjZmdUeXBlXSA9IG5ldyBTdWJjb25maWcobmFtZVdpdGhFeHQsIHN1YmNvbmZpZylcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0U3ViY29uZmlnKCk6IFN1YmNvbmZpZyB7XG4gICAgICAgIHJldHVybiB0aGlzW3RoaXMuZXhwZXJpbWVudF90eXBlXVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkXG4gICAgICogUmV0dXJucyB0aGUgZXhhbSBmaWxlIG5hbWUgaW5jbHVkaW5nIGV4dGVuc2lvbiovXG4gICAgZ2V0IGV4YW1fZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsICdleGFtX2ZpbGUnKTtcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuZ2V0KCdleGFtX2ZpbGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqVXBkYXRlcyBleGFtX2ZpbGUgYW5kIGFsc28gaW5pdGlhbGl6ZXMgbmV3IFN1YmNvbmZpZyovXG4gICAgc2V0IGV4YW1fZmlsZShuYW1lV2l0aEV4dDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3ViY29uZmlnKG5hbWVXaXRoRXh0KVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkXG4gICAgICogUmV0dXJucyB0aGUgdGVzdCBmaWxlIG5hbWUgaW5jbHVkaW5nIGV4dGVuc2lvbiovXG4gICAgZ2V0IHRlc3RfZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsICd0ZXN0X2ZpbGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIFVwZGF0ZXMgdGVzdF9maWxlIGFuZCBhbHNvIGluaXRpYWxpemVzIG5ldyBTdWJjb25maWcqL1xuICAgIHNldCB0ZXN0X2ZpbGUobmFtZVdpdGhFeHQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldFN1YmNvbmZpZyhuYW1lV2l0aEV4dClcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIENhbiBiZSBnb3R0ZW4gYWxzbyB3aXRoIGBzdWJjb25maWcudHlwZWAqL1xuICAgIGdldCBleHBlcmltZW50X3R5cGUoKTogRXhwZXJpbWVudFR5cGUge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiZXhwZXJpbWVudF90eXBlXCIpXG4gICAgICAgIC8qaWYgKCB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgY29uc3QgZXhwZXJpbWVudFR5cGUgPSB0aGlzLmdldCgnZXhwZXJpbWVudF90eXBlJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgcmV0dXJuIGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZTtcbiAgICAgICAgIH0qL1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgZXhwZXJpbWVudF90eXBlKGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBpZiAoICFbICdleGFtJywgJ3Rlc3QnIF0uaW5jbHVkZXMoZXhwZXJpbWVudFR5cGUpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBCaWdDb25maWcgZXhwZXJpbWVudF90eXBlIHNldHRlciwgZ290IGV4cGVyaW1lbnRUeXBlOiAnJHtleHBlcmltZW50VHlwZX0nLiBNdXN0IGJlIGVpdGhlciAndGVzdCcgb3IgJ2V4YW0nLiBzZXR0aW5nIHRvIHRlc3RgKTtcbiAgICAgICAgICAgIGV4cGVyaW1lbnRUeXBlID0gJ3Rlc3QnO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KCdleHBlcmltZW50X3R5cGUnLCBleHBlcmltZW50VHlwZSk7XG4gICAgICAgIHRoaXMuY2FjaGUuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgZ2V0IHN1YmplY3RzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdzdWJqZWN0cycpO1xuICAgIH1cbiAgICBcbiAgICAvKipFbnN1cmVzIGhhdmluZyBgdGhpcy50ZXN0LnN1YmplY3RgIGFuZCBgdGhpcy5leGFtLnN1YmplY3RgIGluIHRoZSBsaXN0IHJlZ2FyZGxlc3MqL1xuICAgIHNldCBzdWJqZWN0cyhzdWJqZWN0TGlzdDogc3RyaW5nW10pIHtcbiAgICAgICAgLy8gVE9ETzogY2hlY2sgZm9yIG5vbiBleGlzdGluZyBmcm9tIGZpbGVzXG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2Fybignc2V0IHN1YmplY3RzLCBEUllSVU4uIHJldHVybmluZycpXG4gICAgICAgIH1cbiAgICAgICAgc3ViamVjdExpc3QucHVzaCh0aGlzLnRlc3Quc3ViamVjdCk7XG4gICAgICAgIHN1YmplY3RMaXN0LnB1c2godGhpcy5leGFtLnN1YmplY3QpO1xuICAgICAgICBjb25zdCBzdWJqZWN0cyA9IFsgLi4ubmV3IFNldChzdWJqZWN0TGlzdCkgXTtcbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3RzJywgc3ViamVjdHMpO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IGRldigpOiB7IFtLIGluIGtleW9mIERldk9wdGlvbnNdOiAoKSA9PiBEZXZPcHRpb25zW0tdIH0ge1xuICAgICAgICBjb25zdCBfZGV2ID0gdGhpcy5nZXQoJ2RldicpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2tpcF9mYWRlIDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfZmFkZSA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX2ZhZGU7XG4gICAgICAgICAgICAgICAgaWYgKCBza2lwX2ZhZGUgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF9mYWRlYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfZmFkZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtYXhfYW5pbWF0aW9uX25vdGVzIDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICggX2RldiApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF4X2FuaW1hdGlvbl9ub3RlcyA9IHRoaXMuZ2V0KCdkZXZvcHRpb25zJykubWF4X2FuaW1hdGlvbl9ub3RlcztcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBtYXhfYW5pbWF0aW9uX25vdGVzICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLm1heF9hbmltYXRpb25fbm90ZXM6ICR7bWF4X2FuaW1hdGlvbl9ub3Rlc31gKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1heF9hbmltYXRpb25fbm90ZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG11dGVfYW5pbWF0aW9uIDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG11dGVfYW5pbWF0aW9uID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLm11dGVfYW5pbWF0aW9uO1xuICAgICAgICAgICAgICAgIGlmICggbXV0ZV9hbmltYXRpb24gKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMubXV0ZV9hbmltYXRpb25gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbXV0ZV9hbmltYXRpb247XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2tpcF9taWRpX2V4aXN0c19jaGVjayA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwX21pZGlfZXhpc3RzX2NoZWNrID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfbWlkaV9leGlzdHNfY2hlY2s7XG4gICAgICAgICAgICAgICAgaWYgKCBza2lwX21pZGlfZXhpc3RzX2NoZWNrICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNraXBfbWlkaV9leGlzdHNfY2hlY2tgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2tpcF9taWRpX2V4aXN0c19jaGVjaztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBza2lwX3dob2xlX3RydXRoIDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfd2hvbGVfdHJ1dGggPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF93aG9sZV90cnV0aDtcbiAgICAgICAgICAgICAgICBpZiAoIHNraXBfd2hvbGVfdHJ1dGggKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF93aG9sZV90cnV0aGApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX3dob2xlX3RydXRoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNraXBfbGV2ZWxfaW50cm8gOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpcF9sZXZlbF9pbnRybyA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX2xldmVsX2ludHJvO1xuICAgICAgICAgICAgICAgIGlmICggc2tpcF9sZXZlbF9pbnRybyApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5za2lwX2xldmVsX2ludHJvYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfbGV2ZWxfaW50cm87XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2sgOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2sgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2s7XG4gICAgICAgICAgICAgICAgaWYgKCBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjayApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5za2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFja2ApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjaztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjaztcbiAgICAgICAgICAgICAgICBpZiAoIHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlbG9hZF9wYWdlX29uX3N1Ym1pdCA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWxvYWRfcGFnZV9vbl9zdWJtaXQgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykucmVsb2FkX3BhZ2Vfb25fc3VibWl0O1xuICAgICAgICAgICAgICAgIGlmICggcmVsb2FkX3BhZ2Vfb25fc3VibWl0ICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnJlbG9hZF9wYWdlX29uX3N1Ym1pdGApO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWxvYWRfcGFnZV9vbl9zdWJtaXQ7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBnZXQgdmVsb2NpdGllcygpIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCBcInZlbG9jaXRpZXNcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IHZlbG9jaXRpZXModmFsOiBudW1iZXIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGZsb29yZWQgPSBNYXRoLmZsb29yKHZhbCk7XG4gICAgICAgICAgICBpZiAoIGlzTmFOKGZsb29yZWQpICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IHZlbG9jaXRpZXMsIE1hdGguZmxvb3IodmFsKSBpcyBOYU46YCwgeyB2YWwsIGZsb29yZWQgfSwgJy4gbm90IHNldHRpbmcnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCBmbG9vcmVkID49IDEgJiYgZmxvb3JlZCA8PSAxNiApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXQoJ3ZlbG9jaXRpZXMnLCBmbG9vcmVkKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWNoZS52ZWxvY2l0aWVzID0gZmxvb3JlZDtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgdmVsb2NpdGllcywgYmFkIHJhbmdlOiAke3ZhbH0uIG5vdCBzZXR0aW5nYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IHZlbG9jaXRpZXMsIEV4Y2VwdGlvbiB3aGVuIHRyeWluZyB0byBNYXRoLmZsb29yKHZhbCk6YCwgZSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgU3ViY29uZmlnIGV4dGVuZHMgQ29uZjxJU3ViY29uZmlnPiB7IC8vIEFLQSBDb25maWdcbiAgICBwcml2YXRlIHJlYWRvbmx5IHR5cGU6IEV4cGVyaW1lbnRUeXBlO1xuICAgIHJlYWRvbmx5IGNhY2hlOiBQYXJ0aWFsPElTdWJjb25maWc+O1xuICAgIHRydXRoOiBUcnV0aDtcbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBAcGFyYW0gbmFtZVdpdGhFeHQgLSBzZXRzIHRoZSBgbmFtZWAgZmllbGQgaW4gZmlsZVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG5hbWVXaXRoRXh0OiBzdHJpbmcsIHN1YmNvbmZpZz86IFN1YmNvbmZpZykge1xuICAgICAgICBcbiAgICAgICAgbGV0IFsgZmlsZW5hbWUsIGV4dCBdID0gbXlmcy5zcGxpdF9leHQobmFtZVdpdGhFeHQpO1xuICAgICAgICBpZiAoICFbICcuZXhhbScsICcudGVzdCcgXS5pbmNsdWRlcyhleHQpICkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTdWJjb25maWcgY3RvciAoJHtuYW1lV2l0aEV4dH0pIGhhcyBiYWQgb3Igbm8gZXh0ZW5zaW9uYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHlwZSA9IGV4dC5zbGljZSgxKSBhcyBFeHBlcmltZW50VHlwZTtcbiAgICAgICAgbGV0IGRlZmF1bHRzO1xuICAgICAgICBpZiAoIGJvb2woc3ViY29uZmlnKSApIHtcbiAgICAgICAgICAgIGlmICggc3ViY29uZmlnLnN0b3JlICkge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRzID0geyAuLi5zdWJjb25maWcuc3RvcmUsIG5hbWUgOiBuYW1lV2l0aEV4dCB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0cyA9IHN1YmNvbmZpZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlZmF1bHRzID0geyBuYW1lIDogbmFtZVdpdGhFeHQgfTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICBmaWxlRXh0ZW5zaW9uIDogdHlwZSxcbiAgICAgICAgICAgIGN3ZCA6IENPTkZJR1NfUEFUSF9BQlMsXG4gICAgICAgICAgICBjb25maWdOYW1lIDogZmlsZW5hbWUsXG4gICAgICAgICAgICBkZWZhdWx0c1xuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5jYWNoZSA9IHsgbmFtZSA6IG5hbWVXaXRoRXh0IH07XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIGlmICggc3ViY29uZmlnICkge1xuICAgICAgICAgICAgdGhpcy5zZXQoeyAuLi5zdWJjb25maWcuc3RvcmUsIG5hbWUgOiBuYW1lV2l0aEV4dCB9KTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy50cnV0aCA9IG5ldyBUcnV0aChteWZzLnJlbW92ZV9leHQodGhpcy50cnV0aF9maWxlKSk7XG4gICAgICAgIH0gY2F0Y2ggKCBlICkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgU3ViY29uZmlnIGNvbnN0cnVjdG9yLCBpbml0aWFsaXppbmcgbmV3IFRydXRoIGZyb20gdGhpcy50cnV0aF9maWxlIHRocmV3IGFuIGVycm9yLiBQcm9iYWJseSBiZWNhdXNlIHRoaXMudHJ1dGhfZmlsZSBpcyB1bmRlZmluZWQuIFNob3VsZCBtYXliZSBuZXN0IHVuZGVyIGlmKHN1YmNvbmZpZykgY2xhdXNlYCwgXCJ0aGlzLnRydXRoX2ZpbGVcIiwgdGhpcy50cnV0aF9maWxlLCBlKVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyB2YWxpZGF0ZU5hbWUobmFtZVdpdGhFeHQ6IHN0cmluZykge1xuICAgICAgICBsZXQgWyBmaWxlbmFtZSwgZXh0IF0gPSBteWZzLnNwbGl0X2V4dChuYW1lV2l0aEV4dCk7XG4gICAgICAgIGlmICggIVsgJy5leGFtJywgJy50ZXN0JyBdLmluY2x1ZGVzKGV4dCkgKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4dGVuc2lvbkVycm9yYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBuYW1lV2l0aEV4dCAhPT0gYCR7ZmlsZW5hbWV9JHtleHR9YCApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQmFzZW5hbWVFcnJvcicpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGRvVHJ1dGhGaWxlQ2hlY2soKTogUHJvbWlzZTxTd2VldEFsZXJ0UmVzdWx0PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGDwn5K+IFN1YmNvbmZpZygke3RoaXMudHlwZX0pLmRvVHJ1dGhGaWxlQ2hlY2soKWApO1xuICAgICAgICBcbiAgICAgICAgLy8gY29uc3QgdHJ1dGggPSB0aGlzLmdldFRydXRoKCk7XG4gICAgICAgIGlmICggdGhpcy50cnV0aC50eHQuYWxsRXhpc3QoKSApIHtcbiAgICAgICAgICAgIHJldHVybiBBbGVydC5zbWFsbC5zdWNjZXNzKGAke3RoaXMudHJ1dGgubmFtZX0udHh0LCAqX29uLnR4dCwgYW5kICpfb2ZmLnR4dCBmaWxlcyBleGlzdC5gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBbJ2Z1cl9lbGlzZV9CJyB4IDMsICdmdXJfZWxpc2VfUi50eHQnIHggMywgLi4uXVxuICAgICAgICBjb25zdCB0cnV0aHNXaXRoM1R4dEZpbGVzID0gZ2V0VHJ1dGhzV2l0aDNUeHRGaWxlcygpO1xuICAgICAgICBpZiAoICFib29sKHRydXRoc1dpdGgzVHh0RmlsZXMpIClcbiAgICAgICAgICAgIHJldHVybiBBbGVydC5iaWcud2FybmluZyh7XG4gICAgICAgICAgICAgICAgdGl0bGUgOiAnTm8gdmFsaWQgdHJ1dGggZmlsZXMgZm91bmQnLFxuICAgICAgICAgICAgICAgIGh0bWwgOiAnVGhlcmUgbmVlZHMgdG8gYmUgYXQgbGVhc3Qgb25lIHR4dCBmaWxlIHdpdGggb25lIFwib25cIiBhbmQgb25lIFwib2ZmXCIgY291bnRlcnBhcnRzLidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBBbGVydC5iaWcuYmxvY2tpbmcoe1xuICAgICAgICAgICAgdGl0bGUgOiBgRGlkbid0IGZpbmQgYWxsIHRocmVlIC50eHQgZmlsZXMgZm9yICR7dGhpcy50cnV0aC5uYW1lfWAsXG4gICAgICAgICAgICBodG1sIDogJ1RoZSBmb2xsb3dpbmcgdHJ1dGhzIGFsbCBoYXZlIDMgdHh0IGZpbGVzLiBQbGVhc2UgY2hvb3NlIG9uZSBvZiB0aGVtLCBvciBmaXggdGhlIGZpbGVzIGFuZCByZWxvYWQuJyxcbiAgICAgICAgICAgIHNob3dDbG9zZUJ1dHRvbiA6IHRydWUsXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHN0cmluZ3MgOiB0cnV0aHNXaXRoM1R4dEZpbGVzLFxuICAgICAgICAgICAgY2xpY2tGbiA6IGVsID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zdCBjb25maWcgPSB0aGlzLmNvbmZpZyh0aGlzLmV4cGVyaW1lbnRfdHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sZXZlbHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cnV0aF9maWxlID0gZWwudGV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLnRydXRoX2ZpbGVfcGF0aCA9IG5ldyBUcnV0aChlbC50ZXh0KCkpO1xuICAgICAgICAgICAgICAgICAgICByZWxvYWRQYWdlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoIGVyciApIHtcbiAgICAgICAgICAgICAgICAgICAgQWxlcnQuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgQWxlcnQuYmlnLmVycm9yKHsgdGl0bGUgOiBlcnIubWVzc2FnZSwgaHRtbCA6ICdTb21ldGhpbmcgaGFwcGVuZWQuJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBpbmNyZWFzZShLOiBrZXlvZiBJU3ViY29uZmlnKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgdXNlZCBzdWJjb25maWcuaW5jcmVhc2UsIFVOVEVTVEVEYCk7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignaW5jcmVhc2UsIERSWVJVTi4gcmV0dXJuaW5nJyk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IFYgPSB0aGlzLmdldChLKTtcbiAgICAgICAgXG4gICAgICAgIGlmICggViA9PT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgIHRoaXMuc2V0KEssIDEpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVvZlYgPSB0eXBlb2YgVjtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGlmICggdHlwZW9mViA9PT0gJ251bWJlcicgfHwgKHR5cGVvZlYgPT09ICdzdHJpbmcnICYmIFYuaXNkaWdpdCgpKSApIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoSywgTWF0aC5mbG9vcihWKSArIDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJCaWdDb25maWdDbHMgdHJpZWQgdG8gaW5jcmVhc2UgYSB2YWx1ZSB0aGF0IGlzIG5vdCBhIG51bWJlciBub3IgYSBzdHJpbmcuaXNkaWdpdCgpXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgdG9PYmooKTogT21pdDxJU3ViY29uZmlnLCBcIm5hbWVcIj4geyAvLyBBS0EgdG9TYXZlZENvbmZpZ1xuICAgICAgICBcbiAgICAgICAgY29uc3Qgb2JqID0gdGhpcy5zdG9yZTtcbiAgICAgICAgZGVsZXRlIG9iai5uYW1lO1xuICAgICAgICByZXR1cm4gb2JqXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgZnJvbVN1YmNvbmZpZyhzdWJjb25maWc6IFN1YmNvbmZpZykge1xuICAgICAgICBpZiAoIERSWVJVTiApIHJldHVybiBjb25zb2xlLndhcm4oJ2Zyb21PYmosIERSWVJVTi4gcmV0dXJuaW5nJyk7XG4gICAgICAgIC8vIHRoaXMuc2V0KHN1YmNvbmZpZy50b09iaigpKTtcbiAgICAgICAgLy8gdGhpcy5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gPSBzdWJjb25maWcuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uO1xuICAgICAgICAvLyB0aGlzLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uID0gc3ViY29uZmlnLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uO1xuICAgICAgICAvLyB0aGlzLmRlbW9fdHlwZSA9IHN1YmNvbmZpZy5kZW1vX3R5cGU7XG4gICAgICAgIC8vIHRoaXMuZXJyb3JzX3BsYXlyYXRlID0gc3ViY29uZmlnLmVycm9yc19wbGF5cmF0ZTtcbiAgICAgICAgLy8gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQgPSBzdWJjb25maWcuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgICAgICAvLyB0aGlzLmxldmVscyA9IHN1YmNvbmZpZy5sZXZlbHM7XG4gICAgICAgIC8vIHRoaXMuc3ViamVjdCA9IHN1YmNvbmZpZy5zdWJqZWN0O1xuICAgICAgICAvLyB0aGlzLnRydXRoX2ZpbGUgPSBzdWJjb25maWcudHJ1dGhfZmlsZTtcbiAgICAgICAgLy8gdGhpcy5fdXBkYXRlU2F2ZWRGaWxlKCd0cnV0aF9maWxlX3BhdGgnLCBjZmdGaWxlLnRydXRoX2ZpbGVfcGF0aCk7XG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBwcml2YXRlIF91cGRhdGVTYXZlZEZpbGUoa2V5OiBrZXlvZiBJU3ViY29uZmlnLCB2YWx1ZSkge1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ191cGRhdGVTYXZlZEZpbGUsIERSWVJVTi4gcmV0dXJuaW5nJylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdfdXBkYXRlU2F2ZWRGaWxlKCkgZG9lcyBub3RoaW5nLCByZXR1cm5pbmcnKTtcbiAgICAgICAgdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIC8qY29uc3QgY29uZiA9IG5ldyAocmVxdWlyZSgnY29uZicpKSh7XG4gICAgICAgICBjd2QgOiBDT05GSUdTX1BBVEhfQUJTLFxuICAgICAgICAgY29uZmlnTmFtZSA6IHRoaXMubmFtZSxcbiAgICAgICAgIGZpbGVFeHRlbnNpb24gOiB0aGlzLnR5cGUsXG4gICAgICAgICBzZXJpYWxpemUgOiB2YWx1ZSA9PiBKU09OLnN0cmluZ2lmeSh2YWx1ZSwgbnVsbCwgNClcbiAgICAgICAgIH0pO1xuICAgICAgICAgY29uZi5zZXQoa2V5LCB2YWx1ZSk7Ki9cbiAgICB9XG4gICAgXG4gICAgXG4gICAgcHJpdmF0ZSBzZXREZXZpYXRpb24oZGV2aWF0aW9uVHlwZTogRGV2aWF0aW9uVHlwZSwgZGV2aWF0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdHlwZW9mRGV2aWF0aW9uID0gdHlwZW9mIGRldmlhdGlvbjtcbiAgICAgICAgaWYgKCB0eXBlb2ZEZXZpYXRpb24gPT09ICdudW1iZXInICkge1xuICAgICAgICAgICAgZGV2aWF0aW9uID0gYCR7ZGV2aWF0aW9ufSVgO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXREZXZpYXRpb24gZ290IFwiZGV2aWF0aW9uXCIgdHlwZSBudW1iZXIuIGFwcGVuZGVkIFwiJVwiLiBkZXZpYXRpb24gbm93OiAke2RldmlhdGlvbn1gKTtcbiAgICAgICAgfSBlbHNlIGlmICggdHlwZW9mRGV2aWF0aW9uID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICAgIGlmICggIWRldmlhdGlvbi5lbmRzV2l0aChcIiVcIikgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXREZXZpYXRpb24gZ290IGRldmlhdGlvbiB3aXRob3V0ICUuIGFwcGVuZGVkICUuIGRldmlhdGlvbiBub3c6IFwiJHtkZXZpYXRpb259XCJgKTtcbiAgICAgICAgICAgICAgICBkZXZpYXRpb24gPSBgJHtkZXZpYXRpb259JWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldERldmlhdGlvbiwgcmVjZWl2ZWQgXCJkZXZpYXRpb25cIiBub3Qgc3RyaW5nIG5vdCBudW1iZXIuIHJldHVybmluZy4gZGV2aWF0aW9uOmAsIGRldmlhdGlvbik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpcy5zZXQoYGFsbG93ZWRfJHtkZXZpYXRpb25UeXBlfV9kZXZpYXRpb25gLCBkZXZpYXRpb24pO1xuICAgICAgICB0aGlzLmNhY2hlW2BhbGxvd2VkXyR7ZGV2aWF0aW9uVHlwZX1fZGV2aWF0aW9uYF0gPSBkZXZpYXRpb247XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCBhbGxvd2VkX3RlbXBvX2RldmlhdGlvbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiYWxsb3dlZF90ZW1wb19kZXZpYXRpb25cIilcbiAgICAgICAgLyppZiAoIHRoaXMuY2FjaGUuYWxsb3dlZF90ZW1wb19kZXZpYXRpb24gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgIGNvbnN0IGFsbG93ZWRUZW1wb0RldmlhdGlvbiA9IHRoaXMuZ2V0KCdhbGxvd2VkX3RlbXBvX2RldmlhdGlvbicpO1xuICAgICAgICAgdGhpcy5jYWNoZS5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbiA9IGFsbG93ZWRUZW1wb0RldmlhdGlvbjtcbiAgICAgICAgIHJldHVybiBhbGxvd2VkVGVtcG9EZXZpYXRpb247XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuYWxsb3dlZF90ZW1wb19kZXZpYXRpb247XG4gICAgICAgICB9Ki9cbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uKGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0RGV2aWF0aW9uKFwidGVtcG9cIiwgZGV2aWF0aW9uKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0IGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uXCIpO1xuICAgICAgICAvKmlmICggdGhpcy5jYWNoZS5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb24gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgIGNvbnN0IGFsbG93ZWRSaHl0aG1EZXZpYXRpb24gPSB0aGlzLmdldCgnYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbiA9IGFsbG93ZWRSaHl0aG1EZXZpYXRpb247XG4gICAgICAgICByZXR1cm4gYWxsb3dlZFJoeXRobURldmlhdGlvbjtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb247XG4gICAgICAgICB9Ki9cbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbihkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldERldmlhdGlvbihcInJoeXRobVwiLCBkZXZpYXRpb24pO1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBnZXQgZGVtb190eXBlKCk6IERlbW9UeXBlIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCBcImRlbW9fdHlwZVwiKTtcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuZ2V0KCdkZW1vX3R5cGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IGRlbW9fdHlwZSh0eXBlOiBEZW1vVHlwZSkge1xuICAgICAgICBpZiAoICFbICd2aWRlbycsICdhbmltYXRpb24nIF0uaW5jbHVkZXModHlwZSkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYENvbmZpZyBkZW1vX3R5cGUgc2V0dGVyLCBiYWQgdHlwZSA9ICR7dHlwZX0sIGNhbiBiZSBlaXRoZXIgdmlkZW8gb3IgYW5pbWF0aW9uLiBOb3Qgc2V0dGluZ2ApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2RlbW9fdHlwZScsIHR5cGUpO1xuICAgICAgICAgICAgdGhpcy5jYWNoZS5kZW1vX3R5cGUgPSB0eXBlO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldCBlcnJvcnNfcGxheXJhdGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdlcnJvcnNfcGxheXJhdGUnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGVycm9yc19wbGF5cmF0ZShzcGVlZDogbnVtYmVyKSB7XG4gICAgICAgIGlmICggaXNOYU4oc3BlZWQpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBjb25maWcgc2V0IGVycm9yc19wbGF5cmF0ZSwgcmVjZWl2ZWQgYmFkIFwic3BlZWRcIiBOYU46ICR7c3BlZWR9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZXJyb3JzX3BsYXlyYXRlJywgc3BlZWQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBnZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnZmluaXNoZWRfdHJpYWxzX2NvdW50Jyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBmaW5pc2hlZF90cmlhbHNfY291bnQoY291bnQ6IG51bWJlcikge1xuICAgICAgICBpZiAoIGlzTmFOKGNvdW50KSB8fCBjb3VudCA8IDAgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGNvbmZpZyBzZXQgZmluaXNoZWRfdHJpYWxzX2NvdW50LCByZWNlaXZlZCBiYWQgXCJjb3VudFwiOiAke2NvdW50fWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2ZpbmlzaGVkX3RyaWFsc19jb3VudCcsIGNvdW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipOYW1lIG9mIGNvbmZpZyBmaWxlLCBpbmNsdWRpbmcgZXh0ZW5zaW9uLiBBbHdheXMgcmV0dXJucyBgbmFtZWAgZnJvbSBjYWNoZS4gVGhpcyBpcyBiZWNhdXNlIHRoZXJlJ3Mgbm8gc2V0dGVyOyBgbmFtZWAgaXMgc3RvcmVkIGluIGNhY2hlIGF0IGNvbnN0cnVjdG9yLiovXG4gICAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUubmFtZTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IHN1YmplY3QoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdzdWJqZWN0Jyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBzdWJqZWN0KG5hbWU6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdzZXQgc3ViamVjdCwgRFJZUlVOJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3QnLCBuYW1lKTtcbiAgICAgICAgaWYgKCBuYW1lICkge1xuICAgICAgICAgICAgY29uc3QgR2xvYiA9IHJlcXVpcmUoJy4uL0dsb2InKS5kZWZhdWx0O1xuICAgICAgICAgICAgR2xvYi5CaWdDb25maWcuc3ViamVjdHMgPSBbIC4uLm5ldyBTZXQoWyAuLi5HbG9iLkJpZ0NvbmZpZy5zdWJqZWN0cywgbmFtZSBdKSBdO1xuICAgICAgICAgICAgLy8gc3VwZXIuc2V0KCdzdWJqZWN0cycsIFsuLi5uZXcgU2V0KFsuLi5zdXBlci5nZXQoJ3N1YmplY3RzJyksIG5hbWVdKV0pO1xuICAgICAgICAgICAgLy8gc3VwZXIuc3ViamVjdHMgPSBbIC4uLnN1cGVyLmdldCgnc3ViamVjdHMnKSwgbmFtZSBdO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWRcbiAgICAgKiBUcnV0aCBmaWxlIG5hbWUsIG5vIGV4dGVuc2lvbiovXG4gICAgZ2V0IHRydXRoX2ZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCAndHJ1dGhfZmlsZScpO1xuICAgICAgICAvLyByZXR1cm4gdGhpcy5nZXQoJ3RydXRoX2ZpbGUnKVxuICAgIH1cbiAgICBcbiAgICAvKipBbHNvIHNldHMgdGhpcy50cnV0aCAobWVtb3J5KVxuICAgICAqIEBjYWNoZWRcbiAgICAgKiBAcGFyYW0gdHJ1dGhfZmlsZSAtIFRydXRoIGZpbGUgbmFtZSwgbm8gZXh0ZW5zaW9uKi9cbiAgICBzZXQgdHJ1dGhfZmlsZSh0cnV0aF9maWxlOiBzdHJpbmcpIHtcbiAgICAgICAgLy8gdHJ1dGhfZmlsZSA9IHBhdGguYmFzZW5hbWUodHJ1dGhfZmlsZSk7XG4gICAgICAgIGxldCBbIG5hbWUsIGV4dCBdID0gbXlmcy5zcGxpdF9leHQodHJ1dGhfZmlsZSk7XG4gICAgICAgIGlmICggYm9vbChleHQpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgdHJ1dGhfZmlsZSwgcGFzc2VkIG5hbWUgaXMgbm90IGV4dGVuc2lvbmxlc3M6ICR7dHJ1dGhfZmlsZX0uIENvbnRpbnVpbmcgd2l0aCBcIiR7bmFtZX1cImApO1xuICAgICAgICAgICAgLy8gbmFtZU5vRXh0ID0gbXlmcy5yZW1vdmVfZXh0KG5hbWVOb0V4dCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgdHJ1dGggPSBuZXcgVHJ1dGgobmFtZSk7XG4gICAgICAgICAgICBpZiAoICF0cnV0aC50eHQuYWxsRXhpc3QoKSApIHtcbiAgICAgICAgICAgICAgICBBbGVydC5zbWFsbC53YXJuaW5nKGBOb3QgYWxsIHR4dCBmaWxlcyBleGlzdDogJHtuYW1lfWApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRydXRoID0gdHJ1dGg7XG4gICAgICAgIH0gY2F0Y2ggKCBlICkge1xuICAgICAgICAgICAgQWxlcnQuc21hbGwud2FybmluZyhlKTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihlKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KGB0cnV0aF9maWxlYCwgbmFtZSk7XG4gICAgICAgIHRoaXMuY2FjaGUudHJ1dGhfZmlsZSA9IG5hbWU7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IGxldmVscygpOiBJTGV2ZWxbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnbGV2ZWxzJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBsZXZlbHMobGV2ZWxzOiBJTGV2ZWxbXSkge1xuICAgICAgICBpZiAoICFBcnJheS5pc0FycmF5KGxldmVscykgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCBsZXZlbHMsIHJlY2VpdmVkIFwibGV2ZWxzXCIgbm90IGlzQXJyYXkuIG5vdCBzZXR0aW5nIGFueXRoaW5nLiBsZXZlbHM6IGAsIGxldmVscyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBiZXR0ZXIgY2hlY2tzXG4gICAgICAgICAgICB0aGlzLnNldCgnbGV2ZWxzJywgbGV2ZWxzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBcbiAgICBjdXJyZW50VHJpYWxDb29yZHMoKTogbnVtYmVyW10ge1xuICAgICAgICAvLyBsZXQgeyBsZXZlbHMsIGZpbmlzaGVkX3RyaWFsc19jb3VudCB9ID0gdGhpcy5jb25maWcoKTtcbiAgICAgICAgbGV0IGZsYXRUcmlhbHNMaXN0ID0gdGhpcy5sZXZlbHMubWFwKGxldmVsID0+IGxldmVsLnRyaWFscyk7XG4gICAgICAgIGZvciAoIGxldCBbIGxldmVsSW5kZXgsIHRyaWFsc051bSBdIG9mIGVudW1lcmF0ZShmbGF0VHJpYWxzTGlzdCkgKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCB0cmlhbFN1bVNvRmFyID0gc3VtKGZsYXRUcmlhbHNMaXN0LnNsaWNlKDAsIGxldmVsSW5kZXggKyAxKSk7XG4gICAgICAgICAgICBjb25zdCBmaW5pc2hlZFRyaWFsc0NvdW50ID0gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgICAgICAgICBpZiAoIHRyaWFsU3VtU29GYXIgPiBmaW5pc2hlZFRyaWFsc0NvdW50IClcbiAgICAgICAgICAgICAgICByZXR1cm4gWyBsZXZlbEluZGV4LCB0cmlhbHNOdW0gLSAodHJpYWxTdW1Tb0ZhciAtIGZpbmlzaGVkVHJpYWxzQ291bnQpIF07XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS53YXJuKFwiY3VycmVudFRyaWFsQ29vcmRzOiBvdXQgb2YgaW5kZXggZXJyb3JcIik7XG4gICAgfVxuICAgIFxuICAgIGlzRGVtb1ZpZGVvKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5kZW1vX3R5cGUgPT09ICd2aWRlbyc7XG4gICAgfVxuICAgIFxuICAgIGlzV2hvbGVUZXN0T3ZlcigpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHN1bSh0aGlzLmxldmVscy5tYXAobGV2ZWwgPT4gbGV2ZWwudHJpYWxzKSkgPT0gdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgfVxuICAgIFxuICAgIGdldFN1YmplY3REaXJOYW1lcygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiBmcy5yZWFkZGlyU3luYyhTVUJKRUNUU19QQVRIX0FCUyk7XG4gICAgfVxuICAgIFxuICAgIGdldEN1cnJlbnRMZXZlbCgpOiBMZXZlbCB7XG4gICAgICAgIFxuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIHJldHVybiBuZXcgTGV2ZWwodGhpcy5sZXZlbHNbbGV2ZWxfaW5kZXhdLCBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXgpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBnZXRMZXZlbENvbGxlY3Rpb24oKTogTGV2ZWxDb2xsZWN0aW9uIHtcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICByZXR1cm4gbmV3IExldmVsQ29sbGVjdGlvbih0aGlzLmxldmVscywgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWRcbiAgICAgKiBHZXRzIHRoZSBjdXJyZW50IHRyaWFsJ3MgcGF0aCAoam9pbiB0aGlzLnRlc3RPdXRQYXRoKCkgYW5kIGxldmVsXyR7bGV2ZWxfaW5kZXh9Li4uKSwgYW5kIHJldHVybnMgYSBUcnV0aCBvZiBpdCovXG4gICAgY3JlYXRlVHJ1dGhGcm9tVHJpYWxSZXN1bHQoKTogVHJ1dGgge1xuICAgICAgICBjb25zb2xlLndhcm4oYFRoaXMgc2hvdWxkIGJlIHNvbWV3aGVyZSBlbHNlYCk7XG4gICAgICAgIGxldCBbIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCBdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgLy8gcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odGhpcy50ZXN0T3V0UGF0aCgpLCBgbGV2ZWxfJHtsZXZlbF9pbmRleH1fdHJpYWxfJHt0cmlhbF9pbmRleH1gKSk7XG4gICAgICAgIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRoaXMuZXhwZXJpbWVudE91dERpckFicygpLCBgbGV2ZWxfJHtsZXZlbF9pbmRleH1fdHJpYWxfJHt0cmlhbF9pbmRleH1gKSk7XG4gICAgfVxuICAgIFxuICAgIC8qKlwiYzpcXFN5bmNcXENvZGVcXFB5dGhvblxcUHlhbm8tcmVsZWFzZVxcc3JjXFxleHBlcmltZW50c1xcc3ViamVjdHNcXGdpbGFkXFxmdXJfZWxpc2VcIiovXG4gICAgZXhwZXJpbWVudE91dERpckFicygpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBjdXJyU3ViamVjdERpciA9IHBhdGguam9pbihTVUJKRUNUU19QQVRIX0FCUywgdGhpcy5zdWJqZWN0KTsgLy8gXCIuLi4vc3ViamVjdHMvZ2lsYWRcIlxuICAgICAgICByZXR1cm4gcGF0aC5qb2luKGN1cnJTdWJqZWN0RGlyLCB0aGlzLnRydXRoLm5hbWUpO1xuICAgIH1cbiAgICBcbiAgICBcbn1cbiJdfQ==