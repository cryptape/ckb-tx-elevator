import { useEffect, useState, useRef } from "preact/hooks";
import { Transaction } from "../../service/chain";

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
        const txRect = txElement.getBoundingClientRect();

        const startX = txRect.left - fromRect.left;
        const startY = txRect.top - fromRect.top;
        const endX = toRect.left - fromQueue.getBoundingClientRect().left;
        const endY = toRect.top - fromQueue.getBoundingClientRect().top;

        txElement.style.position = "absolute";
        txElement.style.left = `${startX}px`;
        txElement.style.top = `${startY}px`;
        txElement.style.transform = `translate(${endX - startX}px, ${endY - startY}px)`;
        txElement.style.transition = "transform 0.5s ease-in-out";

        setTimeout(() => {
            txElement.style.transition = "";
            txElement.style.transform = "";
            txElement.style.position = "";
            txElement.style.left = "";
            txElement.style.top = "";
            movingTxs.current.delete(hash);
        }, 500);
    };

    useEffect(() => {
        movingTxs.current.forEach((value, key) => {
            const { from, to } = value;
            animateTx(key, from, to);
        });
    }, [stateChanges]);

    const renderQueue = (
        txs: Transaction[] | null,
        title: string,
        status: TxStatus,
    ) => {
        return (
            <div
                className="w-1/4 h-full p-4 border rounded relative min-w-[200px] flex flex-col"
                data-queue={status}
                ref={(el) => queueRefs.current.set(status, el as HTMLElement)}
            >
                <h3 className="font-bold mb-2">
                    {title} ({txs?.length || 0})
                </h3>
                {txs &&
                    txs.map((tx) => (
                        <div
                            key={tx.tx_hash}
                            ref={(el) => {
                                if (el) {
                                    txRefs.current.set(tx.tx_hash, el);
                                }
                            }}
                            className="bg-gray-100 p-2 mb-1 rounded border border-gray-300 relative"
                        >
                            {tx.tx_hash.slice(0, 22)}
                        </div>
                    ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col relative h-screen" ref={containerRef}>
            <div className="flex justify-start flex-wrap mt-4 mb-8 h-full">
                {renderQueue(pendingTxs, "Pending", "pending")}
                {renderQueue(proposedTxs, "Proposed", "proposed")}
                {renderQueue(proposingTxs, "Proposing", "proposing")}
                {renderQueue(committedTxs, "Committed", "committed")}
            </div>
        </div>
    );
};

export default QueueComponent;
