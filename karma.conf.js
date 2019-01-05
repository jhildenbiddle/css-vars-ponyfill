// Dependencies
// =============================================================================
const pkg       = require('./package');
const saucelabs = require('./saucelabs.config');


// Variables
// =============================================================================
const files = {
    fixtures: './tests/fixtures/**/*',
    test    : './tests/**/*.test.js'
};


// Local config
// =============================================================================
const localConfig = {
    // Add browsers via Karma launchers
    // https://www.npmjs.com/search?q=karma+launcher
    browsers: [
        'ChromeHeadless'
    ],
    files: [
        'node_modules/@babel/polyfill/dist/polyfill.js',
        files.test,
        // Served only
        // NOTE: Access in test files by prepending /base/ to path)
        { pattern: files.fixtures, included: false, served: true, watched: true }
    ],
    preprocessors: {
        [files.fixtures]: ['file-fixtures'],
        [files.test]    : ['eslint', 'webpack', 'sourcemap']
    },
    frameworks: ['mocha', 'chai'],
    reporters : ['mocha', 'coverage'],
    fileFixtures: {
        stripPrefix: 'tests/fixtures/'
    },
    webpack   : {
        mode   : 'development',
        devtool: 'inline-source-map',
        module : {
            rules: [{
                test   : /\.js$/,
                exclude: [/node_modules/],
                use    : [{
                    loader : 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/env', {
                                targets: {
                                    browsers: ['ie >= 9']
                                }
                            }]
                        ],
                        plugins: [
                            'transform-custom-element-classes',
                            ['istanbul', {
                                exclude: [
                                    '**/*.test.js',
                                    'tests/helpers/*'
                                ]
                            }]
                        ]
                    },
                }]
            }]
        }
    },
    webpackMiddleware: {
        // https://webpack.js.org/configuration/stats/
        stats: 'minimal'
    },
    // Code coverage
    // https://www.npmjs.com/package/karma-coverage
    coverageReporter: {
        reporters: [
            { type: 'html' },
            { type: 'lcovonly' },
            { type: 'text-summary' }
        ]
    },
    // Mocha reporter
    // https://www.npmjs.com/package/karma-mocha-reporter
    mochaReporter: {
        output: 'autowatch'
    },
    port       : 9876,
    colors     : true,
    autoWatch  : false,
    singleRun  : true,
    concurrency: Infinity,
    // Avoid DISCONNECTED messages
    browserDisconnectTimeout  : 1000*2,  // default 2000
    browserDisconnectTolerance: 1,       // default 0
    browserNoActivityTimeout  : 1000*10, // default 10000
    captureTimeout            : 1000*60  // default 60000
};


// Remote config
// =============================================================================
const remoteConfig = Object.assign({}, localConfig, {
    // SauceLabs browers (see platform configurator below)
    // https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
    customLaunchers: {
        sl_chrome: {
            base       : 'SauceLabs',
            browserName: 'Chrome',
            platform   : 'Windows 10',
            version    : '48.0'
        },
        // DISABLED DUE TO SAUCELABS ISSUES
        // sl_edge: {
        //     base       : 'SauceLabs',
        //     browserName: 'MicrosoftEdge',
        //     platform   : 'Windows 10',
        //     version    : '14.14393'
        // },
        sl_firefox: {
            base       : 'SauceLabs',
            browserName: 'Firefox',
            platform   : 'Windows 10',
            version    : '30'
        },
        // DISABLED DUE TO SAUCELABS ISSUES
        // sl_ie_11: {
        //     base       : 'SauceLabs',
        //     browserName: 'Internet Explorer',
        //     platform   : 'Windows 10',
        //     version    : '11.0'
        // },
        sl_ie_10: {
            base       : 'SauceLabs',
            browserName: 'Internet Explorer',
            platform   : 'Windows 8',
            version    : '10.0'
        },
        sl_ie_9: {
            base       : 'SauceLabs',
            browserName: 'Internet Explorer',
            platform   : 'Windows 7',
            version    : '9.0'
        }
        // DISABLED DUE TO SAUCELABS ISSUES
        // sl_safari: {
        //     base       : 'SauceLabs',
        //     browserName: 'Safari',
        //     platform   : 'OS X 10.10',
        //     version    : '8.0'
        // }
    },
    // Set browsers to customLaunchers
    get browsers() {
        return Object.keys(this.customLaunchers);
    },
    // SauceLab settings
    sauceLabs: {
        username         : saucelabs.username || process.env.SAUCE_USERNAME,
        accessKey        : saucelabs.accessKey || process.env.SAUCE_ACCESS_KEY,
        testName         : `${pkg.name} (karma)`,
        recordScreenshots: false,
        recordVideo      : false
    }
});


// Export
// =============================================================================
module.exports = function(config) {
    const isRemote   = Boolean(process.argv.indexOf('--remote') > -1);
    const testConfig = isRemote ? remoteConfig : localConfig;

    if (isRemote) {
        // Disabled source maps to prevent SauceLabs timeouts
        // https://github.com/karma-runner/karma-sauce-launcher/issues/95
        testConfig.webpack.devtool = '';
        testConfig.webpack.module.rules[0].use[0].options.sourceMap = false;

        // Add SauceLabs reporter
        testConfig.reporters.push('saucelabs');

        // Remove text-summary reporter
        testConfig.coverageReporter.reporters = testConfig.coverageReporter.reporters.filter(obj => obj.type !== 'text-summary');

        // Travis-specific settings
        if ('TRAVIS' in process.env) {
            // Use custom hostname to prevent Safari disconnects
            // https://support.saucelabs.com/hc/en-us/articles/115010079868-Issues-with-Safari-and-Karma-Test-Runner
            testConfig.hostname = 'travis.dev';
        }
    }
    else {
        // eslint-disable-next-line
        console.log([
            '============================================================\n',
            `KARMA: localhost:${testConfig.port}/debug.html\n`,
            '============================================================\n'
        ].join(''));
    }

    // Logging: LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG
    testConfig.logLevel = config.LOG_INFO;
    config.set(testConfig);
};
