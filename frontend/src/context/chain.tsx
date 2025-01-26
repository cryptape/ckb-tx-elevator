import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "preact/compat";
import { ChainService } from "../service/api";
import { Network } from "../service/type";
import { WsApiService } from "../service/ws";

interface ChainContextType {
    network: Network;
    chainService: ChainService;
    isConnected: boolean;
    waitForConnection: () => Promise<void>;
}

const ChainContext = createContext<ChainContextType | null>(null);

export function ChainProvider({
    children,
    network,
}: {
    children: any;
    network: Network;
}) {
    const chainServiceRef = useRef<ChainService | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const connectionPromiseRef = useRef<Promise<void>>();
    const resolveRef = useRef<() => void>();

    // 确保网络变化时重建实例
    if (
        !chainServiceRef.current ||
        chainServiceRef.current.network !== network
    ) {
        chainServiceRef.current = new ChainService(network);

        // 创建新的连接 Promise
        connectionPromiseRef.current = new Promise((resolve) => {
            resolveRef.current = resolve;
        });

        // 监听 WebSocket 连接状态
        const wsClient = chainServiceRef.current.wsClient as WsApiService;
        wsClient.connect();

        wsClient.on("open", () => {
            setIsConnected(true);
            resolveRef.current?.();
        });
        wsClient.on("close", () => setIsConnected(false));
        wsClient.on("error", () => setIsConnected(false));
    }

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            // 如果有需要关闭的连接，在这里添加清理逻辑
            chainServiceRef.current?.wsClient?.dispose(); // 假设 WsApiService 有 close 方法
        };
    }, [network]);

    // 等待连接的公共方法
    const waitForConnection = async () => {
        if (isConnected) return;
        await connectionPromiseRef.current;
    };

    return (
        <ChainContext.Provider
            value={{
                network,
                chainService: chainServiceRef.current,
                isConnected,
                waitForConnection,
            }}
        >
            {children}
        </ChainContext.Provider>
    );
}

export function useChainService() {
    const context = useContext(ChainContext);
    if (!context) {
        throw new Error("useChainService must be used within a ChainProvider");
    }
    return context;
}
