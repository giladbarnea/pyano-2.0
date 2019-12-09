import sys
from common import dbg, tonode
import json

from common.config import Subconfig
from common.hit import Hit
from common.level import Level
from common.message import Msg, MsgList
from mytool import mytb
import os
import settings


def main():
    data = json.loads(sys.argv[2])
    msgs = data.get('msgs')
    level = data.get('level')
    experiment_type = data.get('experiment_type')
    subconfig = Subconfig(**data.get('subconfig'))
    level = Level(**data.get('level'))

    msglist = MsgList.from_dicts(*msgs).normalized

    truth = MsgList.from_file(os.path.join(settings.TRUTHS_PATH_ABS, subconfig.truth_file) + '.txt').normalized
    relative_tempo = msglist.get_relative_tempo(truth[:level.notes])
    ## Played slow (eg 0.8): factor is 1.25
    ## Played fast (eg 1.5): factor is 0.66
    tempo_shifted = msglist.create_tempo_shifted(1 / relative_tempo)
    tonode.log(dict(msgs=msgs,
                    relative_tempo=relative_tempo,
                    tempo_shifted=tempo_shifted,
                    level=level,
                    subconfig=subconfig,
                    msglist=msglist))

    for i in range(min(level.notes, len(msglist))):
        hit = Hit(tempo_shifted[i], truth[i], subconfig.allowed_rhythm_deviation)
        hits.append(hit)
        mistakes.append(hit.get_mistake_kind())


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        exc_dict = mytb.exc_dict(e, locals=False)
        tonode.error(exc_dict)
