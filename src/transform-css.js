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


// Functions
// =============================================================================
/**
 * Transforms W3C-style CSS variables to static values and returns an updated
 * CSS string.
 *
 * @param {object}   cssData CSS text or AST
 * @param {object}   [options] Options object
 * @param {boolean}  [options.preserveStatic=true] Determines if CSS
 *                   declarations that do not reference a custom property will
 *                   be preserved in the transformed CSS
 * @param {boolean}  [options.preserveVars=false] Determines if CSS custom
 *                   property declarations will be preserved in the transformed
 *                   CSS
 * @param {object}   [options.variables={}] CSS variable definitions to include
 *                   during transformation. Can be used to add new override
 *                   exisitng definitions.
 * @param {function} [options.onWarning] Callback on each transformation
 *                   warning. Passes 1) warningMessage as an argument.
 * @returns {string}
 */
function transformCss(cssData, options = {}) {
    const defaults = {
        preserveStatic: true,
        preserveVars  : false,
        variables     : {},
        onWarning() {}
    };
    const settings = Object.assign({}, defaults, options);

    // Convert CSS string to AST
    if (typeof cssData === 'string') {
        cssData = parseCss(cssData, settings);
    }

    // Resolve variables
    walkCss(cssData.stylesheet, function(declarations, node) {
        for (let i = 0; i < declarations.length; i++) {
            const decl  = declarations[i];
            const type  = decl.type;
            const prop  = decl.property;
            const value = decl.value;

            // Skip comments
            if (type !== 'declaration') {
                continue;
            }

            // Remove custom property declarations
            if (!settings.preserveVars && prop && prop.indexOf(VAR_PROP_IDENTIFIER) === 0) {
                declarations.splice(i, 1);
                i--;
                continue;
            }

            // Transform custom property functions
            if (value.indexOf(VAR_FUNC_IDENTIFIER + '(') !== -1) {
                let resolvedValue = resolveValue(value, settings);

                if (resolvedValue !== decl.value) {
                    // Fix nested calc
                    resolvedValue = fixNestedCalc(resolvedValue);

                    // Overwrite value
                    if (!settings.preserveVars) {
                        decl.value = resolvedValue;
                    }
                    // Insert new rule with resolved value
                    else {
                        declarations.splice(i, 0, {
                            type    : type,
                            property: prop,
                            value   : resolvedValue
                        });

                        // Skip ahead of preserved declaration
                        i++;
                    }
                }
            }
        }
    });

    // Return CSS string
    return stringifyCss(cssData);
}


// Functions (Private)
// =============================================================================
/**
 * Removes nested calc keywords for legacy browser compatibility.
 * Example: calc(1 + calc(2 + calc(3 + 3))) => calc(1 + (2 + (3 + 3)))
 *
 * @param {value} string
 */
function fixNestedCalc(value) {
    const reCalcVal = /calc\(([^)]+)\)/g;

    (value.match(reCalcVal) || []).forEach(match => {
        const newVal = `calc${match.split('calc').join('')}`;
        value = value.replace(match, newVal);
    });

    return value;
}

/**
 * Resolves CSS var() function(s) with `settings.variables` or fallback
 * value(s). Returns original `value` if unable to resolve.
 *
 * @param {string} value String containing CSS var() functions to resolve
 * @param {object} settings Settings object passed from transformCss()
 * @param {string} [__recursiveFallback] Fallback when unable to resolve CSS
 *                 var() function to a `settings.variables` or fallback value.
 *                 Allows restoring original var() function from recursive
 *                 resolveValue() calls.
 * @return {string} CSS value with var() function(s) resolved to
 *                  `settings.variables` or fallback value.
 *
 * @example
 *
 *   resolveValue('10px var(--x) 30px', {'--x':'20px'}, {...settings});
 *   // => '10px 20px 30px'
 *
 *   resolveValue('10px', {}, {...settings});
 *   // => '10px'
 */
function resolveValue(value, settings = {}, __recursiveFallback) {
    if (value.indexOf('var(') === -1) {
        return value;
    }

    const valueData = balanced('(', ')', value);

    /**
     * Resolves contents of CSS custom property function
     *
     * @param {string} value String containing contents of CSS var() function
     * @returns {string}
     *
     * @example
     *
     *   resolveFunc('--x, var(--y, green)')
     *   // => obj['--x'] or obj['--y'] or 'green'
     *
     *   resolveFunc('--fail')
     *   // => 'var(--fail)' when obj['--fail'] does not exist
     */
    function resolveFunc(value) {
        const name               = value.split(',')[0].replace(/[\s\n\t]/g, '');
        const fallback           = (value.match(/(?:\s*,\s*){1}(.*)?/) || [])[1];
        const match              = Object.prototype.hasOwnProperty.call(settings.variables, name) ? String(settings.variables[name]) : undefined;
        const replacement        = match || (fallback ? String(fallback) : undefined);
        const unresolvedFallback = __recursiveFallback || value;

        if (!match) {
            settings.onWarning(`variable "${name}" is undefined`);
        }

        if (replacement && replacement !== 'undefined' && replacement.length > 0) {
            return resolveValue(replacement, settings, unresolvedFallback);
        }
        else {
            return `var(${unresolvedFallback})`;
        }
    }

    // No balanced brace data
    if (!valueData) {
        if (value.indexOf('var(') !== -1) {
            settings.onWarning(`missing closing ")" in the value "${value}"`);
        }

        return value;
    }
    // Balanced brace data is var() function
    else if (valueData.pre.slice(-3) === 'var') {
        const isEmptyVarFunc = valueData.body.trim().length === 0;

        if (isEmptyVarFunc) {
            settings.onWarning('var() must contain a non-whitespace string');

            return value;
        }
        else {
            return (
                valueData.pre.slice(0,-3)
                + resolveFunc(valueData.body)
                + resolveValue(valueData.post, settings)
            );
        }
    }
    // Balanced brace data is NOT var() function
    else {
        return (
            valueData.pre
            + `(${resolveValue(valueData.body, settings)})`
            + resolveValue(valueData.post, settings)
        );
    }
}


// Exports
// =============================================================================
export default transformCss;
