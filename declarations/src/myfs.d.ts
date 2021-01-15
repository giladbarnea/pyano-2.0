/**import myfs from "../MyFs";*/
declare function is_name(pathLike: string): boolean;
/**{@link remove_ext Uses remove_ext}*/
declare function replace_ext(pathLike: string, ext: string): string;
/**
 * @example
 * remove_ext("experiments/truths/fur_elise_B.txt")
 * >>> experiments/truths/fur_elise_B
 * remove_ext("fur_elise_B.txt")
 * >>> fur_elise_B */
declare function remove_ext(pathLike: string): string;
/**{@link remove_ext Uses remove_ext} */
declare function push_before_ext(pathLike: string, push: string | number): string;
/**@example
 * const [ filename, ext ] = myfs.split_ext("shubi.dubi");
 * >>> filename     // "shubi"
 * >>> ext          // ".dubi"*/
declare function split_ext(pathLike: string): [string, string];
/**Returns whether existed already*/
declare function createIfNotExists(path: string): boolean;
declare function isEmpty(abspath: string, { recursive }: {
    recursive: boolean;
}): boolean;
/**Returns a list of absolute paths of empty dirs*/
declare function getEmptyDirs(abspath: string): string[];
declare function removeEmptyDirs(abspath: string): void;
export { split_ext, replace_ext, remove_ext, push_before_ext, is_name, createIfNotExists, isEmpty, getEmptyDirs, removeEmptyDirs };
