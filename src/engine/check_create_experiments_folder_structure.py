"""
Expects:
root_abs_path = sys.argv[1]: /home/gilad/Code/pyano-2.0

Optional:
sys.argv[2]: 'debug'
"""
import sys
import os
import settings
import util


def _main():
    root_abs_path = sys.argv[1]
    experiments_dir = os.path.join(root_abs_path, 'experiments')
    msgs = [f'root_abs_path = sys.argv[1] = "{root_abs_path}"',
            f'experiments_dir: "{experiments_dir}"']
    [util.dbg(msg) for msg in msgs]
    if not os.path.isdir(experiments_dir):
        util.dbg('experiments_dir not isdir, creating...')
        os.mkdir(experiments_dir)
    else:
        util.dbg('experiments_dir exists')

    for _dir in ['configs', 'subjects', 'truths']:
        subdir = os.path.join(experiments_dir, _dir)
        if not os.path.isdir(subdir):
            util.dbg(f'"{subdir} not isdir, creating..."')
            os.mkdir(subdir)
        else:
            util.dbg(f'"{subdir}" exists')


if __name__ == '__main__':
    try:
        _main()
    except Exception as e:
        raise e
