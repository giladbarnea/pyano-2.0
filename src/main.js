const { app, BrowserWindow } = require('electron');
const path = require('path');
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
let mainWindow;
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 1440,
        darkTheme: true,
        autoHideMenuBar: true,
        webPreferences: {
            experimentalFeatures: true,
            nodeIntegration: true,
            allowRunningInsecureContent: true,
            autoplayPolicy: "no-user-gesture-required"
        },
    });
    mainWindow.loadFile(path.join(__dirname, "./index.html")).then((done) => {
    });
    mainWindow.webContents.openDevTools();
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
app.on('ready', createWindow);
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        app.quit();
});
app.on('activate', function () {
    if (mainWindow === null)
        createWindow();
});
//# sourceMappingURL=main.js.map