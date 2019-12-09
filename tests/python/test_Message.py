"""https://docs.pytest.org/en/latest/usage.html#cmdline"""
from typing import *
from pprint import pprint
import pytest
# from classes import Message, Kind
from collections import OrderedDict as OD
from copy import deepcopy
import itertools
from common.message import MsgList, Msg
import os
from random import randrange
from birdseye import eye
import math

from tests.python import util as tutil

CWD = os.getcwd()  ## Assumes running from root

no_chords = tutil.build_no_chords()

not_normalized = tutil.every_not_normalized()
normalized = tutil.every_normalized()


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
        for m in norm:
            if m.kind == 'off':
                assert m.last_onmsg_time is None

        for m in norm.normalized:
            if m.kind == 'off':
                assert m.last_onmsg_time is None

        ons, _ = norm.split_to_on_off()
        for i, o in enumerate(ons[:-1]):
            assert ons[i + 1].last_onmsg_time == o.time

        ons, _ = norm.normalized.split_to_on_off()
        for i, o in enumerate(ons[:-1]):
            assert ons[i + 1].last_onmsg_time == o.time

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

        assert dict(tutil.build_4_normalized().chords) == {0: [1, 2, 3]}
        assert dict(tutil.build_3_normalized().chords) == {0: [1, 2]}

        assert dict(tutil.Two.normalized.chords) == {0: [1]}

        assert dict(tutil.Five.normalized.chords) == {0: [1, 2], 12: [13]}

        ### Not Normalized
        assert dict(tutil.Two.not_normalized.chords) == tutil.Two.normalized.chords
        for notnorm in tutil.Three.not_normalized:
            assert notnorm.chords == tutil.Three.normalized.chords

        assert dict(tutil.Four.not_normalized.chords) == tutil.Four.normalized.chords

        assert dict(tutil.Legato.two_overlap.chords) == {0: [1], 1: [3]}

        assert dict(tutil.Legato.three_overlap[0].chords) == {0: [1, 2], 1: [2, 4]}
        assert dict(tutil.Legato.three_overlap[1].chords) == {0: [1, 2, 4]}
        assert dict(tutil.Legato.three_overlap[2].chords) == {0: [1, 2, 4]}

        chord_while_holding = tutil.build_chord_while_holding()
        assert dict(chord_while_holding.chords) == {1: [2]}

        legato_while_holding = tutil.build_legato_while_holding()
        assert dict(legato_while_holding.chords) == {1: [2]}

        legato_while_holding_B = tutil.build_legato_while_holding_B()
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

    def test__normalized(self):
        for i, norm in enumerate(tutil.every_normalized()):
            TestMessage.assert_normalized(norm)

        for i, notnorm in enumerate(tutil.every_not_normalized()):
            TestMessage.assert_not_normalized(notnorm)

        sixteen_not_normalized = tutil.build_16_not_normalized()

        sixteen_normalized = tutil.build_16_normalized()

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

        _no_chords = tutil.build_no_chords()
        assert _no_chords[0].last_onmsg_time is None
        assert _no_chords[1].last_onmsg_time is None
        assert _no_chords[2].last_onmsg_time == 1000000000
        assert _no_chords[3].last_onmsg_time is None
        assert _no_chords[4].last_onmsg_time == 1000000002
        assert _no_chords[5].last_onmsg_time is None

        fur_elise = tutil.build_fur_10_normalized()
        assert fur_elise.normalized == fur_elise

        ons, _ = fur_elise.split_to_on_off()

        for i, on in enumerate(ons[1:], 1):
            assert on.last_onmsg_time == ons[i - 1].time

        ons, _ = fur_elise.normalized.split_to_on_off()

        for i, on in enumerate(ons[1:], 1):
            assert on.last_onmsg_time == ons[i - 1].time

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

        sixteen_normalized = tutil.build_16_normalized()
        sliced_16_normalized = sixteen_normalized[:]
        assert sliced_16_normalized == sixteen_normalized
        assert sliced_16_normalized.chords == sixteen_normalized.chords
        assert sliced_16_normalized._normalized is None
        assert sliced_16_normalized._is_self_normalized is False
        assert sliced_16_normalized.normalized == sixteen_normalized.normalized

        ### Not normalized
        ## normalized slice
        ## not normalized slice

        ### Slice in the middle

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

        on_msgs, off_msgs = tutil.Four.normalized.split_to_on_off()
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
        on_msgs, off_msgs = tutil.Four.not_normalized.split_to_on_off()
        assert tutil.Four.normalized.split_to_on_off() != (on_msgs, off_msgs)

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

        assert tutil.Four.not_normalized.get_on_off_pairs() != tutil.Four.normalized.get_on_off_pairs()
        assert tutil.Two.not_normalized.get_on_off_pairs() != tutil.Two.normalized.get_on_off_pairs()
        for notnorm in tutil.Three.not_normalized:
            assert notnorm.get_on_off_pairs() != tutil.Three.normalized

        pairs = tutil.Five.normalized.get_on_off_pairs()
        pairs_by_index = [(0, 3), (1, 4), (2, 5), (6, 7), (8, 9), (10, 11), (12, 15), (13, 16), (14, 17)]
        for i, p in enumerate(pairs):
            x, y = pairs_by_index[i]
            assert p == (tutil.Five.normalized[x], tutil.Five.normalized[y])

    def test__from_file(self):
        no_chords_file = MsgList.from_file('./tests/python/test_no_chords.txt')
        assert no_chords_file == tutil.build_no_chords()
        TestMessage.assert_normalized(no_chords_file)

        fur_elise_10_normalized_file = MsgList.from_file(
            os.path.join(CWD, 'tests/python/test_fur_elise_10_normalized.txt'))
        fur_elise_10_normalized = tutil.build_fur_10_normalized()
        assert fur_elise_10_normalized_file == fur_elise_10_normalized
        assert fur_elise_10_normalized_file.normalized == fur_elise_10_normalized.normalized

        TestMessage.assert_normalized(fur_elise_10_normalized_file)
        assert fur_elise_10_normalized.normalized[0].last_onmsg_time is None
        assert fur_elise_10_normalized.normalized[2].last_onmsg_time == 1000000000
        assert fur_elise_10_normalized.normalized[3].last_onmsg_time == 1000000000.25804
        assert fur_elise_10_normalized.normalized[6].last_onmsg_time == 1000000000.55283
        assert fur_elise_10_normalized.normalized[7].last_onmsg_time == 1000000000.83408
        assert fur_elise_10_normalized.normalized[10].last_onmsg_time == 1000000001.11429
        assert fur_elise_10_normalized.normalized[11].last_onmsg_time == 1000000001.40699
        assert fur_elise_10_normalized.normalized[13].last_onmsg_time == 1000000001.68095
        assert fur_elise_10_normalized.normalized[16].last_onmsg_time == 1000000001.9497
        assert fur_elise_10_normalized.normalized[17].last_onmsg_time == 1000000002.30075

        fur_elise_10_normalized_missing_final_off = MsgList.from_file(
            os.path.join(CWD, 'tests/python/test_fur_elise_10_normalized_missing_final_off.txt'))

        for file in [fur_elise_10_normalized_file,
                     fur_elise_10_normalized_missing_final_off]:
            assert dict(file.chords) == {16: [17]}
            assert file.chords is not None

            TestMessage.assert_normalized(file)

        pairs = fur_elise_10_normalized_file.get_on_off_pairs()
        pairs_missing_last = fur_elise_10_normalized_missing_final_off.get_on_off_pairs()
        assert pairs != pairs_missing_last  # (on, off) (on, None)
        assert pairs[:-1] == pairs_missing_last[:-1]
        # including the on of last tuple:
        assert list(itertools.chain(*pairs))[:-1] == list(itertools.chain(*pairs_missing_last))[:-1]
        assert pairs_missing_last[-1][1] is None
        assert pairs[-1][1] is not None
        assert pairs[-1][0] == pairs_missing_last[-1][0]

        fur_elise_half_tempo = MsgList.from_file(
            './tests/python/test__fur_elise_10_normalized_half_tempo.txt')

        assert fur_elise_half_tempo[0].last_onmsg_time is None
        assert fur_elise_half_tempo[2].last_onmsg_time == 1000000000
        assert fur_elise_half_tempo[3].last_onmsg_time == 1000000000.56708
        assert fur_elise_half_tempo[6].last_onmsg_time == 1000000001.15666
        assert fur_elise_half_tempo[7].last_onmsg_time == 1000000001.80866
        assert fur_elise_half_tempo[10].last_onmsg_time == 1000000002.36908
        assert fur_elise_half_tempo[11].last_onmsg_time == 1000000003.02316
        assert fur_elise_half_tempo[13].last_onmsg_time == 1000000003.57108
        assert fur_elise_half_tempo[16].last_onmsg_time == 1000000004.10858
        assert fur_elise_half_tempo[17].last_onmsg_time == 1000000004.81068

        assert fur_elise_half_tempo.normalized[0].last_onmsg_time is None
        assert fur_elise_half_tempo.normalized[2].last_onmsg_time == 1000000000
        assert fur_elise_half_tempo.normalized[3].last_onmsg_time == 1000000000.56708
        assert fur_elise_half_tempo.normalized[6].last_onmsg_time == 1000000001.15666
        assert fur_elise_half_tempo.normalized[7].last_onmsg_time == 1000000001.80866
        assert fur_elise_half_tempo.normalized[10].last_onmsg_time == 1000000002.36908
        assert fur_elise_half_tempo.normalized[11].last_onmsg_time == 1000000003.02316
        assert fur_elise_half_tempo.normalized[13].last_onmsg_time == 1000000003.57108
        assert fur_elise_half_tempo.normalized[16].last_onmsg_time == 1000000004.10858
        assert fur_elise_half_tempo.normalized[17].last_onmsg_time == 1000000004.81068
        TestMessage.assert_normalized(fur_elise_half_tempo)

    def test__to_file(self):
        try:
            ## Assuming cwd is root
            os.mkdir('./tests/python/tmp')
        except FileExistsError:
            pass
        ### Normalized
        three_normalized = tutil.build_3_normalized()
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
        many_three_not_normalized = tutil.build_many_3_not_normalized()
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
                if newm.last_onmsg_time is not None:
                    assert len(str(round(newm.last_onmsg_time, 5))) == len(str(newm.last_onmsg_time))
                if newm.kind == 'on' and new_msgs:
                    last_on_msg = _last_on_msg(i)
                    newm.set_last_onmsg_time(last_on_msg.time if last_on_msg else None)
                    assert newm == m

    @staticmethod
    def assert_tempo_shifted(orig, shifted, expected):
        assert len(shifted) == len(orig)
        assert shifted.chords == orig.chords
        assert shifted == expected

        for i, m in enumerate(shifted):
            assert shifted[i].note == orig[i].note and shifted[i].note == expected[i].note
            assert shifted[i].velocity == orig[i].velocity and shifted[i].velocity == expected[i].velocity
            assert shifted[i].kind == orig[i].kind and shifted[i].kind == expected[i].kind

    def test__create_tempo_shifted(self):
        ### tutil.Two
        two_normalized = tutil.build_2_normalized()
        same_tempo = two_normalized.create_tempo_shifted(1)
        assert len(same_tempo) == len(two_normalized)
        assert same_tempo == two_normalized
        assert same_tempo.normalized == two_normalized.normalized

        TestMessage.assert_tempo_shifted(two_normalized, same_tempo, two_normalized)

        two_normalized_half_tempo = two_normalized.create_tempo_shifted(0.5)
        TestMessage.assert_tempo_shifted(two_normalized, two_normalized_half_tempo, MsgList.from_dicts(

            dict(time=1000000000.00000, note=76, velocity=80, kind='on'),  ### 0: Chord root
            dict(time=1000000000.05, note=77, velocity=80, kind='on'),  ## 1: member. capped (+0.04 => 0.08 => 0.05)

            dict(time=1000000000.17, note=78, velocity=80, kind='on'),  # 2 (+0.06 => 0.12)
            dict(time=1000000002.17, note=76, kind='off'),  # 3 (+1 => +2)
            dict(time=1000000006.17, note=77, kind='off'),  # 4 (+2 => +4)
            dict(time=1000000010.17, note=78, kind='off'),  # 5 (+2 => +4)
            ))

        two_normalized_double_tempo = two_normalized.create_tempo_shifted(2)
        TestMessage.assert_tempo_shifted(two_normalized, two_normalized_double_tempo, MsgList.from_dicts(

            dict(time=1000000000.00000, note=76, velocity=80, kind='on'),  ### 0: Chord root
            dict(time=1000000000.02, note=77, velocity=80, kind='on'),  ## 1: member (+0.04 => 0.02)

            dict(time=1000000000.071, note=78, velocity=80, kind='on'),  # 2 (+0.06 => 0.03 => 0.051)
            dict(time=1000000000.571, note=76, kind='off'),  # 3 (+1 => +0.5)
            dict(time=1000000001.571, note=77, kind='off'),  # 4 (+2 => +1)
            dict(time=1000000002.571, note=78, kind='off'),  # 5 (+2 => +1)
            ))

        ### tutil.Four

        four_normalized = tutil.build_4_normalized()
        four_normalized_1_25_speed = four_normalized.create_tempo_shifted(1.25)
        TestMessage.assert_tempo_shifted(four_normalized, four_normalized_1_25_speed, MsgList.from_dicts(
            dict(time=1000000000.00000, note=76, velocity=80, kind='on'),  ### 0: Chord root
            dict(time=1000000000.032, note=77, velocity=80, kind='on'),  ## 1: member (+0.04 => 0.032)
            dict(time=1000000000.064, note=78, velocity=80, kind='on'),  ## 2: member (+0.04 => 0.032)
            dict(time=1000000000.096, note=79, velocity=80, kind='on'),  ## 3: member (+0.04 => 0.032)

            dict(time=1000000000.8, note=76, kind='off'),  # 4 (+0.88 => 0.704)
            dict(time=1000000002.4, note=77, kind='off'),  # 5 (+2 => 1.6)
            dict(time=1000000004, note=78, kind='off'),  # 6 (+2 => 1.6)
            dict(time=1000000005.6, note=79, kind='off'),  # 7 (+2 => 1.6)
            ))

        four_normalized_0_6_speed = four_normalized.create_tempo_shifted(0.6)
        TestMessage.assert_tempo_shifted(four_normalized, four_normalized_0_6_speed, MsgList.from_dicts(
            dict(time=1000000000.00000, note=76, velocity=80, kind='on'),  ### 0: Chord root
            dict(time=1000000000.05, note=77, velocity=80, kind='on'),  ## 1: member (+0.04 => 0.06667 => 0.5)
            dict(time=1000000000.1, note=78, velocity=80, kind='on'),  ## 2: member (+0.04 => 0.0667 => 0.5)
            dict(time=1000000000.15, note=79, velocity=80, kind='on'),  ## 3: member (+0.04 => 0.0667 => 0.5)

            dict(time=1000000001.61667, note=76, kind='off'),  # 4 (+0.88 => 1.4666)
            dict(time=1000000004.95, note=77, kind='off'),  # 5 (+2 => 3.333)
            dict(time=1000000008.28333, note=78, kind='off'),  # 6 (+2 => 3.333)
            dict(time=1000000011.61666, note=79, kind='off'),  # 7 (+2 => 3.333)
            ))

        ### File
        fur_elise_10 = tutil.build_fur_10_normalized()
        fur_elise_10_file = MsgList.from_file('./tests/python/test_fur_elise_10_normalized.txt')
        assert fur_elise_10 == fur_elise_10_file
        half_tempo = fur_elise_10_file.create_tempo_shifted(0.5)
        assert half_tempo == fur_elise_10.create_tempo_shifted(0.5)

        expected = [None,
                    1000000000,
                    1000000000.56708,
                    1000000001.15666,
                    1000000001.80866,
                    1000000002.36908,
                    1000000003.02316,
                    1000000003.57108,
                    1000000004.10858,
                    1000000004.81068,
                    ]
        for i, j in enumerate([0, 2, 3, 6, 7, 10, 11, 13, 16, 17]):
            if expected[i] is None:
                assertionA = half_tempo[j].last_onmsg_time is None
                assertionB = half_tempo.normalized[j].last_onmsg_time is None
            else:
                assertionA = half_tempo[j].last_onmsg_time == expected[i]
                assertionB = half_tempo.normalized[j].last_onmsg_time == expected[i]

            assert assertionA
            assert assertionB

        half_tempo_file = MsgList.from_file('./tests/python/test__fur_elise_10_normalized_half_tempo.txt')
        _ = half_tempo_file.normalized
        temp1 = fur_elise_10.create_tempo_shifted(0.5)
        _ = temp1.normalized
        temp2 = fur_elise_10_file.create_tempo_shifted(0.5)
        _ = temp2.normalized
        assert half_tempo_file == half_tempo
        assert half_tempo_file == temp1
        assert half_tempo_file == temp2
        TestMessage.assert_tempo_shifted(fur_elise_10_file, half_tempo, half_tempo_file)

# pytest.main(['-k test__get_relative_tempo_missing_msgs'])
