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
    base: {
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
        reporters : ['mocha'],
        fileFixtures: {
            stripPrefix: 'tests/fixtures/'
        },
        webpack   : {
            mode   : 'development',
            module : {
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
                                        'transform-custom-element-classes'
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
        mochaReporter: {
            // https://www.npmjs.com/package/karma-mocha-reporter
            output: 'autowatch'
        },
        autoWatch                 : false,
        browserDisconnectTimeout  : 1000*2,  // default 2000
        browserDisconnectTolerance: 1,       // default 0
        browserNoActivityTimeout  : 1000*10, // default 10000
        captureTimeout            : 1000*60, // default 60000
        colors                    : true,
        concurrency               : Infinity,
        port                      : 9876,
        singleRun                 : true
    },
    coverage: {
        get reporters() {
            return [].concat(settings.base.reporters, 'coverage');
        },
        get webpack() {
            const webpackConfig = Object.assign({}, settings.base.webpack);
            const babelPluginsConfig = webpackConfig.module.rules[0].use[0].options.plugins;

            babelPluginsConfig.push(['istanbul', { exclude: 'tests/*' }]);

            return webpackConfig;
        },
        // Code coverage
        // https://www.npmjs.com/package/karma-coverage
        coverageReporter: {
            reporters: [
                { type: 'html' },
                { type: 'lcovonly' },
                { type: 'text-summary' }
            ]
        }
    },
    local: {
        get webpack() {
            const webpackConfig = Object.assign({}, settings.base.webpack);

            webpackConfig.devtool = 'inline-source-map';

            return webpackConfig;
        },
    },
    remote: {
        // Use custom hostname to prevent Safari disconnects
        // https://support.saucelabs.com/hc/en-us/articles/115010079868-Issues-with-Safari-and-Karma-Test-Runner
        hostname: 'TRAVIS' in process.env ? 'travis.dev' : 'localhost',
        get reporters() {
            return [].concat(settings.base.reporters, 'saucelabs');
        },
        sauceLabs: {
            username         : saucelabs.username || process.env.SAUCE_USERNAME,
            accessKey        : saucelabs.accessKey || process.env.SAUCE_ACCESS_KEY,
            testName         : `${pkg.name} (karma)`,
            recordScreenshots: false,
            recordVideo      : false
        }
    }
};


// Functions
// =============================================================================
function message(text, level = 'log') {
    // Credit: Thomas Brierley
    // https://stackoverflow.com/a/51506718/4903063
    const wrap = (s, w = 60) => {
        s = s.replace(new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n');
        s = s.replace(/\n\s/g, '\n');

        return s;
    };

    // eslint-disable-next-line
    console[level]([
        '============================================================\n',
        `${wrap(text)}\n`,
        '============================================================\n'
    ].join(''));
}


// Export
// =============================================================================
module.exports = function(config) {
    const isRemoteCoverage = Boolean(process.argv.indexOf('--remotecoverage') > -1);
    const isRemoteTest = Boolean(process.argv.indexOf('--remotetest') > -1);
    const testConfig = Object.assign({}, settings.base);

    // Remote test
    if (isRemoteTest) {
        message('KARMA: Browser Tests');

        Object.assign(testConfig, settings.remote, {
            // SauceLabs browers
            // https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
            customLaunchers: {
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
                    version    : '30'
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
            },
            get browsers() {
                return Object.keys(this.customLaunchers);
            }
        });
    }
    // Remote coverage
    else if (isRemoteCoverage) {
        message('KARMA: Code Coverage');

        Object.assign(testConfig, settings.remote, settings.coverage, {
            browsers       : ['ChromeTravis'],
            customLaunchers: {
                ChromeTravis: {
                    base : 'ChromeHeadless',
                    flags: [
                        '--no-sandbox'
                    ]
                }
            }
        });
    }
    // Local
    else {
        message(`KARMA: localhost:${testConfig.port}/debug.html`);

        Object.assign(testConfig, settings.local, settings.coverage, {
            browsers: ['ChromeHeadless']
        });
    }

    // Logging: LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG
    testConfig.logLevel = config.LOG_INFO;
    config.set(testConfig);
};
