import { ApiService } from "./api";
import { Hex } from "@ckb-ccc/core";

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

export class ChainService {
    static async getPendingTransactions(): Promise<Transaction[]> {
        const response = await ApiService.get<Transaction[]>("/pending-txs");
        return response.data || [];
    }

    static async getProposingTransactions(): Promise<Transaction[]> {
        const response = await ApiService.get<Transaction[]>("/proposing-txs");
        return response.data || [];
    }

    static async getRejectedTransactions(): Promise<Transaction[]> {
        const response = await ApiService.get<Transaction[]>("/rejected-txs");
        return response.data || [];
    }

    static async getProposedTransactions(
        blockHash: Hex,
    ): Promise<Transaction[]> {
        const response = await ApiService.get<Transaction[]>(
            `/proposed-txs?blockHash=${blockHash}`,
        );
        return response.data || [];
    }

    static async getCommittedTransactions(
        blockHash: Hex,
    ): Promise<Transaction[]> {
        const response = await ApiService.get<Transaction[]>(
            `/committed-txs?blockHash=${blockHash}`,
        );
        return response.data || [];
    }

    static async getBlockHeader(blockHash: Hex): Promise<BlockHeader | null> {
        const response = await ApiService.get<BlockHeader>(
            `/block-header?blockHash=${blockHash}`,
        );
        return response.data || null;
    }
    5;
    static async getTipBlockHeader(): Promise<BlockHeader | null> {
        const response = await ApiService.get<BlockHeader>("/tip-block-header");
        return response.data || null;
    }

    static async getTipBlockTransactions(): Promise<TipBlockResponse | null> {
        const response =
            await ApiService.get<TipBlockResponse>("/tip-block-txs");
        return response.data || null;
    }

    static async getAllBlockHeaders(
        order: "ASC" | "DESC" = "DESC",
        limit: number = 20,
    ): Promise<BlockHeader[]> {
        const response = await ApiService.get<BlockHeader[]>(
            `/all-block-headers?order=${order}&limit=${limit}`,
        );
        return response.data || [];
    }
}
