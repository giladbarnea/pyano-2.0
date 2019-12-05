import sys
from common import dbg, tonode
import json
from common.message import Msg, MsgList


def main():
    # tonode.send(dict(hi='bye', arg=sys.argv[2]))
    truth_name = sys.argv[2]
    msgs = [json.loads(arg) for arg in sys.argv[3:]]
    tonode.send(msgs)
    msgs = MsgList(msgs)
    tonode.log(f'len(msgs): {len(msgs)}')


if __name__ == '__main__':
    main()
