// Modules to control application life and create native browser window
// import {app, BrowserWindow} from "electron";
const { app, BrowserWindow } = require('electron');
// import * as path from "path";
// @ts-ignore
const path = require('path');
// const electonReloadPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
// console.table({__dirname, electonReloadPath});
// require('electron-reload')(__dirname, {
//     electron: electonReloadPath
// });
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
console.log('%cmain.ts', 'font-weight: bold');
console.table({
    appPath: app.getAppPath(),
    exe: app.getPath("exe"),
    userData: app.getPath("userData"),
    appData: app.getPath("appData"),
    DEBUG: process.argv.slice(2).includes('debug'),
    DRYRUN: process.argv.slice(2).includes('dry-run'),
});
let mainWindow;
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
            autoplayPolicy: "no-user-gesture-required",
        },
    });
    // mainWindow.setBackgroundColor('#181818');
    /*mainWindow.setSize(1919, 1080, true);
     mainWindow.resizable = true;
     mainWindow.setMenu(null);
     mainWindow.autoHideMenuBar = true;
     mainWindow.maximize();
     mainWindow.setMenuBarVisibility(true);
     mainWindow.setFullScreen(false);*/
    mainWindow.loadFile(path.join(__dirname, "./index.html")).then((done) => {
        console.log('done loading index.html');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsdUVBQXVFO0FBQ3ZFLCtDQUErQztBQUMvQyxNQUFNLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUVuRCxnQ0FBZ0M7QUFDaEMsYUFBYTtBQUNiLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixzRkFBc0Y7QUFDdEYsaURBQWlEO0FBRWpELDBDQUEwQztBQUMxQyxrQ0FBa0M7QUFDbEMsTUFBTTtBQUVOLDhFQUE4RTtBQUM5RSwyRUFBMkU7QUFDM0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztBQUM5QyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ1YsT0FBTyxFQUFHLEdBQUcsQ0FBQyxVQUFVLEVBQUU7SUFDMUIsR0FBRyxFQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ3hCLFFBQVEsRUFBRyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztJQUNsQyxPQUFPLEVBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFDaEMsS0FBSyxFQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7SUFDL0MsTUFBTSxFQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7Q0FDckQsQ0FBQyxDQUFDO0FBRUgsSUFBSSxVQUFrQyxDQUFDO0FBRXZDLFNBQVMsWUFBWTtJQUNqQiw2QkFBNkI7SUFDN0IsVUFBVSxHQUFHLElBQUksYUFBYSxDQUFDO1FBQzNCLEtBQUssRUFBRyxJQUFJO1FBQ1osTUFBTSxFQUFHLElBQUk7UUFDYixTQUFTLEVBQUcsSUFBSTtRQUNoQixjQUFjLEVBQUc7WUFDYixPQUFPLEVBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDO1lBQzVDLG9CQUFvQixFQUFHLElBQUk7WUFDM0IsZUFBZSxFQUFHLElBQUk7WUFDdEIsMkJBQTJCLEVBQUcsSUFBSTtZQUNsQyxjQUFjLEVBQUcsMEJBQTBCO1NBRzlDO0tBR0osQ0FBQyxDQUFDO0lBQ0gsNENBQTRDO0lBRzVDOzs7Ozs7dUNBTW1DO0lBRW5DLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUNwRSxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDM0MsQ0FBQyxDQUFDLENBQUM7SUFHSCxxQkFBcUI7SUFDckIsVUFBVSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUV0QyxxQ0FBcUM7SUFDckMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7UUFDcEIsaUVBQWlFO1FBQ2pFLG1FQUFtRTtRQUNuRSxvREFBb0Q7UUFDcEQsVUFBVSxHQUFHLElBQUksQ0FBQTtJQUNyQixDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUM7QUFFRCx3REFBd0Q7QUFDeEQseURBQXlEO0FBQ3pELHNEQUFzRDtBQUN0RCxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztBQUU5QixvQ0FBb0M7QUFDcEMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRTtJQUN4Qiw0REFBNEQ7SUFDNUQsOERBQThEO0lBQzlELElBQUssT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRO1FBQUcsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ25ELENBQUMsQ0FBQyxDQUFDO0FBRUgsR0FBRyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUU7SUFDZixpRUFBaUU7SUFDakUsNERBQTREO0lBQzVELGFBQWE7SUFDYixJQUFLLFVBQVUsS0FBSyxJQUFJO1FBQUcsWUFBWSxFQUFFLENBQUE7QUFDN0MsQ0FBQyxDQUFDLENBQUM7QUFFSCw0RUFBNEU7QUFDNUUsdUVBQXVFIiwic291cmNlc0NvbnRlbnQiOlsiLy8gTW9kdWxlcyB0byBjb250cm9sIGFwcGxpY2F0aW9uIGxpZmUgYW5kIGNyZWF0ZSBuYXRpdmUgYnJvd3NlciB3aW5kb3dcbi8vIGltcG9ydCB7YXBwLCBCcm93c2VyV2luZG93fSBmcm9tIFwiZWxlY3Ryb25cIjtcbmNvbnN0IHsgYXBwLCBCcm93c2VyV2luZG93IH0gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xuXG4vLyBpbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG4vLyBAdHMtaWdub3JlXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuLy8gY29uc3QgZWxlY3RvblJlbG9hZFBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnbm9kZV9tb2R1bGVzJywgJy5iaW4nLCAnZWxlY3Ryb24nKTtcbi8vIGNvbnNvbGUudGFibGUoe19fZGlybmFtZSwgZWxlY3RvblJlbG9hZFBhdGh9KTtcblxuLy8gcmVxdWlyZSgnZWxlY3Ryb24tcmVsb2FkJykoX19kaXJuYW1lLCB7XG4vLyAgICAgZWxlY3Ryb246IGVsZWN0b25SZWxvYWRQYXRoXG4vLyB9KTtcblxuLy8gS2VlcCBhIGdsb2JhbCByZWZlcmVuY2Ugb2YgdGhlIHdpbmRvdyBvYmplY3QsIGlmIHlvdSBkb24ndCwgdGhlIHdpbmRvdyB3aWxsXG4vLyBiZSBjbG9zZWQgYXV0b21hdGljYWxseSB3aGVuIHRoZSBKYXZhU2NyaXB0IG9iamVjdCBpcyBnYXJiYWdlIGNvbGxlY3RlZC5cbmNvbnNvbGUubG9nKCclY21haW4udHMnLCAnZm9udC13ZWlnaHQ6IGJvbGQnKTtcbmNvbnNvbGUudGFibGUoe1xuICAgIGFwcFBhdGggOiBhcHAuZ2V0QXBwUGF0aCgpLFxuICAgIGV4ZSA6IGFwcC5nZXRQYXRoKFwiZXhlXCIpLFxuICAgIHVzZXJEYXRhIDogYXBwLmdldFBhdGgoXCJ1c2VyRGF0YVwiKSxcbiAgICBhcHBEYXRhIDogYXBwLmdldFBhdGgoXCJhcHBEYXRhXCIpLFxuICAgIERFQlVHIDogcHJvY2Vzcy5hcmd2LnNsaWNlKDIpLmluY2x1ZGVzKCdkZWJ1ZycpLFxuICAgIERSWVJVTiA6IHByb2Nlc3MuYXJndi5zbGljZSgyKS5pbmNsdWRlcygnZHJ5LXJ1bicpLFxufSk7XG5cbmxldCBtYWluV2luZG93OiBFbGVjdHJvbi5Ccm93c2VyV2luZG93O1xuXG5mdW5jdGlvbiBjcmVhdGVXaW5kb3coKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBicm93c2VyIHdpbmRvdy5cbiAgICBtYWluV2luZG93ID0gbmV3IEJyb3dzZXJXaW5kb3coe1xuICAgICAgICB3aWR0aCA6IDEyMDAsXG4gICAgICAgIGhlaWdodCA6IDIwMDAsXG4gICAgICAgIGRhcmtUaGVtZSA6IHRydWUsXG4gICAgICAgIHdlYlByZWZlcmVuY2VzIDoge1xuICAgICAgICAgICAgcHJlbG9hZCA6IHBhdGguam9pbihfX2Rpcm5hbWUsICdwcmVsb2FkLmpzJyksXG4gICAgICAgICAgICBleHBlcmltZW50YWxGZWF0dXJlcyA6IHRydWUsXG4gICAgICAgICAgICBub2RlSW50ZWdyYXRpb24gOiB0cnVlLFxuICAgICAgICAgICAgYWxsb3dSdW5uaW5nSW5zZWN1cmVDb250ZW50IDogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9wbGF5UG9saWN5IDogXCJuby11c2VyLWdlc3R1cmUtcmVxdWlyZWRcIixcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICB9KTtcbiAgICAvLyBtYWluV2luZG93LnNldEJhY2tncm91bmRDb2xvcignIzE4MTgxOCcpO1xuICAgIFxuICAgIFxuICAgIC8qbWFpbldpbmRvdy5zZXRTaXplKDE5MTksIDEwODAsIHRydWUpO1xuICAgICBtYWluV2luZG93LnJlc2l6YWJsZSA9IHRydWU7XG4gICAgIG1haW5XaW5kb3cuc2V0TWVudShudWxsKTtcbiAgICAgbWFpbldpbmRvdy5hdXRvSGlkZU1lbnVCYXIgPSB0cnVlO1xuICAgICBtYWluV2luZG93Lm1heGltaXplKCk7XG4gICAgIG1haW5XaW5kb3cuc2V0TWVudUJhclZpc2liaWxpdHkodHJ1ZSk7XG4gICAgIG1haW5XaW5kb3cuc2V0RnVsbFNjcmVlbihmYWxzZSk7Ki9cbiAgICBcbiAgICBtYWluV2luZG93LmxvYWRGaWxlKHBhdGguam9pbihfX2Rpcm5hbWUsIFwiLi9pbmRleC5odG1sXCIpKS50aGVuKChkb25lKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdkb25lIGxvYWRpbmcgaW5kZXguaHRtbCcpO1xuICAgIH0pO1xuICAgIFxuICAgIFxuICAgIC8vIE9wZW4gdGhlIERldlRvb2xzLlxuICAgIG1haW5XaW5kb3cud2ViQ29udGVudHMub3BlbkRldlRvb2xzKCk7XG4gICAgXG4gICAgLy8gRW1pdHRlZCB3aGVuIHRoZSB3aW5kb3cgaXMgY2xvc2VkLlxuICAgIG1haW5XaW5kb3cub24oJ2Nsb3NlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gRGVyZWZlcmVuY2UgdGhlIHdpbmRvdyBvYmplY3QsIHVzdWFsbHkgeW91IHdvdWxkIHN0b3JlIHdpbmRvd3NcbiAgICAgICAgLy8gaW4gYW4gYXJyYXkgaWYgeW91ciBhcHAgc3VwcG9ydHMgbXVsdGkgd2luZG93cywgdGhpcyBpcyB0aGUgdGltZVxuICAgICAgICAvLyB3aGVuIHlvdSBzaG91bGQgZGVsZXRlIHRoZSBjb3JyZXNwb25kaW5nIGVsZW1lbnQuXG4gICAgICAgIG1haW5XaW5kb3cgPSBudWxsXG4gICAgfSlcbn1cblxuLy8gVGhpcyBtZXRob2Qgd2lsbCBiZSBjYWxsZWQgd2hlbiBFbGVjdHJvbiBoYXMgZmluaXNoZWRcbi8vIGluaXRpYWxpemF0aW9uIGFuZCBpcyByZWFkeSB0byBjcmVhdGUgYnJvd3NlciB3aW5kb3dzLlxuLy8gU29tZSBBUElzIGNhbiBvbmx5IGJlIHVzZWQgYWZ0ZXIgdGhpcyBldmVudCBvY2N1cnMuXG5hcHAub24oJ3JlYWR5JywgY3JlYXRlV2luZG93KTtcblxuLy8gUXVpdCB3aGVuIGFsbCB3aW5kb3dzIGFyZSBjbG9zZWQuXG5hcHAub24oJ3dpbmRvdy1hbGwtY2xvc2VkJywgZnVuY3Rpb24gKCkge1xuICAgIC8vIE9uIG1hY09TIGl0IGlzIGNvbW1vbiBmb3IgYXBwbGljYXRpb25zIGFuZCB0aGVpciBtZW51IGJhclxuICAgIC8vIHRvIHN0YXkgYWN0aXZlIHVudGlsIHRoZSB1c2VyIHF1aXRzIGV4cGxpY2l0bHkgd2l0aCBDbWQgKyBRXG4gICAgaWYgKCBwcm9jZXNzLnBsYXRmb3JtICE9PSAnZGFyd2luJyApIGFwcC5xdWl0KClcbn0pO1xuXG5hcHAub24oJ2FjdGl2YXRlJywgZnVuY3Rpb24gKCkge1xuICAgIC8vIE9uIG1hY09TIGl0J3MgY29tbW9uIHRvIHJlLWNyZWF0ZSBhIHdpbmRvdyBpbiB0aGUgYXBwIHdoZW4gdGhlXG4gICAgLy8gZG9jayBpY29uIGlzIGNsaWNrZWQgYW5kIHRoZXJlIGFyZSBubyBvdGhlciB3aW5kb3dzIG9wZW4uXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGlmICggbWFpbldpbmRvdyA9PT0gbnVsbCApIGNyZWF0ZVdpbmRvdygpXG59KTtcblxuLy8gSW4gdGhpcyBmaWxlIHlvdSBjYW4gaW5jbHVkZSB0aGUgcmVzdCBvZiB5b3VyIGFwcCdzIHNwZWNpZmljIG1haW4gcHJvY2Vzc1xuLy8gY29kZS4gWW91IGNhbiBhbHNvIHB1dCB0aGVtIGluIHNlcGFyYXRlIGZpbGVzIGFuZCByZXF1aXJlIHRoZW0gaGVyZS5cbiJdfQ==