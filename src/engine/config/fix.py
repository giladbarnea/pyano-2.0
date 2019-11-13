from typing import List, Tuple
from util import Dbg


def fix_bad_keys(config: dict, bad_keys: List[Tuple[str, str] or dict]) -> dict:
    Dbg.group('fix.py fix_bad_keys()')
    for x in bad_keys:
        try:
            key, reason = x
            value = config[key]
            Dbg.print(f'key: {key}', f'value: {value}', f'reason: {reason}')
        except ValueError as e:  # x is a dict
            key = list(x.keys())[0]
            for subkey, reason in x[key]:
                value = config[key][subkey]
                Dbg.print(f'key: {key}', f'value: {value}', f'reason: {reason}')
            pass
    Dbg.group_end()
