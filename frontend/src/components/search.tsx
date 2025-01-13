import { useAtomValue } from "jotai";
import { FunctionalComponent } from "preact";
import { useState } from "preact/hooks";
import { ChainTheme, chainThemeAtom } from "../states/atoms";

interface SearchProps {
    onSearch?: (searchTerm: string) => void;
    placeholder?: string;
}

const SearchComponent: FunctionalComponent<SearchProps> = ({
    onSearch,
    placeholder = "Search...",
}) => {
    const chainTheme = useAtomValue(chainThemeAtom);
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (event: Event) => {
        const target = event.target as HTMLInputElement;
        setSearchTerm(target.value);
        onSearch?.(target.value);
    };

    const borderBBorderBlack =
        chainTheme === ChainTheme.mainnet
            ? "border-b-border-mainnet-black"
            : "border-b-border-testnet-black";

    return (
        <div className="flex justify-center gap-2 w-full py-10">
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder={placeholder}
                className={`w-[500px] bg-transparent border-b-2 ${borderBBorderBlack} p-1 focus:outline-none`}
            />
            <img
                class={"w-[40px] h-[40px]"}
                src={"./src/assets/icons/search.svg"}
                alt=""
            />
        </div>
    );
};

export default SearchComponent;
