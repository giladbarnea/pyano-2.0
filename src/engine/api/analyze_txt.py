import sys
from common import dbg, tonode, consts
import json
from typing import *
from common.config import Subconfig
from common.util import ignore
from common.level import Level
from common.message import Msg, MsgList, Pair
from mytool import mytb, term
import os
import settings
from birdseye import eye


def get_tempo_str(level_tempo: int, relative_tempo: float, allowed_tempo_deviation: int) -> str:
    # eg tempo == 75
    extra = level_tempo * allowed_tempo_deviation / 100  # 75*0.1 = 7.5
    tempo_floor = level_tempo - extra  # 67.5
    tempo_ceil = max(100, level_tempo + extra)  # max(100, 82.5) = 100
    if relative_tempo < tempo_floor:
        return "slow"
    elif relative_tempo > tempo_ceil:
        return "fast"
    else:
        return "ok"


# @eye
def main():
    if settings.DEBUG:
        ## debug --mockfile=mock_0 --disable-tonode
        mock_data_path_abs = os.path.join(settings.SRC_PATH_ABS, 'engine', 'api', 'mock_data')
        mock_file = None
        for arg in sys.argv:
            if arg.startswith('--'):
                _, _, val = arg.partition('=')
                if 'mockfile' in arg:
                    mock_file = val

        with open(f'{mock_data_path_abs}/{mock_file}.json') as f:
            data = json.load(f)
        subj_msgs = MsgList.from_file(f'{mock_data_path_abs}/{data.get("msgs_file")}.txt').normalized
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
    relative_tempo = subj_msgs.get_relative_tempo(truth_msgs)
    ## Played slow (eg 0.8): factor is 1.25
    ## Played fast (eg 1.5): factor is 0.66
    subj_msgs_tempo_fixed = subj_msgs.create_tempo_shifted(1 / relative_tempo, False).normalized
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
        rhythm_deviation = subj_on_msgs.get_rhythm_deviation(truth_on_msgs, i, i)
        if accuracy_ok:
            if level.rhythm:
                rhythm_ok = rhythm_deviation < int(subconfig.allowed_rhythm_deviation[:-1]) / 100
                mistakes.append(None if rhythm_ok else "rhythm")
            else:
                mistakes.append(None)
        else:
            rhythm_ok = None
            mistakes.append("accuracy")
    if not enough_notes:
        mistakes += ["accuracy"] * (level.notes - subj_on_msgs_len)

    if level.rhythm:
        tempo_str = get_tempo_str(level.tempo, relative_tempo, int(subconfig.allowed_tempo_deviation[:-1]))
        print(f'tempo_str: {tempo_str}')
    else:
        tempo_str = None
    print(f'mistakes: {mistakes}')

    if settings.DEBUG:
        expected = data['expected']
        key_actual_map = dict(mistakes=mistakes,
                              tempo_str=tempo_str,
                              too_many_notes=too_many_notes,
                              enough_notes=enough_notes)
        assert expected['mistakes'] == mistakes
        for key, actual in key_actual_map.items():
            if expected[key] != actual:
                dbg.error(f'{key} != actual. actual: ', actual, 'expected:', expected[key])
            else:
                dbg.ok(f'{key} ok')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        exc_dict = mytb.exc_dict(e, locals=False)
        tonode.error(exc_dict)
        if settings.DEBUG:
            raise e
