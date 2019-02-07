/**
 * Based on rework-vars by reworkcss
 * https://github.com/reworkcss/rework-vars
 */


// Dependencies
// =============================================================================
import balanced     from 'balanced-match';
import parseCss     from './parse-css';
import stringifyCss from './stringify-css';
import walkCss      from './walk-css';


// Constants & Variables
// =============================================================================
const VAR_PROP_IDENTIFIER = '--';
const VAR_FUNC_IDENTIFIER = 'var';
const variableStore       = {
    // Persisted custom property values (matches modern browsers)
    dom : {},
    // Non-persisted custom properties values
    temp: {},
    // Persisted custom property values passed using options.variables
    user: {}
};


// Functions
// =============================================================================
/**
 * Transforms W3C-style CSS variables to static values and returns an updated
 * CSS string.
 *
 * @param {object}   cssText CSS containing variable definitions and functions
 * @param {object}   [options] Options object
 * @param {boolean}  [options.allowMultiple=false] Enables processing :root rules
 *                   which target multiple selectors. Only applies the declarations
 *                   to :root in legacy browsers but allows secondary selectors to
 *                   apply to compliant browsers.
 * @param {boolean}  [options.fixNestedCalc=true] Removes nested 'calc' keywords
 *                   for legacy browser compatibility.
 * @param {boolean}  [options.onlyVars=false] Remove declarations that do not
 *                   contain a CSS variable from the return value. Note that
 *                   @font-face and @keyframe rules require all declarations to
 *                   be returned if a CSS variable is used.
 * @param {boolean}  [options.persist=false] Persists options.variables,
 *                   allowing variables set in previous calls to be applied in
 *                   subsequent calls.
 * @param {boolean}  [options.preserve=false] Preserve CSS variable definitions
 *                   and functions in the return value, allowing "live" variable
 *                   updates via JavaScript to continue working in browsers with
 *                   native CSS variable support.
 * @param {object}   [options.variables={}] CSS variable definitions to include
 *                   during transformation. Can be used to add new override
 *                   exisitng definitions.
 * @param {function} [options.onWarning] Callback on each transformation
 *                   warning. Passes 1) warningMessage as an argument.
 * @returns {string}
 */
function transformVars(cssText, options = {}) {
    const defaults = {
        allowMultiple: false,
        fixNestedCalc: true,
        onlyVars     : false,
        persist      : false,
        preserve     : false,
        variables    : {},
        onWarning() {}
    };
    const settings = Object.assign({}, defaults, options);
    const map      = settings.persist ? variableStore.dom : variableStore.temp = JSON.parse(JSON.stringify(variableStore.dom));

    // Convert cssText to AST (this could throw errors)
    const cssTree = parseCss(cssText, {
        onlyVars: settings.onlyVars
    });

    // Define variables
    cssTree.stylesheet.rules.forEach(function(rule) {
        const varNameIndices = [];

        if (rule.type !== 'rule') {
            return;
        }

        // only variables declared for `:root` are supported
        if (!settings.allowMultiple && rule.selectors.length !== 1 || rule.selectors[0] !== ':root') {
            return;
        }
        else if (settings.allowMultiple && rule.selectors.indexOf(':root') < 0) {
            return;
        }

        rule.declarations.forEach(function(decl, i) {
            const prop = decl.property;
            const value = decl.value;

            if (prop && prop.indexOf(VAR_PROP_IDENTIFIER) === 0) {
                map[prop] = value;
                varNameIndices.push(i);
            }
        });

        // optionally remove `--*` properties from the rule
        if (!settings.preserve) {
            for (let i = varNameIndices.length - 1; i >= 0; i--) {
                rule.declarations.splice(varNameIndices[i], 1);
            }
        }
    });

    // Restore persisted user values
    Object.keys(variableStore.user).forEach(key => {
        map[key] = variableStore.user[key];
    });

    // Handle variables defined in settings.variables
    if (Object.keys(settings.variables).length) {
        const newRule = {
            declarations: [],
            selectors   : [':root'],
            type        : 'rule'
        };

        Object.keys(settings.variables).forEach(key => {
            // Convert all property names to leading '--' style
            const prop  = `--${key.replace(/^-+/, '')}`;
            const value = settings.variables[key];

            // Persist settings.variables values
            if (settings.persist) {
                variableStore.user[prop] = value;
            }

            // Update map value with settings.variables value
            if (map[prop] !== value) {
                map[prop] = value;

                // Add new declaration to newRule
                newRule.declarations.push({
                    type    : 'declaration',
                    property: prop,
                    value   : value
                });
            }
        });

        // Append new :root ruleset
        if (settings.preserve && newRule.declarations.length) {
            cssTree.stylesheet.rules.push(newRule);
        }
    }

    // Resolve variables
    walkCss(cssTree.stylesheet, function(declarations, node) {
        let decl;
        let resolvedValue;
        let value;

        for (let i = 0; i < declarations.length; i++) {
            decl = declarations[i];
            value = decl.value;

            // skip comments
            if (decl.type !== 'declaration') {
                continue;
            }

            // skip values that don't contain variable functions
            if (!value || value.indexOf(VAR_FUNC_IDENTIFIER + '(') === -1) {
                continue;
            }

            resolvedValue = resolveValue(value, map, settings);

            if (resolvedValue !== decl.value) {
                if (!settings.preserve) {
                    decl.value = resolvedValue;
                }
                else {
                    declarations.splice(i, 0, {
                        type    : decl.type,
                        property: decl.property,
                        value   : resolvedValue
                    });

                    // skip ahead of preserved declaration
                    i++;
                }
            }
        }
    });

    // Fix nested calc() values
    if (settings.fixNestedCalc) {
        fixNestedCalc(cssTree.stylesheet.rules);
    }

    // Return CSS string
    return stringifyCss(cssTree);
}


// Functions (Private)
// =============================================================================
/**
 * Removes nested calc keywords for legacy browser compatibility.
 * Example: calc(1 + calc(2 + calc(3 + 3))) => calc(1 + (2 + (3 + 3)))
 *
 * @param {array} rules
 */
function fixNestedCalc(rules) {
    const reCalcExp = /(-[a-z]+-)?calc\(/; // Match "calc(" or "-vendor-calc("

    rules.forEach(rule => {
        if (rule.declarations) {
            rule.declarations.forEach(decl => {
                let oldValue = decl.value;
                let newValue = '';

                while (reCalcExp.test(oldValue)) {
                    const rootCalc = balanced('calc(', ')', oldValue || '');

                    oldValue = oldValue.slice(rootCalc.end);

                    while (reCalcExp.test(rootCalc.body)) {
                        const nestedCalc = balanced(reCalcExp, ')', rootCalc.body);

                        rootCalc.body = `${nestedCalc.pre}(${nestedCalc.body})${nestedCalc.post}`;
                    }

                    newValue += `${rootCalc.pre}calc(${rootCalc.body}`;
                    newValue += !reCalcExp.test(oldValue) ? `)${rootCalc.post}` : '';
                }

                decl.value = newValue || decl.value;
            });
        }
    });
}

/**
 * Resolves CSS var() function(s) with `map` data or fallback value(s). Returns
 * original `value` if unable to resolve.
 *
 * @param {string} value String containing CSS var() functions to resolve
 * @param {object} map CSS custom property key/values
 * @param {object} settings Settings object passed from transformVars()
 * @param {string} [__recursiveFallback] Fallback when unable to resolve CSS
 *                 var() function to a map or fallback value. Allows restoring
 *                 original var() function from recursive resolveValue() calls.
 * @return {string} CSS value with var() function(s) resolved to map or fallback
 *                  value.
 *
 * @example
 *
 *   resolveValue('10px var(--x) 30px', {'--x':'20px'}, {...settings});
 *   // => '10px 20px 30px'
 *
 *   resolveValue('10px', {}, {...settings});
 *   // => '10px'
 */
function resolveValue(value, map, settings = {}, __recursiveFallback) {
    if (value.indexOf('var(') === -1) {
        return value;
    }

    const valueData    = balanced('(', ')', value);
    const warningIntro = 'CSS transform warning:';

    /**
     * Resolves contents of CSS custom property function
     *
     * @param {string} value String containing contents of CSS var() function
     * @returns {string}
     *
     * @example
     *
     *   resolveFunc('--x, var(--y, green)')
     *   // => map['--x'] or map['--y'] or 'green'
     *
     *   resolveFunc('--fail')
     *   // => 'var(--fail)' when map['--fail'] does not exist
     */
    function resolveFunc(value) {
        const name               = value.split(',')[0].replace(/[\s\n\t]/g, '');
        const fallback           = (value.match(/(?:\s*,\s*){1}(.*)?/) || [])[1];
        const match              = map.hasOwnProperty(name) ? String(map[name]) : undefined;
        const replacement        = match || (fallback ? String(fallback) : undefined);
        const unresolvedFallback = __recursiveFallback || value;

        if (!match) {
            settings.onWarning(`${warningIntro} variable "${name}" is undefined`);
        }

        if (replacement && replacement !== 'undefined' && replacement.length > 0) {
            return resolveValue(replacement, map, settings, unresolvedFallback);
        }
        else {
            return `var(${unresolvedFallback})`;
        }
    }

    // No balanced brace data
    if (!valueData) {
        if (value.indexOf('var(') !== -1) {
            settings.onWarning(`${warningIntro} missing closing ")" in the value "${value}"`);
        }

        return value;
    }
    // Balanced brace data is var() function
    else if (valueData.pre.slice(-3) === 'var') {
        const isEmptyVarFunc = valueData.body.trim().length === 0;

        if (isEmptyVarFunc) {
            settings.onWarning(`${warningIntro} var() must contain a non-whitespace string`);

            return value;
        }
        else {
            return (
                valueData.pre.slice(0,-3)
                + resolveFunc(valueData.body)
                + resolveValue(valueData.post, map, settings)
            );
        }
    }
    // Balanced brace data is NOT var() function
    else {
        return (
            valueData.pre
            + `(${resolveValue(valueData.body, map, settings)})`
            + resolveValue(valueData.post, map, settings)
        );
    }
}


// Exports
// =============================================================================
export default transformVars;
export { variableStore };