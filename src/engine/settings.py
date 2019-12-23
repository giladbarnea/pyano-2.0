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


def try_get_root() -> str:
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
print(f'sys.argv[1:]: ', sys.argv[1:])
try:
    argvars = set([a.lower() for a in sys.argv[1:]])
    DEBUG = 'debug' in argvars
    DRYRUN = 'dry-run' in argvars
    DISABLE_TONODE = '--disable-tonode' in argvars
except:
    DEBUG = False
    DRYRUN = False
    DISABLE_TONODE = False

ROOT_PATH_ABS = None
try:
    ROOT_PATH_ABS = sys.argv[1]
except IndexError:
    pass

if not ROOT_PATH_ABS or not os.path.isdir(ROOT_PATH_ABS):
    print(term.warn(f'\tROOT_PATH_ABS is either None or not dir: {ROOT_PATH_ABS}, calling try_get_root()...'))
    ROOT_PATH_ABS = try_get_root()
    print(term.green('\tgot ROOT_PATH_ABS'))

SRC_PATH_ABS = os.path.join(ROOT_PATH_ABS, 'src')
API_PATH_ABS = os.path.join(SRC_PATH_ABS, 'engine', 'api')
EXPERIMENTS_PATH_ABS = os.path.join(SRC_PATH_ABS, 'experiments')
TRUTHS_PATH_ABS = os.path.join(EXPERIMENTS_PATH_ABS, 'truths')
CONFIGS_PATH_ABS = os.path.join(EXPERIMENTS_PATH_ABS, 'configs')
SUBJECTS_PATH_ABS = os.path.join(EXPERIMENTS_PATH_ABS, 'subjects')
GLOBS = dict(DEBUG=DEBUG,
             DRYRUN=DRYRUN,
             DISABLE_TONODE=DISABLE_TONODE,
             ROOT_PATH_ABS=ROOT_PATH_ABS,
             SRC_PATH_ABS=SRC_PATH_ABS,
             EXPERIMENTS_PATH_ABS=EXPERIMENTS_PATH_ABS,
             API_PATH_ABS=API_PATH_ABS,
             TRUTHS_PATH_ABS=TRUTHS_PATH_ABS,
             CONFIGS_PATH_ABS=CONFIGS_PATH_ABS,
             SUBJECTS_PATH_ABS=SUBJECTS_PATH_ABS
             )

for k, v in GLOBS.items():
    os.environ[k] = str(v)
    print(f'\t{k}:\t{v}')

try:
    with open(f"{ROOT_PATH_ABS}/RULES.json") as f:
        RULES = json.load(f)
        print(term.green('\tset RULES const from file'))
        # for k,v in RULES.items():
        #     if isinstance(v,str):
        #         os.environ[k]=v
except Exception as e:
    print(term.red('\tFAILED loading RULES.json from file, settings.py'))
