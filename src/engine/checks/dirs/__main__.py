import settings
from common import dbg, pyano_types as ptypes
from checks.dirs import experiments


def main():
    dbg.group('checks.dirs.__main__.py main()')
    experiments.check_and_fix()
    dbg.group_end()


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        if settings.DEBUG:
            from mytool import mytb
            from pprint import pp as pp

            exc_dict = mytb.exc_dict(e)
            pp(exc_dict)
        raise e
