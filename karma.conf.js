// Dependencies
// =============================================================================
const pkg       = require('./package');
const saucelabs = require('./saucelabs.config');


// Variables
// =============================================================================
const files = {
    serve: './tests/fixtures/**/*.*',
    test : './tests/**/*.test.js'
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
        'https://cdn.polyfill.io/v2/polyfill.min.js', // Required for web component tests
        'node_modules/babel-polyfill/dist/polyfill.js',
        'node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js', // Required for web component tests
        files.test,
        // Serve files for accessing in tests via AJAX
        // Ex: /base/[files.serve]/path/to/file
        { pattern: files.serve, included: false, served: true, watched: true }
    ],
    preprocessors: {
        [files.test]: ['eslint', 'webpack', 'sourcemap']
    },
    frameworks: ['mocha', 'chai'],
    reporters : ['mocha', 'coverage'],
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
                            ['env', {
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
    concurrency: Infinity
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
            version    : '26.0'
        },
        sl_edge: {
            base       : 'SauceLabs',
            browserName: 'MicrosoftEdge',
            platform   : 'Windows 10',
            version    : '13.10586'
        },
        sl_firefox: {
            base       : 'SauceLabs',
            browserName: 'Firefox',
            platform   : 'Windows 10',
            version    : '30'
        },
        sl_ie_11: {
            base       : 'SauceLabs',
            browserName: 'Internet Explorer',
            platform   : 'Windows 10',
            version    : '11.0'
        },

        // IE < 11 test disabled due to web component incompatibility
        // ----------------------------------------------------------
        // sl_ie_10: {
        //     base       : 'SauceLabs',
        //     browserName: 'Internet Explorer',
        //     platform   : 'Windows 8',
        //     version    : '10.0'
        // },
        // sl_ie_9: {
        //     base       : 'SauceLabs',
        //     browserName: 'Internet Explorer',
        //     platform   : 'Windows 7',
        //     version    : '9.0'
        // },

        sl_safari: {
            base       : 'SauceLabs',
            browserName: 'Safari',
            platform   : 'OS X 10.10',
            version    : '8.0'
        }
    },
    // Set browsers to customLaunchers
    get browsers() {
        return Object.keys(this.customLaunchers);
    },
    // SauceLab settings
    sauceLabs: {
        username : saucelabs.username || process.env.SAUCE_USERNAME,
        accessKey: saucelabs.accessKey || process.env.SAUCE_ACCESS_KEY,
        testName : `${pkg.name} (karma)`
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
    testConfig.logLevel = config.LOG_WARN;
    config.set(testConfig);
};
