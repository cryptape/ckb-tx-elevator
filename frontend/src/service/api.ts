import { HttpApiService } from "./http";
import { Hex } from "@ckb-ccc/core";
import { WsApiService } from "./ws";
import {
    BlockHeader,
    ChainSnapshot,
    TipBlockResponse,
    Transaction,
} from "./type";

export class ChainService {
    static wsClient: WsApiService = new WsApiService({});

    static async getPendingTransactions(): Promise<Transaction[]> {
        const response =
            await HttpApiService.get<Transaction[]>("/pending-txs");
        return response.data || [];
    }

    static async getProposingTransactions(): Promise<Transaction[]> {
        const response =
            await HttpApiService.get<Transaction[]>("/proposing-txs");
        return response.data || [];
    }

    static async getRejectedTransactions(): Promise<Transaction[]> {
        const response =
            await HttpApiService.get<Transaction[]>("/rejected-txs");
        return response.data || [];
    }

    static async getProposedTransactions(): Promise<Transaction[]> {
        const response =
            await HttpApiService.get<Transaction[]>("/proposed-txs");
        return response.data || [];
    }

    static async getProposedTransactionsByBlock(
        blockHash: Hex,
    ): Promise<Transaction[]> {
        const response = await HttpApiService.get<Transaction[]>(
            `/proposed-txs-by-block?blockHash=${blockHash}`,
        );
        return response.data || [];
    }

    static async getCommittedTransactions(
        blockHash: Hex,
    ): Promise<Transaction[]> {
        const response = await HttpApiService.get<Transaction[]>(
            `/committed-txs?blockHash=${blockHash}`,
        );
        return response.data || [];
    }

    static async getBlockHeader(blockHash: Hex): Promise<BlockHeader | null> {
        const response = await HttpApiService.get<BlockHeader>(
            `/block-header?blockHash=${blockHash}`,
        );
        return response.data || null;
    }
    5;
    static async getTipBlockHeader(): Promise<BlockHeader | null> {
        const response =
            await HttpApiService.get<BlockHeader>("/tip-block-header");
        return response.data || null;
    }

    static async getTipBlockTransactions(): Promise<TipBlockResponse | null> {
        const response =
            await HttpApiService.get<TipBlockResponse>("/tip-block-txs");
        return response.data || null;
    }

    static async getAllBlockHeaders(
        order: "ASC" | "DESC" = "DESC",
        limit: number = 20,
    ): Promise<BlockHeader[]> {
        const response = await HttpApiService.get<BlockHeader[]>(
            `/all-block-headers?order=${order}&limit=${limit}`,
        );
        return response.data || [];
    }

    static async subscribeNewSnapshot(
        onmessage: (_data: ChainSnapshot) => void,
    ) {
        this.wsClient.send("newSnapshot", {});

        this.wsClient.on("newSnapshot", (message: any) => {
            console.log("received newSnapshot: ", message.data);
            onmessage(message.data);
        });
    }

    static async subscribeNewBlock(
        onmessage: (_data: TipBlockResponse) => void,
    ) {
        this.wsClient.send("newBlock", {});

        this.wsClient.on("newBlock", (message: any) => {
            console.log(
                "received newBlock: ",
                +message.data.blockHeader?.block_number,
            );
            onmessage(message.data);
        });
    }
}
