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
from util import Logger, prjs
from config import create, check, fix

logger = Logger('check_create_config_file')
root_abs_path = sys.argv[1]
configfilepath = sys.argv[2]

username = os.getlogin()

dev: bool = 'gilad' in username or settings.DEBUG


def _main():
    config_exists = os.path.isfile(configfilepath)
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

        bad_first_level_keys = check.first_level(config)
        print(f'bad_first_level_keys: ', bad_first_level_keys)

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
            logger.log_thin(
                [
                    'modifying root_abs_path',
                    {"config.get('root_abs_path')": config.get('root_abs_path'),
                     'root_abs_path':               root_abs_path}
                    ],
                title='check_fix_first_level()')
            config['root_abs_path'] = root_abs_path
            modified = True

        if 'dev' not in config or config['dev'] != dev:
            logger.log_thin(
                [
                    'modifying dev',
                    {"config.get('dev')": config.get('dev'),
                     'dev':               dev}
                    ],
                title='check_fix_first_level()')
            config['dev'] = dev
            modified = True

        if 'experiment_type' not in config or config['experiment_type'] not in ['exam', 'test']:
            logger.log_thin(
                [
                    'modifying experiment_type',
                    {"config.get('experiment_type')": config.get('experiment_type')}
                    ],
                title='check_fix_first_level()')
            config['experiment_type'] = 'test'
            modified = True

        if 'truth_file_path' not in config:
            logger.log_thin(
                ['modifying truth_file_path - not in config', 'setting to experiments/truths/fur_elise_B.txt'],
                title='check_fix_first_level()')
            modified = True
            config['truth_file_path'] = "experiments/truths/fur_elise_B.txt"
        else:
            split = re.split(r'[\\/]', config['truth_file_path'])
            if (len(split) != 3
                    or split[0] != 'experiments'
                    or split[1] != 'truths'
                    or not split[2].endswith('.txt')):
                logger.log_thin(
                    ['modifying truth_file_path - in config but bad value',
                     'setting to experiments/truths/fur_elise_B.txt',
                     {"config['truth_file_path']": config['truth_file_path']}],
                    title='check_fix_first_level()')
                modified = True
                config['truth_file_path'] = "experiments/truths/fur_elise_B.txt"

        if not os.path.isfile(
                os.path.join(root_abs_path, config['truth_file_path'])):  # truth_file_path key valid at this stage
            logger.log_thin(
                ['modifying truth_file_path - not isfile', 'setting to experiments/truths/fur_elise_B.txt',
                 {"config['truth_file_path']": config['truth_file_path']}],
                title='check_fix_first_level()')
            modified = True
            config['truth_file_path'] = "experiments/truths/fur_elise_B.txt"

        if ('last_page' not in config
                or config['last_page'] not in ['new_test', 'inside_test', 'record', 'file_tools', 'settings']):
            logger.log_thin(
                ['modifying last_page', 'setting to new_test', {"config.get('last_page')": config.get('last_page')}],
                title='check_fix_first_level()')
            config['last_page'] = 'new_test'
            modified = True

        if ('vid_silence_len' not in config
                or config['vid_silence_len'] < 0):
            logger.log_thin(
                ['modifying vid_silence_len', 'setting to 0',
                 {"config.get('vid_silence_len')": config.get('vid_silence_len')}],
                title='check_fix_first_level()')
            config['vid_silence_len'] = 0
            modified = True

        if ('subjects' not in config
                or not isinstance(config['subjects'], list)
                or not all([config['subjects']])
                or not all((isinstance(s, str) for s in config['subjects']))):
            logger.log_thin(
                ['modifying subjects', f'setting to [username] (username = {username})',
                 {"config.get('subjects')": config.get('subjects')}],
                title='check_fix_first_level()')
            config['subjects'] = [username]
            modified = True

        # subject key exists and is a list of strings
        elif username not in config['subjects']:
            logger.log_thin(
                ['modifying subjects', f'appending username ({username}) to config["subjects"]',
                 {"config.get('subjects')": config.get('subjects')}],
                title='check_fix_first_level()')
            config['subjects'].append(username)
            modified = True

        for key in list(config.keys()):
            if key not in _KEYS:
                logger.log_thin(
                    ['found a key thats not in _KEYS. popping.', dict(key=key, _KEYS=_KEYS)],
                    title='check_fix_first_level()')
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
                logger.log_thin(
                    [f'notes isnt int or <= 0 in level: {i}', 'defaulting to 4',
                     {'level.get("notes")': level.get("notes")}],
                    title='check_fix_test_dict_levels() | levels')
                levels[i]['notes'] = 4
                modified = True

            if not isinstance(level['trials'], int) or level['trials'] <= 0:
                logger.log_thin(
                    [f'trials isnt int or <= 0 in level: {i}', 'defaulting to 2',
                     {'level.get("trials")': level.get("trials")}],
                    title='check_fix_test_dict_levels() | levels')
                levels[i]['trials'] = 2
                modified = True

            if not isinstance(level['rhythm'], bool):
                logger.log_thin(
                    [f'rhythm isnt bool', 'setting to False', f'level: {i}',
                     {'level.get("rhythm")': level.get("rhythm")}],
                    title='check_fix_test_dict_levels() | levels')
                levels[i]['rhythm'] = False
                modified = True

            if level['rhythm']:  # rhythm: True
                if not isinstance(level['tempo'], int) or not 0 < level['tempo'] <= 200:
                    logger.log_thin(
                        [f'tempo isnt int or not between 0 and 200', 'defaulting to 50', f'level: {i}',
                         {'level.get("rhythm")': level.get("rhythm"), 'level.get("tempo")': level.get("tempo")}],
                        title='check_fix_test_dict_levels() | levels')
                    level['tempo'] = 50
                    modified = True
            else:  # rhythm: False
                if level['tempo'] is not None:
                    logger.log_thin(
                        [f'tempo isnt None, but should be because rhythm is False', 'setting to None', f'level: {i}',
                         {'level.get("rhythm")': level.get("rhythm"), 'level.get("tempo")': level.get("tempo")}],
                        title='check_fix_test_dict_levels() | levels')
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
            logger.log_thin(['config was modified, overwriting to:', dict(config=config)],
                            title='END OF FILE')
            with open(configfilepath, mode="w") as f:
                # modify config file
                json.dump(config, f, indent=4)

            prjs(dict(fixed_ok=True))
        except:
            prjs(dict(fixed_ok=False))
    else:
        logger.log_thin('END of file, nothing was modified')
    prjs(dict(first_level_modified=first_level_modified,
              current_test_modified=current_test_modified,
              current_test_levels_modified=current_test_levels_modified,
              current_exam_modified=current_exam_modified,
              current_exam_levels_modified=current_exam_levels_modified))


if __name__ == '__main__':
    try:
        _main()
    except Exception as e:
        raise e
