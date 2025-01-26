import { Network } from "../service/type";

export function createTransactionLink(txHash: string, network: Network) {
    return network === Network.Mainnet
        ? `https://explorer.nervos.org/transaction/${txHash}`
        : `https://testnet.explorer.nervos.org/transaction/${txHash}`;
}
