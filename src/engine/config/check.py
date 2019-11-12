import os
import util
import re
import sys


@util.safe
def _root_abs_path(path: str):
    return os.path.isdir(path)


@util.safe
def _dev(val: str):
    return isinstance(val, bool)


@util.safe
def _truth_file_path(path: str):
    split = re.split(r'[\\/]', path)
    fmt_ok = (len(split) == 3
              and split[0] == 'experiments'
              and split[1] == 'truths'
              and split[2].endswith('.txt'))
    if not fmt_ok:
        return False
    # TODO: regex check for content like in Message ctor
    return os.path.isfile(os.path.join(sys.argv[1], path))


def first_level(config: dict) -> [str]:
    KEYS = ['root_abs_path',
            'dev',
            'truth_file_path',
            'experiment_type',
            'last_page',
            'vid_silence_len',
            'subjects',
            'devoptions',
            'velocities',
            'current_test',
            'current_exam']
    bad_keys = []

    if not _root_abs_path(config.get('root_abs_path')):
        bad_keys.append('root_abs_path')

    if not _dev(config.get('dev')):
        bad_keys.append('dev')

    if not _truth_file_path(config.get('truth_file_path')):
        bad_keys.append('truth_file_path')

    return bad_keys
