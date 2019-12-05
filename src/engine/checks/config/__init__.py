"""
Expects:
configfilepath = sys.argv[2]: "/home/gilad/.config/pyano-2.0/config.json"
"""
print('checks.config __init__.py')
import os
from typing import Optional, Union
from common import dbg, tonode
from common.pyano_types import *
from common.config_classes import BigConfig, Subconfig


# from . import config // DONT


def fix_in_config(cfg_key: Union[SubconfigKey, BigConfigKey],
                  result,
                  cfg: Union[BigConfig, Subconfig],
                  subcfg_type: Optional[ExperimentType] = None) -> None:
    if result is None:
        what = f'config["{subcfg_type}"]["{cfg_key}"]' if subcfg_type else f'config["{cfg_key}"]'
        dbg.warn(f'{what} returned None')
        tonode.send(f'{subcfg_type}.{cfg_key}' if subcfg_type else cfg_key)
    elif cfg.get(cfg_key) != result:
        what = f'config["{subcfg_type}"]["{cfg_key}"]' if subcfg_type else f'config["{cfg_key}"]'
        dbg.warn(f'{what} was fixed from "{cfg.get(cfg_key)}" to "{result}"')
        cfg[cfg_key] = result
