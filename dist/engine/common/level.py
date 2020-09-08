from dataclasses import dataclass
from typing import *


class Level:
    notes: int
    trials: int
    rhythm: bool
    tempo: Optional[int]

    def __init__(self, level):
        self.notes = level.get('notes')
        self.trials = level.get('trials')
        self.rhythm = level.get('rhythm')
        self.tempo = level.get('tempo')

    def to_dict(self):
        return dict(notes=self.notes,
                    trials=self.trials,
                    rhythm=self.rhythm,
                    tempo=self.tempo)
