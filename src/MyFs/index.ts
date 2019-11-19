console.log('MyFs.index.ts');
import * as fs from "fs";
import { bool } from "../util";


function mkdir(pathLike: string, options: { mode?: number; recursive?: boolean; }): Promise<boolean> {
    console.warn('MyFs.mkdir: should use vanilla mkdirSync.');
    return new Promise(resolve =>
        fs.mkdir(pathLike, options, err => resolve(!bool(err))));
}


function path_exists(pathLike: string): Promise<boolean> {
    console.warn('MyFs.path_exists: should use vanilla existsSync.');
    return new Promise(resolve =>
        fs.access(pathLike, fs.constants.F_OK, err => resolve(!bool(err))));
}


/**{@link remove_ext Uses remove_ext}*/
function replace_ext(pathLike: string, ext: string): string {
    if ( ext.startsWith('.') )
        ext = ext.slice(1);
    return `${remove_ext(pathLike)}.${ext}`;
}


/**
 * @example
 * remove_ext("experiments/truths/fur_elise_B.txt")
 * >>> experiments/truths/fur_elise_B
 * remove_ext("fur_elise_B.txt")
 * >>> fur_elise_B */
function remove_ext(pathLike: string): string {
    return path.join(path.dirname(pathLike), path.basename(pathLike, path.extname(pathLike)));
}


/**{@link remove_ext Uses remove_ext} */
function push_before_ext(pathLike: string, push: string | number): string {
    // safe because path.extname returns '' if no ext
    let ext = path.extname(pathLike);
    return `${remove_ext(pathLike)}${push}${ext}`;
}


function basename(pathLike: string, ext?: string) {
    console.warn('MyFs.basename: this just wraps vanilla path.basename.');
    if ( !ext )
        return path.basename(pathLike);
    return path.basename(pathLike, ext);
}


function remove(pathLike: string) {
    console.warn('MyFs.remove: this just wraps unlinkSync.');
    fs.unlinkSync(pathLike);
}

export default { mkdir, path_exists, replace_ext, remove_ext, push_before_ext, basename, remove }