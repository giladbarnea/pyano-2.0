import itertools
from typing import *
import re
from birdseye import eye

from . import consts, tonode
from copy import deepcopy
from pprint import pformat
from collections import OrderedDict as OD
from cheap_repr import normal_repr, register_repr

Kind = Any
Chords = Dict[int, List[int]]
IMsg = Any


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

        # time, note, velocity, kind = filter(lambda x: x, re.split(r'\s', line))
        self.time = round(float(time), 5)
        # self.note = int(note[note.index("=") + 1:])
        _, _, self.note = note.partition('=')
        self.kind: Kind = kind.strip()
        self.set_last_onmsg_time(last_onmsg_time)
        if self.kind == 'on':
            _, _, self.velocity = velocity.partition('=')
        else:
            self.velocity = None

    def set_last_onmsg_time(self, last_onmsg_time: Optional[float]):
        """Also sets ``self.last_onmsg_time``"""
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
        basic = {f'msgs': msgs_len, '_is_self_normalized': self._is_self_normalized}
        if self._normalized is not None:
            if len(self._normalized < 3):
                _normalized = self._normalized
            else:
                _normalized = self._normalized[:2] + self._normalized[-2:]
            basic.update(normalized=_normalized)
        if self._chords is not None:
            basic.update(chords=self._chords)

        return pformat(basic, indent=2)

    def __add__(self, other) -> 'MsgList':
        return MsgList([self.msgs + other.msgs])

    def last_on_index(self, end: Optional[int] = None) -> int:
        if end is None:
            end = len(self)
        for i in reversed(range(end)):
            if self[i].kind == 'on':
                return i

    @property
    # @eye
    def normalized(self) -> 'MsgList':
        if self._is_self_normalized:
            return self
        elif self._normalized is not None:
            return self._normalized
        # if self.chords is None:
        #     self.chords = self.get_chords()
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
    def chords(self) -> Chords:
        """
        Same output for normalized / non-normalized
        Warns node if passed only on messages but handles the same (same output for base messages)
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
            tonode.warn(
                f'get_chords() got self.msgs that only has on messages, len(self.msgs): {len(self.msgs)}')

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
            is_chord_with_prev = round(msg.time - self[last_on_index].time, 5) <= consts.CHORD_THRESHOLD
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

    def get_on_off_pairs(self) -> List[Tuple[Msg, Msg]]:
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

    def create_tempo_shifted(self, factor: float) -> 'MsgList':
        """Higher is faster. Returns a combined MsgList which is tempo-shifted.
        Keeps original chords when slowed down. May create false chords when sped up.
        Untested on non-normalized"""
        if factor > 10 or factor < 0.25:
            tonode.warn(f'create_tempo_shifted() got bad factor: {factor}')

        self_C = deepcopy(self)

        flat_chord_indices = self._flat_chord_indices()
        for i in range(len(self_C) - 1):
            msg = self_C[i]
            next_msg = self_C[i + 1]
            delta = round((self[i + 1].time - self[i].time) / factor, 5)
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
                except StopIteration:
                    next_msg.set_last_onmsg_time(None)
                else:
                    next_msg.set_last_onmsg_time(last_on_msg.time)

        return MsgList(self_C.msgs)

    def _flat_chord_indices(self) -> List[int]:
        return list(itertools.chain(*[(root, *members) for root, members in self.chords.items()]))

    # @eye
    def get_relative_tempo_B(self, otherlist, i):
        self_msg = self.normalized[i]
        self_next = self.normalized[i + 1]
        other_msg = otherlist.normalized[i]
        other_next = otherlist.normalized[i + 1]
        ### Uncommenting makes get_relative_tempo_edge_cases fail
        # if self_msg.note != other_msg.note:
        #     return None
        # if self_next.note != other_next.note:
        #     return None
        self_delta = round(self_next.time - self_msg.time, 5)
        other_delta = round(other_next.time - other_msg.time, 5)
        if self_delta <= consts.CHORD_THRESHOLD or other_delta <= consts.CHORD_THRESHOLD:
            return None
        if other_delta == 0 and self_delta == 0:
            return 1
        return other_delta / self_delta

    # @eye
    def get_relative_tempo(self, other: 'MsgList', *, acknowledge_notes=False) -> float:
        def _find_joining_index(_i):
            for _j in range(_i, len(shorter[_i:])):
                pass

        time_delta_ratios = []
        self_len = len(self)
        other_len = len(other)
        if self_len <= 1 or other_len <= 1:
            return 1
        if self_len < other_len:
            shorter = self
        elif self_len == other_len:
            shorter = None
        else:
            shorter = other
        for i in range(min(self_len, other_len) - 1):
            # ratio = self.get_relative_tempo_B(other, i)
            self_msg = self.normalized[i]
            self_next = self.normalized[i + 1]
            other_msg = other.normalized[i]
            other_next = other.normalized[i + 1]
            ### Uncommenting makes get_relative_tempo_edge_cases fail
            if self_msg.note != other_msg.note and acknowledge_notes:
                ratio = None
            else:
                # if self_next.note != other_next.note:
                #     return None
                self_delta = round(self_next.time - self_msg.time, 5)
                other_delta = round(other_next.time - other_msg.time, 5)
                if self_delta <= consts.CHORD_THRESHOLD or other_delta <= consts.CHORD_THRESHOLD:
                    ratio = None
                elif other_delta == 0 and self_delta == 0:
                    ratio = 1
                else:
                    ratio = other_delta / self_delta
            if ratio is not None:
                time_delta_ratios.append(ratio)
        try:
            return sum(time_delta_ratios) / len(time_delta_ratios)
        except ZeroDivisionError as ze:
            try:
                return self.get_relative_tempo(other, acknowledge_notes=not acknowledge_notes)
            except ZeroDivisionError as ze2:
                raise ze2

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
register_repr(MsgList)(normal_repr)
