import settings
from common import dbg, tonode
from common.message import MsgList, Msg
# from classes import Message
import sys
import os
from mytool import mytb

truth_file = sys.argv[2]


def main():
    base_path_abs = os.path.join(settings.TRUTHS_PATH_ABS, truth_file) + '.txt'
    msgs = MsgList.from_file(base_path_abs)
    pairs = msgs.normalized.get_on_off_pairs()

    tonode.send(dict(pairs=pairs))

    # dbg.debug([m.__dict__ for m in normalized_messages])
    # normalized_path = os.path.join(settings.TRUTHS_PATH_ABS, truth_file) + '__NORMALIZED.txt'
    # with open(normalized_path, mode="w") as f:
    #     for msg in normalized_messages:
    #         msg_line = msg.to_line()
    #         f.write(msg_line)


if __name__ == '__main__':
    try:
        main()
    except TypeError as e:
        tonode.error(mytb.exc_str(e, locals=False))
        # tonode.error(e.args)
