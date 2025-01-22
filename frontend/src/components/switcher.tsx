import { useState } from "preact/hooks";

interface SwitcherProps {
    onSwitch: (view: "elevator" | "box") => void;
}

const Switcher: React.FC<SwitcherProps> = ({ onSwitch }) => {
    const [activeView, setActiveView] = useState<"elevator" | "box">(
        "elevator",
    );

    const handleSwitch = (view: "elevator" | "box") => {
        setActiveView(view);
        onSwitch(view);
    };

    return (
        <div className="my-10 w-[350px] mx-auto flex justify-between border border-black rounded-full overflow-hidden bg-[#e5e5d6]">
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
    );
};

export default Switcher;
