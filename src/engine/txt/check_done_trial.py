import sys
from common import dbg, tonode
import json
from common.message import Msg, MsgList
from mytool import mytb
import os
import settings


def main():
    truth_name = sys.argv[2]
    msgs = [json.loads(arg) for arg in sys.argv[3:]]

    msglist = MsgList.from_dicts(*msgs)
    normalized = msglist.normalized

    truth = MsgList.from_file(os.path.join(settings.TRUTHS_PATH_ABS, truth_name) + '.txt')
    _ = truth.normalized

    tonode.log(dict(received=msgs,
                    normalized=[n.to_dict() for n in normalized],
                    was_normalized=msglist._is_self_normalized,
                    was_truth_normalized=truth._is_self_normalized,
                    truth_name=truth_name))


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        exc_dict = mytb.exc_dict(e)
        tonode.error(exc_dict)
