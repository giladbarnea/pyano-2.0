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
//# sourceMappingURL=init.js.map