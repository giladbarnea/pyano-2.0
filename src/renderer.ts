// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.


const Store = new (require("electron-store"))();
try {
    console.log('trying to get last page from store');
    let last_page = Store.get('last_page');
    if (last_page == 'inside_test') {
        console.log('"last_page" is "inside_test", changing to "new_test"');
        Store.set('last_page', 'new_test');
    }
} catch (e) {
    console.log(`FAILED getting last page from store`, e);
}
// console.dir(store);
module.exports = Store;
