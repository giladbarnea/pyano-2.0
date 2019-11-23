"""
GLOBAL options
---------------
Every scripts expects:
root_abs_path = sys.argv[1]: "/home/gilad/Code/pyano-2.0"

Optionals:
'debug'
'dry-run'
"""
import sys
import json
import os
from common import dbg
from mytool import term
from pprint import pformat as pf

# global DEBUG
# global DRYRUN
global RULES
# global ROOT_PATH_ABS
# global SRC_PATH_ABS

print(term.white('settings.py'))
try:
    argvars = set([a.lower() for a in sys.argv[2:]])
    DEBUG = 'debug' in argvars
    DRYRUN = 'dry-run' in argvars
except:
    DEBUG = False
    DRYRUN = False
print(f'\tDEBUG: {DEBUG}, \n\tDRYRUN: {DRYRUN}')

ROOT_PATH_ABS = sys.argv[1]
SRC_PATH_ABS = os.path.join(ROOT_PATH_ABS, 'src')
EXPERIMENTS_PATH_ABS = os.path.join(SRC_PATH_ABS, 'experiments')
TRUTHS_PATH_ABS = os.path.join(EXPERIMENTS_PATH_ABS, 'truths')
CONFIGS_PATH_ABS = os.path.join(EXPERIMENTS_PATH_ABS, 'configs')
SUBJECTS_PATH_ABS = os.path.join(EXPERIMENTS_PATH_ABS, 'subjects')
GLOBS = dict(DEBUG=DEBUG,
             DRYRUN=DRYRUN,
             ROOT_PATH_ABS=ROOT_PATH_ABS,
             SRC_PATH_ABS=SRC_PATH_ABS,
             EXPERIMENTS_PATH_ABS=EXPERIMENTS_PATH_ABS,
             TRUTHS_PATH_ABS=TRUTHS_PATH_ABS,
             CONFIGS_PATH_ABS=CONFIGS_PATH_ABS,
             SUBJECTS_PATH_ABS=SUBJECTS_PATH_ABS)
for k, v in GLOBS.items():
    os.environ[k] = str(v)
# os.environ.update(GLOBS)
dbg.debug(pf(GLOBS))

with open("RULES.json") as f:
    print('\tsetting RULES const from file')

    RULES = json.load(f)
    # for k,v in RULES.items():
    #     if isinstance(v,str):
    #         os.environ[k]=v
