import * as Store from "electron-store";
import { Truth } from "./truth";
import { Level, LevelCollection } from "./level";
import * as Conf from 'conf';
declare module store {
    type Subconfig = typeof store.Subconfig;
    type ExperimentType = 'exam' | 'test';
    type DemoType = 'video' | 'animation';
    type PageName = "new" | "running" | "record" | "file_tools" | "settings";
    type DeviationType = 'rhythm' | 'tempo';
    interface ISubconfig {
        allowed_rhythm_deviation: number;
        allowed_tempo_deviation: number;
        demo_type: DemoType;
        errors_playrate: number;
        finished_trials_count: number;
        levels: ILevel[];
        name: string;
        subject: string;
        truth_file: string;
    }
    interface DevOptions {
        force_notes_number: null | number;
        force_playback_rate: null | number;
        mute_animation: boolean;
        no_reload_on_submit: boolean;
        simulate_test_mode: boolean;
        simulate_video_mode: boolean;
        simulate_animation_mode: boolean;
        skip_experiment_intro: boolean;
        skip_fade: boolean;
        skip_failed_trial_feedback: boolean;
        skip_level_intro: boolean;
        skip_midi_exists_check: boolean;
        skip_passed_trial_feedback: boolean;
    }
    interface IBigConfig {
        dev: boolean;
        devoptions: DevOptions;
        exam_file: string;
        experiment_type: ExperimentType;
        last_page: PageName;
        subjects: string[];
        test_file: string;
        velocities: number;
    }
    export { DemoType, ISubconfig, Subconfig, ExperimentType, DeviationType, DevOptions, IBigConfig, PageName };
}
/**List of truth file names, no extension*/
declare function getTruthFilesWhere({ extension }?: {
    extension?: 'txt' | 'mid' | 'mp4';
}): string[];
/**List of names of txt truth files that have their whole "triplet" in tact. no extension*/
declare function getTruthsWith3TxtFiles(): string[];
declare class BigConfigCls extends Store<store.IBigConfig> {
    test: Subconfig;
    exam: Subconfig;
    readonly cache: Partial<store.IBigConfig>;
    constructor(doFsCheckup?: boolean);
    get last_page(): store.PageName;
    set last_page(page: store.PageName);
    /**@cached
     * Returns the exam file name including extension*/
    get exam_file(): string;
    /**Updates exam_file and also initializes new Subconfig*/
    set exam_file(nameWithExt: string);
    /**@cached
     * Returns the test file name including extension*/
    get test_file(): string;
    /**@cached
     * Updates test_file and also initializes new Subconfig*/
    set test_file(nameWithExt: string);
    /**@cached
     * Can be gotten also with `subconfig.type`*/
    get experiment_type(): store.ExperimentType;
    /**@cached*/
    set experiment_type(experimentType: store.ExperimentType);
    get subjects(): string[];
    /**Ensures having `this.test.subject` and `this.exam.subject` in the list regardless*/
    set subjects(subjectList: string[]);
    get dev(): {
        [K in keyof store.DevOptions]: (where?: string) => store.DevOptions[K];
    };
    /**@cached*/
    get velocities(): number;
    /**@cached*/
    set velocities(val: number);
    /**@deprecated*/
    fromSavedConfig(savedConfig: store.ISubconfig, experimentType: store.ExperimentType): void;
    /**@example
     update('subjects', [names])
     */
    update(K: keyof store.IBigConfig, kvPairs: Partial<store.IBigConfig>): any;
    update(K: keyof store.IBigConfig, values: any[]): any;
    /**@cached
     * Should be used instead of Subconfig constructor.
     * Updates `exam_file` or `test_file`, in file and in cache. Also initializes and caches a new Subconfig (this.exam = new Subconfig(...)). */
    setSubconfig(nameWithExt: string, subconfig?: Subconfig): void;
    /**@cached*/
    getSubconfig(): Subconfig;
    private removeEmptyDirs;
}
declare class Subconfig extends Conf<store.ISubconfig> {
    readonly cache: Partial<store.ISubconfig>;
    truth: Truth;
    private readonly type;
    /**
     * @param nameWithExt - sets the `name` field in file
     */
    constructor(nameWithExt: string, subconfig?: Subconfig);
    /**@cached*/
    get allowed_tempo_deviation(): number;
    /**@cached*/
    set allowed_tempo_deviation(deviation: number);
    /**@cached*/
    get allowed_rhythm_deviation(): number;
    /**@cached*/
    set allowed_rhythm_deviation(deviation: number);
    /**@cached*/
    get demo_type(): store.DemoType;
    /**@cached*/
    set demo_type(type: store.DemoType);
    get errors_playrate(): number;
    set errors_playrate(speed: number);
    get finished_trials_count(): number;
    set finished_trials_count(count: number);
    /**Name of config file, including extension. Always returns `name` from cache. This is because there's no setter; `name` is stored in cache at constructor.*/
    get name(): string;
    get subject(): string;
    set subject(name: string | null);
    /**@cached
     * Truth file name, no extension*/
    get truth_file(): string;
    /**Also sets this.truth (memory)
     * @cached
     * @param truth_file - Truth file name, no extension*/
    set truth_file(truth_file: string);
    get levels(): ILevel[];
    set levels(levels: ILevel[]);
    static validateName(nameWithExt: string): void;
    doTxtFilesCheck(): Promise<boolean>;
    increase(K: keyof store.ISubconfig): void;
    toHtml(): string;
    /**@deprecated*/
    fromSubconfig(subconfig: Subconfig): void;
    currentTrialCoords(): [number, number];
    isDemoVideo(): boolean;
    isWholeTestOver(): boolean;
    /**@deprecated*/
    getSubjectDirNames(): string[];
    getCurrentLevel(): Level;
    getLevelCollection(): LevelCollection;
    /**@deprecated
     * Gets the current trial's path (join this.testOutPath() and level_${level_index}...), and returns a Truth of it*/
    createTruthFromTrialResult(): Truth;
    /**"c:\Sync\Code\Python\Pyano-release\src\experiments\subjects\gilad\fur_elise"*/
    experimentOutDirAbs(): string;
    /**@deprecated*/
    private _updateSavedFile;
    private setDeviation;
}
export { store, getTruthFilesWhere, getTruthsWith3TxtFiles, BigConfigCls, Subconfig };