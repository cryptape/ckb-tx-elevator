import { FunctionalComponent } from "preact";
import { useAtomValue } from "jotai";
import { chainThemeAtom, ChainTheme } from "../../states/atoms";

export interface ReplayHeaderProp {
    blockHash: string;
}
export const ReplayHeader: FunctionalComponent<ReplayHeaderProp> = ({
    blockHash,
}) => {
    const chainTheme = useAtomValue(chainThemeAtom);
    const textColor =
        chainTheme === ChainTheme.mainnet
            ? "text-brand-mainnet"
            : "text-brand-testnet";
    return (
        <div>
            <div
                className={
                    "flex flex-col items-center justify-center mx-5 my-10 gap-6"
                }
            >
                <h1>Elevator Block Replay </h1>
                <div>
                    <a
                        className={`${textColor}`}
                        href="http://"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Copy the Share Link
                    </a>
                </div>
            </div>
        </div>
    );
};
