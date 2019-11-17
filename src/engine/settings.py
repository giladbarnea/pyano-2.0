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
global ROOT_ABS
global SRC_PATH

print(term.white('settings.py'))
try:
    argvars = set([a.lower() for a in sys.argv[2:]])
    DEBUG = 'debug' in argvars
    DRYRUN = 'dry-run' in argvars
    dbg.debug(f'\tDEBUG: {DEBUG}, DRYRUN: {DRYRUN}')
    # util.dbg(f'\tsettings.py DEBUG: {DEBUG}')
except:
    DEBUG = False

ROOT_ABS = sys.argv[1]
SRC_PATH = os.path.join(ROOT_ABS, 'src')
dbg.debug(f'\tROOT_ABS: {ROOT_ABS}, SRC_PATH: {SRC_PATH}')
with open("RULES.json") as f:
    dbg.debug('\tsetting RULES')

    RULES = json.load(f)
