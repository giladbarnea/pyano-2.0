/**An object wrapping an abs path with extension.*/
declare class File {
    constructor(absPathWithExt: string);
    /**The abs path WITH extension*/
    private _absPath;
    get absPath(): string;
    /**Sets this._absPath and also RENAMES the actual file.*/
    set absPath(absPathWithExt: string);
    /**@deprecated*/
    renameByOtherFile(other: File): void;
    renameByCTime(): void;
    getBitrateAndHeight(): Promise<[string, string]>;
    exists(): boolean;
    remove(): void;
    size(): number;
}
declare class Txt {
    /**A File object representing the absolute ``*.txt`` path.*/
    readonly base: File;
    /**A File object representing the absolute ``*_on.txt``  path.*/
    readonly on: File;
    /**A File object representing the absolute ``*_off.txt`` path.*/
    readonly off: File;
    constructor(absPathNoExt: string);
    getAll(): [File, File, File];
    getExisting(): {
        base?: File;
        on?: File;
        off?: File;
    };
    getMissing(): string[];
    allExist(): boolean;
    anyExist(): boolean;
    removeAll(): void;
    renameByOtherTxt(other: Txt): void;
}
export interface ReadonlyTruth {
    /**The basename without extension.*/
    name: string;
    txt: {
        base: {
            absPath: string;
        };
        on: {
            absPath: string;
        };
        off: {
            absPath: string;
        };
    };
    midi: {
        absPath: string;
    };
    mp4: {
        absPath: string;
    };
    onsets: {
        absPath: string;
    };
}
export declare class Truth implements ReadonlyTruth {
    /**The basename without extension.*/
    readonly name: string;
    readonly txt: Txt;
    /**A File object of the midi file.*/
    readonly midi: File;
    /**A File object of the mp4 file.*/
    readonly mp4: File;
    /**A File object of the mov file.*/
    readonly mov: File;
    /**A File object of the onsets file.*/
    readonly onsets: File;
    /**
     * @param nameNoExt - Expects a file base name with no extension.
     * @param dir - Optional abs dir path of the truth. Defaults to `TRUTHS_PATH_ABS`
     */
    constructor(nameNoExt: string, dir?: string);
    toJSON(...include: ("txt" | "midi" | "mp4" | "onsets")[]): ReadonlyTruth;
    /**Counts the number of non-empty lines in the txt on path file.*/
    numOfNotes(): number;
}
export {};
