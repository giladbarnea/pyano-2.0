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
    constructor(nameNoExt: string);
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
export declare class Truth {
    readonly name: string;
    readonly txt: Txt;
    readonly midi: File;
    readonly mp4: File;
    readonly mov: File;
    readonly onsets: File;
    constructor(nameNoExt: string);
    numOfNotes(): number;
}
export {};
//# sourceMappingURL=index.d.ts.map