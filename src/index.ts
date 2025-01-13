import { createServer } from "./api/sever";
import { testnetDB } from "./core/db";
import { testnetSubscriber } from "./core/sub";
import { logger } from "./util/logger";

async function main() {
    testnetSubscriber.run();

    const testnetSever = createServer(testnetDB);
    testnetSever.start(3000);
}

main().catch(logger.error);
