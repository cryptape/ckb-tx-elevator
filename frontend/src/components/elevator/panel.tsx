import { useAtomValue } from "jotai";
import { FunctionComponent } from "preact";
import { ChainTheme, chainThemeAtom } from "../../states/atoms";
import { Hex } from "@ckb-ccc/core";
import { useState } from "preact/hooks";
import BlockModal from "./block-modal";

interface Props {
    transactionNumber: number;
    sizeBytes: number;
    occupationPercentage: string;
    blockHash: Hex;
}

const ElevatorPanel: FunctionComponent<Props> = ({
    transactionNumber,
    sizeBytes,
    occupationPercentage,
    blockHash,
}) => {
    const chainTheme = useAtomValue(chainThemeAtom);
    const bgBrand =
        chainTheme === ChainTheme.mainnet
            ? "bg-brand-mainnet"
            : "bg-brand-testnet";
    const bgBrandHover =
        chainTheme === ChainTheme.mainnet
            ? "hover:bg-brand-mainnet-hover"
            : "hover:bg-brand-testnet-hover";

    const [showModal, setShowModal] = useState(false);
    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    return (
        <div
            className={`bg-surface-DEFAULT-inverse rounded-md w-fit text-white overflow-hidden`}
        >
            <div className={"p-4"}>
                <div>
                    <div className="text-text-inverse-secondary">
                        Transaction #
                    </div>
                    <div>
                        <h3 className={`font-dseg-classic text-text-inverse`}>
                            {transactionNumber}
                        </h3>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="text-text-inverse-secondary">
                        Size (Bytes)
                    </div>
                    <div>
                        <h3 className={`font-dseg-classic text-text-inverse`}>
                            {sizeBytes.toLocaleString()}
                        </h3>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="text-text-inverse-secondary">
                        Occupation
                    </div>
                    <div>
                        <h3 className={`font-dseg-classic text-text-inverse`}>
                            {occupationPercentage} %
                        </h3>
                    </div>
                </div>
            </div>

            <div
                className={`mt-4 ${bgBrand} flex justify-center ${bgBrandHover} text-text-inverse`}
            >
                <button className={"px-4 py-2"} onClick={openModal}>
                    View more
                </button>
            </div>

            {showModal && (
                <BlockModal blockHash={blockHash} onClose={closeModal} />
            )}
        </div>
    );
};

export default ElevatorPanel;
