"""https://docs.pytest.org/en/latest/usage.html#cmdline"""
from typing import List, Union

import pytest
from classes import Message
from collections import OrderedDict
from copy import deepcopy
import itertools

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
    shifted = []
    for m in msgs:
        shifted.append(Message.init(time=m.time + shift, note=m.note, velocity=m.velocity, kind=m.kind,
                                    preceding_message_time=m.preceding_message_time))
    return shifted


def chain(*lists: List[Message]) -> List[Message]:
    # //// Assumes chron sorted
    # concatenated = [*lists[0]]
    chained = list(itertools.chain(*lists))
    for i, m in enumerate(chained[1:]):
        m.preceding_message_time = chained[i].time
        m.time_delta = m.time - chained[i].time
    return chained


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

two_note_chord_not_normalized = Message.init_many(
    dict(time=1000000000, note=77, velocity=80, kind='on'),
    dict(time=1000000000.04, note=76, velocity=80, kind='on'),
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

            chained = chain(three_note_chord_normalized,
                            shift_times(10, no_chords),
                            shift_times(20, two_note_chord_normalized))
            chords = Message.get_chords(chained)

            assert dict(chords) == {0: [1, 2], 12: [13]}

        def test__normalize_chords(self):
            msgs, is_normalized = Message.normalize_chords(no_chords, Message.get_chords(no_chords))
            assert msgs == no_chords
            assert is_normalized

            msgs, is_normalized = Message.normalize_chords(four_note_chord_normalized,
                                                           Message.get_chords(four_note_chord_normalized))
            assert msgs == four_note_chord_normalized
            assert is_normalized

            two_note_chord_not_normalized_C = deepcopy(two_note_chord_not_normalized)
            msgs, is_normalized = Message.normalize_chords(two_note_chord_not_normalized_C,
                                                           Message.get_chords(two_note_chord_not_normalized_C))

            assert msgs == two_note_chord_normalized
            # assert is_normalized is False
