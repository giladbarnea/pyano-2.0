import sys
import json
import os
from common import dbg
from mytool import term

global DEBUG
global RULES
global SRC_PATH

print(term.white('settings.py'))
try:
    DEBUG = any((a for a in sys.argv[1:] if a.lower() == 'debug'))
    dbg.debug(f'\tDEBUG: {DEBUG}')
    # util.dbg(f'\tsettings.py DEBUG: {DEBUG}')
except:
    DEBUG = False

SRC_PATH = os.path.join(sys.argv[1], 'src')
dbg.debug(f'\tSRC_PATH: {SRC_PATH}')
with open("RULES.json") as f:
    dbg.debug('\tsetting RULES')
    RULES = json.load(f)
