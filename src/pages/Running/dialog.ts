import { BetterHTMLElement, Div, div } from "../../bhe";
import { DemoType } from "../../MyStore";

class Dialog extends Div {
    big: Div;
    medium: Div;
    small: Div;
    
    constructor(demoType: DemoType) {
        super({ id : 'dialog' });
        const noun = demoType === "video" ? 'a video' : 'an animation';
        this.cacheAppend({
            big : div({ cls : 'big', text : 'A tutorial' }),
            medium : div({ cls : 'medium', text : `Here's ${noun} that shows everything you’ll be learning today` }),
            small : div({ cls : 'small' })
        })
    }
}

export default Dialog
