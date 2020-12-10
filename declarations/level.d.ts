export declare class Level implements ILevel {
    readonly notes: number;
    readonly rhythm: boolean;
    readonly tempo: number | null;
    readonly trials: number;
    readonly index: number;
    internalTrialIndex: number;
    constructor(level: ILevel, index: number, internalTrialIndex?: number);
    toJSON(): ILevel;
    /**@deprecated*/
    isFirstTrial(): boolean;
    /**@deprecated*/
    isLastTrial(): boolean;
    /**@deprecated*/
    hasZeroes(): boolean;
    valuesOk(): boolean;
}
export declare class LevelCollection {
    readonly current: Level;
    private readonly _levels;
    constructor(levels: ILevel[], currentLevelIndex?: number, currentInternalTrialIndex?: number);
    get length(): number;
    get previous(): Level;
    get(i: number): Level;
    badLevels(): number[];
    /**@deprecated*/
    someHaveZeroes(): boolean;
    slicesByNotes(): LevelCollection[];
    addLevel(level: Level): void;
    getNextTempoOfThisNotes(): number;
    isCurrentLastLevel(): boolean;
    maxNotes(): number;
    [Symbol.iterator](): IterableIterator<Level>;
}
