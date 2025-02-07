import { useAtomValue } from "jotai";
import { FunctionComponent } from "preact";
import { ChainTheme, chainThemeAtom } from "../../states/atoms";
import { Hex } from "@ckb-ccc/core";

export interface ElevatorUpButtonProps {
    difficultyInHex: Hex;
    doorClosing: boolean;
}

const ElevatorMiner: FunctionComponent<ElevatorUpButtonProps> = ({
    doorClosing,
    difficultyInHex,
}) => {
    const difficulty = parseFloat(
        (+difficultyInHex / 10000000000000000).toString(),
    ).toFixed(2);
    const spinClass =
        +difficulty > 3.5
            ? "animate-spin-fast"
            : +difficulty > 3.1
              ? "animate-spin-medium"
              : "animate-spin-slow";
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
    const minerApe =
        chainTheme === ChainTheme.mainnet
            ? "/assets/svg/elevator/mainnet/miner-ape.svg"
            : "/assets/svg/elevator/testnet/miner-ape.svg";
    return (
        <div>
            <div
                class={
                    "flex flex-col h-full align-bottom items-center flex-grow"
                }
            >
                <div
                    className={`rounded-full ${doorClosing ? "bg-white" : `${bgBrand}`} w-[48px] h-[48px] flex justify-center align-center items-center`}
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

                <div className={"w-[10px] h-[20px] bg-black"} />

                <div className={"relative"}>
                    <img
                        className={
                            "absolute top-2 h-[150px] left-1/2 -translate-x-1/2"
                        }
                        src={minerApe}
                        alt=""
                    />

                    <img className={`${spinClass}`} src={minerWheel} alt="" />
                    <div className={"relative"}>
                        <div
                            className={
                                "absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-text-inverse"
                            }
                        >
                            <div>{difficulty} EH</div>
                        </div>
                        <img src={minerBaseSvg} alt="" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ElevatorMiner;
