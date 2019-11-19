"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Store = require("electron-store");
const path = require("path");
const fs = require("fs");
const MyAlert_1 = require("../MyAlert");
const MyFs_1 = require("../MyFs");
const util_1 = require("../util");
console.log('src/MyStore/index.ts');
function MyStoreFn() {
    console.log('MyStoreFn');
}
exports.MyStoreFn = MyStoreFn;
class MyStore extends Store {
    constructor(_doTruthFileCheck = true) {
        super();
        if (_doTruthFileCheck)
            this._doTruthFileCheck();
    }
    _doTruthFileCheck() {
        console.log('💾 MyStore._doTruthFileCheck()');
        const truth = this.truth();
        truth.txt.allExist()
            .then(async (exist) => {
            if (exist) {
                return MyAlert_1.default.small.success(`All "${truth.name}" txt files exist.`);
            }
            else {
                const txtFilesList = this.truthFilesList('txt').map(MyFs_1.default.remove_ext);
                const filteredTxts = txtFilesList.filter(a => txtFilesList.filter(txt => txt.startsWith(a)).length >= 3);
                if (!util_1.bool(filteredTxts))
                    return await MyAlert_1.default.big.warning({
                        title: 'No valid truth files found',
                        html: 'There needs to be at least one txt file with 2 "on" and "off" counterparts.'
                    });
                await MyAlert_1.default.big.blocking({
                    title: `Truth file invalid: ${truth.name}`,
                    html: '<b>Please choose one of the following valid truths:</b>',
                }, {
                    strings: filteredTxts,
                    clickFn: async ($s) => {
                        try {
                            const config = this.config();
                            config.finished_trials_count = 0;
                            config.levels = [];
                            this.truth_file_path = new Truth(path.join(this.truthsDirPath(), $s.text()));
                            util_1.reloadPage();
                        }
                        catch (err) {
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
        if (type)
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
        if (Array.isArray(V)) {
            this.set(K, [...V, kv]);
        }
        else {
            Object.assign(V, kv);
            this.set(K, V);
        }
        return this.get(K);
    }
    /** @param {string} K*/
    increase(K) {
        let V = this.get(K);
        if (V === undefined)
            this.set(K, 1);
        else if (!isNaN(Math.floor(V)))
            this.set(K, util_1.int(V) + 1);
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
            if (exist) {
                this.set(`truth_file_path`, `experiments/truths/${truth.txt.base.name}`);
            }
            else {
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
        const validpages = ['new_test', 'inside_test', 'record', 'file_tools', 'settings'];
        if (!page.in(validpages))
            throw new Error(`setLastPage(page = ${page}), must be one of ${validpages.join(', ')}`);
        this.set('last_page', page);
    }
    /**@return {TExperimentType}*/
    get experiment_type() {
        return this.get('experiment_type');
    }
    /**@param {TExperimentType} experimentType*/
    set experiment_type(experimentType) {
        if (experimentType != 'test' && experimentType != 'exam')
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
        const subjects = [...new Set(subjectList)];
        console.log('💾 set subjects:', subjects);
        this.set('subjects', subjects);
        const config = this.config();
        const currentSubject = config.current_subject;
        if (currentSubject && !currentSubject.in(subjects))
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
        if (extFilter != null)
            if (!extFilter.in(['txt', 'mid', 'mp4']))
                throw new Error(`truthFilesList(extFilter = ${extFilter}), must be either ['txt','mid','mp4'] or not at all`);
        const truthsDirPath = this.truthsDirPath();
        let truthFiles = [...new Set(fs.readdirSync(truthsDirPath))];
        if (extFilter != null)
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
            skip_whole_truth: () => _dev && this.get('devoptions.skip_whole_truth'),
            skip_level_intro: () => _dev && this.get('devoptions.skip_level_intro'),
            skip_passed_trial_feedback: () => _dev && this.get('devoptions.skip_passed_trial_feedback'),
            skip_failed_trial_feedback: () => _dev && this.get('devoptions.skip_failed_trial_feedback'),
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFDM0Isa0NBQXlEO0FBRXpELE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUVwQyxTQUFnQixTQUFTO0lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUZELDhCQUVDO0FBRUQsTUFBTSxPQUFRLFNBQVEsS0FBSztJQUV2QixZQUFZLGlCQUFpQixHQUFHLElBQUk7UUFDaEMsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFLLGlCQUFpQjtZQUNsQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUdqQyxDQUFDO0lBR08saUJBQWlCO1FBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUU5QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7YUFDZCxJQUFJLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxFQUFFO1lBQ2hCLElBQUssS0FBSyxFQUFHO2dCQUNULE9BQU8saUJBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsS0FBSyxDQUFDLElBQUksb0JBQW9CLENBQUMsQ0FBQzthQUN0RTtpQkFBTTtnQkFDSCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3JFLE1BQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FB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LEVBQUUsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBQztZQUN4RSwwQkFBMEIsRUFBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsQ0FBQztZQUM1RiwwQkFBMEIsRUFBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsQ0FBQztTQUMvRixDQUFDO0lBQ04sQ0FBQztDQUdKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgU3RvcmUgZnJvbSBcImVsZWN0cm9uLXN0b3JlXCI7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCBBbGVydCBmcm9tIFwiLi4vTXlBbGVydFwiO1xuaW1wb3J0IG15ZnMgZnJvbSBcIi4uL015RnNcIjtcbmltcG9ydCB7IGFsbCwgYW55LCBib29sLCByZWxvYWRQYWdlLGludCB9IGZyb20gXCIuLi91dGlsXCI7XG5cbmNvbnNvbGUubG9nKCdzcmMvTXlTdG9yZS9pbmRleC50cycpO1xuXG5leHBvcnQgZnVuY3Rpb24gTXlTdG9yZUZuKCkge1xuICAgIGNvbnNvbGUubG9nKCdNeVN0b3JlRm4nKTtcbn1cblxuY2xhc3MgTXlTdG9yZSBleHRlbmRzIFN0b3JlIHtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihfZG9UcnV0aEZpbGVDaGVjayA9IHRydWUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgaWYgKCBfZG9UcnV0aEZpbGVDaGVjayApXG4gICAgICAgICAgICB0aGlzLl9kb1RydXRoRmlsZUNoZWNrKCk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgcHJpdmF0ZSBfZG9UcnV0aEZpbGVDaGVjaygpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfkr4gTXlTdG9yZS5fZG9UcnV0aEZpbGVDaGVjaygpJyk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB0cnV0aCA9IHRoaXMudHJ1dGgoKTtcbiAgICAgICAgdHJ1dGgudHh0LmFsbEV4aXN0KClcbiAgICAgICAgICAgICAudGhlbihhc3luYyBleGlzdCA9PiB7XG4gICAgICAgICAgICAgICAgIGlmICggZXhpc3QgKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gQWxlcnQuc21hbGwuc3VjY2VzcyhgQWxsIFwiJHt0cnV0aC5uYW1lfVwiIHR4dCBmaWxlcyBleGlzdC5gKTtcbiAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHR4dEZpbGVzTGlzdCA9IHRoaXMudHJ1dGhGaWxlc0xpc3QoJ3R4dCcpLm1hcChteWZzLnJlbW92ZV9leHQpO1xuICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsdGVyZWRUeHRzID0gdHh0RmlsZXNMaXN0LmZpbHRlcihhID0+IHR4dEZpbGVzTGlzdC5maWx0ZXIodHh0ID0+IHR4dC5zdGFydHNXaXRoKGEpKS5sZW5ndGggPj0gMyk7XG4gICAgICAgICAgICAgICAgICAgICBpZiAoICFib29sKGZpbHRlcmVkVHh0cykgKVxuICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBBbGVydC5iaWcud2FybmluZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlIDogJ05vIHZhbGlkIHRydXRoIGZpbGVzIGZvdW5kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA6ICdUaGVyZSBuZWVkcyB0byBiZSBhdCBsZWFzdCBvbmUgdHh0IGZpbGUgd2l0aCAyIFwib25cIiBhbmQgXCJvZmZcIiBjb3VudGVycGFydHMuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgYXdhaXQgQWxlcnQuYmlnLmJsb2NraW5nKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZSA6IGBUcnV0aCBmaWxlIGludmFsaWQ6ICR7dHJ1dGgubmFtZX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgOiAnPGI+UGxlYXNlIGNob29zZSBvbmUgb2YgdGhlIGZvbGxvd2luZyB2YWxpZCB0cnV0aHM6PC9iPicsXG4gICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5ncyA6IGZpbHRlcmVkVHh0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICBjbGlja0ZuIDogYXN5bmMgJHMgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5jb25maWcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5maW5pc2hlZF90cmlhbHNfY291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLmxldmVscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cnV0aF9maWxlX3BhdGggPSBuZXcgVHJ1dGgocGF0aC5qb2luKHRoaXMudHJ1dGhzRGlyUGF0aCgpLCAkcy50ZXh0KCkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbG9hZFBhZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoIGVyciApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzd2FsMi10aXRsZScpLmlubmVyVGV4dCA9IGVyci5tZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N3YWwyLWNvbnRlbnQnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc3dhbDItaWNvbiBzd2FsMi13YXJuaW5nJylbMF0uc3R5bGUuZGlzcGxheSA9ICdpbmhlcml0JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8qKkBwYXJhbSB7VFNhdmVkQ29uZmlnfSBzYXZlZENvbmZpZ1xuICAgICAqIEBwYXJhbSB7VEV4cGVyaW1lbnRUeXBlfSBleHBlcmltZW50VHlwZSovXG4gICAgZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnLCBleHBlcmltZW50VHlwZSkge1xuICAgICAgICBjb25zdCB0cnV0aHNEaXJQYXRoID0gdGhpcy50cnV0aHNEaXJQYXRoKCk7XG4gICAgICAgIGNvbnN0IHRydXRoRmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKHNhdmVkQ29uZmlnLnRydXRoX2ZpbGVfcGF0aCwgJy50eHQnKTtcbiAgICAgICAgdGhpcy50cnV0aF9maWxlX3BhdGggPSBuZXcgVHJ1dGgocGF0aC5qb2luKHRydXRoc0RpclBhdGgsIHRydXRoRmlsZU5hbWUpKTtcbiAgICAgICAgdGhpcy5leHBlcmltZW50X3R5cGUgPSBleHBlcmltZW50VHlwZTtcbiAgICAgICAgdGhpcy5jb25maWcoKS5mcm9tU2F2ZWRDb25maWcoc2F2ZWRDb25maWcpO1xuICAgIH1cbiAgICBcbiAgICAvKipAcGFyYW0ge1RFeHBlcmltZW50VHlwZT99IHR5cGVcbiAgICAgKiBAcmV0dXJuIHtDb25maWd9Ki9cbiAgICBjb25maWcodHlwZSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoIHR5cGUgKVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb25maWcodHlwZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29uZmlnKHRoaXMuZXhwZXJpbWVudF90eXBlKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGV4YW1wbGVcbiAgICAgdXBkYXRlKCdzdWJqZWN0cycsIFtuYW1lc10pXG4gICAgIEBwYXJhbSB7c3RyaW5nfSBLXG4gICAgIEBwYXJhbSBrdlxuICAgICBAcmV0dXJuIHsqfSAqL1xuICAgIHVwZGF0ZShLLCBrdikge1xuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBpZiAoIEFycmF5LmlzQXJyYXkoVikgKSB7XG4gICAgICAgICAgICB0aGlzLnNldChLLCBbIC4uLlYsIGt2IF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihWLCBrdik7XG4gICAgICAgICAgICB0aGlzLnNldChLLCBWKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXQoSyk7XG4gICAgfVxuICAgIFxuICAgIC8qKiBAcGFyYW0ge3N0cmluZ30gSyovXG4gICAgaW5jcmVhc2UoSykge1xuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBWID09PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgMSk7XG4gICAgICAgIGVsc2UgaWYgKCAhaXNOYU4oTWF0aC5mbG9vcihWKSkgKVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgaW50KFYpICsgMSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJNeVN0b3JlIHRyaWVkIHRvIGluY3JlYXNlIGEgdmFsdWUgdGhhdCBpcyBub3QgYSBudW1iZXIgb3Igc3RyaW5nXCIpO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLyoqQHJldHVybiB7VHJ1dGh9Ki9cbiAgICB0cnV0aCgpIHtcbiAgICAgICAgY29uc3QgdHJ1dGhzRGlyUGF0aCA9IHRoaXMudHJ1dGhzRGlyUGF0aCgpO1xuICAgICAgICBjb25zdCB0cnV0aEZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZSh0aGlzLnRydXRoX2ZpbGVfcGF0aCwgJy50eHQnKTtcbiAgICAgICAgcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odHJ1dGhzRGlyUGF0aCwgdHJ1dGhGaWxlTmFtZSkpO1xuICAgIH1cbiAgICBcbiAgICAvKipAcGFyYW0ge1RydXRofSB0cnV0aCovXG4gICAgc2V0IHRydXRoX2ZpbGVfcGF0aCh0cnV0aCkge1xuICAgICAgICB0cnV0aC50eHQuYWxsRXhpc3QoKVxuICAgICAgICAgICAgIC50aGVuKGV4aXN0ID0+IHtcbiAgICAgICAgICAgICAgICAgaWYgKCBleGlzdCApIHtcbiAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0KGB0cnV0aF9maWxlX3BhdGhgLCBgZXhwZXJpbWVudHMvdHJ1dGhzLyR7dHJ1dGgudHh0LmJhc2UubmFtZX1gKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IGFsbCB0eHQgZmlsZXMgb2YgdHJ1dGggZXhpc3Q6ICR7dHJ1dGgudHh0LmJhc2UubmFtZX1gKTtcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICAvKipAcmV0dXJuIHtzdHJpbmd9Ki9cbiAgICBnZXQgdHJ1dGhfZmlsZV9wYXRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ3RydXRoX2ZpbGVfcGF0aCcpO1xuICAgIH1cbiAgICBcbiAgICAvLyAvKipAcmV0dXJuIHtzdHJpbmd9Ki9cbiAgICAvLyBnZXQgc2F2ZV9wYXRoKCkge1xuICAgIC8vIFx0cmV0dXJuIHRoaXMuZ2V0KCdzYXZlX3BhdGgnKTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyAvKipAcGFyYW0ge3N0cmluZ30gc2F2ZVBhdGgqL1xuICAgIC8vIHNldCBzYXZlX3BhdGgoc2F2ZVBhdGgpIHtcbiAgICAvLyBcdHRoaXMuc2V0KCdzYXZlX3BhdGgnLCBzYXZlUGF0aCk7XG4gICAgLy8gfVxuICAgIFxuICAgIC8qKkByZXR1cm4ge1RMYXN0UGFnZX0qL1xuICAgIGdldCBsYXN0X3BhZ2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnbGFzdF9wYWdlJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKkBwYXJhbSB7VExhc3RQYWdlfSBwYWdlKi9cbiAgICBzZXQgbGFzdF9wYWdlKHBhZ2UpIHtcbiAgICAgICAgY29uc3QgdmFsaWRwYWdlcyA9IFsgJ25ld190ZXN0JywgJ2luc2lkZV90ZXN0JywgJ3JlY29yZCcsICdmaWxlX3Rvb2xzJywgJ3NldHRpbmdzJyBdO1xuICAgICAgICBpZiAoICFwYWdlLmluKHZhbGlkcGFnZXMpIClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgc2V0TGFzdFBhZ2UocGFnZSA9ICR7cGFnZX0pLCBtdXN0IGJlIG9uZSBvZiAke3ZhbGlkcGFnZXMuam9pbignLCAnKX1gKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCBwYWdlKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQHJldHVybiB7VEV4cGVyaW1lbnRUeXBlfSovXG4gICAgZ2V0IGV4cGVyaW1lbnRfdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdleHBlcmltZW50X3R5cGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQHBhcmFtIHtURXhwZXJpbWVudFR5cGV9IGV4cGVyaW1lbnRUeXBlKi9cbiAgICBzZXQgZXhwZXJpbWVudF90eXBlKGV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIGlmICggZXhwZXJpbWVudFR5cGUgIT0gJ3Rlc3QnICYmIGV4cGVyaW1lbnRUeXBlICE9ICdleGFtJyApXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE15U3RvcmUgZXhwZXJpbWVudF90eXBlIHNldHRlciwgZ290IGV4cGVyaW1lbnRUeXBlOiAnJHtleHBlcmltZW50VHlwZX0nLiBNdXN0IGJlIGVpdGhlciAndGVzdCcgb3IgJ2V4YW0nYCk7XG4gICAgICAgIHRoaXMuc2V0KCdleHBlcmltZW50X3R5cGUnLCBleHBlcmltZW50VHlwZSk7XG4gICAgICAgIC8vIHRoaXMuX3VwZGF0ZVNhdmVkRmlsZSgnZXhwZXJpbWVudF90eXBlJywgZXhwZXJpbWVudFR5cGUpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkByZXR1cm4ge3N0cmluZ30qL1xuICAgIGdldCByb290X2Fic19wYXRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ3Jvb3RfYWJzX3BhdGgnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQHBhcmFtIHtzdHJpbmdbXX0gc3ViamVjdExpc3QqL1xuICAgIHNldCBzdWJqZWN0cyhzdWJqZWN0TGlzdCkge1xuICAgICAgICBjb25zdCBzdWJqZWN0cyA9IFsgLi4ubmV3IFNldChzdWJqZWN0TGlzdCkgXTtcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfkr4gc2V0IHN1YmplY3RzOicsIHN1YmplY3RzKTtcbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3RzJywgc3ViamVjdHMpO1xuICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmNvbmZpZygpO1xuICAgICAgICBjb25zdCBjdXJyZW50U3ViamVjdCA9IGNvbmZpZy5jdXJyZW50X3N1YmplY3Q7XG4gICAgICAgIGlmICggY3VycmVudFN1YmplY3QgJiYgIWN1cnJlbnRTdWJqZWN0LmluKHN1YmplY3RzKSApXG4gICAgICAgICAgICBjb25maWcuY3VycmVudF9zdWJqZWN0ID0gbnVsbDtcbiAgICB9XG4gICAgXG4gICAgLyoqQHJldHVybiB7c3RyaW5nfSovXG4gICAgY29uZmlnc1BhdGgoKSB7XG4gICAgICAgIHJldHVybiBwYXRoLmpvaW4odGhpcy5yb290X2Fic19wYXRoLCAnZXhwZXJpbWVudHMnLCAnY29uZmlncycpO1xuICAgIH1cbiAgICBcbiAgICAvKipcIkM6XFxTeW5jXFxDb2RlXFxQeXRob25cXFB5YW5vXFxweWFub18wMVxcc3JjXFxleHBlcmltZW50c1xcdHJ1dGhzXCJcbiAgICAgQHJldHVybiB7c3RyaW5nfSovXG4gICAgdHJ1dGhzRGlyUGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbih0aGlzLnJvb3RfYWJzX3BhdGgsICdleHBlcmltZW50cycsICd0cnV0aHMnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQHBhcmFtIHtTdHJpbmc/fSBleHRGaWx0ZXJcbiAgICAgQHJldHVybiB7c3RyaW5nW119IHRydXRoRmlsZXMqL1xuICAgIHRydXRoRmlsZXNMaXN0KGV4dEZpbHRlciA9IG51bGwpIHtcbiAgICAgICAgaWYgKCBleHRGaWx0ZXIgIT0gbnVsbCApXG4gICAgICAgICAgICBpZiAoICFleHRGaWx0ZXIuaW4oWyAndHh0JywgJ21pZCcsICdtcDQnIF0pIClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHRydXRoRmlsZXNMaXN0KGV4dEZpbHRlciA9ICR7ZXh0RmlsdGVyfSksIG11c3QgYmUgZWl0aGVyIFsndHh0JywnbWlkJywnbXA0J10gb3Igbm90IGF0IGFsbGApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdHJ1dGhzRGlyUGF0aCA9IHRoaXMudHJ1dGhzRGlyUGF0aCgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IHRydXRoRmlsZXMgPSBbIC4uLm5ldyBTZXQoZnMucmVhZGRpclN5bmModHJ1dGhzRGlyUGF0aCkpIF07XG4gICAgICAgIGlmICggZXh0RmlsdGVyICE9IG51bGwgKVxuICAgICAgICAgICAgcmV0dXJuIHRydXRoRmlsZXMuZmlsdGVyKGYgPT4gcGF0aC5leHRuYW1lKGYpID09IGAuJHtleHRGaWx0ZXJ9YCk7XG4gICAgICAgIHJldHVybiB0cnV0aEZpbGVzO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKiogXCJDOlxcU3luY1xcQ29kZVxcUHl0aG9uXFxQeWFub1xccHlhbm9fMDFcXHNyY1xcZXhwZXJpbWVudHNcXHN1YmplY3RzXCJcbiAgICAgQHJldHVybiB7c3RyaW5nfSAqL1xuICAgIHN1YmplY3RzRGlyUGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbih0aGlzLnJvb3RfYWJzX3BhdGgsICdleHBlcmltZW50cycsICdzdWJqZWN0cycpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBzYWxhbWFuZGVyRGlyUGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbih0aGlzLnJvb3RfYWJzX3BhdGgsICd0ZW1wbGF0ZXMnLCAnU2FsYW1hbmRlci8nKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogQHJldHVybiB7e1xuICAgICAqIHNraXBfd2hvbGVfdHJ1dGg6IChmdW5jdGlvbigpOiBib29sZWFuKSxcbiAgICAgKiBza2lwX2xldmVsX2ludHJvOiAoZnVuY3Rpb24oKTogYm9vbGVhbiksXG4gICAgICogc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2s6IChmdW5jdGlvbigpOiBib29sZWFuKSxcbiAgICAgKiBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjazogKGZ1bmN0aW9uKCk6IGJvb2xlYW4pXG4gICAgICogdG9PYmp9XG4gICAgICogfVxuICAgICAqL1xuICAgIGdldCBkZXYoKSB7XG4gICAgICAgIGNvbnN0IF9kZXYgPSB0aGlzLmdldCgnZGV2Jyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBza2lwX3dob2xlX3RydXRoIDogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucy5za2lwX3dob2xlX3RydXRoJyksXG4gICAgICAgICAgICBza2lwX2xldmVsX2ludHJvIDogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucy5za2lwX2xldmVsX2ludHJvJyksXG4gICAgICAgICAgICBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjayA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMuc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2snKSxcbiAgICAgICAgICAgIHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrIDogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucy5za2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjaycpLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBcbiAgICBcbn1cbiJdfQ==