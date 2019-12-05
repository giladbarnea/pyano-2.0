"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('MyFs.index.ts');
const fs = require("fs");
const path = require("path");
function is_name(pathLike) {
    return path.basename(pathLike) === pathLike;
}
function replace_ext(pathLike, ext) {
    if (ext.startsWith('.'))
        ext = ext.slice(1);
    return `${remove_ext(pathLike)}.${ext}`;
}
function remove_ext(pathLike) {
    return path.join(path.dirname(pathLike), path.basename(pathLike, path.extname(pathLike)));
}
function push_before_ext(pathLike, push) {
    let ext = path.extname(pathLike);
    return `${remove_ext(pathLike)}${push}${ext}`;
}
function split_ext(pathLike) {
    const ext = path.extname(pathLike);
    const filename = path.basename(pathLike, ext);
    return [filename, ext];
}
function createIfNotExists(path) {
    try {
        if (!fs.existsSync(path)) {
            console.warn(`createIfNotExists(path) creating: ${path}`);
            fs.mkdirSync(path);
        }
    }
    catch (e) {
        console.error(`createIfNotExists(${path})`, e);
    }
}
exports.default = { split_ext, replace_ext, remove_ext, push_before_ext, is_name, createIfNotExists };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7QUFFN0IseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUk3QixTQUFTLE9BQU8sQ0FBQyxRQUFnQjtJQUM3QixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssUUFBUSxDQUFBO0FBQy9DLENBQUM7QUFHRCxTQUFTLFdBQVcsQ0FBQyxRQUFnQixFQUFFLEdBQVc7SUFDOUMsSUFBSyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztRQUNwQixHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2QixPQUFPLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzVDLENBQUM7QUFTRCxTQUFTLFVBQVUsQ0FBQyxRQUFnQjtJQUNoQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5RixDQUFDO0FBSUQsU0FBUyxlQUFlLENBQUMsUUFBZ0IsRUFBRSxJQUFxQjtJQUU1RCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pDLE9BQU8sR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ2xELENBQUM7QUFNRCxTQUFTLFNBQVMsQ0FBQyxRQUFnQjtJQUkvQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25DLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzlDLE9BQU8sQ0FBRSxRQUFRLEVBQUUsR0FBRyxDQUFFLENBQUM7QUFDN0IsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQUMsSUFBWTtJQUNuQyxJQUFJO1FBQ0EsSUFBSyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUc7WUFDeEIsT0FBTyxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMxRCxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFBO1NBQ3JCO0tBRUo7SUFBQyxPQUFRLENBQUMsRUFBRztRQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMscUJBQXFCLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ2xEO0FBQ0wsQ0FBQztBQUdELGtCQUFlLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiY29uc29sZS5sb2coJ015RnMuaW5kZXgudHMnKTtcbi8qKmltcG9ydCBteWZzIGZyb20gXCIuLi9NeUZzXCI7Ki9cbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgYm9vbCB9IGZyb20gXCIuLi91dGlsXCI7XG5cblxuZnVuY3Rpb24gaXNfbmFtZShwYXRoTGlrZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHBhdGguYmFzZW5hbWUocGF0aExpa2UpID09PSBwYXRoTGlrZVxufVxuXG4vKip7QGxpbmsgcmVtb3ZlX2V4dCBVc2VzIHJlbW92ZV9leHR9Ki9cbmZ1bmN0aW9uIHJlcGxhY2VfZXh0KHBhdGhMaWtlOiBzdHJpbmcsIGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoIGV4dC5zdGFydHNXaXRoKCcuJykgKVxuICAgICAgICBleHQgPSBleHQuc2xpY2UoMSk7XG4gICAgcmV0dXJuIGAke3JlbW92ZV9leHQocGF0aExpa2UpfS4ke2V4dH1gO1xufVxuXG5cbi8qKlxuICogQGV4YW1wbGVcbiAqIHJlbW92ZV9leHQoXCJleHBlcmltZW50cy90cnV0aHMvZnVyX2VsaXNlX0IudHh0XCIpXG4gKiA+Pj4gZXhwZXJpbWVudHMvdHJ1dGhzL2Z1cl9lbGlzZV9CXG4gKiByZW1vdmVfZXh0KFwiZnVyX2VsaXNlX0IudHh0XCIpXG4gKiA+Pj4gZnVyX2VsaXNlX0IgKi9cbmZ1bmN0aW9uIHJlbW92ZV9leHQocGF0aExpa2U6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhdGguam9pbihwYXRoLmRpcm5hbWUocGF0aExpa2UpLCBwYXRoLmJhc2VuYW1lKHBhdGhMaWtlLCBwYXRoLmV4dG5hbWUocGF0aExpa2UpKSk7XG59XG5cblxuLyoqe0BsaW5rIHJlbW92ZV9leHQgVXNlcyByZW1vdmVfZXh0fSAqL1xuZnVuY3Rpb24gcHVzaF9iZWZvcmVfZXh0KHBhdGhMaWtlOiBzdHJpbmcsIHB1c2g6IHN0cmluZyB8IG51bWJlcik6IHN0cmluZyB7XG4gICAgLy8gc2FmZSBiZWNhdXNlIHBhdGguZXh0bmFtZSByZXR1cm5zICcnIGlmIG5vIGV4dFxuICAgIGxldCBleHQgPSBwYXRoLmV4dG5hbWUocGF0aExpa2UpO1xuICAgIHJldHVybiBgJHtyZW1vdmVfZXh0KHBhdGhMaWtlKX0ke3B1c2h9JHtleHR9YDtcbn1cblxuLyoqQGV4YW1wbGVcbiAqIGNvbnN0IFsgZmlsZW5hbWUsIGV4dCBdID0gbXlmcy5zcGxpdF9leHQoXCJzaHViaS5kdWJpXCIpO1xuICogPj4+IGZpbGVuYW1lICAgICAvLyBcInNodWJpXCJcbiAqID4+PiBleHQgICAgICAgICAgLy8gXCIuZHViaVwiKi9cbmZ1bmN0aW9uIHNwbGl0X2V4dChwYXRoTGlrZTogc3RyaW5nKTogWyBzdHJpbmcsIHN0cmluZyBdIHtcbiAgICAvLyAnc2h1YmkuJyAgICAgICAgICdzaHViaScsICcuJ1xuICAgIC8vICdzaHViaScgICAgICAgICAgJ3NodWJpJywgJydcbiAgICAvLyAnL2hvbWUvc2h1YmknICAgICdzaHViaScsICcnXG4gICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKHBhdGhMaWtlKTtcbiAgICBjb25zdCBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUocGF0aExpa2UsIGV4dCk7XG4gICAgcmV0dXJuIFsgZmlsZW5hbWUsIGV4dCBdO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJZk5vdEV4aXN0cyhwYXRoOiBzdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAoICFmcy5leGlzdHNTeW5jKHBhdGgpICkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBjcmVhdGVJZk5vdEV4aXN0cyhwYXRoKSBjcmVhdGluZzogJHtwYXRofWApO1xuICAgICAgICAgICAgZnMubWtkaXJTeW5jKHBhdGgpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYGNyZWF0ZUlmTm90RXhpc3RzKCR7cGF0aH0pYCwgZSk7XG4gICAgfVxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IHsgc3BsaXRfZXh0LCByZXBsYWNlX2V4dCwgcmVtb3ZlX2V4dCwgcHVzaF9iZWZvcmVfZXh0LCBpc19uYW1lLCBjcmVhdGVJZk5vdEV4aXN0cyB9XG4iXX0=