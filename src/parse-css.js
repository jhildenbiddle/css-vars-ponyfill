/**
 * Based on css parser/compiler by NxChg
 * https://github.com/NxtChg/pieces/tree/master/js/css_parser
 */


// Dependencies
// =============================================================================
import balanced from 'balanced-match';


// Functions
// =============================================================================
/**
 * Parses CSS string and generates AST object
 *
 * @param {string}  css The CSS stringt to be converted to an AST
 * @param {object}  [options] Options object
 * @param {boolean} [options.preserveStatic=true] Determines if CSS
 *                  declarations that do not reference a custom property will
 *                  be preserved in the transformed CSS
 * @param {boolean} [options.removeComments=false] Remove comments from returned
 *                  object
 * @returns {object}
 */
function parseCss(css, options = {}) {
    const defaults = {
        preserveStatic: true,
        removeComments: false
    };
    const settings = Object.assign({}, defaults, options);
    const errors   = [];

    // Errors
    // -------------------------------------------------------------------------
    function error(msg) {
        throw new Error(`CSS parse error: ${msg}`);
    }

    // RegEx
    // -------------------------------------------------------------------------
    // Match regexp and return captures
    function match(re) {
        const m = re.exec(css);

        if (m) {
            css = css.slice(m[0].length);

            return m;
        }
    }

    function open() {
        return match(/^{\s*/);
    }

    function close() {
        return match(/^}/);
    }

    function whitespace() {
        match(/^\s*/);
    }

    // Comments
    // -------------------------------------------------------------------------
    function comment() {
        whitespace();

        if (css[0] !== '/' || css[1] !== '*') {
            return;
        }

        let i = 2;

        while (css[i] && (css[i] !== '*' || css[i + 1] !== '/')) {
            i++;
        }

        if (!css[i]) {
            return error('end of comment is missing');
        }

        const str = css.slice(2, i);

        css = css.slice(i + 2);

        return {
            type   : 'comment',
            comment: str
        };
    }

    function comments() {
        const cmnts = [];
        let c;

        while ((c = comment())) {
            cmnts.push(c);
        }

        return settings.removeComments ? [] : cmnts;
    }

    // Selector
    // -------------------------------------------------------------------------
    function selector() {
        whitespace();

        while (css[0] === '}') {
            error('extra closing bracket');
        }

        const m = match(/^(("(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^{])+)/);

        if (m) {
            return m[0]
                .trim() // remove all comments from selectors
                .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
                .replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function(m) {
                    return m.replace(/,/g, '\u200C');
                })
                .split(/\s*(?![^(]*\)),\s*/)
                .map(function(s) {
                    return s.replace(/\u200C/g, ',');
                });
        }
    }

    // Declarations
    // -------------------------------------------------------------------------
    function declaration() {
        match(/^([;\s]*)+/); // ignore empty declarations + whitespace

        const comment_regexp = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
        let prop = match(/^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);

        if (!prop) {
            return;
        }

        prop = prop[0].trim();

        if (!match(/^:\s*/)) {
            return error('property missing \':\'');
        }

        // Quotes regex repeats verbatim inside and outside parentheses
        const val = match(/^((?:\/\*.*?\*\/|'(?:\\'|.)*?'|"(?:\\"|.)*?"|\((\s*'(?:\\'|.)*?'|"(?:\\"|.)*?"|[^)]*?)\s*\)|[^};])+)/);
        const ret = {
            type    : 'declaration',
            property: prop.replace(comment_regexp, ''),
            value   : val ? val[0].replace(comment_regexp, '').trim() : ''
        };

        match(/^[;\s]*/);

        return ret;
    }

    function declarations() {
        if (!open()) {
            return error('missing \'{\'');
        }

        let d;
        let decls = comments();

        while ((d = declaration())) {
            decls.push(d);
            decls = decls.concat(comments());
        }

        if (!close()) {
            return error('missing \'}\'');
        }

        return decls;
    }

    // Keyframes
    // -------------------------------------------------------------------------
    function keyframe() {
        whitespace();

        const vals = [];
        let m;

        while ((m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/))) {
            vals.push(m[1]);
            match(/^,\s*/);
        }

        if (vals.length) {
            return {
                type        : 'keyframe',
                values      : vals,
                declarations: declarations()
            };
        }
    }

    function at_keyframes() {
        let m = match(/^@([-\w]+)?keyframes\s*/);

        if (!m) {
            return;
        }

        const vendor = m[1];

        m = match(/^([-\w]+)\s*/);

        if (!m) {
            return error('@keyframes missing name');
        }

        const name = m[1];

        if (!open()) {
            return error('@keyframes missing \'{\'');
        }

        let frame;
        let frames = comments();

        while ((frame = keyframe())) {
            frames.push(frame);
            frames = frames.concat(comments());
        }

        if (!close()) {
            return error('@keyframes missing \'}\'');
        }

        return {
            type     : 'keyframes',
            name     : name,
            vendor   : vendor,
            keyframes: frames
        };
    }

    // @ Rules
    // -------------------------------------------------------------------------
    function at_page() {
        const m = match(/^@page */);
        if (m) {
            const sel = selector() || [];
            return { type: 'page', selectors: sel, declarations: declarations() };
        }
    }
    function at_fontface() {
        const m = match(/^@font-face\s*/);
        if (m) { return { type: 'font-face', declarations: declarations() }; }
    }
    function at_supports() {
        const m = match(/^@supports *([^{]+)/);
        if (m) { return { type: 'supports', supports: m[1].trim(), rules: rules() }; }
    }
    function at_host() {
        const m = match(/^@host\s*/);
        if (m) { return { type: 'host', rules: rules() }; }
    }
    function at_media() {
        const m = match(/^@media *([^{]+)/);
        if (m) { return { type: 'media', media: m[1].trim(), rules: rules() }; }
    }
    function at_custom_m() {
        const m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
        if (m) { return { type: 'custom-media', name: m[1].trim(), media: m[2].trim() }; }
    }
    function at_document() {
        const m = match(/^@([-\w]+)?document *([^{]+)/);
        if (m) { return { type: 'document', document: m[2].trim(), vendor: m[1] ? m[1].trim() : null, rules: rules() }; }
    }
    function at_x() {
        const m = match(/^@(import|charset|namespace)\s*([^;]+);/);
        if (m) { return { type: m[1], name: m[2].trim() }; }
    }
    function at_rule() {
        whitespace();

        if (css[0] === '@') {
            const ret = at_keyframes() || at_supports() || at_host() || at_media() || at_custom_m() || at_page() || at_document() || at_fontface() || at_x();

            if (ret && !settings.preserveStatic) {
                let hasVarFunc = false;

                // @page, @font-face
                if (ret.declarations) {
                    hasVarFunc = ret.declarations.some(decl => /var\(/.test(decl.value));
                }
                // @keyframes, @media, @supports, etc.
                else {
                    const arr = ret.keyframes || ret.rules || [];

                    hasVarFunc = arr.some(obj => (obj.declarations || []).some(decl => /var\(/.test(decl.value)));
                }

                return hasVarFunc ? ret : {};
            }

            return ret;
        }
    }

    // Rules
    // -------------------------------------------------------------------------
    function rule() {
        if (!settings.preserveStatic) {
            const balancedMatch = balanced('{', '}', css);

            // Skip rulset if it does not contain a :root variable declaration
            // of a variable function value
            if (balancedMatch) {
                const hasVarDecl = balancedMatch.pre.indexOf(':root') !== -1 && /--\S*\s*:/.test(balancedMatch.body);
                const hasVarFunc = /var\(/.test(balancedMatch.body);

                if (!hasVarDecl && !hasVarFunc) {
                    css = css.slice(balancedMatch.end + 1);

                    return {};
                }
            }
        }

        const sel   = selector() || [];
        const decls = settings.preserveStatic ? declarations() : declarations().filter(decl => {
            const hasVarDecl = sel.some(s => s.indexOf(':root') !== -1) && /^--\S/.test(decl.property);
            const hasVarFunc = /var\(/.test(decl.value);

            return hasVarDecl || hasVarFunc;
        });

        if (!sel.length) {
            error('selector missing');
        }

        return {
            type        : 'rule',
            selectors   : sel,
            declarations: decls
        };
    }

    function rules(core) {
        if (!core && !open()) {
            return error('missing \'{\'');
        }

        let node;
        let rules = comments();

        while (css.length && (core || css[0] !== '}') && (node = at_rule() || rule())) {
            if (node.type) {
                rules.push(node);
            }

            rules = rules.concat(comments());
        }

        if (!core && !close()) {
            return error('missing \'}\'');
        }

        return rules;
    }

    return {
        type: 'stylesheet',
        stylesheet: {
            rules: rules(true),
            errors: errors
        }
    };
}


// Exports
// =============================================================================
export default parseCss;
