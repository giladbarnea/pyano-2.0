import sys
import json
import os

global DEBUG
global RULES
try:
    DEBUG = any((a for a in sys.argv[1:] if a.lower() == 'debug'))
except:
    DEBUG = False

with open("RULES.json") as f:
    print('settings.py setting RULES')
    RULES = json.load(f)
