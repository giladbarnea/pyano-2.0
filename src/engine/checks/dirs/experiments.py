import os

import settings
from common import dbg


def check_and_fix():
    dbg.group('experiments.py check_and_fix()')

    # experiments_dir = os.path.join(settings.SRC_PATH_ABS, 'experiments')
    # dbg.debug(f'experiments_dir: "{experiments_dir}"')
    if not os.path.isdir(settings.EXPERIMENTS_PATH_ABS):
        dbg.debug('experiments_dir not isdir, creating...')
        os.mkdir(settings.EXPERIMENTS_PATH_ABS)
    else:
        dbg.debug('experiments_dir exists')

    for _dir in settings.RULES['directories']['experiments']:
        subdir = os.path.join(settings.EXPERIMENTS_PATH_ABS, _dir)
        if not os.path.isdir(subdir):
            dbg.debug(f'"{subdir} not isdir, creating..."')
            os.mkdir(subdir)
        else:
            dbg.debug(f'"{subdir}" exists')
    dbg.group_end()
