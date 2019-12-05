import sys
from common import dbg, tonode
import json
from common.message import Msg, MsgList
from mytool import mytb


def main():
    # tonode.send(dict(hi='bye', arg=sys.argv[2]))
    truth_name = sys.argv[2]
    msgs = [json.loads(arg) for arg in sys.argv[3:]]
    tonode.send(msgs)
    msgs = MsgList(msgs)
    raise ValueError('no panic')
    # tonode.error(f'len(msgs): {len(msgs)}')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        exc_dict = mytb.exc_dict(e)
        tonode.error(exc_dict)
