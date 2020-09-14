/**import myfs from "../MyFs";*/
// import * as  pry from "pryjs";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeEmptyDirs = exports.getEmptyDirs = exports.isEmpty = exports.createIfNotExists = exports.is_name = exports.push_before_ext = exports.remove_ext = exports.replace_ext = exports.split_ext = void 0;
console.log('myfs.ts');
// eval(pry.it);
function is_name(pathLike) {
    return path.basename(pathLike) === pathLike;
}
exports.is_name = is_name;
/**{@link remove_ext Uses remove_ext}*/
function replace_ext(pathLike, ext) {
    if (ext.startsWith('.'))
        ext = ext.slice(1);
    return `${remove_ext(pathLike)}.${ext}`;
}
exports.replace_ext = replace_ext;
/**
 * @example
 * remove_ext("experiments/truths/fur_elise_B.txt")
 * >>> experiments/truths/fur_elise_B
 * remove_ext("fur_elise_B.txt")
 * >>> fur_elise_B */
function remove_ext(pathLike) {
    return path.join(path.dirname(pathLike), path.basename(pathLike, path.extname(pathLike)));
}
exports.remove_ext = remove_ext;
/**{@link remove_ext Uses remove_ext} */
function push_before_ext(pathLike, push) {
    // safe because path.extname returns '' if no ext
    let ext = path.extname(pathLike);
    return `${remove_ext(pathLike)}${push}${ext}`;
}
exports.push_before_ext = push_before_ext;
/**@example
 * const [ filename, ext ] = myfs.split_ext("shubi.dubi");
 * >>> filename     // "shubi"
 * >>> ext          // ".dubi"*/
function split_ext(pathLike) {
    // 'shubi.'         'shubi', '.'
    // 'shubi'          'shubi', ''
    // '/home/shubi'    'shubi', ''
    const ext = path.extname(pathLike);
    const filename = path.basename(pathLike, ext);
    return [filename, ext];
}
exports.split_ext = split_ext;
/**Returns whether existed already*/
function createIfNotExists(path) {
    try {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
            console.warn(`createIfNotExists(path) created: ${path}`);
            return false;
        }
        return true;
    }
    catch (e) {
        console.error(`createIfNotExists(${path})`, e);
    }
}
exports.createIfNotExists = createIfNotExists;
function isEmpty(abspath, { recursive }) {
    const items = fs.readdirSync(abspath);
    if (!recursive) {
        return !util.bool(items);
    }
    for (let item of items) {
        const itemAbs = path.join(abspath, item);
        let stats = fs.statSync(itemAbs);
        if (stats.isDirectory()) {
            let empty = isEmpty(itemAbs, { recursive: true });
            if (!empty) {
                return false;
            }
        }
        else {
            return false;
        }
    }
    return true;
}
exports.isEmpty = isEmpty;
/**Returns a list of absolute paths of empty dirs*/
function getEmptyDirs(abspath) {
    const emptyDirs = [];
    const items = fs.readdirSync(abspath);
    let removedFiles = false;
    if (!util.bool(items))
        return [abspath];
    for (let item of items) {
        const itemAbs = path.join(abspath, item);
        let stats = fs.statSync(itemAbs);
        if (stats.isDirectory()) {
            if (isEmpty(itemAbs, { recursive: true })) {
                emptyDirs.push(itemAbs);
            }
            else {
                emptyDirs.push(...getEmptyDirs(itemAbs));
            }
        }
        else {
            console.log('stats.size:', stats.size);
            if (stats.size === 0) {
                fs.unlinkSync(itemAbs);
                removedFiles = true;
            }
        }
    }
    if (removedFiles) {
        // noinspection TailRecursionJS
        return getEmptyDirs(abspath);
    }
    return emptyDirs;
}
exports.getEmptyDirs = getEmptyDirs;
function removeEmptyDirs(abspath) {
    const emptydirs = getEmptyDirs(abspath);
    console.log({ emptydirs });
    for (let dir of emptydirs) {
        fs.rmdirSync(dir);
    }
}
exports.removeEmptyDirs = removeEmptyDirs;