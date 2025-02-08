import type { ClientJsonRpc } from "@ckb-ccc/core";
import {
    type JsonRpcBlock,
    JsonRpcTransformers,
} from "@ckb-ccc/core/advancedBarrel";
import { WebSocket } from "ws";
import type { DB } from "../db";
import { logger } from "../util/logger";
import type {
    JsonRpcPoolTransactionEntry,
    Network,
    PoolTransactionReject,
} from "./type";

export interface WebsocketTopicSubscriber {
    id: string;
    topic: string;
    sub_id: string | undefined;
    // biome-ignore lint: handler will be multiple types
    handler: (data: any) => void;
}

export class Subscriber {
    ckbRpcUrl: string;
    private ws: WebSocket | undefined;
    private httpRpcClient: ClientJsonRpc;
    private db: DB;

    constructor({
        ckbRpcUrl,
        db,
        httpRpcClient,
    }: { httpRpcClient: ClientJsonRpc; ckbRpcUrl: string; db: DB }) {
        this.ckbRpcUrl = ckbRpcUrl;
        this.httpRpcClient = httpRpcClient;
        this.db = db;
    }

    private createTopicSubscriber() {
        const topics: WebsocketTopicSubscriber[] = [
            {
                id: "sub-new-tip-block",
                topic: "new_tip_block",
                sub_id: undefined,
                handler: (block: JsonRpcBlock) => {
                    this.db.saveBlockHeader(block.header);
                    // handle proposals transactions
                    for (const txPid of block.proposals) {
                        this.db.updateBlockProposedTransaction(
                            txPid,
                            block.header.number,
                            block.header.hash,
                            +block.header.timestamp,
                        );
                    }
                    // handle committed transactions
                    for (const tx of block.transactions) {
                        this.db.updateCommittedTransaction(
                            tx,
                            block.header.number,
                            block.header.hash,
                            +block.header.timestamp,
                        );
                    }

                    logger.debug(`New block: ${+block.header.number}`);
                    logger.debug(
                        `proposal txs: ${block.proposals.length > 0 ? JSON.stringify(block.proposals) : "0"}`,
                    );
                    logger.debug(
                        `committed txs: ${JSON.stringify(
                            block.transactions.map((tx) =>
                                JsonRpcTransformers.transactionTo(tx)
                                    .hash()
                                    .slice(0, 22),
                            ),
                        )}`,
                    );
                },
            },
            {
                id: "sub-new-transaction",
                topic: "new_transaction",
                sub_id: undefined,
                handler: (tx: JsonRpcPoolTransactionEntry) => {
                    logger.debug(
                        `New pending tx: ${tx.transaction.hash.slice(0, 22)}`,
                    );
                    this.db.savePendingPoolTransaction(tx);
                },
            },
            {
                id: "sub-proposed-transaction",
                topic: "proposed_transaction",
                sub_id: undefined,
                handler: (tx: JsonRpcPoolTransactionEntry) => {
                    logger.debug(
                        `new proposing tx: ${tx.transaction.hash.slice(0, 22)} `,
                    );
                    this.db.updateMempoolProposingTransaction(tx);
                },
            },
            {
                id: "sub-rejected-transaction",
                topic: "rejected_transaction",
                sub_id: undefined,
                handler: ([tx, reason]: [
                    JsonRpcPoolTransactionEntry,
                    PoolTransactionReject,
                ]) => {
                    logger.debug(
                        `new rejected tx: ${tx.transaction.hash.slice(0, 22)}, reason: ${JSON.stringify(reason)}`,
                    );
                    this.db.updateMempoolRejectedTransaction(tx, reason);
                },
            },
        ];
        return topics;
    }

    async run() {
        await this.db.cleanOrphanedTransaction(this.httpRpcClient);

        this.ws = new WebSocket(this.ckbRpcUrl);
        const topics = this.createTopicSubscriber();
        this.ws.on("open", () => {
            logger.info(`Connected to CKB node ${this.ckbRpcUrl}`);
            for (const topic of topics) {
                this.ws?.send(
                    JSON.stringify({
                        id: topic.id,
                        jsonrpc: "2.0",
                        method: "subscribe",
                        params: [topic.topic],
                    }),
                );
            }
        });

        this.ws.on("message", (data) => {
            const jsonResponse = JSON.parse(data.toString());
            if (jsonResponse.id) {
                // set the subscribe id for the topic
                const topic = topics.find(
                    (topic) => topic.id === jsonResponse.id,
                );
                if (topic) {
                    topic.sub_id = jsonResponse.result;
                }
            }

            if (jsonResponse.params?.result) {
                const subscriptionId = jsonResponse.params.subscription;
                const topic = topics.find(
                    (topic) => topic.sub_id === subscriptionId,
                );
                if (!topic) {
                    return;
                }

                const result = JSON.parse(jsonResponse.params.result);
                topic.handler(result);
            }
        });

        this.ws.on("error", (error) => {
            logger.error("WebSocket error:", error);
        });

        this.ws.on("close", () => {
            logger.info(`Disconnected from CKB node ${this.ckbRpcUrl}`);

            try {
                logger.info(`doing a reconnect ${this.ckbRpcUrl}`);
                this.ws = new WebSocket(this.ckbRpcUrl);
                this.run();
            } catch (error: unknown) {
                logger.error(
                    `${this.ckbRpcUrl} reconnect failed: ${(error as Error).message}, shutting down...`,
                );
                process.exit(1);
            }
        });
    }
}
