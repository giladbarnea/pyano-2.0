// my-custom-reporter.js
// require('jest')
// const { DefaultReporter } = require("@jest/reporters");

// class MyCustomReporter extends DefaultReporter {
class MyCustomReporter {
    constructor(globalConfig, options) {
        // super(globalConfig);
        this._globalConfig = globalConfig;
        this._options = options;
    }

    // onTestResult(test, testResult, aggregatedResults) {
    //     console.log("!!!!!!!!2")
    //     super.onTestResult(test, testResult, aggregatedResults);
    // }

    onRunComplete(contexts, results) {
        console.log('Custom reporter output:');
        console.log('GlobalConfig: ', this._globalConfig);
        console.log('Options: ', this._options);
    }
}

module.exports = MyCustomReporter;
// or export default MyCustomReporter;