import newPage from "./New";

console.group('pages.index.ts');
import { PageName } from "../MyStore";

import * as sidebar from "./sidebar";

function toPage(page: PageName, reload: boolean): Promise<any> {
    switch ( page ) {
        
        case 'new':
            return newPage.load(reload);
        case 'running':
            return insideTestPage.load(reload);
        case 'record':
            return recordPage.load(reload);
        case 'file_tools':
            return fileToolsPage.load(reload);
        default:
            console.error(`pages default, got: ${page}`);
    }
    
}

export { sidebar, toPage };
console.groupEnd();
