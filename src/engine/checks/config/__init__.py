print('/config/__init__.py')

import os
from typing import Optional, Union
import settings  # NECESSARY BEFORE IMPORTING COMMON
from common import dbg, tonode, pyano_types as ptypes


def find_file_where(rel_path: str, ext: str) -> Optional[str]:
    abs_path = os.path.join(settings.SRC_PATH, rel_path)
    for f in [f for f in os.listdir(abs_path) if f.endswith(ext)]:
        # TODO: config["truth_file_path"] was fixed from "experiments/truths/fur_elise_B.txt" to "/home/gilad/Code/pyano-2.0/src/experiments/fur_elise_C.txt"
        if os.path.isfile(os.path.join(abs_path, f)):
            return os.path.join(rel_path, f)
    return None


def fix_in_config(cfg_key: Union[ptypes.SubconfigKey, ptypes.ConfigKey],
                  result,
                  cfg: Union[ptypes.Subconfig, ptypes.Config],
                  subcfg_name: Optional[ptypes.SubconfigName] = None) -> None:
    if result is None:
        what = f'config["{subcfg_name}"]["{cfg_key}"]' if subcfg_name else f'config["{cfg_key}"]'
        dbg.warn(f'{what} returned None')
        tonode.send(f'{subcfg_name}.{cfg_key}' if subcfg_name else cfg_key)
    elif cfg.get(cfg_key) != result:
        what = f'config["{subcfg_name}"]["{cfg_key}"]' if subcfg_name else f'config["{cfg_key}"]'
        dbg.warn(f'{what} was fixed from "{cfg.get(cfg_key)}" to "{result}"')
        cfg[cfg_key] = result
