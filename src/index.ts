import { createServer } from "./api/sever";
import { Config } from "./core/config";
import { testnetDB } from "./core/db";
import { testnetSubscriber } from "./core/sub";
import { logger } from "./util/logger";

async function main() {
    logger.info(`Config: ${JSON.stringify(Config, null, 2)}`);

    testnetSubscriber.run();

    const testnetSever = createServer(testnetDB);
    testnetSever.start(Config.apiHttpPort);
}

main().catch(logger.error);
