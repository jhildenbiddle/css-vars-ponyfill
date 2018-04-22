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
    include      : 'style,link[rel = stylesheet]',
    exclude      : '',
    // Options
    fixNestedCalc: true,  // transformCss
    onlyLegacy   : true,  // cssVars
    onlyVars     : false, // cssVars, transformCss
    preserve     : false, // transformCss
    silent       : false, // cssVars
    updateDOM    : true,  // cssVars
    variables    : {},    // transformCss
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
 * Fetches, parses, and transforms CSS custom properties from specified
 * <style> and <link> elements into static values, then appends a new <style>
 * element with static values to the DOM to provide CSS custom property
 * compatibility for legacy browsers. Also provides a single interface for
 * live updates of runtime values in both modern and legacy browsers.
 *
 * @preserve
 * @param {object}   [options] Options object
 * @param {string}   [options.include="style,link[rel=stylesheet]"] CSS selector
 *                   matching <link re="stylesheet"> and <style> nodes to
 *                   process
 * @param {string}   [options.exclude=""] CSS selector matching <link
 *                   rel="stylehseet"> and <style> nodes to exclude from those
 *                   matches by options.include
 * @param {boolean}  [options.fixNestedCalc=true] Removes nested 'calc' keywords
 *                   for legacy browser compatibility.
 * @param {boolean}  [options.onlyLegacy=true] Determines if the ponyfill will
 *                   only generate legacy-compatible CSS in browsers that lack
 *                   native support (i.e., legacy browsers)
 * @param {boolean}  [options.onlyVars=false] Determines if CSS rulesets and
 *                   declarations without a custom property value should be
 *                   removed from the ponyfill-generated CSS
 * @param {boolean}  [options.preserve=false] Determines if the original CSS
 *                   custom property declaration will be retained in the
 *                   ponyfill-generated CSS.
 * @param {boolean}  [options.silent=false] Determines if warning and error
 *                   messages will be displayed on the console
 * @param {boolean}  [options.updateDOM=true] Determines if the ponyfill will
 *                   update the DOM after processing CSS custom properties
 * @param {object}   [options.variables={}] A map of custom property name/value
 *                   pairs. Property names can omit or include the leading
 *                   double-hyphen (—), and values specified will override
 *                   previous values.
 * @param {function} [options.onSuccess] Callback after all CSS has been
 *                   processed and legacy-compatible CSS has been generated, but
 *                   before the legacy CSS has been appended to the DOM. Allows
 *                   modifying the CSS data by returning any string value (or
 *                   false to skip) before options.onComplete is triggered.
 *                   Passes 1) a CSS string with CSS variable values resolved as
 *                   an argument.
 * @param {function} [options.onError] Callback after a CSS parsing error has
 *                   occurred or an XHR request has failed. Passes 1) an error
 *                   message, and 2) source node reference, 3) xhr, and 4 url as
 *                   arguments.
 * @param {function} [options.onWarning] Callback after each CSS parsing warning
 *                   has occurred. Passes 1) a warning message as an argument.
 * @param {function} [options.onComplete] Callback after all CSS has been
 *                   processed, legacy-compatible CSS has been generated, and
 *                   (optionally) the DOM has been updated. Passes 1) a CSS
 *                   string with CSS variable values resolved, and 2) a
 *                   reference to the appended <style> node.
 *
 * @example
 *
 *   cssVars({
 *     include      : 'style,link[rel="stylesheet"]', // default
 *     exclude      : '',
 *     fixNestedCalc: true,  // default
 *     onlyLegacy   : true,  // default
 *     onlyVars     : false, // default
 *     preserve     : false, // default
 *     silent       : false, // default
 *     updateDOM    : true,  // default
 *     variables    : {
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
                            fixNestedCalc: settings.fixNestedCalc,
                            onlyVars     : settings.onlyVars,
                            persist      : settings.updateDOM,
                            preserve     : settings.preserve,
                            variables    : settings.variables,
                            onWarning    : handleWarning
                        });

                        // Success if an error was not been throw during
                        // transformation. Store the onSuccess return value,
                        // which allows modifying cssText before passing to
                        // onComplete and/or appending to new <style> node.
                        const returnVal = settings.onSuccess(cssText);

                        // Set cssText to return value (if provided)
                        cssText = returnVal === false ? '' : returnVal || cssText;

                        if (settings.updateDOM && nodeArray && nodeArray.length) {
                            const lastNode = nodeArray[nodeArray.length - 1];

                            styleNode = document.querySelector(`#${styleNodeId}`) || document.createElement('style');
                            styleNode.setAttribute('id', styleNodeId);

                            if (styleNode.textContent !== cssText) {
                                styleNode.textContent = cssText;
                            }

                            // Insert <style> element after last nodeArray item
                            if (lastNode.nextSibling !== styleNode) {
                                lastNode.parentNode.insertBefore(styleNode, lastNode.nextSibling);
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
                // Convert all property names to leading '--' style
                const prop  = `--${key.replace(/^-+/, '')}`;
                const value = settings.variables[key];

                document.documentElement.style.setProperty(prop, value);
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


// Export
// =============================================================================
export default cssVars;
