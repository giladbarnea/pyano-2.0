import { BetterHTMLElement, Div, div } from "../../bhe";
import { DemoType } from "../../MyStore";

class Dialog extends Div {
    private readonly big: Div;
    private readonly medium: Div;
    private readonly small: Div;
    
    constructor() {
        super({ id : 'dialog' });
        
        this.cacheAppend({
            big : div({ cls : 'big' }),
            medium : div({ cls : 'medium' }),
            small : div({ cls : 'small' })
        })
    }
    
    intro(demoType: DemoType) {
        const noun = demoType === "video" ? 'a video' : 'an animation';
        this.big.text('A Tutorial');
        this.medium.text(`Here's ${noun} that shows everything you’ll be learning today`);
        this.show();
    }
    
    private show() {
        this.big.addClass('on');
        this.medium.addClass('on');
        this.small.addClass('on');
    }
}

export default Dialog
