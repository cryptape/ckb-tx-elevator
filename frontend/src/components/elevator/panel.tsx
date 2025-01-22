import { useAtomValue } from "jotai";
import { FunctionComponent } from "preact";
import { ChainTheme, chainThemeAtom } from "../../states/atoms";

interface Props {
    transactionNumber: number;
    sizeBytes: number;
    occupationPercentage: number;
}

const ElevatorPanel: FunctionComponent<Props> = ({
    transactionNumber,
    sizeBytes,
    occupationPercentage,
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
    return (
        <div
            className={`bg-surface-DEFAULT-inverse rounded-md p-4 w-fit text-white`}
        >
            <div>
                <div className="text-text-inverse-secondary">Transaction #</div>
                <div>
                    <h3 className={`font-dseg-classic text-text-inverse`}>
                        {transactionNumber}
                    </h3>
                </div>
            </div>
            <div className="mt-4">
                <div className="text-text-inverse-secondary">Size (Bytes)</div>
                <div>
                    <h3 className={`font-dseg-classic text-text-inverse`}>
                        {sizeBytes.toLocaleString()}
                    </h3>
                </div>
            </div>
            <div className="mt-4">
                <div className="text-text-inverse-secondary">Occupation</div>
                <div>
                    <h3 className={`font-dseg-classic text-text-inverse`}>
                        {occupationPercentage}
                    </h3>
                </div>
            </div>
            <button
                className={`mt-4 ${bgBrand} py-2 px-4 rounded-md ${bgBrandHover} text-text-inverse`}
            >
                View more
            </button>
        </div>
    );
};

export default ElevatorPanel;
