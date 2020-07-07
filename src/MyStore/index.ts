import * as Store from "electron-store";
import { Truth } from "../Truth";
import { ILevel, Level, LevelCollection } from "../Level";
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


export interface ISubconfig {
    allowed_rhythm_deviation: number,
    allowed_tempo_deviation: number,
    demo_type: DemoType,
    errors_playrate: number,
    finished_trials_count: number,
    levels: ILevel[],
    name: string,
    subject: string,
    truth_file: string,
}


interface DevOptions {
    force_notes_number: null | number,
    force_playback_rate: null | number,
    mute_animation: boolean,
    no_reload_on_submit: boolean,
    simulate_test_mode: boolean,
    simulate_video_mode: boolean,
    simulate_animation_mode: boolean,
    skip_experiment_intro: boolean,
    skip_fade: boolean,
    skip_failed_trial_feedback: boolean,
    skip_level_intro: boolean,
    skip_midi_exists_check: boolean,
    skip_passed_trial_feedback: boolean,
}

interface IBigConfig {
    dev: boolean,
    devoptions: DevOptions,
    exam_file: string,
    experiment_type: ExperimentType,
    last_page: PageName,
    subjects: string[],
    test_file: string,
    velocities: number,
}

function tryGetFromCache<T extends keyof IBigConfig>(config: BigConfigCls, prop: T): IBigConfig[T]
function tryGetFromCache<T extends keyof ISubconfig>(config: Subconfig, prop: T): ISubconfig[T]
function tryGetFromCache(config, prop) {
    if (config.cache[prop] === undefined) {
        const propVal = config.get(prop);
        config.cache[prop] = propVal;
        return propVal;
    } else {
        return config.cache[prop];
    }
}

/**List of truth file names, no extension*/
export function getTruthFilesWhere({ extension }: { extension?: 'txt' | 'mid' | 'mp4' } = { extension: undefined }): string[] {
    if (extension) {
        if (extension.startsWith('.')) {
            // @ts-ignore
            extension = extension.slice(1);
        }
        if (!['txt', 'mid', 'mp4'].includes(extension)) {
            console.warn(`truthFilesList("${extension}"), must be either ['txt','mid','mp4'] or not at all. setting to undefined`);
            extension = undefined;
        }
    }

    // const truthsDirPath = this.truthsDirPath();

    let truthFiles = [...new Set(fs.readdirSync(TRUTHS_PATH_ABS))];
    let formattedTruthFiles = [];
    for (let file of truthFiles) {
        let [name, ext] = myfs.split_ext(file);
        if (extension) {
            if (ext.lower() === `.${extension}`) {
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
    const txtFilesList = getTruthFilesWhere({ extension: 'txt' });
    const wholeTxtFiles = [];
    for (let name of txtFilesList) {
        if (txtFilesList.count(txt => txt.startsWith(name)) >= 3) {
            wholeTxtFiles.push(name);
        }
    }
    return txtFilesList.filter(a => txtFilesList.filter(txt => txt.startsWith(a)).length >= 3);
}

export class BigConfigCls extends Store<IBigConfig> {
    test: Subconfig;
    exam: Subconfig;
    readonly cache: Partial<IBigConfig>;

    constructor(doFsCheckup = true) {

        super({
            clearInvalidConfig: false,
            defaults: {
                "dev": false,
                "devoptions": {
                    force_notes_number: null,
                    force_playback_rate: null,
                    mute_animation: false,
                    no_reload_on_submit: false,
                    simulate_test_mode: false,
                    simulate_video_mode: false,
                    simulate_animation_mode: false,
                    skip_experiment_intro: false,
                    skip_fade: false,
                    skip_failed_trial_feedback: false,
                    skip_level_intro: false,
                    skip_midi_exists_check: false,
                    skip_passed_trial_feedback: false,
                },
                "exam_file": "fur_elise_B.exam",
                "experiment_type": "test",
                "last_page": "new",
                "test_file": "fur_elise_B.test",

                "subjects": [],
                "velocities": 2

            }
        });

        console.log(`this.path: ${this.path}`);
        this.cache = {};
        if (DRYRUN) {
            this.set = (...args) => console.warn(`DRYRUN, set: `, args)
        }
        let testNameWithExt = this.test_file;
        let examNameWithExt = this.exam_file;
        if (!util.all(testNameWithExt, examNameWithExt)) {
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
        if (doFsCheckup) {
            Promise.all([this.test.doTxtFilesCheck(), this.exam.doTxtFilesCheck()])
                .catch(async reason => {
                    const currentWindow = util.getCurrentWindow();

                    if (!currentWindow.webContents.isDevToolsOpened()) {
                        currentWindow.webContents.openDevTools({ mode: "undocked" })
                    }

                    console.error(`BigConfigCls ctor, error when doFsCheckup:`, reason);
                    const MyAlert = require('../MyAlert');
                    await MyAlert.big.error({
                        title: `An error occured when making sure all truth txt files exist. Tried to check: ${this.test.truth.name} and ${this.exam.truth.name}.`,
                        html: reason,

                    });
                });

            this.removeEmptyDirs("subjects");
        }
    }

    get last_page(): PageName {
        return this.get('last_page');
    }

    set last_page(page: PageName) {

        const validpages = ["new", "running", "record", "file_tools", "settings"];
        if (!validpages.includes(page)) {
            console.warn(`set last_page("${page}"), must be one of ${validpages.join(', ')}. setting to new`);
            this.set('last_page', 'new');
        } else {
            this.set('last_page', page);
        }
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
        if (!['exam', 'test'].includes(experimentType)) {
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
        // TODO: check for non existing from files
        if (DRYRUN) {
            // @ts-ignore
            return console.warn('set subjects, DRYRUN. returning')
        }
        if (subjectList === undefined) {
            console.warn('BigConfigCls.subject() setter got undefined, continueing with []');
            subjectList = [];
        }
        subjectList.push(this.test.subject);
        subjectList.push(this.exam.subject);
        const subjects = [...new Set(subjectList)].filter(util.bool);
        console.log({ subjects });
        for (let s of subjects) {
            myfs.createIfNotExists(path.join(SUBJECTS_PATH_ABS, s));
        }

        this.set('subjects', subjects);

    }

    // get dev(): { [K in keyof DevOptions]: DevOptions[K] extends object ? { [SK in keyof DevOptions[K]]: () => DevOptions[K][SK] } : () => DevOptions[K] } {
    get dev(): { [K in keyof DevOptions]: (where?: string) => DevOptions[K] } {
        const _dev = this.get('dev');

        const handleBoolean = <K extends keyof DevOptions>(key: K, where): DevOptions[K] => {
            const value = _dev && this.get('devoptions')[key];
            if (value) console.warn(`devoptions.${key} ${where}`);
            return value
        };

        return {
            force_notes_number: () => {
                if (_dev) {
                    const force_notes_number = this.get('devoptions').force_notes_number;
                    if (force_notes_number) console.warn(`devoptions.force_notes_number: ${force_notes_number}`);
                    return force_notes_number;
                }
                return null;
            },
            force_playback_rate: () => {
                if (_dev) {
                    const force_playback_rate = this.get('devoptions').force_playback_rate;
                    if (force_playback_rate) console.warn(`devoptions.force_playback_rate: ${force_playback_rate}`);
                    return force_playback_rate;
                }
                return null;
            },

            simulate_test_mode: (where?: string) => {
                return handleBoolean("simulate_test_mode", where);
                // const simulate_test_mode = _dev && this.get('devoptions').simulate_test_mode;
                // if ( simulate_test_mode ) console.warn(`devoptions.simulate_test_mode ${where}`);
                // return simulate_test_mode
            },
            simulate_animation_mode: (where) => {
                return handleBoolean("simulate_animation_mode", where);
                // const simulate_animation_mode = _dev && this.get('devoptions').simulate_animation_mode;
                // if ( simulate_animation_mode ) console.warn(`devoptions.simulate_animation_mode ${where}`);
                // return simulate_animation_mode
            },
            simulate_video_mode: (where) => {
                const simulate_video_mode = _dev && this.get('devoptions').simulate_video_mode;
                if (simulate_video_mode) console.warn(`devoptions.simulate_video_mode ${where}`);
                return simulate_video_mode
            },
            skip_fade: (where) => {
                const skip_fade = _dev && this.get('devoptions').skip_fade;
                if (skip_fade) console.warn(`devoptions.skip_fade ${where}`);
                return skip_fade;
            },

            mute_animation: (where) => {
                const mute_animation = _dev && this.get('devoptions').mute_animation;
                if (mute_animation) console.warn(`devoptions.mute_animation ${where}`);
                return mute_animation;
            },
            skip_midi_exists_check: (where) => {
                const skip_midi_exists_check = _dev && this.get('devoptions').skip_midi_exists_check;
                if (skip_midi_exists_check) console.warn(`devoptions.skip_midi_exists_check ${where}`);
                return skip_midi_exists_check;
            },
            skip_experiment_intro: (where) => {
                const skip_experiment_intro = _dev && this.get('devoptions').skip_experiment_intro;
                if (skip_experiment_intro) console.warn(`devoptions.skip_experiment_intro ${where}`);
                return skip_experiment_intro;
            },
            skip_level_intro: (where) => {
                const skip_level_intro = _dev && this.get('devoptions').skip_level_intro;
                if (skip_level_intro) console.warn(`devoptions.skip_level_intro ${where}`);
                return skip_level_intro;
            },
            skip_passed_trial_feedback: (where) => {
                const skip_passed_trial_feedback = _dev && this.get('devoptions').skip_passed_trial_feedback;
                if (skip_passed_trial_feedback) console.warn(`devoptions.skip_passed_trial_feedback ${where}`);
                return skip_passed_trial_feedback;
            },
            skip_failed_trial_feedback: (where) => {
                const skip_failed_trial_feedback = _dev && this.get('devoptions').skip_failed_trial_feedback;
                if (skip_failed_trial_feedback) console.warn(`devoptions.skip_failed_trial_feedback ${where}`);
                return skip_failed_trial_feedback;
            },
            no_reload_on_submit: (where) => {
                const no_reload_on_submit = _dev && this.get('devoptions').no_reload_on_submit;
                if (no_reload_on_submit) console.warn(`devoptions.no_reload_on_submit ${where}`);
                return no_reload_on_submit;
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
            if (isNaN(floored)) {
                console.warn(`set velocities, Math.floor(val) is NaN:`, { val, floored }, '. not setting');
            } else {
                if (floored >= 1 && floored <= 16) {
                    this.set('velocities', floored);
                    this.cache.velocities = floored;

                } else {
                    console.warn(`set velocities, bad range: ${val}. not setting`);
                }
            }
        } catch (e) {
            console.warn(`set velocities, Exception when trying to Math.floor(val):`, e);
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
        if (DRYRUN) {
            return console.warn('BigConfig.update() DRYRUN. returning');
        }
        let V = this.get(K);
        if (Array.isArray(V)) {
            let newValue: any[] = V;
            if (Array.isArray(kv)) {
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

    /**@cached
     * Should be used instead of Subconfig constructor.
     * Updates `exam_file` or `test_file`, in file and in cache. Also initializes and caches a new Subconfig (this.exam = new Subconfig(...)). */
    setSubconfig(nameWithExt: string, subconfig?: Subconfig) {
        // const [ filename, ext ] = myfs.split_ext(nameWithExt);
        try {
            Subconfig.validateName(nameWithExt);
        } catch (e) {
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

    private removeEmptyDirs(...dirs: ("subjects")[]) {
        if (dirs.includes("subjects")) {
            const currentSubjects = this.subjects;
            for (let subjdir of fs.readdirSync(SUBJECTS_PATH_ABS)) {
                const subjdirAbs = path.join(SUBJECTS_PATH_ABS, subjdir);
                if (!currentSubjects.includes(subjdir)) {
                    util.ignoreErr(() => myfs.removeEmptyDirs(subjdirAbs));

                } else {
                    for (let subdir of fs.readdirSync(subjdirAbs)) {
                        util.ignoreErr(() => myfs.removeEmptyDirs(path.join(subjdirAbs, subdir)));
                    }
                }
            }
        }
    }
}


export class Subconfig extends Conf<ISubconfig> { // AKA Config
    readonly cache: Partial<ISubconfig>;
    truth: Truth;
    private readonly type: ExperimentType;

    /**
     * @param nameWithExt - sets the `name` field in file
     */
    constructor(nameWithExt: string, subconfig?: Subconfig) {
        let [filename, ext] = myfs.split_ext(nameWithExt);
        if (!['.exam', '.test'].includes(ext)) {
            throw new Error(`Subconfig ctor (${nameWithExt}) has bad or no extension`);
        }
        const type = ext.slice(1) as ExperimentType;
        let defaults;
        if (util.bool(subconfig)) {
            if (subconfig.store) {
                defaults = { ...subconfig.store, name: nameWithExt };
            } else {
                defaults = subconfig;
            }
        } else {
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
        if (util.bool(subconfig)) {
            this.set({ ...subconfig.store, name: nameWithExt });

        }
        try {
            this.truth = new Truth(myfs.remove_ext(this.truth_file));
        } catch (e) {
            console.error(`Subconfig constructor, initializing new Truth from this.truth_file threw an error. Probably because this.truth_file is undefined. Should maybe nest under if(subconfig) clause`, "this.truth_file", this.truth_file, e)
        }
    }

    /**@cached*/
    get allowed_tempo_deviation(): number {
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
    set allowed_tempo_deviation(deviation: number) {
        this.setDeviation("tempo", deviation);
    }

    /**@cached*/
    get allowed_rhythm_deviation(): number {
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
    set allowed_rhythm_deviation(deviation: number) {
        this.setDeviation("rhythm", deviation);
    }

    /**@cached*/
    get demo_type(): DemoType {
        return tryGetFromCache(this, "demo_type");
        // return this.get('demo_type');
    }

    /**@cached*/
    set demo_type(type: DemoType) {
        if (!['video', 'animation'].includes(type)) {
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
        if (isNaN(speed)) {
            console.warn(`config set errors_playrate, received bad "speed" NaN: ${speed}`);
        } else {
            this.set('errors_playrate', speed);
        }

    }

    get finished_trials_count(): number {
        return this.get('finished_trials_count');
    }

    set finished_trials_count(count: number) {
        if (isNaN(count) || count < 0) {
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
        if (DRYRUN) {
            // @ts-ignore
            return console.warn('set subject, DRYRUN. Returning');
        }
        if (!util.bool(name)) {
            // @ts-ignore
            return console.warn(`set subject, !bool(name): ${name}. Returning`)
        }
        name = name.lower();
        this.set('subject', name);
        const Glob = require('../Glob').default;
        const existingSubjects = Glob.BigConfig.subjects.filter(util.bool);
        console.log({ existingSubjects });

        Glob.BigConfig.subjects = [...new Set([...existingSubjects, name])];
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
        let [name, ext] = myfs.split_ext(truth_file);
        if (util.bool(ext)) {
            console.warn(`set truth_file, passed name is not extensionless: ${truth_file}. Continuing with "${name}"`);
            // nameNoExt = myfs.remove_ext(nameNoExt);
        }

        const { default: MyAlert } = require('../MyAlert');
        try {
            let truth = new Truth(name);
            if (!truth.txt.allExist()) {
                MyAlert.small.warning(`Not all txt files exist: ${name}`)
            }
            this.truth = truth;
        } catch (e) {
            MyAlert.small.warning(e);
            console.warn(e)
        }
        this.set(`truth_file`, name);
        this.cache.truth_file = name;


    }

    get levels(): ILevel[] {
        return this.get('levels');
    }

    set levels(levels: ILevel[]) {
        if (!Array.isArray(levels)) {
            console.warn(`set levels, received "levels" not isArray. not setting anything. levels: `, levels);
        } else {
            // TODO: better checks
            this.set('levels', levels);
        }
    }

    static validateName(nameWithExt: string) {
        let [filename, ext] = myfs.split_ext(nameWithExt);
        if (!['.exam', '.test'].includes(ext)) {
            throw new Error(`ExtensionError`);
        }
        if (nameWithExt !== `${filename}${ext}`) {
            throw new Error('BasenameError');
        }
    }

    async doTxtFilesCheck(): Promise<boolean> {
        console.log(`💾 Subconfig(${this.type}).doTruthFileCheck()`);
        const { default: MyAlert } = require('../MyAlert');
        if (this.truth.txt.allExist()) {
            MyAlert.small.success(`${this.truth.name}.txt, *_on.txt, and *_off.txt files exist.`);
            return true
        }
        // ['fur_elise_B' x 3, 'fur_elise_R.txt' x 3, ...]
        const truthsWith3TxtFiles = getTruthsWith3TxtFiles();
        if (!util.bool(truthsWith3TxtFiles)) {
            MyAlert.big.warning({
                title: 'No valid truth files found',
                html: 'There needs to be at least one txt file with one "on" and one "off" counterparts.'
            });
            return false;
        }


        MyAlert.big.blocking({
            title: `Didn't find all three .txt files for ${this.truth.name}`,
            html: 'The following truths all have 3 txt files. Please choose one of them, or fix the files and reload.',
            showCloseButton: true,
        }, {
            strings: truthsWith3TxtFiles,
            clickFn: el => {
                try {
                    // const config = this.config(this.experiment_type);
                    this.finished_trials_count = 0;
                    this.levels = [];
                    this.truth_file = el.text();
                    // this.truth_file_path = new Truth(el.text());
                    util.reloadPage();
                } catch (err) {
                    MyAlert.close();
                    MyAlert.big.error({ title: err.message, html: 'Something happened.' });

                }

            }
        });
        return false;


    }

    increase(K: keyof ISubconfig) {
        console.warn(`used subconfig.increase, UNTESTED`);
        if (DRYRUN) {
            return console.warn('increase, DRYRUN. returning');
        }
        let V = this.get(K);

        if (V === undefined)
            this.set(K, 1);
        else {
            const typeofV = typeof V;
            // @ts-ignore
            if (typeofV === 'number' || (typeofV === 'string' && V.isdigit())) {
                // @ts-ignore
                this.set(K, Math.floor(V) + 1);
            } else {
                console.warn("BigConfigCls tried to increase a value that is not a number nor a string.isdigit()");
            }
        }

    }

    toHtml(): string {
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
        for (let [i, lvl] of util.enumerate(levels)) {
            levelsHtml += `
            <tr>
                <td>${i + 1}</td>
                <td>${lvl.notes}</td>
                <td>${lvl.trials}</td>
                <td>${lvl.rhythm}</td>
                <td>${lvl.tempo}</td>
            </tr>`
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

    /**@deprecated*/
    fromSubconfig(subconfig: Subconfig) {
        if (DRYRUN) return console.warn('fromObj, DRYRUN. returning');
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

    currentTrialCoords(): [number, number] {
        let flatTrialsList = this.levels.map(level => level.trials);
        for (let [levelIndex, trialsNum] of util.enumerate(flatTrialsList)) {

            let trialSumSoFar = util.sum(flatTrialsList.slice(0, levelIndex + 1));
            const finishedTrialsCount = this.finished_trials_count;
            if (trialSumSoFar > finishedTrialsCount)
                return [levelIndex, trialsNum - (trialSumSoFar - finishedTrialsCount)];
        }
        console.warn("currentTrialCoords: out of index error");
    }

    isDemoVideo(): boolean {
        return this.demo_type === 'video';
    }

    isWholeTestOver(): boolean {
        return util.sum(this.levels.map(level => level.trials)) == this.finished_trials_count;
    }

    /**@deprecated*/
    getSubjectDirNames(): string[] {
        return fs.readdirSync(SUBJECTS_PATH_ABS);
    }

    getCurrentLevel(): Level {

        let [level_index, trial_index] = this.currentTrialCoords();
        return new Level(this.levels[level_index], level_index, trial_index);
    }

    getLevelCollection(): LevelCollection {
        let [level_index, trial_index] = this.currentTrialCoords();
        return new LevelCollection(this.levels, level_index, trial_index);
    }

    /**@deprecated
     * Gets the current trial's path (join this.testOutPath() and level_${level_index}...), and returns a Truth of it*/
    createTruthFromTrialResult(): Truth {
        console.warn(`This should be somewhere else`);
        let [level_index, trial_index] = this.currentTrialCoords();
        // return new Truth(path.join(this.testOutPath(), `level_${level_index}_trial_${trial_index}`));
        return new Truth(path.join(this.experimentOutDirAbs(), `level_${level_index}_trial_${trial_index}`));
    }

    /**"c:\Sync\Code\Python\Pyano-release\src\experiments\subjects\gilad\fur_elise"*/
    experimentOutDirAbs(): string {
        const currSubjectDir = path.join(SUBJECTS_PATH_ABS, this.subject); // ".../subjects/gilad"
        return path.join(currSubjectDir, this.truth.name); // ".../gilad/fur_elise_B"
    }

    /**@deprecated*/
    private _updateSavedFile(key: keyof ISubconfig, value) {
        if (DRYRUN) {
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

    private setDeviation(deviationType: DeviationType, deviation: number) {


        if ( typeof deviation === 'string' ) {
            if (isNaN(parseFloat(deviation))) {
                console.warn(`setDeviation got string deviation, couldnt parseFloat. deviation: "${deviation}". returning`);
                return
            }
            deviation = parseFloat(deviation);
        }

        // @ts-ignore
        this.set(`allowed_${deviationType}_deviation`, deviation);
        this.cache[`allowed_${deviationType}_deviation`] = deviation;
    }


}
