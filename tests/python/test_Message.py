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
import os

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

CWD = os.getcwd()  ## Assumes running from root

"""def shift_times(shift: Union[int, float], msgs: MsgList):
    shifted = []
    for m in msgs:
        msgdict = dict(time=m.time + shift,
                       note=m.note,
                       kind=m.kind)
        if m.kind == 'on':
            msgdict.update(velocity=m.velocity,
                           last_onmsg_time=m.last_onmsg_time + shift if m.last_onmsg_time else None)
        shifted.append(Msg.from_dict(**msgdict))
    return MsgList(shifted)


def chain(*lists: MsgList) -> MsgList:
    # //// Assumes chron sorted
    # concatenated = [*lists[0]]
    chained = list(itertools.chain(*deepcopy(lists)))
    # TODO: this doesnt work
    for m in chained[1:]:
        last_on_msg = next((msg for msg in reversed(chained) if msg.kind == 'on'))
        if last_on_msg:
            m.set_time_delta(last_on_msg.time)
        # m.last_onmsg_time = chained[i].time
        # m.time_delta = m.time - chained[i].time
    return MsgList(chained)"""

no_chords = MsgList.from_dicts(
    dict(time=1000000000, note=76, velocity=80, kind='on'),
    dict(time=1000000001, note=76, kind='off'),

    dict(time=1000000002, note=77, velocity=80, kind='on'),
    dict(time=1000000003, note=77, kind='off'),

    dict(time=1000000004, note=78, velocity=80, kind='on'),
    dict(time=1000000005, note=78, kind='off'),
    )


class Five:
    normalized: MsgList = MsgList.from_dicts(
        dict(time=1000000000.00000, note=76, velocity=80, kind='on'),  ### 0: Chord root
        dict(time=1000000000.04, note=77, velocity=80, kind='on'),  ## 1: member
        dict(time=1000000000.08, note=78, velocity=80, kind='on'),  ## 2: member

        dict(time=1000000001, note=76, kind='off'),
        dict(time=1000000003, note=77, kind='off'),
        dict(time=1000000005, note=78, kind='off'),

        dict(time=1000000010, note=76, velocity=80, kind='on'),
        dict(time=1000000011, note=76, kind='off'),

        dict(time=1000000012, note=77, velocity=80, kind='on'),
        dict(time=1000000013, note=77, kind='off'),

        dict(time=1000000014, note=78, velocity=80, kind='on'),
        dict(time=1000000015, note=78, kind='off'),

        dict(time=1000000020.00000, note=76, velocity=80, kind='on'),  ### 12: Chord root
        dict(time=1000000020.04, note=77, velocity=80, kind='on'),  ## 13: member

        dict(time=1000000020.1, note=78, velocity=80, kind='on'),
        dict(time=1000000021, note=76, kind='off'),
        dict(time=1000000023, note=77, kind='off'),
        dict(time=1000000025, note=78, kind='off'),
        )


class Four:
    normalized: MsgList = MsgList.from_dicts(
        dict(time=1000000000.00000, note=76, velocity=80, kind='on'),
        dict(time=1000000000.04, note=77, velocity=80, kind='on'),
        dict(time=1000000000.08, note=78, velocity=80, kind='on'),
        dict(time=1000000000.12, note=79, velocity=80, kind='on'),

        dict(time=1000000001, note=76, kind='off'),
        dict(time=1000000003, note=77, kind='off'),
        dict(time=1000000005, note=78, kind='off'),
        dict(time=1000000007, note=79, kind='off'),
        )
    not_normalized: MsgList = MsgList.from_dicts(
        dict(time=1000000000, note=77, velocity=80, kind='on'),
        dict(time=1000000000.04, note=76, velocity=80, kind='on'),
        dict(time=1000000000.08, note=79, velocity=80, kind='on'),
        dict(time=1000000000.12, note=78, velocity=80, kind='on'),

        dict(time=1000000001, note=76, kind='off'),
        dict(time=1000000003, note=77, kind='off'),
        dict(time=1000000005, note=78, kind='off'),
        dict(time=1000000007, note=79, kind='off'),
        )


class Three:
    normalized: MsgList = MsgList.from_dicts(
        dict(time=1000000000.00000, note=76, velocity=80, kind='on'),  ### 0: Chord root
        dict(time=1000000000.04, note=77, velocity=80, kind='on'),  ## 1: member
        dict(time=1000000000.08, note=78, velocity=80, kind='on'),  ## 2: member

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


class Two:
    normalized: MsgList = MsgList.from_dicts(
        dict(time=1000000000.00000, note=76, velocity=80, kind='on'),  ### 0: Chord root
        dict(time=1000000000.04, note=77, velocity=80, kind='on'),  ## 1: member

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


"""class TestTestingTools:
    def test__shift_times(self):
        no_chords_C = deepcopy(no_chords)
        shifted = shift_times(10, no_chords)
        assert no_chords_C == no_chords
        assert no_chords_C != shifted
        assert no_chords != shifted
        assert [m.time_delta for m in no_chords] == [m.time_delta for m in shifted]
        assert [m.time + 10 for m in no_chords] == [m.time for m in shifted]
        assert [m.last_onmsg_time + 10 if m.last_onmsg_time else None for m in no_chords] == [m.last_onmsg_time for m in
                                                                                              shifted]

    def test__chain(self):"""


class TestMessage:

    def test__get_chords(self):
        ### Normalized
        assert not no_chords.get_chords()

        assert dict(Four.normalized.get_chords()) == {0: [1, 2, 3]}
        assert dict(Three.normalized.get_chords()) == {0: [1, 2]}

        assert dict(Two.normalized.get_chords()) == {0: [1]}

        assert dict(Five.normalized.get_chords()) == {0: [1, 2], 12: [13]}

        ### Non Normalized
        assert dict(Two.not_normalized.get_chords()) == Two.normalized.chords
        for notnorm in Three.not_normalized:
            assert notnorm.get_chords() == Three.normalized.chords

        assert dict(Four.not_normalized.get_chords()) == Four.normalized.chords

        assert dict(Legato.two_overlap.get_chords()) == {0: [1], 1: [3]}

        assert dict(Legato.three_overlap[0].get_chords()) == {0: [1, 2], 1: [2, 4]}
        assert dict(Legato.three_overlap[1].get_chords()) == {0: [1, 2, 4]}
        assert dict(Legato.three_overlap[2].get_chords()) == {0: [1, 2, 4]}

    def test__normalize_chords(self):
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
            assert Three.normalized[3] == msgs[3]
            assert Three.normalized == msgs
            assert is_normalized is False

        sixteen = MsgList.from_dicts(
            dict(time=1000000000, note=76, velocity=80, kind='on'),
            dict(time=1000000000.04, note=78, velocity=80, kind='on'),
            dict(time=1000000000.08, note=77, velocity=80, kind='on'),

            dict(time=1000000001, note=76, kind='off'),
            dict(time=1000000003, note=77, kind='off'),
            dict(time=1000000005, note=78, kind='off'),

            dict(time=1000000010, note=78, velocity=80, kind='on'),
            dict(time=1000000010.04, note=76, velocity=80, kind='on'),
            dict(time=1000000010.08, note=77, velocity=80, kind='on'),

            dict(time=1000000011, note=76, kind='off'),
            dict(time=1000000013, note=77, kind='off'),
            dict(time=1000000015, note=78, kind='off'),

            dict(time=1000000020, note=78, velocity=80, kind='on'),
            dict(time=1000000020.04, note=77, velocity=80, kind='on'),
            dict(time=1000000020.08, note=76, velocity=80, kind='on'),

            dict(time=1000000021, note=76, kind='off'),
            dict(time=1000000023, note=77, kind='off'),
            dict(time=1000000025, note=78, kind='off'),

            dict(time=1000000030, note=76, velocity=80, kind='on'),
            dict(time=1000000031, note=76, kind='off'),

            dict(time=1000000032, note=77, velocity=80, kind='on'),
            dict(time=1000000033, note=77, kind='off'),

            dict(time=1000000034, note=78, velocity=80, kind='on'),
            dict(time=1000000035, note=78, kind='off'),

            dict(time=1000000040, note=77, velocity=80, kind='on'),
            dict(time=1000000040.04, note=76, velocity=80, kind='on'),
            dict(time=1000000040.08, note=79, velocity=80, kind='on'),
            dict(time=1000000040.12, note=78, velocity=80, kind='on'),

            dict(time=1000000041, note=76, kind='off'),
            dict(time=1000000043, note=77, kind='off'),
            dict(time=1000000045, note=78, kind='off'),
            dict(time=1000000047, note=79, kind='off'),
            )
        # chained = chain(Three.not_normalized[4],
        #                 shift_times(10, Three.not_normalized[3]),
        #                 shift_times(20, Three.not_normalized[2]),
        #                 shift_times(30, no_chords),
        #                 shift_times(40, Four.not_normalized)
        #                 )
        chords = sixteen.get_chords()
        assert dict(chords) == {0: [1, 2], 6: [7, 8], 12: [13, 14], 24: [25, 26, 27]}
        not_normalized = [Four.not_normalized,
                          *Three.not_normalized,
                          Two.not_normalized
                          ]

        for notnorm in not_normalized:
            chords = notnorm.get_chords()
            norm, _ = notnorm.normalize()
            assert norm.get_chords() == chords

    def test____eq__(self):
        m1 = Msg.from_dict(time=1000000000, note=10, velocity=100, kind='on', last_onmsg_time=None)
        assert m1 == m1
        m2 = Msg.from_dict(time=1000000000.0, note=10, velocity=100, kind='on', last_onmsg_time=None)
        assert m1 == m2
        m3 = Msg.from_dict(time=1000000000.00, note=10, velocity=100, kind='on', last_onmsg_time=None)
        assert m1 == m3
        m4 = Msg.from_dict(time=1000000000.000, note=10, velocity=100, kind='on', last_onmsg_time=None)
        assert m1 == m4
        m5 = Msg.from_dict(time=1000000000.0000, note=10, velocity=100, kind='on', last_onmsg_time=None)
        assert m1 == m5
        m6 = Msg.from_dict(time=1000000000.00000, note=10, velocity=100, kind='on', last_onmsg_time=None)
        assert m1 == m6
        # rounds down
        m7 = Msg.from_dict(time=1000000000.000004, note=10, velocity=100, kind='on', last_onmsg_time=None)
        assert m1 == m7
        # rounds up
        m7_2 = Msg.from_dict(time=1000000000.000006, note=10, velocity=100, kind='on', last_onmsg_time=None)
        assert m1 != m7_2
        m8 = Msg.from_dict(time=1000000000.0000009, note=10, velocity=100, kind='on', last_onmsg_time=None)
        assert m1 == m8
        m9 = Msg.from_dict(time=1000000000.00000009, note=10, velocity=100, kind='on', last_onmsg_time=None)
        assert m1 == m9

    def test__split_base_to_on_off(self):
        on_msgs, off_msgs = no_chords.get_on_off_tuple()

        msglist = MsgList.from_dicts(
            dict(time=1000000000, note=76, velocity=80, kind='on', last_onmsg_time=None),
            dict(time=1000000002, note=77, velocity=80, kind='on', last_onmsg_time=1000000000),
            dict(time=1000000004, note=78, velocity=80, kind='on', last_onmsg_time=1000000002))
        assert msglist == on_msgs

        assert MsgList.from_dicts(
            dict(time=1000000001, note=76, kind='off', last_onmsg_time=1000000000),
            dict(time=1000000003, note=77, kind='off', last_onmsg_time=1000000002),
            dict(time=1000000005, note=78, kind='off', last_onmsg_time=1000000004),
            ) == off_msgs

        on_msgs, off_msgs = Four.normalized.get_on_off_tuple()
        assert MsgList.from_dicts(
            dict(time=1000000000.00000, note=76, velocity=80, kind='on', last_onmsg_time=None),
            dict(time=1000000000.04, note=77, velocity=80, kind='on', last_onmsg_time=1000000000),
            dict(time=1000000000.08, note=78, velocity=80, kind='on', last_onmsg_time=1000000000.04),
            dict(time=1000000000.12, note=79, velocity=80, kind='on', last_onmsg_time=1000000000.08),
            ) == on_msgs

        assert MsgList.from_dicts(
            dict(time=1000000001, note=76, kind='off'),
            dict(time=1000000003, note=77, kind='off'),
            dict(time=1000000005, note=78, kind='off'),
            dict(time=1000000007, note=79, kind='off'),
            ) == off_msgs

        # on_msgs, off_msgs = Message.split_base_to_on_off(four_not_normalized)
        on_msgs, off_msgs = Four.not_normalized.get_on_off_tuple()
        assert Four.normalized.get_on_off_tuple() != (on_msgs, off_msgs)

        assert MsgList.from_dicts(
            dict(time=1000000000.00000, note=77, velocity=80, kind='on', last_onmsg_time=None),
            dict(time=1000000000.04, note=76, velocity=80, kind='on', last_onmsg_time=1000000000),
            dict(time=1000000000.08, note=79, velocity=80, kind='on', last_onmsg_time=1000000000.04),
            dict(time=1000000000.12, note=78, velocity=80, kind='on', last_onmsg_time=1000000000.08),
            ) == on_msgs

        assert MsgList.from_dicts(
            dict(time=1000000001, note=76, kind='off'),
            dict(time=1000000003, note=77, kind='off'),
            dict(time=1000000005, note=78, kind='off'),
            dict(time=1000000007, note=79, kind='off'),
            ) == off_msgs

    def test__get_on_off_pairs(self):
        # on_msgs, off_msgs = Message.split_base_to_on_off(no_chords)
        on_msgs, off_msgs = no_chords.get_on_off_tuple()
        pairs = message.get_on_off_pairs(on_msgs, off_msgs)
        expected = [(on_msgs[i], off_msgs[i]) for i in range(len(on_msgs))]
        assert pairs == expected

    def test__from_file(self):
        msgs = MsgList.from_file(os.path.join(CWD, 'tests/python/test_Message_0.txt'))
        msgs.get_chords()
        print(msgs)

    def test__from_file_with_old_format(self):
        pass
# pytest.main(['-l', '-vv', '-rA'])
