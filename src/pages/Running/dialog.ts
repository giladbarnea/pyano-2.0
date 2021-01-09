import { Div, div } from "bhe";
import { Level } from "level";
import { VisualBHE } from "bhe/extra.js";
import { store } from "store";

// @ts-ignore
class Dialog extends VisualBHE {
    private readonly big: Div;
    private readonly medium: Div;
    private readonly small: Div;
    private readonly demoType: store.DemoType;

    constructor(demoType: store.DemoType) {
        super({ tag: 'div' });
        this.id('dialog');

        this.cacheAppend({
            big: div({ cls: 'big' }),
            medium: div({ cls: 'medium' }),
            small: div({ cls: 'small' })
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

    async levelIntro(level: Level, demo: store.DemoType, rate: number) {
        console.group(`Dialog.levelIntro(level, demo: "${demo}")`);
        const bigText = `${Dialog.humanize(level.index)} level, ${Dialog.humanize(level.internalTrialIndex)} trial`.title();
        this.big.text(bigText);
        this.medium.html(`After the demo, you’ll play <b>${level.notes}</b> notes.`);
        let noun = demo === "video" ? 'a video' : 'an animation';
        this.small.html(`Here’s ${noun} showing only these <b>${level.notes}</b> notes at ${rate * 100}% rate.`);
        await this.display();
        console.groupEnd();
        return;
    }

    async record(level: Level) {
        console.group(`Dialog.record()`);
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
        console.groupEnd();
        return;
    }

    async hide() {
        this.big.removeClass('active');
        this.medium.removeClass('active');
        this.small.removeClass('active');
        return await util.wait(this._opacTransDur, false);
    }

    /**Use public functions*/
    private async display() {
        this.big.addClass('active');
        this.medium.addClass('active');
        this.small.addClass('active');
        return await util.wait(this._opacTransDur, false);
    }
}

export default Dialog
