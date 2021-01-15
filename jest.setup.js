// jest.setup.js
module.exports = () => {

    /*
    console.group(`\nsetup.js. __dirname: ${__dirname}`);
    let distdir = require('path').join(__dirname, 'dist');
    if (require('fs').existsSync(distdir)) {
        console.log(`distdir exists and added to path: ${distdir}`)
    }else{
        throw new Error(`does not exist: ${distdir}`)
    }
    require('app-module-path').addPath(distdir);
    console.groupEnd();
    */

    /*
    Set reference to mongod in order to close the server during teardown.
    global.util = {
        errorToObj: function errorToObj(e) {
            console.warn("BAD")
        }
    };
    */
};
global.it = async function (name, func) {
    return test(name, async () => {
        try {
            await func();
        } catch (e) {
            console.warn("!!!!!!!!!!1")
            throw e;
        }
    });
};