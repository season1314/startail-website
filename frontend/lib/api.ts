export async function request(url: string, options: RequestInit = {}, method = 'GET', revalidate = 0) {

    const BASE_URL = process.env.API_URL || '';

    const fullUrl = `${BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;

    const defaultCacheConfig = method === 'GET'
        ? { next: { revalidate: revalidate } }
        : { cache: 'no-store' as RequestCache };
    const response = await fetch(fullUrl, {
        ...defaultCacheConfig,
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `请求失败，状态码: ${response.status}`);
    }

    return response.json();
}

export default request;