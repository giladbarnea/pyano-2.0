"""
Expects:
configfilepath = sys.argv[2]: "/home/gilad/.config/pyano-2.0/config.json"
"""
import json
import os
import sys
import settings
from common import dbg, pyano_types as ptypes
from checks.config import create, check_and_fix
from getpass import getuser

# logger = Logger('check_create_config_file')
# root_abs_path = sys.argv[1]
configfilepath = sys.argv[2]

username = getuser()

dev: bool = 'gilad' in username or settings.DEBUG


def main():
    dbg.group('checks.config.__main__.py main()')
    config_exists = os.path.isfile(configfilepath)
    dbg.debug(f'config_exists: {config_exists}')
    if settings.DRYRUN:
        create.write = lambda *args, **kwargs: dbg.debug(f'DRYRUN, not writing. args:', *args)
    if not config_exists:  # not found
        _config = create.get_default()
        _config['root_abs_path'] = settings.ROOT_PATH_ABS
        _config['dev'] = dev
        _config['subjects'] = [username]
        _config['current_test']['current_subject'] = username
        _config['current_exam']['current_subject'] = username
        return create.write(configfilepath, _config)
    else:
        with open(configfilepath) as f:
            config: dict = json.load(f)
        from copy import deepcopy
        config_copy = deepcopy(config)
        fixed_config: ptypes.Config = check_and_fix.check_and_fix(config)
        should_write = fixed_config != config_copy
        dbg.debug(
            f'fixed_config {"!" if should_write else "="}= config, {"" if should_write else "not "}writing to file')

        if should_write:
            create.write(configfilepath, fixed_config, overwrite=True)


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        if settings.DEBUG:
            from mytool import mytb

            from pprint import pprint as pp

            exc_dict = mytb.exc_dict(e)
            pp(exc_dict)
        raise e
