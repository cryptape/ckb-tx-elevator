import type { Hex } from "@ckb-ccc/core";

export type DBId = number | bigint;

export type DBBlockHeader = {
    id: DBId;
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

export interface DBTransaction {
    id: DBId; // INTEGER PRIMARY KEY AUTOINCREMENT
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

export interface TransactionSnapshot {
    timestamp: number; // last modify time
    txHash: string;
    status: TransactionStatus;
}

export interface ChainSnapshot {
    tipBlock: {
        blockHeader: DBBlockHeader;
        tipCommittedTransactions: DBTransaction[];
        tipProposedTransactions: DBTransaction[];
    };
    pendingTransactions: DBTransaction[];
    proposingTransactions: DBTransaction[];
    proposedTransactions: DBTransaction[];
}

export enum TransactionStatus {
    Pending = 0,
    Proposing = 1,
    Proposed = 2,
    Committed = 3,
    Rejected = 4,
}

// Add this namespace with the same name as the enum
export namespace TransactionStatus {
    export function toString(status: TransactionStatus): string {
        switch (status) {
            case TransactionStatus.Pending:
                return "Pending";

            case TransactionStatus.Proposing:
                return "Proposing";

            case TransactionStatus.Proposed:
                return "Proposed";

            case TransactionStatus.Committed:
                return "Committed";

            case TransactionStatus.Rejected:
                return "Rejected";

            default:
                throw new Error(`Invalid status: ${status}`);
        }
    }

    export function fromString(status: string): TransactionStatus {
        switch (status) {
            case "Pending":
                return TransactionStatus.Pending;

            case "Proposing":
                return TransactionStatus.Proposing;

            case "Proposed":
                return TransactionStatus.Proposed;

            case "Committed":
                return TransactionStatus.Committed;

            case "Rejected":
                return TransactionStatus.Rejected;

            default:
                throw new Error(`Invalid status: ${status}`);
        }
    }
}

export enum DepType {
    Code = 0,
    DepGroup = 1,
}

export namespace DepType {
    export function toString(depType: DepType): string {
        switch (depType) {
            case DepType.Code:
                return "code";

            case DepType.DepGroup:
                return "dep_group";

            default:
                throw new Error(`Invalid depType: ${depType}`);
        }
    }

    export function fromString(depType: string): DepType {
        switch (depType) {
            case "code":
                return DepType.Code;

            case "dep_group":
                return DepType.DepGroup;

            default:
                throw new Error(`Invalid depType: ${depType}`);
        }
    }
}

export enum HashType {
    Data = 0,
    Type = 1,
    Data1 = 2,
    Data2 = 4,
}

export namespace HashType {
    export function toString(hashType: HashType): string {
        switch (hashType) {
            case HashType.Data:
                return "data";

            case HashType.Type:
                return "type";

            case HashType.Data1:
                return "data1";

            case HashType.Data2:
                return "data2";

            default:
                throw new Error(`Invalid hashType: ${hashType}`);
        }
    }

    export function fromString(hashType: string): HashType {
        switch (hashType) {
            case "data":
                return HashType.Data;

            case "type":
                return HashType.Type;

            case "data1":
                return HashType.Data1;

            case "data2":
                return HashType.Data2;

            default:
                throw new Error(`Invalid hashType: ${hashType}`);
        }
    }
}
