import { useEffect, useState } from "preact/hooks";
import ElevatorCar from "./car";
import ElevatorMiner from "./miner";
import ElevatorPanel from "./panel";
import ElevatorHeader from "./header";
import { useAtomValue } from "jotai";
import { ChainTheme, chainThemeAtom } from "../../states/atoms";
import { TipBlockResponse } from "../../service/type";
import { useChainService } from "../../context/chain";

export interface ElevatorProp {
    setIsNewBlock?: (isNewBlock: boolean) => void;
}

export default function Elevator({ setIsNewBlock }: ElevatorProp) {
    const chainTheme = useAtomValue(chainThemeAtom);
    const { chainService, waitForConnection } = useChainService();

    const [tipBlock, setTipBlock] = useState<TipBlockResponse>(undefined);
    const [doorClosing, setDoorClosing] = useState(false);

    const setDoorClosingAndIsNewBlock = (doorClosing: boolean) => {
        setDoorClosing(doorClosing);
        setIsNewBlock && setIsNewBlock(doorClosing);
    };

    // subscribe to new block
    // todo: need unscribe when component unmount
    const subNewBlock = async () => {
        // 等待连接就绪
        await waitForConnection();

        chainService.subscribeNewBlock((newBlock) => {
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
        subNewBlock();
    }, [chainTheme]);

    const bgElevatorFrame =
        chainTheme === ChainTheme.mainnet
            ? "bg-elevator-mainnet-frame"
            : "bg-elevator-testnet-frame";
    const borderBlack =
        chainTheme === ChainTheme.mainnet
            ? "border-border-mainnet-black"
            : "border-border-testnet-black";
    return (
        <div className={"flex justify-center align-center items-center gap-2"}>
            <div className={"w-1/5 self-end"}>
                <ElevatorMiner doorClosing={doorClosing} />
            </div>

            <div>
                <div
                    className={`${bgElevatorFrame} flex flex-col justify-center mx-auto rounded-lg border-[20px] ${borderBlack}`}
                >
                    <ElevatorHeader
                        blockNumber={+tipBlock?.blockHeader.block_number}
                        doorClosing={doorClosing}
                    />
                    <div className={"px-20"}>
                        <ElevatorCar
                            blockHeader={tipBlock?.blockHeader}
                            transactions={tipBlock?.committedTransactions || []}
                            setFromDoorClosing={setDoorClosingAndIsNewBlock}
                        />
                    </div>
                </div>
            </div>

            <div className={"w-1/5"}>
                <ElevatorPanel
                    transactionNumber={tipBlock?.committedTransactions.length}
                    sizeBytes={20}
                    occupationPercentage={20}
                />
            </div>
        </div>
    );
}
