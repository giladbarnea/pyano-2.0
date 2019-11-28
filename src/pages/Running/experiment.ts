import Dialog from "./dialog";
import { DemoType } from "../../MyStore";
import Keyboard from './keyboard'
import { wait } from "../../util";

class Experiment {
    readonly dialog: Dialog;
    readonly keyboard: Keyboard;
    
    constructor() {
        this.dialog = new Dialog();
        this.keyboard = new Keyboard();
        this.dialog.insertBefore(this.keyboard);
    }
    
    async intro(demoType: DemoType) {
        await wait(0);
        this.dialog.intro(demoType);
        await Promise.all([ wait(2000), this.keyboard.initPiano() ]);
        this.keyboard.class('active');
        await wait(1000, false);
        await this.keyboard.intro();
        console.log('intro done');
        
    }
    
}

export default Experiment;
