// Dependencies
// =============================================================================
import chai       from 'chai';
import createElms from 'create-elms';
import cssVars    from '../src/index';
import { expect } from 'chai';

chai.use(require('chai-colors'));


// Constants & Variables
// =============================================================================
const bodyComputedStyle        = getComputedStyle(document.body);
const hasAnimationSupport      = bodyComputedStyle.animationName || bodyComputedStyle.mozAnimationName || bodyComputedStyle.webkitAnimationName;
const hasCustomPropertySupport = window.CSS && window.CSS.supports && window.CSS.supports('(--a: 0)');


// Helpers
// =============================================================================
function createElmsWrap(elmData, sharedOptions = {}) {
    const isHeadElm = elmData.tag && ['link', 'style'].indexOf(elmData.tag) !== -1;

    sharedOptions = Object.assign({}, {
        attr    : Object.assign({ 'data-test': true }, sharedOptions.attr || {}),
        appendTo: isHeadElm ? 'head' : 'body'
    }, sharedOptions);

    return createElms(elmData, sharedOptions);
}


// Component
// =============================================================================
class TestComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style data-test-shadow>
                .test-component {
                    background: red;
                    background: var(--test-component-background, red);
                    color: white;
                }
            </style>

            <p class="test-component">${this.getAttribute('data-text')}</p>
        `;
    }
}

if ('customElements' in window) {
    window.customElements.define('test-component', TestComponent);

    // createElms({ tag: 'style', text: ':root { --test-component-background: green; }', appendTo: 'head' });
    // createElms([
    //     { tag: 'test-component', attr: { 'data-text': 'Custom element' }},
    //     { tag: 'p', text: 'Standard element' }
    // ], { appendTo: 'body' });
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
                onComplete(cssText, styleNode) {
                    expect(cssText).to.equal(expectCss);
                    done();
                }
            });
        });

        it('handles replacement of CSS placeholders', function() {
            const styleCss = `
                :root { --color: red; }
                p { color: var(--color); }
            `;
            const expectCss = `p{color:red;}${'p{color:blue;}'.repeat(5)}`;

            createElmsWrap([
                { tag: 'style', text: styleCss },
                { tag: 'style', text: 'p { color: blue; }' },
                { tag: 'style', text: 'p { color: blue; }' },
                { tag: 'style', text: 'p { color: blue; }' },
                { tag: 'style', text: 'p { color: blue; }' },
                { tag: 'style', text: 'p { color: blue; }' }
            ]);

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                onComplete(cssText, styleNode) {
                    expect(cssText.replace(/\s/g,'')).to.equal(expectCss);
                }
            });
        });

        it('handles no matching elements', function() {
            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                onComplete(cssText, styleNode) {
                    expect(cssText).to.equal('');
                    expect(styleNode).to.equal(null);
                }
            });
        });
    });

    // Tests: Options
    // -------------------------------------------------------------------------
    describe('Options', function() {
        if ('customElements' in window) {
            describe('rootElement', function() {
                it('handles Element.shadowRoot <style> elements', function() {
                    const customElm  = createElmsWrap({ tag: 'test-component', attr: { 'data-text': 'Custom Element' } })[0];
                    const shadowRoot = customElm.shadowRoot;
                    const expectCss  = '.test-component{background:red;background:green;color:white;}';

                    createElmsWrap({ tag: 'style', text: ':root { --test-component-background: green; }' });

                    cssVars({
                        rootElement: shadowRoot,
                        onlyLegacy : false,
                        updateDOM  : false,
                        onComplete(cssText, styleNode, variablesObject) {
                            expect(cssText).to.equal(expectCss);

                            // Prevent errors on proceeding tests
                            delete variablesObject['--test-component-background'];
                        }
                    });
                });

                it('handles Element.shadowRoot using options.variables', function() {
                    const customElm  = createElmsWrap({ tag: 'test-component', attr: { 'data-text': 'Custom Element' } })[0];
                    const shadowRoot = customElm.shadowRoot;
                    const expectCss  = '.test-component{background:red;background:green;color:white;}';

                    cssVars({
                        rootElement: shadowRoot,
                        onlyLegacy : false,
                        updateDOM  : false,
                        variables  : {
                            '--test-component-background': 'green'
                        },
                        onComplete(cssText, styleNode, variablesObject) {
                            expect(cssText).to.equal(expectCss);
                        }
                    });
                });
            });
        }

        describe('onlyLegacy', function() {
            it('true', function() {
                const styleCss  = ':root{--color:red;}p{color:var(--color);}';
                const expectCss = hasCustomPropertySupport ? '' : 'p{color:red;}';

                createElmsWrap({ tag: 'style', text: styleCss });

                cssVars({
                    include   : '[data-test]',
                    onlyLegacy: true,
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
                    onlyVars  : true,
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
                    onlyVars  : true,
                    onComplete(cssText, styleNode) {
                        expect(cssText).to.equal(expectCss);
                    }
                });
            });

            it('false - includes all CSS declarations', function() {
                const styleCss = `
                    :root {--color: red;}
                    p { color: var(--color); }
                    p { color: green; }
                `;
                const expectCss = 'p{color:red;}p{color:green;}';

                createElmsWrap({ tag: 'style', text: styleCss });

                cssVars({
                    include   : '[data-test]',
                    onlyLegacy: false,
                    onlyVars  : false,
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

        if ('customElements' in window) {
            describe('shadowDOM', function() {
                it('true (handles Element.shadowRoot <style> elements)', function() {
                    const styleCss  = ':root { --test-component-background: green; }';
                    const expectCss = '.test-component{background:red;background:green;color:white;}';
                    const testElms  = createElmsWrap([
                        { tag: 'test-component', attr: { 'data-text': 'Custom Element 1' } },
                        { tag: 'test-component', attr: { 'data-text': 'Custom Element 2' } }
                    ]);

                    let onCompleteCount = 0;

                    createElmsWrap({ tag: 'style', text: styleCss });

                    cssVars({
                        include   : '[data-test],[data-test-shadow]',
                        onlyLegacy: false,
                        shadowDOM : true,
                        onComplete(cssText, styleNode, variablesObject) {
                            onCompleteCount++;

                            // Test for cssText since test <style> elm with only
                            // :root rule will also trigger callback
                            if (cssText) {
                                expect(cssText).to.equal(expectCss);
                            }
                        }
                    });

                    expect(onCompleteCount).to.equal(testElms.length + 1); // +1 = document
                });

                it('true (handles nested Element.shadowRoot <style> elements)', function() {
                    const styleCss  = ':root { --test-component-background: green; }';
                    const expectCss = '.test-component{background:red;background:green;color:white;}';
                    const testElm1  = createElmsWrap({ tag: 'test-component', attr: { 'data-text': 'Custom Element 1' } })[0];

                    let onCompleteCount = 0;

                    createElmsWrap([
                        { tag: 'style', text: styleCss },
                        { tag: 'test-component', attr: { 'data-text': 'Custom Element 2' }, appendTo: testElm1 }
                    ]);

                    cssVars({
                        rootElement: testElm1,
                        include   : '[data-test],[data-test-shadow]',
                        onlyLegacy: false,
                        shadowDOM : true,
                        onComplete(cssText, styleNode, variablesObject) {
                            if (cssText) {
                                onCompleteCount++;
                                expect(cssText).to.equal(expectCss);
                            }
                        }
                    });

                    expect(onCompleteCount).to.equal(2);
                });

                it('false (ignores nested Element.shadowRoot <style> elements)', function() {
                    const styleCss  = ':root { --test-component-background: green; }';
                    const expectCss = '.test-component{background:red;background:green;color:white;}';
                    const testElm1  = createElmsWrap({ tag: 'test-component', attr: { 'data-text': 'Custom Element 1' } })[0];
                    const testElm2  = createElmsWrap({ tag: 'test-component', attr: { 'data-text': 'Custom Element 2' }, appendTo: testElm1 })[0];

                    createElmsWrap({ tag: 'style', text: styleCss });

                    cssVars({
                        rootElement: testElm1.shadowRoot,
                        include   : '[data-test],[data-test-shadow]',
                        onlyLegacy: false,
                        shadowDOM : false,
                        onComplete(cssText, styleNode, variablesObject) {
                            expect(styleNode.parentNode).to.equal(this.rootElement);
                            expect(cssText).to.equal(expectCss);
                        }
                    });

                    expect(testElm2.shadowRoot.querySelector('style[id]')).to.equal(null);
                });
            });
        }

        describe('updateDOM', function() {
            it('true (appends <style> after last processed element in <head>)', function() {
                const elm = createElmsWrap({
                    tag     : 'style',
                    text    : ':root{--color:red;}p{color:var(--color);}',
                    appendTo: 'head'
                })[0];

                // Not processed by cssVars (used to test insert location)
                const skipElm = createElms({
                    tag     : 'style',
                    text    : ':root{--skipped:true;}',
                    appendTo: 'body'
                })[0];

                cssVars({
                    include   : '[data-test]',
                    onlyLegacy: false,
                    updateDOM : true,
                    onComplete(cssText, styleNode) {
                        const styleElms = Array.from(document.querySelectorAll('style'));
                        const isAfterLastProcessedElm = elm.nextSibling === styleNode;
                        const isBeforeSkipElm = styleElms.indexOf(styleNode) < styleElms.indexOf(skipElm);

                        expect(isAfterLastProcessedElm).to.be.true;
                        expect(isBeforeSkipElm).to.be.true;

                        // Remove skipElm
                        skipElm.parentNode.removeChild(skipElm);
                    }
                });
            });

            it('true (appends <style> after last processed element in <body>)', function() {
                const elm = createElmsWrap({
                    tag     : 'style',
                    text    : ':root{--color:red;}p{color:var(--color);}',
                    appendTo: 'body'
                })[0];

                // Not processed by cssVars (used to test insert location)
                const skipElm = createElms({
                    tag     : 'style',
                    text    : ':root{--skipped:true;}',
                    appendTo: 'body'
                })[0];

                cssVars({
                    include   : '[data-test]',
                    onlyLegacy: false,
                    updateDOM : true,
                    onComplete(cssText, styleNode) {
                        const styleElms = Array.from(document.querySelectorAll('style'));
                        const isAfterLastProcessedElm = elm.nextSibling === styleNode;
                        const isBeforeSkipElm = styleElms.indexOf(styleNode) < styleElms.indexOf(skipElm);

                        expect(isAfterLastProcessedElm).to.be.true;
                        expect(isBeforeSkipElm).to.be.true;

                        // Remove skipElm
                        skipElm.parentNode.removeChild(skipElm);
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

        describe('updateURLs', function() {
            it('true - updates relative url(...) paths to absolute URLs', function(done) {
                const baseUrl   = location.href.replace(/\/(?:context|debug).html/, '');
                const styleCss  = '@import "/base/tests/fixtures/test-urls.css";';
                const expectCss = `
                    p {
                        background: url(${baseUrl}/base/tests/fixtures/a/image.jpg);
                    }

                    p {
                        background: url(${baseUrl}/base/tests/fixtures/a/b/image.jpg);
                    }

                    p {
                        color: red;
                        background: url(${baseUrl}/base/tests/fixtures/image.jpg);
                        background: url('${baseUrl}/base/tests/fixtures/image.jpg');
                        background: url("${baseUrl}/base/tests/fixtures/image.jpg");
                        background: url(${baseUrl}/base/tests/fixtures/image1.jpg) url('${baseUrl}/base/tests/fixtures/image2.jpg') url("${baseUrl}/base/tests/fixtures/image3.jpg");
                        background: url(data:image/gif;base64,IMAGEDATA);
                    }
                `.replace(/\n|\s/g, '');

                createElmsWrap({ tag: 'style', text: styleCss });

                cssVars({
                    include   : '[data-test]',
                    onlyLegacy: false,
                    updateURLs: true,
                    onComplete(cssText, styleNode) {
                        expect(cssText.replace(/\n|\s/g, '')).to.equal(expectCss);
                        done();
                    }
                });
            });

            it('false - does not update relative url(...) paths', function() {
                const styleCss  = 'p{background:url(image.png);}';
                const expectCss = styleCss;

                createElmsWrap({ tag: 'style', text: styleCss });

                cssVars({
                    include   : '[data-test]',
                    onlyLegacy: false,
                    updateURLs: false,
                    onComplete(cssText, styleNode) {
                        expect(cssText).to.equal(expectCss);
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

            if (hasCustomPropertySupport) {
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

                    expect(getComputedStyle(testElms[0]).color).to.be.colored('red');
                    expect(getComputedStyle(testElms[1]).color).to.be.colored('green');
                    expect(getComputedStyle(testElms[2]).color).to.be.colored('blue');
                });
            }
        });

        if ('MutationObserver' in window) {
            describe('watch', function() {
                it('true', function(done) {
                    const styleCss  = ':root{--color:red;}body{color:var(--color);}';

                    cssVars({
                        include   : '[data-test]',
                        onlyLegacy: false,
                        watch     : true
                    });

                    createElmsWrap({ tag: 'style', text: styleCss });

                    setTimeout(function() {
                        expect(getComputedStyle(document.body).color).to.be.colored('red');
                        done();
                    }, 100);
                });
            });
        }
    });

    // Tests: Callbacks
    // -------------------------------------------------------------------------
    describe('Callbacks', function() {
        it('triggers onBeforeSend callback on each request with proper arguments', function(done) {
            let onBeforeSendCount = 0;

            createElmsWrap([
                { tag: 'link', attr: { rel: 'stylesheet', href: '/base/tests/fixtures/test-value.css' } },
                { tag: 'style', text: '@import "/base/tests/fixtures/test-declaration.css";@import "/base/tests/fixtures/test-value.css";' }
            ]);

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                updateDOM : false,
                onBeforeSend(xhr, node, url) {
                    xhr.setRequestHeader('css-vars-ponyfill', true);
                    onBeforeSendCount++;
                },
                onComplete(cssText, styleNode) {
                    expect(onBeforeSendCount).to.equal(3);
                    done();
                }
            });
        });

        it('triggers onSuccess callback on each success with proper arguments', function(done) {
            const linkUrl   = '/base/tests/fixtures/test-value.css';
            const styleElms = createElmsWrap([
                { tag: 'style', text: ':root { --color: red; }' },
                { tag: 'style', text: 'p { color: var(--color); }' },
                { tag: 'link', attr: { rel: 'stylesheet', href: linkUrl } }
            ]);

            const expectCss = 'p{color:red;}'.repeat(2);

            let onSuccessCount = 0;

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                updateDOM : false,
                onSuccess(cssText, node, url) {
                    expect(node, 'onSuccess node').to.equal(styleElms[onSuccessCount]);

                    // Link
                    if (node.tagName.toLowerCase() === 'link') {
                        expect(cssText.replace(/\n|\s/g, ''), 'onSuccess cssText').to.equal('p{color:var(--color);}');
                        expect(url, 'onSuccess url').to.include(linkUrl);
                    }
                    // Style
                    else {
                        expect(cssText, 'onSuccess cssText').to.equal(styleElms[onSuccessCount].textContent);
                        expect(url, 'onSuccess url').to.equal(window.location.href);
                    }

                    onSuccessCount++;

                    return /SKIP/.test(cssText) ? false : cssText;
                },
                onComplete(cssText, styleNode) {
                    expect(onSuccessCount, 'onSuccess count').to.equal(styleElms.length);
                    expect(cssText).to.equal(expectCss);
                    done();
                }
            });
        });

        it('triggers onWarning callback on each warning with proper arguments', function(done) {
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

        it('triggers onError callback on each error with proper arguments', function(done) {
            const linkUrl   = '/base/tests/fixtures/test-onerror.css';
            const styleCss  = ':root { --error: red;';
            const styleElms = createElmsWrap([
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
                    expect(onErrorCount, 'onError count').to.equal(styleElms.length);
                    expect(onErrorMsgs.filter(msg => msg.toLowerCase().indexOf('error') > -1), 'onError message').to.have.length(styleElms.length);
                    expect(onErrorNodes, 'onError nodes').to.include.members(styleElms);
                    expect(onErrorXHR.status, 'onError XHR').to.equal(404);
                    expect(onErrorURL, 'onError URL').to.include('fail.css');
                    done();
                }
            });
        });

        it('triggers onComplete callback with proper arguments', function(done) {
            const styleCss  = ':root { --color: red; } p { color: var(--color); }';
            const expectCss = 'p{color:red;}';

            createElmsWrap({ tag: 'style', text: styleCss });

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                updateDOM : false,
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
        it('updates value when called multiple times', function() {
            const expectCss = [
                'p{color:red;}',
                'p{color:green;}'
            ];

            createElmsWrap({ tag: 'style', text: ':root { --color: red; } p { color: var(--color); }' });

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                onComplete(cssText, styleNode) {
                    expect(cssText).to.equal(expectCss[0]);
                }
            });

            createElmsWrap({ tag: 'style', text: ':root { --color: green; }' });

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                onComplete(cssText, styleNode) {
                    expect(cssText).to.equal(expectCss[1]);
                }
            });
        });

        it('updates inserted <style> location when called multiple times', function() {
            const elm1 = createElmsWrap({ tag: 'style', text: ':root{--processed:true;}' })[0];

            // Not processed by cssVars (used to test insert location)
            const skipElm1 = createElms({ tag : 'style', text: ':root{--skipped:true;}', appendTo: 'head' })[0];

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                onComplete(cssText, styleNode) {
                    const styleElms = Array.from(document.querySelectorAll('style'));
                    const isAfterLastProcessedElm = elm1.nextSibling === styleNode;
                    const isBeforeSkipElm = styleElms.indexOf(styleNode) < styleElms.indexOf(skipElm1);

                    expect(styleNode.parentNode, 'inserted into <head>').to.equals(document.head);
                    expect(isAfterLastProcessedElm, 'inserted after last element processed').to.be.true;
                    expect(isBeforeSkipElm, 'inserted before skipped element').to.be.true;
                }
            });

            const elm2 = createElmsWrap({ tag: 'style', text: ':root{--processed:true;}', appendTo: 'body' })[0];

            // Not processed by cssVars (used to test insert location)
            const skipElm2 = createElms({ tag : 'style', text: ':root{--skipped:true;}', appendTo: 'body' })[0];

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                onComplete(cssText, styleNode) {
                    const styleElms = Array.from(document.querySelectorAll('style'));
                    const isAfterLastProcessedElm = elm2.nextSibling === styleNode;
                    const isBeforeSkipElm = styleElms.indexOf(styleNode) < styleElms.indexOf(skipElm2);

                    expect(styleNode.parentNode, 'inserted into <body>').to.equals(document.body);
                    expect(isAfterLastProcessedElm, 'inserted after last element processed').to.be.true;
                    expect(isBeforeSkipElm, 'inserted before skipped element').to.be.true;
                }
            });

            // Remove skipElms
            skipElm1.parentNode.removeChild(skipElm1);
            skipElm2.parentNode.removeChild(skipElm2);
        });

        it('persists options.variables when called multiple times', function() {
            const expectCss = [
                'p{color:red;}',
                'p{color:red;}p{width:100px;}',
                'p{color:blue;}p{width:200px;}'
            ];

            createElmsWrap({ tag: 'style', text: 'p { color: var(--color); }' });

            cssVars({
                include   : '[data-test]',
                onlyLegacy: false,
                variables : { color: 'red' },
                onComplete(cssText, styleNode) {
                    expect(cssText).to.equal(expectCss[0]);
                }
            });

            createElmsWrap({ tag: 'style', text: 'p { width: var(--width); }' });

            cssVars({
                exclude   : ':not([data-test])',
                onlyLegacy: false,
                variables : { width: '100px' },
                onComplete(cssText, styleNode) {
                    expect(cssText, 'persists').to.equal(expectCss[1]);
                }
            });

            cssVars({
                exclude   : ':not([data-test])',
                onlyLegacy: false,
                updateDOM : false,
                variables : {
                    color: 'blue',
                    width: '200px'
                },
                onComplete(cssText, styleNode) {
                    expect(cssText).to.equal(expectCss[2]);
                }
            });

            cssVars({
                exclude   : ':not([data-test])',
                onlyLegacy: false,
                onComplete(cssText, styleNode) {
                    expect(cssText, 'does not persists').to.equal(expectCss[1]);
                }
            });
        });

        // @keyframe support required
        if (hasAnimationSupport) {
            it('Fixes @keyframe bug in legacy (IE) and modern (Safari) browsers', function() {
                const testElm = createElmsWrap({
                    tag: 'p', text: 'Test Element', appendTo: 'body', attr: { class: 'test' }
                })[0];

                function getCurrentColor() {
                    return getComputedStyle(testElm).color;
                }

                createElmsWrap({ tag: 'style', text: `
                    :root {
                        --color: red;
                    }
                    p.test {
                        -webkit-animation: test 1ms forwards;
                                animation: test 1ms forwards;
                    }
                    @-webkit-keyframes test {
                        from, to {
                            color: var(--color);
                        }
                    }
                    @keyframes test {
                        from, to {
                            color: var(--color);
                        }
                    }
                ` });

                cssVars({
                    include   : 'style[data-test]',
                    onlyLegacy: false,
                    onComplete(cssText, styleNode) {
                        expect(getCurrentColor(), 'Initial @keyframes').to.be.colored('red');
                    }
                });

                cssVars({
                    include   : 'style[data-test]',
                    onlyLegacy: false,
                    variables : {
                        color: 'blue'
                    },
                    onComplete(cssText, styleNode) {
                        expect(getCurrentColor(), 'Updated @keyframes').to.be.colored('blue');
                    }
                });
            });
        }
    });
});
