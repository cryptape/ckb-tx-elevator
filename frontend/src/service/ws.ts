import { Config } from "./config";

export interface WebSocketMessage<T> {
    type: string;
    payload: T;
}

export type WebSocketMessageHandler<T> = (message: WebSocketMessage<T>) => void;

export enum WebSocketConnectionState {
    CONNECTING = "CONNECTING",
    OPEN = "OPEN",
    CLOSING = "CLOSING",
    CLOSED = "CLOSED",
    UNKNOWN = "UNKNOWN",
}

export interface WebSocketServiceOptions {
    url?: string;
    reconnectInterval?: number; // 毫秒，默认 3000
    reconnectAttempts?: number; // 默认 10
    logLevel?: "info" | "warn" | "error" | "none";
}

const API_WS_URL = Config.testnetApiWsUrl;

export class WsApiService {
    private socket: WebSocket | null = null;
    private url: string;
    private reconnectInterval: number;
    private reconnectAttempts: number;
    private currentReconnectAttempt = 0;
    private logLevel: "info" | "warn" | "error" | "none";
    private reconnecting = false;

    // 分离消息处理器和事件处理器
    private messageHandlers = new Map<string, WebSocketMessageHandler<any>[]>();
    private eventHandlers = {
        error: [] as ((event: Event) => void)[],
        close: [] as ((event: CloseEvent) => void)[],
        open: [] as (() => void)[],
    };

    constructor(options: WebSocketServiceOptions) {
        this.url = options.url ?? API_WS_URL;
        this.reconnectInterval = options.reconnectInterval || 3000;
        this.reconnectAttempts = options.reconnectAttempts || 10;
        this.logLevel = options.logLevel || "none";
    }

    connect() {
        if (
            this.socket?.readyState === WebSocket.OPEN ||
            this.socket?.readyState === WebSocket.CONNECTING
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
            this.eventHandlers.open.forEach((handler) => handler());
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
            this.eventHandlers.error.forEach((handler) => handler(error));
            this.attemptReconnect();
        };

        this.socket.onclose = (event) => {
            this.log("info", "WebSocket connection closed");
            this.eventHandlers.close.forEach((handler) => handler(event));
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
                `Reconnecting in ${this.reconnectInterval / 1000}s (Attempt ${this.currentReconnectAttempt + 1}/${this.reconnectAttempts})`,
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

    // 方法重载实现类型安全
    on<T>(type: string, handler: WebSocketMessageHandler<T>): void;
    on(type: "error", handler: (event: Event) => void): void;
    on(type: "close", handler: (event: CloseEvent) => void): void;
    on(type: "open", handler: () => void): void;
    on(type: string, handler: any): void {
        switch (type) {
            case "error":
                this.eventHandlers.error.push(handler);
                break;
            case "close":
                this.eventHandlers.close.push(handler);
                break;
            case "open":
                this.eventHandlers.open.push(handler);
                break;
            default:
                if (!this.messageHandlers.has(type)) {
                    this.messageHandlers.set(type, []);
                }
                this.messageHandlers.get(type)?.push(handler);
        }
    }

    off<T>(type: string, handler: WebSocketMessageHandler<T>): void;
    off(type: "error", handler: (event: Event) => void): void;
    off(type: "close", handler: (event: CloseEvent) => void): void;
    off(type: "open", handler: () => void): void;
    off(type: string, handler: any): void {
        switch (type) {
            case "error":
                this.eventHandlers.error = this.eventHandlers.error.filter(
                    (h) => h !== handler,
                );
                break;
            case "close":
                this.eventHandlers.close = this.eventHandlers.close.filter(
                    (h) => h !== handler,
                );
                break;
            case "open":
                this.eventHandlers.open = this.eventHandlers.open.filter(
                    (h) => h !== handler,
                );
                break;
            default:
                const handlers = this.messageHandlers.get(type);
                if (handlers) {
                    this.messageHandlers.set(
                        type,
                        handlers.filter((h) => h !== handler),
                    );
                }
        }
    }

    send<T>(type: string, payload: T) {
        if (!this.isConnected()) {
            this.log("warn", "WebSocket is not open, message not sent.");
            return;
        }

        const message: WebSocketMessage<T> = { type, payload };
        this.socket?.send(JSON.stringify(message));
    }

    isConnected() {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    get connectionState(): WebSocketConnectionState {
        switch (this.socket?.readyState) {
            case WebSocket.CONNECTING:
                return WebSocketConnectionState.CONNECTING;
            case WebSocket.OPEN:
                return WebSocketConnectionState.OPEN;
            case WebSocket.CLOSING:
                return WebSocketConnectionState.CLOSING;
            case WebSocket.CLOSED:
                return WebSocketConnectionState.CLOSED;
            default:
                return WebSocketConnectionState.UNKNOWN;
        }
    }

    private handleMessage(message: WebSocketMessage<any>) {
        const handlers = this.messageHandlers.get(message.type) || [];
        handlers.forEach((handler) => handler(message));
    }

    dispose() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.messageHandlers.clear();
        this.eventHandlers.error = [];
        this.eventHandlers.close = [];
        this.eventHandlers.open = [];
        this.log("info", "WebSocket service disposed");
    }

    private log(
        level: "info" | "warn" | "error",
        message: string,
        ...args: any[]
    ) {
        if (this.logLevel === "none") return;

        const logMessage = `[WebSocketService] ${message}`;
        switch (level) {
            case "info":
                if (this.logLevel === "info") console.log(logMessage, ...args);
                break;
            case "warn":
                if (this.logLevel !== "error")
                    console.warn(logMessage, ...args);
                break;
            case "error":
                console.error(logMessage, ...args);
                break;
        }
    }
}
