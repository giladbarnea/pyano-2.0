def get_default() -> dict:
    # TODO: use RULES.defaults
    return dict(
        vid_silence_len=0,
        last_page='new',
        experiment_type='test',
        truth_file_path="experiments/truths/fur_elise_B.txt",
        current_test=dict(
            demo_type='video',
            errors_playingspeed=1,
            allowed_rhythm_deviation="40%",
            allowed_tempo_deviation="10%",
            levels=[dict(notes=4, trials=1, rhythm=False, tempo=None),
                    dict(notes=4, trials=1, rhythm=True, tempo=50)],
            finished_trials_count=0,
            save_path='experiments/configs/pyano_config.test',
            ),
        current_exam=dict(
            demo_type='animation',
            errors_playingspeed=0.5,
            allowed_rhythm_deviation="20%",
            allowed_tempo_deviation="5%",
            levels=[dict(notes=7, trials=3, rhythm=False, tempo=None),
                    dict(notes=7, trials=3, rhythm=True, tempo=50)],
            finished_trials_count=0,
            save_path='experiments/configs/pyano_config.exam',
            )
        )


def write(path: str, config: dict, overwrite=False):
    import json
    from common import dbg
    dbg.quickgroup('create.py write()', f'overwrite: {overwrite}')

    with open(path, mode="w" if overwrite else "x") as f:
        json.dump(config, f, indent=4)
