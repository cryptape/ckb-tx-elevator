import { DB } from "../db";
import { Config } from "./config";

export const testnetDB = new DB(Config.testnetDatabaseFile);
export const mainnetDB = new DB(Config.mainnetDatabaseFile);

export const readonlyTestnetDB = new DB(Config.testnetDatabaseFile, {
    readonly: true,
});
export const readonlyMainnetDB = new DB(Config.mainnetDatabaseFile, {
    readonly: true,
});
