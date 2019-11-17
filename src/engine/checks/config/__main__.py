"""
Expects:
root_abs_path = sys.argv[1]: "/home/gilad/Code/pyano-2.0"
configfilepath = sys.argv[2]: "/home/gilad/.config/pyano-2.0/config.json"

Optional:
sys.argv[3]: 'debug'
sys.argv[4]: 'dry-run'
"""
import json
import os
import sys
import settings
from common import dbg, pyano_types as ptypes
from checks.config import create, check_and_fix
from getpass import getuser

# logger = Logger('check_create_config_file')
root_abs_path = sys.argv[1]
configfilepath = sys.argv[2]

username = getuser()

dev: bool = 'gilad' in username or settings.DEBUG


def main():
    dbg.group('checks.config.__main__.py main()')
    config_exists = os.path.isfile(configfilepath)
    dbg.debug(f'config_exists: {config_exists}')
    if not config_exists:  # not found
        _config = create.get_default()
        _config['root_abs_path'] = root_abs_path
        _config['dev'] = dev
        _config['subjects'] = [username]
        _config['current_test']['current_subject'] = username
        _config['current_exam']['current_subject'] = username
        return create.write(configfilepath, _config)
    else:
        with open(configfilepath) as f:
            config = json.load(f)

        fixed_config: ptypes.Config = check_and_fix.check_and_fix(config)
        should_write = fixed_config != config
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

            from pprint import pp as pp

            exc_dict = mytb.exc_dict(e)
            pp(exc_dict)
            breakpoint()
        raise e
