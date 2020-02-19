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

    describe('Ignoring', function() {
        it('ignores :root with class selector', async function() {
            const css  = `
                :root { --color: red; }
                :root.foo { --color: green; }
            `;
            const vars = parseVars(css);

            expect(vars).to.eql({ '--color': 'red' });
        });

        it('ignores :root with attribute selector', async function() {
            const css  = `
                :root { --color: red; }
                :root[foo="bar"] { --color: green; }
            `;
            const vars = parseVars(css);

            expect(vars).to.eql({ '--color': 'red' });
        });

        it('ignores :root with pseudo selector', async function() {
            const css  = `
                :root { --color: red; }
                :root:hover { --color: green; }
                :root::hover { --color: blue; }
            `;
            const vars = parseVars(css);

            expect(vars).to.eql({ '--color': 'red' });
        });

        it('ignores :root with descendant selector', async function() {
            const css  = `
                :root { --color: red; }
                :root #foo { --color: green; }
                :root .bar { --color: blue; }
            `;
            const vars = parseVars(css);

            expect(vars).to.eql({ '--color': 'red' });
        });

        it('ignores :root with child selector', async function() {
            const css  = `
                :root { --color: red; }
                :root > #foo { --color: green; }
                :root > .bar { --color: blue; }
            `;
            const vars = parseVars(css);

            expect(vars).to.eql({ '--color': 'red' });
        });

        it('ignores :root with sibling selector', async function() {
            const css  = `
                :root { --color: red; }
                :root ~ #foo { --color: green; }
                :root ~ .bar { --color: blue; }
            `;
            const vars = parseVars(css);

            expect(vars).to.eql({ '--color': 'red' });
        });

        it('ignores :root with adjacent sibling selector', async function() {
            const css  = `
                :root { --color: red; }
                :root + #foo { --color: green; }
                :root + .bar { --color: blue; }
            `;
            const vars = parseVars(css);

            expect(vars).to.eql({ '--color': 'red' });
        });
    });
});
