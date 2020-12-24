import * as Conf from 'conf';
import * as fs from 'fs';

const _pp = require('pretty-format');
const pp = (_val) => _pp(_val, { min: true })
const file = 'src/experiments/configs/BAD_CONFIG.exam';
// const file = '/home/gilad/.config/pyano-2.0/config.json';
let datastr = fs.readFileSync(file).toString();
const data = JSON.parse(datastr);
console.log('data: ', data);

interface IConf {
    subjects: string[],
    allowed_rhythm_deviation: string;
    allowed_tempo_deviation: string;
}

// const conf = new Conf<IConf>(
// @ts-ignore
const conf = new Conf(
    {
        schema: {
            subjects: {
                type: "array",
                uniqueItems: true,
                items: {
                    type: "string"
                }

            },
            velocities: {
                type: 'integer'
            },
            test_file: {
                type: "string",
                pattern: ".+\\.test$"
            },
            exam_file: {
                type: "string",
                pattern: ".+\\.exam$"
            }


        },

    }
);

let entries = Object.entries(data);
console.debug(`entries: `, entries);
for (let [key, val] of entries) {
    console.debug(`key: ${pp(key)}, val: ${pp(val)}`);
    conf.set(key, val);
}
