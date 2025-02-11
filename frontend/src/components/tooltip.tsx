import { useState } from "preact/hooks";

interface TooltipProps {
    text: string;
    children: React.ReactNode;
}

const Tooltip = ({ text, children }: TooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className={`relative`}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className="absolute bottom-full mb-2 w-full left-1/2 transform -translate-x-1/2 bg-surface-DEFAULT-03 text-text-primary text-sm p-2 rounded-md shadow-lg z-50">
                    {text}
                </div>
            )}
        </div>
    );
};

export default Tooltip;
