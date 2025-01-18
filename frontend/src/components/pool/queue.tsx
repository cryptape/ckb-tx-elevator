import { h } from "preact";
import { useEffect, useState, useRef } from "preact/hooks";
import { Transaction } from "../../service/api";

type TxStatus = "pending" | "proposing" | "proposed" | "committed" | "none";

interface TxChange {
    hash: string;
    from: TxStatus;
    to: TxStatus;
}

interface QueueProps {
    initialProposedTxs: Transaction[] | null;
    initialCommittedTxs: Transaction[] | null;
    initialPendingTxs: Transaction[] | null;
    initialProposingTxs: Transaction[] | null;
    txChanges: TxChange[] | null;
}

const QueueComponent: React.FC<QueueProps> = ({
    initialProposedTxs,
    initialCommittedTxs,
    initialPendingTxs,
    initialProposingTxs,
    txChanges,
}) => {
    const [proposedTxs, setProposedTxs] = useState<Transaction[] | null>(
        initialProposedTxs,
    );
    const [committedTxs, setCommittedTxs] = useState<Transaction[] | null>(
        initialCommittedTxs,
    );
    const [pendingTxs, setPendingTxs] = useState<Transaction[] | null>(
        initialPendingTxs,
    );
    const [proposingTxs, setProposingTxs] = useState<Transaction[] | null>(
        initialProposingTxs,
    );
    const [stateChanges, setStateChanges] = useState<TxChange[]>([]);
    const [movingTx, setMovingTx] = useState<{
        hash: string;
        from: TxStatus;
        to: TxStatus;
        startX: number;
        startY: number;
        endX: number;
        endY: number;
        isAnimating: boolean;
        node: HTMLElement | null;
    } | null>(null);

    const txRefs = useRef(new Map<string, HTMLElement>());

    useEffect(() => {
        if (txChanges && txChanges.length > 0) {
            setStateChanges((prev) => [...prev, ...txChanges]);

            let newProposedTxs = proposedTxs ? [...proposedTxs] : [];
            let newCommittedTxs = committedTxs ? [...committedTxs] : [];
            let newPendingTxs = pendingTxs ? [...pendingTxs] : [];
            let newProposingTxs = proposingTxs ? [...proposingTxs] : [];

            txChanges.forEach((txChange) => {
                const { hash, from, to } = txChange;

                const updateQueue = (
                    currentTxs: Transaction[] | null,
                    status: TxStatus,
                    newTxs: Transaction[],
                ) => {
                    if (!currentTxs) return newTxs;

                    let txToRemove = null;

                    if (from === status) {
                        txToRemove = currentTxs.find(
                            (tx) => tx.tx_hash === hash,
                        );
                        newTxs = newTxs.filter((tx) => tx.tx_hash !== hash);
                    }

                    if (to === status) {
                        const txToAdd =
                            initialProposedTxs?.find(
                                (tx) => tx.tx_hash === hash,
                            ) ||
                            initialCommittedTxs?.find(
                                (tx) => tx.tx_hash === hash,
                            ) ||
                            initialPendingTxs?.find(
                                (tx) => tx.tx_hash === hash,
                            ) ||
                            initialProposingTxs?.find(
                                (tx) => tx.tx_hash === hash,
                            );

                        if (txToAdd) {
                            const isExisting = newTxs.some(
                                (tx) => tx.tx_hash === txToAdd.tx_hash,
                            );
                            if (!isExisting) {
                                const startNode = txRefs.current.get(hash);
                                const queueContainer = document.querySelector(
                                    `[data-queue="${to}"]`,
                                ) as HTMLElement;
                                const endRect =
                                    queueContainer?.getBoundingClientRect();

                                if (startNode && endRect) {
                                    const startRect =
                                        startNode.getBoundingClientRect();
                                    setMovingTx({
                                        hash: txToAdd.tx_hash,
                                        from,
                                        to,
                                        startX: startRect.left,
                                        startY: startRect.top,
                                        endX: endRect.left + 10, // 稍微调整偏移
                                        endY: endRect.top + 20, // 稍微调整偏移
                                        isAnimating: true,
                                        node: startNode,
                                    });
                                }

                                newTxs.push(txToAdd);
                            }
                        }
                    }
                    return newTxs;
                };
                newProposedTxs = updateQueue(
                    newProposedTxs,
                    "proposed",
                    newProposedTxs,
                );
                newCommittedTxs = updateQueue(
                    newCommittedTxs,
                    "committed",
                    newCommittedTxs,
                );
                newPendingTxs = updateQueue(
                    newPendingTxs,
                    "pending",
                    newPendingTxs,
                );
                newProposingTxs = updateQueue(
                    newProposingTxs,
                    "proposing",
                    newProposingTxs,
                );
            });

            setProposedTxs(newProposedTxs);
            setCommittedTxs(newCommittedTxs);
            setPendingTxs(newPendingTxs);
            setProposingTxs(newProposingTxs);
        }
    }, [
        txChanges,
        initialCommittedTxs,
        initialPendingTxs,
        initialProposedTxs,
        initialProposingTxs,
        proposedTxs,
        committedTxs,
        pendingTxs,
        proposingTxs,
    ]);

    // 处理动画结束
    useEffect(() => {
        if (movingTx && movingTx.isAnimating) {
            setTimeout(() => {
                setMovingTx(null);
            }, 500);
        }
    }, [movingTx]);

    const renderQueue = (
        txs: Transaction[] | null,
        title: string,
        status: TxStatus,
    ) => {
        return (
            <div className="w-1/4 p-4 border rounded" data-queue={status}>
                <h3 className="font-bold mb-2">
                    {title} ({txs?.length || 0})
                </h3>
                {txs && txs.length > 0 ? (
                    txs.map((tx) => (
                        <div
                            key={tx.tx_hash}
                            ref={(el) => {
                                if (el) {
                                    txRefs.current.set(tx.tx_hash, el);
                                }
                            }}
                            className="bg-gray-100 p-2 mb-1 rounded border border-gray-300"
                        >
                            {tx.tx_hash.slice(0, 22)}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No transactions in {title} </p>
                )}
            </div>
        );
    };

    const renderMovingTx = () => {
        if (!movingTx || !movingTx.isAnimating) return null;

        const style = {
            position: "absolute",
            left: `${movingTx.startX}px`,
            top: `${movingTx.startY}px`,
            transition: "all 0.5s ease-in-out",
            transform: `translate(${movingTx.endX - movingTx.startX}px, ${movingTx.endY - movingTx.startY}px)`,
            zIndex: 10,
            pointerEvents: "none",
        };

        return (
            <div
                style={style}
                className="bg-blue-200 p-2 rounded border border-blue-300"
            >
                {movingTx.hash.slice(0, 22)}
            </div>
        );
    };
    return (
        <div className="flex flex-col relative">
            {renderMovingTx()}
            <div className="flex justify-between mt-4 mb-8">
                {renderQueue(pendingTxs, "Pending", "pending")}

                {renderQueue(proposedTxs, "Proposed", "proposed")}
                {renderQueue(proposingTxs, "Proposing", "proposing")}
                {renderQueue(committedTxs, "Committed", "committed")}
            </div>
        </div>
    );
};

export default QueueComponent;
