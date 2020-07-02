// *  pages/New/sections/levels
/**
 * import sections from "./sections"
 * sections.levels*/
import { button, Button, Div, div } from "betterhtmlelement";

export class LevelsDiv extends Div {
    addLevelBtn: Button;
    removeLevelBtn: Button;
    selectors: Div;
    subtitles: Div;

    constructor({ byid }) {
        super({ byid });
        this.cacheAppend({
            addLevelBtn: button({ cls: 'green', html: 'Add Level', click: () => this.addLevel }),
            removeLevelBtn: button({ cls: 'inactive', html: 'Remove Last Level', click: () => this.removeLevel() }),
            selectors: div(),
            subtitles: div({ cls: 'subtitle' }).cacheAppend({
                level: div({ text: 'LEVEL' }),
                notes: div({ text: 'NOTES' }),
                rhythm: div({ text: 'RHYTHM' }),
                tempo: div({ text: 'TEMPO' }),
                trials: div({ text: 'TEMPO' }),
            }),
        })
    }

    addLevel() {

    }

    private removeLevel(index: number = -1) {

    }

}

const levelsDiv = new LevelsDiv({ byid: 'levels_div' });


export default levelsDiv;


