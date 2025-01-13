import { useAtomValue } from "jotai";
import { use } from "matter-js";
import { FunctionalComponent, h } from "preact";
import { useState } from "preact/hooks";
import { ChainTheme, chainThemeAtom } from "../states/atoms";

interface InfoHeaderProps {
    title?: string;
}

const InfoHeader: FunctionalComponent<InfoHeaderProps> = ({
    title = "Welcome to CKB Blockchain!",
}) => {
    const chainTheme = useAtomValue(chainThemeAtom);

    const [avgBlockTime, setAvgBlockTime] = useState(7.91);
    const [txPerMinute, setTxPerMinute] = useState(24.0);
    const [avgFeeRate, setAvgFeeRate] = useState(1000);
    const [epoch, setEpoch] = useState(11166);
    const [epochProgress, setEpochProgress] = useState("997/1800");

    const borderBlack =
        chainTheme === ChainTheme.mainnet
            ? "border-border-mainnet-black"
            : "border-border-testnet-black";
    const textBrand =
        chainTheme === ChainTheme.mainnet
            ? "text-brand-mainnet"
            : "text-brand-testnet";
    return (
        <header
            className={`info-header bg-surface-DEFAULT-02 border-2 ${borderBlack} items-center justify-center flex flex-col gap-6 py-10`}
        >
            <div>
                <h2 class={`${textBrand}`}>{title}</h2>
            </div>
            <div class={"flex justify-center gap-20"}>
                <div class={"flex justify-start gap-2"}>
                    <div class={`text-text-secondary`}>Avg. Block Time</div>
                    <h4>{avgBlockTime}s</h4>
                </div>
                <div class={"flex justify-start gap-2"}>
                    <div class={`text-text-secondary`}>Transaction/Minute</div>
                    <h4>{txPerMinute}s</h4>
                </div>
                <div class={"flex justify-start gap-2"}>
                    <div class={`text-text-secondary`}>Avg. Fee Rate</div>
                    <h4>{avgFeeRate} shannons/kB</h4>
                </div>
                <div class={"flex justify-start gap-2"}>
                    <div class={`text-text-secondary`}>Epoch</div>
                    <h4>
                        {epoch} {`(${epochProgress})`}
                    </h4>
                </div>
            </div>
        </header>
    );
};

export default InfoHeader;
