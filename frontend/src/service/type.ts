import { Hex } from "@ckb-ccc/core";

export enum TransactionTypeEnum {
    other = 0,
    ckb,
    udt,
    dob,
    dao,
    rgbpp,
}

export namespace TransactionType {
    export function fromString(s: string): TransactionTypeEnum {
        switch (s) {
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

    export function toBgColor(t: TransactionTypeEnum): string {
        switch (t) {
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
        }
    }
}

export interface Transaction {
    tx_hash: Hex;
    // Add other transaction fields as needed
    size?: Hex;
    fee?: Hex;
}

export interface BlockHeader {
    block_hash: Hex;
    block_number: string;
    // Add other block header fields as needed
}

export interface TipBlockResponse {
    blockHeader: BlockHeader;
    committedTransactions: Transaction[];
    proposedTransactions: Transaction[];
}

export interface ChainSnapshot {
    tipCommittedTransactions: Transaction[];
    pendingTransactions: Transaction[];
    proposingTransactions: Transaction[];
    proposedTransactions: Transaction[];
}
