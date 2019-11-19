import * as Store from "electron-store";
import * as path from "path";
import * as fs from "fs";
import Alert from "../MyAlert";
import myfs from "../MyFs";
import { bool, reloadPage, sum, enumerate } from "../util";
import { Truth } from "../Truth";
import { ILevel, Level, LevelCollection } from "../Level";

console.log('src/MyStore/index.ts');

type ExperimentType = 'exam' | 'test';
type DemoType = 'video' | 'animation';
type PageName = "new" // AKA TLastPage
    | "running"
    | "record"
    | "file_tools"
    | "settings"
type DeviationType = 'rhythm' | 'tempo';


interface ISubconfigBase {
    allowed_rhythm_deviation: string,
    allowed_tempo_deviation: string,
    current_subject: string
    demo_type: DemoType,
    errors_playingspeed: number,
    finished_trials_count: number,
    levels: ILevel[],
}

interface ISubconfig extends ISubconfigBase { // AKA TConfig
    'save_path': string
}

interface ISavedSubconfig extends ISubconfigBase { // AKA TSavedConfig
    'truth_file_path': string
}

interface DevOptions {
    "skip_whole_truth": boolean,
    "skip_level_intro": boolean,
    "skip_failed_trial_feedback": boolean,
    "skip_passed_trial_feedback": boolean
}

interface IMyStore {
    'current_exam': Subconfig,
    'current_test': Subconfig,
    'dev': boolean,
    'devoptions': DevOptions,
    'experiment_type': ExperimentType,
    'last_page': PageName,
    'root_abs_path': string,
    'subjects': string[],
    'truth_file_path': string,
    'velocities': number[],
    'vid_silence_len': number,
}


class MyStore extends Store<IMyStore> {
    
    constructor(_doTruthFileCheck = true) {
        super();
        if ( _doTruthFileCheck )
            this._doTruthFileCheck();
        
        
    }
    
    
    private async _doTruthFileCheck() {
        console.log('💾 MyStore._doTruthFileCheck()');
        
        const truth = this.truth();
        if ( truth.txt.allExist() ) {
            return Alert.small.success(`All "${truth.name}" txt files exist.`);
        }
        const txtFilesList = this.truthFilesList('txt').map(myfs.remove_ext);
        const filteredTxts = txtFilesList.filter(a => txtFilesList.filter(txt => txt.startsWith(a)).length >= 3);
        if ( !bool(filteredTxts) )
            return Alert.big.warning({
                title : 'No valid truth files found',
                html : 'There needs to be at least one txt file with 2 "on" and "off" counterparts.'
            });
        
        
        return Alert.big.blocking({
            title : `Truth file invalid: ${truth.name}`,
            html : '<b>Please choose one of the following valid truths:</b>',
        }, {
            strings : filteredTxts,
            clickFn : async $s => {
                try {
                    const config = this.config();
                    config.finished_trials_count = 0;
                    config.levels = [];
                    // @ts-ignore
                    this.truth_file_path = new Truth(path.join(this.truthsDirPath(), $s.text()));
                    reloadPage();
                } catch ( err ) {
                    document.getElementById('swal2-title').innerText = err.message;
                    document.getElementById('swal2-content').style.display = 'none';
                    // @ts-ignore
                    document.querySelector('.swal2-icon swal2-warning').style.display = 'inherit';
                    throw err;
                }
                
            }
        });
        
        
    }
    
    
    fromSavedConfig(savedConfig: ISavedSubconfig, experimentType: ExperimentType) {
        const truthsDirPath = this.truthsDirPath();
        const truthFileName = path.basename(savedConfig.truth_file_path, '.txt');
        // @ts-ignore
        this.truth_file_path = new Truth(path.join(truthsDirPath, truthFileName));
        this.experiment_type = experimentType;
        this.config().fromSavedConfig(savedConfig);
    }
    
    
    config(type?: ExperimentType): Subconfig {
        if ( type )
            return new Subconfig(type);
        else
            return new Subconfig(this.experiment_type);
    }
    
    
    /**@example
     update('subjects', [names])
     */
    update(K: keyof IMyStore, kvPairs: Partial<IMyStore>)
    update(K: keyof IMyStore, values: any[])
    update(K, kv) {
        let V = this.get(K);
        if ( Array.isArray(V) ) {
            this.set(K, [ ...V, kv ]);
        } else {
            Object.assign(V, kv);
            this.set(K, V);
        }
        return this.get(K);
    }
    
    increase(K: keyof IMyStore) {
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
                console.warn("MyStore tried to increase a value that is not a number nor a string.isdigit()");
            }
        }
        
    }
    
    truth(): Truth {
        const truthsDirPath = this.truthsDirPath();
        const truthFileName = path.basename(this.truth_file_path, '.txt');
        return new Truth(path.join(truthsDirPath, truthFileName));
    }
    
    // @ts-ignore
    set truth_file_path(truth: Truth) {
        
        if ( truth.txt.allExist() ) {
            this.set(`truth_file_path`, `experiments/truths/${truth.txt.base.name}`);
            
        } else {
            throw new Error(`Not all txt files of truth exist: ${truth.txt.base.name}`);
        }
        
    }
    
    // @ts-ignore
    get truth_file_path(): string {
        return this.get('truth_file_path');
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
    
    
    get experiment_type(): ExperimentType {
        return this.get('experiment_type');
    }
    
    set experiment_type(experimentType: ExperimentType) {
        if ( experimentType !== 'test' && experimentType !== 'exam' ) {
            console.warn(`MyStore experiment_type setter, got experimentType: '${experimentType}'. Must be either 'test' or 'exam'. setting to test`);
            this.set('experiment_type', 'test');
        } else {
            this.set('experiment_type', experimentType);
        }
        // this._updateSavedFile('experiment_type', experimentType);
        
        
    }
    
    
    get root_abs_path(): string {
        console.warn('called root_abs_path, should use PATH or sysargv');
        return this.get('root_abs_path');
    }
    
    set subjects(subjectList: string[]) {
        const subjects = [ ...new Set(subjectList) ];
        console.log('💾 set subjects:', subjects);
        this.set('subjects', subjects);
        const config = this.config();
        const currentSubject = config.current_subject;
        if ( currentSubject && !subjects.includes(currentSubject) )
            config.current_subject = null;
    }
    
    configsPath(): string {
        console.warn('called configsPath, should use PATH or sysargv');
        return path.join(this.root_abs_path, 'experiments', 'configs');
    }
    
    /**"C:\Sync\Code\Python\Pyano\pyano_01\src\experiments\truths"*/
    truthsDirPath(): string {
        console.warn('called truthsDirPath, should use PATH or sysargv');
        return path.join(this.root_abs_path, 'experiments', 'truths');
    }
    
    
    truthFilesList(extFilter?: string): string[] {
        if ( extFilter ) {
            if ( extFilter.startsWith('.') )
                extFilter = extFilter.slice(1);
            if ( ![ 'txt', 'mid', 'mp4' ].includes(extFilter) ) {
                console.warn(`truthFilesList("${extFilter}"), must be either ['txt','mid','mp4'] or not at all. setting to undefined`);
                extFilter = undefined;
            }
        }
        
        const truthsDirPath = this.truthsDirPath();
        
        let truthFiles = [ ...new Set(fs.readdirSync(truthsDirPath)) ];
        if ( bool(extFilter) )
            return truthFiles.filter(f => path.extname(f) == `.${extFilter}`);
        return truthFiles;
    }
    
    
    /** "C:\Sync\Code\Python\Pyano\pyano_01\src\experiments\subjects"*/
    subjectsDirPath(): string {
        console.warn('called subjectsDirPath, should use PATH or sysargv');
        return path.join(this.root_abs_path, 'experiments', 'subjects');
    }
    
    
    salamanderDirPath(): string {
        console.warn('called salamanderDirPath, should use PATH or sysargv');
        return path.join(this.root_abs_path, 'templates', 'Salamander/');
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


class Subconfig extends MyStore { // AKA Config
    private readonly type: ExperimentType;
    private static readonly _KEYS: (keyof ISubconfig)[] = [
        'allowed_rhythm_deviation',
        'allowed_tempo_deviation',
        'current_subject',
        'demo_type',
        'errors_playingspeed',
        'finished_trials_count',
        'levels',
        'save_path'
    ];
    
    constructor(type: ExperimentType) {
        super(false);
        this.type = type;
    }
    
    
    toSavedConfig(): ISavedSubconfig {
        // @ts-ignore
        const self: Conf<ISubconfig> = super.get(`current_${this.type}`);
        self.delete('save_path');
        // delete self.save_path;
        const savedConfig = {
            ...self,
            truth_file_path : super.truth_file_path
        };
        console.warn('savedConfig, check if deleted save_path:', self);
        return savedConfig;
    }
    
    
    fromSavedConfig(savedConfig: ISavedSubconfig, ...args) {
        this.levels = savedConfig.levels;
        this.finished_trials_count = savedConfig.finished_trials_count;
        this.errors_playingspeed = savedConfig.errors_playingspeed;
        this.demo_type = savedConfig.demo_type;
        this.current_subject = savedConfig.current_subject;
        this.allowed_tempo_deviation = savedConfig.allowed_tempo_deviation;
        this.allowed_rhythm_deviation = savedConfig.allowed_rhythm_deviation;
        this._updateSavedFile('truth_file_path', savedConfig.truth_file_path);
    }
    
    
    private _updateSavedFile(key: keyof ISavedSubconfig, value) {
        const conf = new (require('conf'))({
            cwd : path.dirname(path.join(super.root_abs_path, this.save_path)),
            configName : myfs.remove_ext(path.basename(this.save_path)),
            fileExtension : this.type,
            serialize : value => JSON.stringify(value, null, 4)
        });
        console.log('💾 _updateSavedFile(key,value)', { key, value, conf });
        conf.set(key, value);
    }
    
    
    private _get(key: keyof ISubconfig) {
        // @ts-ignore
        return super.get(`current_${this.type}.${key}`);
    }
    
    
    private _set(key: keyof ISubconfig, value) {
        const typeofKey = typeof key;
        if ( typeofKey === 'string' ) {
            if ( !Subconfig._KEYS.includes(key) ) {
                console.warn(`Subconfig(${this.type})._set: "key" ("${key}") is string but not in this._KEYS`);
                return;
            }
            const superkey = `current_${this.type}.${key}`;
            // @ts-ignore
            super.set(superkey, value);
            if ( key !== "save_path" )
                this._updateSavedFile(key, value);
            return;
        }
        
        console.warn(`Subconfig(${this.type})._set: "key" ("${key}") is not string. type: ${typeofKey}`);
    }
    
    private _setDeviation(deviationType: DeviationType, deviation: string) {
        const typeofDeviation = typeof deviation;
        if ( typeofDeviation === 'number' ) {
            deviation = `${deviation}%`;
            console.warn(`_setDeviation got "deviation" type number. appended "%". deviation now: ${deviation}`);
        } else if ( typeofDeviation === 'string' ) {
            if ( !deviation.endsWith("%") ) {
                console.warn(`_setDeviation got deviation without %. appended %. deviation now: "${deviation}"`);
                deviation = `${deviation}%`;
            }
        } else {
            console.warn(`_setDeviation, received "deviation" not string not number. returning. deviation:`, deviation);
            return;
        }
        
        // @ts-ignore
        this._set(`allowed_${deviationType}_deviation`, deviation);
    }
    
    get allowed_tempo_deviation(): string {
        return this._get('allowed_tempo_deviation');
    }
    
    set allowed_tempo_deviation(deviation: string) {
        this._setDeviation("tempo", deviation);
    }
    
    get allowed_rhythm_deviation(): string {
        return this._get('allowed_rhythm_deviation');
    }
    
    set allowed_rhythm_deviation(deviation: string) {
        this._setDeviation("rhythm", deviation);
    }
    
    
    get current_subject(): string {
        return this._get('current_subject');
    }
    
    set current_subject(name: string | null) {
        console.log('💾 set current_subject(', name, ')');
        this._set('current_subject', name);
        if ( name )
            // super.set('subjects', [...new Set([...super.get('subjects'), name])]);
            super.subjects = [ ...super.get('subjects'), name ];
    }
    
    
    get errors_playingspeed(): number {
        return this._get('errors_playingspeed');
    }
    
    set errors_playingspeed(speed: number) {
        if ( isNaN(speed) ) {
            console.warn(`config set errors_playingspeed, received bad "speed" NaN: ${speed}`);
        } else {
            this._set('errors_playingspeed', speed);
        }
        
    }
    
    get save_path(): string {
        return this._get('save_path');
    }
    
    set save_path(savePath: string) {
        console.warn('set save_path returns a value, is this needed?');
        // @ts-ignore
        return this._set('save_path', savePath);
    }
    
    get demo_type(): DemoType {
        return this._get('demo_type');
    }
    
    set demo_type(type: DemoType) {
        console.warn('set demo_type returns a value, is this needed?');
        if ( ![ 'video', 'animation' ].includes(type) ) {
            console.warn(`Config demo_type setter, bad type = ${type}, can be either video or animation`);
        } else {
            // @ts-ignore
            return this._set('demo_type', type);
        }
    }
    
    get finished_trials_count(): number {
        return this._get('finished_trials_count');
    }
    
    set finished_trials_count(count: number) {
        this._set('finished_trials_count', count);
    }
    
    get levels(): ILevel[] {
        return this._get('levels');
    }
    
    set levels(levels: ILevel[]) {
        if ( !Array.isArray(levels) ) {
            console.warn(`set levels, received "levels" not isArray. levels: `, levels);
        } else {
            this._set('levels', levels);
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
        return this.demo_type == 'video';
    }
    
    isWholeTestOver(): boolean {
        return sum(this.levels.map(level => level.trials)) == this.finished_trials_count;
    }
    
    getSubjectDirNames(): string[] {
        return fs.readdirSync(path.join(super.get('root_abs_path'), 'experiments', 'subjects'));
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
        const currSubjectDir = path.join(super.subjectsDirPath(), this.current_subject); // ".../subjects/gilad"
        return path.join(currSubjectDir, this.truth().name);
    }
    
    
}
