/**import * as Pages from './pages'*/
console.group('pages.index.ts');


import sidebar from "./sidebar";

function toPage(page: coolstore.PageName, reload: boolean): Promise<any> {
    switch (page) {

        case 'new':
            return require('./New').load(reload);
        case 'running':
            return require('./Running').load(reload);
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
