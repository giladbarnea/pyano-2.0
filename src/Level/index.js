"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
class Level {
    constructor(level, index, internalTrialIndex) {
        if (index == undefined)
            throw new Error("index is undefined");
        const { notes, rhythm, tempo, trials } = level;
        this.notes = notes;
        this.rhythm = rhythm;
        this.tempo = tempo;
        this.trials = trials;
        this.index = index;
        this.internalTrialIndex = internalTrialIndex;
    }
    isFirstTrial() {
        if (this.internalTrialIndex == undefined)
            throw new Error("internalTrialIndex is undefined");
        return this.internalTrialIndex == 0;
    }
    isLastTrial() {
        return this.internalTrialIndex == this.trials - 1;
    }
    hasZeroes() {
        return !util_1.bool(this.notes) || !util_1.bool(this.trials);
    }
    valuesOk() {
        if (!util_1.bool(this.notes) || !util_1.bool(this.trials)) {
            return false;
        }
        if (this.rhythm) {
            if (!util_1.bool(this.tempo)) {
                return false;
            }
        }
        else {
            if (util_1.bool(this.tempo)) {
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
    get(i) {
        return this._levels[i];
    }
    badLevels() {
        const badLevels = [];
        for (let [i, level] of util_1.enumerate(this._levels)) {
            if (!level.valuesOk()) {
                badLevels.push(`${i.human()} level `);
            }
        }
        return badLevels;
    }
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
                return 100;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtDQUEwQztBQVMxQyxNQUFhLEtBQUs7SUFRZCxZQUFZLEtBQWEsRUFBRSxLQUFhLEVBQUUsa0JBQTJCO1FBQ2pFLElBQUssS0FBSyxJQUFJLFNBQVM7WUFBRyxNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDaEUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQztRQUMvQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7SUFDakQsQ0FBQztJQUVELFlBQVk7UUFDUixJQUFLLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxTQUFTO1lBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUN2RCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELFdBQVc7UUFDUCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBR0QsU0FBUztRQUNMLE9BQU8sQ0FBQyxXQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQsUUFBUTtRQUNKLElBQUssQ0FBQyxXQUFJLENB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QUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUc7WUFDN0QsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFLLEdBQUcsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO2dCQUNoQyxPQUFPLEdBQUcsQ0FBQztZQUNmLElBQUssR0FBRyxDQUFDLEtBQUssSUFBSSxJQUFJO2dCQUNsQixPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUM7U0FDeEI7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRCxrQkFBa0I7UUFDZCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCxRQUFRO1FBQ0osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ2IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2pDLENBQUM7Q0FDSjtBQTdFRCwwQ0E2RUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBib29sLCBlbnVtZXJhdGUgfSBmcm9tIFwiLi4vdXRpbFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIElMZXZlbCB7XG4gICAgbm90ZXM6IG51bWJlcjtcbiAgICByaHl0aG06IGJvb2xlYW47XG4gICAgdGVtcG86IG51bWJlciB8IG51bGw7XG4gICAgdHJpYWxzOiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBMZXZlbCBpbXBsZW1lbnRzIElMZXZlbCB7XG4gICAgcmVhZG9ubHkgbm90ZXM6IG51bWJlcjtcbiAgICByZWFkb25seSByaHl0aG06IGJvb2xlYW47XG4gICAgcmVhZG9ubHkgdGVtcG86IG51bWJlciB8IG51bGw7XG4gICAgcmVhZG9ubHkgdHJpYWxzOiBudW1iZXI7XG4gICAgcmVhZG9ubHkgaW5kZXg6IG51bWJlcjtcbiAgICBpbnRlcm5hbFRyaWFsSW5kZXg6IG51bWJlcjtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcihsZXZlbDogSUxldmVsLCBpbmRleDogbnVtYmVyLCBpbnRlcm5hbFRyaWFsSW5kZXg/OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCBpbmRleCA9PSB1bmRlZmluZWQgKSB0aHJvdyBuZXcgRXJyb3IoXCJpbmRleCBpcyB1bmRlZmluZWRcIik7XG4gICAgICAgIGNvbnN0IHsgbm90ZXMsIHJoeXRobSwgdGVtcG8sIHRyaWFscyB9ID0gbGV2ZWw7XG4gICAgICAgIHRoaXMubm90ZXMgPSBub3RlcztcbiAgICAgICAgdGhpcy5yaHl0aG0gPSByaHl0aG07XG4gICAgICAgIHRoaXMudGVtcG8gPSB0ZW1wbztcbiAgICAgICAgdGhpcy50cmlhbHMgPSB0cmlhbHM7XG4gICAgICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgICAgICAgdGhpcy5pbnRlcm5hbFRyaWFsSW5kZXggPSBpbnRlcm5hbFRyaWFsSW5kZXg7XG4gICAgfVxuICAgIFxuICAgIGlzRmlyc3RUcmlhbCgpIHtcbiAgICAgICAgaWYgKCB0aGlzLmludGVybmFsVHJpYWxJbmRleCA9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW50ZXJuYWxUcmlhbEluZGV4IGlzIHVuZGVmaW5lZFwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxUcmlhbEluZGV4ID09IDA7XG4gICAgfVxuICAgIFxuICAgIGlzTGFzdFRyaWFsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFRyaWFsSW5kZXggPT0gdGhpcy50cmlhbHMgLSAxO1xuICAgIH1cbiAgICBcbiAgICAvKipAZGVwcmVjYXRlZCovXG4gICAgaGFzWmVyb2VzKCkge1xuICAgICAgICByZXR1cm4gIWJvb2wodGhpcy5ub3RlcykgfHwgIWJvb2wodGhpcy50cmlhbHMpO1xuICAgIH1cbiAgICBcbiAgICB2YWx1ZXNPaygpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCAhYm9vbCh0aGlzLm5vdGVzKSB8fCAhYm9vbCh0aGlzLnRyaWFscykgKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgICBpZiAoIHRoaXMucmh5dGhtICkge1xuICAgICAgICAgICAgaWYgKCAhYm9vbCh0aGlzLnRlbXBvKSApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIGJvb2wodGhpcy50ZW1wbykgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBcbn1cblxuZXhwb3J0IGNsYXNzIExldmVsQ29sbGVjdGlvbiB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBfbGV2ZWxzOiBMZXZlbFtdO1xuICAgIHJlYWRvbmx5IGN1cnJlbnQ6IExldmVsO1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKGxldmVsczogSUxldmVsW10sIGN1cnJlbnRMZXZlbEluZGV4PzogbnVtYmVyLCBjdXJyZW50SW50ZXJuYWxUcmlhbEluZGV4PzogbnVtYmVyKSB7XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9sZXZlbHMgPSBsZXZlbHMubWFwKChsZXZlbCwgaW5kZXgpID0+IG5ldyBMZXZlbChsZXZlbCwgaW5kZXgpKTtcbiAgICAgICAgaWYgKCBjdXJyZW50TGV2ZWxJbmRleCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5fbGV2ZWxzW2N1cnJlbnRMZXZlbEluZGV4XTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC5pbnRlcm5hbFRyaWFsSW5kZXggPSBjdXJyZW50SW50ZXJuYWxUcmlhbEluZGV4O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sZXZlbHMubGVuZ3RoO1xuICAgIH1cbiAgICBcbiAgICBnZXQoaTogbnVtYmVyKTogTGV2ZWwge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGV2ZWxzW2ldO1xuICAgIH1cbiAgICBcbiAgICBiYWRMZXZlbHMoKTogbnVtYmVyW10ge1xuICAgICAgICBjb25zdCBiYWRMZXZlbHMgPSBbXTtcbiAgICAgICAgZm9yICggbGV0IFsgaSwgbGV2ZWwgXSBvZiBlbnVtZXJhdGUodGhpcy5fbGV2ZWxzKSApIHtcbiAgICAgICAgICAgIGlmICggIWxldmVsLnZhbHVlc09rKCkgKSB7XG4gICAgICAgICAgICAgICAgYmFkTGV2ZWxzLnB1c2goYCR7aS5odW1hbigpfSBsZXZlbCBgKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYWRMZXZlbHM7XG4gICAgfVxuICAgIFxuICAgIC8qKkBkZXByZWNhdGVkKi9cbiAgICBzb21lSGF2ZVplcm9lcygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xldmVscy5zb21lKGxldmVsID0+IGxldmVsLmhhc1plcm9lcygpKTtcbiAgICB9XG4gICAgXG4gICAgc2xpY2VzQnlOb3RlcygpOiBMZXZlbENvbGxlY3Rpb25bXSB7XG4gICAgICAgIGxldCBieU5vdGVzID0ge307XG4gICAgICAgIGZvciAoIGxldCBsZXZlbCBvZiB0aGlzLl9sZXZlbHMgKSB7XG4gICAgICAgICAgICBpZiAoIGxldmVsLm5vdGVzIGluIGJ5Tm90ZXMgKVxuICAgICAgICAgICAgICAgIGJ5Tm90ZXNbbGV2ZWwubm90ZXNdLmFkZExldmVsKGxldmVsKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBieU5vdGVzW2xldmVsLm5vdGVzXSA9IG5ldyBMZXZlbENvbGxlY3Rpb24oWyBsZXZlbCBdKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKGJ5Tm90ZXMpO1xuICAgIH1cbiAgICBcbiAgICBhZGRMZXZlbChsZXZlbDogTGV2ZWwpIHtcbiAgICAgICAgdGhpcy5fbGV2ZWxzLnB1c2gobGV2ZWwpO1xuICAgIH1cbiAgICBcbiAgICBnZXROZXh0VGVtcG9PZlRoaXNOb3RlcygpOiBudW1iZXIge1xuICAgICAgICBpZiAoIHRoaXMuY3VycmVudC5yaHl0aG0gKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudC50ZW1wbztcbiAgICAgICAgZm9yICggbGV0IGkgPSB0aGlzLmN1cnJlbnQuaW5kZXg7IGkgPCB0aGlzLl9sZXZlbHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICBjb25zdCBsdmwgPSB0aGlzLl9sZXZlbHNbaV07XG4gICAgICAgICAgICBpZiAoIGx2bC5ub3RlcyAhPSB0aGlzLmN1cnJlbnQubm90ZXMgKVxuICAgICAgICAgICAgICAgIHJldHVybiAxMDA7IC8vIHdlbnQgb3ZlciBhbGwgbGV2ZWwgd2l0aCBzYW1lIG51bWJlciBvZiBub3RlcyBhbmQgZGlkbid0IGZpbmQgYW55dGhpbmdcbiAgICAgICAgICAgIGlmICggbHZsLnRlbXBvICE9IG51bGwgKVxuICAgICAgICAgICAgICAgIHJldHVybiBsdmwudGVtcG87XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDEwMDtcbiAgICB9XG4gICAgXG4gICAgaXNDdXJyZW50TGFzdExldmVsKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50LmluZGV4ID09IHRoaXMubGVuZ3RoIC0gMTtcbiAgICB9XG4gICAgXG4gICAgbWF4Tm90ZXMoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KC4uLnRoaXMuX2xldmVscy5tYXAobHZsID0+IGx2bC5ub3RlcykpO1xuICAgIH1cbiAgICBcbiAgICBbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYWJsZUl0ZXJhdG9yPExldmVsPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sZXZlbHMudmFsdWVzKCk7XG4gICAgfVxufVxuIl19