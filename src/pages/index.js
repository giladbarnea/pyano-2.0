"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.group('pages.index.ts');
const New_1 = require("./New");
const sidebar_1 = require("./sidebar");
exports.sidebar = sidebar_1.default;
function toPage(page, reload) {
    switch (page) {
        case 'new':
            return New_1.default.load(reload);
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
exports.toPage = toPage;
console.groupEnd();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNoQywrQkFBNEI7QUFJNUIsdUNBQWdDO0FBbUJ2QixrQkFuQkYsaUJBQU8sQ0FtQkU7QUFqQmhCLFNBQVMsTUFBTSxDQUFDLElBQWMsRUFBRSxNQUFlO0lBQzNDLFFBQVMsSUFBSSxFQUFHO1FBRVosS0FBSyxLQUFLO1lBQ04sT0FBTyxhQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hDLEtBQUssU0FBUztZQUNWLE9BQU8sY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxLQUFLLFFBQVE7WUFDVCxPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkMsS0FBSyxZQUFZO1lBQ2IsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RDO1lBQ0ksT0FBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUNwRDtBQUVMLENBQUM7QUFFaUIsd0JBQU07QUFDeEIsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc29sZS5ncm91cCgncGFnZXMuaW5kZXgudHMnKTtcbmltcG9ydCBuZXdQYWdlIGZyb20gXCIuL05ld1wiO1xuXG5pbXBvcnQgeyBQYWdlTmFtZSB9IGZyb20gXCIuLi9NeVN0b3JlXCI7XG5cbmltcG9ydCBzaWRlYmFyIGZyb20gXCIuL3NpZGViYXJcIjtcblxuZnVuY3Rpb24gdG9QYWdlKHBhZ2U6IFBhZ2VOYW1lLCByZWxvYWQ6IGJvb2xlYW4pOiBQcm9taXNlPGFueT4ge1xuICAgIHN3aXRjaCAoIHBhZ2UgKSB7XG4gICAgICAgIFxuICAgICAgICBjYXNlICduZXcnOlxuICAgICAgICAgICAgcmV0dXJuIG5ld1BhZ2UubG9hZChyZWxvYWQpO1xuICAgICAgICBjYXNlICdydW5uaW5nJzpcbiAgICAgICAgICAgIHJldHVybiBpbnNpZGVUZXN0UGFnZS5sb2FkKHJlbG9hZCk7XG4gICAgICAgIGNhc2UgJ3JlY29yZCc6XG4gICAgICAgICAgICByZXR1cm4gcmVjb3JkUGFnZS5sb2FkKHJlbG9hZCk7XG4gICAgICAgIGNhc2UgJ2ZpbGVfdG9vbHMnOlxuICAgICAgICAgICAgcmV0dXJuIGZpbGVUb29sc1BhZ2UubG9hZChyZWxvYWQpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgcGFnZXMgZGVmYXVsdCwgZ290OiAke3BhZ2V9YCk7XG4gICAgfVxuICAgIFxufVxuXG5leHBvcnQgeyBzaWRlYmFyLCB0b1BhZ2UgfTtcbmNvbnNvbGUuZ3JvdXBFbmQoKTtcbiJdfQ==