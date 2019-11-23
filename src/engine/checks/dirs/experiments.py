"""
Expects:
root_abs_path = sys.argv[1]: /home/gilad/Code/pyano-2.0

Optional:
sys.argv[2]: 'debug'
"""
import os
import settings
from common import dbg


def check_and_fix():
    dbg.group('experiments.py check_and_fix()')

    experiments_dir = os.path.join(settings.SRC_PATH_ABS, 'experiments')
    dbg.debug(f'experiments_dir: "{experiments_dir}"')
    if not os.path.isdir(experiments_dir):
        dbg.debug('experiments_dir not isdir, creating...')
        os.mkdir(experiments_dir)
    else:
        dbg.debug('experiments_dir exists')

    for _dir in settings.RULES['directories']['experiments']:
        subdir = os.path.join(experiments_dir, _dir)
        if not os.path.isdir(subdir):
            dbg.debug(f'"{subdir} not isdir, creating..."')
            os.mkdir(subdir)
        else:
            dbg.debug(f'"{subdir}" exists')
    dbg.group_end()
