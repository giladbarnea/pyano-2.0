import { BetterHTMLElement, elem } from "./bhe";
import { BigConfigCls } from "./MyStore";
import MyAlert from "./MyAlert";
import * as util from "./util";

/**import Glob from './Glob'*/
console.group('Glob.ts');

const BigConfig = new BigConfigCls(true);
let skipFade = false;
const MainContent = elem({ id : 'main_content' });
const Sidebar = elem({ id : 'sidebar' });
const Title = elem({ id : 'title' }) as BetterHTMLElement & { h3: BetterHTMLElement };
// @ts-ignore
const Document = elem({ htmlElement : document });
const NavigationButtons = elem({
    id : 'navigation_buttons', children : {
        exit : '.exit',
        minimize : '.minimize',
        
    }
}) as BetterHTMLElement & { exit: BetterHTMLElement, minimize: BetterHTMLElement };
NavigationButtons.exit.click(async () => {
    let { value : shouldExit } = await MyAlert.big.warning({
        title : 'Are you sure you want to exit?',
        confirmButtonColor : '#dc3545',
    });
    if ( shouldExit )
        util.getCurrentWindow().close();
});
NavigationButtons.minimize.click(() => util.getCurrentWindow().minimize());

async function hide(...args: ("Title" | "NavigationButtons")[]) {

}

console.groupEnd();
export default { skipFade, MainContent, Sidebar, Title, BigConfig, Document, NavigationButtons, hide }
