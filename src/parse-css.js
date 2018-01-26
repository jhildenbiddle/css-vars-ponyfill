/**
 * Based on css parser/compiler by NxChg
 * https://github.com/NxtChg/pieces/tree/master/js/css_parser
 */


// Functions
// =============================================================================
/**
 * Parses CSS string and generates AST object
 *
 * @param {string} css The CSS stringt to be converted to an AST
 * @returns {object}
 */
function cssParse(css) {
    const errors = [];

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

    function whitespace() {
        match(/^\s*/);
    }
    function open() {
        return match(/^{\s*/);
    }
    function close() {
        return match(/^}/);
    }

    // Comments
    // -------------------------------------------------------------------------
    function comment() {
        whitespace();

        if (css[0] !== '/' || css[1] !== '*') { return; }

        let i = 2;
        while (css[i] && (css[i] !== '*' || css[i + 1] !== '/')) { i++; }

        // FIXED
        if (!css[i]) { return error('end of comment is missing'); }

        const str = css.slice(2, i);
        css = css.slice(i + 2);

        return { type: 'comment', comment: str };
    }
    function comments() {
        const cmnts = [];

        let c;

        while ((c = comment())) {
            cmnts.push(c);
        }
        return cmnts;
    }

    // Selector
    // -------------------------------------------------------------------------
    function selector() {
        whitespace();
        while (css[0] === '}') {
            error('extra closing bracket');
        }

        const m = match(/^(("(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^{])+)/);

        if (m)
        { return m[0]
            .trim() // remove all comments from selectors
            .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
            .replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function(m) {
                return m.replace(/,/g, '\u200C');
            })
            .split(/\s*(?![^(]*\)),\s*/)
            .map(function(s) {
                return s.replace(/\u200C/g, ',');
            }); }
    }

    // Declarations
    // -------------------------------------------------------------------------
    function declaration() {
        match(/^([;\s]*)+/); // ignore empty declarations + whitespace

        const comment_regexp = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;

        let prop = match(/^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
        if (!prop) { return; }

        prop = prop[0].trim();

        if (!match(/^:\s*/)) { return error('property missing \':\''); }

        // Quotes regex repeats verbatim inside and outside parentheses
        const val = match(/^((?:\/\*.*?\*\/|'(?:\\'|.)*?'|"(?:\\"|.)*?"|\((\s*'(?:\\'|.)*?'|"(?:\\"|.)*?"|[^)]*?)\s*\)|[^};])+)/);

        const ret = { type: 'declaration', property: prop.replace(comment_regexp, ''), value: val ? val[0].replace(comment_regexp, '').trim() : '' };

        match(/^[;\s]*/);

        return ret;
    }
    function declarations() {
        if (!open()) { return error('missing \'{\''); }

        let d,
            decls = comments();

        while ((d = declaration())) {
            decls.push(d);
            decls = decls.concat(comments());
        }

        if (!close()) { return error('missing \'}\''); }

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

        if (vals.length) { return { type: 'keyframe', values: vals, declarations: declarations() }; }
    }
    function at_keyframes() {
        let m = match(/^@([-\w]+)?keyframes\s*/);

        if (!m) { return; }

        const vendor = m[1];

        m = match(/^([-\w]+)\s*/);
        if (!m) { return error('@keyframes missing name'); } // identifier

        const name = m[1];

        if (!open()) { return error('@keyframes missing \'{\''); }

        let frame,
            frames = comments();
        while ((frame = keyframe())) {
            frames.push(frame);
            frames = frames.concat(comments());
        }

        if (!close()) { return error('@keyframes missing \'}\''); }

        return { type: 'keyframes', name: name, vendor: vendor, keyframes: frames };
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
        // FIXED
        if (m) { return { type: 'document', document: m[2].trim(), vendor: m[1] ? m[1].trim() : null, rules: rules() }; }
    }
    function at_x() {
        const m = match(/^@(import|charset|namespace)\s*([^;]+);/);
        if (m) { return { type: m[1], name: m[2].trim() }; }
    }
    function at_rule() {
        whitespace();
        if (css[0] === '@') { return at_keyframes() || at_supports() || at_host() || at_media() || at_custom_m() || at_page() || at_document() || at_fontface() || at_x(); }
    }

    // Rules
    // -------------------------------------------------------------------------
    function rule() {
        const sel = selector() || [];
        if (!sel.length) { error('selector missing'); }

        const decls = declarations();

        return { type: 'rule', selectors: sel, declarations: decls };
    }
    function rules(core) {
        if (!core && !open()) { return error('missing \'{\''); }

        let node,
            rules = comments();

        while (css.length && (core || css[0] !== '}') && (node = at_rule() || rule())) {
            rules.push(node);
            rules = rules.concat(comments());
        }

        if (!core && !close()) { return error('missing \'}\''); }

        return rules;
    }

    return { type: 'stylesheet', stylesheet: { rules: rules(true), errors: errors } };
}


// Exports
// =============================================================================
export default cssParse;
