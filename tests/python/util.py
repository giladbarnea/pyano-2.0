from typing import *
from common.message import MsgList


def build_fur_10_normalized() -> MsgList:
    return MsgList.from_dicts(
        dict(time=1000000000.000, note=76, velocity=48, kind="on"),  # 0
        dict(time=1000000000.25804, note=76, kind="off"),  # 1
        dict(time=1000000000.25804, note=75, velocity=48, kind="on"),  # 2
        dict(time=1000000000.55283, note=76, velocity=54, kind="on"),  # 3
        dict(time=1000000000.55908, note=75, kind="off"),  # 4
        dict(time=1000000000.83408, note=76, kind="off"),  # 5
        dict(time=1000000000.83408, note=75, velocity=60, kind="on"),  # 6
        dict(time=1000000001.11429, note=76, velocity=56, kind="on"),  # 7
        dict(time=1000000001.12158, note=75, kind="off"),  # 8
        dict(time=1000000001.39762, note=76, kind="off"),  # 9
        dict(time=1000000001.40699, note=71, velocity=51, kind="on"),  # 10
        dict(time=1000000001.68095, note=74, velocity=50, kind="on"),  # 11
        dict(time=1000000001.707, note=71, kind="off"),  # 12
        dict(time=1000000001.9497, note=72, velocity=52, kind="on"),  # 13
        dict(time=1000000001.98095, note=74, kind="off"),  # 14
        dict(time=1000000002.30075, note=72, kind="off"),  # 15
        dict(time=1000000002.30075, note=45, velocity=34, kind="on"),  # 16
        dict(time=1000000002.32158, note=69, velocity=47, kind="on"),  # 17
        dict(time=1000000003.10387, note=45, kind="off"),  # 18
        dict(time=1000000003.2122, note=69, kind="off"),  # 19
        )


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
        dict(time=1000000000.00000, note=76, velocity=80, kind='on'),  ### 0: Chord root
        dict(time=1000000000.04, note=77, velocity=80, kind='on'),  ## 1: member (+0.04)

        dict(time=1000000000.1, note=78, velocity=80, kind='on'),  # 2 (+0.06)
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
        dict(time=1000000000, note=76, velocity=80, kind='on'),  # 0
        dict(time=1000000001, note=76, kind='off'),  # 1

        dict(time=1000000002, note=77, velocity=80, kind='on'),  # 2
        dict(time=1000000003, note=77, kind='off'),  # 3

        dict(time=1000000004, note=78, velocity=80, kind='on'),  # 4
        dict(time=1000000005, note=78, kind='off'),  # 5
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
        dict(time=1000000000.00000, note=76, velocity=80, kind='on'),  ### 0: Chord root
        dict(time=1000000000.04, note=77, velocity=80, kind='on'),  ## 1: member (+0.04)
        dict(time=1000000000.08, note=78, velocity=80, kind='on'),  ## 2: member (+0.04)
        dict(time=1000000000.12, note=79, velocity=80, kind='on'),  ## 3: member (+0.04)

        dict(time=1000000001, note=76, kind='off'),  # 4 (+0.88)
        dict(time=1000000003, note=77, kind='off'),  # 5 (+2)
        dict(time=1000000005, note=78, kind='off'),  # 6 (+2)
        dict(time=1000000007, note=79, kind='off'),  # 7 (+2)
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


import contextlib


@contextlib.contextmanager
def ignore(*exceptions):
    try:
        yield
    except exceptions:
        pass
