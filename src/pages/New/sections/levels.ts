// *  pages/New/sections/levels.ts
/** asfasf
 * import sections from "./sections"
 * sections.levels*/
import { div, elem, button, Div, Button } from "../../../bhe";

class LevelsDiv extends Div {
    addLevelBtn: Button;
    removeLevelBtn: Button;
    
    constructor({ id }) {
        super({ id });
        this.cacheAppend({
            addLevelBtn : button({ cls : 'active', html : 'Add Level', click : this.addLevel }),
            removeLevelBtn : button({ cls : 'inactive', html : 'Remove Last Level', click : () => this.removeLevel() }),
        })
    }
    
    addLevel() {
    
    }
    
    private removeLevel(index: number = -1) {
    
    }
    
}

const levelsDiv = new LevelsDiv({ id : 'levels_div' });


export default levelsDiv;


