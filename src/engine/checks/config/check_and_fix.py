import os
from getpass import getuser

from . import find_file_where, fix_in_config, subconfig
from common import pyano_types as ptypes, dbg
import settings
from typing import List, Optional

CONFIG_RULES = settings.RULES['config']

CONFIG_DEFAULTS = CONFIG_RULES['defaults']


# @util.dont_raise
def _root_abs_path(path: str) -> Optional[str]:
    if os.path.isdir(path):
        return path
    return None


# @util.dont_raise
def _dev(val: bool) -> bool:
    if isinstance(val, bool):
        return val
    else:
        return getuser() == 'gilad'


# @util.dont_raise
def _truth_file_path(path: str) -> Optional[str]:
    dirname, filename = os.path.split(path)  # "experiments/truths", "fur_elise_B.txt"

    RULES_dirname = CONFIG_RULES['truths_path']

    fmt_ok = dirname == RULES_dirname and filename.endswith('.txt')
    if not fmt_ok:
        return find_file_where(RULES_dirname, '.txt')
    # TODO: regex check for content like in Message ctor
    isfile = os.path.isfile(os.path.join(settings.SRC_PATH_ABS, path))

    if not isfile:
        return find_file_where(RULES_dirname, '.txt')
    return path


# @util.dont_raise
def _experiment_type(val: ptypes.ExperimentType) -> ptypes.ExperimentType:
    if val in CONFIG_RULES['experiment_types']:
        return val
    else:
        return CONFIG_DEFAULTS.get('experiment_types')


# @util.dont_raise
def _last_page(val: ptypes.PageName) -> ptypes.PageName:
    if val in CONFIG_RULES['page_names']:
        return val
    else:
        return CONFIG_DEFAULTS.get('last_page')


# @util.dont_raise
def _vid_silence_len(val: int) -> int:
    if val >= 0:
        return val
    return CONFIG_DEFAULTS.get('vid_silence_len')


# @util.dont_raise
def _subjects(val: List[str]) -> List[str]:
    # TODO: check for directories?
    #  duplicates
    username = getuser()
    username_in_subjects = False
    for subj in val:
        if not isinstance(subj, str):
            val.remove(subj)
        if subj == username:
            username_in_subjects = True

    if not username_in_subjects:
        val.append(username)
    return val


# @util.dont_raise
def _devoptions(val: dict) -> dict:
    # TODO: better
    if not val:
        return CONFIG_DEFAULTS.get('devoptions')
    return val


# @util.dont_raise
def _velocities(val: List[int]) -> List[int]:
    if val:
        # TODO: better
        return val
    else:
        return CONFIG_DEFAULTS.get('velocities')


def check_and_fix(config: ptypes.Config) -> ptypes.Config:
    dbg.group('check_and_fix.py check_and_fix()')
    KEYS_TO_FN = dict(
        root_abs_path=_root_abs_path,
        dev=_dev,
        truth_file_path=_truth_file_path,
        experiment_type=_experiment_type,
        last_page=_last_page,
        vid_silence_len=_vid_silence_len,
        subjects=_subjects,
        devoptions=_devoptions,
        velocities=_velocities,
        )

    for configkey, fn in KEYS_TO_FN.items():
        configkey: ptypes.ConfigKey
        dbg.debug(configkey)
        result = fn(config.get(configkey))
        fix_in_config(configkey, result, config)

    current_test = subconfig.check_and_fix(config.get('current_test'), 'current_test')
    current_exam = subconfig.check_and_fix(config.get('current_exam'), 'current_exam')
    config['current_test'] = current_test
    config['current_exam'] = current_exam
    dbg.group_end()
    return config
