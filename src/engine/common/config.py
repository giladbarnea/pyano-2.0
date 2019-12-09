from typing import *

try:
    from .pyano_types import *
except ImportError:
    DevOptions = Any
    ExperimentType = Any
    PageName = Any
    TBigConfig = Any
    DemoType = Any
    TSubconfig = Any
    TLevel = Any


class BigConfig:
    dev: bool
    devoptions: DevOptions
    exam_file: str
    experiment_type: ExperimentType
    last_page: PageName
    test_file: str
    subjects: List[str]
    velocities: List[int]

    def __init__(self, cfg: TBigConfig):
        self.dev = cfg.get('dev')
        self.devoptions = cfg.get('devoptions')
        self.exam_file = cfg.get('exam_file')
        self.experiment_type = cfg.get('experiment_type')
        self.last_page = cfg.get('last_page')
        self.test_file = cfg.get('test_file')
        self.subjects = cfg.get('subjects')
        self.velocities = cfg.get('velocities')

    def to_dict(self):
        return dict(
            dev=self.dev,
            devoptions=self.devoptions,
            exam_file=self.exam_file,
            experiment_type=self.experiment_type,
            last_page=self.last_page,
            test_file=self.test_file,
            subjects=self.subjects,
            velocities=self.velocities,
            )


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

    def __init__(self, cfg: TSubconfig):
        self.allowed_rhythm_deviation = cfg.get('allowed_rhythm_deviation')
        self.allowed_tempo_deviation = cfg.get('allowed_tempo_deviation')
        self.truth_file = cfg.get('truth_file')
        self.demo_type = cfg.get('demo_type')
        self.errors_playrate = cfg.get('errors_playrate')
        self.finished_trials_count = cfg.get('finished_trials_count')
        self.levels = cfg.get('levels')
        self.subject = cfg.get('subject')
        self.name = cfg.get('name')

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
