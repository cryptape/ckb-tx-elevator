import SpaceBanner from "../components/space-banner";
import BaseLayout from "../layouts/base";
import { ElevatorUI } from "../components/elevator/elevator-ui";
import { useEffect, useState } from "preact/hooks";
import { FunctionalComponent } from "preact";
import { useChainService } from "../context/chain";
import { Hex } from "@ckb-ccc/core";
import { TipBlockResponse } from "../service/type";
import { useRoute } from "wouter";

interface RouteParams {
    block_hash: string;
    [key: string]: string;
}
export const Block: FunctionalComponent = () => {
    const [match, params] = useRoute<RouteParams>("/block/:block_hash");
    if (!match || !params?.block_hash) return null;
    const blockHash = params.block_hash as Hex;
    const { chainService, waitForConnection } = useChainService();
    const [block, setBlock] = useState<TipBlockResponse>(null);

    const fetchBlock = async () => {
        //await waitForConnection();
        const [blockHeader, committedTransactions, proposedTransactions] =
            await Promise.all([
                chainService.getBlockHeader(blockHash),
                chainService.getCommittedTransactions(blockHash),
                chainService.getProposedTransactionsByBlock(blockHash),
            ]);
        setBlock({ blockHeader, committedTransactions, proposedTransactions });
    };

    useEffect(() => {
        fetchBlock();
    }, [blockHash]);

    return (
        <BaseLayout>
            <SpaceBanner isToTheMoon={false} />
            {block && <ElevatorUI block={block} />}
        </BaseLayout>
    );
};
