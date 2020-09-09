Object.defineProperty(exports, "__esModule", { value: true });
console.log('myfs.ts');
function is_name(pathLike) {
    return path.basename(pathLike) === pathLike;
}
exports.is_name = is_name;
function replace_ext(pathLike, ext) {
    if (ext.startsWith('.'))
        ext = ext.slice(1);
    return `${remove_ext(pathLike)}.${ext}`;
}
exports.replace_ext = replace_ext;
function remove_ext(pathLike) {
    return path.join(path.dirname(pathLike), path.basename(pathLike, path.extname(pathLike)));
}
exports.remove_ext = remove_ext;
function push_before_ext(pathLike, push) {
    let ext = path.extname(pathLike);
    return `${remove_ext(pathLike)}${push}${ext}`;
}
exports.push_before_ext = push_before_ext;
function split_ext(pathLike) {
    const ext = path.extname(pathLike);
    const filename = path.basename(pathLike, ext);
    return [filename, ext];
}
exports.split_ext = split_ext;
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
//# sourceMappingURL=myfs.js.map