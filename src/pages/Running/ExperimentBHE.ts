import { BetterHTMLElement } from "../../bhe";
import { wait } from "../../util";

class ExperimentBHE extends BetterHTMLElement {
    protected _opacTransDur: number;
    
    constructor(options) {
        super(options);
    }
    
    setOpacTransDur() {
        this._opacTransDur = this.getOpacityTransitionDuration()
    }
    
    async display() {
        this.addClass('active');
        return await wait(this._opacTransDur, false);
    }
    
    async hide() {
        this.removeClass('active');
        return await wait(this._opacTransDur, false);
    }
}

export default ExperimentBHE;
