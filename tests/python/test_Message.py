"""https://docs.pytest.org/en/latest/usage.html#cmdline"""
from typing import *

import pytest
# from classes import Message, Kind
from collections import OrderedDict
from copy import deepcopy
import itertools
from pprint import pprint as pp
from common import message
from common.message import MsgList, Msg, Kind

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


def shift_times(shift: Union[int, float], msgs: MsgList):
    shifted = []
    for m in msgs:
        shifted.append(Msg.from_dict(time=m.time + shift, note=m.note, velocity=m.velocity, kind=m.kind,
                                     preceding_message_time=m.preceding_message_time))
    return MsgList(shifted)


def chain(*lists: MsgList) -> MsgList:
    # //// Assumes chron sorted
    # concatenated = [*lists[0]]
    chained = list(itertools.chain(*lists))
    for i, m in enumerate(chained[1:]):
        m.preceding_message_time = chained[i].time
        m.time_delta = m.time - chained[i].time
    return MsgList(chained)


# def messages_factory(howmany: int, *, starttime: float = 1000000000, timestep: float = 1, kind: Kind = 'on') -> List[
#     Message]:
#     return Message.init_many(*[
#         dict(time=starttime + timestep * x, note=10 + x, velocity=80 if kind == 'on' else 999, kind=kind) for x in
#         range(howmany)
#         ])


# no_chords = chain(*zip(
#     messages_factory(3, timestep=2),
#     messages_factory(3, starttime=1000000001, timestep=2, kind='off')
#     ))

no_chords = MsgList.from_dicts(
    dict(time=1000000000, note=76, velocity=80, kind='on'),
    dict(time=1000000001, note=76, kind='off'),

    dict(time=1000000002, note=77, velocity=80, kind='on'),
    dict(time=1000000003, note=77, kind='off'),

    dict(time=1000000004, note=78, velocity=80, kind='on'),
    dict(time=1000000005, note=78, kind='off'),
    )


class Four:
    normalized: MsgList = MsgList.from_dicts(
        dict(time=1000000000.00000, note=76, velocity=80, kind='on'),
        dict(time=1000000000.04, note=77, velocity=80, kind='on'),
        dict(time=1000000000.08, note=78, velocity=80, kind='on'),
        dict(time=1000000000.12, note=79, velocity=80, kind='on'),

        dict(time=1000000001, note=76, kind='off'),
        dict(time=1000000003, note=77, kind='off'),
        dict(time=1000000005, note=78, kind='off'),  ## Note no matching off for .12 on, still passes
        )
    not_normalized: MsgList = MsgList.from_dicts(
        dict(time=1000000000, note=77, velocity=80, kind='on'),
        dict(time=1000000000.04, note=76, velocity=80, kind='on'),
        dict(time=1000000000.08, note=79, velocity=80, kind='on'),
        dict(time=1000000000.12, note=78, velocity=80, kind='on'),

        dict(time=1000000001, note=76, kind='off'),
        dict(time=1000000003, note=77, kind='off'),
        dict(time=1000000005, note=78, kind='off'),  ## Note no matching off for .12 on, still passes
        )


class Three:
    normalized: MsgList = MsgList.from_dicts(
        dict(time=1000000000.00000, note=76, velocity=80, kind='on'),
        dict(time=1000000000.04, note=77, velocity=80, kind='on'),
        dict(time=1000000000.08, note=78, velocity=80, kind='on'),

        dict(time=1000000001, note=76, kind='off'),
        dict(time=1000000003, note=77, kind='off'),
        dict(time=1000000005, note=78, kind='off'),
        )
    not_normalized: List[MsgList] = [
        MsgList.from_dicts(
            dict(time=1000000000, note=77, velocity=80, kind='on'),
            dict(time=1000000000.04, note=76, velocity=80, kind='on'),
            dict(time=1000000000.08, note=78, velocity=80, kind='on'),

            dict(time=1000000001, note=76, kind='off'),
            dict(time=1000000003, note=77, kind='off'),
            dict(time=1000000005, note=78, kind='off'),
            ),

        MsgList.from_dicts(
            dict(time=1000000000, note=77, velocity=80, kind='on'),
            dict(time=1000000000.04, note=78, velocity=80, kind='on'),
            dict(time=1000000000.08, note=76, velocity=80, kind='on'),

            dict(time=1000000001, note=76, kind='off'),
            dict(time=1000000003, note=77, kind='off'),
            dict(time=1000000005, note=78, kind='off'),
            ),

        MsgList.from_dicts(
            dict(time=1000000000, note=78, velocity=80, kind='on'),
            dict(time=1000000000.04, note=77, velocity=80, kind='on'),
            dict(time=1000000000.08, note=76, velocity=80, kind='on'),

            dict(time=1000000001, note=76, kind='off'),
            dict(time=1000000003, note=77, kind='off'),
            dict(time=1000000005, note=78, kind='off'),
            ),

        MsgList.from_dicts(
            dict(time=1000000000, note=78, velocity=80, kind='on'),
            dict(time=1000000000.04, note=76, velocity=80, kind='on'),
            dict(time=1000000000.08, note=77, velocity=80, kind='on'),

            dict(time=1000000001, note=76, kind='off'),
            dict(time=1000000003, note=77, kind='off'),
            dict(time=1000000005, note=78, kind='off'),
            ),

        MsgList.from_dicts(
            dict(time=1000000000, note=76, velocity=80, kind='on'),
            dict(time=1000000000.04, note=78, velocity=80, kind='on'),
            dict(time=1000000000.08, note=77, velocity=80, kind='on'),

            dict(time=1000000001, note=76, kind='off'),
            dict(time=1000000003, note=77, kind='off'),
            dict(time=1000000005, note=78, kind='off'),
            )
        ]


"""# ***  three
# *  normalized
three_normalized = MsgList.from_dicts(
    dict(time=1000000000.00000, note=76, velocity=80, kind='on'),
    dict(time=1000000000.04, note=77, velocity=80, kind='on'),
    dict(time=1000000000.08, note=78, velocity=80, kind='on'),

    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),
    )
# *  not normalized
three_not_normalized = MsgList.from_dicts(
    dict(time=1000000000, note=77, velocity=80, kind='on'),
    dict(time=1000000000.04, note=76, velocity=80, kind='on'),
    dict(time=1000000000.08, note=78, velocity=80, kind='on'),

    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),
    )
three_not_normalized_2 = MsgList.from_dicts(
    dict(time=1000000000, note=77, velocity=80, kind='on'),
    dict(time=1000000000.04, note=78, velocity=80, kind='on'),
    dict(time=1000000000.08, note=76, velocity=80, kind='on'),

    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),
    )

three_not_normalized_3 = MsgList.from_dicts(
    dict(time=1000000000, note=78, velocity=80, kind='on'),
    dict(time=1000000000.04, note=77, velocity=80, kind='on'),
    dict(time=1000000000.08, note=76, velocity=80, kind='on'),

    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),
    )

three_not_normalized_4 = MsgList.from_dicts(
    dict(time=1000000000, note=78, velocity=80, kind='on'),
    dict(time=1000000000.04, note=76, velocity=80, kind='on'),
    dict(time=1000000000.08, note=77, velocity=80, kind='on'),

    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),
    )

three_not_normalized_5 = MsgList.from_dicts(
    dict(time=1000000000, note=76, velocity=80, kind='on'),
    dict(time=1000000000.04, note=78, velocity=80, kind='on'),
    dict(time=1000000000.08, note=77, velocity=80, kind='on'),

    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),
    )"""


class Two:
    normalized: MsgList = MsgList.from_dicts(
        dict(time=1000000000.00000, note=76, velocity=80, kind='on'),
        dict(time=1000000000.04, note=77, velocity=80, kind='on'),

        dict(time=1000000000.1, note=78, velocity=80, kind='on'),
        dict(time=1000000001, note=76, kind='off'),
        dict(time=1000000003, note=77, kind='off'),
        dict(time=1000000005, note=78, kind='off'),
        )
    not_normalized: MsgList = MsgList.from_dicts(
        dict(time=1000000000, note=77, velocity=80, kind='on'),
        dict(time=1000000000.04, note=76, velocity=80, kind='on'),

        dict(time=1000000000.1, note=78, velocity=80, kind='on'),
        dict(time=1000000001, note=76, kind='off'),
        dict(time=1000000003, note=77, kind='off'),
        dict(time=1000000005, note=78, kind='off'),
        )


"""# ***  two
# *  normalized
two_normalized = MsgList.from_dicts(
    dict(time=1000000000.00000, note=76, velocity=80, kind='on'),
    dict(time=1000000000.04, note=77, velocity=80, kind='on'),

    dict(time=1000000000.1, note=78, velocity=80, kind='on'),
    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),
    )
# *  not-normalized
two_not_normalized = MsgList.from_dicts(
    dict(time=1000000000, note=77, velocity=80, kind='on'),
    dict(time=1000000000.04, note=76, velocity=80, kind='on'),

    dict(time=1000000000.1, note=78, velocity=80, kind='on'),
    dict(time=1000000001, note=76, kind='off'),
    dict(time=1000000003, note=77, kind='off'),
    dict(time=1000000005, note=78, kind='off'),
    )"""


class Legato:
    two_overlap: MsgList = MsgList.from_dicts(
        dict(time=1000000000, note=76, velocity=80, kind='on'),  # ///0
        dict(time=1000000000.04, note=77, velocity=80, kind='on'),  # ///1

        dict(time=1000000000.05, note=76, kind='off'),  # ///2
        dict(time=1000000000.08, note=78, velocity=80, kind='on'),  # ///3

        dict(time=1000000000.09, note=77, kind='off'),  # ///4
        dict(time=1000000001, note=78, kind='off'),  # ///5
        )

    three_overlap: List[MsgList] = [
        MsgList.from_dicts(
            dict(time=1000000000, note=76, velocity=80, kind='on'),  # ///0
            dict(time=1000000000.04, note=77, velocity=80, kind='on'),  # ///1
            dict(time=1000000000.08, note=78, velocity=80, kind='on'),  # ///2

            dict(time=1000000000.09, note=76, kind='off'),  # ///3
            dict(time=1000000000.1, note=79, velocity=80, kind='on'),  # ///4

            dict(time=1000000001, note=77, kind='off'),  # ///5
            dict(time=1000000001.1, note=78, kind='off'),  # ///6
            dict(time=1000000001.2, note=79, kind='off'),  # ///7
            ),

        MsgList.from_dicts(
            dict(time=1000000000, note=76, velocity=80, kind='on'),  # ///0
            dict(time=1000000000.04, note=77, velocity=80, kind='on'),  # ///1
            dict(time=1000000000.08, note=78, velocity=80, kind='on'),  # ///2

            dict(time=1000000000.09, note=77, kind='off'),  # ///3
            dict(time=1000000000.1, note=79, velocity=80, kind='on'),  # ///4

            dict(time=1000000001, note=76, kind='off'),  # ///5
            dict(time=1000000001.1, note=78, kind='off'),  # ///6
            dict(time=1000000001.2, note=79, kind='off'),  # ///7
            ),

        MsgList.from_dicts(
            dict(time=1000000000, note=76, velocity=80, kind='on'),  # ///0
            dict(time=1000000000.04, note=77, velocity=80, kind='on'),  # ///1
            dict(time=1000000000.08, note=78, velocity=80, kind='on'),  # ///2

            dict(time=1000000000.09, note=78, kind='off'),  # ///3
            dict(time=1000000000.1, note=79, velocity=80, kind='on'),  # ///4

            dict(time=1000000001, note=76, kind='off'),  # ///5
            dict(time=1000000001.1, note=77, kind='off'),  # ///6
            dict(time=1000000001.2, note=79, kind='off'),  # ///7
            )
        ]


class TestMessage:

    def test__get_chords__base(self):
        ### Normalized
        # chords = no_chords.get_chords()
        assert not no_chords.get_chords()

        assert dict(Four.normalized.get_chords()) == {0: [1, 2, 3]}
        assert dict(Three.normalized.get_chords()) == {0: [1, 2]}

        assert dict(Two.normalized.get_chords()) == {0: [1]}

        chained = chain(Three.normalized,
                        shift_times(10, no_chords),
                        shift_times(20, Two.normalized))

        assert dict(chained.get_chords()) == {0: [1, 2], 12: [13]}

        ### Non Normalized
        assert dict(Two.not_normalized.get_chords()) == Two.normalized.chords
        for notnorm in Three.not_normalized:
            assert notnorm.get_chords() == Three.normalized.chords

        assert dict(Four.not_normalized.get_chords()) == Four.normalized.chords

        assert dict(Legato.two_overlap.get_chords()) == {0: [1], 1: [3]}
        # assert dict(Message.get_chords(legato_2_overlap)) == {0: [1], 1: [3]}

        assert dict(Legato.three_overlap[0].get_chords()) == {0: [1, 2], 1: [2, 4]}
        assert dict(Legato.three_overlap[1].get_chords()) == {0: [1, 2, 4]}
        assert dict(Legato.three_overlap[2].get_chords()) == {0: [1, 2, 4]}

    def test__get_chords__on(self):
        ### Non Normalized
        not_normalized = [Four.not_normalized,
                          *Three.not_normalized,
                          Two.not_normalized
                          ]
        ## on == base
        for notnorm in not_normalized:
            chords = notnorm.get_chords()
            norm, _ = notnorm.normalize()
            assert norm.get_chords() == chords

    def test__normalize_chords__base(self):
        msgs, is_normalized = no_chords.normalize()
        assert no_chords == msgs
        assert is_normalized

        msgs, is_normalized = Four.normalized.normalize()
        assert Four.normalized.msgs == msgs
        assert is_normalized

        msgs, is_normalized = Two.not_normalized.normalize()

        assert Two.normalized == msgs
        assert is_normalized is False

        for notnorm in Three.not_normalized:
            msgs, is_normalized = notnorm.normalize()
            assert Three.normalized == msgs
            assert is_normalized is False

        chained = chain(Three.not_normalized[4],
                        shift_times(10, Three.not_normalized[3]),
                        shift_times(20, Three.not_normalized[2]),
                        shift_times(30, no_chords),
                        shift_times(40, Four.not_normalized)
                        )
        chords = chained.get_chords()
        assert dict(chords) == {0: [1, 2], 6: [7, 8], 12: [13, 14], 24: [25, 26, 27]}

    def test____eq__(self):
        m1 = Msg.from_dict(time=1000000000, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m1
        m2 = Msg.from_dict(time=1000000000.0, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m2
        m3 = Msg.from_dict(time=1000000000.00, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m3
        m4 = Msg.from_dict(time=1000000000.000, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m4
        m5 = Msg.from_dict(time=1000000000.0000, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m5
        m6 = Msg.from_dict(time=1000000000.00000, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m6
        # rounds down
        m7 = Msg.from_dict(time=1000000000.000004, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m7
        # rounds up
        m7_2 = Msg.from_dict(time=1000000000.000006, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 != m7_2
        m8 = Msg.from_dict(time=1000000000.0000009, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m8
        m9 = Msg.from_dict(time=1000000000.00000009, note=10, velocity=100, kind='on', preceding_message_time=None)
        assert m1 == m9

    def test__split_base_to_on_off(self):
        on_msgs, off_msgs = no_chords.get_on_off_tuple()

        msglist = MsgList.from_dicts(
            dict(time=1000000000, note=76, velocity=80, kind='on', preceding_message_time=None),
            dict(time=1000000002, note=77, velocity=80, kind='on',
                 preceding_message_time=1000000001),
            dict(time=1000000004, note=78, velocity=80, kind='on',
                 preceding_message_time=1000000003))
        assert msglist == on_msgs

        assert MsgList.from_dicts(
            dict(time=1000000001, note=76, kind='off', preceding_message_time=1000000000),
            dict(time=1000000003, note=77, kind='off', preceding_message_time=1000000002),
            dict(time=1000000005, note=78, kind='off', preceding_message_time=1000000004),
            ) == off_msgs

        on_msgs, off_msgs = Four.normalized.get_on_off_tuple()
        assert MsgList.from_dicts(
            dict(time=1000000000.00000, note=76, velocity=80, kind='on', preceding_message_time=None),
            dict(time=1000000000.04, note=77, velocity=80, kind='on', preceding_message_time=1000000000),
            dict(time=1000000000.08, note=78, velocity=80, kind='on', preceding_message_time=1000000000.04),
            dict(time=1000000000.12, note=79, velocity=80, kind='on', preceding_message_time=1000000000.08),
            ) == on_msgs

        assert MsgList.from_dicts(
            dict(time=1000000001, note=76, kind='off', preceding_message_time=1000000000.12),
            dict(time=1000000003, note=77, kind='off', preceding_message_time=1000000001),
            dict(time=1000000005, note=78, kind='off', preceding_message_time=1000000003),
            ) == off_msgs

        # on_msgs, off_msgs = Message.split_base_to_on_off(four_not_normalized)
        on_msgs, off_msgs = Four.not_normalized.get_on_off_tuple()
        assert Four.normalized.get_on_off_tuple() != (on_msgs, off_msgs)

        assert MsgList.from_dicts(
            dict(time=1000000000.00000, note=77, velocity=80, kind='on', preceding_message_time=None),
            dict(time=1000000000.04, note=76, velocity=80, kind='on', preceding_message_time=1000000000),
            dict(time=1000000000.08, note=79, velocity=80, kind='on', preceding_message_time=1000000000.04),
            dict(time=1000000000.12, note=78, velocity=80, kind='on', preceding_message_time=1000000000.08),
            ) == on_msgs

        assert MsgList.from_dicts(
            dict(time=1000000001, note=76, kind='off', preceding_message_time=1000000000.12),
            dict(time=1000000003, note=77, kind='off', preceding_message_time=1000000001),
            dict(time=1000000005, note=78, kind='off', preceding_message_time=1000000003),
            ) == off_msgs

    # def test__normalize_chords__on(self):
    #     on_msgs, off_msgs = Message.split_base_to_on_off(four_not_normalized)
    #     Message.normalize_chords(on_msgs, Message)

    def test__get_on_off_pairs(self):
        # on_msgs, off_msgs = Message.split_base_to_on_off(no_chords)
        on_msgs, off_msgs = no_chords.get_on_off_tuple()
        pairs = message.get_on_off_pairs(on_msgs, off_msgs)
        expected = [(on_msgs[i], off_msgs[i]) for i in range(len(on_msgs))]
        assert pairs == expected

# pytest.main(['-l', '-vv', '-rA'])
