/*


describe('Good examples', () => {
    const cfg = {
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
    const bigconf = new store.BigConfigCls(true);
    // expect(bigconf).toBeFalsy()
    console.log(bigconf)
    // expect(int()).toEqual(0);
});*/


test("something", () => {
    expect(1).toBe(1);
    const pp = require('pretty-format');

    const store = require('../../../dist/store').store;
    const bigconf = new store.BigConfigCls(true);

    // const pp = await import('pretty-format')
    // expect(window).toBeDefined();

    // expect(store).toBeDefined()
    // console.log(pp(electron))
    // expect(electron.remote).toBeDefined();
    // expect(electron).toBeDefined();
    // console.log(pp(electron))
    // expect(electron.remote).toBeDefined();
    // const bigconf = new store.BigConfigCls(true);

});