from dataclasses import dataclass
from typing import *


@dataclass
class Level:
    notes: int
    trials: int
    rhythm: bool
    tempo: Optional[int]

    def to_dict(self):
        return dict(notes=self.notes,
                    trials=self.trials,
                    rhythm=self.rhythm,
                    tempo=self.tempo)
