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
import time

global DEBUG
global DRYRUN
global RULES
global ROOT_PATH_ABS
global SRC_PATH_ABS

print(term.white('settings.py'))
try:
    argvars = set([a.lower() for a in sys.argv[2:]])
    DEBUG = 'debug' in argvars
    DRYRUN = 'dry-run' in argvars
    dbg.debug(f'\tDEBUG: {DEBUG}, \n\tDRYRUN: {DRYRUN}')
except:
    DEBUG = False

ROOT_PATH_ABS = sys.argv[1]
SRC_PATH_ABS = os.path.join(ROOT_PATH_ABS, 'src')
EXPERIMENTS_PATH_ABS = os.path.join(SRC_PATH_ABS, 'experiments')
TRUTHS_PATH_ABS = os.path.join(EXPERIMENTS_PATH_ABS, 'truths')
CONFIGS_PATH_ABS = os.path.join(EXPERIMENTS_PATH_ABS, 'configs')
SUBJECTS_PATH_ABS = os.path.join(EXPERIMENTS_PATH_ABS, 'subjects')
dbg.debug(f'\tROOT_ABS: {ROOT_PATH_ABS}',
          f'\n\tSRC_PATH: {SRC_PATH_ABS}',
          f'\n\tTRUTHS_PATH_ABS: {TRUTHS_PATH_ABS}',
          f'\n\tCONFIGS_PATH_ABS: {CONFIGS_PATH_ABS}',
          f'\n\tSUBJECTS_PATH_ABS: {SUBJECTS_PATH_ABS}',
          )

with open("RULES.json") as f:
    dbg.debug('\tsetting RULES const from file')

    RULES = json.load(f)
