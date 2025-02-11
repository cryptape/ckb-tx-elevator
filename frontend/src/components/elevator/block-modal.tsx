import { h, JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { ChainTheme, chainThemeAtom } from "../../states/atoms";
import { useAtomValue } from "jotai";
import { createBlockLink, createTransactionLink } from "../../util/link";
import { BlockResponse, Network } from "../../service/type";
import { useChainService } from "../../context/chain";
import { ccc, Hex } from "@ckb-ccc/core";
import {
    calcBlockOccupation,
    calcTotalTxSize,
    shannonToCKB,
    toShortHex,
} from "../../util/type";
import { compactToDifficulty, difficultyToEH } from "../../util/difficulty";

interface BlockModalProps {
    blockHash: Hex;
    onClose: () => void;
}

const BlockModal: preact.FunctionComponent<BlockModalProps> = ({
    blockHash,
    onClose,
}) => {
    const chainTheme = useAtomValue(chainThemeAtom);
    const { chainService } = useChainService();
    const [block, setBlock] = useState<BlockResponse>();
    const fetchData = async () => {
        const block = await chainService.getBlock(blockHash);
        console.log(block);
        setBlock(block);
    };
    useEffect(() => {
        fetchData();
    }, [chainTheme]);

    const blockNumber = +block?.blockHeader.block_number;
    const displayBlockHash = block?.blockHeader.block_hash
        ? toShortHex(block.blockHeader.block_hash)
        : undefined;
    const transactions = block?.transactions;
    const transactionCount = block?.transactions.length;
    const occupation = calcBlockOccupation(block?.transactions || []);
    const size = calcTotalTxSize(block?.transactions || []);
    const proposalTransactions = block?.proposalTransactions.length;
    const minerRewardCKB = shannonToCKB(+block?.miner.award);
    const difficulty = block?.blockHeader.compact_target
        ? difficultyToEH(compactToDifficulty(block?.blockHeader.compact_target))
        : undefined;
    const nonce = block?.blockHeader.nonce
        ? toShortHex(block?.blockHeader.nonce)
        : undefined;
    const extraHash = block?.blockHeader.extra_hash
        ? toShortHex(block?.blockHeader.extra_hash)
        : undefined;
    const miner = block?.miner.address
        ? toShortHex(block?.miner.address)
        : undefined;
    const timestamp = new Date(block?.blockHeader.timestamp).toLocaleString();

    const [activeTab, setActiveTab] = useState<"info" | "transaction">("info");

    const handleTabClick = (tab: "info" | "transaction") => {
        setActiveTab(tab);
    };

    const elevatorIcon =
        chainTheme === ChainTheme.mainnet
            ? "/assets/svg/modal/mainnet/elevator-icon.svg"
            : "/assets/svg/modal/testnet/elevator-icon.svg";
    const textBrandColor =
        chainTheme === ChainTheme.mainnet
            ? "text-brand-mainnet"
            : "text-brand-testnet";
    const borderBrandColor =
        chainTheme === ChainTheme.mainnet
            ? "border-brand-mainnet"
            : "border-brand-testnet";
    const textBrandColorHover =
        chainTheme === ChainTheme.mainnet
            ? "hover:text-brand-mainnet-hover"
            : "hover:text-brand-testnet-hover";
    const buttonColor =
        chainTheme === ChainTheme.mainnet
            ? "bg-brand-mainnet"
            : "bg-brand-testnet";
    const buttonHover =
        chainTheme === ChainTheme.mainnet
            ? "hover:bg-brand-mainnet-hover"
            : "hover:bg-brand-testnet-hover";

    const dataItem = (title: string, value: JSX.Element) => (
        <div className="flex">
            <div className="w-1/2 text-left text-gray-700">{title}</div>
            <div className="w-1/2 text-left font-medium">{value}</div>
        </div>
    );
    return (
        <div className="top-0 left-0 w-screen h-screen fixed z-200 flex items-center justify-center">
            <div className="bg-[#F7EED4] rounded-lg shadow-lg w-1/3 p-8 relative border-2 border-black text-text-primary">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                    <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                {/* Header */}
                <div className="flex items-center mb-4 gap-2">
                    <img src="/assets/svg/modal/block.svg" />
                    <h2 className="text-xl font-semibold">Block</h2>
                </div>

                {/* Block Address */}
                <div className="bg-surface-DEFAULT-03 p-2 rounded-md flex flex-col justify-center items-center mb-4">
                    <img
                        src={elevatorIcon}
                        alt="Block Illustration"
                        className="h-12 w-12"
                    />
                    <div className="text-sm break-all ml-2 flex gap-2">
                        <h4>{displayBlockHash}</h4>
                        <button className="ml-1">
                            <img src="/assets/svg/modal/copy.svg" alt="" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b mb-4">
                    <button
                        className={`py-2 px-4 ${
                            activeTab === "info"
                                ? `border-b-2 ${borderBrandColor} ${textBrandColor}`
                                : "text-text-tertiary hover:text-text-tertiary-700"
                        }`}
                        onClick={() => handleTabClick("info")}
                    >
                        Info
                    </button>
                    <button
                        className={`py-2 px-4 font-medium ${
                            activeTab === "transaction"
                                ? `border-b-2 ${borderBrandColor} ${textBrandColor}`
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => handleTabClick("transaction")}
                    >
                        Transaction ({transactionCount})
                    </button>
                </div>

                {/* Content */}
                {activeTab === "info" && (
                    <div>
                        <div className="grid grid-cols-1 gap-2">
                            {dataItem(
                                "Block Number",
                                <span>{blockNumber}</span>,
                            )}
                            {dataItem(
                                "Transactions",
                                <span>{transactionCount}</span>,
                            )}
                            {dataItem(
                                "Occupation",
                                <div className="font-medium flex items-center">
                                    <div
                                        className="bg-yellow-500 h-3 mr-2 rounded-l-md"
                                        style={{ width: `${occupation}%` }}
                                    ></div>
                                    <div className="bg-gray-200 h-3 rounded-r-md w-full"></div>
                                    <span className="ml-2">{occupation}%</span>
                                </div>,
                            )}
                            {dataItem(
                                "Total Tx Size",
                                <span>{size} Bytes</span>,
                            )}
                            {dataItem(
                                "Proposal Transactions",
                                <span>{proposalTransactions}</span>,
                            )}
                            {dataItem(
                                "Miner Reward",
                                <span>{minerRewardCKB} CKB</span>,
                            )}
                            {dataItem(
                                "Difficulty",
                                <span>{difficulty} EH</span>,
                            )}
                            {dataItem("Nonce", <span>{nonce}</span>)}
                            {dataItem("Extra Hash", <span>{extraHash}</span>)}
                            {dataItem(
                                "Miner",
                                <div class={"flex items-center"}>
                                    {miner}{" "}
                                    <button className="ml-1">
                                        <img
                                            src="/assets/svg/modal/copy.svg"
                                            alt=""
                                        />
                                    </button>
                                </div>,
                            )}
                            {dataItem("Timestamp", <span>{timestamp}</span>)}
                        </div>
                    </div>
                )}

                {activeTab === "transaction" && (
                    <div className={"text-left px-4"}>
                        {transactions.map((tx, index) => (
                            <div className={"flex justify-start"}>
                                <div className={"w-[40px] text-text-secondary"}>
                                    #{index + 1}
                                </div>
                                <div className={`w-1/3  ${textBrandColor}`}>
                                    <a
                                        href={createTransactionLink(
                                            tx.tx_hash,
                                            chainTheme === ChainTheme.mainnet
                                                ? Network.Mainnet
                                                : Network.Testnet,
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {toShortHex(tx.tx_hash)}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Buttons */}
                <div className="mt-8 flex flex-col gap-2">
                    <button
                        onClick={() => {
                            window.location.href = `/replay/${blockHash}`;
                        }}
                        className={`${buttonColor} ${buttonHover} text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline`}
                    >
                        Share this Block
                    </button>
                    <a
                        href={createBlockLink(
                            block?.blockHeader.block_hash ?? "",
                            chainTheme === ChainTheme.mainnet
                                ? Network.Mainnet
                                : Network.Testnet,
                        )}
                        className={`flex justify-center items-center gap-2 text-center ${textBrandColor} ${textBrandColorHover}`}
                        target={"_blank"}
                    >
                        <svg
                            width="19"
                            height="18"
                            viewBox="0 0 19 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M14 9.75V14.25C14 14.6478 13.842 15.0294 13.5607 15.3107C13.2794 15.592 12.8978 15.75 12.5 15.75H4.25C3.85218 15.75 3.47064 15.592 3.18934 15.3107C2.90804 15.0294 2.75 14.6478 2.75 14.25V6C2.75 5.60218 2.90804 5.22064 3.18934 4.93934C3.47064 4.65804 3.85218 4.5 4.25 4.5H8.75M11.75 2.25H16.25M16.25 2.25V6.75M16.25 2.25L8 10.5"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        View on Explorer
                    </a>
                </div>
            </div>
        </div>
    );
};

export default BlockModal;
