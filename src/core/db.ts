import { DB } from "../db";
import { Config } from "./config";

export const testnetDB = new DB(Config.testnetDatabaseFile);
export const mainnetDB = new DB(Config.mainnetDatabaseFile);
