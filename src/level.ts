export interface ILevel {
    notes: number;
    rhythm: boolean;
    tempo: number | null;
    trials: number;
}

export class Level {
    readonly notes: number;
    readonly rhythm: boolean;
    readonly tempo: number | null;
    readonly trials: number;
    readonly index: number;
    /**Set by LevelCollection constructor*/
    internalTrialIndex: number | undefined;

    constructor(level: ILevel, index: number, internalTrialIndex?: number) {

        if (!util.is.isNumber(index)) {
            console.warn(`Level.constructor(level, index, internalTrialIndex?) | index is not a number: ${index}. Continuing with index=0`);
            index = 0;
        }
        const { notes, rhythm, tempo, trials } = level;
        this.notes = notes;
        this.rhythm = rhythm;
        this.tempo = tempo;
        this.trials = trials;
        this.index = index;
        this.internalTrialIndex = internalTrialIndex;
    }

    toString() {
        return `Level ${this.index} (trial: ${this.internalTrialIndex})`

    }

    toJSON(): ILevel {
        const { notes, rhythm, tempo, trials } = this;
        return { notes, rhythm, tempo, trials };
    }

    /**@deprecated*/
    isFirstTrial(): boolean {
        if (this.internalTrialIndex === undefined) {
            console.warn(`${this}.isFirstTrial() | internalTrialIndex is undefined, returning undefined`);
            return undefined
        }
        return this.internalTrialIndex === 0;
    }

    /**@deprecated*/
    isLastTrial(): boolean {
        return this.internalTrialIndex === this.trials - 1;
    }

    /**@deprecated*/
    hasZeroes() {
        return !util.bool(this.notes) || !util.bool(this.trials);
    }

    isValid(): boolean {
        if (!util.bool(this.notes) || !util.bool(this.trials)) {
            return false
        }
        if (this.rhythm) {
            if (!util.bool(this.tempo)) {
                return false;
            }
        } else {
            if (util.bool(this.tempo)) {
                return false;
            }
        }
        return true;
    }

}

export class LevelCollection extends Array<Level> {
    readonly current: Level;
    private readonly _levels: Level[];

    constructor(levels: ILevel[], currentLevelIndex?: number, currentInternalTrialIndex?: number) {
        super();
        this._levels = levels.map((level, index) => new Level(level, index));
        if (util.is.isNumber(currentLevelIndex)) {
            this.current = this._levels[currentLevelIndex];
            this.current.internalTrialIndex = currentInternalTrialIndex;
        }


    }

    get length(): number {
        return this._levels.length;
    }

    get previous(): Level {
        return this.get(this.current.index - 1)
    }

    toString(): string {
        return `LevelCollection (${this.length})`
    }

    push(...items): number {
        return this._levels.push(...items);
        // return super.push(...items);
    }

    get(i: number): Level {
        return this._levels[i];
    }

    /*set(i: number, level: Level) {
        this._levels[i] = level;
    }*/

    /**Used by New.index.ts*/
    descriptionOfInvalidLevels(): string {
        const invalidLevels = [];
        for (let [i, level] of util.enumerate(this._levels)) {
            if (!level.isValid()) {
                invalidLevels.push(`${i.human()} level `)
            }
        }
        return invalidLevels.join(', ');
    }

    /**@deprecated*/
    someHaveZeroes(): boolean {
        return this._levels.some(level => level.hasZeroes());
    }

    /**Builds from `this._levels` a sorted array of `LevelCollection`'s, where each `LevelCollection` has
     all the levels of `N` length (and only levels of that length).*/
    groupByNotes(): LevelCollection[] {
        let byNotes: { [notes: number]: LevelCollection } = {};
        for (let level of this._levels) {
            if (level.notes in byNotes) {
                // byNotes[level.notes].addLevel(level);
                byNotes[level.notes].push(level);
            } else {
                byNotes[level.notes] = new LevelCollection([level]);
            }

        }
        return Object.values(byNotes).sort(((lc1, lc2) => lc1.length - lc2.length));
    }

    /**@deprecated
     * Use `push(level)`*/
    addLevel(level: Level) {
        this._levels.push(level);
    }

    getNextTempoOfThisNotes(): number {
        if (this.current.rhythm)
            return this.current.tempo;
        for (let i = this.current.index; i < this._levels.length; i++) {
            const lvl = this._levels[i];
            if (lvl.notes != this.current.notes)
                return 100; // went over all level with same number of notes and didn't find anything
            if (lvl.tempo != null)
                return lvl.tempo;
        }
        return 100;
    }

    isCurrentLastLevel(): boolean {
        return this.current.index == this.length - 1;
    }

    maxNotes(): number {
        return Math.max(...this._levels.map(lvl => lvl.notes));
    }


    [Symbol.iterator](): IterableIterator<Level> {
        return this._levels.values();
    }
}
