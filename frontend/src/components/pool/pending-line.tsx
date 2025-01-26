import { useEffect, useRef } from "preact/hooks";
import Matter from "matter-js";
import {
    Transaction,
    TransactionType,
    TransactionTypeEnum,
} from "../../service/type";
import { FunctionalComponent } from "preact";
import { transactionSquareSize } from "../elevator/util";

export interface PendingLineProps {
    title: string;
    txs: Transaction[];
}

export const PendingLine: FunctionalComponent<PendingLineProps> = ({
    title,
    txs,
}) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const prevTxs = useRef<Transaction[]>([]);

    function createTxBox(tx: Transaction) {
        const size = transactionSquareSize(tx.size);
        const color =
            tx.type != null
                ? TransactionType.toBgColor(+tx.type as TransactionTypeEnum)
                : "black";
        const box = Matter.Bodies.rectangle(20, 80, size, size, {
            render: {
                fillStyle: color,
                strokeStyle: "black",
                lineWidth: 3,
            },
        });
        box.label = tx.tx_hash;
        return box;
    }

    function createScene() {
        const width = 800;
        const height = 300;

        let Engine = Matter.Engine;
        let Render = Matter.Render;
        let Runner = Matter.Runner;

        let engine = Engine.create({});
        engineRef.current = engine;

        let render = Render.create({
            element: containerRef.current,
            engine: engine,
            canvas: canvasRef.current,
            options: {
                background: "transparent",
                width: width,
                height: height,
                wireframes: false,
            },
        });

        // create two boxes and a ground
        const txBoxes = txs.map((tx, i) => createTxBox(tx));

        // 添加示例物体
        const wall1 = Matter.Bodies.rectangle(width, 0, 1, height * 2, {
            isStatic: true,
            render: {
                strokeStyle: "gray",
            },
        });

        const wall2 = Matter.Bodies.rectangle(0, 0, 1, height * 2, {
            isStatic: true,
            render: {
                strokeStyle: "gray",
            },
        });

        const ground = Matter.Bodies.rectangle(0, height, width * 2, 1, {
            isStatic: true,
            render: {
                strokeStyle: "gray",
            },
        });

        Matter.Composite.add(engine.world, [...txBoxes, ground, wall1, wall2]);

        // run the renderer
        Render.run(render);

        // create runner
        var runner = Runner.create();

        // run the engine
        Runner.run(runner, engine);
    }

    useEffect(() => {
        createScene();

        // 初始化时设置初始值
        prevTxs.current = txs;
    }, []);

    // 新增 useEffect 用于跟踪 txs 变化
    useEffect(() => {
        if (!engineRef.current) return;

        // 通过哈希比较找出差异
        const currentHashes = new Set(txs.map((tx) => tx.tx_hash));
        const prevHashes = new Set(prevTxs.current.map((tx) => tx.tx_hash));

        // 找出新增交易
        const added = txs.filter((tx) => !prevHashes.has(tx.tx_hash));
        // 找出移除交易
        const removed = prevTxs.current.filter(
            (tx) => !currentHashes.has(tx.tx_hash),
        );

        // 调用更新方法
        update(added, removed);

        // 更新前一次记录
        prevTxs.current = txs;
    }, [txs]); // 依赖 txs 的变化

    const update = (addTxs: Transaction[], delTxs: Transaction[]) => {
        delTxs.forEach((tx) => {
            const body = Matter.Composite.allBodies(
                engineRef.current.world,
            ).find((b) => b.label === tx.tx_hash);
            if (body) Matter.Composite.remove(engineRef.current.world, body);
        });

        const boxes = addTxs.map((tx, i) => createTxBox(tx));
        Matter.Composite.add(engineRef.current.world, boxes);
    };

    return (
        <div>
            <div
                className={`flex justify-start items-baseline border-b-4 border-brand-mainnet`}
            >
                <div>
                    <img src="/assets/svg/line-left-start.svg" alt="" />
                </div>
                <div className={"relative"}>
                    <div
                        className={"absolute bottom-6 left-8 text-text-inverse"}
                    >
                        {title} Transactions
                    </div>
                    <img src="/assets/svg/line-left.svg" alt="" />
                </div>
                <div ref={containerRef}>
                    <canvas ref={canvasRef} />
                </div>
                <div>
                    <img src="/assets/svg/line-right.svg" alt="" />
                </div>
            </div>
        </div>
    );
};
