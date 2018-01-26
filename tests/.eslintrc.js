// Cascading config (merges with parent config)
// http://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
module.exports = {
    "env": {
        "mocha": true
    },
    "plugins": [
        "chai-expect",
        "mocha"
    ],
    "parserOptions": {
        "ecmaVersion": 8,
    },
    "rules": {
        "mocha/no-global-tests"   : ["error"],
        "mocha/no-identical-title": ["error"],
        "mocha/no-mocha-arrows"   : ["error"],
        "no-console"              : "off",
    }
};
