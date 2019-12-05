declare function is_name(pathLike: string): boolean;
declare function replace_ext(pathLike: string, ext: string): string;
declare function remove_ext(pathLike: string): string;
declare function push_before_ext(pathLike: string, push: string | number): string;
declare function split_ext(pathLike: string): [string, string];
declare function createIfNotExists(path: string): boolean;
declare function isEmpty(abspath: string, { recursive }: {
    recursive: boolean;
}): boolean;
declare function getEmptyDirs(abspath: string): string[];
declare const _default: {
    split_ext: typeof split_ext;
    replace_ext: typeof replace_ext;
    remove_ext: typeof remove_ext;
    push_before_ext: typeof push_before_ext;
    is_name: typeof is_name;
    createIfNotExists: typeof createIfNotExists;
    isEmpty: typeof isEmpty;
    getEmptyDirs: typeof getEmptyDirs;
};
export default _default;
//# sourceMappingURL=index.d.ts.map