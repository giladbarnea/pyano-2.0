Object.defineProperty(exports, "__esModule", { value: true });
// *  pages/New/sections/levels
/**
 * import sections from "./sections"
 * sections.levels*/
const bhe_1 = require("../../../bhe");
class LevelsDiv extends bhe_1.Div {
    constructor({ setid }) {
        super({ setid });
        this.cacheAppend({
            addLevelBtn: bhe_1.button({ cls: 'green', html: 'Add Level', click: () => this.addLevel }),
            removeLevelBtn: bhe_1.button({ cls: 'inactive', html: 'Remove Last Level', click: () => this.removeLevel() }),
            selectors: bhe_1.div(),
            subtitles: bhe_1.div({ cls: 'subtitle' }).cacheAppend({
                level: bhe_1.div({ text: 'LEVEL' }),
                notes: bhe_1.div({ text: 'NOTES' }),
                rhythm: bhe_1.div({ text: 'RHYTHM' }),
                tempo: bhe_1.div({ text: 'TEMPO' }),
                trials: bhe_1.div({ text: 'TEMPO' }),
            }),
        });
    }
    addLevel() {
    }
    removeLevel(index = -1) {
    }
}
exports.LevelsDiv = LevelsDiv;
const levelsDiv = new LevelsDiv({ setid: 'levels_div' });
exports.default = levelsDiv;