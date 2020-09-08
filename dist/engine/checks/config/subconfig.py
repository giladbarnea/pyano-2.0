from . import fix_in_config
import settings
from typing import *
import os
from common import dbg, tonode, util
from common.pyano_types import *
from common.config import Subconfig

from getpass import getuser

CONFIG_RULES = settings.RULES['config']
SUBCONFIG_RULES = CONFIG_RULES['subconfig']
CONFIG_DEFAULTS = CONFIG_RULES['defaults']


def _allowed_deviation(val: float, deviation_type: DeviationType, subcfg_type: ExperimentType) -> float:
    # -40% fails here
    fmt_ok = val.endswith('%') and 2 <= len(val) <= 4 and val[0:-1].isdigit()
    if fmt_ok:
        return val
    else:
        return CONFIG_DEFAULTS[subcfg_type].get(f'allowed_{deviation_type}_deviation')


def _errors_playrate(val: Union[int, float], subcfg_type: ExperimentType) -> Union[int, float]:
    if val > 0:
        return val
    else:
        return CONFIG_DEFAULTS[subcfg_type].get('errors_playrate')


def _demo_type(val: DemoType, subcfg_type: ExperimentType) -> DemoType:
    if val in SUBCONFIG_RULES['demo_types']:
        return val
    else:
        return CONFIG_DEFAULTS[subcfg_type].get('demo_type')


def _subject(subj: str) -> str:
    if not isinstance(subj, str):
        return getuser()
    else:
        return subj


def _levels(lvls: List[TLevel]) -> List[int]:
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
                    tempo = level.get('tempo')
                    if not tempo or not isinstance(tempo, int) or tempo <= 0:
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
                    rhythm = level.get('rhythm')
                    if not rhythm or rhythm is not True:
                        bad_levels_indices.append(i)
                        break
                else:  # tempo: None
                    if level.get('rhythm') is not False:
                        bad_levels_indices.append(i)
                        break

    return bad_levels_indices


def _finished_trials_count(val: int) -> int:
    # TODO: maybe it must be 0?
    #  check against levels
    # if not isinstance(val, int) or val != 0:
    #     return val
    return 0


def _truth_file(file: str, subcfg_type: ExperimentType) -> Optional[str]:
    # dirname, filename = os.path.split(path)  # "experiments/truths", "fur_elise_B.txt"

    # RULES_dirname = CONFIG_RULES['truths_path']

    fmt_ok = file.endswith('.txt')
    # TODO: check base, _on.txt, _off.txt
    if not fmt_ok:
        return util.find_file_where(settings.TRUTHS_PATH_ABS, '.txt')
    # TODO: regex check for content like in Message ctor
    isfile = os.path.isfile(os.path.join(settings.TRUTHS_PATH_ABS, file))

    if not isfile:
        return util.find_file_where(settings.TRUTHS_PATH_ABS, '.txt')
    return file


def check_and_fix(subcfg: Subconfig,
                  subcfg_type: ExperimentType) -> Subconfig:
    dbg.group(f'subconfig.check_and_fix("{subcfg_type}")')

    allowed_rhythm_deviation = _allowed_deviation(subcfg.allowed_rhythm_deviation, "rhythm", subcfg_type)
    fix_in_config('allowed_rhythm_deviation', allowed_rhythm_deviation, subcfg, subcfg_type)

    allowed_tempo_deviation = _allowed_deviation(subcfg.allowed_tempo_deviation, 'tempo', subcfg_type)
    fix_in_config('allowed_tempo_deviation', allowed_tempo_deviation, subcfg, subcfg_type)

    subject = _subject(subcfg.subject)
    fix_in_config('subject', subject, subcfg, subcfg_type)

    demo_type = _demo_type(subcfg.demo_type, subcfg_type)
    fix_in_config('demo_type', demo_type, subcfg, subcfg_type)

    errors_playrate = _errors_playrate(subcfg.errors_playrate, subcfg_type)
    fix_in_config('errors_playrate', errors_playrate, subcfg, subcfg_type)

    finished_trials_count = _finished_trials_count(subcfg.finished_trials_count)
    fix_in_config('finished_trials_count', finished_trials_count, subcfg, subcfg_type)

    bad_levels_indices = _levels(subcfg.levels)
    if bad_levels_indices:
        dbg.warn('bad_levels_indices:', bad_levels_indices)
        [tonode.send(f'{subcfg_type}.levels[{i}]') for i in bad_levels_indices]

    truth_file = _truth_file(subcfg.truth_file, subcfg_type)
    fix_in_config('truth_file', truth_file, subcfg, subcfg_type)

    dbg.group_end()
    return subcfg
