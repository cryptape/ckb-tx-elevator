import type { Server } from "node:http";
import { type WebSocket, WebSocketServer } from "ws";
import { BlockEmitter, SnapshotEmitter } from "../core/emitter";
import type { DB } from "../db";
import { logger } from "../util/logger";
import {
    type SubMessage,
    type SubMessageContent,
    SubMessageType,
} from "./type";

export function createWsServer(httpServer: Server, db: DB) {
    const wss = new WebSocketServer({ server: httpServer });

    const snapshotEmitter = new SnapshotEmitter({ db });
    snapshotEmitter.startWorker();

    const blockEmitter = new BlockEmitter({ db });
    blockEmitter.startWorker();

    return {
        wss,
        start: () => {
            wss.on("connection", (ws: WebSocket) => {
                logger.info("Client connected via WebSocket");
                ws.send(
                    JSON.stringify({
                        message: "Welcome to CKB TX Elevator API via WebSocket",
                    }),
                );

                ws.on("message", async (message) => {
                    try {
                        const parsedMessage: SubMessage = JSON.parse(
                            message.toString(),
                        );
                        logger.info(
                            `Received message from WebSocket client: ${JSON.stringify(parsedMessage)}`,
                        );

                        switch (parsedMessage.type) {
                            case SubMessageType.NewSnapshot:
                                snapshotEmitter
                                    .getEmitter()
                                    .on(
                                        SubMessageType.NewSnapshot,
                                        (snapshot: SubMessageContent) => {
                                            ws.send(
                                                JSON.stringify({
                                                    type: SubMessageType.NewSnapshot,
                                                    data: snapshot,
                                                }),
                                            );
                                        },
                                    );
                                break;

                            case SubMessageType.NewBlock:
                                blockEmitter
                                    .getEmitter()
                                    .on(
                                        SubMessageType.NewBlock,
                                        (block: SubMessageContent) => {
                                            ws.send(
                                                JSON.stringify({
                                                    type: SubMessageType.NewBlock,
                                                    data: block,
                                                }),
                                            );
                                        },
                                    );
                                break;
                            default:
                                ws.send(
                                    JSON.stringify({
                                        error: `Unknown message type, Please send ${SubMessageType.NewSnapshot} for now`,
                                    }),
                                );
                                break;
                        }
                    } catch (e) {
                        logger.error("Error handling WebSocket message:", e);
                        ws.send(
                            JSON.stringify({
                                error: `Error handling WebSocket message : ${e}`,
                            }),
                        );
                    }
                });

                ws.on("close", () => {
                    logger.info("Client disconnected from WebSocket");
                });

                ws.on("error", (error) => {
                    logger.error("WebSocket error:", error);
                });
            });
            logger.info("WebSocket server started..");
        },
    };
}
