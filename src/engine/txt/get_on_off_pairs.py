import settings
from common import dbg, tonode, message
# from classes import Message
import sys
import os
from copy import deepcopy

truth_file = sys.argv[2]


def main():
    base_path_abs = os.path.join(settings.TRUTHS_PATH_ABS, truth_file)
    on_path_abs = f'{base_path_abs}_on.txt'
    off_path_abs = f'{base_path_abs}_off.txt'
    base_path_abs += '.txt'
    # msgs = Message.construct_many_from_file(base_path_abs)
    msgs = message.MsgList.from_file(base_path_abs)
    chords = Message.get_chords(msgs)
    msgs_C = deepcopy(msgs)
    normalized_messages, is_normalized = Message.normalize_chords(msgs_C, chords)
    tonode.send(dict(
        # normalized_messages=[m.__dict__ for m in normalized_messages],
        # is_self_normalized=is_self_normalized,
        # chords=chords,
        # msgs_C=[m.__dict__ for m in msgs_C]
        ))
    # dbg.debug([m.__dict__ for m in normalized_messages])
    # normalized_path = os.path.join(settings.TRUTHS_PATH_ABS, truth_file) + '__NORMALIZED.txt'
    # with open(normalized_path, mode="w") as f:
    #     for msg in normalized_messages:
    #         msg_line = msg.to_line()
    #         f.write(msg_line)


if __name__ == '__main__':
    main()
