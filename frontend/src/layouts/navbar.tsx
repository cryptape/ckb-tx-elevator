import { useAtomValue } from "jotai";
import { FunctionalComponent } from "preact";
import { ChainTheme, chainThemeAtom } from "../states/atoms";
import NetworkSelector from "./selector";

//

const Navbar: FunctionalComponent = () => {
    const chainTheme = useAtomValue(chainThemeAtom);
    const tabs = [
        {
            label: "Github",
            selected: false,
            url: "https://github.com/cryptape",
            newTab: true,
        },
    ];

    const style =
        chainTheme === ChainTheme.mainnet
            ? "border-border-mainnet-black bg-brand-mainnet"
            : "border-border-testnet-black bg-brand-testnet";

    return (
        <div
            className={`flex px-4 py-5 mx-auto justify-between items-center border-b-2 ${style}`}
        >
            <div class="flex justify-center items-center ml-10">
                <a href="/" rel="noopener noreferrer">
                    <div className={"flex gap-2 justify-center items-center"}>
                        <div>
                            <img
                                class="w-[24px]"
                                src="src/assets/logo.svg"
                                alt="App Logo"
                            />
                        </div>
                        <div>
                            <img
                                class="hidden md:block h-[24px]"
                                src="src/assets/logo-text.svg"
                                alt="App Logo"
                            />
                        </div>
                    </div>
                </a>
            </div>

            <div class="flex justify-center items-center">
                <button
                    id="menu-toggle"
                    class="block md:hidden text-white focus:outline-none"
                >
                    <img src="/icons/menu.svg" alt="menu-icon" />
                </button>
            </div>

            <div class="hidden md:flex gap-10">
                <NetworkSelector />
                {tabs.map((tab) => (
                    <div
                        class={`navbar-tab flex justify-center items-center px-2 transition-colors duration-300 
		      ${tab.selected ? "bg-primary-light text-primary-dark" : "bg-transparent text-text"} 
		      ${!tab.selected ? "hover:bg-hover" : ""} cursor-pointer`}
                    >
                        <a
                            href={tab.url}
                            rel="noopener noreferrer"
                            target={tab.newTab ? "_blank" : undefined}
                        >
                            <h5>{tab.label}</h5>
                        </a>
                    </div>
                ))}
            </div>

            <div
                id="mobile-menu"
                class="fixed top-0 left-0 w-full h-full bg-primary-dark text-white z-50 transform -translate-y-full transition-transform duration-300 ease-in-out md:hidden"
            >
                <div class="flex justify-between align-center py-5 px-4">
                    <a href="/" rel="noopener noreferrer">
                        <img
                            src="/icons/cryptape-no-text.svg"
                            alt="Cryptape Logo"
                        />
                    </a>
                    <button
                        id="menu-close"
                        class="self-end text-white focus:outline-none"
                    >
                        <img src="/icons/close.svg" alt="close-menu-icon" />
                    </button>
                </div>

                <div class="flex flex-col py-3 gap-2">
                    {tabs.map((tab) => (
                        <a
                            href={tab.url}
                            rel="noopener noreferrer"
                            target={tab.newTab ? "_blank" : undefined}
                            class={`navbar-tab flex justify-center items-center w-full px-4 py-3 transition-colors duration-150
			${tab.selected ? "bg-primary-light text-primary-dark" : "bg-transparent text-text"} 
			${!tab.selected ? "hover:bg-hover" : ""} cursor-pointer`}
                        >
                            <h5>{tab.label}</h5>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
