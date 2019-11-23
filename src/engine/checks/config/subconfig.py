from . import find_file_where, fix_in_config
import settings
from typing import Optional, List, Union
import os
from common import dbg, tonode, pyano_types as ptypes
from getpass import getuser

CONFIG_RULES = settings.RULES['config']
SUBCONFIG_RULES = CONFIG_RULES['subconfig']
CONFIG_DEFAULTS = CONFIG_RULES['defaults']


# @util.dont_raise
def _allowed_deviation(val: str, deviation_type: ptypes.DeviationType, subcfg_name: ptypes.SubconfigName) -> str:
    # -40% fails here
    fmt_ok = val.endswith('%') and 2 <= len(val) <= 4 and val[0:-1].isdigit()
    if fmt_ok:
        return val
    else:
        return CONFIG_DEFAULTS[subcfg_name].get(f'allowed_{deviation_type}_deviation')


# @util.dont_raise
def _errors_playingspeed(val: Union[int, float], subcfg_name: ptypes.SubconfigName) -> Union[int, float]:
    if val > 0:
        return val
    else:
        return CONFIG_DEFAULTS[subcfg_name].get('errors_playingspeed')


# @util.dont_raise
def _demo_type(val: ptypes.DemoType, subcfg_name: ptypes.SubconfigName) -> ptypes.DemoType:
    if val in SUBCONFIG_RULES['demo_types']:
        return val
    else:
        return CONFIG_DEFAULTS[subcfg_name].get('demo_types')


# @util.dont_raise
def _save_path(path: str, subcfg_name: ptypes.SubconfigName) -> Optional[str]:
    # TODO: try to get config file by truth_file_path (big config)
    dirname, filename = os.path.split(path)  # "experiments/configs", "pyano_config.[exam|test]"
    RULES_dirname = CONFIG_RULES['configs_path']
    ext = f".{subcfg_name.replace('current_', '')}"
    fmt_ok = dirname == RULES_dirname and filename.endswith(ext)
    if not fmt_ok:
        return find_file_where(RULES_dirname, ext)

    isfile = os.path.isfile(os.path.join(settings.SRC_PATH_ABS, path))
    if not isfile:
        return find_file_where(RULES_dirname, ext)
    return path


# @util.dont_raise
def _current_subject(subj: str) -> str:
    if not isinstance(subj, str):
        return getuser()
    else:
        return subj


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
    # if not isinstance(val, int) or val != 0:
    #     return val
    return 0


# @util.dont_raise
def check_and_fix(subcfg: ptypes.Subconfig,
                  subcfg_name: ptypes.SubconfigName) -> ptypes.Subconfig:
    dbg.group(f'subconfig.check_and_fix("{subcfg_name}")')

    finished_trials_count = _finished_trials_count(subcfg.get('finished_trials_count'))
    fix_in_config('finished_trials_count', finished_trials_count, subcfg, subcfg_name)

    current_subject = _current_subject(subcfg.get('current_subject'))
    fix_in_config('current_subject', current_subject, subcfg, subcfg_name)

    bad_levels_indices = _levels(subcfg.get('levels'))
    if bad_levels_indices:
        dbg.warn('bad_levels_indices:', bad_levels_indices)
        [tonode.send(f'{subcfg_name}.levels[{i}]') for i in bad_levels_indices]

    errors_playingspeed = _errors_playingspeed(subcfg.get('errors_playingspeed'), subcfg_name)
    fix_in_config('errors_playingspeed', errors_playingspeed, subcfg, subcfg_name)

    demo_type = _demo_type(subcfg.get('demo_type'), subcfg_name)
    fix_in_config('demo_type', demo_type, subcfg, subcfg_name)

    save_path = _save_path(subcfg.get('save_path'), subcfg_name)
    fix_in_config('save_path', save_path, subcfg, subcfg_name)

    allowed_rhythm_deviation = _allowed_deviation(subcfg.get('allowed_rhythm_deviation'), "rhythm", subcfg_name)
    fix_in_config('allowed_rhythm_deviation', allowed_rhythm_deviation, subcfg, subcfg_name)

    allowed_tempo_deviation = _allowed_deviation(subcfg.get('allowed_tempo_deviation'), 'tempo', subcfg_name)
    fix_in_config('allowed_tempo_deviation', allowed_tempo_deviation, subcfg, subcfg_name)
    dbg.group_end()
    return subcfg
