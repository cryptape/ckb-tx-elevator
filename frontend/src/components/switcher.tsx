import { useState } from "preact/hooks";

interface SwitcherProps {
    front: React.ReactNode;
    back: React.ReactNode;
}

const Switcher: React.FC<SwitcherProps> = ({ front, back }) => {
    const [activeView, setActiveView] = useState<"elevator" | "box">(
        "elevator",
    );

    const handleSwitch = (view: "elevator" | "box") => {
        setActiveView(view);
    };

    return (
        <div class="w-full">
            {/* switch button */}
            <div class={`my-10 flex justify-center`}>
                <div className="w-[350px] flex justify-between border border-black rounded-full overflow-hidden bg-[#e5e5d6]">
                    <button
                        className={`w-full px-5 py-2 text-base cursor-pointer flex items-center gap-1 border-r border-black ${
                            activeView === "elevator"
                                ? "bg-[#ffc107] text-black"
                                : "text-gray-500"
                        }`}
                        onClick={() => handleSwitch("elevator")}
                    >
                        <span className="inline-flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="1em"
                                height="1em"
                                fill="currentColor"
                            >
                                <path d="M3 4H21V20H3V4ZM5 6V18H19V6H5ZM7 8H10V16H7V8ZM14 8H17V16H14V8Z"></path>
                            </svg>
                        </span>
                        <span>Elevator View</span>
                    </button>
                    <button
                        className={`w-full px-5 py-2 text-base cursor-pointer flex items-center gap-1 ${
                            activeView === "box"
                                ? "bg-[#ffc107] text-black"
                                : "text-gray-500"
                        }`}
                        onClick={() => handleSwitch("box")}
                    >
                        <span className="inline-flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="1em"
                                height="1em"
                                fill="currentColor"
                            >
                                <path d="M16 16V8H8V16H16ZM18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM16 18H8V16H16V18ZM16 6H8V4H16V6Z"></path>
                            </svg>
                        </span>
                        <span>Pool View</span>
                    </button>
                </div>
            </div>

            {/* 3D flip container */}
            <div class="h-fit relative" style={{ perspective: "1000px" }}>
                <div
                    class={`transition-transform duration-1000 ease-out origin-top`}
                    style={{
                        transformStyle: "preserve-3d",
                        transform:
                            activeView === "elevator" ? "" : "rotateX(-180deg)",
                    }}
                >
                    {/* front content */}
                    <div
                        class="absolute w-full h-full"
                        style={{
                            backfaceVisibility: "hidden",
                            transform: "translateZ(1px)",
                        }}
                    >
                        {front}
                    </div>

                    {/* back content */}
                    <div
                        class="absolute w-full h-full"
                        style={{
                            backfaceVisibility: "hidden",
                            transform: "rotateX(180deg) translateZ(1px)",
                        }}
                    >
                        {back}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Switcher;
