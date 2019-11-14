import os
from getpass import getuser
from common import pyano_types as ptypes, util, dbg, tonode
import re
import settings
from typing import Dict, List, Tuple, Union, Optional

CONFIG_RULES = settings.RULES['config']
SUBCONFIG_RULES = CONFIG_RULES['subconfig']
DEFAULTS = CONFIG_RULES['defaults']
SUBCONFIG_DEFAULTS = DEFAULTS['subconfig']


def _find_file_where(path: str, ext: str) -> Optional[str]:
    for f in [f for f in os.listdir(path) if f.endswith(ext)]:
        if os.path.isfile(os.path.join(path, f)):
            return f
    return None


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
        return _find_file_where(os.path.join(settings.SRC_PATH, RULES_dirname), '.txt')
    # TODO: regex check for content like in Message ctor
    isfile = os.path.isfile(os.path.join(settings.SRC_PATH, path))

    if not isfile:
        return _find_file_where(os.path.join(settings.SRC_PATH, RULES_dirname), '.txt')
    return path


# @util.dont_raise
def _experiment_type(val: ptypes.ExperimentType) -> ptypes.ExperimentType:
    if val in CONFIG_RULES['experiment_types']:
        return val
    else:
        return DEFAULTS.get('experiment_types')


# @util.dont_raise
def _last_page(val: ptypes.PageName) -> ptypes.PageName:
    if val in CONFIG_RULES['page_names']:
        return val
    else:
        return DEFAULTS.get('last_page')


# @util.dont_raise
def _vid_silence_len(val: int) -> int:
    if val >= 0:
        return val
    return DEFAULTS.get('vid_silence_len')


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
        return DEFAULTS.get('devoptions')
    return val


# @util.dont_raise
def _velocities(val: List[int]) -> List[int]:
    if val:
        # TODO: better
        return val
    else:
        return DEFAULTS.get('velocities')


# @util.dont_raise
def _demo_type(val: ptypes.DemoType) -> ptypes.DemoType:
    if val in SUBCONFIG_RULES['demo_types']:
        return val
    else:
        return SUBCONFIG_DEFAULTS.get('demo_types')


# @util.dont_raise
def _errors_playingspeed(val: Union[int, float]) -> Union[int, float]:
    if val > 0:
        return val
    else:
        return SUBCONFIG_DEFAULTS.get('errors_playingspeed')


# @util.dont_raise
def _allowed_deviation(deviation_type: ptypes.DeviationType, val: str) -> str:
    # -40% fails here
    fmt_ok = val.endswith('%') and 2 <= len(val) <= 4 and val[0:-1].isdigit()
    if fmt_ok:
        return val
    else:
        return SUBCONFIG_DEFAULTS.get(f'allowed_{deviation_type}_deviation')


# @util.dont_raise
def _levels(lvls: ptypes.Levels) -> List[int]:
    RULES_level_keys = SUBCONFIG_RULES['level_keys']
    bad_levels_indices: List[int] = []
    for i, level in enumerate(lvls):
        checked_rhythm = False
        checked_tempo = False
        for k, v in level.items():
            if k not in RULES_level_keys:
                bad_levels_indices.append(i)
                break  # from inner for
            # valid key type

            if k == 'notes':
                # TODO: check for # of notes in piece by truth
                if not isinstance(v, int) or not v > 0:
                    bad_levels_indices.append(i)
                    break
            elif k == 'trials':
                if not isinstance(v, int) or not v > 0:
                    bad_levels_indices.append(i)
                    break

            elif k == 'rhythm':
                if checked_tempo:
                    break
                checked_rhythm = True
                if not isinstance(v, bool):
                    bad_levels_indices.append(i)
                    break
                # bool
                if v:  # rhythm: True
                    if not (tempo := level.get('tempo')) or not isinstance(tempo, int) or tempo <= 0:
                        bad_levels_indices.append(i)
                        break
                else:  # rhythm: False
                    if level.get('tempo') is not None:  # has to be None if no Tempo
                        bad_levels_indices.append(i)
                        break

            elif k == 'tempo':
                if checked_rhythm:
                    break
                checked_tempo = True
                if not isinstance(v, int) and v is not None:
                    bad_levels_indices.append(i)
                    break
                if v:  # tempo: int
                    if not (rhythm := level.get('rhythm')) or rhythm is not True:
                        bad_levels_indices.append(i)
                        break
                else:  # tempo: None
                    if level.get('rhythm') is not False:
                        bad_levels_indices.append(i)
                        break

    return bad_levels_indices


# @util.dont_raise
def _finished_trials_count(val: int) -> int:
    # TODO: maybe it must be 0?
    #  check against levels
    if isinstance(val, int) and val >= 0:
        return val
    return SUBCONFIG_DEFAULTS.get('finished_trials_count')


# @util.dont_raise
def _save_path(path: str, subcfg_name: ptypes.SubconfigName) -> Optional[str]:
    dirname, filename = os.path.split(path)  # "experiments/configs", "pyano_config.[exam|test]"
    RULES_dirname = CONFIG_RULES['configs_path']
    ext = f".{subcfg_name.replace('current_', '')}"
    fmt_ok = dirname == RULES_dirname and filename.endswith(ext)
    if not fmt_ok:
        return _find_file_where(os.path.join(settings.SRC_PATH, RULES_dirname), ext)

    isfile = os.path.isfile(os.path.join(settings.SRC_PATH, path))
    if not isfile:
        return _find_file_where(os.path.join(settings.SRC_PATH, RULES_dirname), ext)
    return path


# @util.dont_raise
def _current_subject(subj: str) -> str:
    if not isinstance(subj, str):
        return getuser()
    else:
        return subj


def fix_in_config(cfg_key: Union[ptypes.SubconfigKey, ptypes.ConfigKey],
                  subcfg_name: Optional[ptypes.SubconfigName],
                  result,
                  cfg: Union[ptypes.Subconfig, ptypes.Config]) -> None:
    if result is None:
        what = f'config["{subcfg_name}"]["{cfg_key}"]' if subcfg_name else f'config["{cfg_key}"]'
        dbg.warn(f'{what} returned None')
        tonode.send(f'{subcfg_name}.{cfg_key}' if subcfg_name else cfg_key)
    elif cfg.get(cfg_key) != result:
        what = f'config["{subcfg_name}"]["{cfg_key}"]' if subcfg_name else f'config["{cfg_key}"]'
        dbg.warn(f'{what} was fixed from "{cfg.get(cfg_key)}" to "{result}"')
        cfg[cfg_key] = result


# @util.dont_raise
def subconfig(subcfg: ptypes.Subconfig,
              subcfg_name: ptypes.SubconfigName) -> ptypes.Subconfig:
    dbg.group(f'subconfig("{subcfg_name}")')
    SUB_KEYS_TO_FN = dict(demo_type=_demo_type,
                          errors_playingspeed=_errors_playingspeed,
                          finished_trials_count=_finished_trials_count,
                          current_subject=_current_subject,

                          )
    for subcfg_key, fn in SUB_KEYS_TO_FN.items():
        subcfg_key: ptypes.SubconfigKey
        dbg.debug(subcfg_key)
        result = fn(subcfg.get(subcfg_key))
        fix_in_config(subcfg_key, subcfg_name, result, subcfg)

    bad_levels_indices = _levels(subcfg.get('levels'))
    if bad_levels_indices:
        dbg.warn('bad_levels_indices:', bad_levels_indices)
        [tonode.send(f'{subcfg_name}.levels[{i}]') for i in bad_levels_indices]
    save_path = _save_path(subcfg.get('save_path'), subcfg_name)
    fix_in_config('save_path', subcfg_name, save_path, subcfg)

    allowed_rhythm_deviation = _allowed_deviation('rhythm', subcfg.get('allowed_rhythm_deviation'))
    fix_in_config('allowed_rhythm_deviation', subcfg_name, allowed_rhythm_deviation, subcfg)

    allowed_tempo_deviation = _allowed_deviation('tempo', subcfg.get('allowed_tempo_deviation'))
    fix_in_config('allowed_tempo_deviation', subcfg_name, allowed_tempo_deviation, subcfg)
    dbg.group_end()
    return subcfg


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
        fix_in_config(configkey, None, result, config)

    current_test = subconfig(config.get('current_test'), 'current_test')
    current_exam = subconfig(config.get('current_exam'), 'current_exam')
    config['current_test'] = current_test
    config['current_exam'] = current_exam
    dbg.group_end()
    return config
