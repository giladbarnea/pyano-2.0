"use strict";
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
            return recordPage.load(reload);
        case 'file_tools':
            return fileToolsPage.load(reload);
        default:
            console.error(`pages default, got: ${page}`);
    }
}
exports.toPage = toPage;
console.groupEnd();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUloQyx1Q0FBZ0M7QUFxQnZCLGtCQXJCRixpQkFBTyxDQXFCRTtBQW5CaEIsU0FBUyxNQUFNLENBQUMsSUFBYyxFQUFFLE1BQWU7SUFDM0MsUUFBUyxJQUFJLEVBQUc7UUFFWixLQUFLLEtBQUs7WUFDTixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekMsS0FBSyxTQUFTO1lBQ1YsT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLEtBQUssUUFBUTtZQUVULE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxLQUFLLFlBQVk7WUFFYixPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEM7WUFDSSxPQUFPLENBQUMsS0FBSyxDQUFDLHVCQUF1QixJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQ3BEO0FBRUwsQ0FBQztBQUVpQix3QkFBTTtBQUN4QixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKippbXBvcnQgKiBhcyBQYWdlcyBmcm9tICcuL3BhZ2VzJyovXG5jb25zb2xlLmdyb3VwKCdwYWdlcy5pbmRleC50cycpO1xuXG5pbXBvcnQgeyBQYWdlTmFtZSB9IGZyb20gXCIuLi9NeVN0b3JlXCI7XG5cbmltcG9ydCBzaWRlYmFyIGZyb20gXCIuL3NpZGViYXJcIjtcblxuZnVuY3Rpb24gdG9QYWdlKHBhZ2U6IFBhZ2VOYW1lLCByZWxvYWQ6IGJvb2xlYW4pOiBQcm9taXNlPGFueT4ge1xuICAgIHN3aXRjaCAoIHBhZ2UgKSB7XG4gICAgICAgIFxuICAgICAgICBjYXNlICduZXcnOlxuICAgICAgICAgICAgcmV0dXJuIHJlcXVpcmUoJy4vTmV3JykubG9hZChyZWxvYWQpO1xuICAgICAgICBjYXNlICdydW5uaW5nJzpcbiAgICAgICAgICAgIHJldHVybiByZXF1aXJlKCcuL1J1bm5pbmcnKS5sb2FkKHJlbG9hZCk7XG4gICAgICAgIGNhc2UgJ3JlY29yZCc6XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gcmVjb3JkUGFnZS5sb2FkKHJlbG9hZCk7XG4gICAgICAgIGNhc2UgJ2ZpbGVfdG9vbHMnOlxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGZpbGVUb29sc1BhZ2UubG9hZChyZWxvYWQpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgcGFnZXMgZGVmYXVsdCwgZ290OiAke3BhZ2V9YCk7XG4gICAgfVxuICAgIFxufVxuXG5leHBvcnQgeyBzaWRlYmFyLCB0b1BhZ2UgfTtcbmNvbnNvbGUuZ3JvdXBFbmQoKTtcbiJdfQ==