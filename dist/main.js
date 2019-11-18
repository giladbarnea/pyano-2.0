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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHVFQUF1RTtBQUN2RSwrQ0FBK0M7QUFDekMsSUFBQSx3QkFBNEMsRUFBMUMsWUFBRyxFQUFFLGdDQUFxQyxDQUFDO0FBRW5ELGdDQUFnQztBQUNoQyxhQUFhO0FBQ2IsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLHNGQUFzRjtBQUN0RixpREFBaUQ7QUFFakQsMENBQTBDO0FBQzFDLGtDQUFrQztBQUNsQyxNQUFNO0FBRU4sOEVBQThFO0FBQzlFLDJFQUEyRTtBQUMzRSwyQ0FBMkM7QUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztBQUM5QyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ1YsT0FBTyxFQUFHLEdBQUcsQ0FBQyxVQUFVLEVBQUU7SUFDMUIsR0FBRyxFQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ3hCLFFBQVEsRUFBRyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztJQUNsQyxPQUFPLEVBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFDaEMsS0FBSyxFQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7SUFDL0MsTUFBTSxFQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7Q0FDckQsQ0FBQyxDQUFDO0FBRUgsSUFBSSxVQUFrQyxDQUFDO0FBRXZDLFNBQVMsWUFBWTtJQUNqQiw2QkFBNkI7SUFDN0IsVUFBVSxHQUFHLElBQUksYUFBYSxDQUFDO1FBQzNCLEtBQUssRUFBRyxJQUFJO1FBQ1osTUFBTSxFQUFHLElBQUk7UUFDYixTQUFTLEVBQUcsSUFBSTtRQUNoQixjQUFjLEVBQUc7WUFDYixPQUFPLEVBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDO1lBQzVDLG9CQUFvQixFQUFHLElBQUk7WUFDM0IsZUFBZSxFQUFHLElBQUk7WUFDdEIsMkJBQTJCLEVBQUcsSUFBSTtZQUNsQyxjQUFjLEVBQUcsMEJBQTBCO1NBRzlDO0tBR0osQ0FBQyxDQUFDO0lBQ0gsVUFBVSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBR3pDOzs7Ozs7dUNBTW1DO0lBRW5DLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQztJQUczRCxxQkFBcUI7SUFDckIsVUFBVSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUV0QyxxQ0FBcUM7SUFDckMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7UUFDcEIsaUVBQWlFO1FBQ2pFLG1FQUFtRTtRQUNuRSxvREFBb0Q7UUFDcEQsVUFBVSxHQUFHLElBQUksQ0FBQTtJQUNyQixDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUM7QUFFRCx3REFBd0Q7QUFDeEQseURBQXlEO0FBQ3pELHNEQUFzRDtBQUN0RCxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztBQUU5QixvQ0FBb0M7QUFDcEMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRTtJQUN4Qiw0REFBNEQ7SUFDNUQsOERBQThEO0lBQzlELElBQUssT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRO1FBQUcsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ25ELENBQUMsQ0FBQyxDQUFDO0FBRUgsR0FBRyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUU7SUFDZixpRUFBaUU7SUFDakUsNERBQTREO0lBQzVELGFBQWE7SUFDYixJQUFLLFVBQVUsS0FBSyxJQUFJO1FBQUcsWUFBWSxFQUFFLENBQUE7QUFDN0MsQ0FBQyxDQUFDLENBQUM7QUFFSCw0RUFBNEU7QUFDNUUsdUVBQXVFIiwic291cmNlc0NvbnRlbnQiOlsiLy8gTW9kdWxlcyB0byBjb250cm9sIGFwcGxpY2F0aW9uIGxpZmUgYW5kIGNyZWF0ZSBuYXRpdmUgYnJvd3NlciB3aW5kb3dcbi8vIGltcG9ydCB7YXBwLCBCcm93c2VyV2luZG93fSBmcm9tIFwiZWxlY3Ryb25cIjtcbmNvbnN0IHsgYXBwLCBCcm93c2VyV2luZG93IH0gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xuXG4vLyBpbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG4vLyBAdHMtaWdub3JlXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuLy8gY29uc3QgZWxlY3RvblJlbG9hZFBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnbm9kZV9tb2R1bGVzJywgJy5iaW4nLCAnZWxlY3Ryb24nKTtcbi8vIGNvbnNvbGUudGFibGUoe19fZGlybmFtZSwgZWxlY3RvblJlbG9hZFBhdGh9KTtcblxuLy8gcmVxdWlyZSgnZWxlY3Ryb24tcmVsb2FkJykoX19kaXJuYW1lLCB7XG4vLyAgICAgZWxlY3Ryb246IGVsZWN0b25SZWxvYWRQYXRoXG4vLyB9KTtcblxuLy8gS2VlcCBhIGdsb2JhbCByZWZlcmVuY2Ugb2YgdGhlIHdpbmRvdyBvYmplY3QsIGlmIHlvdSBkb24ndCwgdGhlIHdpbmRvdyB3aWxsXG4vLyBiZSBjbG9zZWQgYXV0b21hdGljYWxseSB3aGVuIHRoZSBKYXZhU2NyaXB0IG9iamVjdCBpcyBnYXJiYWdlIGNvbGxlY3RlZC5cbi8vIGNvbnN0IFN0b3JlID0gcmVxdWlyZShcImVsZWN0cm9uLXN0b3JlXCIpO1xuY29uc29sZS5sb2coJyVjbWFpbi50cycsICdmb250LXdlaWdodDogYm9sZCcpO1xuY29uc29sZS50YWJsZSh7XG4gICAgYXBwUGF0aCA6IGFwcC5nZXRBcHBQYXRoKCksXG4gICAgZXhlIDogYXBwLmdldFBhdGgoXCJleGVcIiksXG4gICAgdXNlckRhdGEgOiBhcHAuZ2V0UGF0aChcInVzZXJEYXRhXCIpLFxuICAgIGFwcERhdGEgOiBhcHAuZ2V0UGF0aChcImFwcERhdGFcIiksXG4gICAgREVCVUcgOiBwcm9jZXNzLmFyZ3Yuc2xpY2UoMikuaW5jbHVkZXMoJ2RlYnVnJyksXG4gICAgRFJZUlVOIDogcHJvY2Vzcy5hcmd2LnNsaWNlKDIpLmluY2x1ZGVzKCdkcnktcnVuJyksXG59KTtcblxubGV0IG1haW5XaW5kb3c6IEVsZWN0cm9uLkJyb3dzZXJXaW5kb3c7XG5cbmZ1bmN0aW9uIGNyZWF0ZVdpbmRvdygpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGJyb3dzZXIgd2luZG93LlxuICAgIG1haW5XaW5kb3cgPSBuZXcgQnJvd3NlcldpbmRvdyh7XG4gICAgICAgIHdpZHRoIDogMTIwMCxcbiAgICAgICAgaGVpZ2h0IDogMjAwMCxcbiAgICAgICAgZGFya1RoZW1lIDogdHJ1ZSxcbiAgICAgICAgd2ViUHJlZmVyZW5jZXMgOiB7XG4gICAgICAgICAgICBwcmVsb2FkIDogcGF0aC5qb2luKF9fZGlybmFtZSwgJ3ByZWxvYWQuanMnKSxcbiAgICAgICAgICAgIGV4cGVyaW1lbnRhbEZlYXR1cmVzIDogdHJ1ZSxcbiAgICAgICAgICAgIG5vZGVJbnRlZ3JhdGlvbiA6IHRydWUsXG4gICAgICAgICAgICBhbGxvd1J1bm5pbmdJbnNlY3VyZUNvbnRlbnQgOiB0cnVlLFxuICAgICAgICAgICAgYXV0b3BsYXlQb2xpY3kgOiBcIm5vLXVzZXItZ2VzdHVyZS1yZXF1aXJlZFwiLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH0pO1xuICAgIG1haW5XaW5kb3cuc2V0QmFja2dyb3VuZENvbG9yKCcjMTgxODE4Jyk7XG4gICAgXG4gICAgXG4gICAgLyptYWluV2luZG93LnNldFNpemUoMTkxOSwgMTA4MCwgdHJ1ZSk7XG4gICAgIG1haW5XaW5kb3cucmVzaXphYmxlID0gdHJ1ZTtcbiAgICAgbWFpbldpbmRvdy5zZXRNZW51KG51bGwpO1xuICAgICBtYWluV2luZG93LmF1dG9IaWRlTWVudUJhciA9IHRydWU7XG4gICAgIG1haW5XaW5kb3cubWF4aW1pemUoKTtcbiAgICAgbWFpbldpbmRvdy5zZXRNZW51QmFyVmlzaWJpbGl0eSh0cnVlKTtcbiAgICAgbWFpbldpbmRvdy5zZXRGdWxsU2NyZWVuKGZhbHNlKTsqL1xuICAgIFxuICAgIG1haW5XaW5kb3cubG9hZEZpbGUocGF0aC5qb2luKF9fZGlybmFtZSwgXCIuLi9pbmRleC5odG1sXCIpKTtcbiAgICBcbiAgICBcbiAgICAvLyBPcGVuIHRoZSBEZXZUb29scy5cbiAgICBtYWluV2luZG93LndlYkNvbnRlbnRzLm9wZW5EZXZUb29scygpO1xuICAgIFxuICAgIC8vIEVtaXR0ZWQgd2hlbiB0aGUgd2luZG93IGlzIGNsb3NlZC5cbiAgICBtYWluV2luZG93Lm9uKCdjbG9zZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIERlcmVmZXJlbmNlIHRoZSB3aW5kb3cgb2JqZWN0LCB1c3VhbGx5IHlvdSB3b3VsZCBzdG9yZSB3aW5kb3dzXG4gICAgICAgIC8vIGluIGFuIGFycmF5IGlmIHlvdXIgYXBwIHN1cHBvcnRzIG11bHRpIHdpbmRvd3MsIHRoaXMgaXMgdGhlIHRpbWVcbiAgICAgICAgLy8gd2hlbiB5b3Ugc2hvdWxkIGRlbGV0ZSB0aGUgY29ycmVzcG9uZGluZyBlbGVtZW50LlxuICAgICAgICBtYWluV2luZG93ID0gbnVsbFxuICAgIH0pXG59XG5cbi8vIFRoaXMgbWV0aG9kIHdpbGwgYmUgY2FsbGVkIHdoZW4gRWxlY3Ryb24gaGFzIGZpbmlzaGVkXG4vLyBpbml0aWFsaXphdGlvbiBhbmQgaXMgcmVhZHkgdG8gY3JlYXRlIGJyb3dzZXIgd2luZG93cy5cbi8vIFNvbWUgQVBJcyBjYW4gb25seSBiZSB1c2VkIGFmdGVyIHRoaXMgZXZlbnQgb2NjdXJzLlxuYXBwLm9uKCdyZWFkeScsIGNyZWF0ZVdpbmRvdyk7XG5cbi8vIFF1aXQgd2hlbiBhbGwgd2luZG93cyBhcmUgY2xvc2VkLlxuYXBwLm9uKCd3aW5kb3ctYWxsLWNsb3NlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAvLyBPbiBtYWNPUyBpdCBpcyBjb21tb24gZm9yIGFwcGxpY2F0aW9ucyBhbmQgdGhlaXIgbWVudSBiYXJcbiAgICAvLyB0byBzdGF5IGFjdGl2ZSB1bnRpbCB0aGUgdXNlciBxdWl0cyBleHBsaWNpdGx5IHdpdGggQ21kICsgUVxuICAgIGlmICggcHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ2RhcndpbicgKSBhcHAucXVpdCgpXG59KTtcblxuYXBwLm9uKCdhY3RpdmF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAvLyBPbiBtYWNPUyBpdCdzIGNvbW1vbiB0byByZS1jcmVhdGUgYSB3aW5kb3cgaW4gdGhlIGFwcCB3aGVuIHRoZVxuICAgIC8vIGRvY2sgaWNvbiBpcyBjbGlja2VkIGFuZCB0aGVyZSBhcmUgbm8gb3RoZXIgd2luZG93cyBvcGVuLlxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBpZiAoIG1haW5XaW5kb3cgPT09IG51bGwgKSBjcmVhdGVXaW5kb3coKVxufSk7XG5cbi8vIEluIHRoaXMgZmlsZSB5b3UgY2FuIGluY2x1ZGUgdGhlIHJlc3Qgb2YgeW91ciBhcHAncyBzcGVjaWZpYyBtYWluIHByb2Nlc3Ncbi8vIGNvZGUuIFlvdSBjYW4gYWxzbyBwdXQgdGhlbSBpbiBzZXBhcmF0ZSBmaWxlcyBhbmQgcmVxdWlyZSB0aGVtIGhlcmUuXG4iXX0=