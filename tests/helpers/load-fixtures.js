// Dependencies
// =============================================================================
import axios from 'axios';


// Functions
// =============================================================================
function loadFixtures(options = {}, targetObj = {}) {
    const baseUrl = options.base || '';
    const urls    = Array.isArray(options.urls) ? options.urls : options.urls ? [options.urls] : [];

    return new Promise(function(resolve, reject) {
        // Load Fixtures
        axios.all(urls.map(url => axios.get(`${baseUrl}${url}`)))
            .then(axios.spread(function (...responseArr) {
                responseArr.forEach((response, i) => {
                    const key = urls[i];
                    const val = response.data;

                    targetObj[key] = val;
                });

                resolve(targetObj);
            }))
            .catch(err => {
                reject(err);
            });
    });
}


// Export
// =============================================================================
export default loadFixtures;
