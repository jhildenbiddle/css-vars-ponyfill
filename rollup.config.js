// Dependencies
// =============================================================================
const path = require('path');

import babel      from 'rollup-plugin-babel';
import commonjs   from 'rollup-plugin-commonjs';
import { eslint } from 'rollup-plugin-eslint';
import json       from 'rollup-plugin-json';
import merge      from 'lodash.merge';
import pkg        from './package.json';
import resolve    from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';


// Settings
// =============================================================================
// Output
const entryFile  = path.resolve(__dirname, 'src', 'index.js');
const outputFile = path.resolve(__dirname, 'dist', `${pkg.name}.js`);
const outputName = 'cssVars';

// Banner
const bannerData = [
    `${pkg.name}`,
    `v${pkg.version}`,
    `${pkg.homepage}`,
    `(c) ${(new Date()).getFullYear()} ${pkg.author}`,
    `${pkg.license} license`
];

// Plugins
const pluginSettings = {
    eslint: {
        exclude       : ['node_modules/**', './package.json'],
        throwOnWarning: false,
        throwOnError  : true
    },
    babel: {
        exclude: ['node_modules/**'],
        presets: [
            ['env', {
                modules: false,
                targets: {
                    browsers: ['ie >= 9']
                }
            }]
        ],
        plugins: [
            'external-helpers'
        ]
    },
    terser: {
        beautify: {
            compress: false,
            mangle  : false,
            output: {
                beautify: true,
                comments: /(?:^!|@(?:license|preserve))/
            }
        },
        minify: {
            compress: true,
            mangle  : true,
            output  : {
                comments: new RegExp(pkg.name)
            }
        }
    }
};


// Config
// =============================================================================
// Base
const config = {
    input : entryFile,
    output: {
        file     : outputFile,
        name     : outputName,
        banner   : `/*!\n * ${ bannerData.join('\n * ') }\n */`,
        sourcemap: true
    },
    plugins: [
        resolve(),
        commonjs(),
        json(),
        eslint(pluginSettings.eslint),
        babel(pluginSettings.babel)
    ],
    watch: {
        clearScreen: false
    }
};

// Formats
// -----------------------------------------------------------------------------
// ES Module
const esm = merge({}, config, {
    output: {
        file  : config.output.file.replace(/\.js$/, '.esm.js'),
        format: 'esm'
    },
    plugins: [
        terser(pluginSettings.terser.beautify)
    ]
});

// ES Module (Minified)
const esmMinified = merge({}, config, {
    output: {
        file  : esm.output.file.replace(/\.js$/, '.min.js'),
        format: esm.output.format
    },
    plugins: [
        terser(pluginSettings.terser.minify)
    ]
});

// UMD
const umd = merge({}, config, {
    output: {
        format: 'umd'
    },
    plugins: [
        terser(pluginSettings.terser.beautify)
    ]
});

// UMD (Minified)
const umdMinified = merge({}, config, {
    output: {
        file  : umd.output.file.replace(/\.js$/, '.min.js'),
        format: umd.output.format
    },
    plugins: [
        terser(pluginSettings.terser.minify)
    ]
});


// Exports
// =============================================================================
export default [
    esm,
    esmMinified,
    umd,
    umdMinified
];
