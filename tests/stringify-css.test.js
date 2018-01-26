// Dependencies
// =============================================================================
import loadFixtures from './helpers/load-fixtures';
import parseCss     from '../src/parse-css';
import stringifyCss from '../src/stringify-css';
import { expect }   from 'chai';


// Suite
// =============================================================================
describe('stringify-css', function() {
    const fixtures = {};

    // Hooks
    // -------------------------------------------------------------------------
    before(async function() {
        await loadFixtures({
            base: '/base/tests/fixtures/',
            urls : [
                'test-parse.css',
                'test-stringify.css'
            ]
        }, fixtures);
    });

    // Tests
    // -------------------------------------------------------------------------
    it('converts AST to string', function() {
        const cssIn     = fixtures['test-parse.css'];
        const cssAst    = parseCss(cssIn);
        const cssOut    = stringifyCss(cssAst);
        const expectCss = fixtures['test-stringify.css'].replace(/\n/g,'');

        expect(cssOut).to.equal(expectCss);
    });

    it('triggers callback for each node', function() {
        const cssIn  = 'p { color: red; }';
        const cssAst = parseCss(cssIn);

        let callbackCount = 0;

        stringifyCss(cssAst, '', node => { callbackCount++; });

        expect(callbackCount).to.be.above(0);
    });
});
