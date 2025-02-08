import type { Server } from "node:http";
import type { Hex } from "@ckb-ccc/core";
import { ccc } from "@ckb-ccc/core";
import cors from "cors";
import express, { type Request, type Response, type Express } from "express";
import { Config } from "../core/config";
import type { DB } from "../db";
import { TransactionTypeEnum } from "../db/type";
import { logger } from "../util/logger";
import { calcAverageBlockTime } from "../util/time";
import type { MinerInfo, PoolInfo } from "./type";

export function createHttpServer(
    db: DB,
    rpcClient: ccc.ClientJsonRpc,
): {
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

    app.get("/block", async (req: Request, res: Response) => {
        const blockHash = req.query.blockHash as Hex;
        const blockHeader = db.getBlockHeaderByHash(blockHash);
        const transactions = db.getCommittedTransactionsByBlock(blockHash);
        const proposalTransactions =
            db.getProposedTransactionsByBlock(blockHash);

        const miner: MinerInfo = {
            address: undefined,
            lockScript: undefined,
            award: undefined,
        };
        const cellbaseTx = transactions.find(
            (tx) => tx.type === TransactionTypeEnum.cellbase,
        );
        if (cellbaseTx) {
            const info = db.getMinerInfo(cellbaseTx.tx_hash);
            miner.lockScript = info?.lockScript;
            miner.award = info?.award;
            if (info?.lockScript) {
                const minerAddress = ccc.Address.fromScript(
                    {
                        codeHash: info.lockScript.code_hash,
                        hashType: info.lockScript.hash_type,
                        args: info.lockScript.args,
                    },
                    rpcClient,
                );
                miner.address = minerAddress.toString();
            }
        }
        res.json({
            blockHeader,
            transactions,
            proposalTransactions,
            miner,
            cellbaseTx,
        });
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

    app.get("/tx-by-hash", async (req: Request, res: Response) => {
        const txHash = req.query.tx_hash;
        if (
            typeof txHash !== "string" ||
            txHash.startsWith("0x") === false ||
            txHash.length !== 66
        ) {
            res.json(`illegal tx_hash: ${txHash}`);
        } else {
            const tx = db.getTransactionByHash(txHash as Hex);
            res.json(tx);
        }
    });

    app.get("/chain-stats", async (_req: Request, res: Response) => {
        const last20Blocks = db.getBlockHeaders("DESC", 20);
        const times = last20Blocks.map((block) => block.timestamp);
        const averageBlockTime = calcAverageBlockTime(times);
        const [chainInfo, feeRate] = await Promise.all([
            rpcClient.buildSender("get_blockchain_info", [])(),
            rpcClient.buildSender("estimate_fee_rate", [])(),
        ]);
        res.json({
            averageBlockTime,
            chainInfo,
            feeRate,
        });
    });

    app.get("/pool-info", async (_req: Request, res: Response) => {
        const poolInfo = (await rpcClient.buildSender(
            "tx_pool_info",
            [],
        )()) as PoolInfo;
        res.json(poolInfo);
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
