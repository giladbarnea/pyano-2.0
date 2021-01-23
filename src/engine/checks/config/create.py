import settings
from typing import Union
from common.pyano_types import *
from common.config_classes import BigConfig, Subconfig


def get_default() -> IBigConfig:
    # TODO: use RULES.defaults
    CONFIG_DEFAULTS: dict = settings.RULES['config']['defaults']
    TEST_DEFAULTS = CONFIG_DEFAULTS.pop('test')
    EXAM_DEFAULTS = CONFIG_DEFAULTS.pop('exam')
    return CONFIG_DEFAULTS


"""    return dict(
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
"""


def write(abs_path: str, config: Union[BigConfig, Subconfig], overwrite=False):
    import json
    from common import dbg
    dbg.group('create.py write()')
    dbg.debug(f'overwrite: {overwrite}')
    if settings.DRYRUN:
        dbg.debug(f'DRYRUN, not writing')
    else:
        with open(abs_path, mode="w" if overwrite else "x") as f:
            json.dump(config, f, indent=4, sort_keys=True)

    dbg.group_end()
