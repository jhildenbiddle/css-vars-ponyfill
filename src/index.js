// Dependencies
// =============================================================================
import getCssData          from 'get-css-data';
import mergeDeep           from './merge-deep';
import transformCss        from './transform-css';
import { name as pkgName } from '../package.json';


// Constants & Variables
// =============================================================================
const defaults = {
    // Sources
    include   : 'style,link[rel=stylesheet]',
    exclude   : '',
    // Options
    onlyLegacy: true,  // cssVars
    onlyVars  : true,  // cssVars, transformCss
    preserve  : true,  // transformCss
    silent    : false, // cssVars
    updateDOM : true,  // cssVars
    variables : {},    // transformCss
    // Callbacks
    onSuccess() {},     // cssVars
    onError() {},       // cssVars
    onWarning() {},     // transformCss
    onComplete() {}     // cssVars
};
// Regex: CSS variable :root declarations and var() function values
const reCssVars = /(?:(?::root\s*{\s*[^;]*;*\s*)|(?:var\(\s*))(--[^:)]+)(?:\s*[:)])/;


// Functions
// =============================================================================
/**
 * Description
 *
 * @preserve
 * @param {object}   [options] Options object
 * @param {string}   [options.include="style,link[rel=stylesheet]"] CSS selector
 *                   matching <link> and <style> nodes to include
 * @param {string}   [options.exclude=""] CSS selector matching <link> and
 *                   <style> nodes to exclude
 * @param {boolean}  [options.onlyLegacy=true] Only process CSS variables in
 *                   browsers that lack native support
 * @param {boolean}  [options.onlyVars=true] Remove declarations that do not
 *                   contain a CSS variable from the return value. Note that
 *                   font-face and keyframe rules require all declarations to be
 *                   returned if a CSS variable is used.
 * @param {boolean}  [options.preserve=true] Preserve CSS variable definitions
 *                   and functions in the return value, allowing "live" variable
 *                   updates via JavaScript to continue working in browsers with
 *                   native CSS variable support.
 * @param {boolean}  [options.silent=false] Prevent console warnign and error
 *                   messages
 * @param {boolean}  [options.updateDOM=true] Append <style> node containing
 *                   updated CSS to DOM
 * @param {object}   [options.variables={}] CSS variable definitions to include
 *                   during transformation. Can be used to add new override
 *                   exisitng definitions.
 * @param {function} [options.onSuccess] Callback after all stylesheets have
 *                   been processed succesfully. Passes 1) a CSS string with CSS
 *                   variable values resolved as an argument. Modifying the CSS
 *                   appended when 'updateDOM' is 'true' can be done by
 *                   returning a string value from this funtion (or 'false' to
 *                   skip).
 * @param {function} [options.onError] Callback on each error. Passes 1) an
 *                   error message, and 2) source node reference as arguments.
 * @param {function} [options.onWarning] Callback on each warning. Passes 1) a
 *                   warning message as an argument.
 * @param {function} [options.onComplete] Callback after all stylesheets have
 *                   been processed succesfully and <style> node containing
 *                   updated CSS has been appended to the DOM (based on
 *                   'updateDOM' setting. Passes 1) a CSS string with CSS
 *                   variable values resolved, and 2) a reference to the
 *                   appended <style> node.
 *
 * @example
 *
 *   cssVars({
 *     include   : 'style,link[rel="stylesheet"]', // default
 *     exclude   : '',
 *     onlyLegacy: true, // default
 *     onlyVars  : true, // default
 *     preserve  : true, // default
 *     silent    : false, // default
 *     updateDOM : true, // default
 *     variables : {
 *       // ...
 *     },
 *     onError(message, node) {
 *       // ...
 *     },
 *     onWarning(message) {
 *       // ...
 *     },
 *     onSuccess(cssText) {
 *       // ...
 *     },
 *     onComplete(cssText, styleNode) {
 *       // ...
 *     }
 *   });
 */
function cssVars(options = {}) {
    const settings = mergeDeep(defaults, options);

    function handleError(message, sourceNode, xhr, url) {
        /* istanbul ignore next */
        if (!settings.silent) {
            // eslint-disable-next-line
            console.error(`${message}\n`, sourceNode);
        }

        settings.onError(message, sourceNode, xhr, url);
    }

    function handleWarning(message) {
        /* istanbul ignore next */
        if (!settings.silent) {
            // eslint-disable-next-line
            console.warn(message);
        }

        settings.onWarning(message);
    }

    // Verify readyState to ensure all <link> and <style> nodes are available
    if (document.readyState !== 'loading') {
        const hasNativeSupport = window.CSS && window.CSS.supports && window.CSS.supports('(--a: 0)');

        // Lacks native support or onlyLegacy 'false'
        if (!hasNativeSupport || !settings.onlyLegacy) {
            const styleNodeId = pkgName;

            getCssData({
                include: settings.include,
                // Always exclude styleNodeId element, which is the generated
                // <style> node containing previously transformed CSS.
                exclude: `#${styleNodeId}` + (settings.exclude ? `,${settings.exclude}` : ''),
                // This filter does a test on each block of CSS. An additional
                // filter is used in the parser to remove individual
                // declarations.
                filter : settings.onlyVars ? reCssVars : null,
                onComplete(cssText, cssArray, nodeArray) {
                    let styleNode = null;

                    try {
                        cssText = transformCss(cssText, {
                            onlyVars : settings.onlyVars,
                            preserve : settings.preserve,
                            variables: settings.variables,
                            onWarning: handleWarning
                        });

                        // Success if an error was not been throw during
                        // transformation. Store the onSuccess return value,
                        // which allows modifying cssText before passing to
                        // onComplete and/or appending to new <style> node.
                        const returnVal = settings.onSuccess(cssText);

                        // Set cssText to return value (if provided)
                        cssText = returnVal === false ? '' : returnVal || cssText;

                        if (settings.updateDOM) {
                            styleNode = document.querySelector(`#${styleNodeId}`) || document.createElement('style');
                            styleNode.setAttribute('id', styleNodeId);

                            if (styleNode.textContent !== cssText) {
                                styleNode.textContent = cssText;
                            }

                            // Append <style> element to either the <head> or
                            // <body> based on the position of last stylesheet
                            // node.
                            const styleTargetNode = document.querySelector(`body link[rel=stylesheet], body style:not(#${styleNodeId})`) ? document.body : document.head;
                            const isNewTarget     = styleNode.parentNode !== styleTargetNode;
                            const isLastStyleElm  = matchesSelector(styleNode, 'style:last-of-type');

                            if (isNewTarget || !isLastStyleElm) {
                                styleTargetNode.appendChild(styleNode);
                            }
                        }
                    }
                    catch(err) {
                        let errorThrown = false;

                        // Iterate cssArray to detect CSS text and node(s)
                        // responsibile for error.
                        cssArray.forEach((cssText, i) => {
                            try {
                                cssText = transformCss(cssText, settings);
                            }
                            catch(err) {
                                const errorNode = nodeArray[i - 0];

                                errorThrown = true;
                                handleError(err.message, errorNode);
                            }
                        });

                        // In the event the error thrown was not due to
                        // transformCss, handle the original error.
                        /* istanbul ignore next */
                        if (!errorThrown) {
                            handleError(err.message || err);
                        }
                    }

                    settings.onComplete(cssText, styleNode);
                },
                onError(xhr, node, url) {
                    const errorMsg = `CSS XHR error: "${xhr.responseURL}" ${xhr.status}` + (xhr.statusText ? ` (${xhr.statusText})` : '');

                    handleError(errorMsg, node, xhr, url);
                }
            });
        }
        // Has native support
        else if (hasNativeSupport && settings.updateDOM) {
            // Set variables using native methods
            Object.keys(settings.variables).forEach(key => {
                // Normalize variables by ensuring all start with leading '--'
                const varName  = `--${key.replace(/^-+/, '')}`;
                const varValue = settings.variables[key];

                document.documentElement.style.setProperty(varName, varValue);
            });
        }
    }
    // Delay function until DOMContentLoaded event is fired
    /* istanbul ignore next */
    else {
        document.addEventListener('DOMContentLoaded', function init(evt) {
            cssVars(options);

            document.removeEventListener('DOMContentLoaded', init);
        });
    }
}


// Functions (Private)
// =============================================================================
/**
 * Ponyfill for native Element.matches method
 *
 * @param   {object} elm - The element to test
 * @param   {string} selector - The CSS selector to test against
 * @returns {boolean}
 */
function matchesSelector(elm, selector) {
    /* istanbul ignore next */
    const matches = elm.matches || elm.matchesSelector || elm.webkitMatchesSelector || elm.mozMatchesSelector || elm.msMatchesSelector || elm.oMatchesSelector;

    return matches.call(elm, selector);
}


// Export
// =============================================================================
export default cssVars;
