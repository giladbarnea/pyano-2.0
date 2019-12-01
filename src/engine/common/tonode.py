from common import dbg
import json


def send(value):
    dbg.group('tonode.py send()')
    print('TONODE_SEND__START')
    # print(*values)
    # print(*[json.dumps(v) for v in values])
    print(json.dumps(value))
    print('TONODE_SEND__END')
    dbg.group_end()
