from typing import List, Tuple
from common import dbg


def fix_bad_keys(config: dict, bad_keys: List[Tuple[str, str] or dict]) -> dict:
    dbg.group('fix.py fix_bad_keys()')
    for x in bad_keys:
        try:
            key, reason = x
            value = config[key]
            dbg.debug(f'key: {key}', f'value: {value}', f'reason: {reason}')
        except ValueError as e:  # x is a dict
            key = list(x.keys())[0]
            for subkey, reason in x[key]:
                value = config[key][subkey]
                dbg.debug(f'key: {key}', f'value: {value}', f'reason: {reason}')
            pass
    dbg.group_end()
