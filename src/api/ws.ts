import type { Server } from "node:http";
import { type WebSocket, WebSocketServer } from "ws";
import { BlockEmitter, SnapshotEmitter } from "../core/emitter";
import type { Network } from "../core/type";
import type { DB } from "../db";
import { logger } from "../util/logger";
import {
    type SubMessage,
    type SubMessageContent,
    SubMessageType,
} from "./type";

export function createWsServer(httpServer: Server, network: Network, db: DB) {
    const wss = new WebSocketServer({ server: httpServer });

    const snapshotEmitter = new SnapshotEmitter({ network, db });
    snapshotEmitter.startWorker();

    const blockEmitter = new BlockEmitter({ network, db });
    blockEmitter.startWorker();

    return {
        wss,
        start: () => {
            wss.on("connection", (ws: WebSocket) => {
                let myListeners: Partial<
                    Record<SubMessageType, (data: SubMessageContent) => void>
                > = {};
                logger.info("Client connected via WebSocket");

                ws.send(
                    JSON.stringify({
                        message: "Welcome to CKB TX Elevator API via WebSocket",
                    }),
                );

                const cleanupListeners = () => {
                    if (myListeners) {
                        for (const [type, callback] of Object.entries(
                            myListeners,
                        )) {
                            if (!callback) return;

                            if (type === SubMessageType.NewSnapshot) {
                                snapshotEmitter
                                    .getEmitter()
                                    .off(type, callback);
                            } else if (type === SubMessageType.NewBlock) {
                                blockEmitter.getEmitter().off(type, callback);
                            }
                        }
                        myListeners = {};
                    }
                };

                ws.on("message", async (message) => {
                    try {
                        const parsedMessage: SubMessage = JSON.parse(
                            message.toString(),
                        );
                        logger.info(
                            `Received message from WebSocket client: ${JSON.stringify(parsedMessage)}`,
                        );

                        switch (parsedMessage.type) {
                            case SubMessageType.NewSnapshot: {
                                // 先清理旧监听器
                                if (myListeners?.[SubMessageType.NewSnapshot]) {
                                    snapshotEmitter
                                        .getEmitter()
                                        .off(
                                            SubMessageType.NewSnapshot,
                                            myListeners[
                                                SubMessageType.NewSnapshot
                                            ],
                                        );
                                }

                                // 创建新回调
                                const callback = (
                                    snapshot: SubMessageContent,
                                ) => {
                                    ws.send(
                                        JSON.stringify({
                                            type: SubMessageType.NewSnapshot,
                                            data: snapshot,
                                        }),
                                    );
                                };

                                // 注册新监听器
                                snapshotEmitter
                                    .getEmitter()
                                    .on(SubMessageType.NewSnapshot, callback);

                                // 保存回调引用
                                myListeners[SubMessageType.NewSnapshot] =
                                    callback;
                                break;
                            }

                            case SubMessageType.NewBlock: {
                                if (myListeners?.[SubMessageType.NewBlock]) {
                                    blockEmitter
                                        .getEmitter()
                                        .off(
                                            SubMessageType.NewBlock,
                                            myListeners[
                                                SubMessageType.NewBlock
                                            ],
                                        );
                                }

                                const callback = (block: SubMessageContent) => {
                                    ws.send(
                                        JSON.stringify({
                                            type: SubMessageType.NewBlock,
                                            data: block,
                                        }),
                                    );
                                };

                                blockEmitter
                                    .getEmitter()
                                    .on(SubMessageType.NewBlock, callback);

                                myListeners[SubMessageType.NewBlock] = callback;
                                break;
                            }

                            case SubMessageType.UnSubscribe: {
                                const unsubscribeType = parsedMessage.content;
                                if (
                                    unsubscribeType !==
                                        SubMessageType.NewSnapshot &&
                                    unsubscribeType !== SubMessageType.NewBlock
                                ) {
                                    ws.send(
                                        JSON.stringify({
                                            error: `Invalid unsubscribe type: ${unsubscribeType}`,
                                        }),
                                    );
                                    return;
                                }

                                const callback = myListeners?.[unsubscribeType];
                                if (callback) {
                                    if (
                                        unsubscribeType ===
                                        SubMessageType.NewSnapshot
                                    ) {
                                        snapshotEmitter
                                            .getEmitter()
                                            .off(unsubscribeType, callback);
                                    } else {
                                        blockEmitter
                                            .getEmitter()
                                            .off(unsubscribeType, callback);
                                    }
                                    delete myListeners[unsubscribeType];
                                    ws.send(
                                        JSON.stringify({
                                            message: `Unsubscribed from ${unsubscribeType}`,
                                        }),
                                    );
                                } else {
                                    ws.send(
                                        JSON.stringify({
                                            message: `No active subscription for ${unsubscribeType}`,
                                        }),
                                    );
                                }
                                break;
                            }

                            default:
                                ws.send(
                                    JSON.stringify({
                                        error: `Unknown message type: ${parsedMessage.type}`,
                                    }),
                                );
                                break;
                        }
                    } catch (e) {
                        logger.error("Error handling WebSocket message:", e);
                        ws.send(
                            JSON.stringify({
                                error: `Error handling message: ${e instanceof Error ? e.message : String(e)}`,
                            }),
                        );
                    }
                });

                ws.on("close", () => {
                    logger.info("Client disconnected from WebSocket");
                    cleanupListeners();
                });

                ws.on("error", (error) => {
                    logger.error("WebSocket error:", error);
                    cleanupListeners();
                });
            });
            logger.info("WebSocket server started..");
        },
    };
}
