/// <reference types="./node_modules/electron" />
declare const remote: Electron.Remote;
declare const argvars: string[];
declare const DEBUG: boolean;
declare const DRYRUN: boolean;
declare const NOPYTHON: boolean;
declare const path: any;
declare let ROOT_PATH_ABS: string;
declare let SRC_PATH_ABS: string;
declare const TEMPLATES_PATH_ABS: any;
declare const SALAMANDER_PATH_ABS: any;
declare const EXPERIMENTS_PATH_ABS: any;
declare const TRUTHS_PATH_ABS: any;
declare const CONFIGS_PATH_ABS: any;
declare const SUBJECTS_PATH_ABS: any;
interface String {
    human(): string;
    isdigit(): boolean;
    lower(): string;
    removeAll(removeValue: string | number | RegExp | TMap<string>, ...removeValues: Array<string | number | RegExp | TMap<string>>): string;
    replaceAll(searchValue: TMap<string>): string;
    replaceAll(searchValue: string | number | RegExp, replaceValue: string): string;
    title(): string;
    upTo(searchString: string, searchFromEnd?: boolean): string;
}
//# sourceMappingURL=renderer.d.ts.map