"""
Expects:
root_abs_path = sys.argv[1]: /home/gilad/Code/pyano-2.0

Optional:
sys.argv[2]: 'debug'
"""
import sys
import os
import settings
from util import Dbg


def _main():
    Dbg.group('check_create_experiments_folder_structure.py _main()')
    root_abs_path = sys.argv[1]
    experiments_dir = os.path.join(root_abs_path, 'experiments')
    msgs = [f'root_abs_path = sys.argv[1] = "{root_abs_path}"',
            f'experiments_dir: "{experiments_dir}"']
    [Dbg.print(msg) for msg in msgs]
    if not os.path.isdir(experiments_dir):
        Dbg.print('experiments_dir not isdir, creating...')
        os.mkdir(experiments_dir)
    else:
        Dbg.print('experiments_dir exists')

    for _dir in settings.RULES['directories']['experiments']:
        subdir = os.path.join(experiments_dir, _dir)
        if not os.path.isdir(subdir):
            Dbg.print(f'"{subdir} not isdir, creating..."')
            os.mkdir(subdir)
        else:
            Dbg.print(f'"{subdir}" exists')
    Dbg.group_end()


if __name__ == '__main__':
    try:
        _main()
    except Exception as e:
        raise e
