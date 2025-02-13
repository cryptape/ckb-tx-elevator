import { useState } from "preact/hooks";

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    pos?: "top" | "bottom" | "left" | "right"; // Added prop for tooltip position
}

const Tooltip = ({ text, children, pos = "top" }: TooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);

    let tooltipClasses =
        "absolute z-50 bg-surface-DEFAULT-03 text-text-primary text-sm p-2 rounded-md shadow-lg border-2 border-black";
    let wrapperClasses = "relative";

    switch (pos) {
        case "top":
            tooltipClasses +=
                " bottom-full mb-2 left-1/2 transform -translate-x-1/2";
            break;
        case "bottom":
            tooltipClasses +=
                " top-full mt-2 left-1/2 transform -translate-x-1/2";
            break;
        case "left":
            tooltipClasses +=
                " right-full mr-2 top-1/2 transform -translate-y-1/2";
            wrapperClasses += " inline-block"; //  Important:  Set inline-block on the wrapper for left/right positioning
            break;
        case "right":
            tooltipClasses +=
                " left-full ml-2 top-1/2 transform -translate-y-1/2";
            wrapperClasses += " inline-block"; //  Important:  Set inline-block on the wrapper for left/right positioning
            break;
        default:
            tooltipClasses +=
                " top-full mt-2 left-1/2 transform -translate-x-1/2"; // Default to bottom
            break;
    }

    return (
        <div
            className={wrapperClasses}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className={tooltipClasses + " w-[300px]"}>{text}</div>
            )}
        </div>
    );
};

export default Tooltip;
