declare function mkdir(pathLike: string, options: {
    mode?: number;
    recursive?: boolean;
}): Promise<boolean>;
declare function path_exists(pathLike: string): Promise<boolean>;
declare function replace_ext(pathLike: string, ext: string): string;
declare function remove_ext(pathLike: string): string;
declare function push_before_ext(pathLike: string, push: string | number): string;
declare function basename(pathLike: string, ext?: string): any;
declare function remove(pathLike: string): void;
declare const _default: {
    mkdir: typeof mkdir;
    path_exists: typeof path_exists;
    replace_ext: typeof replace_ext;
    remove_ext: typeof remove_ext;
    push_before_ext: typeof push_before_ext;
    basename: typeof basename;
    remove: typeof remove;
};
export default _default;
//# sourceMappingURL=index.d.ts.map