import * as Store from "electron-store";
import * as path from "path";
import * as fs from "fs";
import Alert from "../MyAlert";
import myfs from "../MyFs";
import { bool, reloadPage, sum, enumerate, all } from "../util";
import { Truth } from "../Truth";
import { ILevel, Level, LevelCollection } from "../Level";
import { SweetAlertResult } from "sweetalert2";
import * as Conf from 'conf';

console.log('src/BigConfig/index.ts');

export type ExperimentType = 'exam' | 'test';
export type DemoType = 'video' | 'animation';
export type PageName = "new" // AKA TLastPage
    | "running"
    | "record"
    | "file_tools"
    | "settings"
type DeviationType = 'rhythm' | 'tempo';


interface ISubconfig {
    allowed_rhythm_deviation: string,
    allowed_tempo_deviation: string,
    demo_type: DemoType,
    errors_playrate: number,
    finished_trials_count: number,
    name: string,
    subject: string,
    truth_file: string,
    levels: ILevel[],
}


interface DevOptions {
    max_animation_notes: null | number,
    mute_animation: boolean,
    skip_midi_exists_check: boolean,
    skip_whole_truth: boolean,
    skip_level_intro: boolean,
    skip_failed_trial_feedback: boolean,
    skip_passed_trial_feedback: boolean,
    reload_page_on_submit: boolean
}

interface IBigConfig {
    dev: boolean,
    devoptions: DevOptions,
    exam_file: string,
    test_file: string,
    experiment_type: ExperimentType,
    last_page: PageName,
    subjects: string[],
    velocities: number,
}

function tryGetFromCache<T extends keyof IBigConfig>(config: BigConfigCls, prop: T): IBigConfig[T]
function tryGetFromCache<T extends keyof ISubconfig>(config: Subconfig, prop: T): ISubconfig[T]
function tryGetFromCache(config, prop) {
    if ( config.cache[prop] === undefined ) {
        const propVal = config.get(prop);
        config.cache[prop] = propVal;
        return propVal;
    } else {
        return config.cache[prop];
    }
}

/**List of truth file names, no extension*/
export function getTruthFilesWhere({ extension }: { extension?: 'txt' | 'mid' | 'mp4' } = { extension : undefined }): string[] {
    if ( extension ) {
        if ( extension.startsWith('.') ) {
            // @ts-ignore
            extension = extension.slice(1);
        }
        if ( ![ 'txt', 'mid', 'mp4' ].includes(extension) ) {
            console.warn(`truthFilesList("${extension}"), must be either ['txt','mid','mp4'] or not at all. setting to undefined`);
            extension = undefined;
        }
    }
    
    // const truthsDirPath = this.truthsDirPath();
    
    let truthFiles = [ ...new Set(fs.readdirSync(TRUTHS_PATH_ABS)) ];
    let formattedTruthFiles = [];
    for ( let file of truthFiles ) {
        let [ name, ext ] = myfs.split_ext(file);
        if ( extension ) {
            if ( ext.lower() === `.${extension}` ) {
                formattedTruthFiles.push(name);
            }
        } else {
            formattedTruthFiles.push(name);
            
        }
    }
    return formattedTruthFiles
    
}

/**List of names of txt truth files that have their whole "triplet" in tact. no extension*/
export function getTruthsWith3TxtFiles(): string[] {
    const txtFilesList = getTruthFilesWhere({ extension : 'txt' });
    const wholeTxtFiles = [];
    for ( let name of txtFilesList ) {
        if ( txtFilesList.count(txt => txt.startsWith(name)) >= 3 ) {
            wholeTxtFiles.push(name);
        }
    }
    return txtFilesList.filter(a => txtFilesList.filter(txt => txt.startsWith(a)).length >= 3);
}

export class BigConfigCls extends Store<IBigConfig> {
    test: Subconfig;
    exam: Subconfig;
    readonly cache: Partial<IBigConfig>;
    
    constructor(_doTruthFileCheck = true) {
        super();
        this.cache = {};
        if ( DRYRUN ) {
            this.set = (...args) => console.warn(`DRYRUN, set: `, args)
        }
        let testNameWithExt = this.test_file;
        let examNameWithExt = this.exam_file;
        if ( !all(testNameWithExt, examNameWithExt) ) {
            console.warn(`BigConfigCls ctor, couldnt get test_file and/or exam_file from json:`, {
                testNameWithExt,
                examNameWithExt
            }, ', defaulting to "fur_elise_B.[ext]"');
            testNameWithExt = 'fur_elise_B.test';
            examNameWithExt = 'fur_elise_B.exam';
        }
        this.setSubconfig(testNameWithExt);
        this.setSubconfig(examNameWithExt);
        // this.test = new Subconfig(testNameWithExt);
        // this.exam = new Subconfig(examNameWithExt);
        this.subjects = this.subjects; // to ensure having subconfig's subjects
        if ( _doTruthFileCheck ) {
            try {
                this.test.doTruthFileCheck()
                    .then(swal => {
                            this.exam.doTruthFileCheck()
                        }
                    );
            } catch ( e ) {
                console.error(`BigConfigCls ctor, error when _doTruthFileCheck:`, e);
                Alert.big.oneButton(`An error occured when running a truth files check. You should try to understand the problem before continuing`, { text : e.message })
            }
        }
    }
    
    
    /**@deprecated*/
    fromSavedConfig(savedConfig: ISubconfig, experimentType: ExperimentType) {
        return console.warn('BigConfigCls used fromSavedConfig. Impossible to load big file. Returning');
        /*if ( DRYRUN ) return console.log(`fromSavedConfig, DRYRUN`);
         const truthFileName = path.basename(savedConfig.truth_file_path, '.txt');
         // @ts-ignore
         this.truth_file_path = new Truth(path.join(TRUTHS_PATH_ABS, truthFileName));
         this.experiment_type = experimentType;
         this.config(experimentType).fromSavedConfig(savedConfig);*/
    }
    
    
    /**@example
     update('subjects', [names])
     */
    update(K: keyof IBigConfig, kvPairs: Partial<IBigConfig>)
    update(K: keyof IBigConfig, values: any[])
    update(K, kv) {
        if ( DRYRUN ) {
            return console.warn('BigConfig.update() DRYRUN. returning');
        }
        let V = this.get(K);
        if ( Array.isArray(V) ) {
            let newValue: any[] = V;
            if ( Array.isArray(kv) ) {
                newValue.push(...kv);
            } else {
                newValue.push(kv);
            }
            this.set(K, newValue);
        } else {
            Object.assign(V, kv);
            this.set(K, V);
        }
        return this.get(K);
    }
    
    
    get last_page(): PageName {
        return this.get('last_page');
    }
    
    set last_page(page: PageName) {
        
        const validpages = [ "new", "running", "record", "file_tools", "settings" ];
        if ( !validpages.includes(page) ) {
            console.warn(`set last_page("${page}"), must be one of ${validpages.join(', ')}. setting to new`);
            this.set('last_page', 'new');
        } else {
            this.set('last_page', page);
        }
    }
    
    /**@cached
     * Should be used instead of Subconfig constructor.
     * Updates `exam_file` or `test_file`, in file and in cache. Also initializes and caches a new Subconfig (this.exam = new Subconfig(...)). */
    setSubconfig(nameWithExt: string, subconfig?: Subconfig) {
        // const [ filename, ext ] = myfs.split_ext(nameWithExt);
        try {
            Subconfig.validateName(nameWithExt);
        } catch ( e ) {
            if ( e.message === 'ExtensionError' ) {
                return console.warn(`set setSubconfig (${nameWithExt}) has no extension, or ext is bad. not setting`);
            }
            if ( e.message === 'BasenameError' ) {
                const basename = path.basename(nameWithExt);
                console.warn(`setSubconfig(${nameWithExt}), passed a path (with slahes). need only a basename.ext. continuing with only basename: ${basename}`);
                nameWithExt = basename;
            }
        }
        const ext = path.extname(nameWithExt);
        //// Extension and file name ok
        const subcfgType = ext.slice(1) as ExperimentType;
        
        
        const subconfigKey = `${subcfgType}_file` as "exam_file" | "test_file";
        //// this.set('exam_file', 'fur_elise_B.exam')
        this.set(subconfigKey, nameWithExt);
        this.cache[subconfigKey] = nameWithExt;
        console.log(`setSubconfig`, {
            nameWithExt,
            subconfig,
        });
        
        //// this.exam = new Subconfig('fur_elise_B.exam', subconfig)
        this[subcfgType] = new Subconfig(nameWithExt, subconfig)
    }
    
    /**@cached*/
    getSubconfig(): Subconfig {
        return this[this.experiment_type]
    }
    
    /**@cached
     * Returns the exam file name including extension*/
    get exam_file(): string {
        return tryGetFromCache(this, 'exam_file');
        // return this.get('exam_file');
    }
    
    /**Updates exam_file and also initializes new Subconfig*/
    set exam_file(nameWithExt: string) {
        this.setSubconfig(nameWithExt)
    }
    
    /**@cached
     * Returns the test file name including extension*/
    get test_file(): string {
        return tryGetFromCache(this, 'test_file');
    }
    
    /**@cached
     * Updates test_file and also initializes new Subconfig*/
    set test_file(nameWithExt: string) {
        this.setSubconfig(nameWithExt)
    }
    
    /**@cached
     * Can be gotten also with `subconfig.type`*/
    get experiment_type(): ExperimentType {
        return tryGetFromCache(this, "experiment_type")
        /*if ( this.cache.experiment_type === undefined ) {
         const experimentType = this.get('experiment_type');
         this.cache.experiment_type = experimentType;
         return experimentType;
         } else {
         return this.cache.experiment_type;
         }*/
    }
    
    /**@cached*/
    set experiment_type(experimentType: ExperimentType) {
        if ( ![ 'exam', 'test' ].includes(experimentType) ) {
            console.warn(`BigConfig experiment_type setter, got experimentType: '${experimentType}'. Must be either 'test' or 'exam'. setting to test`);
            experimentType = 'test';
        }
        this.set('experiment_type', experimentType);
        this.cache.experiment_type = experimentType;
        
        
    }
    
    get subjects(): string[] {
        return this.get('subjects');
    }
    
    /**Ensures having `this.test.subject` and `this.exam.subject` in the list regardless*/
    set subjects(subjectList: string[]) {
        if ( DRYRUN ) {
            // @ts-ignore
            return console.warn('set subjects, DRYRUN. returning')
        }
        subjectList.push(this.test.subject);
        subjectList.push(this.exam.subject);
        const subjects = [ ...new Set(subjectList) ];
        this.set('subjects', subjects);
        
    }
    
    
    get dev(): { [K in keyof DevOptions]: () => DevOptions[K] } {
        const _dev = this.get('dev');
        return {
            max_animation_notes : () => {
                if ( _dev ) {
                    const max_animation_notes = this.get('devoptions').max_animation_notes;
                    if ( max_animation_notes ) console.warn(`devoptions.max_animation_notes: ${max_animation_notes}`);
                    return max_animation_notes;
                }
                return null;
            },
            mute_animation : () => {
                const mute_animation = _dev && this.get('devoptions').mute_animation;
                if ( mute_animation ) console.warn(`devoptions.mute_animation`);
                return mute_animation;
            },
            skip_midi_exists_check : () => {
                const skip_midi_exists_check = _dev && this.get('devoptions').skip_midi_exists_check;
                if ( skip_midi_exists_check ) console.warn(`devoptions.skip_midi_exists_check`);
                return skip_midi_exists_check;
            },
            skip_whole_truth : () => {
                const skip_whole_truth = _dev && this.get('devoptions').skip_whole_truth;
                if ( skip_whole_truth ) console.warn(`devoptions.skip_whole_truth`);
                return skip_whole_truth;
            },
            skip_level_intro : () => {
                const skip_level_intro = _dev && this.get('devoptions').skip_level_intro;
                if ( skip_level_intro ) console.warn(`devoptions.skip_level_intro`);
                return skip_level_intro;
            },
            skip_passed_trial_feedback : () => {
                const skip_passed_trial_feedback = _dev && this.get('devoptions').skip_passed_trial_feedback;
                if ( skip_passed_trial_feedback ) console.warn(`devoptions.skip_passed_trial_feedback`);
                return skip_passed_trial_feedback;
            },
            skip_failed_trial_feedback : () => {
                const skip_failed_trial_feedback = _dev && this.get('devoptions').skip_failed_trial_feedback;
                if ( skip_failed_trial_feedback ) console.warn(`devoptions.skip_failed_trial_feedback`);
                return skip_failed_trial_feedback;
            },
            reload_page_on_submit : () => {
                const reload_page_on_submit = _dev && this.get('devoptions').reload_page_on_submit;
                if ( reload_page_on_submit ) console.warn(`devoptions.reload_page_on_submit`);
                return reload_page_on_submit;
            },
        };
    }
    
    /**@cached*/
    get velocities() {
        return tryGetFromCache(this, "velocities")
    }
    
    /**@cached*/
    set velocities(val: number) {
        try {
            const floored = Math.floor(val);
            if ( isNaN(floored) ) {
                console.warn(`set velocities, Math.floor(val) is NaN:`, { val, floored }, '. not setting');
            } else {
                if ( floored >= 1 && floored <= 16 ) {
                    this.set('velocities', floored);
                    this.cache.velocities = floored;
                    
                } else {
                    console.warn(`set velocities, bad range: ${val}. not setting`);
                }
            }
        } catch ( e ) {
            console.warn(`set velocities, Exception when trying to Math.floor(val):`, e);
        }
        
        
    }
}


export class Subconfig extends Conf<ISubconfig> { // AKA Config
    private readonly type: ExperimentType;
    readonly cache: Partial<ISubconfig>;
    truth: Truth;
    
    
    /**
     * @param nameWithExt - sets the `name` field in file
     */
    constructor(nameWithExt: string, subconfig?: Subconfig) {
        
        let [ filename, ext ] = myfs.split_ext(nameWithExt);
        if ( ![ '.exam', '.test' ].includes(ext) ) {
            throw new Error(`Subconfig ctor (${nameWithExt}) has bad or no extension`);
        }
        const type = ext.slice(1) as ExperimentType;
        let defaults;
        if ( bool(subconfig) ) {
            if ( subconfig.store ) {
                defaults = { ...subconfig.store, name : nameWithExt };
            } else {
                defaults = subconfig;
            }
        } else {
            defaults = { name : nameWithExt };
        }
        super({
            fileExtension : type,
            cwd : CONFIGS_PATH_ABS,
            configName : filename,
            defaults
            
        });
        
        this.cache = { name : nameWithExt };
        this.type = type;
        if ( subconfig ) {
            this.set({ ...subconfig.store, name : nameWithExt });
        }
        try {
            this.truth = new Truth(myfs.remove_ext(this.truth_file));
        } catch ( e ) {
            console.error(`Subconfig constructor, initializing new Truth from this.truth_file threw an error. Probably because this.truth_file is undefined. Should maybe nest under if(subconfig) clause`, "this.truth_file", this.truth_file, e)
        }
    }
    
    static validateName(nameWithExt: string) {
        let [ filename, ext ] = myfs.split_ext(nameWithExt);
        if ( ![ '.exam', '.test' ].includes(ext) ) {
            throw new Error(`ExtensionError`);
        }
        if ( nameWithExt !== `${filename}${ext}` ) {
            throw new Error('BasenameError');
        }
    }
    
    async doTruthFileCheck(): Promise<SweetAlertResult> {
        console.log(`💾 Subconfig(${this.type}).doTruthFileCheck()`);
        
        // const truth = this.getTruth();
        if ( this.truth.txt.allExist() ) {
            return Alert.small.success(`${this.truth.name}.txt, *_on.txt, and *_off.txt files exist.`);
        }
        // ['fur_elise_B' x 3, 'fur_elise_R.txt' x 3, ...]
        const truthsWith3TxtFiles = getTruthsWith3TxtFiles();
        if ( !bool(truthsWith3TxtFiles) )
            return Alert.big.warning({
                title : 'No valid truth files found',
                html : 'There needs to be at least one txt file with one "on" and one "off" counterparts.'
            });
        
        
        return Alert.big.blocking({
            title : `Didn't find all three .txt files for ${this.truth.name}`,
            html : 'The following truths all have 3 txt files. Please choose one of them, or fix the files and reload.',
            showCloseButton : true,
        }, {
            strings : truthsWith3TxtFiles,
            clickFn : el => {
                try {
                    // const config = this.config(this.experiment_type);
                    this.finished_trials_count = 0;
                    this.levels = [];
                    this.truth_file = el.text();
                    // this.truth_file_path = new Truth(el.text());
                    reloadPage();
                } catch ( err ) {
                    Alert.close();
                    Alert.big.error({ title : err.message, html : 'Something happened.' });
                    
                }
                
            }
        });
        
        
    }
    
    increase(K: keyof ISubconfig) {
        console.warn(`used subconfig.increase, UNTESTED`);
        if ( DRYRUN ) {
            return console.warn('increase, DRYRUN. returning');
        }
        let V = this.get(K);
        
        if ( V === undefined )
            this.set(K, 1);
        else {
            const typeofV = typeof V;
            // @ts-ignore
            if ( typeofV === 'number' || (typeofV === 'string' && V.isdigit()) ) {
                // @ts-ignore
                this.set(K, Math.floor(V) + 1);
            } else {
                console.warn("BigConfigCls tried to increase a value that is not a number nor a string.isdigit()");
            }
        }
        
    }
    
    /**@deprecated*/
    toObj(): Omit<ISubconfig, "name"> { // AKA toSavedConfig
        
        const obj = this.store;
        delete obj.name;
        return obj
        
    }
    
    /**@deprecated*/
    fromSubconfig(subconfig: Subconfig) {
        if ( DRYRUN ) return console.warn('fromObj, DRYRUN. returning');
        // this.set(subconfig.toObj());
        // this.allowed_rhythm_deviation = subconfig.allowed_rhythm_deviation;
        // this.allowed_tempo_deviation = subconfig.allowed_tempo_deviation;
        // this.demo_type = subconfig.demo_type;
        // this.errors_playrate = subconfig.errors_playrate;
        // this.finished_trials_count = subconfig.finished_trials_count;
        // this.levels = subconfig.levels;
        // this.subject = subconfig.subject;
        // this.truth_file = subconfig.truth_file;
        // this._updateSavedFile('truth_file_path', cfgFile.truth_file_path);
    }
    
    /**@deprecated*/
    private _updateSavedFile(key: keyof ISubconfig, value) {
        if ( DRYRUN ) {
            return console.warn('_updateSavedFile, DRYRUN. returning')
        }
        return console.warn('_updateSavedFile() does nothing, returning');
        this.set(key, value);
        /*const conf = new (require('conf'))({
         cwd : CONFIGS_PATH_ABS,
         configName : this.name,
         fileExtension : this.type,
         serialize : value => JSON.stringify(value, null, 4)
         });
         conf.set(key, value);*/
    }
    
    
    private setDeviation(deviationType: DeviationType, deviation: string) {
        const typeofDeviation = typeof deviation;
        if ( typeofDeviation === 'number' ) {
            deviation = `${deviation}%`;
            console.warn(`setDeviation got "deviation" type number. appended "%". deviation now: ${deviation}`);
        } else if ( typeofDeviation === 'string' ) {
            if ( !deviation.endsWith("%") ) {
                console.warn(`setDeviation got deviation without %. appended %. deviation now: "${deviation}"`);
                deviation = `${deviation}%`;
            }
        } else {
            console.warn(`setDeviation, received "deviation" not string not number. returning. deviation:`, deviation);
            return;
        }
        
        // @ts-ignore
        this.set(`allowed_${deviationType}_deviation`, deviation);
        this.cache[`allowed_${deviationType}_deviation`] = deviation;
    }
    
    /**@cached*/
    get allowed_tempo_deviation(): string {
        return tryGetFromCache(this, "allowed_tempo_deviation")
        /*if ( this.cache.allowed_tempo_deviation === undefined ) {
         const allowedTempoDeviation = this.get('allowed_tempo_deviation');
         this.cache.allowed_tempo_deviation = allowedTempoDeviation;
         return allowedTempoDeviation;
         } else {
         return this.cache.allowed_tempo_deviation;
         }*/
    }
    
    /**@cached*/
    set allowed_tempo_deviation(deviation: string) {
        this.setDeviation("tempo", deviation);
    }
    
    /**@cached*/
    get allowed_rhythm_deviation(): string {
        return tryGetFromCache(this, "allowed_rhythm_deviation");
        /*if ( this.cache.allowed_rhythm_deviation === undefined ) {
         const allowedRhythmDeviation = this.get('allowed_rhythm_deviation');
         this.cache.allowed_rhythm_deviation = allowedRhythmDeviation;
         return allowedRhythmDeviation;
         } else {
         return this.cache.allowed_rhythm_deviation;
         }*/
    }
    
    /**@cached*/
    set allowed_rhythm_deviation(deviation: string) {
        this.setDeviation("rhythm", deviation);
    }
    
    /**@cached*/
    get demo_type(): DemoType {
        return tryGetFromCache(this, "demo_type");
        // return this.get('demo_type');
    }
    
    /**@cached*/
    set demo_type(type: DemoType) {
        if ( ![ 'video', 'animation' ].includes(type) ) {
            console.warn(`Config demo_type setter, bad type = ${type}, can be either video or animation. Not setting`);
        } else {
            this.set('demo_type', type);
            this.cache.demo_type = type;
        }
    }
    
    get errors_playrate(): number {
        return this.get('errors_playrate');
    }
    
    set errors_playrate(speed: number) {
        if ( isNaN(speed) ) {
            console.warn(`config set errors_playrate, received bad "speed" NaN: ${speed}`);
        } else {
            this.set('errors_playrate', speed);
        }
        
    }
    
    get finished_trials_count(): number {
        return this.get('finished_trials_count');
    }
    
    set finished_trials_count(count: number) {
        if ( isNaN(count) || count < 0 ) {
            console.warn(`config set finished_trials_count, received bad "count": ${count}`);
        } else {
            this.set('finished_trials_count', count);
        }
    }
    
    /**Name of config file, including extension. Always returns `name` from cache. This is because there's no setter; `name` is stored in cache at constructor.*/
    get name(): string {
        return this.cache.name;
    }
    
    
    get subject(): string {
        return this.get('subject');
    }
    
    set subject(name: string | null) {
        if ( DRYRUN ) {
            // @ts-ignore
            return console.warn('set subject, DRYRUN');
        }
        this.set('subject', name);
        if ( name ) {
            const Glob = require('../Glob').default;
            Glob.BigConfig.subjects = [ ...new Set([ ...Glob.BigConfig.subjects, name ]) ];
            // super.set('subjects', [...new Set([...super.get('subjects'), name])]);
            // super.subjects = [ ...super.get('subjects'), name ];
        }
    }
    
    /**@cached
     * Truth file name, no extension*/
    get truth_file(): string {
        return tryGetFromCache(this, 'truth_file');
        // return this.get('truth_file')
    }
    
    /**Also sets this.truth (memory)
     * @cached
     * @param truth_file - Truth file name, no extension*/
    set truth_file(truth_file: string) {
        // truth_file = path.basename(truth_file);
        let [ name, ext ] = myfs.split_ext(truth_file);
        if ( bool(ext) ) {
            console.warn(`set truth_file, passed name is not extensionless: ${truth_file}. Continuing with "${name}"`);
            // nameNoExt = myfs.remove_ext(nameNoExt);
        }
        
        try {
            let truth = new Truth(name);
            if ( !truth.txt.allExist() ) {
                Alert.small.warning(`Not all txt files exist: ${name}`)
            }
            this.truth = truth;
        } catch ( e ) {
            Alert.small.warning(e);
            console.warn(e)
        }
        this.set(`truth_file`, name);
        this.cache.truth_file = name;
        
        
    }
    
    
    get levels(): ILevel[] {
        return this.get('levels');
    }
    
    set levels(levels: ILevel[]) {
        if ( !Array.isArray(levels) ) {
            console.warn(`set levels, received "levels" not isArray. not setting anything. levels: `, levels);
        } else {
            // TODO: better checks
            this.set('levels', levels);
        }
    }
    
    
    currentTrialCoords(): number[] {
        // let { levels, finished_trials_count } = this.config();
        let flatTrialsList = this.levels.map(level => level.trials);
        for ( let [ levelIndex, trialsNum ] of enumerate(flatTrialsList) ) {
            
            let trialSumSoFar = sum(flatTrialsList.slice(0, levelIndex + 1));
            const finishedTrialsCount = this.finished_trials_count;
            if ( trialSumSoFar > finishedTrialsCount )
                return [ levelIndex, trialsNum - (trialSumSoFar - finishedTrialsCount) ];
        }
        console.warn("currentTrialCoords: out of index error");
    }
    
    isDemoVideo(): boolean {
        return this.demo_type === 'video';
    }
    
    isWholeTestOver(): boolean {
        return sum(this.levels.map(level => level.trials)) == this.finished_trials_count;
    }
    
    getSubjectDirNames(): string[] {
        return fs.readdirSync(SUBJECTS_PATH_ABS);
    }
    
    getCurrentLevel(): Level {
        
        let [ level_index, trial_index ] = this.currentTrialCoords();
        return new Level(this.levels[level_index], level_index, trial_index);
    }
    
    
    getLevelCollection(): LevelCollection {
        let [ level_index, trial_index ] = this.currentTrialCoords();
        return new LevelCollection(this.levels, level_index, trial_index);
    }
    
    
    /**Gets the current trial's path (join this.testOutPath() and level_${level_index}...), and returns a Truth of it*/
    trialTruth(): Truth {
        let [ level_index, trial_index ] = this.currentTrialCoords();
        // return new Truth(path.join(this.testOutPath(), `level_${level_index}_trial_${trial_index}`));
        return new Truth(path.join(this.testOutPath(), `level_${level_index}_trial_${trial_index}`));
    }
    
    /**"c:\Sync\Code\Python\Pyano-release\src\experiments\subjects\gilad\fur_elise"*/
    testOutPath(): string {
        const currSubjectDir = path.join(SUBJECTS_PATH_ABS, this.subject); // ".../subjects/gilad"
        return path.join(currSubjectDir, this.truth.name);
    }
    
    
}
