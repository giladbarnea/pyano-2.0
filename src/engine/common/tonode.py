from common import dbg
import json


def send(value):
    """
    Example::

        tonode.send(dict(foo='bar'))
        ...
        const { foo } = await pyShell.runAsync();
        console.log(foo);   // bar

        tonode.send([json.loads(obj) for obj in mylist]
    """
    # dbg.group('tonode.py send()')
    print('TONODE_SEND__START')
    print(json.dumps(value))
    print('TONODE_SEND__END')
    # dbg.group_end()


def warn(value):
    # dbg.group('tonode.py warn()')
    print('TONODE_WARN__START')
    print(json.dumps(value))
    print('TONODE_WARN__END')
    # dbg.group_end()


def error(value):
    # dbg.group('tonode.py error()')
    print('TONODE_ERROR__START')
    print(json.dumps(value))
    print('TONODE_ERROR__END')
    # dbg.group_end()
