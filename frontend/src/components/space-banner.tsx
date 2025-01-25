import { h } from "preact";
import { useState } from "preact/hooks";
import { useAtomValue } from "jotai";
import { ChainTheme, chainThemeAtom } from "../states/atoms";

export default function SpaceBanner() {
    const chainTheme = useAtomValue(chainThemeAtom);

    const [avgBlockTime, setAvgBlockTime] = useState(7.91);
    const [txPerMinute, setTxPerMinute] = useState(24.0);
    const [avgFeeRate, setAvgFeeRate] = useState(1000);
    const [epoch, setEpoch] = useState(11166);
    const [epochProgress, setEpochProgress] = useState("997/1800");

    const borderBlack =
        chainTheme === ChainTheme.mainnet
            ? "border-border-mainnet-black"
            : "border-border-testnet-black";
    const textBrand =
        chainTheme === ChainTheme.mainnet
            ? "text-brand-mainnet"
            : "text-brand-testnet";
    return (
        <div
            className={`relative h-[200px] bg-gradient-to-br from-surface-DEFAULT-inverse to-surface-hover-inverse flex flex-col md:flex-row items-center overflow-hidden border-2 ${borderBlack}`}
        >
            {/* 左侧太空场景 */}
            <div className="flex-1 w-full h-full relative">
                <div className="absolute top-0 left-0 w-36 h-36 bg-gray-100 rounded-full shadow-xl">
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
                <div className="absolute top-10 left-60 opacity-80 animate-float animation-delay-500">
                    <img src="/assets/svg/space/forks.svg" alt="" />
                </div>

                {/* 小行星 */}
                <div className="absolute bottom-10 right-40 w-16 h-16 bg-gray-600 rounded-full animate-float animation-delay-1500">
                    <div className="w-4 h-4 bg-gray-700 ml-4 mt-2 rounded-full" />
                </div>
            </div>

            {/* 中间信息区域 */}
            <div className="flex-1 z-10 space-y-6 mb-8 pl-8 md:mb-0">
                <h2 className={`${textBrand} text-center`}>
                    Elevating Trust, Block by Block
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
                                s/kB
                            </div>
                        </div>
                        <div class={"flex justify-start gap-2"}>
                            <h4 class={"text-text-inverse"}>{epoch}</h4>
                            <div class={`text-text-inverse-secondary`}>
                                {" "}
                                epoch
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
                <div className="absolute top-32 left-20 animate-float animation-delay-500">
                    <img src="/assets/svg/space/mining.svg" alt="" />
                </div>

                {/* launch rocket */}
                <div className="absolute bottom-20 right-40 rotate-[30deg] animate-float animation-delay-1500">
                    <img src="/assets/svg/space/launch.svg" alt="" />
                </div>

                {/* stars */}
                <div className="absolute top-40 right-20 animate-float animation-delay-500">
                    <img src="/assets/svg/space/star.svg" alt="" />
                </div>
            </div>
        </div>
    );
}
