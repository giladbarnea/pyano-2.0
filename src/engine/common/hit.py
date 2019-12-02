from typing import *
from .message import Msg
from . import consts

from enum import Enum


# Mistake = namedtuple('Mistake', ['accuracy', 'rhythm', None])
class Mistake(Enum):
    accuracy = 1
    rhythm = 2


class Hit:
    def __init__(self, msg: Msg, truth: Msg, allowed_rhythm_deviation: int):
        if not (0 <= allowed_rhythm_deviation <= 100):
            # entry = logger.log(
            #     dict(self=self, msg=msg, truth=truth,
            #          allowed_rhythm_deviation=allowed_rhythm_deviation),
            #     title="Hit constructor ValueError bad allowed_rhythm_deviation")
            # raise ValueError(
            #     f"Hit constructor got bad allowed_rhythm_deviation, got: {allowed_rhythm_deviation}. see classes.log, entry: {entry}")
            raise ValueError(
                f"Hit constructor got bad allowed_rhythm_deviation, got: {allowed_rhythm_deviation}")
        self.is_accuracy_correct = msg.note == truth.note

        self._rhythm_deviation = Hit._get_rhythm_deviation(msg.time_delta, truth.time_delta)
        """if msg.time_delta and truth.time_delta:
            if truth.time_delta <= 0.05 and msg.time_delta <= 0.05:
                # if chord - as long as tight enough, counts as no deviation
                self._rhythm_deviation = 0
            else:
                # (0.3 / 0.25) x 100 = 1.2 x 100 = 120
                ratio = (msg.time_delta / truth.time_delta) * 100
                # abs(100 - 120) = 20
                self._rhythm_deviation = abs(100 - ratio)
        else:  # some time_delta is None
            self._rhythm_deviation = 0"""

        if self.is_accuracy_correct:  # interesting only if got accuracy right
            self._is_rhythm_correct = self._rhythm_deviation < allowed_rhythm_deviation
        else:  # rhythm isn't checked anyway if accuracy isn't right
            self._is_rhythm_correct = True

    def to_dict(self) -> dict:
        return dict(
            is_accuracy_correct=self.is_accuracy_correct,
            rhythm_deviation=self._rhythm_deviation,
            is_rhythm_correct=self._is_rhythm_correct)

    @staticmethod
    def _get_rhythm_deviation(msg_time_delta: float, truth_time_delta: float) -> float:
        if msg_time_delta is None or truth_time_delta is None:
            return 0  # some time_delta is None

        if truth_time_delta <= consts.CHORD_THRESHOLD and msg_time_delta <= consts.CHORD_THRESHOLD:
            # if chord - as long as tight enough, counts as no deviation
            return 0

        # (0.3 / 0.25) x 100 = 1.2 x 100 = 120
        #  OR
        # (0.2 / 0.25) x 100 = 0.8 x 100 = 80
        deltas_ratio = (msg_time_delta / truth_time_delta) * 100
        # abs(100 - 120) = 20.0 || OR || abs(100 - 80) = 20.0
        return abs(100 - deltas_ratio)

    def are_accuracy_and_rhythm_correct(self) -> bool:
        return self.is_accuracy_correct and self._is_rhythm_correct

    def get_mistake_kind(self) -> Optional[Mistake]:
        if not self.is_accuracy_correct:
            return Mistake.accuracy
        if not self._is_rhythm_correct:
            return Mistake.rhythm
        return None

    def __str__(self) -> str:
        return f'is_accuracy_correct: {self.is_accuracy_correct}\t_rhythm_deviation: {self._rhythm_deviation}\t_is_rhythm_correct: {self._is_rhythm_correct}'

    def __repr__(self) -> str:
        return self.__str__()
