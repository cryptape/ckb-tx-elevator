import { createHttpServer } from "./api/http";
import { createWsServer } from "./api/ws";
import { readonlyTestnetDB } from "./core";
import { Config } from "./core/config";

export async function runServer() {
    const testnetHttpSever = createHttpServer(readonlyTestnetDB);
    const server = testnetHttpSever.start(Config.apiHttpPort);
    const testnetWsServer = createWsServer(server, readonlyTestnetDB);
    testnetWsServer.start();
}
