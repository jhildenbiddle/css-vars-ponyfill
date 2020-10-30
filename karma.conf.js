// Dependencies
// =============================================================================
const fs          = require('fs');
const getRepoInfo = require('git-repo-info');
const pkg         = JSON.parse(fs.readFileSync('./package.json', 'utf8'));


// Variables
// =============================================================================
const files = {
    fixtures: './tests/fixtures/**/*',
    test    : './tests/**/*.test.js'
};
const gitInfo = getRepoInfo();


// Settings
// =============================================================================
const settings = {
    files: [
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
                                // See .babelrc
                                plugins: [
                                    ['istanbul', { include: 'src/*' }]
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
    // browserDisconnectTimeout  : 1000*10, // default 2000
    // browserDisconnectTolerance: 1,       // default 0
    // browserNoActivityTimeout  : 1000*30, // default 10000
    // captureTimeout            : 1000*60, // default 60000
    client: {
        // Prevent browser messages from appearing in terminal
        captureConsole: false,
        mocha: {
            timeout: 1000*5 // default 2000
        }
    }
};


// Export
// =============================================================================
module.exports = function(config) {
    const isDebug  = Boolean(process.argv.indexOf('--debug') > -1);
    const isRemote = Boolean(process.argv.indexOf('--remote') > -1);

    // Remote test
    if (isRemote) {
        // Browsers
        // https://www.browserstack.com/automate/capabilities
        settings.customLaunchers = {
            bs_chrome_latest: {
                base           : 'BrowserStack',
                browser        : 'Chrome',
                os             : 'Windows',
                os_version     : '10'
            },
            bs_chrome: {
                base           : 'BrowserStack',
                browser        : 'Chrome',
                browser_version: '48.0',
                os             : 'Windows',
                os_version     : '10'
            },
            bs_ie_11: {
                base           : 'BrowserStack',
                browser        : 'IE',
                browser_version: '11.0',
                os             : 'Windows',
                os_version     : '10'
            }
        };
        settings.browsers = Object.keys(settings.customLaunchers);
        settings.reporters.push('BrowserStack');
        settings.browserStack = {
            username : process.env.BROWSERSTACK_USERNAME,
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
            build    : `${process.env.TRAVIS_BRANCH || gitInfo.branch}: ${process.env.TRAVIS_COMMIT_MESSAGE || gitInfo.commitMessage}`,
            name     : (process.env.TRAVIS_BUILD_NUMBER ? `Travis ${process.env.TRAVIS_BUILD_NUMBER}` : 'Local') + ` @ ${new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short', hour12: true })}`,
            project  : pkg.name,
            video    : false
        };
    }
    // Local
    else {
        settings.customLaunchers = {
            ChromeHeadlessDebug: {
                base : 'ChromeHeadless',
                flags: [
                    '--disable-extensions',
                    '--remote-debugging-port=9333'
                ]
            },
        };
        settings.browsers = [].concat(
            Object.keys(settings.customLaunchers)
            // 'jsdom' // SSR Testing
        );
        settings.webpack.devtool = 'inline-source-map';
        settings.coverageIstanbulReporter.reports.push('html');

        if (isDebug) {
            // Prevent disconnect during VSCode debugging
            settings.browserDisconnectTimeout = 1000*6000; // default 2000
        }

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
