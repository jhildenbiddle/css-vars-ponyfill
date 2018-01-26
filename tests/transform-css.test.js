// Dependencies
// =============================================================================
import loadFixtures from './helpers/load-fixtures';
import transformCss from '../src/transform-css';
import { expect }   from 'chai';


// Suite
// =============================================================================
describe('transform-css', function() {
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

    // Tests: Transforms
    // -------------------------------------------------------------------------
    describe('Transforms', function() {
        it('transforms :root variable', function() {
            const cssIn = `
                :root { --color: red; }
                p { color: var(--color); }
            `;
            const cssOut    = transformCss(cssIn);
            const expectCss = `
                :root { --color: red; }
                p { color: red; color: var(--color); }
            `.replace(/\n|\s/g, '');

            expect(cssOut).to.equal(expectCss);
        });

        it('transforms :root variable with comments', function() {
            const cssIn = `
                :root {
                    /* 1 */
                    --color: /* 2 */ red /* 3 */;
                    /* 4 */
                }
                p {
                    /* 5 */
                    color: /* 6 */ var(--color) /* 7 */;
                    /* 8 */
                }
            `;
            const cssOut    = transformCss(cssIn);
            const expectCss = `
                :root { --color: red; }
                p { color: red; color: var(--color); }
            `.replace(/\n|\s/g, '');

            expect(cssOut).to.equal(expectCss);
        });

        it('transforms out-of-order :root variable', function() {
            const cssIn = `
                p { color: var(--color); }
                :root { --color: red; }
            `;
            const cssOut = transformCss(cssIn);
            const expectCss = `
                p { color: red; color: var(--color); }
                :root { --color: red; }
            `.replace(/\n|\s/g, '');

            expect(cssOut).to.equal(expectCss);
        });

        it('transforms chained :root variable', function() {
            const cssIn = `
                :root { --color1: var(--color2); }
                :root { --color2: red; }
                p { color: var(--color1); }
            `;
            const cssOut    = transformCss(cssIn);
            const expectCss = `
                :root { --color1: red; --color1: var(--color2); }
                :root { --color2: red; }
                p { color: red; color: var(--color1); }
            `.replace(/\n|\s/g, '');

            expect(cssOut).to.equal(expectCss);
        });

        it('transforms variable function fallback', function() {
            const cssIn     = 'p { color: var(--fail, red); }';
            const cssOut    = transformCss(cssIn);
            const expectCss = 'p{color:red;color:var(--fail, red);}';

            expect(cssOut).to.equal(expectCss);
        });
    });

    // Tests: Options
    // -------------------------------------------------------------------------
    describe('Options', function() {
        // The 'onlyVars' option is used in this module as well as the index.js
        // module. Testing how this options is handled by each module is handled
        // in each module's test file.
        describe('onlyVars', function() {
            it('true (declarations)', function() {
                const cssIn = `
                    /* Comment */
                    :root { --color: red; }
                    p { color: var(--color); }
                    p { color: green; }
                `;
                const cssOut    = transformCss(cssIn, { onlyVars: true }).replace(/\n/g, '');
                const expectCss = `
                    :root{ --color:red; }
                    p { color: red; color: var(--color); }
                `.replace(/\n|\s/g, '');

                expect(cssOut).to.equal(expectCss);
            });

            it('true (@font-face)', function() {
                const cssIn = `
                    :root { --weight: normal; }
                    @font-face {
                        font-family: "test1";
                        font-weight: var(--weight);
                    }
                    @font-face {
                        font-family: "test2";
                        font-weight: bold;
                    }
                `;
                const cssOut    = transformCss(cssIn, { onlyVars: true }).replace(/\n/g, '');
                const expectCss = `
                    :root { --weight: normal; }
                    @font-face {
                        font-family: "test1";
                        font-weight: normal;
                        font-weight: var(--weight);
                    }
                `.replace(/\n|\s/g, '');

                expect(cssOut).to.equal(expectCss);
            });

            it('true (@keyframes)', function() {
                const cssIn = `
                    :root { --color: red; }
                    @keyframes test1 {
                        from { color: var(--color); }
                        to { color: green; }
                    }
                    @keyframes test2 {
                        from { color: red; }
                        to { color: green; }
                    }
                `;
                const cssOut    = transformCss(cssIn, { onlyVars: true }).replace(/\n/g, '');
                const expectCss = `
                    :root { --color: red;}
                    @keyframes test1 {
                        from { color: red; color: var(--color); }
                        to { color: green; }
                    }
                `.replace(/\n|\s/g, '').replace(/@keyframes/, '@keyframes ');

                expect(cssOut).to.equal(expectCss);
            });

            it('true (@media)', function() {
                const cssIn = `
                    :root { --color: red; }
                    @media screen {
                        p { color: var(--color); }
                        p { color: green; }
                    }
                `;
                const cssOut    = transformCss(cssIn, { onlyVars: true }).replace(/\n/g, '');
                const expectCss = `
                    :root { --color: red; }
                    @media screen {
                        p { color: red; color: var(--color); }
                    }
                `.replace(/\n|\s/g, '').replace(/@media/, '@media ');

                expect(cssOut).to.equal(expectCss);
            });
        });

        describe('preserve', function() {
            it('true (default)', function() {
                const cssIn     = `
                    :root { --color: red; }
                    p { color: var(--color); }
                `;
                const cssOut    = transformCss(cssIn).replace(/\n/g, '');
                const expectCss = `
                    :root { --color: red; }
                    p { color: red; color: var(--color); }
                `.replace(/\n|\s/g, '');

                expect(cssOut).to.equal(expectCss);
            });

            it('false', function() {
                const cssIn     = `
                    :root { --color: red; --weight: normal; }
                    p {
                        color: var(--color);
                    }
                    @font-face {
                        font-family: "test1";
                        font-weight: var(--weight);
                    }
                    @keyframes test1 {
                        from { color: var(--color); }
                        to { color: green; }
                    }
                    @media screen {
                        p { color: var(--color); }
                    }
                `;
                const cssOut    = transformCss(cssIn, { preserve: false }).replace(/\n/g, '');
                const expectCss = `
                    p {
                        color: red;
                    }
                    @font-face {
                        font-family: "test1";
                        font-weight: normal;
                    }
                    @keyframes test1 {
                        from { color: red; }
                        to { color: green; }
                    }
                    @media screen {
                        p { color: red; }
                    }
                `.replace(/\n|\s/g, '').replace(/@keyframes/, '@keyframes ').replace(/@media/, '@media ');

                expect(cssOut).to.equal(expectCss);
            });
        });

        describe('variables', function() {
            it('No leading --', function() {
                const cssIn     = ':root{--color1:red}p{color:var(--color1)}p{color:var(--color2)}';
                const cssOut    = transformCss(cssIn, {
                    preserve : false,
                    variables: { color2: 'green' }
                }).replace(/\n/g, '');
                const expectCss = 'p{color:red;}p{color:green;}';

                expect(cssOut).to.equal(expectCss);
            });

            it('Malformed single -', function() {
                const cssIn     = ':root{--color1:red}p{color:var(--color1)}p{color:var(--color2)}';
                const cssOut    = transformCss(cssIn, {
                    preserve : false,
                    variables: { '-color2': 'green' }
                }).replace(/\n/g, '');
                const expectCss = 'p{color:red;}p{color:green;}';

                expect(cssOut).to.equal(expectCss);
            });

            it('Leading --', function() {
                const cssIn     = ':root{--color1:red}p{color:var(--color1)}p{color:var(--color2)}';
                const cssOut    = transformCss(cssIn, {
                    preserve : false,
                    variables: { '--color2': 'green' }
                }).replace(/\n/g, '');
                const expectCss = 'p{color:red;}p{color:green;}';

                expect(cssOut).to.equal(expectCss);
            });

            it('Override existing variable', function() {
                const cssIn     = ':root{--color1:red}p{color:var(--color1)}p{color:var(--color2)}';
                const cssOut    = transformCss(cssIn, {
                    preserve : false,
                    variables: {
                        '--color1': 'blue',
                        '--color2': 'green'
                    }
                }).replace(/\n/g, '');
                const expectCss = 'p{color:blue;}p{color:green;}';

                expect(cssOut).to.equal(expectCss);
            });

            it('Appends new :root element with vars', function() {
                const cssIn     = 'p{color:var(--color1)}';
                const cssOut    = transformCss(cssIn, {
                    preserve : true,
                    variables: { color1: 'red' }
                }).replace(/\n/g, '');
                const expectCss = 'p{color:red;color:var(--color1);}:root{--color1:red;}';

                expect(cssOut).to.equal(expectCss);
            });
        });
    });

    // Tests: Callbacks
    // -------------------------------------------------------------------------
    describe('Callbacks', function() {
        it('triggers onWarning callback with proper arguments', function() {
            let onWarningCount = 0;

            transformCss('p { color: var(--fail); }', {
                onWarning() {
                    onWarningCount++;
                }
            });

            expect(onWarningCount).to.equal(1);
        });
    });
});
