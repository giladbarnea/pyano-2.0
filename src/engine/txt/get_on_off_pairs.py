import settings
from common import dbg, tonode
import sys
import os

truth_file = sys.argv[2]


def main():
    base_path_abs = os.path.join(settings.TRUTHS_PATH_ABS, truth_file)
    on_path_abs = f'{base_path_abs}_on.txt'
    off_path_abs = f'{base_path_abs}_off.txt'
    base_path_abs += '.txt'
    tonode.send(dict(base_path_abs=base_path_abs, on_path_abs=on_path_abs, off_path_abs=off_path_abs))


if __name__ == '__main__':
    main()
