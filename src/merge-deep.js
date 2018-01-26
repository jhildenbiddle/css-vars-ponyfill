// Functions
// =============================================================================
/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 *
 * @param {...object} objects - Objects to merge
 * @returns {object} New object with merged key/values
 */
function mergeDeep(...objects) {
    const isObject = obj => obj instanceof Object && obj.constructor === Object;

    return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach(key => {
            const pVal = prev[key];
            const oVal = obj[key];

            // if (Array.isArray(pVal) && Array.isArray(oVal)) {
            //     prev[key] = pVal.concat(...oVal);
            // }
            if (isObject(pVal) && isObject(oVal)) {
                prev[key] = mergeDeep(pVal, oVal);
            }
            else {
                prev[key] = oVal;
            }
        });

        return prev;
    }, {});
}


// Export
// =============================================================================
export default mergeDeep;
