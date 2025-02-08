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

export function isRGBPPTx(tx: JsonRpcTransaction, network: Network): boolean {
    // https://explorer.nervos.org/scripts#RGB++
    const rgbppScriptInfo = {
        testnet: {
            script: {
                code_hash:
                    "0x61ca7a4796a4eb19ca4f0d065cb9b10ddcf002f10f7cbb810c706cb6bb5c3248",
                hash_type: "type",
                out_point: {
                    tx_hash:
                        "0xf1de59e973b85791ec32debbba08dff80c63197e895eb95d67fc1e9f6b413e00",
                    index: "0x0",
                },
                dep_type: "code",
            },
        },
        mainnet: {
            script: {
                code_hash:
                    "0xbc6c568a1a0d0a09f6844dc9d74ddb4343c32143ff25f727c59edf4fb72d6936",
                hash_type: "type",
                out_point: {
                    tx_hash:
                        "0x04c5c3e69f1aa6ee27fb9de3d15a81704e387ab3b453965adbe0b6ca343c6f41",
                    index: "0x0",
                },
                dep_type: "code",
            },
        },
    };
    const rgbppScript = rgbppScriptInfo[network];
    return tx.outputs.some(
        (o) =>
            o.type &&
            o.type.code_hash === rgbppScript.script.code_hash &&
            o.type.hash_type === rgbppScript.script.hash_type,
    );
}

export function calcTxSize(tx: JsonRpcTransaction): number {
    return JsonRpcTransformers.transactionTo(tx).toBytes().byteLength;
}
