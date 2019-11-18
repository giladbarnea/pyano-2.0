// Modules to control application life and create native browser window
// import {app, BrowserWindow} from "electron";
var _a = require('electron'), app = _a.app, BrowserWindow = _a.BrowserWindow;
// import * as path from "path";
// @ts-ignore
var path = require('path');
// const electonReloadPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
// console.table({__dirname, electonReloadPath});
// require('electron-reload')(__dirname, {
//     electron: electonReloadPath
// });
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// const Store = require("electron-store");
console.log('%cmain.ts', 'font-weight: bold');
console.table({
    appPath: app.getAppPath(),
    exe: app.getPath("exe"),
    userData: app.getPath("userData"),
    appData: app.getPath("appData"),
    DEBUG: process.argv.slice(2).includes('debug'),
    DRYRUN: process.argv.slice(2).includes('dry-run')
});
var mainWindow;
function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 2000,
        darkTheme: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            experimentalFeatures: true,
            nodeIntegration: true,
            allowRunningInsecureContent: true,
            autoplayPolicy: "no-user-gesture-required"
        }
    });
    mainWindow.setBackgroundColor('#181818');
    /*mainWindow.setSize(1919, 1080, true);
     mainWindow.resizable = true;
     mainWindow.setMenu(null);
     mainWindow.autoHideMenuBar = true;
     mainWindow.maximize();
     mainWindow.setMenuBarVisibility(true);
     mainWindow.setFullScreen(false);*/
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHVFQUF1RTtBQUN2RSwrQ0FBK0M7QUFDekMsSUFBQSx3QkFBNEMsRUFBMUMsWUFBRyxFQUFFLGdDQUFxQyxDQUFDO0FBRW5ELGdDQUFnQztBQUNoQyxhQUFhO0FBQ2IsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLHNGQUFzRjtBQUN0RixpREFBaUQ7QUFFakQsMENBQTBDO0FBQzFDLGtDQUFrQztBQUNsQyxNQUFNO0FBRU4sOEVBQThFO0FBQzlFLDJFQUEyRTtBQUMzRSwyQ0FBMkM7QUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztBQUM5QyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ1YsT0FBTyxFQUFHLEdBQUcsQ0FBQyxVQUFVLEVBQUU7SUFDMUIsR0FBRyxFQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ3hCLFFBQVEsRUFBRyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztJQUNsQyxPQUFPLEVBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFDaEMsS0FBSyxFQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7SUFDL0MsTUFBTSxFQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7Q0FDckQsQ0FBQyxDQUFDO0FBRUgsSUFBSSxVQUFrQyxDQUFDO0FBRXZDLFNBQVMsWUFBWTtJQUNqQiw2QkFBNkI7SUFDN0IsVUFBVSxHQUFHLElBQUksYUFBYSxDQUFDO1FBQzNCLEtBQUssRUFBRyxJQUFJO1FBQ1osTUFBTSxFQUFHLElBQUk7UUFDYixTQUFTLEVBQUcsSUFBSTtRQUNoQixjQUFjLEVBQUc7WUFDYixPQUFPLEVBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDO1lBQzVDLG9CQUFvQixFQUFHLElBQUk7WUFDM0IsZUFBZSxFQUFHLElBQUk7WUFDdEIsMkJBQTJCLEVBQUcsSUFBSTtZQUNsQyxjQUFjLEVBQUcsMEJBQTBCO1NBRzlDO0tBR0osQ0FBQyxDQUFDO0lBQ0gsVUFBVSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBR3pDOzs7Ozs7dUNBTW1DO0lBRW5DLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQztJQUczRCxxQkFBcUI7SUFDckIsVUFBVSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUV0QyxxQ0FBcUM7SUFDckMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7UUFDcEIsaUVBQWlFO1FBQ2pFLG1FQUFtRTtRQUNuRSxvREFBb0Q7UUFDcEQsVUFBVSxHQUFHLElBQUksQ0FBQTtJQUNyQixDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUM7QUFFRCx3REFBd0Q7QUFDeEQseURBQXlEO0FBQ3pELHNEQUFzRDtBQUN0RCxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztBQUU5QixvQ0FBb0M7QUFDcEMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRTtJQUN4Qiw0REFBNEQ7SUFDNUQsOERBQThEO0lBQzlELElBQUssT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRO1FBQUcsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ25ELENBQUMsQ0FBQyxDQUFDO0FBRUgsR0FBRyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUU7SUFDZixpRUFBaUU7SUFDakUsNERBQTREO0lBQzVELGFBQWE7SUFDYixJQUFLLFVBQVUsS0FBSyxJQUFJO1FBQUcsWUFBWSxFQUFFLENBQUE7QUFDN0MsQ0FBQyxDQUFDLENBQUM7QUFFSCw0RUFBNEU7QUFDNUUsdUVBQXVFIn0=