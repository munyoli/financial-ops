const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {}

async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = API_BASE_URL + endpoint;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(url, { 
        ...options, 
        headers,
        credentials: 'include' // Required for JWT cookies across ports 3000 and 5000
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "API Error: " + response.statusText);
    }

    if (response.status === 204) return {} as T;

    return response.json();
}

export const apiClient = {
    get: <T>(endpoint: string, options?: RequestOptions) => apiFetch<T>(endpoint, { ...options, method: 'GET' }),
    post: <T>(endpoint: string, body: any, options?: RequestOptions) => apiFetch<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body: any, options?: RequestOptions) => apiFetch<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string, options?: RequestOptions) => apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
    
    upload: <T>(endpoint: string, formData: FormData, options?: RequestOptions) => {
        const url = API_BASE_URL + endpoint;
        return fetch(url, {
            ...options,
            method: 'POST',
            body: formData,
            credentials: 'include'
        }).then(res => {
            if (!res.ok) throw new Error('Upload failed');
            return res.json();
        });
    }
};
