import * as Store from "electron-store";
import { Truth } from "../Truth";
import { ILevel, Level, LevelCollection } from "../Level";
declare type ExperimentType = 'exam' | 'test';
declare type DemoType = 'video' | 'animation';
export declare type PageName = "new" | "running" | "record" | "file_tools" | "settings";
interface ISubconfigBase {
    allowed_rhythm_deviation: string;
    allowed_tempo_deviation: string;
    current_subject: string;
    demo_type: DemoType;
    errors_playingspeed: number;
    finished_trials_count: number;
    levels: ILevel[];
}
interface ISavedSubconfig extends ISubconfigBase {
    'truth_file_path': string;
}
interface DevOptions {
    "skip_whole_truth": boolean;
    "skip_level_intro": boolean;
    "skip_failed_trial_feedback": boolean;
    "skip_passed_trial_feedback": boolean;
}
interface IMyStore {
    'current_exam': Subconfig;
    'current_test': Subconfig;
    'dev': boolean;
    'devoptions': DevOptions;
    'experiment_type': ExperimentType;
    'last_page': PageName;
    'root_abs_path': string;
    'subjects': string[];
    'truth_file_path': string;
    'velocities': number[];
    'vid_silence_len': number;
}
export declare class MyStore extends Store<IMyStore> {
    constructor(_doTruthFileCheck?: boolean);
    private _doTruthFileCheck;
    fromSavedConfig(savedConfig: ISavedSubconfig, experimentType: ExperimentType): void;
    config(type?: ExperimentType): Subconfig;
    update(K: keyof IMyStore, kvPairs: Partial<IMyStore>): any;
    update(K: keyof IMyStore, values: any[]): any;
    increase(K: keyof IMyStore): void;
    truth(): Truth;
    set truth_file_path(truth: Truth);
    get truth_file_path(): string;
    get last_page(): PageName;
    set last_page(page: PageName);
    get experiment_type(): ExperimentType;
    set experiment_type(experimentType: ExperimentType);
    set subjects(subjectList: string[]);
    configsPath(): string;
    truthsDirPath(): string;
    truthFilesList(extFilter?: string): string[];
    subjectsDirPath(): string;
    salamanderDirPath(): string;
    private get dev();
}
declare class Subconfig extends MyStore {
    private readonly type;
    private static readonly _KEYS;
    constructor(type: ExperimentType);
    toSavedConfig(): ISavedSubconfig;
    fromSavedConfig(savedConfig: ISavedSubconfig, ...args: any[]): void;
    private _updateSavedFile;
    private _get;
    private _set;
    private _setDeviation;
    get allowed_tempo_deviation(): string;
    set allowed_tempo_deviation(deviation: string);
    get allowed_rhythm_deviation(): string;
    set allowed_rhythm_deviation(deviation: string);
    get current_subject(): string;
    set current_subject(name: string | null);
    get errors_playingspeed(): number;
    set errors_playingspeed(speed: number);
    get save_path(): string;
    set save_path(savePath: string);
    get demo_type(): DemoType;
    set demo_type(type: DemoType);
    get finished_trials_count(): number;
    set finished_trials_count(count: number);
    get levels(): ILevel[];
    set levels(levels: ILevel[]);
    currentTrialCoords(): number[];
    isDemoVideo(): boolean;
    isWholeTestOver(): boolean;
    getSubjectDirNames(): string[];
    getCurrentLevel(): Level;
    getLevelCollection(): LevelCollection;
    trialTruth(): Truth;
    testOutPath(): string;
}
export {};
//# sourceMappingURL=index.d.ts.map