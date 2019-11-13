import sys
import json
import os
import util
from mytool import term

global DEBUG
global RULES

print(term.white('settings.py'))
try:
    DEBUG = any((a for a in sys.argv[1:] if a.lower() == 'debug'))
    util.dbg(f'\tsettings.py DEBUG: {DEBUG}')
except:
    DEBUG = False

with open("RULES.json") as f:
    util.dbg('\tsettings.py setting RULES')
    RULES = json.load(f)
