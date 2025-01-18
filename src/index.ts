import cluster from "node:cluster";
import os from "node:os";
import process from "node:process";
import { testnetDB } from "./core";
import { testnetSubscriber } from "./core";
import { Config } from "./core/config";
import { BlockEmitter, SnapshotEmitter } from "./core/emitter";
import { runServer } from "./server";
import { logger } from "./util/logger";

if (cluster.isPrimary) {
    logger.info(`Master ${process.pid} is running`);
    const numCPUs = os.cpus().length;

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    logger.info(`Config: ${JSON.stringify(Config, null, 2)}`);
    testnetSubscriber.run();

    const snapshotEmitter = new SnapshotEmitter({ db: testnetDB });
    snapshotEmitter.startForever();

    const blockEmitter = new BlockEmitter({ db: testnetDB });
    blockEmitter.startForever();

    cluster.on("exit", (worker, _code, _signal) => {
        if (worker.process.exitCode === 0) {
            logger.warn(
                `Worker ${worker.id} (pid: ${worker.process.pid}) died peacefully...`,
            );
        } else {
            logger.error(
                `Worker ${worker.id} (pid: ${worker.process.pid}) died with exit code ${worker.process.exitCode}, restarting it`,
            );
            cluster.fork();
        }
    });
} else {
    runServer();
}
