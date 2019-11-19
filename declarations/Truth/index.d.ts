declare class File {
    readonly path: string;
    private pathNoExt;
    readonly name: File;
    constructor(pathWithExt: string);
    toString(): string;
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
    constructor(pathNoExt: string);
    getAll(): [File, File, File];
    getExisting(): [(File | false), (File | false), (File | false)];
    allExist(): boolean;
    anyExist(): boolean;
    removeAll(): void;
    renameByOtherTxt(other: Txt): void;
}
export declare class Truth {
    private readonly pathNoExt;
    readonly name: string;
    readonly txt: Txt;
    private readonly midi;
    private readonly mp4;
    private readonly mov;
    private readonly onsets;
    constructor(pathNoExt: string);
    numOfNotes(): number;
}
export {};
//# sourceMappingURL=index.d.ts.map