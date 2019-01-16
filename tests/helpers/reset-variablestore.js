// Dependencies
// =============================================================================
import { variableStore } from '../../src/transform-css';


// Functions
// =============================================================================
/**
 * Resets variableStore object used by ponyfill for persisting values.
 *
 * @param {*} variableStoreObj
 */
function resetVariableStore(variableStoreObj = variableStore) {
    ['user', 'temp'].forEach(key => {
        for (const prop in variableStore[key]) {
            // console.log(`delete variableStore.${key}.${prop}`);
            delete variableStore[key][prop];
        }
    });
}


// Export
// =============================================================================
export default resetVariableStore;
