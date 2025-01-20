import { atom } from "jotai";

export enum ChainTheme {
    testnet = "testnet",
    mainnet = "mainnet",
}

export const chainThemeAtom = atom(ChainTheme.mainnet);
