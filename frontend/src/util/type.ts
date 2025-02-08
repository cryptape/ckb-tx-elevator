import {
    JsonRpcTransaction,
    JsonRpcTransformers,
} from "@ckb-ccc/core/advanced";
import { Transaction } from "../service/type";
import { blockSizeLimit } from "../components/elevator/util";

export function toShortHex(hexStr: string) {
    if (hexStr.length <= 20) {
        return hexStr;
    }

    return `${hexStr.slice(0, 10)}...${hexStr.slice(-10)}`;
}

export function shannonToCKB(num: number) {
    return num / 10 ** 8;
}

export function calcTxSize(tx: JsonRpcTransaction): number {
    return JsonRpcTransformers.transactionTo(tx).toBytes().byteLength;
}

export function calcTotalTxSize(txs: Transaction[]) {
    return txs.reduce((acc, tx) => acc + +tx.size, 0);
}

export function calcBlockOccupation(txs: Transaction[]): string {
    const value = (calcTotalTxSize(txs) / blockSizeLimit) * 100;
    return Math.round(value).toFixed(2);
}
