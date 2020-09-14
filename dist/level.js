Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelCollection = exports.Level = void 0;
class Level {
    constructor(level, index, internalTrialIndex) {
        if (index === undefined) {
            console.error(`Level ctor, index is undefined. Continuing with index=0`);
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
    toJSON() {
        const { notes, rhythm, tempo, trials } = this;
        return { notes, rhythm, tempo, trials };
    }
    /**@deprecated*/
    isFirstTrial() {
        if (this.internalTrialIndex === undefined)
            throw new Error("internalTrialIndex is undefined");
        return this.internalTrialIndex === 0;
    }
    /**@deprecated*/
    isLastTrial() {
        return this.internalTrialIndex === this.trials - 1;
    }
    /**@deprecated*/
    hasZeroes() {
        return !util.bool(this.notes) || !util.bool(this.trials);
    }
    valuesOk() {
        if (!util.bool(this.notes) || !util.bool(this.trials)) {
            return false;
        }
        if (this.rhythm) {
            if (!util.bool(this.tempo)) {
                return false;
            }
        }
        else {
            if (util.bool(this.tempo)) {
                return false;
            }
        }
        return true;
    }
}
exports.Level = Level;
class LevelCollection {
    constructor(levels, currentLevelIndex, currentInternalTrialIndex) {
        this._levels = levels.map((level, index) => new Level(level, index));
        if (currentLevelIndex !== undefined) {
            this.current = this._levels[currentLevelIndex];
            this.current.internalTrialIndex = currentInternalTrialIndex;
        }
    }
    get length() {
        return this._levels.length;
    }
    get previous() {
        return this.get(this.current.index - 1);
    }
    get(i) {
        return this._levels[i];
    }
    badLevels() {
        const badLevels = [];
        for (let [i, level] of util.enumerate(this._levels)) {
            if (!level.valuesOk()) {
                badLevels.push(`${i.human()} level `);
            }
        }
        return badLevels;
    }
    /**@deprecated*/
    someHaveZeroes() {
        return this._levels.some(level => level.hasZeroes());
    }
    slicesByNotes() {
        let byNotes = {};
        for (let level of this._levels) {
            if (level.notes in byNotes)
                byNotes[level.notes].addLevel(level);
            else
                byNotes[level.notes] = new LevelCollection([level]);
        }
        return Object.values(byNotes);
    }
    addLevel(level) {
        this._levels.push(level);
    }
    getNextTempoOfThisNotes() {
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
    isCurrentLastLevel() {
        return this.current.index == this.length - 1;
    }
    maxNotes() {
        return Math.max(...this._levels.map(lvl => lvl.notes));
    }
    [Symbol.iterator]() {
        return this._levels.values();
    }
}
exports.LevelCollection = LevelCollection;