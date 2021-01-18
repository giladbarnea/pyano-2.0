#!/usr/bin/env python3.8
def or_difference(s1: set, s2: set):
    return s1-s2, s2-s1
    # return s1.difference(s2).union(s2.difference(s1))


def main():
    from pathlib import Path
    import sys
    
    declarations_dirs = list(filter(Path.is_dir, Path('declarations').iterdir()))
    declarations_files = list(filter(Path.is_file, Path('declarations').iterdir()))
    
    src_dirs = list(filter(lambda p: p.is_dir() and list(p.glob('*')), Path('src').iterdir()))
    src_dirs_with_ts_files = list(filter(lambda p: p.is_dir() and list(p.glob('**/*.ts')), Path('src').iterdir()))
    src_files = list(filter(lambda p: p.is_file() and p.suffix == '.ts', Path('src').iterdir()))
    src_dirs_stems = {d.stem for d in src_dirs}
    src_dirs_with_ts_files_stems = {d.stem for d in src_dirs_with_ts_files}
    src_files_stems = {d.stem for d in src_files}
    
    declarations_dirs_stems = {d.stem for d in declarations_dirs}
    if src_dirs_with_ts_files_stems != declarations_dirs_stems:
        only_in_src, only_in_dec = or_difference(src_dirs_with_ts_files_stems, declarations_dirs_stems)
        sys.exit(f'\x1b[31m!!\tsrc/ and declarations/ dont have the same dirs. {only_in_src = }, {only_in_dec = }\x1b[0m')
    
    declarations_files_stems = {Path(d.stem).stem for d in declarations_files}
    if src_files_stems != declarations_files_stems:
        only_in_src, only_in_dec = or_difference(src_files_stems, declarations_files_stems)
        sys.exit(f'\x1b[31m!!\tsrc/ and declarations/ dont have the same files. {only_in_src = }, {only_in_dec = }\x1b[0m')
    
    dist_dirs = list(filter(lambda p: p.is_dir() and list(p.glob('*')), Path('dist').iterdir()))
    dist_files = list(filter(lambda p: p.is_file() and p.suffix == '.js', Path('dist').iterdir()))
    
    dist_dirs_stems = {d.stem for d in dist_dirs}
    if src_dirs_stems != dist_dirs_stems:
        only_in_src, only_in_dist = or_difference(src_dirs_stems, dist_dirs_stems)
        sys.exit(f'\x1b[31m!!\tsrc/ and dist/ dont have the same dirs. {only_in_src = }, {only_in_dist = }\x1b[0m')
    
    dist_files_stems = {Path(d.stem).stem for d in dist_files}
    if src_files_stems != dist_files_stems:
        only_in_src, only_in_dist = or_difference(src_files_stems, dist_files_stems)
        sys.exit(f'\x1b[31m!!\tsrc/ and dist/ dont have the same files: {only_in_src = }, {only_in_dist = }\x1b[0m')


if __name__ == '__main__':
    main()
