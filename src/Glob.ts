import { BetterHTMLElement, elem, VisualBHE, visualbhe } from "./bhe";
import { BigConfigCls } from "./MyStore";
import MyAlert from "./MyAlert";
import * as util from "./util";

/**import Glob from './Glob'*/
console.group('Glob.ts');

const BigConfig = new BigConfigCls(true);
let skipFade = false;
const MainContent = elem({ id : 'main_content' });
const Sidebar = visualbhe({ id : 'sidebar' });
const Title = visualbhe({ id : 'title' }) as VisualBHE & { h3: BetterHTMLElement };
// @ts-ignore
const Document = elem({ htmlElement : document });
const NavigationButtons = visualbhe({
    id : 'navigation_buttons', children : {
        exit : '.exit',
        minimize : '.minimize',
        
    }
}) as VisualBHE & { exit: BetterHTMLElement, minimize: BetterHTMLElement };
NavigationButtons.exit.click(async () => {
    let { value : shouldExit } = await MyAlert.big.warning({
        title : 'Are you sure you want to exit?',
        confirmButtonColor : '#dc3545',
    });
    if ( shouldExit )
        util.getCurrentWindow().close();
});
NavigationButtons.minimize.click(() => util.getCurrentWindow().minimize());

async function hide(...args: ("Title" | "NavigationButtons" | "Sidebar")[]): Promise<unknown[]> {
    const promises = [];
    for ( let a of args ) {
        switch ( a ) {
            case "Title":
                promises.push(Title.hide());
                break;
            case "NavigationButtons":
                promises.push(NavigationButtons.hide());
                break;
            case "Sidebar":
                promises.push(Sidebar.hide());
                break;
        }
    }
    return await Promise.all(promises);
}

console.groupEnd();
export default { skipFade, MainContent, Sidebar, Title, BigConfig, Document, NavigationButtons, hide }
