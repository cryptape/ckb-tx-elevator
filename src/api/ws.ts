import type { Server } from "node:http";
import { type WebSocket, WebSocketServer } from "ws";
import type { DB } from "../db";
import { logger } from "../util/logger";
import { SnapshotEmitter } from "./emitter";
import {
    type SubMessage,
    type SubMessageContent,
    SubMessageType,
} from "./type";

export function createWsServer(httpServer: Server, db: DB) {
    const wss = new WebSocketServer({ server: httpServer });

    const snapshotEmitter = new SnapshotEmitter({ db });
    snapshotEmitter.startWorker();

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

                        if (parsedMessage.type === SubMessageType.NewSnapshot) {
                            snapshotEmitter
                                .getEmitter()
                                .on(
                                    SubMessageType.NewSnapshot,
                                    (snapshot: SubMessageContent) => {
                                        ws.send(
                                            JSON.stringify({
                                                data: snapshot,
                                            }),
                                        );
                                    },
                                );
                        } else {
                            ws.send(
                                JSON.stringify({
                                    error: `Unknown message type, Please send ${SubMessageType.NewSnapshot} for now`,
                                }),
                            );
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
