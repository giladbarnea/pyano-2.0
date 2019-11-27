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
                this.test.doTruthFileCheck()
                    .then(swal => {
                    this.exam.doTruthFileCheck();
                });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFDM0Isa0NBQWdFO0FBQ2hFLG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsNkJBQTZCO0FBRTdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQWlEdEMsU0FBUyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUk7SUFDakMsSUFBSyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRztRQUNwQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzdCLE9BQU8sT0FBTyxDQUFDO0tBQ2xCO1NBQU07UUFDSCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDN0I7QUFDTCxDQUFDO0FBR0QsU0FBZ0Isa0JBQWtCLENBQUMsRUFBRSxTQUFTLEtBQTRDLEVBQUUsU0FBUyxFQUFHLFNBQVMsRUFBRTtJQUMvRyxJQUFLLFNBQVMsRUFBRztRQUNiLElBQUssU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRztZQUU3QixTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsQztRQUNELElBQUssQ0FBQyxDQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFHO1lBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLFNBQVMsNEVBQTRFLENBQUMsQ0FBQztZQUN2SCxTQUFTLEdBQUcsU0FBUyxDQUFDO1NBQ3pC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VyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUlELFVBQVU7UUFDTixJQUFJLENBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTdELE9BQU8sSUFBSSxhQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsU0FBUyxXQUFXLFVBQVUsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFHRCxXQUFXO1FBQ1AsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RELENBQUM7Q0FHSjtBQTdYRCw4QkE2WEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBTdG9yZSBmcm9tIFwiZWxlY3Ryb24tc3RvcmVcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IEFsZXJ0IGZyb20gXCIuLi9NeUFsZXJ0XCI7XG5pbXBvcnQgbXlmcyBmcm9tIFwiLi4vTXlGc1wiO1xuaW1wb3J0IHsgYm9vbCwgcmVsb2FkUGFnZSwgc3VtLCBlbnVtZXJhdGUsIGFsbCB9IGZyb20gXCIuLi91dGlsXCI7XG5pbXBvcnQgeyBUcnV0aCB9IGZyb20gXCIuLi9UcnV0aFwiO1xuaW1wb3J0IHsgSUxldmVsLCBMZXZlbCwgTGV2ZWxDb2xsZWN0aW9uIH0gZnJvbSBcIi4uL0xldmVsXCI7XG5pbXBvcnQgeyBTd2VldEFsZXJ0UmVzdWx0IH0gZnJvbSBcInN3ZWV0YWxlcnQyXCI7XG5pbXBvcnQgKiBhcyBDb25mIGZyb20gJ2NvbmYnO1xuXG5jb25zb2xlLmxvZygnc3JjL0JpZ0NvbmZpZy9pbmRleC50cycpO1xuXG5leHBvcnQgdHlwZSBFeHBlcmltZW50VHlwZSA9ICdleGFtJyB8ICd0ZXN0JztcbmV4cG9ydCB0eXBlIERlbW9UeXBlID0gJ3ZpZGVvJyB8ICdhbmltYXRpb24nO1xuZXhwb3J0IHR5cGUgUGFnZU5hbWUgPSBcIm5ld1wiIC8vIEFLQSBUTGFzdFBhZ2VcbiAgICB8IFwicnVubmluZ1wiXG4gICAgfCBcInJlY29yZFwiXG4gICAgfCBcImZpbGVfdG9vbHNcIlxuICAgIHwgXCJzZXR0aW5nc1wiXG50eXBlIERldmlhdGlvblR5cGUgPSAncmh5dGhtJyB8ICd0ZW1wbyc7XG5cblxuaW50ZXJmYWNlIElTdWJjb25maWcge1xuICAgIGFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbjogc3RyaW5nLFxuICAgIGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uOiBzdHJpbmcsXG4gICAgZGVtb190eXBlOiBEZW1vVHlwZSxcbiAgICBlcnJvcnNfcGxheXJhdGU6IG51bWJlcixcbiAgICBmaW5pc2hlZF90cmlhbHNfY291bnQ6IG51bWJlcixcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgc3ViamVjdDogc3RyaW5nLFxuICAgIHRydXRoX2ZpbGU6IHN0cmluZyxcbiAgICBsZXZlbHM6IElMZXZlbFtdLFxufVxuXG5cbmludGVyZmFjZSBEZXZPcHRpb25zIHtcbiAgICBtYXhfYW5pbWF0aW9uX25vdGVzOiBudWxsIHwgbnVtYmVyLFxuICAgIG11dGVfYW5pbWF0aW9uOiBib29sZWFuLFxuICAgIHNraXBfbWlkaV9leGlzdHNfY2hlY2s6IGJvb2xlYW4sXG4gICAgc2tpcF93aG9sZV90cnV0aDogYm9vbGVhbixcbiAgICBza2lwX2xldmVsX2ludHJvOiBib29sZWFuLFxuICAgIHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrOiBib29sZWFuLFxuICAgIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrOiBib29sZWFuLFxuICAgIHJlbG9hZF9wYWdlX29uX3N1Ym1pdDogYm9vbGVhblxufVxuXG5pbnRlcmZhY2UgSUJpZ0NvbmZpZyB7XG4gICAgZGV2OiBib29sZWFuLFxuICAgIGRldm9wdGlvbnM6IERldk9wdGlvbnMsXG4gICAgZXhhbV9maWxlOiBzdHJpbmcsXG4gICAgdGVzdF9maWxlOiBzdHJpbmcsXG4gICAgZXhwZXJpbWVudF90eXBlOiBFeHBlcmltZW50VHlwZSxcbiAgICBsYXN0X3BhZ2U6IFBhZ2VOYW1lLFxuICAgIHN1YmplY3RzOiBzdHJpbmdbXSxcbiAgICB2ZWxvY2l0aWVzOiBudW1iZXIsXG59XG5cbmZ1bmN0aW9uIHRyeUdldEZyb21DYWNoZTxUIGV4dGVuZHMga2V5b2YgSUJpZ0NvbmZpZz4oY29uZmlnOiBCaWdDb25maWdDbHMsIHByb3A6IFQpOiBJQmlnQ29uZmlnW1RdXG5mdW5jdGlvbiB0cnlHZXRGcm9tQ2FjaGU8VCBleHRlbmRzIGtleW9mIElTdWJjb25maWc+KGNvbmZpZzogU3ViY29uZmlnLCBwcm9wOiBUKTogSVN1YmNvbmZpZ1tUXVxuZnVuY3Rpb24gdHJ5R2V0RnJvbUNhY2hlKGNvbmZpZywgcHJvcCkge1xuICAgIGlmICggY29uZmlnLmNhY2hlW3Byb3BdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIGNvbnN0IHByb3BWYWwgPSBjb25maWcuZ2V0KHByb3ApO1xuICAgICAgICBjb25maWcuY2FjaGVbcHJvcF0gPSBwcm9wVmFsO1xuICAgICAgICByZXR1cm4gcHJvcFZhbDtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY29uZmlnLmNhY2hlW3Byb3BdO1xuICAgIH1cbn1cblxuLyoqTGlzdCBvZiB0cnV0aCBmaWxlIG5hbWVzLCBubyBleHRlbnNpb24qL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRydXRoRmlsZXNXaGVyZSh7IGV4dGVuc2lvbiB9OiB7IGV4dGVuc2lvbj86ICd0eHQnIHwgJ21pZCcgfCAnbXA0JyB9ID0geyBleHRlbnNpb24gOiB1bmRlZmluZWQgfSk6IHN0cmluZ1tdIHtcbiAgICBpZiAoIGV4dGVuc2lvbiApIHtcbiAgICAgICAgaWYgKCBleHRlbnNpb24uc3RhcnRzV2l0aCgnLicpICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgZXh0ZW5zaW9uID0gZXh0ZW5zaW9uLnNsaWNlKDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmICggIVsgJ3R4dCcsICdtaWQnLCAnbXA0JyBdLmluY2x1ZGVzKGV4dGVuc2lvbikgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHRydXRoRmlsZXNMaXN0KFwiJHtleHRlbnNpb259XCIpLCBtdXN0IGJlIGVpdGhlciBbJ3R4dCcsJ21pZCcsJ21wNCddIG9yIG5vdCBhdCBhbGwuIHNldHRpbmcgdG8gdW5kZWZpbmVkYCk7XG4gICAgICAgICAgICBleHRlbnNpb24gPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gY29uc3QgdHJ1dGhzRGlyUGF0aCA9IHRoaXMudHJ1dGhzRGlyUGF0aCgpO1xuICAgIFxuICAgIGxldCB0cnV0aEZpbGVzID0gWyAuLi5uZXcgU2V0KGZzLnJlYWRkaXJTeW5jKFRSVVRIU19QQVRIX0FCUykpIF07XG4gICAgbGV0IGZvcm1hdHRlZFRydXRoRmlsZXMgPSBbXTtcbiAgICBmb3IgKCBsZXQgZmlsZSBvZiB0cnV0aEZpbGVzICkge1xuICAgICAgICBsZXQgWyBuYW1lLCBleHQgXSA9IG15ZnMuc3BsaXRfZXh0KGZpbGUpO1xuICAgICAgICBpZiAoIGV4dGVuc2lvbiApIHtcbiAgICAgICAgICAgIGlmICggZXh0Lmxvd2VyKCkgPT09IGAuJHtleHRlbnNpb259YCApIHtcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRUcnV0aEZpbGVzLnB1c2gobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3JtYXR0ZWRUcnV0aEZpbGVzLnB1c2gobmFtZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZm9ybWF0dGVkVHJ1dGhGaWxlc1xuICAgIFxufVxuXG4vKipMaXN0IG9mIG5hbWVzIG9mIHR4dCB0cnV0aCBmaWxlcyB0aGF0IGhhdmUgdGhlaXIgd2hvbGUgXCJ0cmlwbGV0XCIgaW4gdGFjdC4gbm8gZXh0ZW5zaW9uKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcnV0aHNXaXRoM1R4dEZpbGVzKCk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCB0eHRGaWxlc0xpc3QgPSBnZXRUcnV0aEZpbGVzV2hlcmUoeyBleHRlbnNpb24gOiAndHh0JyB9KTtcbiAgICBjb25zdCB3aG9sZVR4dEZpbGVzID0gW107XG4gICAgZm9yICggbGV0IG5hbWUgb2YgdHh0RmlsZXNMaXN0ICkge1xuICAgICAgICBpZiAoIHR4dEZpbGVzTGlzdC5jb3VudCh0eHQgPT4gdHh0LnN0YXJ0c1dpdGgobmFtZSkpID49IDMgKSB7XG4gICAgICAgICAgICB3aG9sZVR4dEZpbGVzLnB1c2gobmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHR4dEZpbGVzTGlzdC5maWx0ZXIoYSA9PiB0eHRGaWxlc0xpc3QuZmlsdGVyKHR4dCA9PiB0eHQuc3RhcnRzV2l0aChhKSkubGVuZ3RoID49IDMpO1xufVxuXG5leHBvcnQgY2xhc3MgQmlnQ29uZmlnQ2xzIGV4dGVuZHMgU3RvcmU8SUJpZ0NvbmZpZz4ge1xuICAgIHRlc3Q6IFN1YmNvbmZpZztcbiAgICBleGFtOiBTdWJjb25maWc7XG4gICAgcmVhZG9ubHkgY2FjaGU6IFBhcnRpYWw8SUJpZ0NvbmZpZz47XG4gICAgXG4gICAgY29uc3RydWN0b3IoX2RvVHJ1dGhGaWxlQ2hlY2sgPSB0cnVlKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuY2FjaGUgPSB7fTtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICB0aGlzLnNldCA9ICguLi5hcmdzKSA9PiBjb25zb2xlLndhcm4oYERSWVJVTiwgc2V0OiBgLCBhcmdzKVxuICAgICAgICB9XG4gICAgICAgIGxldCB0ZXN0TmFtZVdpdGhFeHQgPSB0aGlzLnRlc3RfZmlsZTtcbiAgICAgICAgbGV0IGV4YW1OYW1lV2l0aEV4dCA9IHRoaXMuZXhhbV9maWxlO1xuICAgICAgICBpZiAoICFhbGwodGVzdE5hbWVXaXRoRXh0LCBleGFtTmFtZVdpdGhFeHQpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBCaWdDb25maWdDbHMgY3RvciwgY291bGRudCBnZXQgdGVzdF9maWxlIGFuZC9vciBleGFtX2ZpbGUgZnJvbSBqc29uOmAsIHtcbiAgICAgICAgICAgICAgICB0ZXN0TmFtZVdpdGhFeHQsXG4gICAgICAgICAgICAgICAgZXhhbU5hbWVXaXRoRXh0XG4gICAgICAgICAgICB9LCAnLCBkZWZhdWx0aW5nIHRvIFwiZnVyX2VsaXNlX0IuW2V4dF1cIicpO1xuICAgICAgICAgICAgdGVzdE5hbWVXaXRoRXh0ID0gJ2Z1cl9lbGlzZV9CLnRlc3QnO1xuICAgICAgICAgICAgZXhhbU5hbWVXaXRoRXh0ID0gJ2Z1cl9lbGlzZV9CLmV4YW0nO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3ViY29uZmlnKHRlc3ROYW1lV2l0aEV4dCk7XG4gICAgICAgIHRoaXMuc2V0U3ViY29uZmlnKGV4YW1OYW1lV2l0aEV4dCk7XG4gICAgICAgIC8vIHRoaXMudGVzdCA9IG5ldyBTdWJjb25maWcodGVzdE5hbWVXaXRoRXh0KTtcbiAgICAgICAgLy8gdGhpcy5leGFtID0gbmV3IFN1YmNvbmZpZyhleGFtTmFtZVdpdGhFeHQpO1xuICAgICAgICB0aGlzLnN1YmplY3RzID0gdGhpcy5zdWJqZWN0czsgLy8gdG8gZW5zdXJlIGhhdmluZyBzdWJjb25maWcncyBzdWJqZWN0c1xuICAgICAgICBpZiAoIF9kb1RydXRoRmlsZUNoZWNrICkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLnRlc3QuZG9UcnV0aEZpbGVDaGVjaygpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHN3YWwgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXhhbS5kb1RydXRoRmlsZUNoZWNrKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKCBlICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEJpZ0NvbmZpZ0NscyBjdG9yLCBlcnJvciB3aGVuIF9kb1RydXRoRmlsZUNoZWNrOmAsIGUpO1xuICAgICAgICAgICAgICAgIEFsZXJ0LmJpZy5vbmVCdXR0b24oYEFuIGVycm9yIG9jY3VyZWQgd2hlbiBydW5uaW5nIGEgdHJ1dGggZmlsZXMgY2hlY2suIFlvdSBzaG91bGQgdHJ5IHRvIHVuZGVyc3RhbmQgdGhlIHByb2JsZW0gYmVmb3JlIGNvbnRpbnVpbmdgLCB7IHRleHQgOiBlLm1lc3NhZ2UgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnOiBJU3ViY29uZmlnLCBleHBlcmltZW50VHlwZTogRXhwZXJpbWVudFR5cGUpIHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignQmlnQ29uZmlnQ2xzIHVzZWQgZnJvbVNhdmVkQ29uZmlnLiBJbXBvc3NpYmxlIHRvIGxvYWQgYmlnIGZpbGUuIFJldHVybmluZycpO1xuICAgICAgICAvKmlmICggRFJZUlVOICkgcmV0dXJuIGNvbnNvbGUubG9nKGBmcm9tU2F2ZWRDb25maWcsIERSWVJVTmApO1xuICAgICAgICAgY29uc3QgdHJ1dGhGaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoc2F2ZWRDb25maWcudHJ1dGhfZmlsZV9wYXRoLCAnLnR4dCcpO1xuICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgdGhpcy50cnV0aF9maWxlX3BhdGggPSBuZXcgVHJ1dGgocGF0aC5qb2luKFRSVVRIU19QQVRIX0FCUywgdHJ1dGhGaWxlTmFtZSkpO1xuICAgICAgICAgdGhpcy5leHBlcmltZW50X3R5cGUgPSBleHBlcmltZW50VHlwZTtcbiAgICAgICAgIHRoaXMuY29uZmlnKGV4cGVyaW1lbnRUeXBlKS5mcm9tU2F2ZWRDb25maWcoc2F2ZWRDb25maWcpOyovXG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkBleGFtcGxlXG4gICAgIHVwZGF0ZSgnc3ViamVjdHMnLCBbbmFtZXNdKVxuICAgICAqL1xuICAgIHVwZGF0ZShLOiBrZXlvZiBJQmlnQ29uZmlnLCBrdlBhaXJzOiBQYXJ0aWFsPElCaWdDb25maWc+KVxuICAgIHVwZGF0ZShLOiBrZXlvZiBJQmlnQ29uZmlnLCB2YWx1ZXM6IGFueVtdKVxuICAgIHVwZGF0ZShLLCBrdikge1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ0JpZ0NvbmZpZy51cGRhdGUoKSBEUllSVU4uIHJldHVybmluZycpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBWID0gdGhpcy5nZXQoSyk7XG4gICAgICAgIGlmICggQXJyYXkuaXNBcnJheShWKSApIHtcbiAgICAgICAgICAgIGxldCBuZXdWYWx1ZTogYW55W10gPSBWO1xuICAgICAgICAgICAgaWYgKCBBcnJheS5pc0FycmF5KGt2KSApIHtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZS5wdXNoKC4uLmt2KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWUucHVzaChrdik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldChLLCBuZXdWYWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKFYsIGt2KTtcbiAgICAgICAgICAgIHRoaXMuc2V0KEssIFYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmdldChLKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0IGxhc3RfcGFnZSgpOiBQYWdlTmFtZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnbGFzdF9wYWdlJyk7XG4gICAgfVxuICAgIFxuICAgIHNldCBsYXN0X3BhZ2UocGFnZTogUGFnZU5hbWUpIHtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHZhbGlkcGFnZXMgPSBbIFwibmV3XCIsIFwicnVubmluZ1wiLCBcInJlY29yZFwiLCBcImZpbGVfdG9vbHNcIiwgXCJzZXR0aW5nc1wiIF07XG4gICAgICAgIGlmICggIXZhbGlkcGFnZXMuaW5jbHVkZXMocGFnZSkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCBsYXN0X3BhZ2UoXCIke3BhZ2V9XCIpLCBtdXN0IGJlIG9uZSBvZiAke3ZhbGlkcGFnZXMuam9pbignLCAnKX0uIHNldHRpbmcgdG8gbmV3YCk7XG4gICAgICAgICAgICB0aGlzLnNldCgnbGFzdF9wYWdlJywgJ25ldycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xhc3RfcGFnZScsIHBhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWRcbiAgICAgKiBTaG91bGQgYmUgdXNlZCBpbnN0ZWFkIG9mIFN1YmNvbmZpZyBjb25zdHJ1Y3Rvci5cbiAgICAgKiBVcGRhdGVzIGBleGFtX2ZpbGVgIG9yIGB0ZXN0X2ZpbGVgLCBpbiBmaWxlIGFuZCBpbiBjYWNoZS4gQWxzbyBpbml0aWFsaXplcyBhbmQgY2FjaGVzIGEgbmV3IFN1YmNvbmZpZyAodGhpcy5leGFtID0gbmV3IFN1YmNvbmZpZyguLi4pKS4gKi9cbiAgICBzZXRTdWJjb25maWcobmFtZVdpdGhFeHQ6IHN0cmluZywgc3ViY29uZmlnPzogU3ViY29uZmlnKSB7XG4gICAgICAgIC8vIGNvbnN0IFsgZmlsZW5hbWUsIGV4dCBdID0gbXlmcy5zcGxpdF9leHQobmFtZVdpdGhFeHQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgU3ViY29uZmlnLnZhbGlkYXRlTmFtZShuYW1lV2l0aEV4dCk7XG4gICAgICAgIH0gY2F0Y2ggKCBlICkge1xuICAgICAgICAgICAgaWYgKCBlLm1lc3NhZ2UgPT09ICdFeHRlbnNpb25FcnJvcicgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2Fybihgc2V0IHNldFN1YmNvbmZpZyAoJHtuYW1lV2l0aEV4dH0pIGhhcyBubyBleHRlbnNpb24sIG9yIGV4dCBpcyBiYWQuIG5vdCBzZXR0aW5nYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIGUubWVzc2FnZSA9PT0gJ0Jhc2VuYW1lRXJyb3InICkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VuYW1lID0gcGF0aC5iYXNlbmFtZShuYW1lV2l0aEV4dCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXRTdWJjb25maWcoJHtuYW1lV2l0aEV4dH0pLCBwYXNzZWQgYSBwYXRoICh3aXRoIHNsYWhlcykuIG5lZWQgb25seSBhIGJhc2VuYW1lLmV4dC4gY29udGludWluZyB3aXRoIG9ubHkgYmFzZW5hbWU6ICR7YmFzZW5hbWV9YCk7XG4gICAgICAgICAgICAgICAgbmFtZVdpdGhFeHQgPSBiYXNlbmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUobmFtZVdpdGhFeHQpO1xuICAgICAgICAvLy8vIEV4dGVuc2lvbiBhbmQgZmlsZSBuYW1lIG9rXG4gICAgICAgIGNvbnN0IHN1YmNmZ1R5cGUgPSBleHQuc2xpY2UoMSkgYXMgRXhwZXJpbWVudFR5cGU7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgY29uc3Qgc3ViY29uZmlnS2V5ID0gYCR7c3ViY2ZnVHlwZX1fZmlsZWAgYXMgXCJleGFtX2ZpbGVcIiB8IFwidGVzdF9maWxlXCI7XG4gICAgICAgIC8vLy8gdGhpcy5zZXQoJ2V4YW1fZmlsZScsICdmdXJfZWxpc2VfQi5leGFtJylcbiAgICAgICAgdGhpcy5zZXQoc3ViY29uZmlnS2V5LCBuYW1lV2l0aEV4dCk7XG4gICAgICAgIHRoaXMuY2FjaGVbc3ViY29uZmlnS2V5XSA9IG5hbWVXaXRoRXh0O1xuICAgICAgICBjb25zb2xlLmxvZyhgc2V0U3ViY29uZmlnYCwge1xuICAgICAgICAgICAgbmFtZVdpdGhFeHQsXG4gICAgICAgICAgICBzdWJjb25maWcsXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8vLyB0aGlzLmV4YW0gPSBuZXcgU3ViY29uZmlnKCdmdXJfZWxpc2VfQi5leGFtJywgc3ViY29uZmlnKVxuICAgICAgICB0aGlzW3N1YmNmZ1R5cGVdID0gbmV3IFN1YmNvbmZpZyhuYW1lV2l0aEV4dCwgc3ViY29uZmlnKVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBnZXRTdWJjb25maWcoKTogU3ViY29uZmlnIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbdGhpcy5leHBlcmltZW50X3R5cGVdXG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWRcbiAgICAgKiBSZXR1cm5zIHRoZSBleGFtIGZpbGUgbmFtZSBpbmNsdWRpbmcgZXh0ZW5zaW9uKi9cbiAgICBnZXQgZXhhbV9maWxlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgJ2V4YW1fZmlsZScpO1xuICAgICAgICAvLyByZXR1cm4gdGhpcy5nZXQoJ2V4YW1fZmlsZScpO1xuICAgIH1cbiAgICBcbiAgICAvKipVcGRhdGVzIGV4YW1fZmlsZSBhbmQgYWxzbyBpbml0aWFsaXplcyBuZXcgU3ViY29uZmlnKi9cbiAgICBzZXQgZXhhbV9maWxlKG5hbWVXaXRoRXh0OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXRTdWJjb25maWcobmFtZVdpdGhFeHQpXG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWRcbiAgICAgKiBSZXR1cm5zIHRoZSB0ZXN0IGZpbGUgbmFtZSBpbmNsdWRpbmcgZXh0ZW5zaW9uKi9cbiAgICBnZXQgdGVzdF9maWxlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgJ3Rlc3RfZmlsZScpO1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkXG4gICAgICogVXBkYXRlcyB0ZXN0X2ZpbGUgYW5kIGFsc28gaW5pdGlhbGl6ZXMgbmV3IFN1YmNvbmZpZyovXG4gICAgc2V0IHRlc3RfZmlsZShuYW1lV2l0aEV4dDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3ViY29uZmlnKG5hbWVXaXRoRXh0KVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkXG4gICAgICogQ2FuIGJlIGdvdHRlbiBhbHNvIHdpdGggYHN1YmNvbmZpZy50eXBlYCovXG4gICAgZ2V0IGV4cGVyaW1lbnRfdHlwZSgpOiBFeHBlcmltZW50VHlwZSB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJleHBlcmltZW50X3R5cGVcIilcbiAgICAgICAgLyppZiAoIHRoaXMuY2FjaGUuZXhwZXJpbWVudF90eXBlID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICBjb25zdCBleHBlcmltZW50VHlwZSA9IHRoaXMuZ2V0KCdleHBlcmltZW50X3R5cGUnKTtcbiAgICAgICAgIHRoaXMuY2FjaGUuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgICByZXR1cm4gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuZXhwZXJpbWVudF90eXBlO1xuICAgICAgICAgfSovXG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIHNldCBleHBlcmltZW50X3R5cGUoZXhwZXJpbWVudFR5cGU6IEV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIGlmICggIVsgJ2V4YW0nLCAndGVzdCcgXS5pbmNsdWRlcyhleHBlcmltZW50VHlwZSkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEJpZ0NvbmZpZyBleHBlcmltZW50X3R5cGUgc2V0dGVyLCBnb3QgZXhwZXJpbWVudFR5cGU6ICcke2V4cGVyaW1lbnRUeXBlfScuIE11c3QgYmUgZWl0aGVyICd0ZXN0JyBvciAnZXhhbScuIHNldHRpbmcgdG8gdGVzdGApO1xuICAgICAgICAgICAgZXhwZXJpbWVudFR5cGUgPSAndGVzdCc7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoJ2V4cGVyaW1lbnRfdHlwZScsIGV4cGVyaW1lbnRUeXBlKTtcbiAgICAgICAgdGhpcy5jYWNoZS5leHBlcmltZW50X3R5cGUgPSBleHBlcmltZW50VHlwZTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBnZXQgc3ViamVjdHMoKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ3N1YmplY3RzJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKkVuc3VyZXMgaGF2aW5nIGB0aGlzLnRlc3Quc3ViamVjdGAgYW5kIGB0aGlzLmV4YW0uc3ViamVjdGAgaW4gdGhlIGxpc3QgcmVnYXJkbGVzcyovXG4gICAgc2V0IHN1YmplY3RzKHN1YmplY3RMaXN0OiBzdHJpbmdbXSkge1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ3NldCBzdWJqZWN0cywgRFJZUlVOLiByZXR1cm5pbmcnKVxuICAgICAgICB9XG4gICAgICAgIHN1YmplY3RMaXN0LnB1c2godGhpcy50ZXN0LnN1YmplY3QpO1xuICAgICAgICBzdWJqZWN0TGlzdC5wdXNoKHRoaXMuZXhhbS5zdWJqZWN0KTtcbiAgICAgICAgY29uc3Qgc3ViamVjdHMgPSBbIC4uLm5ldyBTZXQoc3ViamVjdExpc3QpIF07XG4gICAgICAgIHRoaXMuc2V0KCdzdWJqZWN0cycsIHN1YmplY3RzKTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBkZXYoKTogeyBbSyBpbiBrZXlvZiBEZXZPcHRpb25zXTogKCkgPT4gRGV2T3B0aW9uc1tLXSB9IHtcbiAgICAgICAgY29uc3QgX2RldiA9IHRoaXMuZ2V0KCdkZXYnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1heF9hbmltYXRpb25fbm90ZXMgOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCBfZGV2ICkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXhfYW5pbWF0aW9uX25vdGVzID0gdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5tYXhfYW5pbWF0aW9uX25vdGVzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIG1heF9hbmltYXRpb25fbm90ZXMgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMubWF4X2FuaW1hdGlvbl9ub3RlczogJHttYXhfYW5pbWF0aW9uX25vdGVzfWApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWF4X2FuaW1hdGlvbl9ub3RlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbXV0ZV9hbmltYXRpb24gOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXV0ZV9hbmltYXRpb24gPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykubXV0ZV9hbmltYXRpb247XG4gICAgICAgICAgICAgICAgaWYgKCBtdXRlX2FuaW1hdGlvbiApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5tdXRlX2FuaW1hdGlvbmApO1xuICAgICAgICAgICAgICAgIHJldHVybiBtdXRlX2FuaW1hdGlvbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBza2lwX21pZGlfZXhpc3RzX2NoZWNrIDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfbWlkaV9leGlzdHNfY2hlY2sgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9taWRpX2V4aXN0c19jaGVjaztcbiAgICAgICAgICAgICAgICBpZiAoIHNraXBfbWlkaV9leGlzdHNfY2hlY2sgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF9taWRpX2V4aXN0c19jaGVja2ApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX21pZGlfZXhpc3RzX2NoZWNrO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNraXBfd2hvbGVfdHJ1dGggOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpcF93aG9sZV90cnV0aCA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX3dob2xlX3RydXRoO1xuICAgICAgICAgICAgICAgIGlmICggc2tpcF93aG9sZV90cnV0aCApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5za2lwX3dob2xlX3RydXRoYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfd2hvbGVfdHJ1dGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2tpcF9sZXZlbF9pbnRybyA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwX2xldmVsX2ludHJvID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfbGV2ZWxfaW50cm87XG4gICAgICAgICAgICAgICAgaWYgKCBza2lwX2xldmVsX2ludHJvICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNraXBfbGV2ZWxfaW50cm9gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2tpcF9sZXZlbF9pbnRybztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjayA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjayA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjaztcbiAgICAgICAgICAgICAgICBpZiAoIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrIDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrO1xuICAgICAgICAgICAgICAgIGlmICggc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2sgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2tgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2s7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVsb2FkX3BhZ2Vfb25fc3VibWl0IDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlbG9hZF9wYWdlX29uX3N1Ym1pdCA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5yZWxvYWRfcGFnZV9vbl9zdWJtaXQ7XG4gICAgICAgICAgICAgICAgaWYgKCByZWxvYWRfcGFnZV9vbl9zdWJtaXQgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMucmVsb2FkX3BhZ2Vfb25fc3VibWl0YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlbG9hZF9wYWdlX29uX3N1Ym1pdDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCB2ZWxvY2l0aWVzKCkge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwidmVsb2NpdGllc1wiKVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgdmVsb2NpdGllcyh2YWw6IG51bWJlcikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZmxvb3JlZCA9IE1hdGguZmxvb3IodmFsKTtcbiAgICAgICAgICAgIGlmICggaXNOYU4oZmxvb3JlZCkgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgdmVsb2NpdGllcywgTWF0aC5mbG9vcih2YWwpIGlzIE5hTjpgLCB7IHZhbCwgZmxvb3JlZCB9LCAnLiBub3Qgc2V0dGluZycpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIGZsb29yZWQgPj0gMSAmJiBmbG9vcmVkIDw9IDE2ICkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldCgndmVsb2NpdGllcycsIGZsb29yZWQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhY2hlLnZlbG9jaXRpZXMgPSBmbG9vcmVkO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCB2ZWxvY2l0aWVzLCBiYWQgcmFuZ2U6ICR7dmFsfS4gbm90IHNldHRpbmdgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKCBlICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgdmVsb2NpdGllcywgRXhjZXB0aW9uIHdoZW4gdHJ5aW5nIHRvIE1hdGguZmxvb3IodmFsKTpgLCBlKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBTdWJjb25maWcgZXh0ZW5kcyBDb25mPElTdWJjb25maWc+IHsgLy8gQUtBIENvbmZpZ1xuICAgIHByaXZhdGUgcmVhZG9ubHkgdHlwZTogRXhwZXJpbWVudFR5cGU7XG4gICAgcmVhZG9ubHkgY2FjaGU6IFBhcnRpYWw8SVN1YmNvbmZpZz47XG4gICAgdHJ1dGg6IFRydXRoO1xuICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBuYW1lV2l0aEV4dCAtIHNldHMgdGhlIGBuYW1lYCBmaWVsZCBpbiBmaWxlXG4gICAgICovXG4gICAgY29uc3RydWN0b3IobmFtZVdpdGhFeHQ6IHN0cmluZywgc3ViY29uZmlnPzogU3ViY29uZmlnKSB7XG4gICAgICAgIFxuICAgICAgICBsZXQgWyBmaWxlbmFtZSwgZXh0IF0gPSBteWZzLnNwbGl0X2V4dChuYW1lV2l0aEV4dCk7XG4gICAgICAgIGlmICggIVsgJy5leGFtJywgJy50ZXN0JyBdLmluY2x1ZGVzKGV4dCkgKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFN1YmNvbmZpZyBjdG9yICgke25hbWVXaXRoRXh0fSkgaGFzIGJhZCBvciBubyBleHRlbnNpb25gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0eXBlID0gZXh0LnNsaWNlKDEpIGFzIEV4cGVyaW1lbnRUeXBlO1xuICAgICAgICBsZXQgZGVmYXVsdHM7XG4gICAgICAgIGlmICggYm9vbChzdWJjb25maWcpICkge1xuICAgICAgICAgICAgaWYgKCBzdWJjb25maWcuc3RvcmUgKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdHMgPSB7IC4uLnN1YmNvbmZpZy5zdG9yZSwgbmFtZSA6IG5hbWVXaXRoRXh0IH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRzID0gc3ViY29uZmlnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVmYXVsdHMgPSB7IG5hbWUgOiBuYW1lV2l0aEV4dCB9O1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIGZpbGVFeHRlbnNpb24gOiB0eXBlLFxuICAgICAgICAgICAgY3dkIDogQ09ORklHU19QQVRIX0FCUyxcbiAgICAgICAgICAgIGNvbmZpZ05hbWUgOiBmaWxlbmFtZSxcbiAgICAgICAgICAgIGRlZmF1bHRzXG4gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNhY2hlID0geyBuYW1lIDogbmFtZVdpdGhFeHQgfTtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgaWYgKCBzdWJjb25maWcgKSB7XG4gICAgICAgICAgICB0aGlzLnNldCh7IC4uLnN1YmNvbmZpZy5zdG9yZSwgbmFtZSA6IG5hbWVXaXRoRXh0IH0pO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnRydXRoID0gbmV3IFRydXRoKG15ZnMucmVtb3ZlX2V4dCh0aGlzLnRydXRoX2ZpbGUpKTtcbiAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBTdWJjb25maWcgY29uc3RydWN0b3IsIGluaXRpYWxpemluZyBuZXcgVHJ1dGggZnJvbSB0aGlzLnRydXRoX2ZpbGUgdGhyZXcgYW4gZXJyb3IuIFByb2JhYmx5IGJlY2F1c2UgdGhpcy50cnV0aF9maWxlIGlzIHVuZGVmaW5lZC4gU2hvdWxkIG1heWJlIG5lc3QgdW5kZXIgaWYoc3ViY29uZmlnKSBjbGF1c2VgLCBcInRoaXMudHJ1dGhfZmlsZVwiLCB0aGlzLnRydXRoX2ZpbGUsIGUpXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgc3RhdGljIHZhbGlkYXRlTmFtZShuYW1lV2l0aEV4dDogc3RyaW5nKSB7XG4gICAgICAgIGxldCBbIGZpbGVuYW1lLCBleHQgXSA9IG15ZnMuc3BsaXRfZXh0KG5hbWVXaXRoRXh0KTtcbiAgICAgICAgaWYgKCAhWyAnLmV4YW0nLCAnLnRlc3QnIF0uaW5jbHVkZXMoZXh0KSApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXh0ZW5zaW9uRXJyb3JgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIG5hbWVXaXRoRXh0ICE9PSBgJHtmaWxlbmFtZX0ke2V4dH1gICkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCYXNlbmFtZUVycm9yJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgYXN5bmMgZG9UcnV0aEZpbGVDaGVjaygpOiBQcm9taXNlPFN3ZWV0QWxlcnRSZXN1bHQ+IHtcbiAgICAgICAgY29uc29sZS5sb2coYPCfkr4gU3ViY29uZmlnKCR7dGhpcy50eXBlfSkuZG9UcnV0aEZpbGVDaGVjaygpYCk7XG4gICAgICAgIFxuICAgICAgICAvLyBjb25zdCB0cnV0aCA9IHRoaXMuZ2V0VHJ1dGgoKTtcbiAgICAgICAgaWYgKCB0aGlzLnRydXRoLnR4dC5hbGxFeGlzdCgpICkge1xuICAgICAgICAgICAgcmV0dXJuIEFsZXJ0LnNtYWxsLnN1Y2Nlc3MoYCR7dGhpcy50cnV0aC5uYW1lfS50eHQsICpfb24udHh0LCBhbmQgKl9vZmYudHh0IGZpbGVzIGV4aXN0LmApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFsnZnVyX2VsaXNlX0InIHggMywgJ2Z1cl9lbGlzZV9SLnR4dCcgeCAzLCAuLi5dXG4gICAgICAgIGNvbnN0IHRydXRoc1dpdGgzVHh0RmlsZXMgPSBnZXRUcnV0aHNXaXRoM1R4dEZpbGVzKCk7XG4gICAgICAgIGlmICggIWJvb2wodHJ1dGhzV2l0aDNUeHRGaWxlcykgKVxuICAgICAgICAgICAgcmV0dXJuIEFsZXJ0LmJpZy53YXJuaW5nKHtcbiAgICAgICAgICAgICAgICB0aXRsZSA6ICdObyB2YWxpZCB0cnV0aCBmaWxlcyBmb3VuZCcsXG4gICAgICAgICAgICAgICAgaHRtbCA6ICdUaGVyZSBuZWVkcyB0byBiZSBhdCBsZWFzdCBvbmUgdHh0IGZpbGUgd2l0aCBvbmUgXCJvblwiIGFuZCBvbmUgXCJvZmZcIiBjb3VudGVycGFydHMuJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEFsZXJ0LmJpZy5ibG9ja2luZyh7XG4gICAgICAgICAgICB0aXRsZSA6IGBEaWRuJ3QgZmluZCBhbGwgdGhyZWUgLnR4dCBmaWxlcyBmb3IgJHt0aGlzLnRydXRoLm5hbWV9YCxcbiAgICAgICAgICAgIGh0bWwgOiAnVGhlIGZvbGxvd2luZyB0cnV0aHMgYWxsIGhhdmUgMyB0eHQgZmlsZXMuIFBsZWFzZSBjaG9vc2Ugb25lIG9mIHRoZW0sIG9yIGZpeCB0aGUgZmlsZXMgYW5kIHJlbG9hZC4nLFxuICAgICAgICAgICAgc2hvd0Nsb3NlQnV0dG9uIDogdHJ1ZSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgc3RyaW5ncyA6IHRydXRoc1dpdGgzVHh0RmlsZXMsXG4gICAgICAgICAgICBjbGlja0ZuIDogZWwgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IGNvbmZpZyA9IHRoaXMuY29uZmlnKHRoaXMuZXhwZXJpbWVudF90eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxldmVscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRydXRoX2ZpbGUgPSBlbC50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKGVsLnRleHQoKSk7XG4gICAgICAgICAgICAgICAgICAgIHJlbG9hZFBhZ2UoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoICggZXJyICkge1xuICAgICAgICAgICAgICAgICAgICBBbGVydC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBBbGVydC5iaWcuZXJyb3IoeyB0aXRsZSA6IGVyci5tZXNzYWdlLCBodG1sIDogJ1NvbWV0aGluZyBoYXBwZW5lZC4nIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGluY3JlYXNlKEs6IGtleW9mIElTdWJjb25maWcpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGB1c2VkIHN1YmNvbmZpZy5pbmNyZWFzZSwgVU5URVNURURgKTtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdpbmNyZWFzZSwgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBWID09PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgMSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdHlwZW9mViA9IHR5cGVvZiBWO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgaWYgKCB0eXBlb2ZWID09PSAnbnVtYmVyJyB8fCAodHlwZW9mViA9PT0gJ3N0cmluZycgJiYgVi5pc2RpZ2l0KCkpICkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICB0aGlzLnNldChLLCBNYXRoLmZsb29yKFYpICsgMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkJpZ0NvbmZpZ0NscyB0cmllZCB0byBpbmNyZWFzZSBhIHZhbHVlIHRoYXQgaXMgbm90IGEgbnVtYmVyIG5vciBhIHN0cmluZy5pc2RpZ2l0KClcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICB0b09iaigpOiBPbWl0PElTdWJjb25maWcsIFwibmFtZVwiPiB7IC8vIEFLQSB0b1NhdmVkQ29uZmlnXG4gICAgICAgIFxuICAgICAgICBjb25zdCBvYmogPSB0aGlzLnN0b3JlO1xuICAgICAgICBkZWxldGUgb2JqLm5hbWU7XG4gICAgICAgIHJldHVybiBvYmpcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBmcm9tU3ViY29uZmlnKHN1YmNvbmZpZzogU3ViY29uZmlnKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkgcmV0dXJuIGNvbnNvbGUud2FybignZnJvbU9iaiwgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgLy8gdGhpcy5zZXQoc3ViY29uZmlnLnRvT2JqKCkpO1xuICAgICAgICAvLyB0aGlzLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbiA9IHN1YmNvbmZpZy5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb247XG4gICAgICAgIC8vIHRoaXMuYWxsb3dlZF90ZW1wb19kZXZpYXRpb24gPSBzdWJjb25maWcuYWxsb3dlZF90ZW1wb19kZXZpYXRpb247XG4gICAgICAgIC8vIHRoaXMuZGVtb190eXBlID0gc3ViY29uZmlnLmRlbW9fdHlwZTtcbiAgICAgICAgLy8gdGhpcy5lcnJvcnNfcGxheXJhdGUgPSBzdWJjb25maWcuZXJyb3JzX3BsYXlyYXRlO1xuICAgICAgICAvLyB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudCA9IHN1YmNvbmZpZy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgICAgIC8vIHRoaXMubGV2ZWxzID0gc3ViY29uZmlnLmxldmVscztcbiAgICAgICAgLy8gdGhpcy5zdWJqZWN0ID0gc3ViY29uZmlnLnN1YmplY3Q7XG4gICAgICAgIC8vIHRoaXMudHJ1dGhfZmlsZSA9IHN1YmNvbmZpZy50cnV0aF9maWxlO1xuICAgICAgICAvLyB0aGlzLl91cGRhdGVTYXZlZEZpbGUoJ3RydXRoX2ZpbGVfcGF0aCcsIGNmZ0ZpbGUudHJ1dGhfZmlsZV9wYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIHByaXZhdGUgX3VwZGF0ZVNhdmVkRmlsZShrZXk6IGtleW9mIElTdWJjb25maWcsIHZhbHVlKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignX3VwZGF0ZVNhdmVkRmlsZSwgRFJZUlVOLiByZXR1cm5pbmcnKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ191cGRhdGVTYXZlZEZpbGUoKSBkb2VzIG5vdGhpbmcsIHJldHVybmluZycpO1xuICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgLypjb25zdCBjb25mID0gbmV3IChyZXF1aXJlKCdjb25mJykpKHtcbiAgICAgICAgIGN3ZCA6IENPTkZJR1NfUEFUSF9BQlMsXG4gICAgICAgICBjb25maWdOYW1lIDogdGhpcy5uYW1lLFxuICAgICAgICAgZmlsZUV4dGVuc2lvbiA6IHRoaXMudHlwZSxcbiAgICAgICAgIHNlcmlhbGl6ZSA6IHZhbHVlID0+IEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCA0KVxuICAgICAgICAgfSk7XG4gICAgICAgICBjb25mLnNldChrZXksIHZhbHVlKTsqL1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBwcml2YXRlIHNldERldmlhdGlvbihkZXZpYXRpb25UeXBlOiBEZXZpYXRpb25UeXBlLCBkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICBjb25zdCB0eXBlb2ZEZXZpYXRpb24gPSB0eXBlb2YgZGV2aWF0aW9uO1xuICAgICAgICBpZiAoIHR5cGVvZkRldmlhdGlvbiA9PT0gJ251bWJlcicgKSB7XG4gICAgICAgICAgICBkZXZpYXRpb24gPSBgJHtkZXZpYXRpb259JWA7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldERldmlhdGlvbiBnb3QgXCJkZXZpYXRpb25cIiB0eXBlIG51bWJlci4gYXBwZW5kZWQgXCIlXCIuIGRldmlhdGlvbiBub3c6ICR7ZGV2aWF0aW9ufWApO1xuICAgICAgICB9IGVsc2UgaWYgKCB0eXBlb2ZEZXZpYXRpb24gPT09ICdzdHJpbmcnICkge1xuICAgICAgICAgICAgaWYgKCAhZGV2aWF0aW9uLmVuZHNXaXRoKFwiJVwiKSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldERldmlhdGlvbiBnb3QgZGV2aWF0aW9uIHdpdGhvdXQgJS4gYXBwZW5kZWQgJS4gZGV2aWF0aW9uIG5vdzogXCIke2RldmlhdGlvbn1cImApO1xuICAgICAgICAgICAgICAgIGRldmlhdGlvbiA9IGAke2RldmlhdGlvbn0lYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0RGV2aWF0aW9uLCByZWNlaXZlZCBcImRldmlhdGlvblwiIG5vdCBzdHJpbmcgbm90IG51bWJlci4gcmV0dXJuaW5nLiBkZXZpYXRpb246YCwgZGV2aWF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB0aGlzLnNldChgYWxsb3dlZF8ke2RldmlhdGlvblR5cGV9X2RldmlhdGlvbmAsIGRldmlhdGlvbik7XG4gICAgICAgIHRoaXMuY2FjaGVbYGFsbG93ZWRfJHtkZXZpYXRpb25UeXBlfV9kZXZpYXRpb25gXSA9IGRldmlhdGlvbjtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0IGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJhbGxvd2VkX3RlbXBvX2RldmlhdGlvblwiKVxuICAgICAgICAvKmlmICggdGhpcy5jYWNoZS5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgY29uc3QgYWxsb3dlZFRlbXBvRGV2aWF0aW9uID0gdGhpcy5nZXQoJ2FsbG93ZWRfdGVtcG9fZGV2aWF0aW9uJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uID0gYWxsb3dlZFRlbXBvRGV2aWF0aW9uO1xuICAgICAgICAgcmV0dXJuIGFsbG93ZWRUZW1wb0RldmlhdGlvbjtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbjtcbiAgICAgICAgIH0qL1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgYWxsb3dlZF90ZW1wb19kZXZpYXRpb24oZGV2aWF0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXREZXZpYXRpb24oXCJ0ZW1wb1wiLCBkZXZpYXRpb24pO1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBnZXQgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJhbGxvd2VkX3JoeXRobV9kZXZpYXRpb25cIik7XG4gICAgICAgIC8qaWYgKCB0aGlzLmNhY2hlLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgY29uc3QgYWxsb3dlZFJoeXRobURldmlhdGlvbiA9IHRoaXMuZ2V0KCdhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24nKTtcbiAgICAgICAgIHRoaXMuY2FjaGUuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uID0gYWxsb3dlZFJoeXRobURldmlhdGlvbjtcbiAgICAgICAgIHJldHVybiBhbGxvd2VkUmh5dGhtRGV2aWF0aW9uO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbjtcbiAgICAgICAgIH0qL1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uKGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0RGV2aWF0aW9uKFwicmh5dGhtXCIsIGRldmlhdGlvbik7XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCBkZW1vX3R5cGUoKTogRGVtb1R5cGUge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiZGVtb190eXBlXCIpO1xuICAgICAgICAvLyByZXR1cm4gdGhpcy5nZXQoJ2RlbW9fdHlwZScpO1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgZGVtb190eXBlKHR5cGU6IERlbW9UeXBlKSB7XG4gICAgICAgIGlmICggIVsgJ3ZpZGVvJywgJ2FuaW1hdGlvbicgXS5pbmNsdWRlcyh0eXBlKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQ29uZmlnIGRlbW9fdHlwZSBzZXR0ZXIsIGJhZCB0eXBlID0gJHt0eXBlfSwgY2FuIGJlIGVpdGhlciB2aWRlbyBvciBhbmltYXRpb24uIE5vdCBzZXR0aW5nYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZGVtb190eXBlJywgdHlwZSk7XG4gICAgICAgICAgICB0aGlzLmNhY2hlLmRlbW9fdHlwZSA9IHR5cGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZ2V0IGVycm9yc19wbGF5cmF0ZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2Vycm9yc19wbGF5cmF0ZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZXJyb3JzX3BsYXlyYXRlKHNwZWVkOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCBpc05hTihzcGVlZCkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGNvbmZpZyBzZXQgZXJyb3JzX3BsYXlyYXRlLCByZWNlaXZlZCBiYWQgXCJzcGVlZFwiIE5hTjogJHtzcGVlZH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdlcnJvcnNfcGxheXJhdGUnLCBzcGVlZCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGdldCBmaW5pc2hlZF90cmlhbHNfY291bnQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdmaW5pc2hlZF90cmlhbHNfY291bnQnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGZpbmlzaGVkX3RyaWFsc19jb3VudChjb3VudDogbnVtYmVyKSB7XG4gICAgICAgIGlmICggaXNOYU4oY291bnQpIHx8IGNvdW50IDwgMCApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgY29uZmlnIHNldCBmaW5pc2hlZF90cmlhbHNfY291bnQsIHJlY2VpdmVkIGJhZCBcImNvdW50XCI6ICR7Y291bnR9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZmluaXNoZWRfdHJpYWxzX2NvdW50JywgY291bnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKk5hbWUgb2YgY29uZmlnIGZpbGUsIGluY2x1ZGluZyBleHRlbnNpb24uIEFsd2F5cyByZXR1cm5zIGBuYW1lYCBmcm9tIGNhY2hlLiBUaGlzIGlzIGJlY2F1c2UgdGhlcmUncyBubyBzZXR0ZXI7IGBuYW1lYCBpcyBzdG9yZWQgaW4gY2FjaGUgYXQgY29uc3RydWN0b3IuKi9cbiAgICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5uYW1lO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBnZXQgc3ViamVjdCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ3N1YmplY3QnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IHN1YmplY3QobmFtZTogc3RyaW5nIHwgbnVsbCkge1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ3NldCBzdWJqZWN0LCBEUllSVU4nKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldCgnc3ViamVjdCcsIG5hbWUpO1xuICAgICAgICBpZiAoIG5hbWUgKSB7XG4gICAgICAgICAgICBjb25zdCBHbG9iID0gcmVxdWlyZSgnLi4vR2xvYicpLmRlZmF1bHQ7XG4gICAgICAgICAgICBHbG9iLkJpZ0NvbmZpZy5zdWJqZWN0cyA9IFsgLi4ubmV3IFNldChbIC4uLkdsb2IuQmlnQ29uZmlnLnN1YmplY3RzLCBuYW1lIF0pIF07XG4gICAgICAgICAgICAvLyBzdXBlci5zZXQoJ3N1YmplY3RzJywgWy4uLm5ldyBTZXQoWy4uLnN1cGVyLmdldCgnc3ViamVjdHMnKSwgbmFtZV0pXSk7XG4gICAgICAgICAgICAvLyBzdXBlci5zdWJqZWN0cyA9IFsgLi4uc3VwZXIuZ2V0KCdzdWJqZWN0cycpLCBuYW1lIF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIFRydXRoIGZpbGUgbmFtZSwgbm8gZXh0ZW5zaW9uKi9cbiAgICBnZXQgdHJ1dGhfZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsICd0cnV0aF9maWxlJyk7XG4gICAgICAgIC8vIHJldHVybiB0aGlzLmdldCgndHJ1dGhfZmlsZScpXG4gICAgfVxuICAgIFxuICAgIC8qKkFsc28gc2V0cyB0aGlzLnRydXRoIChtZW1vcnkpXG4gICAgICogQGNhY2hlZFxuICAgICAqIEBwYXJhbSB0cnV0aF9maWxlIC0gVHJ1dGggZmlsZSBuYW1lLCBubyBleHRlbnNpb24qL1xuICAgIHNldCB0cnV0aF9maWxlKHRydXRoX2ZpbGU6IHN0cmluZykge1xuICAgICAgICAvLyB0cnV0aF9maWxlID0gcGF0aC5iYXNlbmFtZSh0cnV0aF9maWxlKTtcbiAgICAgICAgbGV0IFsgbmFtZSwgZXh0IF0gPSBteWZzLnNwbGl0X2V4dCh0cnV0aF9maWxlKTtcbiAgICAgICAgaWYgKCBib29sKGV4dCkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldCB0cnV0aF9maWxlLCBwYXNzZWQgbmFtZSBpcyBub3QgZXh0ZW5zaW9ubGVzczogJHt0cnV0aF9maWxlfS4gQ29udGludWluZyB3aXRoIFwiJHtuYW1lfVwiYCk7XG4gICAgICAgICAgICAvLyBuYW1lTm9FeHQgPSBteWZzLnJlbW92ZV9leHQobmFtZU5vRXh0KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCB0cnV0aCA9IG5ldyBUcnV0aChuYW1lKTtcbiAgICAgICAgICAgIGlmICggIXRydXRoLnR4dC5hbGxFeGlzdCgpICkge1xuICAgICAgICAgICAgICAgIEFsZXJ0LnNtYWxsLndhcm5pbmcoYE5vdCBhbGwgdHh0IGZpbGVzIGV4aXN0OiAke25hbWV9YClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudHJ1dGggPSB0cnV0aDtcbiAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgICAgICBBbGVydC5zbWFsbC53YXJuaW5nKGUpO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGUpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoYHRydXRoX2ZpbGVgLCBuYW1lKTtcbiAgICAgICAgdGhpcy5jYWNoZS50cnV0aF9maWxlID0gbmFtZTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBcbiAgICBnZXQgbGV2ZWxzKCk6IElMZXZlbFtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdsZXZlbHMnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGxldmVscyhsZXZlbHM6IElMZXZlbFtdKSB7XG4gICAgICAgIGlmICggIUFycmF5LmlzQXJyYXkobGV2ZWxzKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IGxldmVscywgcmVjZWl2ZWQgXCJsZXZlbHNcIiBub3QgaXNBcnJheS4gbm90IHNldHRpbmcgYW55dGhpbmcuIGxldmVsczogYCwgbGV2ZWxzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRPRE86IGJldHRlciBjaGVja3NcbiAgICAgICAgICAgIHRoaXMuc2V0KCdsZXZlbHMnLCBsZXZlbHMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGN1cnJlbnRUcmlhbENvb3JkcygpOiBudW1iZXJbXSB7XG4gICAgICAgIC8vIGxldCB7IGxldmVscywgZmluaXNoZWRfdHJpYWxzX2NvdW50IH0gPSB0aGlzLmNvbmZpZygpO1xuICAgICAgICBsZXQgZmxhdFRyaWFsc0xpc3QgPSB0aGlzLmxldmVscy5tYXAobGV2ZWwgPT4gbGV2ZWwudHJpYWxzKTtcbiAgICAgICAgZm9yICggbGV0IFsgbGV2ZWxJbmRleCwgdHJpYWxzTnVtIF0gb2YgZW51bWVyYXRlKGZsYXRUcmlhbHNMaXN0KSApIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHRyaWFsU3VtU29GYXIgPSBzdW0oZmxhdFRyaWFsc0xpc3Quc2xpY2UoMCwgbGV2ZWxJbmRleCArIDEpKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbmlzaGVkVHJpYWxzQ291bnQgPSB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudDtcbiAgICAgICAgICAgIGlmICggdHJpYWxTdW1Tb0ZhciA+IGZpbmlzaGVkVHJpYWxzQ291bnQgKVxuICAgICAgICAgICAgICAgIHJldHVybiBbIGxldmVsSW5kZXgsIHRyaWFsc051bSAtICh0cmlhbFN1bVNvRmFyIC0gZmluaXNoZWRUcmlhbHNDb3VudCkgXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLndhcm4oXCJjdXJyZW50VHJpYWxDb29yZHM6IG91dCBvZiBpbmRleCBlcnJvclwiKTtcbiAgICB9XG4gICAgXG4gICAgaXNEZW1vVmlkZW8oKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbW9fdHlwZSA9PT0gJ3ZpZGVvJztcbiAgICB9XG4gICAgXG4gICAgaXNXaG9sZVRlc3RPdmVyKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gc3VtKHRoaXMubGV2ZWxzLm1hcChsZXZlbCA9PiBsZXZlbC50cmlhbHMpKSA9PSB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudDtcbiAgICB9XG4gICAgXG4gICAgZ2V0U3ViamVjdERpck5hbWVzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIGZzLnJlYWRkaXJTeW5jKFNVQkpFQ1RTX1BBVEhfQUJTKTtcbiAgICB9XG4gICAgXG4gICAgZ2V0Q3VycmVudExldmVsKCk6IExldmVsIHtcbiAgICAgICAgXG4gICAgICAgIGxldCBbIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCBdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBMZXZlbCh0aGlzLmxldmVsc1tsZXZlbF9pbmRleF0sIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldExldmVsQ29sbGVjdGlvbigpOiBMZXZlbENvbGxlY3Rpb24ge1xuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIHJldHVybiBuZXcgTGV2ZWxDb2xsZWN0aW9uKHRoaXMubGV2ZWxzLCBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXgpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipHZXRzIHRoZSBjdXJyZW50IHRyaWFsJ3MgcGF0aCAoam9pbiB0aGlzLnRlc3RPdXRQYXRoKCkgYW5kIGxldmVsXyR7bGV2ZWxfaW5kZXh9Li4uKSwgYW5kIHJldHVybnMgYSBUcnV0aCBvZiBpdCovXG4gICAgdHJpYWxUcnV0aCgpOiBUcnV0aCB7XG4gICAgICAgIGxldCBbIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCBdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgLy8gcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odGhpcy50ZXN0T3V0UGF0aCgpLCBgbGV2ZWxfJHtsZXZlbF9pbmRleH1fdHJpYWxfJHt0cmlhbF9pbmRleH1gKSk7XG4gICAgICAgIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRoaXMudGVzdE91dFBhdGgoKSwgYGxldmVsXyR7bGV2ZWxfaW5kZXh9X3RyaWFsXyR7dHJpYWxfaW5kZXh9YCkpO1xuICAgIH1cbiAgICBcbiAgICAvKipcImM6XFxTeW5jXFxDb2RlXFxQeXRob25cXFB5YW5vLXJlbGVhc2VcXHNyY1xcZXhwZXJpbWVudHNcXHN1YmplY3RzXFxnaWxhZFxcZnVyX2VsaXNlXCIqL1xuICAgIHRlc3RPdXRQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGN1cnJTdWJqZWN0RGlyID0gcGF0aC5qb2luKFNVQkpFQ1RTX1BBVEhfQUJTLCB0aGlzLnN1YmplY3QpOyAvLyBcIi4uLi9zdWJqZWN0cy9naWxhZFwiXG4gICAgICAgIHJldHVybiBwYXRoLmpvaW4oY3VyclN1YmplY3REaXIsIHRoaXMudHJ1dGgubmFtZSk7XG4gICAgfVxuICAgIFxuICAgIFxufVxuIl19