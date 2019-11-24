from .pyano_types import *
from typing import List


class BigConfig:
    dev: bool
    devoptions: DevOptions
    exam_file: str
    experiment_type: ExperimentType
    last_page: PageName
    test_file: str
    subjects: List[str]
    velocities: List[int]
    vid_silence_len: int

    def __init__(self, cfg: TBigConfig):
        self.dev = cfg['dev']
        self.devoptions = cfg['devoptions']
        self.exam_file = cfg['exam_file']
        self.experiment_type = cfg['experiment_type']
        self.last_page = cfg['last_page']
        self.test_file = cfg['test_file']
        self.subjects = cfg['subjects']
        self.velocities = cfg['velocities']
        self.vid_silence_len = cfg['vid_silence_len']


class SubConfig:
    allowed_rhythm_deviation: str
    allowed_tempo_deviation: str
    demo_type: DemoType
    errors_playrate: float
    finished_trials_count: int
    levels: List[TLevel]
    subject: str
    truth_file: str

    def __init__(self, subcfg: TSubconfig):
        self.allowed_rhythm_deviation = subcfg['allowed_rhythm_deviation']
        self.allowed_tempo_deviation = subcfg['allowed_tempo_deviation']
        self.demo_type = subcfg['demo_type']
        self.errors_playrate = subcfg['errors_playrate']
        self.finished_trials_count = subcfg['finished_trials_count']
        self.levels = subcfg['levels']
        self.subject = subcfg['subject']
        self.truth_file = subcfg['truth_file']
