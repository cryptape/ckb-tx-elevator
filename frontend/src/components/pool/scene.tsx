import Matter from "matter-js";
import { FunctionalComponent } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { Transaction } from "../../service/api";
import { randomFillStyleColor, transactionSquareSize } from "../elevator/util";

export interface PoolSceneProp {
    pendingTxs: Transaction[];
    proposingTxs: Transaction[];
    proposedTxs: Transaction[];
    tipCommittedTxs: Transaction[];
}

const PoolScene: FunctionalComponent<PoolSceneProp> = ({
    pendingTxs,
    proposedTxs,
    proposingTxs,
    tipCommittedTxs,
}) => {
    const boxRef = useRef(null);
    const canvasRef = useRef(null);

    function createScene() {
        var Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Composite = Matter.Composite,
            Composites = Matter.Composites,
            Common = Matter.Common,
            Bodies = Matter.Bodies;

        // create engine
        var engine = Engine.create(),
            world = engine.world;

        let render = Render.create({
            element: boxRef.current,
            engine: engine,
            canvas: canvasRef.current,
            options: {
                background: "transparent",
                wireframes: false,
            },
        });

        Render.run(render);

        // create runner
        var runner = Runner.create();

        // add bodies
        const pendingBoxes = pendingTxs.map((tx, i) => {
            const size = transactionSquareSize(tx.size);
            const box = Bodies.rectangle(i, 0, size, size, {
                render: {
                    fillStyle: randomFillStyleColor(),
                    strokeStyle: "black",
                    lineWidth: 3,
                },
            });
            box.label = tx.tx_hash;
            return box;
        });

        Composite.add(world, [...pendingBoxes]);

        Composite.add(world, [
            Bodies.rectangle(0, 580, 800, 20, {
                isStatic: true,
                //angle: Math.PI * 0.04,
                render: { fillStyle: "white" },
            }),
        ]);

        // fit the render viewport to the scene
        Render.lookAt(render, Composite.allBodies(world));

        Runner.run(runner, engine);
    }

    useEffect(() => {
        createScene();
    }, []);

    return (
        <div
            className={`m-auto flex flex-col justify-center`}
            id="matter-js-pool"
            ref={boxRef}
        >
            <canvas
                className={`z-2 relative`}
                width={600}
                height={600}
                ref={canvasRef}
            />
        </div>
    );
};

export default PoolScene;
