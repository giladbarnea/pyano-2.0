import settings
from common import dbg, tonode
import sys

base_path = sys.argv[1]


def main():
    # dbg.group('get_on_off_pairs.main()')
    # tonode.send('Hi!!!', 'Everyone!!')
    tonode.send(dict(Just="Dict!!"))
    tonode.send('Shtroodle Padoodle String')
    tonode.send(42)
    # dbg.group_end()


if __name__ == '__main__':
    main()
