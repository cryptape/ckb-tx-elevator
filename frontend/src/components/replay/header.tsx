import { FunctionalComponent } from "preact";
import { useAtomValue } from "jotai";
import { chainThemeAtom, ChainTheme } from "../../states/atoms";
import { useState } from "preact/hooks";

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
    const [copyNotification, setCopyNotification] = useState<string | null>(
        null,
    );

    const handleCopyClick = () => {
        const link = `${window.location.origin}/replay/${blockHash}`;
        navigator.clipboard
            .writeText(link)
            .then(() => {
                setCopyNotification("Link copied!");
                setTimeout(() => {
                    setCopyNotification(null);
                }, 2000); // Clear notification after 2 seconds
            })
            .catch((err) => {
                console.error("Failed to copy: ", err);
                setCopyNotification("Failed to copy link."); //Optional, error message.
                setTimeout(() => {
                    setCopyNotification(null);
                }, 2000);
            });
    };

    return (
        <div>
            <div
                className={
                    "flex flex-col items-center justify-center mx-5 my-10 gap-6"
                }
            >
                <h1>Elevator Block Replay </h1>
                <div>
                    <button
                        className={`${textColor} border border-black rounded-md px-4 py-2`}
                        onClick={handleCopyClick}
                    >
                        Share this block with your friends!
                    </button>
                    {copyNotification && (
                        <div className="text-text-secondary text-sm italic">
                            {copyNotification}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
