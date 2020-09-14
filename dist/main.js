// Modules to control application life and create native browser window
// import {app, BrowserWindow} from "electron";
const { app, BrowserWindow } = require('electron');
const electronScreen = require('electron').screen;
// @ts-ignore
const path = require('path');
/*const electonReloadPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
require('electron-reload')(__dirname, {
    electron: electonReloadPath
});*/
console.log('%cmain.ts', 'font-weight: bold');
const argv = process.argv.slice(2);
console.table({
    appPath: app.getAppPath(),
    exe: app.getPath("exe"),
    userData: app.getPath("userData"),
    appData: app.getPath("appData"),
    DEBUG: argv.includes('debug'),
    DRYRUN: argv.includes('dry-run'),
    NOPYTHON: argv.includes('no-python'),
    LOG: argv.includes('log'),
});
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
function createWindow() {
    const { width: screenW, height: screenH } = electronScreen.getPrimaryDisplay().workAreaSize;
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: Math.round(screenW),
        height: Math.round(screenH),
        darkTheme: true,
        autoHideMenuBar: true,
        webPreferences: {
            // preload : path.join(__dirname, 'preload.js'),
            experimentalFeatures: true,
            nodeIntegration: true,
            allowRunningInsecureContent: true,
            autoplayPolicy: "no-user-gesture-required",
            enableRemoteModule: true
        },
    });
    // remote.globalShortcut.register('CommandOrControl+Y', () => remote.getCurrentWindow().webContents.openDevTools());
    // mainWindow.setBackgroundColor('#181818');
    /*mainWindow.setSize(1919, 1080, true);
     mainWindow.resizable = true;
     mainWindow.setMenu(null);
     mainWindow.autoHideMenuBar = true;
     mainWindow.maximize();
     mainWindow.setMenuBarVisibility(true);
     mainWindow.setFullScreen(false);*/
    mainWindow.loadFile(path.join(__dirname, "./index.html")).then((done) => {
        console.log(`createWindow() | loaded index.html successfully`);
    }).catch(reason => {
        console.error(`createWindow() | failed loading index.html`, reason);
    });
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
    mainWindow.webContents.addListener("unresponsive", (...args) => {
        console.exception('main.ts mainWindow.webContents unresponsive!');
    });
    mainWindow.on("unresponsive", (...args) => {
        console.exception('main.ts mainWindow unresponsive!');
    });
}
process.on("unhandledRejection", (reason, promise) => {
    console.exception('main.ts process unhandledRejection!');
});
process.on("uncaughtException", error => {
    console.exception('main.ts process uncaughtException!');
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin')
        app.quit();
});
app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    // @ts-ignore
    if (mainWindow === null)
        createWindow();
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
