import type { Hex } from "@ckb-ccc/core";
import type { JsonRpcTransaction } from "@ckb-ccc/core/dist.commonjs/advancedBarrel";

export interface JsonRpcTransactionView extends JsonRpcTransaction {
    hash: Hex;
}

export interface JsonRpcPoolTransactionEntry {
    transaction: JsonRpcTransactionView;
    cycles: Hex;
    size: Hex;
    fee: Hex;
    timestamp: Hex;
}
