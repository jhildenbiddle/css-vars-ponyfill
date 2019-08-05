// Dependencies
// =============================================================================
import parseVars  from '../src/parse-vars';
import { expect } from 'chai';


// Suite
// =============================================================================
describe('parse-vars', function() {
    // Tests: Parsing
    // -------------------------------------------------------------------------
    describe('Parsing', function() {
        it('parses from single selector', async function() {
            const css  = ':root { --color: red; }';
            const vars = parseVars(css);

            expect(vars).to.eql({ '--color': 'red' });
        });

        it('parses from comma-separated selector', async function() {
            const css  = ':root, html { --color: red; }';
            const vars = parseVars(css);

            expect(vars).to.eql({ '--color': 'red' });
        });
    });
});
