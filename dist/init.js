"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.group(`init.ts`);
const MyPyShell_1 = require("./MyPyShell");
const Pages = require("./pages");
util.waitUntil(MyPyShell_1.isDone).then(() => {
    Pages.sidebar.build();
    const last_page = BigConfig.last_page;
    console.log('last_page:', last_page);
    Pages.toPage(last_page, false);
});
console.groupEnd();
//# sourceMappingURL=init.js.map