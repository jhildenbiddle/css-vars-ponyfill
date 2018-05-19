/**
 * Based on css parser/compiler by NxChg
 * https://github.com/NxtChg/pieces/tree/master/js/css_parser
 */


// Functions
// =============================================================================
/**
 * Compiles CSS AST to string
 *
 * @param {object}   tree CSS AST object
 * @param {string}   [delim=''] CSS rule delimiter
 * @param {function} cb Function to be called before each node is processed
 * @returns {string}
 */
function stringifyCss(tree, delim = '', cb) {
    const renderMethods = {
        charset(node) {
            return '@charset ' + node.name + ';';
        },
        comment(node) {
            // Preserve ponyfill marker comments
            return node.comment.indexOf('__CSSVARSPONYFILL') === 0 ? '/*' + node.comment + '*/' : '';
        },
        'custom-media'(node) {
            return '@custom-media ' + node.name + ' ' + node.media + ';';
        },
        declaration(node) {
            return node.property + ':' + node.value + ';';
        },
        document(node) {
            return '@' + (node.vendor || '') + 'document ' + node.document + '{' + visit(node.rules) + '}';
        },
        'font-face'(node) {
            return '@font-face' + '{' + visit(node.declarations) + '}';
        },
        host(node) {
            return '@host' + '{' + visit(node.rules) + '}';
        },
        import(node) {
            // FIXED
            return '@import ' + node.name + ';';
        },
        keyframe(node) {
            return node.values.join(',') + '{' + visit(node.declarations) + '}';
        },
        keyframes(node) {
            return '@' + (node.vendor || '') + 'keyframes ' + node.name + '{' + visit(node.keyframes) + '}';
        },
        media(node) {
            return '@media ' + node.media + '{' + visit(node.rules) + '}';
        },
        namespace(node) {
            return '@namespace ' + node.name + ';';
        },
        page(node) {
            return '@page ' + (node.selectors.length ? node.selectors.join(', ') : '') + '{' + visit(node.declarations) + '}';
        },
        rule(node) {
            const decls = node.declarations;

            if (decls.length) {
                return node.selectors.join(',') + '{' + visit(decls) + '}';
            }
        },
        supports(node) {
            // FIXED
            return '@supports ' + node.supports + '{' + visit(node.rules) + '}';
        }
    };

    function visit(nodes) {
        let buf = '';

        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];

            if (cb) {
                cb(n);
            }

            const txt = renderMethods[n.type](n);

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


// Exports
// =============================================================================
export default stringifyCss;
