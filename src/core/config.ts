import "dotenv/config";
import process from "node:process";

export const Config = {
    mainnetDatabaseFile:
        process.env.MAINNET_DATABASE_FILE ?? "./ckb-mainnet.db",
    testnetDatabaseFile:
        process.env.TESTNET_DATABASE_FILE ?? "./ckb-testnet.db",

    mainnetWsRpcUrl:
        process.env.MAINNET_WS_RPC_URL ?? "wss://testnet.ckb.dev/ws",
    testnetWsRpcUrl:
        process.env.TESTNET_WS_RPC_URL ?? "wss://testnet.ckb.dev/ws",

    mainnetHttpRpcUrl:
        process.env.MAINNET_HTTP_RPC_URL ?? "https://testnet.ckb.dev",
    testnetHttpRpcUrl:
        process.env.TESTNET_HTTP_RPC_URL ?? "https://testnet.ckb.dev",

    apiHttpPort: Number(process.env.API_HTTP_PORT ?? 3000),
    apiWsPort: Number(process.env.API_WS_PORT ?? 3001),
};
