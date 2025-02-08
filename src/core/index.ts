import { ccc } from "@ckb-ccc/core";
import { DB } from "../db";
import { Config } from "./config";
import { Subscriber } from "./subscriber";
import { Network } from "./type";

export const testnetDB = new DB(Network.Testnet, Config.testnetDatabaseFile);
export const mainnetDB = new DB(Network.Mainnet, Config.mainnetDatabaseFile);

export const readonlyTestnetDB = new DB(
    Network.Testnet,
    Config.testnetDatabaseFile,
    {
        readonly: true,
    },
);
export const readonlyMainnetDB = new DB(
    Network.Mainnet,
    Config.mainnetDatabaseFile,
    {
        readonly: true,
    },
);

export const testnetRpcClient = new ccc.ClientPublicTestnet({
    url: Config.testnetHttpRpcUrl,
});
export const mainnetRpcClient = new ccc.ClientPublicMainnet({
    url: Config.mainnetHttpRpcUrl,
});

export const testnetSubscriber = new Subscriber({
    ckbRpcUrl: Config.testnetWsRpcUrl,
    db: testnetDB,
    httpRpcClient: testnetRpcClient,
});

export const mainnetSubscriber = new Subscriber({
    ckbRpcUrl: Config.mainnetWsRpcUrl,
    db: mainnetDB,
    httpRpcClient: mainnetRpcClient,
});
