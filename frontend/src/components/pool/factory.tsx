import { useEffect, useState, useRef } from "preact/hooks";
import { Transaction } from "../../service/type";
import { Line } from "./line";

type TxStatus = "pending" | "proposing" | "proposed" | "committed" | "none";

interface TxChange {
    hash: string;
    from: TxStatus;
    to: TxStatus;
}

export interface QueueProps {
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
    const movingTxs = useRef<Map<string, { from: TxStatus; to: TxStatus }>>(
        new Map(),
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const txRefs = useRef(new Map<string, HTMLElement>());
    const queueRefs = useRef(new Map<TxStatus, HTMLElement>());

    useEffect(() => {
        if (containerRef.current) {
            const container = containerRef.current;
            const pendingQueue = container.querySelector(
                '[data-queue="pending"]',
            ) as HTMLElement;
            const proposingQueue = container.querySelector(
                '[data-queue="proposing"]',
            ) as HTMLElement;
            const proposedQueue = container.querySelector(
                '[data-queue="proposed"]',
            ) as HTMLElement;
            const committedQueue = container.querySelector(
                '[data-queue="committed"]',
            ) as HTMLElement;

            queueRefs.current.set("pending", pendingQueue);
            queueRefs.current.set("proposing", proposingQueue);
            queueRefs.current.set("proposed", proposedQueue);
            queueRefs.current.set("committed", committedQueue);
        }
    }, []);

    useEffect(() => {
        if (txChanges && txChanges.length > 0) {
            setStateChanges((prev) => [...prev, ...txChanges]);
            let newProposedTxs = proposedTxs ? [...proposedTxs] : [];
            let newCommittedTxs = committedTxs ? [...committedTxs] : [];
            let newPendingTxs = pendingTxs ? [...pendingTxs] : [];
            let newProposingTxs = proposingTxs ? [...proposingTxs] : [];
            txChanges.forEach((txChange) => {
                const { hash, from, to } = txChange;
                movingTxs.current.set(hash, { from, to });
                // Update queues based on the transaction's new status
                switch (to) {
                    case "pending":
                        if (!newPendingTxs.some((tx) => tx.tx_hash === hash)) {
                            const tx =
                                initialProposedTxs?.find(
                                    (tx) => tx.tx_hash === hash,
                                ) ||
                                initialCommittedTxs?.find(
                                    (tx) => tx.tx_hash === hash,
                                ) ||
                                initialProposingTxs?.find(
                                    (tx) => tx.tx_hash === hash,
                                ) ||
                                initialPendingTxs?.find(
                                    (tx) => tx.tx_hash === hash,
                                );
                            if (tx) newPendingTxs.push(tx);
                        }
                        break;
                    case "proposing":
                        if (
                            !newProposingTxs.some((tx) => tx.tx_hash === hash)
                        ) {
                            const tx =
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
                            if (tx) newProposingTxs.push(tx);
                        }
                        break;
                    case "proposed":
                        if (!newProposedTxs.some((tx) => tx.tx_hash === hash)) {
                            const tx =
                                initialCommittedTxs?.find(
                                    (tx) => tx.tx_hash === hash,
                                ) ||
                                initialPendingTxs?.find(
                                    (tx) => tx.tx_hash === hash,
                                ) ||
                                initialProposingTxs?.find(
                                    (tx) => tx.tx_hash === hash,
                                ) ||
                                initialProposedTxs?.find(
                                    (tx) => tx.tx_hash === hash,
                                );
                            if (tx) newProposedTxs.push(tx);
                        }
                        break;
                    case "committed":
                        if (
                            !newCommittedTxs.some((tx) => tx.tx_hash === hash)
                        ) {
                            const tx =
                                initialProposedTxs?.find(
                                    (tx) => tx.tx_hash === hash,
                                ) ||
                                initialPendingTxs?.find(
                                    (tx) => tx.tx_hash === hash,
                                ) ||
                                initialProposingTxs?.find(
                                    (tx) => tx.tx_hash === hash,
                                ) ||
                                initialCommittedTxs?.find(
                                    (tx) => tx.tx_hash === hash,
                                );
                            if (tx) newCommittedTxs.push(tx);
                        }
                        break;
                    default:
                        break;
                }
                // Remove from the original queue
                switch (from) {
                    case "pending":
                        newPendingTxs = newPendingTxs.filter(
                            (tx) => tx.tx_hash !== hash,
                        );
                        break;
                    case "proposing":
                        newProposingTxs = newProposingTxs.filter(
                            (tx) => tx.tx_hash !== hash,
                        );
                        break;
                    case "proposed":
                        newProposedTxs = newProposedTxs.filter(
                            (tx) => tx.tx_hash !== hash,
                        );
                        break;
                    case "committed":
                        newCommittedTxs = newCommittedTxs.filter(
                            (tx) => tx.tx_hash !== hash,
                        );
                        break;
                    default:
                        break;
                }
            });
            setProposedTxs(newProposedTxs);
            setCommittedTxs(newCommittedTxs);
            setPendingTxs(newPendingTxs);
            setProposingTxs(newProposingTxs);
        }
    }, [
        txChanges,
        initialProposedTxs,
        initialCommittedTxs,
        initialPendingTxs,
        initialProposingTxs,
    ]);

    const animateTx = (hash: string, from: TxStatus, to: TxStatus) => {
        const fromQueue = queueRefs.current.get(from);
        const toQueue = queueRefs.current.get(to);
        const txElement = txRefs.current.get(hash);

        if (!fromQueue || !toQueue || !txElement) return;

        const fromRect = fromQueue.getBoundingClientRect();
        const toRect = toQueue.getBoundingClientRect();

        const deltaX = toRect.left - fromRect.left;
        const deltaY = toRect.top - fromRect.top;

        txElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        txElement.style.transition = "transform 0.5s ease-in-out";

        setTimeout(() => {
            txElement.style.transition = "";
            txElement.style.transform = "";
            movingTxs.current.delete(hash);
        }, 500);
    };

    useEffect(() => {
        movingTxs.current.forEach((value, key) => {
            const { from, to } = value;
            animateTx(key, from, to);
        });
    }, [stateChanges]);

    return (
        <div className="flex flex-col relative align-center justify-center items-center">
            <div>
                <img src="/assets/svg/factory-header.svg" alt="" />
            </div>
            <div>
                <Line txs={pendingTxs} title="pending" />
            </div>
            <div>
                <Line txs={proposedTxs} title="proposed" />
            </div>
            <div>
                <Line txs={proposingTxs} title="committing" />
            </div>

            <div>
                <img src="/assets/svg/pool-ground.svg" alt="" />
            </div>
        </div>
    );
};

export default QueueComponent;
