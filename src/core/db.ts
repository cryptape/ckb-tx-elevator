import { DB } from "../db";

export const testnetDB = new DB("./ckb-testnet.db");
export const mainnetDB = new DB("./ckb-mainnet.db");
