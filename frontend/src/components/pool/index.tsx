import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useAtomValue } from "jotai";
import { chainThemeAtom } from "../../states/atoms";
import { useChainService } from "../../context/chain";
import { PendingLine } from "./pending-line";
import { ProposalLine } from "./proposal-line";
import { CommittingLine } from "./committing-line";
import { CommittedLine } from "./committed-line";

const Pool: FunctionalComponent = () => {
    const chainTheme = useAtomValue(chainThemeAtom);
    const { chainService, waitForConnection } = useChainService();

    const [proposedTxs, setProposedTxs] = useState([]);
    const [committedTxs, setCommittedTxs] = useState([]);
    const [pendingTxs, setPendingTxs] = useState([]);
    const [proposingTxs, setProposingTxs] = useState([]);

    const subNewSnapshot = async () => {
        await waitForConnection();
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
        });
    };

    useEffect(() => {
        subNewSnapshot();
    }, [chainTheme]);

    return (
        <div>
            <div className={"flex justify-center items-center"}>
                <div className="flex flex-col relative align-center justify-center">
                    <div>
                        <img src="/assets/svg/factory-header.svg" alt="" />
                    </div>
                    <div className="flex flex-col relative align-center justify-start items-left">
                        <PendingLine txs={pendingTxs} title="pending" />
                        <ProposalLine txs={proposedTxs} title="pending" />
                        <CommittingLine txs={proposingTxs} title="pending" />
                        <CommittedLine txs={committedTxs} title="pending" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pool;
