import { FunctionComponent } from "preact";
import { TransactionType, TransactionTypeEnum } from "../service/type";
import { useAtomValue } from "jotai";
import { ChainTheme, chainThemeAtom } from "../states/atoms";

interface GroundProps {}

const Ground: FunctionComponent<GroundProps> = ({}) => {
    const chainTheme = useAtomValue(chainThemeAtom);
    const borderBlack =
        chainTheme === ChainTheme.mainnet
            ? "border-border-mainnet-black"
            : "border-border-testnet-black";
    const borderTBlack =
        chainTheme === ChainTheme.mainnet
            ? "border-t-border-mainnet-black"
            : "border-t-border-testnet-black";
    return (
        <div
            class={`flex justify-center align-middle items-center gap-2 w-full h-[110px] bg-other-floor border-t-2 ${borderTBlack}`}
        >
            <div class={`flex justify-start items-center align-middle gap-6`}>
                {Object.values(TransactionTypeEnum)
                    .filter((t) => typeof t === "number")
                    .map((type) => {
                        const bgColor = `${TransactionType.toBgColor(type)}`;
                        return (
                            <div
                                class={`flex justify-start items-center align-middle gap-1`}
                            >
                                <div
                                    className={`w-[24px] h-[12px] border-2  ${borderBlack} rounded-sm ${bgColor}`}
                                ></div>
                                <div class={`text-text-primary`}>
                                    {TransactionType.toString(type)}
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default Ground;
