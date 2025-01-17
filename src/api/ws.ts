import { WebSocketServer, WebSocket } from "ws";
import { logger } from "../util/logger";
import type { DB } from "../db";
import { Server } from "http";

export function createWsServer(httpServer: Server, db: DB) {
    const wss = new WebSocketServer({ server: httpServer });
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
                        const parsedMessage = JSON.parse(message.toString());
                        logger.info(
                            `Received message from WebSocket client: ${JSON.stringify(parsedMessage)}`,
                        );

                        if (parsedMessage.type === "getTipBlockData") {
                            const blockHeader = db.getTipBlockHeader();
                            if (!blockHeader) {
                                ws.send(
                                    JSON.stringify({
                                        error: "No tip block found",
                                    }),
                                );
                                return;
                            }
                            const committedTransactions =
                                db.getCommittedTransactionsByBlock(
                                    blockHeader.block_hash,
                                );
                            const proposedTransactions =
                                db.getProposedTransactionsByBlock(
                                    blockHeader.block_hash,
                                );
                            ws.send(
                                JSON.stringify({
                                    blockHeader,
                                    committedTransactions,
                                    proposedTransactions,
                                }),
                            );
                        } else {
                            ws.send(
                                JSON.stringify({
                                    error: "Unknow message type, Please send `getTipBlockData` for now",
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
            logger.info(`WebSocket server started..`);
        },
    };
}
