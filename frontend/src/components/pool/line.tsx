import { useEffect, useRef } from "preact/hooks";
import Matter from "matter-js";
import { Transaction } from "../../service/type";
import { FunctionalComponent } from "preact";

export interface LineProps {
    title: string;
    txs: Transaction[];
}

export const Line: FunctionalComponent<LineProps> = ({ title, txs }) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);

    const engineRef = useRef(null);
    const renderRef = useRef(null);
    const animationRef = useRef(null);

    // 用 ref 保存上一次的 txs 数组
    const prevTxsRef = useRef<Transaction[]>([]);

    useEffect(() => {
        const width = 800;
        const height = 100;

        // 初始化引擎和物体
        engineRef.current = Matter.Engine.create();
        const { world } = engineRef.current;

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
        Matter.Composite.add(world, [ground, wall1, wall2]);

        // 初始化渲染器
        if (containerRef.current) {
            renderRef.current = Matter.Render.create({
                element: containerRef.current,
                canvas: canvasRef.current,
                engine: engineRef.current,
                options: {
                    background: "transparent",
                    width: width,
                    height: height,
                    wireframes: false, // 可选：关闭线框模式
                },
            });
            Matter.Render.run(renderRef.current);
        }

        // 启动动画循环
        const tick = () => {
            Matter.Engine.update(engineRef.current, 1000 / 60); // 60 FPS
            animationRef.current = requestAnimationFrame(tick);
        };
        animationRef.current = requestAnimationFrame(tick);

        // 清理函数
        return () => {
            // 停止动画循环
            cancelAnimationFrame(animationRef.current);

            // 停止并销毁渲染器
            if (renderRef.current) {
                Matter.Render.stop(renderRef.current);
                renderRef.current.canvas.remove(); // 确保移除 Canvas 元素
                renderRef.current = null;
            }

            // 清理引擎
            if (engineRef.current) {
                Matter.Engine.clear(engineRef.current);
                Matter.Composite.clear(world, false); // 清除所有物体
                engineRef.current = null;
            }
        };
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
            <div>{title}</div>
            <div ref={containerRef}>
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};
