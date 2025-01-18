import { Config } from "./config";

export interface WebSocketMessage<T> {
    type: string;
    payload: T;
}

export type WebSocketMessageHandler<T> = (message: WebSocketMessage<T>) => void;

export interface WebSocketServiceOptions {
    url?: string;
    reconnectInterval?: number; // 毫秒，默认 3000
    reconnectAttempts?: number; // 默认 10
    logLevel?: "info" | "warn" | "error" | "none";
}

const API_WS_URL = Config.apiWsUrl; // adjust this to your server URL

export class WsApiService {
    private socket: WebSocket | null = null;
    private url: string;
    private reconnectInterval: number;
    private reconnectAttempts: number;
    private currentReconnectAttempt = 0;
    private eventListeners = new Map<string, WebSocketMessageHandler<any>[]>();
    private logLevel: "info" | "warn" | "error" | "none";
    private reconnecting = false;

    constructor(options: WebSocketServiceOptions) {
        this.url = options.url ?? API_WS_URL;
        this.reconnectInterval = options.reconnectInterval || 3000;
        this.reconnectAttempts = options.reconnectAttempts || 10;
        this.logLevel = options.logLevel || "none";
    }

    connect(onOpen?: () => void) {
        if (
            this.socket &&
            (this.socket.readyState === WebSocket.OPEN ||
                this.socket.readyState === WebSocket.CONNECTING)
        ) {
            this.log("warn", "WebSocket already connected or connecting.");
            return;
        }

        this.log("info", `Attempting to connect to ${this.url}`);
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            this.currentReconnectAttempt = 0;
            this.reconnecting = false;
            this.log("info", `WebSocket connected to ${this.url}`);
            if (onOpen) onOpen();
        };

        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as WebSocketMessage<any>;
                this.handleMessage(message);
            } catch (error) {
                this.log("error", "Failed to parse message", error);
            }
        };

        this.socket.onerror = (error) => {
            this.log("error", "WebSocket error occurred", error);
            this.attemptReconnect();
        };

        this.socket.onclose = () => {
            this.log("info", "WebSocket connection closed");
            if (!this.reconnecting) {
                this.attemptReconnect();
            }
        };
    }

    private attemptReconnect() {
        if (
            this.currentReconnectAttempt < this.reconnectAttempts &&
            !this.reconnecting
        ) {
            this.reconnecting = true;
            this.log(
                "warn",
                `Attempting reconnect in ${this.reconnectInterval / 1000} seconds. Attempt: ${this.currentReconnectAttempt + 1}`,
            );
            setTimeout(() => {
                this.currentReconnectAttempt++;
                this.connect();
            }, this.reconnectInterval);
        } else {
            this.reconnecting = false;
            this.log("error", "Maximum reconnect attempts reached.");
            this.dispose();
        }
    }

    send<T>(type: string, payload: T) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.log("warn", "WebSocket is not open, message not sent.");
            return;
        }

        const message: WebSocketMessage<T> = { type, payload };
        this.socket.send(JSON.stringify(message));
    }

    on<T>(type: string, handler: WebSocketMessageHandler<T>) {
        if (!this.eventListeners.has(type)) {
            this.eventListeners.set(type, []);
        }
        this.eventListeners.get(type)?.push(handler);
    }

    off<T>(type: string, handler: WebSocketMessageHandler<T>) {
        if (this.eventListeners.has(type)) {
            const handlers = this.eventListeners.get(
                type,
            ) as WebSocketMessageHandler<T>[];
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
            if (handlers.length === 0) {
                this.eventListeners.delete(type);
            }
        }
    }

    private handleMessage(message: WebSocketMessage<any>) {
        const handlers = this.eventListeners.get(message.type);
        if (handlers) {
            handlers.forEach((handler) => handler(message));
        }
    }

    dispose() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.eventListeners.clear();
        }
    }

    private log(
        level: "info" | "warn" | "error",
        message: string,
        ...args: any[]
    ) {
        if (this.logLevel === "none") return;

        if (this.logLevel === "info" && level === "info") {
            console.log(`[WebSocketService] INFO: ${message}`, ...args);
        } else if (
            this.logLevel === "warn" &&
            (level === "warn" || level === "error")
        ) {
            console.warn(`[WebSocketService] WARN: ${message}`, ...args);
        } else if (level === "error") {
            console.error(`[WebSocketService] ERROR: ${message}`, ...args);
        }
    }
}
