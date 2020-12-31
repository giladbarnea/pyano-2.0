/*

module.exports = {
    "//": "https://jestjs.io/docs/en/configuration",
    // verbose: true,
    preset: "ts-jest",
    // maxConcurrency: 500,


    runner: "@jest-runner/electron",
    testEnvironment: '@jest-runner/electron/environment',

    // globalSetup:"./setup.js",

    // runner: '@jest-runner/electron/main',
    // testEnvironment: 'node', // window not defined


    globals: {
        "ts-jest": {
            "//": "https://kulshekhar.github.io/ts-jest/user/config/#options",
            diagnostics: false
        },
        // electron:require('electron')
    }
};
*/


// const defaults = require('jest').defaults;
module.exports = {
    globalSetup:"./setup.js",
    projects: [
        {
            // ...defaults,
            runner: '@jest-runner/electron/main',
            testEnvironment: 'node',
            testMatch: [ '**/__tests__/**/*.(spec|test).ts' ],
            globalSetup: "./setup.js",


        },
        {
            // ...defaults,
            runner: '@jest-runner/electron',
            testEnvironment: '@jest-runner/electron/environment',
            testMatch: [ '**/__tests__/**/*.(spec|test).tsx' ],
            globalSetup: "./setup.js",

        }
    ],

}