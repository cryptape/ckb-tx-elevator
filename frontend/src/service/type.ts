import { Hex } from "@ckb-ccc/core";

export enum Network {
    Mainnet = "mainnet",
    Testnet = "testnet",
}

export enum TransactionStatus {
    Pending = 0,
    Proposing = 1,
    Proposed = 2,
    Committed = 3,
    Rejected = 4,
}

export enum TransactionTypeEnum {
    other = 0,
    cellbase = 1,
    ckb = 2,
    udt = 3,
    dob = 4,
    dao = 5,
    rgbpp = 6,
}

export namespace TransactionType {
    export function fromString(s: string): TransactionTypeEnum {
        switch (s) {
            case "Cellbase":
                return TransactionTypeEnum.cellbase;
            case "CKB":
                return TransactionTypeEnum.ckb;
            case "UDT":
                return TransactionTypeEnum.udt;
            case "DOB":
                return TransactionTypeEnum.dob;
            case "DAO":
                return TransactionTypeEnum.dao;
            case "RGB++":
                return TransactionTypeEnum.rgbpp;
            case "Other":
                return TransactionTypeEnum.other;
            default:
                return TransactionTypeEnum.other;
        }
    }

    export function toString(t: TransactionTypeEnum): string {
        switch (t) {
            case TransactionTypeEnum.cellbase:
                return "Cellbase";
            case TransactionTypeEnum.ckb:
                return "CKB";
            case TransactionTypeEnum.udt:
                return "UDT";
            case TransactionTypeEnum.dob:
                return "DOB";
            case TransactionTypeEnum.dao:
                return "DAO";
            case TransactionTypeEnum.rgbpp:
                return "RGB++";
            case TransactionTypeEnum.other:
                return "Other";
        }
    }

    export function toBgTailwindCSS(t: TransactionTypeEnum): string {
        switch (t) {
            case TransactionTypeEnum.cellbase:
                return "bg-box-pink";
            case TransactionTypeEnum.ckb:
                return "bg-box-blue";
            case TransactionTypeEnum.udt:
                return "bg-box-lavender";
            case TransactionTypeEnum.dob:
                return "bg-box-orange";
            case TransactionTypeEnum.dao:
                return "bg-box-mint";
            case TransactionTypeEnum.rgbpp:
                return "bg-box-rgb";
            case TransactionTypeEnum.other:
                return "bg-box-beige";

            default:
                return "bg-box-beige";
        }
    }

    export function toBgColor(t: TransactionTypeEnum): string {
        switch (t) {
            case TransactionTypeEnum.cellbase:
                return "#E48F9C";
            case TransactionTypeEnum.ckb:
                return "#8FC0CF";
            case TransactionTypeEnum.udt:
                return "#B18FCF";
            case TransactionTypeEnum.dob:
                return "#DD8A51";
            case TransactionTypeEnum.dao:
                return "#AAFAC8";
            case TransactionTypeEnum.rgbpp:
                return "#65E3D8";
            case TransactionTypeEnum.other:
                return "#B1AA8E";

            default:
                return "black";
        }
    }
}

export interface Transaction {
    tx_hash: Hex; // TEXT UNIQUE NOT NULL
    cycles?: Hex; // TEXT, optional
    size?: Hex; // TEXT, optional
    fee?: Hex; // TEXT, optional
    version?: Hex; // TEXT, optional
    witnesses: string; // TEXT NOT NULL
    type?: string; // TEXT, optional
    status: TransactionStatus; // INTEGER NOT NULL (0: pending, 1: proposing, 2: proposed, 3: committed, 4: rejected)
    enter_pool_at?: number; // DATETIME, optional
    proposing_at?: number; // DATETIME, optional
    proposed_at?: number; // DATETIME, optional
    proposed_at_block_hash?: Hex; // TEXT, optional
    proposed_at_block_number?: Hex; // TEXT, optional
    committed_at?: number; // DATETIME, optional
    committed_at_block_hash?: Hex; // TEXT, optional
    committed_at_block_number?: Hex; // TEXT, optional
    rejected_at?: number; // DATETIME, optional
    rejected_reason?: string; // TEXT, optional
    timestamp: number; // DATETIME DEFAULT CURRENT_TIMESTAMP, optional
}

export interface BlockHeader {
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
}

export interface TipBlockResponse {
    blockHeader: BlockHeader;
    committedTransactions: Transaction[];
    proposedTransactions: Transaction[];
}

export interface BlockResponse {
    blockHeader: BlockHeader;
    transactions: Transaction[];
    proposalTransactions: Transaction[];
    miner: MinerInfo;
}

export interface MinerInfo {
    address?: string;
    lockScript?: DBScript;
    award?: Hex;
}

export interface DBScript {
    code_hash: Hex;
    hash_type: HashType;
    args: Hex;
}

export enum HashType {
    Data = 0,
    Type = 1,
    Data1 = 2,
    Data2 = 4,
}

export interface ChainSnapshot {
    tipCommittedTransactions: Transaction[];
    pendingTransactions: Transaction[];
    proposingTransactions: Transaction[];
    proposedTransactions: Transaction[];
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
