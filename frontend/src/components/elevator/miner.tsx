import { useAtomValue } from "jotai";
import { FunctionComponent } from "preact";
import { ChainTheme, chainThemeAtom } from "../../states/atoms";
import { Hex } from "@ckb-ccc/core";
import { useMemo } from "preact/hooks";
import { getApeRunningGif, getRunningSpeedClass } from "./util";
import Tooltip from "../tooltip";

export interface ElevatorUpButtonProps {
    difficultyInEH: number;
    doorClosing: boolean;
    nonce: Hex;
}

const ElevatorMiner: FunctionComponent<ElevatorUpButtonProps> = ({
    doorClosing,
    difficultyInEH,
    nonce,
}) => {
    const chainTheme = useAtomValue(chainThemeAtom);
    const bgBrand =
        chainTheme === ChainTheme.mainnet
            ? "bg-brand-mainnet"
            : "bg-brand-testnet";

    const minerBaseSvg =
        chainTheme === ChainTheme.mainnet
            ? "/assets/svg/elevator/mainnet/miner-base.svg"
            : "/assets/svg/elevator/testnet/miner-base.svg";
    const minerWheel =
        chainTheme === ChainTheme.mainnet
            ? "/assets/svg/elevator/mainnet/miner-wheel.svg"
            : "/assets/svg/elevator/testnet/miner-wheel.svg";

    const speedClass = useMemo(
        () => getRunningSpeedClass(difficultyInEH),
        [difficultyInEH],
    );

    const spinClass =
        speedClass === "fast"
            ? "animate-spin-fast"
            : speedClass === "medium"
              ? "animate-spin-medium"
              : "animate-spin-slow";
    const minerApeRunning = getApeRunningGif(chainTheme, speedClass);

    const minerJumpSvg =
        chainTheme === ChainTheme.mainnet
            ? "/assets/svg/elevator/mainnet/ape-jump.svg"
            : "/assets/svg/elevator/testnet/ape-jump.svg";
    const jumpClass = doorClosing ? "px-[30px] animate-jump" : "";

    const minerStandSvg =
        chainTheme === ChainTheme.mainnet
            ? "/assets/svg/elevator/mainnet/miner-ape.svg"
            : "/assets/svg/elevator/testnet/miner-ape.svg";

    return (
        <div>
            <div class="w-full relative flex flex-col h-full items-center gap-10">
                {/* 气泡元素 */}
                {doorClosing && (
                    <div
                        className={`absolute top-0 animate-bubble-up flex justify-center`}
                    >
                        <div
                            className={
                                "relative pr-2 pb-2 flex flex-col items-center"
                            }
                        >
                            <div
                                className={`${bgBrand} text-white px-3 py-1 rounded-full text-clip flex flex-col justify-center`}
                            >
                                <div className={`text-ellipsis text-nowrap`}>
                                    Nonce {nonce.slice(0, 10)}..
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div
                    className={`rounded-full ${doorClosing ? "bg-white" : `${bgBrand}`} w-[48px] h-[48px] flex justify-center items-center`}
                >
                    <svg
                        width="16"
                        height="8"
                        viewBox="0 0 16 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M0 8L8 0L16 8H0Z"
                            fill={doorClosing ? "red" : "white"}
                        />
                    </svg>
                </div>

                <div>
                    <Tooltip text="I am a Miner, I work hard to find the nonce for the block for coins!">
                        <div className="relative  flex justify-center items-center">
                            <div className={`absolute flex justify-center`}>
                                <img
                                    className={`z-50 ${jumpClass}`}
                                    src={
                                        doorClosing
                                            ? minerJumpSvg
                                            : minerApeRunning
                                    }
                                    alt="Miner Ape"
                                />
                            </div>

                            <div>
                                <img
                                    className={`${doorClosing ? "" : spinClass}`}
                                    src={minerWheel}
                                    alt="Miner Wheel"
                                />
                            </div>
                        </div>
                    </Tooltip>

                    <Tooltip text="The miner difficulty is the number of leading zeros in the hash of the block header. The higher the difficulty, the harder it is to find the nonce.">
                        <div className="relative">
                            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-text-inverse">
                                <div
                                    className={
                                        "truncate overflow-hidden whitespace-nowrap"
                                    }
                                >
                                    Difficulty {difficultyInEH} EH
                                </div>
                            </div>
                            <img src={minerBaseSvg} alt="Miner Base" />
                        </div>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

export default ElevatorMiner;
