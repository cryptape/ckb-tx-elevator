import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Hex } from "@ckb-ccc/core";
import sqlite3 from "better-sqlite3";
import type { Database } from "better-sqlite3";
import type { JsonRpcPoolTransactionEntry } from "../type";
import { DepType, HashType, TransactionStatus } from "./type";
import { JsonRpcBlockHeader } from "@ckb-ccc/core/dist.commonjs/advancedBarrel";
import { getNowTimestamp } from "../util/time";

export class DB {
    private db: Database;

    constructor(dbPath: string) {
        this.db = sqlite3(dbPath);
        this.initTables();
    }

    private initTables(): void {
        // Read SQL from file
        const sqlPath = join(__dirname, "table.sql");
        const sqlContent = readFileSync(sqlPath, "utf-8");

        // Execute SQL statements
        this.db.exec(sqlContent);
    }

    private saveTransactionRelatedData(
        tx: JsonRpcPoolTransactionEntry,
        txId: DBId,
    ) {
        // Insert cell deps
        const cellDepStmt = this.db.prepare<[DBId, Hex, number, DepType]>(`
		INSERT INTO cell_dep (transaction_id, o_tx_hash, o_index, dep_type)
		VALUES (?, ?, ?, ?)
	    `);
        tx.transaction.cell_deps.forEach((dep) => {
            cellDepStmt.run(
                txId,
                dep.out_point.tx_hash,
                +dep.out_point.index,
                DepType.fromString(dep.dep_type),
            );
        });

        // Insert header deps
        const headerDepStmt = this.db.prepare<[DBId, Hex]>(`
		INSERT INTO header_dep (transaction_id, header_hash)
		VALUES (?, ?)
	    `);
        tx.transaction.header_deps.forEach((hash) => {
            headerDepStmt.run(txId, hash);
        });

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
        tx.transaction.inputs.forEach((input) => {
            inputStmt.run(
                txId,
                input.previous_output.tx_hash,
                +input.previous_output.index,
                input.since,
            );
        });

        // Insert outputs
        const outputStmt = this.db.prepare<
            [DBId, Hex, DBId, DBId | undefined, string]
        >(`
		INSERT INTO output (transaction_id, capacity, lock_script_id, type_script_id, o_data)
		VALUES (?, ?, ?, ?, ?)
	    `);
        tx.transaction.outputs.forEach((output, index) => {
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

            const data = tx.transaction.outputs_data[index];

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
        const txStmt = this.db.prepare<
            [Hex, Hex, Hex, Hex, Hex, string, TransactionStatus, number]
        >(`
            INSERT INTO transactions (
                tx_hash, cycles, size, fee, version, witnesses, status, enter_pool_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // Start a transaction for atomic operations
        this.db.transaction(() => {
            // Insert main transaction
            const result = txStmt.run(
                tx.transaction.hash,
                tx.cycles,
                tx.size,
                tx.fee,
                tx.transaction.version,
                JSON.stringify(tx.transaction.witnesses),
                TransactionStatus.Pending,
                +tx.timestamp,
            );
            const txId = result.lastInsertRowid;

            // insert into other tables, eg: cell_dep, header_dep, input, output
            this.saveTransactionRelatedData(tx, txId);
        })();
    }

    saveProposedPoolTransaction(tx: JsonRpcPoolTransactionEntry) {
        const txStmt = this.db.prepare<
            [Hex, Hex, Hex, Hex, Hex, string, TransactionStatus, number]
        >(`
	INSERT INTO transactions (
	    tx_hash, cycles, size, fee, version, witnesses, status, proposed_at
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

        // Start a transaction for atomic operations
        this.db.transaction(() => {
            // Insert main transaction
            const result = txStmt.run(
                tx.transaction.hash,
                tx.cycles,
                tx.size,
                tx.fee,
                tx.transaction.version,
                JSON.stringify(tx.transaction.witnesses),
                TransactionStatus.Proposed,
                getNowTimestamp(),
            );
            const txId = result.lastInsertRowid;

            // insert into other tables, eg: cell_dep, header_dep, input, output
            this.saveTransactionRelatedData(tx, txId);
        })();
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
        blockHash: Hex,
        blockTimestamp: number,
    ) {
        const stmt = this.db.prepare<[TransactionStatus, Hex, number, Hex]>(`
	    UPDATE transactions
	    SET status = ?, proposed_at_block_hash = ?, proposed_at = ?
	    WHERE tx_hash LIKE ? || '%'
	`);
        stmt.run(TransactionStatus.Proposed, blockHash, blockTimestamp, txPid);
    }

    updateMempoolProposedTransaction(tx: JsonRpcPoolTransactionEntry) {
        const getStmt = this.db.prepare<[Hex], { id: DBId }>(
            `SELECT id From transactions WHERE tx_hash = ?`,
        );
        const txId = getStmt.get(tx.transaction.hash)?.id;
        if (txId) {
            const stmt = this.db.prepare<[TransactionStatus, number, DBId]>(`
			UPDATE transactions 	
			SET status = ?, proposed_at = ?
			WHERE id = ?
			`);
            return stmt.run(
                TransactionStatus.Proposed,
                getNowTimestamp(),
                txId,
            );
        }

        return this.saveProposedPoolTransaction(tx);
    }

    updateCommittedTransaction(
        txHash: Hex,
        blockHash: Hex,
        blockTimestamp: number,
    ) {
        const stmt = this.db.prepare<[TransactionStatus, Hex, number, Hex]>(`
	    UPDATE transactions
	    SET status = ?, committed_at_block_hash = ?, committed_at = ?
	    WHERE tx_hash = ? 
	`);
        stmt.run(
            TransactionStatus.Committed,
            blockHash,
            blockTimestamp,
            txHash,
        );
    }

    listAllTransactions() {
        const stmt = this.db.prepare(`
	    SELECT * FROM transactions
	`);

        return stmt.all();
    }

    close(): void {
        this.db.close();
    }
}

export type DBId = number | bigint;
