from typing import *
from .message import Msg
from . import consts

from enum import Enum


# Mistake = namedtuple('Mistake', ['accuracy', 'rhythm', None])


class Mistake(Enum):
    accuracy = 1
    rhythm = 2


class Hit:
    def __init__(self, on_msg: Msg, other_on_msg: Msg, allowed_rhythm_deviation: int):
        if not (0 <= allowed_rhythm_deviation <= 100):
            raise ValueError(f"Hit __init__ bad allowed_rhythm_deviation: {allowed_rhythm_deviation}")
        self.accuracy_ok = on_msg.note == other_on_msg.note

        self.rhythm_deviation = on_msg.getrhythm_deviation(other_on_msg)
        """if msg.time_delta and truth.time_delta:
            if truth.time_delta <= 0.05 and msg.time_delta <= 0.05:
                # if chord - as long as tight enough, counts as no deviation
                self.rhythm_deviation = 0
            else:
                # (0.3 / 0.25) x 100 = 1.2 x 100 = 120
                ratio = (msg.time_delta / truth.time_delta) * 100
                # abs(100 - 120) = 20
                self.rhythm_deviation = abs(100 - ratio)
        else:  # some time_delta is None
            self.rhythm_deviation = 0"""

        if self.accuracy_ok:  # interesting only if got accuracy right
            self.rhythm_ok = self.rhythm_deviation < allowed_rhythm_deviation
        else:  # rhythm isn't checked anyway if accuracy isn't right
            self.rhythm_ok = True

    def to_dict(self) -> dict:
        return dict(
            accuracy_ok=self.accuracy_ok,
            rhythm_deviation=self.rhythm_deviation,
            rhythm_ok=self.rhythm_ok)

    def are_accuracy_and_rhythm_correct(self) -> bool:
        return self.accuracy_ok and self.rhythm_ok

    def get_mistake_kind(self) -> Optional[Mistake]:
        if not self.accuracy_ok:
            return Mistake.accuracy
        if not self.rhythm_ok:
            return Mistake.rhythm
        return None

    def __str__(self) -> str:
        return f'accuracy_ok: {self.accuracy_ok}\trhythm_deviation: {self.rhythm_deviation}\trhythm_ok: {self.rhythm_ok}'

    def __repr__(self) -> str:
        return self.__str__()
