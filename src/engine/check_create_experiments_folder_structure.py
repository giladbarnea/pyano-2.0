"""
Expects:
root_abs_path = sys.argv[1]: /home/gilad/Code/pyano-2.0

Optional:
sys.argv[2]: 'debug'
"""
import sys
import os
import settings
from common import dbg


def _main():
    dbg.group('check_create_experiments_folder_structure.py _main()')
    root_abs_path = sys.argv[1]
    experiments_dir = os.path.join(root_abs_path, 'src', 'experiments')
    dbg.debug(f'root_abs_path = sys.argv[1] = "{root_abs_path}"', f'experiments_dir: "{experiments_dir}"')
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


if __name__ == '__main__':
    try:
        _main()
    except Exception as e:
        raise e
