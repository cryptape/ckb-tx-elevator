import { useAtomValue } from "jotai";
import { FunctionComponent } from "preact";
import { chainThemeAtom } from "../../states/atoms";

export interface ElevatorHeaderProps {
    blockNumber?: number;
    doorClosing: boolean;
}

const ElevatorHeader: FunctionComponent<ElevatorHeaderProps> = ({
    blockNumber,
    doorClosing,
}) => {
    const chainTheme = useAtomValue(chainThemeAtom);
    const textBrandLighter =
        chainTheme === "mainnet"
            ? "text-brand-mainnet-lighter"
            : "text-brand-testnet-lighter";
    const borderBBrandLighter =
        chainTheme === "mainnet"
            ? "border-b-brand-mainnet-lighter"
            : "border-b-brand-testnet-lighter";
    return (
        <div className={"p-4"}>
            <div
                className={
                    "w-min text-nowrap flex justify-center gap-1 text-center p-4 bg-surface-DEFAULT-inverse mx-auto rounded-lg"
                }
            >
                <div className={"text-text-inverse"}>Block</div>
                <div
                    className={`${textBrandLighter} ${doorClosing ? "animate-number-flip" : ""}`}
                >
                    {" "}
                    {blockNumber}
                </div>
                {
                    <div class={`w-8 relative overflow-hidden`}>
                        <div
                            className={`absolute left-1/2 ${doorClosing ? "bottom-0 transform -translate-x-1/2 animate-arrow-up" : "top-1/3"}`}
                        >
                            <div
                                className={`w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent ${borderBBrandLighter}`}
                            ></div>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};

export default ElevatorHeader;
