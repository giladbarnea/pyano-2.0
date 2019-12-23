import sys
from enum import Enum

from common import dbg, tonode
import json
from typing import *
from common.config import Subconfig
from common.level import Level
from common.message import Msg, MsgList
from mytool import mytb
import os
import settings
from birdseye import eye

Mistake = Union["accuracy", "rhythm"]


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


def main():
    if settings.DEBUG:
        ## debug --mockfile=mock_0 --disable-tonode
        MOCK_DATA_PATH_ABS = os.path.join(settings.API_PATH_ABS, 'mock_data')
        mock_file = None
        for arg in sys.argv:
            if arg.startswith('--'):
                _, _, val = arg.partition('=')
                if 'mockfile' in arg:
                    mock_file = val

        with open(f'{MOCK_DATA_PATH_ABS}/{mock_file}.json') as f:
            data = json.load(f)
        subj_msgs = MsgList.from_file(f'{MOCK_DATA_PATH_ABS}/{data.get("msgs_file")}.txt').normalized
        subj_msgs = [m.to_dict() for m in subj_msgs]
        data.update(msgs=subj_msgs)
    else:
        data = json.loads(sys.argv[2])
        subj_msgs = data.get('subj_msgs')
    # TODO: probably dont need this (conclude if passed in node)
    experiment_type = data.get('experiment_type')
    subconfig = Subconfig(data.get('subconfig'))
    level = Level(data.get('level'))

    subj_msgs = MsgList.from_dicts(*subj_msgs).normalized

    truth_msgs = MsgList.from_file(os.path.join(settings.TRUTHS_PATH_ABS, subconfig.truth_file) + '.txt').normalized
    tempo_ratio = subj_msgs.get_tempo_ratio(truth_msgs, only_note_on=True)
    ## Played slow (eg 0.8): factor is 1.25
    ## Played fast (eg 1.5): factor is 0.66
    subj_msgs_tempo_fixed = subj_msgs.create_tempo_shifted(1 / tempo_ratio, False).normalized
    subj_on_msgs = MsgList(subj_msgs_tempo_fixed.split_to_on_off()[0]).normalized
    truth_on_msgs = MsgList(truth_msgs.split_to_on_off()[0]).normalized
    subj_on_msgs_len = len(subj_on_msgs)
    too_many_notes = subj_on_msgs_len > level.notes
    enough_notes = subj_on_msgs_len >= level.notes

    mistakes = []
    for i in range(min(level.notes, subj_on_msgs_len)):
        subj_on = subj_on_msgs[i]
        truth_on = truth_on_msgs[i]
        accuracy_ok = subj_on.note == truth_on.note
        # TODO: run file with debug --mockfile=mock_2 --disable-tonode
        #  Follow comments in:
        #  1. mock_msgs_bad_rhythm_and_slow_tempo.txt
        #  2. mock_msgs_bad_rhythm_but_ok_tempo.txt
        #  3. mock_msgs_ok_rhythm_but_slow_tempo.txt
        #  Create appropriate mock jsons
        #  Figure out if any of the above should yield different results with exam vs test
        #  Create 3 more like above with acc mistakes

        rhythm_deviation = subj_on_msgs.get_rhythm_deviation(truth_on_msgs, i, i)
        dbg.debug(f'rhythm_deviation: {rhythm_deviation}')
        mistake = get_mistake(accuracy_ok, level.rhythm, rhythm_deviation, subconfig.allowed_rhythm_deviation)
        mistakes.append(mistake)

    if not enough_notes:
        mistakes += ["accuracy"] * (level.notes - subj_on_msgs_len)

    if level.rhythm:
        tempo_str = get_tempo_str(level.tempo, tempo_ratio, subconfig.allowed_tempo_deviation)
        dbg.debug(f'tempo_str: {tempo_str}')
    else:
        tempo_str = None
    dbg.debug(f'mistakes: {mistakes}')

    if settings.DEBUG:
        expected = data['expected']
        key_actual_map = dict(mistakes=mistakes,
                              tempo_str=tempo_str,
                              too_many_notes=too_many_notes,
                              enough_notes=enough_notes)
        for key, actual in key_actual_map.items():
            if expected[key] != actual:
                dbg.error(f'{key} != actual', 'actual: ', actual, 'expected:', expected[key])
            else:
                dbg.ok(f'{key} ok')


if __name__ == '__main__':
    try:
        dbg.group('analyze_txt')
        main()
        dbg.group_end()
    except Exception as e:
        exc_dict = mytb.exc_dict(e, locals=False)
        tonode.error(exc_dict)
        if settings.DEBUG:
            raise e
