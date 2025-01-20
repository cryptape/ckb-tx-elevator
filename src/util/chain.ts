import {
    type JsonRpcTransaction,
    JsonRpcTransformers,
} from "@ckb-ccc/core/advancedBarrel";
import type { Network } from "../core/type";
import systemScript from "../offckb/system-scripts.json";

export function isCellBaseTx(tx: JsonRpcTransaction): boolean {
    return (
        tx.inputs.length === 1 &&
        tx.inputs[0].previous_output.tx_hash ===
            "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
}

export function isTransferCKBTx(tx: JsonRpcTransaction): boolean {
    return tx.outputs.every((o) => o.type === null);
}

export function isUDTTx(tx: JsonRpcTransaction, network: Network): boolean {
    const xudtScript = systemScript[network].xudt;
    return tx.outputs.some(
        (o) =>
            o.type &&
            o.type.code_hash === xudtScript.script.codeHash &&
            o.type.hash_type === xudtScript.script.hashType,
    );
}

export function isDobTx(tx: JsonRpcTransaction, network: Network): boolean {
    const dobScript = systemScript[network].spore;
    return tx.outputs.some(
        (o) =>
            o.type &&
            o.type.code_hash === dobScript.script.codeHash &&
            o.type.hash_type === dobScript.script.hashType,
    );
}

export function isDAOTx(tx: JsonRpcTransaction, network: Network): boolean {
    const daoScript = systemScript[network].dao;
    return tx.outputs.some(
        (o) =>
            o.type &&
            o.type.code_hash === daoScript.script.codeHash &&
            o.type.hash_type === daoScript.script.hashType,
    );
}

export function calcTxSize(tx: JsonRpcTransaction): number {
    return JsonRpcTransformers.transactionTo(tx).toBytes().byteLength;
}
