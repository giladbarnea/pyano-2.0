from typing import Literal, TypedDict, List

# SubconfigName = Literal["current_test", "current_exam"]


DemoType = Literal["video", "animation"]
ExperimentType = Literal["test", "exam"]

DeviationType = Literal["rhythm", "tempo"]
TLevel = TypedDict('TLevel', {'notes': int, 'trials': int, 'rhythm': bool, 'tempo': int})
TLevels = List[TLevel]
strlist = List[str]
intlist = List[int]
DevOptions = TypedDict("DevOptions", {"skip_experiment_intro":      bool,
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
    "name",
    "subject",
    "truth_file",
]
PageName = Literal["new", "running"]
TSubconfig = TypedDict("TSubconfig", {
    'allowed_rhythm_deviation': float,
    'allowed_tempo_deviation':  float,
    'demo_type':                DemoType,
    'errors_playrate':          float,
    'finished_trials_count':    int,
    'levels':                   TLevels,
    'name':                     str,
    'subject':                  str,
    'truth_file':               str,
    })

BigConfigKey = Literal[
    'dev',
    'devoptions',
    'exam_file',
    'experiment_type',
    'last_page',
    'subjects',
    'test_file',
    'velocities',
]
TBigConfig = TypedDict("TBigConfig", {
    'dev':             bool,
    'devoptions':      DevOptions,
    'exam_file':       str,
    'experiment_type': ExperimentType,
    'last_page':       PageName,
    'subjects':        strlist,
    'test_file':       str,
    'velocities':      int,
    })
