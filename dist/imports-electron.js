import * as Electron from "electron";
function openDevTools() {
    remote.getCurrentWindow().webContents.openDevTools();
}
console.log('Electron: ', Electron);
// remote.globalShortcut.register('CommandOrControl+Y', openDevTools);
//# sourceMappingURL=imports-electron.js.map