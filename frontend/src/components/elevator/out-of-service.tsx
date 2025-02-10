import { FunctionalComponent } from "preact";
import ElevatorMiner from "./miner";
import { useAtomValue } from "jotai";
import { chainThemeAtom, ChainTheme } from "../../states/atoms";
import { carBoxSize } from "./util";
import { WebSocketConnectionState } from "../../service/ws";

export interface ElevatorOutOfServiceUIProp {
    connectStatus: WebSocketConnectionState;
}

export const ElevatorOutOfServiceUI: FunctionalComponent<
    ElevatorOutOfServiceUIProp
> = ({ connectStatus }) => {
    const chainTheme = useAtomValue(chainThemeAtom);
    const bgElevatorFrame =
        chainTheme === ChainTheme.mainnet
            ? "bg-elevator-mainnet-frame"
            : "bg-elevator-testnet-frame";
    const borderBlack =
        chainTheme === ChainTheme.mainnet
            ? "border-border-mainnet-black"
            : "border-border-testnet-black";

    const bgElevatorSide =
        chainTheme === ChainTheme.mainnet
            ? "bg-elevator-mainnet-side"
            : "bg-elevator-testnet-side";

    const bgElevatorBack =
        chainTheme === ChainTheme.mainnet
            ? "bg-elevator-mainnet-back"
            : "bg-elevator-testnet-back";

    const bgElevatorBottom =
        chainTheme === ChainTheme.mainnet
            ? "bg-elevator-mainnet-bottom"
            : "bg-elevator-testnet-bottom";

    return (
        <div
            className={
                "flex justify-center align-center items-center gap-2 bg-surface-DEFAULT-01"
            }
        >
            <div className={"w-1/5 self-end"}>
                <ElevatorMiner
                    nonce={"0x0"}
                    difficultyInEH={0}
                    doorClosing={false}
                />
            </div>

            <div>
                <div
                    className={`${bgElevatorFrame} flex flex-col justify-center mx-auto rounded-lg border-[20px] ${borderBlack}`}
                >
                    <div className={"p-4"}>
                        <div
                            className={
                                "w-min text-nowrap flex justify-center gap-1 text-center p-4 bg-surface-DEFAULT-inverse mx-auto rounded-lg"
                            }
                        >
                            <div className={"text-functional-error"}>
                                Status
                            </div>
                            <div className={"text-text-inverse"}>
                                Connection {connectStatus}
                            </div>
                        </div>
                    </div>
                    <div className={"px-20"}>
                        {/* elevator car */}
                        <div
                            className={`relative flex flex-col justify-center  border-2 ${borderBlack} overflow-hidden closed`}
                        >
                            <div
                                className={`m-auto ${bgElevatorSide}`}
                                id="matter-js-box"
                            >
                                <canvas
                                    className={`${bgElevatorBack} z-2 relative`}
                                    width={carBoxSize.width}
                                    height={carBoxSize.height}
                                />
                            </div>

                            <div
                                className={`absolute top-0 bottom-0 w-1/2 ${bgElevatorBottom} border-2 ${borderBlack} transition-all duration-1000 ease-in-out  left-0 transform translate-x-0`}
                            />
                            <div
                                className={`absolute top-0 bottom-0 w-1/2 ${bgElevatorBottom} border-2 ${borderBlack} transition-all duration-1000 ease-in-out right-0 transform translate-x-0`}
                            />
                            <div
                                className={
                                    "absolute place-self-center w-fit max-w-[200px] rounded-md bg-brand-accent flex flex-col gap-6 justify-center items-center py-4 px-8 border-[6px] border-text-primary"
                                }
                            >
                                <div>
                                    <img
                                        src="/assets/svg/elevator/out-of-service-sign.svg"
                                        alt=""
                                    />
                                </div>
                                <div
                                    className={"text-text-primary text-center"}
                                >
                                    <h3>ELEVATOR OUT OF SERVICE</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={"w-1/5"}>
                <div
                    className={`bg-surface-DEFAULT-inverse rounded-md p-4 w-[145px] text-wrap text-white flex flex-col gap-6`}
                >
                    <div>
                        {connectStatus === WebSocketConnectionState.OPEN
                            ? "Syncing Blocks"
                            : "Try connecting to sync blocks"}
                    </div>
                    <div className="flex justify-center">
                        <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 
							 0 0 5.373 0 12h4zM12 24c6.627 
							 0 12-5.373 12-12h-4a8 8 0 
							 01-8 8v4z"
                            />
                        </svg>
                    </div>
                    <div>Please wait..</div>
                </div>
            </div>
        </div>
    );
};
