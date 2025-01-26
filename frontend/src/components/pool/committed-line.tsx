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
import { useAtomValue } from "jotai";
import { chainThemeAtom } from "../../states/atoms";
import { bodyToScreenPosition, createTooltipContent } from "../../util/scene";

export interface CommittedLineProps {
    title: string;
    txs: Transaction[];
}

export const CommittedLine: FunctionalComponent<CommittedLineProps> = ({
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

    function createTxBox(tx: Transaction) {
        const size = transactionSquareSize(tx.size);
        const color =
            tx.type != null
                ? TransactionType.toBgColor(+tx.type as TransactionTypeEnum)
                : "black";
        const box = Matter.Bodies.rectangle(400, 80, size, size, {
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

        // create mouse constraint on hover
        const mouse = Matter.Mouse.create(render.canvas);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse,
            constraint: {
                render: { visible: false },
            },
        });

        Matter.Composite.add(engine.world, [...txBoxes, mouseConstraint]);

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
    }, [txs[0]?.proposed_at_block_number]);

    return (
        <div className={"h-full"}>
            <div
                className={`h-full flex justify-center items-center overflow-hidden`}
            >
                <div className={"h-[500px] relative"} ref={containerRef}>
                    <div
                        className={`absolute bottom-20 left-0 z-0 pointer-events-none flex justify-center items-center`}
                    >
                        <img src="/assets/svg/pool-ground.svg" alt="" />
                    </div>
                    <canvas className={`z-2 relative`} ref={canvasRef} />
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
            </div>
        </div>
    );
};
