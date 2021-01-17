def main(file: str, quiet=False):
    if not quiet:
        print(f'\nfix_d_ts_reference_types.py | {file = }, {quiet = }')
    import time
    import re
    from pathlib import Path
    time.sleep(0.025)
    with open(file) as f:
        txt = f.read()
    
    depth = len(Path(file).relative_to('declarations').parts)
    if depth == 1:
        prefix = '../'
    else:
        prefix = '../' * depth
    fixed_txt = re.sub(r'(?<=/// <reference types=")(\./)(node_modules[^"]*)', lambda m: f'{prefix}{m.group(2)}', txt)
    if file.endswith('util.d.ts') and "declarations/renderer" not in fixed_txt:
        fixed_txt = f'/// <reference types="{prefix}declarations/renderer" />\n{fixed_txt}'
    if file.endswith('error.d.ts') and "declarations/renderer" not in fixed_txt:
        fixed_txt = f'/// <reference types="{prefix}declarations/renderer" />\n{fixed_txt}'
    with open(file, mode='w') as f:
        f.write(fixed_txt)
    # print(f'\t\x1b[1;97mfixed /// <reference types "{ref_path}" → "{fixed_path}" in {file}\x1b[0m\n\n')
    if not quiet:
        print(f'\t\x1b[1;97mfixed "/// <reference types" in {file}\x1b[0m\n\n')


if __name__ == '__main__':
    import sys
    
    main(*sys.argv[1:])
