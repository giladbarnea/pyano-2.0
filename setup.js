// setup.js
module.exports = async () => {
    console.log(`setup.js`);
    // Set reference to mongod in order to close the server during teardown.
    global.util = {
        errorToObj: function errorToObj(e) {
            console.warn("BAD")
        }
    };
};