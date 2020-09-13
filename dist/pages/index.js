Object.defineProperty(exports, "__esModule", { value: true });
console.group('pages.index.ts');
const sidebar_1 = require("./sidebar");
exports.sidebar = sidebar_1.default;
function toPage(page, reload) {
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
exports.toPage = toPage;
console.groupEnd();
//# sourceMappingURL=index.js.map