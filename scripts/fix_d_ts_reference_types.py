def main(file):
    print(f'\nfix_d_ts_reference_types.py | file: {file}')
    import time
    import re
    time.sleep(0.045)
    with open(file) as f:
        txt = f.read()

    match = re.search(r'(?<=/// <reference types=")\./[^"]*', txt)
    if not match:
        print('\tno \'/// reference types="./\', nothing changed\n\n')
        return
    
    ref_path = match.group()
    fixed_path = f'.{ref_path}'
    fixed_txt = txt.replace(ref_path, fixed_path)
    with open(file, mode='w') as f:
        f.write(fixed_txt)
    print(f'\t\x1b[1;97mfixed /// <reference types "{ref_path}" → "{fixed_path}" in {file}\x1b[0m\n\n')


if __name__ == '__main__':
    import sys
    
    main(sys.argv[1])
