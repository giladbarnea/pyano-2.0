import { ILevel, Level, LevelArray } from "level";
import { Truth } from "./truth";
import * as Store from "electron-store";
import * as Conf from 'conf';
import type { JSONSchema } from "json-schema-typed";
import swalert from "./swalert";

export module store {
    export type ExperimentType = 'exam' | 'test';
    export type DemoType = 'video' | 'animation';
    export type PageName = // AKA TLastPage
        "new"
        | "running"
        | "record"
        | "tools"
        | "settings";
    type DeviationType = 'rhythm' | 'tempo';

    export interface ISubconfig {
        allowed_rhythm_deviation: string,
        allowed_tempo_deviation: string,
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
        skip_level_intro: number[],
        skip_midi_exists_check: boolean,
        skip_passed_trial_feedback: boolean,
    }

    export interface IBigConfig {
        dev: boolean,
        devoptions: DevOptions,
        exam_file: string,
        test_file: string,
        experiment_type: ExperimentType,
        last_page: PageName,
        subjects: string[],
        velocities: number,
    }

    export type BigConfigSchema = { [P in keyof IBigConfig]: JSONSchema };
    const bigconfschema: BigConfigSchema = {
        subjects: {
            type: "array",
            uniqueItems: true,
            items: {
                type: "string"
            },
            default: []

        },
        velocities: {
            type: 'integer',
            default: 2
        },
        test_file: {
            type: "string",
            pattern: ".+\\.test$",
            examples: ["fur_elise_B.test"]
        },
        exam_file: {
            type: "string",
            pattern: ".+\\.exam$",
            examples: ["fur_elise_B.exam"]
        },
        experiment_type: {
            // type: "string",
            enum: ["exam", "test"]
        },
        last_page: {
            type: "string",
            enum: ["new", "running", "record", "file_tools", "settings"],
            default: "new"
        },
        dev: {
            type: "boolean",
            default: false
        },
        devoptions: {
            type: "object",
            properties: {
                force_notes_number: { type: ["number", "null"], default: null },
                force_playback_rate: { type: ["number", "null"], default: null },
                mute_animation: { type: ["boolean", "null"], default: false },
                no_reload_on_submit: { type: ["boolean", "null"], default: false },
                simulate_test_mode: { type: ["boolean", "null"], default: false },
                simulate_video_mode: { type: ["boolean", "null"], default: false },
                simulate_animation_mode: { type: ["boolean", "null"], default: false },
                skip_experiment_intro: { type: ["boolean", "null"], default: false },
                skip_fade: { type: ["boolean", "null"], default: false },
                skip_failed_trial_feedback: { type: ["boolean", "null"], default: false },
                skip_level_intro: { type: ["array"], default: [], uniqueItems: true, items: { type: "integer" } },
                skip_midi_exists_check: { type: ["boolean", "null"], default: false },
                skip_passed_trial_feedback: { type: ["boolean", "null"], default: false }
            }
        }


    };

    function tryGetFromCache<T extends keyof IBigConfig>(config: BigConfigCls, prop: T): IBigConfig[T];
    function tryGetFromCache<T extends keyof ISubconfig>(config: Subconfig, prop: T): ISubconfig[T];
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
    function getTruthFilesWhere({ extension }: { extension?: 'txt' | 'mid' | 'mp4'; } = { extension: undefined }): string[] {
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
        return formattedTruthFiles;

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
            try {
                super({
                    clearInvalidConfig: false,
                    schema: bigconfschema
                });
            } catch (e) {


                let field = e?.message?.match(/(?<=Config schema violation: `)(?<field>[^`]+)/)?.groups?.field;
                if (field) {
                    util.onError(e, { swal: false, screenshots: false });
                } else {
                    util.onError(e, { swal: true, screenshots: false });
                    return

                }
                const schemafield = bigconfschema[field];
                const expected_type: string = schemafield.type;
                const examples: string[] = schemafield.examples;
                const allowed_values: string[] = schemafield.enum;
                const defolt: string = schemafield.default;
                const tmp = new Store<IBigConfig>();
                const actual_value = tmp.get(field);
                const actual_type = typeof actual_value;
                const should = e.message.match(/(?<=should )(?<should>.+)/)?.groups?.should;

                let html = `<code>${field}</code> field failed validation. Its actual value is <code>${actual_value}</code> (${actual_type})
                Its expected type is <code>${expected_type}</code>`
                if (should) {
                    html += `\nA correct value must ${should}`
                }
                if (allowed_values) {
                    html += `\nAllowed values: ${allowed_values.map(v => `"${v}"`).join(" | ")}`
                }
                if (examples) {
                    html += `\nExamples: ${examples.map(v => `"${v}"`).join(", ")}`
                }
                if (defolt) {
                    html += `\nIts default value is: ${defolt}`
                }

                html += `\nfix config here: <code>${tmp.path}</code>\nWhen done, press "Reload".`

                swalert.big.error({
                    title: "Currupt config",
                    html,
                    confirmButtonText: "Reload",
                    width: "50%"
                }).then(res => {
                    util.app.reloadPage();
                }).catch((reason) => {
                    util.onError(reason, { screenshots: false, swal: false })
                    process.exit(1)
                })
                swalert.small.warning({ title: "CONSTRUCTING CORRUPT BIGCONF", log: true });
                super({
                    clearInvalidConfig: false,
                });


            }
            console.log(`this.path: ${this.path}`)
            // console.debug(`this.path: ${this.path}`);
            this.cache = {};
            if (DRYRUN) {
                this.set = (...args) => console.warn(`DRYRUN, set: `, args);
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
                        const currentWindow = util.app.getCurrentWindow();

                        if (!currentWindow.webContents.isDevToolsOpened()) {
                            currentWindow.webContents.openDevTools({ mode: "undocked" });
                        }

                        console.error(`BigConfigCls ctor, error when doFsCheckup:`, reason);
                        await swalert.big.error({
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

            const validpages: PageName[] = ["new", "running", "record", "tools", "settings"];
            if (!validpages.includes(page)) {
                console.warn(`set last_page("${page}"), must be one of ${validpages.join(', ')}. setting to 'new'`);
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
            this.setSubconfig(nameWithExt);
        }

        /**@cached
         * Returns the test file name including extension*/
        get test_file(): string {
            return tryGetFromCache(this, 'test_file');
        }

        /**@cached
         * Updates test_file and also initializes new Subconfig*/
        set test_file(nameWithExt: string) {
            this.setSubconfig(nameWithExt);
        }

        /**@cached
         * Can be gotten also with `subconfig.type`*/
        get experiment_type(): ExperimentType {
            return tryGetFromCache(this, "experiment_type");
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
        // @util.investigate
        set subjects(subjectList: string[]) {
            // TODO: check for non existing from files
            if (DRYRUN) {
                // @ts-ignore
                return console.warn('set subjects, DRYRUN. returning');
            }
            if (subjectList === undefined) {
                console.warn('BigConfigCls.subject() setter got undefined, continueing with subjectList = []');
                subjectList = [];
            }
            subjectList.push(this.test.subject);
            subjectList.push(this.exam.subject);
            const subjects = [...new Set(subjectList)].filter(util.bool);
            console.debug(`set subjects: ${pf(subjects)}`);
            for (let s of subjects) {
                myfs.createIfNotExists(path.join(SUBJECTS_PATH_ABS, s));
            }

            this.set('subjects', subjects);

        }

        // get dev(): { [K in keyof DevOptions]: DevOptions[K] extends object ? { [SK in keyof DevOptions[K]]: () => DevOptions[K][SK] } : () => DevOptions[K] } {
        get dev(): { [K in keyof DevOptions]: (where?: string) => DevOptions[K] } {
            const _dev = this.get('dev') === true;
            const _genericHandle = <K extends keyof DevOptions>(key: K, where): DevOptions[K] => {
                if (!_dev) {
                    return null;
                }
                const value = this.get('devoptions')[key];
                if (value) console.warn(`devoptions.${key} ${where}`);
                return value;
            };
            const _handleBool = <K extends keyof DevOptions>(key: K, where): DevOptions[K] => {
                const value = _dev && this.get('devoptions')[key];
                if (value) console.warn(`devoptions.${key} ${where}`);
                return value;
            };

            return {
                force_notes_number(where?) {
                    return _genericHandle("force_notes_number", where)
                    /*if (_dev) {
                        const force_notes_number = this.get('devoptions').force_notes_number;
                        if (force_notes_number) console.warn(`devoptions.force_notes_number: ${force_notes_number}`);
                        return force_notes_number;
                    }
                    return null;*/
                },
                force_playback_rate(where?) {
                    return _genericHandle("force_playback_rate", where)
                    /*if (_dev) {
                        const force_playback_rate = this.get('devoptions').force_playback_rate;
                        if (force_playback_rate) console.warn(`devoptions.force_playback_rate: ${force_playback_rate}`);
                        return force_playback_rate;
                    }
                    return null;*/
                },

                simulate_test_mode(where?: string) {
                    return _handleBool("simulate_test_mode", where);
                    // const simulate_test_mode = _dev && this.get('devoptions').simulate_test_mode;
                    // if ( simulate_test_mode ) console.warn(`devoptions.simulate_test_mode ${where}`);
                    // return simulate_test_mode
                },
                simulate_animation_mode(where) {
                    return _handleBool("simulate_animation_mode", where);
                    // const simulate_animation_mode = _dev && this.get('devoptions').simulate_animation_mode;
                    // if ( simulate_animation_mode ) console.warn(`devoptions.simulate_animation_mode ${where}`);
                    // return simulate_animation_mode
                },
                simulate_video_mode(where) {
                    return _handleBool("simulate_video_mode", where);
                    // const simulate_video_mode = _dev && this.get('devoptions').simulate_video_mode;
                    // if (simulate_video_mode) console.warn(`devoptions.simulate_video_mode ${where}`);
                    // return simulate_video_mode;
                },
                skip_fade(where) {
                    return _handleBool("skip_fade", where);
                    // const skip_fade = _dev && this.get('devoptions').skip_fade;
                    // if (skip_fade) console.warn(`devoptions.skip_fade ${where}`);
                    // return skip_fade;
                },

                mute_animation(where) {
                    return _handleBool("mute_animation", where);
                    // const mute_animation = _dev && this.get('devoptions').mute_animation;
                    // if (mute_animation) console.warn(`devoptions.mute_animation ${where}`);
                    // return mute_animation;
                },
                skip_midi_exists_check(where) {
                    return _handleBool("skip_midi_exists_check", where);
                    // const skip_midi_exists_check = _dev && this.get('devoptions').skip_midi_exists_check;
                    // if (skip_midi_exists_check) console.warn(`devoptions.skip_midi_exists_check ${where}`);
                    // return skip_midi_exists_check;
                },
                skip_experiment_intro(where) {
                    return _handleBool("skip_experiment_intro", where);
                    // const skip_experiment_intro = _dev && this.get('devoptions').skip_experiment_intro;
                    // if (skip_experiment_intro) console.warn(`devoptions.skip_experiment_intro ${where}`);
                    // return skip_experiment_intro;
                },
                skip_level_intro(where): number[] {
                    return _genericHandle("skip_level_intro", where)
                    // return _handleBool("skip_level_intro", where);
                    // const skip_level_intro = _dev && this.get('devoptions').skip_level_intro;
                    // if (skip_level_intro) console.warn(`devoptions.skip_level_intro ${where}`);
                    // return skip_level_intro;
                },
                skip_passed_trial_feedback: (where) => {
                    return _handleBool("skip_passed_trial_feedback", where);
                    // const skip_passed_trial_feedback = _dev && this.get('devoptions').skip_passed_trial_feedback;
                    // if (skip_passed_trial_feedback) console.warn(`devoptions.skip_passed_trial_feedback ${where}`);
                    // return skip_passed_trial_feedback;
                },
                skip_failed_trial_feedback: (where) => {
                    return _handleBool("skip_failed_trial_feedback", where);
                    // const skip_failed_trial_feedback = _dev && this.get('devoptions').skip_failed_trial_feedback;
                    // if (skip_failed_trial_feedback) console.warn(`devoptions.skip_failed_trial_feedback ${where}`);
                    // return skip_failed_trial_feedback;
                },
                no_reload_on_submit: (where) => {
                    return _handleBool("no_reload_on_submit", where);
                    // const no_reload_on_submit = _dev && this.get('devoptions').no_reload_on_submit;
                    // if (no_reload_on_submit) console.warn(`devoptions.no_reload_on_submit ${where}`);
                    // return no_reload_on_submit;
                },
            };
        }

        /**@cached*/
        get velocities() {
            return tryGetFromCache(this, "velocities");
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
        update(K: keyof IBigConfig, kvPairs: Partial<IBigConfig>);

        update(K: keyof IBigConfig, values: any[]);

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
        // @util.investigate
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


            //// this.exam = new Subconfig('fur_elise_B.exam', subconfig)
            this[subcfgType] = new Subconfig(nameWithExt, subconfig);
        }

        /**@cached*/
        getSubconfig(): Subconfig {
            return this[this.experiment_type];
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
                console.error(`Subconfig constructor, initializing new Truth from this.truth_file threw an error. Probably because this.truth_file is undefined. Should maybe nest under if(subconfig) clause`, "this.truth_file", this.truth_file, e);
            }
        }

        /**@cached*/
        get allowed_tempo_deviation(): number {
            //@ts-ignore
            return tryGetFromCache(this, "allowed_tempo_deviation");
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
            //@ts-ignore
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
                return console.warn(`set subject, !bool(name): ${name}. Returning`);
            }
            name = name.lower();
            this.set('subject', name);
            const Glob = require('Glob').default;
            const existingSubjects = BigConfig.subjects.filter(util.bool);
            console.debug({ existingSubjects });

            BigConfig.subjects = [...new Set([...existingSubjects, name])];
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

            try {
                let truth = new Truth(name);
                if (!truth.txt.allExist()) {
                    swalert.small.warning(`Not all txt files exist: ${name}`);
                }
                this.truth = truth;
            } catch (e) {
                swalert.small.warning(e);
                console.warn(e);
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
            console.debug(`💾 Subconfig(${this.type}).doTruthFileCheck()`);
            if (this.truth.txt.allExist()) {
                swalert.small.success(`${this.truth.name}.txt, *_on.txt, and *_off.txt files exist.`);
                return true;
            }
            // ['fur_elise_B' x 3, 'fur_elise_R.txt' x 3, ...]
            const truthsWith3TxtFiles = getTruthsWith3TxtFiles();
            if (!util.bool(truthsWith3TxtFiles)) {
                swalert.big.warning({
                    title: 'No valid truth files found',
                    html: 'There needs to be at least one txt file with one "on" and one "off" counterparts.'
                });
                return false;
            }


            swalert.big.blocking({
                title: `Didn't find all three .txt files for ${this.truth.name}`,
                html: 'The following truths all have 3 txt files. Please choose one of them, or fix the files and reload.',
                showCloseButton: true,

                strings: truthsWith3TxtFiles,
                clickFn: el => {
                    try {
                        // const config = this.config(this.experiment_type);
                        this.finished_trials_count = 0;
                        this.levels = [];
                        this.truth_file = el.text();
                        // this.truth_file_path = new Truth(el.text());
                        util.app.reloadPage();
                    } catch (err) {

                        swalert.close();
                        swalert.big.error({ title: err.message, html: 'Something happened.' });

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

        /**Calculates the current level's index among all levels, and the
         internal index of the current trial, based on `this.finished_trials_count`.
         Because `this.finished_trials_count` is always advancing whether student
         succeeded or not (in other words: it's a sum of the hitherto finished trials),
         this function iterates over `this.levels`, summing up each level's trials
         number, until the sum hits `this.finished_trials_count`.
         The sums are subtracted to get the internal trial index.
         */
        currentTrialCoords(): [levelIndex: number, internalTrialIndex: number] {
            // An array of the number of trials for each level: [3, 2, 2...]
            const trialsNumberArray = this.levels.map(level => level.trials);

            // A sum of all the trials the student has done
            const finishedTrialsCount = this.finished_trials_count;
            for (let [levelIndex, trialsNumberInLevel] of util.enumerate(trialsNumberArray)) {

                let trialSumSoFar = util.sum(trialsNumberArray.slice(0, levelIndex + 1)); // including this level's trial number
                // const finishedTrialsCount = this.finished_trials_count;
                if (trialSumSoFar > finishedTrialsCount) {
                    const internalTrialIndex = trialsNumberInLevel - (trialSumSoFar - finishedTrialsCount);
                    return [levelIndex, internalTrialIndex];
                }
            }
            console.error(`Subconfig.currentTrialCoords(): OUT OF INDEX | finishedTrialsCount: ${finishedTrialsCount} | trialsNumberArray: ${pf(trialsNumberArray)}`);
            return [-1, -1]
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

        getLevelArray(): LevelArray {
            let [current_level_index, internal_trial_index] = this.currentTrialCoords();
            return new LevelArray(this.levels, current_level_index, internal_trial_index);
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
                return console.warn('_updateSavedFile, DRYRUN. returning');
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


            if (typeof deviation === 'string') {
                if (isNaN(parseFloat(deviation))) {
                    console.warn(`setDeviation got string deviation, couldnt parseFloat. deviation: "${deviation}". returning`);
                    return;
                }
                deviation = parseFloat(deviation);
            }

            // @ts-ignore
            this.set(`allowed_${deviationType}_deviation`, deviation);
            this.cache[`allowed_${deviationType}_deviation`] = deviation;
        }

    }
}