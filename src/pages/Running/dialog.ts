console.debug('pages/Running/dialog.ts')
import { Div, div } from "bhe";
import { Level } from "level";
import { VisualBHE } from "bhe/extra";
import { store } from "store";
import { InteractiveIn } from "pages/Running/iinteractive";

class Dialog extends VisualBHE<HTMLDivElement> implements InteractiveIn {
// class Dialog extends InteractiveBHE<HTMLDivElement> {
    private readonly big: Div;
    private readonly medium: Div;
    private readonly small: Div;
    private readonly demoType: store.DemoType;


    constructor(demoType: store.DemoType) {
        super({ tag: 'div' });
        this.id('dialog');


        this.demoType = demoType;
    }
    init(){
        this.cacheAppend({
            big: div({ cls: 'big' }),
            medium: div({ cls: 'medium' }),
            small: div({ cls: 'small' })
        });
    }
    private static humanize(num: number): string {
        return (num + 1).human(true)
    }

// **  Visual Controls
    async hide() {
        this.big.removeClass('active');
        this.medium.removeClass('active');
        this.small.removeClass('active');
        return await util.wait(this._opacTransDur, false);
    }

    /**Don't use this outside; Use public functions instead. ts-ignore hack. */
    async display() {
        this.big.addClass('active');
        this.medium.addClass('active');
        this.small.addClass('active');
        return await util.wait(this._opacTransDur, false);
    }

    // ** Stages
    async intro(): Promise<void> {
        console.title(`Dialog.intro()`);
        const noun = this.demoType === "video" ? 'a video' : 'an animation';
        this.big.text('A Tutorial');
        this.medium.text(`Here’s ${noun} that shows everything you’ll be learning today`);
        this.small.text(`(Click anywhere to start playing)`);
        await this.display();
    }

    async levelIntro(level: Level, demoType: store.DemoType, rate: number): Promise<void> {
        console.title(`Dialog.levelIntro(level: ${level}, demoType: "${demoType}")`);
        const bigText = `${Dialog.humanize(level.index)} level, ${Dialog.humanize(level.internalTrialIndex)} trial`.title();
        this.big.text(bigText);
        this.medium.html(`After the demo, you’ll play <b>${level.notes}</b> notes.`);
        let noun = demoType === "video" ? 'a video' : 'an animation';
        this.small.html(`Here’s ${noun} showing only these <b>${level.notes}</b> notes at ${rate * 100}% rate.`);
        await this.display();
    }

    async record(level: Level): Promise<void> {
        console.title(`Dialog.record(level: ${level})`);
        this.big.html(`When you’re ready, please play <b>${level.notes}</b> notes`);
        if (level.rhythm) {
            if (level.tempo === 100) {
                this.medium.html(`Remember to keep rhythm and regular speed.`);
            } else {
                this.medium.html(`Remember to keep rhythm, but don’t play any slower than ${level.tempo}% rate.`);
            }
        } else {
            this.medium.html(`Remember: you can play as slow as you like. Just get the notes right.`);
        }
        this.small.html('');
        await this.display();
    }


}

export default Dialog
