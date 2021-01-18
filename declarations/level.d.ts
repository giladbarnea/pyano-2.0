export interface ILevel {
    notes: number;
    rhythm: boolean;
    tempo: number | null;
    trials: number;
}
export declare class Level {
    readonly notes: number;
    readonly rhythm: boolean;
    readonly tempo: number | null;
    readonly trials: number;
    readonly index: number;
    /**Set by LevelCollection constructor*/
    internalTrialIndex: number | undefined;
    constructor(level: ILevel, index: number, internalTrialIndex?: number);
    toString(): string;
    toJSON(): ILevel;
    /**@deprecated*/
    isFirstTrial(): boolean;
    /**@deprecated*/
    isLastTrial(): boolean;
    /**@deprecated*/
    hasZeroes(): boolean;
    isValid(): boolean;
}
export declare class LevelCollection extends Array<Level> {
    readonly current: Level;
    private readonly _levels;
    constructor(levels: ILevel[], currentLevelIndex?: number, currentInternalTrialIndex?: number);
    get length(): number;
    get previous(): Level;
    toString(): string;
    push(...items: any[]): number;
    get(i: number): Level;
    /**Used by New.index.ts*/
    descriptionOfInvalidLevels(): string;
    /**@deprecated*/
    someHaveZeroes(): boolean;
    /**Builds from `this._levels` a sorted array of `LevelCollection`'s, where each `LevelCollection` has
     all the levels of `N` length (and only levels of that length).*/
    groupByNotes(): LevelCollection[];
    /**@deprecated
     * Use `push(level)`*/
    addLevel(level: Level): void;
    getNextTempoOfThisNotes(): number;
    isCurrentLastLevel(): boolean;
    maxNotes(): number;
    [Symbol.iterator](): IterableIterator<Level>;
}
