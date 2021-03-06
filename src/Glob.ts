import { BetterHTMLElement, elem, VisualBHE, visualbhe } from "./bhe";
import { BigConfigCls } from "./MyStore";
import MyAlert from "./MyAlert";
import * as util from "./util";
import * as fs from "fs"

/**import Glob from './Glob'*/
console.group('Glob.ts');

const BigConfig = new BigConfigCls(true);
let skipFade = false;
const MainContent = elem({ id : 'main_content' });
const Sidebar = visualbhe({ id : 'sidebar' });
const Title = visualbhe({ id : 'title' }) as VisualBHE & { levelh3: BetterHTMLElement, trialh3: BetterHTMLElement };
// @ts-ignore
const Document = elem({ htmlElement : document });
const NavigationButtons = visualbhe({
    id : 'navigation_buttons', children : {
        exit : '.exit',
        minimize : '.minimize',
        
    }
}) as VisualBHE & { exit: BetterHTMLElement, minimize: BetterHTMLElement };
NavigationButtons.exit.click(async () => {
    let options = {
        title : 'Are you sure you want to exit?',
        confirmButtonColor : '#dc3545',
        
    };
    if ( LOG || fs.existsSync(SESSION_PATH_ABS) ) {
        options = {
            ...options,
            // @ts-ignore
            input : "checkbox",
            inputValue : `delete`,
            onBeforeOpen : modal => {
                let el = elem({
                    htmlElement : modal,
                    children : { label : '.swal2-label', checkbox : '#swal2-checkbox' }
                });
                
                // @ts-ignore
                el.checkbox.css({ height : '22px', width : '22px' });
                // @ts-ignore
                el.label
                  .css({ fontSize : '22px' })
                  .html(`Delete this session's errors dir (${path.relative(ROOT_PATH_ABS, SESSION_PATH_ABS)})`);
                
            }
        }
    }
    
    //// 0: exit not delete
    //// 1: exit yes delete
    //// undefined: cancel
    let { value } = await MyAlert.big.warning(options);
    console.log({ value });
    let shouldExit = value !== undefined;
    if ( value === 1 ) {
        const rimraf = require('rimraf');
        rimraf(SESSION_PATH_ABS, console.log);
    }
    if ( shouldExit )
        util.getCurrentWindow().close();
});
NavigationButtons.minimize.click(() => util.getCurrentWindow().minimize());

async function toggle(action: "hide" | "display", ...args: ("Title" | "NavigationButtons" | "Sidebar")[]): Promise<unknown[]> {
    const promises = [];
    for ( let a of args ) {
        switch ( a ) {
            case "Title":
                promises.push(Title[action]());
                break;
            case "NavigationButtons":
                promises.push(NavigationButtons[action]());
                break;
            case "Sidebar":
                promises.push(Sidebar[action]());
                break;
        }
    }
    return await Promise.all(promises);
}

async function hide(...args: ("Title" | "NavigationButtons" | "Sidebar")[]): Promise<unknown[]> {
    return await toggle("hide", ...args);
}

async function display(...args: ("Title" | "NavigationButtons" | "Sidebar")[]): Promise<unknown[]> {
    return await toggle("display", ...args);
}

console.groupEnd();
export default { skipFade, MainContent, Sidebar, Title, BigConfig, Document, NavigationButtons, hide, display }
