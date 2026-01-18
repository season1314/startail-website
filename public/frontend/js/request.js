/**
 * request
 * @param {string} url
 * @param {'GET'|'POST'|'PUT'|'DELETE'} method 
 * @param {object} params 
 * @returns {Promise<any>}
 */
async function fetchData(url, method = 'GET', params = {}, type = true) {
    try {
        let options = {
            method: method.toUpperCase(),
            credentials: 'include',
        };

        let fullUrl = url;
        console.log(url)

        if (['GET', 'DELETE'].includes(options.method)) {
            const queryString = new URLSearchParams(params).toString();
            if (queryString) fullUrl += '?' + queryString;
        } else if (['POST', 'PUT'].includes(options.method)) {
            if (params instanceof FormData) { options.body = params } // if post upload file
            else { options.body = JSON.stringify(params); options.headers = { 'Content-Type': 'application/json' } }
        }
        const result = await fetch(fullUrl, options);
        if (type) {
            result = await response.json();
        }
        if (result.code == 3) { window.location.href = '/admin/login' }
        return result;
    } catch (err) {
        console.error('fetchData error:', err);
        return null;
    }
}