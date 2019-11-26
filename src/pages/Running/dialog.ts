import { BetterHTMLElement, Div, div } from "../../bhe";

class Dialog extends Div {
    big: Div;
    medium: Div;
    small: Div;
    
    constructor() {
        super({ id : 'dialog' });
        this.cacheAppend({
            big : div({ cls : 'big', text : 'A tutorial' }),
            medium : div({ cls : 'medium' }),
            small : div({ cls : 'small' })
        })
    }
}

export default new Dialog()
