import { useAtomValue } from "jotai";
import { FunctionalComponent } from "preact";
import { ChainTheme, chainThemeAtom } from "../../states/atoms";

export interface PoolHeaderProps {
    totalTxs: number;
    totalTxSizesInBytes: number;
}

export const PoolHeader: FunctionalComponent<PoolHeaderProps> = ({
    totalTxSizesInBytes: totalTxSizes,
    totalTxs,
}) => {
    const chainTheme = useAtomValue(chainThemeAtom);
    const svg =
        chainTheme === ChainTheme.mainnet
            ? "/assets/svg/pool/mainnet/header.svg"
            : "/assets/svg/pool/testnet/header.svg";
    const textColor =
        chainTheme === ChainTheme.mainnet
            ? "text-brand-mainnet-lighter"
            : "text-brand-testnet-lighter";
    const txSizeInKB = parseFloat((totalTxSizes / 1024).toString()).toFixed(2);
    return (
        <div className={"relative"}>
            <img src={svg} alt="" />
            <div
                className={
                    "absolute bottom-6 w-fit left-1/2 -translate-x-1/2 flex justify-center bg-surface-DEFAULT-inverse px-8 py-4 gap-2"
                }
            >
                <div className={"text-text-inverse"}>Mempool Size (KB)</div>
                <div className={textColor}>{txSizeInKB}</div>
                <div className={"text-text-inverse"}>Total Transactions</div>
                <div className={textColor}>{totalTxs}</div>
            </div>
        </div>
    );
};
