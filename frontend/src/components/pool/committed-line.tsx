import { useEffect, useRef } from "preact/hooks";
import Matter from "matter-js";
import {
    Transaction,
    TransactionType,
    TransactionTypeEnum,
} from "../../service/type";
import { FunctionalComponent } from "preact";
import { transactionSquareSize } from "../elevator/util";

export interface CommittedLineProps {
    title: string;
    txs: Transaction[];
}

export const CommittedLine: FunctionalComponent<CommittedLineProps> = ({
    title,
    txs,
}) => {
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

        Matter.Composite.add(engine.world, [...txBoxes]);

        // run the renderer
        Render.run(render);

        // create runner
        var runner = Runner.create();

        // run the engine
        Runner.run(runner, engine);
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
                </div>
            </div>
        </div>
    );
};
