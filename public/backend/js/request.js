/**
 * request
 * @param {string} url
 * @param {'GET'|'POST'|'PUT'|'DELETE'} method 
 * @param {object} params 
 * @returns {Promise<any>}
 */
async function fetchData(url, method = 'GET', params = {}) {
    try {
        let options = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        };

        let fullUrl = url;

        if (['GET', 'DELETE'].includes(options.method)) {
            const queryString = new URLSearchParams(params).toString();
            if (queryString) fullUrl += '?' + queryString;
        } else if (['POST', 'PUT'].includes(options.method)) {
            options.body = JSON.stringify(params);
        }
        const response = await fetch(fullUrl, options);
        const result = await response.json();
        if (result.code == 3) { window.location.href = '/admin/login' }
        return result;
    } catch (err) {
        console.error('fetchData error:', err);
        return null;
    }
}