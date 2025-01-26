import { BodyToolTip } from "matter-js";
import { Network, TransactionType } from "../service/type";
import { createTransactionLink } from "./link";

export const bodyToScreenPosition = (body: Matter.Body) => {
    return {
        x: body.position.x,
        y: body.position.y - 10,
    };
};

export const createTooltipContent = (
    toolTip: BodyToolTip,
    network: Network,
) => {
    return (
        <div>
            <div>txHash: {toolTip.txHash.slice(0, 12)}..</div>
            <div>txFee: {toolTip.txFee} shannon</div>
            <div>txSize: {toolTip.txSize} bytes</div>
            <div>txType: {TransactionType.toString(toolTip.txType)}</div>
            <div>
                Seen:{" "}
                {new Date(
                    toolTip.FirstSeenInPool ?? Date.now(),
                ).toLocaleString()}
            </div>
            <div>
                <a
                    className={"text-brand-accent"}
                    href={createTransactionLink(toolTip.txHash, network)}
                    target={"_blank"}
                >
                    view more
                </a>
            </div>
        </div>
    );
};
