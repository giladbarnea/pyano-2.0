import sys
from common import dbg, tonode
import json

from common.config_classes import Subconfig
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
    tonode.log(dict(msgs=msgs, subconfig=subconfig, level=level))
    msglist = MsgList.from_dicts(*msgs)

    truth = MsgList.from_file(os.path.join(settings.TRUTHS_PATH_ABS, subconfig.truth_file) + '.txt')
    # tonode.log(subconfig)
    # tonode.log(dict(received=msgs,
    #                 normalized=[n.to_dict() for n in normalized],
    #                 was_normalized=msglist._is_self_normalized,
    #                 was_truth_normalized=truth._is_self_normalized,
    #                 truth_name=truth_name))
    # tonode.log(data)


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        exc_dict = mytb.exc_dict(e, locals=False)
        tonode.error(exc_dict)
