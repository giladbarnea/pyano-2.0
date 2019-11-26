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
                    //    E4 : '[data-note="E4"]'
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
        /*
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
         */
        console.groupEnd();
        
    }
}

const keyboard = new Keyboard();
export default keyboard;
