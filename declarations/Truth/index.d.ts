declare class File {
    private _absPath;
    constructor(absPathWithExt: string);
    get absPath(): string;
    set absPath(absPathWithExt: string);
    renameByOtherFile(other: File): void;
    renameByCTime(): void;
    getBitrateAndHeight(): Promise<[string, string]>;
    exists(): boolean;
    remove(): void;
    size(): number;
}
declare class Txt {
    readonly base: File;
    readonly on: File;
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
    readonly name: string;
    readonly txt: Txt;
    readonly midi: File;
    readonly mp4: File;
    readonly mov: File;
    readonly onsets: File;
    constructor(nameNoExt: string, dir?: string);
    toReadOnly(...include: ("txt" | "midi" | "mp4" | "onsets")[]): ReadonlyTruth;
    numOfNotes(): number;
}
export {};
//# sourceMappingURL=index.d.ts.map