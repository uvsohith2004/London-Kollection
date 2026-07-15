import { cookies } from "next/headers";

const baseURL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const fetchWithCookies = async <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
  const cookieStore = await cookies();
  const cookieString = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

  const res = await fetch(`${baseURL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieString,
      ...(options?.headers || {}),
    },
    cache: options?.cache || "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`);
  }

  const data = await res.json();
  return data.items || data.data || data;
};

export const serverApi = {
  get: async <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
    return fetchWithCookies<T>(endpoint, { ...options, method: "GET" });
  },
  post: async <T = any>(endpoint: string, body?: any, options?: RequestInit): Promise<T> => {
    return fetchWithCookies<T>(endpoint, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined });
  },
  put: async <T = any>(endpoint: string, body?: any, options?: RequestInit): Promise<T> => {
    return fetchWithCookies<T>(endpoint, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined });
  },
  patch: async <T = any>(endpoint: string, body?: any, options?: RequestInit): Promise<T> => {
    return fetchWithCookies<T>(endpoint, { ...options, method: "PATCH", body: body ? JSON.stringify(body) : undefined });
  },
  del: async <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
    return fetchWithCookies<T>(endpoint, { ...options, method: "DELETE" });
  }
};
