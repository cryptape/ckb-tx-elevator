import SpaceBanner from "../components/space-banner";
import BaseLayout from "../layouts/base";
import { ElevatorUI } from "../components/elevator/elevator-ui";
import { useEffect, useState } from "preact/hooks";
import { FunctionalComponent } from "preact";
import { useChainService } from "../context/chain";
import { Hex } from "@ckb-ccc/core";
import { TipBlockResponse } from "../service/type";
import { useRoute } from "wouter";
import Ground from "../components/ground";
import { ReplayHeader } from "../components/replay/header";
import { toShortHex } from "../util/type";
import { useAtomValue } from "jotai";
import { ChainTheme, chainThemeAtom } from "../states/atoms";

interface RouteParams {
    block_hash: string;
    [key: string]: string;
}
export const Block: FunctionalComponent = () => {
    const chainTheme = useAtomValue(chainThemeAtom);
    const [match, params] = useRoute<RouteParams>("/replay/:block_hash");
    if (!match || !params?.block_hash) return null;
    const blockHash = params.block_hash as Hex;
    const { chainService, waitForConnection } = useChainService();
    const [block, setBlock] = useState<TipBlockResponse>(null);
    const [prevHash, setPrevHash] = useState<Hex>(null);
    const [nextHash, setNextHash] = useState<Hex>(null);

    const fetchBlock = async () => {
        await waitForConnection();
        const [blockHeader, committedTransactions, proposedTransactions] =
            await Promise.all([
                chainService.getBlockHeader(blockHash),
                chainService.getCommittedTransactions(blockHash),
                chainService.getProposedTransactionsByBlock(blockHash),
            ]);
        setBlock({ blockHeader, committedTransactions, proposedTransactions });
        if (blockHeader) {
            const prevHeader = await chainService.getBlockHeader(
                blockHeader.parent_hash,
            );
            setPrevHash(prevHeader?.block_hash);
            const nextBlockNum = parseInt(blockHeader.block_number) + 1;
            const nextHeader = await chainService.getBlockHeaderByNumber(
                nextBlockNum.toString(),
            );
            setNextHash(nextHeader?.block_hash);
        }
    };

    useEffect(() => {
        fetchBlock();
    }, [blockHash]);

    const textColor =
        chainTheme === ChainTheme.mainnet
            ? "text-brand-mainnet"
            : "text-brand-testnet";

    return (
        <BaseLayout>
            <SpaceBanner isToTheMoon={false} />
            <ReplayHeader blockHash={blockHash} />
            <div
                className={
                    "flex flex-col items-center justify-center mx-5 my-10 gap-6"
                }
            >
                <div className={"mt-6 flex justify-between w-[400px]"}>
                    <div>
                        {prevHash ? (
                            <a
                                className={`${textColor}`}
                                href={`/replay/${prevHash}`}
                            >
                                {"<"}
                            </a>
                        ) : (
                            <div className={"text-text-secondary"}>End</div>
                        )}
                    </div>
                    <div className={"text-text-secondary"}>
                        <span>Block </span>
                        {toShortHex(blockHash)}
                    </div>
                    <div>
                        {nextHash ? (
                            <a
                                className={`${textColor}`}
                                href={`/replay/${nextHash}`}
                            >
                                {">"}
                            </a>
                        ) : (
                            <div className={"text-text-secondary"}>End</div>
                        )}
                    </div>
                </div>
            </div>
            {block?.blockHeader && <ElevatorUI block={block} />}
            <Ground />
        </BaseLayout>
    );
};
