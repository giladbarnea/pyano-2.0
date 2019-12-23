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
import argparse
from argparse import ArgumentParser

# **  parser
parser = ArgumentParser()

parser.add_argument("-d", '--debug',
                    action='store_true',
                    default=False,
                    dest='DEBUG',
                    help='Enable the dbg module; extra Msg and MsgList props in repr'
                    )
parser.add_argument("--dry", '--dry-run',
                    action='store_true',
                    default=False,
                    dest='DRY_RUN',
                    help="Don't modify any files"
                    )
parser.add_argument("--disable-tonode",
                    help="common.tonode doesn't print anything",
                    action="store_true",
                    dest='DISABLE_TONODE',
                    default=False)

# **  subparsers
subparsers = parser.add_subparsers(title='Additional modes',
                                   description='Various sets of standalone additional options',
                                   )

# *  mock_parser
mock_parser = subparsers.add_parser('mock',
                                    help='Pass files to simulate real world flow. See "mock --help"',
                                    description='Pass files to simulate real world flow',
                                    )

mock_parser.add_argument('-j', '--json',
                         help="use FILE as mock config",
                         required=True)

# *  test_parser
test_parser = subparsers.add_parser('test',
                                    help='See "test --help"',
                                    description='Options to control tests',
                                    )

args = parser.parse_args()


def get_root_path() -> str:
    cwd = os.getcwd()
    if 'src' in os.listdir(cwd):
        # in root
        return cwd
    else:
        if 'src' in cwd or 'tests' in cwd:
            head, tail = os.path.split(cwd)
            while tail != 'src':
                head, tail = os.path.split(head)
                if not head or not tail:
                    raise FileNotFoundError(
                        f'Failed getting ROOT_PATH_ABS via get_root_path(). cwd: {os.getcwd()}.')
            return head
        else:
            raise FileNotFoundError(
                f'Failed getting ROOT_PATH_ABS via get_root_path(). cwd: {os.getcwd()}.')


print(term.white('settings.py'))
print(f'sys.argv[1:]: ', sys.argv[1:])
print(f'args: ', args)

ROOT_PATH_ABS = get_root_path()

if not os.path.isdir(ROOT_PATH_ABS):
    raise NotADirectoryError(f'ROOT_PATH_ABS is not a dir: {ROOT_PATH_ABS}')
DEBUG = args.DEBUG
DRY_RUN = args.DRY_RUN
DISABLE_TONODE = args.DISABLE_TONODE

SRC_PATH_ABS = os.path.join(ROOT_PATH_ABS, 'src')
API_PATH_ABS = os.path.join(SRC_PATH_ABS, 'engine', 'api')
MOCK_PATH_ABS = os.path.join(SRC_PATH_ABS, 'engine', 'mock')
EXPERIMENTS_PATH_ABS = os.path.join(SRC_PATH_ABS, 'experiments')
TRUTHS_PATH_ABS = os.path.join(EXPERIMENTS_PATH_ABS, 'truths')
CONFIGS_PATH_ABS = os.path.join(EXPERIMENTS_PATH_ABS, 'configs')
SUBJECTS_PATH_ABS = os.path.join(EXPERIMENTS_PATH_ABS, 'subjects')
GLOBS = dict(DEBUG=DEBUG,
             DRY_RUN=DRY_RUN,
             DISABLE_TONODE=DISABLE_TONODE,
             # MOCK=MOCK,
             ROOT_PATH_ABS=ROOT_PATH_ABS,
             SRC_PATH_ABS=SRC_PATH_ABS,
             EXPERIMENTS_PATH_ABS=EXPERIMENTS_PATH_ABS,
             API_PATH_ABS=API_PATH_ABS,
             MOCK_PATH_ABS=MOCK_PATH_ABS,
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
