// Export
// =============================================================================
module.exports = function injectTestComponent() {
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

    window.customElements.define('test-component', TestComponent);

    // createElms({ tag: 'style', text: ':root { --test-component-background: green; }', appendTo: 'head' });
    // createElms([
    //     { tag: 'test-component', attr: { 'data-text': 'Custom element' }},
    //     { tag: 'p', text: 'Standard element' }
    // ], { appendTo: 'body' });
};
