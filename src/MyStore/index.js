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
        const subjects = [...new Set(subjectList)].filter(subj => util_1.bool(subj));
        this.set('subjects', subjects);
    }
    get dev() {
        const _dev = this.get('dev');
        const handleBoolean = (key, where) => {
            const value = _dev && this.get('devoptions')[key];
            if (value)
                console.warn(`devoptions.${key} ${where}`);
            return value;
        };
        return {
            force_notes_number: () => {
                if (_dev) {
                    const force_notes_number = this.get('devoptions').force_notes_number;
                    if (force_notes_number)
                        console.warn(`devoptions.force_notes_number: ${force_notes_number}`);
                    return force_notes_number;
                }
                return null;
            },
            force_playback_rate: () => {
                if (_dev) {
                    const force_playback_rate = this.get('devoptions').force_playback_rate;
                    if (force_playback_rate)
                        console.warn(`devoptions.force_playback_rate: ${force_playback_rate}`);
                    return force_playback_rate;
                }
                return null;
            },
            simulate_test_mode: (where) => {
                return handleBoolean("simulate_test_mode", where);
            },
            simulate_animation_mode: (where) => {
                return handleBoolean("simulate_animation_mode", where);
            },
            simulate_video_mode: (where) => {
                const simulate_video_mode = _dev && this.get('devoptions').simulate_video_mode;
                if (simulate_video_mode)
                    console.warn(`devoptions.simulate_video_mode ${where}`);
                return simulate_video_mode;
            },
            skip_fade: (where) => {
                const skip_fade = _dev && this.get('devoptions').skip_fade;
                if (skip_fade)
                    console.warn(`devoptions.skip_fade ${where}`);
                return skip_fade;
            },
            mute_animation: (where) => {
                const mute_animation = _dev && this.get('devoptions').mute_animation;
                if (mute_animation)
                    console.warn(`devoptions.mute_animation ${where}`);
                return mute_animation;
            },
            skip_midi_exists_check: (where) => {
                const skip_midi_exists_check = _dev && this.get('devoptions').skip_midi_exists_check;
                if (skip_midi_exists_check)
                    console.warn(`devoptions.skip_midi_exists_check ${where}`);
                return skip_midi_exists_check;
            },
            skip_experiment_intro: (where) => {
                const skip_experiment_intro = _dev && this.get('devoptions').skip_experiment_intro;
                if (skip_experiment_intro)
                    console.warn(`devoptions.skip_experiment_intro ${where}`);
                return skip_experiment_intro;
            },
            skip_level_intro: (where) => {
                const skip_level_intro = _dev && this.get('devoptions').skip_level_intro;
                if (skip_level_intro)
                    console.warn(`devoptions.skip_level_intro ${where}`);
                return skip_level_intro;
            },
            skip_passed_trial_feedback: (where) => {
                const skip_passed_trial_feedback = _dev && this.get('devoptions').skip_passed_trial_feedback;
                if (skip_passed_trial_feedback)
                    console.warn(`devoptions.skip_passed_trial_feedback ${where}`);
                return skip_passed_trial_feedback;
            },
            skip_failed_trial_feedback: (where) => {
                const skip_failed_trial_feedback = _dev && this.get('devoptions').skip_failed_trial_feedback;
                if (skip_failed_trial_feedback)
                    console.warn(`devoptions.skip_failed_trial_feedback ${where}`);
                return skip_failed_trial_feedback;
            },
            no_reload_on_submit: (where) => {
                const no_reload_on_submit = _dev && this.get('devoptions').no_reload_on_submit;
                if (no_reload_on_submit)
                    console.warn(`devoptions.no_reload_on_submit ${where}`);
                return no_reload_on_submit;
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
        if (util_1.bool(subconfig)) {
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
    toHtml() {
        let levels = this.levels;
        let levelsHtml = `
        <table class="subconfig-html">
            <tr>
                <th>Level #</th>
                <th>Notes</th>
                <th>Trials</th>
                <th>Rhythm</th>
                <th>Tempo</th>
            </tr>
        `;
        for (let [i, lvl] of util_1.enumerate(levels)) {
            levelsHtml += `
            <tr>
                <td>${i + 1}</td>
                <td>${lvl.notes}</td>
                <td>${lvl.trials}</td>
                <td>${lvl.rhythm}</td>
                <td>${lvl.tempo}</td>
            </tr>`;
        }
        levelsHtml += `</table>`;
        return `
            <table class="subconfig-html">
                <tr>
                    <th>Key</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Allowed rhythm deviation</td>
                    <td>${this.allowed_rhythm_deviation}</td>
                </tr>
                <tr>
                    <td>Allowed tempo deviation</td>
                    <td>${this.allowed_tempo_deviation}</td>
                </tr>
                <tr>
                    <td>Demo type</td>
                    <td>${this.demo_type}</td>
                </tr>
                <tr>
                    <td>Errors play rate</td>
                    <td>${this.errors_playrate}</td>
                </tr>
                <tr>
                    <td>Finished trials count</td>
                    <td>${this.finished_trials_count}</td>
                </tr>
                <tr>
                    <td>Name</td>
                    <td>${this.name}</td>
                </tr>
                <tr>
                    <td>Subject</td>
                    <td>${this.subject}</td>
                </tr>
                <tr>
                    <td>Truth file</td>
                    <td>${this.truth_file}</td>
                </tr>
                
            </table>

            ${levelsHtml}
            `;
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
            return console.warn('set subject, DRYRUN. Returning');
        }
        if (!util_1.bool(name)) {
            return console.warn(`set subject, !bool(name): ${name}. Returning`);
        }
        this.set('subject', name);
        const Glob = require('../Glob').default;
        const existingSubjects = Glob.BigConfig.subjects.filter(subj => util_1.bool(subj));
        console.log({ existingSubjects });
        Glob.BigConfig.subjects = [...new Set([...existingSubjects, name])];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFDM0Isa0NBQWdFO0FBQ2hFLG9DQUFpQztBQUNqQyxvQ0FBMEQ7QUFFMUQsNkJBQTZCO0FBRTdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQXNEdEMsU0FBUyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUk7SUFDakMsSUFBSyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRztRQUNwQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzdCLE9BQU8sT0FBTyxDQUFDO0tBQ2xCO1NBQU07UUFDSCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDN0I7QUFDTCxDQUFDO0FBR0QsU0FBZ0Isa0JBQWtCLENBQUMsRUFBRSxTQUFTLEtBQTRDLEVBQUUsU0FBUyxFQUFHLFNBQVMsRUFBRTtJQUMvRyxJQUFLLFNBQVMsRUFBRztRQUNiLElBQUssU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRztZQUU3QixTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsQztRQUNELElBQUssQ0FBQyxDQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFHO1lBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLFNBQVMsNEVBQTRFLENBQUMsQ0FBQztZQUN2SCxTQUFTLEdBQUcsU0FBUyxDQUFDO1NBQ3pC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QixDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELGVBQWU7UUFFWCxJQUFJLENBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzdELE9BQU8sSUFBSSxhQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUdELGtCQUFrQjtRQUNkLElBQUksQ0FBRSxXQUFXLEVBQUUsV0FBVyxDQUFFLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDN0QsT0FBTyxJQUFJLHVCQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUtELDBCQUEwQjtRQUN0QixPQUFPLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFFLFdBQVcsRUFBRSxXQUFXLENBQUUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUU3RCxPQUFPLElBQUksYUFBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsU0FBUyxXQUFXLFVBQVUsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3pHLENBQUM7SUFHRCxtQkFBbUI7UUFDZixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztDQUdKO0FBdmNELDhCQXVjQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFN0b3JlIGZyb20gXCJlbGVjdHJvbi1zdG9yZVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgQWxlcnQgZnJvbSBcIi4uL015QWxlcnRcIjtcbmltcG9ydCBteWZzIGZyb20gXCIuLi9NeUZzXCI7XG5pbXBvcnQgeyBib29sLCByZWxvYWRQYWdlLCBzdW0sIGVudW1lcmF0ZSwgYWxsIH0gZnJvbSBcIi4uL3V0aWxcIjtcbmltcG9ydCB7IFRydXRoIH0gZnJvbSBcIi4uL1RydXRoXCI7XG5pbXBvcnQgeyBJTGV2ZWwsIExldmVsLCBMZXZlbENvbGxlY3Rpb24gfSBmcm9tIFwiLi4vTGV2ZWxcIjtcbmltcG9ydCB7IFN3ZWV0QWxlcnRSZXN1bHQgfSBmcm9tIFwic3dlZXRhbGVydDJcIjtcbmltcG9ydCAqIGFzIENvbmYgZnJvbSAnY29uZic7XG5cbmNvbnNvbGUubG9nKCdzcmMvQmlnQ29uZmlnL2luZGV4LnRzJyk7XG5cbmV4cG9ydCB0eXBlIEV4cGVyaW1lbnRUeXBlID0gJ2V4YW0nIHwgJ3Rlc3QnO1xuZXhwb3J0IHR5cGUgRGVtb1R5cGUgPSAndmlkZW8nIHwgJ2FuaW1hdGlvbic7XG5leHBvcnQgdHlwZSBQYWdlTmFtZSA9IFwibmV3XCIgLy8gQUtBIFRMYXN0UGFnZVxuICAgIHwgXCJydW5uaW5nXCJcbiAgICB8IFwicmVjb3JkXCJcbiAgICB8IFwiZmlsZV90b29sc1wiXG4gICAgfCBcInNldHRpbmdzXCJcbnR5cGUgRGV2aWF0aW9uVHlwZSA9ICdyaHl0aG0nIHwgJ3RlbXBvJztcblxuXG5pbnRlcmZhY2UgSVN1YmNvbmZpZyB7XG4gICAgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uOiBzdHJpbmcsXG4gICAgYWxsb3dlZF90ZW1wb19kZXZpYXRpb246IHN0cmluZyxcbiAgICBkZW1vX3R5cGU6IERlbW9UeXBlLFxuICAgIGVycm9yc19wbGF5cmF0ZTogbnVtYmVyLFxuICAgIGZpbmlzaGVkX3RyaWFsc19jb3VudDogbnVtYmVyLFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzdWJqZWN0OiBzdHJpbmcsXG4gICAgdHJ1dGhfZmlsZTogc3RyaW5nLFxuICAgIGxldmVsczogSUxldmVsW10sXG59XG5cblxuaW50ZXJmYWNlIERldk9wdGlvbnMge1xuICAgIGZvcmNlX25vdGVzX251bWJlcjogbnVsbCB8IG51bWJlcixcbiAgICBmb3JjZV9wbGF5YmFja19yYXRlOiBudWxsIHwgbnVtYmVyLFxuICAgIG11dGVfYW5pbWF0aW9uOiBib29sZWFuLFxuICAgIG5vX3JlbG9hZF9vbl9zdWJtaXQ6IGJvb2xlYW5cbiAgICBzaW11bGF0ZV90ZXN0X21vZGU6IGJvb2xlYW4sXG4gICAgc2ltdWxhdGVfdmlkZW9fbW9kZTogYm9vbGVhbixcbiAgICBzaW11bGF0ZV9hbmltYXRpb25fbW9kZTogYm9vbGVhbixcbiAgICBza2lwX2V4cGVyaW1lbnRfaW50cm86IGJvb2xlYW4sXG4gICAgc2tpcF9mYWRlOiBib29sZWFuLFxuICAgIHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrOiBib29sZWFuLFxuICAgIHNraXBfbGV2ZWxfaW50cm86IGJvb2xlYW4sXG4gICAgc2tpcF9taWRpX2V4aXN0c19jaGVjazogYm9vbGVhbixcbiAgICBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjazogYm9vbGVhbixcbn1cblxuaW50ZXJmYWNlIElCaWdDb25maWcge1xuICAgIGRldjogYm9vbGVhbixcbiAgICBkZXZvcHRpb25zOiBEZXZPcHRpb25zLFxuICAgIGV4YW1fZmlsZTogc3RyaW5nLFxuICAgIHRlc3RfZmlsZTogc3RyaW5nLFxuICAgIGV4cGVyaW1lbnRfdHlwZTogRXhwZXJpbWVudFR5cGUsXG4gICAgbGFzdF9wYWdlOiBQYWdlTmFtZSxcbiAgICBzdWJqZWN0czogc3RyaW5nW10sXG4gICAgdmVsb2NpdGllczogbnVtYmVyLFxufVxuXG5mdW5jdGlvbiB0cnlHZXRGcm9tQ2FjaGU8VCBleHRlbmRzIGtleW9mIElCaWdDb25maWc+KGNvbmZpZzogQmlnQ29uZmlnQ2xzLCBwcm9wOiBUKTogSUJpZ0NvbmZpZ1tUXVxuZnVuY3Rpb24gdHJ5R2V0RnJvbUNhY2hlPFQgZXh0ZW5kcyBrZXlvZiBJU3ViY29uZmlnPihjb25maWc6IFN1YmNvbmZpZywgcHJvcDogVCk6IElTdWJjb25maWdbVF1cbmZ1bmN0aW9uIHRyeUdldEZyb21DYWNoZShjb25maWcsIHByb3ApIHtcbiAgICBpZiAoIGNvbmZpZy5jYWNoZVtwcm9wXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICBjb25zdCBwcm9wVmFsID0gY29uZmlnLmdldChwcm9wKTtcbiAgICAgICAgY29uZmlnLmNhY2hlW3Byb3BdID0gcHJvcFZhbDtcbiAgICAgICAgcmV0dXJuIHByb3BWYWw7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5jYWNoZVtwcm9wXTtcbiAgICB9XG59XG5cbi8qKkxpc3Qgb2YgdHJ1dGggZmlsZSBuYW1lcywgbm8gZXh0ZW5zaW9uKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcnV0aEZpbGVzV2hlcmUoeyBleHRlbnNpb24gfTogeyBleHRlbnNpb24/OiAndHh0JyB8ICdtaWQnIHwgJ21wNCcgfSA9IHsgZXh0ZW5zaW9uIDogdW5kZWZpbmVkIH0pOiBzdHJpbmdbXSB7XG4gICAgaWYgKCBleHRlbnNpb24gKSB7XG4gICAgICAgIGlmICggZXh0ZW5zaW9uLnN0YXJ0c1dpdGgoJy4nKSApIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGV4dGVuc2lvbiA9IGV4dGVuc2lvbi5zbGljZSgxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoICFbICd0eHQnLCAnbWlkJywgJ21wNCcgXS5pbmNsdWRlcyhleHRlbnNpb24pICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGB0cnV0aEZpbGVzTGlzdChcIiR7ZXh0ZW5zaW9ufVwiKSwgbXVzdCBiZSBlaXRoZXIgWyd0eHQnLCdtaWQnLCdtcDQnXSBvciBub3QgYXQgYWxsLiBzZXR0aW5nIHRvIHVuZGVmaW5lZGApO1xuICAgICAgICAgICAgZXh0ZW5zaW9uID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIGNvbnN0IHRydXRoc0RpclBhdGggPSB0aGlzLnRydXRoc0RpclBhdGgoKTtcbiAgICBcbiAgICBsZXQgdHJ1dGhGaWxlcyA9IFsgLi4ubmV3IFNldChmcy5yZWFkZGlyU3luYyhUUlVUSFNfUEFUSF9BQlMpKSBdO1xuICAgIGxldCBmb3JtYXR0ZWRUcnV0aEZpbGVzID0gW107XG4gICAgZm9yICggbGV0IGZpbGUgb2YgdHJ1dGhGaWxlcyApIHtcbiAgICAgICAgbGV0IFsgbmFtZSwgZXh0IF0gPSBteWZzLnNwbGl0X2V4dChmaWxlKTtcbiAgICAgICAgaWYgKCBleHRlbnNpb24gKSB7XG4gICAgICAgICAgICBpZiAoIGV4dC5sb3dlcigpID09PSBgLiR7ZXh0ZW5zaW9ufWAgKSB7XG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkVHJ1dGhGaWxlcy5wdXNoKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9ybWF0dGVkVHJ1dGhGaWxlcy5wdXNoKG5hbWUpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZvcm1hdHRlZFRydXRoRmlsZXNcbiAgICBcbn1cblxuLyoqTGlzdCBvZiBuYW1lcyBvZiB0eHQgdHJ1dGggZmlsZXMgdGhhdCBoYXZlIHRoZWlyIHdob2xlIFwidHJpcGxldFwiIGluIHRhY3QuIG5vIGV4dGVuc2lvbiovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJ1dGhzV2l0aDNUeHRGaWxlcygpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgdHh0RmlsZXNMaXN0ID0gZ2V0VHJ1dGhGaWxlc1doZXJlKHsgZXh0ZW5zaW9uIDogJ3R4dCcgfSk7XG4gICAgY29uc3Qgd2hvbGVUeHRGaWxlcyA9IFtdO1xuICAgIGZvciAoIGxldCBuYW1lIG9mIHR4dEZpbGVzTGlzdCApIHtcbiAgICAgICAgaWYgKCB0eHRGaWxlc0xpc3QuY291bnQodHh0ID0+IHR4dC5zdGFydHNXaXRoKG5hbWUpKSA+PSAzICkge1xuICAgICAgICAgICAgd2hvbGVUeHRGaWxlcy5wdXNoKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0eHRGaWxlc0xpc3QuZmlsdGVyKGEgPT4gdHh0RmlsZXNMaXN0LmZpbHRlcih0eHQgPT4gdHh0LnN0YXJ0c1dpdGgoYSkpLmxlbmd0aCA+PSAzKTtcbn1cblxuZXhwb3J0IGNsYXNzIEJpZ0NvbmZpZ0NscyBleHRlbmRzIFN0b3JlPElCaWdDb25maWc+IHtcbiAgICB0ZXN0OiBTdWJjb25maWc7XG4gICAgZXhhbTogU3ViY29uZmlnO1xuICAgIHJlYWRvbmx5IGNhY2hlOiBQYXJ0aWFsPElCaWdDb25maWc+O1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKF9kb1RydXRoRmlsZUNoZWNrID0gdHJ1ZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmNhY2hlID0ge307XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgdGhpcy5zZXQgPSAoLi4uYXJncykgPT4gY29uc29sZS53YXJuKGBEUllSVU4sIHNldDogYCwgYXJncylcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGVzdE5hbWVXaXRoRXh0ID0gdGhpcy50ZXN0X2ZpbGU7XG4gICAgICAgIGxldCBleGFtTmFtZVdpdGhFeHQgPSB0aGlzLmV4YW1fZmlsZTtcbiAgICAgICAgaWYgKCAhYWxsKHRlc3ROYW1lV2l0aEV4dCwgZXhhbU5hbWVXaXRoRXh0KSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQmlnQ29uZmlnQ2xzIGN0b3IsIGNvdWxkbnQgZ2V0IHRlc3RfZmlsZSBhbmQvb3IgZXhhbV9maWxlIGZyb20ganNvbjpgLCB7XG4gICAgICAgICAgICAgICAgdGVzdE5hbWVXaXRoRXh0LFxuICAgICAgICAgICAgICAgIGV4YW1OYW1lV2l0aEV4dFxuICAgICAgICAgICAgfSwgJywgZGVmYXVsdGluZyB0byBcImZ1cl9lbGlzZV9CLltleHRdXCInKTtcbiAgICAgICAgICAgIHRlc3ROYW1lV2l0aEV4dCA9ICdmdXJfZWxpc2VfQi50ZXN0JztcbiAgICAgICAgICAgIGV4YW1OYW1lV2l0aEV4dCA9ICdmdXJfZWxpc2VfQi5leGFtJztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN1YmNvbmZpZyh0ZXN0TmFtZVdpdGhFeHQpO1xuICAgICAgICB0aGlzLnNldFN1YmNvbmZpZyhleGFtTmFtZVdpdGhFeHQpO1xuICAgICAgICAvLyB0aGlzLnRlc3QgPSBuZXcgU3ViY29uZmlnKHRlc3ROYW1lV2l0aEV4dCk7XG4gICAgICAgIC8vIHRoaXMuZXhhbSA9IG5ldyBTdWJjb25maWcoZXhhbU5hbWVXaXRoRXh0KTtcbiAgICAgICAgdGhpcy5zdWJqZWN0cyA9IHRoaXMuc3ViamVjdHM7IC8vIHRvIGVuc3VyZSBoYXZpbmcgc3ViY29uZmlnJ3Mgc3ViamVjdHNcbiAgICAgICAgaWYgKCBfZG9UcnV0aEZpbGVDaGVjayApIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgUHJvbWlzZS5hbGwoWyB0aGlzLnRlc3QuZG9UcnV0aEZpbGVDaGVjaygpLCB0aGlzLmV4YW0uZG9UcnV0aEZpbGVDaGVjaygpIF0pO1xuICAgICAgICAgICAgICAgIC8qICAgICAgICAgICAgICAgIHRoaXMudGVzdC5kb1RydXRoRmlsZUNoZWNrKClcbiAgICAgICAgICAgICAgICAgLnRoZW4oc3dhbCA9PiB7XG4gICAgICAgICAgICAgICAgIHRoaXMuZXhhbS5kb1RydXRoRmlsZUNoZWNrKClcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICApOyovXG4gICAgICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBCaWdDb25maWdDbHMgY3RvciwgZXJyb3Igd2hlbiBfZG9UcnV0aEZpbGVDaGVjazpgLCBlKTtcbiAgICAgICAgICAgICAgICBBbGVydC5iaWcub25lQnV0dG9uKGBBbiBlcnJvciBvY2N1cmVkIHdoZW4gcnVubmluZyBhIHRydXRoIGZpbGVzIGNoZWNrLiBZb3Ugc2hvdWxkIHRyeSB0byB1bmRlcnN0YW5kIHRoZSBwcm9ibGVtIGJlZm9yZSBjb250aW51aW5nYCwgeyB0ZXh0IDogZS5tZXNzYWdlIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIGZyb21TYXZlZENvbmZpZyhzYXZlZENvbmZpZzogSVN1YmNvbmZpZywgZXhwZXJpbWVudFR5cGU6IEV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ0JpZ0NvbmZpZ0NscyB1c2VkIGZyb21TYXZlZENvbmZpZy4gSW1wb3NzaWJsZSB0byBsb2FkIGJpZyBmaWxlLiBSZXR1cm5pbmcnKTtcbiAgICAgICAgLyppZiAoIERSWVJVTiApIHJldHVybiBjb25zb2xlLmxvZyhgZnJvbVNhdmVkQ29uZmlnLCBEUllSVU5gKTtcbiAgICAgICAgIGNvbnN0IHRydXRoRmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKHNhdmVkQ29uZmlnLnRydXRoX2ZpbGVfcGF0aCwgJy50eHQnKTtcbiAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKHBhdGguam9pbihUUlVUSFNfUEFUSF9BQlMsIHRydXRoRmlsZU5hbWUpKTtcbiAgICAgICAgIHRoaXMuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgICB0aGlzLmNvbmZpZyhleHBlcmltZW50VHlwZSkuZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnKTsqL1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKipAZXhhbXBsZVxuICAgICB1cGRhdGUoJ3N1YmplY3RzJywgW25hbWVzXSlcbiAgICAgKi9cbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywga3ZQYWlyczogUGFydGlhbDxJQmlnQ29uZmlnPilcbiAgICB1cGRhdGUoSzoga2V5b2YgSUJpZ0NvbmZpZywgdmFsdWVzOiBhbnlbXSlcbiAgICB1cGRhdGUoSywga3YpIHtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdCaWdDb25maWcudXBkYXRlKCkgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBpZiAoIEFycmF5LmlzQXJyYXkoVikgKSB7XG4gICAgICAgICAgICBsZXQgbmV3VmFsdWU6IGFueVtdID0gVjtcbiAgICAgICAgICAgIGlmICggQXJyYXkuaXNBcnJheShrdikgKSB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWUucHVzaCguLi5rdik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlLnB1c2goa3YpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgbmV3VmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihWLCBrdik7XG4gICAgICAgICAgICB0aGlzLnNldChLLCBWKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXQoSyk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBsYXN0X3BhZ2UoKTogUGFnZU5hbWUge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2xhc3RfcGFnZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbGFzdF9wYWdlKHBhZ2U6IFBhZ2VOYW1lKSB7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB2YWxpZHBhZ2VzID0gWyBcIm5ld1wiLCBcInJ1bm5pbmdcIiwgXCJyZWNvcmRcIiwgXCJmaWxlX3Rvb2xzXCIsIFwic2V0dGluZ3NcIiBdO1xuICAgICAgICBpZiAoICF2YWxpZHBhZ2VzLmluY2x1ZGVzKHBhZ2UpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGFzdF9wYWdlKFwiJHtwYWdlfVwiKSwgbXVzdCBiZSBvbmUgb2YgJHt2YWxpZHBhZ2VzLmpvaW4oJywgJyl9LiBzZXR0aW5nIHRvIG5ld2ApO1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xhc3RfcGFnZScsICduZXcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCBwYWdlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkXG4gICAgICogU2hvdWxkIGJlIHVzZWQgaW5zdGVhZCBvZiBTdWJjb25maWcgY29uc3RydWN0b3IuXG4gICAgICogVXBkYXRlcyBgZXhhbV9maWxlYCBvciBgdGVzdF9maWxlYCwgaW4gZmlsZSBhbmQgaW4gY2FjaGUuIEFsc28gaW5pdGlhbGl6ZXMgYW5kIGNhY2hlcyBhIG5ldyBTdWJjb25maWcgKHRoaXMuZXhhbSA9IG5ldyBTdWJjb25maWcoLi4uKSkuICovXG4gICAgc2V0U3ViY29uZmlnKG5hbWVXaXRoRXh0OiBzdHJpbmcsIHN1YmNvbmZpZz86IFN1YmNvbmZpZykge1xuICAgICAgICAvLyBjb25zdCBbIGZpbGVuYW1lLCBleHQgXSA9IG15ZnMuc3BsaXRfZXh0KG5hbWVXaXRoRXh0KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIFN1YmNvbmZpZy52YWxpZGF0ZU5hbWUobmFtZVdpdGhFeHQpO1xuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIGlmICggZS5tZXNzYWdlID09PSAnRXh0ZW5zaW9uRXJyb3InICkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oYHNldCBzZXRTdWJjb25maWcgKCR7bmFtZVdpdGhFeHR9KSBoYXMgbm8gZXh0ZW5zaW9uLCBvciBleHQgaXMgYmFkLiBub3Qgc2V0dGluZ2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCBlLm1lc3NhZ2UgPT09ICdCYXNlbmFtZUVycm9yJyApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUobmFtZVdpdGhFeHQpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0U3ViY29uZmlnKCR7bmFtZVdpdGhFeHR9KSwgcGFzc2VkIGEgcGF0aCAod2l0aCBzbGFoZXMpLiBuZWVkIG9ubHkgYSBiYXNlbmFtZS5leHQuIGNvbnRpbnVpbmcgd2l0aCBvbmx5IGJhc2VuYW1lOiAke2Jhc2VuYW1lfWApO1xuICAgICAgICAgICAgICAgIG5hbWVXaXRoRXh0ID0gYmFzZW5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKG5hbWVXaXRoRXh0KTtcbiAgICAgICAgLy8vLyBFeHRlbnNpb24gYW5kIGZpbGUgbmFtZSBva1xuICAgICAgICBjb25zdCBzdWJjZmdUeXBlID0gZXh0LnNsaWNlKDEpIGFzIEV4cGVyaW1lbnRUeXBlO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHN1YmNvbmZpZ0tleSA9IGAke3N1YmNmZ1R5cGV9X2ZpbGVgIGFzIFwiZXhhbV9maWxlXCIgfCBcInRlc3RfZmlsZVwiO1xuICAgICAgICAvLy8vIHRoaXMuc2V0KCdleGFtX2ZpbGUnLCAnZnVyX2VsaXNlX0IuZXhhbScpXG4gICAgICAgIHRoaXMuc2V0KHN1YmNvbmZpZ0tleSwgbmFtZVdpdGhFeHQpO1xuICAgICAgICB0aGlzLmNhY2hlW3N1YmNvbmZpZ0tleV0gPSBuYW1lV2l0aEV4dDtcbiAgICAgICAgY29uc29sZS5sb2coYHNldFN1YmNvbmZpZ2AsIHtcbiAgICAgICAgICAgIG5hbWVXaXRoRXh0LFxuICAgICAgICAgICAgc3ViY29uZmlnLFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vLy8gdGhpcy5leGFtID0gbmV3IFN1YmNvbmZpZygnZnVyX2VsaXNlX0IuZXhhbScsIHN1YmNvbmZpZylcbiAgICAgICAgdGhpc1tzdWJjZmdUeXBlXSA9IG5ldyBTdWJjb25maWcobmFtZVdpdGhFeHQsIHN1YmNvbmZpZylcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0U3ViY29uZmlnKCk6IFN1YmNvbmZpZyB7XG4gICAgICAgIHJldHVybiB0aGlzW3RoaXMuZXhwZXJpbWVudF90eXBlXVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkXG4gICAgICogUmV0dXJucyB0aGUgZXhhbSBmaWxlIG5hbWUgaW5jbHVkaW5nIGV4dGVuc2lvbiovXG4gICAgZ2V0IGV4YW1fZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsICdleGFtX2ZpbGUnKTtcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuZ2V0KCdleGFtX2ZpbGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqVXBkYXRlcyBleGFtX2ZpbGUgYW5kIGFsc28gaW5pdGlhbGl6ZXMgbmV3IFN1YmNvbmZpZyovXG4gICAgc2V0IGV4YW1fZmlsZShuYW1lV2l0aEV4dDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3ViY29uZmlnKG5hbWVXaXRoRXh0KVxuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkXG4gICAgICogUmV0dXJucyB0aGUgdGVzdCBmaWxlIG5hbWUgaW5jbHVkaW5nIGV4dGVuc2lvbiovXG4gICAgZ2V0IHRlc3RfZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsICd0ZXN0X2ZpbGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIFVwZGF0ZXMgdGVzdF9maWxlIGFuZCBhbHNvIGluaXRpYWxpemVzIG5ldyBTdWJjb25maWcqL1xuICAgIHNldCB0ZXN0X2ZpbGUobmFtZVdpdGhFeHQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLnNldFN1YmNvbmZpZyhuYW1lV2l0aEV4dClcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZFxuICAgICAqIENhbiBiZSBnb3R0ZW4gYWxzbyB3aXRoIGBzdWJjb25maWcudHlwZWAqL1xuICAgIGdldCBleHBlcmltZW50X3R5cGUoKTogRXhwZXJpbWVudFR5cGUge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiZXhwZXJpbWVudF90eXBlXCIpXG4gICAgICAgIC8qaWYgKCB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgY29uc3QgZXhwZXJpbWVudFR5cGUgPSB0aGlzLmdldCgnZXhwZXJpbWVudF90eXBlJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZSA9IGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgcmV0dXJuIGV4cGVyaW1lbnRUeXBlO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlLmV4cGVyaW1lbnRfdHlwZTtcbiAgICAgICAgIH0qL1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgZXhwZXJpbWVudF90eXBlKGV4cGVyaW1lbnRUeXBlOiBFeHBlcmltZW50VHlwZSkge1xuICAgICAgICBpZiAoICFbICdleGFtJywgJ3Rlc3QnIF0uaW5jbHVkZXMoZXhwZXJpbWVudFR5cGUpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBCaWdDb25maWcgZXhwZXJpbWVudF90eXBlIHNldHRlciwgZ290IGV4cGVyaW1lbnRUeXBlOiAnJHtleHBlcmltZW50VHlwZX0nLiBNdXN0IGJlIGVpdGhlciAndGVzdCcgb3IgJ2V4YW0nLiBzZXR0aW5nIHRvIHRlc3RgKTtcbiAgICAgICAgICAgIGV4cGVyaW1lbnRUeXBlID0gJ3Rlc3QnO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0KCdleHBlcmltZW50X3R5cGUnLCBleHBlcmltZW50VHlwZSk7XG4gICAgICAgIHRoaXMuY2FjaGUuZXhwZXJpbWVudF90eXBlID0gZXhwZXJpbWVudFR5cGU7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgZ2V0IHN1YmplY3RzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdzdWJqZWN0cycpO1xuICAgIH1cbiAgICBcbiAgICAvKipFbnN1cmVzIGhhdmluZyBgdGhpcy50ZXN0LnN1YmplY3RgIGFuZCBgdGhpcy5leGFtLnN1YmplY3RgIGluIHRoZSBsaXN0IHJlZ2FyZGxlc3MqL1xuICAgIHNldCBzdWJqZWN0cyhzdWJqZWN0TGlzdDogc3RyaW5nW10pIHtcbiAgICAgICAgLy8gVE9ETzogY2hlY2sgZm9yIG5vbiBleGlzdGluZyBmcm9tIGZpbGVzXG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2Fybignc2V0IHN1YmplY3RzLCBEUllSVU4uIHJldHVybmluZycpXG4gICAgICAgIH1cbiAgICAgICAgc3ViamVjdExpc3QucHVzaCh0aGlzLnRlc3Quc3ViamVjdCk7XG4gICAgICAgIHN1YmplY3RMaXN0LnB1c2godGhpcy5leGFtLnN1YmplY3QpO1xuICAgICAgICBjb25zdCBzdWJqZWN0cyA9IFsgLi4ubmV3IFNldChzdWJqZWN0TGlzdCkgXS5maWx0ZXIoc3ViaiA9PiBib29sKHN1YmopKTtcbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3RzJywgc3ViamVjdHMpO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLy8gZ2V0IGRldigpOiB7IFtLIGluIGtleW9mIERldk9wdGlvbnNdOiBEZXZPcHRpb25zW0tdIGV4dGVuZHMgb2JqZWN0ID8geyBbU0sgaW4ga2V5b2YgRGV2T3B0aW9uc1tLXV06ICgpID0+IERldk9wdGlvbnNbS11bU0tdIH0gOiAoKSA9PiBEZXZPcHRpb25zW0tdIH0ge1xuICAgIGdldCBkZXYoKTogeyBbSyBpbiBrZXlvZiBEZXZPcHRpb25zXTogKHdoZXJlPzogc3RyaW5nKSA9PiBEZXZPcHRpb25zW0tdIH0ge1xuICAgICAgICBjb25zdCBfZGV2ID0gdGhpcy5nZXQoJ2RldicpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaGFuZGxlQm9vbGVhbiA9IDxLIGV4dGVuZHMga2V5b2YgRGV2T3B0aW9ucz4oa2V5OiBLLCB3aGVyZSk6IERldk9wdGlvbnNbS10gPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJylba2V5XTtcbiAgICAgICAgICAgIGlmICggdmFsdWUgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuJHtrZXl9ICR7d2hlcmV9YCk7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmb3JjZV9ub3Rlc19udW1iZXIgOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCBfZGV2ICkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmb3JjZV9ub3Rlc19udW1iZXIgPSB0aGlzLmdldCgnZGV2b3B0aW9ucycpLmZvcmNlX25vdGVzX251bWJlcjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBmb3JjZV9ub3Rlc19udW1iZXIgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuZm9yY2Vfbm90ZXNfbnVtYmVyOiAke2ZvcmNlX25vdGVzX251bWJlcn1gKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZvcmNlX25vdGVzX251bWJlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZm9yY2VfcGxheWJhY2tfcmF0ZSA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIF9kZXYgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZvcmNlX3BsYXliYWNrX3JhdGUgPSB0aGlzLmdldCgnZGV2b3B0aW9ucycpLmZvcmNlX3BsYXliYWNrX3JhdGU7XG4gICAgICAgICAgICAgICAgICAgIGlmICggZm9yY2VfcGxheWJhY2tfcmF0ZSApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5mb3JjZV9wbGF5YmFja19yYXRlOiAke2ZvcmNlX3BsYXliYWNrX3JhdGV9YCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmb3JjZV9wbGF5YmFja19yYXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNpbXVsYXRlX3Rlc3RfbW9kZSA6ICh3aGVyZT86IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVCb29sZWFuKFwic2ltdWxhdGVfdGVzdF9tb2RlXCIsIHdoZXJlKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zdCBzaW11bGF0ZV90ZXN0X21vZGUgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2ltdWxhdGVfdGVzdF9tb2RlO1xuICAgICAgICAgICAgICAgIC8vIGlmICggc2ltdWxhdGVfdGVzdF9tb2RlICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNpbXVsYXRlX3Rlc3RfbW9kZSAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIC8vIHJldHVybiBzaW11bGF0ZV90ZXN0X21vZGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaW11bGF0ZV9hbmltYXRpb25fbW9kZSA6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVCb29sZWFuKFwic2ltdWxhdGVfYW5pbWF0aW9uX21vZGVcIiwgd2hlcmUpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnN0IHNpbXVsYXRlX2FuaW1hdGlvbl9tb2RlID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLnNpbXVsYXRlX2FuaW1hdGlvbl9tb2RlO1xuICAgICAgICAgICAgICAgIC8vIGlmICggc2ltdWxhdGVfYW5pbWF0aW9uX21vZGUgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2ltdWxhdGVfYW5pbWF0aW9uX21vZGUgJHt3aGVyZX1gKTtcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gc2ltdWxhdGVfYW5pbWF0aW9uX21vZGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaW11bGF0ZV92aWRlb19tb2RlIDogKHdoZXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2ltdWxhdGVfdmlkZW9fbW9kZSA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5zaW11bGF0ZV92aWRlb19tb2RlO1xuICAgICAgICAgICAgICAgIGlmICggc2ltdWxhdGVfdmlkZW9fbW9kZSApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5zaW11bGF0ZV92aWRlb19tb2RlICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNpbXVsYXRlX3ZpZGVvX21vZGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBza2lwX2ZhZGUgOiAod2hlcmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwX2ZhZGUgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9mYWRlO1xuICAgICAgICAgICAgICAgIGlmICggc2tpcF9mYWRlICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNraXBfZmFkZSAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX2ZhZGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBtdXRlX2FuaW1hdGlvbiA6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG11dGVfYW5pbWF0aW9uID0gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucycpLm11dGVfYW5pbWF0aW9uO1xuICAgICAgICAgICAgICAgIGlmICggbXV0ZV9hbmltYXRpb24gKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMubXV0ZV9hbmltYXRpb24gJHt3aGVyZX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbXV0ZV9hbmltYXRpb247XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2tpcF9taWRpX2V4aXN0c19jaGVjayA6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfbWlkaV9leGlzdHNfY2hlY2sgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9taWRpX2V4aXN0c19jaGVjaztcbiAgICAgICAgICAgICAgICBpZiAoIHNraXBfbWlkaV9leGlzdHNfY2hlY2sgKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF9taWRpX2V4aXN0c19jaGVjayAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX21pZGlfZXhpc3RzX2NoZWNrO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNraXBfZXhwZXJpbWVudF9pbnRybyA6ICh3aGVyZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNraXBfZXhwZXJpbWVudF9pbnRybyA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX2V4cGVyaW1lbnRfaW50cm87XG4gICAgICAgICAgICAgICAgaWYgKCBza2lwX2V4cGVyaW1lbnRfaW50cm8gKSBjb25zb2xlLndhcm4oYGRldm9wdGlvbnMuc2tpcF9leHBlcmltZW50X2ludHJvICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfZXhwZXJpbWVudF9pbnRybztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBza2lwX2xldmVsX2ludHJvIDogKHdoZXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpcF9sZXZlbF9pbnRybyA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX2xldmVsX2ludHJvO1xuICAgICAgICAgICAgICAgIGlmICggc2tpcF9sZXZlbF9pbnRybyApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5za2lwX2xldmVsX2ludHJvICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfbGV2ZWxfaW50cm87XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2sgOiAod2hlcmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjayA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5za2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjaztcbiAgICAgICAgICAgICAgICBpZiAoIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrICkgY29uc29sZS53YXJuKGBkZXZvcHRpb25zLnNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNraXBfcGFzc2VkX3RyaWFsX2ZlZWRiYWNrO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrIDogKHdoZXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2sgPSBfZGV2ICYmIHRoaXMuZ2V0KCdkZXZvcHRpb25zJykuc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2s7XG4gICAgICAgICAgICAgICAgaWYgKCBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5za2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjayAke3doZXJlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBza2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjaztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBub19yZWxvYWRfb25fc3VibWl0IDogKHdoZXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9fcmVsb2FkX29uX3N1Ym1pdCA9IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMnKS5ub19yZWxvYWRfb25fc3VibWl0O1xuICAgICAgICAgICAgICAgIGlmICggbm9fcmVsb2FkX29uX3N1Ym1pdCApIGNvbnNvbGUud2FybihgZGV2b3B0aW9ucy5ub19yZWxvYWRfb25fc3VibWl0ICR7d2hlcmV9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vX3JlbG9hZF9vbl9zdWJtaXQ7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBnZXQgdmVsb2NpdGllcygpIHtcbiAgICAgICAgcmV0dXJuIHRyeUdldEZyb21DYWNoZSh0aGlzLCBcInZlbG9jaXRpZXNcIilcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgc2V0IHZlbG9jaXRpZXModmFsOiBudW1iZXIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGZsb29yZWQgPSBNYXRoLmZsb29yKHZhbCk7XG4gICAgICAgICAgICBpZiAoIGlzTmFOKGZsb29yZWQpICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IHZlbG9jaXRpZXMsIE1hdGguZmxvb3IodmFsKSBpcyBOYU46YCwgeyB2YWwsIGZsb29yZWQgfSwgJy4gbm90IHNldHRpbmcnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCBmbG9vcmVkID49IDEgJiYgZmxvb3JlZCA8PSAxNiApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXQoJ3ZlbG9jaXRpZXMnLCBmbG9vcmVkKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWNoZS52ZWxvY2l0aWVzID0gZmxvb3JlZDtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgdmVsb2NpdGllcywgYmFkIHJhbmdlOiAke3ZhbH0uIG5vdCBzZXR0aW5nYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IHZlbG9jaXRpZXMsIEV4Y2VwdGlvbiB3aGVuIHRyeWluZyB0byBNYXRoLmZsb29yKHZhbCk6YCwgZSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgU3ViY29uZmlnIGV4dGVuZHMgQ29uZjxJU3ViY29uZmlnPiB7IC8vIEFLQSBDb25maWdcbiAgICBwcml2YXRlIHJlYWRvbmx5IHR5cGU6IEV4cGVyaW1lbnRUeXBlO1xuICAgIHJlYWRvbmx5IGNhY2hlOiBQYXJ0aWFsPElTdWJjb25maWc+O1xuICAgIHRydXRoOiBUcnV0aDtcbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBAcGFyYW0gbmFtZVdpdGhFeHQgLSBzZXRzIHRoZSBgbmFtZWAgZmllbGQgaW4gZmlsZVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG5hbWVXaXRoRXh0OiBzdHJpbmcsIHN1YmNvbmZpZz86IFN1YmNvbmZpZykge1xuICAgICAgICBcbiAgICAgICAgbGV0IFsgZmlsZW5hbWUsIGV4dCBdID0gbXlmcy5zcGxpdF9leHQobmFtZVdpdGhFeHQpO1xuICAgICAgICBpZiAoICFbICcuZXhhbScsICcudGVzdCcgXS5pbmNsdWRlcyhleHQpICkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTdWJjb25maWcgY3RvciAoJHtuYW1lV2l0aEV4dH0pIGhhcyBiYWQgb3Igbm8gZXh0ZW5zaW9uYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHlwZSA9IGV4dC5zbGljZSgxKSBhcyBFeHBlcmltZW50VHlwZTtcbiAgICAgICAgbGV0IGRlZmF1bHRzO1xuICAgICAgICBpZiAoIGJvb2woc3ViY29uZmlnKSApIHtcbiAgICAgICAgICAgIGlmICggc3ViY29uZmlnLnN0b3JlICkge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRzID0geyAuLi5zdWJjb25maWcuc3RvcmUsIG5hbWUgOiBuYW1lV2l0aEV4dCB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0cyA9IHN1YmNvbmZpZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlZmF1bHRzID0geyBuYW1lIDogbmFtZVdpdGhFeHQgfTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICBmaWxlRXh0ZW5zaW9uIDogdHlwZSxcbiAgICAgICAgICAgIGN3ZCA6IENPTkZJR1NfUEFUSF9BQlMsXG4gICAgICAgICAgICBjb25maWdOYW1lIDogZmlsZW5hbWUsXG4gICAgICAgICAgICBkZWZhdWx0c1xuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5jYWNoZSA9IHsgbmFtZSA6IG5hbWVXaXRoRXh0IH07XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIGlmICggYm9vbChzdWJjb25maWcpICkge1xuICAgICAgICAgICAgdGhpcy5zZXQoeyAuLi5zdWJjb25maWcuc3RvcmUsIG5hbWUgOiBuYW1lV2l0aEV4dCB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnRydXRoID0gbmV3IFRydXRoKG15ZnMucmVtb3ZlX2V4dCh0aGlzLnRydXRoX2ZpbGUpKTtcbiAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBTdWJjb25maWcgY29uc3RydWN0b3IsIGluaXRpYWxpemluZyBuZXcgVHJ1dGggZnJvbSB0aGlzLnRydXRoX2ZpbGUgdGhyZXcgYW4gZXJyb3IuIFByb2JhYmx5IGJlY2F1c2UgdGhpcy50cnV0aF9maWxlIGlzIHVuZGVmaW5lZC4gU2hvdWxkIG1heWJlIG5lc3QgdW5kZXIgaWYoc3ViY29uZmlnKSBjbGF1c2VgLCBcInRoaXMudHJ1dGhfZmlsZVwiLCB0aGlzLnRydXRoX2ZpbGUsIGUpXG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgc3RhdGljIHZhbGlkYXRlTmFtZShuYW1lV2l0aEV4dDogc3RyaW5nKSB7XG4gICAgICAgIGxldCBbIGZpbGVuYW1lLCBleHQgXSA9IG15ZnMuc3BsaXRfZXh0KG5hbWVXaXRoRXh0KTtcbiAgICAgICAgaWYgKCAhWyAnLmV4YW0nLCAnLnRlc3QnIF0uaW5jbHVkZXMoZXh0KSApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXh0ZW5zaW9uRXJyb3JgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIG5hbWVXaXRoRXh0ICE9PSBgJHtmaWxlbmFtZX0ke2V4dH1gICkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCYXNlbmFtZUVycm9yJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgYXN5bmMgZG9UcnV0aEZpbGVDaGVjaygpOiBQcm9taXNlPFN3ZWV0QWxlcnRSZXN1bHQ+IHtcbiAgICAgICAgY29uc29sZS5sb2coYPCfkr4gU3ViY29uZmlnKCR7dGhpcy50eXBlfSkuZG9UcnV0aEZpbGVDaGVjaygpYCk7XG4gICAgICAgIFxuICAgICAgICAvLyBjb25zdCB0cnV0aCA9IHRoaXMuZ2V0VHJ1dGgoKTtcbiAgICAgICAgaWYgKCB0aGlzLnRydXRoLnR4dC5hbGxFeGlzdCgpICkge1xuICAgICAgICAgICAgcmV0dXJuIEFsZXJ0LnNtYWxsLnN1Y2Nlc3MoYCR7dGhpcy50cnV0aC5uYW1lfS50eHQsICpfb24udHh0LCBhbmQgKl9vZmYudHh0IGZpbGVzIGV4aXN0LmApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFsnZnVyX2VsaXNlX0InIHggMywgJ2Z1cl9lbGlzZV9SLnR4dCcgeCAzLCAuLi5dXG4gICAgICAgIGNvbnN0IHRydXRoc1dpdGgzVHh0RmlsZXMgPSBnZXRUcnV0aHNXaXRoM1R4dEZpbGVzKCk7XG4gICAgICAgIGlmICggIWJvb2wodHJ1dGhzV2l0aDNUeHRGaWxlcykgKVxuICAgICAgICAgICAgcmV0dXJuIEFsZXJ0LmJpZy53YXJuaW5nKHtcbiAgICAgICAgICAgICAgICB0aXRsZSA6ICdObyB2YWxpZCB0cnV0aCBmaWxlcyBmb3VuZCcsXG4gICAgICAgICAgICAgICAgaHRtbCA6ICdUaGVyZSBuZWVkcyB0byBiZSBhdCBsZWFzdCBvbmUgdHh0IGZpbGUgd2l0aCBvbmUgXCJvblwiIGFuZCBvbmUgXCJvZmZcIiBjb3VudGVycGFydHMuJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIEFsZXJ0LmJpZy5ibG9ja2luZyh7XG4gICAgICAgICAgICB0aXRsZSA6IGBEaWRuJ3QgZmluZCBhbGwgdGhyZWUgLnR4dCBmaWxlcyBmb3IgJHt0aGlzLnRydXRoLm5hbWV9YCxcbiAgICAgICAgICAgIGh0bWwgOiAnVGhlIGZvbGxvd2luZyB0cnV0aHMgYWxsIGhhdmUgMyB0eHQgZmlsZXMuIFBsZWFzZSBjaG9vc2Ugb25lIG9mIHRoZW0sIG9yIGZpeCB0aGUgZmlsZXMgYW5kIHJlbG9hZC4nLFxuICAgICAgICAgICAgc2hvd0Nsb3NlQnV0dG9uIDogdHJ1ZSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgc3RyaW5ncyA6IHRydXRoc1dpdGgzVHh0RmlsZXMsXG4gICAgICAgICAgICBjbGlja0ZuIDogZWwgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IGNvbmZpZyA9IHRoaXMuY29uZmlnKHRoaXMuZXhwZXJpbWVudF90eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maW5pc2hlZF90cmlhbHNfY291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxldmVscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRydXRoX2ZpbGUgPSBlbC50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMudHJ1dGhfZmlsZV9wYXRoID0gbmV3IFRydXRoKGVsLnRleHQoKSk7XG4gICAgICAgICAgICAgICAgICAgIHJlbG9hZFBhZ2UoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoICggZXJyICkge1xuICAgICAgICAgICAgICAgICAgICBBbGVydC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICBBbGVydC5iaWcuZXJyb3IoeyB0aXRsZSA6IGVyci5tZXNzYWdlLCBodG1sIDogJ1NvbWV0aGluZyBoYXBwZW5lZC4nIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGluY3JlYXNlKEs6IGtleW9mIElTdWJjb25maWcpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGB1c2VkIHN1YmNvbmZpZy5pbmNyZWFzZSwgVU5URVNURURgKTtcbiAgICAgICAgaWYgKCBEUllSVU4gKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdpbmNyZWFzZSwgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBWID09PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgMSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdHlwZW9mViA9IHR5cGVvZiBWO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgaWYgKCB0eXBlb2ZWID09PSAnbnVtYmVyJyB8fCAodHlwZW9mViA9PT0gJ3N0cmluZycgJiYgVi5pc2RpZ2l0KCkpICkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICB0aGlzLnNldChLLCBNYXRoLmZsb29yKFYpICsgMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkJpZ0NvbmZpZ0NscyB0cmllZCB0byBpbmNyZWFzZSBhIHZhbHVlIHRoYXQgaXMgbm90IGEgbnVtYmVyIG5vciBhIHN0cmluZy5pc2RpZ2l0KClcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHRvSHRtbCgpOiBzdHJpbmcge1xuICAgICAgICBsZXQgbGV2ZWxzID0gdGhpcy5sZXZlbHM7XG4gICAgICAgIGxldCBsZXZlbHNIdG1sID0gYFxuICAgICAgICA8dGFibGUgY2xhc3M9XCJzdWJjb25maWctaHRtbFwiPlxuICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgIDx0aD5MZXZlbCAjPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+Tm90ZXM8L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5UcmlhbHM8L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5SaHl0aG08L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5UZW1wbzwvdGg+XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICBgO1xuICAgICAgICBmb3IgKCBsZXQgWyBpLCBsdmwgXSBvZiBlbnVtZXJhdGUobGV2ZWxzKSApIHtcbiAgICAgICAgICAgIGxldmVsc0h0bWwgKz0gYFxuICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgIDx0ZD4ke2kgKyAxfTwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkPiR7bHZsLm5vdGVzfTwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkPiR7bHZsLnRyaWFsc308L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD4ke2x2bC5yaHl0aG19PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQ+JHtsdmwudGVtcG99PC90ZD5cbiAgICAgICAgICAgIDwvdHI+YFxuICAgICAgICB9XG4gICAgICAgIGxldmVsc0h0bWwgKz0gYDwvdGFibGU+YDtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cInN1YmNvbmZpZy1odG1sXCI+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGg+S2V5PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPlZhbHVlPC90aD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRkPkFsbG93ZWQgcmh5dGhtIGRldmlhdGlvbjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3RoaXMuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9ufTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD5BbGxvd2VkIHRlbXBvIGRldmlhdGlvbjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3RoaXMuYWxsb3dlZF90ZW1wb19kZXZpYXRpb259PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRkPkRlbW8gdHlwZTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3RoaXMuZGVtb190eXBlfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD5FcnJvcnMgcGxheSByYXRlPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPiR7dGhpcy5lcnJvcnNfcGxheXJhdGV9PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRkPkZpbmlzaGVkIHRyaWFscyBjb3VudDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3RoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50fTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD5OYW1lPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPiR7dGhpcy5uYW1lfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD5TdWJqZWN0PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPiR7dGhpcy5zdWJqZWN0fTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD5UcnV0aCBmaWxlPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPiR7dGhpcy50cnV0aF9maWxlfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIDwvdGFibGU+XG5cbiAgICAgICAgICAgICR7bGV2ZWxzSHRtbH1cbiAgICAgICAgICAgIGA7XG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICB0b09iaigpOiBPbWl0PElTdWJjb25maWcsIFwibmFtZVwiPiB7IC8vIEFLQSB0b1NhdmVkQ29uZmlnXG4gICAgICAgIFxuICAgICAgICBjb25zdCBvYmogPSB0aGlzLnN0b3JlO1xuICAgICAgICBkZWxldGUgb2JqLm5hbWU7XG4gICAgICAgIHJldHVybiBvYmpcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBmcm9tU3ViY29uZmlnKHN1YmNvbmZpZzogU3ViY29uZmlnKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkgcmV0dXJuIGNvbnNvbGUud2FybignZnJvbU9iaiwgRFJZUlVOLiByZXR1cm5pbmcnKTtcbiAgICAgICAgLy8gdGhpcy5zZXQoc3ViY29uZmlnLnRvT2JqKCkpO1xuICAgICAgICAvLyB0aGlzLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbiA9IHN1YmNvbmZpZy5hbGxvd2VkX3JoeXRobV9kZXZpYXRpb247XG4gICAgICAgIC8vIHRoaXMuYWxsb3dlZF90ZW1wb19kZXZpYXRpb24gPSBzdWJjb25maWcuYWxsb3dlZF90ZW1wb19kZXZpYXRpb247XG4gICAgICAgIC8vIHRoaXMuZGVtb190eXBlID0gc3ViY29uZmlnLmRlbW9fdHlwZTtcbiAgICAgICAgLy8gdGhpcy5lcnJvcnNfcGxheXJhdGUgPSBzdWJjb25maWcuZXJyb3JzX3BsYXlyYXRlO1xuICAgICAgICAvLyB0aGlzLmZpbmlzaGVkX3RyaWFsc19jb3VudCA9IHN1YmNvbmZpZy5maW5pc2hlZF90cmlhbHNfY291bnQ7XG4gICAgICAgIC8vIHRoaXMubGV2ZWxzID0gc3ViY29uZmlnLmxldmVscztcbiAgICAgICAgLy8gdGhpcy5zdWJqZWN0ID0gc3ViY29uZmlnLnN1YmplY3Q7XG4gICAgICAgIC8vIHRoaXMudHJ1dGhfZmlsZSA9IHN1YmNvbmZpZy50cnV0aF9maWxlO1xuICAgICAgICAvLyB0aGlzLl91cGRhdGVTYXZlZEZpbGUoJ3RydXRoX2ZpbGVfcGF0aCcsIGNmZ0ZpbGUudHJ1dGhfZmlsZV9wYXRoKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQGRlcHJlY2F0ZWQqL1xuICAgIHByaXZhdGUgX3VwZGF0ZVNhdmVkRmlsZShrZXk6IGtleW9mIElTdWJjb25maWcsIHZhbHVlKSB7XG4gICAgICAgIGlmICggRFJZUlVOICkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignX3VwZGF0ZVNhdmVkRmlsZSwgRFJZUlVOLiByZXR1cm5pbmcnKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ191cGRhdGVTYXZlZEZpbGUoKSBkb2VzIG5vdGhpbmcsIHJldHVybmluZycpO1xuICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgLypjb25zdCBjb25mID0gbmV3IChyZXF1aXJlKCdjb25mJykpKHtcbiAgICAgICAgIGN3ZCA6IENPTkZJR1NfUEFUSF9BQlMsXG4gICAgICAgICBjb25maWdOYW1lIDogdGhpcy5uYW1lLFxuICAgICAgICAgZmlsZUV4dGVuc2lvbiA6IHRoaXMudHlwZSxcbiAgICAgICAgIHNlcmlhbGl6ZSA6IHZhbHVlID0+IEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCA0KVxuICAgICAgICAgfSk7XG4gICAgICAgICBjb25mLnNldChrZXksIHZhbHVlKTsqL1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBwcml2YXRlIHNldERldmlhdGlvbihkZXZpYXRpb25UeXBlOiBEZXZpYXRpb25UeXBlLCBkZXZpYXRpb246IHN0cmluZykge1xuICAgICAgICBjb25zdCB0eXBlb2ZEZXZpYXRpb24gPSB0eXBlb2YgZGV2aWF0aW9uO1xuICAgICAgICBpZiAoIHR5cGVvZkRldmlhdGlvbiA9PT0gJ251bWJlcicgKSB7XG4gICAgICAgICAgICBkZXZpYXRpb24gPSBgJHtkZXZpYXRpb259JWA7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldERldmlhdGlvbiBnb3QgXCJkZXZpYXRpb25cIiB0eXBlIG51bWJlci4gYXBwZW5kZWQgXCIlXCIuIGRldmlhdGlvbiBub3c6ICR7ZGV2aWF0aW9ufWApO1xuICAgICAgICB9IGVsc2UgaWYgKCB0eXBlb2ZEZXZpYXRpb24gPT09ICdzdHJpbmcnICkge1xuICAgICAgICAgICAgaWYgKCAhZGV2aWF0aW9uLmVuZHNXaXRoKFwiJVwiKSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYHNldERldmlhdGlvbiBnb3QgZGV2aWF0aW9uIHdpdGhvdXQgJS4gYXBwZW5kZWQgJS4gZGV2aWF0aW9uIG5vdzogXCIke2RldmlhdGlvbn1cImApO1xuICAgICAgICAgICAgICAgIGRldmlhdGlvbiA9IGAke2RldmlhdGlvbn0lYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0RGV2aWF0aW9uLCByZWNlaXZlZCBcImRldmlhdGlvblwiIG5vdCBzdHJpbmcgbm90IG51bWJlci4gcmV0dXJuaW5nLiBkZXZpYXRpb246YCwgZGV2aWF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB0aGlzLnNldChgYWxsb3dlZF8ke2RldmlhdGlvblR5cGV9X2RldmlhdGlvbmAsIGRldmlhdGlvbik7XG4gICAgICAgIHRoaXMuY2FjaGVbYGFsbG93ZWRfJHtkZXZpYXRpb25UeXBlfV9kZXZpYXRpb25gXSA9IGRldmlhdGlvbjtcbiAgICB9XG4gICAgXG4gICAgLyoqQGNhY2hlZCovXG4gICAgZ2V0IGFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJhbGxvd2VkX3RlbXBvX2RldmlhdGlvblwiKVxuICAgICAgICAvKmlmICggdGhpcy5jYWNoZS5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgY29uc3QgYWxsb3dlZFRlbXBvRGV2aWF0aW9uID0gdGhpcy5nZXQoJ2FsbG93ZWRfdGVtcG9fZGV2aWF0aW9uJyk7XG4gICAgICAgICB0aGlzLmNhY2hlLmFsbG93ZWRfdGVtcG9fZGV2aWF0aW9uID0gYWxsb3dlZFRlbXBvRGV2aWF0aW9uO1xuICAgICAgICAgcmV0dXJuIGFsbG93ZWRUZW1wb0RldmlhdGlvbjtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5hbGxvd2VkX3RlbXBvX2RldmlhdGlvbjtcbiAgICAgICAgIH0qL1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgYWxsb3dlZF90ZW1wb19kZXZpYXRpb24oZGV2aWF0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXREZXZpYXRpb24oXCJ0ZW1wb1wiLCBkZXZpYXRpb24pO1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBnZXQgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgXCJhbGxvd2VkX3JoeXRobV9kZXZpYXRpb25cIik7XG4gICAgICAgIC8qaWYgKCB0aGlzLmNhY2hlLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbiA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgY29uc3QgYWxsb3dlZFJoeXRobURldmlhdGlvbiA9IHRoaXMuZ2V0KCdhbGxvd2VkX3JoeXRobV9kZXZpYXRpb24nKTtcbiAgICAgICAgIHRoaXMuY2FjaGUuYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uID0gYWxsb3dlZFJoeXRobURldmlhdGlvbjtcbiAgICAgICAgIHJldHVybiBhbGxvd2VkUmh5dGhtRGV2aWF0aW9uO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlLmFsbG93ZWRfcmh5dGhtX2RldmlhdGlvbjtcbiAgICAgICAgIH0qL1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgYWxsb3dlZF9yaHl0aG1fZGV2aWF0aW9uKGRldmlhdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0RGV2aWF0aW9uKFwicmh5dGhtXCIsIGRldmlhdGlvbik7XG4gICAgfVxuICAgIFxuICAgIC8qKkBjYWNoZWQqL1xuICAgIGdldCBkZW1vX3R5cGUoKTogRGVtb1R5cGUge1xuICAgICAgICByZXR1cm4gdHJ5R2V0RnJvbUNhY2hlKHRoaXMsIFwiZGVtb190eXBlXCIpO1xuICAgICAgICAvLyByZXR1cm4gdGhpcy5nZXQoJ2RlbW9fdHlwZScpO1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkKi9cbiAgICBzZXQgZGVtb190eXBlKHR5cGU6IERlbW9UeXBlKSB7XG4gICAgICAgIGlmICggIVsgJ3ZpZGVvJywgJ2FuaW1hdGlvbicgXS5pbmNsdWRlcyh0eXBlKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQ29uZmlnIGRlbW9fdHlwZSBzZXR0ZXIsIGJhZCB0eXBlID0gJHt0eXBlfSwgY2FuIGJlIGVpdGhlciB2aWRlbyBvciBhbmltYXRpb24uIE5vdCBzZXR0aW5nYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZGVtb190eXBlJywgdHlwZSk7XG4gICAgICAgICAgICB0aGlzLmNhY2hlLmRlbW9fdHlwZSA9IHR5cGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZ2V0IGVycm9yc19wbGF5cmF0ZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2Vycm9yc19wbGF5cmF0ZScpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZXJyb3JzX3BsYXlyYXRlKHNwZWVkOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCBpc05hTihzcGVlZCkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYGNvbmZpZyBzZXQgZXJyb3JzX3BsYXlyYXRlLCByZWNlaXZlZCBiYWQgXCJzcGVlZFwiIE5hTjogJHtzcGVlZH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdlcnJvcnNfcGxheXJhdGUnLCBzcGVlZCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGdldCBmaW5pc2hlZF90cmlhbHNfY291bnQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdmaW5pc2hlZF90cmlhbHNfY291bnQnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IGZpbmlzaGVkX3RyaWFsc19jb3VudChjb3VudDogbnVtYmVyKSB7XG4gICAgICAgIGlmICggaXNOYU4oY291bnQpIHx8IGNvdW50IDwgMCApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgY29uZmlnIHNldCBmaW5pc2hlZF90cmlhbHNfY291bnQsIHJlY2VpdmVkIGJhZCBcImNvdW50XCI6ICR7Y291bnR9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldCgnZmluaXNoZWRfdHJpYWxzX2NvdW50JywgY291bnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKk5hbWUgb2YgY29uZmlnIGZpbGUsIGluY2x1ZGluZyBleHRlbnNpb24uIEFsd2F5cyByZXR1cm5zIGBuYW1lYCBmcm9tIGNhY2hlLiBUaGlzIGlzIGJlY2F1c2UgdGhlcmUncyBubyBzZXR0ZXI7IGBuYW1lYCBpcyBzdG9yZWQgaW4gY2FjaGUgYXQgY29uc3RydWN0b3IuKi9cbiAgICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5uYW1lO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBnZXQgc3ViamVjdCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ3N1YmplY3QnKTtcbiAgICB9XG4gICAgXG4gICAgc2V0IHN1YmplY3QobmFtZTogc3RyaW5nIHwgbnVsbCkge1xuICAgICAgICBpZiAoIERSWVJVTiApIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ3NldCBzdWJqZWN0LCBEUllSVU4uIFJldHVybmluZycpO1xuICAgICAgICB9XG4gICAgICAgIGlmICggIWJvb2wobmFtZSkgKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKGBzZXQgc3ViamVjdCwgIWJvb2wobmFtZSk6ICR7bmFtZX0uIFJldHVybmluZ2ApXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3QnLCBuYW1lKTtcbiAgICAgICAgY29uc3QgR2xvYiA9IHJlcXVpcmUoJy4uL0dsb2InKS5kZWZhdWx0O1xuICAgICAgICBjb25zdCBleGlzdGluZ1N1YmplY3RzID0gR2xvYi5CaWdDb25maWcuc3ViamVjdHMuZmlsdGVyKHN1YmogPT4gYm9vbChzdWJqKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgZXhpc3RpbmdTdWJqZWN0cyB9KTtcbiAgICAgICAgR2xvYi5CaWdDb25maWcuc3ViamVjdHMgPSBbIC4uLm5ldyBTZXQoWyAuLi5leGlzdGluZ1N1YmplY3RzLCBuYW1lIF0pIF07XG4gICAgICAgIC8vIHN1cGVyLnNldCgnc3ViamVjdHMnLCBbLi4ubmV3IFNldChbLi4uc3VwZXIuZ2V0KCdzdWJqZWN0cycpLCBuYW1lXSldKTtcbiAgICAgICAgLy8gc3VwZXIuc3ViamVjdHMgPSBbIC4uLnN1cGVyLmdldCgnc3ViamVjdHMnKSwgbmFtZSBdO1xuICAgIH1cbiAgICBcbiAgICAvKipAY2FjaGVkXG4gICAgICogVHJ1dGggZmlsZSBuYW1lLCBubyBleHRlbnNpb24qL1xuICAgIGdldCB0cnV0aF9maWxlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0cnlHZXRGcm9tQ2FjaGUodGhpcywgJ3RydXRoX2ZpbGUnKTtcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuZ2V0KCd0cnV0aF9maWxlJylcbiAgICB9XG4gICAgXG4gICAgLyoqQWxzbyBzZXRzIHRoaXMudHJ1dGggKG1lbW9yeSlcbiAgICAgKiBAY2FjaGVkXG4gICAgICogQHBhcmFtIHRydXRoX2ZpbGUgLSBUcnV0aCBmaWxlIG5hbWUsIG5vIGV4dGVuc2lvbiovXG4gICAgc2V0IHRydXRoX2ZpbGUodHJ1dGhfZmlsZTogc3RyaW5nKSB7XG4gICAgICAgIC8vIHRydXRoX2ZpbGUgPSBwYXRoLmJhc2VuYW1lKHRydXRoX2ZpbGUpO1xuICAgICAgICBsZXQgWyBuYW1lLCBleHQgXSA9IG15ZnMuc3BsaXRfZXh0KHRydXRoX2ZpbGUpO1xuICAgICAgICBpZiAoIGJvb2woZXh0KSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgc2V0IHRydXRoX2ZpbGUsIHBhc3NlZCBuYW1lIGlzIG5vdCBleHRlbnNpb25sZXNzOiAke3RydXRoX2ZpbGV9LiBDb250aW51aW5nIHdpdGggXCIke25hbWV9XCJgKTtcbiAgICAgICAgICAgIC8vIG5hbWVOb0V4dCA9IG15ZnMucmVtb3ZlX2V4dChuYW1lTm9FeHQpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHRydXRoID0gbmV3IFRydXRoKG5hbWUpO1xuICAgICAgICAgICAgaWYgKCAhdHJ1dGgudHh0LmFsbEV4aXN0KCkgKSB7XG4gICAgICAgICAgICAgICAgQWxlcnQuc21hbGwud2FybmluZyhgTm90IGFsbCB0eHQgZmlsZXMgZXhpc3Q6ICR7bmFtZX1gKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50cnV0aCA9IHRydXRoO1xuICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIEFsZXJ0LnNtYWxsLndhcm5pbmcoZSk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oZSlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldChgdHJ1dGhfZmlsZWAsIG5hbWUpO1xuICAgICAgICB0aGlzLmNhY2hlLnRydXRoX2ZpbGUgPSBuYW1lO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIGdldCBsZXZlbHMoKTogSUxldmVsW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2xldmVscycpO1xuICAgIH1cbiAgICBcbiAgICBzZXQgbGV2ZWxzKGxldmVsczogSUxldmVsW10pIHtcbiAgICAgICAgaWYgKCAhQXJyYXkuaXNBcnJheShsZXZlbHMpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBzZXQgbGV2ZWxzLCByZWNlaXZlZCBcImxldmVsc1wiIG5vdCBpc0FycmF5LiBub3Qgc2V0dGluZyBhbnl0aGluZy4gbGV2ZWxzOiBgLCBsZXZlbHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVE9ETzogYmV0dGVyIGNoZWNrc1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2xldmVscycsIGxldmVscyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgXG4gICAgY3VycmVudFRyaWFsQ29vcmRzKCk6IFsgbnVtYmVyLCBudW1iZXIgXSB7XG4gICAgICAgIGxldCBmbGF0VHJpYWxzTGlzdCA9IHRoaXMubGV2ZWxzLm1hcChsZXZlbCA9PiBsZXZlbC50cmlhbHMpO1xuICAgICAgICBmb3IgKCBsZXQgWyBsZXZlbEluZGV4LCB0cmlhbHNOdW0gXSBvZiBlbnVtZXJhdGUoZmxhdFRyaWFsc0xpc3QpICkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgdHJpYWxTdW1Tb0ZhciA9IHN1bShmbGF0VHJpYWxzTGlzdC5zbGljZSgwLCBsZXZlbEluZGV4ICsgMSkpO1xuICAgICAgICAgICAgY29uc3QgZmluaXNoZWRUcmlhbHNDb3VudCA9IHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgICAgICAgICAgaWYgKCB0cmlhbFN1bVNvRmFyID4gZmluaXNoZWRUcmlhbHNDb3VudCApXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsgbGV2ZWxJbmRleCwgdHJpYWxzTnVtIC0gKHRyaWFsU3VtU29GYXIgLSBmaW5pc2hlZFRyaWFsc0NvdW50KSBdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUud2FybihcImN1cnJlbnRUcmlhbENvb3Jkczogb3V0IG9mIGluZGV4IGVycm9yXCIpO1xuICAgIH1cbiAgICBcbiAgICBpc0RlbW9WaWRlbygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVtb190eXBlID09PSAndmlkZW8nO1xuICAgIH1cbiAgICBcbiAgICBpc1dob2xlVGVzdE92ZXIoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBzdW0odGhpcy5sZXZlbHMubWFwKGxldmVsID0+IGxldmVsLnRyaWFscykpID09IHRoaXMuZmluaXNoZWRfdHJpYWxzX2NvdW50O1xuICAgIH1cbiAgICBcbiAgICBnZXRTdWJqZWN0RGlyTmFtZXMoKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gZnMucmVhZGRpclN5bmMoU1VCSkVDVFNfUEFUSF9BQlMpO1xuICAgIH1cbiAgICBcbiAgICBnZXRDdXJyZW50TGV2ZWwoKTogTGV2ZWwge1xuICAgICAgICBcbiAgICAgICAgbGV0IFsgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4IF0gPSB0aGlzLmN1cnJlbnRUcmlhbENvb3JkcygpO1xuICAgICAgICByZXR1cm4gbmV3IExldmVsKHRoaXMubGV2ZWxzW2xldmVsX2luZGV4XSwgbGV2ZWxfaW5kZXgsIHRyaWFsX2luZGV4KTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgZ2V0TGV2ZWxDb2xsZWN0aW9uKCk6IExldmVsQ29sbGVjdGlvbiB7XG4gICAgICAgIGxldCBbIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCBdID0gdGhpcy5jdXJyZW50VHJpYWxDb29yZHMoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBMZXZlbENvbGxlY3Rpb24odGhpcy5sZXZlbHMsIGxldmVsX2luZGV4LCB0cmlhbF9pbmRleCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkXG4gICAgICogR2V0cyB0aGUgY3VycmVudCB0cmlhbCdzIHBhdGggKGpvaW4gdGhpcy50ZXN0T3V0UGF0aCgpIGFuZCBsZXZlbF8ke2xldmVsX2luZGV4fS4uLiksIGFuZCByZXR1cm5zIGEgVHJ1dGggb2YgaXQqL1xuICAgIGNyZWF0ZVRydXRoRnJvbVRyaWFsUmVzdWx0KCk6IFRydXRoIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBUaGlzIHNob3VsZCBiZSBzb21ld2hlcmUgZWxzZWApO1xuICAgICAgICBsZXQgWyBsZXZlbF9pbmRleCwgdHJpYWxfaW5kZXggXSA9IHRoaXMuY3VycmVudFRyaWFsQ29vcmRzKCk7XG4gICAgICAgIC8vIHJldHVybiBuZXcgVHJ1dGgocGF0aC5qb2luKHRoaXMudGVzdE91dFBhdGgoKSwgYGxldmVsXyR7bGV2ZWxfaW5kZXh9X3RyaWFsXyR7dHJpYWxfaW5kZXh9YCkpO1xuICAgICAgICByZXR1cm4gbmV3IFRydXRoKHBhdGguam9pbih0aGlzLmV4cGVyaW1lbnRPdXREaXJBYnMoKSwgYGxldmVsXyR7bGV2ZWxfaW5kZXh9X3RyaWFsXyR7dHJpYWxfaW5kZXh9YCkpO1xuICAgIH1cbiAgICBcbiAgICAvKipcImM6XFxTeW5jXFxDb2RlXFxQeXRob25cXFB5YW5vLXJlbGVhc2VcXHNyY1xcZXhwZXJpbWVudHNcXHN1YmplY3RzXFxnaWxhZFxcZnVyX2VsaXNlXCIqL1xuICAgIGV4cGVyaW1lbnRPdXREaXJBYnMoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY3VyclN1YmplY3REaXIgPSBwYXRoLmpvaW4oU1VCSkVDVFNfUEFUSF9BQlMsIHRoaXMuc3ViamVjdCk7IC8vIFwiLi4uL3N1YmplY3RzL2dpbGFkXCJcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbihjdXJyU3ViamVjdERpciwgdGhpcy50cnV0aC5uYW1lKTtcbiAgICB9XG4gICAgXG4gICAgXG59XG4iXX0=