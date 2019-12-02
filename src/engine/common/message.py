from typing import *
import re
from . import consts, tonode
from copy import deepcopy
from pprint import pformat

Kind = Union[Literal['on'], Literal['off']]
Chords = Dict[int, List[int]]


class IMsg(TypedDict):
    time: float
    note: int
    velocity: int
    kind: Kind
    time_delta: float
    preceding_message_time: Optional[float]


class Msg:
    def __init__(self, line: str, preceding_message_time: float = None):
        # "1549189615.55545  note=72 velocity=65 off"
        regexp = r'^\d{10}(\.?\d+)?\s+note=\d{1,3}\s+velocity=\d{1,3}\s+(on|off)\n?$'  ## Unlimited possible decimal numbers, agnostic to whitespace or tab
        match = re.fullmatch(regexp, line)
        # if not match:
        #     logger.log_thin(dict(line=line, match=match, regexp=regexp), title="Message.__init__ no regex match")
        kind: str
        # time, note, velocity, kind = line.split('\t')
        time, note, velocity, kind = filter(lambda x: x, re.split(r'\s', line))
        self.time = round(float(time), 5)
        self.note = int(note[note.index("=") + 1:])
        self.velocity = int(velocity[velocity.index("=") + 1:])
        self.kind: Kind = kind.strip()

        # self.preceding_message_time = preceding_message_time

        if preceding_message_time:
            self.time_delta = round(self.time - preceding_message_time, 5)
            self.preceding_message_time = round(preceding_message_time, 5)
        else:
            self.time_delta = None
            self.preceding_message_time = None

    def to_line(self) -> str:
        s = f'{self.time}\tnote={self.note}\tvelocity={self.velocity}\t{self.kind}\n'
        return s

    def to_dict(self) -> IMsg:
        return IMsg(time=self.time,
                    note=self.note,
                    velocity=self.velocity,
                    kind=self.kind,
                    time_delta=self.time_delta,
                    preceding_message_time=self.preceding_message_time
                    )

    @staticmethod
    def from_dict(*,
                  time: float,
                  note: int,
                  velocity: int = None,
                  kind: Kind,
                  preceding_message_time: float = None
                  ) -> 'Msg':
        if velocity is None:
            if kind == 'off':
                velocity = 999
            else:
                velocity = 100
        line = f'{float(time)}\tnote={note}\tvelocity={velocity}\t{kind}'
        return Msg(line, preceding_message_time)

    def __str__(self) -> str:
        return f'time: {self.time}  |  note: {self.note}  |  velocity: {self.velocity}  |  time_delta: {self.time_delta}  |  kind: {self.kind}'

    def __repr__(self) -> str:
        return self.__str__()

    def __eq__(self, o) -> bool:
        try:
            most_attrs_equal = (o.time == self.time
                                and o.note == self.note
                                and o.velocity == self.velocity
                                and o.kind == self.kind
                                and o.preceding_message_time == self.preceding_message_time)
            if o.time_delta is None or self.time_delta is None:
                return most_attrs_equal and o.time_delta == self.time_delta
            else:
                return most_attrs_equal and round(o.time_delta, 5) == round(self.time_delta, 5)
        except AttributeError:
            return False


class MsgList:
    msgs: List[Msg]
    chords: Chords
    is_normalized: bool
    normalized: 'MsgList'
    on_msgs: List[Msg]
    off_msgs: List[Msg]

    def __init__(self, base_msgs: List[Msg]):
        self.msgs = base_msgs
        self.chords = None
        self.is_normalized = False
        self.normalized = None
        self.on_msgs = None
        self.off_msgs = None

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

            if self.is_normalized and other.is_normalized:
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
        return pformat({'msgs':          self.msgs,
                        'chords':        pformat(dict(self.chords)),
                        'is_normalized': self.is_normalized,
                        'normalized':    self.normalized,
                        'on_msgs':       self.on_msgs,
                        'off_msgs':      self.off_msgs,
                        }, sort_dicts=False)

    @staticmethod
    def from_file(base_path_abs: str) -> 'MsgList':
        with open(base_path_abs, mode="r") as f:
            lines = f.readlines()

        msgs = [Msg(lines[0])]
        for i, line in enumerate(lines[1:]):
            preceding_message_time = msgs[i].time
            msgs.append(Msg(line, preceding_message_time))
        return MsgList(msgs)

    @staticmethod
    def from_dicts(*msgs: IMsg) -> 'MsgList':
        constructed = []
        for i, m in enumerate(msgs):
            if 'preceding_message_time' not in m:
                if i != 0:
                    m.update(preceding_message_time=msgs[i - 1]['time'])
                else:
                    m.update(preceding_message_time=None)
            if 'velocity' not in m:
                if m['kind'] == 'off':
                    m.update(velocity=999)
                else:
                    m.update(velocity=100)
            constructed.append(Msg.from_dict(**m))
        return MsgList(constructed)

    def normalize(self) -> Tuple['MsgList', bool]:
        """
        If already normalized, returns ``(self.normalized, True)``.
        Otherwise, sets ``self.normalized`` and ``self.is_normalized`` before returning.
        Calls ``self.get_chords()`` if ``self.chords`` is ``None``."""
        if self.is_normalized:
            return self.normalized, True
        if self.chords is None:
            self.chords = self.get_chords()
        is_normalized = True
        base_msgs_C = deepcopy(self)
        msgs_len = len(base_msgs_C)
        for root, rest in self.chords.items():
            """Overwrite chord messages so they are sorted by note, 
            all timed according to lowest pitch note, 
            and share the time delta and preceding message time data of the first-played note"""
            flat_chord: List[int] = [root, *rest]
            if msgs_len <= flat_chord[-1]:
                self.normalized = base_msgs_C
                self.is_normalized = is_normalized
                return base_msgs_C, is_normalized

            msgs_of_chord = [base_msgs_C[i] for i in flat_chord]
            sorted_msgs_of_chord = sorted(deepcopy(msgs_of_chord), key=lambda m: m.note)
            is_already_sorted = msgs_of_chord == sorted_msgs_of_chord
            if is_already_sorted:
                continue

            # not sorted
            is_normalized = False
            for i, msg_i in enumerate(flat_chord):
                base_msgs_C[msg_i].note = sorted_msgs_of_chord[i].note
                base_msgs_C[msg_i].velocity = sorted_msgs_of_chord[i].velocity

        self.normalized = base_msgs_C
        self.is_normalized = is_normalized
        return base_msgs_C, is_normalized

    def get_on_off_tuple(self) -> Tuple[List[Msg], List[Msg]]:
        """Returns ``(self.on_msgs, self.off_msgs)`` if not ``None``.
        Otherwise, sets ``self.chords`` and ``self.off_msgs`` before returning."""
        # TODO: should re-set preceding_message_time?
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

        if all((m.kind == 'on' for m in self.msgs)):
            tonode.warn(
                f'get_chords() got self.msgs that only has on messages, len(self.msgs): {len(self.msgs)}')

        chords = OrderedDict()
        any_roots_open = False
        root_isopen_map = {}
        on_indices = []
        for i, message in enumerate(self.msgs):
            if message.kind == "off":
                if any_roots_open:
                    j = i - 1
                    while j >= 0:
                        if self.msgs[j].kind == 'on' and self.msgs[j].note == message.note:
                            for root in reversed(chords):
                                if root == j:
                                    root_isopen_map[root] = False
                                    break
                        j -= 1
                    any_roots_open = False

                continue
            on_indices.append(i)
            if message.time_delta is None:
                continue
            is_chord_with_prev = message.time_delta <= consts.CHORD_THRESHOLD
            if is_chord_with_prev:
                any_roots_open = True
                last_on_index = on_indices[:-1][-1]
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


def get_on_off_pairs(on_msgs: List[Msg], off_msgs: List[Msg]) -> List[Tuple[Msg, Msg]]:
    pairs = []
    off_msgs_C = off_msgs[:]
    for on_msg in on_msgs:
        matching_off_msg = next((off_msg for off_msg in off_msgs_C
                                 if (off_msg.note == on_msg.note
                                     and off_msg.time > on_msg.time)),
                                None)
        if matching_off_msg is not None:
            off_msgs_C.remove(matching_off_msg)
            pairs.append((on_msg, matching_off_msg))
    return pairs
