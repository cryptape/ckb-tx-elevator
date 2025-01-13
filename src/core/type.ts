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
