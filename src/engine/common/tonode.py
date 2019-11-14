from common import dbg


def send(*values):
    dbg.group('tonode.py send()')
    print(*values)
    dbg.group_end()
