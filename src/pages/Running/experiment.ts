import Dialog from "./dialog";
import { DemoType } from "../../MyStore";

class Experiment {
    readonly dialog: Dialog;
    
    constructor() {
        this.dialog = new Dialog();
    }
    
    async intro(demoType: DemoType) {
        this.dialog.intro(demoType);
        
    }
    
}

export default Experiment;
