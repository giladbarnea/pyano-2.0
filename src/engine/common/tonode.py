import json
# import os
# import settings
from typing import Literal


def _print(value: dict, level: Literal['SEND', 'LOG', 'WARN', 'ERROR']):
    # if settings.DISABLE_TONODE:
    #     return
    print(f'TONODE_{level.upper()}__START')
    print(json.dumps(value, default=lambda o: o.to_dict()))
    print(f'TONODE_{level.upper()}__END')


def send(value):
    """
    Example::
        # whatever.py
        tonode.send(dict(foo='bar'))
        ...
        # whatever.ts
        const { foo } = await pyShell.runAsync();
        console.log(foo);   // bar

        ...
        
        tonode.send([json.loads(obj) for obj in mylist]
    """
    _print(value, 'SEND')
    # print('TONODE_SEND__START')
    # print(json.dumps(value, default=lambda o: o.to_dict()))
    # print('TONODE_SEND__END')


def log(value):
    _print(value, 'LOG')
    # print('TONODE_LOG__START')
    # print(json.dumps(value, default=lambda o: o.to_dict()))
    # print('TONODE_LOG__END')


def warn(value):
    _print(value, 'WARN')
    # print('TONODE_WARN__START')
    # print(json.dumps(value, default=lambda o: o.to_dict()))
    # print('TONODE_WARN__END')
    # dbg.group_end()


def error(value):
    """
    tonode.error(mytb.exc_str(e, locals=False))
    tonode.error(e.args)
    tonode.error(mytb.exc_dict(e, locals=False))

    """
    _print(value, 'ERROR')
    # print('TONODE_ERROR__START')
    # print(json.dumps(value, default=lambda o: o.to_dict()))
    # print('TONODE_ERROR__END')
