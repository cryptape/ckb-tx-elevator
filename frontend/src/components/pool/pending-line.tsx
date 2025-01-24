import { useEffect, useRef } from "preact/hooks";
import Matter from "matter-js";
import { Transaction } from "../../service/type";
import { FunctionalComponent } from "preact";

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

    // 用 ref 保存上一次的 txs 数组
    const prevTxsRef = useRef<Transaction[]>([]);

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

        Matter.Composite.add(engine.world, [ground, wall1, wall2]);

        // run the renderer
        Render.run(render);

        // create runner
        var runner = Runner.create();

        // run the engine
        Runner.run(runner, engine);
    }

    useEffect(() => {
        createScene();
    }, []);

    const update = (addTxs: Transaction[], delTxs: Transaction[]) => {
        delTxs.forEach((tx) => {
            const body = Matter.Composite.allBodies(
                engineRef.current.world,
            ).find((b) => b.label === tx.tx_hash);
            if (body) Matter.Composite.remove(engineRef.current.world, body);
        });

        const boxes = addTxs.map((tx, i) => {
            const box = Matter.Bodies.rectangle(20, 20, 40, 40, {
                label: tx.tx_hash,
                render: { fillStyle: "gray" },
            });
            return box;
        });
        Matter.Composite.add(engineRef.current.world, boxes);
    };

    useEffect(() => {
        // 获取新旧交易数组
        const prevTxs = prevTxsRef.current;
        const currentTxs = txs;

        // 创建哈希集合用于快速查找
        const prevHashes = new Set(prevTxs.map((tx) => tx.tx_hash));
        const currentHashes = new Set(currentTxs.map((tx) => tx.tx_hash));

        // 计算差异
        const addedTxs = currentTxs.filter((tx) => !prevHashes.has(tx.tx_hash));
        const removedTxs = prevTxs.filter(
            (tx) => !currentHashes.has(tx.tx_hash),
        );

        // 处理新增交易（示例：打印到控制台）
        if (addedTxs.length) {
            console.log("🚀 新增交易:", addedTxs);
            // 这里可以触发动画、更新状态等操作
        }

        // 处理移除交易（示例：打印到控制台）
        if (removedTxs.length) {
            console.log("🗑️ 移除交易:", removedTxs);
            // 这里可以触发动画、更新状态等操作
        }
        update(addedTxs, removedTxs);

        // 更新历史记录（注意：深拷贝仅在必要时使用）
        prevTxsRef.current = currentTxs;
    }, [txs]); // 依赖项确保 txs 变化时触发

    return (
        <div>
            <div
                className={`flex justify-start items-baseline border-b-4 border-brand-mainnet`}
            >
                <div>
                    <img src="/assets/svg/line-left-start.svg" alt="" />
                </div>
                <div>
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
