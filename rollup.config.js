// Dependencies
// =============================================================================
import babel      from 'rollup-plugin-babel';
import commonjs   from 'rollup-plugin-commonjs';
import eslint     from 'rollup-plugin-eslint';
import json       from 'rollup-plugin-json';
import merge      from 'lodash.merge';
import pkg        from './package.json';
import resolve    from 'rollup-plugin-node-resolve';
import uglify     from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

const path      = require('path');
const entryFile = path.resolve(__dirname, 'src', 'index.js');
const fnName    = 'cssVars';


// Constants & Variables
// =============================================================================
const bannerData = [
    `${pkg.name}`,
    `v${pkg.version}`,
    `${pkg.homepage}`,
    `(c) ${(new Date()).getFullYear()} ${pkg.author}`,
    `${pkg.license} license`
];
const settings = {
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
    uglify: {
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
                comments: /^!/
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
        file     : path.resolve(__dirname, 'dist', `${pkg.name}.js`),
        name     : fnName,
        banner   : `/*!\n * ${ bannerData.join('\n * ') }\n */`,
        sourcemap: true
    },
    plugins: [
        resolve(),
        commonjs(),
        json(),
        eslint(settings.eslint),
        babel(settings.babel)
    ],
    watch: {
        clearScreen: false
    }
};

// Output
// -----------------------------------------------------------------------------
// ES Module
const esm = merge({}, config, {
    output: {
        file  : config.output.file.replace(/\.js$/, '.esm.js'),
        format: 'es'
    },
    plugins: [
        uglify(settings.uglify.beautify, minify)
    ]
});

// ES Module (Minified)
const esmMinified = merge({}, config, {
    output: {
        file  : esm.output.file.replace(/\.js$/, '.min.js'),
        format: esm.output.format
    },
    plugins: [
        uglify(settings.uglify.minify, minify)
    ]
});

// UMD
const umd = merge({}, config, {
    output: {
        format: 'umd'
    },
    plugins: [
        uglify(settings.uglify.beautify, minify)
    ]
});

// UMD (Minified)
const umdMinified = merge({}, config, {
    output: {
        file  : umd.output.file.replace(/\.js$/, '.min.js'),
        format: umd.output.format
    },
    plugins: [
        uglify(settings.uglify.minify, minify)
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
