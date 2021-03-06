/// <reference types="./node_modules/sweetalert2" />
import * as Store from "electron-store";
import { Truth } from "../Truth";
import { ILevel, Level, LevelCollection } from "../Level";
import { SweetAlertResult } from "sweetalert2";
import * as Conf from 'conf';
export declare type ExperimentType = 'exam' | 'test';
export declare type DemoType = 'video' | 'animation';
export declare type PageName = "new" | "running" | "record" | "file_tools" | "settings";
export interface ISubconfig {
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
export declare function getTruthFilesWhere({ extension }?: {
    extension?: 'txt' | 'mid' | 'mp4';
}): string[];
export declare function getTruthsWith3TxtFiles(): string[];
export declare class BigConfigCls extends Store<IBigConfig> {
    test: Subconfig;
    exam: Subconfig;
    readonly cache: Partial<IBigConfig>;
    constructor(doFsCheckup?: boolean);
    get last_page(): PageName;
    set last_page(page: PageName);
    get exam_file(): string;
    set exam_file(nameWithExt: string);
    get test_file(): string;
    set test_file(nameWithExt: string);
    get experiment_type(): ExperimentType;
    set experiment_type(experimentType: ExperimentType);
    get subjects(): string[];
    set subjects(subjectList: string[]);
    get dev(): {
        [K in keyof DevOptions]: (where?: string) => DevOptions[K];
    };
    get velocities(): number;
    set velocities(val: number);
    fromSavedConfig(savedConfig: ISubconfig, experimentType: ExperimentType): void;
    update(K: keyof IBigConfig, kvPairs: Partial<IBigConfig>): any;
    update(K: keyof IBigConfig, values: any[]): any;
    setSubconfig(nameWithExt: string, subconfig?: Subconfig): void;
    getSubconfig(): Subconfig;
    private removeEmptyDirs;
}
export declare class Subconfig extends Conf<ISubconfig> {
    readonly cache: Partial<ISubconfig>;
    truth: Truth;
    private readonly type;
    constructor(nameWithExt: string, subconfig?: Subconfig);
    get allowed_tempo_deviation(): number;
    set allowed_tempo_deviation(deviation: number);
    get allowed_rhythm_deviation(): number;
    set allowed_rhythm_deviation(deviation: number);
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
    static validateName(nameWithExt: string): void;
    doTxtFilesCheck(): Promise<SweetAlertResult>;
    increase(K: keyof ISubconfig): void;
    toHtml(): string;
    fromSubconfig(subconfig: Subconfig): void;
    currentTrialCoords(): [number, number];
    isDemoVideo(): boolean;
    isWholeTestOver(): boolean;
    getSubjectDirNames(): string[];
    getCurrentLevel(): Level;
    getLevelCollection(): LevelCollection;
    createTruthFromTrialResult(): Truth;
    experimentOutDirAbs(): string;
    private _updateSavedFile;
    private setDeviation;
}
export {};
//# sourceMappingURL=index.d.ts.map