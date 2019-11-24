// *  pages/New/sections/levels.ts
/** asfasf
 * import sections from "./sections"
 * sections.levels*/
import { div, elem, button } from "../../../bhe";

const levelsDiv = div({ id : 'levels_div' });
levelsDiv.cacheAppend({
    addLevelBtn : button({ cls : 'active', html : 'Add Level' })
});

export default levelsDiv;


