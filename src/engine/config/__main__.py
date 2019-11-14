"""
Expects:
root_abs_path = sys.argv[1]: "/home/gilad/Code/pyano-2.0"
configfilepath = sys.argv[2]: "/home/gilad/.config/pyano-2.0/config.json"

Optional:
sys.argv[3]: 'debug'
"""
import json
import os
import re
import sys
import settings
from common import dbg, pyano_types as ptypes
from common.util import prjs
from config import create, check_and_fix
from getpass import getuser

# logger = Logger('check_create_config_file')
root_abs_path = sys.argv[1]
configfilepath = sys.argv[2]

username = getuser()

dev: bool = 'gilad' in username or settings.DEBUG


def _main():
    dbg.group('config.__main__.py _main()')
    config_exists = os.path.isfile(configfilepath)
    dbg.debug(f'config_exists: {config_exists}')
    if not config_exists:  # not found
        _config = create.get_default()
        _config['root_abs_path'] = root_abs_path
        _config['dev'] = dev
        _config['subjects'] = [username]
        _config['current_test']['current_subject'] = username
        _config['current_exam']['current_subject'] = username
        return create.write(configfilepath, _config, overwrite=True)
    else:
        with open(configfilepath) as f:
            config = json.load(f)

        fixed_config: ptypes.Config = check_and_fix.check_and_fix(config)
        print()
        # dbg.debug(f'bad_keys: ', bad_keys)
        # fix.fix_bad_keys(config, bad_keys)

    return

    def check_fix_first_level():
        _KEYS = ['root_abs_path',
                 'dev',
                 'experiment_type',
                 'truth_file_path',
                 'last_page',
                 'vid_silence_len',
                 'subjects',
                 'devoptions',
                 'velocities',
                 'current_test',
                 'current_exam']
        modified = False
        if 'root_abs_path' not in config or config['root_abs_path'] != root_abs_path:
            config['root_abs_path'] = root_abs_path
            modified = True

        if 'dev' not in config or config['dev'] != dev:
            config['dev'] = dev
            modified = True

        if 'experiment_type' not in config or config['experiment_type'] not in ['exam', 'test']:
            config['experiment_type'] = 'test'
            modified = True

        if 'truth_file_path' not in config:
            modified = True
            config['truth_file_path'] = "experiments/truths/fur_elise_B.txt"
        else:
            split = re.split(r'[\\/]', config['truth_file_path'])
            if (len(split) != 3
                    or split[0] != 'experiments'
                    or split[1] != 'truths'
                    or not split[2].endswith('.txt')):
                modified = True
                config['truth_file_path'] = "experiments/truths/fur_elise_B.txt"

        if not os.path.isfile(
                os.path.join(root_abs_path, config['truth_file_path'])):  # truth_file_path key valid at this stage
            modified = True
            config['truth_file_path'] = "experiments/truths/fur_elise_B.txt"

        if ('last_page' not in config
                or config['last_page'] not in ['new_test', 'inside_test', 'record', 'file_tools', 'settings']):
            config['last_page'] = 'new_test'
            modified = True

        if ('vid_silence_len' not in config
                or config['vid_silence_len'] < 0):
            config['vid_silence_len'] = 0
            modified = True

        if ('subjects' not in config
                or not isinstance(config['subjects'], list)
                or not all([config['subjects']])
                or not all((isinstance(s, str) for s in config['subjects']))):
            config['subjects'] = [username]
            modified = True

        # subject key exists and is a list of strings
        elif username not in config['subjects']:
            config['subjects'].append(username)
            modified = True

        for key in list(config.keys()):
            if key not in _KEYS:
                modified = True
                config.pop(key)
        return modified

    def check_fix_test_dict_levels(levels):
        modified = False
        if levels is None:
            levels = []
        # levels = config[dictname].get('levels')
        for i, level in enumerate(levels):
            if not isinstance(level['notes'], int) or level['notes'] <= 0:
                levels[i]['notes'] = 4
                modified = True

            if not isinstance(level['trials'], int) or level['trials'] <= 0:
                levels[i]['trials'] = 2
                modified = True

            if not isinstance(level['rhythm'], bool):
                levels[i]['rhythm'] = False
                modified = True

            if level['rhythm']:  # rhythm: True
                if not isinstance(level['tempo'], int) or not 0 < level['tempo'] <= 200:
                    level['tempo'] = 50
                    modified = True
            else:  # rhythm: False
                if level['tempo'] is not None:
                    level['tempo'] = None
                    modified = True
        return levels, modified

    first_level_modified = check_fix_first_level()

    # assume first level ok
    config['current_test'], current_test_modified = check_fix_config_data.do(config.get('current_test'),
                                                                             save_path_filetype='test')

    # assume current_test ok
    config['current_test']['levels'], current_test_levels_modified = check_fix_test_dict_levels(
        config['current_test'].get('levels'))

    # assume first level ok
    config['current_exam'], current_exam_modified = check_fix_config_data.do(config.get('current_exam'),
                                                                             save_path_filetype='exam')

    # assume current_test ok
    config['current_exam']['levels'], current_exam_levels_modified = check_fix_test_dict_levels(
        config['current_exam'].get('levels'))

    if any((first_level_modified,
            current_test_modified,
            current_test_levels_modified,
            current_exam_modified,
            current_exam_levels_modified)):
        try:
            with open(configfilepath, mode="w") as f:
                # modify config file
                json.dump(config, f, indent=4)

            prjs(dict(fixed_ok=True))
        except:
            prjs(dict(fixed_ok=False))
    else:
        prjs(dict(first_level_modified=first_level_modified,
                  current_test_modified=current_test_modified,
                  current_test_levels_modified=current_test_levels_modified,
                  current_exam_modified=current_exam_modified,
                  current_exam_levels_modified=current_exam_levels_modified))


if __name__ == '__main__':
    try:
        _main()
    except Exception as e:
        if settings.DEBUG:
            from mytool import mytb

            exc_dict = mytb.exc_dict(e)
            breakpoint()
        raise e
