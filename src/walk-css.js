/**
 * Based on rework-visit by reworkcss
 * https://github.com/reworkcss/rework-visit
 */


// Functions
// =============================================================================
/**
 * Visit `node` declarations recursively and invoke `fn(declarations, node)`.
 *
 * @param {object} node
 * @param {function} fn
 */
function walkCss(node, fn){
    node.rules.forEach(function(rule){
        // @media etc
        if (rule.rules) {
            walkCss(rule, fn);

            return;
        }

        // keyframes
        if (rule.keyframes) {
            rule.keyframes.forEach(function(keyframe){
                if (keyframe.type === 'keyframe') {
                    fn(keyframe.declarations, rule);
                }
            });

            return;
        }

        // @charset, @import etc
        if (!rule.declarations) {
            return;
        }

        fn(rule.declarations, node);
    });
}


// Exports
// =============================================================================
export default walkCss;
