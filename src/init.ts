import { BetterHTMLElement, elem } from "./bhe";

console.group('init.ts');
import * as util from "./util";


import { isDone } from "./MyPyShell";

import * as Pages from "./pages";
import MyAlert from './MyAlert'
import Glob from './Glob';


util.waitUntil(isDone).then(() => {
    Pages.sidebar.build();
    
    
    const last_page = Glob.BigConfig.last_page;
    console.log('last_page:', last_page);
    Pages.toPage(last_page, false);
    const navigationButtons = elem({
        id : 'navigation_buttons', children : {
            exit : '.exit',
            minimize : '.minimize',
            
        }
    }) as BetterHTMLElement & { exit: BetterHTMLElement, minimize: BetterHTMLElement };
    navigationButtons.exit.click(async () => {
        let { value : shouldExit } = await MyAlert.big.warning({
            title : 'Are you sure you want to exit?',
            confirmButtonColor : '#dc3545',
        });
        if ( shouldExit )
            util.getCurrentWindow().close();
    });
    navigationButtons.minimize.click(() => util.getCurrentWindow().minimize());
    
    
});


/*
 
 
 /**/
console.groupEnd();
