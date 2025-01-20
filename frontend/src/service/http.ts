import fetch from "cross-fetch";
import { Config } from "./config";
import { Network } from "./type";

interface HttpApiResponse<T> {
    data?: T;
    error?: string;
}

export class HttpApiService {
    baseUrl: string;
    constructor(url: string) {
        this.baseUrl = url;
    }

    private async request<T>(
        endpoint: string,
        options?: RequestInit,
    ): Promise<HttpApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
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

    async get<T>(endpoint: string): Promise<HttpApiResponse<T>> {
        return this.request<T>(endpoint, { method: "GET" });
    }

    async post<T>(endpoint: string, body: any): Promise<HttpApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
        });
    }

    async put<T>(endpoint: string, body: any): Promise<HttpApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: JSON.stringify(body),
        });
    }

    async delete<T>(endpoint: string): Promise<HttpApiResponse<T>> {
        return this.request<T>(endpoint, { method: "DELETE" });
    }
}
