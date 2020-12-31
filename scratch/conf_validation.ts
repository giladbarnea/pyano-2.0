import * as Conf from 'conf';
import * as fs from 'fs';
import type { store } from "../declarations/store";

const _pp = require('pretty-format');
const pp = (_val) => _pp(_val, { min: true });
const file = 'src/experiments/configs/BAD_CONFIG.exam';
// const file = '/home/gilad/.config/pyano-2.0/config.json';
let datastr = fs.readFileSync(file).toString();
const data = JSON.parse(datastr);
console.log('data: ', data);


/*
Examples big config:
{
    "dev": false,
    "devoptions": {
        "force_notes_number": null,
        "force_playback_rate": null,
        "mute_animation": false,
        "no_reload_on_submit": false,
        "simulate_test_mode": false,
        "simulate_video_mode": false,
        "simulate_animation_mode": false,
        "skip_experiment_intro": false,
        "skip_fade": false,
        "skip_failed_trial_feedback": false,
        "skip_level_intro": false,
        "skip_midi_exists_check": false,
        "skip_passed_trial_feedback": false
    },
    "exam_file": "fur_elise_B.exam",
    "experiment_type": "test",
    "last_page": "new",
    "test_file": "fur_elise_B.test",
    "subjects": [
        "yuval_bar_yosef",
        "someone"
    ],
    "velocities": 2
}
* */

const bigconfschema: store.BigConfigSchema = {
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
    },
    experiment_type: {
        type: "string"
    },
    last_page: {
        type: "string",
        enum: ["new", "running", "record", "file_tools", "settings"]
    },
    dev: {
        type: "boolean",
        default:false
    },
    devoptions: {
        type: "object",
        properties: {
            force_notes_number: { type: "number" },
            force_playback_rate: { type: "number" },
            mute_animation: { type: "boolean" },
            no_reload_on_submit: { type: "boolean" },
            simulate_test_mode: { type: "boolean" },
            simulate_video_mode: { type: "boolean" },
            simulate_animation_mode: { type: "boolean" },
            skip_experiment_intro: { type: "boolean" },
            skip_fade: { type: "boolean" },
            skip_failed_trial_feedback: { type: "boolean" },
            skip_level_intro: { type: "boolean" },
            skip_midi_exists_check: { type: "boolean" },
            skip_passed_trial_feedback: { type: "boolean" }
        }
    }


};
const bigconf = new Conf<store.IBigConfig>({ schema: bigconfschema });

let entries = Object.entries(data);
console.debug(`entries: `, entries);
for (let [key, val] of entries) {
    console.debug(`key: ${pp(key)}, val: ${pp(val)}`);
    bigconf.set(key, val);
}
