import pickle
from pathlib import Path
from typing import *

# import settings
from common.message import MsgList
from common.pyano_types import Mistake, ILevel, IMsg
from common import log
from common import tonode

Data = TypedDict("Data", {
    "truth_file":               str,
    "allowed_rhythm_deviation": str,
    "allowed_tempo_deviation":  str,
    "level":                    ILevel,
    # "experiment_type":          ExperimentType,
    "trial_msgs":               List[IMsg]
    })


def get_tempo_str(level_tempo: int, tempo_ratio: float, allowed_tempo_deviation: float) -> str:
    # eg level_tempo == 60, tempo_ratio == 1.0, allowed_tempo_deviation == 0.2
    level_tempo_dec = level_tempo / 100
    extra = level_tempo_dec * allowed_tempo_deviation  # 0.6*0.2 = 0.12
    tempo_floor = level_tempo_dec - extra  # 0.48
    tempo_ceil = max(1, level_tempo_dec + extra)  # max(1, 0.72) = 1
    if tempo_ratio < tempo_floor:
        return "slow"
    elif tempo_ratio > tempo_ceil:
        return "fast"
    else:
        return "ok"


def get_mistake(accuracy_ok: bool,
                rhythm: bool,
                rhythm_deviation: float,
                allowed_rhythm_deviation: float) -> Optional[Mistake]:
    if accuracy_ok:
        if rhythm:
            rhythm_ok = rhythm_deviation < allowed_rhythm_deviation
            if rhythm_ok:
                return None
            else:
                return "rhythm"
        else:
            return None
    else:
        return "accuracy"


def main(root_abs_path, *, trial_msgs, level, truth_file, allowed_rhythm_deviation, allowed_tempo_deviation):
    log.title(f'{trial_msgs = } | {level = } | {truth_file = } | {allowed_rhythm_deviation = } | {allowed_tempo_deviation = } ')
    
    trial_msgs = MsgList.from_dicts(*trial_msgs).normalized
    
    # NOTE to shachar:
    # Long lines are for noobs (direct quote of numb from when I was in sela)
    # If you find yourself like "wait.. what... let's break this down..." then it should have been
    # broken down in the first place by the developer
    # The thing is, even if broke it down with a variable, what would you call it in a way
    # that wouldn't confuse the reader with the eventual 'truth_file_path'?
    truth_file_path = (Path(root_abs_path) / 'src' / 'experiments' / 'truths' / truth_file).with_suffix('.txt')
    log.debug(f'{truth_file_path = }')
    truth_msgs = MsgList.from_file(truth_file_path).normalized
    log.debug(f'{truth_msgs = }')
    tempo_ratio = trial_msgs.get_tempo_ratio(truth_msgs)
    # Played slow (eg 0.8): factor is 1.25
    # Played fast (eg 1.5): factor is 0.66
    
    # trial_msgs_tempo_fixed is played at the same "speed" as the truth.
    trial_msgs_tempo_fixed = trial_msgs.create_tempo_shifted(1 / tempo_ratio, fix_chords=False).normalized
    trial_on_msgs = trial_msgs_tempo_fixed.on_msglist().normalized
    truth_on_msgs = truth_msgs.on_msglist().normalized
    trial_on_msgs_len = len(trial_on_msgs)
    level_notes = level.get('notes')
    level_rhythm = level.get('rhythm')
    level_tempo = level.get('tempo')
    if level_notes is None:
        log.warn("level notes is None! Script is gonna fail!")
    if level_rhythm is None:
        log.warn("level rhythm is None! Script is gonna fail!")
    
    too_many_notes = trial_on_msgs_len > level_notes
    enough_notes = trial_on_msgs_len >= level_notes
    
    mistakes = []
    for i in range(min(level_notes, trial_on_msgs_len)):
        subj_on = trial_on_msgs[i]
        truth_on = truth_on_msgs[i]
        accuracy_ok = subj_on.note == truth_on.note
        rhythm_deviation = trial_on_msgs.get_rhythm_deviation(truth_on_msgs, i, i)
        log.debug(f'{rhythm_deviation = }')
        mistake = get_mistake(accuracy_ok, level_rhythm, rhythm_deviation, allowed_rhythm_deviation)
        mistakes.append(mistake)
    
    if not enough_notes:
        mistakes += ["accuracy"] * (level_notes - trial_on_msgs_len)
    
    if level_rhythm:
        tempo_str = get_tempo_str(level_tempo, tempo_ratio, allowed_tempo_deviation)
        log.debug(f'{tempo_str = }')
    else:
        tempo_str = None
    log.debug(f'mistakes: {mistakes}')
    # TODO (Feb 6 2021):
    #  figure out what data node expects on other end and pass it below in tonode.send
    tonode.send(dict(enough_notes=enough_notes,
                     too_many_notes=too_many_notes,
                     tempo_str=tempo_str))
    # if settings.DEBUG:
    #     expected = data['expected']
    #     key_actual_map = dict(mistakes=mistakes,
    #                           tempo_str=tempo_str,
    #                           too_many_notes=too_many_notes,
    #                           enough_notes=enough_notes)
    #     for key, actual in key_actual_map.items():
    #         if expected[key] != actual:
    #             log.error(f'{key} != actual', 'actual: ', actual, 'expected:', expected[key])
    #         else:
    #             log.good(f'{key} ok')


if __name__ == '__main__':
    # dbg.group('analyze_txt')
    import sys
    
    root, stringified = sys.argv[1:]
    # /tmp/pyano/analyze_text
    picklepath = (Path('/tmp') / 'pyano') / Path(__file__).stem
    picklepath.mkdir(parents=True, exist_ok=True)
    with open(picklepath / 'root', mode='w+b') as f:
        pickle.dump(root, f)
    
    import json
    
    dataobj: Data = json.loads(stringified)
    with open(picklepath / 'dataobj', mode='w+b') as f:
        pickle.dump(dataobj, f)
    # with open(picklepath / 'dataobj.pickle', mode='w+b') as f:
    #     pickle.dump(dataobj, f)
    
    log.debug(f'dataobj: ', dataobj)
    
    main(root, **dataobj)
    # dbg.group_end()
