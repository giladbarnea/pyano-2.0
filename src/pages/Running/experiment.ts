import Dialog from "./dialog";
import { DemoType } from "../../MyStore";
import Keyboard from './keyboard'
class Experiment {
    readonly dialog: Dialog;
    readonly keyboard: Keyboard;
    
    constructor() {
        this.dialog = new Dialog();
        this.keyboard = new Keyboard();
        this.dialog.insertBefore(this.keyboard);
    }
    
    async intro(demoType: DemoType) {
        this.dialog.intro(demoType);
        
    }
    
}

export default Experiment;
