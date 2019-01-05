// Dependencies
// =============================================================================
import parseCss   from '../src/parse-css';
import { expect } from 'chai';


// Suite
// =============================================================================
describe('parse-css', function() {
    const fixtures = window.__FIXTURES__;

    // Tests: Parsing
    // -------------------------------------------------------------------------
    describe('Parsing', function() {
        it('parses CSS to an AST (object)', async function() {
            const css = fixtures['test-parse.css'];
            const ast = parseCss(css);

            expect(ast instanceof Object).to.be.true;
            expect(ast).to.have.property('type', 'stylesheet');
        });
    });

    // Tests: Errors
    // -------------------------------------------------------------------------
    describe('Errors', function() {
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
            const css = '{ color: red; }';
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

    // Tests: Options
    // -------------------------------------------------------------------------
    describe('Options', function() {
        describe('onlyVars', function() {
            const cssVarDecl = `
                :root {
                    --color: red;
                    background: white;
                }
            `;
            const cssVarFunc = `
                p {
                    color: var(--color);
                    background: white;
                }
            `;

            it('false (keeps all :root declarations)', function() {
                const ast = parseCss(cssVarDecl);

                expect(ast.stylesheet.rules[0].declarations).to.have.lengthOf(2);
            });

            it('false (keeps all declarations)', function() {
                const ast = parseCss(cssVarFunc);

                expect(ast.stylesheet.rules[0].declarations).to.have.lengthOf(2);
            });

            it('true (keeps only :root variable declaration)', function() {
                const ast = parseCss(cssVarDecl, {
                    onlyVars: true
                });

                expect(ast.stylesheet.rules[0].declarations).to.have.lengthOf(1);
            });

            it('true (keeps only variable function declarations)', function() {
                const ast = parseCss(cssVarFunc, {
                    onlyVars: true
                });

                expect(ast.stylesheet.rules[0].declarations).to.have.lengthOf(1);
            });

            it('true (keeps all @font-face declarations)', function() {
                const css = `
                    @font-face {
                        test: var(--test);
                        font-family: system;
                        font-style: normal;
                    }
                `;
                const ast = parseCss(css, {
                    onlyVars: true
                });

                expect(ast.stylesheet.rules[0].declarations).to.have.lengthOf(3);
            });

            it('true (remove @font-face rule)', function() {
                const css = `
                    @font-face {
                        font-family: system;
                        font-style: normal;
                    }
                `;
                const ast = parseCss(css, {
                    onlyVars: true
                });

                expect(ast.stylesheet.rules).to.have.lengthOf(0);
            });

            it('true (keeps all @keyframes declarations)', function() {
                const css = `
                    @keyframes slidein {
                        from {
                            test: var(--test);
                            height: 50%;
                            width: 50%;
                        }
                        to {
                            height: 100%;
                            width: 100%;
                        }
                    }
                `;
                const ast = parseCss(css, {
                    onlyVars: true
                });

                expect(ast.stylesheet.rules[0].keyframes[0].declarations).to.have.lengthOf(3);
                expect(ast.stylesheet.rules[0].keyframes[1].declarations).to.have.lengthOf(2);
            });

            it('true (remove @keyframes rule)', function() {
                const css = `
                    @keyframes slidein {
                        from {
                            height: 50%;
                            width: 50%;
                        }
                        to {
                            height: 100%;
                            width: 100%;
                        }
                    }
                `;
                const ast = parseCss(css, {
                    onlyVars: true
                });

                expect(ast.stylesheet.rules).to.have.lengthOf(0);
            });

            it('true (keeps all @media declarations)', function() {
                const css = `
                    @media screen {
                        p {
                            color: var(--color);
                            background: white;
                        }
                    }
                `;
                const ast = parseCss(css, {
                    onlyVars: true
                });

                expect(ast.stylesheet.rules[0].rules[0].declarations).to.have.lengthOf(1);
            });

            it('true (remove @media rule)', function() {
                const css = `
                    @media screen {
                        p {
                            background: white;
                        }
                    }
                `;
                const ast = parseCss(css, {
                    onlyVars: true
                });

                expect(ast.stylesheet.rules).to.have.lengthOf(0);
            });

            it('true (remove unrecognized @ rule)', function() {
                const css = `
                    @-ms-viewport {
                        background: white;
                    }
                `;
                const ast = parseCss(css, {
                    onlyVars: true
                });

                expect(ast.stylesheet.rules).to.have.lengthOf(0);
            });
        });

        describe('removeComments', function() {
            const css = `
                /* COMMENT1 */
                p {
                    color: red;
                }
                /* COMMENT2 */
            `;

            it('false', function() {
                const ast = parseCss(css);

                expect(ast.stylesheet.rules).to.have.lengthOf(3);
            });

            it('true', function() {
                const ast = parseCss(css, {
                    removeComments: true
                });

                expect(ast.stylesheet.rules).to.have.lengthOf(1);
            });
        });
    });

    // Tests: Performance
    // -------------------------------------------------------------------------
    // describe.only('Performance', function() {
    //     it('Handles large block of CSS using onlyVars option', function() {
    //         const css = `
    //             :root { --color: red; }
    //             p { color: var(--color); }
    //             ${'div { color: red; }'.repeat(10000)}
    //         `;

    //         console.time('Performance Test');
    //         const ast = parseCss(css, {
    //             onlyVars: true
    //         });
    //         console.timeEnd('Performance Test');
    //         console.log('CSS:', css.length);
    //         console.log('rules:', ast.stylesheet.rules.length);

    //         expect(ast instanceof Object).to.be.true;
    //     });
    // });
});
