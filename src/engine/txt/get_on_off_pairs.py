import settings
from common import dbg, tonode
from common.message import MsgList, Msg
# from classes import Message
import sys
import os

truth_file = sys.argv[2]


def main():
    base_path_abs = os.path.join(settings.TRUTHS_PATH_ABS, truth_file)
    on_path_abs = f'{base_path_abs}_on.txt'
    off_path_abs = f'{base_path_abs}_off.txt'
    base_path_abs += '.txt'
    # msgs = Message.construct_many_from_file(base_path_abs)
    msgs = MsgList.from_file(base_path_abs)
    # chords = Message.get_chords(msgs)
    # msgs_C = deepcopy(msgs)
    on_msgs, off_msgs = msgs.normalized.split_to_on_off()
    # normalized_messages, is_normalized = Message.normalize_chords(msgs_C, chords)
    tonode.send(dict(
        on_msgs=[m.to_dict() for m in on_msgs],

        ))
    # dbg.debug([m.__dict__ for m in normalized_messages])
    # normalized_path = os.path.join(settings.TRUTHS_PATH_ABS, truth_file) + '__NORMALIZED.txt'
    # with open(normalized_path, mode="w") as f:
    #     for msg in normalized_messages:
    #         msg_line = msg.to_line()
    #         f.write(msg_line)


if __name__ == '__main__':
    main()
