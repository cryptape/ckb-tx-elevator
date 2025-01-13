import type { Hex } from "@ckb-ccc/core";
import type { JsonRpcTransaction } from "@ckb-ccc/core/advancedBarrel";

export interface JsonRpcTransactionView extends JsonRpcTransaction {
    hash: Hex;
}

export interface JsonRpcPoolTransactionEntry {
    transaction: JsonRpcTransactionView;
    cycles: Hex;
    size: Hex;
    fee: Hex;
    timestamp: Hex;
}

export interface PoolTransactionReject {
    type: PoolTransactionRejectType;
    description: string;
}

export enum PoolTransactionRejectType {
    LowFeeRate = "LowFeeRate", // transaction fee lower than config
    ExceededMaximumAncestorsCount = "ExceededMaximumAncestorsCount", // Transaction exceeded maximum ancestors count limit
    ExceededTransactionSizeLimit = "ExceededTransactionSizeLimit", // Transaction exceeded maximum size limit
    Full = "Full", // Transaction are replaced because the pool is full
    Duplicated = "Duplicated", // Transaction already exists in transaction_pool
    Malformed = "Malformed", // Malformed transaction
    DeclaredWrongCycles = "DeclaredWrongCycles", // Declared wrong cycles
    Resolve = "Resolve", // Resolve failed
    Verification = "Verification", // Verification failed
    Expiry = "Expiry", // Transaction expired
    RBFRejected = "RBFRejected", // RBF rejected
    Invalidated = "Invalidated", // Invalidated rejected
}

export type DBBlockHeader = {
    id: number;
    compact_target: Hex;
    dao: Hex;
    epoch: Hex;
    extra_hash: Hex;
    block_hash: Hex;
    nonce: Hex;
    block_number: Hex;
    parent_hash: Hex;
    proposals_hash: Hex;
    timestamp: number;
    transactions_root: Hex;
    version: Hex;
};
