""""""
import sys
import os
import settings
import util

root_abs_path = sys.argv[1]
try:
    settings.DEBUG = 'debug' in sys.argv[2].lower()
except IndexError:
    settings.DEBUG = False

experiments_dir = os.path.join(root_abs_path, 'experiments')
msgs = [f'root_abs_path = sys.argv[1] = "{root_abs_path}"',
        f'experiments_dir: "{experiments_dir}"']
[util.dbg(msg) for msg in msgs]
if not os.path.isdir(experiments_dir):
    util.dbg('experiments_dir not isdir, creating...')
    os.mkdir(experiments_dir)

for _dir in ['configs', 'subjects', 'truths']:
    subdir = os.path.join(experiments_dir, _dir)
    if not os.path.isdir(subdir):
        util.dbg(f'"{subdir} not isdir, creating..."')
        os.mkdir(subdir)
