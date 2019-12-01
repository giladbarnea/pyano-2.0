from typing import List, Union

import pytest
from classes import Message
from collections import OrderedDict

"""from InsideTest.check_done_trial import estimate_tempo_percentage
from classes import Message

msgs_no_chords = Message.init_many(dict(time=1000000000, note=10, velocity=100, kind='on'),
                                   dict(time=1000000001, note=20, velocity=100, kind='on'),
                                   dict(time=1000000002, note=30, velocity=100, kind='on'),
                                   dict(time=1000000003, note=40, velocity=100, kind='on'),
                                   )

msgs_with_chords = Message.init_many(dict(time=1000000000, note=10, velocity=100, kind='on'),
                                     dict(time=1000000001, note=20, velocity=100, kind='on'),
                                     dict(time=1000000001.05, note=25, velocity=100, kind='on'),
                                     dict(time=1000000001.08, note=30, velocity=100, kind='on'),
                                     dict(time=1000000002, note=30, velocity=100, kind='on'),
                                     dict(time=1000000003, note=40, velocity=100, kind='on'),
                                     )
tempoed_msgs_no_chords = Message.transform_to_tempo(msgs_no_chords, 120)
tempoed_msgs_with_chords = Message.transform_to_tempo(msgs_with_chords, 120)

no_chords_tempo_estimation = estimate_tempo_percentage(tempoed_msgs_no_chords, msgs_no_chords, len(msgs_no_chords))
with_chords_tempo_estimation = estimate_tempo_percentage(tempoed_msgs_with_chords, msgs_with_chords,
                                                         len(msgs_with_chords))
no_chords_expected_original = Message.transform_to_tempo(tempoed_msgs_no_chords, 10000 / no_chords_tempo_estimation)
with_chords_expected_original = Message.transform_to_tempo(tempoed_msgs_with_chords,
                                                           10000 / with_chords_tempo_estimation)
assert no_chords_expected_original == msgs_no_chords
assert with_chords_expected_original == msgs_with_chords"""


def shift_times(shift: Union[int, float], msgs: List[Message]):
    for m in msgs:
        m.time += shift
    return msgs


no_chords = Message.init_many(
    dict(time=1000000000, note=76, velocity=80, kind='on'),
    dict(time=1000000001, note=76, kind='off'),

    dict(time=1000000002, note=77, velocity=80, kind='on'),
    dict(time=1000000003, note=77, kind='off'),

    dict(time=1000000004, note=78, velocity=80, kind='on'),
    dict(time=1000000005, note=78, kind='off'),
    )
four_note_chord_normalized = Message.init_many(
    dict(time=1000000000.00000, note=76, velocity=80, kind='on'),
    dict(time=1000000000.04, note=77, velocity=80, kind='on'),
    dict(time=1000000000.08, note=78, velocity=80, kind='on'),
    dict(time=1000000000.12, note=79, velocity=80, kind='on'),
    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),  # //// Note no matching off for .12 on, still passes
    )
three_note_chord_normalized = Message.init_many(
    dict(time=1000000000.00000, note=76, velocity=80, kind='on'),
    dict(time=1000000000.04, note=77, velocity=80, kind='on'),
    dict(time=1000000000.08, note=78, velocity=80, kind='on'),
    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),
    )

two_note_chord_normalized = Message.init_many(
    dict(time=1000000000.00000, note=76, velocity=80, kind='on'),
    dict(time=1000000000.04, note=77, velocity=80, kind='on'),
    dict(time=1000000000.09, note=78, velocity=80, kind='on'),
    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),
    )


class TestMessage:
    class TestNormalizeChords:

        def test__get_chords(self):
            chords = Message.get_chords(no_chords)
            assert not chords
            chords = Message.get_chords(four_note_chord_normalized)
            assert dict(chords) == {0: [1, 2, 3]}
            chords = Message.get_chords(three_note_chord_normalized)
            assert dict(chords) == {0: [1, 2]}

            chords = Message.get_chords(two_note_chord_normalized)
            assert dict(chords) == {0: [1]}

            no_chords_shifted = shift_times(10, no_chords)
            chords = Message.get_chords([*three_note_chord_normalized,
                                         *no_chords_shifted,
                                         *shift_times(20, two_note_chord_normalized)])

            assert dict(chords) == {0: [1, 2], 12: [13]}

            # def test__normalize_chords(self):
            #     Message.normalize_chords(msgs, )
