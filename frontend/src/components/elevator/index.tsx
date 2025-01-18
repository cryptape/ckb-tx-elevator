import { useEffect, useState } from "preact/hooks";
import { ChainService } from "../../service/api";
import ElevatorCar from "./car";
import ElevatorUpButton from "./up-btn";
import ElevatorPanel from "./panel";
import ElevatorHeader from "./header";
import { useAtomValue } from "jotai";
import { ChainTheme, chainThemeAtom } from "../../states/atoms";
import { TipBlockResponse } from "../../service/type";

export default function Elevator() {
    const chainTheme = useAtomValue(chainThemeAtom);
    const [tipBlock, setTipBlock] = useState<TipBlockResponse>(undefined);
    const [doorClosing, setDoorClosing] = useState(false);

    // subscribe to new block
    const subNewBlock = async () => {
        ChainService.subscribeNewBlock((newBlock) => {
            if (newBlock.blockHeader) {
                setTipBlock((prev) => {
                    if (
                        prev == null ||
                        prev?.blockHeader?.block_number <
                            newBlock.blockHeader.block_number
                    ) {
                        return newBlock || undefined;
                    } else {
                        return prev;
                    }
                });
            }
        });
    };
    useEffect(() => {
        ChainService.wsClient.connect(() => {
            subNewBlock();
        });
    }, []);

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
                "flex justify-between align-center items-center w-fit mx-auto gap-4"
            }
        >
            <ElevatorUpButton doorClosing={doorClosing} />

            <div
                className={`${bgElevatorFrame} flex flex-col justify-center w-min mx-auto rounded-lg border-[20px] ${borderBlack}`}
            >
                <ElevatorHeader
                    blockNumber={+tipBlock?.blockHeader.block_number}
                    doorClosing={doorClosing}
                />
                <div className={"px-20"}>
                    <ElevatorCar
                        blockHeader={tipBlock?.blockHeader}
                        transactions={tipBlock?.committedTransactions}
                        setFromDoorClosing={setDoorClosing}
                    />
                </div>
            </div>

            <ElevatorPanel
                transactionNumber={tipBlock?.committedTransactions.length}
                sizeBytes={20}
                occupationPercentage={20}
            />
        </div>
    );
}
