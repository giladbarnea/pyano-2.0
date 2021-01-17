/// <reference types="../../node_modules/electron" />
export declare function getCurrentWindow(): Electron.BrowserWindow;
export declare function reloadPage(): void;
export declare function openBigConfigInEditor(): void;
/**Writes screen capture (png) and exports full page to HTML for both main window WebContents and DevTools WebContents.*/
export declare function saveScreenshots(): Promise<void>;
