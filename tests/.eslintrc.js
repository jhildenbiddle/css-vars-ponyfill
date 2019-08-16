// Cascading config (merges with parent config)
// http://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
module.exports = {
    "env": {
        "mocha": true
    },
    "extends": [
        "plugin:mocha/recommended"
    ],
    "parserOptions": {
        "ecmaVersion": 8,
    },
    "plugins": [
        "chai-expect",
        "mocha"
    ],
    "rules": {
        "mocha/no-hooks-for-single-case": ["off"],
        "mocha/no-top-level-hooks"      : ["off"],
        "mocha/no-setup-in-describe"    : ["off"],
        "no-console"                    : ["off"]
    }
};
