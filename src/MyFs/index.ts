console.log('MyFs.index.ts');
/**import myfs from "../MyFs";*/
import * as fs from "fs";
import * as path from "path";
import { bool } from "../util";


function is_name(pathLike: string): boolean {
    return path.basename(pathLike) === pathLike
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

/**@example
 * const [ filename, ext ] = myfs.split_ext("shubi.dubi");
 * >>> filename     // "shubi"
 * >>> ext          // ".dubi"*/
function split_ext(pathLike: string): [ string, string ] {
    // 'shubi.'         'shubi', '.'
    // 'shubi'          'shubi', ''
    // '/home/shubi'    'shubi', ''
    const ext = path.extname(pathLike);
    const filename = path.basename(pathLike, ext);
    return [ filename, ext ];
}

function createIfNotExists(path: string) {
    try {
        if ( !fs.existsSync(path) ) {
            console.warn(`createIfNotExists(path) creating: ${path}`);
            fs.mkdirSync(path)
        }
        
    } catch ( e ) {
        console.error(`createIfNotExists(${path})`, e);
    }
}


export default { split_ext, replace_ext, remove_ext, push_before_ext, is_name, createIfNotExists }
