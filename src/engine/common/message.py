import itertools
from typing import *
import re

import settings
from birdseye import eye
from common.util import ignore

from . import consts, tonode
from copy import deepcopy
from pprint import pformat
from collections import OrderedDict as OD
from cheap_repr import normal_repr, register_repr
from mytool import term
import os

Kind = Union[Literal['on'], Literal['off']]
Chords = Dict[int, List[int]]
IMsg = TypedDict('IMsg', {'time': float, 'note': int, 'kind': Kind, 'velocity': int, 'last_onmsg_time': float})


# IMsg = Any


# eye.num_samples['small']['list'] = 100
# eye.num_samples['small']['dict'] = 100
# eye.num_samples['small']['attributes'] = 100
# eye.num_samples['big']['list'] = 100
# eye.num_samples['big']['dict'] = 100
# eye.num_samples['big']['attributes'] = 100


class Msg:

    def __init__(self, line: str, last_onmsg_time: float = None):
        """Valid lines:
        "1554625327.25804   note=76 off"
        "1554625327.25804   note=76 velocity=48 off"
        "1554625327.25804   note=76 velocity=48 on"
        """

        # regexp = r'^\d{10}(\.?\d+)?\s+note=\d{1,3}\s+(velocity=\d{1,3}\s+)?(on|off)\n?$'  ## Unlimited possible decimal numbers, agnostic to whitespace or tab
        # match = re.fullmatch(regexp, line)

        # if not match:
        #     logger.log_thin(dict(line=line, match=match, regexp=regexp), title="Message.__init__ no regex match")
        time, note, *rest = filter(lambda x: x, re.split(r'\s', line))
        first, *rest = rest
        velocity = None
        if rest:
            velocity, kind = first, rest[0]
        else:
            kind = first

        self.time = round(float(time), 5)
        _, _, self.note = note.partition('=')
        self.kind: Kind = kind.strip()
        self.set_last_onmsg_time(last_onmsg_time)
        if self.kind == 'on':
            _, _, self.velocity = velocity.partition('=')
        else:
            self.velocity = None

    def set_last_onmsg_time(self, last_onmsg_time: Optional[float]):
        if last_onmsg_time is not None and self.kind == 'on':
            # self.time_delta = round(self.time - last_onmsg_time, 5)
            self.last_onmsg_time = round(last_onmsg_time, 5)
        else:
            # self.time_delta = None
            self.last_onmsg_time = None

    def to_line(self) -> str:
        s = f'{self.time}\tnote={self.note}'
        if self.kind == 'on':
            s += f'\tvelocity={self.velocity}'
        s += f'\t{self.kind}\n'
        return s

    def to_dict(self) -> IMsg:
        basic = OD(time=self.time,
                   note=self.note,
                   kind=self.kind)
        if self.kind == 'on':
            basic.update(velocity=self.velocity,
                         last_onmsg_time=self.last_onmsg_time
                         )
        return basic

    @staticmethod
    def from_dict(*,
                  time: float,
                  note: int,
                  velocity: int = None,
                  kind: Kind,
                  last_onmsg_time: float = None,
                  **kwargs
                  ) -> 'Msg':
        line = f'{round(float(time), 5)}\tnote={note}'
        if kind == 'on':
            line += f'\tvelocity={velocity}'
        line += f'\t{kind}'
        return Msg(line, last_onmsg_time)

    def __str__(self) -> str:
        s = f"""time: {self.time}
    note: {self.note}
    kind: {self.kind}"""
        if self.kind == 'on':
            s += f"""
    velocity: {self.velocity}
    last onmsg time: {self.last_onmsg_time}"""
        with ignore(AttributeError):
            # MsgList.DEBUG_set_time_deltas() sets m.time_delta
            s += f"""
    rel_time: {self.rel_time}
    time delta: {self.time_delta}"""

        return s + '\n\n'

    def __repr__(self) -> str:
        return self.__str__()

    def __eq__(self, o) -> bool:
        try:
            if round(o.time, 5) != round(self.time, 5):
                return False
            if o.note != self.note:
                return False
            if o.kind != self.kind:
                return False
            if o.velocity != self.velocity:
                return False

            if o.last_onmsg_time is None or self.last_onmsg_time is None:
                if o.last_onmsg_time != self.last_onmsg_time:
                    return False
            else:
                if round(o.last_onmsg_time, 5) != round(self.last_onmsg_time, 5):
                    return False
            return True

        except AttributeError:
            return False

    def __hash__(self):
        return hash(self.time)


Pair = Tuple[Msg, Msg]


class MsgList:
    msgs: List[Msg]
    chords: Chords
    normalized: 'MsgList'

    # TODO: on_off_pairs?

    def __init__(self, base_msgs: List[Msg]):
        self.msgs = base_msgs
        self._chords = None
        self._is_self_normalized = False
        """Whether ``self.msgs`` is normalized. If so, ``self.normalized`` returns ``self`` as a recursion stop condition."""
        self._normalized = None

    def __iter__(self):
        yield from self.msgs

    def __getitem__(self, index) -> Union[Msg, 'MsgList']:
        if isinstance(index, slice):
            sliced = MsgList(self.msgs[index])
            if self._is_self_normalized:
                sliced._is_self_normalized = True
                sliced._normalized = None
            return sliced
        return self.msgs[index]

    def __len__(self):
        return len(self.msgs)

    def __eq__(self, other):
        try:
            msgs_equal = other.msgs == self.msgs
            if not msgs_equal:
                return False

            ### In case self and other both have a property with value, require equal values

            if self._is_self_normalized != other._is_self_normalized:
                return False
            ## same "_is_self_normalized" value, but if both True, compare the actual normalized list
            if self._is_self_normalized and other._is_self_normalized:
                if self._normalized != other._normalized:
                    return False

            if self._chords and other._chords:
                if self._chords != other._chords:
                    return False

            return True

        except AttributeError:
            return other == self.msgs

    def __repr__(self) -> str:
        msgs_len = len(self.msgs)
        basic = dict(msgs=msgs_len, _is_self_normalized=self._is_self_normalized)
        if self._normalized is not None:
            if len(self._normalized < 3):
                _normalized = self._normalized
            else:
                _normalized = self._normalized[:2] + self._normalized[-2:]
            basic.update(normalized=_normalized)
        if self._chords is not None:
            # TODO: slice cheaply like normalized above
            basic.update(chords=self._chords)

        if settings.DEBUG:
            self.DEBUG_set_time_deltas()
            self.DEBUG_set_rel_times()
            with ignore(AttributeError):
                if self._is_tempo_shifted:
                    basic.update(_is_tempo_shifted=self._is_tempo_shifted,
                                 _tempo_shift_factor=self._tempo_shift_factor,
                                 _is_fixed_chords=self._is_fixed_chords
                                 )

        return pformat(basic, indent=2)

    def __add__(self, other) -> 'MsgList':
        return MsgList([self.msgs + other.msgs])

    def last_on_index(self, end: Optional[int] = None) -> Optional[int]:
        if end is None:
            end = len(self)
        for i in reversed(range(end)):
            if self[i].kind == 'on':
                return i
        return None

    @property
    # @eye
    def normalized(self) -> 'MsgList':
        if self._is_self_normalized:
            return self
        elif self._normalized is not None:
            return self._normalized
        # if self._chords is None:
        #     _ = self.chords
        normalized = deepcopy(self)  # [:] not enough. same for sorted
        normalized_len = len(normalized)

        for root, rest in self.chords.items():
            flat_chord: List[int] = [root, *rest]
            if normalized_len <= flat_chord[-1]:
                break

            """Overwrite chord messages so they are sorted by note, 
                all timed according to lowest pitch note, 
                and share the time delta and last_onmsg_time of the first-played note"""
            msgs_of_chord = [normalized[i] for i in flat_chord]
            sorted_msgs_of_chord = sorted(deepcopy(msgs_of_chord), key=lambda m: m.note)
            is_already_sorted = msgs_of_chord == sorted_msgs_of_chord
            if is_already_sorted:
                continue

            # not sorted
            for i, msg_i in enumerate(flat_chord):
                normalized[msg_i].note = sorted_msgs_of_chord[i].note
                normalized[msg_i].velocity = sorted_msgs_of_chord[i].velocity

        # handle messages with same exact time - doesn't work
        # for i, m in enumerate(normalized[:-1]):
        #     if round(normalized[i + 1].time, 5) == round(m.time, 5):
        #         m.time = round(m.time - 0.001, 5)
        #         if normalized[i + 1].kind == 'on':
        #             normalized[i + 1].set_last_onmsg_time(m.time)
        self.normalized = normalized  ## calls setter

        return self.normalized

    @normalized.setter
    def normalized(self, val: 'MsgList'):
        self._is_self_normalized = val == self.msgs
        if self._is_self_normalized:
            self._normalized = None

        else:  # self is not normalized
            if not val:
                raise ValueError('normalized setter; val is Falsey. val:', val, 'self:', self)
            self._normalized = val
            self._normalized._is_self_normalized = True

    @property
    # @eye
    def chords(self) -> Chords:
        """
        Same output for normalized / non-normalized.
        Warns node if self is only ON msgs, but handles the same (same output for combined messages).
        Returns a dictionary of { root: [ member0, ..., memberN ] } of indexes of ON msgs
        """
        if self._chords is not None:
            return self._chords

        def _open_new_chord(_root, *_members):
            chords[_root] = list(_members)
            root_isopen_map[_root] = True

        def _maybe_close_root(_curr_index: int, _msg: Msg):
            for _j in reversed(range(_curr_index)):
                ## Opposite of "find matching off"
                if self.msgs[_j].kind == 'on' and self.msgs[_j].note == _msg.note:
                    ## If index of matching "on" is a chord root, close it
                    if _j in chords:
                        root_isopen_map[_j] = False
                        break

        if all(m.kind == 'on' for m in self.msgs):
            warning = f'chords() got self.msgs that only has on messages, len(self.msgs): {len(self.msgs)}'
            if os.environ.get('RUNNING_PYCHARM'):
                term.warn(warning)
            tonode.warn(warning)

        chords = OD()
        root_isopen_map = {}
        for i, msg in enumerate(self.msgs):
            if msg.kind == "off":
                if any(root_isopen_map.values()):
                    _maybe_close_root(i, msg)

                continue
            if i == 0:
                continue
            last_on_index = self.last_on_index(i)
            if last_on_index is not None:
                is_chord_with_prev = round(msg.time - self[last_on_index].time, 5) <= consts.CHORD_THRESHOLD
            else:
                is_chord_with_prev = False
            if is_chord_with_prev:
                if not chords:
                    _open_new_chord(last_on_index, i)
                    continue

                last_root: int = next(reversed(chords))
                last_members: List[int] = chords[last_root]

                if last_root == last_on_index or last_on_index in last_members:
                    if root_isopen_map.get(last_root):
                        # last note was a chord root, or a part of an existing chord. append
                        chords[last_root].append(i)
                    else:
                        members = chords[last_root]
                        newroot, *newmembers = members + [i]
                        _open_new_chord(newroot, *newmembers)
                else:
                    # last note not in chords at all. create a new chord.
                    _open_new_chord(last_on_index, i)

        self._chords = chords
        return chords

    @chords.setter
    def chords(self, val):
        self._chords = val

    def get_rhythm_deviation(self, other: 'MsgList', self_idx: int, other_idx: int) -> float:
        def _get_locals():
            return dict(self_idx=self_idx,
                        other_idx=other_idx,
                        self_msg=self_msg,
                        other_msg=other_msg, )

        self_roots, self_members = self.get_chord_roots_and_members()
        other_roots, other_members = other.get_chord_roots_and_members()
        self_msg = self[self_idx]
        other_msg = other[other_idx]
        if self_msg.last_onmsg_time is None or other_msg.last_onmsg_time is None:
            ## First
            if self_msg.last_onmsg_time is None != other_msg.last_onmsg_time is None:
                warning = f"Only self_msg or other_msg has a last_onmsg_time. Shouldn't happen."
                tonode.warn(dict(message=warning,
                                 **_get_locals()))
                if os.environ.get('RUNNING_PYCHARM'):
                    term.warn(warning)

            return 0

        if self_msg in self_members or other_msg in other_members:
            ## Either msg is a chord member (not root or regular). Don't compare

            if self_msg in self_members != other_msg in other_members:
                ## Only one is a chord member, the other isn't.
                # TODO: find each's next on msg that's outside of current chord
                warning = f'Only self_msg or other_msg is a chord MEMBER'
                tonode.warn(dict(message=warning,
                                 **_get_locals()))
                if os.environ.get('RUNNING_PYCHARM'):
                    term.warn(warning)
            return 0
        if self_msg in self_roots or other_msg in other_roots:
            if self_msg in self_roots != other_msg in other_roots:
                ## Only one is a chord member, the other isn't.
                warning = f'Only self_msg or other_msg is a chord ROOT'
                tonode.warn(dict(message=warning,
                                 **_get_locals()))
                if os.environ.get('RUNNING_PYCHARM'):
                    term.warn(warning)

        # 0.8 or 1.2
        self_time_delta = round(self_msg.time - self_msg.last_onmsg_time, 5)
        other_time_delta = round(other_msg.time - other_msg.last_onmsg_time, 5)
        ratio = round(self_time_delta / other_time_delta, 5)
        # 0.2
        return abs(1 - ratio)

    def get_chord_roots_and_members(self) -> Tuple[List[Msg], List[Msg]]:
        roots = []
        members = []
        for root_idx, members_idxs in self.chords.items():
            roots.append(self[root_idx])
            members.extend([self[i] for i in members_idxs])
        return roots, members

    def split_to_on_off(self) -> Tuple[List[Msg], List[Msg]]:
        """Different (bad) output for not normalized."""

        on_msgs = []
        off_msgs = []
        for m in self.msgs:
            if m.kind == 'on':
                on_msgs.append(m)
            else:
                off_msgs.append(m)
        return on_msgs, off_msgs

    def get_on_off_pairs(self) -> List[Pair]:
        """Different (bad) output for not normalized.
          An "on" with no matching "off" is paired with ``None``."""

        def _find_matching_off_msg(_on: Msg, _start: int) -> Tuple[Optional[int], Optional[Msg]]:
            try:
                for _i, _m in enumerate(msgs_C[_start:], _start):
                    if (_m.kind == 'off'
                            and _m.note == _on.note
                            and _m.time > _on.time):
                        return _i, _m
            except IndexError:
                pass
            return None, None

        pairs = []
        msgs_C = self.msgs[:]

        for i, m in enumerate(msgs_C):
            if m.kind == 'on':
                match_index, matching_off_msg = _find_matching_off_msg(m, i + 1)
                if matching_off_msg is not None:
                    msgs_C.pop(match_index)
                pairs.append((m, matching_off_msg))

        return pairs

    def create_tempo_shifted(self, factor: float, fix_chords=True) -> 'MsgList':
        """Higher is faster. Returns a combined MsgList which is tempo-shifted.
        Pass fix_chords = False for more precise tempo transformation, on account of
        arbitrarily removing existing chords (by stretching), or creating false ones (by squeezing)
        Pass fix_chords = True to keep original chords when slowed down. May create false chords when sped up.
        Untested on non-normalized"""
        if factor > 10 or factor < 0.25:
            tonode.warn(f'create_tempo_shifted() got bad factor: {factor}')
        factor = round(factor, 5)
        self_C = deepcopy(self)

        flat_chord_indices = self._flat_chord_indices()
        for i in range(len(self_C) - 1):
            msg = self_C[i]
            next_msg = self_C[i + 1]
            delta = round((self[i + 1].time - self[i].time) / factor, 5)
            if fix_chords:
                if i + 1 in flat_chord_indices:  # chord root or member
                    if delta > consts.CHORD_THRESHOLD:  # we dont want to "unchord"
                        delta = consts.CHORD_THRESHOLD
                elif delta <= consts.CHORD_THRESHOLD:  # we dont want to create extra chords
                    delta = consts.CHORD_THRESHOLD + 0.001
            next_msg.time = round(msg.time + delta, 5)
            if msg.kind == 'on':
                next_msg.set_last_onmsg_time(msg.time)
            else:
                try:
                    last_on_msg = self_C[self_C.last_on_index(i)]
                except (StopIteration, TypeError):  # TypeError happens when self_C.last_on_index(i) returns None
                    next_msg.set_last_onmsg_time(None)
                else:
                    next_msg.set_last_onmsg_time(last_on_msg.time)

        tempo_shifted = MsgList(self_C.msgs)
        if settings.DEBUG:
            tempo_shifted._is_tempo_shifted = True
            tempo_shifted._tempo_shift_factor = factor
            tempo_shifted._is_fixed_chords = fix_chords
        return tempo_shifted

    def _flat_chord_indices(self) -> List[int]:
        return list(itertools.chain(*[(root, *members) for root, members in self.chords.items()]))

    # noinspection PyUnreachableCode,PyTypeChecker
    def get_continuum_by(self, other: 'MsgList') -> 'MsgList':
        # TODO: dont use
        raise NotImplementedError(
            "Called MsgList.get_continuum_by(other). This function doesn't work. Try using MsgList.get_subsequence_by() instead")
        other_len = len(other)
        other_notes = [m.note for m in other]
        self_len = len(self)
        if other_len > self_len:
            raise ValueError(f"other is longer than self", dict(other=other, self=self))
        for i in range(self_len):
            self_rest = self[i:]
            self_rest_len = len(self_rest)
            if self_rest_len < other_len:
                return None
            if self_rest_len == other_len:
                if [m.note for m in self_rest] == other_notes:
                    return self_rest.normalized
                else:
                    return None
            gap = self_rest_len - other_len  ## larger than 0 for sure
            for j in range(gap):
                continuum = self_rest[j:other_len]
                if [m.note for m in continuum] == other_notes:
                    return continuum.normalized
        return None

    def get_subsequence_by(self, other: 'MsgList') -> 'MsgList':
        """THIS IS INCOMPLETE AND MAY FAIL UNEXPECTEDLY."""
        # TODO: use difference between self and other length.
        #  If other is missing one pair (eg missed one press),
        #  find the missing index, split self to 2 sequences
        #  (before and after missed press) and compare these two to other.
        intersection = []
        i = 0
        j = 0
        other_len = len(other)
        self_len = len(self)
        n = 3
        for _ in range(self_len - 2):
            # self_next_n = [m for m in self[j:j + n]]

            # other_next_n = [m for m in other[i:i + n]]
            if i + n >= other_len or j + n >= self_len:
                break
            # other_next_n = [m for m in other.msgs[i:i + n]]
            # while (self[j].note, self[j + 1].note, self[j + 2].note) != (
            #         other[i].note, other[i + 1].note, other[i + 2].note):
            self_next_n = self.msgs[j:j + n]
            other_next_n = other.msgs[i:i + n]
            while [m.note for m in self_next_n] != [m.note for m in other_next_n]:
                j += 1
                self_next_n = [m for m in self.msgs[j:j + n]]
                if not self_next_n:
                    break
                if len(self_next_n) < n:
                    # break
                    n = len(self_next_n)
                for k in range(i, other_len - (n - 1)):
                    other_next_n = [m for m in other.msgs[k:k + n]]
                    if [m.note for m in other_next_n] == [m.note for m in self_next_n]:
                        reach = 0
                        while k + n + reach < other_len and j + n + reach < self_len:
                            if self.msgs[j + n + reach].note == other.msgs[k + n + reach].note:
                                reach += 1

                            else:
                                break
                        intersection.extend(self.msgs[j:j + n + reach])
                        self_next_n = self.msgs[j:j + n]
                        j += reach + n
                        # intersection.extend(self.msgs[j:j + n])
                        # j += n
                        break
                other_next_n = other.msgs[i:i + n]

            j += n
            i += n
            if i + n >= other_len or j + n >= self_len:
                break
        return MsgList(intersection).normalized if intersection else None

    # @eye
    def get_tempo_ratio_alternative(self, other: 'MsgList') -> float:
        """Returns the ratio between the sums of the msg time differences, of self and other.
        Maybe more useful when one of the lists is really short"""
        self_len = len(self)
        other_len = len(other)
        if self_len <= 1 or other_len <= 1:
            return 1
        self_deltas = 0
        other_deltas = 0
        for i, m in enumerate(self.normalized[:-1]):
            self_deltas += self.normalized[i + 1].time - m.time
        for i, m in enumerate(other.normalized[:-1]):
            other_deltas += other.normalized[i + 1].time - m.time

        self_avg = self_deltas / self_len
        other_avg = other_deltas / other_len
        return other_avg / self_avg

    # @eye
    def get_tempo_ratio(self, other: 'MsgList', *,
                        exclude_if_note_mismatch=False,
                        only_note_on=False,
                        strict_chord_handling=True) -> float:
        """
        Returns the average msg time difference ratio between matching indices of self and other.
        :param exclude_if_note_mismatch: Don't add ratio to final sum if notes don't match
        :param only_note_on: Only include note ON msgs (skip note OFF)
        :param strict_chord_handling: If False, both msgs need to be a part of chord to ignore their ratio (higher requirements to skip). If True, skip ratio if one or more is part of chord.
        """

        # TODO: "only_note_on = True" seems to yield better results
        # noinspection PyUnreachableCode
        def _find_joining_index(_i):
            raise NotImplementedError()
            for _j in range(_i, len(shorter[_i:])):
                pass

        if exclude_if_note_mismatch:
            raise NotImplementedError(
                "Called MsgList.get_relative_tempo(other, exclude_if_note_mismatch=True). No need to check notes because bad accuracy doesn't get its rhythm checked")
        time_delta_ratios = []
        if only_note_on:
            self_msgs, _ = self.normalized.split_to_on_off()
            other_msgs, _ = other.normalized.split_to_on_off()
        else:
            self_msgs = self.normalized
            other_msgs = other.normalized
        self_len = len(self_msgs)
        other_len = len(other_msgs)
        if self_len <= 1 or other_len <= 1:
            return None

        for i in range(min(self_len, other_len) - 1):
            self_msg = self_msgs[i]
            self_next = self_msgs[i + 1]
            other_msg = other_msgs[i]
            other_next = other_msgs[i + 1]
            ratio = None
            if exclude_if_note_mismatch:
                if self_msg.note != other_msg.note:
                    ratio = None
                # TODO: maybe check for difference in next note?
                # elif self_next.note != other_next.note:
                #     ratio = None
            else:
                self_delta = round(self_next.time - self_msg.time, 5)
                other_delta = round(other_next.time - other_msg.time, 5)
                if strict_chord_handling:
                    skip = self_delta <= consts.CHORD_THRESHOLD or other_delta <= consts.CHORD_THRESHOLD
                else:
                    skip = self_delta <= consts.CHORD_THRESHOLD and other_delta <= consts.CHORD_THRESHOLD
                if skip:
                    ratio = None
                elif other_delta == 0 and self_delta == 0:
                    ratio = 1
                else:
                    ratio = other_delta / self_delta
            if ratio is not None:
                time_delta_ratios.append(ratio)

        # Probably no need to round before returning because "create_tempo_shifted" does this
        return sum(time_delta_ratios) / len(time_delta_ratios)

    def DEBUG_set_time_deltas(self) -> None:
        # *  NOTE: MISLEADING in partial lists (eg split_on_off)
        for i, m in enumerate(self[1:], 1):
            m.time_delta = round(m.time - self[i - 1].time, 5)

    def DEBUG_set_rel_times(self) -> None:
        # *  NOTE: MISLEADING in partial lists (eg split_on_off)
        first_hit_time = self[0].time
        for m in self[1:]:
            m.rel_time = round(m.time - first_hit_time, 5)

    @staticmethod
    def from_file(path: str) -> 'MsgList':
        with open(path, mode="r") as f:
            lines = f.readlines()

        msgs = [Msg(lines[0])]
        for line in lines[1:]:
            msg = Msg(line)
            if msg.kind == 'on':
                last_on_msg = next(m for m in reversed(msgs) if m.kind == 'on')
                if last_on_msg:
                    msg.set_last_onmsg_time(last_on_msg.time)
            msgs.append(msg)
        return MsgList(msgs)

    @staticmethod
    # @eye
    def from_dicts(*msgs: IMsg) -> 'MsgList':
        """"'Msg' is not subscriptable" is raised if accidentally passed actual Msg and not a dict"""
        constructed = []
        for m in msgs:
            if m['kind'] == 'off':
                m.update(velocity=None,
                         last_onmsg_time=None)
            else:
                if not m.get('last_onmsg_time'):
                    if constructed:
                        try:
                            last_on_msg = next((m for m in reversed(constructed) if m.kind == 'on'))
                        except StopIteration:
                            m.update(last_onmsg_time=None)
                        else:
                            if last_on_msg:
                                m.update(last_onmsg_time=last_on_msg.time)
                            else:
                                m.update(last_onmsg_time=None)
                    else:
                        m.update(last_onmsg_time=None)
            constructed.append(Msg.from_dict(**m))
        return MsgList(constructed)

    def to_dict(self) -> List[IMsg]:
        return [msg.to_dict() for msg in self]

    def to_file(self, path: str, *, overwrite=False):
        lines = [m.to_line() for m in self.msgs]
        with open(path, mode="w" if overwrite else "x") as f:
            f.writelines(lines)


register_repr(Msg)(normal_repr)
# register_repr(list)(normal_repr)
register_repr(MsgList)(normal_repr)
