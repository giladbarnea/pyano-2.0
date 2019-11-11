// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
var Renderer = { foo: 'hi' };
var store = new (require("electron-store"))();
console.dir(store);
//# sourceMappingURL=renderer.js.map