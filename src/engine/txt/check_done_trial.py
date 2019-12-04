import sys
from common import dbg, tonode
import json


def main():
    # tonode.send(dict(hi='bye', arg=sys.argv[2]))
    tonode.send([json.loads(arg) for arg in sys.argv[2:]])


if __name__ == '__main__':
    main()
