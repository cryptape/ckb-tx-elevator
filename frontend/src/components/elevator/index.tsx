import { useEffect, useState } from "preact/hooks";
import { ChainService } from "../../service/api";
import ElevatorCar from "./car";
import ElevatorUpButton from "./up-btn";
import ElevatorPanel from "./panel";
import ElevatorHeader from "./header";
import { useAtomValue } from "jotai";
import { ChainTheme, chainThemeAtom } from "../../states/atoms";

export default function Elevator() {
    const chainTheme = useAtomValue(chainThemeAtom);
    const [tipBlock, setTipBlock] = useState(undefined);
    const [doorClosing, setDoorClosing] = useState(false);

    // Update effect to fetch all data
    const fetch = async () => {
        ChainService.subscribeNewSnapshot((snapshot) => {
            if (snapshot.tipBlock) {
                setTipBlock((prev) => {
                    if (
                        prev == null ||
                        prev?.blockHeader?.block_number <
                            snapshot.tipBlock.blockHeader.block_number
                    ) {
                        return snapshot.tipBlock || undefined;
                    } else {
                        return prev;
                    }
                });
            }
        });
    };
    useEffect(() => {
        fetch();
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
                        transactions={tipBlock?.tipCommittedTransactions}
                        setFromDoorClosing={setDoorClosing}
                    />
                </div>
            </div>

            <ElevatorPanel
                transactionNumber={tipBlock?.tipCommittedTransactions.length}
                sizeBytes={20}
                occupationPercentage={20}
            />
        </div>
    );
}
