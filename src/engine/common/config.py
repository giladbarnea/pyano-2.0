from .pyano_types import *
from typing import List
from dataclasses import dataclass


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


@dataclass
class Subconfig:
    allowed_rhythm_deviation: str
    allowed_tempo_deviation: str
    truth_file: str
    demo_type: DemoType = None
    errors_playrate: float = None
    finished_trials_count: int = None
    levels: List[TLevel] = None
    subject: str = None
    name: str = None

    def to_dict(self):
        return dict(
            allowed_rhythm_deviation=self.allowed_rhythm_deviation,
            allowed_tempo_deviation=self.allowed_tempo_deviation,
            truth_file=self.truth_file,
            demo_type=self.demo_type,
            errors_playrate=self.errors_playrate,
            finished_trials_count=self.finished_trials_count,
            levels=self.levels,
            subject=self.subject,
            name=self.name
            )
