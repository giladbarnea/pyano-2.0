import json
import sys
import os
from pprint import pformat as pf
from pprint import pprint as pp
import re
from pygments import highlight
from pygments.lexers import PythonLexer
from pygments.formatters import TerminalFormatter, TerminalTrueColorFormatter, Terminal256Formatter

python_lexer = PythonLexer()
styles = ['default',
          'emacs',
          'friendly',
          'colorful',
          'autumn',
          'murphy',
          'manni',
          'monokai',
          'perldoc',
          'pastie',
          'borland',
          'trac',
          'native',
          'fruity',
          'bw',
          'vim',
          'vs',
          'tango',
          'rrt',
          'xcode',
          'igor',
          'paraiso-light',
          'paraiso-dark',
          'lovelace',
          'algol',
          'algol_nu',
          'arduino',
          'rainbow_dash',
          'abap',
          'solarized-dark',
          'solarized-light',
          'sas',
          'stata',
          'stata-light',
          'stata-dark']

terminal_formatter = Terminal256Formatter(style='default')
from datetime import datetime
from typing import Callable, List, Tuple
import inspect
import settings
from mytool import term
import traceback


class SoftError(Exception):
    def __init__(self, *args):
        super().__init__(args)


class Logger:

    def __init__(self, filename):
        try:
            os.mkdir('logs')
        except FileExistsError:
            pass

        # try:
        #     os.mkdir('./counters')
        # except FileExistsError:
        #     pass

        self._filename = os.path.splitext(filename)[0]
        self._logpath = f'logs/{self._filename}.log'
        self._logged_once = False
        # self._counterpath = f'counters/{self._filename}.json'

    @staticmethod
    def _is_stringified(s):
        try:
            parsed = json.loads(s)
            # '{"hello":"what"}'
            return True, f'parsed: {parsed}'

        except ValueError:
            # s is not a real object, but an illegal JSON
            # '{hello:"what"}'
            # "{'hello':'what'}"
            return False, 'ValueError (illegal string)'

        except TypeError:
            # s is a real object
            # {"hello":"what"}
            # {'hello':'what'}
            return False, 'TypeError (real object)'

    @staticmethod
    def _get_first_arg_name():
        frame = inspect.currentframe()
        outerframes = inspect.getouterframes(frame)
        frame_idx = outerframes.index(next(f for f in outerframes if f.frame.f_code.co_name == "<module>"))
        frame = outerframes[frame_idx]
        string = inspect.getframeinfo(frame[0]).code_context[0].strip()
        args = string[string.rfind('(') + 1:string.find(')')]
        if '=' in args:
            arg = str(list(map(lambda s: s[:s.find('=')].strip(),
                               args
                               .replace(' ', '')
                               .split(','))))
        elif '[' in args:
            arg = str(args[args.find('[') + 1:args.find(']')]
                      .replace(' ', '')
                      .split(','))
        else:
            arg = string[string.find('(') + 1:-1].split(',')[0]
        return arg

    def log(self, exp, should_pf=True, include_type=True, include_is_stringified=False, title=None):
        with open(self._logpath, mode="a") as f:
            line = ''
            if not self._logged_once:
                line = '\n-----------------------------------------------------'
                self._logged_once = True

            strftime = datetime.today().strftime("%d.%m.%y %H:%M:%S:%f")
            beginning = f'{line}\n{strftime}'
            if title:
                beginning += f'\n## {title} ##'
            else:
                beginning += f'\n## var name: {self._get_first_arg_name()} ##'

            middle = '\n'
            if should_pf:
                middle += f'{pf(exp)}\n(pfmt)'
            else:
                middle += f'{exp}'

            end = '\n'
            if include_type:
                end += f'({type(exp)})'

            final = '\n'
            if include_is_stringified:
                final += f'(stringified: {self._is_stringified(exp)})\n'

            f.write(f'{beginning}{middle}{end}{final}')
        return strftime

    def log_thin(self, exp, should_pf=True, include_type=False, include_is_stringified=False, title=None):
        return self.log(exp, should_pf, include_is_stringified=include_is_stringified,
                        include_type=include_type, title=title)

    def count(self, obj: list):
        raise NotImplementedError
        # by_dots = location.split('.')
        # obj = {by_dots[0]: by_dots[1]}
        # for i, level in enumerate(by_dots):
        if os.path.isfile(self._counterpath):
            with open(self._counterpath) as f:
                loaded = json.load(f)
        else:
            loaded = obj
        with open(self._counterpath, mode='w') as f:
            json.dump(obj, f)


def dont_raise(fn: Callable):
    def _shelter(*fn_args, **fn_kwargs):
        try:
            return fn(*fn_args, **fn_kwargs)
        except Exception as e:
            if settings.DEBUG:
                tb = sys.exc_info()[2]
                f_summary = traceback.extract_tb(tb)[1]
                filename = f_summary.filename
                line = f_summary.line
                tb_frame = tb.tb_next.tb_frame
                f_locals = tb_frame.f_locals
                lineno = tb_frame.f_lineno
                Dbg.warn(
                    f'Muted exception when calling {fn.__name__} in {os.path.basename(filename)}:{lineno}:',
                    e.args[0],
                    f'line: {line}',
                    f'locals:', f_locals)
            return False

    return _shelter


class Dbg:
    group_level = 0

    @staticmethod
    def group(name: str):
        Dbg.print(term.white('\n' + name))
        Dbg.group_level += 1

    @staticmethod
    def quickgroup(name: str, *args):
        Dbg.group(name)
        Dbg.print(*args)
        Dbg.group_end()

    @staticmethod
    def group_end():
        Dbg.group_level -= 1

    @staticmethod
    def _has_color(arg: any) -> bool:
        try:
            return re.match(r'.*\[\d{1,3}m.*', arg) is not None
        except TypeError as e:
            return False

    @staticmethod
    def _format(*args: any) -> List or Tuple:
        if not settings.DEBUG or not Dbg.group_level:
            return args

        formatted = ['\t' * Dbg.group_level]

        args_len = len(args)
        is_many_args = args_len >= 3
        color_count = 0
        for i, arg in enumerate(args):
            has_color = Dbg._has_color(arg)
            if has_color:
                color_count += 1
            if not has_color:
                if isinstance(arg, dict) or isinstance(arg, list):
                    arg = highlight(pf(arg), python_lexer, terminal_formatter)
                if is_many_args:
                    if i + color_count < args_len - 1:
                        arg = f'{arg}\n'
                    if i > 0 + color_count:
                        arg = f'  {arg}'
            if '\n' in arg:
                arg = arg.replace('\n', '\n' + '\t' * Dbg.group_level)
            formatted.append(arg)
        return formatted

    @staticmethod
    def warn(*args) -> None:
        if not settings.DEBUG:
            return
        Dbg.print(term.ascii_of_color('yellow'), *args, term.ascii_of_reset())

    @staticmethod
    def print(*args) -> None:
        if not settings.DEBUG:
            return
        args = Dbg._format(*args)
        print(*args)


def msg_gen(port):
    for msg in port:
        try:
            if msg.type != 'clock' and msg.velocity:
                yield msg
        except AttributeError:
            yield msg


def prfl(s, js=True):
    print(s if not js else json.dumps(s))
    sys.stdout.flush()


def prjs(s):
    print(json.dumps(s))


def round5(num: float):
    return round(num, 5)
