export interface ILevel {
    notes: number;
    rhythm: boolean;
    tempo: number | null;
    trials: number;
}
export declare class Level implements ILevel {
    readonly notes: number;
    readonly rhythm: boolean;
    readonly tempo: number | null;
    readonly trials: number;
    readonly index: number;
    internalTrialIndex: number;
    constructor(level: ILevel, index: number, internalTrialIndex?: number);
    isFirstTrial(): boolean;
    isLastTrial(): boolean;
    hasZeroes(): boolean;
    valuesOk(): boolean;
}
export declare class LevelCollection {
    private readonly _levels;
    readonly current: Level;
    constructor(levels: ILevel[], currentLevelIndex?: number, currentInternalTrialIndex?: number);
    get length(): number;
    get(i: number): Level;
    badLevels(): number[];
    someHaveZeroes(): boolean;
    slicesByNotes(): LevelCollection[];
    addLevel(level: Level): void;
    getNextTempoOfThisNotes(): number;
    isCurrentLastLevel(): boolean;
    maxNotes(): number;
    [Symbol.iterator](): IterableIterator<Level>;
}
//# sourceMappingURL=index.d.ts.map