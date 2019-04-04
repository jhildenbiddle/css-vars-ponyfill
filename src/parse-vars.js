// Dependencies
// =============================================================================
import parseCss from './parse-css';


// Functions
// =============================================================================
/**
 * Description
 *
 * @param {object|string} cssData CSS data to parse
 * @param {object} [options] Options object
 * @param {object} [options.store={}] CSS variable definitions to include during
 *     transformation. Can be used to add new override exisitng definitions.
 * @param {function} [options.onWarning] Callback on each transformation
 *     warning. Passes 1) warningMessage as an argument.
 * @returns {object}
 */
function parseVars(cssData, options = {}) {
    const defaults = {
        store: {},
        onWarning() {}
    };
    const settings = Object.assign({}, defaults, options);

    // Convert CSS string to AST
    if (typeof cssData === 'string') {
        cssData = parseCss(cssData, settings);
    }

    // Define variables
    cssData.stylesheet.rules.forEach(function(rule) {
        const varNameIndices = [];

        if (rule.type !== 'rule') {
            return;
        }

        // only variables declared for `:root` are supported
        if (rule.selectors.length !== 1 || rule.selectors[0] !== ':root') {
            return;
        }

        rule.declarations.forEach(function(decl, i) {
            const prop  = decl.property;
            const value = decl.value;

            if (prop && prop.indexOf('--') === 0) {
                settings.store[prop] = value;
                varNameIndices.push(i);
            }
        });
    });

    // Return variable store
    return settings.store;
}


// Exports
// =============================================================================
export default parseVars;
