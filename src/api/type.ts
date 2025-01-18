import type { ChainSnapshot, DBBlockHeader, DBTransaction } from "../db/type";

export enum SubMessageType {
    NewSnapshot = "newSnapshot",
    NewBlock = "newBlock",
}

export type SubMessageContent = ChainSnapshot | SubBlock | string;

export interface SubMessage {
    type: SubMessageType;
    content: SubMessageContent;
}

export interface SubBlock {
    blockHeader: DBBlockHeader;
    committedTransactions: DBTransaction[];
    proposedTransactions: DBTransaction[];
}
