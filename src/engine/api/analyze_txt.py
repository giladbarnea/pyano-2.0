import sys
from common import dbg, tonode, consts
import json
from typing import *
from common.config import Subconfig
from common.util import ignore
from common.level import Level
from common.message import Msg, MsgList, Pair
from mytool import mytb
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


@eye
def main():
    if sys.argv[2] == 'debug':
        ## /home/gilad/Code/pyano-2.0 debug 0 [1]
        mock_data_path_abs = os.path.join(settings.SRC_PATH_ABS, 'engine', 'api', 'mock_data')
        with open(f'{mock_data_path_abs}/mock_{sys.argv[3]}.json') as f:
            data = json.load(f)
        try:
            msgs_file_idx = sys.argv[4]
        except:
            msgs_file_idx = sys.argv[3]
        msgs = MsgList.from_file(f'{mock_data_path_abs}/mock_msgs_{msgs_file_idx}.txt').normalized
        msgs = [m.to_dict() for m in msgs]
        data.update(msgs=msgs)
    else:
        data = json.loads(sys.argv[2])
        msgs = data.get('msgs')
    # level = data.get('level')
    experiment_type = data.get('experiment_type')
    subconfig = Subconfig(data.get('subconfig'))
    level = Level(data.get('level'))

    msglist = MsgList.from_dicts(*msgs).normalized

    truth = MsgList.from_file(os.path.join(settings.TRUTHS_PATH_ABS, subconfig.truth_file) + '.txt').normalized
    # truth_pairs = truth.get_on_off_pairs()
    relative_tempo = msglist.get_relative_tempo(truth)
    ## Played slow (eg 0.8): factor is 1.25
    ## Played fast (eg 1.5): factor is 0.66
    tempo_fixed = msglist.create_tempo_shifted(1 / relative_tempo, False).normalized
    subj_on_msgs = MsgList(tempo_fixed.split_to_on_off()[0]).normalized
    truth_on_msgs = MsgList(truth.split_to_on_off()[0]).normalized
    subj_on_msgs_len = len(subj_on_msgs)
    too_many_notes = subj_on_msgs_len > level.notes
    enough_notes = subj_on_msgs_len >= level.notes
    # tonode.log(dict(msgs=msgs,
    #                 relative_tempo=relative_tempo,
    #                 tempo_fixed=tempo_fixed,
    #                 level=level,
    #                 subconfig=subconfig,
    #                 subj_on_msgs_len=subj_on_msgs_len,
    #                 too_many_notes=too_many_notes,
    #                 enough_notes=enough_notes,
    #                 subj_on_msgs=subj_on_msgs,
    #                 truth_on_msgs=truth_on_msgs,
    #                 msglist=msglist))
    mistakes = []
    # tODO: /home/gilad/Code/pyano-2.0 debug 0 1, why rhythm mistakes
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
        print(tempo_str)
    print(mistakes)
    with ignore(UnboundLocalError):
        print(rhythm_ok)


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        exc_dict = mytb.exc_dict(e, locals=False)
        tonode.error(exc_dict)
        if settings.DEBUG:
            raise e
