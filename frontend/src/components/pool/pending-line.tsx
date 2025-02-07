import { useEffect, useRef, useState } from "preact/hooks";
import Matter from "matter-js";
import {
    Network,
    Transaction,
    TransactionType,
    TransactionTypeEnum,
} from "../../service/type";
import { FunctionalComponent, JSX } from "preact";
import { transactionSquareSize } from "../elevator/util";
import { bodyToScreenPosition, createTooltipContent } from "../../util/scene";
import { useAtomValue } from "jotai";
import { ChainTheme, chainThemeAtom } from "../../states/atoms";
import { SignBoard } from "./signboard";
import Bulb from "./bulb";

export interface PendingLineProps {
    title: string;
    txs: Transaction[];
}

export const PendingLine: FunctionalComponent<PendingLineProps> = ({
    title,
    txs,
}) => {
    const chainTheme = useAtomValue(chainThemeAtom);

    const [tooltipContent, setTooltipContent] = useState<JSX.Element | null>(
        null,
    );
    const [tooltipPosition, setTooltipPosition] = useState<{
        x: number;
        y: number;
    } | null>(null);

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
            tooltip: {
                txHash: tx.tx_hash,
                txSize: +tx.size,
                txType: +tx.type,
                txFee: +tx.fee,
                FirstSeenInPool: tx.enter_pool_at,
            },
            label: tx.tx_hash,
        });
        return box;
    }

    function createScene() {
        const width = 900;
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

        // create mouse constraint on hover
        const mouse = Matter.Mouse.create(render.canvas);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse,
            constraint: {
                render: { visible: false },
            },
        });

        Matter.Composite.add(engine.world, [
            ...txBoxes,
            ground,
            wall1,
            wall2,
            mouseConstraint,
        ]);

        // run the renderer
        Render.run(render);

        // create runner
        var runner = Runner.create();

        // run the engine
        Runner.run(runner, engine);

        // listen to mouse hover event
        Matter.Events.on(mouseConstraint, "mousemove", (event) => {
            const hoveredBody = Matter.Query.point(
                Matter.Composite.allBodies(engine.world),
                event.mouse.position,
            )[0];

            if (hoveredBody?.tooltip) {
                const pos = bodyToScreenPosition(hoveredBody);
                setTooltipContent(
                    createTooltipContent(
                        hoveredBody.tooltip,
                        chainTheme as unknown as Network,
                    ),
                );
                setTooltipPosition(pos);
            } else {
                setTooltipContent(null);
                setTooltipPosition(null);
            }
        });
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

    const bgColor =
        chainTheme === ChainTheme.mainnet
            ? "bg-brand-mainnet"
            : "bg-brand-testnet";
    const borderColor =
        chainTheme === ChainTheme.mainnet
            ? "border-brand-mainnet"
            : "border-brand-testnet";
    const pipeSvg =
        chainTheme === ChainTheme.mainnet
            ? "/assets/svg/pool/mainnet/pipe.svg"
            : "/assets/svg/pool/testnet/pipe.svg";
    const ystandSvg =
        chainTheme === ChainTheme.mainnet
            ? "/assets/svg/pool/mainnet/ystand.svg"
            : "/assets/svg/pool/testnet/ystand.svg";
    const minerRight =
        chainTheme === ChainTheme.mainnet
            ? "/assets/svg/pool/mainnet/miner-right.svg"
            : "/assets/svg/pool/testnet/miner-right.svg";
    return (
        <div>
            <div
                className={`relative flex justify-start items-end border-b-8 ${borderColor}`}
            >
                <div>
                    <img src={pipeSvg} alt="" />
                </div>
                <div className={"flex flex-col justify-center h-fit"}>
                    <div
                        className={
                            "flex flex-col justify-center align-center items-center"
                        }
                    >
                        <img src={ystandSvg} alt="" />
                        <div>
                            <img src="/assets/svg/pool/stand-shim.svg" alt="" />
                        </div>
                    </div>
                    <div
                        className={`text-text-inverse ${bgColor} w-[240px] h-[230px] border-[2px] border-text-secondary flex justify-center gap-2 p-4`}
                    >
                        <Bulb bulbColor="bg-functional-warning" isOn={true} />
                        <Bulb bulbColor="bg-functional-success" isOn={true} />
                        <Bulb />
                    </div>
                </div>
                <div className={"absolute top-0 left-1/2 -translate-x-1/2"}>
                    <SignBoard title={title} count={txs.length} />
                </div>
                <div className={"relative"} ref={containerRef}>
                    <canvas ref={canvasRef} />
                    {/* Transaction Box Tooltip 层 */}
                    {tooltipContent && tooltipPosition && (
                        <div
                            className="absolute z-50 p-2 bg-gray-800 text-white rounded-md text-sm whitespace-pre"
                            style={{
                                left: `${tooltipPosition.x + 15}px`,
                                top: `${tooltipPosition.y}px`,
                                transform: "translateY(-50%)",
                            }}
                        >
                            {tooltipContent}
                        </div>
                    )}
                </div>
                <div>
                    <img src={minerRight} alt="" />
                </div>
            </div>
        </div>
    );
};
