import type { Hex } from "@ckb-ccc/core";
import cors from "cors";
import express, { type Request, type Response, type Express } from "express";
import { Config } from "../core/config";
import type { DB } from "../db";
import { logger } from "../util/logger";
import { Server } from "http";

export function createHttpServer(db: DB): {
    app: Express;
    start: (port: number) => Server;
} {
    const app = express();

    app.use(
        cors({
            origin: Config.allowOrigin,
            methods: "GET, POST, PUT, DELETE",
            allowedHeaders: "Content-Type",
        }),
    );

    app.get("/pending-txs", async (_req: Request, res: Response) => {
        const transactions = db.getPendingTransactions();
        res.json(transactions);
    });

    app.get("/proposing-txs", async (_req: Request, res: Response) => {
        const transactions = db.getProposingTransactions();
        res.json(transactions);
    });

    app.get("/rejected-txs", async (_req: Request, res: Response) => {
        const transactions = db.getRejectedTransactions();
        res.json(transactions);
    });

    app.get("/proposed-txs", async (_req: Request, res: Response) => {
        const transactions = db.getProposedTransactions();
        res.json(transactions);
    });

    app.get("/proposed-txs-by-block", async (req: Request, res: Response) => {
        const blockHash = req.query.blockHash as Hex;
        const transactions = db.getProposedTransactionsByBlock(blockHash);
        res.json(transactions);
    });

    app.get("/committed-txs", async (req: Request, res: Response) => {
        const blockHash = req.query.blockHash as Hex;
        const transactions = db.getCommittedTransactionsByBlock(blockHash);
        res.json(transactions);
    });

    app.get("/block-header", async (req: Request, res: Response) => {
        const blockHash = req.query.blockHash as Hex;
        const blockHeader = db.getBlockHeaderByHash(blockHash);
        res.json(blockHeader);
    });

    app.get("/tip-block-header", async (_req: Request, res: Response) => {
        const blockHeader = db.getTipBlockHeader();
        res.json(blockHeader);
    });

    app.get("/tip-block-txs", async (_req: Request, res: Response) => {
        const blockHeader = db.getTipBlockHeader();
        if (!blockHeader) {
            res.json({
                error: "No tip block found",
            });
            return;
        }

        const committedTransactions = db.getCommittedTransactionsByBlock(
            blockHeader.block_hash,
        );
        const proposedTransactions = db.getProposedTransactionsByBlock(
            blockHeader.block_hash,
        );
        res.json({
            blockHeader,
            committedTransactions,
            proposedTransactions,
        });
    });

    app.get("/all-block-headers", async (req: Request, res: Response) => {
        const order = req.query.order as "ASC" | "DESC";
        const limit = +(req.query.limit || 20);
        const blockHeaders = db.getBlockHeaders(order, limit);
        res.json(blockHeaders);
    });

    app.get("/", (_req: Request, res: Response) => {
        res.send("Welcome to CKB TX Elevator API!");
    });

    return {
        app,
        start: (port: number) => {
            return app.listen(port, () => {
                logger.info(`Server is running on http://localhost:${port}`);
            });
        },
    };
}
