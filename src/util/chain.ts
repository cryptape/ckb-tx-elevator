import {
    type JsonRpcTransaction,
    JsonRpcTransformers,
} from "@ckb-ccc/core/advancedBarrel";

export function isCellBaseTx(tx: JsonRpcTransaction): boolean {
    return (
        tx.inputs.length === 1 &&
        tx.inputs[0].previous_output.tx_hash ===
            "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
}

export function calcTxSize(tx: JsonRpcTransaction): number {
    return JsonRpcTransformers.transactionTo(tx).toBytes().byteLength;
}
