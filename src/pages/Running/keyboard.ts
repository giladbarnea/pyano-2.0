import { BetterHTMLElement } from "../../bhe";
import * as util from "../../util"

class Keyboard extends BetterHTMLElement {
    constructor() {
        console.group('Keyboard ctor');
        const zerothKeys = {
            A0 : {
                '[data-note="A0"]' : {
                    'A#0' : '[data-note="A#0"]'
                }
            },
            B0 : '[data-note="B0"]',
        };
        const keys = {};
        const indexToLetter = {
            1 : "C",
            2 : "D",
            3 : "E",
            4 : "F",
            5 : "G",
            6 : "A",
            7 : "B"
        };
        const noblacks = [ 3, 7 ]; // E, B
        for ( let register of util.range(1, 7) ) {
            for ( let keyIndex of util.range(1, 7) ) {
                let letter = indexToLetter[keyIndex];
                let name = `${letter}${register}`;
                let value;
                if ( noblacks.includes(keyIndex) ) {
                    value = `[data-note="${name}"]`
                } else {
                    let query = `[data-note="${name}"]`;
                    let subname = `${letter}#${register}`;
                    let subquery = `[data-note="${subname}"]`;
                    let subvalue = {};
                    subvalue[subname] = subquery;
                    value = {};
                    value[query] = subvalue;
                }
                keys[name] = value;
            }
        }
        console.log({ keys });
        super({
            id : 'keyboard', children : keys
        });
        
        console.groupEnd();
        
    }
}

const keyboard = new Keyboard();
export default keyboard;
