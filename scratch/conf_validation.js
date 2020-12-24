"use strict";
exports.__esModule = true;
var Conf = require("conf");
var fs = require("fs");
var _pp = require('pretty-format');
var pp = function (_val) { return _pp(_val, { min: true }); };
var file = 'src/experiments/configs/BAD_CONFIG.exam';
// const file = '/home/gilad/.config/pyano-2.0/config.json';
var datastr = fs.readFileSync(file).toString();
var data = JSON.parse(datastr);
console.log('data: ', data);
// const conf = new Conf<IConf>(
// @ts-ignore
var conf = new Conf({
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
    }
});
var entries = Object.entries(data);
console.debug("entries: ", entries);
for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
    var _a = entries_1[_i], key = _a[0], val = _a[1];
    console.debug("key: " + pp(key) + ", val: " + pp(val));
    conf.set(key, val);
}
