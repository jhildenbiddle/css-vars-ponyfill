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


// Settings
// =============================================================================
const settings = {
    files: [
        'node_modules/@babel/polyfill/dist/polyfill.js',
        files.test,
        // Served only (Access in tests by prepending /base/ to path)
        { pattern: files.fixtures, included: false, served: true, watched: true }
    ],
    preprocessors: {
        [files.fixtures]: ['file-fixtures'],
        [files.test]    : ['eslint', 'webpack', 'sourcemap']
    },
    frameworks: ['mocha', 'chai'],
    reporters : ['mocha', 'coverage-istanbul'],
    fileFixtures: {
        stripPrefix: 'tests/fixtures/'
    },
    webpack: {
        mode  : 'development',
        module: {
            rules: [
                {
                    test   : /\.js$/,
                    exclude: [/node_modules/],
                    use    : [
                        {
                            loader : 'babel-loader',
                            options: {
                                presets: [
                                    [
                                        '@babel/env',
                                        {
                                            targets: {
                                                browsers: ['ie >= 9']
                                            }
                                        }
                                    ]
                                ],
                                plugins: [
                                    '@babel/plugin-transform-object-assign',
                                    'transform-custom-element-classes',
                                    ['istanbul', { exclude: 'tests/*' }]
                                ]
                            },
                        }
                    ]
                }
            ]
        }
    },
    webpackMiddleware: {
        // https://webpack.js.org/configuration/stats/
        stats: 'minimal'
    },
    // Code coverage
    // https://github.com/mattlewis92/karma-coverage-istanbul-reporter
    coverageIstanbulReporter: {
        reports                : ['lcovonly', 'text-summary'],
        combineBrowserReports  : true,
        fixWebpackSourcePaths  : true,
        skipFilesWithNoCoverage: true
    },
    mochaReporter: {
        // https://www.npmjs.com/package/karma-mocha-reporter
        output: 'autowatch'
    },
    autoWatch  : false,
    colors     : true,
    concurrency: Infinity,
    port       : 9876,
    singleRun  : true,
    // Prevent disconnect in Firefox/Safari
    // https://support.saucelabs.com/hc/en-us/articles/225104707-Karma-Tests-Disconnect-Particularly-When-Running-Tests-on-Safari
    browserDisconnectTimeout  : 1000*10, // default 2000
    browserDisconnectTolerance: 1,       // default 0
    browserNoActivityTimeout  : 1000*30, // default 10000
    captureTimeout            : 1000*60, // default 60000
    client: {
        // Prevent browser messages from appearing in terminal
        captureConsole: false
        // mocha: {
        //     timeout: 1000*20 // default 2000
        // }
    }
};


// Export
// =============================================================================
module.exports = function(config) {
    const isRemote = Boolean(process.argv.indexOf('--remote') > -1);

    // Remote test
    if (isRemote) {
        // Browsers
        // https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
        settings.customLaunchers = {
            sl_chrome: {
                base       : 'SauceLabs',
                browserName: 'Chrome',
                platform   : 'Windows 10',
                version    : '48.0'
            },
            sl_edge: {
                base       : 'SauceLabs',
                browserName: 'MicrosoftEdge',
                platform   : 'Windows 10',
                version    : '14.14393'
            },
            sl_firefox: {
                base       : 'SauceLabs',
                browserName: 'Firefox',
                platform   : 'Windows 10',
                version    : '32'
            },
            sl_ie_9: {
                base       : 'SauceLabs',
                browserName: 'Internet Explorer',
                platform   : 'Windows 7',
                version    : '9.0'
            },
            sl_safari: {
                base       : 'SauceLabs',
                browserName: 'Safari',
                platform   : 'OS X 10.10',
                version    : '8.0'
            }
        };
        settings.browsers = Object.keys(settings.customLaunchers);

        // SauceLabs
        settings.reporters.push('saucelabs');
        settings.sauceLabs = {
            username         : saucelabs.username || process.env.SAUCE_USERNAME,
            accessKey        : saucelabs.accessKey || process.env.SAUCE_ACCESS_KEY,
            testName         : `${pkg.name} (karma)`,
            recordScreenshots: false,
            recordVideo      : false
        };

        // Travis CI
        if ('TRAVIS' in process.env) {
            // Use custom hostname to prevent Safari disconnects
            // https://support.saucelabs.com/hc/en-us/articles/115010079868-Issues-with-Safari-and-Karma-Test-Runner
            settings.hostname = 'travis.dev';
        }
    }
    // Local
    else {
        settings.browsers = [
            'ChromeHeadless'
            // 'jsdom' // SSR Testing
        ];
        settings.webpack.devtool = 'inline-source-map';
        settings.coverageIstanbulReporter.reports.push('html');

        // eslint-disable-next-line
        console.log([
            '============================================================\n',
            `KARMA: localhost:${settings.port}/debug.html\n`,
            '============================================================\n'
        ].join(''));
    }

    // Logging: LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG
    settings.logLevel = config.LOG_INFO;
    config.set(settings);
};
