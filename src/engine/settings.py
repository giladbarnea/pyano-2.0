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
    dbg.debug(f'\tDEBUG: {DEBUG}, DRYRUN: {DRYRUN}')
except:
    DEBUG = False

ROOT_PATH_ABS = sys.argv[1]
SRC_PATH_ABS = os.path.join(ROOT_PATH_ABS, 'src')
dbg.debug(f'\tROOT_ABS: {ROOT_PATH_ABS}, SRC_PATH: {SRC_PATH_ABS}')
with open("RULES.json") as f:
    dbg.debug('\tsetting RULES const from file')

    RULES = json.load(f)
