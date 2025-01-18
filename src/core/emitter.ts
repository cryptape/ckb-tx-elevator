import cluster from "node:cluster";
import { EventEmitter } from "node:events";
import process from "node:process";
import type { Hex } from "@ckb-ccc/core";
import { type SubBlock, type SubMessage, SubMessageType } from "../api/type";
import type { DB } from "../db";
import { type TransactionSnapshot, TransactionStatus } from "../db/type";
import { logger } from "../util/logger";

export class BaseEmitter {
    protected isRunning: boolean;
    protected emitter: EventEmitter;
    protected livenessCheckIntervalSeconds: number;

    constructor({
        livenessCheckIntervalSeconds = 5,
    }: { livenessCheckIntervalSeconds?: number }) {
        this.isRunning = false;
        this.emitter = new EventEmitter();
        this.livenessCheckIntervalSeconds = livenessCheckIntervalSeconds;
    }

    async startForever() {
        await this.start();
        setInterval(async () => {
            if (!this.running()) {
                logger.error("Emitter has stopped, maybe check the log?");
                await this.start();
            }
        }, this.livenessCheckIntervalSeconds * 1000);
    }

    async start() {
        this.isRunning = true;
        this.scheduleLoop();
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

    async poll(): Promise<number> {
        throw new Error("Not implemented");
    }

    getEmitter(): EventEmitter {
        return this.emitter;
    }
}

export class SnapshotEmitter extends BaseEmitter {
    private db: DB;
    private currentTip: Hex;
    private currentSnapshot: TransactionSnapshot | undefined;

    constructor({
        db,
        livenessCheckIntervalSeconds = 5,
    }: { db: DB; livenessCheckIntervalSeconds?: number }) {
        super({ livenessCheckIntervalSeconds });
        this.db = db;
        this.currentTip = "0x0";
    }

    async poll() {
        const timeout = 1000;
        const [tip, snapshot] = await Promise.all([
            await this.db.getTipBlockNumber(),
            await this.db.getLastModifiedTransactionSnapshot(
                TransactionStatus.Committed,
            ),
        ]);
        if (tip == null || snapshot == null) {
            return timeout;
        }

        let isNewSnapshot = false;

        // Update current tip and snapshot if it is newer
        if (this.currentTip == null || +this.currentTip < +tip) {
            this.currentTip = tip;
            isNewSnapshot = true;
        }
        if (
            this.currentSnapshot == null ||
            snapshot.txHash !== this.currentSnapshot.txHash ||
            snapshot.timestamp > this.currentSnapshot.timestamp
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

    // Only run in cluster workers
    // Listen for main worker notify message
    startWorker() {
        process.on("message", (msg: SubMessage) => {
            const type = msg.type;
            const content = msg.content;
            if (type === SubMessageType.NewSnapshot) {
                this.emitter.emit(type, content);
            }
        });
    }

    // Only run in main worker
    // Notify all cluster workers
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

export class BlockEmitter extends BaseEmitter {
    private db: DB;
    private currentTip: Hex;
    constructor({
        db,
        livenessCheckIntervalSeconds = 5,
    }: { db: DB; livenessCheckIntervalSeconds?: number }) {
        super({ livenessCheckIntervalSeconds });
        this.db = db;
        this.currentTip = "0x0";
    }

    async poll() {
        const timeout = 1000;
        const tipBlock = this.db.getTipBlockHeader();
        if (tipBlock == null) {
            return timeout;
        }

        const tip = tipBlock.block_number;

        let isNewBlock = false;

        // Update current tip and snapshot if it is newer
        if (this.currentTip == null || +this.currentTip < +tip) {
            this.currentTip = tip;
            isNewBlock = true;
        }

        if (isNewBlock) {
            const emitNewBlock = async () => {
                const [committedTransactions, proposedTransactions] =
                    await Promise.all([
                        this.db.getCommittedTransactionsByBlock(
                            tipBlock.block_hash,
                        ),
                        this.db.getProposedTransactionsByBlock(
                            tipBlock.block_hash,
                        ),
                    ]);

                const data: SubBlock = {
                    blockHeader: tipBlock,
                    committedTransactions,
                    proposedTransactions,
                };

                const msg = {
                    type: SubMessageType.NewBlock,
                    content: data,
                };
                this.notify(msg);

                return timeout;
            };
            return await emitNewBlock();
        }

        return timeout;
    }

    // Only run in cluster workers
    // Listen for main worker notify message
    startWorker() {
        process.on("message", (msg: SubMessage) => {
            const type = msg.type;
            const content = msg.content;
            if (type === SubMessageType.NewBlock) {
                this.emitter.emit(type, content);
            }
        });
    }

    // Only run in main worker
    // Notify all cluster workers
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
