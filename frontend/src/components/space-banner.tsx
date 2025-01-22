// components/SpaceBanner.tsx
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
            className={`relative h-[200px] bg-gradient-to-br from-gray-600 to-surface-DEFAULT-02 flex flex-col md:flex-row items-center overflow-hidden border-2 ${borderBlack}`}
        >
            {/* 左侧太空场景 */}
            <div className="flex-1 w-full h-full relative">
                {/* 浮动元素 */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-float" />
                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-float animation-delay-1000" />

                {/* 太空站 */}
                <div className="absolute top-32 left-20 animate-float animation-delay-500">
                    <div className="w-8 h-8 bg-gray-400 rounded-tr-2xl" />
                    <div className="w-12 h-4 bg-gray-300 ml-4 mt-2 rounded" />
                </div>

                {/* 小行星 */}
                <div className="absolute bottom-20 right-40 w-16 h-16 bg-gray-600 rounded-full animate-float animation-delay-1500">
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
                            <h4>{avgBlockTime}s</h4>
                            <div class={`text-text-secondary`}>Block</div>
                        </div>
                        <div class={"flex justify-start gap-2"}>
                            <h4>{avgFeeRate} shannons/kB</h4>
                        </div>
                        <div class={"flex justify-start gap-2"}>
                            <div class={`text-text-secondary`}>Epoch</div>
                            <h4>
                                {epoch} {`(${epochProgress})`}
                            </h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* 右侧太空场景 */}
            <div className="flex-1 w-full h-full relative">
                {/* 半月 - 只保留clip-path在CSS */}
                <div className="absolute top-[-40px] right-[-20px] w-36 h-36 bg-gray-100 rounded-full shadow-xl opacity-80 clip-moon transform rotate-45">
                    <div
                        className="absolute inset-0 rounded-full opacity-70 mix-blend-multiply"
                        style={{
                            backgroundImage: "url(/src/assets/img/moon.gif)",
                            backgroundSize: "cover",
                        }}
                    />
                </div>

                {/* 浮动元素 */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-float" />
                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-float animation-delay-1000" />

                {/* 太空站 */}
                <div className="absolute top-32 left-20 animate-float animation-delay-500">
                    <div className="w-8 h-8 bg-gray-400 rounded-tr-2xl" />
                    <div className="w-12 h-4 bg-gray-300 ml-4 mt-2 rounded" />
                </div>

                {/* 小行星 */}
                <div className="absolute bottom-20 right-40 w-16 h-16 bg-gray-600 rounded-full animate-float animation-delay-1500">
                    <div className="w-4 h-4 bg-gray-700 ml-4 mt-2 rounded-full" />
                </div>
            </div>
        </div>
    );
}
