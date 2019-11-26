/**import * as Pages from './pages'*/
console.group('pages.index.ts');
import newPage from "./New";
import runningPage from "./Running";

import { PageName } from "../MyStore";

import sidebar from "./sidebar";

function toPage(page: PageName, reload: boolean): Promise<any> {
    switch ( page ) {
        
        case 'new':
            return newPage.load(reload);
        case 'running':
            return runningPage.load(reload);
        case 'record':
            // @ts-ignore
            return recordPage.load(reload);
        case 'file_tools':
            // @ts-ignore
            return fileToolsPage.load(reload);
        default:
            console.error(`pages default, got: ${page}`);
    }
    
}

export { sidebar, toPage };
console.groupEnd();
