import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Hex } from "@ckb-ccc/core";
import {
    type JsonRpcBlockHeader,
    type JsonRpcTransaction,
    JsonRpcTransformers,
} from "@ckb-ccc/core/advancedBarrel";
import sqlite3 from "better-sqlite3";
import type { Database } from "better-sqlite3";
import type {
    JsonRpcPoolTransactionEntry,
    JsonRpcTransactionView,
    Network,
    PoolTransactionReject,
} from "../core/type";
import { calcTxSize, isCellBaseTx } from "../util/chain";
import { logger } from "../util/logger";
import { getNowTimestamp } from "../util/time";
import {
    type ChainSnapshot,
    type DBBlockHeader,
    type DBId,
    type DBTransaction,
    DepType,
    HashType,
    type TransactionSnapshot,
    TransactionStatus,
    TransactionType,
    type TransactionTypeEnum,
} from "./type";

export class DB {
    network: Network;
    private db: Database;

    constructor(network: Network, dbPath: string, opt?: sqlite3.Options) {
        this.network = network;
        this.db = sqlite3(dbPath, opt);
        this.initTables();
    }

    private getTxType(tx: JsonRpcTransaction) {
        return TransactionType.parseFromTransaction(tx, this.network);
    }

    private initTables(): void {
        // Read SQL from file
        const sqlPath = join(__dirname, "table.sql");
        const sqlContent = readFileSync(sqlPath, "utf-8");

        // Execute SQL statements
        this.db.exec(sqlContent);
    }

    private saveTransactionRelatedData(
        transaction: JsonRpcTransactionView,
        txId: DBId,
    ) {
        // Insert cell deps
        const cellDepStmt = this.db.prepare<[DBId, Hex, number, DepType]>(`
		INSERT INTO cell_dep (transaction_id, o_tx_hash, o_index, dep_type)
		VALUES (?, ?, ?, ?)
	    `);
        for (const dep of transaction.cell_deps) {
            cellDepStmt.run(
                txId,
                dep.out_point.tx_hash,
                +dep.out_point.index,
                DepType.fromString(dep.dep_type),
            );
        }

        // Insert header deps
        const headerDepStmt = this.db.prepare<[DBId, Hex]>(`
		INSERT INTO header_dep (transaction_id, header_hash)
		VALUES (?, ?)
	    `);
        for (const hash of transaction.header_deps) {
            headerDepStmt.run(txId, hash);
        }

        // Helper function to insert script and return its ID
        const insertScript = this.db.prepare<
            [Hex, HashType, Hex],
            { id: DBId }
        >(`
		INSERT OR IGNORE INTO script (code_hash, hash_type, args)
		VALUES (?, ?, ?)
		RETURNING id
	    `);

        // Insert inputs
        const inputStmt = this.db.prepare<[DBId, Hex, number, Hex]>(`
		INSERT INTO input (transaction_id, previous_output_tx_hash, previous_output_index, since)
		VALUES (?, ?, ?, ?)
	    `);
        for (const input of transaction.inputs) {
            inputStmt.run(
                txId,
                input.previous_output.tx_hash,
                +input.previous_output.index,
                input.since,
            );
        }

        // Insert outputs
        const outputStmt = this.db.prepare<
            [DBId, Hex, DBId, DBId | undefined, string]
        >(`
		INSERT INTO output (transaction_id, capacity, lock_script_id, type_script_id, o_data)
		VALUES (?, ?, ?, ?, ?)
	    `);
        transaction.outputs.forEach((output, index) => {
            // Insert lock script
            const runResult = insertScript.run(
                output.lock.code_hash,
                HashType.fromString(output.lock.hash_type),
                output.lock.args,
            );
            const lockScriptId = runResult.lastInsertRowid;

            // Insert type script if it exists
            let typeScriptId = undefined;
            if (output.type) {
                const runResult = insertScript.run(
                    output.type.code_hash,
                    HashType.fromString(output.type.hash_type),
                    output.type.args,
                );
                typeScriptId = runResult.lastInsertRowid;
            }

            const data = transaction.outputs_data[index];

            outputStmt.run(
                txId,
                output.capacity,
                lockScriptId,
                typeScriptId,
                data,
            );
        });
    }

    savePendingPoolTransaction(tx: JsonRpcPoolTransactionEntry) {
        const type = this.getTxType(tx.transaction);

        const txStmt = this.db.prepare<
            [
                Hex,
                Hex,
                Hex,
                Hex,
                TransactionTypeEnum,
                Hex,
                string,
                TransactionStatus,
                number,
            ]
        >(`
            INSERT INTO transactions (
                tx_hash, cycles, size, fee, type, version, witnesses, status, enter_pool_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // Start a transaction for atomic operations
        this.db.transaction(() => {
            // Insert main transaction
            const result = txStmt.run(
                tx.transaction.hash,
                tx.cycles,
                tx.size,
                tx.fee,
                type,
                tx.transaction.version,
                JSON.stringify(tx.transaction.witnesses),
                TransactionStatus.Pending,
                +tx.timestamp,
            );
            const txId = result.lastInsertRowid;

            // insert into other tables, eg: cell_dep, header_dep, input, output
            this.saveTransactionRelatedData(tx.transaction, txId);
        })();
    }

    saveProposingPoolTransaction(tx: JsonRpcPoolTransactionEntry) {
        const type = this.getTxType(tx.transaction);

        const txStmt = this.db.prepare<
            [
                Hex,
                Hex,
                Hex,
                Hex,
                TransactionTypeEnum,
                Hex,
                string,
                TransactionStatus,
                number,
            ]
        >(`
	INSERT INTO transactions (
	    tx_hash, cycles, size, fee, type, version, witnesses, status, proposed_at
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        // Start a transaction for atomic operations
        this.db.transaction(() => {
            // Insert main transaction
            const result = txStmt.run(
                tx.transaction.hash,
                tx.cycles,
                tx.size,
                tx.fee,
                type,
                tx.transaction.version,
                JSON.stringify(tx.transaction.witnesses),
                TransactionStatus.Proposing,
                getNowTimestamp(),
            );
            const txId = result.lastInsertRowid;

            // insert into other tables, eg: cell_dep, header_dep, input, output
            this.saveTransactionRelatedData(tx.transaction, txId);
        })();
    }

    saveRejectedPoolTransaction(
        tx: JsonRpcPoolTransactionEntry,
        reason: string,
    ) {
        const type = this.getTxType(tx.transaction);

        const txStmt = this.db.prepare<
            [
                Hex,
                Hex,
                Hex,
                Hex,
                TransactionTypeEnum,
                Hex,
                string,
                TransactionStatus,
                number,
                string,
            ]
        >(`
	INSERT INTO transactions (
	    tx_hash, cycles, size, fee, type, version, witnesses, status, rejected_at, rejected_reason
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`);

        // Start a transaction for atomic operations
        this.db.transaction(() => {
            // Insert main transaction
            const result = txStmt.run(
                tx.transaction.hash,
                tx.cycles,
                tx.size,
                tx.fee,
                type,
                tx.transaction.version,
                JSON.stringify(tx.transaction.witnesses),
                TransactionStatus.Rejected,
                getNowTimestamp(),
                reason,
            );
            const txId = result.lastInsertRowid;

            // insert into other tables, eg: cell_dep, header_dep, input, output
            this.saveTransactionRelatedData(tx.transaction, txId);
        })();
    }

    saveProposedBlockTransaction(
        tx: JsonRpcTransaction,
        blockNumber: Hex,
        blockHash: Hex,
    ) {
        const type = this.getTxType(tx);

        const txStmt = this.db.prepare<
            [
                Hex,
                TransactionTypeEnum,
                Hex,
                string,
                TransactionStatus,
                number,
                Hex,
                Hex,
            ]
        >(`	
	INSERT INTO transactions (
	    tx_hash, type, version, witnesses, status, proposed_at, proposed_at_block_number, proposed_at_block_hash
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	     `);

        const txView: JsonRpcTransactionView = {
            hash: JsonRpcTransformers.transactionTo(tx).hash(),
            ...tx,
        };

        // Start a transaction for atomic operations
        this.db.transaction(() => {
            // Insert main transaction
            const result = txStmt.run(
                txView.hash,
                type,
                txView.version,
                JSON.stringify(txView.witnesses),
                TransactionStatus.Proposed,
                getNowTimestamp(),
                blockNumber,
                blockHash,
            );
            const txId = result.lastInsertRowid;

            // insert into other tables, eg: cell_dep, header_dep, input, output
            this.saveTransactionRelatedData(txView, txId);
        });
    }

    saveCommittedBlockTransaction(
        tx: JsonRpcTransaction,
        blockNumber: Hex,
        blockHash: Hex,
    ) {
        const type = this.getTxType(tx);

        const txStmt = this.db.prepare<
            [
                Hex,
                TransactionTypeEnum,
                Hex,
                Hex,
                string,
                TransactionStatus,
                number,
                Hex,
                Hex,
            ]
        >(`
	INSERT INTO transactions (
	    tx_hash, type, version, size, witnesses, status, committed_at, committed_at_block_number, committed_at_block_hash
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	     `);

        const txView: JsonRpcTransactionView = {
            hash: JsonRpcTransformers.transactionTo(tx).hash(),
            ...tx,
        };

        const txSize: Hex = `0x${calcTxSize(tx).toString(16)}`;

        if (isCellBaseTx(tx)) {
            // CellBase tx is a special case that we don't save the relatedData like inputs and outputs
            logger.debug(`Saving CellBase tx: ${txView.hash}`);
            return txStmt.run(
                txView.hash,
                type,
                txView.version,
                txSize,
                JSON.stringify(txView.witnesses),
                TransactionStatus.Committed,
                getNowTimestamp(),
                blockNumber,
                blockHash,
            );
        }

        // Save normal transaction
        // Start a transaction for atomic operations
        this.db.transaction(() => {
            // Insert main transaction
            const result = txStmt.run(
                txView.hash,
                type,
                txView.version,
                txSize,
                JSON.stringify(txView.witnesses),
                TransactionStatus.Committed,
                getNowTimestamp(),
                blockNumber,
                blockHash,
            );
            const txId = result.lastInsertRowid;

            // insert into other tables, eg: cell_dep, header_dep, input, output
            this.saveTransactionRelatedData(txView, txId);
        });
    }

    saveBlockHeader(header: JsonRpcBlockHeader) {
        const stmt = this.db.prepare<
            [Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex, number, Hex, Hex]
        >(`
	    INSERT INTO block_header (
		compact_target, dao, epoch, extra_hash, block_hash, nonce,
		block_number, parent_hash, proposals_hash, timestamp, transactions_root, version
	    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`);
        stmt.run(
            header.compact_target,
            header.dao,
            header.epoch,
            header.extra_hash,
            header.hash,
            header.nonce,
            header.number,
            header.parent_hash,
            header.proposals_hash,
            +header.timestamp,
            header.transactions_root,
            header.version,
        );
    }

    updateBlockProposedTransaction(
        txPid: Hex,
        blockNumber: Hex,
        blockHash: Hex,
        blockTimestamp: number,
    ) {
        const getStmt = this.db.prepare<[Hex], { id: DBId }>(
            `SELECT id From transactions WHERE tx_hash LIKE ? || '%'`,
        );
        const txId = getStmt.get(txPid)?.id;

        if (txId) {
            const stmt = this.db.prepare<
                [TransactionStatus, Hex, Hex, number, number, Hex]
            >(`
	            UPDATE transactions
	            SET status = ?, proposed_at_block_number = ?, proposed_at_block_hash = ?, proposed_at = ?, timestamp = ?
	            WHERE tx_hash LIKE ? || '%'
	            `);

            return stmt.run(
                TransactionStatus.Proposed,
                blockNumber,
                blockHash,
                blockTimestamp,
                getNowTimestamp(),
                txPid,
            );
        }

        //todo: get transaction from txPid
        console.debug(
            `Transaction query not impl for txPid: ${txPid}, ignored.`,
        );
        //return this.saveProposedBlockTransaction(txPid, blockNumber, blockHash);
    }

    updateMempoolProposingTransaction(tx: JsonRpcPoolTransactionEntry) {
        const getStmt = this.db.prepare<[Hex], { id: DBId }>(
            "SELECT id From transactions WHERE tx_hash = ?",
        );
        const txId = getStmt.get(tx.transaction.hash)?.id;
        if (txId) {
            const stmt = this.db.prepare<
                [TransactionStatus, number, number, DBId]
            >(`
			UPDATE transactions 	
			SET status = ?, proposing_at = ?, timestamp = ?
			WHERE id = ?
			`);
            return stmt.run(
                TransactionStatus.Proposing,
                getNowTimestamp(),
                getNowTimestamp(),
                txId,
            );
        }

        return this.saveProposingPoolTransaction(tx);
    }

    updateMempoolRejectedTransaction(
        tx: JsonRpcPoolTransactionEntry,
        txReject: PoolTransactionReject,
    ) {
        const reason = `${txReject.type}: ${txReject.description}`;
        const getStmt = this.db.prepare<[Hex], { id: DBId }>(
            "SELECT id From transactions WHERE tx_hash = ?",
        );
        const txId = getStmt.get(tx.transaction.hash)?.id;
        if (txId) {
            const stmt = this.db.prepare<
                [TransactionStatus, number, string, number, DBId]
            >(`
		        UPDATE transactions
		        SET status = ?, rejected_at = ?, rejected_reason = ?, timestamp = ?
		        WHERE id = ?
	         `);
            return stmt.run(
                TransactionStatus.Rejected,
                getNowTimestamp(),
                reason,
                getNowTimestamp(),
                txId,
            );
        }

        return this.saveRejectedPoolTransaction(tx, reason);
    }

    updateCommittedTransaction(
        tx: JsonRpcTransaction,
        blockNumber: Hex,
        blockHash: Hex,
        blockTimestamp: number,
    ) {
        const txHash = JsonRpcTransformers.transactionTo(tx).hash();

        const getStmt = this.db.prepare<[Hex], { id: DBId }>(
            "SELECT id From transactions WHERE tx_hash = ?",
        );
        const txId = getStmt.get(txHash)?.id;
        if (txId != null) {
            const stmt = this.db.prepare<
                [TransactionStatus, Hex, Hex, number, number, Hex]
            >(`
	            UPDATE transactions
	            SET status = ?, committed_at_block_number = ?, committed_at_block_hash = ?, committed_at = ?, timestamp = ?
	            WHERE tx_hash = ? 
	        `);
            return stmt.run(
                TransactionStatus.Committed,
                blockNumber,
                blockHash,
                blockTimestamp,
                getNowTimestamp(),
                txHash,
            );
        }

        return this.saveCommittedBlockTransaction(tx, blockNumber, blockHash);
    }

    listAllTransactions() {
        const stmt = this.db.prepare<[], DBTransaction>(`
	        SELECT * FROM transactions
	    `);

        return stmt.all();
    }

    getPendingTransactions() {
        const stmt = this.db.prepare<[], DBTransaction>(`
	        SELECT * FROM transactions WHERE status = '${TransactionStatus.Pending}'
	    `);
        return stmt.all();
    }

    getProposingTransactions() {
        const stmt = this.db.prepare<[], DBTransaction>(`
	        SELECT * FROM transactions WHERE status = '${TransactionStatus.Proposing}'
	    `);
        return stmt.all();
    }

    getRejectedTransactions() {
        const stmt = this.db.prepare<[], DBTransaction>(`
	        SELECT * FROM transactions WHERE status = '${TransactionStatus.Rejected}'
	    `);
        return stmt.all();
    }

    getProposedTransactions() {
        const stmt = this.db.prepare<[], DBTransaction>(`
	        SELECT * FROM transactions WHERE status = '${TransactionStatus.Proposed}'	
	    `);
        return stmt.all();
    }

    getProposedTransactionsByBlock(blockHash: Hex) {
        const stmt = this.db.prepare<[], DBTransaction>(`
	        SELECT * FROM transactions WHERE status = '${TransactionStatus.Proposed}' AND proposed_at_block_hash = '${blockHash}'	
	    `);
        return stmt.all();
    }

    getCommittedTransactionsByBlock(blockHash: Hex) {
        const stmt = this.db.prepare<[], DBTransaction>(`
            SELECT * FROM transactions WHERE status = '${TransactionStatus.Committed}' AND committed_at_block_hash = '${blockHash}'
    	`);
        return stmt.all();
    }

    getTransactionByHash(txHash: Hex) {
        const stmt = this.db.prepare<[], DBTransaction>(`
	        SELECT * FROM transactions WHERE tx_hash = '${txHash}'
	    `);
        return stmt.get();
    }

    getBlockHeaderByHash(blockHash: Hex) {
        const stmt = this.db.prepare<[], DBBlockHeader>(`
	        SELECT * FROM block_header WHERE block_hash = '${blockHash}'
	    `);
        return stmt.get();
    }

    getBlockHeaders(order: "ASC" | "DESC", limit: number) {
        const stmt = this.db.prepare<[], DBBlockHeader>(`
	        SELECT * FROM block_header ORDER BY block_number ${order} LIMIT ${limit}	
	    `);
        return stmt.all();
    }

    getTipBlockHeader() {
        const stmt = this.db.prepare<[], DBBlockHeader>(`
	        SELECT * FROM block_header ORDER BY block_number DESC LIMIT 1	
	    `);
        return stmt.get();
    }

    getTipBlockNumber() {
        const stmt = this.db.prepare<[], Pick<DBBlockHeader, "block_number">>(`
	        SELECT block_number FROM block_header ORDER BY block_number DESC LIMIT 1	
	    `);
        return stmt.get()?.block_number;
    }

    getLastModifiedTransactionSnapshot(excludeStatus?: TransactionStatus) {
        // tx snapshot means the combination of timestamp and tx_hash
        // through this combination, it is possible to identify the latest modify transaction
        if (excludeStatus) {
            const stmt = this.db.prepare<[], TransactionSnapshot>(`
                SELECT timestamp, tx_hash, status FROM transactions WHERE status != '${excludeStatus}' ORDER BY timestamp DESC, id DESC LIMIT 1
            `);
            return stmt.get();
        }

        const stmt = this.db.prepare<[], TransactionSnapshot>(`
            SELECT timestamp, tx_hash, status FROM transactions ORDER BY timestamp DESC, id DESC LIMIT 1
        `);
        return stmt.get();
    }

    async getChainSnapshot(): Promise<ChainSnapshot | null> {
        const blockHeader = this.getTipBlockHeader();
        if (!blockHeader) {
            return null;
        }

        const [
            tipCommittedTransactions,
            pendingTransactions,
            proposingTransactions,
            proposedTransactions,
        ] = await Promise.all([
            this.getCommittedTransactionsByBlock(blockHeader.block_hash),
            this.getPendingTransactions(),
            this.getProposingTransactions(),
            this.getProposedTransactions(),
        ]);

        return {
            tipCommittedTransactions,
            pendingTransactions,
            proposingTransactions,
            proposedTransactions,
        };
    }

    close(): void {
        this.db.close();
    }
}
