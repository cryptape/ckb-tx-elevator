import type { Hex } from "@ckb-ccc/core";
import type { Network } from "../core/type";
import type { ChainSnapshot, DBBlockHeader, DBTransaction } from "../db/type";

export enum SubMessageType {
    NewSnapshot = "newSnapshot",
    NewBlock = "newBlock",
}

export type SubMessageContent = ChainSnapshot | SubBlock | string;

export interface SubMessage {
    network: Network;
    type: SubMessageType;
    content: SubMessageContent;
}

export interface SubBlock {
    blockHeader: DBBlockHeader;
    committedTransactions: DBTransaction[];
    proposedTransactions: DBTransaction[];
}

export interface ChainStats {
    averageBlockTime: number;
    chainInfo: {
        alerts: Array<string>;
        chain: string;
        difficulty: Hex;
        epoch: Hex;
        is_initial_block_download: boolean;
        median_time: Hex;
    };
    feeRate: Hex;
}

export interface PoolInfo {
    last_txs_updated_at: Hex;
    max_tx_pool_size: Hex;
    min_fee_rate: Hex;
    min_rbf_rate: Hex;
    orphan: Hex;
    pending: Hex;
    proposed: Hex;
    tip_hash: Hex;
    tip_number: Hex;
    total_tx_cycles: Hex;
    total_tx_size: Hex;
    tx_size_limit: Hex;
    verify_queue_size: Hex;
}
