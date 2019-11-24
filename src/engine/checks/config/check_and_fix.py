import os
from getpass import getuser

from common.config_classes import BigConfig, SubConfig

from . import fix_in_config, subconfig
from common import dbg, util
from common.pyano_types import *
import settings
from typing import List, Optional

CONFIG_RULES = settings.RULES['config']

CONFIG_DEFAULTS = CONFIG_RULES['defaults']


# def _root_abs_path(path: str) -> Optional[str]:
#     if os.path.isdir(path):
#         return path
#     return None


def _dev(val: bool) -> bool:
    if isinstance(val, bool):
        return val
    else:
        return getuser() == 'gilad'


def _devoptions(val: dict) -> dict:
    # TODO: better
    if not val:
        return CONFIG_DEFAULTS.get('devoptions')
    return val


def _experiment_type(val: ExperimentType) -> ExperimentType:
    if val in CONFIG_RULES['experiment_types']:
        return val
    else:
        return CONFIG_DEFAULTS.get('experiment_type')


def _last_page(val: PageName) -> PageName:
    if val in CONFIG_RULES['page_names']:
        return val
    else:
        return CONFIG_DEFAULTS.get('last_page')


def _vid_silence_len(val: int) -> int:
    if val >= 0:
        return val
    return CONFIG_DEFAULTS.get('vid_silence_len')


# def _save_path(path: str, subcfg_type: ExperimentType) -> Optional[str]:
#     # TODO: try to get config file by truth_file (big config)
#     dirname, filename = os.path.split(path)  # "experiments/configs", "pyano_config.[exam|test]"
#     RULES_dirname = CONFIG_RULES['configs_path']
#     ext = f".{subcfg_type.replace('current_', '')}"
#     fmt_ok = dirname == RULES_dirname and filename.endswith(ext)
#     if not fmt_ok:
#         return util.find_file_where(RULES_dirname, ext)
#
#     isfile = os.path.isfile(os.path.join(settings.SRC_PATH_ABS, path))
#     if not isfile:
#         return util.find_file_where(RULES_dirname, ext)
#     return path


def _subjects(val: List[str]) -> List[str]:
    # TODO: check for directories?
    #  duplicates
    username = getuser()
    username_in_subjects = False
    for subj in val:
        if not subj or not isinstance(subj, str):
            try:
                dbg.debug(f'removed {subj} from subjects')
            except:
                pass
            val.remove(subj)
        if subj == username:
            username_in_subjects = True

    if not username_in_subjects:
        val.append(username)
    return val


def _velocities(val: List[int]) -> List[int]:
    if val:
        # TODO: better
        return val
    else:
        return CONFIG_DEFAULTS.get('velocities')


def check_and_fix(config: BigConfig) -> BigConfig:
    dbg.group('check_and_fix.py check_and_fix()')
    # KEYS_TO_FN = dict(
    #     # root_abs_path=_root_abs_path,
    #     dev=_dev,
    #     # truth_file_path=_truth_file_path,
    #     experiment_type=_experiment_type,
    #     last_page=_last_page,
    #     vid_silence_len=_vid_silence_len,
    #     subjects=_subjects,
    #     devoptions=_devoptions,
    #     velocities=_velocities,
    #     )
    #
    # for configkey, fn in KEYS_TO_FN.items():
    #     configkey: BigConfigKey
    #     dbg.debug(configkey)
    #     result = fn(config.get(configkey))
    #     fix_in_config(configkey, result, config)

    # current_test = subconfig.check_and_fix(config.get('current_test'), 'current_test')
    # current_exam = subconfig.check_and_fix(config.get('current_exam'), 'current_exam')
    # config['current_test'] = current_test
    # config['current_exam'] = current_exam
    config.dev = _dev(config.dev)
    config.devoptions = _devoptions(config.devoptions)
    config.experiment_type = _experiment_type(config.experiment_type)
    config.last_page = _last_page(config.last_page)
    config.subjects = _subjects(config.subjects)
    config.velocities = _velocities(config.velocities)
    config.vid_silence_len = _vid_silence_len(config.vid_silence_len)
    dbg.group_end()
    return config
