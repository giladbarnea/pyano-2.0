import sys
import os
import time

root_abs_path = sys.argv[1]
try:
    debug = 'debug' in sys.argv[2]
except IndexError:
    debug = False

if debug:
    print('check_create_experiments_folder_structure DEBUG!!')
    time.sleep(1)
    print('second message')
experiments_dir = os.path.join(root_abs_path, 'experiments')
if not os.path.isdir(experiments_dir):
    os.mkdir(experiments_dir)

for _dir in ['configs', 'subjects', 'truths']:
    subdir = os.path.join(experiments_dir, _dir)
    if not os.path.isdir(subdir):
        os.mkdir(subdir)
