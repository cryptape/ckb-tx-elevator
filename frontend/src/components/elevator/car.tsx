import Matter from "matter-js";
import { useEffect, useRef, useState } from "preact/hooks";
import {
    BlockHeader,
    Network,
    Transaction,
    TransactionType,
    TransactionTypeEnum,
} from "../../service/type";
import {
    boxSizeToMatterSize,
    carBoxCenterPosX,
    carBoxSize,
    transactionSquareSize,
} from "./util";
import { useAtomValue } from "jotai";
import { ChainTheme, chainThemeAtom } from "../../states/atoms";
import ElevatorCapacity from "./capacity";
import { JSX } from "preact/jsx-runtime";
import { bodyToScreenPosition, createTooltipContent } from "../../util/scene";

export interface ElevatorCarProp {
    transactions: Transaction[];
    blockHeader?: BlockHeader;
    setFromDoorClosing?: (doorClosing: boolean) => void;
}

const ElevatorCar: React.FC<ElevatorCarProp> = (props) => {
    const chainTheme = useAtomValue(chainThemeAtom);
    const { transactions, blockHeader, setFromDoorClosing } = props;

    const [doorClosing, setDoorClosing] = useState(false);
    const [tooltipContent, setTooltipContent] = useState<JSX.Element | null>(
        null,
    );
    const [tooltipPosition, setTooltipPosition] = useState<{
        x: number;
        y: number;
    } | null>(null);

    const boxRef = useRef(null);
    const canvasRef = useRef(null);

    async function run() {
        setDoorClosing(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setDoorClosing(false);
        createScene();
    }

    function createScene() {
        let Engine = Matter.Engine;
        let Render = Matter.Render;
        let Bodies = Matter.Bodies;
        let Runner = Matter.Runner;
        let Composite = Matter.Composite;

        let engine = Engine.create({});

        let render = Render.create({
            element: boxRef.current,
            engine: engine,
            canvas: canvasRef.current,
            options: {
                background: "transparent",
                width: carBoxSize.width,
                height: carBoxSize.height,
                wireframes: false,
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

        // create two boxes and a ground
        const txBoxes = transactions.map((tx, i) => {
            const size = transactionSquareSize(tx.size);
            const color =
                tx.type != null
                    ? TransactionType.toBgColor(+tx.type as TransactionTypeEnum)
                    : "black";
            const box = Bodies.rectangle(carBoxCenterPosX, 80, size, size, {
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
        });

        const wall1 = Bodies.rectangle(
            carBoxSize.width,
            0,
            1,
            boxSizeToMatterSize(carBoxSize.height),
            {
                isStatic: true,
                render: {
                    strokeStyle: "gray",
                },
            },
        );

        const wall2 = Bodies.rectangle(
            0,
            0,
            1,
            boxSizeToMatterSize(carBoxSize.height),
            {
                isStatic: true,
                render: {
                    strokeStyle: "gray",
                },
            },
        );

        const ground = Bodies.rectangle(
            0,
            carBoxSize.height - 25,
            boxSizeToMatterSize(carBoxSize.width),
            1,
            {
                isStatic: true,
                render: {
                    fillStyle: "rgba(0,0,0,0)",
                    strokeStyle: "rgba(0,0,0,0)",
                },
            },
        );

        // add all of the bodies to the world
        Composite.add(engine.world, [
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

        // display transaction fee on box
        Matter.Events.on(render, "afterRender", function () {
            const context = render.context;
            context.fillStyle = "white";
            context.font = "12px";

            for (const box of txBoxes) {
                const { x, y } = box.position;
                const fee = transactions.find(
                    (tx) => tx.tx_hash === box.label,
                ).fee;
                context.fillText(`${+fee}`, x - 30, y);
            }
        });

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
        run();
    }, [blockHeader?.block_number]);

    useEffect(() => {
        if (setFromDoorClosing) {
            setFromDoorClosing(doorClosing);
        }
    }, [doorClosing]);

    const bgElevatorSide =
        chainTheme === ChainTheme.mainnet
            ? "bg-elevator-mainnet-side"
            : "bg-elevator-testnet-side";
    const borderBlack =
        chainTheme === ChainTheme.mainnet
            ? "border-border-mainnet-black"
            : "border-border-testnet-black";
    const borderElevatorFrame =
        chainTheme === ChainTheme.mainnet
            ? "border-elevator-mainnet-frame"
            : "border-elevator-testnet-frame";
    const bgElevatorBack =
        chainTheme === ChainTheme.mainnet
            ? "bg-elevator-mainnet-back"
            : "bg-elevator-testnet-back";
    const bgElevatorTop =
        chainTheme === ChainTheme.mainnet
            ? "bg-elevator-mainnet-top"
            : "bg-elevator-testnet-top";
    const bgElevatorBottom =
        chainTheme === ChainTheme.mainnet
            ? "bg-elevator-mainnet-bottom"
            : "bg-elevator-testnet-bottom";

    return (
        <div
            className={`relative flex flex-col justify-center  border-2 ${borderBlack} overflow-hidden ${
                doorClosing ? "closed" : ""
            }`}
        >
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

            <div
                className={`m-auto ${bgElevatorSide}`}
                id="matter-js-box"
                ref={boxRef}
            >
                {/* elevator background */}
                <div
                    className={`absolute top-0 left-0 w-full h-full z-0 pointer-events-none`}
                >
                    {/* bg-top */}
                    <div
                        className={`top-0 left-0 w-full h-[10%] ${bgElevatorTop} relative`}
                        style="clip-path: polygon(5% 100%, 95% 100%, 100% 0, 0 0);"
                    >
                        <div
                            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[30%] ${bgElevatorBack} border-4 ${borderBlack} rounded-[40%]`}
                        ></div>
                    </div>

                    {/* bg-middle */}
                    <div
                        className={`flex justify-between absolute top-[10%] left-0 w-full h-[80%] bg-[#A0CDB9]`}
                    >
                        <div
                            className={`w-[5%] h-full ${bgElevatorSide}`}
                        ></div>
                        <div
                            className={`w-[90%] h-full flex flex-col pt-4 border-2 ${borderBlack} ${bgElevatorBack}`}
                        >
                            <ElevatorCapacity />
                            <div
                                className={`flex flex-col justify-center align-middle gap-6 mt-20`}
                            >
                                <div
                                    class={`w-full border-[10px] ${borderElevatorFrame}`}
                                ></div>
                                <div
                                    class={`w-full border-[10px] ${borderElevatorFrame}`}
                                ></div>
                            </div>
                        </div>
                        <div
                            className={`w-[5%] h-full ${bgElevatorSide}`}
                        ></div>
                    </div>

                    {/* bg-bottom */}
                    <div
                        className={`absolute top-[90%] left-0 w-full h-[10%] ${bgElevatorBottom} clip-polygon`}
                        style="clip-path: polygon(5% 0, 95% 0, 100% 100%, 0 100%);"
                    ></div>
                </div>
                <canvas
                    className={`${bgElevatorBack} z-2 relative`}
                    width={carBoxSize?.width}
                    height={carBoxSize?.height}
                    ref={canvasRef}
                />
            </div>

            <div
                className={`absolute top-0 bottom-0 w-1/2 ${bgElevatorBottom} border-2 ${borderBlack} transition-all ${
                    doorClosing
                        ? "duration-1000 ease-in-out  left-0 transform translate-x-0"
                        : "duration-1000 ease-out  left-0 transform -translate-x-full"
                }`}
            />
            <div
                className={`absolute top-0 bottom-0 w-1/2 ${bgElevatorBottom} border-2 ${borderBlack} transition-all ${
                    doorClosing
                        ? "duration-1000 ease-in-out right-0 transform translate-x-0"
                        : "duration-1000 ease-out  right-0 transform translate-x-full"
                }`}
            />
        </div>
    );
};

export default ElevatorCar;
