import cluster from "node:cluster";
import { EventEmitter } from "node:events";
import process from "node:process";
import type { Hex } from "@ckb-ccc/core";
import type { DB } from "../db";
import { type TransactionSnapshot, TransactionStatus } from "../db/type";
import { logger } from "../util/logger";
import { type SubMessage, SubMessageType } from "./type";

export class SnapshotEmitter {
    private db: DB;
    private isRunning: boolean;
    private currentTip: Hex;
    private currentSnapshot: TransactionSnapshot | undefined;
    private emitter: EventEmitter;
    private livenessCheckIntervalSeconds: number;

    constructor({
        db,
        livenessCheckIntervalSeconds = 5,
    }: { db: DB; livenessCheckIntervalSeconds?: number }) {
        this.db = db;
        this.isRunning = false;
        this.currentTip = "0x0";
        this.emitter = new EventEmitter();
        this.livenessCheckIntervalSeconds = livenessCheckIntervalSeconds;
    }

    // Main worker
    async startForever() {
        await this.start();
        setInterval(async () => {
            if (!this.running()) {
                logger.error(
                    "SnapshotEmitter has stopped, maybe check the log?",
                );
                await this.start();
            }
        }, this.livenessCheckIntervalSeconds * 1000);
    }

    async start() {
        this.isRunning = true;
        const currentTip = await this.db.getTipBlockNumber();
        const currentSnapshot =
            await this.db.getLastModifiedTransactionSnapshot(
                TransactionStatus.Committed,
            ); // exclude the committed transaction since we have already record tip block

        if (currentTip != null) {
            this.currentTip = currentTip;
        }
        if (currentSnapshot != null) {
            this.currentSnapshot = currentSnapshot;
        }

        this.scheduleLoop();
    }

    // cluster workers
    startWorker() {
        process.on("message", (msg: SubMessage) => {
            const type = msg.type;
            const content = msg.content;
            this.emitter.emit(type, content);
        });
    }

    stop() {
        this.isRunning = false;
    }

    running() {
        return this.isRunning;
    }

    scheduleLoop(timeout = 1) {
        setTimeout(() => {
            this.loop();
        }, timeout);
    }

    loop() {
        if (!this.running()) {
            return;
        }
        this.poll()
            .then((timeout) => {
                this.scheduleLoop(timeout);
            })
            .catch((e) => {
                logger.error(
                    `Error occurs: ${e} ${e.stack}, stopping emit snapshot!`,
                );
                this.stop();
            });
    }

    async poll() {
        const timeout = 1000;
        const [tip, snapshot] = await Promise.all([
            await this.db.getTipBlockNumber(),
            await this.db.getLastModifiedTransactionSnapshot(
                TransactionStatus.Committed,
            ),
        ]);

        let isNewSnapshot = false;

        // Update current tip and snapshot if it is newer
        if (tip && +this.currentTip < +tip) {
            this.currentTip = tip;
            isNewSnapshot = true;
        }
        if (
            this.currentSnapshot == null ||
            (snapshot &&
                this.currentSnapshot &&
                (snapshot.txHash !== this.currentSnapshot.txHash ||
                    snapshot.timestamp > this.currentSnapshot.timestamp))
        ) {
            this.currentSnapshot = snapshot;
            isNewSnapshot = true;
        }

        if (isNewSnapshot) {
            const emitNewSnapshot = async () => {
                const snapshot = await this.db.getChainSnapshot();
                if (snapshot) {
                    const msg = {
                        type: SubMessageType.NewSnapshot,
                        content: snapshot,
                    };
                    this.notify(msg);
                }

                return timeout;
            };
            return await emitNewSnapshot();
        }

        return timeout;
    }

    getEmitter(): EventEmitter {
        return this.emitter;
    }

    private notify(msg: SubMessage) {
        const workers = cluster.workers;
        for (const workerId in workers) {
            const worker = workers[workerId];
            if (worker) {
                worker.send(msg);
            }
        }
    }
}
