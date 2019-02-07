// Dependencies
// =============================================================================
import resetVariableStore from './helpers/reset-variablestore';
import transformCss       from '../src/transform-css';
import { expect }         from 'chai';


// Suite
// =============================================================================
describe('transform-css', function() {
    // Hooks
    // -------------------------------------------------------------------------
    beforeEach(function() {
        resetVariableStore();
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
            const expectCss = 'p{color:red;}';

            expect(cssOut).to.equal(expectCss);
        });

        it('transforms :root variable with comments', function() {
            const cssIn = `
                /* 1 */
                :root {
                    /* 2 */
                    --color: /* 3 */ red /* 4 */; /* 5 */
                    /* 6 */
                }
                /* 7 */
                p {
                    /* 8 */
                    color: /* 9 */ var(--color) /* 10 */; /* 11 */
                    /* 12 */
                }
                /* 13 */
                @media {
                    /* 14 */
                    p {
                        /* 15 */
                        color: /* 16 */ black /* 17 */; /* 18 */
                        /* 19 */
                    }
                    /* 20 */
                }
                /* 21 */
            `;
            const cssOut    = transformCss(cssIn, { onlyVars: true });
            const expectCss = 'p{color:red;}';

            expect(cssOut).to.equal(expectCss);
        });

        it('transforms out-of-order :root variable', function() {
            const cssIn = `
                p { color: var(--color); }
                :root { --color: red; }
            `;
            const cssOut = transformCss(cssIn);
            const expectCss = 'p{color:red;}';

            expect(cssOut).to.equal(expectCss);
        });

        it('transforms chained :root variable', function() {
            const cssIn = `
                :root { --color1: var(--color2); }
                :root { --color2: red; }
                p { color: var(--color1); }
            `;
            const cssOut    = transformCss(cssIn);
            const expectCss = 'p{color:red;}';

            expect(cssOut).to.equal(expectCss);
        });

        it('transforms variable function with spaces, tabs, and new lines', function() {
            const cssIn = `
                :root { --color: red; }
                p {
                    color: var(
                        --color
                    );
                }
            `;
            const cssOut    = transformCss(cssIn);
            const expectCss = 'p{color:red;}';

            expect(cssOut).to.equal(expectCss);
        });

        it('transforms variable function in mixed property value', function() {
            const cssIn = `
                :root { --margin: 20px; }
                p { margin: 10px var(--margin); }
            `;
            const cssOut    = transformCss(cssIn);
            const expectCss = 'p{margin:10px 20px;}';

            expect(cssOut).to.equal(expectCss);
        });

        it('transforms variable function in calc function', function() {
            const cssIn = `
                :root { --margin: 20px; }
                p { margin: calc(var(--margin) * 2); }
            `;
            const cssOut    = transformCss(cssIn);
            const expectCss = 'p{margin:calc(20px * 2);}';

            expect(cssOut).to.equal(expectCss);
        });

        it('transforms variable function fallback', function() {
            const cssIn     = 'p { color: var(--fail, red); }';
            const cssOut    = transformCss(cssIn);
            const expectCss = 'p{color:red;}';

            expect(cssOut).to.equal(expectCss);
        });

        it('transforms variable function with color function fallback', function() {
            const cssIn     = `
                :root { --color: rgba(0, 0, 0, 0.5); }
                p { color: var(--color, rgba(255, 255, 255, 0.5)); }
            `;
            const cssOut    = transformCss(cssIn);
            const expectCss = 'p{color:rgba(0, 0, 0, 0.5);}';

            expect(cssOut).to.equal(expectCss);
        });

        it('transforms variable function with nested fallbacks', function() {
            const cssIn     = 'p { color: var(--fail1, var(--fail2, red)); }';
            const cssOut    = transformCss(cssIn);
            const expectCss = 'p{color:red;}';

            expect(cssOut).to.equal(expectCss);
        });
    });

    // Tests: Undefined
    // -------------------------------------------------------------------------
    describe('Undefined', function() {
        it('retains undefined custom properties', function() {
            const cssIn     = 'p { color: var(--fail); }';
            const cssOut    = transformCss(cssIn);
            const expectCss = 'p{color:var(--fail);}';

            expect(cssOut).to.equal(expectCss);
        });

        it('retains undefined custom properties with nested fallbacks', function() {
            const cssIn     = 'p { color: var(--fail1, var(--fail2, var(--fail3))); }';
            const cssOut    = transformCss(cssIn);
            const expectCss = 'p{color:var(--fail1, var(--fail2, var(--fail3)));}';

            expect(cssOut).to.equal(expectCss);
        });

        it('retains undefined custom properties in mixed property value', function() {
            const cssIn     = 'p { margin: 10px var(--fail1) var(--fail2) 20px; }';
            const cssOut    = transformCss(cssIn);
            const expectCss = 'p{margin:10px var(--fail1) var(--fail2) 20px;}';

            expect(cssOut).to.equal(expectCss);
        });

        it('handles undefined custom properties in calc function', function() {
            const cssIn     = 'p { margin: calc(var(--fail) * 2); }';
            const cssOut    = transformCss(cssIn);
            const expectCss = 'p{margin:calc(var(--fail) * 2);}';

            expect(cssOut).to.equal(expectCss);
        });
    });

    // Tests: Options
    // -------------------------------------------------------------------------
    describe('Options', function() {
        describe('allowMultiple', function() {
            it('false', function() {
                const cssIn = `
                    :root { --color: red; }
                    :root, .test { --color: blue; }
                    p { color: var(--color); }
                `;
                const cssOut    = transformCss(cssIn, { allowMultiple: false });
                const expectCss = ':root,.test{--color:blue;}p{color:red;}';

                expect(cssOut).to.equal(expectCss);
            });

            it('true (no collisions)', function() {
                const cssIn = `
                    :root, .test { --color: blue; }
                    p { color: var(--color); }
                `;
                const cssOut    = transformCss(cssIn, { allowMultiple: true });
                const expectCss = 'p{color:blue;}';

                expect(cssOut).to.equal(expectCss);
            });

            // The latest :root rule should apply globally
            it('true (with collisions)', function() {
                const cssIn = `
                    :root, .test1 { --color: red; }
                    :root, .test2 { --color: blue; }
                    p { color: var(--color); }
                `;
                const cssOut    = transformCss(cssIn, { allowMultiple: true });
                const expectCss = 'p{color:blue;}';

                expect(cssOut).to.equal(expectCss);
            });
        });

        describe('fixNestedCalc', function() {
            it('true (without vars)', function() {
                const cssIn = 'p { margin: calc(1px + calc(2px + calc(3px + 3px))); }';
                const cssOut    = transformCss(cssIn, {
                    fixNestedCalc: true,
                    onlyVars     : false
                }).replace(/\n/g, '');
                const expectCss = 'p{margin:calc(1px + (2px + (3px + 3px)));}';

                expect(cssOut).to.equal(expectCss);
            });

            it('true (with vars)', function() {
                const cssIn = `
                    :root {
                        --a: calc(1 + var(--b));
                        --b: calc(2 + var(--c));
                        --c: calc(3 + var(--d));
                        --d: 3;
                    }
                    p {
                        margin: 1px var(--a) 2px;
                    }
                `;
                const cssOut    = transformCss(cssIn, { fixNestedCalc: true }).replace(/\n/g, '');
                const expectCss = 'p{margin:1px calc(1 + (2 + (3 + 3))) 2px;}';

                expect(cssOut).to.equal(expectCss);
            });

            it('false (without vars)', function() {
                const cssIn = 'p { margin: calc(1px + calc(2px + calc(3px + 3px))); }';
                const cssOut    = transformCss(cssIn, {
                    fixNestedCalc: false,
                    onlyVars     : false
                }).replace(/\n/g, '');
                const expectCss = 'p{margin:calc(1px + calc(2px + calc(3px + 3px)));}';

                expect(cssOut).to.equal(expectCss);
            });
        });

        // The 'onlyVars' option is used in this module as well as the index.js
        // module. Testing how this options is handled by each module is handled
        // in each module's test file.
        describe('onlyVars', function() {
            it('true (declarations)', function() {
                const cssIn = `
                    /* Comment */
                    :root { --color: red; }
                    p { color: var(--color); margin: 20px; }
                    p { color: green; }
                `;
                const cssOut    = transformCss(cssIn, { onlyVars: true }).replace(/\n/g, '');
                const expectCss = 'p{color:red;}';

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
                    @font-face {
                        font-family: "test1";
                        font-weight: normal;
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
                    @keyframes test1 {
                        from { color: red; }
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
                    @media screen {
                        p { color: red; }
                    }
                `.replace(/\n|\s/g, '').replace(/@media/, '@media ');

                expect(cssOut).to.equal(expectCss);
            });
        });

        describe('persist', function() {
            it('false (default)', function() {
                const cssIn = `
                    :root { --color: red; }
                    p { color: var(--color); }
                `;
                const cssOut    = [
                    transformCss(cssIn, { persist: false }).replace(/\n/g, ''),
                    transformCss(cssIn, { persist: false, variables: { 'color': 'green'} }).replace(/\n/g, ''),
                    transformCss(cssIn, { persist: false }).replace(/\n/g, '')
                ];
                const expectCss = [
                    'p{color:red;}',
                    'p{color:green;}'
                ];

                expect(cssOut[0], 'Pass 1').to.equal(expectCss[0]);
                expect(cssOut[1], 'Pass 2').to.equal(expectCss[1]);
                expect(cssOut[2], 'Pass 3').to.equal(expectCss[0]);
            });

            it('true', function() {
                const cssIn = `
                    :root {
                        --color1: red;
                        --color2: red;
                    }
                    p.one {
                        color: var(--color1);
                    }
                    p.two {
                        color: var(--color2);
                    }
                `;
                const cssOut    = [
                    transformCss(cssIn, { persist: true }).replace(/\n/g, ''),
                    transformCss(cssIn, { persist: true, variables: { 'color1': 'green'} }).replace(/\n/g, ''),
                    transformCss(cssIn, { persist: true, variables: { 'color2': 'green'} }).replace(/\n/g, '')
                ];
                const expectCss = [
                    'p.one{color:red;}p.two{color:red;}',
                    'p.one{color:green;}p.two{color:red;}',
                    'p.one{color:green;}p.two{color:green;}'
                ];

                expect(cssOut[0], 'Pass 1').to.equal(expectCss[0]);
                expect(cssOut[1], 'Pass 2').to.equal(expectCss[1]);
                expect(cssOut[2], 'Pass 3').to.equal(expectCss[2]);
            });
        });

        describe('preserve', function() {
            it('true (default)', function() {
                const cssIn     = `
                    :root { --color: red; }
                    p { color: var(--color); }
                `;
                const cssOut    = transformCss(cssIn, { preserve: true }).replace(/\n/g, '');
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
                    variables: { color2: 'green' }
                }).replace(/\n/g, '');
                const expectCss = 'p{color:red;}p{color:green;}';

                expect(cssOut).to.equal(expectCss);
            });

            it('Malformed single -', function() {
                const cssIn     = ':root{--color1:red}p{color:var(--color1)}p{color:var(--color2)}';
                const cssOut    = transformCss(cssIn, {
                    variables: { '-color2': 'green' }
                }).replace(/\n/g, '');
                const expectCss = 'p{color:red;}p{color:green;}';

                expect(cssOut).to.equal(expectCss);
            });

            it('Leading --', function() {
                const cssIn     = ':root{--color1:red}p{color:var(--color1)}p{color:var(--color2)}';
                const cssOut    = transformCss(cssIn, {
                    variables: { '--color2': 'green' }
                }).replace(/\n/g, '');
                const expectCss = 'p{color:red;}p{color:green;}';

                expect(cssOut).to.equal(expectCss);
            });

            it('Handle false(y) values', function() {
                const cssIn     = ':root{--var1:true;--var2:true;--var3:true;--var4:true}p{var1:var(--var1);var2:var(--var2);var3:var(--var3);var4:var(--fail, false);}';
                const cssOut    = transformCss(cssIn, {
                    variables: {
                        '--var1': 0,
                        '--var2': '0',
                        '--var3': false,
                        '--var4': 'false'
                    }
                }).replace(/\n/g, '');
                const expectCss = 'p{var1:0;var2:0;var3:false;var4:false;}';

                expect(cssOut).to.equal(expectCss);
            });

            it('Override existing variable', function() {
                const cssIn     = ':root{--color1:red}p{color:var(--color1)}p{color:var(--color2)}';
                const cssOut    = transformCss(cssIn, {
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

            transformCss('p { color: var(--fail; }', {
                onWarning() {
                    onWarningCount++;
                }
            });

            transformCss('p { color: var(   ); }', {
                onWarning() {
                    onWarningCount++;
                }
            });

            expect(onWarningCount).to.equal(3);
        });
    });
});
