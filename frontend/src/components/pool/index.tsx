import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useAtomValue } from "jotai";
import { chainThemeAtom } from "../../states/atoms";
import { useChainService } from "../../context/chain";
import { PendingLine } from "./pending-line";
import { ProposalLine } from "./proposal-line";
import { CommittingLine } from "./committing-line";
import { CommittedLine } from "./committed-line";
import { PoolHeader } from "./header";

const Pool: FunctionalComponent = () => {
    const chainTheme = useAtomValue(chainThemeAtom);
    const { chainService, waitForConnection } = useChainService();

    const [totalTxs, setTotalTxs] = useState(0);
    const [totalTxSizes, setTotalTxSizes] = useState(0);
    const [proposedTxs, setProposedTxs] = useState([]);
    const [committedTxs, setCommittedTxs] = useState([]);
    const [pendingTxs, setPendingTxs] = useState([]);
    const [proposingTxs, setProposingTxs] = useState([]);

    const subNewSnapshot = async () => {
        await waitForConnection();

        // unsubscribe first
        chainService.unSubscribe("newSnapshot");

        chainService.subscribeNewSnapshot((newSnapshot) => {
            const {
                tipCommittedTransactions,
                pendingTransactions,
                proposingTransactions,
                proposedTransactions,
            } = newSnapshot;

            setPendingTxs(pendingTransactions);
            setProposingTxs(proposingTransactions);
            setProposedTxs(proposedTransactions);
            setCommittedTxs(tipCommittedTransactions);
            setTotalTxs(
                pendingTransactions.length +
                    proposingTransactions.length +
                    proposedTransactions.length +
                    tipCommittedTransactions.length,
            );
            setTotalTxSizes(
                pendingTransactions.reduce((acc, tx) => acc + +tx.size, 0) +
                    proposingTransactions.reduce(
                        (acc, tx) => acc + +tx.size,
                        0,
                    ) +
                    proposedTransactions.reduce(
                        (acc, tx) => acc + +tx.size,
                        0,
                    ) +
                    tipCommittedTransactions.reduce(
                        (acc, tx) => acc + +tx.size,
                        0,
                    ),
            );
        });
    };

    useEffect(() => {
        setTotalTxSizes[0];
        setTotalTxs[0];
        setProposedTxs([]);
        setCommittedTxs([]);
        setPendingTxs([]);
        setProposingTxs([]);

        subNewSnapshot();
    }, [chainTheme]);

    return (
        <div>
            <div
                className={
                    "h-full flex justify-center items-center bg-surface-DEFAULT-01"
                }
            >
                <div className="h-full flex flex-col relative align-center justify-center">
                    <PoolHeader
                        totalTxSizesInBytes={totalTxSizes}
                        totalTxs={totalTxs}
                    />
                    <div className="h-full flex flex-col relative align-center justify-start items-left">
                        <PendingLine txs={pendingTxs} title="Pending" />
                        <ProposalLine txs={proposedTxs} title="Proposal" />
                        <CommittingLine txs={proposingTxs} title="Committing" />
                        <CommittedLine txs={committedTxs} title="Committed" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pool;
