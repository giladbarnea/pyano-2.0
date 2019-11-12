import sys

global DEBUG
try:
    DEBUG = any((a for a in sys.argv[1:] if a.lower() == 'debug'))
except:
    DEBUG = False
