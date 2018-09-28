// Dependencies
// =============================================================================
import loadFixtures from './helpers/load-fixtures';
import parseCss     from '../src/parse-css';
import { expect }   from 'chai';


// Suite
// =============================================================================
describe('parse-css', function() {
    const fixtures = {};

    // Hooks
    // -------------------------------------------------------------------------
    before(async function() {
        await loadFixtures({
            base: '/base/tests/fixtures/',
            urls : ['test-parse.css'],
        }, fixtures);
    });

    // Tests
    // -------------------------------------------------------------------------
    it('parses CSS to an AST (object)', async function() {
        const css = fixtures['test-parse.css'];
        const ast = parseCss(css);

        expect(ast instanceof Object).to.be.true;
        expect(ast).to.have.property('type', 'stylesheet');
    });

    it('throws an error when parsing missing opening bracket', function() {
        const css = 'p color: red; }';
        const badFn = function() {
            parseCss(css);
        };

        expect(badFn).to.throw(Error, 'missing \'{\'');
    });

    it('throws an error when parsing missing @rule opening bracket', function() {
        const css = '@media screen p color: red; }';
        const badFn = function() {
            parseCss(css);
        };

        expect(badFn).to.throw(Error, 'missing \'{\'');
    });

    it('throws an error when parsing missing closing bracket', function() {
        const css = 'p { color: red;';
        const badFn = function() {
            parseCss(css);
        };

        expect(badFn).to.throw(Error, 'missing \'}\'');
    });

    it('throws an error when parsing missing @rule closing bracket', function() {
        const css = '@media screen { p { color: red; }';
        const badFn = function() {
            parseCss(css);
        };

        expect(badFn).to.throw(Error, 'missing \'}\'');
    });

    it('throws an error when parsing missing end of comment', function() {
        const css = '/* Comment *';
        const badFn = function() {
            parseCss(css);
        };

        expect(badFn).to.throw(Error, 'end of comment');
    });

    it('throws an error when parsing extra closing bracket', function() {
        const css = 'p { color: red; }}';
        const badFn = function() {
            parseCss(css);
        };

        expect(badFn).to.throw(Error, 'closing bracket');
    });

    it('throws an error when parsing property missing colon', function() {
        const css = 'p { color red; }';
        const badFn = function() {
            parseCss(css);
        };

        expect(badFn).to.throw(Error, 'property missing \':\'');
    });

    it('throws an error when parsing missing selector', function() {
        const css = '{ color red; }';
        const badFn = function() {
            parseCss(css);
        };

        expect(badFn).to.throw(Error, 'selector missing');
    });

    it('throws an error when parsing @keyframes with missing name', function() {
        const css = '@keyframes { from { opacity: 0; } to { opacity: 1; } }';
        const badFn = function() {
            parseCss(css);
        };

        expect(badFn).to.throw(Error, '@keyframes missing name');
    });

    it('throws an error when parsing @keyframes with missing open bracket', function() {
        const css = '@keyframes test from { opacity: 0; } to { opacity: 1; } }';
        const badFn = function() {
            parseCss(css);
        };

        expect(badFn).to.throw(Error, '@keyframes missing \'{\'');
    });

    it('throws an error when parsing @keyframes with missing closing bracket', function() {
        const css = '@keyframes test { from { opacity: 0; } to { opacity: 1; }';
        const badFn = function() {
            parseCss(css);
        };

        expect(badFn).to.throw(Error, '@keyframes missing \'}\'');
    });
});
