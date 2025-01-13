import { useEffect, useState } from "preact/hooks";
import { ChainService } from "../../service/chain";
import ElevatorCar from "./car";
import ElevatorUpButton from "./up-btn";
import ElevatorPanel from "./panel";
import ElevatorHeader from "./header";
import { useAtomValue } from "jotai";
import { ChainTheme, chainThemeAtom } from "../../states/atoms";

export default function Elevator() {
    const chainTheme = useAtomValue(chainThemeAtom);
    const [proposedTxs, setProposedTxs] = useState([]);
    const [committedTxs, setCommittedTxs] = useState([]);
    const [blockHeader, setBlockHeader] = useState(undefined);
    const [currentTipNumber, setCurrentTipNumber] = useState(undefined);
    const [doorClosing, setDoorClosing] = useState(false);

    // Update effect to fetch all data
    useEffect(() => {
        const fetchData = async () => {
            const [tipBlockTxs] = await Promise.all([
                ChainService.getTipBlockTransactions(),
            ]);
            setProposedTxs(tipBlockTxs.proposedTransactions);
            setCommittedTxs(tipBlockTxs.committedTransactions);
            setBlockHeader(tipBlockTxs.blockHeader);
        };
        const task = setInterval(fetchData, 3000);
        return () => clearInterval(task);
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
                    blockNumber={+blockHeader?.block_number}
                    doorClosing={doorClosing}
                />
                <div className={"px-20"}>
                    <ElevatorCar
                        transactions={committedTxs}
                        blockHeader={blockHeader}
                        setFromDoorClosing={setDoorClosing}
                    />
                </div>
            </div>

            <ElevatorPanel
                transactionNumber={committedTxs.length}
                sizeBytes={20}
                occupationPercentage={20}
            />
        </div>
    );
}
