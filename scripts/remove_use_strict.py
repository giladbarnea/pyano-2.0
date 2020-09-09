def main(file):
    print(f'\n\remove_use_strict.py | file: {file}')
    import time
    time.sleep(0.5)
    with open(file) as f:
        txt = f.read()
    if 'use strict' in txt:
        
        lines = txt.splitlines()
        fixed_lines = lines[1:]
        joined = '\n'.join(fixed_lines)
        with open(file, mode='w') as f:
            f.write(joined)
        print(f'\t\x1b[1;97mremoved 0th line from {file}\x1b[0m\n\n')
    else:
        print('\tno "use strict", nothing changed\n\n')


if __name__ == '__main__':
    import sys
    
    main(sys.argv[1])
