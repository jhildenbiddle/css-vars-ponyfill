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
        it('parses from single selector', function() {
            const css  = ':root { --color: red; }';
            const vars = parseVars(css);

            expect(vars).to.eql({ '--color': 'red' });
        });

        it('parses from comma-separated selector', function() {
            const css  = ':root, html { --color: red; }';
            const vars = parseVars(css);

            expect(vars).to.eql({ '--color': 'red' });
        });
    });

    describe('Ignoring', function() {
        it('ignores :root with class selector', function() {
            const css  = `
                :root { --color: red; }
                :root.foo { --color: green; }
            `;
            const vars = parseVars(css);

            expect(vars).to.eql({ '--color': 'red' });
        });

        it('ignores :root with attribute selector', function() {
            const css  = `
                :root { --color: red; }
                :root[foo="bar"] { --color: green; }
            `;
            const vars = parseVars(css);

            expect(vars).to.eql({ '--color': 'red' });
        });

        it('ignores :root with pseudo selector', function() {
            const css  = `
                :root { --color: red; }
                :root:hover { --color: green; }
                :root::hover { --color: blue; }
            `;
            const vars = parseVars(css);

            expect(vars).to.eql({ '--color': 'red' });
        });

        it('ignores :root with descendant selector', function() {
            const css  = `
                :root { --color: red; }
                :root #foo { --color: green; }
                :root .bar { --color: blue; }
            `;
            const vars = parseVars(css);

            expect(vars).to.eql({ '--color': 'red' });
        });

        it('ignores :root with child selector', function() {
            const css  = `
                :root { --color: red; }
                :root > #foo { --color: green; }
                :root > .bar { --color: blue; }
            `;
            const vars = parseVars(css);

            expect(vars).to.eql({ '--color': 'red' });
        });

        it('ignores :root with sibling selector', function() {
            const css  = `
                :root { --color: red; }
                :root ~ #foo { --color: green; }
                :root ~ .bar { --color: blue; }
            `;
            const vars = parseVars(css);

            expect(vars).to.eql({ '--color': 'red' });
        });

        it('ignores :root with adjacent sibling selector', function() {
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
