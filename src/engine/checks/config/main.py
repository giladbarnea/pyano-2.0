print('checks.config config.py')
import json
import os
import sys
from . import create, check_and_fix
from common import dbg, pyano_types as ptypes
from getpass import getuser

configfilepath = sys.argv[2]

username = getuser()

dev: bool = 'gilad' in username or os.environ['DEBUG']


def main():
    dbg.group('checks.config.__main__.py main()')
    config_exists = os.path.isfile(configfilepath)
    dbg.debug(f'config_exists: {config_exists}')
    if os.environ['DRYRUN']:
        create.write = lambda *args, **kwargs: dbg.debug(f'DRYRUN, not writing. args:', *args)
    if not config_exists:  # not found
        _config = create.get_default()
        _config['root_abs_path'] = os.environ['ROOT_PATH_ABS']
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
