from typing import Literal, TypedDict, Optional, List, NewType

SubconfigName = Literal["current_test", "current_exam"]
SubconfigKey = Literal["demo_type",
                       "errors_playingspeed",
                       "allowed_rhythm_deviation",
                       "allowed_tempo_deviation",
                       "levels",
                       "finished_trials_count",
                       "save_path",
                       "current_subject"]
PageName = Literal["new",
                   "running",
                   "record",
                   "file_tools",
                   "settings"]

DemoType = Literal["video", "animation"]
ExperimentType = Literal["test", "exam"]

DeviationType = Literal["rhythm", "tempo"]
Level = TypedDict('Level', {'notes': int, 'trials': int, 'rhythm': bool, 'tempo': int})
Levels = List[Level]
strlist = List[str]
intlist = List[int]
DevOptions = TypedDict("DevOptions", {"skip_whole_truth":           bool,
                                      "skip_level_intro":           bool,
                                      "skip_failed_trial_feedback": bool,
                                      "skip_passed_trial_feedback": bool})
Subconfig = TypedDict("Subconfig", {
    'allowed_rhythm_deviation': str,
    'allowed_tempo_deviation':  str,
    'current_subject':          str,
    'demo_type':                DemoType,
    'errors_playingspeed':      int,
    'finished_trials_count':    int,
    'levels':                   Levels,
    'save_path':                str,
    })
ConfigKey = Literal[
    'current_exam',
    'current_test',
    'dev',
    'experiment_type',
    'last_page',
    'root_abs_path',
    'subjects',
    'truth_file_path',
    'vid_silence_len',
]
Config = TypedDict("Config", {
    'current_exam':    Subconfig,
    'current_test':    Subconfig,
    'dev':             bool,
    'devoptions':      DevOptions,
    'experiment_type': ExperimentType,
    'last_page':       PageName,
    'root_abs_path':   str,
    'subjects':        strlist,
    'truth_file_path': str,
    'velocities':      intlist,
    'vid_silence_len': int,
    })
