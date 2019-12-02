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

four_note_chord_not_normalized = Message.init_many(
    dict(time=1000000000, note=77, velocity=80, kind='on'),
    dict(time=1000000000.04, note=76, velocity=80, kind='on'),
    dict(time=1000000000.08, note=79, velocity=80, kind='on'),
    dict(time=1000000000.12, note=78, velocity=80, kind='on'),

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

    dict(time=1000000000.1, note=78, velocity=80, kind='on'),
    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),
    )

two_note_chord_not_normalized = Message.init_many(
    dict(time=1000000000, note=77, velocity=80, kind='on'),
    dict(time=1000000000.04, note=76, velocity=80, kind='on'),

    dict(time=1000000000.1, note=78, velocity=80, kind='on'),
    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),
    )

three_note_chord_not_normalized = Message.init_many(
    dict(time=1000000000, note=77, velocity=80, kind='on'),
    dict(time=1000000000.04, note=76, velocity=80, kind='on'),
    dict(time=1000000000.08, note=78, velocity=80, kind='on'),

    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),
    )

three_note_chord_not_normalized_2 = Message.init_many(
    dict(time=1000000000, note=77, velocity=80, kind='on'),
    dict(time=1000000000.04, note=78, velocity=80, kind='on'),
    dict(time=1000000000.08, note=76, velocity=80, kind='on'),

    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),
    )

three_note_chord_not_normalized_3 = Message.init_many(
    dict(time=1000000000, note=78, velocity=80, kind='on'),
    dict(time=1000000000.04, note=77, velocity=80, kind='on'),
    dict(time=1000000000.08, note=76, velocity=80, kind='on'),

    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),
    )

three_note_chord_not_normalized_4 = Message.init_many(
    dict(time=1000000000, note=78, velocity=80, kind='on'),
    dict(time=1000000000.04, note=76, velocity=80, kind='on'),
    dict(time=1000000000.08, note=77, velocity=80, kind='on'),

    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),
    )

three_note_chord_not_normalized_5 = Message.init_many(
    dict(time=1000000000, note=76, velocity=80, kind='on'),
    dict(time=1000000000.04, note=78, velocity=80, kind='on'),
    dict(time=1000000000.08, note=77, velocity=80, kind='on'),

    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),
    )

legato_2_overlap = Message.init_many(
    dict(time=1000000000, note=76, velocity=80, kind='on'),  # ///0
    dict(time=1000000000.04, note=77, velocity=80, kind='on'),  # ///1

    dict(time=1000000000.05, note=76, kind='off'),  # ///2
    dict(time=1000000000.08, note=78, velocity=80, kind='on'),  # ///3

    dict(time=1000000000.09, note=77, kind='off'),  # ///4
    dict(time=1000000001, note=78, kind='off'),  # ///5
    )

legato_3_overlap = Message.init_many(
    dict(time=1000000000, note=76, velocity=80, kind='on'),  # ///0
    dict(time=1000000000.04, note=77, velocity=80, kind='on'),  # ///1
    dict(time=1000000000.08, note=78, velocity=80, kind='on'),  # ///2

    dict(time=1000000000.09, note=76, kind='off'),  # ///3
    dict(time=1000000000.1, note=79, velocity=80, kind='on'),  # ///4

    dict(time=1000000001, note=77, kind='off'),  # ///5
    dict(time=1000000001.1, note=78, kind='off'),  # ///6
    dict(time=1000000001.2, note=79, kind='off'),  # ///7
    )

legato_3_overlap_2 = Message.init_many(
    dict(time=1000000000, note=76, velocity=80, kind='on'),  # ///0
    dict(time=1000000000.04, note=77, velocity=80, kind='on'),  # ///1
    dict(time=1000000000.08, note=78, velocity=80, kind='on'),  # ///2

    dict(time=1000000000.09, note=77, kind='off'),  # ///3
    dict(time=1000000000.1, note=79, velocity=80, kind='on'),  # ///4

    dict(time=1000000001, note=76, kind='off'),  # ///5
    dict(time=1000000001.1, note=78, kind='off'),  # ///6
    dict(time=1000000001.2, note=79, kind='off'),  # ///7
    )

legato_3_overlap_3 = Message.init_many(
    dict(time=1000000000, note=76, velocity=80, kind='on'),  # ///0
    dict(time=1000000000.04, note=77, velocity=80, kind='on'),  # ///1
    dict(time=1000000000.08, note=78, velocity=80, kind='on'),  # ///2

    dict(time=1000000000.09, note=78, kind='off'),  # ///3
    dict(time=1000000000.1, note=79, velocity=80, kind='on'),  # ///4

    dict(time=1000000001, note=76, kind='off'),  # ///5
    dict(time=1000000001.1, note=77, kind='off'),  # ///6
    dict(time=1000000001.2, note=79, kind='off'),  # ///7
    )


class TestMessage:

    def test__get_chords(self):
        chords = Message.get_chords(no_chords)
        assert not chords

        four_note_chord_chords = Message.get_chords(four_note_chord_normalized)
        assert dict(four_note_chord_chords) == {0: [1, 2, 3]}

        three_note_chord_chords = Message.get_chords(three_note_chord_normalized)
        assert dict(three_note_chord_chords) == {0: [1, 2]}

        two_note_chord_chords = Message.get_chords(two_note_chord_normalized)
        assert dict(two_note_chord_chords) == {0: [1]}

        chained = chain(three_note_chord_normalized,
                        shift_times(10, no_chords),
                        shift_times(20, two_note_chord_normalized))
        chords = Message.get_chords(chained)

        assert dict(chords) == {0: [1, 2], 12: [13]}

        assert dict(Message.get_chords(two_note_chord_not_normalized)) == two_note_chord_chords

        assert dict(Message.get_chords(three_note_chord_not_normalized)) == three_note_chord_chords
        assert dict(Message.get_chords(three_note_chord_not_normalized_2)) == three_note_chord_chords
        assert dict(Message.get_chords(three_note_chord_not_normalized_3)) == three_note_chord_chords
        assert dict(Message.get_chords(three_note_chord_not_normalized_4)) == three_note_chord_chords
        assert dict(Message.get_chords(three_note_chord_not_normalized_5)) == three_note_chord_chords
        assert dict(Message.get_chords(four_note_chord_not_normalized)) == four_note_chord_chords

        assert dict(Message.get_chords(legato_2_overlap)) == {0: [1], 1: [3]}
        assert dict(Message.get_chords(legato_3_overlap)) == {0: [1, 2], 1: [2, 4]}
        assert dict(Message.get_chords(legato_3_overlap_2)) == {0: [1, 2, 4]}
        assert dict(Message.get_chords(legato_3_overlap_3)) == {0: [1, 2, 4]}

    def test__normalize_chords(self):
        msgs, is_normalized = Message.normalize_chords(no_chords, Message.get_chords(no_chords))
        assert msgs == no_chords
        assert is_normalized

        msgs, is_normalized = Message.normalize_chords(four_note_chord_normalized,
                                                       Message.get_chords(four_note_chord_normalized))
        assert msgs == four_note_chord_normalized
        assert is_normalized

        msgs, is_normalized = Message.normalize_chords(two_note_chord_not_normalized,
                                                       Message.get_chords(two_note_chord_not_normalized))

        assert msgs == two_note_chord_normalized
        assert is_normalized is False

        msgs, is_normalized = Message.normalize_chords(three_note_chord_not_normalized,
                                                       Message.get_chords(three_note_chord_not_normalized))

        assert msgs == three_note_chord_normalized
        assert is_normalized is False

        msgs, is_normalized = Message.normalize_chords(three_note_chord_not_normalized_2,
                                                       Message.get_chords(three_note_chord_not_normalized_2))

        assert msgs == three_note_chord_normalized
        assert is_normalized is False

        msgs, is_normalized = Message.normalize_chords(three_note_chord_not_normalized_3,
                                                       Message.get_chords(three_note_chord_not_normalized_3))

        assert msgs == three_note_chord_normalized
        assert is_normalized is False

        msgs, is_normalized = Message.normalize_chords(three_note_chord_not_normalized_4,
                                                       Message.get_chords(three_note_chord_not_normalized_4))

        assert msgs == three_note_chord_normalized
        assert is_normalized is False

        msgs, is_normalized = Message.normalize_chords(three_note_chord_not_normalized_5,
                                                       Message.get_chords(three_note_chord_not_normalized_5))

        assert msgs == three_note_chord_normalized
        assert is_normalized is False

        chained = chain(three_note_chord_not_normalized_5,
                        shift_times(10, three_note_chord_not_normalized_4),
                        shift_times(20, three_note_chord_not_normalized_3),
                        shift_times(30, no_chords),
                        shift_times(40, four_note_chord_not_normalized)
                        )
        chords = Message.get_chords(chained)
        assert dict(chords) == {0: [1, 2], 6: [7, 8], 12: [13, 14], 24: [25, 26, 27]}

    def test____eq__(self):
        m1 = Message.init(time=1000000000, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m1
        m2 = Message.init(time=1000000000.0, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m2
        m3 = Message.init(time=1000000000.00, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m3
        m4 = Message.init(time=1000000000.000, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m4
        m5 = Message.init(time=1000000000.0000, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m5
        m6 = Message.init(time=1000000000.00000, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m6
        # rounds down
        m7 = Message.init(time=1000000000.000004, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m7
        # rounds up
        m7_2 = Message.init(time=1000000000.000006, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 != m7_2
        m8 = Message.init(time=1000000000.0000009, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m8
        m9 = Message.init(time=1000000000.00000009, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m9

    def test__split_base_to_on_off(self):
        pass
