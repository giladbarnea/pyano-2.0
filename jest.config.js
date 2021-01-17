// https://jestjs.io/docs/en/configuration
/*console.group(`\njest.config.js. __dirname: ${__dirname}`);
const distdir = require('path').join(__dirname, 'src');
if (require('fs').existsSync(distdir)) {
    console.log(`distdir exists and added to path: ${distdir}`)
} else {
    throw new Error(`does not exist: ${distdir}`)
}
require('app-module-path').addPath(distdir);
console.groupEnd();*/
/** @typedef {import('ts-jest/dist/types')} */
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    verbose: true,
    preset: "ts-jest",

    // This solves:
    // 'The name `util` was looked up in the Haste module map. It cannot be resolved, because there exists several different files, or packages, that provide a module for that particular name and platform.'
    modulePathIgnorePatterns: [ "<rootDir>/dist/.*package.json" ],
    bail:1000,

    // this is neccessary for jest to accept 'import "swalert"' and not complain about "./swalert"
    modulePaths: [ "<rootDir>/src" ],
    // reporters: [ "default", "<rootDir>/jest-custom-reporter.js" ],

    // haste: { throwOnModuleCollision: false },
    // maxConcurrency: 500,
    // roots: [ __dirname, distdir ],
    // runner: "@jest-runner/electron",
    // testEnvironment: '@jest-runner/electron/environment',

    // globalSetup:"./jest.setup.js",

    // runner: '@jest-runner/electron/main',
    testEnvironment: 'node', // window not defined


    globals: {
        "ts-jest": {
            // https://kulshekhar.github.io/ts-jest/user/config/#options
            diagnostics: false,
        },
        MID_TEST: true
        // electron:require('electron')
    }
};
module.exports = config;


// const defaults = require('jest').defaults;
/*
module.exports = {
    globalSetup:"./jest.setup.js",
    projects: [
        {
            // ...defaults,
            runner: '@jest-runner/electron/main',
            testEnvironment: 'node',
            testMatch: [ '**!/__tests__/!**!/!*.(spec|test).ts' ],
            globalSetup: "./jest.setup.js",


        },
        {
            // ...defaults,
            runner: '@jest-runner/electron',
            testEnvironment: '@jest-runner/electron/environment',
            testMatch: [ '**!/__tests__/!**!/!*.(spec|test).tsx' ],
            globalSetup: "./jest.setup.js",

        }
    ],

}*/
