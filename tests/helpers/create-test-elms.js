// Dependencies
// =============================================================================
import createElms from 'create-elms';


// Functions
// =============================================================================
function createTestElms(elmsData, sharedOptions = {}, documentObject) {
    elmsData = (Array.isArray(elmsData) ? elmsData : [elmsData]).map(elmData => {
        if (typeof elmData === 'object') {
            const isHeadElm = elmData.tag && ['link', 'style'].indexOf(elmData.tag) !== -1;

            // Set 'appendTo' values based on tag
            elmData.appendTo = elmData.appendTo || sharedOptions.appendTo || (isHeadElm ? 'head' : 'body');
        }

        return elmData;
    });

    // If unspecified, append all elements to <body>
    sharedOptions.appendTo = sharedOptions.appendTo || 'body';

    // Set 'data-test' attribute so test elements can easily identified
    sharedOptions.attr = Object.assign(sharedOptions.attr || {}, { 'data-test': true });

    return createElms(elmsData, sharedOptions, documentObject);
}


// Export
// =============================================================================
export default createTestElms;
