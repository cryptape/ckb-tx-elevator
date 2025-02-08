import { FunctionalComponent } from "preact";
import ElevatorMiner from "./miner";
import ElevatorCar from "./car";
import ElevatorHeader from "./header";
import ElevatorPanel from "./panel";
import { TipBlockResponse } from "../../service/type";
import { useAtomValue } from "jotai";
import { chainThemeAtom, ChainTheme } from "../../states/atoms";
import { useState } from "preact/hooks";
import BlockModal from "./block-modal";

export interface ElevatorUIProp {
    block: TipBlockResponse;
    onDoorClosing?: (doorClosing: boolean) => void;
}

export const ElevatorUI: FunctionalComponent<ElevatorUIProp> = ({
    block,
    onDoorClosing,
}) => {
    const [isDoorClosing, setIsDoorClosing] = useState(false);

    const doorClosing = (doorClosing: boolean) => {
        setIsDoorClosing(doorClosing);
        onDoorClosing && onDoorClosing(doorClosing);
    };
    const chainTheme = useAtomValue(chainThemeAtom);
    const bgElevatorFrame =
        chainTheme === ChainTheme.mainnet
            ? "bg-elevator-mainnet-frame"
            : "bg-elevator-testnet-frame";
    const borderBlack =
        chainTheme === ChainTheme.mainnet
            ? "border-border-mainnet-black"
            : "border-border-testnet-black";

    return (
        <div
            className={
                "flex justify-center align-center items-center gap-2 bg-surface-DEFAULT-01"
            }
        >
            <div className={"w-1/5 self-end"}>
                <ElevatorMiner
                    difficultyInHex={block.blockHeader.compact_target}
                    doorClosing={isDoorClosing}
                />
            </div>

            <div>
                <div
                    className={`${bgElevatorFrame} flex flex-col justify-center mx-auto rounded-lg border-[20px] ${borderBlack}`}
                >
                    <ElevatorHeader
                        blockNumber={+block.blockHeader.block_number}
                        doorClosing={isDoorClosing}
                    />
                    <div className={"px-20"}>
                        <ElevatorCar
                            blockHeader={block.blockHeader}
                            transactions={block.committedTransactions}
                            setFromDoorClosing={doorClosing}
                        />
                    </div>
                </div>
            </div>

            <div className={"w-1/5"}>
                <ElevatorPanel
                    transactionNumber={block.committedTransactions.length}
                    sizeBytes={20}
                    occupationPercentage={20}
                    blockHash={block.blockHeader.block_hash}
                />
            </div>
        </div>
    );
};
