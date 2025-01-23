import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { ChainService } from "../../service/api";
import QueueComponent from "./factory";
import { Network, Transaction } from "../../service/type";
import { useAtomValue } from "jotai";
import { ChainTheme, chainThemeAtom } from "../../states/atoms";

type TxStatus = "pending" | "proposing" | "proposed" | "committed" | "none";

interface TxChange {
    hash: string;
    from: TxStatus;
    to: TxStatus;
}

const Pool: FunctionalComponent = () => {
    const chainTheme = useAtomValue(chainThemeAtom);

    const [initProposedTxs, setInitProposedTxs] = useState<
        Transaction[] | null
    >(null);
    const [initCommittedTxs, setInitCommittedTxs] = useState<
        Transaction[] | null
    >(null);
    const [initPendingTxs, setInitPendingTxs] = useState<Transaction[] | null>(
        null,
    );
    const [initProposingTxs, setInitProposingTxs] = useState<
        Transaction[] | null
    >(null);

    const [proposedTxs, setProposedTxs] = useState([]);
    const [committedTxs, setCommittedTxs] = useState([]);
    const [pendingTxs, setPendingTxs] = useState([]);
    const [proposingTxs, setProposingTxs] = useState([]);

    const [previousTxs, setPreviousTxs] = useState<{
        pending: Transaction[];
        proposing: Transaction[];
        proposed: Transaction[];
        committed: Transaction[];
    } | null>(null);

    const [stateChanges, setStateChanges] = useState<TxChange[]>([]); // 存储状态变化信息

    const subNewSnapshot = async () => {
        const network =
            chainTheme === ChainTheme.mainnet
                ? Network.Mainnet
                : Network.Testnet;
        const chainService = new ChainService(network);
        chainService.wsClient.connect(() => {
            chainService.subscribeNewSnapshot((newSnapshot) => {
                const {
                    tipCommittedTransactions,
                    pendingTransactions,
                    proposingTransactions,
                    proposedTransactions,
                } = newSnapshot;

                if (initCommittedTxs == null) {
                    setInitCommittedTxs(tipCommittedTransactions);
                }
                if (initProposedTxs == null) {
                    setInitProposedTxs(proposedTransactions);
                }
                if (initPendingTxs == null) {
                    setInitPendingTxs(pendingTransactions);
                }
                if (initProposingTxs == null) {
                    setInitProposingTxs(proposingTransactions);
                }

                // 拿到所有tx
                const newTxs = {
                    pending: pendingTransactions,
                    proposing: proposingTransactions,
                    proposed: proposedTransactions,
                    committed: tipCommittedTransactions,
                };

                // diff 数据
                if (previousTxs) {
                    const changes = detectStateChanges(previousTxs, newTxs);
                    setStateChanges(changes);
                }

                // 更新历史记录
                // 使用函数式更新
                setPreviousTxs((prev) => {
                    if (prev) {
                        const changes = detectStateChanges(prev, newTxs);
                        setStateChanges(changes);
                    }
                    return newTxs;
                });

                setPendingTxs(pendingTransactions);
                setProposingTxs(proposingTransactions);
                setProposedTxs(proposedTransactions);
                setCommittedTxs(tipCommittedTransactions);
            });
        });
    };

    useEffect(() => {
        subNewSnapshot();
    }, [chainTheme]);

    // 状态变化检测
    const detectStateChanges = (
        prev: {
            pending: Transaction[];
            proposing: Transaction[];
            proposed: Transaction[];
            committed: Transaction[];
        },
        curr: {
            pending: Transaction[];
            proposing: Transaction[];
            proposed: Transaction[];
            committed: Transaction[];
        },
    ) => {
        const changes: TxChange[] = [];

        const prevTxsMap = {
            pending: new Map(prev.pending.map((tx) => [tx.tx_hash, "pending"])),
            proposing: new Map(
                prev.proposing.map((tx) => [tx.tx_hash, "proposing"]),
            ),
            proposed: new Map(
                prev.proposed.map((tx) => [tx.tx_hash, "proposed"]),
            ),
            committed: new Map(
                prev.committed.map((tx) => [tx.tx_hash, "committed"]),
            ),
        };

        const currTxsMap = {
            pending: new Map(curr.pending.map((tx) => [tx.tx_hash, "pending"])),
            proposing: new Map(
                curr.proposing.map((tx) => [tx.tx_hash, "proposing"]),
            ),
            proposed: new Map(
                curr.proposed.map((tx) => [tx.tx_hash, "proposed"]),
            ),
            committed: new Map(
                curr.committed.map((tx) => [tx.tx_hash, "committed"]),
            ),
        };

        // 获取所有hash
        const allHashes = new Set([
            ...Array.from(prevTxsMap.pending.keys()),
            ...Array.from(prevTxsMap.proposing.keys()),
            ...Array.from(prevTxsMap.proposed.keys()),
            ...Array.from(prevTxsMap.committed.keys()),
            ...Array.from(currTxsMap.pending.keys()),
            ...Array.from(currTxsMap.proposing.keys()),
            ...Array.from(currTxsMap.proposed.keys()),
            ...Array.from(currTxsMap.committed.keys()),
        ]);

        allHashes.forEach((hash) => {
            let prevState: string | undefined;
            let currState: string | undefined;
            // 确定之前是否在队列
            if (prevTxsMap.pending.has(hash)) {
                prevState = "pending";
            } else if (prevTxsMap.proposing.has(hash)) {
                prevState = "proposing";
            } else if (prevTxsMap.proposed.has(hash)) {
                prevState = "proposed";
            } else if (prevTxsMap.committed.has(hash)) {
                prevState = "committed";
            }

            // 确定现在是否在队列
            if (currTxsMap.pending.has(hash)) {
                currState = "pending";
            } else if (currTxsMap.proposing.has(hash)) {
                currState = "proposing";
            } else if (currTxsMap.proposed.has(hash)) {
                currState = "proposed";
            } else if (currTxsMap.committed.has(hash)) {
                currState = "committed";
            }

            if (prevState !== currState) {
                changes.push({
                    hash,
                    from: (prevState || "none") as TxStatus,
                    to: (currState || "none") as TxStatus,
                });
                //changes.push(`${hash.slice(0,22)}: ${prevState || 'none'} -> ${currState || 'none'}`);
            }
        });

        return changes;
    };

    return (
        <div>
            <div>
                <QueueComponent
                    initialProposedTxs={initProposedTxs}
                    initialCommittedTxs={initCommittedTxs}
                    initialPendingTxs={initPendingTxs}
                    initialProposingTxs={initProposingTxs}
                    txChanges={stateChanges as any}
                />
            </div>
        </div>
    );
};

export default Pool;
