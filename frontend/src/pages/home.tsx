import { useState } from "preact/hooks";
import Elevator from "../components/elevator";
import Ground from "../components/ground";
import SpaceBanner from "../components/space-banner";
import BaseLayout from "../layouts/base";
import Pool from "../components/pool";
import Switcher from "../components/switcher";

export function Home() {
    const [showElevator, setShowElevator] = useState(true);

    return (
        <BaseLayout>
            <SpaceBanner />
            <Switcher
                onSwitch={(view) => setShowElevator(view === "elevator")}
            />

            {showElevator ? <Elevator /> : <Pool />}

            <Ground />
        </BaseLayout>
    );
}
