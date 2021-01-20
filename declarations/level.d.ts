export interface ILevel {
    notes: number;
    rhythm: boolean;
    tempo: number | null;
    trials: number;
}
export declare class Level implements ILevel {
    /**The number of notes that have to be played from the beginning of the piece.*/
    readonly notes: number;
    /**Whether rhythm is taken into account when checking the users' performance.*/
    readonly rhythm: boolean;
    readonly tempo: number | null;
    /**How many trials will this level consist of.*/
    readonly trials: number;
    /**This level's index among all other levels.*/
    readonly index: number;
    /**Set by LevelArray constructor*/
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
export declare class LevelArray extends Array<Level> {
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
    /**Builds from `this._levels` a sorted array of `LevelArray`'s, where each `LevelArray` has
     all the levels of `N` length (and only levels of that length).*/
    groupByNotes(): LevelArray[];
    /**@deprecated
     * Use `push(level)`*/
    addLevel(level: Level): void;
    getNextTempoOfThisNotes(): number;
    isCurrentLastLevel(): boolean;
    maxNotes(): number;
    [Symbol.iterator](): IterableIterator<Level>;
}
