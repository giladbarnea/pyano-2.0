import type { store } from "store";



import sidebar from "./sidebar";

function toPage(page: store.PageName, reload: boolean): Promise<any> {
    switch (page) {

        case 'new':
            return require('./New').load(reload);
        case 'running':
            return require('./Running').load(reload);
        case 'record':
            // @ts-ignore
            return recordPage.load(reload);
        case 'tools':
            // @ts-ignore
            return fileToolsPage.load(reload);
        default:
            console.error(`pages default, got: ${page}`);
    }

}

export { sidebar, toPage };
