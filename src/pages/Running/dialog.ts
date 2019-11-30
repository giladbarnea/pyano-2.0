import { Div, div } from "../../bhe";
import { DemoType } from "../../MyStore";
import ExperimentBHE from "./ExperimentBHE";
import { wait } from "../../util";

class Dialog extends ExperimentBHE {
    private readonly big: Div;
    private readonly medium: Div;
    private readonly small: Div;
    
    constructor() {
        super({ tag : 'div' });
        this.id('dialog');
        
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
        this.display();
    }
    
    async display() {
        this.big.addClass('active');
        this.medium.addClass('active');
        this.small.addClass('active');
        return await wait(this._opacTransDur, false);
    }
    
    async hide() {
        this.big.removeClass('active');
        this.medium.removeClass('active');
        this.small.removeClass('active');
        return await wait(this._opacTransDur, false);
    }
}

export default Dialog
