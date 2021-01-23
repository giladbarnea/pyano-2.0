# import settings
# from pygments import highlight
# from pygments.lexers import PythonLexer
# from pygments.formatters import TerminalFormatter, TerminalTrueColorFormatter, Terminal256Formatter
import re
from pprint import pformat as pf

# from more_termcolor import colors
# import os
# import settings
from typing import *
from rich.console import Console

console = Console(log_time_format='[%d.%m.%Y][%T]')
import logging

logging.addLevelName(21, 'GOOD')
logging.addLevelName(22, 'TITLE')
logging.addLevelName(23, 'IMPORTANT')
from rich.logging import RichHandler

rich_handler = RichHandler(console=console,
                           markup=True,
                           rich_tracebacks=True,
                           tracebacks_extra_lines=10,
                           tracebacks_show_locals=True)

FORMAT = "%(message)s"

# noinspection PyArgumentList
logging.basicConfig(
        level="NOTSET",
        format=FORMAT,
        datefmt='[%d.%m.%Y][%T]',
        handlers=[rich_handler]
        )


def _good(self, msg, *args, exc_info=None, stack_info: bool = None, stacklevel: int = 1, extra: dict = None) -> NoReturn:
    # 21: GOOD
    if self.isEnabledFor(21):
        self._log(21, f'[green]{msg}[/]', args, exc_info, extra, stack_info, stacklevel)


def _title(self, msg, *args, exc_info=None, stack_info: bool = None, stacklevel: int = 1, extra: dict = None) -> NoReturn:
    # 22: TITLE
    if self.isEnabledFor(22):
        self._log(22, f'[bold white]{msg}[/]', args, exc_info, extra, stack_info, stacklevel)


def _important(self, msg, *args, exc_info=None, stack_info: bool = None, stacklevel: int = 1, extra: dict = None) -> NoReturn:
    # 23: IMPORTANT
    if self.isEnabledFor(23):
        self._log(23, f'[white]{msg}[/]', args, exc_info, extra, stack_info, stacklevel)


logging.Logger.good = _good
logging.Logger.title = _title
logging.Logger.important = _important
log = logging.getLogger("rich")

# python_lexer = PythonLexer()
# styles = ['default',
#           'emacs',
#           'friendly',
#           'colorful',
#           'autumn',
#           'murphy',
#           'manni',
#           'monokai',
#           'perldoc',
#           'pastie',
#           'borland',
#           'trac',
#           'native',
#           'fruity',
#           'bw',
#           'vim',
#           'vs',
#           'tango',
#           'rrt',
#           'xcode',
#           'igor',
#           'paraiso-light',
#           'paraiso-dark',
#           'lovelace',
#           'algol',
#           'algol_nu',
#           'arduino',
#           'rainbow_dash',
#           'abap',
#           'solarized-dark',
#           'solarized-light',
#           'sas',
#           'stata',
#           'stata-light',
#           'stata-dark']
#
# terminal_formatter = TerminalTrueColorFormatter(style='emacs')
_group_level = 0


def group(name: Optional[str] = None):
    if name:
        debug(colors.white('\n' + name))
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
    # if not settings.DEBUG:
    #     return args
    
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


# def error(*args) -> None:
#     # if not settings.DEBUG:
#     #     return
#     debug(colors.ascii_of_color('red'), *args, colors.ascii_of_reset())
#
#
# def warn(*args) -> None:
#     # if not settings.DEBUG:
#     #     return
#
#     debug(colors.ascii_of_color('yellow'), *args, colors.ascii_of_reset())
#
#
# def debug(*args) -> None:
#     args = _format(*args)
#     print(*args)


def __getattr__(name):
    if name == 'debug':
        return log.debug
    if name == 'info':
        return log.info
    if name == 'warning':
        return log.warning
    if name == 'error':
        return log.error
    if name == 'critical':
        return log.critical
    if name == 'good':
        return log.good
    if name == 'title':
        return log.title
    if name == 'important':
        return log.important
