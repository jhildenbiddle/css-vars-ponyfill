/*!
 * css-vars-ponyfill
 * v1.11.1
 * https://github.com/jhildenbiddle/css-vars-ponyfill
 * (c) 2018 John Hildenbiddle <http://hildenbiddle.com>
 * MIT license
 */
/*!
 * get-css-data
 * v1.4.0
 * https://github.com/jhildenbiddle/get-css-data
 * (c) 2018 John Hildenbiddle <http://hildenbiddle.com>
 * MIT license
 */
function getUrls(urls) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var settings = {
        mimeType: options.mimeType || null,
        onBeforeSend: options.onBeforeSend || Function.prototype,
        onSuccess: options.onSuccess || Function.prototype,
        onError: options.onError || Function.prototype,
        onComplete: options.onComplete || Function.prototype
    };
    var urlArray = Array.isArray(urls) ? urls : [ urls ];
    var urlQueue = Array.apply(null, Array(urlArray.length)).map(function(x) {
        return null;
    });
    function onError(xhr, urlIndex) {
        settings.onError(xhr, urlArray[urlIndex], urlIndex);
    }
    function onSuccess(responseText, urlIndex) {
        var returnVal = settings.onSuccess(responseText, urlArray[urlIndex], urlIndex);
        responseText = returnVal === false ? "" : returnVal || responseText;
        urlQueue[urlIndex] = responseText;
        if (urlQueue.indexOf(null) === -1) {
            settings.onComplete(urlQueue);
        }
    }
    urlArray.forEach(function(url, i) {
        var parser = document.createElement("a");
        parser.setAttribute("href", url);
        parser.href = String(parser.href);
        var isCrossDomain = parser.host !== location.host;
        var isSameProtocol = parser.protocol === location.protocol;
        if (isCrossDomain && typeof XDomainRequest !== "undefined") {
            if (isSameProtocol) {
                var xdr = new XDomainRequest();
                xdr.open("GET", url);
                xdr.timeout = 0;
                xdr.onprogress = Function.prototype;
                xdr.ontimeout = Function.prototype;
                xdr.onload = function() {
                    onSuccess(xdr.responseText, i);
                };
                xdr.onerror = function(err) {
                    onError(xdr, i);
                };
                setTimeout(function() {
                    xdr.send();
                }, 0);
            } else {
                console.log("Internet Explorer 9 Cross-Origin (CORS) requests must use the same protocol");
                onError(null, i);
            }
        } else {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            if (settings.mimeType && xhr.overrideMimeType) {
                xhr.overrideMimeType(settings.mimeType);
            }
            settings.onBeforeSend(xhr, url, i);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        onSuccess(xhr.responseText, i);
                    } else {
                        onError(xhr, i);
                    }
                }
            };
            xhr.send();
        }
    });
}

/**
 * Gets CSS data from <style> and <link> nodes (including @imports), then
 * returns data in order processed by DOM. Allows specifying nodes to
 * include/exclude and filtering CSS data using RegEx.
 *
 * @preserve
 * @param {object}   [options] The options object
 * @param {object}   [options.rootElement=document] Root element to traverse for
 *                   <link> and <style> nodes.
 * @param {string}   [options.include] CSS selector matching <link> and <style>
 *                   nodes to include
 * @param {string}   [options.exclude] CSS selector matching <link> and <style>
 *                   nodes to exclude
 * @param {object}   [options.filter] Regular expression used to filter node CSS
 *                   data. Each block of CSS data is tested against the filter,
 *                   and only matching data is included.
 * @param {object}   [options.useCSSOM=false] Determines if CSS data will be
 *                   collected from a stylesheet's runtime values instead of its
 *                   text content. This is required to get accurate CSS data
 *                   when a stylesheet has been modified using the deleteRule()
 *                   or insertRule() methods because these modifications will
 *                   not be reflected in the stylesheet's text content.
 * @param {function} [options.onBeforeSend] Callback before XHR is sent. Passes
 *                   1) the XHR object, 2) source node reference, and 3) the
 *                   source URL as arguments.
 * @param {function} [options.onSuccess] Callback on each CSS node read. Passes
 *                   1) CSS text, 2) source node reference, and 3) the source
 *                   URL as arguments.
 * @param {function} [options.onError] Callback on each error. Passes 1) the XHR
 *                   object for inspection, 2) soure node reference, and 3) the
 *                   source URL that failed (either a <link> href or an @import)
 *                   as arguments
 * @param {function} [options.onComplete] Callback after all nodes have been
 *                   processed. Passes 1) concatenated CSS text, 2) an array of
 *                   CSS text in DOM order, and 3) an array of nodes in DOM
 *                   order as arguments.
 *
 * @example
 *
 *   getCssData({
 *     rootElement: document,
 *     include    : 'style,link[rel="stylesheet"]',
 *     exclude    : '[href="skip.css"]',
 *     filter     : /red/,
 *     useCSSOM   : false,
 *     onBeforeSend(xhr, node, url) {
 *       // ...
 *     }
 *     onSuccess(cssText, node, url) {
 *       // ...
 *     }
 *     onError(xhr, node, url) {
 *       // ...
 *     },
 *     onComplete(cssText, cssArray, nodeArray) {
 *       // ...
 *     }
 *   });
 */ function getCssData(options) {
    var regex = {
        cssComments: /\/\*[\s\S]+?\*\//g,
        cssImports: /(?:@import\s*)(?:url\(\s*)?(?:['"])([^'"]*)(?:['"])(?:\s*\))?(?:[^;]*;)/g
    };
    var settings = {
        rootElement: options.rootElement || document,
        include: options.include || 'style,link[rel="stylesheet"]',
        exclude: options.exclude || null,
        filter: options.filter || null,
        useCSSOM: options.useCSSOM || false,
        onBeforeSend: options.onBeforeSend || Function.prototype,
        onSuccess: options.onSuccess || Function.prototype,
        onError: options.onError || Function.prototype,
        onComplete: options.onComplete || Function.prototype
    };
    var sourceNodes = Array.apply(null, settings.rootElement.querySelectorAll(settings.include)).filter(function(node) {
        return !matchesSelector(node, settings.exclude);
    });
    var cssArray = Array.apply(null, Array(sourceNodes.length)).map(function(x) {
        return null;
    });
    function handleComplete() {
        var isComplete = cssArray.indexOf(null) === -1;
        if (isComplete) {
            var cssText = cssArray.join("");
            settings.onComplete(cssText, cssArray, sourceNodes);
        }
    }
    function handleSuccess(cssText, cssIndex, node, sourceUrl) {
        var returnVal = settings.onSuccess(cssText, node, sourceUrl);
        cssText = returnVal === false ? "" : returnVal || cssText;
        resolveImports(cssText, node, sourceUrl, function(resolvedCssText, errorData) {
            if (cssArray[cssIndex] === null) {
                errorData.forEach(function(data) {
                    return settings.onError(data.xhr, node, data.url);
                });
                if (!settings.filter || settings.filter.test(resolvedCssText)) {
                    cssArray[cssIndex] = resolvedCssText;
                } else {
                    cssArray[cssIndex] = "";
                }
                handleComplete();
            }
        });
    }
    function parseImportData(cssText, baseUrl) {
        var ignoreRules = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var importData = {};
        importData.rules = (cssText.replace(regex.cssComments, "").match(regex.cssImports) || []).filter(function(rule) {
            return ignoreRules.indexOf(rule) === -1;
        });
        importData.urls = importData.rules.map(function(rule) {
            return rule.replace(regex.cssImports, "$1");
        });
        importData.absoluteUrls = importData.urls.map(function(url) {
            return getFullUrl(url, baseUrl);
        });
        importData.absoluteRules = importData.rules.map(function(rule, i) {
            var oldUrl = importData.urls[i];
            var newUrl = getFullUrl(importData.absoluteUrls[i], baseUrl);
            return rule.replace(oldUrl, newUrl);
        });
        return importData;
    }
    function resolveImports(cssText, node, baseUrl, callbackFn) {
        var __errorData = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
        var __errorRules = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];
        var importData = parseImportData(cssText, baseUrl, __errorRules);
        if (importData.rules.length) {
            getUrls(importData.absoluteUrls, {
                onBeforeSend: function onBeforeSend(xhr, url, urlIndex) {
                    settings.onBeforeSend(xhr, node, url);
                },
                onSuccess: function onSuccess(cssText, url, urlIndex) {
                    var returnVal = settings.onSuccess(cssText, node, url);
                    cssText = returnVal === false ? "" : returnVal || cssText;
                    var responseImportData = parseImportData(cssText, url, __errorRules);
                    responseImportData.rules.forEach(function(rule, i) {
                        cssText = cssText.replace(rule, responseImportData.absoluteRules[i]);
                    });
                    return cssText;
                },
                onError: function onError(xhr, url, urlIndex) {
                    __errorData.push({
                        xhr: xhr,
                        url: url
                    });
                    __errorRules.push(importData.rules[urlIndex]);
                    resolveImports(cssText, node, baseUrl, callbackFn, __errorData, __errorRules);
                },
                onComplete: function onComplete(responseArray) {
                    responseArray.forEach(function(importText, i) {
                        cssText = cssText.replace(importData.rules[i], importText);
                    });
                    resolveImports(cssText, node, baseUrl, callbackFn, __errorData, __errorRules);
                }
            });
        } else {
            callbackFn(cssText, __errorData);
        }
    }
    if (sourceNodes.length) {
        sourceNodes.forEach(function(node, i) {
            var linkHref = node.getAttribute("href");
            var linkRel = node.getAttribute("rel");
            var isLink = node.nodeName === "LINK" && linkHref && linkRel && linkRel.toLowerCase() === "stylesheet";
            var isStyle = node.nodeName === "STYLE";
            if (isLink) {
                getUrls(linkHref, {
                    mimeType: "text/css",
                    onBeforeSend: function onBeforeSend(xhr, url, urlIndex) {
                        settings.onBeforeSend(xhr, node, url);
                    },
                    onSuccess: function onSuccess(cssText, url, urlIndex) {
                        var sourceUrl = getFullUrl(linkHref, location.href);
                        handleSuccess(cssText, i, node, sourceUrl);
                    },
                    onError: function onError(xhr, url, urlIndex) {
                        cssArray[i] = "";
                        settings.onError(xhr, node, url);
                        handleComplete();
                    }
                });
            } else if (isStyle) {
                var cssText = node.textContent;
                if (settings.useCSSOM) {
                    cssText = Array.apply(null, node.sheet.cssRules).map(function(rule) {
                        return rule.cssText;
                    }).join("");
                }
                handleSuccess(cssText, i, node, location.href);
            } else {
                cssArray[i] = "";
                handleComplete();
            }
        });
    } else {
        settings.onComplete("", []);
    }
}

function getFullUrl(url) {
    var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : location.href;
    var d = document.implementation.createHTMLDocument("");
    var b = d.createElement("base");
    var a = d.createElement("a");
    d.head.appendChild(b);
    d.body.appendChild(a);
    b.href = base;
    a.href = url;
    return a.href;
}

function matchesSelector(elm, selector) {
    var matches = elm.matches || elm.matchesSelector || elm.webkitMatchesSelector || elm.mozMatchesSelector || elm.msMatchesSelector || elm.oMatchesSelector;
    return matches.call(elm, selector);
}

function mergeDeep() {
    var isObject = function isObject(obj) {
        return obj instanceof Object && obj.constructor === Object;
    };
    for (var _len = arguments.length, objects = Array(_len), _key = 0; _key < _len; _key++) {
        objects[_key] = arguments[_key];
    }
    return objects.reduce(function(prev, obj) {
        Object.keys(obj).forEach(function(key) {
            var pVal = prev[key];
            var oVal = obj[key];
            if (isObject(pVal) && isObject(oVal)) {
                prev[key] = mergeDeep(pVal, oVal);
            } else {
                prev[key] = oVal;
            }
        });
        return prev;
    }, {});
}

var balancedMatch = balanced;

function balanced(a, b, str) {
    if (a instanceof RegExp) a = maybeMatch(a, str);
    if (b instanceof RegExp) b = maybeMatch(b, str);
    var r = range(a, b, str);
    return r && {
        start: r[0],
        end: r[1],
        pre: str.slice(0, r[0]),
        body: str.slice(r[0] + a.length, r[1]),
        post: str.slice(r[1] + b.length)
    };
}

function maybeMatch(reg, str) {
    var m = str.match(reg);
    return m ? m[0] : null;
}

balanced.range = range;

function range(a, b, str) {
    var begs, beg, left, right, result;
    var ai = str.indexOf(a);
    var bi = str.indexOf(b, ai + 1);
    var i = ai;
    if (ai >= 0 && bi > 0) {
        begs = [];
        left = str.length;
        while (i >= 0 && !result) {
            if (i == ai) {
                begs.push(i);
                ai = str.indexOf(a, i + 1);
            } else if (begs.length == 1) {
                result = [ begs.pop(), bi ];
            } else {
                beg = begs.pop();
                if (beg < left) {
                    left = beg;
                    right = bi;
                }
                bi = str.indexOf(b, i + 1);
            }
            i = ai < bi && ai >= 0 ? ai : bi;
        }
        if (begs.length) {
            result = [ left, right ];
        }
    }
    return result;
}

function cssParse(css) {
    var errors = [];
    function error(msg) {
        throw new Error("CSS parse error: " + msg);
    }
    function match(re) {
        var m = re.exec(css);
        if (m) {
            css = css.slice(m[0].length);
            return m;
        }
    }
    function whitespace() {
        match(/^\s*/);
    }
    function open() {
        return match(/^{\s*/);
    }
    function close() {
        return match(/^}/);
    }
    function comment() {
        whitespace();
        if (css[0] !== "/" || css[1] !== "*") {
            return;
        }
        var i = 2;
        while (css[i] && (css[i] !== "*" || css[i + 1] !== "/")) {
            i++;
        }
        if (!css[i]) {
            return error("end of comment is missing");
        }
        var str = css.slice(2, i);
        css = css.slice(i + 2);
        return {
            type: "comment",
            comment: str
        };
    }
    function comments() {
        var cmnts = [];
        var c = void 0;
        while (c = comment()) {
            cmnts.push(c);
        }
        return cmnts;
    }
    function selector() {
        whitespace();
        while (css[0] === "}") {
            error("extra closing bracket");
        }
        var m = match(/^(("(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^{])+)/);
        if (m) {
            return m[0].trim().replace(/\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*\/+/g, "").replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function(m) {
                return m.replace(/,/g, "‌");
            }).split(/\s*(?![^(]*\)),\s*/).map(function(s) {
                return s.replace(/\u200C/g, ",");
            });
        }
    }
    function declaration() {
        match(/^([;\s]*)+/);
        var comment_regexp = /\/\*[^*]*\*+([^\/*][^*]*\*+)*\//g;
        var prop = match(/^(\*?[-#\/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
        if (!prop) {
            return;
        }
        prop = prop[0].trim();
        if (!match(/^:\s*/)) {
            return error("property missing ':'");
        }
        var val = match(/^((?:\/\*.*?\*\/|'(?:\\'|.)*?'|"(?:\\"|.)*?"|\((\s*'(?:\\'|.)*?'|"(?:\\"|.)*?"|[^)]*?)\s*\)|[^};])+)/);
        var ret = {
            type: "declaration",
            property: prop.replace(comment_regexp, ""),
            value: val ? val[0].replace(comment_regexp, "").trim() : ""
        };
        match(/^[;\s]*/);
        return ret;
    }
    function declarations() {
        if (!open()) {
            return error("missing '{'");
        }
        var d = void 0, decls = comments();
        while (d = declaration()) {
            decls.push(d);
            decls = decls.concat(comments());
        }
        if (!close()) {
            return error("missing '}'");
        }
        return decls;
    }
    function keyframe() {
        whitespace();
        var vals = [];
        var m = void 0;
        while (m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/)) {
            vals.push(m[1]);
            match(/^,\s*/);
        }
        if (vals.length) {
            return {
                type: "keyframe",
                values: vals,
                declarations: declarations()
            };
        }
    }
    function at_keyframes() {
        var m = match(/^@([-\w]+)?keyframes\s*/);
        if (!m) {
            return;
        }
        var vendor = m[1];
        m = match(/^([-\w]+)\s*/);
        if (!m) {
            return error("@keyframes missing name");
        }
        var name = m[1];
        if (!open()) {
            return error("@keyframes missing '{'");
        }
        var frame = void 0, frames = comments();
        while (frame = keyframe()) {
            frames.push(frame);
            frames = frames.concat(comments());
        }
        if (!close()) {
            return error("@keyframes missing '}'");
        }
        return {
            type: "keyframes",
            name: name,
            vendor: vendor,
            keyframes: frames
        };
    }
    function at_page() {
        var m = match(/^@page */);
        if (m) {
            var sel = selector() || [];
            return {
                type: "page",
                selectors: sel,
                declarations: declarations()
            };
        }
    }
    function at_fontface() {
        var m = match(/^@font-face\s*/);
        if (m) {
            return {
                type: "font-face",
                declarations: declarations()
            };
        }
    }
    function at_supports() {
        var m = match(/^@supports *([^{]+)/);
        if (m) {
            return {
                type: "supports",
                supports: m[1].trim(),
                rules: rules()
            };
        }
    }
    function at_host() {
        var m = match(/^@host\s*/);
        if (m) {
            return {
                type: "host",
                rules: rules()
            };
        }
    }
    function at_media() {
        var m = match(/^@media *([^{]+)/);
        if (m) {
            return {
                type: "media",
                media: m[1].trim(),
                rules: rules()
            };
        }
    }
    function at_custom_m() {
        var m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
        if (m) {
            return {
                type: "custom-media",
                name: m[1].trim(),
                media: m[2].trim()
            };
        }
    }
    function at_document() {
        var m = match(/^@([-\w]+)?document *([^{]+)/);
        if (m) {
            return {
                type: "document",
                document: m[2].trim(),
                vendor: m[1] ? m[1].trim() : null,
                rules: rules()
            };
        }
    }
    function at_x() {
        var m = match(/^@(import|charset|namespace)\s*([^;]+);/);
        if (m) {
            return {
                type: m[1],
                name: m[2].trim()
            };
        }
    }
    function at_rule() {
        whitespace();
        if (css[0] === "@") {
            return at_keyframes() || at_supports() || at_host() || at_media() || at_custom_m() || at_page() || at_document() || at_fontface() || at_x();
        }
    }
    function rule() {
        var sel = selector() || [];
        if (!sel.length) {
            error("selector missing");
        }
        var decls = declarations();
        return {
            type: "rule",
            selectors: sel,
            declarations: decls
        };
    }
    function rules(core) {
        if (!core && !open()) {
            return error("missing '{'");
        }
        var node = void 0, rules = comments();
        while (css.length && (core || css[0] !== "}") && (node = at_rule() || rule())) {
            rules.push(node);
            rules = rules.concat(comments());
        }
        if (!core && !close()) {
            return error("missing '}'");
        }
        return rules;
    }
    return {
        type: "stylesheet",
        stylesheet: {
            rules: rules(true),
            errors: errors
        }
    };
}

function stringifyCss(tree) {
    var delim = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    var cb = arguments[2];
    var renderMethods = {
        charset: function charset(node) {
            return "@charset " + node.name + ";";
        },
        comment: function comment(node) {
            return node.comment.indexOf("__CSSVARSPONYFILL") === 0 ? "/*" + node.comment + "*/" : "";
        },
        "custom-media": function customMedia(node) {
            return "@custom-media " + node.name + " " + node.media + ";";
        },
        declaration: function declaration(node) {
            return node.property + ":" + node.value + ";";
        },
        document: function document(node) {
            return "@" + (node.vendor || "") + "document " + node.document + "{" + visit(node.rules) + "}";
        },
        "font-face": function fontFace(node) {
            return "@font-face" + "{" + visit(node.declarations) + "}";
        },
        host: function host(node) {
            return "@host" + "{" + visit(node.rules) + "}";
        },
        import: function _import(node) {
            return "@import " + node.name + ";";
        },
        keyframe: function keyframe(node) {
            return node.values.join(",") + "{" + visit(node.declarations) + "}";
        },
        keyframes: function keyframes(node) {
            return "@" + (node.vendor || "") + "keyframes " + node.name + "{" + visit(node.keyframes) + "}";
        },
        media: function media(node) {
            return "@media " + node.media + "{" + visit(node.rules) + "}";
        },
        namespace: function namespace(node) {
            return "@namespace " + node.name + ";";
        },
        page: function page(node) {
            return "@page " + (node.selectors.length ? node.selectors.join(", ") : "") + "{" + visit(node.declarations) + "}";
        },
        rule: function rule(node) {
            var decls = node.declarations;
            if (decls.length) {
                return node.selectors.join(",") + "{" + visit(decls) + "}";
            }
        },
        supports: function supports(node) {
            return "@supports " + node.supports + "{" + visit(node.rules) + "}";
        }
    };
    function visit(nodes) {
        var buf = "";
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            if (cb) {
                cb(n);
            }
            var txt = renderMethods[n.type](n);
            if (txt) {
                buf += txt;
                if (txt.length && n.selectors) {
                    buf += delim;
                }
            }
        }
        return buf;
    }
    return visit(tree.stylesheet.rules);
}

function walkCss(node, fn) {
    node.rules.forEach(function(rule) {
        if (rule.rules) {
            walkCss(rule, fn);
            return;
        }
        if (rule.keyframes) {
            rule.keyframes.forEach(function(keyframe) {
                if (keyframe.type === "keyframe") {
                    fn(keyframe.declarations, rule);
                }
            });
            return;
        }
        if (!rule.declarations) {
            return;
        }
        fn(rule.declarations, node);
    });
}

var VAR_PROP_IDENTIFIER = "--";

var VAR_FUNC_IDENTIFIER = "var";

var variablePersistStore = {};

function transformVars(cssText) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var defaults = {
        fixNestedCalc: true,
        onlyVars: true,
        persist: false,
        preserve: false,
        variables: {},
        onWarning: function onWarning() {}
    };
    var settings = mergeDeep(defaults, options);
    var map = settings.persist ? variablePersistStore : JSON.parse(JSON.stringify(variablePersistStore));
    var cssTree = cssParse(cssText);
    if (settings.onlyVars) {
        cssTree.stylesheet.rules = filterVars(cssTree.stylesheet.rules);
    }
    cssTree.stylesheet.rules.forEach(function(rule) {
        var varNameIndices = [];
        if (rule.type !== "rule") {
            return;
        }
        if (rule.selectors.length !== 1 || rule.selectors[0] !== ":root") {
            return;
        }
        rule.declarations.forEach(function(decl, i) {
            var prop = decl.property;
            var value = decl.value;
            if (prop && prop.indexOf(VAR_PROP_IDENTIFIER) === 0) {
                map[prop] = value;
                varNameIndices.push(i);
            }
        });
        if (!settings.preserve) {
            for (var i = varNameIndices.length - 1; i >= 0; i--) {
                rule.declarations.splice(varNameIndices[i], 1);
            }
        }
    });
    if (Object.keys(settings.variables).length) {
        var newRule = {
            declarations: [],
            selectors: [ ":root" ],
            type: "rule"
        };
        Object.keys(settings.variables).forEach(function(key) {
            var prop = "--" + key.replace(/^-+/, "");
            var value = settings.variables[key];
            if (map[prop] !== value) {
                map[prop] = value;
                newRule.declarations.push({
                    type: "declaration",
                    property: prop,
                    value: value
                });
            }
        });
        if (settings.preserve && newRule.declarations.length) {
            cssTree.stylesheet.rules.push(newRule);
        }
    }
    walkCss(cssTree.stylesheet, function(declarations, node) {
        var decl = void 0;
        var resolvedValue = void 0;
        var value = void 0;
        for (var i = 0; i < declarations.length; i++) {
            decl = declarations[i];
            value = decl.value;
            if (decl.type !== "declaration") {
                continue;
            }
            if (!value || value.indexOf(VAR_FUNC_IDENTIFIER + "(") === -1) {
                continue;
            }
            resolvedValue = resolveValue(value, map, settings);
            if (resolvedValue !== decl.value) {
                if (!settings.preserve) {
                    decl.value = resolvedValue;
                } else {
                    declarations.splice(i, 0, {
                        type: decl.type,
                        property: decl.property,
                        value: resolvedValue
                    });
                    i++;
                }
            }
        }
    });
    if (settings.fixNestedCalc) {
        fixNestedCalc(cssTree.stylesheet.rules);
    }
    return stringifyCss(cssTree);
}

function filterVars(rules) {
    return rules.filter(function(rule) {
        if (rule.declarations) {
            var declArray = rule.declarations.filter(function(d) {
                var hasVarProp = d.property && d.property.indexOf(VAR_PROP_IDENTIFIER) === 0;
                var hasVarVal = d.value && d.value.indexOf(VAR_FUNC_IDENTIFIER + "(") > -1;
                return hasVarProp || hasVarVal;
            });
            if (rule.type !== "font-face") {
                rule.declarations = declArray;
            }
            return Boolean(declArray.length);
        } else if (rule.keyframes) {
            return Boolean(rule.keyframes.filter(function(k) {
                return Boolean(k.declarations.filter(function(d) {
                    var hasVarProp = d.property && d.property.indexOf(VAR_PROP_IDENTIFIER) === 0;
                    var hasVarVal = d.value && d.value.indexOf(VAR_FUNC_IDENTIFIER + "(") > -1;
                    return hasVarProp || hasVarVal;
                }).length);
            }).length);
        } else if (rule.rules) {
            rule.rules = filterVars(rule.rules).filter(function(r) {
                return r.declarations && r.declarations.length;
            });
            return Boolean(rule.rules.length);
        }
        return true;
    });
}

function fixNestedCalc(rules) {
    var reCalcExp = /(-[a-z]+-)?calc\(/;
    rules.forEach(function(rule) {
        if (rule.declarations) {
            rule.declarations.forEach(function(decl) {
                var oldValue = decl.value;
                var newValue = "";
                while (reCalcExp.test(oldValue)) {
                    var rootCalc = balancedMatch("calc(", ")", oldValue || "");
                    oldValue = oldValue.slice(rootCalc.end);
                    while (reCalcExp.test(rootCalc.body)) {
                        var nestedCalc = balancedMatch(reCalcExp, ")", rootCalc.body);
                        rootCalc.body = nestedCalc.pre + "(" + nestedCalc.body + ")" + nestedCalc.post;
                    }
                    newValue += rootCalc.pre + "calc(" + rootCalc.body;
                    newValue += !reCalcExp.test(oldValue) ? ")" + rootCalc.post : "";
                }
                decl.value = newValue || decl.value;
            });
        }
    });
}

function resolveValue(value, map) {
    var settings = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var __recursiveFallback = arguments[3];
    var varFuncData = balancedMatch("var(", ")", value);
    var warningIntro = "CSS transform warning:";
    function resolveFunc(value) {
        var name = value.split(",")[0];
        var fallback = (value.match(/(?:\s*,\s*){1}(.*)?/) || [])[1];
        var match = map.hasOwnProperty(name) ? String(map[name]) : undefined;
        var replacement = match || (fallback ? String(fallback) : undefined);
        var unresolvedFallback = __recursiveFallback || value;
        if (!match) {
            settings.onWarning(warningIntro + ' variable "' + name + '" is undefined');
        }
        if (replacement && replacement !== "undefined" && replacement.length > 0) {
            return resolveValue(replacement, map, settings, unresolvedFallback);
        } else {
            return "var(" + unresolvedFallback + ")";
        }
    }
    if (!varFuncData) {
        if (value.indexOf("var(") !== -1) {
            settings.onWarning(warningIntro + ' missing closing ")" in the value "' + value + '"');
        }
        return value;
    } else if (varFuncData.body.trim().length === 0) {
        settings.onWarning(warningIntro + " var() must contain a non-whitespace string");
        return value;
    } else {
        return varFuncData.pre + resolveFunc(varFuncData.body) + resolveValue(varFuncData.post, map, settings);
    }
}

var name = "css-vars-ponyfill";

var toConsumableArray = function(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
        return arr2;
    } else {
        return Array.from(arr);
    }
};

var isBrowser = typeof window !== "undefined";

var isNativeSupport = isBrowser && window.CSS && window.CSS.supports && window.CSS.supports("(--a: 0)");

var defaults$1 = {
    rootElement: isBrowser ? document : null,
    include: "style,link[rel=stylesheet]",
    exclude: "",
    fixNestedCalc: true,
    onlyLegacy: true,
    onlyVars: false,
    preserve: false,
    shadowDOM: false,
    silent: false,
    updateDOM: true,
    updateURLs: true,
    variables: {},
    watch: false,
    onBeforeSend: function onBeforeSend() {},
    onSuccess: function onSuccess() {},
    onWarning: function onWarning() {},
    onError: function onError() {},
    onComplete: function onComplete() {}
};

var regex = {
    cssComments: /\/\*[\s\S]+?\*\//g,
    cssKeyframes: /@(?:-\w*-)?keyframes/,
    cssRootRules: /(?::root\s*{\s*[^}]*})/g,
    cssUrls: /url\((?!['"]?(?:data|http|\/\/):)['"]?([^'")]*)['"]?\)/g,
    cssVars: /(?:(?::root\s*{\s*[^;]*;*\s*)|(?:var\(\s*))(--[^:)]+)(?:\s*[:)])/
};

var cssVarsObserver = null;

var isShadowDOMReady = false;

/**
 * Fetches, parses, and transforms CSS custom properties from specified
 * <style> and <link> elements into static values, then appends a new <style>
 * element with static values to the DOM to provide CSS custom property
 * compatibility for legacy browsers. Also provides a single interface for
 * live updates of runtime values in both modern and legacy browsers.
 *
 * @preserve
 * @param {object}   [options] Options object
 * @param {object}   [options.rootElement=document] Root element to traverse for
 *                   <link> and <style> nodes.
 * @param {string}   [options.include="style,link[rel=stylesheet]"] CSS selector
 *                   matching <link re="stylesheet"> and <style> nodes to
 *                   process
 * @param {string}   [options.exclude] CSS selector matching <link
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
 * @param {boolean}  [options.shadowDOM=false] Determines if shadow DOM <link>
 *                   and <style> nodes will be processed.
 * @param {boolean}  [options.silent=false] Determines if warning and error
 *                   messages will be displayed on the console
 * @param {boolean}  [options.updateDOM=true] Determines if the ponyfill will
 *                   update the DOM after processing CSS custom properties
 * @param {boolean}  [options.updateURLs=true] Determines if the ponyfill will
 *                   convert relative url() paths to absolute urls.
 * @param {object}   [options.variables] A map of custom property name/value
 *                   pairs. Property names can omit or include the leading
 *                   double-hyphen (—), and values specified will override
 *                   previous values.
 * @param {boolean}  [options.watch=false] Determines if a MutationObserver will
 *                   be created that will execute the ponyfill when a <link> or
 *                   <style> DOM mutation is observed.
 * @param {function} [options.onBeforeSend] Callback before XHR is sent. Passes
 *                   1) the XHR object, 2) source node reference, and 3) the
 *                   source URL as arguments.
 * @param {function} [options.onSuccess] Callback after CSS data has been
 *                   collected from each node and before CSS custom properties
 *                   have been transformed. Allows modifying the CSS data before
 *                   it is transformed by returning any string value (or false
 *                   to skip). Passes 1) CSS text, 2) source node reference, and
 *                   3) the source URL as arguments.
 * @param {function} [options.onWarning] Callback after each CSS parsing warning
 *                   has occurred. Passes 1) a warning message as an argument.
 * @param {function} [options.onError] Callback after a CSS parsing error has
 *                   occurred or an XHR request has failed. Passes 1) an error
 *                   message, and 2) source node reference, 3) xhr, and 4 url as
 *                   arguments.
 * @param {function} [options.onComplete] Callback after all CSS has been
 *                   processed, legacy-compatible CSS has been generated, and
 *                   (optionally) the DOM has been updated. Passes 1) a CSS
 *                   string with CSS variable values resolved, 2) a reference to
 *                   the appended <style> node, and 3) an object containing all
 *                   custom properies names and values.
 *
 * @example
 *
 *   cssVars({
 *     rootElement  : document,
 *     include      : 'style,link[rel="stylesheet"]',
 *     exclude      : '',
 *     fixNestedCalc: true,
 *     onlyLegacy   : true,
 *     onlyVars     : false,
 *     preserve     : false,
 *     shadowDOM    : false,
 *     silent       : false,
 *     updateDOM    : true,
 *     updateURLs   : true,
 *     variables    : {
 *       // ...
 *     },
 *     watch        : false,
 *     onBeforeSend(xhr, node, url) {
 *       // ...
 *     }
 *     onSuccess(cssText, node, url) {
 *       // ...
 *     },
 *     onWarning(message) {
 *       // ...
 *     },
 *     onError(message, node) {
 *       // ...
 *     },
 *     onComplete(cssText, styleNode) {
 *       // ...
 *     }
 *   });
 */ function cssVars() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var settings = mergeDeep(defaults$1, options);
    var styleNodeId = name;
    settings.exclude = "#" + styleNodeId + (settings.exclude ? "," + settings.exclude : "");
    function handleError(message, sourceNode, xhr, url) {
        if (!settings.silent) {
            console.error(message + "\n", sourceNode);
        }
        settings.onError(message, sourceNode, xhr, url);
    }
    function handleWarning(message) {
        if (!settings.silent) {
            console.warn(message);
        }
        settings.onWarning(message);
    }
    if (!isBrowser) {
        return;
    }
    if (document.readyState !== "loading") {
        var isShadowElm = settings.shadowDOM && settings.rootElement.shadowRoot || settings.rootElement.host;
        if (isNativeSupport && settings.onlyLegacy) {
            if (settings.updateDOM) {
                Object.keys(settings.variables).forEach(function(key) {
                    var prop = "--" + key.replace(/^-+/, "");
                    var value = settings.variables[key];
                    document.documentElement.style.setProperty(prop, value);
                });
            }
        } else if (isShadowElm && !isShadowDOMReady) {
            getCssData({
                rootElement: defaults$1.rootElement,
                include: defaults$1.include,
                exclude: settings.exclude,
                onSuccess: function onSuccess(cssText, node, url) {
                    var cssRootDecls = (cssText.match(regex.cssRootRules) || []).join("");
                    return cssRootDecls || false;
                },
                onComplete: function onComplete(cssText, cssArray, nodeArray) {
                    transformVars(cssText, {
                        persist: true
                    });
                    isShadowDOMReady = true;
                    cssVars(settings);
                }
            });
        } else {
            if (settings.watch) {
                addMutationObserver(settings, styleNodeId);
            }
            getCssData({
                rootElement: settings.rootElement,
                include: settings.include,
                exclude: settings.exclude,
                filter: settings.onlyVars ? regex.cssVars : null,
                onBeforeSend: settings.onBeforeSend,
                onSuccess: function onSuccess(cssText, node, url) {
                    var returnVal = settings.onSuccess(cssText, node, url);
                    cssText = returnVal === false ? "" : returnVal || cssText;
                    if (settings.updateURLs) {
                        var cssUrls = cssText.replace(regex.cssComments, "").match(regex.cssUrls) || [];
                        cssUrls.forEach(function(cssUrl) {
                            var oldUrl = cssUrl.replace(regex.cssUrls, "$1");
                            var newUrl = getFullUrl$1(oldUrl, url);
                            cssText = cssText.replace(cssUrl, cssUrl.replace(oldUrl, newUrl));
                        });
                    }
                    return cssText;
                },
                onError: function onError(xhr, node, url) {
                    var responseUrl = xhr.responseURL || getFullUrl$1(url, location.href);
                    var statusText = xhr.statusText ? "(" + xhr.statusText + ")" : "Unspecified Error" + (xhr.status === 0 ? " (possibly CORS related)" : "");
                    var errorMsg = "CSS XHR Error: " + responseUrl + " " + xhr.status + " " + statusText;
                    handleError(errorMsg, node, xhr, responseUrl);
                },
                onComplete: function onComplete(cssText, cssArray, nodeArray) {
                    var cssMarker = /\/\*__CSSVARSPONYFILL-(\d+)__\*\//g;
                    var styleNode = null;
                    cssText = cssArray.map(function(css, i) {
                        return regex.cssVars.test(css) ? css : "/*__CSSVARSPONYFILL-" + i + "__*/";
                    }).join("");
                    try {
                        cssText = transformVars(cssText, {
                            fixNestedCalc: settings.fixNestedCalc,
                            onlyVars: settings.onlyVars,
                            persist: settings.updateDOM,
                            preserve: settings.preserve,
                            variables: settings.variables,
                            onWarning: handleWarning
                        });
                        var hasKeyframes = regex.cssKeyframes.test(cssText);
                        cssText = cssText.replace(cssMarker, function(match, group1) {
                            return cssArray[group1];
                        });
                        if (settings.updateDOM && nodeArray && nodeArray.length) {
                            var lastNode = nodeArray[nodeArray.length - 1];
                            styleNode = settings.rootElement.querySelector("#" + styleNodeId) || document.createElement("style");
                            styleNode.setAttribute("id", styleNodeId);
                            if (styleNode.textContent !== cssText) {
                                styleNode.textContent = cssText;
                            }
                            if (lastNode.nextSibling !== styleNode && lastNode.parentNode) {
                                lastNode.parentNode.insertBefore(styleNode, lastNode.nextSibling);
                            }
                            if (hasKeyframes) {
                                fixKeyframes(settings.rootElement);
                            }
                        }
                    } catch (err) {
                        var errorThrown = false;
                        cssArray.forEach(function(cssText, i) {
                            try {
                                cssText = transformVars(cssText, settings);
                            } catch (err) {
                                var errorNode = nodeArray[i - 0];
                                errorThrown = true;
                                handleError(err.message, errorNode);
                            }
                        });
                        if (!errorThrown) {
                            handleError(err.message || err);
                        }
                    }
                    if (settings.shadowDOM) {
                        var elms = [ settings.rootElement ].concat(toConsumableArray(settings.rootElement.querySelectorAll("*")));
                        for (var i = 0, elm; elm = elms[i]; ++i) {
                            if (elm.shadowRoot && elm.shadowRoot.querySelector("style")) {
                                var shadowSettings = mergeDeep(settings, {
                                    rootElement: elm.shadowRoot,
                                    variables: variablePersistStore
                                });
                                cssVars(shadowSettings);
                            }
                        }
                    }
                    settings.onComplete(cssText, styleNode, variablePersistStore);
                }
            });
        }
    } else {
        document.addEventListener("DOMContentLoaded", function init(evt) {
            cssVars(options);
            document.removeEventListener("DOMContentLoaded", init);
        });
    }
}

function addMutationObserver(settings, ignoreId) {
    if (window.MutationObserver && !cssVarsObserver) {
        var isLink = function isLink(node) {
            return node.tagName === "LINK" && (node.getAttribute("rel") || "").indexOf("stylesheet") !== -1;
        };
        var isStyle = function isStyle(node) {
            return node.tagName === "STYLE" && (ignoreId ? node.id !== ignoreId : true);
        };
        var debounceTimer = null;
        cssVarsObserver = new MutationObserver(function(mutations) {
            var isUpdateMutation = false;
            mutations.forEach(function(mutation) {
                if (mutation.type === "attributes") {
                    isUpdateMutation = isLink(mutation.target) || isStyle(mutation.target);
                } else if (mutation.type === "childList") {
                    var addedNodes = Array.apply(null, mutation.addedNodes);
                    var removedNodes = Array.apply(null, mutation.removedNodes);
                    isUpdateMutation = [].concat(addedNodes, removedNodes).some(function(node) {
                        var isValidLink = isLink(node) && !node.disabled;
                        var isValidStyle = isStyle(node) && !node.disabled && regex.cssVars.test(node.textContent);
                        return isValidLink || isValidStyle;
                    });
                }
                if (isUpdateMutation) {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(function() {
                        cssVars(settings);
                    }, 1);
                }
            });
        });
        cssVarsObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: [ "disabled", "href" ],
            childList: true,
            subtree: true
        });
    }
}

function fixKeyframes(rootElement) {
    var animationNameProp = [ "animation-name", "-moz-animation-name", "-webkit-animation-name" ].filter(function(prop) {
        return getComputedStyle(document.body)[prop];
    })[0];
    if (animationNameProp) {
        var allNodes = rootElement.getElementsByTagName("*");
        var keyframeNodes = [];
        var nameMarker = "__CSSVARSPONYFILL-KEYFRAMES__";
        for (var i = 0, len = allNodes.length; i < len; i++) {
            var node = allNodes[i];
            var animationName = getComputedStyle(node)[animationNameProp];
            if (animationName !== "none") {
                node.style[animationNameProp] += nameMarker;
                keyframeNodes.push(node);
            }
        }
        void document.body.offsetHeight;
        for (var _i = 0, _len = keyframeNodes.length; _i < _len; _i++) {
            var nodeStyle = keyframeNodes[_i].style;
            nodeStyle[animationNameProp] = nodeStyle[animationNameProp].replace(nameMarker, "");
        }
    }
}

function getFullUrl$1(url) {
    var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : location.href;
    var d = document.implementation.createHTMLDocument("");
    var b = d.createElement("base");
    var a = d.createElement("a");
    d.head.appendChild(b);
    d.body.appendChild(a);
    b.href = base;
    a.href = url;
    return a.href;
}

export default cssVars;
//# sourceMappingURL=css-vars-ponyfill.esm.js.map
