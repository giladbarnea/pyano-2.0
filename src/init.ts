import * as util from "./util";


import { isDone } from "./MyPyShell";

import * as Pages from "./pages";
import Glob from './Glob';
import MyAlert from "./MyAlert";


util.waitUntil(isDone).then(() => {
    Pages.sidebar.build();
    
    
    const last_page = Glob.BigConfig.last_page;
    console.log('last_page:', last_page);
    Pages.toPage(last_page, false);
    
    
});


