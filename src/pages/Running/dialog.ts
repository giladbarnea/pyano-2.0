import { Div, div, VisualBHE } from "../../bhe";
import { DemoType } from "../../MyStore";
import { wait } from "../../util";
import { Level, LevelCollection } from "../../Level";

// @ts-ignore
class Dialog extends VisualBHE {
    private readonly big: Div;
    private readonly medium: Div;
    private readonly small: Div;
    private readonly demoType: DemoType;
    
    constructor(demoType: DemoType) {
        super({ tag : 'div' });
        this.id('dialog');
        
        this.cacheAppend({
            big : div({ cls : 'big' }),
            medium : div({ cls : 'medium' }),
            small : div({ cls : 'small' })
        });
        this.demoType = demoType;
    }
    
    private static humanize(num: number): string {
        return (num + 1).human(true)
    }
    
    async intro() {
        console.group(`Dialog.intro()`);
        const noun = this.demoType === "video" ? 'a video' : 'an animation';
        this.big.text('A Tutorial');
        this.medium.text(`Here’s ${noun} that shows everything you’ll be learning today`);
        this.small.text(`(Click anywhere to start playing)`);
        await this.display();
        console.groupEnd();
        return;
    }
    
    async levelIntro(level: Level, demo: DemoType, rate: number) {
        console.group(`Dialog.levelIntro(level, demo : "${demo}")`);
        // const current = levelCollection.current;
        const bigText = `${Dialog.humanize(level.index)} level, ${Dialog.humanize(level.internalTrialIndex)} trial`.title();
        this.big.text(bigText);
        this.medium.html(`After the demo, you’ll play <b>${level.notes}</b> notes.`);
        let noun = demo === "video" ? 'a video' : 'an animation';
        this.small.html(`Here’s ${noun} showing only these <b>${level.notes}</b> notes at ${rate * 100}% rate.`);
        await this.display();
        console.groupEnd();
        return;
    }
    
    /**Use public functions*/
    private async display() {
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
