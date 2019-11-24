from typing import Literal, TypedDict, List

# SubconfigName = Literal["current_test", "current_exam"]


DemoType = Literal["video", "animation"]
ExperimentType = Literal["test", "exam"]

DeviationType = Literal["rhythm", "tempo"]
TLevel = TypedDict('TLevel', {'notes': int, 'trials': int, 'rhythm': bool, 'tempo': int})
TLevels = List[TLevel]
strlist = List[str]
intlist = List[int]
DevOptions = TypedDict("DevOptions", {"skip_whole_truth":           bool,
                                      "skip_level_intro":           bool,
                                      "skip_failed_trial_feedback": bool,
                                      "skip_passed_trial_feedback": bool})

SubconfigKey = Literal[
    "allowed_rhythm_deviation",
    "allowed_tempo_deviation",
    "demo_type",
    "errors_playrate",
    "finished_trials_count",
    "levels",
    "subject",
    "truth_file",
]
PageName = Literal["new",
                   "running",
                   "record",
                   "file_tools",
                   "settings"]
TSubconfig = TypedDict("TSubconfig", {
    'allowed_rhythm_deviation': str,
    'allowed_tempo_deviation':  str,
    'demo_type':                DemoType,
    'errors_playrate':          float,
    'finished_trials_count':    int,
    'levels':                   TLevels,
    'subject':                  str,
    'truth_file':               str,
    })
BigConfigKey = Literal[
    'dev',
    'devoptions',
    'exam_file',
    'experiment_type',
    'last_page',
    'test_file',
    'subjects',
    'velocities',
    'vid_silence_len',
]
TBigConfig = TypedDict("TBigConfig", {
    'dev':             bool,
    'devoptions':      DevOptions,
    'exam_file':       str,
    'experiment_type': ExperimentType,
    'last_page':       PageName,
    'test_file':       str,
    'subjects':        strlist,
    'velocities':      intlist,
    'vid_silence_len': int,
    })
