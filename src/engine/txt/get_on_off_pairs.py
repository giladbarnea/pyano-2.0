import settings
from common import dbg
import sys

base_path = sys.argv[1]


def main():
    dbg.group('get_on_off_pairs.main()')
    dbg.debug('Hi! sys.argv:', sys.argv)
    dbg.group_end()


if __name__ == '__main__':
    main()
