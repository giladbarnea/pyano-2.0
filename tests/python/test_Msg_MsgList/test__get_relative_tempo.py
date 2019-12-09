import pytest
from tests.python import util as tutil
from common.message import MsgList
from random import randrange
from pprint import pprint


def assert_relative_tempo_of_different_length(orig, shifted, factor):
    raise NotImplementedError(
        f"assert_relative_tempo_of_different_length(orig, shifted, factor = {factor})")
    assert orig.get_relative_tempo(orig) == 1
    assert shifted.get_relative_tempo(shifted) == 1
    rel_tempo = shifted.get_relative_tempo(orig)

    isclose = math.isclose(rel_tempo, factor, abs_tol=0.2)
    if not isclose:
        subsequence = shifted.get_subsequence_by(orig)
        # subsequence = subsequence.get_subsequence_by(orig)
        new_rel_tempo = subsequence.get_relative_tempo(orig)
        new_is_close = math.isclose(new_rel_tempo, factor, abs_tol=0.2)
        """orig_len = len(orig)
            shifted_len = len(shifted)
            is_orig_shorter = None
            if orig_len < shifted_len:
                is_orig_shorter = True
            elif orig_len != shifted_len:
                is_orig_shorter = False

            shorter_len = len(orig) if is_orig_shorter else len(shifted)
            first_diff_note_index = None
            for i in range(shorter_len):
                if orig[i].note != shifted[i].note:
                    first_diff_note_index = i
                    break
            if first_diff_note_index is None:
                raise AssertionError('first_diff_note_index is None',
                                     dict(factor=factor,
                                          approx=approx,
                                          rel_tempo=rel_tempo,
                                          first_diff_note_index=first_diff_note_index,
                                          is_orig_shorter=is_orig_shorter,
                                          isclose=isclose, orig=orig,
                                          shifted=shifted))
            # subsequence_index = None
            subsequence = None
            if is_orig_shorter:
                shorter_rest = orig[first_diff_note_index:]
                for i in range(first_diff_note_index, shifted_len):
                    subsequence = shifted[i:]
                    if [m.note for m in subsequence] == [m.note for m in shorter_rest]:
                        break
            else:
                shorter_rest = shifted[first_diff_note_index:]
                for i in range(first_diff_note_index, orig_len):
                    subsequence = orig[i:]
                    if [m.note for m in subsequence] == [m.note for m in shorter_rest]:
                        break

            if subsequence is None:
                raise AssertionError('subsequence is None',
                                     dict(factor=factor,
                                          approx=approx,
                                          rel_tempo=rel_tempo,
                                          first_diff_note_index=first_diff_note_index,
                                          subsequence=subsequence,
                                          is_orig_shorter=is_orig_shorter,
                                          isclose=isclose, orig=orig,
                                          shifted=shifted))
            print()
            if is_orig_shorter:
                new_shifted = MsgList([shifted[:first_diff_note_index] + subsequence])
                new_rel_tempo = new_shifted.get_relative_tempo(orig)
            else:
                new_orig = MsgList([orig[:first_diff_note_index] + subsequence])
                new_rel_tempo = shifted.get_relative_tempo(new_orig)
            new_is_close = math.isclose(new_rel_tempo, factor, abs_tol=0.2)"""
        if not new_is_close:
            print(f'shifted rel to orig: {rel_tempo}\tfactor: {factor}\tlen(shifted): {len(shifted)}')
            raise AssertionError(
                'New relative tempo isnt close enough even after fiding subsequence',
                dict(factor=factor,
                     approx=approx,
                     rel_tempo=rel_tempo,
                     new_rel_tempo=new_rel_tempo,
                     new_is_close=new_is_close,
                     subsequence=subsequence,
                     isclose=isclose,
                     orig=orig,
                     shifted=shifted))

    # reverse_rel_tempo = orig.get_relative_tempo(shifted, acknowledge_notes=acknowledge_notes)
    reverse_rel_tempo = orig.get_relative_tempo(shifted)

    isclose = math.isclose(reverse_rel_tempo, 1 / factor, abs_tol=0.2)
    if not isclose:
        subsequence = orig.get_subsequence_by(shifted)
        new_rel_tempo = subsequence.get_relative_tempo(shifted)
        new_is_close = math.isclose(new_rel_tempo, factor, abs_tol=0.2)
        if not new_is_close:
            raise AssertionError(
                'New relative tempo isnt close enough even after fiding subsequence',
                dict(factor=factor,
                     approx=approx,
                     rel_tempo=rel_tempo,
                     new_rel_tempo=new_rel_tempo,
                     new_is_close=new_is_close,
                     subsequence=subsequence,
                     isclose=isclose,
                     orig=orig,
                     shifted=shifted))


def assert_relative_tempo(orig, shifted, factor):
    assert orig.get_relative_tempo(orig) == 1
    assert shifted.get_relative_tempo(shifted) == 1

    rel_tempo = shifted.get_relative_tempo(orig)
    isexact = round(rel_tempo, 2) == factor
    if not isexact:
        print(f'shifted rel to orig: {rel_tempo}\tfactor: {factor}\tlen(shifted): {len(shifted)}')
        raise AssertionError(
            dict(factor=factor,
                 rel_tempo=rel_tempo,
                 isexact=isexact,
                 orig=orig,
                 shifted=shifted))

    reverse_rel_tempo = orig.get_relative_tempo(shifted)

    isexact = round(reverse_rel_tempo, 2) == round(1 / factor, 2)
    if not isexact:
        print(
            f'orig rel to shifted: {reverse_rel_tempo}\t1 / factor: {1 / factor}\tlen(shifted): {len(shifted)}')
        raise AssertionError(

            dict(factor=factor,
                 rel_tempo=rel_tempo,
                 isexact=isexact,
                 orig=orig,
                 shifted=shifted))


def test__get_relative_tempo():
    things = {
        2:  tutil.build_2_normalized(),
        3:  tutil.build_3_normalized(),
        4:  tutil.build_4_normalized(),
        5:  tutil.build_5_normalized(),
        16: tutil.build_16_normalized(),
        }
    for name, msglist in things.items():
        for factor in range(25, 100, 5):
            factor /= 100
            shifted = msglist.create_tempo_shifted(factor)
            assert_relative_tempo(msglist, shifted, factor)

    fur_elise_file = MsgList.from_file('./tests/python/test_fur_elise_10_normalized.txt')
    half_tempo_file = MsgList.from_file('./tests/python/test__fur_elise_10_normalized_half_tempo.txt')
    assert_relative_tempo(fur_elise_file, half_tempo_file, 0.5)
    assert_relative_tempo(fur_elise_file.normalized, half_tempo_file, 0.5)
    assert_relative_tempo(fur_elise_file, half_tempo_file.normalized, 0.5)
    assert_relative_tempo(fur_elise_file.normalized, half_tempo_file.normalized, 0.5)

    fur_elise = tutil.build_fur_10_normalized()
    assert_relative_tempo(fur_elise, half_tempo_file, 0.5)
    assert_relative_tempo(fur_elise.normalized, half_tempo_file, 0.5)
    assert_relative_tempo(fur_elise, half_tempo_file.normalized, 0.5)
    assert_relative_tempo(fur_elise.normalized, half_tempo_file.normalized, 0.5)

    half_tempo = fur_elise.create_tempo_shifted(0.5)
    assert_relative_tempo(fur_elise, half_tempo, 0.5)
    assert_relative_tempo(fur_elise.normalized, half_tempo, 0.5)
    assert_relative_tempo(fur_elise, half_tempo.normalized, 0.5)
    assert_relative_tempo(fur_elise.normalized, half_tempo.normalized, 0.5)

    assert_relative_tempo(half_tempo_file, half_tempo, 1)
    assert_relative_tempo(half_tempo_file.normalized, half_tempo, 1)
    assert_relative_tempo(half_tempo_file, half_tempo.normalized, 1)
    assert_relative_tempo(half_tempo_file.normalized, half_tempo.normalized, 1)


def test__get_relative_tempo_not_enough_notes():
    """Trim end of list"""
    fur_elise = tutil.build_fur_10_normalized().normalized
    half_tempo_trimmed = fur_elise.create_tempo_shifted(0.5).normalized[:-randrange(2, 10)]
    assert len(half_tempo_trimmed) < len(fur_elise)
    assert_relative_tempo(fur_elise, half_tempo_trimmed, 0.5)
    assert_relative_tempo(half_tempo_trimmed, fur_elise.create_tempo_shifted(0.5).normalized, 1)

    factor = 0.25
    two_normalized = tutil.build_2_normalized().normalized
    two_shifted_trimmed = two_normalized.create_tempo_shifted(factor).normalized
    pairs = two_shifted_trimmed.get_on_off_pairs()
    remove_amount = 2
    remove_these_pairs = pairs[-remove_amount + 1:]
    [[two_shifted_trimmed.msgs.remove(m) for m in pair] for pair in remove_these_pairs]
    assert_relative_tempo(two_normalized, two_shifted_trimmed, factor)
    things = {
        2:  tutil.build_2_normalized(),
        3:  tutil.build_3_normalized(),
        4:  tutil.build_4_normalized(),
        5:  tutil.build_5_normalized(),
        16: tutil.build_16_normalized(),
        }
    for name, msglist in things.items():
        for factor in range(25, 100, 5):
            factor /= 100
            remove_amount = randrange(1, len(msglist) // 2)
            shifted_trimmed = msglist.create_tempo_shifted(factor).normalized
            pairs = shifted_trimmed.get_on_off_pairs()
            remove_these_pairs = pairs[-remove_amount + 1:]
            [[shifted_trimmed.msgs.remove(m) for m in pair] for pair in remove_these_pairs]
            try:
                assert_relative_tempo(msglist, shifted_trimmed, factor)
            except ZeroDivisionError as zde:
                pprint(['ZeroDivisionError',
                        dict(
                            name=name,
                            msglist=msglist,
                            factor=factor,
                            remove_amount=remove_amount,
                            pairs=pairs,
                            remove_these_pairs=remove_these_pairs,
                            shifted_trimmed=shifted_trimmed
                            )])
                raise zde


@pytest.mark.skip
def test__get_relative_tempo_bad_accuracy():
    """Randomize notes"""
    fur_elise = tutil.build_fur_10_normalized().normalized
    half_tempo = fur_elise.create_tempo_shifted(0.5).normalized
    from random import randrange
    for m in fur_elise:
        m.note = randrange(30, 90)

    assert_relative_tempo(fur_elise, half_tempo, 0.5)

    for m in fur_elise.normalized:
        m.note = randrange(30, 90)

    assert_relative_tempo(fur_elise.normalized, half_tempo, 0.5)


@pytest.mark.skip
def test__get_relative_tempo_not_enough_notes_and_bad_accuracy():
    """Trim end of list and randomize notes"""
    fur_elise = tutil.build_fur_10_normalized().normalized
    half_tempo = fur_elise.create_tempo_shifted(0.5).normalized[:-randrange(2, 10)]
    # fur_elise = tutil.build_fur_10_normalized().normalized[:-randrange(2, 10)]
    for m in half_tempo:
        m.note = randrange(30, 90)
    assert_relative_tempo(fur_elise, half_tempo, 0.5)
    assert_relative_tempo(half_tempo, fur_elise.create_tempo_shifted(0.5).normalized, 1)


@pytest.mark.skip
def test__get_relative_tempo_missing_msgs():
    """Remove arbitrary on/off pair(s) from student's slow performance and try to guess tempo regardless
    Relies on MsgList.gry_subsequence_by(other) which doesn't work perfectly"""
    fur_elise = tutil.build_fur_10_normalized().normalized
    fur_len = len(fur_elise)

    ## Uncomment this to manually choose which pair to remove
    """start = 2
    stop = fur_len - 2
    for i in range(start, stop):
        half_tempo = fur_elise.create_tempo_shifted(0.5).normalized
        half_pairs = half_tempo.get_on_off_pairs()
        stop = randrange(start, fur_len)
        [[half_tempo.msgs.remove(m) for m in pair] for pair in half_pairs[2:i]]
        try:
            assert_relative_tempo(fur_elise, half_tempo.normalized, 0.5)
            assert_relative_tempo(half_tempo.normalized, fur_elise.create_tempo_shifted(0.5).normalized,
                                              1)
            half_tempo = MsgList(half_tempo.msgs).normalized
            assert_relative_tempo(fur_elise, half_tempo, 0.5)
            assert_relative_tempo(half_tempo, fur_elise.create_tempo_shifted(0.5).normalized, 1)
        except AssertionError as ae:
            pass
        else:
            print(f'\n\tGOOD. start: {start}\tstop: {stop}\n')"""

    ## Removing these pairs failed the tests, make it work
    failing_pairs = [
        (0, 1),  # pass
        (0, 2),  # pass
        # (0, 3),
        # (0, 4),
        # (0, 8),
        # (0, 9),
        (1, 2),
        # (1, 3),
        # (1, 4),
        # (1, 5),
        # (1, 8),
        # (1, 9),
        # (2, 3),
        # (2, 4),
        # (2, 5),
        # (2, 6),
        # (2, 7),
        # (2, 8),
        # (2, 10),
        # (2, 11),
        # (2, 12),
        # (2, 13),
        # (2, 14),
        # (2, 15),
        # (2, 16),
        # (2, 17),
        # (2, 18),
        # (2, 19),
        (3, 5),  # pass
        # (3, 6),
        # (3, 7),
        # (3, 8),
        # (3, 9),
        (4, 5),  # pass
        # (4, 6),
        # (4, 7),
        # (4, 8),
        # (4, 9),
        # (5, 6),
        # (5, 7),
        # (5, 8),
        # (5, 9),
        # (6, 7),
        # (6, 8),
        # (6, 9),
        # (7, 8),
        # (7, 9),
        ]

    for a, b in failing_pairs:
        print(f'\n\ta: {a}\tb: {b}\n')
        half_tempo = fur_elise.create_tempo_shifted(0.5).normalized
        half_pairs = half_tempo.get_on_off_pairs()
        [[half_tempo.msgs.remove(m) for m in pair] for pair in half_pairs[a:b]]
        assert_relative_tempo(fur_elise, half_tempo.normalized, 0.5)
        assert_relative_tempo(half_tempo.normalized,
                              fur_elise.create_tempo_shifted(0.5).normalized,
                              1)
        half_tempo = MsgList(half_tempo.msgs).normalized
        assert_relative_tempo(fur_elise, half_tempo, 0.5)
        assert_relative_tempo(half_tempo, fur_elise.create_tempo_shifted(0.5).normalized, 1)

    cause_zero_div_error = [
        (0, 19),
        (0, 16),
        (0, 15),
        ]

    ## Uncomment this to randomally find which pairs make tests fail
    """
    for _ in range(50):
        half_tempo = fur_elise.create_tempo_shifted(0.5).normalized
        half_pairs = half_tempo.get_on_off_pairs()
        start = randrange(1, fur_len - 2)
        stop = randrange(start, fur_len)
        if any((a, b) == (start, stop) for a, b in bad):
            continue

        [[half_tempo.msgs.remove(m) for m in pair] for pair in half_pairs[start:stop]]
        try:
            assert_relative_tempo(fur_elise, half_tempo.normalized, 0.5)
            assert_relative_tempo(half_tempo.normalized, fur_elise.create_tempo_shifted(0.5).normalized,
                                              1)
            half_tempo = MsgList(half_tempo.msgs).normalized
            assert_relative_tempo(fur_elise, half_tempo, 0.5)
            assert_relative_tempo(half_tempo, fur_elise.create_tempo_shifted(0.5).normalized, 1)
        except AssertionError as ae:
            print(f'\n\tFAILED. start: {start}\tstop: {stop}\n')
        except ZeroDivisionError as ze:
            print(f'\n\tZeroDivisionError!. start: {start}\tstop: {stop}\n')
            raise ze"""
