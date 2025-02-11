import { Hex } from "@ckb-ccc/core";
import { ChainTheme } from "../../states/atoms";

export const blockSizeLimit = 596363; // bytes
export const carBoxSize = {
    width: 850,
    height: blockSizeLimit / 850,
};

export const carBoxCenterPosX = carBoxSize.width / 2;

export const transactionSquareSize = (txSize?: Hex) => {
    const defaultSize = 80;
    return boxSizeToMatterSize(txSize ? Math.sqrt(+txSize) : defaultSize);
};

export function boxSizeToMatterSize(size: number) {
    return size * 2;
}

export function randomFillStyleColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

export function getApeRunningGif(
    chainTheme: ChainTheme,
    speed: "fast" | "medium" | "slow",
) {
    const speedAffix =
        speed === "fast" ? "-1.5" : speed === "medium" ? "" : "-0.5";
    return chainTheme === ChainTheme.mainnet
        ? `/assets/gif/mainnet/ape-run${speedAffix}.gif`
        : `/assets/gif/testnet/ape-run${speedAffix}.gif`;
}

export function getRunningSpeedClass(difficultyInEH: number) {
    return difficultyInEH > 4.0
        ? "fast"
        : difficultyInEH > 3.5
          ? "medium"
          : "slow";
}
