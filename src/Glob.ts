// import { BetterHTMLElement, elem } from "./bhe";
// import { BigConfigCls } from "./mystore.js";
// import MyAlert from "./MyAlert";
console.debug('Glob')
import swalert from "./swalert";


import { VisualBHE, visualbhe } from "./bhe/extra";
import {Button, BetterHTMLElement, elem } from "./bhe";


let skipFade = false;
const MainContent = elem({ byid: 'main_content' });
const Sidebar = visualbhe({ byid: 'sidebar' });
const Title = visualbhe({ byid: 'title' }) as
    VisualBHE<HTMLHeadingElement> & { levelh3: BetterHTMLElement<HTMLHeadingElement>, trialh3: BetterHTMLElement<HTMLHeadingElement> };
// @ts-ignore
const Document = elem({ htmlElement: document });
const Head = elem({ htmlElement: document.head });
const swalstyle = Head.child('style:last-of-type');
const indexcss = Head.child('link[href*="pages/index.css"]');
Head.replaceChild(indexcss, swalstyle)
indexcss.before(swalstyle);
const NavigationButtons = visualbhe({
    byid: 'navigation_buttons', children: {
        exit: '.exit',
        minimize: '.minimize',

    }
}) as VisualBHE<HTMLDivElement> & { exit: Button, minimize: Button };
NavigationButtons.exit.click(async () => {
    console.title('NavigationButtons.exit click')
    let options = {
        title: 'Are you sure you want to exit?',
        confirmButtonColor: '#dc3545',
    };

    //// 0: exit not delete
    //// 1: exit yes delete
    //// undefined: cancel

    let swal_res = await swalert.big.blocking(options);
    console.debug(`swal_res: { isConfirmed: ${swal_res?.isConfirmed}, value: ${swal_res?.value} }`);
    /*if ( value === 1 ) {
        const rimraf = require('rimraf');
        rimraf(SESSION_PATH_ABS, console.log);
    }*/
    if (swal_res?.isConfirmed === true) {
        console.log('swal_res.value === true, existing')
        if (MEDIA_RECORDER) {
            console.debug('stopping MEDIA_RECORDER before exiting...')
            await MEDIA_RECORDER.stop();
            // @ts-ignore
            const vidwritten = await util.waitUntil(() => MEDIA_RECORDER.stopped, 20, 4000);
            console.debug('vidwritten: ', vidwritten)
        } else {

            console.debug('MEDIA_RECORDER is falsy')
        }
        if (swal_res?.value == 1) {
            // todo: clean session dir
        }
        util.app.getCurrentWindow().close();
    }
});
// @ts-ignore
NavigationButtons.minimize.click(util.app.getCurrentWindow().minimize);

async function toggle(action: "hide" | "display", ...elementNames: ("Title" | "NavigationButtons" | "Sidebar")[]): Promise<unknown[]> {
    const promises = [];
    for (let e of elementNames) {
        switch (e) {
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

async function hide(...elementNames: ("Title" | "NavigationButtons" | "Sidebar")[]): Promise<unknown[]> {
    return await toggle("hide", ...elementNames);
}

async function display(...elementNames: ("Title" | "NavigationButtons" | "Sidebar")[]): Promise<unknown[]> {
    return await toggle("display", ...elementNames);
}

export default { skipFade, MainContent, Sidebar, Title, BigConfig, Document, NavigationButtons, hide, display }
