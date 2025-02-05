import { useEffect, useState } from "preact/hooks";
import { useAtomValue } from "jotai";
import { chainThemeAtom } from "../../states/atoms";
import { TipBlockResponse } from "../../service/type";
import { useChainService } from "../../context/chain";
import { ElevatorUI } from "./elevator-ui";
import { ElevatorOutOfServiceUI } from "./out-of-service";

export interface ElevatorProp {
    setIsNewBlock?: (isNewBlock: boolean) => void;
}

export default function Elevator({ setIsNewBlock }: ElevatorProp) {
    const chainTheme = useAtomValue(chainThemeAtom);
    const { chainService, waitForConnection } = useChainService();

    const [tipBlock, setTipBlock] = useState<TipBlockResponse>(undefined);

    const setDoorClosingAndIsNewBlock = (doorClosing: boolean) => {
        setIsNewBlock && setIsNewBlock(doorClosing);
    };

    // subscribe to new block
    // todo: need unscribe when component unmount
    const subNewBlock = async () => {
        // 等待连接就绪
        await waitForConnection();

        chainService.subscribeNewBlock((newBlock) => {
            if (newBlock.blockHeader) {
                setTipBlock((prev) => {
                    if (
                        prev == null ||
                        prev?.blockHeader?.block_number <
                            newBlock.blockHeader.block_number
                    ) {
                        return newBlock || undefined;
                    } else {
                        return prev;
                    }
                });
            }
        });
    };
    useEffect(() => {
        subNewBlock();
    }, [chainTheme]);

    return (
        <div>
            {tipBlock ? (
                <ElevatorUI
                    block={tipBlock}
                    onDoorClosing={setDoorClosingAndIsNewBlock}
                />
            ) : (
                <ElevatorOutOfServiceUI
                    connectStatus={chainService.wsClient.connectionState}
                />
            )}
        </div>
    );
}
