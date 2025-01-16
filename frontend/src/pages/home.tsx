import { useState } from "preact/hooks";
import Elevator from "../components/elevator";
import Ground from "../components/ground";
import InfoHeader from "../components/info-header";
import SearchComponent from "../components/search";
import BaseLayout from "../layouts/base";
import Pool from "../components/pool";

export function Home() {
    const [showElevator, setShowElevator] = useState(true);

    const toggleView = () => {
        setShowElevator(!showElevator);
    };
    return (
        <BaseLayout>
            <InfoHeader />
            <SearchComponent />
            <div className={"w-full"}>
                <div class="mx-auto flex justify-center">
                    <a
                        href="#"
                        class={"border-[2px] border-solid border-black p-2"}
                        onClick={toggleView}
                    >
                        {showElevator
                            ? "Switch to Pool"
                            : "Switch to  Elevator"}
                    </a>
                </div>

                {showElevator ? <Elevator /> : <Pool />}
            </div>

            <Ground />
        </BaseLayout>
    );
}
