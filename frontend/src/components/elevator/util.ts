import { Hex } from "@ckb-ccc/core";

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
