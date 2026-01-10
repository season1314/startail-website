export async function request(url: string, method = 'GET', body = {}) {

    const BASE_URL = 'http://127.0.0.1:3001/api/v1/web/';

    const fullUrl = `${BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;

    const options: RequestInit = {
        method: method.toUpperCase(),
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (method.toUpperCase() !== 'GET' && body && Object.keys(body).length > 0) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(fullUrl, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `请求失败，状态码: ${response.status}`);
    }

    const result = await response.json()
    return result;
}


const http = {
    get: async <T>(url: string, options?: RequestInit): Promise<T> => {
        return await request(url, 'GET');
    },
    
    post: async <T>(url: string, body?: any, options?: RequestInit): Promise<T> => {
        return await request(url, 'POST', body);
    },

    put: async <T>(url: string, body?: any, options?: RequestInit): Promise<T> => {
        return await request(url, 'PUT', body);
    },
    delete: async <T>(url: string, options?: RequestInit): Promise<T> => {
        return await request(url, 'DELETE');
    },

    patch: async <T>(url: string, body?: any, options?: RequestInit): Promise<T> => {
        return await request(url, 'PATCH', body);
    },
};

export default http;