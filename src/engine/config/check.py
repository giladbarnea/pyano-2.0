import os
import util
import re
import sys
import settings
from typing import Dict, List


@util.noraise
def _root_abs_path(path: str):
    return os.path.isdir(path)


@util.noraise
def _dev(val: str):
    return isinstance(val, bool)


@util.noraise
def _truth_file_path(path: str):
    split = re.split(r'[\\/]', path)
    rules_path: [str] = settings.RULES['config']['truth_path'].split('/')
    fmt_ok = (len(split) == 3
              and split[0] == rules_path[0]
              and split[1] == rules_path[1]
              and split[2].endswith('.txt'))
    if not fmt_ok:
        return False
    # TODO: regex check for content like in Message ctor
    return os.path.isfile(os.path.join(sys.argv[1], path))


@util.noraise
def _experiment_type(val: str):
    return val in settings.RULES['config']['experiment_types']


@util.noraise
def _last_page(val: str):
    return val in settings.RULES['config']['pages']


@util.noraise
def _vid_silence_len(val: int):
    return val >= 0


@util.noraise
def _subjects(val: List[str]):
    # TODO: check for directories?
    username = os.getlogin()
    username_in_subjects = False
    for subj in val:
        if not isinstance(subj, str):
            return False
        if subj == username:
            username_in_subjects = True
    return username_in_subjects


@util.noraise
def _devoptions(val):
    return True


@util.noraise
def _velocities(val):
    return True


@util.noraise
def _demo_type(val):
    return val in settings.RULES['config']['demo_types']


@util.noraise
def _errors_playingspeed(val):
    return val > 0


@util.noraise
def _allowed_deviation(val: str):
    return val.endswith('%') and 2 >= len(val) >= 4


@util.noraise
def _levels(val: List[Dict]):
    for level in val:
        if level['notes'] <= 0:
            return False
        if level['trials'] <= 0:
            return False
        if not isinstance(level['rhythm'], bool):
            return False
        if level['tempo'] <= 0 or level['tempo'] >= 200:
            return False

    return True


@util.noraise
def _finished_trials_count(val: int):
    # TODO: maybe it must be 0?
    return isinstance(val, int)


@util.noraise
def _save_path(path: str):
    # TODO: check for extension
    return os.path.isfile(path)


@util.noraise
def _current_subject(val: str):
    return True


@util.noraise
def subconfig(val):
    SUB_KEYS_TO_FN = dict(demo_type=_demo_type,
                          errors_playingspeed=_errors_playingspeed,
                          allowed_rhythm_deviation=_allowed_deviation,
                          allowed_tempo_deviation=_allowed_deviation,
                          levels=_levels,
                          finished_trials_count=_finished_trials_count,
                          save_path=_save_path,
                          current_subject=_current_subject
                          )
    return True


def first_level(config: dict) -> [str]:
    KEYS_TO_FN = dict(root_abs_path=_root_abs_path,
                      dev=_dev,
                      truth_file_path=_truth_file_path,
                      experiment_type=_experiment_type,
                      last_page=_last_page,
                      vid_silence_len=_vid_silence_len,
                      subjects=_subjects,
                      devoptions=_devoptions,
                      velocities=_velocities,
                      current_test=subconfig,
                      current_exam=subconfig)
    bad_keys = []
    for k, fn in KEYS_TO_FN.items():
        if not fn(config.get(k)):
            bad_keys.append(k)

    return bad_keys
