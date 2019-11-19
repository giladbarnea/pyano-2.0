import * as Store from "electron-store";
import * as path from "path";
import * as fs from "fs";
import Alert from "../MyAlert";
import myfs from "../MyFs";
import { all, any, bool, reloadPage,int } from "../util";

console.log('src/MyStore/index.ts');

export function MyStoreFn() {
    console.log('MyStoreFn');
}

class MyStore extends Store {
    
    constructor(_doTruthFileCheck = true) {
        super();
        if ( _doTruthFileCheck )
            this._doTruthFileCheck();
        
        
    }
    
    
    private _doTruthFileCheck() {
        console.log('💾 MyStore._doTruthFileCheck()');
        
        const truth = this.truth();
        truth.txt.allExist()
             .then(async exist => {
                 if ( exist ) {
                     return Alert.small.success(`All "${truth.name}" txt files exist.`);
                 } else {
                     const txtFilesList = this.truthFilesList('txt').map(myfs.remove_ext);
                     const filteredTxts = txtFilesList.filter(a => txtFilesList.filter(txt => txt.startsWith(a)).length >= 3);
                     if ( !bool(filteredTxts) )
                         return await Alert.big.warning({
                             title : 'No valid truth files found',
                             html : 'There needs to be at least one txt file with 2 "on" and "off" counterparts.'
                         });
                
                
                     await Alert.big.blocking({
                         title : `Truth file invalid: ${truth.name}`,
                         html : '<b>Please choose one of the following valid truths:</b>',
                     }, {
                         strings : filteredTxts,
                         clickFn : async $s => {
                             try {
                                 const config = this.config();
                                 config.finished_trials_count = 0;
                                 config.levels = [];
                                 this.truth_file_path = new Truth(path.join(this.truthsDirPath(), $s.text()));
                                 reloadPage();
                             } catch ( err ) {
                                 document.getElementById('swal2-title').innerText = err.message;
                                 document.getElementById('swal2-content').style.display = 'none';
                                 document.getElementsByClassName('swal2-icon swal2-warning')[0].style.display = 'inherit';
                                 throw err;
                             }
                        
                         }
                     });
                 }
             });
        
    }
    
    /**@param {TSavedConfig} savedConfig
     * @param {TExperimentType} experimentType*/
    fromSavedConfig(savedConfig, experimentType) {
        const truthsDirPath = this.truthsDirPath();
        const truthFileName = path.basename(savedConfig.truth_file_path, '.txt');
        this.truth_file_path = new Truth(path.join(truthsDirPath, truthFileName));
        this.experiment_type = experimentType;
        this.config().fromSavedConfig(savedConfig);
    }
    
    /**@param {TExperimentType?} type
     * @return {Config}*/
    config(type = undefined) {
        if ( type )
            return new Config(type);
        else
            return new Config(this.experiment_type);
    }
    
    
    /**@example
     update('subjects', [names])
     @param {string} K
     @param kv
     @return {*} */
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
    
    /** @param {string} K*/
    increase(K) {
        let V = this.get(K);
        
        if ( V === undefined )
            this.set(K, 1);
        else if ( !isNaN(Math.floor(V)) )
            this.set(K, int(V) + 1);
        else
            throw new TypeError("MyStore tried to increase a value that is not a number or string");
        
    }
    
    /**@return {Truth}*/
    truth() {
        const truthsDirPath = this.truthsDirPath();
        const truthFileName = path.basename(this.truth_file_path, '.txt');
        return new Truth(path.join(truthsDirPath, truthFileName));
    }
    
    /**@param {Truth} truth*/
    set truth_file_path(truth) {
        truth.txt.allExist()
             .then(exist => {
                 if ( exist ) {
                     this.set(`truth_file_path`, `experiments/truths/${truth.txt.base.name}`);
                
                 } else {
                     throw new Error(`Not all txt files of truth exist: ${truth.txt.base.name}`);
                 }
             });
    }
    
    /**@return {string}*/
    get truth_file_path() {
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
    
    /**@return {TLastPage}*/
    get last_page() {
        return this.get('last_page');
    }
    
    /**@param {TLastPage} page*/
    set last_page(page) {
        const validpages = [ 'new_test', 'inside_test', 'record', 'file_tools', 'settings' ];
        if ( !page.in(validpages) )
            throw new Error(`setLastPage(page = ${page}), must be one of ${validpages.join(', ')}`);
        
        this.set('last_page', page);
    }
    
    
    /**@return {TExperimentType}*/
    get experiment_type() {
        return this.get('experiment_type');
    }
    
    /**@param {TExperimentType} experimentType*/
    set experiment_type(experimentType) {
        if ( experimentType != 'test' && experimentType != 'exam' )
            throw new Error(`MyStore experiment_type setter, got experimentType: '${experimentType}'. Must be either 'test' or 'exam'`);
        this.set('experiment_type', experimentType);
        // this._updateSavedFile('experiment_type', experimentType);
        
        
    }
    
    
    /**@return {string}*/
    get root_abs_path() {
        return this.get('root_abs_path');
    }
    
    /**@param {string[]} subjectList*/
    set subjects(subjectList) {
        const subjects = [ ...new Set(subjectList) ];
        console.log('💾 set subjects:', subjects);
        this.set('subjects', subjects);
        const config = this.config();
        const currentSubject = config.current_subject;
        if ( currentSubject && !currentSubject.in(subjects) )
            config.current_subject = null;
    }
    
    /**@return {string}*/
    configsPath() {
        return path.join(this.root_abs_path, 'experiments', 'configs');
    }
    
    /**"C:\Sync\Code\Python\Pyano\pyano_01\src\experiments\truths"
     @return {string}*/
    truthsDirPath() {
        return path.join(this.root_abs_path, 'experiments', 'truths');
    }
    
    /**@param {String?} extFilter
     @return {string[]} truthFiles*/
    truthFilesList(extFilter = null) {
        if ( extFilter != null )
            if ( !extFilter.in([ 'txt', 'mid', 'mp4' ]) )
                throw new Error(`truthFilesList(extFilter = ${extFilter}), must be either ['txt','mid','mp4'] or not at all`);
        
        const truthsDirPath = this.truthsDirPath();
        
        let truthFiles = [ ...new Set(fs.readdirSync(truthsDirPath)) ];
        if ( extFilter != null )
            return truthFiles.filter(f => path.extname(f) == `.${extFilter}`);
        return truthFiles;
    }
    
    
    /** "C:\Sync\Code\Python\Pyano\pyano_01\src\experiments\subjects"
     @return {string} */
    subjectsDirPath() {
        return path.join(this.root_abs_path, 'experiments', 'subjects');
    }
    
    
    salamanderDirPath() {
        return path.join(this.root_abs_path, 'templates', 'Salamander/');
    }
    
    
    /**
     * @return {{
     * skip_whole_truth: (function(): boolean),
     * skip_level_intro: (function(): boolean),
     * skip_failed_trial_feedback: (function(): boolean),
     * skip_passed_trial_feedback: (function(): boolean)
     * toObj}
     * }
     */
    get dev() {
        const _dev = this.get('dev');
        return {
            skip_whole_truth : () => _dev && this.get('devoptions.skip_whole_truth'),
            skip_level_intro : () => _dev && this.get('devoptions.skip_level_intro'),
            skip_passed_trial_feedback : () => _dev && this.get('devoptions.skip_passed_trial_feedback'),
            skip_failed_trial_feedback : () => _dev && this.get('devoptions.skip_failed_trial_feedback'),
        };
    }
    
    
}
