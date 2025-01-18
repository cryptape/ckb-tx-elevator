import fetch from "cross-fetch";
import { Config } from "./config";

const API_BASE_URL = Config.apiHttpUrl; // adjust this to your server URL

interface HttpApiResponse<T> {
    data?: T;
    error?: string;
}

export class HttpApiService {
    private static async request<T>(
        endpoint: string,
        options?: RequestInit,
    ): Promise<HttpApiResponse<T>> {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    "Content-Type": "application/json",
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    static async get<T>(endpoint: string): Promise<HttpApiResponse<T>> {
        return this.request<T>(endpoint, { method: "GET" });
    }

    static async post<T>(
        endpoint: string,
        body: any,
    ): Promise<HttpApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
        });
    }

    static async put<T>(
        endpoint: string,
        body: any,
    ): Promise<HttpApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: JSON.stringify(body),
        });
    }

    static async delete<T>(endpoint: string): Promise<HttpApiResponse<T>> {
        return this.request<T>(endpoint, { method: "DELETE" });
    }
}
