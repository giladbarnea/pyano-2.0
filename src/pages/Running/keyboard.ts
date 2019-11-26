import { BetterHTMLElement } from "../../bhe";

class Keyboard extends BetterHTMLElement {
    constructor() {
        console.log('Keyboard ctor');
        super({
            id : 'keyboard', children : {
                C4 : {
                    '[data-note="C4"]' : {
                        'C#4' : '[data-note="C#4"]'
                    }
                },
                D4 : {
                    '[data-note="D4"]' : {
                        'D#4' : '[data-note="D#4"]'
                    }
                },
                E4 : '[data-note="E4"]',
                F4 : {
                    '[data-note="F4"]' : {
                        'F#4' : '[data-note="F#4"]'
                    }
                },
                G4 : {
                    '[data-note="G4"]' : {
                        'G#4' : '[data-note="G#4"]'
                    }
                },
                A4 : {
                    '[data-note="A4"]' : {
                        'A#4' : '[data-note="A#4"]'
                    }
                },
                B4 : '[data-note="B4"]',
            }
        });
        
    }
}

const keyboard = new Keyboard();
export default keyboard;
