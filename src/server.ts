import { createHttpServer } from "./api/http";
import { createWsServer } from "./api/ws";
import { readonlyMainnetDB, readonlyTestnetDB } from "./core";
import { Config } from "./core/config";
import { Network } from "./core/type";

export async function runServer() {
    const testnetHttpSever = createHttpServer(readonlyTestnetDB);
    const server = testnetHttpSever.start(Config.apiTestnetPort);
    const testnetWsServer = createWsServer(
        server,
        Network.Testnet,
        readonlyTestnetDB,
    );
    testnetWsServer.start();

    const mainnetHttpServer = createHttpServer(readonlyMainnetDB);
    const mainnetServer = mainnetHttpServer.start(Config.apiMainnetPort);
    const mainnetWsServer = createWsServer(
        mainnetServer,
        Network.Mainnet,
        readonlyMainnetDB,
    );
    mainnetWsServer.start();
}
