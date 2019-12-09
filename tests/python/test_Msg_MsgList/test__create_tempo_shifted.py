from birdseye import eye
from tests.python import util as tutil
from common.message import MsgList
import os

CWD = os.getcwd()  ## Assumes running from root


def avg(coll):
    return round(sum(coll) / len(coll), 3)


def assert_tempo_shifted(orig, shifted, expected):
    assert len(shifted) == len(orig)
    assert shifted.chords == orig.chords
    assert shifted == expected

    for i, m in enumerate(shifted):
        assert shifted[i].note == orig[i].note and shifted[i].note == expected[i].note
        assert shifted[i].velocity == orig[i].velocity and shifted[i].velocity == expected[i].velocity
        assert shifted[i].kind == orig[i].kind and shifted[i].kind == expected[i].kind


def test__create_tempo_shifted_from_file():
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
    assert_tempo_shifted(fur_elise_10_file, half_tempo, half_tempo_file)

    fur_elise_B = MsgList.from_file(f"{os.path.join(CWD, 'src/experiments/truths')}/fur_elise_B.txt")
    dicts = []
    for m in fur_elise_B:
        mdict = m.to_dict()
        mdict['time'] -= 554625326.9319999
        if 'last_onmsg_time' in mdict:
            del mdict['last_onmsg_time']
        dicts.append(mdict)
    fur_elise_B = MsgList.from_dicts(*dicts)

    fur_elise_10 = MsgList.from_file('./tests/python/test_fur_elise_10_normalized.txt')

    # 1.0263525034878314
    sliced_fur_elise_B = fur_elise_B[:len(fur_elise_10)]
    assert sliced_fur_elise_B[1].time == sliced_fur_elise_B[2].time
    rel_tempo = fur_elise_10.get_relative_tempo(fur_elise_B)
    tempo_shifted_A0 = sliced_fur_elise_B.create_tempo_shifted(rel_tempo, False)
    assert tempo_shifted_A0[1].time == tempo_shifted_A0[2].time
    tempo_shifted_A1 = fur_elise_B.create_tempo_shifted(rel_tempo, False)
    assert tempo_shifted_A1[1].time == tempo_shifted_A1[2].time
    tempo_shifted_B = fur_elise_10.create_tempo_shifted(1 / rel_tempo, False)
    assert tempo_shifted_B[1].time == tempo_shifted_B[2].time


def test__create_tempo_shifted():
    two_normalized = tutil.build_2_normalized()
    same_tempo = two_normalized.create_tempo_shifted(1)
    assert len(same_tempo) == len(two_normalized)
    assert same_tempo == two_normalized
    assert same_tempo.normalized == two_normalized.normalized

    assert_tempo_shifted(two_normalized, same_tempo, two_normalized)

    two_normalized_half_tempo = two_normalized.create_tempo_shifted(0.5)
    assert_tempo_shifted(two_normalized, two_normalized_half_tempo, MsgList.from_dicts(

        dict(time=1000000000.00000, note=76, velocity=80, kind='on'),  ### 0: Chord root
        dict(time=1000000000.05, note=77, velocity=80, kind='on'),  ## 1: member. capped (+0.04 => 0.08 => 0.05)

        dict(time=1000000000.17, note=78, velocity=80, kind='on'),  # 2 (+0.06 => 0.12)
        dict(time=1000000002.17, note=76, kind='off'),  # 3 (+1 => +2)
        dict(time=1000000006.17, note=77, kind='off'),  # 4 (+2 => +4)
        dict(time=1000000010.17, note=78, kind='off'),  # 5 (+2 => +4)
        ))

    two_normalized_double_tempo = two_normalized.create_tempo_shifted(2)
    assert_tempo_shifted(two_normalized, two_normalized_double_tempo, MsgList.from_dicts(

        dict(time=1000000000.00000, note=76, velocity=80, kind='on'),  ### 0: Chord root
        dict(time=1000000000.02, note=77, velocity=80, kind='on'),  ## 1: member (+0.04 => 0.02)

        dict(time=1000000000.071, note=78, velocity=80, kind='on'),  # 2 (+0.06 => 0.03 => 0.051)
        dict(time=1000000000.571, note=76, kind='off'),  # 3 (+1 => +0.5)
        dict(time=1000000001.571, note=77, kind='off'),  # 4 (+2 => +1)
        dict(time=1000000002.571, note=78, kind='off'),  # 5 (+2 => +1)
        ))

    four_normalized = tutil.build_4_normalized()
    four_normalized_1_25_speed = four_normalized.create_tempo_shifted(1.25)
    assert_tempo_shifted(four_normalized, four_normalized_1_25_speed, MsgList.from_dicts(
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
    assert_tempo_shifted(four_normalized, four_normalized_0_6_speed, MsgList.from_dicts(
        dict(time=1000000000.00000, note=76, velocity=80, kind='on'),  ### 0: Chord root
        dict(time=1000000000.05, note=77, velocity=80, kind='on'),  ## 1: member (+0.04 => 0.06667 => 0.5)
        dict(time=1000000000.1, note=78, velocity=80, kind='on'),  ## 2: member (+0.04 => 0.0667 => 0.5)
        dict(time=1000000000.15, note=79, velocity=80, kind='on'),  ## 3: member (+0.04 => 0.0667 => 0.5)

        dict(time=1000000001.61667, note=76, kind='off'),  # 4 (+0.88 => 1.4666)
        dict(time=1000000004.95, note=77, kind='off'),  # 5 (+2 => 3.333)
        dict(time=1000000008.28333, note=78, kind='off'),  # 6 (+2 => 3.333)
        dict(time=1000000011.61666, note=79, kind='off'),  # 7 (+2 => 3.333)
        ))
