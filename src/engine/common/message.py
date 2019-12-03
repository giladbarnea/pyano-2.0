from typing import *
import re
from . import consts, tonode
from copy import deepcopy
from pprint import pformat
from collections import OrderedDict as OD

Kind = Union[Literal['on'], Literal['off']]
Chords = Dict[int, List[int]]


class IMsg(TypedDict):
    time: float
    note: int
    kind: Kind
    velocity: Optional[int]
    time_delta: Optional[float]
    last_onmsg_time: Optional[float]


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
        if rest:
            velocity, kind = first, rest[0]
        else:
            kind = first

        # time, note, velocity, kind = filter(lambda x: x, re.split(r'\s', line))
        self.time = round(float(time), 5)
        # self.note = int(note[note.index("=") + 1:])
        _, _, self.note = note.partition('=')
        self.kind: Kind = kind.strip()
        self.set_time_delta(last_onmsg_time)
        if self.kind == 'on':
            _, _, self.velocity = velocity.partition('=')
        else:
            self.velocity = None

    def set_time_delta(self, last_onmsg_time: Optional[float]):
        """Also sets ``self.last_onmsg_time``"""
        if last_onmsg_time is not None:
            self.time_delta = round(self.time - last_onmsg_time, 5)
            self.last_onmsg_time = round(last_onmsg_time, 5)
        else:
            self.time_delta = None
            self.last_onmsg_time = None

    def to_line(self) -> str:
        s = f'{self.time}\tnote={self.note}\tvelocity={self.velocity}\t{self.kind}\n'
        return s

    def to_dict(self) -> IMsg:
        return IMsg(time=self.time,
                    note=self.note,
                    velocity=self.velocity,
                    kind=self.kind,
                    time_delta=self.time_delta,
                    last_onmsg_time=self.last_onmsg_time
                    )

    @staticmethod
    def from_dict(*,
                  time: float,
                  note: int,
                  velocity: int = None,
                  kind: Kind,
                  last_onmsg_time: float = None
                  ) -> 'Msg':
        if kind == 'off':
            line = f'{round(float(time), 5)}\tnote={note}\t{kind}'
        else:
            line = f'{round(float(time), 5)}\tnote={note}\tvelocity={velocity}\t{kind}'
        return Msg(line, last_onmsg_time)

    def __str__(self) -> str:
        time = str(self.time)
        _, _, decimals = time.partition('.')
        if (dec_len := len(decimals)) < 5:
            time += ' ' * (5 - dec_len)
        start = f'time: {time}\tnote: {self.note}\tkind: {self.kind}'
        time_delta = str(self.time_delta)
        _, _, decimals = time_delta.partition('.')
        if (dec_len := len(decimals)) < 2:
            time_delta += ' ' * (2 - dec_len)

        end = f'\tvelocity: {self.velocity}\ttime_delta: {time_delta}\tlast_onmsg_time: {self.last_onmsg_time}'
        return f'{start}{end}'

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
            if o.time_delta is None or self.time_delta is None:
                if o.time_delta != self.time_delta:
                    return False
            else:
                if round(o.time_delta, 5) != round(self.time_delta, 5):
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
    on_msgs: List[Msg]
    off_msgs: List[Msg]

    # TODO: on_off_pairs?

    def __init__(self, base_msgs: List[Msg]):
        self.msgs = base_msgs
        self.chords = None
        self._is_self_normalized = False
        """Whether ``self.msgs`` is normalized. """
        self._normalized = None
        self.on_msgs = None
        self.off_msgs = None

    @property
    def normalized(self) -> 'MsgList':
        if self._is_self_normalized:
            return self
        if self.chords is None:
            self.chords = self.get_chords()
        normalized = deepcopy(self)  # [:] not enough. same for sorted
        normalized_len = len(normalized)
        for root, rest in self.chords.items():
            flat_chord: List[int] = [root, *rest]
            if normalized_len <= flat_chord[-1]:
                self.normalized = normalized
                return normalized

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

        self.normalized = normalized

        return normalized

    @normalized.setter
    def normalized(self, val: 'MsgList'):
        self._normalized = val
        self._is_self_normalized = val == self.msgs

    def __iter__(self):
        yield from self.msgs

    def __getitem__(self, index):
        return self.msgs[index]

    def __len__(self):
        return len(self.msgs)

    def __eq__(self, other):
        try:
            msgs_equal = other.msgs == self.msgs
            if not msgs_equal:
                return False

            ## In case self and other both have a property with value, require equal values

            if self.is_self_normalized and other.is_normalized:
                if self.normalized != other.normalized:
                    return False

            if self.chords and other.chords:
                if self.chords != other.chords:
                    return False

            if self.on_msgs and other.on_msgs:
                if self.on_msgs != other.on_msgs:
                    return False

            if self.off_msgs and other.off_msgs:
                if self.off_msgs != other.off_msgs:
                    return False
            return True

        except AttributeError:
            return other == self.msgs

    def __repr__(self) -> str:
        return pformat({'msgs':               self.msgs,
                        'chords':             pformat(dict(self.chords)) if self.chords else None,
                        'is_self_normalized': self.is_self_normalized,
                        'normalized':         self.normalized,
                        'on_msgs':            self.on_msgs,
                        'off_msgs':           self.off_msgs,
                        }, sort_dicts=False)

    @staticmethod
    def from_file(base_path_abs: str) -> 'MsgList':
        with open(base_path_abs, mode="r") as f:
            lines = f.readlines()

        msgs = [Msg(lines[0])]
        for i, line in enumerate(lines[1:]):
            msg = Msg(line)
            if msg.kind == 'on':
                last_on_msg = next((m for m in reversed(msgs) if m.kind == 'on'))
                if last_on_msg:
                    msg.set_time_delta(last_on_msg.time)
            msgs.append(msg)
        return MsgList(msgs)

    @staticmethod
    def from_dicts(*msgs: IMsg) -> 'MsgList':
        constructed = []
        for m in msgs:
            if m['kind'] == 'off':
                m.update(velocity=None,
                         last_onmsg_time=None)
            else:
                if not m.get('last_onmsg_time'):
                    if constructed:
                        last_on_msg = next((m for m in reversed(constructed) if m.kind == 'on'))
                        if last_on_msg:
                            m.update(last_onmsg_time=last_on_msg.time)
                        else:
                            m.update(last_onmsg_time=None)
                    else:
                        m.update(last_onmsg_time=None)

                if 'velocity' not in m:  # TODO: remove this
                    m.update(velocity=100)
            constructed.append(Msg.from_dict(**m))
        return MsgList(constructed)

    def to_file(self):
        pass

    def get_normalized(self) -> Tuple['MsgList', bool]:
        """
        If already normalized, returns ``(self.normalized, True)``.
        Otherwise, sets ``self.normalized`` and ``self.is_self_normalized`` before returning.
        Calls ``self.get_chords()`` if ``self.chords`` is ``None``."""
        if self.is_self_normalized:
            return self, True
        if self.chords is None:
            self.chords = self.get_chords()
        is_self_normalized = True
        normalized = deepcopy(self)  # [:] not enough. same for sorted
        normalized_len = len(normalized)
        for root, rest in self.chords.items():
            flat_chord: List[int] = [root, *rest]
            if normalized_len <= flat_chord[-1]:
                self.normalized = normalized
                self.normalized.is_self_normalized = True
                self.is_self_normalized = is_self_normalized
                # print(f'self.is_self_normalized: {self.is_self_normalized}\tself.normalized is None: {self.normalized is None}')
                return normalized, is_self_normalized

            """Overwrite chord messages so they are sorted by note, 
                all timed according to lowest pitch note, 
                and share the time delta and last_onmsg_time of the first-played note"""
            msgs_of_chord = [normalized[i] for i in flat_chord]
            sorted_msgs_of_chord = sorted(deepcopy(msgs_of_chord), key=lambda m: m.note)
            is_already_sorted = msgs_of_chord == sorted_msgs_of_chord
            if is_already_sorted:
                continue

            # not sorted
            is_self_normalized = False
            for i, msg_i in enumerate(flat_chord):
                normalized[msg_i].note = sorted_msgs_of_chord[i].note
                normalized[msg_i].velocity = sorted_msgs_of_chord[i].velocity

        self.normalized = normalized
        self.normalized.is_self_normalized = True
        self.is_self_normalized = is_self_normalized
        # print(f'self.is_self_normalized: {self.is_self_normalized}\tself.normalized is None: {self.normalized is None}')

        return normalized, is_self_normalized

    def split_to_on_off(self) -> Tuple[List[Msg], List[Msg]]:
        """Returns ``(self.on_msgs, self.off_msgs)`` if not ``None``.
        Otherwise, sets ``self.chords`` and ``self.off_msgs`` before returning.
        Different (bad) output for not normalized."""
        # TODO: should re-set last_onmsg_time?
        if self.on_msgs and self.off_msgs:
            return self.on_msgs, self.off_msgs
        on_msgs = []
        off_msgs = []
        for m in self.msgs:
            if m.kind == 'on':
                on_msgs.append(m)
            else:
                off_msgs.append(m)
        self.on_msgs = on_msgs
        self.off_msgs = off_msgs
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

    def get_chords(self) -> Chords:
        """Returns ``self.chords`` if not ``None``.
        Otherwise, sets ``self.chords`` before returning.
        Handles base messages (same output for normalized / non-normalized)
        Warns node if passed only on messages but handles the same (same output for base messages)
        """
        if self.chords is not None:
            return self.chords

        def _open_new_chord(_root, _members):
            chords[_root] = _members
            root_isopen_map[_root] = True

        def _maybe_close_root(_curr_index: int, _msg: Msg):
            for _j in reversed(range(_curr_index)):
                ## Opposite of "find matching off"
                if self.msgs[_j].kind == 'on' and self.msgs[_j].note == _msg.note:
                    ## If index of matching "on" is a chord root, close it
                    if _j in chords:
                        root_isopen_map[_j] = False
                        break

        def _last_on_index(_curr_index: int) -> int:
            for _j in reversed(range(_curr_index)):
                if self.msgs[_j].kind == 'on':
                    return _j

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
            if msg.time_delta is None:
                continue
            is_chord_with_prev = msg.time_delta <= consts.CHORD_THRESHOLD
            if is_chord_with_prev:
                last_on_index = _last_on_index(i)
                if not chords:
                    _open_new_chord(last_on_index, [i])
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
                        _open_new_chord(newroot, newmembers)
                else:
                    # last note not in chords at all. create a new chord.
                    _open_new_chord(last_on_index, [i])

        self.chords = chords
        return chords
