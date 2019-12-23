# import settings
from pygments import highlight
# noinspection PyUnresolvedReferences
from pygments.lexers import PythonLexer
# noinspection PyUnresolvedReferences
from pygments.formatters import TerminalFormatter, TerminalTrueColorFormatter, Terminal256Formatter
import re
from typing import *
from pprint import pformat as pf
from mytool import term
import os
import settings

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

terminal_formatter = TerminalTrueColorFormatter(style='emacs')
_group_level = 0


def group(name: Optional[str] = None):
    if name:
        debug(term.white('\n' + name))
    global _group_level
    _group_level += 1


def quickgroup(name: Optional[str] = None, *args):
    group(name)
    debug(*args)
    group_end()


def group_end():
    global _group_level
    _group_level -= 1


def _has_color(arg: any) -> bool:
    try:
        return re.match(r'.*\[\d{1,3}m.*', arg) is not None
    except TypeError as e:
        return False


def _format(*args: any) -> List or Tuple:
    # if not os.environ['DEBUG']:
    if not settings.DEBUG:
        return args

    if _group_level:
        formatted = ['\t' * _group_level]
    else:
        formatted = []
    args_len = len(args)
    is_many_args = args_len >= 3
    color_count = 0
    for i, arg in enumerate(args):
        has_color = _has_color(arg)
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
            arg = arg.replace('\n', '\n' + '\t' * _group_level)
        formatted.append(arg)
    return formatted


def ok(*args) -> None:
    if not settings.DEBUG:
        return
    debug(term.ascii_of_color('green'), *args, term.ascii_of_reset())


def error(*args) -> None:
    if not settings.DEBUG:
        return
    debug(term.ascii_of_color('red'), *args, term.ascii_of_reset())


def warn(*args) -> None:
    if not settings.DEBUG:
        return
    debug(term.ascii_of_color('yellow'), *args, term.ascii_of_reset())


def debug(*args) -> None:
    if not settings.DEBUG:
        return
    args = _format(*args)
    print(*args)
