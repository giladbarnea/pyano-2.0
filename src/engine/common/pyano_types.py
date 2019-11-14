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
Devoptions = TypedDict("Devoptions", {'skip': bool})
Subconfig = TypedDict("Subconfig", {
    'demo_type':                DemoType,
    'errors_playingspeed':      int,
    'allowed_rhythm_deviation': str,
    'allowed_tempo_deviation':  str,
    'levels':                   Levels,
    'finished_trials_count':    int,
    'save_path':                str,
    'current_subject':          str
    })
ConfigKey = Literal[
    'root_abs_path',
    'dev',
    'subjects',
    'vid_silence_len',
    'last_page',
    'experiment_type',
    'truth_file_path',
    'current_test',
    'current_exam',
]
Config = TypedDict("Config", {
    'root_abs_path':   str,
    'dev':             bool,
    'subjects':        strlist,
    'vid_silence_len': int,
    'last_page':       PageName,
    'experiment_type': ExperimentType,
    'truth_file_path': str,
    'devoptions':      Devoptions,
    'velocities':      intlist,
    'current_test':    Subconfig,
    'current_exam':    Subconfig
    })
