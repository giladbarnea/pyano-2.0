/// <reference types="./node_modules/sweetalert2" />
import * as Store from "electron-store";
import { Truth } from "../Truth";
import { ILevel, Level, LevelCollection } from "../Level";
import { SweetAlertResult } from "sweetalert2";
import * as Conf from 'conf';
export declare type ExperimentType = 'exam' | 'test';
export declare type DemoType = 'video' | 'animation';
export declare type PageName = "new" | "running" | "record" | "file_tools" | "settings";
interface ISubconfig {
    allowed_rhythm_deviation: string;
    allowed_tempo_deviation: string;
    demo_type: DemoType;
    errors_playrate: number;
    finished_trials_count: number;
    name: string;
    subject: string;
    truth_file: string;
    levels: ILevel[];
}
interface DevOptions {
    skip_midi_exists_check: boolean;
    skip_whole_truth: boolean;
    skip_level_intro: boolean;
    skip_failed_trial_feedback: boolean;
    skip_passed_trial_feedback: boolean;
    reload_page_on_submit: boolean;
}
interface IBigConfig {
    dev: boolean;
    devoptions: DevOptions;
    exam_file: string;
    test_file: string;
    experiment_type: ExperimentType;
    last_page: PageName;
    subjects: string[];
    velocities: number[];
}
export declare function getTruthFilesWhere({ extension }?: {
    extension?: 'txt' | 'mid' | 'mp4';
}): string[];
export declare function getTruthsWith3TxtFiles(): string[];
export declare class BigConfigCls extends Store<IBigConfig> {
    test: Subconfig;
    exam: Subconfig;
    readonly cache: Partial<IBigConfig>;
    constructor(_doTruthFileCheck?: boolean);
    fromSavedConfig(savedConfig: ISubconfig, experimentType: ExperimentType): void;
    update(K: keyof IBigConfig, kvPairs: Partial<IBigConfig>): any;
    update(K: keyof IBigConfig, values: any[]): any;
    get last_page(): PageName;
    set last_page(page: PageName);
    setSubconfig(file: string, subcfgType: ExperimentType, subconfig?: Subconfig): void;
    getSubconfig(): Subconfig;
    get exam_file(): string;
    set exam_file(file: string);
    get test_file(): string;
    set test_file(file: string);
    get experiment_type(): ExperimentType;
    set experiment_type(experimentType: ExperimentType);
    get subjects(): string[];
    set subjects(subjectList: string[]);
    get dev(): {
        [K in keyof DevOptions]: () => boolean;
    };
}
export declare class Subconfig extends Conf<ISubconfig> {
    private readonly type;
    readonly cache: Partial<ISubconfig>;
    truth: Truth;
    constructor(name: string, type: ExperimentType, subconfig?: Subconfig);
    doTruthFileCheck(): Promise<SweetAlertResult>;
    increase(K: keyof ISubconfig): void;
    toObj(): Omit<ISubconfig, "name">;
    fromSubconfig(subconfig: Subconfig): void;
    private _updateSavedFile;
    private setDeviation;
    get allowed_tempo_deviation(): string;
    set allowed_tempo_deviation(deviation: string);
    get allowed_rhythm_deviation(): string;
    set allowed_rhythm_deviation(deviation: string);
    get demo_type(): DemoType;
    set demo_type(type: DemoType);
    get errors_playrate(): number;
    set errors_playrate(speed: number);
    get finished_trials_count(): number;
    set finished_trials_count(count: number);
    get name(): string;
    get subject(): string;
    set subject(name: string | null);
    get truth_file(): string;
    set truth_file(truth_file: string);
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