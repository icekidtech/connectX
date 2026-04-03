/**
 * Fetch proxy middleware that:
 * 1. Intercepts all /api/* requests
 * 2. Rewrites to http://localhost:3001/* (or NEXT_PUBLIC_API_URL)
 * 3. Automatically includes credentials (httpOnly cookies)
 * 4. Handles errors for React Query
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ApiError extends Error {
  status: number;
  data: Record<string, unknown>;
}

export async function apiClient(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Ensure we have the full URL
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
  const isFormDataBody =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = new Headers(options.headers || {});
  if (!isFormDataBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(fullUrl, {
      ...options,
      credentials: 'include', // Auto-send httpOnly cookies with all requests
      headers,
    });

    // Handle error responses
    if (!response.ok) {
      const error = new Error('API request failed') as ApiError;
      error.status = response.status;

      try {
        error.data = await response.json();
      } catch {
        error.data = { message: response.statusText };
      }

      throw error;
    }

    return response;
  } catch (error) {
    // Network errors or JSON parsing errors
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}

/**
 * Helper to parse JSON from API response
 */
export async function apiJson<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiClient(url, options);
  return response.json();
}

/**
 * Helper for GET requests
 */
export function apiGet<T = unknown>(url: string, options: RequestInit = {}) {
  return apiJson<T>(url, { ...options, method: 'GET' });
}

/**
 * Helper for POST requests
 */
export function apiPost<T = unknown>(
  url: string,
  body?: unknown,
  options: RequestInit = {}
) {
  return apiJson<T>(url, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper for PUT requests
 */
export function apiPut<T = unknown>(
  url: string,
  body?: unknown,
  options: RequestInit = {}
) {
  return apiJson<T>(url, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper for DELETE requests
 */
export function apiDelete<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  return apiJson<T>(url, { ...options, method: 'DELETE' });
}
