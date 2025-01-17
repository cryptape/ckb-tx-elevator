import { createHttpServer } from "./api/http";
import { createWsServer } from "./api/ws";
import { Config } from "./core/config";
import { testnetDB } from "./core/db";
import { testnetSubscriber } from "./core/sub";
import { logger } from "./util/logger";

async function main() {
    logger.info(`Config: ${JSON.stringify(Config, null, 2)}`);
    testnetSubscriber.run();

    const testnetHttpSever = createHttpServer(testnetDB);
    const server = testnetHttpSever.start(Config.apiHttpPort);

    // Start the WebSocket server
    const testnetWsServer = createWsServer(server, testnetDB);
    testnetWsServer.start();
}

main().catch(logger.error);
