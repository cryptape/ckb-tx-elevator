import { useAtomValue } from "jotai";
import { FunctionComponent } from "preact";
import { ChainTheme, chainThemeAtom } from "../../states/atoms";

export interface ElevatorUpButtonProps {
    doorClosing: boolean;
}

const ElevatorMiner: FunctionComponent<ElevatorUpButtonProps> = ({
    doorClosing,
}) => {
    const chainTheme = useAtomValue(chainThemeAtom);
    const bgBrand =
        chainTheme === ChainTheme.mainnet
            ? "bg-brand-mainnet"
            : "bg-brand-testnet";
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
                <img src="/assets/svg/ape.svg" alt="" />
            </div>
        </div>
    );
};

export default ElevatorMiner;
