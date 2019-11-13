import os
import util
from util import Dbg
import re
import sys
import settings
from typing import Dict, List, Tuple


@util.dont_raise
def _root_abs_path(path: str) -> Tuple[bool, str]:
    ok = os.path.isdir(path)
    return (True, '') if ok else (False, 'isdir')


@util.dont_raise
def _dev(val: str) -> Tuple[bool, str]:
    ok = isinstance(val, bool)
    return (True, '') if ok else (False, 'type')


@util.dont_raise
def _truth_file_path(path: str) -> Tuple[bool, str]:
    split = re.split(r'[\\/]', path)
    rules_path: [str] = settings.RULES['config']['truth_path'].split('/')
    fmt_ok = (len(split) == 3
              and split[0] == rules_path[0]
              and split[1] == rules_path[1]
              and split[2].endswith('.txt'))
    if not fmt_ok:
        return False, 'format'
    # TODO: regex check for content like in Message ctor
    isfile = os.path.isfile(os.path.join(sys.argv[1], path))
    return (True, '') if isfile else (False, 'isfile')


@util.dont_raise
def _experiment_type(val: str) -> Tuple[bool, str]:
    ok = val in settings.RULES['config']['experiment_types']
    return (True, '') if ok else (False, 'value')


@util.dont_raise
def _last_page(val: str) -> Tuple[bool, str]:
    ok = val in settings.RULES['config']['pages']
    return (True, '') if ok else (False, 'value')


@util.dont_raise
def _vid_silence_len(val: int) -> Tuple[bool, str]:
    ok = val >= 0
    return (True, '') if ok else (False, 'range')


@util.dont_raise
def _subjects(val: List[str]) -> Tuple[bool, str]:
    # TODO: check for directories?
    username = os.getlogin()
    username_in_subjects = False
    for subj in val:
        if not isinstance(subj, str):
            return False, "type"
        if subj == username:
            username_in_subjects = True

    return (True, '') if username_in_subjects else (False, 'login')


@util.dont_raise
def _devoptions(val) -> Tuple[bool, str]:
    return True, ''


@util.dont_raise
def _velocities(val) -> Tuple[bool, str]:
    return True, ''


@util.dont_raise
def _demo_type(val) -> Tuple[bool, str]:
    ok = val in settings.RULES['config']['subconfig']['demo_types']
    return (True, '') if ok else (False, 'value')


@util.dont_raise
def _errors_playingspeed(val) -> Tuple[bool, str]:
    ok = val > 0
    return (True, '') if ok else (False, 'range')


@util.dont_raise
def _allowed_deviation(val: str) -> Tuple[bool, str]:
    ok = val.endswith('%') and 2 <= len(val) <= 4
    return (True, '') if ok else (False, 'value')


@util.dont_raise
def _levels(val: List[Dict]) -> Tuple[bool, str]:
    level_keys = settings.RULES['config']['subconfig']['level_keys']
    for level in val:
        if list(level.keys()) != level_keys:
            return False, 'value'
        if level['notes'] <= 0:
            return False, 'range'
        if level['trials'] <= 0:
            return False, 'range'
        if not isinstance(level['rhythm'], bool):
            return False, 'type'
        if level['rhythm']:  # rhythm: True
            if not 0 < level['tempo'] < 200:
                return False, 'range'
        else:  # rhythm: False
            if level['tempo'] is not None:
                return False, 'value'

    return True, ''


@util.dont_raise
def _finished_trials_count(val: int) -> Tuple[bool, str]:
    # TODO: maybe it must be 0?
    ok = isinstance(val, int)
    return (True, '') if ok else (False, 'type')


@util.dont_raise
def _save_path(path: str) -> Tuple[bool, str]:
    # TODO: check for extension
    ok = os.path.isfile(path)
    return (True, '') if ok else (False, 'isfile')


@util.dont_raise
def _current_subject(subj: str) -> Tuple[bool, str]:
    # TODO: check for os.login
    ok = isinstance(subj, str)
    return (True, '') if ok else (False, 'type')


@util.dont_raise
def subconfig(val: dict) -> List[Tuple[str, str]]:
    Dbg.group('subconfig()')
    SUB_KEYS_TO_FN = dict(demo_type=_demo_type,
                          errors_playingspeed=_errors_playingspeed,
                          allowed_rhythm_deviation=_allowed_deviation,
                          allowed_tempo_deviation=_allowed_deviation,
                          levels=_levels,
                          finished_trials_count=_finished_trials_count,
                          save_path=_save_path,
                          current_subject=_current_subject
                          )
    bad_subkeys: List[Tuple[str, str]] = []
    for k, fn in SUB_KEYS_TO_FN.items():
        Dbg.print(k)
        result = fn(val.get(k))
        if result[0] is False:
            bad_subkeys.append((k, result[1]))

    Dbg.group_end()
    return bad_subkeys


def check_config(config: dict) -> List[Tuple[str, str] or dict]:
    Dbg.group('check.py check_config()')
    KEYS_TO_FN = dict(root_abs_path=_root_abs_path,
                      dev=_dev,
                      truth_file_path=_truth_file_path,
                      experiment_type=_experiment_type,
                      last_page=_last_page,
                      vid_silence_len=_vid_silence_len,
                      subjects=_subjects,
                      devoptions=_devoptions,
                      velocities=_velocities, )
    bad_keys: List[Tuple[str, str] or dict] = []
    for k, fn in KEYS_TO_FN.items():
        Dbg.print(k)
        result = fn(config.get(k))
        if result[0] is False:
            bad_keys.append((k, result[1]))
    bad_current_test_keys = subconfig(config.get('current_test'))
    bad_current_exam_keys = subconfig(config.get('current_exam'))
    Dbg.print('bad_current_test_keys:', bad_current_test_keys)
    Dbg.print('bad_current_exam_keys:', bad_current_exam_keys)
    if bad_current_test_keys:
        bad_keys.append(dict(current_test=bad_current_test_keys))
    if bad_current_exam_keys:
        bad_keys.append(dict(current_exam=bad_current_exam_keys))
    Dbg.group_end()
    return bad_keys
