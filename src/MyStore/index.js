"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Store = require("electron-store");
const path = require("path");
const fs = require("fs");
const MyAlert_1 = require("../MyAlert");
const MyFs_1 = require("../MyFs");
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
                if (!bool(filteredTxts))
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
                            reloadPage();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4Qyw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLHdDQUErQjtBQUMvQixrQ0FBMkI7QUFFM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBRXBDLFNBQWdCLFNBQVM7SUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRkQsOEJBRUM7QUFFRCxNQUFNLE9BQVEsU0FBUSxLQUFLO0lBRXZCLFlBQVksaUJBQWlCLEdBQUcsSUFBSTtRQUNoQyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUssaUJBQWlCO1lBQ2xCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBR2pDLENBQUM7SUFHTyxpQkFBaUI7UUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1FBRTlDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMzQixLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTthQUNkLElBQUksQ0FBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEVBQUU7WUFDaEIsSUFBSyxLQUFLLEVBQUc7Z0JBQ1QsT0FBTyxpQkFBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxLQUFLLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxDQUFDO2FBQ3RFO2lCQUFNO2dCQUNILE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDckUsTUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxH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SSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUM7WUFDeEUsMEJBQTBCLEVBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsdUNBQXVDLENBQUM7WUFDNUYsMEJBQTBCLEVBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsdUNBQXVDLENBQUM7U0FDL0YsQ0FBQztJQUNOLENBQUM7Q0FHSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFN0b3JlIGZyb20gXCJlbGVjdHJvbi1zdG9yZVwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgQWxlcnQgZnJvbSBcIi4uL015QWxlcnRcIjtcbmltcG9ydCBteWZzIGZyb20gXCIuLi9NeUZzXCI7XG5cbmNvbnNvbGUubG9nKCdzcmMvTXlTdG9yZS9pbmRleC50cycpO1xuXG5leHBvcnQgZnVuY3Rpb24gTXlTdG9yZUZuKCkge1xuICAgIGNvbnNvbGUubG9nKCdNeVN0b3JlRm4nKTtcbn1cblxuY2xhc3MgTXlTdG9yZSBleHRlbmRzIFN0b3JlIHtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihfZG9UcnV0aEZpbGVDaGVjayA9IHRydWUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgaWYgKCBfZG9UcnV0aEZpbGVDaGVjayApXG4gICAgICAgICAgICB0aGlzLl9kb1RydXRoRmlsZUNoZWNrKCk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgXG4gICAgcHJpdmF0ZSBfZG9UcnV0aEZpbGVDaGVjaygpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfkr4gTXlTdG9yZS5fZG9UcnV0aEZpbGVDaGVjaygpJyk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB0cnV0aCA9IHRoaXMudHJ1dGgoKTtcbiAgICAgICAgdHJ1dGgudHh0LmFsbEV4aXN0KClcbiAgICAgICAgICAgICAudGhlbihhc3luYyBleGlzdCA9PiB7XG4gICAgICAgICAgICAgICAgIGlmICggZXhpc3QgKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gQWxlcnQuc21hbGwuc3VjY2VzcyhgQWxsIFwiJHt0cnV0aC5uYW1lfVwiIHR4dCBmaWxlcyBleGlzdC5gKTtcbiAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHR4dEZpbGVzTGlzdCA9IHRoaXMudHJ1dGhGaWxlc0xpc3QoJ3R4dCcpLm1hcChteWZzLnJlbW92ZV9leHQpO1xuICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsdGVyZWRUeHRzID0gdHh0RmlsZXNMaXN0LmZpbHRlcihhID0+IHR4dEZpbGVzTGlzdC5maWx0ZXIodHh0ID0+IHR4dC5zdGFydHNXaXRoKGEpKS5sZW5ndGggPj0gMyk7XG4gICAgICAgICAgICAgICAgICAgICBpZiAoICFib29sKGZpbHRlcmVkVHh0cykgKVxuICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBBbGVydC5iaWcud2FybmluZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlIDogJ05vIHZhbGlkIHRydXRoIGZpbGVzIGZvdW5kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA6ICdUaGVyZSBuZWVkcyB0byBiZSBhdCBsZWFzdCBvbmUgdHh0IGZpbGUgd2l0aCAyIFwib25cIiBhbmQgXCJvZmZcIiBjb3VudGVycGFydHMuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgYXdhaXQgQWxlcnQuYmlnLmJsb2NraW5nKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZSA6IGBUcnV0aCBmaWxlIGludmFsaWQ6ICR7dHJ1dGgubmFtZX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgOiAnPGI+UGxlYXNlIGNob29zZSBvbmUgb2YgdGhlIGZvbGxvd2luZyB2YWxpZCB0cnV0aHM6PC9iPicsXG4gICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5ncyA6IGZpbHRlcmVkVHh0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICBjbGlja0ZuIDogYXN5bmMgJHMgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5jb25maWcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5maW5pc2hlZF90cmlhbHNfY291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLmxldmVscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cnV0aF9maWxlX3BhdGggPSBuZXcgVHJ1dGgocGF0aC5qb2luKHRoaXMudHJ1dGhzRGlyUGF0aCgpLCAkcy50ZXh0KCkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbG9hZFBhZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoIGVyciApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzd2FsMi10aXRsZScpLmlubmVyVGV4dCA9IGVyci5tZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N3YWwyLWNvbnRlbnQnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc3dhbDItaWNvbiBzd2FsMi13YXJuaW5nJylbMF0uc3R5bGUuZGlzcGxheSA9ICdpbmhlcml0JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIC8qKkBwYXJhbSB7VFNhdmVkQ29uZmlnfSBzYXZlZENvbmZpZ1xuICAgICAqIEBwYXJhbSB7VEV4cGVyaW1lbnRUeXBlfSBleHBlcmltZW50VHlwZSovXG4gICAgZnJvbVNhdmVkQ29uZmlnKHNhdmVkQ29uZmlnLCBleHBlcmltZW50VHlwZSkge1xuICAgICAgICBjb25zdCB0cnV0aHNEaXJQYXRoID0gdGhpcy50cnV0aHNEaXJQYXRoKCk7XG4gICAgICAgIGNvbnN0IHRydXRoRmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKHNhdmVkQ29uZmlnLnRydXRoX2ZpbGVfcGF0aCwgJy50eHQnKTtcbiAgICAgICAgdGhpcy50cnV0aF9maWxlX3BhdGggPSBuZXcgVHJ1dGgocGF0aC5qb2luKHRydXRoc0RpclBhdGgsIHRydXRoRmlsZU5hbWUpKTtcbiAgICAgICAgdGhpcy5leHBlcmltZW50X3R5cGUgPSBleHBlcmltZW50VHlwZTtcbiAgICAgICAgdGhpcy5jb25maWcoKS5mcm9tU2F2ZWRDb25maWcoc2F2ZWRDb25maWcpO1xuICAgIH1cbiAgICBcbiAgICAvKipAcGFyYW0ge1RFeHBlcmltZW50VHlwZT99IHR5cGVcbiAgICAgKiBAcmV0dXJuIHtDb25maWd9Ki9cbiAgICBjb25maWcodHlwZSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoIHR5cGUgKVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb25maWcodHlwZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29uZmlnKHRoaXMuZXhwZXJpbWVudF90eXBlKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQGV4YW1wbGVcbiAgICAgdXBkYXRlKCdzdWJqZWN0cycsIFtuYW1lc10pXG4gICAgIEBwYXJhbSB7c3RyaW5nfSBLXG4gICAgIEBwYXJhbSBrdlxuICAgICBAcmV0dXJuIHsqfSAqL1xuICAgIHVwZGF0ZShLLCBrdikge1xuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBpZiAoIEFycmF5LmlzQXJyYXkoVikgKSB7XG4gICAgICAgICAgICB0aGlzLnNldChLLCBbIC4uLlYsIGt2IF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihWLCBrdik7XG4gICAgICAgICAgICB0aGlzLnNldChLLCBWKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXQoSyk7XG4gICAgfVxuICAgIFxuICAgIC8qKiBAcGFyYW0ge3N0cmluZ30gSyovXG4gICAgaW5jcmVhc2UoSykge1xuICAgICAgICBsZXQgViA9IHRoaXMuZ2V0KEspO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBWID09PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgMSk7XG4gICAgICAgIGVsc2UgaWYgKCAhaXNOYU4oTWF0aC5mbG9vcihWKSkgKVxuICAgICAgICAgICAgdGhpcy5zZXQoSywgaW50KFYpICsgMSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJNeVN0b3JlIHRyaWVkIHRvIGluY3JlYXNlIGEgdmFsdWUgdGhhdCBpcyBub3QgYSBudW1iZXIgb3Igc3RyaW5nXCIpO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgLyoqQHJldHVybiB7VHJ1dGh9Ki9cbiAgICB0cnV0aCgpIHtcbiAgICAgICAgY29uc3QgdHJ1dGhzRGlyUGF0aCA9IHRoaXMudHJ1dGhzRGlyUGF0aCgpO1xuICAgICAgICBjb25zdCB0cnV0aEZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZSh0aGlzLnRydXRoX2ZpbGVfcGF0aCwgJy50eHQnKTtcbiAgICAgICAgcmV0dXJuIG5ldyBUcnV0aChwYXRoLmpvaW4odHJ1dGhzRGlyUGF0aCwgdHJ1dGhGaWxlTmFtZSkpO1xuICAgIH1cbiAgICBcbiAgICAvKipAcGFyYW0ge1RydXRofSB0cnV0aCovXG4gICAgc2V0IHRydXRoX2ZpbGVfcGF0aCh0cnV0aCkge1xuICAgICAgICB0cnV0aC50eHQuYWxsRXhpc3QoKVxuICAgICAgICAgICAgIC50aGVuKGV4aXN0ID0+IHtcbiAgICAgICAgICAgICAgICAgaWYgKCBleGlzdCApIHtcbiAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0KGB0cnV0aF9maWxlX3BhdGhgLCBgZXhwZXJpbWVudHMvdHJ1dGhzLyR7dHJ1dGgudHh0LmJhc2UubmFtZX1gKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IGFsbCB0eHQgZmlsZXMgb2YgdHJ1dGggZXhpc3Q6ICR7dHJ1dGgudHh0LmJhc2UubmFtZX1gKTtcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICAvKipAcmV0dXJuIHtzdHJpbmd9Ki9cbiAgICBnZXQgdHJ1dGhfZmlsZV9wYXRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ3RydXRoX2ZpbGVfcGF0aCcpO1xuICAgIH1cbiAgICBcbiAgICAvLyAvKipAcmV0dXJuIHtzdHJpbmd9Ki9cbiAgICAvLyBnZXQgc2F2ZV9wYXRoKCkge1xuICAgIC8vIFx0cmV0dXJuIHRoaXMuZ2V0KCdzYXZlX3BhdGgnKTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyAvKipAcGFyYW0ge3N0cmluZ30gc2F2ZVBhdGgqL1xuICAgIC8vIHNldCBzYXZlX3BhdGgoc2F2ZVBhdGgpIHtcbiAgICAvLyBcdHRoaXMuc2V0KCdzYXZlX3BhdGgnLCBzYXZlUGF0aCk7XG4gICAgLy8gfVxuICAgIFxuICAgIC8qKkByZXR1cm4ge1RMYXN0UGFnZX0qL1xuICAgIGdldCBsYXN0X3BhZ2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnbGFzdF9wYWdlJyk7XG4gICAgfVxuICAgIFxuICAgIC8qKkBwYXJhbSB7VExhc3RQYWdlfSBwYWdlKi9cbiAgICBzZXQgbGFzdF9wYWdlKHBhZ2UpIHtcbiAgICAgICAgY29uc3QgdmFsaWRwYWdlcyA9IFsgJ25ld190ZXN0JywgJ2luc2lkZV90ZXN0JywgJ3JlY29yZCcsICdmaWxlX3Rvb2xzJywgJ3NldHRpbmdzJyBdO1xuICAgICAgICBpZiAoICFwYWdlLmluKHZhbGlkcGFnZXMpIClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgc2V0TGFzdFBhZ2UocGFnZSA9ICR7cGFnZX0pLCBtdXN0IGJlIG9uZSBvZiAke3ZhbGlkcGFnZXMuam9pbignLCAnKX1gKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuc2V0KCdsYXN0X3BhZ2UnLCBwYWdlKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqQHJldHVybiB7VEV4cGVyaW1lbnRUeXBlfSovXG4gICAgZ2V0IGV4cGVyaW1lbnRfdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdleHBlcmltZW50X3R5cGUnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQHBhcmFtIHtURXhwZXJpbWVudFR5cGV9IGV4cGVyaW1lbnRUeXBlKi9cbiAgICBzZXQgZXhwZXJpbWVudF90eXBlKGV4cGVyaW1lbnRUeXBlKSB7XG4gICAgICAgIGlmICggZXhwZXJpbWVudFR5cGUgIT0gJ3Rlc3QnICYmIGV4cGVyaW1lbnRUeXBlICE9ICdleGFtJyApXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE15U3RvcmUgZXhwZXJpbWVudF90eXBlIHNldHRlciwgZ290IGV4cGVyaW1lbnRUeXBlOiAnJHtleHBlcmltZW50VHlwZX0nLiBNdXN0IGJlIGVpdGhlciAndGVzdCcgb3IgJ2V4YW0nYCk7XG4gICAgICAgIHRoaXMuc2V0KCdleHBlcmltZW50X3R5cGUnLCBleHBlcmltZW50VHlwZSk7XG4gICAgICAgIC8vIHRoaXMuX3VwZGF0ZVNhdmVkRmlsZSgnZXhwZXJpbWVudF90eXBlJywgZXhwZXJpbWVudFR5cGUpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIFxuICAgIC8qKkByZXR1cm4ge3N0cmluZ30qL1xuICAgIGdldCByb290X2Fic19wYXRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ3Jvb3RfYWJzX3BhdGgnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQHBhcmFtIHtzdHJpbmdbXX0gc3ViamVjdExpc3QqL1xuICAgIHNldCBzdWJqZWN0cyhzdWJqZWN0TGlzdCkge1xuICAgICAgICBjb25zdCBzdWJqZWN0cyA9IFsgLi4ubmV3IFNldChzdWJqZWN0TGlzdCkgXTtcbiAgICAgICAgY29uc29sZS5sb2coJ/Cfkr4gc2V0IHN1YmplY3RzOicsIHN1YmplY3RzKTtcbiAgICAgICAgdGhpcy5zZXQoJ3N1YmplY3RzJywgc3ViamVjdHMpO1xuICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmNvbmZpZygpO1xuICAgICAgICBjb25zdCBjdXJyZW50U3ViamVjdCA9IGNvbmZpZy5jdXJyZW50X3N1YmplY3Q7XG4gICAgICAgIGlmICggY3VycmVudFN1YmplY3QgJiYgIWN1cnJlbnRTdWJqZWN0LmluKHN1YmplY3RzKSApXG4gICAgICAgICAgICBjb25maWcuY3VycmVudF9zdWJqZWN0ID0gbnVsbDtcbiAgICB9XG4gICAgXG4gICAgLyoqQHJldHVybiB7c3RyaW5nfSovXG4gICAgY29uZmlnc1BhdGgoKSB7XG4gICAgICAgIHJldHVybiBwYXRoLmpvaW4odGhpcy5yb290X2Fic19wYXRoLCAnZXhwZXJpbWVudHMnLCAnY29uZmlncycpO1xuICAgIH1cbiAgICBcbiAgICAvKipcIkM6XFxTeW5jXFxDb2RlXFxQeXRob25cXFB5YW5vXFxweWFub18wMVxcc3JjXFxleHBlcmltZW50c1xcdHJ1dGhzXCJcbiAgICAgQHJldHVybiB7c3RyaW5nfSovXG4gICAgdHJ1dGhzRGlyUGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbih0aGlzLnJvb3RfYWJzX3BhdGgsICdleHBlcmltZW50cycsICd0cnV0aHMnKTtcbiAgICB9XG4gICAgXG4gICAgLyoqQHBhcmFtIHtTdHJpbmc/fSBleHRGaWx0ZXJcbiAgICAgQHJldHVybiB7c3RyaW5nW119IHRydXRoRmlsZXMqL1xuICAgIHRydXRoRmlsZXNMaXN0KGV4dEZpbHRlciA9IG51bGwpIHtcbiAgICAgICAgaWYgKCBleHRGaWx0ZXIgIT0gbnVsbCApXG4gICAgICAgICAgICBpZiAoICFleHRGaWx0ZXIuaW4oWyAndHh0JywgJ21pZCcsICdtcDQnIF0pIClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHRydXRoRmlsZXNMaXN0KGV4dEZpbHRlciA9ICR7ZXh0RmlsdGVyfSksIG11c3QgYmUgZWl0aGVyIFsndHh0JywnbWlkJywnbXA0J10gb3Igbm90IGF0IGFsbGApO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdHJ1dGhzRGlyUGF0aCA9IHRoaXMudHJ1dGhzRGlyUGF0aCgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IHRydXRoRmlsZXMgPSBbIC4uLm5ldyBTZXQoZnMucmVhZGRpclN5bmModHJ1dGhzRGlyUGF0aCkpIF07XG4gICAgICAgIGlmICggZXh0RmlsdGVyICE9IG51bGwgKVxuICAgICAgICAgICAgcmV0dXJuIHRydXRoRmlsZXMuZmlsdGVyKGYgPT4gcGF0aC5leHRuYW1lKGYpID09IGAuJHtleHRGaWx0ZXJ9YCk7XG4gICAgICAgIHJldHVybiB0cnV0aEZpbGVzO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICAvKiogXCJDOlxcU3luY1xcQ29kZVxcUHl0aG9uXFxQeWFub1xccHlhbm9fMDFcXHNyY1xcZXhwZXJpbWVudHNcXHN1YmplY3RzXCJcbiAgICAgQHJldHVybiB7c3RyaW5nfSAqL1xuICAgIHN1YmplY3RzRGlyUGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbih0aGlzLnJvb3RfYWJzX3BhdGgsICdleHBlcmltZW50cycsICdzdWJqZWN0cycpO1xuICAgIH1cbiAgICBcbiAgICBcbiAgICBzYWxhbWFuZGVyRGlyUGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHBhdGguam9pbih0aGlzLnJvb3RfYWJzX3BhdGgsICd0ZW1wbGF0ZXMnLCAnU2FsYW1hbmRlci8nKTtcbiAgICB9XG4gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogQHJldHVybiB7e1xuICAgICAqIHNraXBfd2hvbGVfdHJ1dGg6IChmdW5jdGlvbigpOiBib29sZWFuKSxcbiAgICAgKiBza2lwX2xldmVsX2ludHJvOiAoZnVuY3Rpb24oKTogYm9vbGVhbiksXG4gICAgICogc2tpcF9mYWlsZWRfdHJpYWxfZmVlZGJhY2s6IChmdW5jdGlvbigpOiBib29sZWFuKSxcbiAgICAgKiBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjazogKGZ1bmN0aW9uKCk6IGJvb2xlYW4pXG4gICAgICogdG9PYmp9XG4gICAgICogfVxuICAgICAqL1xuICAgIGdldCBkZXYoKSB7XG4gICAgICAgIGNvbnN0IF9kZXYgPSB0aGlzLmdldCgnZGV2Jyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBza2lwX3dob2xlX3RydXRoIDogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucy5za2lwX3dob2xlX3RydXRoJyksXG4gICAgICAgICAgICBza2lwX2xldmVsX2ludHJvIDogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucy5za2lwX2xldmVsX2ludHJvJyksXG4gICAgICAgICAgICBza2lwX3Bhc3NlZF90cmlhbF9mZWVkYmFjayA6ICgpID0+IF9kZXYgJiYgdGhpcy5nZXQoJ2Rldm9wdGlvbnMuc2tpcF9wYXNzZWRfdHJpYWxfZmVlZGJhY2snKSxcbiAgICAgICAgICAgIHNraXBfZmFpbGVkX3RyaWFsX2ZlZWRiYWNrIDogKCkgPT4gX2RldiAmJiB0aGlzLmdldCgnZGV2b3B0aW9ucy5za2lwX2ZhaWxlZF90cmlhbF9mZWVkYmFjaycpLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBcbiAgICBcbn1cbiJdfQ==