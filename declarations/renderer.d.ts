/// <reference types="./node_modules/electron" />
declare const remote: Electron.Remote;
declare const argvars: string[];
declare const DEBUG: boolean;
declare const DRYRUN: boolean;
declare const NOPYTHON: boolean;
declare const path: any;
declare let ROOT_PATH_ABS: string;
declare let SRC_PATH_ABS: string;
declare const SALAMANDER_PATH_ABS: any;
declare const EXPERIMENTS_PATH_ABS: any;
declare const TRUTHS_PATH_ABS: any;
declare const CONFIGS_PATH_ABS: any;
declare const SUBJECTS_PATH_ABS: any;
declare const util: any;
interface String {
    endsWithAny(...args: string[]): boolean;
    human(): string;
    isdigit(): boolean;
    lower(): string;
    upper(): string;
    removeAll(removeValue: string | number | RegExp | TMap<string>, ...removeValues: Array<string | number | RegExp | TMap<string>>): string;
    replaceAll(searchValue: TMap<string>): string;
    replaceAll(searchValue: string | number | RegExp, replaceValue: string): string;
    title(): string;
    upTo(searchString: string, searchFromEnd?: boolean): string;
}
interface Array<T> {
    _lowerAll: T[];
    lowerAll(): T[];
    count(item: T): number;
    count(item: FunctionReturns<boolean>): number;
    lazy(fn: TFunction<T, T>): T[];
}
interface Number {
    human(letters?: boolean): string;
}
interface Error {
    toObj(): {
        what: string;
        where: string;
    };
}
//# sourceMappingURL=renderer.d.ts.map