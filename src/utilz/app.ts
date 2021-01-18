import { bool } from "./util";

console.debug('utilz/app.ts')
import type { WebContents } from 'electron';
import * as cp from 'child_process';
////////////////////////////////////////////////////
// *** Electron Related
////////////////////////////////////////////////////
export function getCurrentWindow() {
    let currentWindow = remote.getCurrentWindow();

    return currentWindow;
}

export function reloadPage() {
    // if (require("./Glob").default.BigConfig.dev.no_reload_on_submit()) {
    //     return
    // }
    getCurrentWindow().reload();
}


export function openBigConfigInEditor() {
    const { spawnSync } = cp;
    console.debug(`editing big config file with ${EDITBIGCONF}: ${BigConfig.path}`);
    spawnSync(EDITBIGCONF, [BigConfig.path]);
}

/**Writes screen capture (png) and exports full page to HTML for both main window WebContents and DevTools WebContents.*/
export async function saveScreenshots() {
    console.debug('Saving screenshots...')
    const webContents = remote.getCurrentWebContents();
    myfs.createIfNotExists(SESSION_PATH_ABS);
    const screenshotsDir = path.join(SESSION_PATH_ABS, 'screenshots');
    myfs.createIfNotExists(screenshotsDir);

    async function _saveScreenshotOfWebContents(wc: WebContents, name: string) {
        if (!bool(wc)) {
            console.warn(`saveScreenshots() | _saveScreenshotOfWebContents(wc: ${wc}, name: "${name}") | bad wc. Not saving ScreenshotOfWebContents`);
            return
        }
        const image = await wc.capturePage();
        const savedir = path.join(screenshotsDir, name);
        myfs.createIfNotExists(savedir);
        let pngPath;
        if (fs.existsSync(path.join(savedir, 'page.png'))) {
            pngPath = path.join(savedir, `page__${new Date().human()}.png`)
        } else {
            pngPath = path.join(savedir, 'page.png');
        }
        fs.writeFileSync(pngPath, image.toPNG());
        let htmlPath;
        if (fs.existsSync(path.join(savedir, 'screenshot.html'))) {
            htmlPath = path.join(savedir, `screenshot__${new Date().human()}.html`)
        } else {
            htmlPath = path.join(savedir, 'screenshot.html');
        }
        await wc.savePage(htmlPath, "HTMLComplete");
        console.log(`Saved screenshots of ${name} successfully`);
    }

    try {
        await _saveScreenshotOfWebContents(webContents, 'pyano_window')
    } catch (pyano_window_screenshot_error) {
        console.warn(`saveScreenshots() | _saveScreenshotOfWebContents(wc: ${webContents}, name: 'pyano_window') | 
        bad wc. Not saving ScreenshotOfWebContents.
        ${pyano_window_screenshot_error.toObj().toString()}`);
    }
    try {
        await _saveScreenshotOfWebContents(webContents.devToolsWebContents, 'devtools')
    } catch (devtools_window_screenshot_error) {
        console.warn(`saveScreenshots() | _saveScreenshotOfWebContents(wc: ${webContents}, name: 'devtools') | 
        bad wc. Not saving ScreenshotOfWebContents.
        ${devtools_window_screenshot_error.toObj().toString()}`);
    }
}