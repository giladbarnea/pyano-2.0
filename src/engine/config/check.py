import os
import util
import re
import sys
import settings


@util.noraise
def _root_abs_path(path: str):
    return os.path.isdir(path)


@util.noraise
def _dev(val: str):
    return isinstance(val, bool)


@util.noraise
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


@util.noraise
def _experiment_type(val: str):
    return val in ['exam', 'test']


@util.noraise
def _last_page(val: str):
    return val in ['new_test', 'inside_test', 'record', 'file_tools', 'settings']


@util.noraise
def _vid_silence_len(val: str):
    return True


@util.noraise
def _subjects():
    return True


@util.noraise
def _devoptions():
    return True


@util.noraise
def _velocities():
    return True


@util.noraise
def _current_test():
    return True


@util.noraise
def _current_exam():
    return True


def first_level(config: dict) -> [str]:
    KEYS_TO_FN = dict(root_abs_path=_root_abs_path,
                      dev=_dev,
                      truth_file_path=_truth_file_path,
                      experiment_type=_experiment_type,
                      last_page=_last_page,
                      vid_silence_len=_vid_silence_len,
                      subjects=_subjects,
                      devoptions=_devoptions,
                      velocities=_velocities,
                      current_test=_current_test,
                      current_exam=_current_exam)
    bad_keys = []

    if not _root_abs_path(config.get('root_abs_path')):
        bad_keys.append('root_abs_path')

    if not _dev(config.get('dev')):
        bad_keys.append('dev')

    if not _truth_file_path(config.get('truth_file_path')):
        bad_keys.append('truth_file_path')

    return bad_keys
