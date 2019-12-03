"""https://docs.pytest.org/en/latest/usage.html#cmdline"""
from typing import *

import pytest
# from classes import Message, Kind
from collections import OrderedDict as OD
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

        dict(time=1000000002, note=76, kind='off'),  # 3
        dict(time=1000000003, note=77, kind='off'),  # 4
        dict(time=1000000005, note=78, kind='off'),  # 5

        dict(time=1000000010, note=76, velocity=80, kind='on'),  # 6
        dict(time=1000000011, note=76, kind='off'),  # 7

        dict(time=1000000012, note=77, velocity=80, kind='on'),  # 8
        dict(time=1000000013, note=77, kind='off'),  # 9

        dict(time=1000000014, note=78, velocity=80, kind='on'),  # 10
        dict(time=1000000015, note=78, kind='off'),  # 11

        dict(time=1000000020.00000, note=76, velocity=80, kind='on'),  ### 12: Chord root
        dict(time=1000000020.04, note=77, velocity=80, kind='on'),  ## 13: member

        dict(time=1000000020.1, note=78, velocity=80, kind='on'),  # 14
        dict(time=1000000021, note=76, kind='off'),  # 15
        dict(time=1000000023, note=77, kind='off'),  # 16
        dict(time=1000000025, note=78, kind='off'),  # 17
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


not_normalized = [Four.not_normalized,
                  *Three.not_normalized,
                  Two.not_normalized,
                  ]
normalized = [no_chords,
              Five.normalized,
              Four.normalized,
              Three.normalized,
              Two.normalized,

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
        assert no_chords.chords is None
        assert no_chords.get_chords() == OD()
        assert no_chords.chords == OD()
        assert not no_chords.chords
        assert not no_chords.get_chords()

        assert dict(Four.normalized.get_chords()) == {0: [1, 2, 3]}
        assert dict(Three.normalized.get_chords()) == {0: [1, 2]}

        assert dict(Two.normalized.get_chords()) == {0: [1]}

        assert dict(Five.normalized.get_chords()) == {0: [1, 2], 12: [13]}

        ### Not Normalized
        assert dict(Two.not_normalized.get_chords()) == Two.normalized.chords
        for notnorm in Three.not_normalized:
            assert notnorm.get_chords() == Three.normalized.chords

        assert dict(Four.not_normalized.get_chords()) == Four.normalized.chords

        assert dict(Legato.two_overlap.get_chords()) == {0: [1], 1: [3]}

        assert dict(Legato.three_overlap[0].get_chords()) == {0: [1, 2], 1: [2, 4]}
        assert dict(Legato.three_overlap[1].get_chords()) == {0: [1, 2, 4]}
        assert dict(Legato.three_overlap[2].get_chords()) == {0: [1, 2, 4]}

    @staticmethod
    def assert_normalized(norm: MsgList):
        assert norm._normalized is None
        msgs = norm.normalized
        assert norm._normalized is not None
        assert norm == msgs
        assert norm.msgs == msgs
        assert norm.msgs == norm.normalized
        assert norm.normalized == msgs
        assert norm.normalized == norm

    @staticmethod
    def assert_not_normalized(notnorm: MsgList):
        assert notnorm._normalized is None
        msgs = notnorm.normalized
        assert notnorm._normalized is not None
        assert notnorm != msgs
        assert notnorm.msgs != msgs
        assert notnorm.msgs != notnorm.normalized
        assert notnorm.normalized == msgs
        assert notnorm.normalized != notnorm

    def test__normalize(self):
        for norm in normalized:
            TestMessage.assert_normalized(norm)

        for notnorm in not_normalized:
            TestMessage.assert_not_normalized(notnorm)

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

        chords = sixteen.get_chords()
        assert dict(chords) == {0: [1, 2], 6: [7, 8], 12: [13, 14], 24: [25, 26, 27]}

        for notnorm in not_normalized:
            chords = notnorm.get_chords()
            norm = notnorm.normalized
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

    def test__split_to_on_off(self):
        ### Normalized
        on_msgs, off_msgs = no_chords.split_to_on_off()

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

        on_msgs, off_msgs = Four.normalized.split_to_on_off()
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

        ### Not Normalized
        on_msgs, off_msgs = Four.not_normalized.split_to_on_off()
        assert Four.normalized.split_to_on_off() != (on_msgs, off_msgs)

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
        for norm in normalized:
            norm_C = deepcopy(norm)
            pairs = norm.get_on_off_pairs()
            assert norm_C == norm
            for i, (on, off) in enumerate(pairs):
                assert on.kind == 'on'
                assert off.kind == 'off'
                assert on.time < off.time
                assert on.note == off.note

                for j_on, j_off in pairs[i:]:
                    assert on.time <= j_on.time
                    assert off.time <= j_off.time

                for j_on, j_off in pairs[:i]:
                    assert on.time >= j_on.time
                    assert off.time >= j_off.time

            flat = list(itertools.chain(*pairs))
            flatset = list(dict.fromkeys(flat))
            assert flatset == flat
            assert len(flat) == len(norm.msgs)

        for notnorm in not_normalized:
            pairs = notnorm.get_on_off_pairs()

            flat = list(itertools.chain(*pairs))
            flatset = list(dict.fromkeys(flat))
            assert flatset == flat
            assert len(flat) == len(notnorm.msgs)

        assert Four.not_normalized.get_on_off_pairs() != Four.normalized.get_on_off_pairs()
        assert Two.not_normalized.get_on_off_pairs() != Two.normalized.get_on_off_pairs()
        for notnorm in Three.not_normalized:
            assert notnorm.get_on_off_pairs() != Three.normalized

        pairs = Five.normalized.get_on_off_pairs()
        pairs_by_index = [(0, 3), (1, 4), (2, 5), (6, 7), (8, 9), (10, 11), (12, 15), (13, 16), (14, 17)]
        for i, p in enumerate(pairs):
            x, y = pairs_by_index[i]
            assert p == (Five.normalized[x], Five.normalized[y])

    def test__from_file(self):
        fur_elise_10_normalized = MsgList.from_file(os.path.join(CWD, 'tests/python/test_fur_elise_10_normalized.txt'))
        fur_elise_10_normalized_missing_final_off = MsgList.from_file(
            os.path.join(CWD, 'tests/python/test_fur_elise_10_normalized_missing_final_off.txt'))

        for file in [fur_elise_10_normalized,
                     fur_elise_10_normalized_missing_final_off]:
            assert file.chords is None
            assert dict(file.get_chords()) == {16: [17]}
            assert file.chords is not None

            TestMessage.assert_normalized(file)

        pairs = fur_elise_10_normalized.get_on_off_pairs()
        pairs_missing_last = fur_elise_10_normalized_missing_final_off.get_on_off_pairs()
        assert pairs != pairs_missing_last  # (on, off) (on, None)
        assert pairs[:-1] == pairs_missing_last[:-1]
        # including the on of last tuple:
        assert list(itertools.chain(*pairs))[:-1] == list(itertools.chain(*pairs_missing_last))[:-1]
        assert pairs_missing_last[-1][1] is None
        assert pairs[-1][1] is not None
        assert pairs[-1][0] == pairs_missing_last[-1][0]

    def test__to_file(self):
        pass

    def test__to_dict(self):
        pass

    def test__to_line(self):
        def _last_on_msg(_curr_index: int) -> Msg:
            for _j in reversed(range(_curr_index)):
                if new_msgs[_j].kind == 'on':
                    return new_msgs[_j]

        for norm in normalized:
            new_msgs = []
            for i, m in enumerate(norm):
                line = m.to_line()
                newm = Msg(line)

                new_msgs.append(newm)
                assert len(str(round(newm.time, 5))) == len(str(newm.time))
                if newm.time_delta is not None:
                    assert len(str(round(newm.time_delta, 5))) == len(str(newm.time_delta))
                if newm.kind == 'on' and new_msgs:
                    last_on_msg = _last_on_msg(i)
                    newm.set_time_delta(last_on_msg.time if last_on_msg else None)
                    assert newm == m

# pytest.main(['-l', '-vv', '-rA'])
