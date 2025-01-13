import { useAtom } from "jotai";
import { useState, useRef, useEffect } from "preact/hooks";
import { ChainTheme, chainThemeAtom } from "../states/atoms";

const NetworkSelector = () => {
    const options = ["Mirana Mainnet", "Meepo Testnet"];

    const [chainTheme, setChainTheme] = useAtom(chainThemeAtom);
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<string>(
        chainTheme === ChainTheme.mainnet ? options[0] : options[1],
    );
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (option: string) => {
        setSelected(option);
        setIsOpen(false);
        if (option === options[0]) {
            setChainTheme(ChainTheme.mainnet);
        } else {
            setChainTheme(ChainTheme.testnet);
        }
    };

    // 点击外部关闭下拉框
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const bgBrand =
        chainTheme === ChainTheme.mainnet
            ? "bg-brand-mainnet"
            : "bg-brand-testnet";

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={`px-4 py-2 bg-brand-accent rounded-md flex items-center justify-between cursor-pointer focus:outline-none`}
            >
                <span>{selected}</span>
                <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease-in-out",
                    }}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                    ></path>
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-surface-DEFAULT-03 border border-gray-200 rounded-md shadow-lg z-10">
                    {options.map((option) => (
                        <div
                            key={option}
                            onClick={() => handleSelect(option)}
                            className={`px-4 py-2 cursor-pointer hover:bg-surface-hover-03 flex items-center`}
                        >
                            <span>{option}</span>
                            {option === selected && (
                                <svg
                                    className="w-4 h-4 ml-auto text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    ></path>
                                </svg>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NetworkSelector;
