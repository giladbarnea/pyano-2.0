import settings
from common import dbg

dbg.group('mock sandbox')
dbg.debug(f'settings.mockargs: ', settings.mockargs)
dbg.group_end()


def main():
    pass


if __name__ == '__main__':
    main()
