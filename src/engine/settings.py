"""
GLOBAL options
---------------
Every scripts expects args to be:
[sys.argv[0], ROOT_PATH_ABS, *script-specific-args, debug?, dry-run?, no-python?]


"""
import sys
import json
import os
from mytool import term


def try_get_root():
    cwd = os.getcwd()
    if 'src' in os.listdir(cwd):
        # in root
        return cwd
    else:
        if 'src' in cwd or 'tests' in cwd:
            head, tail = os.path.split(cwd)
            while tail != 'src':
                head, tail = os.path.split(cwd)
                if not head or not tail:
                    break
            else:  # didnt hit break
                return head
            # hit break
            raise FileNotFoundError(
                f'Failed getting ROOT_PATH_ABS from either sys.argv or via try_get_root(). cwd: {os.getcwd()}. sys.argv: {sys.argv}')


print(term.white('settings.py'))
try:
    argvars = set([a.lower() for a in sys.argv[1:]])
    DEBUG = 'debug' in argvars
    DRYRUN = 'dry-run' in argvars
    NOTONODE = 'no-tonode' in argvars
except:
    DEBUG = False
    DRYRUN = False
    NOTONODE = False

try:
    ROOT_PATH_ABS = sys.argv[1]
except IndexError:
    print(term.warn(f'IndexError with ROOT_PATH_ABS = sys.argv[1], calling try_get_root()...'))
    ROOT_PATH_ABS = try_get_root()
    print(term.green('got ROOT_PATH_ABS'))

if not os.path.isdir(ROOT_PATH_ABS):
    print(term.warn(f'ROOT_PATH_ABS not dir: {ROOT_PATH_ABS}, calling try_get_root()...'))
    ROOT_PATH_ABS = try_get_root()
    print(term.green('got ROOT_PATH_ABS'))

SRC_PATH_ABS = os.path.join(ROOT_PATH_ABS, 'src')
EXPERIMENTS_PATH_ABS = os.path.join(SRC_PATH_ABS, 'experiments')
TRUTHS_PATH_ABS = os.path.join(EXPERIMENTS_PATH_ABS, 'truths')
CONFIGS_PATH_ABS = os.path.join(EXPERIMENTS_PATH_ABS, 'configs')
SUBJECTS_PATH_ABS = os.path.join(EXPERIMENTS_PATH_ABS, 'subjects')
GLOBS = dict(DEBUG=DEBUG,
             DRYRUN=DRYRUN,
             NOTONODE=NOTONODE,
             ROOT_PATH_ABS=ROOT_PATH_ABS,
             SRC_PATH_ABS=SRC_PATH_ABS,
             EXPERIMENTS_PATH_ABS=EXPERIMENTS_PATH_ABS,
             TRUTHS_PATH_ABS=TRUTHS_PATH_ABS,
             CONFIGS_PATH_ABS=CONFIGS_PATH_ABS,
             SUBJECTS_PATH_ABS=SUBJECTS_PATH_ABS
             )

for k, v in GLOBS.items():
    os.environ[k] = str(v)
    print(f'\t{k}:\t{v}')

try:
    with open("RULES.json") as f:
        RULES = json.load(f)
        print('\tset RULES const from file')
        # for k,v in RULES.items():
        #     if isinstance(v,str):
        #         os.environ[k]=v
except Exception as e:
    print('\nFAILED loading RULES.json from file, settings.py\n')
