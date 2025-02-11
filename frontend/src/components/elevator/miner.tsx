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
            ? "/assets/svg/elevator/mainnet/miner-ape.svg"
            : "/assets/svg/elevator/testnet/miner-ape.svg";

    return (
        <div>
            <div class="flex flex-col h-full align-bottom items-center flex-grow">
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

                <div className="w-[10px] h-[20px] bg-black" />

                <div>
                    <Tooltip text="I am a Miner, I work hard to find the nonce for the block for coins!">
                        <div className="relative">
                            <img
                                className={
                                    "absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-50"
                                }
                                src={
                                    doorClosing ? minerJumpSvg : minerApeRunning
                                }
                                alt="Miner Ape"
                            />

                            <img
                                className={`${doorClosing ? "" : spinClass}`}
                                src={minerWheel}
                                alt="Miner Wheel"
                            />

                            {/* 气泡元素 */}
                            {doorClosing && (
                                <div
                                    className={`absolute left-[calc(70%+8px)] top-1/4 -translate-y-1/2 ${bgBrand} text-white px-3 py-1 rounded-full animate-bubble-up`}
                                >
                                    Found a new nonce {nonce}
                                </div>
                            )}
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
