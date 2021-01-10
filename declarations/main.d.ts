/// <reference types="../node_modules/electron" />
declare const app: Electron.App, BrowserWindow: typeof Electron.BrowserWindow;
declare const electronScreen: Electron.Screen;
declare const path: any;
declare const argv: string[];
declare let mainWindow: Electron.BrowserWindow;
declare function createWindow(): void;
