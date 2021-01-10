def main(file: str, quiet=False):
    if not quiet:
        print(f'\nremove_use_strict.py | file: {file}')
    import time
    time.sleep(0.02)
    with open(file) as f:
        txt = f.read()
    if 'use strict' in txt:
        
        lines = txt.splitlines()
        if 'use strict' not in lines[0]:
            print(f'\t\x1b[1;31m"use strict" in txt but not in first line! {file}\x1b[0m\n\n')
            return
        fixed_lines = lines[1:]
        joined = '\n'.join(fixed_lines)
        with open(file, mode='w') as f:
            f.write(joined)
        if not quiet:
            print(f'\t\x1b[1;97mremoved 0th line from {file}\x1b[0m\n\n')
    # else:
    #     print('\tno "use strict", nothing changed\n\n')


if __name__ == '__main__':
    import sys
    
    main(*sys.argv[1:])
