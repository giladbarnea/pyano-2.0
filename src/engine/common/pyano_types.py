from typing import Literal, TypedDict, List, Union, Dict, Optional, Tuple, NamedTuple

# SubconfigName = Literal["current_test", "current_exam"]
# ** Types from Node
Kind = Union[Literal['on'], Literal['off']]
DemoType = Literal["video", "animation"]
ExperimentType = Literal["test", "exam"]
IMsg = TypedDict('IMsg', {
    'time':            float,
    'note':            int,
    'kind':            Kind,
    'velocity':        Optional[int],
    'last_onmsg_time': Optional[float],
    'time_delta':      Optional[float],
    })
DeviationType = Literal["rhythm", "tempo"]
OnOffPairs = List[NamedTuple('OnOffPairs', [('onmsg', IMsg), ('offmsg', IMsg)])]
ILevel = TypedDict('ILevel', {'notes': int, 'trials': int, 'rhythm': bool, 'tempo': Optional[int]})
LevelArray = List[ILevel]
strlist = List[str]
intlist = List[int]
DevOptions = TypedDict("DevOptions", {
    "force_notes_number":         Optional[int],
    "force_playback_rate":        Optional[int],
    "mute_animation":             bool,
    "no_reload_on_submit":        bool,
    "simulate_test_mode":         bool,
    "simulate_video_mode":        bool,
    "simulate_animation_mode":    bool,
    "skip_experiment_intro":      bool,
    "skip_fade":                  bool,
    "skip_failed_trial_feedback": bool,
    "skip_level_intro":           List[int],
    "skip_midi_exists_check":     bool,
    "skip_passed_trial_feedback": bool,
    })

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
ISubconfig = TypedDict("ISubconfig", {
    'allowed_rhythm_deviation': float,
    'allowed_tempo_deviation':  float,
    'demo_type':                DemoType,
    'errors_playrate':          float,
    'finished_trials_count':    int,
    'levels':                   LevelArray,
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
IBigConfig = TypedDict("IBigConfig", {
    'dev':             bool,
    'devoptions':      DevOptions,
    'exam_file':       str,
    'test_file':       str,
    'experiment_type': ExperimentType,
    'last_page':       PageName,
    'subjects':        List[str],
    'velocities':      int,
    })
# ** Types relevant only to python engine
Chords = Dict[int, List[int]]
Mistake = Union["accuracy", "rhythm"]