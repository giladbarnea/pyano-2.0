var remote = require('electron').remote;
export function sayHi() {
    console.log('function sayHi() from src/exportfile.ts');
}
function openDevTools() {
    remote.getCurrentWindow().webContents.openDevTools();
}
remote.globalShortcut.register('CommandOrControl+Y', openDevTools);
//# sourceMappingURL=exportfile.js.map