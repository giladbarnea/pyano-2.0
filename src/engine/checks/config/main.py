from common.config_classes import BigConfig, SubConfig

print('checks.config config.py')
import json
import os
import sys
from . import create, check_and_fix
from common import dbg
from common.pyano_types import *
from getpass import getuser

import settings

big_config_file_path_abs = sys.argv[2]

username = getuser()

dev: bool = 'gilad' in username or settings.DEBUG


def main():
    from . import subconfig

    dbg.group('checks.config.__main__.py main()')
    big_config_exists = os.path.isfile(big_config_file_path_abs)
    dbg.debug(f'big_config_exists: {big_config_exists}')

    if not big_config_exists:
        CONFIG_DEFAULTS: TBigConfig = settings.RULES['config']['defaults']



        big_config = BigConfig(CONFIG_DEFAULTS)



        big_config.dev = dev
        if username not in big_config.subjects:
            big_config.subjects.append(username)

        exam_file_abs = os.path.join(settings.CONFIGS_PATH_ABS, big_config.exam_file)
        if not os.path.isfile(exam_file_abs):
            EXAM_DEFAULTS: TSubconfig = CONFIG_DEFAULTS.pop('exam')
            exam = SubConfig(EXAM_DEFAULTS)
            exam.subject = username
        else:
            with open(exam_file_abs) as f:
                exam = SubConfig(json.load(f))

            subconfig.check_and_fix(exam,"exam")


        test_file_abs = os.path.join(settings.CONFIGS_PATH_ABS, big_config.test_file)
        if not os.path.isfile(test_file_abs):
            TEST_DEFAULTS: TSubconfig = CONFIG_DEFAULTS.pop('test')
            test = SubConfig(TEST_DEFAULTS)
            test.subject = username
        else:
            with open(test_file_abs) as f:
                test = SubConfig(json.load(f))

            subconfig.check_and_fix(test,"test")

        return create.write(big_config_file_path_abs, big_config)
    else:
        with open(big_config_file_path_abs) as f:
            config: dict = json.load(f)
        from copy import deepcopy
        config_copy = deepcopy(config)
        fixed_config: Config = check_and_fix.check_and_fix(config)
        should_write = fixed_config != config_copy
        dbg.debug(
            f'fixed_config {"!" if should_write else "="}= config, {"" if should_write else "not "}writing to file')

        if should_write:
            create.write(big_config_file_path_abs, fixed_config, overwrite=True)
