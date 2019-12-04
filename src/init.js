"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("./util");
const MyPyShell_1 = require("./MyPyShell");
const Pages = require("./pages");
const Glob_1 = require("./Glob");
util.waitUntil(MyPyShell_1.isDone).then(() => {
    Pages.sidebar.build();
    const last_page = Glob_1.default.BigConfig.last_page;
    console.log('last_page:', last_page);
    Pages.toPage(last_page, false);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBK0I7QUFHL0IsMkNBQXFDO0FBRXJDLGlDQUFpQztBQUNqQyxpQ0FBMEI7QUFJMUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtJQUM3QixLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBR3RCLE1BQU0sU0FBUyxHQUFHLGNBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO0lBQzNDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3JDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBR25DLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgdXRpbCBmcm9tIFwiLi91dGlsXCI7XG5cblxuaW1wb3J0IHsgaXNEb25lIH0gZnJvbSBcIi4vTXlQeVNoZWxsXCI7XG5cbmltcG9ydCAqIGFzIFBhZ2VzIGZyb20gXCIuL3BhZ2VzXCI7XG5pbXBvcnQgR2xvYiBmcm9tICcuL0dsb2InO1xuaW1wb3J0IE15QWxlcnQgZnJvbSBcIi4vTXlBbGVydFwiO1xuXG5cbnV0aWwud2FpdFVudGlsKGlzRG9uZSkudGhlbigoKSA9PiB7XG4gICAgUGFnZXMuc2lkZWJhci5idWlsZCgpO1xuICAgIFxuICAgIFxuICAgIGNvbnN0IGxhc3RfcGFnZSA9IEdsb2IuQmlnQ29uZmlnLmxhc3RfcGFnZTtcbiAgICBjb25zb2xlLmxvZygnbGFzdF9wYWdlOicsIGxhc3RfcGFnZSk7XG4gICAgUGFnZXMudG9QYWdlKGxhc3RfcGFnZSwgZmFsc2UpO1xuICAgIFxuICAgIFxufSk7XG5cblxuIl19