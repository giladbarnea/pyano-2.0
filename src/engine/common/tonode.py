from common import dbg


def send(*values):
    dbg.group('tonode.py send()')
    print('TONODE_SEND__START')
    print(*values)
    print('TONODE_SEND__END')
    dbg.group_end()
