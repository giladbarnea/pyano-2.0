"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.group('pages.index.ts');
const New_1 = require("./New");
const Running_1 = require("./Running");
const sidebar_1 = require("./sidebar");
exports.sidebar = sidebar_1.default;
function toPage(page, reload) {
    switch (page) {
        case 'new':
            return New_1.default.load(reload);
        case 'running':
            return Running_1.default.load(reload);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNoQywrQkFBNEI7QUFDNUIsdUNBQW9DO0FBSXBDLHVDQUFnQztBQXFCdkIsa0JBckJGLGlCQUFPLENBcUJFO0FBbkJoQixTQUFTLE1BQU0sQ0FBQyxJQUFjLEVBQUUsTUFBZTtJQUMzQyxRQUFTLElBQUksRUFBRztRQUVaLEtBQUssS0FBSztZQUNOLE9BQU8sYUFBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoQyxLQUFLLFNBQVM7WUFDVixPQUFPLGlCQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BDLEtBQUssUUFBUTtZQUVULE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxLQUFLLFlBQVk7WUFFYixPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEM7WUFDSSxPQUFPLENBQUMsS0FBSyxDQUFDLHVCQUF1QixJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQ3BEO0FBRUwsQ0FBQztBQUVpQix3QkFBTTtBQUN4QixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKippbXBvcnQgKiBhcyBQYWdlcyBmcm9tICcuL3BhZ2VzJyovXG5jb25zb2xlLmdyb3VwKCdwYWdlcy5pbmRleC50cycpO1xuaW1wb3J0IG5ld1BhZ2UgZnJvbSBcIi4vTmV3XCI7XG5pbXBvcnQgcnVubmluZ1BhZ2UgZnJvbSBcIi4vUnVubmluZ1wiO1xuXG5pbXBvcnQgeyBQYWdlTmFtZSB9IGZyb20gXCIuLi9NeVN0b3JlXCI7XG5cbmltcG9ydCBzaWRlYmFyIGZyb20gXCIuL3NpZGViYXJcIjtcblxuZnVuY3Rpb24gdG9QYWdlKHBhZ2U6IFBhZ2VOYW1lLCByZWxvYWQ6IGJvb2xlYW4pOiBQcm9taXNlPGFueT4ge1xuICAgIHN3aXRjaCAoIHBhZ2UgKSB7XG4gICAgICAgIFxuICAgICAgICBjYXNlICduZXcnOlxuICAgICAgICAgICAgcmV0dXJuIG5ld1BhZ2UubG9hZChyZWxvYWQpO1xuICAgICAgICBjYXNlICdydW5uaW5nJzpcbiAgICAgICAgICAgIHJldHVybiBydW5uaW5nUGFnZS5sb2FkKHJlbG9hZCk7XG4gICAgICAgIGNhc2UgJ3JlY29yZCc6XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gcmVjb3JkUGFnZS5sb2FkKHJlbG9hZCk7XG4gICAgICAgIGNhc2UgJ2ZpbGVfdG9vbHMnOlxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmV0dXJuIGZpbGVUb29sc1BhZ2UubG9hZChyZWxvYWQpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgcGFnZXMgZGVmYXVsdCwgZ290OiAke3BhZ2V9YCk7XG4gICAgfVxuICAgIFxufVxuXG5leHBvcnQgeyBzaWRlYmFyLCB0b1BhZ2UgfTtcbmNvbnNvbGUuZ3JvdXBFbmQoKTtcbiJdfQ==