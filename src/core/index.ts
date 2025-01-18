import { DB } from "../db";
import { Config } from "./config";
import { Subscriber } from "./subscriber";

export const testnetDB = new DB(Config.testnetDatabaseFile);
export const mainnetDB = new DB(Config.mainnetDatabaseFile);

export const readonlyTestnetDB = new DB(Config.testnetDatabaseFile, {
    readonly: true,
});
export const readonlyMainnetDB = new DB(Config.mainnetDatabaseFile, {
    readonly: true,
});

export const testnetSubscriber = new Subscriber({
    ckbRpcUrl: Config.testnetWsRpcUrl,
    db: testnetDB,
});

export const mainnetSubscriber = new Subscriber({
    ckbRpcUrl: Config.mainnetWsRpcUrl,
    db: mainnetDB,
});
