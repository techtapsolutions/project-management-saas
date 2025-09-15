// Remove trailing slashes and ensure we have a clean base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:3001'

export function createApiUrl(path: string): string {
  // Remove leading slash from path if present
  const cleanPath = path.replace(/^\/+/, '')
  // Combine base URL with clean path
  return `${API_BASE_URL}/${cleanPath}`
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = createApiUrl(endpoint)
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  }

  return fetch(url, defaultOptions)
}