import { Config } from "./config";
import { mainnetDB, testnetDB } from "./db";
import { Subscriber } from "./ws";

export const testnetSubscriber = new Subscriber({
    ckbRpcUrl: Config.testnetWsRpcUrl,
    db: testnetDB,
});

export const mainnetSubscriber = new Subscriber({
    ckbRpcUrl: Config.mainnetWsRpcUrl,
    db: mainnetDB,
});
