function $fadeOut(jQuery, ms) {
    return new Promise(resolve => jQuery.fade(ms, 0, resolve));
}
function $fadeIn(jQuery, ms) {
    return new Promise(resolve => jQuery.fade(ms, 1, resolve));
}
async function $fadeInMany(ms, ...jQueries) {
    let promises = [];
    for (let jQ of jQueries)
        promises.push($fadeIn(jQ, ms));
    return await Promise.all(promises);
}
async function $fadeOutMany(ms, ...jQueries) {
    let promises = [];
    for (let jQ of jQueries)
        promises.push($fadeOut(jQ, ms));
    return await Promise.all(promises);
}
//# sourceMappingURL=asx.js.map