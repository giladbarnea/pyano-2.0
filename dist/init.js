Object.defineProperty(exports, "__esModule", { value: true });
console.group(`init.ts`);
const MyPyShell_1 = require("./MyPyShell");
const Pages = require("./pages");
util.waitUntil(MyPyShell_1.isDone).then(() => {
    Pages.sidebar.build();
    const last_page = BigConfig.last_page;
    elog.log('last_page:', last_page);
    Pages.toPage(last_page, false);
});
console.groupEnd();
/*
 window.onerror = async (event, source, lineno, colno, error) => {
 const dirname = new Date().human();
 console.error('WINDOW ONERROR!!!');
 await MyAlert.big.error({
 title : `An error occured when making sure all truth txt files exist. Tried to check: ${this.test.truth.name} and ${this.exam.truth.name}. Logs saved to ERRORS/${dirname}`,
 html : error,
 onOpen : async modalElement => {
 const absdirpath = path.join(ROOT_PATH_ABS, 'ERRORS', dirname);
 const webContents = remote.getCurrentWebContents();
 await webContents.savePage(path.join(absdirpath, 'screenshot.html'), "HTMLComplete");
 }
 });
 };
 remote.process.on("rejectionHandled", async error => {
 const dirname = new Date().human();
 console.error('REJECTION!!!');
 await MyAlert.big.error({
 title : `An error occured when making sure all truth txt files exist. Tried to check: ${this.test.truth.name} and ${this.exam.truth.name}. Logs saved to ERRORS/${dirname}`,
 html : error,
 onOpen : async modalElement => {
 const absdirpath = path.join(ROOT_PATH_ABS, 'ERRORS', dirname);
 const webContents = remote.getCurrentWebContents();
 await webContents.savePage(path.join(absdirpath, 'screenshot.html'), "HTMLComplete");
 }
 });
 });
 
 remote.process.on("uncaughtException", async error => {
 const dirname = new Date().human();
 console.error('ERROR!!!');
 await MyAlert.big.error({
 title : `An error occured when making sure all truth txt files exist. Tried to check: ${this.test.truth.name} and ${this.exam.truth.name}. Logs saved to ERRORS/${dirname}`,
 html : error,
 onOpen : async modalElement => {
 const absdirpath = path.join(ROOT_PATH_ABS, 'ERRORS', dirname);
 const webContents = remote.getCurrentWebContents();
 await webContents.savePage(path.join(absdirpath, 'screenshot.html'), "HTMLComplete");
 }
 });
 });
 
 
 */