import request from "./api";

const http = {
    get: async <T>(url: string, options?: RequestInit): Promise<T> => {
        return await request(url, { ...options, method: 'GET' });
    },

    post: async <T>(url: string, body?: any, options?: RequestInit): Promise<T> => {
        return await request(url, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    },

    put: async <T>(url: string, body?: any, options?: RequestInit): Promise<T> => {
        return await request(url, {
            ...options,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    },
    delete: async <T>(url: string, options?: RequestInit): Promise<T> => {
        return await request(url, { ...options, method: 'DELETE' });
    },

    patch: async <T>(url: string, body?: any, options?: RequestInit): Promise<T> => {
        return await request(url, {
            ...options,
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    },
};

export default http;