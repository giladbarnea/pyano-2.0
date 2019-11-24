import { elem } from "./bhe";

console.group('init.ts');
import * as util from "./util";


import { isDone } from "./MyPyShell";

import * as Pages from "./pages";
import MyAlert from './MyAlert'
import Glob from './Glob';
// import { remote } from 'electron'

// console.log('after importing MyPyShell', isDone());


util.waitUntil(isDone).then(() => {
    console.group('init.ts MyPyShell done');
    Pages.sidebar.build();
    
    
    const last_page = Glob.BigConfig.last_page;
    console.log('last_page:', last_page);
    Pages.toPage(last_page, false);
    elem({ id : 'exit_btn' }).click(async () => {
        let { value : shouldExit } = await MyAlert.big.warning({
            title : 'Are you sure you want to exit?',
            confirmButtonColor : '#dc3545',
        });
        if ( shouldExit )
            util.getCurrentWindow().close();
    });
    elem({ id : 'minimize_btn' }).click(() => util.getCurrentWindow().minimize());
    
    
    console.groupEnd();
});


/*
 
 
 /**/
console.groupEnd();
/*
 import { remote } from "electron";
 
 
 
 import { EStore } from "pyano_local_modules/ext_libs";
 
 
 function maybeToggleNoCursor() {
 const shouldToggle = EStore.last_page == "inside_test";
 console.log(`Pressed Alt+C, ${shouldToggle ? '' : 'not '}toggling nocursor`);
 if ( shouldToggle )
 document.getElementById('main_content').classList.toggle('nocursor');
 }
 
 
 function reloadMainWindow() {
 remote.getCurrentWindow().reload();
 }
 
 
 function reloadToNewTest() {
 console.log('Pressed ctrl+q, setting last page to new test and reloading');
 EStore.last_page = 'new_test';
 remote.getCurrentWindow().reload();
 }
 
 
 function openDevTools() {
 console.log('Pressed ctrl+y, opening DevTools');
 remote.getCurrentWindow().webContents.openDevTools();
 }
 
 
 function toggleMaximize() {
 console.log('Pressed ctrl+u, toggling maximize');
 const currentWindow = remote.getCurrentWindow();
 currentWindow.setFullScreen(!currentWindow.isFullScreen());
 currentWindow.setMenuBarVisibility(currentWindow.isFullScreen());
 }
 
 remote.getCurrentWindow().on("focus", () => {
 remote.globalShortcut.register('Alt+C', maybeToggleNoCursor);
 remote.globalShortcut.register('CommandOrControl+R', reloadMainWindow);
 remote.globalShortcut.register('CommandOrControl+Q', reloadToNewTest);
 remote.globalShortcut.register('CommandOrControl+Y', openDevTools);
 remote.globalShortcut.register('CommandOrControl+U', toggleMaximize);
 });
 remote.getCurrentWindow().on('blur', () => remote.globalShortcut.unregisterAll());
 
 
 const sidebar = require("pyano_local_modules/sidebar");
 sidebar.build();
 const Pages = require("pyano_local_modules/pages/pages");
 
 const last_page = EStore.last_page;
 console.log('init.js', { last_page });
 Pages.toPage(last_page, false);
 document.getElementById('exit_btn')
 .addEventListener('click', async () => {
 let { value : shouldExit } = await Alert.big.warning({
 title : 'Are you sure you want to exit?',
 confirmButtonColor : '#dc3545',
 animation : false
 });
 if ( shouldExit )
 getCurrentWindow().close();
 });
 document.getElementById('minimize_btn')
 .addEventListener('click', () => getCurrentWindow().minimize());
 */
