import * as Store from "electron-store";
import * as path from "path";
import * as fs from "fs";
import Alert from "../MyAlert";
import myfs from "../MyFs";
import { bool, reloadPage, sum, enumerate } from "../util";
import { Truth } from "../Truth";
import { ILevel, Level, LevelCollection } from "../Level";
import { SweetAlertResult } from "sweetalert2";
import * as Conf from 'conf';

console.log('src/BigConfig/index.ts');

export type ExperimentType = 'exam' | 'test';
type DemoType = 'video' | 'animation';
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
    skip_whole_truth: boolean,
    skip_level_intro: boolean,
    skip_failed_trial_feedback: boolean,
    skip_passed_trial_feedback: boolean
}

interface IBigConfig {
    dev: boolean,
    devoptions: DevOptions,
    exam_file: string,
    test_file: string,
    experiment_type: ExperimentType,
    last_page: PageName,
    subjects: string[],
    velocities: number[],
}


export class BigConfigCls extends Store<IBigConfig> {
    test: Subconfig;
    exam: Subconfig;
    private readonly _cache: Partial<IBigConfig> = {};
    
    constructor(_doTruthFileCheck = true) {
        super();
        if ( DRYRUN ) {
            this.set = (...args) => console.warn(`DRYRUN, set: `, args)
        }
        this.test = new Subconfig(this.test_file, "test");
        this.exam = new Subconfig(this.exam_file, "exam");
        this.subjects = this.subjects; // to ensure having subconfig's subjects
        if ( _doTruthFileCheck ) {
            this.test.doTruthFileCheck()
                .then(swal => {
                        this.exam.doTruthFileCheck()
                    }
                );
            
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
    
    /*subconfigs(): { exam: Subconfig, test: Subconfig } {
     const subconfigs = {
     exam : this.exam,
     test : this.test
     };
     
     return subconfigs;
     }*/
    
    /*config(type: ExperimentType): Subconfig {
     
     return new Subconfig(type);
     }*/
    
    
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
    
    
    // /**@return {string}*/
    // get save_path() {
    // 	return this.get('save_path');
    // }
    //
    // /**@param {string} savePath*/
    // set save_path(savePath) {
    // 	this.set('save_path', savePath);
    // }
    
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
    
    /**Updates `exam_file` or `test_file`. Also initializes new Subconfig.
     * Handles with warnings: */
    setSubconfig(file: string, subcfgType: ExperimentType, data?: ISubconfig) {
        const subconfigKey = `${subcfgType}_file` as "exam_file" | "test_file";
        if ( this.get(subconfigKey) === file ) {
            return console.warn(`setSubconfig, file === existing one.`, {
                file,
                subcfgType,
                'this[`${subcfgType}_file`]' : this[subconfigKey]
            });
        }
        let basename = path.basename(file);
        if ( file !== basename ) {
            console.warn(`set ${subcfgType}_file(${file}), passed NOT a basename (no dirs). continuing with only basename`);
        }
        const ext = path.extname(file);
        if ( !bool(ext) ) {
            console.warn(`set ${subcfgType}_file(${file}) has no extension. adding .${subcfgType}`);
            basename += `.${subcfgType}`;
        } else if ( ext !== `.${subcfgType}` ) {
            console.warn(`set ${subcfgType}_file(${file}) bad extension: "${ext}". replacing with .${subcfgType}`);
            myfs.replace_ext(basename, `.${subcfgType}`)
        }
        this.set(subconfigKey, basename);
        this[subcfgType] = new Subconfig(myfs.remove_ext(basename), subcfgType, data)
    }
    
    getSubconfig(): Subconfig {
        return this[this.experiment_type]
    }
    
    get exam_file(): string {
        // Don't cache; this.exam is a Subconfig
        return this.get('exam_file');
    }
    
    /**Updates exam_file and also initializes new Subconfig*/
    set exam_file(file: string) {
        this.setSubconfig(file, "exam")
    }
    
    get test_file(): string {
        // Don't cache; this.test is a Subconfig
        return this.get('test_file');
    }
    
    /**Updates test_file and also initializes new Subconfig*/
    set test_file(file: string) {
        this.setSubconfig(file, "test")
    }
    
    /**@cached*/
    get experiment_type(): ExperimentType {
        if ( this._cache.experiment_type === undefined ) {
            const experimentType = this.get('experiment_type');
            this._cache.experiment_type = experimentType;
            return experimentType;
        } else {
            return this._cache.experiment_type;
        }
    }
    
    /**@cached*/
    set experiment_type(experimentType: ExperimentType) {
        if ( experimentType !== 'test' && experimentType !== 'exam' ) {
            console.warn(`BigConfigCls experiment_type setter, got experimentType: '${experimentType}'. Must be either 'test' or 'exam'. setting to test`);
            experimentType = 'test';
        }
        this.set('experiment_type', experimentType);
        this._cache.experiment_type = experimentType;
        
        
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
        console.warn('This used to maybe nullify config.subject. Doesnt do that anymore');
        /*const config = this.config(this.experiment_type);
         const currentSubject = config.subject;
         if ( currentSubject && !subjects.includes(currentSubject) )
         config.subject = null;*/
    }
    
    
    /**@deprecated*/
    configsPath(): string {
        console.warn('called configsPath, should use CONFIGS_PATH_ABS');
        return CONFIGS_PATH_ABS;
    }
    
    /**@deprecated*/
    truthsDirPath(): string {
        console.warn('called truthsDirPath, should use TRUTHS_PATH_ABS');
        return TRUTHS_PATH_ABS;
    }
    
    
    /**@deprecated*/
    subjectsDirPath(): string {
        console.warn('called subjectsDirPath, should use SUBJECTS_PATH_ABS');
        return SUBJECTS_PATH_ABS
    }
    
    /**@deprecated*/
    salamanderDirPath(): string {
        console.warn('called salamanderDirPath, should use SALAMANDER_PATH_ABS');
        return SALAMANDER_PATH_ABS
    }
    
    
    private get dev(): { [K in keyof DevOptions]: () => boolean } {
        const _dev = this.get('dev');
        return {
            skip_whole_truth : () => _dev && this.get('devoptions').skip_whole_truth,
            skip_level_intro : () => _dev && this.get('devoptions').skip_level_intro,
            skip_passed_trial_feedback : () => _dev && this.get('devoptions').skip_passed_trial_feedback,
            skip_failed_trial_feedback : () => _dev && this.get('devoptions').skip_failed_trial_feedback,
        };
    }
    
    
}


export class Subconfig extends Conf<ISubconfig> { // AKA Config
    private readonly type: ExperimentType;
    protected truth: Truth;
    private readonly _cache: Partial<ISubconfig> = {};
    
    /*private static readonly _KEYS: (keyof ISubconfig)[] = [
     'allowed_rhythm_deviation',
     'allowed_tempo_deviation',
     'demo_type',
     'errors_playrate',
     'finished_trials_count',
     'name',
     'levels',
     'subject',
     'truth_file',
     ];*/
    
    constructor(name: string, type: ExperimentType, data?: Subconfig) {
        
        super({
            fileExtension : type,
            cwd : CONFIGS_PATH_ABS,
            configName : myfs.remove_ext(name),
            defaults : bool(data) ? data.toObj ? data.toObj() : data : undefined
            
        });
        
        this.type = type;
        this.truth = new Truth(myfs.remove_ext(this.truth_file));
    }
    
    async doTruthFileCheck(): Promise<SweetAlertResult> {
        console.log(`💾 Subconfig(${this.type}).doTruthFileCheck()`);
        
        // const truth = this.getTruth();
        if ( this.truth.txt.allExist() ) {
            return Alert.small.success(`${this.truth.name}.txt, *_on.txt, and *_off.txt files exist.`);
        }
        // ['fur_elise_B' x 3, 'fur_elise_R.txt' x 3, ...]
        const txtFilesList = require("../Glob").getTruthFilesWhere({ extension : 'txt' }).map(myfs.remove_ext);
        const truthsWith3TxtFiles = txtFilesList.filter(a => txtFilesList.filter(txt => txt.startsWith(a)).length >= 3);
        if ( !bool(truthsWith3TxtFiles) )
            return Alert.big.warning({
                title : 'No valid truth files found',
                html : 'There needs to be at least one txt file with 2 "on" and "off" counterparts.'
            });
        
        
        // @ts-ignore
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
        if ( DRYRUN ) return;
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
    
    toObj(): ISubconfig { // AKA toSavedConfig
        // @ts-ignore
        return {
            allowed_rhythm_deviation : this.allowed_rhythm_deviation,
            allowed_tempo_deviation : this.allowed_tempo_deviation,
            demo_type : this.demo_type,
            errors_playrate : this.errors_playrate,
            finished_trials_count : this.finished_trials_count,
            name : this.name,
            subject : this.subject,
            truth_file : this.truth_file,
            levels : this.levels,
        }
        
    }
    
    
    fromFile(cfgFile: ISubconfig) {
        if ( DRYRUN ) return console.warn('fromFile, DRYRUN. returning');
        this.allowed_rhythm_deviation = cfgFile.allowed_rhythm_deviation;
        this.allowed_tempo_deviation = cfgFile.allowed_tempo_deviation;
        this.demo_type = cfgFile.demo_type;
        this.errors_playrate = cfgFile.errors_playrate;
        this.finished_trials_count = cfgFile.finished_trials_count;
        this.levels = cfgFile.levels;
        this.subject = cfgFile.subject;
        this.truth_file = cfgFile.truth_file;
        // this._updateSavedFile('truth_file_path', cfgFile.truth_file_path);
    }
    
    
    private _updateSavedFile(key: keyof ISubconfig, value) {
        if ( DRYRUN ) {
            return console.warn('_updateSavedFile, DRYRUN. returning')
        }
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
        this._cache[`allowed_${deviationType}_deviation`] = deviation;
    }
    
    /**@cached*/
    get allowed_tempo_deviation(): string {
        if ( this._cache.allowed_tempo_deviation === undefined ) {
            const allowedTempoDeviation = this.get('allowed_tempo_deviation');
            this._cache.allowed_tempo_deviation = allowedTempoDeviation;
            return allowedTempoDeviation;
        } else {
            return this._cache.allowed_tempo_deviation;
        }
    }
    
    /**@cached*/
    set allowed_tempo_deviation(deviation: string) {
        this.setDeviation("tempo", deviation);
    }
    
    /**@cached*/
    get allowed_rhythm_deviation(): string {
        if ( this._cache.allowed_rhythm_deviation === undefined ) {
            const allowedRhythmDeviation = this.get('allowed_rhythm_deviation');
            this._cache.allowed_rhythm_deviation = allowedRhythmDeviation;
            return allowedRhythmDeviation;
        } else {
            return this._cache.allowed_rhythm_deviation;
        }
    }
    
    /**@cached*/
    set allowed_rhythm_deviation(deviation: string) {
        this.setDeviation("rhythm", deviation);
    }
    
    get demo_type(): DemoType {
        return this.get('demo_type');
    }
    
    set demo_type(type: DemoType) {
        console.warn('set demo_type returns a value, is this needed?');
        if ( ![ 'video', 'animation' ].includes(type) ) {
            console.warn(`Config demo_type setter, bad type = ${type}, can be either video or animation`);
        } else {
            // @ts-ignore
            return this.set('demo_type', type);
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
    
    get name(): string {
        return this.get('name');
    }
    
    
    get subject(): string {
        return this.get('subject');
    }
    
    set subject(name: string | null) {
        console.log('💾set subject(', name, ')');
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
    
    get truth_file(): string {
        return this.get('truth_file')
    }
    
    /**Also sets this.truth (memory)*/
    set truth_file(truth_file: string) {
        try {
            let truth = new Truth(truth_file);
            if ( !truth.txt.allExist() ) {
                Alert.small.warning(`Not all txt files exist: ${truth_file}`)
            }
            this.truth = truth;
        } catch ( e ) {
            Alert.small.warning(e);
            console.warn(e)
        }
        this.set(`truth_file`, truth_file);
        
        
    }
    
    /*getTruth(): Truth {
     return new Truth(myfs.remove_ext(this.truth_file));
     }*/
    
    
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
