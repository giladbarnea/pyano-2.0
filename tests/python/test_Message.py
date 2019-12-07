"""https://docs.pytest.org/en/latest/usage.html#cmdline"""
from typing import *

import pytest
# from classes import Message, Kind
from collections import OrderedDict as OD
from copy import deepcopy
import itertools
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


def build_2_not_normalized() -> MsgList:
    return MsgList.from_dicts(
        dict(time=1000000000, note=77, velocity=80, kind='on'),
        dict(time=1000000000.04, note=76, velocity=80, kind='on'),

        dict(time=1000000000.1, note=78, velocity=80, kind='on'),
        dict(time=1000000001, note=76, kind='off'),
        dict(time=1000000003, note=77, kind='off'),
        dict(time=1000000005, note=78, kind='off'),
        )


def build_2_normalized() -> MsgList:
    return MsgList.from_dicts(
        dict(time=1000000000.00000, note=76, kind='on'),  ### 0: Chord root
        dict(time=1000000000.04, note=77, kind='on'),  ## 1: member (+0.04)

        dict(time=1000000000.1, note=78, kind='on'),  # 2 (+0.06)
        dict(time=1000000001.1, note=76, kind='off'),  # 3 (+1)
        dict(time=1000000003.1, note=77, kind='off'),  # 4 (+2)
        dict(time=1000000005.1, note=78, kind='off'),  # 5 (+2)
        )


def build_16_not_normalized() -> MsgList:
    return MsgList.from_dicts(
        dict(time=1000000000, note=76, kind='on'),  ## 0: Chord root
        dict(time=1000000000.04, note=78, kind='on'),  # 1: member
        dict(time=1000000000.08, note=77, kind='on'),  # 2: member

        dict(time=1000000001, note=76, kind='off'),
        dict(time=1000000003, note=77, kind='off'),
        dict(time=1000000005, note=78, kind='off'),

        dict(time=1000000010, note=78, kind='on'),  ## 6: Chord root
        dict(time=1000000010.04, note=76, kind='on'),  # 7: member
        dict(time=1000000010.08, note=77, kind='on'),  # 8: member

        dict(time=1000000011, note=76, kind='off'),
        dict(time=1000000013, note=77, kind='off'),
        dict(time=1000000015, note=78, kind='off'),

        dict(time=1000000020, note=78, kind='on'),  ## 12: Chord root
        dict(time=1000000020.04, note=77, kind='on'),  # 13: member
        dict(time=1000000020.08, note=76, kind='on'),  # 14: member

        dict(time=1000000021, note=76, kind='off'),
        dict(time=1000000023, note=77, kind='off'),
        dict(time=1000000025, note=78, kind='off'),

        dict(time=1000000030, note=76, kind='on'),
        dict(time=1000000031, note=76, kind='off'),

        dict(time=1000000032, note=77, kind='on'),
        dict(time=1000000033, note=77, kind='off'),

        dict(time=1000000034, note=78, kind='on'),
        dict(time=1000000035, note=78, kind='off'),

        dict(time=1000000040, note=77, kind='on'),  ## 24: Chord root
        dict(time=1000000040.04, note=76, kind='on'),  # 25: member
        dict(time=1000000040.08, note=79, kind='on'),  # 26: member
        dict(time=1000000040.12, note=78, kind='on'),  # 27: member

        dict(time=1000000041, note=76, kind='off'),
        dict(time=1000000043, note=77, kind='off'),
        dict(time=1000000045, note=78, kind='off'),
        dict(time=1000000047, note=79, kind='off'),
        )


def build_16_normalized() -> MsgList:
    return MsgList.from_dicts(
        dict(time=1000000000, note=76, velocity=80, kind='on'),
        dict(time=1000000000.04, note=77, velocity=80, kind='on'),
        dict(time=1000000000.08, note=78, velocity=80, kind='on'),

        dict(time=1000000001, note=76, kind='off'),
        dict(time=1000000003, note=77, kind='off'),
        dict(time=1000000005, note=78, kind='off'),

        dict(time=1000000010, note=76, velocity=80, kind='on'),
        dict(time=1000000010.04, note=77, velocity=80, kind='on'),
        dict(time=1000000010.08, note=78, velocity=80, kind='on'),

        dict(time=1000000011, note=76, kind='off'),
        dict(time=1000000013, note=77, kind='off'),
        dict(time=1000000015, note=78, kind='off'),

        dict(time=1000000020, note=76, velocity=80, kind='on'),
        dict(time=1000000020.04, note=77, velocity=80, kind='on'),
        dict(time=1000000020.08, note=78, velocity=80, kind='on'),

        dict(time=1000000021, note=76, kind='off'),
        dict(time=1000000023, note=77, kind='off'),
        dict(time=1000000025, note=78, kind='off'),

        dict(time=1000000030, note=76, velocity=80, kind='on'),
        dict(time=1000000031, note=76, kind='off'),

        dict(time=1000000032, note=77, velocity=80, kind='on'),
        dict(time=1000000033, note=77, kind='off'),

        dict(time=1000000034, note=78, velocity=80, kind='on'),
        dict(time=1000000035, note=78, kind='off'),

        dict(time=1000000040, note=76, velocity=80, kind='on'),
        dict(time=1000000040.04, note=77, velocity=80, kind='on'),
        dict(time=1000000040.08, note=78, velocity=80, kind='on'),
        dict(time=1000000040.12, note=79, velocity=80, kind='on'),

        dict(time=1000000041, note=76, kind='off'),
        dict(time=1000000043, note=77, kind='off'),
        dict(time=1000000045, note=78, kind='off'),
        dict(time=1000000047, note=79, kind='off'),
        )


def build_no_chords() -> MsgList:
    return MsgList.from_dicts(
        dict(time=1000000000, note=76, velocity=80, kind='on'),
        dict(time=1000000001, note=76, kind='off'),

        dict(time=1000000002, note=77, velocity=80, kind='on'),
        dict(time=1000000003, note=77, kind='off'),

        dict(time=1000000004, note=78, velocity=80, kind='on'),
        dict(time=1000000005, note=78, kind='off'),
        )


def build_5_normalized() -> MsgList:
    return MsgList.from_dicts(
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


def build_4_normalized() -> MsgList:
    return MsgList.from_dicts(
        dict(time=1000000000.00000, note=76, velocity=80, kind='on'),
        dict(time=1000000000.04, note=77, velocity=80, kind='on'),
        dict(time=1000000000.08, note=78, velocity=80, kind='on'),
        dict(time=1000000000.12, note=79, velocity=80, kind='on'),

        dict(time=1000000001, note=76, kind='off'),
        dict(time=1000000003, note=77, kind='off'),
        dict(time=1000000005, note=78, kind='off'),
        dict(time=1000000007, note=79, kind='off'),
        )


def build_4_not_normalized() -> MsgList:
    return MsgList.from_dicts(
        dict(time=1000000000, note=77, velocity=80, kind='on'),
        dict(time=1000000000.04, note=76, velocity=80, kind='on'),
        dict(time=1000000000.08, note=79, velocity=80, kind='on'),
        dict(time=1000000000.12, note=78, velocity=80, kind='on'),

        dict(time=1000000001, note=76, kind='off'),
        dict(time=1000000003, note=77, kind='off'),
        dict(time=1000000005, note=78, kind='off'),
        dict(time=1000000007, note=79, kind='off'),
        )


def build_3_normalized() -> MsgList:
    return MsgList.from_dicts(
        dict(time=1000000000.00000, note=76, velocity=80, kind='on'),  ### 0: Chord root
        dict(time=1000000000.04, note=77, velocity=80, kind='on'),  ## 1: member
        dict(time=1000000000.08, note=78, velocity=80, kind='on'),  ## 2: member

        dict(time=1000000001, note=76, kind='off'),
        dict(time=1000000003, note=77, kind='off'),
        dict(time=1000000005, note=78, kind='off'),
        )


def build_many_3_not_normalized() -> List[MsgList]:
    return [
        MsgList.from_dicts(
            dict(time=1000000000, note=77, velocity=80, kind='on'),
            dict(time=1000000000.04, note=76, velocity=80, kind='on'),
            dict(time=1000000000.08, note=78, velocity=80, kind='on'),

            dict(time=1000000001, note=76, kind='off'),
            dict(time=1000000001, note=77, kind='off'),
            dict(time=1000000001, note=78, kind='off'),
            ),

        MsgList.from_dicts(
            dict(time=1000000002, note=77, velocity=80, kind='on'),
            dict(time=1000000002.04, note=78, velocity=80, kind='on'),
            dict(time=1000000002.08, note=76, velocity=80, kind='on'),

            dict(time=1000000003, note=76, kind='off'),
            dict(time=1000000003, note=77, kind='off'),
            dict(time=1000000003, note=78, kind='off'),
            ),

        MsgList.from_dicts(
            dict(time=1000000004, note=78, velocity=80, kind='on'),
            dict(time=1000000004.04, note=77, velocity=80, kind='on'),
            dict(time=1000000004.08, note=76, velocity=80, kind='on'),

            dict(time=1000000005, note=76, kind='off'),
            dict(time=1000000005, note=77, kind='off'),
            dict(time=1000000005, note=78, kind='off'),
            ),

        MsgList.from_dicts(
            dict(time=1000000006, note=78, velocity=80, kind='on'),
            dict(time=1000000006.04, note=76, velocity=80, kind='on'),
            dict(time=1000000006.08, note=77, velocity=80, kind='on'),

            dict(time=1000000007, note=76, kind='off'),
            dict(time=1000000007, note=77, kind='off'),
            dict(time=1000000007, note=78, kind='off'),
            ),

        MsgList.from_dicts(
            dict(time=1000000008, note=76, velocity=80, kind='on'),
            dict(time=1000000008.04, note=78, velocity=80, kind='on'),
            dict(time=1000000008.08, note=77, velocity=80, kind='on'),

            dict(time=1000000009, note=76, kind='off'),
            dict(time=1000000009, note=77, kind='off'),
            dict(time=1000000009, note=78, kind='off'),
            )
        ]


def build_legato_2_overlap() -> MsgList:
    return MsgList.from_dicts(  # {0: [1], 1: [3]}
        dict(time=1000000000, note=76, kind='on'),  ### 0: root
        dict(time=1000000000.04, note=77, kind='on'),  ### 1: member of 0, root

        dict(time=1000000000.06, note=76, kind='off'),  # 2: offs 0
        dict(time=1000000000.08, note=78, kind='on'),  ## 3: member  of 1

        dict(time=1000000000.09, note=77, kind='off'),  # 4: offs 1
        dict(time=1000000001, note=78, kind='off'),
        )


def build_chord_while_holding() -> MsgList:
    return MsgList.from_dicts(  # {1: [2]}
        dict(time=1000000000, note=76, kind='on'),
        dict(time=1000000001, note=77, kind='on'),  ### 1: root

        dict(time=1000000001.04, note=78, kind='on'),  ## 2: member of 1
        dict(time=1000000002, note=77, kind='off'),  # 3: offs 1

        dict(time=1000000002, note=76, kind='off'),
        dict(time=1000000002, note=78, kind='off'),
        )


def build_legato_while_holding() -> MsgList:
    return MsgList.from_dicts(  # {1: [2]}
        dict(time=1000000000, note=76, kind='on'),
        dict(time=1000000001, note=77, kind='on'),  ### 1: root

        dict(time=1000000001.04, note=78, kind='on'),  ## 2: member of 1
        dict(time=1000000001.05, note=77, kind='off'),  # 3: offs 1

        dict(time=1000000001.05, note=76, kind='off'),
        dict(time=1000000001.05, note=78, kind='off'),
        )


def build_legato_while_holding_B() -> MsgList:
    return MsgList.from_dicts(  # {1: [2], 2: [4]}
        dict(time=1000000000, note=75, kind='on'),
        dict(time=1000000001, note=76, kind='on'),  ### 1: root
        dict(time=1000000001.05, note=77, kind='on'),  ### 2: member of 0, root

        dict(time=1000000001.09, note=76, kind='off'),  # 3: offs 1
        dict(time=1000000001.1, note=78, kind='on'),  ## 4: member  of 2

        dict(time=1000000001.15, note=77, kind='off'),  # 5: offs 2
        dict(time=1000000002, note=78, kind='off'),
        dict(time=1000000002, note=75, kind='off'),
        )


def build_many_legato_3_overlap() -> List[MsgList]:
    return [
        MsgList.from_dicts(  # {0: [1, 2], 1: [2, 4]}
            dict(time=1000000000, note=76, kind='on'),  ### 0: root
            dict(time=1000000000.04, note=77, kind='on'),  ### 1: member of 0, root
            dict(time=1000000000.08, note=78, kind='on'),  ## 2: member of 0, member of 1

            dict(time=1000000000.09, note=76, kind='off'),  # 3: offs 1
            dict(time=1000000000.1, note=79, kind='on'),  ## 4: member of 1

            dict(time=1000000001, note=77, kind='off'),  # 5: offs 1
            dict(time=1000000001.1, note=78, kind='off'),
            dict(time=1000000001.2, note=79, kind='off'),
            ),

        MsgList.from_dicts(  # {0: [1, 2, 4]}
            dict(time=1000000000, note=76, kind='on'),  ### 0: root
            dict(time=1000000000.04, note=77, kind='on'),  ## 1: member of 0
            dict(time=1000000000.08, note=78, kind='on'),  ## 2: member of 0

            dict(time=1000000000.09, note=77, kind='off'),  # 3: offs 1
            dict(time=1000000000.1, note=79, kind='on'),  ## 4: member of 0

            dict(time=1000000001, note=76, kind='off'),
            dict(time=1000000001.1, note=78, kind='off'),
            dict(time=1000000001.2, note=79, kind='off'),
            ),

        MsgList.from_dicts(  # {0: [1, 2, 4]}
            dict(time=1000000000, note=76, kind='on'),  ### 0: root
            dict(time=1000000000.04, note=77, kind='on'),  ## 1: member of 0
            dict(time=1000000000.08, note=78, kind='on'),  ## 2: member of 0

            dict(time=1000000000.09, note=78, kind='off'),  # 3: offs 2
            dict(time=1000000000.1, note=79, kind='on'),  ## 4: member of 0

            dict(time=1000000001, note=76, kind='off'),
            dict(time=1000000001.1, note=77, kind='off'),
            dict(time=1000000001.2, note=79, kind='off'),
            )
        ]


no_chords = build_no_chords()


class Five:
    normalized: MsgList = build_5_normalized()


class Four:
    normalized: MsgList = build_4_normalized()
    not_normalized: MsgList = build_4_not_normalized()


class Three:
    normalized: MsgList = build_3_normalized()
    not_normalized: List[MsgList] = build_many_3_not_normalized()


class Two:
    normalized: MsgList = build_2_normalized()
    not_normalized: MsgList = build_2_not_normalized()


class Legato:
    two_overlap: MsgList = build_legato_2_overlap()

    three_overlap: List[MsgList] = build_many_legato_3_overlap()


def every_not_normalized() -> List[MsgList]:
    return [
        *build_many_3_not_normalized(),
        build_4_not_normalized(),
        build_2_not_normalized(),
        ]


def every_normalized() -> List[MsgList]:
    return [
        build_no_chords(),
        build_5_normalized(),
        build_4_normalized(),
        build_3_normalized(),
        build_2_normalized()
        ]


not_normalized = every_not_normalized()
normalized = every_normalized()


class TestMessage:

    @staticmethod
    def assert_normalized(norm: MsgList):
        assert norm._normalized is None
        normalized_output = norm.normalized
        ## Already normalized MsgList returns self when normalized is called, _normalized isnt ever set
        assert norm._normalized is None
        assert norm == normalized_output
        assert norm.msgs == normalized_output
        assert norm.msgs == norm.normalized
        assert norm.normalized == normalized_output
        assert norm.normalized == norm

    @staticmethod
    def assert_not_normalized(notnorm: MsgList):
        assert notnorm._is_self_normalized is False
        assert notnorm._normalized is None
        normalized_output = notnorm.normalized
        assert notnorm._is_self_normalized is False
        assert notnorm._normalized is not None
        assert notnorm._normalized._normalized is None
        assert notnorm._normalized._is_self_normalized is True
        assert notnorm != normalized_output
        assert notnorm.msgs != normalized_output
        assert notnorm.msgs != notnorm.normalized
        assert notnorm.normalized == normalized_output
        assert notnorm.normalized != notnorm

    def test__chords(self):
        ### Normalized
        assert no_chords.chords == OD()
        assert not no_chords.chords

        assert dict(Four.normalized.chords) == {0: [1, 2, 3]}
        assert dict(Three.normalized.chords) == {0: [1, 2]}

        assert dict(Two.normalized.chords) == {0: [1]}

        assert dict(Five.normalized.chords) == {0: [1, 2], 12: [13]}

        ### Not Normalized
        assert dict(Two.not_normalized.chords) == Two.normalized.chords
        for notnorm in Three.not_normalized:
            assert notnorm.chords == Three.normalized.chords

        assert dict(Four.not_normalized.chords) == Four.normalized.chords

        assert dict(Legato.two_overlap.chords) == {0: [1], 1: [3]}

        assert dict(Legato.three_overlap[0].chords) == {0: [1, 2], 1: [2, 4]}
        assert dict(Legato.three_overlap[1].chords) == {0: [1, 2, 4]}
        assert dict(Legato.three_overlap[2].chords) == {0: [1, 2, 4]}

        chord_while_holding = build_chord_while_holding()
        assert dict(chord_while_holding.chords) == {1: [2]}

        legato_while_holding = build_legato_while_holding()
        assert dict(legato_while_holding.chords) == {1: [2]}

        legato_while_holding_B = build_legato_while_holding_B()
        assert dict(legato_while_holding_B.chords) == {1: [2], 2: [4]}

    def test____eq__(self):
        # TODO: right now if both _is_self_normalized, fn compares .normalized. should compare self
        ### Time decimals
        m1 = Msg.from_dict(time=1000000000, note=10, velocity=100, kind='on', )
        assert m1 == m1
        m2 = Msg.from_dict(time=1000000000.0, note=10, velocity=100, kind='on', )
        assert m1 == m2
        m3 = Msg.from_dict(time=1000000000.00, note=10, velocity=100, kind='on', )
        assert m1 == m3
        m4 = Msg.from_dict(time=1000000000.000, note=10, velocity=100, kind='on', )
        assert m1 == m4
        m5 = Msg.from_dict(time=1000000000.0000, note=10, velocity=100, kind='on', )
        assert m1 == m5
        m6 = Msg.from_dict(time=1000000000.00000, note=10, velocity=100, kind='on', )
        assert m1 == m6
        # rounds down
        m7 = Msg.from_dict(time=1000000000.000004, note=10, velocity=100, kind='on', )
        assert m1 == m7
        # rounds up
        m7_2 = Msg.from_dict(time=1000000000.000006, note=10, velocity=100, kind='on', )
        assert m1 != m7_2
        m8 = Msg.from_dict(time=1000000000.0000009, note=10, velocity=100, kind='on', )
        assert m1 == m8
        m9 = Msg.from_dict(time=1000000000.00000009, note=10, velocity=100, kind='on', )
        assert m1 == m9

    def test__normalize(self):
        for i, norm in enumerate(every_normalized()):
            TestMessage.assert_normalized(norm)

        for i, notnorm in enumerate(every_not_normalized()):
            TestMessage.assert_not_normalized(notnorm)

        sixteen_not_normalized = build_16_not_normalized()

        sixteen_normalized = build_16_normalized()

        assert dict(sixteen_not_normalized.chords) == {0: [1, 2], 6: [7, 8], 12: [13, 14], 24: [25, 26, 27]}
        assert dict(sixteen_normalized.chords) == {0: [1, 2], 6: [7, 8], 12: [13, 14], 24: [25, 26, 27]}
        assert sixteen_normalized.chords == sixteen_not_normalized.chords
        TestMessage.assert_not_normalized(sixteen_not_normalized)
        TestMessage.assert_normalized(sixteen_not_normalized.normalized)
        TestMessage.assert_normalized(sixteen_normalized)

        for notnorm in not_normalized:
            chords = notnorm.chords
            norm = notnorm.normalized
            assert norm.chords == chords

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
            assert dict(file.chords) == {16: [17]}
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
        try:
            ## Assuming cwd is root
            os.mkdir('./tests/python/tmp')
        except FileExistsError:
            pass
        ### Normalized
        three_normalized = build_3_normalized()
        three_normalized.to_file('./tests/python/tmp/three_normalized.txt', overwrite=True)
        with pytest.raises(FileExistsError):
            three_normalized.to_file('./tests/python/tmp/three_normalized.txt', overwrite=False)
            three_normalized.to_file('./tests/python/tmp/three_normalized.txt')

        msglist = MsgList.from_file('./tests/python/tmp/three_normalized.txt')
        assert msglist == three_normalized
        assert msglist._is_self_normalized is False
        assert msglist._normalized is None
        _ = msglist.normalized
        _ = three_normalized.normalized
        assert id(three_normalized) == id(three_normalized.normalized)
        assert id(msglist) == id(msglist.normalized)
        assert msglist._is_self_normalized is True
        assert msglist._normalized is None
        assert three_normalized._is_self_normalized is True
        assert msglist == three_normalized
        assert msglist.normalized == three_normalized
        assert msglist.normalized == three_normalized.normalized

        ### Not Normalized
        many_three_not_normalized = build_many_3_not_normalized()
        many_not_normalized = MsgList.from_dicts(
            *list(itertools.chain(*[ml.to_dict() for ml in many_three_not_normalized])))
        many_not_normalized.to_file('./tests/python/tmp/many_not_normalized.txt', overwrite=True)
        with pytest.raises(FileExistsError):
            many_not_normalized.to_file('./tests/python/tmp/many_not_normalized.txt', overwrite=False)
            many_not_normalized.to_file('./tests/python/tmp/many_not_normalized.txt')

        msglist = MsgList.from_file('./tests/python/tmp/many_not_normalized.txt')
        assert msglist == many_not_normalized
        assert msglist._is_self_normalized is False
        assert msglist._normalized is None
        _ = msglist.normalized
        _ = many_not_normalized.normalized
        assert id(many_not_normalized) != id(many_not_normalized.normalized)
        assert id(msglist) != id(msglist.normalized)
        assert msglist._is_self_normalized is False
        assert msglist._normalized is not None
        assert many_not_normalized._is_self_normalized is False
        assert msglist == many_not_normalized
        assert msglist.normalized != many_not_normalized
        assert msglist.normalized == many_not_normalized.normalized
        os.system('rm -rf ./tests/python/tmp')

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

    def test____getitem__(self):
        # TODO: slices, transfer cached props etc, if super is normalized then sub is also
        ### Normalized
        sliced_no_chords = no_chords[:1]
        assert isinstance(sliced_no_chords, MsgList)
        assert sliced_no_chords.normalized == no_chords.normalized[:1]
        assert sliced_no_chords._normalized is None
        assert sliced_no_chords._is_self_normalized is True
        assert sliced_no_chords.msgs == no_chords.msgs[:1]
        assert sliced_no_chords == no_chords.msgs[:1]
        assert sliced_no_chords == no_chords[:1]
        assert sliced_no_chords.chords == OD()

        sixteen_normalized = build_16_normalized()
        sliced_16_normalized = sixteen_normalized[:]
        assert sliced_16_normalized == sixteen_normalized
        assert sliced_16_normalized.chords == sixteen_normalized.chords
        assert sliced_16_normalized._normalized is None
        assert sliced_16_normalized._is_self_normalized is False
        # assert sliced_16_normalized.normalized == sixteen_normalized
        assert sliced_16_normalized.normalized == sixteen_normalized.normalized

        ### Not normalized
        ## normalized slice
        ## not normalized slice

        ### Slice in the middle

    def test__get_relative_tempo(self):
        pass

    def test__create_tempo_shifted(self):
        # msglist = MsgList.from_file('./tests/python/test_fur_elise_10_normalized.txt')
        # half_tempo = msglist.create_tempo_shifted(0.5)
        # assert len(half_tempo) == len(msglist)
        # half_tempo.to_file('./tests/python/test__fur_elise_10_normalized_half_tempo.txt', overwrite=True)
        two_normalized = build_2_normalized()
        same_tempo = two_normalized.create_tempo_shifted(1)
        assert len(same_tempo) == len(two_normalized)
        assert same_tempo == two_normalized
        assert same_tempo.normalized == two_normalized.normalized
        assert same_tempo.chords == two_normalized.chords

        two_normalized_half_tempo = two_normalized.create_tempo_shifted(0.5)
        assert len(two_normalized_half_tempo) == len(two_normalized)
        assert two_normalized_half_tempo.chords == two_normalized.chords
        assert two_normalized_half_tempo == MsgList.from_dicts(

            dict(time=1000000000.00000, note=76, velocity=80, kind='on'),  ### 0: Chord root
            dict(time=1000000000.05, note=77, velocity=80, kind='on'),  ## 1: member. capped (+0.08 => 0.05)

            dict(time=1000000000.17, note=78, velocity=80, kind='on'),  # 2 (+0.06 => 0.12)
            dict(time=1000000002.17, note=76, kind='off'),  # 3 (+1 => +2)
            dict(time=1000000006.17, note=77, kind='off'),  # 4 (+2 => +4)
            dict(time=1000000010.17, note=78, kind='off'),  # 5 (+2 => +4)
            )

    @pytest.mark.skip
    def test__create_tempo_shifted_legato(self):
        legato_2 = build_legato_2_overlap()
        legato_2_half_tempo = legato_2.create_tempo_shifted(0.5)
        assert legato_2_half_tempo == MsgList.from_dicts(
            dict(time=1000000000, note=76, velocity=80, kind='on'),  ### 0: root
            dict(time=1000000000.05, note=77, velocity=80, kind='on'),  ### 1: member of 0, root. capped

            dict(time=1000000000.1, note=76, kind='off'),  # 2: offs 0. capped by next on
            dict(time=1000000000.1, note=78, velocity=80, kind='on'),  ## 3: member  of 1. capped

            dict(time=1000000000.12, note=77, kind='off'),  # 4: offs 1
            dict(time=1000000001.94, note=78, kind='off'),
            )
        legato_while_holding = build_legato_while_holding()
        legato_while_holding_half_tempo = legato_while_holding.create_tempo_shifted(0.5)
        assert legato_while_holding_half_tempo == MsgList.from_dicts(  # {1: [2]}

            dict(time=1000000000, note=76, kind='on'),
            dict(time=1000000002, note=77, kind='on'),  ### 1: root

            dict(time=1000000002.05, note=78, kind='on'),  ## 2: member of 1. capped
            dict(time=1000000002.07, note=77, kind='off'),  # 3: offs 1

            dict(time=1000000002.07, note=76, kind='off'),
            dict(time=1000000002.07, note=78, kind='off'),
            )

        legato_while_holding_B = build_legato_while_holding_B()
        legato_while_holding_B_half_tempo = legato_while_holding_B.create_tempo_shifted(0.5)
        assert legato_while_holding_B_half_tempo == MsgList.from_dicts(  # {1: [2], 2: [4]}
            dict(time=1000000000, note=75, kind='on'),
            dict(time=1000000002, note=76, kind='on'),  ### 1: root
            dict(time=1000000002.05, note=77, kind='on'),  ### 2: member of 0, root

            dict(time=1000000002.1, note=76, kind='off'),  # 3: offs 1. supposed to be 2.13 (2.05 + 2*0.04) but capped
            dict(time=1000000002.1, note=78, kind='on'),  ## 4: member  of 2. capped

            dict(time=1000000002.2, note=77, kind='off'),  # 5: offs 2
            dict(time=1000000003.9, note=78, kind='off'),
            dict(time=1000000003.9, note=75, kind='off'),
            )

# pytest.main()
