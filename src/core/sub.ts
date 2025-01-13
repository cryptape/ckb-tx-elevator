import { mainnetDB, testnetDB } from "./db";
import { Subscriber } from "./ws";

export const testnetSubscriber = new Subscriber({
    ckbRpcUrl: "ws://127.0.0.1:28114", //"wss://testnet.ckb.dev/ws",
    db: testnetDB,
});

export const mainnetSubscriber = new Subscriber({
    ckbRpcUrl: "wss://mainnet.ckb.dev/ws",
    db: mainnetDB,
});
