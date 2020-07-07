"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MyStore_1 = require("./MyStore");
const MyAlert_1 = require("./MyAlert");
const util = require("./util");
const fs = require("fs");
const extra_1 = require("./bhe/extra");
const bhe_1 = require("./bhe");
console.group('Glob.ts');
const BigConfig = new MyStore_1.BigConfigCls(true);
let skipFade = false;
const MainContent = bhe_1.elem({ byid: 'main_content' });
const Sidebar = extra_1.visualbhe({ byid: 'sidebar' });
const Title = extra_1.visualbhe({ byid: 'title' });
const Document = bhe_1.elem({ htmlElement: document });
const NavigationButtons = extra_1.visualbhe({
    byid: 'navigation_buttons', children: {
        exit: '.exit',
        minimize: '.minimize',
    }
});
NavigationButtons.exit.click(async () => {
    let options = {
        title: 'Are you sure you want to exit?',
        confirmButtonColor: '#dc3545',
    };
    if (LOG || fs.existsSync(SESSION_PATH_ABS)) {
        options = Object.assign(Object.assign({}, options), { input: "checkbox", inputValue: `delete`, onBeforeOpen: modal => {
                let el = bhe_1.elem({
                    htmlElement: modal,
                    children: { label: '.swal2-label', checkbox: '#swal2-checkbox' }
                });
                el.checkbox.css({ height: '22px', width: '22px' });
                el.label
                    .css({ fontSize: '22px' })
                    .html(`Delete this session's errors dir (${path.relative(ROOT_PATH_ABS, SESSION_PATH_ABS)})`);
            } });
    }
    let shouldExit = await MyAlert_1.default.big.confirm(options);
    console.log({ shouldExit });
    if (shouldExit) {
        util.getCurrentWindow().close();
    }
});
NavigationButtons.minimize.click(() => util.getCurrentWindow().minimize());
async function toggle(action, ...args) {
    const promises = [];
    for (let a of args) {
        switch (a) {
            case "Title":
                promises.push(Title[action]());
                break;
            case "NavigationButtons":
                promises.push(NavigationButtons[action]());
                break;
            case "Sidebar":
                promises.push(Sidebar[action]());
                break;
        }
    }
    return await Promise.all(promises);
}
async function hide(...args) {
    return await toggle("hide", ...args);
}
async function display(...args) {
    return await toggle("display", ...args);
}
console.groupEnd();
exports.default = { skipFade, MainContent, Sidebar, Title, BigConfig, Document, NavigationButtons, hide, display };
//# sourceMappingURL=Glob.js.map