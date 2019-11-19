"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const New_1 = require("./New");
console.group('pages.index.ts');
const sidebar = require("./sidebar");
exports.sidebar = sidebar;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUE0QjtBQUU1QixPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFHaEMscUNBQXFDO0FBbUI1QiwwQkFBTztBQWpCaEIsU0FBUyxNQUFNLENBQUMsSUFBYyxFQUFFLE1BQWU7SUFDM0MsUUFBUyxJQUFJLEVBQUc7UUFFWixLQUFLLEtBQUs7WUFDTixPQUFPLGFBQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEMsS0FBSyxTQUFTO1lBQ1YsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZDLEtBQUssUUFBUTtZQUNULE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxLQUFLLFlBQVk7WUFDYixPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEM7WUFDSSxPQUFPLENBQUMsS0FBSyxDQUFDLHVCQUF1QixJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQ3BEO0FBRUwsQ0FBQztBQUVpQix3QkFBTTtBQUN4QixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbmV3UGFnZSBmcm9tIFwiLi9OZXdcIjtcblxuY29uc29sZS5ncm91cCgncGFnZXMuaW5kZXgudHMnKTtcbmltcG9ydCB7IFBhZ2VOYW1lIH0gZnJvbSBcIi4uL015U3RvcmVcIjtcblxuaW1wb3J0ICogYXMgc2lkZWJhciBmcm9tIFwiLi9zaWRlYmFyXCI7XG5cbmZ1bmN0aW9uIHRvUGFnZShwYWdlOiBQYWdlTmFtZSwgcmVsb2FkOiBib29sZWFuKTogUHJvbWlzZTxhbnk+IHtcbiAgICBzd2l0Y2ggKCBwYWdlICkge1xuICAgICAgICBcbiAgICAgICAgY2FzZSAnbmV3JzpcbiAgICAgICAgICAgIHJldHVybiBuZXdQYWdlLmxvYWQocmVsb2FkKTtcbiAgICAgICAgY2FzZSAncnVubmluZyc6XG4gICAgICAgICAgICByZXR1cm4gaW5zaWRlVGVzdFBhZ2UubG9hZChyZWxvYWQpO1xuICAgICAgICBjYXNlICdyZWNvcmQnOlxuICAgICAgICAgICAgcmV0dXJuIHJlY29yZFBhZ2UubG9hZChyZWxvYWQpO1xuICAgICAgICBjYXNlICdmaWxlX3Rvb2xzJzpcbiAgICAgICAgICAgIHJldHVybiBmaWxlVG9vbHNQYWdlLmxvYWQocmVsb2FkKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHBhZ2VzIGRlZmF1bHQsIGdvdDogJHtwYWdlfWApO1xuICAgIH1cbiAgICBcbn1cblxuZXhwb3J0IHsgc2lkZWJhciwgdG9QYWdlIH07XG5jb25zb2xlLmdyb3VwRW5kKCk7XG4iXX0=