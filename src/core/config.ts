import "dotenv/config";
import process from "node:process";
import { URL } from "node:url";

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
    allowOrigin: extractAllowOriginList(process.env.ALLOW_ORIGIN ?? "*"),
};

export function extractAllowOriginList(value: string) {
    const list = value
        .split(",")
        // test valid url
        .filter((v) => {
            if (v === "*") {
                return true;
            }

            try {
                new URL(v.trim());
                return true;
            } catch {
                return false;
            }
        });
    return list;
}
