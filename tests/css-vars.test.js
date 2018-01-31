// Dependencies
// =============================================================================
import createElms from 'create-elms';
import cssVars    from '../src/index';
import { expect } from 'chai';


// Constants & Variables
// =============================================================================
const hasNativeSupport = window.CSS && window.CSS.supports && window.CSS.supports('(--a: 0)');


// Helpers
// =============================================================================
function createElmsWrap(elmData, sharedOptions = {}) {
    sharedOptions = Object.assign({}, {
        attr    : Object.assign({ 'data-test': true }, sharedOptions.attr || {}),
        appendTo: 'head'
    }, sharedOptions);

    return createElms(elmData, sharedOptions);
}


// Suite
// =============================================================================
describe('css-vars', function() {
    // Hooks
    // -------------------------------------------------------------------------
    // Remove <link> and <style> elements added for each test
    beforeEach(function() {
        const testNodes = document.querySelectorAll('[data-test]');

        for (let i = 0; i < testNodes.length; i++) {
            testNodes[i].parentNode.removeChild(testNodes[i]);
        }
    });

    // Tests: Stylesheets
    // -------------------------------------------------------------------------
    describe('Stylesheets', function() {
        it('handles <style> elements', function() {
            const styleCss  = `
                :root { --color: red; }
                p { color: var(--color); }
            `;
            const expectCss = 'p{color:red;}';

            createElmsWrap({ tag: 'style', text: styleCss });

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                preserve  : false,
                onComplete(cssText, styleNode) {
                    expect(cssText).to.equal(expectCss);
                }
            });
        });

        it('handles <link> elements', function(done) {
            const linkUrl1  = '/base/tests/fixtures/test-declaration.css';
            const linkUrl2  = '/base/tests/fixtures/test-value.css';
            const expectCss = 'p{color:red;}';

            createElmsWrap([
                { tag: 'link', attr: { rel: 'stylesheet', href: linkUrl1 } },
                { tag: 'link', attr: { rel: 'stylesheet', href: linkUrl2 } }
            ]);

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                preserve  : false,
                onComplete(cssText, styleNode) {
                    expect(cssText).to.equal(expectCss);
                    done();
                }
            });
        });

        it('handles <link> and <style> elements', function(done) {
            const linkUrl1  = '/base/tests/fixtures/test-declaration.css';
            const linkUrl2  = '/base/tests/fixtures/test-value.css';
            const styleCss  = `
                @import url("${linkUrl2}");
                @import url("${linkUrl1}");
                p { color: var(--color); }
            `;
            const expectCss = 'p{color:red;}p{color:red;}p{color:red;}';

            createElmsWrap([
                { tag: 'link', attr: { rel: 'stylesheet', href: linkUrl1 } },
                { tag: 'link', attr: { rel: 'stylesheet', href: linkUrl2 } },
                { tag: 'style', text: styleCss }
            ]);

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                preserve  : false,
                onComplete(cssText, styleNode) {
                    expect(cssText).to.equal(expectCss);
                    done();
                }
            });
        });
    });

    // Tests: Options
    // -------------------------------------------------------------------------
    describe('Options', function() {
        describe('onlyLegacy', function() {
            it('true', function() {
                const styleCss  = ':root{--color:red;}p{color:var(--color);}';
                const expectCss = hasNativeSupport ? '' : 'p{color:red;}';

                createElmsWrap({ tag: 'style', text: styleCss });

                cssVars({
                    include   : '[data-test]',
                    onlyLegacy: true,
                    preserve  : false,
                    onComplete(cssText, styleNode) {
                        expect(cssText).to.equal(expectCss);
                    }
                });
            });
        });

        // The 'onlyVars' option is used in this module as well as the
        // transfrom-css.js module. Testing how this options is handled by each
        // module is handled in each module's test file.
        describe('onlyVars', function() {
            it('true - filters CSS data', function() {
                const expectCss = 'p{color:red;}';

                createElmsWrap([
                    { tag: 'style', text: ':root { --color: red; }' },
                    { tag: 'style', text: 'p { color: var(--color); }' },
                    { tag: 'style', text: 'p { color: green; }' }
                ]);

                cssVars({
                    include   : '[data-test]',
                    onlyLegacy: false,
                    preserve  : false,
                    onComplete(cssText, styleNode) {
                        expect(cssText).to.equal(expectCss);
                    }
                });
            });

            it('true - filters CSS declarations (passed to transform-css)', function() {
                const styleCss = `
                    :root {--color: red;}
                    p { color: var(--color); }
                    p { color: green; }
                `;
                const expectCss = 'p{color:red;}';

                createElmsWrap({ tag: 'style', text: styleCss });

                cssVars({
                    include   : '[data-test]',
                    onlyLegacy: false,
                    preserve  : false,
                    onComplete(cssText, styleNode) {
                        expect(cssText).to.equal(expectCss);
                    }
                });
            });
        });

        describe('preserve', function() {
            it('true (passed to transform-css)', function() {
                const styleCss  = ':root{--color:red;}p{color:var(--color);}';
                const expectCss = ':root{--color:red;}p{color:red;color:var(--color);}';

                createElmsWrap({ tag: 'style', text: styleCss });

                cssVars({
                    include   : '[data-test]',
                    onlyLegacy: false,
                    preserve  : true,
                    onComplete(cssText, styleNode) {
                        expect(cssText).to.equal(expectCss);
                    }
                });
            });

            it('false (passed to transform-css)', function() {
                const styleCss  = ':root{--color:red;}p{color:var(--color);}';
                const expectCss = 'p{color:red;}';

                createElmsWrap({ tag: 'style', text: styleCss });

                cssVars({
                    include   : '[data-test]',
                    onlyLegacy: false,
                    preserve  : false,
                    onComplete(cssText, styleNode) {
                        expect(cssText).to.equal(expectCss);
                    }
                });
            });
        });

        describe('updateDOM', function() {
            it('true (appends to <head>)', function() {
                const elm = createElmsWrap({
                    tag     : 'style',
                    text    : ':root{--color:red;}p{color:var(--color);}',
                    appendTo: 'head'
                })[0];

                cssVars({
                    include   : '[data-test]',
                    onlyLegacy: false,
                    updateDOM : true,
                    onComplete(cssText, styleNode) {
                        expect(styleNode.parentNode).to.equal(elm.parentNode);
                    }
                });
            });

            it('true (appends to <body>)', function() {
                const elm = createElmsWrap({
                    tag     : 'style',
                    text    : ':root{--color:red;}p{color:var(--color);}',
                    appendTo: 'body'
                })[0];

                cssVars({
                    include   : '[data-test]',
                    onlyLegacy: false,
                    updateDOM : true,
                    onComplete(cssText, styleNode) {
                        expect(styleNode.parentNode).to.equal(elm.parentNode);
                    }
                });
            });

            it('false (does not append <style>)', function() {
                createElmsWrap({
                    tag     : 'style',
                    text    : ':root{--color:red;}p{color:var(--color);}',
                    appendTo: 'head'
                });

                cssVars({
                    include   : '[data-test]',
                    onlyLegacy: false,
                    updateDOM : false,
                    onComplete(cssText, styleNode) {
                        expect(styleNode).to.equal(null);
                    }
                });
            });
        });

        describe('variables', function() {
            it('updates values via generated CSS (passed to transform-css)', function() {
                const styleCss  = `
                    :root{ --color1: black; }
                    p { color: var(--color1); }
                    p { color: var(--color2); }
                    p { color: var(--color3); }
                    p { color: var(--color4); }
                `;
                const expectCss = 'p{color:red;}p{color:green;}p{color:blue;}p{color:purple;}';

                createElmsWrap({ tag: 'style', text: styleCss });

                cssVars({
                    include   : '[data-test]',
                    onlyLegacy: false,
                    preserve  : false,
                    variables : {
                        color2    : 'green',  // No leading --
                        '-color3' : 'blue',   // Malformed
                        '--color4': 'purple', // Leading --
                        '--color1': 'red'     // Override
                    },
                    onComplete(cssText, styleNode) {
                        expect(cssText).to.equal(expectCss);
                    }
                });
            });

            if (hasNativeSupport) {
                it('updates values via native setProperty() method', function() {
                    const testElms = createElmsWrap([
                        '<p style="color: var(--color1);"></p>',
                        '<p style="color: var(--color2);"></p>',
                        '<p style="color: var(--color3);"></p>'
                    ]);

                    cssVars({
                        variables: {
                            color1    : 'red',   // No leading --
                            '-color2' : 'green', // Malformed
                            '--color3': 'blue'   // Leading --
                        }
                    });

                    expect(window.getComputedStyle(testElms[0]).color.replace(/\s/g,'')).to.equal('rgb(255,0,0)');
                    expect(window.getComputedStyle(testElms[1]).color.replace(/\s/g,'')).to.equal('rgb(0,128,0)');
                    expect(window.getComputedStyle(testElms[2]).color.replace(/\s/g,'')).to.equal('rgb(0,0,255)');
                });
            }
        });
    });

    // Tests: Callbacks
    // -------------------------------------------------------------------------
    describe('Callbacks', function() {
        it('triggers onError callback with proper arguments', function(done) {
            const linkUrl  = '/base/tests/fixtures/test-onerror.css';
            const styleCss = ':root { --error: red;';
            const elms     = createElmsWrap([
                { tag: 'link', attr: { rel: 'stylesheet', href: 'fail.css' } },
                { tag: 'link', attr: { rel: 'stylesheet', href: linkUrl } },
                { tag: 'style', text: styleCss }
            ]);

            const onErrorMsgs  = [];
            const onErrorNodes = [];
            let   onErrorCount = 0;
            let   onErrorXHR;
            let   onErrorURL;

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                silent    : true, // remove to display console error messages
                onError(errorMsg, node, xhr, url) {
                    onErrorCount++;
                    onErrorMsgs.push(errorMsg);
                    onErrorNodes.push(node);

                    if (xhr) {
                        onErrorXHR = xhr;
                        onErrorURL = url;
                    }
                },
                onComplete(cssText, styleNode) {
                    expect(onErrorCount, 'onError count').to.equal(elms.length);
                    expect(onErrorMsgs.filter(msg => msg.toLowerCase().indexOf('error') > -1), 'onError message').to.have.length(elms.length);
                    expect(onErrorNodes, 'onError nodes').to.include.members(elms);
                    expect(onErrorXHR.status, 'onError XHR').to.equal(404);
                    expect(onErrorURL, 'onError URL').to.include('fail.css');
                    done();
                }
            });
        });

        it('triggers onSuccess callback with proper arguments', function(done) {
            const styleCss  = ':root { --color: red; } p { color: var(--color); }';
            const expectCss = ':root{--color:red;}p{color:red;color:var(--color);}';

            let onSuccessCssText;

            createElmsWrap({ tag: 'style', text: styleCss });

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                onSuccess(cssText) {
                    onSuccessCssText = cssText;
                },
                onComplete(cssText, styleNode) {
                    expect(onSuccessCssText).to.equal(expectCss);
                    done();
                }
            });
        });

        it('triggers onWarning callback with proper arguments', function(done) {
            const styleElms = createElmsWrap([
                { tag: 'style', text: 'p { color: var(--fail); }' }
            ]);

            let onWarningCount = 0;
            let onWarningMsg;

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                silent    : true, // remove to display console error messages
                onWarning(warningMsg) {
                    onWarningCount++;
                    onWarningMsg = warningMsg;
                },
                onComplete(cssText, styleNode) {
                    expect(onWarningCount, 'onWarning count').to.equal(styleElms.length);
                    expect(onWarningMsg.toLowerCase().indexOf('warning') > -1, 'onWarning message').to.be.true;
                    done();
                }
            });
        });

        it('triggers onComplete callback with proper arguments', function(done) {
            const styleCss  = ':root { --color: red; } p { color: var(--color); }';
            const expectCss = ':root{--color:red;}p{color:red;color:var(--color);}';

            createElmsWrap({ tag: 'style', text: styleCss });

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                onComplete(cssText, styleNode) {
                    expect(cssText).to.equal(expectCss);
                    done();
                }
            });
        });
    });

    // Tests: Updates
    // -------------------------------------------------------------------------
    describe('Updates', function() {
        it('updates properly when called multiple times', function() {
            const expectCss = [
                'p{color:red;}',
                'p{color:green;}',
                'p{color:green;}div{color:green;}',
                'p{color:blue;}div{color:blue;}',
            ];

            createElmsWrap({ tag: 'style', text: ':root { --color: red; } p { color: var(--color); }' });

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                preserve  : false,
                onComplete(cssText, styleNode) {
                    const styleNameParentTag = styleNode.parentNode.tagName.toLowerCase();

                    expect(styleNameParentTag, 'appended to <head>').to.equal('head');
                    expect(cssText).to.equal(expectCss[0]);
                }
            });

            createElmsWrap({ tag: 'style', text: ':root { --color: green; }' });

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                preserve  : false,
                onComplete(cssText, styleNode) {
                    const styleElms    = document.querySelectorAll('head style');
                    const lastStyleElm = styleElms[styleElms.length - 1];

                    expect(styleNode, 'appended again to make last <style> node').to.equal(lastStyleElm);
                    expect(cssText).to.equal(expectCss[1]);
                }
            });

            createElmsWrap({ tag: 'style', text: 'div { color: var(--color); }', appendTo: 'body' });

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                preserve  : false,
                onComplete(cssText, styleNode) {
                    const styleNameParentTag = styleNode.parentNode.tagName.toLowerCase();

                    expect(styleNameParentTag, 'appended to <body>').to.equal('body');
                    expect(cssText).to.equal(expectCss[2]);
                }
            });

            cssVars({
                exclude   : ':not([data-test])',
                onlyLegacy: false,
                preserve  : false,
                variables : { color: 'blue' },
                onComplete(cssText, styleNode) {
                    expect(cssText).to.equal(expectCss[3]);
                }
            });
        });
    });
});
