import { FunctionalComponent, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useAtomValue } from "jotai";
import { ChainTheme, chainThemeAtom } from "../states/atoms";
import { useChainService } from "../context/chain";

export interface SpaceBannerProps {
    isToTheMoon?: boolean;
}

export const SpaceBanner: FunctionalComponent<SpaceBannerProps> = ({
    isToTheMoon,
}) => {
    const chainTheme = useAtomValue(chainThemeAtom);
    const { chainService } = useChainService();

    const [avgBlockTime, setAvgBlockTime] = useState<number>();
    const [avgFeeRate, setAvgFeeRate] = useState<number>();
    const [difficulty, setDifficulty] = useState<number>();

    const fetchData = async () => {
        const chainStats = await chainService.getChainStats();
        setAvgBlockTime(chainStats.averageBlockTime);
        setAvgFeeRate(+chainStats.feeRate);
        setDifficulty(
            +parseFloat(
                (
                    +chainStats.chainInfo.difficulty / 1000000000000000000
                ).toString(),
            ).toFixed(2),
        );
    };
    useEffect(() => {
        fetchData();
    }, [chainTheme]);

    const borderBlack =
        chainTheme === ChainTheme.mainnet
            ? "border-border-mainnet-black"
            : "border-border-testnet-black";
    const textBrand =
        chainTheme === ChainTheme.mainnet
            ? "text-brand-mainnet"
            : "text-brand-testnet";
    const moonSize = isToTheMoon === true ? "w-48 h-48" : "w-36 h-36";
    const moonTop = isToTheMoon === true ? "top-[-30px]" : "top-0";
    return (
        <div
            className={`relative h-[200px] bg-gradient-to-br from-surface-DEFAULT-inverse to-surface-hover-inverse flex flex-col md:flex-row items-center  border-2 ${borderBlack}`}
        >
            {/* 左侧太空场景 */}
            <div className="z-30 flex-1 w-full h-full relative">
                {/* 月球 */}
                <div
                    className={`z-30 absolute ${moonTop} left-0 ${moonSize} bg-gray-100 rounded-full shadow-xl`}
                >
                    <div
                        className="absolute inset-0 rounded-full mix-blend-multiply"
                        style={{
                            backgroundImage: "url(/assets/svg/space/moon.svg)",
                            backgroundSize: "cover",
                        }}
                    />
                </div>

                {/* 浮动元素 */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-float" />
                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-float animation-delay-1000" />

                {/* stars */}
                <div className="absolute top-32 left-40 animate-float animation-delay-500">
                    <img src="/assets/svg/space/star.svg" alt="" />
                </div>

                {/* Forks */}
                <div className="absolute top-10 left-60 opacity-80 animate-float animation-delay-500 group z-20">
                    <img
                        src="/assets/svg/space/forks.svg"
                        alt=""
                        className="cursor-help relative z-10"
                    />

                    {/* 中央浮动说明文字 */}
                    <div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-300
                    bg-black/70 backdrop-blur-sm rounded-xl px-4 py-3
                    text-sm text-white w-[220px] text-center
                    shadow-xl z-20"
                    >
                        <div className="absolute inset-0 border-2 border-white/20 rounded-xl pointer-events-none" />
                        <div>
                            <a
                                href="https://docs.nervos.org/docs/history-and-hard-forks/ckb-hard-fork-history#1st-hard-fork--ckb-edition-mirana-2021"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                1st Hard Fork – CKB Edition Mirana (2021)
                            </a>
                        </div>
                        <div>
                            <a
                                href="https://docs.nervos.org/docs/history-and-hard-forks/ckb-hard-fork-history#2nd-hard-fork--ckb-edition-meepo-2024"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                2nd Hard Fork – CKB Edition Meepo (2024)
                            </a>
                        </div>
                    </div>
                </div>

                {/* 小行星 */}
                <div className="absolute bottom-10 left-2/3 w-16 h-16 bg-gray-600 rounded-full animate-float animation-delay-1500">
                    <div className="w-4 h-4 bg-gray-700 ml-4 mt-2 rounded-full" />
                </div>
            </div>

            {/* 中间信息区域 */}
            <div className="flex-1 z-10 space-y-6 mb-8 pl-8 md:mb-0">
                <h2
                    className={`${isToTheMoon ? "text-brand-accent" : textBrand} text-center`}
                >
                    {isToTheMoon
                        ? "To The Moon!"
                        : "Elevating Trust, Block by Block"}
                </h2>
                <div class={"flex flex-col"}>
                    <div class={"flex justify-between gap-2"}>
                        <div class={"flex justify-start gap-2"}>
                            <h4 class={"text-text-inverse"}>{avgBlockTime}s</h4>
                            <div class={"text-text-inverse-secondary"}>
                                Block
                            </div>
                        </div>
                        <div class={"flex justify-start gap-2"}>
                            <h4 class={"text-text-inverse"}>{avgFeeRate}</h4>
                            <div class={`text-text-inverse-secondary`}>
                                {" "}
                                FeeRate
                            </div>
                        </div>
                        <div class={"flex justify-start gap-2"}>
                            <h4 class={"text-text-inverse"}>{difficulty} EH</h4>
                            <div class={`text-text-inverse-secondary`}>
                                {" "}
                                difficulty
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 右侧太空场景 */}
            <div className="flex-1 w-full h-full relative">
                {/* 浮动元素 */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-float" />
                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-float animation-delay-1000" />

                {/* mining machine */}
                <div className="absolute top-32 left-20 animate-float animation-delay-500 group z-20">
                    <img src="/assets/svg/space/mining.svg" alt="" />
                    {/* 中央浮动说明文字 */}
                    <div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-300
                    bg-black/70 backdrop-blur-sm rounded-xl px-4 py-3
                    text-sm text-white w-[220px] text-center
                    shadow-xl z-20"
                    >
                        <div className="absolute inset-0 border-2 border-white/20 rounded-xl pointer-events-none" />
                        <div>
                            <a
                                href="https://docs.nervos.org/docs/mining/hardware"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                The first CKB ASIC mining machine was launched
                                in 2020.03
                            </a>
                        </div>
                    </div>
                </div>

                {/* launch rocket */}
                <div className="absolute bottom-20 left-1/2 rotate-[30deg] animate-float animation-delay-1500 group z-20">
                    <img src="/assets/svg/space/launch.svg" alt="" />
                    {/* 中央浮动说明文字 */}
                    <div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-300
                    bg-black/70 backdrop-blur-sm rounded-xl px-4 py-3
                    text-sm text-white w-[220px] text-center
                    shadow-xl z-20"
                    >
                        <div className="absolute inset-0 border-2 border-white/20 rounded-xl pointer-events-none" />
                        <div>
                            <a
                                href="https://docs.nervos.org/docs/mining/halving#when-will-ckbyte-be-halved"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                the CKB Mainnet launch at 16 Nov 2019
                            </a>
                        </div>
                    </div>
                </div>

                {/* stars */}
                <div className="absolute top-40 right-20 animate-float animation-delay-500">
                    <img src="/assets/svg/space/star.svg" alt="" />
                </div>

                {/* meteor */}
                <div className="h-full absolute top-0 right-20">
                    <img
                        className={"h-full"}
                        src="/assets/svg/space/meteor.svg"
                        alt=""
                    />
                </div>

                {/* meteor 2 */}
                <div className="h-full absolute top-0 right-0">
                    <img
                        className={"h-full"}
                        src="/assets/svg/space/meteor.svg"
                        alt=""
                    />
                </div>
            </div>
        </div>
    );
};

export default SpaceBanner;
