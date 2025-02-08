import { HttpApiService } from "./http";
import { Hex } from "@ckb-ccc/core";
import { WsApiService } from "./ws";
import {
    BlockHeader,
    BlockResponse,
    ChainSnapshot,
    ChainStats,
    Network,
    PoolInfo,
    TipBlockResponse,
    Transaction,
} from "./type";
import { Config } from "./config";

export class ChainService {
    wsClient: WsApiService;
    httpClient: HttpApiService;
    network: Network;

    constructor(network: Network) {
        this.network = network;
        this.wsClient = new WsApiService({
            url:
                network === Network.Mainnet
                    ? Config.mainnetApiWsUrl
                    : Config.testnetApiWsUrl,
            logLevel: "info",
        });
        this.httpClient = new HttpApiService(
            network === Network.Mainnet
                ? Config.mainnetApiHttpUrl
                : Config.testnetApiHttpUrl,
        );
    }

    async getPendingTransactions(): Promise<Transaction[]> {
        const response =
            await this.httpClient.get<Transaction[]>("/pending-txs");
        return response.data || [];
    }

    async getProposingTransactions(): Promise<Transaction[]> {
        const response =
            await this.httpClient.get<Transaction[]>("/proposing-txs");
        return response.data || [];
    }

    async getRejectedTransactions(): Promise<Transaction[]> {
        const response =
            await this.httpClient.get<Transaction[]>("/rejected-txs");
        return response.data || [];
    }

    async getProposedTransactions(): Promise<Transaction[]> {
        const response =
            await this.httpClient.get<Transaction[]>("/proposed-txs");
        return response.data || [];
    }

    async getProposedTransactionsByBlock(
        blockHash: Hex,
    ): Promise<Transaction[]> {
        const response = await this.httpClient.get<Transaction[]>(
            `/proposed-txs-by-block?blockHash=${blockHash}`,
        );
        return response.data || [];
    }

    async getCommittedTransactions(blockHash: Hex): Promise<Transaction[]> {
        const response = await this.httpClient.get<Transaction[]>(
            `/committed-txs?blockHash=${blockHash}`,
        );
        return response.data || [];
    }

    async getBlockHeader(blockHash: Hex): Promise<BlockHeader | null> {
        const response = await this.httpClient.get<BlockHeader>(
            `/block-header?blockHash=${blockHash}`,
        );
        return response.data || null;
    }

    async getBlock(blockHash: Hex): Promise<BlockResponse | null> {
        const response = await this.httpClient.get<BlockResponse>(
            `/block?blockHash=${blockHash}`,
        );
        return response.data;
    }

    async getTipBlockHeader(): Promise<BlockHeader | null> {
        const response =
            await this.httpClient.get<BlockHeader>("/tip-block-header");
        return response.data || null;
    }

    async getTipBlockTransactions(): Promise<TipBlockResponse | null> {
        const response =
            await this.httpClient.get<TipBlockResponse>("/tip-block-txs");
        return response.data || null;
    }

    async getAllBlockHeaders(
        order: "ASC" | "DESC" = "DESC",
        limit: number = 20,
    ): Promise<BlockHeader[]> {
        const response = await this.httpClient.get<BlockHeader[]>(
            `/all-block-headers?order=${order}&limit=${limit}`,
        );
        return response.data || [];
    }

    async getChainStats() {
        const response = await this.httpClient.get<ChainStats>("/chain-stats");
        return response.data;
    }

    async getPoolInfo() {
        const response = await this.httpClient.get<PoolInfo>("/pool-info");
        return response.data;
    }

    async subscribeNewSnapshot(onmessage: (_data: ChainSnapshot) => void) {
        this.wsClient.send("newSnapshot", {});

        this.wsClient.on("newSnapshot", (message: any) => {
            console.log("received newSnapshot: ", message.data);
            onmessage(message.data);
        });
    }

    async subscribeNewBlock(onmessage: (_data: TipBlockResponse) => void) {
        this.wsClient.on("newBlock", (message: any) => {
            console.log(
                "received newBlock: ",
                +message.data.blockHeader?.block_number,
            );
            onmessage(message.data);
        });
        this.wsClient.send("newBlock", {});
    }
}
