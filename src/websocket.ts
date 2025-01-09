import {
    JsonRpcTransformers,
    type JsonRpcBlock,
} from "@ckb-ccc/core/dist.commonjs/advancedBarrel";
import { WebSocket } from "ws";
import type { JsonRpcPoolTransactionEntry } from "./type";
import { DB } from "./db";

export async function main() {
    const url = "wss://testnet.ckb.dev/ws"; //"ws://127.0.0.1:28114";
    const ws = new WebSocket(url);
    const db = new DB("./ckb.db");

    console.log(db.listAllTransactions());

    const topics: WebsocketTopicSubscriber[] = [
        {
            id: "sub-new-tip-block",
            topic: "new_tip_block",
            sub_id: undefined,
            handler: (block: JsonRpcBlock) => {
                db.saveBlockHeader(block.header);
                block.proposals.forEach((txPid) => {
                    db.updateBlockProposedTransaction(
                        txPid,
                        block.header.hash,
                        +block.header.timestamp,
                    );
                });
                block.transactions.forEach((tx) => {
                    db.updateCommittedTransaction(
                        JsonRpcTransformers.transactionTo(tx).hash(),
                        block.header.hash,
                        +block.header.timestamp,
                    );
                });

                console.log("block number: ", +block.header.number);
                console.log("proposal txs: ", block.proposals);
                console.log(
                    "committed txs: ",
                    block.transactions.map((tx: any) => tx.hash.slice(0, 22)),
                );
            },
        },
        {
            id: "sub-new-transaction",
            topic: "new_transaction",
            sub_id: undefined,
            handler: (transaction: JsonRpcPoolTransactionEntry) => {
                console.log(
                    `New tx: ${transaction.transaction.hash.slice(0, 22)}`,
                );
                db.savePendingPoolTransaction(transaction);
            },
        },
        {
            id: "sub-proposed-transaction",
            topic: "proposed_transaction",
            sub_id: undefined,
            handler: (transaction: JsonRpcPoolTransactionEntry) => {
                console.log("proposed tx: ", transaction);
                db.updateMempoolProposedTransaction(transaction);
            },
        },
        {
            id: "sub-rejected-transaction",
            topic: "rejected_transaction",
            sub_id: undefined,
            handler: ([transaction, reason]: [
                JsonRpcPoolTransactionEntry,
                string,
            ]) => {
                console.log("rejected tx: ", transaction, reason);
            },
        },
    ];

    ws.on("open", () => {
        console.log("Connected to CKB node");
        for (const topic of topics) {
            ws.send(
                JSON.stringify({
                    id: topic.id,
                    jsonrpc: "2.0",
                    method: "subscribe",
                    params: [topic.topic],
                }),
            );
        }
    });

    ws.on("message", (data) => {
        const jsonResponse = JSON.parse(data.toString());
        if (jsonResponse.id) {
            // set the subscribe id for the topic
            const topic = topics.find((topic) => topic.id === jsonResponse.id);
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

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });

    ws.on("close", () => {
        console.log("Disconnected from CKB node");
    });
}

process.on("SIGINT", () => {
    console.log("Closing connection...");
    process.exit(0);
});

export interface WebsocketTopicSubscriber {
    id: string;
    topic: string;
    sub_id: string | undefined;
    handler: (data: any) => void;
}
